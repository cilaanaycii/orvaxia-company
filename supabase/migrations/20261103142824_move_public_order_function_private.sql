/*
# Move public order creation behind a private database schema

1. Purpose
- Removes the SECURITY DEFINER order function from the public API schema.
- Keeps validated order creation available to a trusted server-side Edge Function.

2. Security changes
- `private.create_public_order(jsonb)` is callable only by `service_role`.
- Anonymous and authenticated browser sessions cannot call the database function directly through the Data API.
- The future Edge Function remains responsible for CORS, request parsing, and generic error responses before calling the private function.
*/

ALTER FUNCTION public.create_public_order(jsonb) SET SCHEMA private;

REVOKE ALL ON FUNCTION private.create_public_order(jsonb) FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT EXECUTE ON FUNCTION private.create_public_order(jsonb) TO service_role;
