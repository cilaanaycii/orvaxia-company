ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS position text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS division text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Aktif',
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS class_name text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS profile_visible boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS team_members_public_read_active ON public.team_members;
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;
CREATE POLICY team_members_public_read_active
  ON public.team_members FOR SELECT TO anon, authenticated
  USING (status = 'Aktif' AND profile_visible = true);

DROP POLICY IF EXISTS team_members_executive_read_all ON public.team_members;
CREATE POLICY team_members_executive_read_all
  ON public.team_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'ceo')
    )
  );
