
import { useEffect, useRef, useState } from 'react';
import { useBooking } from "@/contexts/BookingContext";
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RideMapProps {
  className?: string;
}

const RideMap = ({ className }: RideMapProps) => {
  const { bookingData } = useBooking();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Using the provided token
  const mapboxToken = "pk.eyJ1IjoiZmF1c3RvbGFnYXJlcyIsImEiOiJjbTk0bGplZXAweTIyMnJwdjQ0d2I1eDhxIn0.cTCGVYAunWY8b6N9NgZWmQ";

  const initializeMap = () => {
    // Initialize map only if container is available
    if (!mapContainerRef.current) return;
    
    // Create a new map instance
    const mapboxgl = window.mapboxgl;
    if (!mapboxgl) {
      console.error('Mapbox GL JS is not available');
      setErrorMessage('Mapbox GL JS is not available');
      return;
    }

    try {
      // Set access token
      mapboxgl.accessToken = mapboxToken;

      // Create the map if it doesn't exist
      if (!mapRef.current) {
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          zoom: 12
        });
        
        // Handle map load errors
        mapRef.current.on('error', (e: any) => {
          console.error('Map error:', e);
          if (e.error && e.error.status === 401) {
            setErrorMessage('Invalid Mapbox token. Please contact support.');
          } else {
            setErrorMessage(`Map error: ${e.error ? e.error.message : 'Unknown error'}`);
          }
        });
      }

      // Clear previous markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add markers for pickup and dropoff if coordinates are available
      const hasPickup = bookingData.pickupLocation.coordinates;
      const hasDropoff = bookingData.dropoffLocation.coordinates;

      if (hasPickup) {
        // Create a custom marker element for pickup
        const pickupEl = document.createElement('div');
        pickupEl.className = 'flex items-center justify-center';
        pickupEl.innerHTML = `
          <div class="bg-brand text-white p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `;

        const pickupMarker = new mapboxgl.Marker(pickupEl)
          .setLngLat(bookingData.pickupLocation.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong>Pickup:</strong> ${bookingData.pickupLocation.address}`))
          .addTo(mapRef.current);
        
        markersRef.current.push(pickupMarker);
      }

      if (hasDropoff) {
        // Create a custom marker element for dropoff
        const dropoffEl = document.createElement('div');
        dropoffEl.className = 'flex items-center justify-center';
        dropoffEl.innerHTML = `
          <div class="bg-black text-white p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `;

        const dropoffMarker = new mapboxgl.Marker(dropoffEl)
          .setLngLat(bookingData.dropoffLocation.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong>Dropoff:</strong> ${bookingData.dropoffLocation.address}`))
          .addTo(mapRef.current);
        
        markersRef.current.push(dropoffMarker);
      }

      // Fit map to include both markers if available
      if (hasPickup && hasDropoff) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend(bookingData.pickupLocation.coordinates)
          .extend(bookingData.dropoffLocation.coordinates);

        mapRef.current.fitBounds(bounds, { padding: 70, maxZoom: 15 });
      } else if (hasPickup) {
        mapRef.current.setCenter(bookingData.pickupLocation.coordinates);
      } else if (hasDropoff) {
        mapRef.current.setCenter(bookingData.dropoffLocation.coordinates);
      }
      
      setErrorMessage(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setErrorMessage('Error initializing map. Please check your connection.');
    }
  };

  useEffect(() => {
    initializeMap();
    
    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        // Don't destroy the map, just remove markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
      }
    };
  }, [bookingData.pickupLocation, bookingData.dropoffLocation]);

  // Check if we have any location coordinates
  const hasLocations = bookingData.pickupLocation.coordinates || bookingData.dropoffLocation.coordinates;

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`}>
      {!hasLocations ? (
        <div className="flex flex-col items-center justify-center bg-gray-100 h-64 text-gray-500">
          <MapPin size={32} />
          <p className="mt-2 text-sm">Enter pickup and dropoff locations to see them on the map</p>
        </div>
      ) : (
        <div className="h-64 relative" ref={mapContainerRef}>
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {errorMessage && (
        <Alert variant="destructive" className="mt-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RideMap;
