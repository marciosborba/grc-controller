-- =====================================================
-- MÓDULO DE GESTÃO DE CONFORMIDADES
-- Criado em: 2025-09-17
-- Descrição: Sistema completo de gestão de compliance e conformidade regulatória
-- =====================================================

-- 1. FRAMEWORKS DE COMPLIANCE
-- Frameworks regulatórios (SOX, LGPD, ISO, etc.)
CREATE TABLE IF NOT EXISTS frameworks_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('regulatorio', 'normativo', 'interno', 'setorial', 'internacional')),
    origem VARCHAR(100), -- 'LGPD', 'SOX', 'ISO 27001', 'BACEN', etc.
    versao VARCHAR(20),
    data_vigencia DATE,
    data_atualizacao DATE,
    
    -- Classificação
    categoria VARCHAR(100), -- 'Privacidade', 'Financeiro', 'TI', 'Operacional'
    subcategoria VARCHAR(100),
    nivel_aplicabilidade VARCHAR(50) CHECK (nivel_aplicabilidade IN ('obrigatorio', 'recomendado', 'opcional')),
    
    -- Jurisdição e escopo
    jurisdicao VARCHAR(100), -- 'Brasil', 'Internacional', 'São Paulo'
    escopo_aplicacao TEXT[], -- Areas/departamentos aplicáveis
    
    -- Status
    status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso', 'obsoleto')),
    
    -- Metadados
    url_referencia TEXT,
    documentos_relacionados TEXT[],
    tags TEXT[],
    metadados JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_framework_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 2. REQUISITOS DE COMPLIANCE
-- Requisitos específicos de cada framework
CREATE TABLE IF NOT EXISTS requisitos_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES frameworks_compliance(id) ON DELETE CASCADE,
    
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    descricao TEXT NOT NULL,
    
    -- Hierarquia de requisitos
    requisito_pai UUID REFERENCES requisitos_compliance(id),
    nivel INTEGER DEFAULT 1, -- Para estrutura hierárquica
    ordem_apresentacao INTEGER,
    
    -- Classificação
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    tipo_controle VARCHAR(50) CHECK (tipo_controle IN ('preventivo', 'detectivo', 'corretivo', 'diretivo')),
    
    -- Criticidade e risco
    criticidade VARCHAR(20) CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
    nivel_risco_nao_conformidade INTEGER CHECK (nivel_risco_nao_conformidade BETWEEN 1 AND 5),
    
    -- Periodicidade de avaliação
    frequencia_avaliacao VARCHAR(50) CHECK (frequencia_avaliacao IN ('continuo', 'diario', 'semanal', 'mensal', 'trimestral', 'semestral', 'anual')),
    data_proxima_avaliacao DATE,
    
    -- Evidências e documentação
    tipos_evidencia_esperada TEXT[],
    documentacao_necessaria TEXT[],
    criterios_conformidade TEXT NOT NULL,
    
    -- Responsabilidades
    responsavel_conformidade UUID REFERENCES profiles(id),
    responsavel_avaliacao UUID REFERENCES profiles(id),
    
    -- Status
    status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_revisao', 'obsoleto')),
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_requisito_codigo_framework UNIQUE (framework_id, codigo)
);

-- 3. AVALIAÇÕES DE CONFORMIDADE
-- Avaliações periódicas dos requisitos
CREATE TABLE IF NOT EXISTS avaliacoes_conformidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requisito_id UUID NOT NULL REFERENCES requisitos_compliance(id) ON DELETE CASCADE,
    
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Planejamento
    tipo_avaliacao VARCHAR(50) CHECK (tipo_avaliacao IN ('auto_avaliacao', 'avaliacao_interna', 'auditoria_externa', 'revisao_regulatoria')),
    data_planejada DATE NOT NULL,
    data_inicio DATE,
    data_conclusao DATE,
    
    -- Equipe
    avaliador_responsavel UUID NOT NULL REFERENCES profiles(id),
    equipe_avaliacao UUID[],
    
    -- Metodologia
    metodologia VARCHAR(100), -- 'Entrevista', 'Análise documental', 'Teste de controles'
    amostra_testada INTEGER,
    populacao_total INTEGER,
    criterios_amostragem TEXT,
    
    -- Resultados
    status VARCHAR(30) DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'concluida', 'cancelada')),
    resultado_conformidade VARCHAR(30) CHECK (resultado_conformidade IN ('conforme', 'parcialmente_conforme', 'nao_conforme', 'nao_aplicavel')),
    score_conformidade INTEGER CHECK (score_conformidade BETWEEN 0 AND 100),
    
    -- Detalhamento dos resultados
    pontos_conformes INTEGER DEFAULT 0,
    pontos_nao_conformes INTEGER DEFAULT 0,
    total_pontos_avaliados INTEGER DEFAULT 0,
    
    -- Documentação
    evidencias_coletadas TEXT[],
    observacoes TEXT,
    recomendacoes TEXT,
    limitacoes_avaliacao TEXT,
    
    -- Arquivos
    arquivos_evidencia JSONB DEFAULT '[]',
    relatorio_avaliacao TEXT, -- Path para arquivo do relatório
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_avaliacao_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 4. NÃO CONFORMIDADES
-- Registro de gaps e não conformidades identificadas
CREATE TABLE IF NOT EXISTS nao_conformidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    avaliacao_id UUID REFERENCES avaliacoes_conformidade(id) ON DELETE CASCADE,
    requisito_id UUID NOT NULL REFERENCES requisitos_compliance(id) ON DELETE CASCADE,
    
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    
    -- Descrição estruturada (5W2H)
    o_que TEXT NOT NULL, -- O que aconteceu/foi identificado
    onde TEXT, -- Onde ocorreu
    quando TIMESTAMP WITH TIME ZONE, -- Quando foi identificado
    quem TEXT, -- Quem identificou/responsável
    por_que TEXT, -- Causa raiz
    como_identificado TEXT, -- Como foi descoberto
    quanto_impacto TEXT, -- Impacto quantificado
    
    -- Classificação
    categoria VARCHAR(100),
    tipo_nao_conformidade VARCHAR(50) CHECK (tipo_nao_conformidade IN ('sistemica', 'pontual', 'recorrente')),
    origem_identificacao VARCHAR(50) CHECK (origem_identificacao IN ('auto_avaliacao', 'auditoria_interna', 'auditoria_externa', 'regulador', 'incidente')),
    
    -- Criticidade e impacto
    criticidade VARCHAR(20) CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
    impacto_operacional INTEGER CHECK (impacto_operacional BETWEEN 1 AND 5),
    impacto_financeiro DECIMAL(15,2),
    impacto_reputacional INTEGER CHECK (impacto_reputacional BETWEEN 1 AND 5),
    impacto_regulatorio INTEGER CHECK (impacto_regulatorio BETWEEN 1 AND 5),
    risco_score INTEGER GENERATED ALWAYS AS (
        (impacto_operacional + impacto_reputacional + impacto_regulatorio) * 
        CASE criticidade 
            WHEN 'critica' THEN 4
            WHEN 'alta' THEN 3
            WHEN 'media' THEN 2
            ELSE 1
        END
    ) STORED,
    
    -- Gestão e follow-up
    responsavel_tratamento UUID REFERENCES profiles(id),
    data_identificacao DATE NOT NULL DEFAULT CURRENT_DATE,
    prazo_resolucao DATE,
    data_resolucao DATE,
    
    -- Status
    status VARCHAR(30) DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_tratamento', 'aguardando_evidencia', 'resolvida', 'aceita_risco')),
    justificativa_status TEXT,
    
    -- Recorrência
    e_recorrente BOOLEAN DEFAULT FALSE,
    nao_conformidade_origem UUID REFERENCES nao_conformidades(id),
    quantidade_recorrencias INTEGER DEFAULT 0,
    
    -- Documentação
    evidencias_nao_conformidade TEXT[],
    impacto_detalhado TEXT,
    acoes_imediatas_tomadas TEXT,
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_nao_conformidade_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 5. PLANOS DE AÇÃO PARA CONFORMIDADE
-- Planos de ação para tratar não conformidades
CREATE TABLE IF NOT EXISTS planos_acao_conformidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nao_conformidade_id UUID NOT NULL REFERENCES nao_conformidades(id) ON DELETE CASCADE,
    
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao_acao TEXT NOT NULL,
    
    -- Tipo de ação
    tipo_acao VARCHAR(50) CHECK (tipo_acao IN ('corretiva', 'preventiva', 'melhoria', 'mitigacao')),
    categoria_acao VARCHAR(100), -- 'Processo', 'Tecnologia', 'Pessoas', 'Documentação'
    
    -- Causa raiz e objetivo
    causa_raiz_endereçada TEXT,
    objetivo_acao TEXT NOT NULL,
    resultados_esperados TEXT,
    
    -- Responsabilidades
    responsavel_execucao UUID NOT NULL REFERENCES profiles(id),
    responsavel_aprovacao UUID REFERENCES profiles(id),
    responsavel_monitoramento UUID REFERENCES profiles(id),
    
    -- Cronograma
    data_inicio_planejada DATE NOT NULL,
    data_fim_planejada DATE NOT NULL,
    data_inicio_real DATE,
    data_fim_real DATE,
    
    -- Recursos
    orcamento_estimado DECIMAL(12,2),
    orcamento_realizado DECIMAL(12,2),
    recursos_necessarios TEXT[],
    dependencias TEXT[],
    
    -- Progresso e status
    status VARCHAR(30) DEFAULT 'planejada' CHECK (status IN ('planejada', 'aprovada', 'em_execucao', 'suspensa', 'concluida', 'cancelada')),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Marcos e entregas
    marcos_principais JSONB DEFAULT '[]', -- Array de marcos com datas
    entregas_esperadas TEXT[],
    
    -- Monitoramento
    frequencia_monitoramento VARCHAR(50) CHECK (frequencia_monitoramento IN ('semanal', 'quinzenal', 'mensal', 'trimestral')),
    data_proximo_monitoramento DATE,
    
    -- Efetividade
    data_verificacao_efetividade DATE,
    efetividade_confirmada BOOLEAN,
    evidencias_efetividade TEXT[],
    observacoes_efetividade TEXT,
    
    -- Documentação
    documentos_relacionados TEXT[],
    comunicacao_stakeholders TEXT,
    licoes_aprendidas TEXT,
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_plano_acao_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 6. CONTROLES DE CONFORMIDADE
-- Controles implementados para garantir conformidade
CREATE TABLE IF NOT EXISTS controles_conformidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    requisito_id UUID NOT NULL REFERENCES requisitos_compliance(id) ON DELETE CASCADE,
    
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    objetivo_controle TEXT NOT NULL,
    
    -- Classificação do controle
    tipo VARCHAR(50) CHECK (tipo IN ('preventivo', 'detectivo', 'corretivo', 'diretivo')),
    natureza VARCHAR(50) CHECK (natureza IN ('manual', 'automatico', 'semi_automatico')),
    nivel VARCHAR(50) CHECK (nivel IN ('estrategico', 'operacional', 'transacional')),
    
    -- Frequência e execução
    frequencia VARCHAR(50) CHECK (frequencia IN ('continuo', 'diario', 'semanal', 'mensal', 'trimestral', 'semestral', 'anual', 'evento')),
    momento_execucao VARCHAR(100), -- 'Antes da transação', 'Durante o processo', 'Após conclusão'
    
    -- Responsabilidades
    proprietario_controle UUID NOT NULL REFERENCES profiles(id),
    executor_controle UUID REFERENCES profiles(id),
    revisor_controle UUID REFERENCES profiles(id),
    
    -- Desenho do controle
    atividades_controle TEXT NOT NULL,
    evidencias_funcionamento TEXT[],
    sistemas_utilizados TEXT[],
    documentacao_suporte TEXT[],
    
    -- Testes e avaliação
    metodo_teste VARCHAR(100), -- 'Inquiry', 'Observation', 'Inspection', 'Re-performance'
    ultima_data_teste DATE,
    proximo_teste_planejado DATE,
    resultado_ultimo_teste VARCHAR(50) CHECK (resultado_ultimo_teste IN ('efetivo', 'inefetivo', 'parcialmente_efetivo', 'nao_testado')),
    
    -- Deficiências identificadas
    deficiencias_identificadas TEXT,
    data_identificacao_deficiencia DATE,
    gravidade_deficiencia VARCHAR(20) CHECK (gravidade_deficiencia IN ('baixa', 'media', 'alta', 'critica')),
    
    -- Maturidade e efetividade
    nivel_maturidade INTEGER CHECK (nivel_maturidade BETWEEN 1 AND 5),
    score_efetividade INTEGER CHECK (score_efetividade BETWEEN 0 AND 100),
    
    -- Status
    status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_revisao', 'sendo_implementado', 'descontinuado')),
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_controle_codigo_requisito UNIQUE (requisito_id, codigo)
);

-- 7. MONITORAMENTO CONTÍNUO
-- Sistema de monitoramento contínuo de conformidade
CREATE TABLE IF NOT EXISTS monitoramento_conformidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Objeto do monitoramento
    tipo_objeto VARCHAR(50) CHECK (tipo_objeto IN ('framework', 'requisito', 'controle', 'processo')),
    objeto_id UUID NOT NULL, -- ID do framework, requisito, controle, etc.
    
    codigo VARCHAR(100) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Configuração do monitoramento
    frequencia VARCHAR(50) CHECK (frequencia IN ('tempo_real', 'diario', 'semanal', 'mensal', 'trimestral')),
    metrica_monitorada VARCHAR(255) NOT NULL,
    unidade_medida VARCHAR(50),
    
    -- Thresholds e alertas
    valor_alvo DECIMAL(12,4),
    limite_inferior DECIMAL(12,4),
    limite_superior DECIMAL(12,4),
    limite_critico DECIMAL(12,4),
    
    -- Fonte de dados
    fonte_dados VARCHAR(255), -- Sistema, planilha, API, etc.
    query_dados TEXT, -- Query SQL ou endpoint
    parametros_coleta JSONB,
    
    -- Responsabilidades
    responsavel_monitoramento UUID NOT NULL REFERENCES profiles(id),
    aprovador_alertas UUID REFERENCES profiles(id),
    
    -- Status e configuração
    status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'suspenso', 'configurando')),
    automatizado BOOLEAN DEFAULT FALSE,
    requer_aprovacao_manual BOOLEAN DEFAULT FALSE,
    
    -- Histórico de valores
    ultimo_valor_coletado DECIMAL(12,4),
    data_ultima_coleta TIMESTAMP WITH TIME ZONE,
    data_proxima_coleta TIMESTAMP WITH TIME ZONE,
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MÉTRICAS DE CONFORMIDADE
-- Armazenamento histórico das métricas coletadas
CREATE TABLE IF NOT EXISTS metricas_conformidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    monitoramento_id UUID NOT NULL REFERENCES monitoramento_conformidade(id) ON DELETE CASCADE,
    
    -- Dados da coleta
    data_coleta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    valor_coletado DECIMAL(12,4) NOT NULL,
    unidade_medida VARCHAR(50),
    
    -- Status da métrica
    status_conformidade VARCHAR(30) CHECK (status_conformidade IN ('conforme', 'atencao', 'critico', 'nao_conforme')),
    variacao_anterior DECIMAL(12,4), -- Variação em relação à coleta anterior
    percentual_variacao DECIMAL(5,2), -- % de variação
    
    -- Contexto
    observacoes TEXT,
    fatores_influencia TEXT[],
    coletado_por UUID REFERENCES profiles(id),
    
    -- Alertas gerados
    alerta_gerado BOOLEAN DEFAULT FALSE,
    tipo_alerta VARCHAR(50), -- 'limite_superior', 'limite_inferior', 'critico'
    destinatarios_alerta UUID[],
    
    metadados JSONB DEFAULT '{}'
);

-- 9. RELATÓRIOS DE CONFORMIDADE
-- Templates e instâncias de relatórios
CREATE TABLE IF NOT EXISTS relatorios_conformidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    codigo VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Tipo e categoria
    tipo_relatorio VARCHAR(50) CHECK (tipo_relatorio IN ('dashboard', 'executivo', 'operacional', 'regulatorio', 'auditoria')),
    categoria VARCHAR(100), -- 'LGPD', 'SOX', 'Geral', etc.
    
    -- Configuração
    frameworks_incluidos UUID[], -- IDs dos frameworks
    requisitos_incluidos UUID[], -- IDs dos requisitos específicos
    periodo_referencia VARCHAR(50), -- 'mensal', 'trimestral', 'anual'
    
    -- Frequência de geração
    frequencia_geracao VARCHAR(50) CHECK (frequencia_geracao IN ('sob_demanda', 'diario', 'semanal', 'mensal', 'trimestral', 'semestral', 'anual')),
    data_proxima_geracao DATE,
    automatico BOOLEAN DEFAULT FALSE,
    
    -- Template e formato
    template_relatorio JSONB, -- Estrutura do relatório
    formato_saida VARCHAR(20) CHECK (formato_saida IN ('pdf', 'excel', 'csv', 'html', 'powerbi')),
    
    -- Distribuição
    destinatarios UUID[], -- IDs dos usuários
    emails_externos TEXT[], -- Emails externos
    canais_distribuicao VARCHAR(100)[], -- 'email', 'portal', 'api'
    
    -- Status
    status VARCHAR(30) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_desenvolvimento')),
    
    -- Controle de acesso
    nivel_confidencialidade VARCHAR(20) CHECK (nivel_confidencialidade IN ('publico', 'interno', 'restrito', 'confidencial')),
    roles_acesso TEXT[],
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_relatorio_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 10. INSTÂNCIAS DE RELATÓRIOS GERADOS
-- Histórico de relatórios gerados
CREATE TABLE IF NOT EXISTS instancias_relatorios_conformidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    relatorio_id UUID NOT NULL REFERENCES relatorios_conformidade(id) ON DELETE CASCADE,
    
    codigo_instancia VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    
    -- Período coberto
    data_inicio_periodo DATE NOT NULL,
    data_fim_periodo DATE NOT NULL,
    data_geracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dados do relatório
    dados_relatorio JSONB, -- Dados estruturados do relatório
    metricas_calculadas JSONB, -- KPIs e métricas
    graficos_dados JSONB, -- Dados para gráficos
    
    -- Arquivo gerado
    arquivo_relatorio TEXT, -- Path para o arquivo
    tamanho_arquivo BIGINT, -- Em bytes
    hash_arquivo VARCHAR(64), -- Para integridade
    
    -- Geração
    gerado_por UUID REFERENCES profiles(id),
    tempo_processamento INTEGER, -- Em segundos
    status_geracao VARCHAR(30) CHECK (status_geracao IN ('processando', 'concluido', 'erro', 'cancelado')),
    mensagem_erro TEXT,
    
    -- Distribuição
    distribuido BOOLEAN DEFAULT FALSE,
    data_distribuicao TIMESTAMP WITH TIME ZONE,
    destinatarios_enviados UUID[],
    
    metadados JSONB DEFAULT '{}',
    
    CONSTRAINT uk_instancia_codigo_tenant UNIQUE (tenant_id, codigo_instancia)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Frameworks
CREATE INDEX IF NOT EXISTS idx_frameworks_compliance_tenant ON frameworks_compliance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_compliance_tipo ON frameworks_compliance(tipo, origem);
CREATE INDEX IF NOT EXISTS idx_frameworks_compliance_status ON frameworks_compliance(status);

-- Requisitos
CREATE INDEX IF NOT EXISTS idx_requisitos_compliance_tenant ON requisitos_compliance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_requisitos_compliance_framework ON requisitos_compliance(framework_id);
CREATE INDEX IF NOT EXISTS idx_requisitos_compliance_criticidade ON requisitos_compliance(criticidade);
CREATE INDEX IF NOT EXISTS idx_requisitos_compliance_responsavel ON requisitos_compliance(responsavel_conformidade);

-- Avaliações
CREATE INDEX IF NOT EXISTS idx_avaliacoes_conformidade_tenant ON avaliacoes_conformidade(tenant_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_conformidade_requisito ON avaliacoes_conformidade(requisito_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_conformidade_resultado ON avaliacoes_conformidade(resultado_conformidade);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_conformidade_datas ON avaliacoes_conformidade(data_planejada, data_conclusao);

-- Não conformidades
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_tenant ON nao_conformidades(tenant_id);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_requisito ON nao_conformidades(requisito_id);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_status ON nao_conformidades(status);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_criticidade ON nao_conformidades(criticidade);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_responsavel ON nao_conformidades(responsavel_tratamento);
CREATE INDEX IF NOT EXISTS idx_nao_conformidades_risco ON nao_conformidades(risco_score DESC);

-- Planos de ação
CREATE INDEX IF NOT EXISTS idx_planos_acao_conformidade_tenant ON planos_acao_conformidade(tenant_id);
CREATE INDEX IF NOT EXISTS idx_planos_acao_conformidade_nao_conf ON planos_acao_conformidade(nao_conformidade_id);
CREATE INDEX IF NOT EXISTS idx_planos_acao_conformidade_responsavel ON planos_acao_conformidade(responsavel_execucao);
CREATE INDEX IF NOT EXISTS idx_planos_acao_conformidade_status ON planos_acao_conformidade(status);
CREATE INDEX IF NOT EXISTS idx_planos_acao_conformidade_datas ON planos_acao_conformidade(data_fim_planejada, data_inicio_planejada);

-- Controles
CREATE INDEX IF NOT EXISTS idx_controles_conformidade_tenant ON controles_conformidade(tenant_id);
CREATE INDEX IF NOT EXISTS idx_controles_conformidade_requisito ON controles_conformidade(requisito_id);
CREATE INDEX IF NOT EXISTS idx_controles_conformidade_proprietario ON controles_conformidade(proprietario_controle);
CREATE INDEX IF NOT EXISTS idx_controles_conformidade_tipo ON controles_conformidade(tipo, natureza);

-- Monitoramento
CREATE INDEX IF NOT EXISTS idx_monitoramento_conformidade_tenant ON monitoramento_conformidade(tenant_id);
CREATE INDEX IF NOT EXISTS idx_monitoramento_conformidade_objeto ON monitoramento_conformidade(tipo_objeto, objeto_id);
CREATE INDEX IF NOT EXISTS idx_monitoramento_conformidade_responsavel ON monitoramento_conformidade(responsavel_monitoramento);

-- Métricas
CREATE INDEX IF NOT EXISTS idx_metricas_conformidade_tenant ON metricas_conformidade(tenant_id);
CREATE INDEX IF NOT EXISTS idx_metricas_conformidade_monitoramento ON metricas_conformidade(monitoramento_id);
CREATE INDEX IF NOT EXISTS idx_metricas_conformidade_data ON metricas_conformidade(data_coleta DESC);

-- Relatórios
CREATE INDEX IF NOT EXISTS idx_relatorios_conformidade_tenant ON relatorios_conformidade(tenant_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_conformidade_tipo ON relatorios_conformidade(tipo_relatorio);

-- Instâncias
CREATE INDEX IF NOT EXISTS idx_instancias_relatorios_tenant ON instancias_relatorios_conformidade(tenant_id);
CREATE INDEX IF NOT EXISTS idx_instancias_relatorios_relatorio ON instancias_relatorios_conformidade(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_instancias_relatorios_periodo ON instancias_relatorios_conformidade(data_inicio_periodo, data_fim_periodo);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE frameworks_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisitos_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_conformidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE nao_conformidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_acao_conformidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE controles_conformidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoramento_conformidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_conformidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_conformidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE instancias_relatorios_conformidade ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança por tenant
CREATE POLICY IF NOT EXISTS frameworks_compliance_tenant_policy ON frameworks_compliance
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS requisitos_compliance_tenant_policy ON requisitos_compliance
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS avaliacoes_conformidade_tenant_policy ON avaliacoes_conformidade
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS nao_conformidades_tenant_policy ON nao_conformidades
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS planos_acao_conformidade_tenant_policy ON planos_acao_conformidade
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS controles_conformidade_tenant_policy ON controles_conformidade
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS monitoramento_conformidade_tenant_policy ON monitoramento_conformidade
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS metricas_conformidade_tenant_policy ON metricas_conformidade
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS relatorios_conformidade_tenant_policy ON relatorios_conformidade
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY IF NOT EXISTS instancias_relatorios_conformidade_tenant_policy ON instancias_relatorios_conformidade
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Function para atualizar timestamp
CREATE OR REPLACE FUNCTION update_compliance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para cada tabela
CREATE TRIGGER IF NOT EXISTS tr_frameworks_compliance_updated_at 
BEFORE UPDATE ON frameworks_compliance 
FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER IF NOT EXISTS tr_requisitos_compliance_updated_at 
BEFORE UPDATE ON requisitos_compliance 
FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER IF NOT EXISTS tr_avaliacoes_conformidade_updated_at 
BEFORE UPDATE ON avaliacoes_conformidade 
FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER IF NOT EXISTS tr_nao_conformidades_updated_at 
BEFORE UPDATE ON nao_conformidades 
FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER IF NOT EXISTS tr_planos_acao_conformidade_updated_at 
BEFORE UPDATE ON planos_acao_conformidade 
FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER IF NOT EXISTS tr_controles_conformidade_updated_at 
BEFORE UPDATE ON controles_conformidade 
FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

CREATE TRIGGER IF NOT EXISTS tr_relatorios_conformidade_updated_at 
BEFORE UPDATE ON relatorios_conformidade 
FOR EACH ROW EXECUTE FUNCTION update_compliance_updated_at();

-- =====================================================
-- FUNCTIONS PARA CÁLCULOS AUTOMÁTICOS
-- =====================================================

-- Função para calcular score de conformidade de um framework
CREATE OR REPLACE FUNCTION calcular_score_conformidade_framework(framework_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_requisitos INTEGER;
    requisitos_conformes INTEGER;
    score_result DECIMAL;
BEGIN
    -- Contar total de requisitos ativos do framework
    SELECT COUNT(*) INTO total_requisitos
    FROM requisitos_compliance 
    WHERE framework_id = framework_id_param AND status = 'ativo';
    
    -- Contar requisitos conformes (última avaliação)
    SELECT COUNT(DISTINCT r.id) INTO requisitos_conformes
    FROM requisitos_compliance r
    INNER JOIN avaliacoes_conformidade a ON r.id = a.requisito_id
    WHERE r.framework_id = framework_id_param 
        AND r.status = 'ativo'
        AND a.resultado_conformidade = 'conforme'
        AND a.data_conclusao = (
            SELECT MAX(data_conclusao) 
            FROM avaliacoes_conformidade a2 
            WHERE a2.requisito_id = r.id
        );
    
    -- Calcular score
    IF total_requisitos > 0 THEN
        score_result := (requisitos_conformes::DECIMAL / total_requisitos::DECIMAL) * 100;
    ELSE
        score_result := 0;
    END IF;
    
    RETURN ROUND(score_result, 2);
END;
$$ LANGUAGE plpgsql;

-- Função para calcular risco de não conformidade
CREATE OR REPLACE FUNCTION calcular_risco_nao_conformidade(nao_conformidade_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    impacto_op INTEGER;
    impacto_rep INTEGER;
    impacto_reg INTEGER;
    criticidade_val VARCHAR(20);
    multiplicador INTEGER;
    risco_final INTEGER;
BEGIN
    -- Buscar dados da não conformidade
    SELECT impacto_operacional, impacto_reputacional, impacto_regulatorio, criticidade
    INTO impacto_op, impacto_rep, impacto_reg, criticidade_val
    FROM nao_conformidades
    WHERE id = nao_conformidade_id_param;
    
    -- Definir multiplicador baseado na criticidade
    multiplicador := CASE criticidade_val
        WHEN 'critica' THEN 4
        WHEN 'alta' THEN 3
        WHEN 'media' THEN 2
        ELSE 1
    END;
    
    -- Calcular risco final
    risco_final := (COALESCE(impacto_op, 1) + COALESCE(impacto_rep, 1) + COALESCE(impacto_reg, 1)) * multiplicador;
    
    RETURN risco_final;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE frameworks_compliance IS 'Frameworks regulatórios e normativos de compliance';
COMMENT ON TABLE requisitos_compliance IS 'Requisitos específicos de cada framework';
COMMENT ON TABLE avaliacoes_conformidade IS 'Avaliações periódicas dos requisitos';
COMMENT ON TABLE nao_conformidades IS 'Registro de gaps e não conformidades identificadas';
COMMENT ON TABLE planos_acao_conformidade IS 'Planos de ação para tratar não conformidades';
COMMENT ON TABLE controles_conformidade IS 'Controles implementados para garantir conformidade';
COMMENT ON TABLE monitoramento_conformidade IS 'Sistema de monitoramento contínuo';
COMMENT ON TABLE metricas_conformidade IS 'Histórico das métricas coletadas';
COMMENT ON TABLE relatorios_conformidade IS 'Templates de relatórios de conformidade';
COMMENT ON TABLE instancias_relatorios_conformidade IS 'Histórico de relatórios gerados';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================