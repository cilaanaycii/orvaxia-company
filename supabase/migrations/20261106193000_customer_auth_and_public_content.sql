ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'about',
  ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

UPDATE public.site_content
SET
  slug = COALESCE(slug, content_key),
  category = CASE
    WHEN content_key LIKE 'home%' THEN 'home'
    WHEN content_key LIKE 'contact%' THEN 'contact'
    WHEN content_key LIKE 'shop%' THEN 'shop'
    WHEN content_key LIKE 'announcement%' THEN 'announcement'
    ELSE 'about'
  END,
  title = CASE WHEN title = '' THEN content_key ELSE title END,
  body = CASE WHEN body = '' THEN content_value ELSE body END,
  status = CASE WHEN is_public THEN 'published' ELSE 'draft' END,
  published_at = CASE WHEN is_public THEN COALESCE(published_at, updated_at, now()) ELSE NULL END;

ALTER TABLE public.site_content ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS site_content_slug_unique_idx ON public.site_content (slug);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_content_category_check') THEN
    ALTER TABLE public.site_content
      ADD CONSTRAINT site_content_category_check
      CHECK (category IN ('home', 'about', 'contact', 'shop', 'announcement'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_content_status_check') THEN
    ALTER TABLE public.site_content
      ADD CONSTRAINT site_content_status_check
      CHECK (status IN ('draft', 'published'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_content_published_at_check') THEN
    ALTER TABLE public.site_content
      ADD CONSTRAINT site_content_published_at_check
      CHECK (status <> 'published' OR published_at IS NOT NULL);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS site_content_published_idx
  ON public.site_content (category, published_at DESC)
  WHERE status = 'published';

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_content FROM anon, authenticated;
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;

DO $$
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'site_content'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.site_content', policy_name);
  END LOOP;
END;
$$;

CREATE POLICY site_content_public_read
  ON public.site_content FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY site_content_staff_read
  ON public.site_content FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'ceo', 'pr')
    )
  );

CREATE POLICY site_content_pr_insert
  ON public.site_content FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND updated_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'ceo', 'pr')
    )
  );

CREATE POLICY site_content_pr_update
  ON public.site_content FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'ceo', 'pr')
    )
  )
  WITH CHECK (
    updated_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'ceo', 'pr')
    )
  );

CREATE TABLE IF NOT EXISTS public.site_content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.site_content(id) ON DELETE CASCADE,
  editor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content_revisions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_content_revisions FROM anon, authenticated;
GRANT SELECT ON public.site_content_revisions TO authenticated;

CREATE POLICY site_content_revisions_editor_read
  ON public.site_content_revisions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'ceo', 'pr')
    )
  );

CREATE OR REPLACE FUNCTION private.record_site_content_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.site_content_revisions (content_id, editor_id, title, body, status)
  VALUES (OLD.id, COALESCE(auth.uid(), NEW.updated_by), OLD.title, OLD.body, OLD.status);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.record_site_content_revision() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS site_content_revision_before_update ON public.site_content;
CREATE TRIGGER site_content_revision_before_update
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION private.record_site_content_revision();

CREATE OR REPLACE FUNCTION private.create_crew_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  is_customer boolean := NEW.raw_user_meta_data->>'account_type' = 'customer';
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, status, division, position)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    CASE WHEN is_customer THEN 'customer' ELSE 'member' END,
    CASE WHEN is_customer THEN 'active' ELSE 'pending_approval' END,
    CASE WHEN is_customer THEN NULL ELSE NULLIF(NEW.raw_user_meta_data->>'division', '') END,
    CASE
      WHEN is_customer THEN 'Customer'
      ELSE COALESCE(NULLIF(NEW.raw_user_meta_data->>'position', ''), 'Crew Baru (Pending)')
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = now();

  RETURN NEW;
END;
$$;

ALTER TABLE public.company_orders
  ADD COLUMN IF NOT EXISTS customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS idempotency_key uuid;

CREATE UNIQUE INDEX IF NOT EXISTS company_orders_customer_idempotency_unique_idx
  ON public.company_orders (customer_id, idempotency_key)
  WHERE customer_id IS NOT NULL AND idempotency_key IS NOT NULL;

CREATE POLICY company_orders_customer_read
  ON public.company_orders FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'customer'
        AND status = 'active'
    )
  );

CREATE POLICY company_order_events_customer_read
  ON public.company_order_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.company_orders
      WHERE company_orders.id = company_order_events.order_id
        AND company_orders.customer_id = auth.uid()
    )
  );

GRANT SELECT ON public.company_order_events TO authenticated;
