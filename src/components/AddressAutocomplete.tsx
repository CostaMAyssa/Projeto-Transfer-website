
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddressAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: { address: string; coordinates?: [number, number] }) => void;
  required?: boolean;
  className?: string;
}

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number];
}

const AddressAutocomplete = ({
  placeholder,
  value,
  onChange,
  onAddressSelect,
  required = false,
  className,
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 400);

  // Using the updated token
  const mapboxToken = "pk.eyJ1IjoiZmF1c3RvbGFnYXJlcyIsImEiOiJjbWFnNnB6aTYwYWNxMm5vZmJyMnFicWFvIn0.89qV4FAa3hPg15kITsNwLA";

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
        console.log("Fetching suggestions for:", debouncedValue);
        // Adicionando parâmetros country=us para restringir aos EUA e types para tipos específicos de locais
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            debouncedValue
          )}.json?access_token=${mapboxToken}&autocomplete=true&limit=5&country=us&types=address,poi,place,postcode`
        );
        
        if (!response.ok) {
          console.error("Geocoding request failed with status:", response.status);
          
          if (response.status === 401) {
            setErrorMessage("Invalid Mapbox token. Please contact support.");
          } else {
            setErrorMessage(`Geocoding request failed with status: ${response.status}`);
          }
          
          throw new Error("Geocoding request failed");
        }
        
        const data = await response.json();
        console.log("Received suggestions:", data.features);
        setSuggestions(data.features || []);
        
        // Show suggestions if we have any
        setIsOpen(data.features && data.features.length > 0);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setErrorMessage(null);
    
    if (newValue.length >= 3) {
      setIsLoading(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    console.log("Selected suggestion:", suggestion);
    onChange(suggestion.place_name);
    onAddressSelect({
      address: suggestion.place_name,
      coordinates: suggestion.center
    });
    // Immediately close the dropdown when an address is selected
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full" ref={wrapperRef}>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (value.length >= 3 && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            // Immediately close the dropdown when the input loses focus
            setIsFocused(false);
            // We need to delay here to allow the click event to register first
            setTimeout(() => {
              if (!wrapperRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
              }
            }, 100); // Reduced timeout for faster response
          }}
          required={required}
          className={className}
          autoComplete="off" // Disable browser's native autocomplete
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
                key={suggestion.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-start gap-2"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin size={18} className="text-brand mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion.place_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {errorMessage && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AddressAutocomplete;
