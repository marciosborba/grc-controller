const { Client } = require('pg');
require('dotenv').config();

const sql = `
-- Update handle_new_user Trigger to v7
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_tenant_id uuid;
  v_system_role text;
  v_db_role text;
  v_full_name text;
  v_custom_role_id uuid;
BEGIN
  v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;
  v_system_role := COALESCE(NEW.raw_user_meta_data->>'system_role', 'user');
  v_custom_role_id := (NEW.raw_user_meta_data->>'custom_role_id')::uuid;
  
  -- Role Mapping
  v_db_role := CASE 
    WHEN v_system_role IN ('guest', 'vendor') THEN 'user'
    WHEN v_system_role IN ('tenant_admin', 'super_admin') THEN 'admin'
    ELSE v_system_role
  END;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

  -- Robust UPSERT into public.profiles
  INSERT INTO public.profiles (
    user_id, email, full_name, tenant_id, system_role, is_active, must_change_password, custom_role_id
  )
  VALUES (
    NEW.id, NEW.email, v_full_name, v_tenant_id, v_system_role, false, true, v_custom_role_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    system_role = EXCLUDED.system_role,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    custom_role_id = COALESCE(EXCLUDED.custom_role_id, profiles.custom_role_id),
    updated_at = now();

  -- Robust UPSERT into user_roles
  IF v_tenant_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (NEW.id, v_db_role, v_tenant_id)
    ON CONFLICT (user_id, role, tenant_id) DO UPDATE SET
      role = EXCLUDED.role;
  END IF;

  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE WARNING 'handle_new_user v7 error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function applyTriggerV7() {
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
        console.log('Applying trigger handle_new_user v7...');
        await client.query(sql);
        console.log('✅ Trigger applied successfully.');
    } catch (err) {
        console.error('❌ Error applying trigger:', err);
    } finally {
        await client.end();
    }
}

applyTriggerV7();
