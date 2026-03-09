-- particular the new custom_role_id used for RBAC

DROP FUNCTION IF EXISTS get_user_complete_profile();

CREATE OR REPLACE FUNCTION get_user_complete_profile()
RETURNS json AS $$
DECLARE
    uid uuid;
    res_profile json;
    res_tenant json;
    res_modules json;
    res_roles json;
    res_platform_admin json;
BEGIN
    uid := auth.uid();
    
    -- 1. Profile (includes custom_role_id automatically via select *)
    SELECT row_to_json(p) INTO res_profile 
    FROM (SELECT * FROM public.profiles WHERE id = uid) p;
    
    -- 2. Tenant
    SELECT row_to_json(t) INTO res_tenant 
    FROM public.tenants t
    JOIN public.profiles p ON p.tenant_id = t.id
    WHERE p.id = uid;
    
    -- 3. Modules
    SELECT json_agg(tm) INTO res_modules
    FROM public.tenant_modules tm
    JOIN public.profiles p ON p.tenant_id = tm.tenant_id
    WHERE p.id = uid;
    
    -- 4. Roles
    SELECT json_agg(ur) INTO res_roles
    FROM public.user_roles ur
    WHERE ur.user_id = uid;
    
    -- 5. Platform Admin
    SELECT row_to_json(pa) INTO res_platform_admin
    FROM public.platform_admins pa
    WHERE pa.user_id = uid;
    
    RETURN json_build_object(
        'profile', res_profile,
        'tenant', res_tenant,
        'modules', COALESCE(res_modules, '[]'::json),
        'roles', COALESCE(res_roles, '[]'::json),
        'platform_admin', res_platform_admin
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
