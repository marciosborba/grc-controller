-- Corrigir problemas de segurança nas funções
-- Atualizar a função handle_new_user com search_path correto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir perfil do usuário
  INSERT INTO public.profiles (user_id, full_name, job_title, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'Usuário'),
    true
  );
  
  -- Atribuir role padrão de 'user'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Atualizar a função make_user_admin com search_path correto
CREATE OR REPLACE FUNCTION public.make_user_admin(email_to_promote TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Buscar o UUID do usuário pelo email
  SELECT id INTO user_uuid
  FROM auth.users
  WHERE email = email_to_promote;
  
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Inserir role de admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_uuid, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Atualizar perfil se necessário
  UPDATE public.profiles
  SET job_title = 'Administrador do Sistema'
  WHERE user_id = user_uuid;
  
  RETURN TRUE;
END;
$$;