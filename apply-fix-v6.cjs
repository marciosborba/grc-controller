const { Client } = require('pg');
require('dotenv').config();

const sql = `
-- 1. Fix RLS Policies for Profiles
-- We drop and recreate with the correct user_id column
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (user_id = auth.uid() OR tenant_id = get_auth_tenant_id() OR is_platform_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid() OR is_tenant_admin() OR is_platform_admin());

DROP POLICY IF EXISTS "Users can update profiles based on permissions" ON public.profiles;
CREATE POLICY "Users can update profiles based on permissions" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid() OR can_manage_user(auth.uid(), user_id));

-- 2. Update handle_new_user Trigger to v6
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_tenant_id uuid;
  v_system_role text;
  v_db_role text;
  v_full_name text;
BEGIN
  v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;
  v_system_role := COALESCE(NEW.raw_user_meta_data->>'system_role', 'user');
  
  -- Role Mapping (Sync with Edge Function and UI expectations)
  v_db_role := CASE 
    WHEN v_system_role IN ('guest', 'vendor') THEN 'user'
    WHEN v_system_role IN ('tenant_admin', 'super_admin') THEN 'admin'
    ELSE v_system_role
  END;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

  -- Robust UPSERT into public.profiles
  -- id is often a primary key, user_id is the foreign key to auth.users (NEW.id)
  INSERT INTO public.profiles (user_id, email, full_name, tenant_id, system_role, is_active, must_change_password)
  VALUES (NEW.id, NEW.email, v_full_name, v_tenant_id, v_system_role, false, true)
  ON CONFLICT (user_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    system_role = EXCLUDED.system_role,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  -- Robust UPSERT into user_roles
  IF v_tenant_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (NEW.id, v_db_role, v_tenant_id)
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE WARNING 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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
        console.log('Applying RLS fix and trigger handle_new_user v6...');
        await client.query(sql);
        console.log('✅ Fix applied successfully.');
    } catch (err) {
        console.error('❌ Error applying fix:', err);
    } finally {
        await client.end();
    }
}

applyFix();
