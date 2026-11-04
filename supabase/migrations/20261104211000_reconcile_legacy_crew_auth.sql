CREATE SCHEMA IF NOT EXISTS private;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending_approval',
  ADD COLUMN IF NOT EXISTS division text,
  ADD COLUMN IF NOT EXISTS position text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.profiles
  ALTER COLUMN role DROP DEFAULT;

DO $$
DECLARE
  constraint_record record;
BEGIN
  FOR constraint_record IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', constraint_record.conname);
  END LOOP;
END;
$$;

ALTER TABLE public.profiles
  ALTER COLUMN role TYPE text USING role::text,
  ALTER COLUMN role SET DEFAULT 'member',
  ALTER COLUMN status TYPE text USING status::text;

UPDATE public.profiles AS profile
SET
  email = COALESCE(auth_user.email, profile.email, profile.id::text),
  full_name = COALESCE(NULLIF(profile.full_name, ''), to_jsonb(profile)->>'display_name', ''),
  role = CASE
    WHEN profile.role IN ('owner', 'ceo', 'production', 'sales', 'marketing', 'hrd', 'finance', 'pr', 'member', 'customer')
      THEN profile.role
    ELSE 'member'
  END,
  status = CASE
    WHEN profile.role IN ('owner', 'ceo') THEN 'active'
    WHEN profile.status IN ('pending_approval', 'active', 'suspended', 'inactive') THEN profile.status
    ELSE 'pending_approval'
  END,
  updated_at = now()
FROM auth.users AS auth_user
WHERE auth_user.id = profile.id;

UPDATE public.profiles
SET
  email = COALESCE(email, id::text),
  full_name = COALESCE(NULLIF(full_name, ''), to_jsonb(profiles)->>'display_name', ''),
  role = CASE
    WHEN role IN ('owner', 'ceo', 'production', 'sales', 'marketing', 'hrd', 'finance', 'pr', 'member', 'customer')
      THEN role
    ELSE 'member'
  END,
  status = CASE
    WHEN role IN ('owner', 'ceo') THEN 'active'
    WHEN status IN ('pending_approval', 'active', 'suspended', 'inactive') THEN status
    ELSE 'pending_approval'
  END,
  updated_at = now();

INSERT INTO public.profiles (id, email, full_name, phone, role, status)
SELECT
  auth_user.id,
  COALESCE(auth_user.email, auth_user.id::text),
  COALESCE(auth_user.raw_user_meta_data->>'full_name', ''),
  COALESCE(auth_user.raw_user_meta_data->>'phone', ''),
  'member',
  'pending_approval'
FROM auth.users AS auth_user
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.profiles
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'pending_approval';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check,
  DROP CONSTRAINT IF EXISTS profiles_status_check,
  ADD CONSTRAINT profiles_role_check CHECK (
    role IN ('owner', 'ceo', 'production', 'sales', 'marketing', 'hrd', 'finance', 'pr', 'member', 'customer')
  ),
  ADD CONSTRAINT profiles_status_check CHECK (
    status IN ('pending_approval', 'active', 'suspended', 'inactive')
  );

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_unique_idx
  ON public.profiles (lower(email));

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS position text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS division text NOT NULL DEFAULT 'Belum ditentukan',
  ADD COLUMN IF NOT EXISTS responsibilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Tidak Aktif',
  ADD COLUMN IF NOT EXISTS avatar_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text;

UPDATE public.team_members
SET
  position = COALESCE(NULLIF(position, ''), to_jsonb(team_members)->>'role', ''),
  avatar_url = COALESCE(NULLIF(avatar_url, ''), to_jsonb(team_members)->>'photo', ''),
  status = CASE
    WHEN COALESCE((to_jsonb(team_members)->>'is_visible')::boolean, false) THEN 'Aktif'
    ELSE 'Tidak Aktif'
  END;

CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  member_name text NOT NULL,
  member_division text NOT NULL,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
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

ALTER TABLE public.performance_reviews
  ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.crew_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  division text NOT NULL,
  assigned_to_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to_name text,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  deadline date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION private.is_executive()
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
      AND role IN ('owner', 'ceo')
      AND status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION private.is_executive() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_executive() TO authenticated;

CREATE OR REPLACE FUNCTION private.create_crew_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, status, division, position)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'member',
    'pending_approval',
    NULLIF(NEW.raw_user_meta_data->>'division', ''),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'position', ''), 'Crew Baru (Pending)')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = now();

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.create_crew_profile() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS create_crew_profile_after_auth_insert ON auth.users;
CREATE TRIGGER create_crew_profile_after_auth_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.create_crew_profile();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_tasks ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'team_members', 'performance_reviews', 'crew_tasks')
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END;
$$;

REVOKE ALL ON public.profiles, public.team_members, public.performance_reviews, public.crew_tasks FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_reviews TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.crew_tasks TO authenticated;
GRANT UPDATE (status) ON public.crew_tasks TO authenticated;

CREATE POLICY profiles_read_self_or_executive
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR private.is_executive());
CREATE POLICY profiles_executive_manage
  ON public.profiles FOR ALL TO authenticated
  USING (private.is_executive())
  WITH CHECK (private.is_executive());

CREATE POLICY team_members_public_read_active
  ON public.team_members FOR SELECT TO anon, authenticated
  USING (status = 'Aktif');
CREATE POLICY team_members_executive_manage
  ON public.team_members FOR ALL TO authenticated
  USING (private.is_executive())
  WITH CHECK (private.is_executive());

CREATE POLICY performance_reviews_executive_manage
  ON public.performance_reviews FOR ALL TO authenticated
  USING (private.is_executive())
  WITH CHECK (private.is_executive());

CREATE POLICY crew_tasks_read_assigned_or_executive
  ON public.crew_tasks FOR SELECT TO authenticated
  USING (assigned_to_id = auth.uid() OR private.is_executive());
CREATE POLICY crew_tasks_insert_self_or_executive
  ON public.crew_tasks FOR INSERT TO authenticated
  WITH CHECK (assigned_to_id = auth.uid() OR private.is_executive());
CREATE POLICY crew_tasks_update_status_self_or_executive
  ON public.crew_tasks FOR UPDATE TO authenticated
  USING (assigned_to_id = auth.uid() OR private.is_executive())
  WITH CHECK (assigned_to_id = auth.uid() OR private.is_executive());
CREATE POLICY crew_tasks_delete_executive
  ON public.crew_tasks FOR DELETE TO authenticated
  USING (private.is_executive());
