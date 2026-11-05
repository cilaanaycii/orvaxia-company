CREATE OR REPLACE FUNCTION private.can_manage_performance_reviews()
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
      AND role IN ('hrd', 'ceo', 'owner')
  );
$$;

REVOKE ALL ON FUNCTION private.can_manage_performance_reviews() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.can_manage_performance_reviews() TO authenticated;

DROP POLICY IF EXISTS performance_reviews_hrd_read ON public.performance_reviews;
CREATE POLICY performance_reviews_hrd_read
  ON public.performance_reviews FOR SELECT TO authenticated
  USING (private.can_manage_performance_reviews());

DROP POLICY IF EXISTS performance_reviews_hrd_insert ON public.performance_reviews;
CREATE POLICY performance_reviews_hrd_insert
  ON public.performance_reviews FOR INSERT TO authenticated
  WITH CHECK (
    private.can_manage_performance_reviews()
    AND reviewer_id = auth.uid()
  );
