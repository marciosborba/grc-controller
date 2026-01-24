-- Function to get the real database size
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pg_database_size(current_database());
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_database_size TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_size TO service_role;
