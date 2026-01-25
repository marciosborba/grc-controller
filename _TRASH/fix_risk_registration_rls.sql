-- Script para corrigir problema de RLS na criação de registros de risco
-- Execute este script no SQL Editor do Supabase Dashboard
-- URL: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd

-- 1. Criar função RPC para criar registros de risco sem problemas de RLS
CREATE OR REPLACE FUNCTION create_risk_registration(
  p_tenant_id UUID,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_registration_id UUID;
BEGIN
  -- Verificar se o usuário tem acesso ao tenant
  IF NOT EXISTS (
    SELECT 1 FROM user_tenant_access 
    WHERE user_id = auth.uid() AND tenant_id = p_tenant_id
  ) THEN
    RAISE EXCEPTION 'Acesso negado ao tenant especificado';
  END IF;
  
  -- Inserir novo registro de risco
  INSERT INTO risk_registrations (
    tenant_id,
    created_by,
    status,
    current_step,
    completion_percentage
  ) VALUES (
    p_tenant_id,
    p_created_by,
    'draft',
    1,
    0
  ) RETURNING id INTO new_registration_id;
  
  RETURN new_registration_id;
END;
$$;

-- 2. Verificar se a tabela user_tenant_access existe, se não, criar uma versão simplificada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_tenant_access') THEN
    -- Criar tabela temporária baseada em profiles
    CREATE VIEW user_tenant_access AS
    SELECT 
      user_id,
      tenant_id
    FROM profiles
    WHERE tenant_id IS NOT NULL;
  END IF;
END $$;

-- 3. Criar função alternativa que usa profiles diretamente
CREATE OR REPLACE FUNCTION create_risk_registration_simple(
  p_tenant_id UUID,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_registration_id UUID;
  user_tenant_id UUID;
BEGIN
  -- Verificar se o usuário autenticado tem acesso ao tenant
  SELECT tenant_id INTO user_tenant_id
  FROM profiles 
  WHERE user_id = auth.uid();
  
  -- Verificar se o tenant_id corresponde ao do usuário ou se é super admin
  IF user_tenant_id != p_tenant_id AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'platform_admin')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: usuário não pertence ao tenant especificado';
  END IF;
  
  -- Inserir novo registro de risco
  INSERT INTO risk_registrations (
    tenant_id,
    created_by,
    status,
    current_step,
    completion_percentage
  ) VALUES (
    p_tenant_id,
    p_created_by,
    'draft',
    1,
    0
  ) RETURNING id INTO new_registration_id;
  
  RETURN new_registration_id;
END;
$$;

-- 4. Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION create_risk_registration(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_risk_registration_simple(UUID, UUID) TO authenticated;

-- 5. Verificar se as políticas RLS estão causando problemas
-- Temporariamente desabilitar RLS para risk_registrations para debug
-- ATENÇÃO: Isso é apenas para debug, reabilitar depois
-- ALTER TABLE risk_registrations DISABLE ROW LEVEL SECURITY;

-- 6. Criar política RLS mais permissiva para criação
DROP POLICY IF EXISTS "Users can create risk registrations in their tenant" ON risk_registrations;

CREATE POLICY "Users can create risk registrations in their tenant" ON risk_registrations FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'platform_admin')
    )
  );

-- 7. Verificar estrutura da tabela risk_registrations
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'risk_registrations'
ORDER BY ordinal_position;

-- 8. Verificar políticas RLS atuais
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'risk_registrations';

-- 9. Testar a função (descomente para testar)
-- SELECT create_risk_registration_simple(
--   '46b1c048-85a1-423b-96fc-776007c8de1f'::UUID,  -- tenant GRC-Controller
--   auth.uid()
-- );

COMMENT ON FUNCTION create_risk_registration(UUID, UUID) IS 'Cria novo registro de risco com verificação de acesso ao tenant';
COMMENT ON FUNCTION create_risk_registration_simple(UUID, UUID) IS 'Versão simplificada para criar registro de risco usando profiles';