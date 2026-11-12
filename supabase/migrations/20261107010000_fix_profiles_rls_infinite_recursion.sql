-- Migration: 20261107010000_fix_profiles_rls_infinite_recursion.sql
-- Tujuan: Memperbaiki infinite recursion (PostgreSQL error 42P17) pada RLS public.profiles.
-- Masalah sebelumnya:
--   Fungsi private.is_executive() menggunakan LANGUAGE sql STABLE.
--   PostgreSQL query planner melakukan inlining fungsi ke query pemanggil (authenticated).
--   Inlining ini menghilangkan konteks SECURITY DEFINER saat query planner menyatukan AST,
--   sehingga query internal ke public.profiles kembali dievaluasi oleh RLS policy profiles
--   secara terus-menerus hingga memicu error 42P17.
-- Perbaikan:
--   1. Mengubah implementasi private.is_executive() menjadi LANGUAGE plpgsql STABLE SECURITY DEFINER.
--      Fungsi PL/pgSQL bersifat opaque (tidak di-inline oleh query planner),
--      sehingga dieksekusi secara terisolasi dengan hak database owner (postgres) yang mem-bypass RLS
--      pada pembacaan internal tabel profiles tanpa memicu RLS rekursif.
--   2. Menggunakan SET search_path = '' (empty search path) sebagai praktik hardening keamanan
--      terbaik untuk fungsi SECURITY DEFINER, dengan seluruh objek dan fungsi direferensikan
--      secara eksplisit menggunakan schema berkualifikasi penuh (public.profiles, auth.uid()).

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_executive()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_exec boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'ceo')
      AND status = 'active'
  ) INTO is_exec;

  RETURN COALESCE(is_exec, false);
END;
$$;

REVOKE ALL ON FUNCTION private.is_executive() FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_executive() TO authenticated;
