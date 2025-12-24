-- Create a view 'users' in public schema that mirrors 'profiles'
-- This resolves issues where the application expects a 'users' table/view to exist in public schema
-- We map profile.user_id to user.id to match Auth ID referencing

DROP VIEW IF EXISTS "public"."users";

CREATE VIEW "public"."users" AS
SELECT
  user_id AS id, -- Critical: This maps back to auth.uid()
  email,
  full_name,
  avatar_url,
  created_at,
  updated_at
  -- Add other fields if necessary
FROM "public"."profiles"
WHERE user_id IS NOT NULL;

-- Grant permissions
GRANT SELECT ON "public"."users" TO authenticated;
GRANT SELECT ON "public"."users" TO anon;
GRANT SELECT ON "public"."users" TO service_role;

-- NOTE: RLS is handled by the underlying 'profiles' table.
-- If 'profiles' has RLS, this view will respect it for the current user.
