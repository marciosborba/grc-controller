-- ============================================================================
-- EXCLUSÃO TOTAL E RECRIAÇÃO DA TABELA dpia_assessments
-- ============================================================================

-- 1. EXCLUIR TABELA EXISTENTE (se existir)
DROP TABLE IF EXISTS dpia_assessments CASCADE;

-- 2. CRIAR TABELA NOVA E SIMPLIFICADA
CREATE TABLE dpia_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Campos básicos obrigatórios
    name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Atividade de processamento relacionada
    processing_activity_id UUID,
    
    -- Campos opcionais para DPIA
    purpose TEXT,
    scope TEXT,
    
    -- Categorias de dados (JSON simples)
    data_categories TEXT[] DEFAULT '{}',
    
    -- Avaliação de necessidade
    dpia_required BOOLEAN DEFAULT false,
    dpia_justification TEXT,
    
    -- Status e risco (campos simples)
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    risk_level VARCHAR(20) NOT NULL DEFAULT 'medium',
    
    -- Campos booleanos para triggers LGPD (Art. 38)
    involves_high_risk BOOLEAN DEFAULT false,
    involves_sensitive_data BOOLEAN DEFAULT false,
    involves_large_scale BOOLEAN DEFAULT false,
    involves_profiling BOOLEAN DEFAULT false,
    involves_automated_decisions BOOLEAN DEFAULT false,
    involves_vulnerable_individuals BOOLEAN DEFAULT false,
    involves_new_technology BOOLEAN DEFAULT false,
    
    -- Riscos de privacidade identificados
    privacy_risks TEXT[] DEFAULT '{}',
    
    -- Avaliação de risco (1-5)
    likelihood_assessment INTEGER CHECK (likelihood_assessment BETWEEN 1 AND 5),
    impact_assessment INTEGER CHECK (impact_assessment BETWEEN 1 AND 5),
    
    -- Medidas mitigadoras
    mitigation_measures TEXT[] DEFAULT '{}',
    residual_risk_level VARCHAR(20),
    
    -- Consulta ANPD
    anpd_consultation_required BOOLEAN DEFAULT false,
    anpd_consultation_date DATE,
    anpd_response_date DATE,
    anpd_recommendation TEXT,
    
    -- Responsáveis
    conducted_by UUID,
    reviewed_by UUID,
    approved_by UUID,
    dpo_id UUID,
    
    -- Aprovação/Rejeição
    approval_notes TEXT,
    rejection_reason TEXT,
    anpd_consultation_reason TEXT,
    
    -- Datas importantes
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    
    -- Auditoria (OBRIGATÓRIOS para RLS)
    created_by UUID NOT NULL,
    updated_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT dpia_valid_status CHECK (status IN ('draft', 'in_progress', 'completed', 'approved', 'rejected', 'pending_approval', 'pending_anpd_consultation')),
    CONSTRAINT dpia_valid_risk CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
    CONSTRAINT dpia_valid_residual_risk CHECK (residual_risk_level IN ('low', 'medium', 'high', 'very_high')),
    CONSTRAINT dpia_valid_likelihood CHECK (likelihood_assessment IS NULL OR likelihood_assessment BETWEEN 1 AND 5),
    CONSTRAINT dpia_valid_impact CHECK (impact_assessment IS NULL OR impact_assessment BETWEEN 1 AND 5)
);

-- 3. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE dpia_assessments DISABLE ROW LEVEL SECURITY;

-- 4. CRIAR ÍNDICES BÁSICOS
CREATE INDEX idx_dpia_status ON dpia_assessments(status);
CREATE INDEX idx_dpia_risk_level ON dpia_assessments(risk_level);
CREATE INDEX idx_dpia_created_by ON dpia_assessments(created_by);
CREATE INDEX idx_dpia_created_at ON dpia_assessments(created_at);

-- 5. COMENTÁRIO DA TABELA
COMMENT ON TABLE dpia_assessments IS 'Avaliações de Impacto à Proteção de Dados (DPIA/AIPD) - LGPD Art. 38';

-- 6. INSERIR DADOS DE TESTE
INSERT INTO dpia_assessments (
    title, 
    description, 
    purpose,
    scope,
    data_categories,
    status,
    risk_level,
    involves_high_risk,
    involves_sensitive_data,
    created_by,
    updated_by
) VALUES 
(
    'DPIA - Sistema de CRM',
    'Avaliação de impacto para o sistema de gestão de relacionamento com clientes',
    'Gestão de dados de clientes para marketing e vendas',
    'Dados de identificação e contato de clientes pessoa física',
    ARRAY['nome', 'email', 'telefone'],
    'draft',
    'medium',
    true,
    false,
    '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e',
    '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e'
),
(
    'DPIA - Portal de RH',
    'Avaliação de impacto para tratamento de dados de funcionários',
    'Gestão de recursos humanos e folha de pagamento',
    'Dados pessoais e sensíveis de colaboradores',
    ARRAY['nome', 'cpf', 'dados_bancarios'],
    'in_progress',
    'high',
    true,
    true,
    '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e',
    '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e'
),
(
    'DPIA - Sistema de Monitoramento',
    'Avaliação para sistema de videomonitoramento',
    'Segurança patrimonial e controle de acesso',
    'Imagens de colaboradores e visitantes',
    ARRAY['imagem', 'biometria'],
    'completed',
    'high',
    true,
    true,
    '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e',
    '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e'
);

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
    'TABELA CRIADA COM SUCESSO!' as status,
    COUNT(*) as total_registros
FROM dpia_assessments;