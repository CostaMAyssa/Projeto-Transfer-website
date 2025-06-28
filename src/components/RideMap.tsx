import { useEffect, useRef, useState, useCallback } from 'react';
import { useBooking } from "@/contexts/BookingContext";
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RideMapProps {
  className?: string;
  // Novas props opcionais para sobrescrever as localizações do contexto
  pickupLocation?: {
    address: string;
    coordinates?: [number, number];
  };
  dropoffLocation?: {
    address: string;
    coordinates?: [number, number];
  };
}

const RideMap = ({ className, pickupLocation, dropoffLocation }: RideMapProps) => {
  const { bookingData } = useBooking();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isRouteLoaded, setIsRouteLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Using the updated token
  const mapboxToken = "pk.eyJ1IjoiZmF1c3RvbGFnYXJlcyIsImEiOiJjbWFnNnB6aTYwYWNxMm5vZmJyMnFicWFvIn0.89qV4FAa3hPg15kITsNwLA";

  // Usar props se fornecidas, caso contrário usar dados do contexto
  const effectivePickupLocation = pickupLocation || bookingData.pickupLocation;
  const effectiveDropoffLocation = dropoffLocation || bookingData.dropoffLocation;

  // 🔍 DEBUG: Log inicial do componente
  console.log('🗺️ RideMap - Componente inicializado', {
    hasPickupCoords: !!effectivePickupLocation?.coordinates,
    hasDropoffCoords: !!effectiveDropoffLocation?.coordinates,
    pickupAddress: effectivePickupLocation?.address,
    dropoffAddress: effectiveDropoffLocation?.address,
    mapContainerExists: !!mapContainerRef.current,
    isInitialized,
    isMapLoaded,
    usingProps: !!(pickupLocation || dropoffLocation)
  });

  // Cleanup function to safely remove markers and map
  const cleanup = useCallback(() => {
    try {
      // Remove markers safely
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (error) {
            console.warn('Error removing marker:', error);
          }
        });
        markersRef.current = [];
      }

      // Remove map layers and sources safely
      if (mapRef.current) {
        try {
          if (mapRef.current.getSource('route')) {
            if (mapRef.current.getLayer('route')) {
              mapRef.current.removeLayer('route');
            }
            mapRef.current.removeSource('route');
          }
        } catch (error) {
          console.warn('Error removing route:', error);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }, []);

  const initializeMap = useCallback(() => {
    console.log('🚀 RideMap - initializeMap chamada', {
      isInitialized,
      containerExists: !!mapContainerRef.current,
      mapExists: !!mapRef.current
    });

    // Prevent multiple initializations
    if (isInitialized) {
      console.log('⚠️ RideMap - Já inicializado, pulando...');
      return;
    }

    // Initialize map only if container is available and not already initialized
    if (!mapContainerRef.current) {
      console.log('❌ RideMap - Container não existe ainda');
      return;
    }
    
    try {
      console.log('🔑 RideMap - Definindo access token...');
      // Set access token
      mapboxgl.accessToken = mapboxToken;

      // Create the map if it doesn't exist
      if (!mapRef.current) {
        console.log('🗺️ RideMap - Criando nova instância do mapa...');
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          zoom: 12,
          preserveDrawingBuffer: true // Helps with DOM issues
        });
        
        console.log('✅ RideMap - Mapa criado, aguardando eventos...');
        
        // Handle map load errors
        mapRef.current.on('error', (e: mapboxgl.ErrorEvent) => {
          console.error('❌ RideMap - Erro no mapa:', e);
          setErrorMessage('Erro no mapa. Verifique sua conexão.');
        });

        mapRef.current.on('load', () => {
          console.log('🎉 RideMap - Mapa carregado com sucesso!');
          setIsMapLoaded(true);
          setIsInitialized(true);
        });

        mapRef.current.on('remove', () => {
          console.log('🗑️ RideMap - Mapa removido');
          setIsInitialized(false);
          setIsMapLoaded(false);
        });
      }

      // Clear previous markers and routes safely
      cleanup();

      // Add markers for pickup and dropoff if coordinates are available
      const hasPickup = effectivePickupLocation?.coordinates;
      const hasDropoff = effectiveDropoffLocation?.coordinates;

      // Default center if no coordinates are available
      let defaultCenter: [number, number] = [-74.006, 40.7128]; // Default to NYC

      if (hasPickup) {
        try {
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
            .setLngLat(effectivePickupLocation.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>Origem:</strong> ${effectivePickupLocation.address}`))
            .addTo(mapRef.current);
          
          markersRef.current.push(pickupMarker);
          defaultCenter = effectivePickupLocation.coordinates;
        } catch (error) {
          console.error('Error adding pickup marker:', error);
        }
      }

      if (hasDropoff) {
        try {
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
            .setLngLat(effectiveDropoffLocation.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<strong>Destino:</strong> ${effectiveDropoffLocation.address}`))
            .addTo(mapRef.current);
          
          markersRef.current.push(dropoffMarker);
          defaultCenter = effectiveDropoffLocation.coordinates;
        } catch (error) {
          console.error('Error adding dropoff marker:', error);
        }
      }

      // Center map on default or available location
      try {
        if (!hasPickup && !hasDropoff) {
          mapRef.current.setCenter(defaultCenter);
        }
      } catch (error) {
        console.error('Error setting map center:', error);
      }

      // Draw route if both pickup and dropoff coordinates are available
      if (hasPickup && hasDropoff && mapRef.current.isStyleLoaded()) {
        drawRoute();
      } else if (hasPickup && hasDropoff) {
        // Wait for style to be loaded
        mapRef.current.once('style.load', () => {
          drawRoute();
        });
      }
      
      // Fit map to include both markers if available
      try {
        if (hasPickup && hasDropoff && mapRef.current) {
          const bounds = new mapboxgl.LngLatBounds()
            .extend(effectivePickupLocation.coordinates)
            .extend(effectiveDropoffLocation.coordinates);

          mapRef.current.fitBounds(bounds, { padding: 70, maxZoom: 15 });
        } else if (hasPickup && mapRef.current) {
          mapRef.current.setCenter(effectivePickupLocation.coordinates);
        } else if (hasDropoff && mapRef.current) {
          mapRef.current.setCenter(effectiveDropoffLocation.coordinates);
        }
      } catch (error) {
        console.error('Error fitting map bounds:', error);
      }
      
      setErrorMessage(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setErrorMessage('Erro ao inicializar o mapa. Verifique sua conexão.');
    }
  }, [effectivePickupLocation, effectiveDropoffLocation, cleanup, isInitialized]);

  const drawRoute = async () => {
    if (!mapRef.current || !effectivePickupLocation.coordinates || !effectiveDropoffLocation.coordinates) {
      return;
    }
    
    try {
      setIsRouteLoaded(false);
      const start = effectivePickupLocation.coordinates;
      const end = effectiveDropoffLocation.coordinates;
      
      // Get the route from Mapbox Directions API
      const query = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxToken}`;
      
      const response = await fetch(query);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry.coordinates;

        // Check if map is loaded and source exists
        if (mapRef.current.getSource('route')) {
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
          // Wait for style to be loaded
          mapRef.current.once('style.load', () => {
            drawRoute();
          });
          return;
        }
        
        setIsRouteLoaded(true);
      } else {
        console.error('No routes found in response:', data);
        setErrorMessage('Não foi possível calcular a rota. Tente novamente.');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      setErrorMessage('Erro ao calcular a rota. Verifique sua conexão.');
    }
  };

  useEffect(() => {
    // Prevent initialization on first render without locations
    const hasAnyLocation = effectivePickupLocation?.coordinates || effectiveDropoffLocation?.coordinates;
    
    console.log('🔄 RideMap - useEffect executado', {
      hasAnyLocation,
      hasPickup: !!effectivePickupLocation?.coordinates,
      hasDropoff: !!effectiveDropoffLocation?.coordinates,
      pickupAddress: effectivePickupLocation?.address,
      dropoffAddress: effectiveDropoffLocation?.address
    });
    
    if (!hasAnyLocation) {
      console.log('⏭️ RideMap - Sem localizações, pulando inicialização');
      return;
    }
    
    console.log('⏰ RideMap - Agendando inicialização em 100ms...');
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      console.log('🎯 RideMap - Chamando initializeMap...');
      initializeMap();
    }, 100);
    
    // Clean up on unmount or dependency change
    return () => {
      console.log('🧹 RideMap - Limpando timer e recursos...');
      clearTimeout(timer);
      cleanup();
    };
  }, [effectivePickupLocation, effectiveDropoffLocation, initializeMap]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (error) {
          console.warn('⚠️ Error removing map on unmount:', error);
        }
      }
    };
  }, [cleanup]);

  // Check if we have any location coordinates
  const hasLocations = Boolean(effectivePickupLocation?.coordinates || effectiveDropoffLocation?.coordinates);

  return (
    <div className={`rounded-lg overflow-hidden border ${className}`}>
      {!hasLocations ? (
        <div className="flex flex-col items-center justify-center bg-gray-100 h-64 text-gray-500">
          <MapPin size={32} />
          <p className="mt-2 text-sm">Digite os locais de origem e destino para vê-los no mapa</p>
        </div>
      ) : (
        <div 
          className="h-64 relative" 
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '256px',
            backgroundColor: '#f0f0f0',
            border: '2px solid #333',
            borderRadius: '8px'
          }}
        >
          {!isMapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Carregando mapa...</p>
              </div>
            </div>
          )}
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
