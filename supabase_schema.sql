-- ==============================================================================
-- SAHEB PAPER MILL ERP - SUPABASE COMPLETE 13 MODULES DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor: https://app.supabase.com
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS & OPERATORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  allowed_modules TEXT[] NOT NULL DEFAULT '{}',
  is_read_only BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. RAW MATERIALS INWARD & CONSUMPTION TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.raw_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL, -- 'Waste Paper', 'Chemical', 'Fuel', 'Water'
  item_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('inward', 'consumption')),
  quantity_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  vehicle_no TEXT DEFAULT '',
  supplier_party TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. PULP MILL DAILY LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pulp_mill_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  waste_paper_kg NUMERIC(12, 2) DEFAULT 0.00,
  caustic_soda_kg NUMERIC(12, 2) DEFAULT 0.00,
  rosin_kg NUMERIC(12, 2) DEFAULT 0.00,
  alum_kg NUMERIC(12, 2) DEFAULT 0.00,
  dyes_kg NUMERIC(12, 2) DEFAULT 0.00,
  starch_kg NUMERIC(12, 2) DEFAULT 0.00,
  pac_kg NUMERIC(12, 2) DEFAULT 0.00,
  water_ltr NUMERIC(12, 2) DEFAULT 0.00,
  power_units_kwh NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PLANT MANAGER / PAPER MACHINE LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.machine_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  shift_a_operator TEXT DEFAULT '',
  shift_b_operator TEXT DEFAULT '',
  retention_agent_rate NUMERIC(8, 2) DEFAULT 0.00,
  defoamer_rate NUMERIC(8, 2) DEFAULT 0.00,
  biocide_rate NUMERIC(8, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. JUMBO ROLLS PRODUCTION TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jumbo_rolls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  roll_no TEXT NOT NULL,
  shift TEXT NOT NULL CHECK (shift IN ('A', 'B', 'C')),
  gsm NUMERIC(6, 2) NOT NULL,
  size_mm NUMERIC(8, 2) NOT NULL,
  weight_kg NUMERIC(12, 2) NOT NULL,
  quality_grade TEXT NOT NULL DEFAULT 'A Grade',
  breaks INT DEFAULT 0,
  operator_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. REWINDER FINISHED REELS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rewinder_reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  reel_no TEXT NOT NULL,
  running_roll_no TEXT DEFAULT '',
  running_size TEXT DEFAULT '',
  product_name TEXT NOT NULL,
  gsm NUMERIC(6, 2) NOT NULL,
  size TEXT NOT NULL,
  ply INT NOT NULL DEFAULT 1,
  dia NUMERIC(8, 2) DEFAULT 900,
  joint INT DEFAULT 0,
  weight_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  broke_kg NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. BOILER HOUSE LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.boiler_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  fuel_type TEXT NOT NULL DEFAULT 'Firewood',
  total_fuel_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  water_consumption_ltr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  steam_generated_kg NUMERIC(12, 2) DEFAULT 0.00,
  running_hours NUMERIC(6, 2) DEFAULT 24.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. ETP (EFFLUENT TREATMENT PLANT) LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.etp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  flock_100_liq_ltr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  flock_master_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  treated_water_ltr NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. ELECTRICITY CONSUMPTION LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.electricity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  daily_units_kwh NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  unit_per_ton NUMERIC(8, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. PENDING CUSTOMER ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pending_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  party TEXT NOT NULL,
  product_name TEXT NOT NULL,
  gsm NUMERIC(6, 2) NOT NULL,
  size TEXT NOT NULL,
  ply INT NOT NULL DEFAULT 1,
  quantity_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  dispatched_kg NUMERIC(12, 2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'fulfilled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. DISPATCH GATE PASSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispatch_no TEXT UNIQUE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  party TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  reels_count INT DEFAULT 1,
  order_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 12. STORE SPARES INVENTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('bearing', 'v_belt', 'other')),
  number TEXT DEFAULT '',
  size TEXT DEFAULT '',
  item_group TEXT DEFAULT '',
  name TEXT NOT NULL,
  pcs INT NOT NULL DEFAULT 0,
  use_for TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 13. AUDIT & SYSTEM ACTIVITY LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT DEFAULT ''
);

-- ------------------------------------------------------------------------------
-- SEED INITIAL USERS & OPERATORS (6 DEFAULT ACCOUNTS)
-- ------------------------------------------------------------------------------
INSERT INTO public.users (id, name, username, password, role, employee_id, allowed_modules, is_read_only)
VALUES 
  ('usr-1', 'Rajesh Sharma', 'admin', 'admin@password123', 'admin', 'EMP-001', ARRAY['dashboard', 'pulp_mill', 'machine', 'rewinder', 'raw_material', 'finish_stock', 'dispatch', 'pending_order', 'boiler', 'etp', 'electricity', 'store', 'user_management'], FALSE),
  ('usr-2', 'Anil Verma', 'plant_manager', 'manager@pass2026', 'plant_manager', 'EMP-002', ARRAY['dashboard', 'machine', 'rewinder', 'finish_stock', 'dispatch', 'pending_order', 'pulp_mill', 'boiler', 'etp', 'electricity', 'store'], FALSE),
  ('usr-3', 'Suresh Patel', 'pulp_mill', 'pulp@pass2026', 'pulp_mill', 'EMP-003', ARRAY['pulp_mill', 'raw_material'], FALSE),
  ('usr-4', 'Vikram Singh', 'dispatch', 'dispatch@pass2026', 'dispatch', 'EMP-004', ARRAY['dispatch', 'pending_order'], FALSE),
  ('usr-5', 'Amit Patel', 'store_keeper', 'store@pass2026', 'store_keeper', 'EMP-005', ARRAY['store', 'raw_material'], FALSE),
  ('usr-6', 'Guest Viewer', 'guest', 'guest@pass2026', 'guest_viewer', 'GUEST-001', ARRAY['dashboard', 'pulp_mill', 'machine', 'rewinder', 'raw_material', 'finish_stock', 'dispatch', 'pending_order', 'boiler', 'etp', 'electricity', 'store', 'user_management'], TRUE)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  allowed_modules = EXCLUDED.allowed_modules,
  is_read_only = EXCLUDED.is_read_only;

-- ------------------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL 13 TABLES
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulp_mill_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jumbo_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewinder_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boiler_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electricity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ALLOW ANONYMOUS & AUTHENTICATED READ/WRITE FOR WEB CLIENT ACCESS
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public all raw_materials" ON public.raw_materials FOR ALL USING (true);
CREATE POLICY "Allow public all pulp_mill_logs" ON public.pulp_mill_logs FOR ALL USING (true);
CREATE POLICY "Allow public all machine_logs" ON public.machine_logs FOR ALL USING (true);
CREATE POLICY "Allow public all jumbo_rolls" ON public.jumbo_rolls FOR ALL USING (true);
CREATE POLICY "Allow public all rewinder_reels" ON public.rewinder_reels FOR ALL USING (true);
CREATE POLICY "Allow public all boiler_logs" ON public.boiler_logs FOR ALL USING (true);
CREATE POLICY "Allow public all etp_logs" ON public.etp_logs FOR ALL USING (true);
CREATE POLICY "Allow public all electricity_logs" ON public.electricity_logs FOR ALL USING (true);
CREATE POLICY "Allow public all pending_orders" ON public.pending_orders FOR ALL USING (true);
CREATE POLICY "Allow public all dispatches" ON public.dispatches FOR ALL USING (true);
CREATE POLICY "Allow public all store_items" ON public.store_items FOR ALL USING (true);
CREATE POLICY "Allow public all audit_logs" ON public.audit_logs FOR ALL USING (true);
