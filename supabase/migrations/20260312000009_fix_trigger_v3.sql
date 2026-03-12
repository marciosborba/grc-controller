-- ============================================================
-- Migration: Fix handle_new_user trigger (v3)
-- Fixes:
--   1. Capta custom_role_id dos metadados (auth.users)
--   2. Mapeia system_role com segurança
--   3. Gerencia perfis existentes sem conflitos
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
  v_custom_role_id uuid;
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

  BEGIN
    v_custom_role_id := (NEW.raw_user_meta_data->>'custom_role_id')::uuid;
  EXCEPTION WHEN others THEN
    v_custom_role_id := NULL;
  END;

  v_system_role := COALESCE(NEW.raw_user_meta_data->>'system_role', 'user');
  v_full_name   := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- Map system_role
  v_db_role := CASE v_system_role
    WHEN 'tenant_admin' THEN 'admin'::app_role
    WHEN 'admin'        THEN 'admin'::app_role
    WHEN 'ciso'         THEN 'ciso'::app_role
    WHEN 'risk_manager' THEN 'risk_manager'::app_role
    WHEN 'compliance_officer' THEN 'compliance_officer'::app_role
    WHEN 'auditor'      THEN 'auditor'::app_role
    WHEN 'super_admin'  THEN 'super_admin'::app_role
    ELSE 'user'::app_role
  END;

  -- Check if profile already exists
  SELECT id INTO v_existing_profile_id
  FROM public.profiles
  WHERE user_id = NEW.id
  LIMIT 1;

  IF v_existing_profile_id IS NOT NULL THEN
    UPDATE public.profiles SET
      tenant_id      = COALESCE(v_tenant_id, tenant_id),
      system_role    = v_system_role,
      custom_role_id = COALESCE(v_custom_role_id, custom_role_id),
      full_name      = v_full_name,
      email          = NEW.email
    WHERE id = v_existing_profile_id;
  ELSE
    INSERT INTO public.profiles (
      user_id,
      email,
      full_name,
      job_title,
      tenant_id,
      system_role,
      custom_role_id,
      is_active,
      must_change_password
    ) VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      COALESCE(NEW.raw_user_meta_data->>'job_title', 'Usuário'),
      v_tenant_id,
      v_system_role,
      v_custom_role_id,
      true,
      true
    );
  END IF;

  -- Assign user_roles
  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, v_db_role, v_tenant_id)
  ON CONFLICT (user_id, role) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id
  WHERE public.user_roles.tenant_id IS DISTINCT FROM EXCLUDED.tenant_id;

  RETURN NEW;
EXCEPTION WHEN others THEN
  RAISE WARNING 'handle_new_user error for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;
