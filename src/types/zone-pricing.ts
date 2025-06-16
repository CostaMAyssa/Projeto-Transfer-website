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
  geojson?: any;
  coverage_area: string; // NY, NJ, PA, CT
  created_at?: string;
  updated_at?: string;
}

export interface VehicleCategory {
  id: string;
  name: string; // SUV, Sedan, Minivan
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
  vehicle_category: string; // 'SUV' | 'Sedan' | 'Minivan'
}

export interface PricingCalculationResponse {
  success: boolean;
  pickup_zone?: Zone;
  dropoff_zone?: Zone;
  vehicle_category?: VehicleCategory;
  price?: number; // Preço em USD cents
  base_price?: number;
  out_of_coverage?: boolean;
  message?: string;
  whatsapp_contact?: boolean;
}

export interface ZoneDetectionResult {
  zone?: Zone;
  is_within_zone: boolean;
  distance_to_zone?: number; // Em metros
  out_of_coverage: boolean;
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

// Fixed vehicle categories with pricing
export const VEHICLE_CATEGORIES: VehicleCategory[] = [
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

// Predefined zones as per documentation
export const PREDEFINED_ZONES: PredefinedZone[] = [
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