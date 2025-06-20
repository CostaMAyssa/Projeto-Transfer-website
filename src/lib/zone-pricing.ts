import { 
  Zone, 
  ZoneDetectionResult, 
  PricingCalculationRequest, 
  PricingCalculationResponse,
  VehicleCategory,
  VEHICLE_CATEGORIES,
  ZONE_TOLERANCE_METERS,
  PREDEFINED_ZONES
} from '@/types/zone-pricing';

// Re-exportar tipos para facilitar imports
export type {
  Zone,
  ZoneDetectionResult,
  PricingCalculationRequest,
  PricingCalculationResponse,
  VehicleCategory
};

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
 * Verifica se um ponto está dentro de uma zona poligonal usando ray casting
 * (implementação simplificada - em produção usaria biblioteca como turf.js)
 */
function isPointInPolygonalZone(
  pointLat: number,
  pointLng: number,
  zone: Zone
): boolean {
  if (!zone.geojson || !zone.geojson.coordinates) {
    // Para boroughs, usamos uma aproximação baseada em coordenadas conhecidas
    return isPointInBoroughApproximation(pointLat, pointLng, zone.id);
  }
  
  // Implementação simplificada do ray casting algorithm
  // Em produção, usar biblioteca como @turf/inside ou similar
  return false;
}

/**
 * Aproximação simples para verificar se um ponto está em um borough
 * Baseado em bounding boxes conhecidos dos boroughs de NYC
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
export async function detectZone(
  latitude: number, 
  longitude: number
): Promise<ZoneDetectionResult> {
  try {
    console.log(`🔍 Detectando zona para coordenadas: [${longitude}, ${latitude}]`);
    
    // Mapeamento das coordenadas dos dados mockados para as zonas da tabela de tarifas
    const COORDINATE_TO_ZONE_MAP: Array<{
      coordinates: [number, number]; // [lng, lat]
      zone_id: string;
      zone_name: string;
      tolerance: number; // metros
    }> = [
      // Aeroportos
      { coordinates: [-74.1745, 40.6895], zone_id: 'EWR', zone_name: 'Newark Liberty International Airport', tolerance: 1000 },
      { coordinates: [-73.7781, 40.6413], zone_id: 'JFK', zone_name: 'John F. Kennedy International Airport', tolerance: 1000 },
      { coordinates: [-73.8740, 40.7769], zone_id: 'LGA', zone_name: 'LaGuardia Airport', tolerance: 1000 },
      
      // Manhattan
      { coordinates: [-73.9857, 40.7589], zone_id: 'MAN', zone_name: 'Manhattan', tolerance: 2000 }, // Times Square
      { coordinates: [-73.9712, 40.7831], zone_id: 'MAN', zone_name: 'Manhattan', tolerance: 2000 }, // Manhattan center
      
      // Brooklyn
      { coordinates: [-73.9969, 40.7061], zone_id: 'BKN', zone_name: 'Brooklyn', tolerance: 2000 }, // Brooklyn Bridge
      
      // Bronx
      { coordinates: [-73.9276, 40.8296], zone_id: 'BRX', zone_name: 'Bronx', tolerance: 2000 }, // Yankee Stadium
      
      // Queens
      { coordinates: [-73.8448, 40.7282], zone_id: 'QNS', zone_name: 'Queens', tolerance: 2000 }, // Flushing Meadows
    ];
    
    // Busca a zona mais próxima baseada nas coordenadas
    let bestMatch: { zone_id: string; zone_name: string; distance: number; confidence: number } | null = null;
    
    for (const mapping of COORDINATE_TO_ZONE_MAP) {
      const distance = calculateDistance(
        latitude, longitude,
        mapping.coordinates[1], mapping.coordinates[0] // lat, lng
      );
      
      console.log(`📍 Distância para ${mapping.zone_id}: ${Math.round(distance)}m`);
      
      if (distance <= mapping.tolerance) {
        if (!bestMatch || distance < bestMatch.distance) {
          bestMatch = {
            zone_id: mapping.zone_id,
            zone_name: mapping.zone_name,
            distance: distance,
            confidence: distance <= 100 ? 1.0 : 0.8
          };
        }
      }
    }
    
    if (bestMatch) {
      console.log(`✅ Zona detectada: ${bestMatch.zone_id} (${bestMatch.zone_name})`);
      return {
        zone_id: bestMatch.zone_id,
        zone_name: bestMatch.zone_name,
        confidence: bestMatch.confidence,
        method: bestMatch.distance <= 100 ? 'exact' : 'approximate'
      };
    }
    
    console.log(`❌ Nenhuma zona encontrada para as coordenadas`);
    return {
      zone_id: null,
      zone_name: null,
      confidence: 0,
      method: 'fallback'
    };
    
  } catch (error) {
    console.error('Erro na detecção de zona:', error);
    return {
      zone_id: null,
      zone_name: null,
      confidence: 0,
      method: 'fallback'
    };
  }
}

/**
 * Busca categoria de veículo por nome ou ID
 */
export function getVehicleCategory(categoryName: string): VehicleCategory | undefined {
  const normalizedName = categoryName.toLowerCase();
  return VEHICLE_CATEGORIES.find(cat => 
    cat.name.toLowerCase() === normalizedName || 
    cat.id === normalizedName
  );
}

/**
 * Função principal para calcular preços baseado em zonas
 */
export async function calculateZonePricing(
  request: PricingCalculationRequest
): Promise<PricingCalculationResponse> {
  try {
    console.log('🔍 Iniciando cálculo de zone pricing:', request);
    
    // 1. Detectar zona de origem
    const [pickupLng, pickupLat] = request.pickup_location.coordinates;
    const pickupZoneResult = await detectZone(pickupLat, pickupLng);
    
    // 2. Detectar zona de destino
    const [dropoffLng, dropoffLat] = request.dropoff_location.coordinates;
    const dropoffZoneResult = await detectZone(dropoffLat, dropoffLng);
    
    console.log('📍 Zonas detectadas:', {
      pickup: pickupZoneResult,
      dropoff: dropoffZoneResult
    });
    
    // 3. Verificar se conseguimos detectar ambas as zonas
    if (!pickupZoneResult.zone_id || !dropoffZoneResult.zone_id) {
      const vehicleCategory = getVehicleCategory(request.vehicle_category);
      const fallbackPrice = vehicleCategory?.base_price || 130;
      
      return {
        success: true,
        price: fallbackPrice,
        pickup_zone: pickupZoneResult.zone_name || 'Zona desconhecida',
        dropoff_zone: dropoffZoneResult.zone_name || 'Zona desconhecida',
        vehicle_category: request.vehicle_category,
        message: 'Preço base aplicado - zona não detectada',
        calculation_method: 'fallback'
      };
    }
    
    // 4. Buscar preço específico na matriz
    const vehicleType = request.vehicle_category.toUpperCase();
    const specificPrice = getZonePrice(
      pickupZoneResult.zone_id, 
      dropoffZoneResult.zone_id, 
      vehicleType
    );
    
    // 5. Obter distância da rota
    const routeDistance = getRouteDistance(
      pickupZoneResult.zone_id,
      dropoffZoneResult.zone_id
    );
    
    if (specificPrice) {
      console.log('💰 Preço específico encontrado:', specificPrice);
      return {
        success: true,
        price: specificPrice,
        pickup_zone: pickupZoneResult.zone_name,
        dropoff_zone: dropoffZoneResult.zone_name,
        vehicle_category: vehicleType,
        distance_miles: routeDistance,
        message: `Preço para rota ${pickupZoneResult.zone_id} → ${dropoffZoneResult.zone_id}`,
        calculation_method: 'zone_specific'
      };
    }
    
    // 6. Fallback para preço base da categoria
    const vehicleCategory = getVehicleCategory(vehicleType);
    const basePrice = vehicleCategory?.base_price || 130;
    
    console.log('📦 Usando preço base:', basePrice);
    
    return {
      success: true,
      price: basePrice,
      pickup_zone: pickupZoneResult.zone_name,
      dropoff_zone: dropoffZoneResult.zone_name,
      vehicle_category: vehicleType,
      distance_miles: routeDistance,
      message: `Preço base para ${vehicleType} - rota não encontrada na matriz`,
      calculation_method: 'base_price'
    };
    
  } catch (error) {
    console.error('❌ Erro no cálculo de zone pricing:', error);
    
    return {
      success: false,
      message: 'Erro interno no cálculo de preços. Tente novamente.',
      calculation_method: 'fallback'
    };
  }
}

/**
 * Formata preço de centavos para dólares
 */
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Converte dólares para centavos
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Lista todas as categorias de veículos disponíveis
 */
export function getAvailableVehicleCategories(): VehicleCategory[] {
  return VEHICLE_CATEGORIES;
}

/**
 * Lista todas as zonas disponíveis
 */
export function getAvailableZones(): Zone[] {
  return PREDEFINED_ZONES.map(pz => ({
    ...pz,
    type: pz.type as 'circular' | 'polygonal'
  }));
}

// Zone pricing matrix based on the fare table
export const ZONE_PRICING_MATRIX: Record<string, Record<string, number>> = {
  // All routes FROM EWR
  'EWR-MAN': { SEDAN: 140, SUV: 170, VAN: 160 },
  'EWR-BKN': { SEDAN: 140, SUV: 170, VAN: 160 },
  'EWR-LGA': { SEDAN: 140, SUV: 170, VAN: 160 },
  'EWR-QNS': { SEDAN: 140, SUV: 170, VAN: 160 },
  'EWR-BRX': { SEDAN: 140, SUV: 170, VAN: 160 },
  'EWR-JFK': { SEDAN: 140, SUV: 170, VAN: 160 },
  
  // Routes FROM JFK
  'JFK-QNS': { SEDAN: 130, SUV: 150, VAN: 140 },
  'JFK-BKN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'JFK-MAN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'JFK-BRX': { SEDAN: 130, SUV: 160, VAN: 150 },
  'JFK-LGA': { SEDAN: 100, SUV: 120, VAN: 110 },
  'JFK-EWR': { SEDAN: 140, SUV: 170, VAN: 160 },
  
  // Routes FROM LGA
  'LGA-MAN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'LGA-BRX': { SEDAN: 130, SUV: 160, VAN: 150 },
  'LGA-BKN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'LGA-QNS': { SEDAN: 120, SUV: 150, VAN: 140 },
  'LGA-JFK': { SEDAN: 100, SUV: 120, VAN: 110 },
  'LGA-EWR': { SEDAN: 140, SUV: 170, VAN: 160 },
  
  // Routes FROM MAN
  'MAN-BKN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'MAN-BRX': { SEDAN: 130, SUV: 160, VAN: 150 },
  'MAN-QNS': { SEDAN: 130, SUV: 160, VAN: 150 },
  'MAN-EWR': { SEDAN: 140, SUV: 170, VAN: 160 },
  'MAN-JFK': { SEDAN: 130, SUV: 160, VAN: 150 },
  'MAN-LGA': { SEDAN: 130, SUV: 160, VAN: 150 },
  
  // Routes FROM BKN
  'BKN-BRX': { SEDAN: 130, SUV: 160, VAN: 150 },
  'BKN-QNS': { SEDAN: 130, SUV: 160, VAN: 150 },
  'BKN-MAN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'BKN-EWR': { SEDAN: 140, SUV: 170, VAN: 160 },
  'BKN-JFK': { SEDAN: 130, SUV: 160, VAN: 150 },
  'BKN-LGA': { SEDAN: 130, SUV: 160, VAN: 150 },
  
  // Routes FROM BRX
  'BRX-QNS': { SEDAN: 130, SUV: 160, VAN: 150 },
  'BRX-MAN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'BRX-BKN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'BRX-EWR': { SEDAN: 140, SUV: 170, VAN: 160 },
  'BRX-JFK': { SEDAN: 130, SUV: 160, VAN: 150 },
  'BRX-LGA': { SEDAN: 130, SUV: 160, VAN: 150 },
  
  // Routes FROM QNS
  'QNS-MAN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'QNS-BKN': { SEDAN: 130, SUV: 160, VAN: 150 },
  'QNS-BRX': { SEDAN: 130, SUV: 160, VAN: 150 },
  'QNS-EWR': { SEDAN: 140, SUV: 170, VAN: 160 },
  'QNS-JFK': { SEDAN: 130, SUV: 150, VAN: 140 },
  'QNS-LGA': { SEDAN: 120, SUV: 150, VAN: 140 }
};

// Route distances in miles (from the fare table)
export const ROUTE_DISTANCES: Record<string, number> = {
  'BKN-BRX': 20,
  'BKN-EWR': 12.05,
  'BKN-JFK': 11,
  'BKN-LGA': 12,
  'BKN-MAN': 16,
  'BKN-QNS': 14,
  'BRX-EWR': 20.53,
  'BRX-JFK': 17,
  'BRX-LGA': 10,
  'BRX-MAN': 9,
  'BRX-QNS': 12,
  'EWR-JFK': 20.92,
  'EWR-LGA': 16.83,
  'EWR-MAN': 11.67,
  'EWR-QNS': 17.35,
  'JFK-LGA': 12,
  'JFK-MAN': 15,
  'JFK-QNS': 7,
  'LGA-MAN': 10,
  'LGA-QNS': 8,
  'MAN-QNS': 15
};

// Helper function to get route key
export const getRouteKey = (origin: string, destination: string): string => {
  return `${origin}-${destination}`;
};

// Helper function to get price for a specific route and vehicle
export const getZonePrice = (origin: string, destination: string, vehicle: string): number | null => {
  const routeKey = getRouteKey(origin, destination);
  const reverseRouteKey = getRouteKey(destination, origin);
  
  // Try direct route first
  if (ZONE_PRICING_MATRIX[routeKey] && ZONE_PRICING_MATRIX[routeKey][vehicle]) {
    return ZONE_PRICING_MATRIX[routeKey][vehicle];
  }
  
  // Try reverse route
  if (ZONE_PRICING_MATRIX[reverseRouteKey] && ZONE_PRICING_MATRIX[reverseRouteKey][vehicle]) {
    return ZONE_PRICING_MATRIX[reverseRouteKey][vehicle];
  }
  
  return null;
};

// Helper function to get distance between zones
export const getRouteDistance = (origin: string, destination: string): number | null => {
  const routeKey = getRouteKey(origin, destination);
  const reverseRouteKey = getRouteKey(destination, origin);
  
  return ROUTE_DISTANCES[routeKey] || ROUTE_DISTANCES[reverseRouteKey] || null;
}; 