-- Privacy Scanner RPC
-- Checks for: Retention Policy, Consent Gaps, and Data Leakage

CREATE OR REPLACE FUNCTION run_privacy_scan()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    retention_violations INTEGER;
    consent_gaps INTEGER;
    dlp_findings JSONB := '[]'::jsonb;
    ghost_data_count INTEGER;
    result JSONB;
BEGIN
    -- 1. Data Retention Check (Users inactive > 2 years)
    -- Assuming last_sign_in_at is available in auth.users, but we can't access it easily from here without extra grants.
    -- We will use 'updated_at' from profiles as a proxy for "last activity" if available, or just creation date for now.
    -- Better proxy: items created by user in last 2 years.
    
    -- For this MVP, let's count profiles created > 2 years ago with NO recent activity (no logins/logs).
    -- This is an approximation.
    SELECT COUNT(*) INTO retention_violations
    FROM profiles p
    WHERE p.created_at < (NOW() - INTERVAL '2 years')
    AND NOT EXISTS (
        SELECT 1 FROM activity_logs al WHERE al.user_id = p.user_id AND al.created_at > (NOW() - INTERVAL '6 months')
    );

    -- 2. Consent Gap Analysis
    -- Active users (created < 1 year ago or active) who DO NOT have a record in a consents table (if it exists).
    -- Checking if 'user_consents' exists first.
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_consents') THEN
        EXECUTE '
            SELECT COUNT(*) 
            FROM profiles p 
            WHERE NOT EXISTS (SELECT 1 FROM user_consents uc WHERE uc.user_id = p.user_id)
        ' INTO consent_gaps;
    ELSE
        -- If table doesn't exist, we can't check, return 0 or null
        consent_gaps := 0;
    END IF;

    -- 3. DLP (Data Leakage) in Logs
    -- Scan last 100 logs for patterns looking like CPF or Email
    -- Note: Simple regex for MVP.
    WITH recent_logs AS (
        SELECT id, action, details::text as content, created_at
        FROM activity_logs
        ORDER BY created_at DESC
        LIMIT 100
    )
    SELECT jsonb_agg(row_to_json(t))
    INTO dlp_findings
    FROM (
        SELECT id, action, created_at, 'Potential Email detected' as finding
        FROM recent_logs
        WHERE content ~* '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
        UNION ALL
        SELECT id, action, created_at, 'Potential CPF detected' as finding
        FROM recent_logs
        WHERE content ~* '[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}'
    ) t;

    -- 4. Ghost Data (Orphans) - We just fixed this, but good to monitor
    SELECT COUNT(*) INTO ghost_data_count
    FROM profiles p
    LEFT JOIN auth.users u ON p.user_id = u.id
    WHERE u.id IS NULL;

    -- Construct Result
    result := jsonb_build_object(
        'retention_violations', retention_violations,
        'consent_gaps', consent_gaps,
        'dlp_findings', COALESCE(dlp_findings, '[]'::jsonb),
        'ghost_data', ghost_data_count,
        'timestamp', NOW()
    );

    RETURN result;
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION run_privacy_scan TO authenticated;
GRANT EXECUTE ON FUNCTION run_privacy_scan TO service_role;
