-- =====================================================
-- MÓDULO DE ASSESSMENT - ESQUEMA COMPLETO
-- =====================================================
-- Criado para suportar assessments de compliance completos
-- com frameworks, domínios, controles, questões e relatórios
-- =====================================================

-- 1. FRAMEWORKS DE ASSESSMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    tipo_framework VARCHAR(50) NOT NULL CHECK (tipo_framework IN ('ISO27001', 'SOX', 'NIST', 'COBIT', 'LGPD', 'GDPR', 'PCI_DSS', 'HIPAA', 'CUSTOM')),
    versao VARCHAR(50) DEFAULT '1.0',
    descricao TEXT,
    is_active BOOLEAN DEFAULT true,
    is_standard BOOLEAN DEFAULT false, -- Frameworks padrão da plataforma
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- 2. DOMÍNIOS DOS FRAMEWORKS
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL REFERENCES assessment_frameworks(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) NOT NULL, -- Ex: A.5, A.6 para ISO 27001
    descricao TEXT,
    peso DECIMAL(5,2) DEFAULT 1.0, -- Peso para cálculo de maturidade
    ordem INTEGER DEFAULT 0,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONTROLES DOS DOMÍNIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES assessment_domains(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL, -- Ex: A.5.1.1
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    objetivo TEXT,
    tipo_controle VARCHAR(20) CHECK (tipo_controle IN ('preventivo', 'detectivo', 'corretivo')),
    criticidade VARCHAR(20) CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
    peso DECIMAL(5,2) DEFAULT 1.0,
    ordem INTEGER DEFAULT 0,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. QUESTÕES DOS CONTROLES
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id UUID NOT NULL REFERENCES assessment_controls(id) ON DELETE CASCADE,
    pergunta TEXT NOT NULL,
    tipo_resposta VARCHAR(20) CHECK (tipo_resposta IN ('sim_nao', 'escala_1_5', 'escala_1_10', 'multipla_escolha', 'texto_livre', 'percentual')),
    opcoes_resposta JSONB, -- Para múltipla escolha
    peso DECIMAL(5,2) DEFAULT 1.0,
    evidencias_requeridas BOOLEAN DEFAULT false,
    tipos_evidencia TEXT[], -- Array de tipos aceitos
    ordem INTEGER DEFAULT 0,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ASSESSMENTS (INSTÂNCIAS DE AVALIAÇÃO)
-- =====================================================
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id UUID NOT NULL REFERENCES assessment_frameworks(id),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'iniciado', 'em_andamento', 'em_revisao', 'concluido', 'cancelado')),
    data_inicio DATE,
    data_fim_planejada DATE,
    data_fim_real DATE,
    responsavel_id UUID,
    aprovador_id UUID,
    percentual_conclusao DECIMAL(5,2) DEFAULT 0,
    percentual_maturidade DECIMAL(5,2) DEFAULT 0,
    score_total DECIMAL(10,2) DEFAULT 0,
    score_maximo DECIMAL(10,2) DEFAULT 0,
    observacoes TEXT,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- 6. RESPOSTAS ÀS QUESTÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id),
    resposta JSONB NOT NULL, -- Flexível para diferentes tipos de resposta
    pontuacao DECIMAL(5,2) DEFAULT 0,
    pontuacao_maxima DECIMAL(5,2) DEFAULT 0,
    comentarios TEXT,
    evidencias JSONB, -- Array de evidências (URLs, metadados)
    respondido_por UUID,
    respondido_em TIMESTAMP WITH TIME ZONE,
    revisado_por UUID,
    revisado_em TIMESTAMP WITH TIME ZONE,
    status_revisao VARCHAR(20) DEFAULT 'pendente' CHECK (status_revisao IN ('pendente', 'aprovado', 'rejeitado', 'requer_evidencia')),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(assessment_id, question_id)
);

-- 7. PLANOS DE AÇÃO PARA GAPS
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES assessment_controls(id),
    question_id UUID REFERENCES assessment_questions(id),
    gap_identificado TEXT NOT NULL,
    impacto_atual TEXT,
    risco_associado TEXT,
    acao_proposta TEXT NOT NULL,
    responsavel_id UUID,
    prazo_implementacao DATE,
    custo_estimado DECIMAL(15,2),
    prioridade VARCHAR(20) CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'implementado', 'cancelado', 'adiado')),
    percentual_implementacao DECIMAL(5,2) DEFAULT 0,
    observacoes TEXT,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- 8. RELATÓRIOS DE ASSESSMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    tipo_relatorio VARCHAR(50) NOT NULL CHECK (tipo_relatorio IN ('executivo', 'detalhado', 'gaps', 'maturidade', 'comparativo', 'plano_acao')),
    titulo VARCHAR(255) NOT NULL,
    conteudo JSONB, -- Dados estruturados do relatório
    arquivo_url TEXT, -- URL do arquivo gerado (PDF, Excel)
    parametros JSONB, -- Parâmetros usados para gerar o relatório
    gerado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    gerado_por UUID,
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. HISTÓRICO DE ASSESSMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    acao VARCHAR(50) NOT NULL,
    detalhes JSONB,
    usuario_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tenant_id UUID NOT NULL
);

-- 10. TEMPLATES DE FRAMEWORKS PADRÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS assessment_framework_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    tipo_framework VARCHAR(50) NOT NULL,
    versao VARCHAR(50) DEFAULT '1.0',
    descricao TEXT,
    estrutura JSONB NOT NULL, -- Estrutura completa do framework
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_tenant ON assessment_frameworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_tipo ON assessment_frameworks(tipo_framework);

CREATE INDEX IF NOT EXISTS idx_assessment_domains_framework ON assessment_domains(framework_id);
CREATE INDEX IF NOT EXISTS idx_assessment_domains_tenant ON assessment_domains(tenant_id);

CREATE INDEX IF NOT EXISTS idx_assessment_controls_domain ON assessment_controls(domain_id);
CREATE INDEX IF NOT EXISTS idx_assessment_controls_tenant ON assessment_controls(tenant_id);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_control ON assessment_questions(control_id);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_tenant ON assessment_questions(tenant_id);

CREATE INDEX IF NOT EXISTS idx_assessments_framework ON assessments(framework_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_responsavel ON assessments(responsavel_id);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_question ON assessment_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_tenant ON assessment_responses(tenant_id);

CREATE INDEX IF NOT EXISTS idx_assessment_action_plans_assessment ON assessment_action_plans(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_action_plans_tenant ON assessment_action_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessment_action_plans_status ON assessment_action_plans(status);

CREATE INDEX IF NOT EXISTS idx_assessment_reports_assessment ON assessment_reports(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_reports_tenant ON assessment_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessment_reports_tipo ON assessment_reports(tipo_relatorio);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE assessment_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para isolamento de tenants
CREATE POLICY assessment_frameworks_tenant_isolation ON assessment_frameworks
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY assessment_domains_tenant_isolation ON assessment_domains
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY assessment_controls_tenant_isolation ON assessment_controls
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY assessment_questions_tenant_isolation ON assessment_questions
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY assessments_tenant_isolation ON assessments
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY assessment_responses_tenant_isolation ON assessment_responses
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY assessment_action_plans_tenant_isolation ON assessment_action_plans
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY assessment_reports_tenant_isolation ON assessment_reports
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY assessment_history_tenant_isolation ON assessment_history
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- =====================================================
-- TRIGGERS PARA AUDITORIA E ATUALIZAÇÃO
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_assessment_frameworks_updated_at BEFORE UPDATE ON assessment_frameworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_domains_updated_at BEFORE UPDATE ON assessment_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_controls_updated_at BEFORE UPDATE ON assessment_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_questions_updated_at BEFORE UPDATE ON assessment_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_responses_updated_at BEFORE UPDATE ON assessment_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_action_plans_updated_at BEFORE UPDATE ON assessment_action_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE assessment_frameworks IS 'Frameworks de compliance e assessment (ISO 27001, SOX, NIST, etc.)';
COMMENT ON TABLE assessment_domains IS 'Domínios/áreas dentro de cada framework';
COMMENT ON TABLE assessment_controls IS 'Controles específicos dentro de cada domínio';
COMMENT ON TABLE assessment_questions IS 'Questões para avaliar cada controle';
COMMENT ON TABLE assessments IS 'Instâncias de avaliação/assessment';
COMMENT ON TABLE assessment_responses IS 'Respostas às questões dos assessments';
COMMENT ON TABLE assessment_action_plans IS 'Planos de ação para remediar gaps identificados';
COMMENT ON TABLE assessment_reports IS 'Relatórios gerados dos assessments';
COMMENT ON TABLE assessment_history IS 'Histórico de ações nos assessments';
COMMENT ON TABLE assessment_framework_templates IS 'Templates padrão de frameworks para importação';