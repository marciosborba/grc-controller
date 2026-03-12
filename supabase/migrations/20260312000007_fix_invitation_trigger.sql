-- Upgraded handle_new_user to capture tenant_id and system_role from auth metadata
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
BEGIN
  -- Extract metadata
  v_tenant_id := (NEW.raw_user_meta_data->>'tenant_id')::uuid;
  v_system_role := COALESCE(NEW.raw_user_meta_data->>'system_role', 'user');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  -- Insert profile
  INSERT INTO public.profiles (
    user_id, 
    email,
    full_name, 
    job_title, 
    tenant_id, 
    system_role,
    is_active,
    must_change_password
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'Usuário'),
    v_tenant_id,
    v_system_role,
    true,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    system_role = EXCLUDED.system_role,
    full_name = EXCLUDED.full_name;
  
  -- Assign initial role
  -- Map system roles to valid app_role enum values
  -- tenant_admin -> admin
  -- guest -> user
  IF v_system_role = 'tenant_admin' THEN
    v_system_role := 'admin';
  ELSIF v_system_role = 'guest' THEN
    v_system_role := 'user';
  END IF;

  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, v_system_role::app_role, v_tenant_id)
  ON CONFLICT (user_id, role) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id;
  
  RETURN NEW;
END;
$$;
