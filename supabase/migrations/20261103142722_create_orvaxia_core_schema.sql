/*
# Create ORVAXIA core schema and secure public pre-order flow

1. Purpose
- Creates the first ORVAXIA data model for public website content, products, PO periods, and orders.
- Visitors can browse published content and submit a pre-order without creating an account.
- Admin users will manage protected records through Supabase Authentication.

2. New tables
- `profiles`: protected admin profile and role metadata linked to `auth.users`.
- `products`: public product catalog records, prices, availability, and display order.
- `product_images`: ordered product image references.
- `product_variants`: product design or color choices.
- `product_sizes`: supported bottle sizes and price adjustments.
- `po_periods`: pre-order opening and closing windows.
- `orders`: private customer order headers and status.
- `order_items`: private product, variant, size, price, and quantity snapshot for each order.
- `team_members`: editable public team profiles.
- `gallery`: editable public gallery records.
- `faqs`: editable public FAQ records.
- `site_content`: editable public page content.
- `site_settings`: editable public and protected website settings.

3. Security
- Row Level Security is enabled on every new table.
- Anonymous users receive read-only access to published public content.
- Customer order tables are not readable or writable directly by anonymous users.
- Public order creation is exposed only through `create_public_order(jsonb)`, which validates the PO window, product availability, variant ownership, size ownership, quantity, and server-side pricing before inserting the order.
- Authenticated admin access is limited by the `is_admin()` server-side check.
- Admin role data is not writable through public table grants.

4. Important notes
- Order prices are copied into `order_items` when the order is created so historical orders are not changed by later catalog edits.
- The pre-order function returns only the reference code and calculated totals needed by the confirmation screen.
- This migration does not create storage buckets or the admin interface yet.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'po_status') THEN
    CREATE TYPE po_status AS ENUM ('draft', 'open', 'closed', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending_confirmation', 'confirmed', 'in_production', 'completed', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric(12,2) CHECK (price >= 0),
  category text NOT NULL DEFAULT 'uncategorized',
  status product_status NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  is_available_for_po boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  is_primary boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_path text,
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, name)
);

CREATE TABLE IF NOT EXISTS product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_adjustment numeric(12,2) NOT NULL DEFAULT 0 CHECK (price_adjustment >= 0),
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, name)
);

CREATE TABLE IF NOT EXISTS po_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status po_status NOT NULL DEFAULT 'draft',
  additional_information text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  phone_number text NOT NULL,
  class_name text NOT NULL,
  school_name text NOT NULL,
  notes text NOT NULL DEFAULT '',
  po_period_id uuid NOT NULL REFERENCES po_periods(id),
  status order_status NOT NULL DEFAULT 'pending_confirmation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid NOT NULL REFERENCES product_variants(id),
  size_id uuid NOT NULL REFERENCES product_sizes(id),
  product_name text NOT NULL,
  variant_name text NOT NULL,
  size_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0 AND quantity <= 20),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  subtotal numeric(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  photo_path text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  image_path text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL UNIQUE,
  content_value text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_public_order_idx ON products (status, is_available_for_po, sort_order);
CREATE INDEX IF NOT EXISTS product_images_product_order_idx ON product_images (product_id, sort_order);
CREATE INDEX IF NOT EXISTS product_variants_product_order_idx ON product_variants (product_id, sort_order);
CREATE INDEX IF NOT EXISTS product_sizes_product_order_idx ON product_sizes (product_id, sort_order);
CREATE INDEX IF NOT EXISTS po_periods_status_dates_idx ON po_periods (status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS gallery_public_order_idx ON gallery (is_visible, sort_order);
CREATE INDEX IF NOT EXISTS faqs_public_order_idx ON faqs (is_visible, category, sort_order);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS po_periods_set_updated_at ON po_periods;
CREATE TRIGGER po_periods_set_updated_at BEFORE UPDATE ON po_periods FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS orders_set_updated_at ON orders;
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS team_members_set_updated_at ON team_members;
CREATE TRIGGER team_members_set_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS gallery_set_updated_at ON gallery;
CREATE TRIGGER gallery_set_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION set_updated_at();
DROP TRIGGER IF EXISTS faqs_set_updated_at ON faqs;
CREATE TRIGGER faqs_set_updated_at BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION is_admin()
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

CREATE OR REPLACE FUNCTION create_public_order(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_product products%ROWTYPE;
  v_variant product_variants%ROWTYPE;
  v_size product_sizes%ROWTYPE;
  v_period po_periods%ROWTYPE;
  v_order_id uuid;
  v_reference text;
  v_quantity integer;
  v_unit_price numeric(12,2);
  v_subtotal numeric(12,2);
  v_customer_name text := btrim(COALESCE(payload->>'customer_name', ''));
  v_phone_number text := btrim(COALESCE(payload->>'phone_number', ''));
  v_class_name text := btrim(COALESCE(payload->>'class_name', ''));
  v_school_name text := btrim(COALESCE(payload->>'school_name', ''));
  v_notes text := btrim(COALESCE(payload->>'notes', ''));
BEGIN
  IF length(v_customer_name) < 2 OR length(v_customer_name) > 120 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;
  IF v_phone_number !~ '^[+]?[0-9][0-9 .-]{7,18}$' THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  IF length(v_class_name) < 1 OR length(v_class_name) > 80 THEN
    RAISE EXCEPTION 'Invalid class';
  END IF;
  IF length(v_school_name) < 2 OR length(v_school_name) > 160 THEN
    RAISE EXCEPTION 'Invalid school';
  END IF;
  IF length(v_notes) > 1000 THEN
    RAISE EXCEPTION 'Invalid notes';
  END IF;

  v_quantity := (payload->>'quantity')::integer;
  IF v_quantity IS NULL OR v_quantity < 1 OR v_quantity > 20 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  SELECT * INTO v_period FROM po_periods
  WHERE id = (payload->>'po_period_id')::uuid
    AND status = 'open'
    AND now() BETWEEN starts_at AND ends_at
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PO period is not active';
  END IF;

  SELECT * INTO v_product FROM products
  WHERE id = (payload->>'product_id')::uuid
    AND status = 'published'
    AND is_available_for_po = true
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product is not available';
  END IF;

  SELECT * INTO v_variant FROM product_variants
  WHERE id = (payload->>'variant_id')::uuid
    AND product_id = v_product.id
    AND is_available = true
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variant is not available';
  END IF;

  SELECT * INTO v_size FROM product_sizes
  WHERE id = (payload->>'size_id')::uuid
    AND product_id = v_product.id
    AND is_available = true
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Size is not available';
  END IF;

  IF v_product.price IS NULL THEN
    RAISE EXCEPTION 'Product price is not configured';
  END IF;

  v_unit_price := v_product.price + v_size.price_adjustment;
  v_subtotal := v_unit_price * v_quantity;
  v_reference := 'PO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  INSERT INTO orders (
    reference_code, customer_name, phone_number, class_name, school_name, notes, po_period_id
  ) VALUES (
    v_reference, v_customer_name, v_phone_number, v_class_name, v_school_name, v_notes, v_period.id
  ) RETURNING id INTO v_order_id;

  INSERT INTO order_items (
    order_id, product_id, variant_id, size_id, product_name, variant_name, size_name, quantity, unit_price, subtotal
  ) VALUES (
    v_order_id, v_product.id, v_variant.id, v_size.id, v_product.name, v_variant.name, v_size.name, v_quantity, v_unit_price, v_subtotal
  );

  RETURN jsonb_build_object(
    'reference_code', v_reference,
    'order_id', v_order_id,
    'quantity', v_quantity,
    'unit_price', v_unit_price,
    'subtotal', v_subtotal,
    'status', 'pending_confirmation'
  );
END;
$$;

REVOKE ALL ON FUNCTION set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION create_public_order(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_public_order(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON products, product_images, product_variants, product_sizes, po_periods, team_members, gallery, faqs, site_content, site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles, products, product_images, product_variants, product_sizes, po_periods, orders, order_items, team_members, gallery, faqs, site_content, site_settings TO authenticated;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "admin_manage_products" ON products;
CREATE POLICY "admin_manage_products" ON products FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.status = 'published'));
DROP POLICY IF EXISTS "admin_manage_product_images" ON product_images;
CREATE POLICY "admin_manage_product_images" ON product_images FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_product_variants" ON product_variants;
CREATE POLICY "public_read_product_variants" ON product_variants FOR SELECT TO anon, authenticated USING (is_available = true AND EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.status = 'published'));
DROP POLICY IF EXISTS "admin_manage_product_variants" ON product_variants;
CREATE POLICY "admin_manage_product_variants" ON product_variants FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_product_sizes" ON product_sizes;
CREATE POLICY "public_read_product_sizes" ON product_sizes FOR SELECT TO anon, authenticated USING (is_available = true AND EXISTS (SELECT 1 FROM products WHERE products.id = product_sizes.product_id AND products.status = 'published'));
DROP POLICY IF EXISTS "admin_manage_product_sizes" ON product_sizes;
CREATE POLICY "admin_manage_product_sizes" ON product_sizes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_po_periods" ON po_periods;
CREATE POLICY "public_read_po_periods" ON po_periods FOR SELECT TO anon, authenticated USING (status = 'open' AND now() BETWEEN starts_at AND ends_at);
DROP POLICY IF EXISTS "admin_manage_po_periods" ON po_periods;
CREATE POLICY "admin_manage_po_periods" ON po_periods FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_team_members" ON team_members;
CREATE POLICY "public_read_team_members" ON team_members FOR SELECT TO anon, authenticated USING (is_visible = true);
DROP POLICY IF EXISTS "admin_manage_team_members" ON team_members;
CREATE POLICY "admin_manage_team_members" ON team_members FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_gallery" ON gallery;
CREATE POLICY "public_read_gallery" ON gallery FOR SELECT TO anon, authenticated USING (is_visible = true);
DROP POLICY IF EXISTS "admin_manage_gallery" ON gallery;
CREATE POLICY "admin_manage_gallery" ON gallery FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_faqs" ON faqs;
CREATE POLICY "public_read_faqs" ON faqs FOR SELECT TO anon, authenticated USING (is_visible = true);
DROP POLICY IF EXISTS "admin_manage_faqs" ON faqs;
CREATE POLICY "admin_manage_faqs" ON faqs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_site_content" ON site_content;
CREATE POLICY "public_read_site_content" ON site_content FOR SELECT TO anon, authenticated USING (is_public = true);
DROP POLICY IF EXISTS "admin_manage_site_content" ON site_content;
CREATE POLICY "admin_manage_site_content" ON site_content FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT TO anon, authenticated USING (is_public = true);
DROP POLICY IF EXISTS "admin_manage_site_settings" ON site_settings;
CREATE POLICY "admin_manage_site_settings" ON site_settings FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_read_profiles" ON profiles;
CREATE POLICY "admin_read_profiles" ON profiles FOR SELECT TO authenticated USING (is_admin() OR id = auth.uid());
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items" ON order_items FOR SELECT TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_order_items" ON order_items;
CREATE POLICY "admin_delete_order_items" ON order_items FOR DELETE TO authenticated USING (is_admin());
