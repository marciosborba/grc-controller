CREATE OR REPLACE FUNCTION admin_list_active_sessions()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sessions json;
BEGIN
    -- Use a subquery to ensure ORDER BY works before aggregation
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
        ORDER BY s.created_at DESC
    ) t;

    RETURN COALESCE(v_sessions, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION admin_list_active_sessions() TO authenticated, service_role;
