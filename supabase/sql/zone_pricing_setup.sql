-- Enable PostGIS extension for geographic operations
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create zones table
CREATE TABLE IF NOT EXISTS zones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('circular', 'polygonal')),
  -- For circular zones
  center_lat DECIMAL(10,8),
  center_lng DECIMAL(11,8),
  radius_meters INTEGER,
  -- For polygonal zones
  geojson JSONB,
  coverage_area TEXT NOT NULL, -- NY, NJ, PA, CT
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vehicle_categories table
CREATE TABLE IF NOT EXISTS vehicle_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  base_price INTEGER NOT NULL, -- Price in cents
  description TEXT,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create zone_pricing table
CREATE TABLE IF NOT EXISTS zone_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_zone_id TEXT NOT NULL REFERENCES zones(id),
  destination_zone_id TEXT NOT NULL REFERENCES zones(id),
  vehicle_category_id TEXT NOT NULL REFERENCES vehicle_categories(id),
  price INTEGER NOT NULL, -- Price in cents
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(origin_zone_id, destination_zone_id, vehicle_category_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_zones_type ON zones(type);
CREATE INDEX IF NOT EXISTS idx_zones_coverage_area ON zones(coverage_area);
CREATE INDEX IF NOT EXISTS idx_zones_active ON zones(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicle_categories_active ON vehicle_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_zone_pricing_origin ON zone_pricing(origin_zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_pricing_destination ON zone_pricing(destination_zone_id);
CREATE INDEX IF NOT EXISTS idx_zone_pricing_vehicle ON zone_pricing(vehicle_category_id);
CREATE INDEX IF NOT EXISTS idx_zone_pricing_active ON zone_pricing(is_active);

-- Insert predefined vehicle categories
INSERT INTO vehicle_categories (id, name, capacity, base_price, description, features) VALUES 
  ('sedan', 'Sedan', 3, 75000, 'Toyota Camry ou similar', '["3 passageiros", "Confortável", "Econômico"]'),
  ('suv', 'SUV', 6, 115000, 'Chevrolet Suburban ou similar', '["6 passageiros", "Espaçoso", "Luxuoso"]'),
  ('minivan', 'Minivan', 7, 130000, 'Chrysler Pacifica ou similar', '["7 passageiros", "Máximo espaço", "Familiar"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  base_price = EXCLUDED.base_price,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Insert predefined zones
INSERT INTO zones (id, name, description, type, center_lat, center_lng, radius_meters, coverage_area) VALUES 
  ('Z_EWR', 'Aeroporto Intl. Newark (EWR)', 'Círculo 2,4 mi radius', 'circular', 40.6895, -74.1745, 3862, 'NJ'),
  ('Z_JFK', 'Aeroporto John F. Kennedy (JFK)', 'Círculo 4,4 mi radius', 'circular', 40.6413, -73.7781, 7080, 'NY'),
  ('Z_LGA', 'Aeroporto LaGuardia (LGA)', 'Círculo 2,4 mi radius', 'circular', 40.7769, -73.8740, 3862, 'NY'),
  ('Z_BRONX', 'Bronx, NY', '25 ZIP Codes', 'polygonal', NULL, NULL, NULL, 'NY'),
  ('Z_BKLYN', 'Brooklyn, NY', '38 ZIP Codes', 'polygonal', NULL, NULL, NULL, 'NY'),
  ('Z_MHTN', 'Manhattan, NY', '55 ZIP Codes', 'polygonal', NULL, NULL, NULL, 'NY'),
  ('Z_QNS', 'Queens, NY', '56 ZIP Codes', 'polygonal', NULL, NULL, NULL, 'NY')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  center_lat = EXCLUDED.center_lat,
  center_lng = EXCLUDED.center_lng,
  radius_meters = EXCLUDED.radius_meters,
  coverage_area = EXCLUDED.coverage_area,
  updated_at = NOW();

-- Insert basic pricing matrix (using base prices for all combinations initially)
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price) VALUES
  -- From Newark Airport (EWR)
  ('Z_EWR', 'Z_MHTN', 'sedan', 75000),
  ('Z_EWR', 'Z_MHTN', 'suv', 115000),
  ('Z_EWR', 'Z_MHTN', 'minivan', 130000),
  ('Z_EWR', 'Z_BKLYN', 'sedan', 75000),
  ('Z_EWR', 'Z_BKLYN', 'suv', 115000),
  ('Z_EWR', 'Z_BKLYN', 'minivan', 130000),
  ('Z_EWR', 'Z_QNS', 'sedan', 75000),
  ('Z_EWR', 'Z_QNS', 'suv', 115000),
  ('Z_EWR', 'Z_QNS', 'minivan', 130000),
  ('Z_EWR', 'Z_BRONX', 'sedan', 75000),
  ('Z_EWR', 'Z_BRONX', 'suv', 115000),
  ('Z_EWR', 'Z_BRONX', 'minivan', 130000),
  
  -- From JFK Airport
  ('Z_JFK', 'Z_MHTN', 'sedan', 75000),
  ('Z_JFK', 'Z_MHTN', 'suv', 115000),
  ('Z_JFK', 'Z_MHTN', 'minivan', 130000),
  ('Z_JFK', 'Z_BKLYN', 'sedan', 75000),
  ('Z_JFK', 'Z_BKLYN', 'suv', 115000),
  ('Z_JFK', 'Z_BKLYN', 'minivan', 130000),
  ('Z_JFK', 'Z_QNS', 'sedan', 75000),
  ('Z_JFK', 'Z_QNS', 'suv', 115000),
  ('Z_JFK', 'Z_QNS', 'minivan', 130000),
  ('Z_JFK', 'Z_BRONX', 'sedan', 75000),
  ('Z_JFK', 'Z_BRONX', 'suv', 115000),
  ('Z_JFK', 'Z_BRONX', 'minivan', 130000),
  
  -- From LaGuardia Airport
  ('Z_LGA', 'Z_MHTN', 'sedan', 75000),
  ('Z_LGA', 'Z_MHTN', 'suv', 115000),
  ('Z_LGA', 'Z_MHTN', 'minivan', 130000),
  ('Z_LGA', 'Z_BKLYN', 'sedan', 75000),
  ('Z_LGA', 'Z_BKLYN', 'suv', 115000),
  ('Z_LGA', 'Z_BKLYN', 'minivan', 130000),
  ('Z_LGA', 'Z_QNS', 'sedan', 75000),
  ('Z_LGA', 'Z_QNS', 'suv', 115000),
  ('Z_LGA', 'Z_QNS', 'minivan', 130000),
  ('Z_LGA', 'Z_BRONX', 'sedan', 75000),
  ('Z_LGA', 'Z_BRONX', 'suv', 115000),
  ('Z_LGA', 'Z_BRONX', 'minivan', 130000),
  
  -- Inter-borough routes (Manhattan to others)
  ('Z_MHTN', 'Z_BKLYN', 'sedan', 75000),
  ('Z_MHTN', 'Z_BKLYN', 'suv', 115000),
  ('Z_MHTN', 'Z_BKLYN', 'minivan', 130000),
  ('Z_MHTN', 'Z_QNS', 'sedan', 75000),
  ('Z_MHTN', 'Z_QNS', 'suv', 115000),
  ('Z_MHTN', 'Z_QNS', 'minivan', 130000),
  ('Z_MHTN', 'Z_BRONX', 'sedan', 75000),
  ('Z_MHTN', 'Z_BRONX', 'suv', 115000),
  ('Z_MHTN', 'Z_BRONX', 'minivan', 130000),
  
  -- Brooklyn to others
  ('Z_BKLYN', 'Z_MHTN', 'sedan', 75000),
  ('Z_BKLYN', 'Z_MHTN', 'suv', 115000),
  ('Z_BKLYN', 'Z_MHTN', 'minivan', 130000),
  ('Z_BKLYN', 'Z_QNS', 'sedan', 75000),
  ('Z_BKLYN', 'Z_QNS', 'suv', 115000),
  ('Z_BKLYN', 'Z_QNS', 'minivan', 130000),
  ('Z_BKLYN', 'Z_BRONX', 'sedan', 75000),
  ('Z_BKLYN', 'Z_BRONX', 'suv', 115000),
  ('Z_BKLYN', 'Z_BRONX', 'minivan', 130000),
  
  -- Queens to others
  ('Z_QNS', 'Z_MHTN', 'sedan', 75000),
  ('Z_QNS', 'Z_MHTN', 'suv', 115000),
  ('Z_QNS', 'Z_MHTN', 'minivan', 130000),
  ('Z_QNS', 'Z_BKLYN', 'sedan', 75000),
  ('Z_QNS', 'Z_BKLYN', 'suv', 115000),
  ('Z_QNS', 'Z_BKLYN', 'minivan', 130000),
  ('Z_QNS', 'Z_BRONX', 'sedan', 75000),
  ('Z_QNS', 'Z_BRONX', 'suv', 115000),
  ('Z_QNS', 'Z_BRONX', 'minivan', 130000),
  
  -- Bronx to others
  ('Z_BRONX', 'Z_MHTN', 'sedan', 75000),
  ('Z_BRONX', 'Z_MHTN', 'suv', 115000),
  ('Z_BRONX', 'Z_MHTN', 'minivan', 130000),
  ('Z_BRONX', 'Z_BKLYN', 'sedan', 75000),
  ('Z_BRONX', 'Z_BKLYN', 'suv', 115000),
  ('Z_BRONX', 'Z_BKLYN', 'minivan', 130000),
  ('Z_BRONX', 'Z_QNS', 'sedan', 75000),
  ('Z_BRONX', 'Z_QNS', 'suv', 115000),
  ('Z_BRONX', 'Z_QNS', 'minivan', 130000)
ON CONFLICT (origin_zone_id, destination_zone_id, vehicle_category_id) DO UPDATE SET
  price = EXCLUDED.price,
  updated_at = NOW();

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_zones_updated_at ON zones;
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicle_categories_updated_at ON vehicle_categories;
CREATE TRIGGER update_vehicle_categories_updated_at BEFORE UPDATE ON vehicle_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_zone_pricing_updated_at ON zone_pricing;
CREATE TRIGGER update_zone_pricing_updated_at BEFORE UPDATE ON zone_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 