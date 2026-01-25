-- Update Privacy Scanner to be more rigorous
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
    total_users INTEGER;
    result JSONB;
BEGIN
    -- 0. Get total users for context
    SELECT COUNT(*) INTO total_users FROM profiles;

    -- 1. Data Retention Check (Stricter: Users created > 1 year ago with no recent activity)
    SELECT COUNT(*) INTO retention_violations
    FROM profiles p
    WHERE p.created_at < (NOW() - INTERVAL '1 year')
    AND NOT EXISTS (
        SELECT 1 FROM activity_logs al WHERE al.user_id = p.user_id AND al.created_at > (NOW() - INTERVAL '3 months')
    );

    -- 2. Consent Gap Analysis (Fail-safe)
    -- If 'user_consents' table does NOT exist, ALL users are potential gaps.
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_consents') THEN
        EXECUTE '
            SELECT COUNT(*) 
            FROM profiles p 
            WHERE NOT EXISTS (SELECT 1 FROM user_consents uc WHERE uc.user_id = p.user_id)
        ' INTO consent_gaps;
    ELSE
        -- If table doesn't exist, ALL users are non-compliant
        consent_gaps := total_users;
    END IF;

    -- 3. DLP (Data Leakage) in Logs
    -- Scan last 100 logs for patterns looking like CPF or Email
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

    -- 4. Ghost Data (Orphans)
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
        'total_users', total_users,
        'timestamp', NOW()
    );

    RETURN result;
END;
$$;
