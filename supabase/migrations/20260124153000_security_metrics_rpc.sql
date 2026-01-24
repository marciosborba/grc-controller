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
    -- 1. MFA Count (Verified factors only)
    SELECT count(DISTINCT user_id) INTO v_mfa_count
    FROM auth.mfa_factors
    WHERE status = 'verified';

    -- 2. Total Users
    SELECT count(*) INTO v_total_users
    FROM auth.users
    WHERE deleted_at IS NULL;

    -- 3. Active Sessions (Source of Truth: auth.sessions table)
    -- This table tracks valid refresh tokens.
    SELECT count(*) INTO v_active_sessions
    FROM auth.sessions
    WHERE (not_after IS NULL OR not_after > now());

    v_result := json_build_object(
        'mfa_count', COALESCE(v_mfa_count, 0),
        'total_users', COALESCE(v_total_users, 0),
        'active_sessions', COALESCE(v_active_sessions, 0)
    );

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION admin_get_security_metrics() TO authenticated, service_role;
