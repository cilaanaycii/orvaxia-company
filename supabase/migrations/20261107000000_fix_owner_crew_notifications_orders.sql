/*
# ORVAXIA COMPANY — Fix Owner, Crew, Notifications, and Orders Sync
# 1. Memastikan tabel dashboard_notifications, company_orders, dan company_order_events ada.
# 2. Menambahkan kolom customer_id ke company_orders jika belum ada.
# 3. Membuat profil untuk auth users yang belum memiliki entri di tabel profiles.
# 4. Memastikan RLS policies tepat untuk notifikasi dan pesanan.
# 5. Tidak menghapus tabel atau data yang sudah ada.
# 6. Jalankan di Supabase SQL Editor.
*/

-- 1. Pastikan tabel dashboard_notifications ada
CREATE TABLE IF NOT EXISTS public.dashboard_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  href text NOT NULL,
  dedupe_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  UNIQUE (recipient_id, dedupe_key)
);

-- 2. Pastikan kolom customer_id ada di company_orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_orders' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE public.company_orders
      ADD COLUMN customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'company_orders' AND column_name = 'idempotency_key'
  ) THEN
    ALTER TABLE public.company_orders
      ADD COLUMN idempotency_key uuid;
  END IF;
END $$;

-- 3. Indeks unik untuk idempotensi
CREATE UNIQUE INDEX IF NOT EXISTS company_orders_customer_idempotency_unique_idx
  ON public.company_orders (customer_id, idempotency_key)
  WHERE customer_id IS NOT NULL AND idempotency_key IS NOT NULL;

-- 4. Aktifkan RLS pada tabel terkait
ALTER TABLE public.dashboard_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_tasks ENABLE ROW LEVEL SECURITY;

-- 5. Fungsi is_executive()
CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION private.is_executive()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('owner', 'ceo') AND status = 'active'
  );
$$;
REVOKE ALL ON FUNCTION private.is_executive() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_executive() TO authenticated;

-- 6. Fungsi is_order_staff()
CREATE OR REPLACE FUNCTION private.is_order_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'active'
      AND role IN ('owner', 'ceo', 'sales', 'production', 'finance')
  );
$$;
REVOKE ALL ON FUNCTION private.is_order_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_order_staff() TO authenticated;

-- 7. Grants
REVOKE ALL ON public.dashboard_notifications FROM anon, authenticated;
REVOKE ALL ON public.company_orders FROM anon, authenticated;
REVOKE ALL ON public.company_order_events FROM anon, authenticated;
GRANT SELECT ON public.dashboard_notifications TO authenticated;
GRANT UPDATE (read_at) ON public.dashboard_notifications TO authenticated;
GRANT ALL ON public.dashboard_notifications TO service_role;
GRANT SELECT ON public.company_orders TO authenticated;
GRANT UPDATE (order_status, payment_status, assigned_staff_id, assigned_staff_name, tracking_number, shipping_proof_url, updated_at) ON public.company_orders TO authenticated;
GRANT ALL ON public.company_orders TO service_role;
GRANT SELECT ON public.company_order_events TO authenticated;
GRANT ALL ON public.company_order_events TO service_role;

-- 8. RLS policies dashboard_notifications (hanya milik sendiri)
DROP POLICY IF EXISTS notifications_read_self ON public.dashboard_notifications;
CREATE POLICY notifications_read_self
  ON public.dashboard_notifications FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());
DROP POLICY IF EXISTS notifications_update_self ON public.dashboard_notifications;
CREATE POLICY notifications_update_self
  ON public.dashboard_notifications FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());

-- 9. RLS policies company_orders
DROP POLICY IF EXISTS company_orders_staff_read ON public.company_orders;
CREATE POLICY company_orders_staff_read
  ON public.company_orders FOR SELECT TO authenticated
  USING (private.is_order_staff());
DROP POLICY IF EXISTS company_orders_customer_read ON public.company_orders;
CREATE POLICY company_orders_customer_read
  ON public.company_orders FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer' AND status = 'active')
  );
DROP POLICY IF EXISTS company_orders_staff_update ON public.company_orders;
CREATE POLICY company_orders_staff_update
  ON public.company_orders FOR UPDATE TO authenticated
  USING (private.is_order_staff()) WITH CHECK (private.is_order_staff());

-- 10. RLS policies company_order_events
DROP POLICY IF EXISTS company_order_events_customer_read ON public.company_order_events;
CREATE POLICY company_order_events_customer_read
  ON public.company_order_events FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.company_orders
      WHERE company_orders.id = company_order_events.order_id
        AND company_orders.customer_id = auth.uid())
  );
DROP POLICY IF EXISTS company_order_events_staff_read ON public.company_order_events;
CREATE POLICY company_order_events_staff_read
  ON public.company_order_events FOR SELECT TO authenticated
  USING (private.is_order_staff());

-- 11. Buat profil untuk auth users tanpa profil di public.profiles
INSERT INTO public.profiles (id, email, full_name, phone, role, status, division, position, avatar_url, created_at, updated_at)
SELECT
  auth_user.id,
  COALESCE(auth_user.email, auth_user.id::text),
  COALESCE(auth_user.raw_user_meta_data->>'full_name', ''),
  COALESCE(auth_user.raw_user_meta_data->>'phone', ''),
  CASE WHEN auth_user.raw_user_meta_data->>'account_type' = 'customer' THEN 'customer' ELSE 'member' END,
  CASE WHEN auth_user.raw_user_meta_data->>'account_type' = 'customer' THEN 'active' ELSE 'pending_approval' END,
  NULLIF(auth_user.raw_user_meta_data->>'division', ''),
  CASE WHEN auth_user.raw_user_meta_data->>'account_type' = 'customer' THEN 'Customer' ELSE COALESCE(NULLIF(auth_user.raw_user_meta_data->>'position', ''), 'Crew Baru (Pending)') END,
  NULL,
  auth_user.created_at,
  now()
FROM auth.users AS auth_user
ON CONFLICT (id) DO NOTHING;

-- 12. Indeks performa
CREATE INDEX IF NOT EXISTS dashboard_notifications_recipient_created_idx
  ON public.dashboard_notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS company_orders_customer_id_idx
  ON public.company_orders (customer_id, created_at DESC);