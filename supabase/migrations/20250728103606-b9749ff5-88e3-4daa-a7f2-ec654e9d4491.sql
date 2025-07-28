-- Inserir um usuário administrador de teste
-- Primeiro vamos criar um trigger melhorado para criação de perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar função para promover usuário a admin
CREATE OR REPLACE FUNCTION public.make_user_admin(email_to_promote TEXT)
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;