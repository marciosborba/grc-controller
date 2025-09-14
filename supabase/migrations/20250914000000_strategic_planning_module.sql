-- =====================================================
-- MÓDULO PLANEJAMENTO ESTRATÉGICO
-- Sistema integrado de planejamento organizacional
-- =====================================================

-- 1. PLANOS ESTRATÉGICOS
-- Planos estratégicos organizacionais de alto nível
CREATE TABLE planos_estrategicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Período de vigência
    ano_inicio INTEGER NOT NULL,
    ano_fim INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    
    -- Estrutura hierárquica
    plano_pai_id UUID REFERENCES planos_estrategicos(id),
    nivel VARCHAR(50) CHECK (nivel IN ('corporativo', 'divisional', 'operacional', 'projeto')),
    
    -- Status e governança
    status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_aprovacao', 'aprovado', 'em_execucao', 'concluido', 'cancelado', 'suspenso')),
    responsavel_id UUID REFERENCES profiles(id),
    aprovador_id UUID REFERENCES profiles(id),
    data_aprovacao DATE,
    
    -- Orçamento
    orcamento_total DECIMAL(15,2),
    orcamento_consumido DECIMAL(15,2) DEFAULT 0,
    
    -- Progresso
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Metadados e configurações
    configuracoes JSONB DEFAULT '{}',
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_plano_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 2. OBJETIVOS ESTRATÉGICOS
-- Objetivos vinculados aos planos estratégicos
CREATE TABLE objetivos_estrategicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plano_estrategico_id UUID NOT NULL REFERENCES planos_estrategicos(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    
    -- Classificação
    categoria VARCHAR(100), -- Financeiro, Cliente, Processo, Aprendizado
    prioridade VARCHAR(20) CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    tipo VARCHAR(50) CHECK (tipo IN ('quantitativo', 'qualitativo', 'marco')),
    
    -- Período
    data_inicio DATE NOT NULL,
    data_fim_planejada DATE NOT NULL,
    data_fim_real DATE,
    
    -- Responsabilidades
    responsavel_id UUID NOT NULL REFERENCES profiles(id),
    equipe_ids UUID[],
    sponsors UUID[],
    
    -- Orçamento
    orcamento_aprovado DECIMAL(12,2),
    orcamento_realizado DECIMAL(12,2) DEFAULT 0,
    
    -- Status e progresso
    status VARCHAR(50) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'em_risco', 'atrasado', 'concluido', 'cancelado')),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Meta e resultado
    meta_descricao TEXT,
    meta_valor_inicial DECIMAL(15,4),
    meta_valor_alvo DECIMAL(15,4),
    valor_atual DECIMAL(15,4),
    unidade_medida VARCHAR(50),
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_objetivo_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 3. INICIATIVAS ESTRATÉGICAS
-- Projetos e iniciativas para alcançar objetivos
CREATE TABLE iniciativas_estrategicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    objetivo_id UUID NOT NULL REFERENCES objetivos_estrategicos(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    
    -- Tipo e categoria
    tipo VARCHAR(50) CHECK (tipo IN ('projeto', 'programa', 'processo', 'acao_continua')),
    categoria VARCHAR(100),
    complexidade VARCHAR(20) CHECK (complexidade IN ('baixa', 'media', 'alta', 'muito_alta')),
    
    -- Cronograma
    data_inicio DATE NOT NULL,
    data_fim_planejada DATE NOT NULL,
    data_fim_real DATE,
    duracao_planejada INTEGER, -- Em dias
    duracao_real INTEGER,
    
    -- Recursos
    responsavel_id UUID NOT NULL REFERENCES profiles(id),
    gerente_projeto_id UUID REFERENCES profiles(id),
    equipe_ids UUID[],
    horas_planejadas DECIMAL(8,2),
    horas_realizadas DECIMAL(8,2) DEFAULT 0,
    
    -- Orçamento
    orcamento_planejado DECIMAL(12,2),
    orcamento_aprovado DECIMAL(12,2),
    orcamento_realizado DECIMAL(12,2) DEFAULT 0,
    
    -- Status e saúde
    status VARCHAR(50) DEFAULT 'planejado' CHECK (status IN ('planejado', 'iniciado', 'em_andamento', 'em_risco', 'atrasado', 'pausado', 'concluido', 'cancelado')),
    saude_projeto VARCHAR(20) CHECK (saude_projeto IN ('verde', 'amarelo', 'vermelho')),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Deliverables e benefícios
    deliverables TEXT[],
    beneficios_esperados TEXT,
    beneficios_realizados TEXT,
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_iniciativa_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 4. MARCOS E MILESTONES
-- Marcos importantes nos planos e iniciativas
CREATE TABLE marcos_planejamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Pode ser vinculado a diferentes entidades
    plano_estrategico_id UUID REFERENCES planos_estrategicos(id),
    objetivo_id UUID REFERENCES objetivos_estrategicos(id),
    iniciativa_id UUID REFERENCES iniciativas_estrategicas(id),
    
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Tipo e criticidade
    tipo VARCHAR(50) CHECK (tipo IN ('marco_projeto', 'entrega', 'aprovacao', 'revisao', 'go_no_go', 'auditoria')),
    criticidade VARCHAR(20) CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
    
    -- Cronograma
    data_planejada DATE NOT NULL,
    data_baseline DATE,
    data_real DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'atrasado', 'cancelado')),
    
    -- Critérios de sucesso
    criterios_sucesso TEXT[],
    evidencias_conclusao TEXT[],
    aprovador_id UUID REFERENCES profiles(id),
    data_aprovacao DATE,
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- 5. KPIS E MÉTRICAS
-- Indicadores de performance para objetivos e iniciativas
CREATE TABLE kpis_planejamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    objetivo_id UUID REFERENCES objetivos_estrategicos(id),
    iniciativa_id UUID REFERENCES iniciativas_estrategicas(id),
    
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Configuração da métrica
    tipo_metrica VARCHAR(50) CHECK (tipo_metrica IN ('contador', 'percentual', 'razao', 'media', 'tempo', 'moeda')),
    unidade_medida VARCHAR(50),
    frequencia_coleta VARCHAR(50) CHECK (frequencia_coleta IN ('diaria', 'semanal', 'mensal', 'trimestral', 'semestral', 'anual')),
    
    -- Metas e limites
    valor_baseline DECIMAL(15,4),
    meta_valor DECIMAL(15,4) NOT NULL,
    limite_amarelo DECIMAL(15,4),
    limite_vermelho DECIMAL(15,4),
    direcao_melhoria VARCHAR(20) CHECK (direcao_melhoria IN ('crescente', 'decrescente', 'estavel')),
    
    -- Responsabilidades
    responsavel_coleta_id UUID REFERENCES profiles(id),
    responsavel_analise_id UUID REFERENCES profiles(id),
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    -- Fórmula de cálculo
    formula_calculo TEXT,
    fonte_dados VARCHAR(255),
    sistema_origem VARCHAR(255),
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_kpi_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 6. MEDIÇÕES DE KPIS
-- Valores coletados dos KPIs ao longo do tempo
CREATE TABLE medicoes_kpi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    kpi_id UUID NOT NULL REFERENCES kpis_planejamento(id) ON DELETE CASCADE,
    
    -- Período da medição
    data_medicao DATE NOT NULL,
    periodo_inicio DATE,
    periodo_fim DATE,
    
    -- Valores
    valor_medido DECIMAL(15,4) NOT NULL,
    valor_acumulado DECIMAL(15,4),
    comentario TEXT,
    
    -- Status da medição
    status_medicao VARCHAR(20) CHECK (status_medicao IN ('verde', 'amarelo', 'vermelho')),
    desvio_percentual DECIMAL(5,2),
    
    -- Quem coletou
    coletado_por UUID REFERENCES profiles(id),
    aprovado_por UUID REFERENCES profiles(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    
    -- Evidências
    evidencias JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_medicao_kpi_data UNIQUE (kpi_id, data_medicao)
);

-- 7. CRONOGRAMAS DETALHADOS
-- Cronogramas detalhados para iniciativas e projetos
CREATE TABLE cronograma_atividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    iniciativa_id UUID NOT NULL REFERENCES iniciativas_estrategicas(id) ON DELETE CASCADE,
    
    -- Identificação da atividade
    codigo VARCHAR(50),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Hierarquia (WBS - Work Breakdown Structure)
    atividade_pai_id UUID REFERENCES cronograma_atividades(id),
    nivel INTEGER DEFAULT 1,
    ordem_exibicao INTEGER,
    
    -- Cronograma
    data_inicio_planejada DATE NOT NULL,
    data_fim_planejada DATE NOT NULL,
    data_inicio_real DATE,
    data_fim_real DATE,
    duracao_planejada INTEGER, -- Em dias
    duracao_real INTEGER,
    
    -- Recursos
    responsavel_id UUID REFERENCES profiles(id),
    recursos_ids UUID[],
    horas_planejadas DECIMAL(6,2),
    horas_realizadas DECIMAL(6,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'pausado', 'concluido', 'cancelado')),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Dependências
    dependencias UUID[], -- IDs de atividades predecessoras
    tipo_dependencia VARCHAR(20) DEFAULT 'finish_to_start' CHECK (tipo_dependencia IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
    
    -- Tipo de atividade
    tipo VARCHAR(50) CHECK (tipo IN ('tarefa', 'marco', 'fase', 'entrega')),
    critica BOOLEAN DEFAULT false, -- Se está no caminho crítico
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- 8. RISCOS DE PLANEJAMENTO
-- Riscos identificados nos planos estratégicos
CREATE TABLE riscos_planejamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Vinculação (pode ser a qualquer nível)
    plano_estrategico_id UUID REFERENCES planos_estrategicos(id),
    objetivo_id UUID REFERENCES objetivos_estrategicos(id),
    iniciativa_id UUID REFERENCES iniciativas_estrategicas(id),
    atividade_id UUID REFERENCES cronograma_atividades(id),
    
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    
    -- Classificação
    categoria VARCHAR(100), -- Técnico, Recursos, Cronograma, Orçamento, Externa
    tipo_impacto VARCHAR(100), -- Custo, Cronograma, Qualidade, Escopo
    
    -- Avaliação de risco
    probabilidade INTEGER CHECK (probabilidade BETWEEN 1 AND 5),
    impacto INTEGER CHECK (impacto BETWEEN 1 AND 5),
    risco_inerente INTEGER GENERATED ALWAYS AS (probabilidade * impacto) STORED,
    
    -- Após mitigação
    probabilidade_pos_mitigacao INTEGER CHECK (probabilidade_pos_mitigacao BETWEEN 1 AND 5),
    impacto_pos_mitigacao INTEGER CHECK (impacto_pos_mitigacao BETWEEN 1 AND 5),
    risco_residual INTEGER GENERATED ALWAYS AS (probabilidade_pos_mitigacao * impacto_pos_mitigacao) STORED,
    
    -- Gestão do risco
    estrategia_resposta VARCHAR(50) CHECK (estrategia_resposta IN ('aceitar', 'mitigar', 'transferir', 'evitar')),
    plano_mitigacao TEXT,
    plano_contingencia TEXT,
    
    -- Responsabilidades
    responsavel_id UUID NOT NULL REFERENCES profiles(id),
    
    -- Status
    status VARCHAR(50) DEFAULT 'identificado' CHECK (status IN ('identificado', 'em_monitoramento', 'materializado', 'mitigado', 'encerrado')),
    data_identificacao DATE DEFAULT CURRENT_DATE,
    data_materializacao DATE,
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_risco_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 9. DASHBOARDS DE PLANEJAMENTO
-- Configuração de dashboards personalizados
CREATE TABLE dashboards_planejamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('estrategico', 'operacional', 'projeto', 'kpi', 'risco')),
    
    -- Configuração do dashboard
    configuracao JSONB NOT NULL DEFAULT '{}',
    layout JSONB DEFAULT '{}',
    filtros_padrao JSONB DEFAULT '{}',
    
    -- Permissões e visibilidade
    proprietario_id UUID NOT NULL REFERENCES profiles(id),
    visibilidade VARCHAR(20) CHECK (visibilidade IN ('privado', 'time', 'publico')) DEFAULT 'privado',
    usuarios_acesso UUID[],
    roles_acesso TEXT[],
    
    -- Configurações de atualização
    auto_refresh BOOLEAN DEFAULT false,
    refresh_interval INTEGER, -- Em minutos
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- 10. NOTIFICAÇÕES DE PLANEJAMENTO
-- Sistema de notificações e alertas
CREATE TABLE notificacoes_planejamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Configuração da notificação
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('prazo_vencendo', 'marco_atrasado', 'kpi_fora_meta', 'risco_alto', 'aprovacao_pendente', 'status_mudou')),
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    
    -- Relacionamento com entidades
    entidade_tipo VARCHAR(50) NOT NULL, -- plano, objetivo, iniciativa, marco, kpi
    entidade_id UUID NOT NULL,
    
    -- Destinatários
    destinatario_id UUID REFERENCES profiles(id),
    grupo_notificacao VARCHAR(100), -- responsaveis, equipe, sponsors, aprovadores
    
    -- Canal de notificação
    canal VARCHAR(50) CHECK (canal IN ('sistema', 'email', 'sms', 'push', 'webhook')),
    
    -- Status
    enviada BOOLEAN DEFAULT false,
    data_envio TIMESTAMP WITH TIME ZONE,
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    
    -- Configuração de recorrência
    recorrente BOOLEAN DEFAULT false,
    proxima_execucao TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Planos estratégicos
CREATE INDEX idx_planos_estrategicos_tenant ON planos_estrategicos(tenant_id);
CREATE INDEX idx_planos_estrategicos_status ON planos_estrategicos(status);
CREATE INDEX idx_planos_estrategicos_periodo ON planos_estrategicos(data_inicio, data_fim);
CREATE INDEX idx_planos_estrategicos_responsavel ON planos_estrategicos(responsavel_id);

-- Objetivos estratégicos
CREATE INDEX idx_objetivos_tenant ON objetivos_estrategicos(tenant_id);
CREATE INDEX idx_objetivos_plano ON objetivos_estrategicos(plano_estrategico_id);
CREATE INDEX idx_objetivos_responsavel ON objetivos_estrategicos(responsavel_id);
CREATE INDEX idx_objetivos_status ON objetivos_estrategicos(status);

-- Iniciativas
CREATE INDEX idx_iniciativas_tenant ON iniciativas_estrategicas(tenant_id);
CREATE INDEX idx_iniciativas_objetivo ON iniciativas_estrategicas(objetivo_id);
CREATE INDEX idx_iniciativas_responsavel ON iniciativas_estrategicas(responsavel_id);
CREATE INDEX idx_iniciativas_status ON iniciativas_estrategicas(status);

-- Marcos
CREATE INDEX idx_marcos_tenant ON marcos_planejamento(tenant_id);
CREATE INDEX idx_marcos_data ON marcos_planejamento(data_planejada);
CREATE INDEX idx_marcos_status ON marcos_planejamento(status);

-- KPIs
CREATE INDEX idx_kpis_tenant ON kpis_planejamento(tenant_id);
CREATE INDEX idx_kpis_objetivo ON kpis_planejamento(objetivo_id);
CREATE INDEX idx_kpis_responsavel ON kpis_planejamento(responsavel_coleta_id);

-- Medições
CREATE INDEX idx_medicoes_kpi ON medicoes_kpi(kpi_id);
CREATE INDEX idx_medicoes_data ON medicoes_kpi(data_medicao DESC);
CREATE INDEX idx_medicoes_status ON medicoes_kpi(status_medicao);

-- Cronograma
CREATE INDEX idx_atividades_tenant ON cronograma_atividades(tenant_id);
CREATE INDEX idx_atividades_iniciativa ON cronograma_atividades(iniciativa_id);
CREATE INDEX idx_atividades_responsavel ON cronograma_atividades(responsavel_id);
CREATE INDEX idx_atividades_datas ON cronograma_atividades(data_inicio_planejada, data_fim_planejada);

-- Riscos
CREATE INDEX idx_riscos_plan_tenant ON riscos_planejamento(tenant_id);
CREATE INDEX idx_riscos_plan_responsavel ON riscos_planejamento(responsavel_id);
CREATE INDEX idx_riscos_plan_residual ON riscos_planejamento(risco_residual DESC);

-- Notificações
CREATE INDEX idx_notificacoes_tenant ON notificacoes_planejamento(tenant_id);
CREATE INDEX idx_notificacoes_destinatario ON notificacoes_planejamento(destinatario_id);
CREATE INDEX idx_notificacoes_enviada ON notificacoes_planejamento(enviada);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_planning_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE TRIGGER tr_planos_estrategicos_updated_at BEFORE UPDATE ON planos_estrategicos FOR EACH ROW EXECUTE FUNCTION update_planning_updated_at();
CREATE TRIGGER tr_objetivos_estrategicos_updated_at BEFORE UPDATE ON objetivos_estrategicos FOR EACH ROW EXECUTE FUNCTION update_planning_updated_at();
CREATE TRIGGER tr_iniciativas_estrategicas_updated_at BEFORE UPDATE ON iniciativas_estrategicas FOR EACH ROW EXECUTE FUNCTION update_planning_updated_at();
CREATE TRIGGER tr_marcos_planejamento_updated_at BEFORE UPDATE ON marcos_planejamento FOR EACH ROW EXECUTE FUNCTION update_planning_updated_at();
CREATE TRIGGER tr_kpis_planejamento_updated_at BEFORE UPDATE ON kpis_planejamento FOR EACH ROW EXECUTE FUNCTION update_planning_updated_at();
CREATE TRIGGER tr_cronograma_atividades_updated_at BEFORE UPDATE ON cronograma_atividades FOR EACH ROW EXECUTE FUNCTION update_planning_updated_at();
CREATE TRIGGER tr_riscos_planejamento_updated_at BEFORE UPDATE ON riscos_planejamento FOR EACH ROW EXECUTE FUNCTION update_planning_updated_at();
CREATE TRIGGER tr_dashboards_planejamento_updated_at BEFORE UPDATE ON dashboards_planejamento FOR EACH ROW EXECUTE FUNCTION update_planning_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE planos_estrategicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE objetivos_estrategicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE iniciativas_estrategicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcos_planejamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis_planejamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicoes_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE cronograma_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE riscos_planejamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards_planejamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes_planejamento ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY planning_planos_tenant_policy ON planos_estrategicos
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_objetivos_tenant_policy ON objetivos_estrategicos
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_iniciativas_tenant_policy ON iniciativas_estrategicas
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_marcos_tenant_policy ON marcos_planejamento
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_kpis_tenant_policy ON kpis_planejamento
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_medicoes_tenant_policy ON medicoes_kpi
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_atividades_tenant_policy ON cronograma_atividades
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_riscos_tenant_policy ON riscos_planejamento
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_dashboards_tenant_policy ON dashboards_planejamento
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY planning_notificacoes_tenant_policy ON notificacoes_planejamento
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE planos_estrategicos IS 'Planos estratégicos organizacionais de alto nível';
COMMENT ON TABLE objetivos_estrategicos IS 'Objetivos vinculados aos planos estratégicos';
COMMENT ON TABLE iniciativas_estrategicas IS 'Projetos e iniciativas para alcançar objetivos';
COMMENT ON TABLE marcos_planejamento IS 'Marcos importantes nos planos e iniciativas';
COMMENT ON TABLE kpis_planejamento IS 'Indicadores de performance para objetivos e iniciativas';
COMMENT ON TABLE medicoes_kpi IS 'Valores coletados dos KPIs ao longo do tempo';
COMMENT ON TABLE cronograma_atividades IS 'Cronogramas detalhados para iniciativas e projetos';
COMMENT ON TABLE riscos_planejamento IS 'Riscos identificados nos planos estratégicos';
COMMENT ON TABLE dashboards_planejamento IS 'Configuração de dashboards personalizados';
COMMENT ON TABLE notificacoes_planejamento IS 'Sistema de notificações e alertas';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================