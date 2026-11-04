-- ==============================================================================
-- ORVAXIA COMPANY — ENTERPRISE DATABASE SCHEMA MIGRATION
-- Incorporates Multi-Role Auth, 31 Team Members, E-Commerce, 6-Step Checkout,
-- PO Window Enforcement, Production Stages, Sales Logistics, HRD Evaluations (7 metrics),
-- and Financial Cashflow Ledger.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. CUSTOM TYPES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
    CREATE TYPE user_role_type AS ENUM (
      'owner', 'ceo', 'production', 'sales', 'marketing',
      'hrd', 'finance', 'pr', 'member', 'customer'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status_type') THEN
    CREATE TYPE account_status_type AS ENUM (
      'pending_approval', 'active', 'suspended', 'inactive'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_lifecycle_status') THEN
    CREATE TYPE order_lifecycle_status AS ENUM (
      'pending_confirmation', 'payment_verified', 'in_production',
      'quality_check', 'packaging', 'ready_to_ship', 'shipped',
      'delivered', 'completed', 'cancelled'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_type') THEN
    CREATE TYPE financial_type AS ENUM ('income', 'expense');
  END IF;
END $$;

-- 3. PROFILES WITH ROLE APPROVAL WORKFLOW
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role user_role_type NOT NULL DEFAULT 'customer',
  status account_status_type NOT NULL DEFAULT 'active',
  division text,
  position text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. TEAM MEMBERS (31 OFFICIAL MEMBERS DIRECTORY)
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  division text NOT NULL,
  bio text NOT NULL DEFAULT '',
  responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'Aktif',
  avatar_url text NOT NULL DEFAULT '',
  phone text,
  email text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. HRD 7-INDICATOR PERFORMANCE REVIEWS
CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  member_name text NOT NULL,
  member_division text NOT NULL,
  reviewer_name text NOT NULL,
  review_date date NOT NULL DEFAULT CURRENT_DATE,
  period text NOT NULL,
  score_responsibility integer NOT NULL CHECK (score_responsibility BETWEEN 0 AND 100),
  score_punctuality integer NOT NULL CHECK (score_punctuality BETWEEN 0 AND 100),
  score_quality integer NOT NULL CHECK (score_quality BETWEEN 0 AND 100),
  score_collaboration integer NOT NULL CHECK (score_collaboration BETWEEN 0 AND 100),
  score_productivity integer NOT NULL CHECK (score_productivity BETWEEN 0 AND 100),
  score_communication integer NOT NULL CHECK (score_communication BETWEEN 0 AND 100),
  score_consistency integer NOT NULL CHECK (score_consistency BETWEEN 0 AND 100),
  average_score numeric(5,2) NOT NULL,
  notes text NOT NULL DEFAULT '',
  recommendations text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. PRODUCTS & ROVELLA SPECIFICATIONS
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  base_price numeric(12,2) NOT NULL CHECK (base_price >= 0),
  category text NOT NULL DEFAULT 'Tas Tumbler',
  status text NOT NULL DEFAULT 'published',
  is_featured boolean NOT NULL DEFAULT false,
  is_po boolean NOT NULL DEFAULT true,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_charms jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. PRE-ORDER PERIODS & LIVE WINDOW
CREATE TABLE IF NOT EXISTS public.po_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'open',
  quota integer NOT NULL DEFAULT 100,
  ordered_count integer NOT NULL DEFAULT 0,
  production_estimate_days integer NOT NULL DEFAULT 5,
  announcement text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. UNIFIED ORDERS & WORKFLOW LIFECYCLE
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  school_name text NOT NULL,
  class_name text NOT NULL,
  delivery_type text NOT NULL,
  shipping_address text NOT NULL,
  distance_km numeric(6,2) NOT NULL DEFAULT 0,
  shipping_cost numeric(12,2) NOT NULL DEFAULT 0,
  subtotal numeric(12,2) NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  order_status order_lifecycle_status NOT NULL DEFAULT 'pending_confirmation',
  po_period_id uuid REFERENCES public.po_periods(id),
  notes text DEFAULT '',
  assigned_staff_name text,
  tracking_number text,
  shipping_proof_url text,
  audit_trail jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. ORDER ITEMS & CUSTOMIZATION SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  product_name text NOT NULL,
  variant_name text NOT NULL,
  size_name text NOT NULL,
  custom_charm text,
  unit_price numeric(12,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal numeric(12,2) NOT NULL,
  customization jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- 10. FINANCIAL TRANSACTIONS LEDGER
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  type financial_type NOT NULL,
  category text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'verified',
  description text NOT NULL,
  order_reference text,
  recorded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. INVENTORY (RAW MATERIALS)
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  unit text NOT NULL,
  min_threshold integer NOT NULL DEFAULT 10,
  unit_cost numeric(12,2) NOT NULL DEFAULT 0,
  last_updated date NOT NULL DEFAULT CURRENT_DATE
);

-- 12. ANNOUNCEMENTS & PUBLIC COMMUNICATIONS
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  priority text NOT NULL DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Catalog, Team, Announcements
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;
CREATE POLICY "Public can view active team members" ON public.team_members FOR SELECT USING (status = 'Aktif');

DROP POLICY IF EXISTS "Public can view po periods" ON public.po_periods;
CREATE POLICY "Public can view po periods" ON public.po_periods FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view announcements" ON public.announcements;
CREATE POLICY "Public can view announcements" ON public.announcements FOR SELECT USING (is_public = true);

-- Performance Reviews are Private to HRD, CEO, Owner
DROP POLICY IF EXISTS "Reviews restricted to HRD and Executive" ON public.performance_reviews;
CREATE POLICY "Reviews restricted to HRD and Executive" ON public.performance_reviews FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('hrd', 'ceo', 'owner')));
