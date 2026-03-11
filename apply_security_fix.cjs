
const { Client } = require('pg');
require('dotenv').config();

const sql = `
-- 1. Create unified deactivation RPC
CREATE OR REPLACE FUNCTION public.toggle_user_active_status(
    p_user_id uuid DEFAULT NULL,
    p_email text DEFAULT NULL,
    p_active boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
    v_user_id uuid := p_user_id;
    v_email text := p_email;
BEGIN
    -- 1. Cross-lookup to ensure we have both ID and Email
    IF v_user_id IS NULL AND v_email IS NOT NULL THEN
        SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    END IF;

    IF v_email IS NULL AND v_user_id IS NOT NULL THEN
        SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
    END IF;

    -- 2. Update Profiles (if ID available)
    IF v_user_id IS NOT NULL THEN
        UPDATE public.profiles 
        SET is_active = p_active 
        WHERE user_id = v_user_id;
        
        -- Update Vendor Users (by ID)
        UPDATE public.vendor_users 
        SET is_active = p_active 
        WHERE auth_user_id = v_user_id;
    END IF;

    -- 3. Update Vendor Portal Users (by Email if available)
    IF v_email IS NOT NULL THEN
        UPDATE public.vendor_portal_users 
        SET is_active = p_active 
        WHERE email = v_email;
        
        -- If ID still null, try to find it via profiles (backup)
        IF v_user_id IS NULL THEN
            SELECT user_id INTO v_user_id FROM public.profiles WHERE email = v_email;
        END IF;
    END IF;

    -- 4. IF DEACTIVATING: Forcefully Delete all sessions
    IF p_active = false AND v_user_id IS NOT NULL THEN
        DELETE FROM auth.sessions WHERE user_id = v_user_id;
    END IF;
END;
$$;

-- 2. Refactor check_is_vendor to return status text
DROP FUNCTION IF EXISTS public.check_is_vendor(uuid, text);
CREATE OR REPLACE FUNCTION public.check_is_vendor(
    check_uid uuid DEFAULT NULL,
    check_email text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_active boolean;
    v_uid uuid := check_uid;
    v_email text := check_email;
BEGIN
    -- Cross-lookup if one is missing
    IF v_uid IS NULL AND v_email IS NOT NULL THEN
        SELECT id INTO v_uid FROM auth.users WHERE email = v_email;
    ELSIF v_email IS NULL AND v_uid IS NOT NULL THEN
        SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
    END IF;

    -- Check in vendor_users (by ID priority)
    IF v_uid IS NOT NULL THEN
        SELECT is_active INTO v_active FROM public.vendor_users WHERE auth_user_id = v_uid LIMIT 1;
        IF v_active IS NOT NULL THEN
            RETURN CASE WHEN v_active THEN 'active' ELSE 'inactive' END;
        END IF;
    END IF;

    -- Check in vendor_portal_users (by Email fallback)
    IF v_email IS NOT NULL THEN
        SELECT is_active INTO v_active FROM public.vendor_portal_users WHERE email = v_email LIMIT 1;
        IF v_active IS NOT NULL THEN
            RETURN CASE WHEN v_active THEN 'active' ELSE 'inactive' END;
        END IF;
    END IF;

    RETURN 'not_found';
END;
$$;

-- 3. Update get_user_complete_profile to check is_active
CREATE OR REPLACE FUNCTION public.get_user_complete_profile()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
      DECLARE
          uid uuid;
          res_profile json;
          res_tenant json;
          res_modules json;
          res_roles json;
          res_platform_admin json;
          res_custom_permissions json;
          v_is_active boolean;
      BEGIN
          uid := auth.uid();
          
          -- Check if active
          SELECT is_active INTO v_is_active 
          FROM public.profiles 
          WHERE user_id = uid;

          -- If not active or not found, return explicit deactivated JSON
          IF v_is_active IS NOT NULL AND v_is_active = false THEN
              RETURN json_build_object('status', 'deactivated', 'is_active', false);
          END IF;

          -- 1. Profile
          SELECT row_to_json(p) INTO res_profile 
          FROM (SELECT * FROM public.profiles WHERE user_id = uid) p;
          
          -- 2. Tenant
          SELECT row_to_json(t) INTO res_tenant 
          FROM public.tenants t
          JOIN public.profiles p ON p.tenant_id = t.id
          WHERE p.user_id = uid;
          
          -- 3. Modules
          SELECT json_agg(tm) INTO res_modules
          FROM public.tenant_modules tm
          JOIN public.profiles p ON p.tenant_id = tm.tenant_id
          WHERE p.user_id = uid;
          
          -- 4. Roles
          SELECT json_agg(ur) INTO res_roles
          FROM public.user_roles ur
          WHERE ur.user_id = uid;
          
          -- 5. Platform Admin
          SELECT row_to_json(pa) INTO res_platform_admin
          FROM public.platform_admins pa
          WHERE pa.user_id = uid;

          -- 6. Custom RBAC Permissions
          IF (res_profile->>'custom_role_id' IS NOT NULL) THEN
              SELECT json_agg(rmp.module_key) INTO res_custom_permissions
              FROM public.role_module_permissions rmp
              WHERE rmp.role_id = (res_profile->>'custom_role_id')::uuid
              AND rmp.can_access = true;
          END IF;
          
          RETURN json_build_object(
              'profile', res_profile,
              'tenant', res_tenant,
              'modules', COALESCE(res_modules, '[]'::json),
              'roles', COALESCE(res_roles, '[]'::json),
              'platform_admin', res_platform_admin,
              'custom_permissions', COALESCE(res_custom_permissions, '[]'::json)
          );
      END;
      $function$;
`;

async function applyFix() {
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
        console.log('--- Applying Security Fixes to RPCs ---');
        await client.query(sql);
        console.log('✅ RPCs updated successfully.');
        await client.end();
    } catch (err) {
        console.error('❌ Error applying fix:', err.message);
        process.exit(1);
    }
}

applyFix();
