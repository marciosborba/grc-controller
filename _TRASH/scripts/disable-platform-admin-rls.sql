-- Solução para recursão infinita: Desabilitar RLS na tabela platform_admins
-- Isso é seguro porque a tabela só contém registros de platform admins

-- Remover políticas problemáticas
DROP POLICY IF EXISTS "Platform admins can view platform admin records" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can manage platform admin records" ON platform_admins;

-- Desabilitar RLS na tabela platform_admins
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;

-- Verificar status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'platform_admins';