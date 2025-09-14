-- =====================================================
-- MÓDULO DE PLANEJAMENTO DE AUDITORIA
-- Criado em: 2025-09-14
-- Descrição: Tabelas específicas para planejamento de trabalhos de auditoria
-- =====================================================

-- 1. PLANOS DE AUDITORIA ANUAIS
-- Planos mestres que contêm múltiplos trabalhos
CREATE TABLE IF NOT EXISTS planos_auditoria_anuais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    ano_exercicio INTEGER NOT NULL,
    descricao TEXT,
    data_aprovacao DATE,
    aprovado_por UUID REFERENCES profiles(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'in_progress', 'completed')),
    total_horas_planejadas DECIMAL(10,2),
    total_recursos_orcados DECIMAL(15,2),
    observacoes TEXT,
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    CONSTRAINT uk_plano_auditoria_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 2. TRABALHOS DE AUDITORIA (dentro dos planos)
-- Trabalhos específicos a serem executados
CREATE TABLE IF NOT EXISTS trabalhos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plano_anual_id UUID REFERENCES planos_auditoria_anuais(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    objetivos TEXT[] NOT NULL, -- Array de objetivos
    escopo TEXT NOT NULL,
    tipo_auditoria VARCHAR(50) NOT NULL CHECK (tipo_auditoria IN ('compliance', 'operational', 'financial', 'it', 'investigative', 'follow_up')),
    area_auditada VARCHAR(255) NOT NULL,
    unidade_organizacional VARCHAR(255),
    nivel_risco VARCHAR(20) CHECK (nivel_risco IN ('baixo', 'medio', 'alto', 'critico')),
    frequencia VARCHAR(30) CHECK (frequencia IN ('anual', 'semestral', 'trimestral', 'mensal', 'ad_hoc')),
    
    -- Datas e cronograma
    data_inicio_planejada DATE NOT NULL,
    data_fim_planejada DATE NOT NULL,
    duracao_dias INTEGER GENERATED ALWAYS AS (data_fim_planejada - data_inicio_planejada + 1) STORED,
    
    -- Recursos
    auditor_lider UUID NOT NULL REFERENCES profiles(id),
    equipe_auditores UUID[] DEFAULT '{}', -- Array de IDs dos auditores
    horas_planejadas DECIMAL(8,2) NOT NULL,
    orcamento_estimado DECIMAL(12,2),
    
    -- Status e progresso
    status VARCHAR(30) DEFAULT 'planejado' CHECK (status IN ('planejado', 'aprovado', 'iniciado', 'em_andamento', 'suspenso', 'concluido', 'cancelado')),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Dependências e pré-requisitos
    prerequisitos TEXT[],
    dependencias_externas TEXT[],
    recursos_necessarios TEXT[],
    
    prioridade INTEGER CHECK (prioridade BETWEEN 1 AND 5) DEFAULT 3,
    observacoes TEXT,
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_trabalho_codigo_plano UNIQUE (plano_anual_id, codigo)
);

-- 3. PROCEDIMENTOS DE AUDITORIA
-- Procedimentos específicos dentro de cada trabalho
CREATE TABLE IF NOT EXISTS procedimentos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    trabalho_id UUID NOT NULL REFERENCES trabalhos_auditoria(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    objetivo TEXT NOT NULL,
    tipo_procedimento VARCHAR(50) CHECK (tipo_procedimento IN ('analytical', 'substantive', 'compliance', 'walkthrough', 'inquiry', 'observation', 'inspection', 'confirmation')),
    
    -- Execução
    responsavel_id UUID NOT NULL REFERENCES profiles(id),
    data_inicio_planejada DATE,
    data_fim_planejada DATE,
    horas_estimadas DECIMAL(6,2),
    
    -- Controles e testes
    controle_testado VARCHAR(255),
    populacao_teste TEXT,
    metodo_selecao_amostra VARCHAR(100),
    tamanho_amostra INTEGER,
    criterios_aceitacao TEXT,
    
    -- Status
    status VARCHAR(30) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'nao_aplicavel')),
    ordem_execucao INTEGER,
    
    -- Documentação
    documentos_necessarios TEXT[],
    evidencias_esperadas TEXT[],
    referencias_normativas TEXT[],
    
    observacoes TEXT,
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_procedimento_codigo_trabalho UNIQUE (trabalho_id, codigo)
);

-- 4. CRONOGRAMA DETALHADO
-- Timeline detalhada de execução dos trabalhos
CREATE TABLE IF NOT EXISTS cronograma_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    trabalho_id UUID NOT NULL REFERENCES trabalhos_auditoria(id) ON DELETE CASCADE,
    fase VARCHAR(50) NOT NULL CHECK (fase IN ('planejamento', 'preparacao', 'fieldwork', 'relatorio', 'followup')),
    atividade VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Cronograma
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horas_alocadas DECIMAL(6,2),
    
    -- Recursos
    responsavel_id UUID REFERENCES profiles(id),
    recursos_necessarios TEXT[],
    dependencias TEXT[],
    
    -- Status
    status VARCHAR(30) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'atrasado', 'cancelado')),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Marcos
    e_marco BOOLEAN DEFAULT FALSE,
    criticidade VARCHAR(20) CHECK (criticidade IN ('baixa', 'media', 'alta')),
    
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORÇAMENTO E RECURSOS
-- Detalhamento de custos e recursos por trabalho
CREATE TABLE IF NOT EXISTS orcamento_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    trabalho_id UUID NOT NULL REFERENCES trabalhos_auditoria(id) ON DELETE CASCADE,
    categoria VARCHAR(100) NOT NULL, -- 'pessoal', 'viagens', 'tecnologia', 'consultoria', 'outros'
    item VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Valores
    quantidade DECIMAL(10,2) NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(12,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
    
    -- Período
    periodo_inicio DATE,
    periodo_fim DATE,
    
    -- Aprovação
    aprovado BOOLEAN DEFAULT FALSE,
    aprovado_por UUID REFERENCES profiles(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MATRIZ DE RISCOS DO PLANEJAMENTO
-- Riscos específicos do planejamento de auditoria
CREATE TABLE IF NOT EXISTS riscos_planejamento_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    trabalho_id UUID REFERENCES trabalhos_auditoria(id),
    plano_anual_id UUID REFERENCES planos_auditoria_anuais(id),
    
    codigo VARCHAR(50) NOT NULL,
    descricao_risco TEXT NOT NULL,
    categoria VARCHAR(100), -- 'prazo', 'recursos', 'acesso', 'qualidade', 'regulatorio', 'reputacional'
    
    -- Avaliação
    probabilidade INTEGER CHECK (probabilidade BETWEEN 1 AND 5) NOT NULL,
    impacto INTEGER CHECK (impacto BETWEEN 1 AND 5) NOT NULL,
    risco_inerente INTEGER GENERATED ALWAYS AS (probabilidade * impacto) STORED,
    
    -- Resposta
    estrategia_resposta VARCHAR(50) CHECK (estrategia_resposta IN ('aceitar', 'mitigar', 'transferir', 'evitar')),
    acoes_mitigacao TEXT[],
    responsavel_mitigacao UUID REFERENCES profiles(id),
    prazo_mitigacao DATE,
    
    -- Status
    status VARCHAR(30) DEFAULT 'identificado' CHECK (status IN ('identificado', 'em_tratamento', 'tratado', 'materializado')),
    
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Planos Anuais
CREATE INDEX IF NOT EXISTS idx_planos_aud_tenant ON planos_auditoria_anuais(tenant_id);
CREATE INDEX IF NOT EXISTS idx_planos_aud_ano ON planos_auditoria_anuais(ano_exercicio);
CREATE INDEX IF NOT EXISTS idx_planos_aud_status ON planos_auditoria_anuais(status);

-- Trabalhos
CREATE INDEX IF NOT EXISTS idx_trabalhos_aud_tenant ON trabalhos_auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trabalhos_aud_plano ON trabalhos_auditoria(plano_anual_id);
CREATE INDEX IF NOT EXISTS idx_trabalhos_aud_lider ON trabalhos_auditoria(auditor_lider);
CREATE INDEX IF NOT EXISTS idx_trabalhos_aud_status ON trabalhos_auditoria(status);
CREATE INDEX IF NOT EXISTS idx_trabalhos_aud_datas ON trabalhos_auditoria(data_inicio_planejada, data_fim_planejada);

-- Procedimentos
CREATE INDEX IF NOT EXISTS idx_proc_aud_tenant ON procedimentos_auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_proc_aud_trabalho ON procedimentos_auditoria(trabalho_id);
CREATE INDEX IF NOT EXISTS idx_proc_aud_responsavel ON procedimentos_auditoria(responsavel_id);

-- Cronograma
CREATE INDEX IF NOT EXISTS idx_cronograma_aud_tenant ON cronograma_auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cronograma_aud_trabalho ON cronograma_auditoria(trabalho_id);
CREATE INDEX IF NOT EXISTS idx_cronograma_aud_datas ON cronograma_auditoria(data_inicio, data_fim);

-- Orçamento
CREATE INDEX IF NOT EXISTS idx_orcamento_aud_tenant ON orcamento_auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_aud_trabalho ON orcamento_auditoria(trabalho_id);

-- Riscos
CREATE INDEX IF NOT EXISTS idx_riscos_plan_aud_tenant ON riscos_planejamento_auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_riscos_plan_aud_trabalho ON riscos_planejamento_auditoria(trabalho_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE planos_auditoria_anuais ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabalhos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE riscos_planejamento_auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança por tenant
CREATE POLICY IF NOT EXISTS planos_aud_anuais_tenant_policy ON planos_auditoria_anuais
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS trabalhos_aud_tenant_policy ON trabalhos_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS proc_aud_tenant_policy ON procedimentos_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS cronograma_aud_tenant_policy ON cronograma_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS orcamento_aud_tenant_policy ON orcamento_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS riscos_plan_aud_tenant_policy ON riscos_planejamento_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Function para atualizar timestamp
CREATE OR REPLACE FUNCTION update_planejamento_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER IF NOT EXISTS tr_planos_aud_anuais_updated_at 
BEFORE UPDATE ON planos_auditoria_anuais 
FOR EACH ROW EXECUTE FUNCTION update_planejamento_updated_at();

CREATE TRIGGER IF NOT EXISTS tr_trabalhos_aud_updated_at 
BEFORE UPDATE ON trabalhos_auditoria 
FOR EACH ROW EXECUTE FUNCTION update_planejamento_updated_at();

CREATE TRIGGER IF NOT EXISTS tr_proc_aud_updated_at 
BEFORE UPDATE ON procedimentos_auditoria 
FOR EACH ROW EXECUTE FUNCTION update_planejamento_updated_at();

-- =====================================================
-- DADOS DE EXEMPLO PARA QA
-- =====================================================

-- 1. Plano Anual de Auditoria 2025
INSERT INTO planos_auditoria_anuais (
    tenant_id, codigo, titulo, ano_exercicio, descricao, 
    data_aprovacao, status, total_horas_planejadas, total_recursos_orcados,
    created_by, updated_by
) VALUES (
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    'PAA-2025',
    'Plano Anual de Auditoria 2025',
    2025,
    'Plano anual de auditoria interna contemplando os principais processos organizacionais com base na avaliação de riscos.',
    '2024-12-15',
    'approved',
    2400.0,
    350000.00,
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- 2. Trabalhos de Auditoria
INSERT INTO trabalhos_auditoria (
    tenant_id, plano_anual_id, codigo, titulo, descricao, objetivos, escopo,
    tipo_auditoria, area_auditada, nivel_risco, frequencia,
    data_inicio_planejada, data_fim_planejada, auditor_lider,
    horas_planejadas, orcamento_estimado, status, prioridade,
    prerequisitos, recursos_necessarios,
    created_by, updated_by
) VALUES 
-- Trabalho 1: Auditoria de Contas a Pagar
(
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    (SELECT id FROM planos_auditoria_anuais WHERE codigo = 'PAA-2025'),
    'TAD-2025-001',
    'Auditoria do Processo de Contas a Pagar',
    'Auditoria operacional e de compliance do processo de contas a pagar, incluindo aprovações, pagamentos e controles preventivos.',
    ARRAY['Avaliar efetividade dos controles internos', 'Verificar compliance com políticas', 'Identificar oportunidades de melhoria', 'Validar segregação de funções'],
    'Processo completo desde recebimento da fatura até pagamento, incluindo aprovações, três vias e controles de duplicatas',
    'operational',
    'Financeiro - Contas a Pagar',
    'alto',
    'anual',
    '2025-02-03',
    '2025-03-14',
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    240.0,
    45000.00,
    'planejado',
    4,
    ARRAY['Aprovação do orçamento anual', 'Disponibilidade da equipe financeira', 'Acesso aos sistemas ERP'],
    ARRAY['Analista de auditoria sênior', 'Especialista em processos financeiros', 'Acesso total ao sistema ERP'],
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1)
),
-- Trabalho 2: Auditoria de TI
(
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    (SELECT id FROM planos_auditoria_anuais WHERE codigo = 'PAA-2025'),
    'TAD-2025-002',
    'Auditoria de Segurança da Informação',
    'Avaliação dos controles de TI, segurança cibernética, backup, gestão de acessos e conformidade com LGPD.',
    ARRAY['Avaliar controles de acesso aos sistemas', 'Verificar políticas de backup e recovery', 'Validar compliance LGPD', 'Testar controles de segurança da rede'],
    'Infraestrutura de TI, sistemas críticos, controles de acesso, backup, monitoramento de segurança e proteção de dados pessoais',
    'it',
    'Tecnologia da Informação',
    'critico',
    'anual',
    '2025-04-07',
    '2025-05-16',
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    320.0,
    75000.00,
    'planejado',
    5,
    ARRAY['Consultoria externa especializada em TI', 'Mapeamento completo da infraestrutura', 'Coordenação com área de TI'],
    ARRAY['Auditor especialista em TI', 'Consultor externo de cybersecurity', 'Ferramentas de teste de penetração'],
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1)
),
-- Trabalho 3: Follow-up
(
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    (SELECT id FROM planos_auditoria_anuais WHERE codigo = 'PAA-2025'),
    'TAD-2025-003',
    'Follow-up de Recomendações 2024',
    'Acompanhamento da implementação das recomendações emitidas nas auditorias realizadas em 2024.',
    ARRAY['Verificar implementação de recomendações', 'Avaliar efetividade das ações corretivas', 'Identificar recomendações pendentes', 'Atualizar status no sistema'],
    'Todas as recomendações emitidas entre janeiro e dezembro de 2024, classificadas como média e alta criticidade',
    'follow_up',
    'Todas as áreas auditadas em 2024',
    'medio',
    'semestral',
    '2025-06-02',
    '2025-06-27',
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    120.0,
    18000.00,
    'planejado',
    3,
    ARRAY['Relatórios de auditoria de 2024', 'Planos de ação das áreas auditadas'],
    ARRAY['Analista de auditoria', 'Acesso ao sistema de gestão de recomendações'],
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1),
    (SELECT id FROM profiles WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f' LIMIT 1)
) ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE planos_auditoria_anuais IS 'Planos anuais de auditoria aprovados pela alta administração';
COMMENT ON TABLE trabalhos_auditoria IS 'Trabalhos específicos de auditoria dentro dos planos anuais';
COMMENT ON TABLE procedimentos_auditoria IS 'Procedimentos detalhados de auditoria para cada trabalho';
COMMENT ON TABLE cronograma_auditoria IS 'Cronograma detalhado de execução dos trabalhos';
COMMENT ON TABLE orcamento_auditoria IS 'Orçamento e recursos alocados por trabalho';
COMMENT ON TABLE riscos_planejamento_auditoria IS 'Riscos identificados no planejamento dos trabalhos';