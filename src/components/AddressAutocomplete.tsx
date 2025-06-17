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

interface GooglePlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
}

const AddressAutocomplete = ({
  placeholder,
  value,
  onChange,
  onAddressSelect,
  required = false,
  className,
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<GooglePlacePrediction[]>([]);
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
        console.log("Buscando sugestões para:", debouncedValue);
        
        // Tenta usar a Edge Function primeiro
        const { data, error } = await supabase.functions.invoke('google-places/autocomplete', {
          body: { input: debouncedValue }
        });

        if (error) {
          console.warn('Edge Function não disponível, usando fallback local');
          throw error;
        }

        if (data.status === 'OK' && data.predictions) {
          setSuggestions(data.predictions);
          setIsOpen(data.predictions.length > 0);
        } else {
          setSuggestions([]);
          setIsOpen(false);
          if (data.status === 'ZERO_RESULTS') {
            setErrorMessage('Nenhum endereço encontrado. Tente ser mais específico.');
          }
        }
        
      } catch (error) {
        console.error("Erro ao buscar endereços:", error);
        setSuggestions([]);
        setIsOpen(false);
        setErrorMessage("Erro ao buscar endereços. Verifique sua conexão e tente novamente.");
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

  const handleSuggestionClick = async (suggestion: GooglePlacePrediction) => {
    console.log("Endereço selecionado:", suggestion);
    
    setSelectedAddress(suggestion.description);
    onChange(suggestion.description);
    setIsOpen(false);
    setIsLoading(true);
    
    try {
      // Busca detalhes do lugar para obter coordenadas
      const { data, error } = await supabase.functions.invoke('google-places/details', {
        body: { place_id: suggestion.place_id }
      });

      if (error) {
        console.warn('Erro ao buscar detalhes, usando endereço sem coordenadas');
        onAddressSelect({
          address: suggestion.description
        });
        return;
      }

      if (data.status === 'OK' && data.result) {
        const details: GooglePlaceDetails = data.result;
        onAddressSelect({
          address: details.formatted_address,
          coordinates: [details.geometry.location.lng, details.geometry.location.lat]
        });
      } else {
        onAddressSelect({
          address: suggestion.description
        });
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do endereço:', error);
      onAddressSelect({
        address: suggestion.description
      });
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
            if (value.length >= 3 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => {
              if (!wrapperRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
              }
            }, 100);
          }}
          required={required}
          className={className}
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.place_id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-start gap-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin size={18} className="text-brand mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{suggestion.structured_formatting.main_text}</span>
                  <span className="text-xs text-gray-500">{suggestion.structured_formatting.secondary_text}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AddressAutocomplete;
