-- Function to get consolidated GLOBAL system stats for Admin Dashboard
-- Updated to include 'security' resource_type and broader keywords for Failed Logins.

CREATE OR REPLACE FUNCTION admin_get_global_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- System
  db_size_bytes bigint;
  active_connections int;
  server_start_time timestamptz;
  last_backup_time timestamptz;
  
  -- Counts
  total_users_count int;
  active_users_24h_count int;
  total_tenants_count int;
  active_tenants_count int;
  total_assessments_count int;
  total_risks_count int;
  total_policies_count int;
  
  -- Security
  critical_risks_count int;
  pending_assessments_count int;
  security_incidents_count int;
  failed_logins_today_count int;
  suspicious_activities_week_count int;
  overdue_policies_count int;
  vulnerabilities_count int;
  data_breach_attempts_count int;
  
  -- Calculated
  compliance_score int;
  
  now timestamptz := now();
  today timestamptz := date_trunc('day', now);
  week_ago timestamptz := now - interval '7 days';
  month_ago timestamptz := now - interval '30 days';

BEGIN
  -- 1. System Stats (Catalog)
  SELECT pg_database_size(current_database()) INTO db_size_bytes;
  
  SELECT count(*) INTO active_connections 
  FROM pg_stat_activity 
  WHERE state = 'active' OR state = 'idle';
  
  SELECT pg_postmaster_start_time() INTO server_start_time;
  
  BEGIN
    SELECT last_archived_time INTO last_backup_time FROM pg_stat_archiver LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    last_backup_time := NULL;
  END;

  -- 2. General Global Counts (All Tenants)
  SELECT count(*) INTO total_users_count FROM profiles;
  
  -- Active Users (24h)
  SELECT count(DISTINCT (payload->>'actor_id')::uuid)
  INTO active_users_24h_count
  FROM auth.audit_log_entries
  WHERE created_at >= (now - interval '24 hours')
    AND payload->>'action' IN ('login', 'login_success');

  IF active_users_24h_count = 0 THEN
      SELECT count(DISTINCT user_id) INTO active_users_24h_count
      FROM activity_logs
      WHERE created_at >= today AND action ILIKE '%login%';
  END IF;
  
  SELECT count(*) INTO total_tenants_count FROM tenants;
  
  SELECT count(DISTINCT tenant_id) INTO active_tenants_count
  FROM activity_logs
  WHERE created_at >= month_ago AND tenant_id IS NOT NULL;
  
  -- Risks
  SELECT count(*) INTO total_risks_count FROM risk_registrations;
  
  -- Policies
  SELECT count(*) INTO total_policies_count FROM policies WHERE status = 'active';

  -- 3. Security Metrics (Global)
  
  -- Critical Risks
  SELECT count(*) INTO critical_risks_count
  FROM risk_registrations
  WHERE risk_level IN ('Critical', 'Critical Risk', 'High', 'Crítico', 'Alto')
     OR risk_level ILIKE '%critical%' 
     OR risk_level ILIKE '%crítico%';
  
  -- Assessments
  SELECT count(*) INTO total_assessments_count FROM assessments;
  
  SELECT count(*) INTO pending_assessments_count
  FROM assessments
  WHERE status IN ('in_progress', 'draft', 'pending', 'Em Andamento', 'Rascunho');
  
  -- Security Incidents
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_incidents') THEN
    SELECT count(*) INTO security_incidents_count FROM security_incidents;
  ELSE
    SELECT count(*) INTO security_incidents_count FROM incidents;
  END IF;
  
  -- Failed Logins (Today) - SCOPE WIDENED
  SELECT count(*) INTO failed_logins_today_count
  FROM activity_logs
  WHERE (resource_type = 'auth' OR resource_type = 'security') -- Include security events like rate limits
    AND (
         action ILIKE '%fail%' 
      OR action ILIKE '%denied%' 
      OR action ILIKE '%error%' 
      OR action ILIKE '%rate_limit%' 
      OR action ILIKE '%suspicious%'
      OR action ILIKE '%block%'
    )
    AND created_at >= today;
    
  -- Suspicious Activities (Week)
  SELECT count(*) INTO suspicious_activities_week_count
  FROM activity_logs
  WHERE created_at >= week_ago
    AND (action ILIKE '%suspicious%' OR action ILIKE '%blocked%' OR action ILIKE '%unauthorized%');
    
  -- Overdue Policies
  SELECT count(*) INTO overdue_policies_count
  FROM policies
  WHERE next_review_date < now AND status = 'active';
  
  -- Vulnerabilities
  SELECT count(*) INTO vulnerabilities_count
  FROM vulnerabilities
  WHERE status IN ('Open', 'In Progress', 'Re-opened', 'Aberto', 'Em Progresso');
  
  -- Data Breach Attempts
  SELECT count(*) INTO data_breach_attempts_count
  FROM activity_logs
  WHERE created_at >= month_ago
    AND (action ILIKE '%breach%' OR action ILIKE '%violation%' OR (details->>'severity')::text = 'critical');
    
  -- Compliance Score
  SELECT round(COALESCE(AVG(percentual_maturidade), 0))
  INTO compliance_score
  FROM assessments
  WHERE status = 'completed' OR status = 'Concluído';
  
  IF compliance_score = 0 OR compliance_score IS NULL THEN
      IF total_assessments_count > 0 THEN
         SELECT round(100.0 * count(*) / total_assessments_count)
         INTO compliance_score
         FROM assessments
         WHERE status = 'completed' OR status = 'Concluído';
      ELSE
         compliance_score := 100; -- Default
      END IF;
  END IF;

  RETURN json_build_object(
    'system', json_build_object(
      'db_size_bytes', db_size_bytes,
      'active_connections', active_connections,
      'server_start_time', server_start_time,
      'last_backup_time', last_backup_time
    ),
    'counts', json_build_object(
      'total_users', total_users_count,
      'active_users_24h', active_users_24h_count,
      'total_tenants', total_tenants_count,
      'active_tenants', active_tenants_count,
      'total_assessments', total_assessments_count,
      'total_risks', total_risks_count,
      'total_policies', total_policies_count
    ),
    'security', json_build_object(
      'critical_risks', critical_risks_count,
      'pending_assessments', pending_assessments_count,
      'security_incidents', security_incidents_count,
      'failed_logins_today', failed_logins_today_count,
      'suspicious_activities_week', suspicious_activities_week_count,
      'overdue_policies', overdue_policies_count,
      'vulnerabilities', vulnerabilities_count,
      'data_breach_attempts', data_breach_attempts_count,
      'compliance_score', compliance_score
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_global_stats() TO authenticated;
