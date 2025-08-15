-- Crear tablas básicas para el sistema de taller de celulares

-- Tabla de inventario
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de trabajos
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  diagnosis TEXT,
  solution TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente',
  labor_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  parts_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_completion DATE,
  actual_completion DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de garantías
CREATE TABLE warranties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),
  warranty_months INTEGER NOT NULL DEFAULT 3,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'activa',
  claim_description TEXT,
  claim_date DATE,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas diarias
CREATE TABLE daily_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id),
  inventory_id UUID REFERENCES inventory(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
