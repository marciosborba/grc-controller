-- Function to get the real database size securely (Returning JSON to avoid BigInt issues)
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object('size', pg_database_size(current_database()));
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_database_size TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_size TO service_role;
