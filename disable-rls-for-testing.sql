-- TEMPORARIAMENTE desabilitar RLS para permitir testes
-- ATENÇÃO: Isso é apenas para desenvolvimento/teste!

-- Desabilitar RLS nas tabelas principais
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenants DISABLE ROW LEVEL SECURITY;

-- Verificar status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('incidents', 'profiles', 'tenants');