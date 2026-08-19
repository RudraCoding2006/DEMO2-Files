-- Run this script in Supabase SQL Editor to clear all duplicate rows and apply primary key updates!

DROP TABLE IF EXISTS public.pending_orders CASCADE;
DROP TABLE IF EXISTS public.rewinder_reels CASCADE;
DROP TABLE IF EXISTS public.dispatches CASCADE;
DROP TABLE IF EXISTS public.store_items CASCADE;
DROP TABLE IF EXISTS public.raw_materials CASCADE;
DROP TABLE IF EXISTS public.jumbo_rolls CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.pending_orders (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  party TEXT NOT NULL,
  product_name TEXT NOT NULL,
  gsm NUMERIC(6, 2) NOT NULL,
  size TEXT NOT NULL,
  ply INT NOT NULL DEFAULT 1,
  quantity_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  dispatched_kg NUMERIC(12, 2) DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.rewinder_reels (
  id TEXT PRIMARY KEY,
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

CREATE TABLE public.dispatches (
  id TEXT PRIMARY KEY,
  dispatch_no TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  party TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  reels_count INT DEFAULT 1,
  order_id TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.store_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  number TEXT DEFAULT '',
  size TEXT DEFAULT '',
  item_group TEXT DEFAULT '',
  name TEXT NOT NULL,
  pcs INT NOT NULL DEFAULT 0,
  use_for TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.raw_materials (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity_kg NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  vehicle_no TEXT DEFAULT '',
  supplier_party TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.jumbo_rolls (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  roll_no TEXT NOT NULL,
  shift TEXT NOT NULL,
  gsm NUMERIC(6, 2) NOT NULL,
  size_mm NUMERIC(8, 2) NOT NULL,
  weight_kg NUMERIC(12, 2) NOT NULL,
  quality_grade TEXT NOT NULL DEFAULT 'A Grade',
  breaks INT DEFAULT 0,
  operator_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT DEFAULT ''
);

-- Enable RLS
ALTER TABLE public.pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewinder_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jumbo_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all pending_orders" ON public.pending_orders FOR ALL USING (true);
CREATE POLICY "Allow public all rewinder_reels" ON public.rewinder_reels FOR ALL USING (true);
CREATE POLICY "Allow public all dispatches" ON public.dispatches FOR ALL USING (true);
CREATE POLICY "Allow public all store_items" ON public.store_items FOR ALL USING (true);
CREATE POLICY "Allow public all raw_materials" ON public.raw_materials FOR ALL USING (true);
CREATE POLICY "Allow public all jumbo_rolls" ON public.jumbo_rolls FOR ALL USING (true);
CREATE POLICY "Allow public all audit_logs" ON public.audit_logs FOR ALL USING (true);
