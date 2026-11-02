-- ==============================================================================
-- KOBRA POS - ESQUEMA MULTI-INQUILINO (MULTI-TENANT) EN SUPABASE
-- Ejecutar en el SQL Editor de tu proyecto en Supabase (wzrvrexpfskisxneiabd)
-- ==============================================================================

-- 1. TABLA DE TIENDAS / NEGOCIOS (Multi-Inquilino)
CREATE TABLE IF NOT EXISTS public.kobra_tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    owner_password TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    plan TEXT DEFAULT 'pro',
    business_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE PRODUCTOS (Separados por store_id)
CREATE TABLE IF NOT EXISTS public.kobra_products (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    barcode TEXT,
    category TEXT DEFAULT 'Varios',
    unit_type TEXT DEFAULT 'uds',
    cost_price NUMERIC(12, 2) DEFAULT 0.00,
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock NUMERIC(12, 2) DEFAULT 0.00,
    min_stock NUMERIC(12, 2) DEFAULT 5.00,
    image_url TEXT,
    sku TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE TICKETS DE VENTA (Separados por store_id)
CREATE TABLE IF NOT EXISTS public.kobra_tickets (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    ticket_number TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    items JSONB NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    cash_received NUMERIC(12, 2),
    change_given NUMERIC(12, 2),
    customer_name TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLA DE CUADERNO DE FIADOS / DEUDORES (Separados por store_id)
CREATE TABLE IF NOT EXISTS public.kobra_debtors (
    id TEXT PRIMARY KEY,
    store_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    total_credit NUMERIC(12, 2) DEFAULT 0.00,
    total_paid NUMERIC(12, 2) DEFAULT 0.00,
    current_balance NUMERIC(12, 2) DEFAULT 0.00,
    last_ticket_code TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda ultra rápida por tienda y código de barras
CREATE INDEX IF NOT EXISTS idx_kobra_products_store ON public.kobra_products(store_id);
CREATE INDEX IF NOT EXISTS idx_kobra_products_barcode ON public.kobra_products(barcode);
CREATE INDEX IF NOT EXISTS idx_kobra_tickets_store ON public.kobra_tickets(store_id);
CREATE INDEX IF NOT EXISTS idx_kobra_debtors_store ON public.kobra_debtors(store_id);

-- POLÍTICAS DE ACCESO (Permitir lectura y escritura mediante API REST)
ALTER TABLE public.kobra_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kobra_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kobra_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kobra_debtors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo kobra_tenants" ON public.kobra_tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo kobra_products" ON public.kobra_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo kobra_tickets" ON public.kobra_tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo kobra_debtors" ON public.kobra_debtors FOR ALL USING (true) WITH CHECK (true);
