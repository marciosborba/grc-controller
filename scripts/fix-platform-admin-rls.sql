-- Corrigir recursão infinita nas políticas RLS da tabela platform_admins

-- 1. Remover as políticas problemáticas
DROP POLICY IF EXISTS "Platform admins can view platform admin records" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can manage platform admin records" ON platform_admins;

-- 2. Opção 1: Desabilitar RLS temporariamente (mais simples)
-- ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;

-- 3. Opção 2: Criar políticas que não causem recursão
-- Permitir que qualquer usuário autenticado veja seus próprios dados de platform admin
CREATE POLICY "Users can view their own platform admin record"
    ON platform_admins
    FOR SELECT
    USING (user_id = auth.uid());

-- Permitir que usuários admin do sistema (via user_roles) gerenciem platform admins
CREATE POLICY "System admins can manage platform admin records"
    ON platform_admins
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Verificar se as políticas foram criadas
\d+ platform_admins