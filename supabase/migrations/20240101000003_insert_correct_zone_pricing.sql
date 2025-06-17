-- Inserir preços corretos baseados na tabela de tarifas oficial
-- Primeiro, limpar preços existentes
DELETE FROM zone_pricing;

-- Inserir preços corretos para todas as rotas da tabela de tarifas

-- ========== ROTAS PARA JFK ==========

-- Queens → JFK
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_QNS', 'Z_JFK', 'sedan', 13000, true),      -- $130
('Z_QNS', 'Z_JFK', 'suv', 15000, true),        -- $150
('Z_QNS', 'Z_JFK', 'minivan', 14000, true);    -- $140

-- Brooklyn → JFK
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_BKLYN', 'Z_JFK', 'sedan', 13000, true),    -- $130
('Z_BKLYN', 'Z_JFK', 'suv', 16000, true),      -- $160
('Z_BKLYN', 'Z_JFK', 'minivan', 15000, true);  -- $150

-- LaGuardia → JFK
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_LGA', 'Z_JFK', 'sedan', 10000, true),      -- $100
('Z_LGA', 'Z_JFK', 'suv', 12000, true),        -- $120
('Z_LGA', 'Z_JFK', 'minivan', 11000, true);    -- $110

-- Manhattan → JFK
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_MHTN', 'Z_JFK', 'sedan', 13000, true),     -- $130
('Z_MHTN', 'Z_JFK', 'suv', 16000, true),       -- $160
('Z_MHTN', 'Z_JFK', 'minivan', 15000, true);   -- $150

-- Bronx → JFK
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_BRONX', 'Z_JFK', 'sedan', 13000, true),    -- $130
('Z_BRONX', 'Z_JFK', 'suv', 16000, true),      -- $160
('Z_BRONX', 'Z_JFK', 'minivan', 15000, true);  -- $150

-- Newark → JFK
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_EWR', 'Z_JFK', 'sedan', 14000, true),      -- $140
('Z_EWR', 'Z_JFK', 'suv', 17000, true),        -- $170
('Z_EWR', 'Z_JFK', 'minivan', 16000, true);    -- $160

-- ========== ROTAS PARA LAGUARDIA ==========

-- Manhattan → LaGuardia
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_MHTN', 'Z_LGA', 'sedan', 13000, true),     -- $130
('Z_MHTN', 'Z_LGA', 'suv', 16000, true),       -- $160
('Z_MHTN', 'Z_LGA', 'minivan', 15000, true);   -- $150

-- Bronx → LaGuardia
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_BRONX', 'Z_LGA', 'sedan', 13000, true),    -- $130
('Z_BRONX', 'Z_LGA', 'suv', 16000, true),      -- $160
('Z_BRONX', 'Z_LGA', 'minivan', 15000, true);  -- $150

-- Queens → LaGuardia
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_QNS', 'Z_LGA', 'sedan', 12000, true),      -- $120
('Z_QNS', 'Z_LGA', 'suv', 15000, true),        -- $150
('Z_QNS', 'Z_LGA', 'minivan', 14000, true);    -- $140

-- Brooklyn → LaGuardia
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_BKLYN', 'Z_LGA', 'sedan', 13000, true),    -- $130
('Z_BKLYN', 'Z_LGA', 'suv', 16000, true),      -- $160
('Z_BKLYN', 'Z_LGA', 'minivan', 15000, true);  -- $150

-- JFK → LaGuardia
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_JFK', 'Z_LGA', 'sedan', 10000, true),      -- $100
('Z_JFK', 'Z_LGA', 'suv', 12000, true),        -- $120
('Z_JFK', 'Z_LGA', 'minivan', 11000, true);    -- $110

-- Newark → LaGuardia
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_EWR', 'Z_LGA', 'sedan', 14000, true),      -- $140
('Z_EWR', 'Z_LGA', 'suv', 17000, true),        -- $170
('Z_EWR', 'Z_LGA', 'minivan', 16000, true);    -- $160

-- ========== ROTAS REVERSAS (IDA E VOLTA) ==========

-- JFK → Queens
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_JFK', 'Z_QNS', 'sedan', 13000, true),      -- $130
('Z_JFK', 'Z_QNS', 'suv', 15000, true),        -- $150
('Z_JFK', 'Z_QNS', 'minivan', 14000, true);    -- $140

-- JFK → Brooklyn
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_JFK', 'Z_BKLYN', 'sedan', 13000, true),    -- $130
('Z_JFK', 'Z_BKLYN', 'suv', 16000, true),      -- $160
('Z_JFK', 'Z_BKLYN', 'minivan', 15000, true);  -- $150

-- JFK → Manhattan
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_JFK', 'Z_MHTN', 'sedan', 13000, true),     -- $130
('Z_JFK', 'Z_MHTN', 'suv', 16000, true),       -- $160
('Z_JFK', 'Z_MHTN', 'minivan', 15000, true);   -- $150

-- JFK → Bronx
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_JFK', 'Z_BRONX', 'sedan', 13000, true),    -- $130
('Z_JFK', 'Z_BRONX', 'suv', 16000, true),      -- $160
('Z_JFK', 'Z_BRONX', 'minivan', 15000, true);  -- $150

-- JFK → Newark
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_JFK', 'Z_EWR', 'sedan', 14000, true),      -- $140
('Z_JFK', 'Z_EWR', 'suv', 17000, true),        -- $170
('Z_JFK', 'Z_EWR', 'minivan', 16000, true);    -- $160

-- LaGuardia → Manhattan
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_LGA', 'Z_MHTN', 'sedan', 13000, true),     -- $130
('Z_LGA', 'Z_MHTN', 'suv', 16000, true),       -- $160
('Z_LGA', 'Z_MHTN', 'minivan', 15000, true);   -- $150

-- LaGuardia → Bronx
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_LGA', 'Z_BRONX', 'sedan', 13000, true),    -- $130
('Z_LGA', 'Z_BRONX', 'suv', 16000, true),      -- $160
('Z_LGA', 'Z_BRONX', 'minivan', 15000, true);  -- $150

-- LaGuardia → Queens
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_LGA', 'Z_QNS', 'sedan', 12000, true),      -- $120
('Z_LGA', 'Z_QNS', 'suv', 15000, true),        -- $150
('Z_LGA', 'Z_QNS', 'minivan', 14000, true);    -- $140

-- LaGuardia → Brooklyn
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_LGA', 'Z_BKLYN', 'sedan', 13000, true),    -- $130
('Z_LGA', 'Z_BKLYN', 'suv', 16000, true),      -- $160
('Z_LGA', 'Z_BKLYN', 'minivan', 15000, true);  -- $150

-- LaGuardia → Newark
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_LGA', 'Z_EWR', 'sedan', 14000, true),      -- $140
('Z_LGA', 'Z_EWR', 'suv', 17000, true),        -- $170
('Z_LGA', 'Z_EWR', 'minivan', 16000, true);    -- $160

-- Newark → Manhattan
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_EWR', 'Z_MHTN', 'sedan', 14000, true),     -- $140 (ajustado para Newark)
('Z_EWR', 'Z_MHTN', 'suv', 17000, true),       -- $170 (ajustado para Newark)
('Z_EWR', 'Z_MHTN', 'minivan', 16000, true);   -- $160 (ajustado para Newark)

-- Newark → Brooklyn
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_EWR', 'Z_BKLYN', 'sedan', 14000, true),    -- $140 (ajustado para Newark)
('Z_EWR', 'Z_BKLYN', 'suv', 17000, true),      -- $170 (ajustado para Newark)
('Z_EWR', 'Z_BKLYN', 'minivan', 16000, true);  -- $160 (ajustado para Newark)

-- Newark → Queens
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_EWR', 'Z_QNS', 'sedan', 14000, true),      -- $140 (ajustado para Newark)
('Z_EWR', 'Z_QNS', 'suv', 17000, true),        -- $170 (ajustado para Newark)
('Z_EWR', 'Z_QNS', 'minivan', 16000, true);    -- $160 (ajustado para Newark)

-- Newark → Bronx
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_EWR', 'Z_BRONX', 'sedan', 14000, true),    -- $140 (ajustado para Newark)
('Z_EWR', 'Z_BRONX', 'suv', 17000, true),      -- $170 (ajustado para Newark)
('Z_EWR', 'Z_BRONX', 'minivan', 16000, true);  -- $160 (ajustado para Newark)

-- Reversas do Newark
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_MHTN', 'Z_EWR', 'sedan', 14000, true),     -- $140
('Z_MHTN', 'Z_EWR', 'suv', 17000, true),       -- $170
('Z_MHTN', 'Z_EWR', 'minivan', 16000, true),   -- $160
('Z_BKLYN', 'Z_EWR', 'sedan', 14000, true),    -- $140
('Z_BKLYN', 'Z_EWR', 'suv', 17000, true),      -- $170
('Z_BKLYN', 'Z_EWR', 'minivan', 16000, true),  -- $160
('Z_QNS', 'Z_EWR', 'sedan', 14000, true),      -- $140
('Z_QNS', 'Z_EWR', 'suv', 17000, true),        -- $170
('Z_QNS', 'Z_EWR', 'minivan', 16000, true),    -- $160
('Z_BRONX', 'Z_EWR', 'sedan', 14000, true),    -- $140
('Z_BRONX', 'Z_EWR', 'suv', 17000, true),      -- $170
('Z_BRONX', 'Z_EWR', 'minivan', 16000, true);  -- $160

-- ========== ROTAS INTER-BOROUGHS (preços estimados baseados em distância) ==========

-- Manhattan ↔ Brooklyn
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_MHTN', 'Z_BKLYN', 'sedan', 7500, true),    -- $75
('Z_MHTN', 'Z_BKLYN', 'suv', 11500, true),     -- $115
('Z_MHTN', 'Z_BKLYN', 'minivan', 13000, true), -- $130
('Z_BKLYN', 'Z_MHTN', 'sedan', 7500, true),    -- $75
('Z_BKLYN', 'Z_MHTN', 'suv', 11500, true),     -- $115
('Z_BKLYN', 'Z_MHTN', 'minivan', 13000, true); -- $130

-- Manhattan ↔ Queens
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_MHTN', 'Z_QNS', 'sedan', 7500, true),      -- $75
('Z_MHTN', 'Z_QNS', 'suv', 11500, true),       -- $115
('Z_MHTN', 'Z_QNS', 'minivan', 13000, true),   -- $130
('Z_QNS', 'Z_MHTN', 'sedan', 7500, true),      -- $75
('Z_QNS', 'Z_MHTN', 'suv', 11500, true),       -- $115
('Z_QNS', 'Z_MHTN', 'minivan', 13000, true);   -- $130

-- Manhattan ↔ Bronx
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_MHTN', 'Z_BRONX', 'sedan', 7500, true),    -- $75
('Z_MHTN', 'Z_BRONX', 'suv', 11500, true),     -- $115
('Z_MHTN', 'Z_BRONX', 'minivan', 13000, true), -- $130
('Z_BRONX', 'Z_MHTN', 'sedan', 7500, true),    -- $75
('Z_BRONX', 'Z_MHTN', 'suv', 11500, true),     -- $115
('Z_BRONX', 'Z_MHTN', 'minivan', 13000, true); -- $130

-- Brooklyn ↔ Queens
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_BKLYN', 'Z_QNS', 'sedan', 7500, true),     -- $75
('Z_BKLYN', 'Z_QNS', 'suv', 11500, true),      -- $115
('Z_BKLYN', 'Z_QNS', 'minivan', 13000, true),  -- $130
('Z_QNS', 'Z_BKLYN', 'sedan', 7500, true),     -- $75
('Z_QNS', 'Z_BKLYN', 'suv', 11500, true),      -- $115
('Z_QNS', 'Z_BKLYN', 'minivan', 13000, true);  -- $130

-- Brooklyn ↔ Bronx
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_BKLYN', 'Z_BRONX', 'sedan', 7500, true),   -- $75
('Z_BKLYN', 'Z_BRONX', 'suv', 11500, true),    -- $115
('Z_BKLYN', 'Z_BRONX', 'minivan', 13000, true), -- $130
('Z_BRONX', 'Z_BKLYN', 'sedan', 7500, true),   -- $75
('Z_BRONX', 'Z_BKLYN', 'suv', 11500, true),    -- $115
('Z_BRONX', 'Z_BKLYN', 'minivan', 13000, true); -- $130

-- Queens ↔ Bronx
INSERT INTO zone_pricing (origin_zone_id, destination_zone_id, vehicle_category_id, price, is_active) VALUES
('Z_QNS', 'Z_BRONX', 'sedan', 7500, true),     -- $75
('Z_QNS', 'Z_BRONX', 'suv', 11500, true),      -- $115
('Z_QNS', 'Z_BRONX', 'minivan', 13000, true),  -- $130
('Z_BRONX', 'Z_QNS', 'sedan', 7500, true),     -- $75
('Z_BRONX', 'Z_QNS', 'suv', 11500, true),      -- $115
('Z_BRONX', 'Z_QNS', 'minivan', 13000, true);  -- $130 