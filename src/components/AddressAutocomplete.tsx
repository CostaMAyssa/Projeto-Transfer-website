import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: { address: string; coordinates?: [number, number] }) => void;
  required?: boolean;
  className?: string;
}

interface GooglePlace {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

const AddressAutocomplete = ({
  placeholder,
  value,
  onChange,
  onAddressSelect,
  required = false,
  className,
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<GooglePlace[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedValue.length < 3) {
        setSuggestions([]);
        setIsOpen(false);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      
      try {
        console.log("🔍 Buscando sugestões da Google Places API para:", debouncedValue);
        
        const { data, error } = await supabase.functions.invoke('google-places/autocomplete', {
          body: { 
            input: debouncedValue
          }
        });

        if (error) {
          console.error('❌ Erro na API do Google Places:', error);
          setErrorMessage("Erro ao conectar com a API do Google. Verifique a configuração.");
          setSuggestions([]);
          return;
        }

        if (data?.status === 'OK' && data?.predictions) {
          console.log('✅ Sugestões da Google API recebidas:', data.predictions.length);
          setSuggestions(data.predictions);
          setIsOpen(data.predictions.length > 0);
        } else if (data?.status === 'REQUEST_DENIED') {
          console.error('❌ Google API: REQUEST_DENIED -', data.error_message);
          setErrorMessage("API Key do Google com restrições. Configure sem restrições no Google Cloud Console.");
          setSuggestions([]);
        } else if (data?.status === 'ZERO_RESULTS') {
          console.warn('⚠️ Nenhum resultado encontrado para:', debouncedValue);
          setSuggestions([]);
          setIsOpen(false);
        } else {
          console.warn('⚠️ API retornou status:', data?.status, data?.error_message);
          setErrorMessage(`Erro da Google API: ${data?.error_message || data?.status}`);
          setSuggestions([]);
        }
        
      } catch (error) {
        console.error("❌ Erro ao buscar sugestões:", error);
        setErrorMessage("Erro de conexão. Verifique sua internet e a configuração da API.");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedValue) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setErrorMessage(null);
    }
  }, [debouncedValue]);

  useEffect(() => {
    // Close suggestions on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCoordinatesForPlace = async (placeId: string): Promise<[number, number] | undefined> => {
    try {
      console.log('🔍 Buscando coordenadas para place_id:', placeId);
      
      const { data, error } = await supabase.functions.invoke('google-places/details', {
        body: { 
          place_id: placeId 
        }
      });

      if (error) {
        console.error('❌ Erro ao buscar coordenadas:', error);
        return undefined;
      }

      if (data?.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        console.log('✅ Coordenadas da Google API encontradas:', [lng, lat]);
        return [lng, lat]; // [longitude, latitude]
      }

      console.warn('⚠️ Coordenadas não encontradas para:', placeId);
      return undefined;
    } catch (error) {
      console.error('❌ Erro ao buscar coordenadas:', error);
      return undefined;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setErrorMessage(null);
    setSelectedAddress(null);
    
    if (newValue.length >= 3) {
      setIsLoading(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = async (suggestion: GooglePlace) => {
    console.log("📍 Endereço selecionado:", suggestion);
    
    setSelectedAddress(suggestion.description);
    onChange(suggestion.description);
    setIsOpen(false);
    setIsLoading(true);
    
    try {
      // Buscar coordenadas
      const coordinates = await getCoordinatesForPlace(suggestion.place_id);
      
      onAddressSelect({
        address: suggestion.description,
        coordinates: coordinates
      });
      
      if (!coordinates) {
        setErrorMessage("Endereço selecionado, mas não foi possível obter coordenadas.");
      }
    } catch (error) {
      console.error('❌ Erro ao processar seleção:', error);
      onAddressSelect({
        address: suggestion.description
      });
      setErrorMessage("Erro ao obter coordenadas do endereço.");
    } finally {
      setIsLoading(false);
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full" ref={wrapperRef}>
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={selectedAddress || value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={className}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}
        
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {errorMessage && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AddressAutocomplete;
