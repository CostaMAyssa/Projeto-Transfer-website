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

interface MockPlace {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  coordinates: [number, number];
}

// Dados mockados para autocomplete
const MOCK_PLACES: MockPlace[] = [
  {
    place_id: "mock_ewr",
    description: "Newark Airport, Newark, NJ, USA",
    structured_formatting: {
      main_text: "Newark Airport",
      secondary_text: "Newark, NJ, USA"
    },
    coordinates: [-74.1745, 40.6895]
  },
  {
    place_id: "mock_jfk", 
    description: "JFK Airport, Queens, NY, USA",
    structured_formatting: {
      main_text: "JFK Airport",
      secondary_text: "Queens, NY, USA"
    },
    coordinates: [-73.7781, 40.6413]
  },
  {
    place_id: "mock_lga",
    description: "LaGuardia Airport, Queens, NY, USA",
    structured_formatting: {
      main_text: "LaGuardia Airport",
      secondary_text: "Queens, NY, USA"
    },
    coordinates: [-73.8740, 40.7769]
  },
  {
    place_id: "mock_times_square",
    description: "Times Square, New York, NY, USA",
    structured_formatting: {
      main_text: "Times Square",
      secondary_text: "New York, NY, USA"
    },
    coordinates: [-73.9857, 40.7589]
  },
  {
    place_id: "mock_manhattan",
    description: "Manhattan, New York, NY, USA",
    structured_formatting: {
      main_text: "Manhattan",
      secondary_text: "New York, NY, USA"
    },
    coordinates: [-73.9712, 40.7831]
  },
  {
    place_id: "mock_brooklyn",
    description: "Brooklyn Bridge, New York, NY, USA",
    structured_formatting: {
      main_text: "Brooklyn Bridge",
      secondary_text: "New York, NY, USA"
    },
    coordinates: [-73.9969, 40.7061]
  },
  {
    place_id: "mock_bronx",
    description: "Yankee Stadium, Bronx, NY, USA",
    structured_formatting: {
      main_text: "Yankee Stadium",
      secondary_text: "Bronx, NY, USA"
    },
    coordinates: [-73.9276, 40.8296]
  },
  {
    place_id: "mock_queens",
    description: "Flushing Meadows, Queens, NY, USA",
    structured_formatting: {
      main_text: "Flushing Meadows",
      secondary_text: "Queens, NY, USA"
    },
    coordinates: [-73.8448, 40.7282]
  }
];

const AddressAutocomplete = ({
  placeholder,
  value,
  onChange,
  onAddressSelect,
  required = false,
  className,
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<MockPlace[]>([]);
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
      if (debouncedValue.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      
      try {
        console.log("Filtering suggestions for:", debouncedValue);
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Filtrar lugares mockados
        const filtered = MOCK_PLACES.filter(place =>
          place.description.toLowerCase().includes(debouncedValue.toLowerCase()) ||
          place.structured_formatting.main_text.toLowerCase().includes(debouncedValue.toLowerCase())
        );
        
        setSuggestions(filtered);
        setIsOpen(filtered.length > 0);
        
      } catch (error) {
        console.error("Error filtering suggestions:", error);
        setSuggestions([]);
        setErrorMessage("Erro ao buscar endereços. Tente novamente.");
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
    
    if (newValue.length >= 2) {
      setIsLoading(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: MockPlace) => {
    console.log("Selected address:", suggestion);
    
    setSelectedAddress(suggestion.description);
    onChange(suggestion.description);
    onAddressSelect({
      address: suggestion.description,
      coordinates: suggestion.coordinates
    });
    setIsOpen(false);
    
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
            if (value.length >= 2 && suggestions.length > 0) {
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
