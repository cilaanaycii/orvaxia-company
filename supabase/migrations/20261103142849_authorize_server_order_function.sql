/*
# Authorize only the server for public order creation

1. Purpose
- Keeps `create_public_order(jsonb)` available to the trusted Edge Function through the Supabase RPC interface.
- Prevents anonymous and normal authenticated browser sessions from executing the function directly.

2. Security changes
- The function is executable only by `service_role`.
- Browser roles retain no direct execution privilege.
- The Edge Function remains the public HTTP boundary and returns generic errors.
*/

ALTER FUNCTION private.create_public_order(jsonb) SET SCHEMA public;
REVOKE ALL ON FUNCTION public.create_public_order(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_public_order(jsonb) TO service_role;
