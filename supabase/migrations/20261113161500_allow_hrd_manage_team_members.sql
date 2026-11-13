-- Migration: 20261113161500_allow_hrd_manage_team_members.sql
-- Tujuan: Memberikan hak akses penuh (INSERT, UPDATE, DELETE) pada tabel public.team_members
--         kepada role HRD bersama Owner dan CEO, tanpa mengorbankan keamanan RLS.
--
-- Pola Keamanan:
--   1. Mengikuti standar hardening private.is_executive() (20261107010000_fix_profiles_rls_infinite_recursion.sql).
--   2. Menggunakan fungsi PL/pgSQL STABLE SECURITY DEFINER dengan SET search_path = ''
--      untuk mencegah inlining query planner PostgreSQL yang dapat memicu infinite recursion (error 42P17).
--   3. Memverifikasi status = 'active' dan role IN ('owner', 'ceo', 'hrd').
--   4. Fungsi private.is_executive() TIDAK diubah atau dihapus karena tetap digunakan oleh modul eksekutif lain.
--   5. Memperbarui policy mutasi pada public.team_members agar menggunakan fungsi baru ini.

CREATE SCHEMA IF NOT EXISTS private;

-- 1. Fungsi verifikasi otorisasi pengelola anggota tim (Owner, CEO, HRD)
CREATE OR REPLACE FUNCTION private.can_manage_team_members()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_authorized boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'ceo', 'hrd')
      AND status = 'active'
  ) INTO is_authorized;

  RETURN COALESCE(is_authorized, false);
END;
$$;

-- 2. Hak akses fungsi
REVOKE ALL ON FUNCTION private.can_manage_team_members() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_manage_team_members() TO authenticated;

-- 3. Kebijakan RLS mutasi tabel public.team_members
DROP POLICY IF EXISTS team_members_executive_manage ON public.team_members;
DROP POLICY IF EXISTS team_members_authorized_manage ON public.team_members;

CREATE POLICY team_members_authorized_manage
  ON public.team_members FOR ALL TO authenticated
  USING (private.can_manage_team_members())
  WITH CHECK (private.can_manage_team_members());
