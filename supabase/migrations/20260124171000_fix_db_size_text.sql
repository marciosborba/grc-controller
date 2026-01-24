-- Drop previous function again to allow return type change
DROP FUNCTION IF EXISTS get_database_size();

-- Function to get the real database size securely (Returning TEXT to avoid serialization issues)
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pg_database_size(current_database())::text;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_database_size TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_size TO service_role;
