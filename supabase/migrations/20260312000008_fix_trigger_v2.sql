-- ============================================================
-- Migration: Fix handle_new_user trigger (v2)
-- Fixes:
--   1. Uses user_id lookup instead of ON CONFLICT (user_id)
--      since profiles has no unique constraint on user_id
--   2. Safely maps system_role to a valid app_role enum value
--      (vendor/guest/super_admin/unknown -> 'user')
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid;
  v_system_role text;
  v_full_name text;
  v_db_role app_role;
  v_existing_profile_id uuid;
BEGIN
  -- Extract metadata safely
  BEGIN
    v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;
  EXCEPTION WHEN others THEN
    v_tenant_id := NULL;
  END;

  v_system_role := COALESCE(NEW.raw_user_meta_data->>'system_role', 'user');
  v_full_name   := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- Map system_role to a valid app_role enum value
  -- Valid app_role enum: admin, ciso, risk_manager, compliance_officer, auditor, user, super_admin
  v_db_role := CASE v_system_role
    WHEN 'tenant_admin' THEN 'admin'::app_role
    WHEN 'admin'        THEN 'admin'::app_role
    WHEN 'ciso'         THEN 'ciso'::app_role
    WHEN 'risk_manager' THEN 'risk_manager'::app_role
    WHEN 'compliance_officer' THEN 'compliance_officer'::app_role
    WHEN 'auditor'      THEN 'auditor'::app_role
    WHEN 'super_admin'  THEN 'super_admin'::app_role
    ELSE 'user'::app_role  -- guest, vendor, unknown -> user
  END;

  -- Check if profile already exists for this user_id
  SELECT id INTO v_existing_profile_id
  FROM public.profiles
  WHERE user_id = NEW.id
  LIMIT 1;

  IF v_existing_profile_id IS NOT NULL THEN
    -- Update existing profile with metadata from invitation
    UPDATE public.profiles SET
      tenant_id  = COALESCE(v_tenant_id, tenant_id),
      system_role = v_system_role,
      full_name  = v_full_name,
      email      = NEW.email
    WHERE id = v_existing_profile_id;
  ELSE
    -- Insert new profile
    INSERT INTO public.profiles (
      user_id,
      email,
      full_name,
      job_title,
      tenant_id,
      system_role,
      is_active,
      must_change_password
    ) VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      COALESCE(NEW.raw_user_meta_data->>'job_title', 'Usuário'),
      v_tenant_id,
      v_system_role,
      true,
      true
    );
  END IF;

  -- Upsert role using the unique constraint (user_id, role)
  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, v_db_role, v_tenant_id)
  ON CONFLICT (user_id, role) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id
  WHERE public.user_roles.tenant_id IS DISTINCT FROM EXCLUDED.tenant_id;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log error but don't block user creation
  RAISE WARNING 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;
