-- =====================================================
-- MÓDULO CENTRALIZADO DE PLANOS DE AÇÃO
-- Criado em: 2025-09-19
-- Descrição: Sistema centralizado para gestão integrada de todos os planos de ação da organização
-- Integra: Risk Management, Compliance, Assessments, Privacy, e outros módulos
-- =====================================================

-- ==================================================
-- 1. CATEGORIAS DE PLANOS DE AÇÃO
-- ==================================================
CREATE TABLE IF NOT EXISTS action_plan_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    cor_categoria VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    icone VARCHAR(50) DEFAULT 'folder', -- Lucide icon name
    
    -- Configurações
    permite_subcategorias BOOLEAN DEFAULT true,
    requer_aprovacao BOOLEAN DEFAULT false,
    template_padrao JSONB DEFAULT '{}',
    
    -- Metadados
    ordem_exibicao INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_category_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- ==================================================
-- 2. PLANOS DE AÇÃO CENTRALIZADOS
-- ==================================================
CREATE TABLE IF NOT EXISTS action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES action_plan_categories(id),
    
    -- Identificação
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT,
    objetivo TEXT,
    
    -- Origem/Contexto
    modulo_origem VARCHAR(50) NOT NULL CHECK (modulo_origem IN (
        'risk_management', 'compliance', 'assessments', 'privacy', 'audit', 
        'vendor_risk', 'policies', 'incidents', 'strategic_planning', 'manual'
    )),
    entidade_origem_tipo VARCHAR(50), -- 'risk_registration', 'non_conformity', 'assessment', etc.
    entidade_origem_id UUID, -- ID da entidade que originou o plano
    contexto_adicional JSONB DEFAULT '{}', -- Dados específicos do contexto
    
    -- Classificação e Priorização
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica', 'urgente')),
    criticidade VARCHAR(20) DEFAULT 'media' CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
    complexidade VARCHAR(20) DEFAULT 'media' CHECK (complexidade IN ('baixa', 'media', 'alta')),
    
    -- Matriz GUT
    gut_gravidade INTEGER CHECK (gut_gravidade BETWEEN 1 AND 5),
    gut_urgencia INTEGER CHECK (gut_urgencia BETWEEN 1 AND 5),
    gut_tendencia INTEGER CHECK (gut_tendencia BETWEEN 1 AND 5),
    gut_score INTEGER GENERATED ALWAYS AS (gut_gravidade * gut_urgencia * gut_tendencia) STORED,
    
    -- Gestão e Responsabilidades
    responsavel_plano UUID REFERENCES profiles(id),
    responsavel_aprovacao UUID REFERENCES profiles(id),
    equipe_responsavel UUID[], -- Array de IDs de profiles
    stakeholders UUID[], -- Array de IDs de profiles interessados
    
    -- Cronograma
    data_inicio_planejada DATE,
    data_fim_planejada DATE,
    data_inicio_real DATE,
    data_fim_real DATE,
    data_proxima_revisao DATE,
    
    -- Orçamento e Recursos
    orcamento_planejado DECIMAL(15,2),
    orcamento_realizado DECIMAL(15,2),
    recursos_necessarios TEXT[],
    recursos_alocados JSONB DEFAULT '{}',
    
    -- Status e Progresso
    status VARCHAR(30) DEFAULT 'planejado' CHECK (status IN (
        'planejado', 'aprovacao_pendente', 'aprovado', 'em_execucao', 
        'pausado', 'em_revisao', 'concluido', 'cancelado', 'vencido'
    )),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    fase_atual VARCHAR(50),
    
    -- Aprovação e Workflow
    requer_aprovacao BOOLEAN DEFAULT false,
    aprovado_por UUID REFERENCES profiles(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    observacoes_aprovacao TEXT,
    workflow_config JSONB DEFAULT '{}',
    
    -- Resultados e Métricas
    kpis_definidos JSONB DEFAULT '[]', -- Array de KPIs
    resultados_alcancados JSONB DEFAULT '{}',
    efetividade_percentual DECIMAL(5,2),
    licoes_aprendidas TEXT,
    
    -- Comunicação e Notificações
    plano_comunicacao JSONB DEFAULT '{}',
    frequencia_relatorios VARCHAR(30) DEFAULT 'semanal' CHECK (frequencia_relatorios IN (
        'diario', 'semanal', 'quinzenal', 'mensal', 'trimestral'
    )),
    proxima_notificacao DATE,
    configuracao_alertas JSONB DEFAULT '{}',
    
    -- Anexos e Documentação
    documentos_anexos JSONB DEFAULT '[]',
    links_relacionados JSONB DEFAULT '[]',
    
    -- Metadados
    tags TEXT[],
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_action_plan_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- ==================================================
-- 3. ATIVIDADES DOS PLANOS DE AÇÃO
-- ==================================================
CREATE TABLE IF NOT EXISTS action_plan_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action_plan_id UUID NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
    
    -- Identificação
    codigo VARCHAR(100),
    titulo VARCHAR(300) NOT NULL,
    descricao TEXT,
    tipo_atividade VARCHAR(50) DEFAULT 'task' CHECK (tipo_atividade IN (
        'task', 'milestone', 'review', 'approval', 'communication', 'training', 'audit'
    )),
    
    -- Hierarquia e Dependências
    atividade_pai UUID REFERENCES action_plan_activities(id),
    ordem_execucao INTEGER DEFAULT 1,
    dependencias UUID[], -- IDs de atividades predecessoras
    
    -- Responsabilidades
    responsavel_execucao UUID REFERENCES profiles(id),
    responsavel_aprovacao UUID REFERENCES profiles(id),
    equipe_execucao UUID[], -- Array de IDs
    
    -- Cronograma
    data_inicio_planejada DATE NOT NULL,
    data_fim_planejada DATE NOT NULL,
    data_inicio_real DATE,
    data_fim_real DATE,
    duracao_estimada_horas DECIMAL(8,2),
    duracao_real_horas DECIMAL(8,2),
    
    -- Status e Progresso
    status VARCHAR(30) DEFAULT 'nao_iniciado' CHECK (status IN (
        'nao_iniciado', 'planejado', 'em_execucao', 'pausado', 
        'aguardando_aprovacao', 'concluido', 'cancelado', 'vencido'
    )),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Prioridade e Criticidade
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    impacto_atraso VARCHAR(20) DEFAULT 'medio' CHECK (impacto_atraso IN ('baixo', 'medio', 'alto', 'critico')),
    
    -- Recursos e Custos
    custo_estimado DECIMAL(15,2),
    custo_real DECIMAL(15,2),
    recursos_necessarios TEXT[],
    
    -- Resultados e Entregáveis
    entregaveis_esperados TEXT[],
    criterios_aceitacao TEXT[],
    resultados_obtidos TEXT,
    qualidade_entrega INTEGER CHECK (qualidade_entrega BETWEEN 1 AND 5),
    
    -- Riscos e Problemas
    riscos_identificados JSONB DEFAULT '[]',
    problemas_enfrentados TEXT,
    solucoes_aplicadas TEXT,
    
    -- Anexos e Evidências
    evidencias_conclusao JSONB DEFAULT '[]',
    documentos_trabalho JSONB DEFAULT '[]',
    
    -- Metadados
    observacoes TEXT,
    tags TEXT[],
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- ==================================================
-- 4. HISTÓRICO DE ATUALIZAÇÕES
-- ==================================================
CREATE TABLE IF NOT EXISTS action_plan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action_plan_id UUID REFERENCES action_plans(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES action_plan_activities(id) ON DELETE CASCADE,
    
    -- Dados da Alteração
    tipo_alteracao VARCHAR(50) NOT NULL CHECK (tipo_alteracao IN (
        'criacao', 'atualizacao_status', 'atualizacao_progresso', 'aprovacao', 
        'rejeicao', 'cancelamento', 'reagendamento', 'adicao_atividade', 
        'remocao_atividade', 'comentario', 'anexo_adicionado'
    )),
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    observacoes TEXT,
    
    -- Dados da Ação
    usuario_acao UUID REFERENCES profiles(id),
    data_acao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_origem INET,
    user_agent TEXT,
    
    -- Metadados
    metadados JSONB DEFAULT '{}'
);

-- ==================================================
-- 5. COMENTÁRIOS E COMUNICAÇÃO
-- ==================================================
CREATE TABLE IF NOT EXISTS action_plan_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action_plan_id UUID REFERENCES action_plans(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES action_plan_activities(id) ON DELETE CASCADE,
    
    -- Conteúdo do Comentário
    conteudo TEXT NOT NULL,
    tipo_comentario VARCHAR(30) DEFAULT 'comentario' CHECK (tipo_comentario IN (
        'comentario', 'pergunta', 'alerta', 'bloqueio', 'aprovacao', 'rejeicao'
    )),
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    
    -- Visibilidade e Notificações
    visibilidade VARCHAR(20) DEFAULT 'equipe' CHECK (visibilidade IN ('privado', 'equipe', 'stakeholders', 'publico')),
    notificar_responsaveis BOOLEAN DEFAULT true,
    notificar_stakeholders BOOLEAN DEFAULT false,
    
    -- Anexos
    anexos JSONB DEFAULT '[]',
    
    -- Resposta/Thread
    comentario_pai UUID REFERENCES action_plan_comments(id),
    
    -- Metadados
    autor UUID NOT NULL REFERENCES profiles(id),
    data_comentario TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    editado_em TIMESTAMP WITH TIME ZONE,
    editado_por UUID REFERENCES profiles(id),
    
    metadados JSONB DEFAULT '{}'
);

-- ==================================================
-- 6. NOTIFICAÇÕES E ALERTAS
-- ==================================================
CREATE TABLE IF NOT EXISTS action_plan_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    action_plan_id UUID REFERENCES action_plans(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES action_plan_activities(id) ON DELETE CASCADE,
    
    -- Dados da Notificação
    tipo_notificacao VARCHAR(50) NOT NULL CHECK (tipo_notificacao IN (
        'vencimento_proximidade', 'atividade_vencida', 'status_mudou', 
        'aprovacao_pendente', 'comentario_adicionado', 'progresso_atualizado',
        'milestone_atingido', 'problema_reportado', 'lembrarte_revisao'
    )),
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    
    -- Destinatários
    destinatario_id UUID NOT NULL REFERENCES profiles(id),
    tipo_destinatario VARCHAR(30) CHECK (tipo_destinatario IN (
        'responsavel', 'aprovador', 'equipe', 'stakeholder', 'observador'
    )),
    
    -- Canais de Entrega
    canal_email BOOLEAN DEFAULT true,
    canal_sistema BOOLEAN DEFAULT true,
    canal_whatsapp BOOLEAN DEFAULT false,
    canal_slack BOOLEAN DEFAULT false,
    
    -- Status de Entrega
    status_envio VARCHAR(30) DEFAULT 'pendente' CHECK (status_envio IN (
        'pendente', 'enviado', 'entregue', 'lido', 'falhoo', 'cancelado'
    )),
    data_agendamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_envio TIMESTAMP WITH TIME ZONE,
    data_leitura TIMESTAMP WITH TIME ZONE,
    tentativas_envio INTEGER DEFAULT 0,
    erro_envio TEXT,
    
    -- Metadados
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 7. TEMPLATES DE PLANOS DE AÇÃO
-- ==================================================
CREATE TABLE IF NOT EXISTS action_plan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES action_plan_categories(id),
    
    -- Identificação do Template
    codigo VARCHAR(100) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    versao VARCHAR(20) DEFAULT '1.0',
    
    -- Aplicabilidade
    modulo_aplicavel VARCHAR(50) CHECK (modulo_aplicavel IN (
        'risk_management', 'compliance', 'assessments', 'privacy', 'audit', 
        'vendor_risk', 'policies', 'incidents', 'strategic_planning', 'todos'
    )),
    tipo_situacao VARCHAR(100), -- 'alto_risco', 'nao_conformidade_critica', etc.
    
    -- Template do Plano
    template_plano JSONB NOT NULL, -- Estrutura do plano de ação
    atividades_padrao JSONB DEFAULT '[]', -- Atividades pré-definidas
    
    -- Configurações
    ativo BOOLEAN DEFAULT true,
    publico BOOLEAN DEFAULT false, -- Visível para outros tenants
    ordem_exibicao INTEGER DEFAULT 0,
    
    -- Metadados
    tags TEXT[],
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_template_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- ==================================================
-- ÍNDICES PARA PERFORMANCE
-- ==================================================

-- Categorias
CREATE INDEX IF NOT EXISTS idx_action_plan_categories_tenant ON action_plan_categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_categories_codigo ON action_plan_categories(codigo);

-- Planos de Ação
CREATE INDEX IF NOT EXISTS idx_action_plans_tenant ON action_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_category ON action_plans(category_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_modulo_origem ON action_plans(modulo_origem);
CREATE INDEX IF NOT EXISTS idx_action_plans_entidade_origem ON action_plans(entidade_origem_tipo, entidade_origem_id);
CREATE INDEX IF NOT EXISTS idx_action_plans_responsavel ON action_plans(responsavel_plano);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON action_plans(status);
CREATE INDEX IF NOT EXISTS idx_action_plans_prioridade ON action_plans(prioridade);
CREATE INDEX IF NOT EXISTS idx_action_plans_gut_score ON action_plans(gut_score DESC);
CREATE INDEX IF NOT EXISTS idx_action_plans_datas ON action_plans(data_fim_planejada, data_inicio_planejada);
CREATE INDEX IF NOT EXISTS idx_action_plans_proxima_notificacao ON action_plans(proxima_notificacao);

-- Atividades
CREATE INDEX IF NOT EXISTS idx_action_plan_activities_tenant ON action_plan_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_activities_plano ON action_plan_activities(action_plan_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_activities_responsavel ON action_plan_activities(responsavel_execucao);
CREATE INDEX IF NOT EXISTS idx_action_plan_activities_status ON action_plan_activities(status);
CREATE INDEX IF NOT EXISTS idx_action_plan_activities_datas ON action_plan_activities(data_fim_planejada, data_inicio_planejada);
CREATE INDEX IF NOT EXISTS idx_action_plan_activities_ordem ON action_plan_activities(action_plan_id, ordem_execucao);

-- Histórico
CREATE INDEX IF NOT EXISTS idx_action_plan_history_tenant ON action_plan_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_history_plano ON action_plan_history(action_plan_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_history_atividade ON action_plan_history(activity_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_history_data ON action_plan_history(data_acao);

-- Comentários
CREATE INDEX IF NOT EXISTS idx_action_plan_comments_tenant ON action_plan_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_comments_plano ON action_plan_comments(action_plan_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_comments_atividade ON action_plan_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_comments_autor ON action_plan_comments(autor);

-- Notificações
CREATE INDEX IF NOT EXISTS idx_action_plan_notifications_tenant ON action_plan_notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_notifications_destinatario ON action_plan_notifications(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_notifications_status ON action_plan_notifications(status_envio);
CREATE INDEX IF NOT EXISTS idx_action_plan_notifications_agendamento ON action_plan_notifications(data_agendamento);

-- Templates
CREATE INDEX IF NOT EXISTS idx_action_plan_templates_tenant ON action_plan_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_templates_category ON action_plan_templates(category_id);
CREATE INDEX IF NOT EXISTS idx_action_plan_templates_modulo ON action_plan_templates(modulo_aplicavel);

-- ==================================================
-- ROW LEVEL SECURITY (RLS)
-- ==================================================

ALTER TABLE action_plan_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plan_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plan_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plan_templates ENABLE ROW LEVEL SECURITY;

-- Policies para action_plan_categories
CREATE POLICY "action_plan_categories_tenant_policy" ON action_plan_categories
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Policies para action_plans
CREATE POLICY "action_plans_tenant_policy" ON action_plans
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Policies para action_plan_activities
CREATE POLICY "action_plan_activities_tenant_policy" ON action_plan_activities
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Policies para action_plan_history
CREATE POLICY "action_plan_history_tenant_policy" ON action_plan_history
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Policies para action_plan_comments
CREATE POLICY "action_plan_comments_tenant_policy" ON action_plan_comments
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Policies para action_plan_notifications
CREATE POLICY "action_plan_notifications_tenant_policy" ON action_plan_notifications
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
);

-- Policies para action_plan_templates
CREATE POLICY "action_plan_templates_tenant_policy" ON action_plan_templates
FOR ALL USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ) OR publico = true
);

-- ==================================================
-- TRIGGERS PARA UPDATED_AT
-- ==================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_action_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER tr_action_plan_categories_updated_at
    BEFORE UPDATE ON action_plan_categories
    FOR EACH ROW EXECUTE FUNCTION update_action_plans_updated_at();

CREATE TRIGGER tr_action_plans_updated_at
    BEFORE UPDATE ON action_plans
    FOR EACH ROW EXECUTE FUNCTION update_action_plans_updated_at();

CREATE TRIGGER tr_action_plan_activities_updated_at
    BEFORE UPDATE ON action_plan_activities
    FOR EACH ROW EXECUTE FUNCTION update_action_plans_updated_at();

CREATE TRIGGER tr_action_plan_templates_updated_at
    BEFORE UPDATE ON action_plan_templates
    FOR EACH ROW EXECUTE FUNCTION update_action_plans_updated_at();

-- ==================================================
-- VIEWS PARA CONSULTAS OTIMIZADAS
-- ==================================================

-- View para visão geral dos planos de ação
CREATE OR REPLACE VIEW vw_action_plans_overview AS
SELECT 
    ap.id,
    ap.tenant_id,
    ap.codigo,
    ap.titulo,
    ap.modulo_origem,
    ap.prioridade,
    ap.status,
    ap.percentual_conclusao,
    ap.data_fim_planejada,
    ap.gut_score,
    
    -- Categoria
    cat.nome as categoria_nome,
    cat.cor_categoria,
    
    -- Responsável
    resp.full_name as responsavel_nome,
    resp.email as responsavel_email,
    
    -- Estatísticas de atividades
    (SELECT COUNT(*) FROM action_plan_activities WHERE action_plan_id = ap.id) as total_atividades,
    (SELECT COUNT(*) FROM action_plan_activities WHERE action_plan_id = ap.id AND status = 'concluido') as atividades_concluidas,
    (SELECT COUNT(*) FROM action_plan_activities WHERE action_plan_id = ap.id AND data_fim_planejada < CURRENT_DATE AND status NOT IN ('concluido', 'cancelado')) as atividades_vencidas,
    
    -- Dias para vencimento
    CASE 
        WHEN ap.data_fim_planejada IS NULL THEN NULL
        ELSE (ap.data_fim_planejada - CURRENT_DATE)
    END as dias_para_vencimento,
    
    ap.created_at,
    ap.updated_at
    
FROM action_plans ap
LEFT JOIN action_plan_categories cat ON ap.category_id = cat.id
LEFT JOIN profiles resp ON ap.responsavel_plano = resp.id;

-- View para dashboard executivo
CREATE OR REPLACE VIEW vw_action_plans_dashboard AS
SELECT 
    tenant_id,
    
    -- Totais gerais
    COUNT(*) as total_planos,
    COUNT(*) FILTER (WHERE status = 'em_execucao') as planos_em_execucao,
    COUNT(*) FILTER (WHERE status = 'concluido') as planos_concluidos,
    COUNT(*) FILTER (WHERE status IN ('planejado', 'aprovacao_pendente')) as planos_pendentes,
    COUNT(*) FILTER (WHERE data_fim_planejada < CURRENT_DATE AND status NOT IN ('concluido', 'cancelado')) as planos_vencidos,
    
    -- Por módulo de origem
    COUNT(*) FILTER (WHERE modulo_origem = 'risk_management') as planos_risk,
    COUNT(*) FILTER (WHERE modulo_origem = 'compliance') as planos_compliance,
    COUNT(*) FILTER (WHERE modulo_origem = 'assessments') as planos_assessments,
    COUNT(*) FILTER (WHERE modulo_origem = 'privacy') as planos_privacy,
    
    -- Por prioridade
    COUNT(*) FILTER (WHERE prioridade = 'critica') as planos_criticos,
    COUNT(*) FILTER (WHERE prioridade = 'alta') as planos_alta_prioridade,
    COUNT(*) FILTER (WHERE prioridade = 'urgente') as planos_urgentes,
    
    -- Métricas de progresso
    AVG(percentual_conclusao) as media_progresso,
    AVG(gut_score) as media_gut_score,
    
    -- Orçamento
    SUM(orcamento_planejado) as orcamento_total_planejado,
    SUM(orcamento_realizado) as orcamento_total_realizado

FROM action_plans
GROUP BY tenant_id;

-- ==================================================
-- FUNÇÕES AUXILIARES
-- ==================================================

-- Função para calcular próxima notificação
CREATE OR REPLACE FUNCTION calculate_next_notification_date(
    p_action_plan_id UUID,
    p_frequency VARCHAR
) RETURNS DATE AS $$
DECLARE
    last_notification_date DATE;
    next_date DATE;
BEGIN
    -- Buscar última notificação enviada
    SELECT MAX(data_envio::DATE) INTO last_notification_date
    FROM action_plan_notifications 
    WHERE action_plan_id = p_action_plan_id 
    AND status_envio = 'enviado';
    
    -- Se não há notificação anterior, usar data atual
    IF last_notification_date IS NULL THEN
        last_notification_date := CURRENT_DATE;
    END IF;
    
    -- Calcular próxima data baseada na frequência
    CASE p_frequency
        WHEN 'diario' THEN next_date := last_notification_date + INTERVAL '1 day';
        WHEN 'semanal' THEN next_date := last_notification_date + INTERVAL '1 week';
        WHEN 'quinzenal' THEN next_date := last_notification_date + INTERVAL '2 weeks';
        WHEN 'mensal' THEN next_date := last_notification_date + INTERVAL '1 month';
        WHEN 'trimestral' THEN next_date := last_notification_date + INTERVAL '3 months';
        ELSE next_date := last_notification_date + INTERVAL '1 week';
    END CASE;
    
    RETURN next_date;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar progresso do plano baseado nas atividades
CREATE OR REPLACE FUNCTION update_action_plan_progress(p_action_plan_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_activities INTEGER;
    completed_activities INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Contar atividades totais e concluídas
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'concluido')
    INTO total_activities, completed_activities
    FROM action_plan_activities
    WHERE action_plan_id = p_action_plan_id;
    
    -- Calcular percentual
    IF total_activities > 0 THEN
        progress_percentage := ROUND((completed_activities::DECIMAL / total_activities) * 100);
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- Atualizar o plano de ação
    UPDATE action_plans 
    SET percentual_conclusao = progress_percentage,
        updated_at = NOW()
    WHERE id = p_action_plan_id;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- DADOS INICIAIS - CATEGORIAS PADRÃO
-- ==================================================

INSERT INTO action_plan_categories (tenant_id, codigo, nome, descricao, cor_categoria, icone, ordem_exibicao) 
SELECT 
    t.id as tenant_id,
    'RISK_MGMT' as codigo,
    'Gestão de Riscos' as nome,
    'Planos de ação para tratamento e mitigação de riscos identificados' as descricao,
    '#EF4444' as cor_categoria,
    'shield-alert' as icone,
    1 as ordem_exibicao
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM action_plan_categories 
    WHERE tenant_id = t.id AND codigo = 'RISK_MGMT'
);

INSERT INTO action_plan_categories (tenant_id, codigo, nome, descricao, cor_categoria, icone, ordem_exibicao) 
SELECT 
    t.id as tenant_id,
    'COMPLIANCE' as codigo,
    'Conformidade' as nome,
    'Planos de ação para correção de não conformidades e gaps regulatórios' as descricao,
    '#F59E0B' as cor_categoria,
    'file-check' as icone,
    2 as ordem_exibicao
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM action_plan_categories 
    WHERE tenant_id = t.id AND codigo = 'COMPLIANCE'
);

INSERT INTO action_plan_categories (tenant_id, codigo, nome, descricao, cor_categoria, icone, ordem_exibicao) 
SELECT 
    t.id as tenant_id,
    'ASSESSMENTS' as codigo,
    'Assessments' as nome,
    'Planos de ação derivados de avaliações e assessments de maturidade' as descricao,
    '#3B82F6' as cor_categoria,
    'clipboard-check' as icone,
    3 as ordem_exibicao
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM action_plan_categories 
    WHERE tenant_id = t.id AND codigo = 'ASSESSMENTS'
);

INSERT INTO action_plan_categories (tenant_id, codigo, nome, descricao, cor_categoria, icone, ordem_exibicao) 
SELECT 
    t.id as tenant_id,
    'PRIVACY' as codigo,
    'Privacidade & LGPD' as nome,
    'Planos de ação para adequação à LGPD e tratamento de questões de privacidade' as descricao,
    '#8B5CF6' as cor_categoria,
    'shield-check' as icone,
    4 as ordem_exibicao
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM action_plan_categories 
    WHERE tenant_id = t.id AND codigo = 'PRIVACY'
);

INSERT INTO action_plan_categories (tenant_id, codigo, nome, descricao, cor_categoria, icone, ordem_exibicao) 
SELECT 
    t.id as tenant_id,
    'AUDIT' as codigo,
    'Auditoria' as nome,
    'Planos de ação para correção de achados e recomendações de auditoria' as descricao,
    '#06B6D4' as cor_categoria,
    'search' as icone,
    5 as ordem_exibicao
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM action_plan_categories 
    WHERE tenant_id = t.id AND codigo = 'AUDIT'
);

INSERT INTO action_plan_categories (tenant_id, codigo, nome, descricao, cor_categoria, icone, ordem_exibicao) 
SELECT 
    t.id as tenant_id,
    'STRATEGIC' as codigo,
    'Planejamento Estratégico' as nome,
    'Planos de ação para execução de iniciativas estratégicas organizacionais' as descricao,
    '#10B981' as cor_categoria,
    'target' as icone,
    6 as ordem_exibicao
FROM tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM action_plan_categories 
    WHERE tenant_id = t.id AND codigo = 'STRATEGIC'
);

-- ==================================================
-- COMENTÁRIOS DESCRITIVOS
-- ==================================================

COMMENT ON TABLE action_plan_categories IS 'Categorias para classificação e organização dos planos de ação';
COMMENT ON TABLE action_plans IS 'Planos de ação centralizados para gestão integrada de todas as iniciativas da organização';
COMMENT ON TABLE action_plan_activities IS 'Atividades detalhadas que compõem cada plano de ação';
COMMENT ON TABLE action_plan_history IS 'Histórico completo de alterações e atualizações nos planos de ação';
COMMENT ON TABLE action_plan_comments IS 'Sistema de comentários e comunicação colaborativa nos planos de ação';
COMMENT ON TABLE action_plan_notifications IS 'Sistema de notificações e alertas para gestão proativa dos planos';
COMMENT ON TABLE action_plan_templates IS 'Templates reutilizáveis para criação ágil de planos de ação padronizados';