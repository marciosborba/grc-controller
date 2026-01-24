CREATE OR REPLACE FUNCTION admin_get_security_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mfa_count integer;
    v_total_users integer;
    v_active_sessions integer;
    v_result json;
BEGIN
    -- 1. MFA Count
    SELECT count(DISTINCT user_id) INTO v_mfa_count
    FROM auth.mfa_factors
    WHERE status = 'verified';

    -- 2. Total Users
    SELECT count(*) INTO v_total_users
    FROM auth.users
    WHERE deleted_at IS NULL;

    -- 3. Active Sessions (Last 24h Activity only)
    SELECT count(*) INTO v_active_sessions
    FROM auth.sessions
    WHERE (not_after IS NULL OR not_after > now())
    AND updated_at > (now() - interval '24 hours');

    v_result := json_build_object(
        'mfa_count', COALESCE(v_mfa_count, 0),
        'total_users', COALESCE(v_total_users, 0),
        'active_sessions', COALESCE(v_active_sessions, 0)
    );

    RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION admin_list_active_sessions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sessions json;
BEGIN
    SELECT json_agg(t) INTO v_sessions
    FROM (
        SELECT 
            s.id,
            s.user_id,
            s.created_at,
            s.updated_at,
            s.ip,
            s.user_agent,
            u.email,
            COALESCE(p.full_name, u.email) as user_name,
            u.last_sign_in_at
        FROM auth.sessions s
        JOIN auth.users u ON s.user_id = u.id
        LEFT JOIN public.profiles p ON s.user_id = p.user_id
        WHERE (s.not_after IS NULL OR s.not_after > now())
        AND s.updated_at > (now() - interval '24 hours')
        ORDER BY s.updated_at DESC
    ) t;

    RETURN COALESCE(v_sessions, '[]'::json);
END;
$$;
