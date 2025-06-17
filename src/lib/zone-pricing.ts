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
    // Por enquanto, usa apenas zonas predefinidas até que o banco seja configurado
    const allZones: Zone[] = PREDEFINED_ZONES.map(pz => ({
      ...pz,
      type: pz.type as 'circular' | 'polygonal'
    }));
    
    let closestZone: Zone | undefined;
    let closestDistance = Infinity;
    let isWithinAnyZone = false;
    
    // Verifica cada zona, priorizando zonas circulares (aeroportos)
    const sortedZones = allZones.sort((a, b) => {
      if (a.type === 'circular' && b.type === 'polygonal') return -1;
      if (a.type === 'polygonal' && b.type === 'circular') return 1;
      return 0;
    });
    
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
        isInZone = isPointInPolygonalZone(latitude, longitude, zone);
        // Para zonas poligonais, calculamos distância aproximada ao centro
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
      
      // Se está dentro da zona, retorna imediatamente (prioridade para zona mais específica)
      if (isInZone) {
        return {
          zone,
          is_within_zone: true,
          distance_to_zone: 0,
          out_of_coverage: false
        };
      }
      
      // Verifica se está dentro da tolerância
      if (distanceToZone <= ZONE_TOLERANCE_METERS) {
        isWithinAnyZone = true;
        if (distanceToZone < closestDistance) {
          closestDistance = distanceToZone;
          closestZone = zone;
        }
      }
    }
    
    // Se está dentro da tolerância de alguma zona
    if (isWithinAnyZone && closestZone) {
      return {
        zone: closestZone,
        is_within_zone: true,
        distance_to_zone: closestDistance,
        out_of_coverage: false
      };
    }
    
    // Fora de cobertura
    return {
      is_within_zone: false,
      out_of_coverage: true,
      distance_to_zone: closestDistance === Infinity ? undefined : closestDistance
    };
    
  } catch (error) {
    console.error('Erro na detecção de zona:', error);
    return { is_within_zone: false, out_of_coverage: true };
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
 * Calcula o preço de uma viagem baseado nas zonas e categoria do veículo
 */
export async function calculateZonePricing(
  request: PricingCalculationRequest
): Promise<PricingCalculationResponse> {
  try {
    const { pickup_location, dropoff_location, vehicle_category } = request;
    
    // Detecta zona de origem
    const pickupZoneResult = await detectZone(
      pickup_location.coordinates[1], // latitude
      pickup_location.coordinates[0]  // longitude
    );
    
    // Detecta zona de destino
    const dropoffZoneResult = await detectZone(
      dropoff_location.coordinates[1], // latitude
      dropoff_location.coordinates[0]  // longitude
    );
    
    // Busca categoria do veículo
    const vehicleCat = getVehicleCategory(vehicle_category);
    if (!vehicleCat) {
      return {
        success: false,
        message: 'Categoria de veículo não encontrada',
        out_of_coverage: false
      };
    }
    
    // Verifica se ambas as localizações estão fora de cobertura
    if (pickupZoneResult.out_of_coverage || dropoffZoneResult.out_of_coverage) {
      return {
        success: true,
        vehicle_category: vehicleCat,
        price: vehicleCat.base_price, // Preço padrão para fora de cobertura
        base_price: vehicleCat.base_price,
        out_of_coverage: true,
        message: 'Uma ou ambas as localizações estão fora da área de cobertura. Entre em contato conosco via WhatsApp.',
        whatsapp_contact: true
      };
    }

    // Ambas as zonas detectadas - busca preço específico no banco
    if (pickupZoneResult.zone && dropoffZoneResult.zone) {
      // Busca preço específico da rota no banco de dados
      const { ZonePricingDatabaseService } = await import('./zone-pricing-db');
      const specificPrice = await ZonePricingDatabaseService.getZonePricing(
        pickupZoneResult.zone.id,
        dropoffZoneResult.zone.id,
        vehicleCat.id
      );

      if (specificPrice && specificPrice > 0) {
        // Preço específico encontrado no banco
        return {
          success: true,
          pickup_zone: pickupZoneResult.zone,
          dropoff_zone: dropoffZoneResult.zone,
          vehicle_category: vehicleCat,
          price: specificPrice,
          base_price: vehicleCat.base_price,
          out_of_coverage: false,
          message: `Viagem de ${pickupZoneResult.zone.name} para ${dropoffZoneResult.zone.name} - Preço específico`
        };
      }
    }
    
    // Fallback para preço base se não encontrar preço específico
    return {
      success: true,
      pickup_zone: pickupZoneResult.zone,
      dropoff_zone: dropoffZoneResult.zone,
      vehicle_category: vehicleCat,
      price: vehicleCat.base_price,
      base_price: vehicleCat.base_price,
      out_of_coverage: false,
      message: `Viagem de ${pickupZoneResult.zone?.name || 'Origem'} para ${dropoffZoneResult.zone?.name || 'Destino'} - Usando preço base (preço específico não encontrado)`
    };
    
  } catch (error) {
    console.error('Erro no cálculo de preços:', error);
    return {
      success: false,
      message: 'Erro interno no cálculo de preços',
      out_of_coverage: false
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