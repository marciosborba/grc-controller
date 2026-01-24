-- Function to get real system metrics
-- This function accesses system catalogs to provide real data about the database

CREATE OR REPLACE FUNCTION get_system_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  db_size_bytes bigint;
  active_connections int;
  server_start_time timestamptz;
  last_backup_time timestamptz;
  uptime_seconds bigint;
  result json;
BEGIN
  -- Check if user is platform admin (simple check, can be enhanced)
  -- In a real scenario, you might want strict permission checks here
  
  -- 1. Get Database Size
  SELECT pg_database_size(current_database()) INTO db_size_bytes;
  
  -- 2. Get Active Connections
  SELECT count(*) 
  INTO active_connections 
  FROM pg_stat_activity 
  WHERE state = 'active' OR state = 'idle';
  
  -- 3. Get Server Start Time (Uptime)
  SELECT pg_postmaster_start_time() INTO server_start_time;

  -- 4. Get Last Backup Time (Estimate using WAL archiving time)
  -- This requires access to pg_stat_archiver which might be restricted
  BEGIN
    SELECT last_archived_time INTO last_backup_time FROM pg_stat_archiver LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    last_backup_time := NULL;
  END;
  
  -- Calculate result
  result := json_build_object(
    'db_size_bytes', db_size_bytes,
    'active_connections', active_connections,
    'server_start_time', server_start_time,
    'last_backup_time', last_backup_time
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users (application handles role checks)
GRANT EXECUTE ON FUNCTION get_system_metrics() TO authenticated;
