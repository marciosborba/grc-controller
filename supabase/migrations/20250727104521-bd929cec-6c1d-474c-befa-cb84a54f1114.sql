-- Adicionar colunas faltantes na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}';

-- Corrigir as políticas RLS para evitar recursão infinita
DROP POLICY IF EXISTS "Users can view profiles based on role" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles based on permissions" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can delete profiles" ON public.profiles;

-- Recriar as políticas sem recursão
CREATE POLICY "Users can view profiles based on role" ON public.profiles
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'ciso'::app_role) OR 
  auth.uid() = user_id
);

CREATE POLICY "Users can update profiles based on permissions" ON public.profiles
FOR UPDATE USING (can_manage_user(auth.uid(), user_id))
WITH CHECK (can_manage_user(auth.uid(), user_id));

CREATE POLICY "Users can insert profiles" ON public.profiles
FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  auth.uid() = user_id
);

CREATE POLICY "Only admins can delete profiles" ON public.profiles
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Criar função para log de atividades (se não existir)
CREATE OR REPLACE FUNCTION public.rpc_log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Criar usuários de teste para cada role
-- Admin users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin1@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Admin Primeiro"}'),
  ('11111111-1111-1111-1111-111111111112', 'admin2@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Admin Segundo"}'),
  ('11111111-1111-1111-1111-111111111113', 'admin3@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Admin Terceiro"}')
ON CONFLICT (id) DO NOTHING;

-- CISO users  
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('22222222-2222-2222-2222-222222222221', 'ciso1@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "CISO Primeiro"}'),
  ('22222222-2222-2222-2222-222222222222', 'ciso2@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "CISO Segundo"}'),
  ('22222222-2222-2222-2222-222222222223', 'ciso3@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "CISO Terceiro"}')
ON CONFLICT (id) DO NOTHING;

-- Risk Manager users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('33333333-3333-3333-3333-333333333331', 'risk1@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Risk Manager Primeiro"}'),
  ('33333333-3333-3333-3333-333333333332', 'risk2@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Risk Manager Segundo"}'),
  ('33333333-3333-3333-3333-333333333333', 'risk3@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Risk Manager Terceiro"}')
ON CONFLICT (id) DO NOTHING;

-- Compliance Officer users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('44444444-4444-4444-4444-444444444441', 'compliance1@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Compliance Officer Primeiro"}'),
  ('44444444-4444-4444-4444-444444444442', 'compliance2@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Compliance Officer Segundo"}'),
  ('44444444-4444-4444-4444-444444444443', 'compliance3@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Compliance Officer Terceiro"}')
ON CONFLICT (id) DO NOTHING;

-- Auditor users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('55555555-5555-5555-5555-555555555551', 'auditor1@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Auditor Primeiro"}'),
  ('55555555-5555-5555-5555-555555555552', 'auditor2@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Auditor Segundo"}'),
  ('55555555-5555-5555-5555-555555555553', 'auditor3@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Auditor Terceiro"}')
ON CONFLICT (id) DO NOTHING;

-- User users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('66666666-6666-6666-6666-666666666661', 'user1@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Usuário Primeiro"}'),
  ('66666666-6666-6666-6666-666666666662', 'user2@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Usuário Segundo"}'),
  ('66666666-6666-6666-6666-666666666663', 'user3@test.com', '$2a$10$dummy.hash.here', now(), now(), now(), '{"full_name": "Usuário Terceiro"}')
ON CONFLICT (id) DO NOTHING;

-- Criar profiles para todos os usuários
INSERT INTO public.profiles (user_id, full_name, email, job_title, department, is_active, permissions)
VALUES 
  -- Admins
  ('11111111-1111-1111-1111-111111111111', 'Admin Primeiro', 'admin1@test.com', 'Administrador Geral', 'TI', true, '{"users.read", "users.create", "users.update", "users.delete", "logs.read"}'),
  ('11111111-1111-1111-1111-111111111112', 'Admin Segundo', 'admin2@test.com', 'Administrador Sistema', 'TI', true, '{"users.read", "users.create", "users.update", "users.delete", "logs.read"}'),
  ('11111111-1111-1111-1111-111111111113', 'Admin Terceiro', 'admin3@test.com', 'Administrador Rede', 'TI', true, '{"users.read", "users.create", "users.update", "users.delete", "logs.read"}'),
  
  -- CISOs
  ('22222222-2222-2222-2222-222222222221', 'CISO Primeiro', 'ciso1@test.com', 'Chief Information Security Officer', 'Segurança', true, '{"users.read", "users.update", "logs.read", "security_logs.read"}'),
  ('22222222-2222-2222-2222-222222222222', 'CISO Segundo', 'ciso2@test.com', 'CISO Regional', 'Segurança', true, '{"users.read", "users.update", "logs.read", "security_logs.read"}'),
  ('22222222-2222-2222-2222-222222222223', 'CISO Terceiro', 'ciso3@test.com', 'CISO Corporativo', 'Segurança', true, '{"users.read", "users.update", "logs.read", "security_logs.read"}'),
  
  -- Risk Managers
  ('33333333-3333-3333-3333-333333333331', 'Risk Manager Primeiro', 'risk1@test.com', 'Gerente de Riscos Sênior', 'Gestão de Riscos', true, '{"users.read", "risks.read", "risks.create", "risks.update"}'),
  ('33333333-3333-3333-3333-333333333332', 'Risk Manager Segundo', 'risk2@test.com', 'Gerente de Riscos Pleno', 'Gestão de Riscos', true, '{"users.read", "risks.read", "risks.create", "risks.update"}'),
  ('33333333-3333-3333-3333-333333333333', 'Risk Manager Terceiro', 'risk3@test.com', 'Gerente de Riscos Júnior', 'Gestão de Riscos', true, '{"users.read", "risks.read", "risks.create", "risks.update"}'),
  
  -- Compliance Officers
  ('44444444-4444-4444-4444-444444444441', 'Compliance Officer Primeiro', 'compliance1@test.com', 'Oficial de Compliance Sênior', 'Compliance', true, '{"users.read", "compliance.read", "compliance.create", "compliance.update"}'),
  ('44444444-4444-4444-4444-444444444442', 'Compliance Officer Segundo', 'compliance2@test.com', 'Oficial de Compliance Pleno', 'Compliance', true, '{"users.read", "compliance.read", "compliance.create", "compliance.update"}'),
  ('44444444-4444-4444-4444-444444444443', 'Compliance Officer Terceiro', 'compliance3@test.com', 'Oficial de Compliance Júnior', 'Compliance', true, '{"users.read", "compliance.read", "compliance.create", "compliance.update"}'),
  
  -- Auditors
  ('55555555-5555-5555-5555-555555555551', 'Auditor Primeiro', 'auditor1@test.com', 'Auditor Interno Sênior', 'Auditoria', true, '{"users.read", "audit.read", "audit.create", "audit.update"}'),
  ('55555555-5555-5555-5555-555555555552', 'Auditor Segundo', 'auditor2@test.com', 'Auditor Interno Pleno', 'Auditoria', true, '{"users.read", "audit.read", "audit.create", "audit.update"}'),
  ('55555555-5555-5555-5555-555555555553', 'Auditor Terceiro', 'auditor3@test.com', 'Auditor Interno Júnior', 'Auditoria', true, '{"users.read", "audit.read", "audit.create", "audit.update"}'),
  
  -- Users
  ('66666666-6666-6666-6666-666666666661', 'Usuário Primeiro', 'user1@test.com', 'Analista', 'Operações', true, '{"users.read"}'),
  ('66666666-6666-6666-6666-666666666662', 'Usuário Segundo', 'user2@test.com', 'Assistente', 'Administrativo', true, '{"users.read"}'),
  ('66666666-6666-6666-6666-666666666663', 'Usuário Terceiro', 'user3@test.com', 'Estagiário', 'RH', true, '{"users.read"}')
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  job_title = EXCLUDED.job_title,
  department = EXCLUDED.department,
  permissions = EXCLUDED.permissions;

-- Atribuir roles aos usuários
INSERT INTO public.user_roles (user_id, role)
VALUES 
  -- Admins
  ('11111111-1111-1111-1111-111111111111', 'admin'),
  ('11111111-1111-1111-1111-111111111112', 'admin'),
  ('11111111-1111-1111-1111-111111111113', 'admin'),
  
  -- CISOs
  ('22222222-2222-2222-2222-222222222221', 'ciso'),
  ('22222222-2222-2222-2222-222222222222', 'ciso'),
  ('22222222-2222-2222-2222-222222222223', 'ciso'),
  
  -- Risk Managers
  ('33333333-3333-3333-3333-333333333331', 'risk_manager'),
  ('33333333-3333-3333-3333-333333333332', 'risk_manager'),
  ('33333333-3333-3333-3333-333333333333', 'risk_manager'),
  
  -- Compliance Officers
  ('44444444-4444-4444-4444-444444444441', 'compliance_officer'),
  ('44444444-4444-4444-4444-444444444442', 'compliance_officer'),
  ('44444444-4444-4444-4444-444444444443', 'compliance_officer'),
  
  -- Auditors
  ('55555555-5555-5555-5555-555555555551', 'auditor'),
  ('55555555-5555-5555-5555-555555555552', 'auditor'),
  ('55555555-5555-5555-5555-555555555553', 'auditor'),
  
  -- Users
  ('66666666-6666-6666-6666-666666666661', 'user'),
  ('66666666-6666-6666-6666-666666666662', 'user'),
  ('66666666-6666-6666-6666-666666666663', 'user')
ON CONFLICT (user_id, role) DO NOTHING;