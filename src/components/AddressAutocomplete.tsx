
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedValue.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            debouncedValue
          )}.json?access_token=pk.eyJ1IjoiZGVtb3VzZXIiLCJhIjoiY2xtcTE3MmtrMTRoZjJrcWhvOGhpNnJuNSJ9.LfK0bP7yfpFy-E7OTd9IGQ&autocomplete=true&limit=5`
        );
        if (!response.ok) throw new Error("Geocoding request failed");
        
        const data = await response.json();
        setSuggestions(data.features);
      } catch (error) {
        console.error("Error fetching address suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedValue) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
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
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.place_name);
    onAddressSelect({
      address: suggestion.place_name,
      coordinates: suggestion.center
    });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          setIsFocused(true);
          setIsOpen(suggestions.length > 0);
        }}
        required={required}
        className={className}
      />

      {isLoading && isFocused && (
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
  );
};

export default AddressAutocomplete;
