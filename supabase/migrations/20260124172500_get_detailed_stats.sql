-- Function to get detailed real-time database statistics
-- Returns JSON with connection counts, cache ratios, and table sizes
CREATE OR REPLACE FUNCTION get_detailed_db_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to access pg_stat views
AS $$
DECLARE
  result json;
  total_connections integer;
  cache_hit_ratio numeric;
  table_sizes json;
  index_usage numeric;
BEGIN
  -- 1. Active Connections
  SELECT count(*) INTO total_connections
  FROM pg_stat_activity
  WHERE datname = current_database();

  -- 2. Cache Hit Ratio
  SELECT 
    CASE WHEN (blks_hit + blks_read) > 0 
    THEN round((blks_hit::numeric / (blks_hit + blks_read)::numeric) * 100, 2)
    ELSE 0 END INTO cache_hit_ratio
  FROM pg_stat_database
  WHERE datname = current_database();

  -- 3. Table Sizes (Top 20 public tables)
  SELECT json_agg(t) INTO table_sizes
  FROM (
    SELECT 
      relname as name, 
      pg_total_relation_size(c.oid) as size_bytes,
      pg_size_pretty(pg_total_relation_size(c.oid)) as size_pretty
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' 
      AND c.relkind = 'r' -- Ordinary tables only
    ORDER BY size_bytes DESC
    LIMIT 20
  ) t;

  -- 4. Index Usage Ratio
  SELECT 
    CASE WHEN sum(seq_scan + idx_scan) > 0
    THEN round((sum(idx_scan)::numeric / sum(seq_scan + idx_scan)::numeric) * 100, 2)
    ELSE 0 END INTO index_usage
  FROM pg_stat_user_tables;

  -- Build Result
  result := json_build_object(
    'active_connections', total_connections,
    'cache_hit_ratio', coalesce(cache_hit_ratio, 99),
    'table_sizes', coalesce(table_sizes, '[]'::json),
    'index_usage', coalesce(index_usage, 0)
  );

  RETURN result;
END;
$$;

-- Grant permissions (Safe read-only metrics)
GRANT EXECUTE ON FUNCTION get_detailed_db_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_detailed_db_stats TO anon;
GRANT EXECUTE ON FUNCTION get_detailed_db_stats TO service_role;
