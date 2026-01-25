-- Script para criar políticas RLS permissivas nas tabelas LGPD
-- Para ser executado no Supabase Cloud

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "legal_bases_full_access" ON legal_bases;
DROP POLICY IF EXISTS "legal_bases_anon_access" ON legal_bases;
DROP POLICY IF EXISTS "consents_full_access" ON consents;
DROP POLICY IF EXISTS "consents_anon_access" ON consents;
DROP POLICY IF EXISTS "data_inventory_full_access" ON data_inventory;
DROP POLICY IF EXISTS "data_inventory_anon_access" ON data_inventory;
DROP POLICY IF EXISTS "data_subject_requests_full_access" ON data_subject_requests;
DROP POLICY IF EXISTS "data_subject_requests_anon_access" ON data_subject_requests;
DROP POLICY IF EXISTS "privacy_incidents_full_access" ON privacy_incidents;
DROP POLICY IF EXISTS "privacy_incidents_anon_access" ON privacy_incidents;
DROP POLICY IF EXISTS "processing_activities_full_access" ON processing_activities;
DROP POLICY IF EXISTS "processing_activities_anon_access" ON processing_activities;

-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE legal_bases DISABLE ROW LEVEL SECURITY;
ALTER TABLE consents DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE processing_activities DISABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para usuários autenticados
CREATE POLICY "legal_bases_authenticated_access" ON legal_bases
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "consents_authenticated_access" ON consents
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "data_inventory_authenticated_access" ON data_inventory
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "data_subject_requests_authenticated_access" ON data_subject_requests
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "privacy_incidents_authenticated_access" ON privacy_incidents
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "processing_activities_authenticated_access" ON processing_activities
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Criar políticas para usuários anônimos (somente leitura para desenvolvimento)
CREATE POLICY "legal_bases_public_read" ON legal_bases
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "consents_public_read" ON consents
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "data_inventory_public_read" ON data_inventory
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "data_subject_requests_public_read" ON data_subject_requests
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "privacy_incidents_public_read" ON privacy_incidents
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "processing_activities_public_read" ON processing_activities
    FOR SELECT TO anon
    USING (true);

-- Reabilitar RLS
ALTER TABLE legal_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;

-- Verificar status final
SELECT 
    schemaname,
    tablename, 
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t 
WHERE tablename IN ('legal_bases', 'consents', 'data_inventory', 'data_subject_requests', 'privacy_incidents', 'processing_activities')
ORDER BY tablename;