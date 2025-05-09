
import { useEffect, useRef, useState } from 'react';
import { useBooking } from "@/contexts/BookingContext";
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RideMapProps {
  className?: string;
}

const RideMap = ({ className }: RideMapProps) => {
  const { bookingData } = useBooking();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isRouteLoaded, setIsRouteLoaded] = useState(false);

  // Using the updated token
  const mapboxToken = "pk.eyJ1IjoiZmF1c3RvbGFnYXJlcyIsImEiOiJjbWFnNnB6aTYwYWNxMm5vZmJyMnFicWFvIn0.89qV4FAa3hPg15kITsNwLA";

  const initializeMap = () => {
    // Initialize map only if container is available
    if (!mapContainerRef.current) {
      console.log("Map container not found");
      return;
    }

    // Log pickup and dropoff locations to debug
    console.log("Initializing map with pickup:", bookingData.pickupLocation);
    console.log("Initializing map with dropoff:", bookingData.dropoffLocation);
    
    try {
      // Set access token
      mapboxgl.accessToken = mapboxToken;

      // Create the map if it doesn't exist
      if (!mapRef.current) {
        console.log("Creating new map instance");
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

        mapRef.current.on('load', () => {
          console.log("Map loaded successfully");
          setIsMapLoaded(true);
        });
      }

      // Clear previous markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Clear previous routes
      if (mapRef.current.getSource('route')) {
        mapRef.current.removeLayer('route');
        mapRef.current.removeSource('route');
      }

      // Add markers for pickup and dropoff if coordinates are available
      const hasPickup = bookingData.pickupLocation?.coordinates;
      const hasDropoff = bookingData.dropoffLocation?.coordinates;

      console.log("Has pickup coordinates:", hasPickup);
      console.log("Has dropoff coordinates:", hasDropoff);

      // Default center if no coordinates are available
      let defaultCenter: [number, number] = [-74.006, 40.7128]; // Default to NYC

      if (hasPickup) {
        console.log("Adding pickup marker at:", bookingData.pickupLocation.coordinates);
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
        defaultCenter = bookingData.pickupLocation.coordinates;
      }

      if (hasDropoff) {
        console.log("Adding dropoff marker at:", bookingData.dropoffLocation.coordinates);
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
        defaultCenter = bookingData.dropoffLocation.coordinates;
      }

      // Center map on default or available location
      if (!hasPickup && !hasDropoff) {
        console.log("Centering map on default location");
        mapRef.current.setCenter(defaultCenter);
      }

      // Draw route if both pickup and dropoff coordinates are available
      if (hasPickup && hasDropoff && mapRef.current.isStyleLoaded()) {
        console.log("Drawing route between points");
        drawRoute();
      } else if (hasPickup && hasDropoff) {
        // Wait for style to be loaded
        console.log("Waiting for map style to load before drawing route");
        mapRef.current.once('style.load', () => {
          drawRoute();
        });
      }
      
      // Fit map to include both markers if available
      if (hasPickup && hasDropoff) {
        console.log("Fitting map to bounds");
        const bounds = new mapboxgl.LngLatBounds()
          .extend(bookingData.pickupLocation.coordinates)
          .extend(bookingData.dropoffLocation.coordinates);

        mapRef.current.fitBounds(bounds, { padding: 70, maxZoom: 15 });
      } else if (hasPickup) {
        console.log("Centering map on pickup");
        mapRef.current.setCenter(bookingData.pickupLocation.coordinates);
      } else if (hasDropoff) {
        console.log("Centering map on dropoff");
        mapRef.current.setCenter(bookingData.dropoffLocation.coordinates);
      }
      
      setErrorMessage(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setErrorMessage('Error initializing map. Please check your connection.');
    }
  };

  const drawRoute = async () => {
    if (!mapRef.current || !bookingData.pickupLocation.coordinates || !bookingData.dropoffLocation.coordinates) {
      console.log("Cannot draw route: missing map or coordinates");
      return;
    }
    
    try {
      setIsRouteLoaded(false);
      const start = bookingData.pickupLocation.coordinates;
      const end = bookingData.dropoffLocation.coordinates;
      
      console.log("Fetching route from:", start, "to:", end);
      
      // Get the route from Mapbox Directions API
      const query = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxToken}`;
      
      const response = await fetch(query);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        console.log("Route received successfully");
        const route = data.routes[0].geometry.coordinates;

        // Check if map is loaded and source exists
        if (mapRef.current.getSource('route')) {
          console.log("Updating existing route");
          // Update existing source
          (mapRef.current.getSource('route') as mapboxgl.GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          });
        } else if (mapRef.current.isStyleLoaded()) {
          console.log("Creating new route");
          // Add new source and layer
          mapRef.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: route
              }
            }
          });

          mapRef.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3E63DD',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });
        } else {
          console.log("Map style not loaded yet, waiting...");
          // Wait for style to be loaded
          mapRef.current.once('style.load', () => {
            drawRoute();
          });
          return;
        }
        
        setIsRouteLoaded(true);
      } else {
        console.error('No routes found in response:', data);
        setErrorMessage('Could not calculate route. Please try again.');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      setErrorMessage('Error calculating route. Please check your connection.');
    }
  };

  useEffect(() => {
    console.log("RideMap useEffect - pickup:", bookingData.pickupLocation);
    console.log("RideMap useEffect - dropoff:", bookingData.dropoffLocation);
    
    // Fix: Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeMap();
    }, 300);
    
    // Clean up on unmount
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        // Don't destroy the map, just remove markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
      }
    };
  }, [bookingData.pickupLocation, bookingData.dropoffLocation]);

  // Check if we have any location coordinates
  const hasLocations = Boolean(bookingData.pickupLocation?.coordinates || bookingData.dropoffLocation?.coordinates);
  console.log("Has locations:", hasLocations);

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`}>
      {!hasLocations ? (
        <div className="flex flex-col items-center justify-center bg-gray-100 h-64 text-gray-500">
          <MapPin size={32} />
          <p className="mt-2 text-sm">Enter pickup and dropoff locations to see them on the map</p>
        </div>
      ) : (
        <div className="h-64 relative" ref={mapContainerRef}>
          {!isMapLoaded && <Skeleton className="w-full h-full" />}
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
