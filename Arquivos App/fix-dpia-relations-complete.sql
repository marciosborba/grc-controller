-- ============================================================================
-- CORREÇÃO COMPLETA DE RELACIONAMENTOS DO DPIA
-- ============================================================================

-- 1. CRIAR processing_activities se não existir
CREATE TABLE IF NOT EXISTS processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose TEXT,
    legal_basis TEXT,
    data_categories TEXT[] DEFAULT '{}',
    data_sources TEXT[] DEFAULT '{}',
    retention_period VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    responsible_person UUID,
    created_by UUID NOT NULL,
    updated_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilitar RLS
ALTER TABLE processing_activities DISABLE ROW LEVEL SECURITY;

-- 2. ADICIONAR FK se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_dpia_processing_activity'
    ) THEN
        ALTER TABLE dpia_assessments 
        ADD CONSTRAINT fk_dpia_processing_activity 
        FOREIGN KEY (processing_activity_id) 
        REFERENCES processing_activities(id);
    END IF;
END $$;

-- 3. INSERIR dados de exemplo em processing_activities
INSERT INTO processing_activities (name, description, purpose, created_by, updated_by) 
VALUES 
    ('Gestão de Clientes', 'Processamento de dados de clientes para CRM', 'Marketing e vendas', '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e', '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e'),
    ('Recursos Humanos', 'Gestão de dados de funcionários', 'Administração de pessoal', '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e', '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e'),
    ('Sistema de Monitoramento', 'Videomonitoramento para segurança', 'Segurança patrimonial', '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e', '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e')
ON CONFLICT DO NOTHING;

-- 4. VERIFICAÇÃO FINAL
SELECT 
    'CORREÇÃO CONCLUÍDA!' as status,
    (SELECT COUNT(*) FROM processing_activities) as processing_activities_count,
    (SELECT COUNT(*) FROM dpia_assessments) as dpia_count;