/*
# Tighten ORVAXIA grants and admin policies

1. Purpose
- Removes accidental broad Data API grants from all ORVAXIA tables.
- Moves the admin-checking function into a private schema so it is not exposed as a public RPC.
- Replaces broad admin `FOR ALL` policies with separate SELECT, INSERT, UPDATE, and DELETE policies.

2. Access changes
- Anonymous visitors can only SELECT published public content tables.
- Anonymous visitors cannot directly read or write customer orders, order items, profiles, or unpublished records.
- Authenticated users can manage protected records only when `private.is_admin()` confirms the session belongs to an admin.
- Order creation remains available through the validated public-order function until the server route is connected.

3. Security notes
- Row Level Security remains enabled on every table.
- Admin role checks remain server-side and use `auth.uid()`.
- No customer data is exposed to anonymous users.
*/

DO $$
DECLARE
  table_name text;
  table_names text[] := ARRAY['products', 'product_images', 'product_variants', 'product_sizes', 'po_periods', 'team_members', 'gallery', 'faqs', 'site_content', 'site_settings'];
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    EXECUTE format('DROP POLICY IF EXISTS admin_manage_%I ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS admin_select_%I ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS admin_insert_%I ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS admin_update_%I ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS admin_delete_%I ON %I', table_name, table_name);
  END LOOP;
END $$;

DROP POLICY IF EXISTS admin_read_profiles ON profiles;
DROP POLICY IF EXISTS admin_update_profiles ON profiles;
DROP POLICY IF EXISTS admin_select_profiles ON profiles;
DROP POLICY IF EXISTS admin_insert_profiles ON profiles;
DROP POLICY IF EXISTS admin_delete_profiles ON profiles;
DROP POLICY IF EXISTS admin_read_orders ON orders;
DROP POLICY IF EXISTS admin_update_orders ON orders;
DROP POLICY IF EXISTS admin_delete_orders ON orders;
DROP POLICY IF EXISTS admin_select_orders ON orders;
DROP POLICY IF EXISTS admin_read_order_items ON order_items;
DROP POLICY IF EXISTS admin_update_order_items ON order_items;
DROP POLICY IF EXISTS admin_delete_order_items ON order_items;
DROP POLICY IF EXISTS admin_select_order_items ON order_items;

DROP FUNCTION IF EXISTS public.is_admin();
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

REVOKE ALL ON profiles, products, product_images, product_variants, product_sizes, po_periods, orders, order_items, team_members, gallery, faqs, site_content, site_settings FROM anon, authenticated;

GRANT SELECT ON products, product_images, product_variants, product_sizes, po_periods, team_members, gallery, faqs, site_content, site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON products, product_images, product_variants, product_sizes, po_periods, team_members, gallery, faqs, site_content, site_settings TO authenticated;
GRANT SELECT, UPDATE, DELETE ON profiles, orders, order_items TO authenticated;

DO $$
DECLARE
  table_name text;
  table_names text[] := ARRAY['products', 'product_images', 'product_variants', 'product_sizes', 'po_periods', 'team_members', 'gallery', 'faqs', 'site_content', 'site_settings'];
BEGIN
  FOREACH table_name IN ARRAY table_names LOOP
    EXECUTE format('CREATE POLICY admin_select_%I ON %I FOR SELECT TO authenticated USING (private.is_admin())', table_name, table_name);
    EXECUTE format('CREATE POLICY admin_insert_%I ON %I FOR INSERT TO authenticated WITH CHECK (private.is_admin())', table_name, table_name);
    EXECUTE format('CREATE POLICY admin_update_%I ON %I FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin())', table_name, table_name);
    EXECUTE format('CREATE POLICY admin_delete_%I ON %I FOR DELETE TO authenticated USING (private.is_admin())', table_name, table_name);
  END LOOP;
END $$;

CREATE POLICY admin_select_profiles ON profiles FOR SELECT TO authenticated USING (private.is_admin() OR id = auth.uid());
CREATE POLICY admin_update_profiles ON profiles FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY admin_delete_profiles ON profiles FOR DELETE TO authenticated USING (private.is_admin());

CREATE POLICY admin_select_orders ON orders FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY admin_update_orders ON orders FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY admin_delete_orders ON orders FOR DELETE TO authenticated USING (private.is_admin());

CREATE POLICY admin_select_order_items ON order_items FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY admin_update_order_items ON order_items FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY admin_delete_order_items ON order_items FOR DELETE TO authenticated USING (private.is_admin());
