const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        const sql = `
      CREATE OR REPLACE FUNCTION get_user_complete_profile()
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      DECLARE
          uid uuid;
          res_profile json;
          res_tenant json;
          res_modules json;
          res_roles json;
          res_platform_admin json;
          res_custom_permissions json;
      BEGIN
          uid := auth.uid();
          
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
      $$;
    `;
        return client.query(sql);
    })
    .then(res => {
        console.log('Main RPC redefined with SECURITY DEFINER successfully.');
        client.end();
    })
    .catch(err => {
        console.error('Error redefining RPC:', err);
        client.end();
    });
