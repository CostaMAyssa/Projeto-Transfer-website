// Define zone pricing types

export interface Zone {
  id: string;
  name: string;
  description: string;
  type: 'circular' | 'polygonal';
  // For circular zones
  center_lat?: number;
  center_lng?: number;
  radius_meters?: number;
  // For polygonal zones
  geojson?: Record<string, unknown>;
  coverage_area: string; // NY, NJ, PA, CT
  created_at?: string;
  updated_at?: string;
}

export interface VehicleCategory {
  id: string;
  name: string; // SUV, Sedan, Van
  capacity: number;
  base_price: number; // Preço base em USD
  description?: string;
  features?: string[];
}

export interface ZonePricing {
  id: string;
  origin_zone_id: string;
  destination_zone_id: string;
  vehicle_category_id: string;
  price: number; // Preço em USD cents
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PricingCalculationRequest {
  pickup_location: {
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  dropoff_location: {
    address: string;
    coordinates: [number, number];
  };
  vehicle_category: string; // 'SUV' | 'SEDAN' | 'VAN'
  booking_type?: 'one-way' | 'round-trip' | 'hourly';
  duration_hours?: number;
  round_trip_data?: {
    outbound_date?: string;
    return_date?: string;
    duration_days?: number;
  };
}

export interface PricingCalculationResponse {
  success: boolean;
  price?: number;
  pickup_zone?: Zone | string;
  dropoff_zone?: Zone | string;
  vehicle_category?: string | VehicleCategory;
  distance_miles?: number;
  message?: string;
  calculation_method?: 'zone_specific' | 'base_price' | 'fallback';
  out_of_coverage?: boolean;
  whatsapp_contact?: boolean;
  base_price?: number;
  booking_type?: 'one-way' | 'round-trip' | 'hourly';
  pricing_breakdown?: {
    base_price: number;
    outbound_price?: number;
    return_price?: number;
    hourly_rate?: number;
    duration_hours?: number;
    total_hours_cost?: number;
  };
}

export interface ZoneDetectionResult {
  zone_id: string | null;
  zone_name: string | null;
  confidence: number;
  method: 'exact' | 'approximate' | 'fallback';
}

// Predefined zones data structure
export interface PredefinedZone {
  id: string;
  name: string;
  description: string;
  type: 'circular' | 'polygonal';
  center_lat?: number;
  center_lng?: number;
  radius_meters?: number;
  coverage_area: string;
}

// Zone tolerance for boundary checking
export const ZONE_TOLERANCE_METERS = 300;

// Fixed vehicle categories with pricing (corrigido para valores em dólares)
export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    id: 'sedan',
    name: 'Sedan',
    capacity: 3,
    base_price: 130, // Preço médio da tabela
    description: 'Toyota Camry ou similar',
    features: ['3 passageiros', 'Confortável', 'Econômico']
  },
  {
    id: 'suv',
    name: 'SUV',
    capacity: 6,
    base_price: 160, // Preço médio da tabela
    description: 'Chevrolet Suburban ou similar',
    features: ['6 passageiros', 'Espaçoso', 'Luxuoso']
  },
  {
    id: 'van',
    name: 'Van',
    capacity: 7,
    base_price: 150, // Preço médio da tabela
    description: 'Chrysler Pacifica ou similar',
    features: ['7 passageiros', 'Máximo espaço', 'Familiar']
  }
];

// Predefined zones as per documentation
export const PREDEFINED_ZONES: PredefinedZone[] = [
  {
    id: 'EWR',
    name: 'Aeroporto Intl. Newark (EWR)',
    description: 'Círculo 2,4 mi radius',
    type: 'circular',
    center_lat: 40.6895,
    center_lng: -74.1745,
    radius_meters: 3862,
    coverage_area: 'NJ'
  },
  {
    id: 'JFK',
    name: 'Aeroporto John F. Kennedy (JFK)',
    description: 'Círculo 4,4 mi radius',
    type: 'circular',
    center_lat: 40.6413,
    center_lng: -73.7781,
    radius_meters: 7080,
    coverage_area: 'NY'
  },
  {
    id: 'LGA',
    name: 'Aeroporto LaGuardia (LGA)',
    description: 'Círculo 2,4 mi radius',
    type: 'circular',
    center_lat: 40.7769,
    center_lng: -73.8740,
    radius_meters: 3862,
    coverage_area: 'NY'
  },
  {
    id: 'BRX',
    name: 'Bronx, NY',
    description: '25 ZIP Codes',
    type: 'polygonal',
    coverage_area: 'NY'
  },
  {
    id: 'BKN',
    name: 'Brooklyn, NY',
    description: '38 ZIP Codes',
    type: 'polygonal',
    coverage_area: 'NY'
  },
  {
    id: 'MAN',
    name: 'Manhattan, NY',
    description: '55 ZIP Codes',
    type: 'polygonal',
    coverage_area: 'NY'
  },
  {
    id: 'QNS',
    name: 'Queens, NY',
    description: '56 ZIP Codes',
    type: 'polygonal',
    coverage_area: 'NY'
  }
]; 