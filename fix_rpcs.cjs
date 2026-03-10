
const { Client } = require('pg');
require('dotenv').config();

const sql = `
CREATE OR REPLACE FUNCTION public.check_is_vendor(check_uid uuid, check_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    is_vendor boolean := false;
BEGIN
    -- Check vendor_users by uid AND is_active
    IF EXISTS (SELECT 1 FROM public.vendor_users WHERE auth_user_id = check_uid AND is_active = true) THEN
        is_vendor := true;
    END IF;
    
    -- Check vendor_portal_users by email AND is_active
    IF NOT is_vendor AND EXISTS (SELECT 1 FROM public.vendor_portal_users WHERE lower(email) = lower(check_email) AND is_active = true) THEN
        is_vendor := true;
    END IF;
    
    RETURN is_vendor;
END;
$function$;

CREATE OR REPLACE FUNCTION public.toggle_vendor_user_status(p_email text, p_vendor_id uuid, p_is_active boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_auth_user_id UUID;
    v_sessions_deleted INTEGER := 0;
    v_result JSONB;
    v_email_norm TEXT := LOWER(TRIM(p_email));
BEGIN
    -- 1. Try to get auth_user_id from vendor_users
    SELECT auth_user_id INTO v_auth_user_id 
    FROM vendor_users 
    WHERE lower(email) = v_email_norm 
      AND vendor_id = p_vendor_id;

    -- 2. Fallback: Try to get auth_user_id from auth.users directly by email
    IF v_auth_user_id IS NULL THEN
        SELECT id INTO v_auth_user_id
        FROM auth.users
        WHERE lower(email) = v_email_norm;
    END IF;

    -- 3. Update vendor_users if exists
    UPDATE vendor_users 
    SET is_active = p_is_active
    WHERE lower(email) = v_email_norm 
      AND vendor_id = p_vendor_id;

    -- 4. Update vendor_portal_users
    UPDATE vendor_portal_users
    SET is_active = p_is_active
    WHERE lower(email) = v_email_norm 
      AND vendor_id = p_vendor_id;

    -- 5. If deactivating, terminate sessions
    IF NOT p_is_active AND v_auth_user_id IS NOT NULL THEN
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
$function$;
`;

async function apply() {
    const client = new Client({
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query(sql);
        console.log('✅ RPCs updated successfully.');
        await client.end();
    } catch (err) {
        console.error('❌ Error updating RPCs:', err.message);
        process.exit(1);
    }
}

apply();
