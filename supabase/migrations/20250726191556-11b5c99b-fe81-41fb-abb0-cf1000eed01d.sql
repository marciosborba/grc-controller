-- Corrigir funções para definir search_path para segurança
-- Isso resolve os avisos de segurança do linter

-- Recriar função can_manage_user com search_path seguro
CREATE OR REPLACE FUNCTION public.can_manage_user(_manager_id uuid, _target_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  -- Master admin pode gerenciar qualquer usuário
  SELECT CASE 
    WHEN has_role(_manager_id, 'admin'::app_role) THEN true
    -- CISO pode gerenciar usuários da mesma tenant
    WHEN has_role(_manager_id, 'ciso'::app_role) THEN (
      SELECT p1.tenant_id = p2.tenant_id 
      FROM profiles p1, profiles p2 
      WHERE p1.user_id = _manager_id AND p2.user_id = _target_user_id
    )
    -- Usuário só pode gerenciar a si mesmo
    ELSE _manager_id = _target_user_id
  END
$function$;

-- Recriar função has_role com search_path seguro
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- Recriar função handle_new_user com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, job_title)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'User')
  );
  RETURN NEW;
END;
$function$;

-- Recriar função log_activity com search_path seguro
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id uuid, 
  p_action text, 
  p_resource_type text, 
  p_resource_id text DEFAULT NULL::text, 
  p_details jsonb DEFAULT NULL::jsonb, 
  p_ip_address inet DEFAULT NULL::inet, 
  p_user_agent text DEFAULT NULL::text
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;