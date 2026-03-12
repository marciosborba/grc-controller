const { Client } = require('pg');
require('dotenv').config();

const sql = `
-- 1. Add unique constraint to profiles(user_id)
-- This is required for ON CONFLICT (user_id) and PostgREST upsert
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.profiles'::regclass AND conname = 'profiles_user_id_key'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- 2. Verify user_roles unique constraint
-- The existing one is user_roles_user_id_role_key: UNIQUE (user_id, role)
-- We'll keep it as is, but the Edge Function must match it.

-- 3. Update Trigger v7 to ensure it works with the new constraint
-- (Already applied in v7, but re-applying to be sure it's fresh)
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
  
  v_db_role := CASE 
    WHEN v_system_role IN ('guest', 'vendor') THEN 'user'
    WHEN v_system_role IN ('tenant_admin', 'super_admin') THEN 'admin'
    ELSE v_system_role
  END;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

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

  IF v_tenant_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (NEW.id, v_db_role, v_tenant_id)
    ON CONFLICT (user_id, role) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id; -- Update tenant if role already exists for user
  END IF;

  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE WARNING 'handle_new_user v7 error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function fixConstraints() {
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
        console.log('Adding unique constraint to profiles(user_id) and updating trigger...');
        await client.query(sql);
        console.log('✅ Fixes applied successfully.');
    } catch (err) {
        console.error('❌ Error applying fixes:', err);
    } finally {
        await client.end();
    }
}

fixConstraints();
