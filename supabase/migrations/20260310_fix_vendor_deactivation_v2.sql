
-- Update the function to be more verbose for debugging
CREATE OR REPLACE FUNCTION toggle_vendor_user_status(
    p_email TEXT,
    p_vendor_id UUID,
    p_is_active BOOLEAN
) RETURNS JSONB AS $$
DECLARE
    v_auth_user_id UUID;
    v_sessions_deleted INTEGER := 0;
    v_result JSONB;
    v_email_norm TEXT := LOWER(TRIM(p_email));
BEGIN
    -- 1. Try to get auth_user_id from vendor_users
    SELECT auth_user_id INTO v_auth_user_id 
    FROM vendor_users 
    WHERE email = v_email_norm 
      AND vendor_id = p_vendor_id;

    -- 2. Update vendor_users
    UPDATE vendor_users 
    SET is_active = p_is_active
    WHERE email = v_email_norm 
      AND vendor_id = p_vendor_id;

    -- 3. Update vendor_portal_users
    UPDATE vendor_portal_users
    SET is_active = p_is_active
    WHERE email = v_email_norm 
      AND vendor_id = p_vendor_id;

    -- 4. If deactivating, terminate sessions
    IF NOT p_is_active AND v_auth_user_id IS NOT NULL THEN
        -- Delete from auth.sessions
        DELETE FROM auth.sessions WHERE user_id = v_auth_user_id;
        GET DIAGNOSTICS v_sessions_deleted = ROW_COUNT;
    END IF;

    v_result := jsonb_build_object(
        'success', true,
        'auth_user_id', v_auth_user_id,
        'is_active', p_is_active,
        'sessions_deleted', v_sessions_deleted,
        'applied_to_email', v_email_norm
    );
    
    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'detail', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
