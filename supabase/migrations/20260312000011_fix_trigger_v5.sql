-- Migration: Robust handle_new_user trigger v5
-- Target: Ensure profile creation even if metadata is partially missing

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_tenant_id uuid;
  v_system_role text;
  v_full_name text;
BEGIN
  -- 1. Try to extract metadata
  v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;
  v_system_role := COALESCE(NEW.raw_user_meta_data->>'system_role', 'user');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));

  -- 2. Robust UPSERT into public.profiles
  -- We use user_id as the lookup. We set is_active: false and must_change_password: true by default for new invites.
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    tenant_id,
    system_role,
    is_active,
    must_change_password
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_tenant_id,
    v_system_role,
    false,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    system_role = EXCLUDED.system_role,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  -- 3. Robust UPSERT into user_roles
  IF v_tenant_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, tenant_id)
    VALUES (NEW.id, v_system_role, v_tenant_id)
    ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Last resort: log warning but don't block user creation
  RAISE WARNING 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
