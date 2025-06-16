import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Zone Pricing Types (duplicated here for the edge function)
interface Zone {
  id: string;
  name: string;
  description: string;
  type: 'circular' | 'polygonal';
  center_lat?: number;
  center_lng?: number;
  radius_meters?: number;
  geojson?: Record<string, unknown>;
  coverage_area: string;
}

interface VehicleCategory {
  id: string;
  name: string;
  capacity: number;
  base_price: number;
  description?: string;
  features?: string[];
}

interface PricingCalculationRequest {
  pickup_location: {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  dropoff_location: {
    address: string;
    coordinates: [number, number];
  };
  vehicle_category: string;
}

interface PricingCalculationResponse {
  success: boolean;
  pickup_zone?: Zone;
  dropoff_zone?: Zone;
  vehicle_category?: VehicleCategory;
  price?: number;
  base_price?: number;
  out_of_coverage?: boolean;
  message?: string;
  whatsapp_contact?: boolean;
}

// Constants
const ZONE_TOLERANCE_METERS = 300;

const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: 'sedan',
    name: 'Sedan',
    capacity: 3,
    base_price: 75000, // $750 in cents
    description: 'Toyota Camry ou similar',
    features: ['3 passageiros', 'Confortável', 'Econômico']
  },
  {
    id: 'suv',
    name: 'SUV',
    capacity: 6,
    base_price: 115000, // $1150 in cents
    description: 'Chevrolet Suburban ou similar',
    features: ['6 passageiros', 'Espaçoso', 'Luxuoso']
  },
  {
    id: 'minivan',
    name: 'Minivan',
    capacity: 7,
    base_price: 130000, // $1300 in cents
    description: 'Chrysler Pacifica ou similar',
    features: ['7 passageiros', 'Máximo espaço', 'Familiar']
  }
];

const PREDEFINED_ZONES: Zone[] = [
  {
    id: 'Z_EWR',
    name: 'Aeroporto Intl. Newark (EWR)',
    description: 'Círculo 2,4 mi radius',
    type: 'circular',
    center_lat: 40.6895,
    center_lng: -74.1745,
    radius_meters: 3862,
    coverage_area: 'NJ'
  },
  {
    id: 'Z_JFK',
    name: 'Aeroporto John F. Kennedy (JFK)',
    description: 'Círculo 4,4 mi radius',
    type: 'circular',
    center_lat: 40.6413,
    center_lng: -73.7781,
    radius_meters: 7080,
    coverage_area: 'NY'
  },
  {
    id: 'Z_LGA',
    name: 'Aeroporto LaGuardia (LGA)',
    description: 'Círculo 2,4 mi radius',
    type: 'circular',
    center_lat: 40.7769,
    center_lng: -73.8740,
    radius_meters: 3862,
    coverage_area: 'NY'
  },
  {
    id: 'Z_BRONX',
    name: 'Bronx, NY',
    description: '25 ZIP Codes',
    type: 'polygonal',
    coverage_area: 'NY'
  },
  {
    id: 'Z_BKLYN',
    name: 'Brooklyn, NY',
    description: '38 ZIP Codes',
    type: 'polygonal',
    coverage_area: 'NY'
  },
  {
    id: 'Z_MHTN',
    name: 'Manhattan, NY',
    description: '55 ZIP Codes',
    type: 'polygonal',
    coverage_area: 'NY'
  },
  {
    id: 'Z_QNS',
    name: 'Queens, NY',
    description: '56 ZIP Codes',
    type: 'polygonal',
    coverage_area: 'NY'
  }
];

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 */
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371000; // Raio da Terra em metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Verifica se um ponto está dentro de uma zona circular
 */
function isPointInCircularZone(
  pointLat: number,
  pointLng: number,
  zone: Zone
): boolean {
  if (!zone.center_lat || !zone.center_lng || !zone.radius_meters) {
    return false;
  }
  
  const distance = calculateDistance(
    pointLat, 
    pointLng, 
    zone.center_lat, 
    zone.center_lng
  );
  
  return distance <= zone.radius_meters;
}

/**
 * Aproximação simples para verificar se um ponto está em um borough
 */
function isPointInBoroughApproximation(
  lat: number, 
  lng: number, 
  zoneId: string
): boolean {
  const boroughBounds: Record<string, {minLat: number, maxLat: number, minLng: number, maxLng: number}> = {
    'Z_MHTN': { minLat: 40.7009, maxLat: 40.8820, minLng: -74.0479, maxLng: -73.9067 },
    'Z_BKLYN': { minLat: 40.5707, maxLat: 40.7395, minLng: -74.0420, maxLng: -73.8331 },
    'Z_QNS': { minLat: 40.5431, maxLat: 40.8007, minLng: -73.9626, maxLng: -73.7004 },
    'Z_BRONX': { minLat: 40.7856, maxLat: 40.9176, minLng: -73.9339, maxLng: -73.7654 }
  };
  
  const bounds = boroughBounds[zoneId];
  if (!bounds) return false;
  
  return lat >= bounds.minLat && 
         lat <= bounds.maxLat && 
         lng >= bounds.minLng && 
         lng <= bounds.maxLng;
}

/**
 * Detecta em qual zona um ponto geográfico está localizado
 */
function detectZone(latitude: number, longitude: number): Zone | null {
  // Prioriza zonas circulares (aeroportos)
  const sortedZones = PREDEFINED_ZONES.sort((a, b) => {
    if (a.type === 'circular' && b.type === 'polygonal') return -1;
    if (a.type === 'polygonal' && b.type === 'circular') return 1;
    return 0;
  });
  
  let closestZone: Zone | null = null;
  let closestDistance = Infinity;
  
  for (const zone of sortedZones) {
    let isInZone = false;
    let distanceToZone = 0;
    
    if (zone.type === 'circular') {
      isInZone = isPointInCircularZone(latitude, longitude, zone);
      if (!isInZone && zone.center_lat && zone.center_lng) {
        distanceToZone = calculateDistance(
          latitude, longitude, 
          zone.center_lat, zone.center_lng
        );
      }
    } else if (zone.type === 'polygonal') {
      isInZone = isPointInBoroughApproximation(latitude, longitude, zone.id);
      if (!isInZone) {
        // Usa coordenadas aproximadas do centro dos boroughs
        const boroughCenters: Record<string, {lat: number, lng: number}> = {
          'Z_MHTN': { lat: 40.7831, lng: -73.9712 },
          'Z_BKLYN': { lat: 40.6782, lng: -73.9442 },
          'Z_QNS': { lat: 40.7282, lng: -73.7949 },
          'Z_BRONX': { lat: 40.8448, lng: -73.8648 }
        };
        
        const center = boroughCenters[zone.id];
        if (center) {
          distanceToZone = calculateDistance(
            latitude, longitude, 
            center.lat, center.lng
          );
        }
      }
    }
    
    // Se está dentro da zona, retorna imediatamente
    if (isInZone) {
      return zone;
    }
    
    // Verifica se está dentro da tolerância
    if (distanceToZone <= ZONE_TOLERANCE_METERS && distanceToZone < closestDistance) {
      closestDistance = distanceToZone;
      closestZone = zone;
    }
  }
  
  return closestZone;
}

/**
 * Busca categoria de veículo por nome ou ID
 */
function getVehicleCategory(categoryName: string): VehicleCategory | undefined {
  const normalizedName = categoryName.toLowerCase();
  return VEHICLE_CATEGORIES.find(cat => 
    cat.name.toLowerCase() === normalizedName || 
    cat.id === normalizedName
  );
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 405 
        }
      )
    }

    const request: PricingCalculationRequest = await req.json()
    
    // Validação básica
    if (!request.pickup_location?.coordinates || !request.dropoff_location?.coordinates || !request.vehicle_category) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Parâmetros obrigatórios: pickup_location.coordinates, dropoff_location.coordinates, vehicle_category' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const { pickup_location, dropoff_location, vehicle_category } = request;
    
    // Detecta zonas
    const pickupZone = detectZone(
      pickup_location.coordinates[1], // latitude
      pickup_location.coordinates[0]  // longitude
    );
    
    const dropoffZone = detectZone(
      dropoff_location.coordinates[1], // latitude
      dropoff_location.coordinates[0]  // longitude
    );
    
    // Busca categoria do veículo
    const vehicleCat = getVehicleCategory(vehicle_category);
    if (!vehicleCat) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Categoria de veículo não encontrada. Opções: sedan, suv, minivan'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    // Verifica se alguma localização está fora de cobertura
    if (!pickupZone || !dropoffZone) {
      const response: PricingCalculationResponse = {
        success: true,
        pickup_zone: pickupZone || undefined,
        dropoff_zone: dropoffZone || undefined,
        vehicle_category: vehicleCat,
        price: vehicleCat.base_price,
        base_price: vehicleCat.base_price,
        out_of_coverage: true,
        message: 'Uma ou ambas as localizações estão fora da área de cobertura. Entre em contato conosco via WhatsApp para mais informações.',
        whatsapp_contact: true
      };
      
      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Calcula preço (por enquanto usando preço base)
    const response: PricingCalculationResponse = {
      success: true,
      pickup_zone: pickupZone,
      dropoff_zone: dropoffZone,
      vehicle_category: vehicleCat,
      price: vehicleCat.base_price,
      base_price: vehicleCat.base_price,
      out_of_coverage: false,
      message: `Viagem de ${pickupZone.name} para ${dropoffZone.name}`
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro no cálculo de preços:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Erro interno no servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}) 