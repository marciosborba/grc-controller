
-- 1. Add is_active column to vendor_portal_users if it doesn't exist
ALTER TABLE vendor_portal_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Create or replace the function to toggle vendor user status and terminate sessions
CREATE OR REPLACE FUNCTION toggle_vendor_user_status(
    p_email TEXT,
    p_vendor_id UUID,
    p_is_active BOOLEAN
) RETURNS JSONB AS $$
DECLARE
    v_auth_user_id UUID;
    v_result JSONB;
BEGIN
    -- Update vendor_users and get auth_user_id
    UPDATE vendor_users 
    SET is_active = p_is_active
    WHERE email = LOWER(TRIM(p_email)) 
      AND vendor_id = p_vendor_id
    RETURNING auth_user_id INTO v_auth_user_id;

    -- Update vendor_portal_users
    UPDATE vendor_portal_users
    SET is_active = p_is_active
    WHERE email = LOWER(TRIM(p_email))
      AND vendor_id = p_vendor_id;

    -- If deactivating and we have an auth_user_id, we need to sign out.
    -- Since we are in SQL and can't call Supabase Admin Auth API directly from here
    -- (unless using pg_net or similar which might not be configured),
    -- we rely on the frontend calling this NOT via RPC but via the Edge Function
    -- OR we can look for a way to invalidate sessions in SQL if possible.
    
    -- NOTE: In Supabase, sessions are managed in auth.sessions.
    -- We can delete sessions for this user to force immediate logout.
    IF NOT p_is_active AND v_auth_user_id IS NOT NULL THEN
        DELETE FROM auth.sessions WHERE user_id = v_auth_user_id;
    END IF;

    v_result := jsonb_build_object(
        'success', true,
        'auth_user_id', v_auth_user_id,
        'is_active', p_is_active
    );
    
    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
