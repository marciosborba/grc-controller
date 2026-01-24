-- Security Audit RPC
-- Checks RLS enable status for all tables and counts privileged users
CREATE OR REPLACE FUNCTION get_security_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tables_without_rls text[];
  total_tables integer;
  tables_with_rls integer;
  admin_count integer;
  total_users integer;
  mfa_enabled_count integer;
  result json;
BEGIN
  -- 1. Check RLS Status
  SELECT 
    array_agg(relname),
    count(*),
    count(*) filter (where relrowsecurity = true)
  INTO tables_without_rls, total_tables, tables_with_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' 
    AND c.relkind = 'r'
    AND c.relrowsecurity = false; -- Get tables WITHOUT RLS

  -- 2. User & Security Stats (Accessing auth schema via Security Definer)
  SELECT count(*) INTO total_users FROM auth.users;

  SELECT count(DISTINCT user_id) INTO mfa_enabled_count 
  FROM auth.mfa_factors 
  WHERE status = 'verified';

  SELECT count(*) INTO admin_count
  FROM public.user_roles 
  WHERE role IN ('admin', 'super_admin');

  result := json_build_object(
    'tables_without_rls', coalesce(tables_without_rls, ARRAY[]::text[]),
    'total_tables', total_tables,
    'tables_with_rls', tables_with_rls,
    'rls_coverage_pct', round((coalesce(tables_with_rls, 0)::numeric / nullif(total_tables, 0)::numeric) * 100, 1),
    'admin_count', coalesce(admin_count, 0),
    'total_users', coalesce(total_users, 0),
    'users_with_mfa', coalesce(mfa_enabled_count, 0)
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_security_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_security_stats TO service_role;
