ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS class_name text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS profile_visible boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS team_members_public_read_active ON public.team_members;
DROP POLICY IF EXISTS "Public can view active team members" ON public.team_members;
CREATE POLICY team_members_public_read_active
  ON public.team_members FOR SELECT TO anon, authenticated
  USING (status = 'Aktif' AND profile_visible = true);
