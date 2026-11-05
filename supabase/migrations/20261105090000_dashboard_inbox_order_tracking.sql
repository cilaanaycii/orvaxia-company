CREATE TABLE IF NOT EXISTS public.company_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code text NOT NULL UNIQUE,
  phone_hash text NOT NULL,
  details jsonb NOT NULL,
  order_status text NOT NULL DEFAULT 'pending_confirmation'
    CHECK (order_status IN (
      'pending_confirmation', 'payment_verified', 'in_production', 'quality_check',
      'packaging', 'ready_to_ship', 'shipped', 'delivered', 'completed', 'cancelled'
    )),
  payment_status text NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'verified', 'failed', 'refunded')),
  assigned_staff_id text,
  assigned_staff_name text,
  tracking_number text,
  shipping_proof_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.company_order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.company_orders(id) ON DELETE CASCADE,
  order_status text NOT NULL,
  tracking_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS company_orders_created_at_idx
  ON public.company_orders (created_at DESC);
CREATE INDEX IF NOT EXISTS dashboard_notifications_recipient_created_idx
  ON public.dashboard_notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS company_order_events_order_created_idx
  ON public.company_order_events (order_id, created_at);

ALTER TABLE public.company_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_order_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.is_order_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND status = 'active'
      AND role IN ('owner', 'ceo', 'sales', 'production', 'finance')
  );
$$;

REVOKE ALL ON FUNCTION private.is_order_staff() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_order_staff() TO authenticated;

REVOKE ALL ON public.company_orders, public.dashboard_notifications, public.company_order_events
  FROM anon, authenticated;
GRANT SELECT ON public.company_orders TO authenticated;
GRANT UPDATE (order_status, payment_status, assigned_staff_id, assigned_staff_name, tracking_number, shipping_proof_url, updated_at)
  ON public.company_orders TO authenticated;
GRANT SELECT, UPDATE ON public.dashboard_notifications TO authenticated;
GRANT SELECT ON public.company_order_events TO authenticated;
GRANT ALL ON public.company_orders, public.dashboard_notifications, public.company_order_events
  TO service_role;

CREATE POLICY company_orders_staff_read
  ON public.company_orders FOR SELECT TO authenticated
  USING (private.is_order_staff());

CREATE POLICY company_orders_staff_update
  ON public.company_orders FOR UPDATE TO authenticated
  USING (private.is_order_staff())
  WITH CHECK (private.is_order_staff());

CREATE POLICY notifications_read_self
  ON public.dashboard_notifications FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY notifications_update_self
  ON public.dashboard_notifications FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY company_order_events_staff_read
  ON public.company_order_events FOR SELECT TO authenticated
  USING (private.is_order_staff());

CREATE OR REPLACE FUNCTION private.notify_profiles(
  target_roles text[],
  notification_kind text,
  notification_title text,
  notification_message text,
  notification_href text,
  notification_key text,
  target_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.dashboard_notifications
    (recipient_id, kind, title, message, href, dedupe_key)
  SELECT profile.id, notification_kind, notification_title, notification_message,
         notification_href, notification_key
  FROM public.profiles AS profile
  WHERE profile.status = 'active'
    AND (
      (target_user_id IS NOT NULL AND profile.id = target_user_id)
      OR (target_user_id IS NULL AND profile.role = ANY(target_roles))
    )
  ON CONFLICT (recipient_id, dedupe_key) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION private.notify_profiles(text[], text, text, text, text, text, uuid)
  FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.on_company_order_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.company_order_events (order_id, order_status, tracking_number)
    VALUES (NEW.id, NEW.order_status, NEW.tracking_number);

    PERFORM private.notify_profiles(
      ARRAY['owner', 'sales']::text[],
      'order',
      'Pesanan baru',
      'Pesanan ' || NEW.reference_code || ' dari ' || COALESCE(NEW.details->>'customerName', 'pelanggan') || ' masuk.',
      '/dashboard/sales',
      'order-created:' || NEW.id::text
    );
    RETURN NEW;
  END IF;

  IF NEW.order_status IS DISTINCT FROM OLD.order_status
     OR NEW.tracking_number IS DISTINCT FROM OLD.tracking_number THEN
    INSERT INTO public.company_order_events (order_id, order_status, tracking_number)
    VALUES (NEW.id, NEW.order_status, NEW.tracking_number);

    PERFORM private.notify_profiles(
      ARRAY['owner', 'sales']::text[],
      'shipment',
      'Status pesanan diperbarui',
      'Pesanan ' || NEW.reference_code || ' sekarang berstatus ' ||
        replace(NEW.order_status, '_', ' ') ||
        CASE WHEN NEW.tracking_number IS NOT NULL
          THEN ' (resi ' || NEW.tracking_number || ')'
          ELSE ''
        END || '.',
      '/dashboard/sales',
      'order-update:' || NEW.id::text || ':' || NEW.updated_at::text
    );

    IF NEW.assigned_staff_id IS NOT NULL THEN
      PERFORM private.notify_profiles(
        ARRAY[]::text[],
        'shipment',
        'Update pengiriman',
        'Pesanan ' || NEW.reference_code || ' sekarang berstatus ' || replace(NEW.order_status, '_', ' ') || '.',
        '/dashboard/sales',
        'assigned-order-update:' || NEW.id::text || ':' || NEW.updated_at::text,
        CASE
          WHEN NEW.assigned_staff_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          THEN NEW.assigned_staff_id::uuid
          ELSE NULL
        END
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.touch_company_order_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.notify_assigned_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  target_path text;
BEGIN
  IF NEW.assigned_to_id IS NOT NULL AND NEW.status <> 'completed' THEN
    SELECT CASE profile.role
      WHEN 'owner' THEN '/dashboard/owner'
      WHEN 'ceo' THEN '/dashboard/ceo'
      WHEN 'production' THEN '/dashboard/production'
      WHEN 'sales' THEN '/dashboard/sales'
      WHEN 'finance' THEN '/dashboard/finance'
      WHEN 'marketing' THEN '/dashboard/marketing'
      WHEN 'hrd' THEN '/dashboard/hrd'
      WHEN 'pr' THEN '/dashboard/pr'
      ELSE '/dashboard/member'
    END
    INTO target_path
    FROM public.profiles AS profile
    WHERE profile.id = NEW.assigned_to_id;

    PERFORM private.notify_profiles(
      ARRAY[]::text[],
      'task',
      'Tugas baru ditugaskan',
      'Tugas "' || NEW.title || '" jatuh tempo ' || NEW.deadline::text || '.',
      COALESCE(target_path, '/dashboard/member'),
      'task-assigned:' || NEW.id::text,
      NEW.assigned_to_id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_overdue_task_reminders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  inserted_count integer;
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Active crew session required';
  END IF;

  INSERT INTO public.dashboard_notifications
    (recipient_id, kind, title, message, href, dedupe_key)
  SELECT auth.uid(), 'task_reminder', 'Pengingat tugas belum selesai',
         'Tugas "' || task.title || '" sudah melewati tenggat ' || task.deadline::text || '.',
         CASE profile.role
           WHEN 'owner' THEN '/dashboard/owner'
           WHEN 'ceo' THEN '/dashboard/ceo'
           WHEN 'production' THEN '/dashboard/production'
           WHEN 'sales' THEN '/dashboard/sales'
           WHEN 'finance' THEN '/dashboard/finance'
           WHEN 'marketing' THEN '/dashboard/marketing'
           WHEN 'hrd' THEN '/dashboard/hrd'
           WHEN 'pr' THEN '/dashboard/pr'
           ELSE '/dashboard/member'
         END,
         'task-overdue:' || task.id::text || ':' || current_date::text
  FROM public.crew_tasks AS task
  JOIN public.profiles AS profile ON profile.id = task.assigned_to_id
  WHERE task.assigned_to_id = auth.uid()
    AND task.status <> 'completed'
    AND task.deadline < current_date
  ON CONFLICT (recipient_id, dedupe_key) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.create_overdue_task_reminders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_overdue_task_reminders() TO authenticated;

DROP TRIGGER IF EXISTS company_order_notifications ON public.company_orders;
CREATE TRIGGER company_order_notifications
  AFTER INSERT OR UPDATE ON public.company_orders
  FOR EACH ROW EXECUTE FUNCTION private.on_company_order_change();

DROP TRIGGER IF EXISTS company_order_touch_updated_at ON public.company_orders;
CREATE TRIGGER company_order_touch_updated_at
  BEFORE UPDATE ON public.company_orders
  FOR EACH ROW EXECUTE FUNCTION private.touch_company_order_updated_at();

DROP TRIGGER IF EXISTS assigned_task_notification ON public.crew_tasks;
CREATE TRIGGER assigned_task_notification
  AFTER INSERT ON public.crew_tasks
  FOR EACH ROW EXECUTE FUNCTION private.notify_assigned_task();
