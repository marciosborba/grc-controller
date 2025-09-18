-- Migration: Create Assessment Module
-- Description: Comprehensive assessment system for maturity, compliance and risk evaluation
-- Date: 2025-09-18

-- ==================================================
-- ASSESSMENT FRAMEWORKS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Basic Information
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    versao VARCHAR(20) DEFAULT '1.0',
    
    -- Framework Details
    tipo_framework VARCHAR(50) NOT NULL CHECK (tipo_framework IN (
        'compliance', 'security', 'privacy', 'operational', 'financial', 
        'governance', 'risk_management', 'quality', 'environmental', 'custom'
    )),
    categoria VARCHAR(100),
    padrao_origem VARCHAR(100), -- ISO 27001, NIST, SOX, LGPD, etc.
    industria_aplicavel TEXT[],
    
    -- Scoring Configuration
    escala_maturidade JSONB NOT NULL DEFAULT '{"levels": [
        {"value": 1, "name": "Inicial", "description": "Processos ad-hoc"},
        {"value": 2, "name": "Básico", "description": "Processos definidos"},
        {"value": 3, "name": "Intermediário", "description": "Processos documentados"},
        {"value": 4, "name": "Avançado", "description": "Processos otimizados"},
        {"value": 5, "name": "Otimizado", "description": "Melhoria contínua"}
    ]}',
    criterios_pontuacao JSONB,
    peso_total DECIMAL(5,2) DEFAULT 100.00,
    
    -- Status and Metadata
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_revisao', 'arquivado')),
    publico BOOLEAN DEFAULT false, -- Se disponível para todos os tenants
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    UNIQUE(tenant_id, codigo)
);

-- ==================================================
-- ASSESSMENT DOMAINS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES assessment_frameworks(id) ON DELETE CASCADE,
    
    -- Domain Information
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL DEFAULT 1,
    
    -- Scoring
    peso DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    peso_percentual DECIMAL(5,2),
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    UNIQUE(framework_id, codigo)
);

-- ==================================================
-- ASSESSMENT CONTROLS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES assessment_frameworks(id) ON DELETE CASCADE,
    domain_id UUID REFERENCES assessment_domains(id) ON DELETE CASCADE,
    
    -- Control Information
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    descricao TEXT,
    objetivo TEXT,
    ordem INTEGER NOT NULL DEFAULT 1,
    
    -- Control Details
    tipo_controle VARCHAR(50) CHECK (tipo_controle IN (
        'preventivo', 'detectivo', 'corretivo', 'compensatorio', 'diretivo'
    )),
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    
    -- Risk and Impact
    criticidade VARCHAR(20) DEFAULT 'media' CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
    impacto_potencial TEXT,
    
    -- Implementation
    guia_implementacao TEXT,
    evidencias_necessarias TEXT[],
    referencias_normativas TEXT[],
    
    -- Scoring
    peso DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    peso_percentual DECIMAL(5,2),
    pontuacao_maxima INTEGER DEFAULT 5,
    
    -- Status
    obrigatorio BOOLEAN DEFAULT true,
    ativo BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    UNIQUE(framework_id, codigo)
);

-- ==================================================
-- ASSESSMENT QUESTIONS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES assessment_controls(id) ON DELETE CASCADE,
    
    -- Question Information
    codigo VARCHAR(100),
    texto TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL DEFAULT 1,
    
    -- Question Type and Options
    tipo_pergunta VARCHAR(50) NOT NULL DEFAULT 'escala' CHECK (tipo_pergunta IN (
        'escala', 'sim_nao', 'multipla_escolha', 'texto_livre', 'numerica', 'data', 'arquivo'
    )),
    opcoes_resposta JSONB, -- Para múltipla escolha e escalas customizadas
    
    -- Validation Rules
    obrigatoria BOOLEAN DEFAULT true,
    valor_minimo DECIMAL(10,2),
    valor_maximo DECIMAL(10,2),
    regex_validacao VARCHAR(500),
    
    -- Scoring
    peso DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    mapeamento_pontuacao JSONB, -- Como cada resposta mapeia para pontuação
    
    -- Conditional Logic
    condicoes_exibicao JSONB, -- Quando mostrar esta pergunta
    dependencias TEXT[],
    
    -- Help and Guidance
    texto_ajuda TEXT,
    exemplos TEXT[],
    referencias TEXT[],
    
    -- Status
    ativa BOOLEAN DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- ==================================================
-- ASSESSMENTS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES assessment_frameworks(id) ON DELETE CASCADE,
    
    -- Assessment Information
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    descricao TEXT,
    
    -- Assessment Context
    area_avaliada VARCHAR(200),
    unidade_organizacional VARCHAR(200),
    escopo TEXT,
    objetivos TEXT[],
    
    -- Timing
    data_inicio DATE,
    data_fim_planejada DATE,
    data_fim_real DATE,
    duracao_planejada_dias INTEGER,
    
    -- People
    responsavel_assessment UUID REFERENCES profiles(id),
    coordenador_assessment UUID REFERENCES profiles(id),
    avaliadores UUID[] DEFAULT '{}',
    participantes UUID[] DEFAULT '{}',
    
    -- Status and Progress
    status VARCHAR(30) DEFAULT 'planejado' CHECK (status IN (
        'planejado', 'iniciado', 'em_andamento', 'em_revisao', 
        'aguardando_aprovacao', 'concluido', 'cancelado', 'suspenso'
    )),
    fase_atual VARCHAR(30) DEFAULT 'preparacao' CHECK (fase_atual IN (
        'preparacao', 'coleta_dados', 'analise', 'validacao', 'relatorio', 'plano_acao'
    )),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao >= 0 AND percentual_conclusao <= 100),
    
    -- Scoring Results
    pontuacao_total DECIMAL(8,2),
    pontuacao_maxima_possivel DECIMAL(8,2),
    percentual_maturidade DECIMAL(5,2),
    nivel_maturidade_geral INTEGER,
    nivel_maturidade_nome VARCHAR(100),
    
    -- Assessment Results Summary
    dominios_avaliados INTEGER DEFAULT 0,
    controles_avaliados INTEGER DEFAULT 0,
    controles_conformes INTEGER DEFAULT 0,
    controles_nao_conformes INTEGER DEFAULT 0,
    controles_parcialmente_conformes INTEGER DEFAULT 0,
    gaps_identificados INTEGER DEFAULT 0,
    
    -- Metadata
    configuracoes_especiais JSONB,
    tags TEXT[],
    
    -- External References
    projeto_auditoria_id UUID REFERENCES projetos_auditoria(id),
    compliance_framework_id UUID REFERENCES frameworks_compliance(id),
    risco_associado_id UUID,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    UNIQUE(tenant_id, codigo)
);

-- ==================================================
-- ASSESSMENT RESPONSES TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES assessment_controls(id) ON DELETE CASCADE,
    
    -- Response Data
    resposta_texto TEXT,
    resposta_numerica DECIMAL(15,4),
    resposta_booleana BOOLEAN,
    resposta_data DATE,
    resposta_multipla_escolha TEXT[],
    resposta_arquivo_urls TEXT[],
    
    -- Scoring
    pontuacao_obtida DECIMAL(8,2),
    pontuacao_maxima DECIMAL(8,2),
    percentual_conformidade DECIMAL(5,2),
    nivel_maturidade INTEGER,
    
    -- Response Analysis
    status_conformidade VARCHAR(30) CHECK (status_conformidade IN (
        'conforme', 'nao_conforme', 'parcialmente_conforme', 'nao_aplicavel', 'em_revisao'
    )),
    gap_identificado BOOLEAN DEFAULT false,
    criticidade_gap VARCHAR(20) CHECK (criticidade_gap IN ('baixa', 'media', 'alta', 'critica')),
    
    -- Evidence and Justification
    evidencias TEXT[],
    justificativa TEXT,
    comentarios TEXT,
    observacoes_avaliador TEXT,
    
    -- Review Process
    necessita_revisao BOOLEAN DEFAULT false,
    revisado BOOLEAN DEFAULT false,
    aprovado BOOLEAN DEFAULT false,
    data_revisao TIMESTAMPTZ,
    revisado_por UUID REFERENCES profiles(id),
    comentarios_revisao TEXT,
    
    -- Response Metadata
    respondido_por UUID REFERENCES profiles(id),
    data_resposta TIMESTAMPTZ DEFAULT NOW(),
    tempo_resposta_minutos INTEGER,
    fonte_informacao VARCHAR(200),
    confiabilidade_resposta INTEGER CHECK (confiabilidade_resposta >= 1 AND confiabilidade_resposta <= 5),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(assessment_id, question_id)
);

-- ==================================================
-- ACTION PLANS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    
    -- Action Plan Information
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    descricao TEXT,
    objetivo TEXT,
    
    -- Priority and Impact
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    impacto_esperado TEXT,
    beneficios_esperados TEXT[],
    
    -- Timeline
    data_inicio_planejada DATE,
    data_fim_planejada DATE,
    data_inicio_real DATE,
    data_fim_real DATE,
    
    -- Resources
    responsavel_plano UUID REFERENCES profiles(id),
    equipe_responsavel UUID[] DEFAULT '{}',
    orcamento_estimado DECIMAL(15,2),
    orcamento_aprovado DECIMAL(15,2),
    recursos_necessarios TEXT[],
    
    -- Status and Progress
    status VARCHAR(30) DEFAULT 'planejado' CHECK (status IN (
        'planejado', 'aprovado', 'iniciado', 'em_andamento', 
        'suspenso', 'concluido', 'cancelado', 'atrasado'
    )),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao >= 0 AND percentual_conclusao <= 100),
    
    -- Dependencies
    dependencias TEXT[],
    prerequisitos TEXT[],
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    UNIQUE(tenant_id, codigo)
);

-- ==================================================
-- ACTION PLAN ITEMS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action_plan_id UUID NOT NULL REFERENCES assessment_action_plans(id) ON DELETE CASCADE,
    response_id UUID REFERENCES assessment_responses(id),
    control_id UUID REFERENCES assessment_controls(id),
    
    -- Action Item Information
    codigo VARCHAR(100),
    titulo VARCHAR(300) NOT NULL,
    descricao TEXT,
    ordem INTEGER DEFAULT 1,
    
    -- Action Details
    tipo_acao VARCHAR(50) CHECK (tipo_acao IN (
        'implementacao', 'melhoria', 'correcao', 'documentacao', 
        'treinamento', 'monitoramento', 'auditoria', 'outro'
    )),
    categoria VARCHAR(100),
    
    -- Timeline
    data_inicio_planejada DATE,
    data_fim_planejada DATE,
    data_inicio_real DATE,
    data_fim_real DATE,
    
    -- Assignment
    responsavel UUID REFERENCES profiles(id),
    colaboradores UUID[] DEFAULT '{}',
    
    -- Status and Progress
    status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN (
        'pendente', 'iniciado', 'em_andamento', 'aguardando_aprovacao',
        'concluido', 'cancelado', 'suspenso', 'atrasado'
    )),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao >= 0 AND percentual_conclusao <= 100),
    
    -- Impact
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    impacto_estimado TEXT,
    custo_estimado DECIMAL(15,2),
    
    -- Deliverables
    entregaveis TEXT[],
    criterios_aceitacao TEXT[],
    evidencias_conclusao TEXT[],
    
    -- Comments and Notes
    comentarios TEXT,
    observacoes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- ==================================================
-- ASSESSMENT HISTORY TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS assessment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    
    -- Change Information
    acao VARCHAR(50) NOT NULL CHECK (acao IN (
        'criado', 'iniciado', 'resposta_adicionada', 'resposta_alterada', 
        'revisao_realizada', 'status_alterado', 'concluido', 'aprovado'
    )),
    descricao TEXT,
    
    -- Change Details
    dados_anteriores JSONB,
    dados_novos JSONB,
    campo_alterado VARCHAR(100),
    
    -- Context
    usuario_id UUID REFERENCES profiles(id),
    data_acao TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    metadados JSONB
);

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

-- Assessment Frameworks
CREATE INDEX idx_assessment_frameworks_tenant ON assessment_frameworks(tenant_id);
CREATE INDEX idx_assessment_frameworks_status ON assessment_frameworks(status);
CREATE INDEX idx_assessment_frameworks_tipo ON assessment_frameworks(tipo_framework);

-- Assessment Domains
CREATE INDEX idx_assessment_domains_framework ON assessment_domains(framework_id);
CREATE INDEX idx_assessment_domains_tenant ON assessment_domains(tenant_id);

-- Assessment Controls
CREATE INDEX idx_assessment_controls_framework ON assessment_controls(framework_id);
CREATE INDEX idx_assessment_controls_domain ON assessment_controls(domain_id);
CREATE INDEX idx_assessment_controls_tenant ON assessment_controls(tenant_id);
CREATE INDEX idx_assessment_controls_criticidade ON assessment_controls(criticidade);

-- Assessment Questions
CREATE INDEX idx_assessment_questions_control ON assessment_questions(control_id);
CREATE INDEX idx_assessment_questions_tenant ON assessment_questions(tenant_id);
CREATE INDEX idx_assessment_questions_tipo ON assessment_questions(tipo_pergunta);

-- Assessments
CREATE INDEX idx_assessments_tenant ON assessments(tenant_id);
CREATE INDEX idx_assessments_framework ON assessments(framework_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_responsavel ON assessments(responsavel_assessment);
CREATE INDEX idx_assessments_data_inicio ON assessments(data_inicio);

-- Assessment Responses
CREATE INDEX idx_assessment_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX idx_assessment_responses_question ON assessment_responses(question_id);
CREATE INDEX idx_assessment_responses_control ON assessment_responses(control_id);
CREATE INDEX idx_assessment_responses_tenant ON assessment_responses(tenant_id);
CREATE INDEX idx_assessment_responses_status ON assessment_responses(status_conformidade);

-- Action Plans
CREATE INDEX idx_action_plans_tenant ON assessment_action_plans(tenant_id);
CREATE INDEX idx_action_plans_assessment ON assessment_action_plans(assessment_id);
CREATE INDEX idx_action_plans_status ON assessment_action_plans(status);
CREATE INDEX idx_action_plans_responsavel ON assessment_action_plans(responsavel_plano);

-- Action Items
CREATE INDEX idx_action_items_plan ON assessment_action_items(action_plan_id);
CREATE INDEX idx_action_items_tenant ON assessment_action_items(tenant_id);
CREATE INDEX idx_action_items_status ON assessment_action_items(status);
CREATE INDEX idx_action_items_responsavel ON assessment_action_items(responsavel);

-- History
CREATE INDEX idx_assessment_history_assessment ON assessment_history(assessment_id);
CREATE INDEX idx_assessment_history_tenant ON assessment_history(tenant_id);
CREATE INDEX idx_assessment_history_data ON assessment_history(data_acao);

-- ==================================================
-- ROW LEVEL SECURITY POLICIES
-- ==================================================

-- Enable RLS on all tables
ALTER TABLE assessment_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_history ENABLE ROW LEVEL SECURITY;

-- Policies for assessment_frameworks
CREATE POLICY "assessment_frameworks_tenant_policy" ON assessment_frameworks
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    ) OR publico = true
);

-- Policies for assessment_domains
CREATE POLICY "assessment_domains_tenant_policy" ON assessment_domains
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Policies for assessment_controls
CREATE POLICY "assessment_controls_tenant_policy" ON assessment_controls
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Policies for assessment_questions
CREATE POLICY "assessment_questions_tenant_policy" ON assessment_questions
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Policies for assessments
CREATE POLICY "assessments_tenant_policy" ON assessments
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Policies for assessment_responses
CREATE POLICY "assessment_responses_tenant_policy" ON assessment_responses
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Policies for assessment_action_plans
CREATE POLICY "assessment_action_plans_tenant_policy" ON assessment_action_plans
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Policies for assessment_action_items
CREATE POLICY "assessment_action_items_tenant_policy" ON assessment_action_items
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Policies for assessment_history
CREATE POLICY "assessment_history_tenant_policy" ON assessment_history
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- ==================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- ==================================================

-- Function to calculate assessment score
CREATE OR REPLACE FUNCTION calculate_assessment_score(assessment_uuid UUID)
RETURNS TABLE(
    total_score DECIMAL,
    max_possible_score DECIMAL,
    maturity_percentage DECIMAL,
    maturity_level INTEGER
) AS $$
DECLARE
    framework_levels JSONB;
    total_responses DECIMAL := 0;
    max_responses DECIMAL := 0;
    maturity_percent DECIMAL := 0;
    maturity_lvl INTEGER := 1;
BEGIN
    -- Get framework maturity levels
    SELECT escala_maturidade INTO framework_levels
    FROM assessment_frameworks af
    JOIN assessments a ON af.id = a.framework_id
    WHERE a.id = assessment_uuid;
    
    -- Calculate total scores
    SELECT 
        COALESCE(SUM(ar.pontuacao_obtida), 0),
        COALESCE(SUM(ar.pontuacao_maxima), 0)
    INTO total_responses, max_responses
    FROM assessment_responses ar
    WHERE ar.assessment_id = assessment_uuid;
    
    -- Calculate maturity percentage
    IF max_responses > 0 THEN
        maturity_percent := (total_responses / max_responses) * 100;
    END IF;
    
    -- Determine maturity level based on percentage
    maturity_lvl := CASE 
        WHEN maturity_percent >= 90 THEN 5
        WHEN maturity_percent >= 75 THEN 4
        WHEN maturity_percent >= 60 THEN 3
        WHEN maturity_percent >= 40 THEN 2
        ELSE 1
    END;
    
    RETURN QUERY SELECT 
        total_responses,
        max_responses,
        maturity_percent,
        maturity_lvl;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update assessment progress
CREATE OR REPLACE FUNCTION update_assessment_progress(assessment_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_questions INTEGER := 0;
    answered_questions INTEGER := 0;
    progress_percent INTEGER := 0;
BEGIN
    -- Count total questions
    SELECT COUNT(*)
    INTO total_questions
    FROM assessment_questions aq
    JOIN assessment_controls ac ON aq.control_id = ac.id
    JOIN assessments a ON ac.framework_id = a.framework_id
    WHERE a.id = assessment_uuid AND aq.ativa = true;
    
    -- Count answered questions
    SELECT COUNT(*)
    INTO answered_questions
    FROM assessment_responses ar
    WHERE ar.assessment_id = assessment_uuid;
    
    -- Calculate progress
    IF total_questions > 0 THEN
        progress_percent := (answered_questions * 100) / total_questions;
    END IF;
    
    -- Update assessment
    UPDATE assessments 
    SET 
        percentual_conclusao = progress_percent,
        updated_at = NOW()
    WHERE id = assessment_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate domain scores for an assessment
CREATE OR REPLACE FUNCTION calculate_domain_scores(p_assessment_id UUID, p_tenant_id UUID)
RETURNS TABLE(
    domain_id UUID,
    domain_name TEXT,
    domain_order INTEGER,
    total_score DECIMAL,
    max_score DECIMAL,
    score_percentage DECIMAL,
    controls_count INTEGER,
    answered_controls INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ad.id as domain_id,
        ad.nome as domain_name,
        ad.ordem as domain_order,
        COALESCE(SUM(ar.pontuacao_obtida), 0) as total_score,
        COALESCE(SUM(ar.pontuacao_maxima), 0) as max_score,
        CASE 
            WHEN COALESCE(SUM(ar.pontuacao_maxima), 0) > 0 
            THEN (COALESCE(SUM(ar.pontuacao_obtida), 0) / COALESCE(SUM(ar.pontuacao_maxima), 0)) * 100
            ELSE 0 
        END as score_percentage,
        COUNT(DISTINCT ac.id)::INTEGER as controls_count,
        COUNT(DISTINCT ar.control_id)::INTEGER as answered_controls
    FROM assessment_domains ad
    JOIN assessment_controls ac ON ad.id = ac.domain_id
    JOIN assessments a ON ad.framework_id = a.framework_id
    LEFT JOIN assessment_responses ar ON ac.id = ar.control_id AND ar.assessment_id = p_assessment_id
    WHERE a.id = p_assessment_id 
        AND ad.tenant_id = p_tenant_id
        AND ac.tenant_id = p_tenant_id
        AND ad.ativo = true
        AND ac.ativo = true
    GROUP BY ad.id, ad.nome, ad.ordem
    ORDER BY ad.ordem;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;