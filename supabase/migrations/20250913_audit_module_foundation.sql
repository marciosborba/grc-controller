-- =====================================================
-- MÓDULO AUDITORIA - FUNDAÇÃO ARQUITETURAL
-- Sistema orientado a objetos com motor de vinculação
-- =====================================================

-- 1. UNIVERSO AUDITÁVEL
-- Entidades que podem ser auditadas (processos, subsidiárias, etc.)
CREATE TABLE universo_auditavel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('processo', 'subsidiaria', 'sistema', 'departamento', 'outro')),
    nivel INTEGER NOT NULL DEFAULT 1, -- Para hierarquias
    universo_pai UUID REFERENCES universo_auditavel(id),
    responsavel_id UUID REFERENCES profiles(id),
    criticidade VARCHAR(20) CHECK (criticidade IN ('baixa', 'media', 'alta', 'critica')),
    frequencia_auditoria INTEGER, -- Em meses
    ultima_auditoria DATE,
    proxima_auditoria DATE,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'descontinuado')),
    metadados JSONB DEFAULT '{}', -- Para propriedades flexíveis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_universo_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 2. RISCOS DE AUDITORIA
-- Objetos de risco reutilizáveis vinculados ao universo auditável
CREATE TABLE riscos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100), -- Operacional, Financeiro, Compliance, etc.
    subcategoria VARCHAR(100),
    
    -- Matriz de Risco
    impacto INTEGER CHECK (impacto BETWEEN 1 AND 5),
    probabilidade INTEGER CHECK (probabilidade BETWEEN 1 AND 5),
    risco_inerente INTEGER GENERATED ALWAYS AS (impacto * probabilidade) STORED,
    
    -- Após controles
    impacto_residual INTEGER CHECK (impacto_residual BETWEEN 1 AND 5),
    probabilidade_residual INTEGER CHECK (probabilidade_residual BETWEEN 1 AND 5),
    risco_residual INTEGER GENERATED ALWAYS AS (impacto_residual * probabilidade_residual) STORED,
    
    -- Tolerância e apetite
    tolerancia VARCHAR(20) CHECK (tolerancia IN ('baixa', 'media', 'alta')),
    apetite INTEGER CHECK (apetite BETWEEN 1 AND 25),
    
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_revisao')),
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_risco_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 3. CONTROLES DE AUDITORIA
-- Controles internos vinculados a riscos
CREATE TABLE controles_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    
    -- Classificação do controle
    tipo VARCHAR(50) CHECK (tipo IN ('preventivo', 'detectivo', 'corretivo')),
    natureza VARCHAR(50) CHECK (natureza IN ('manual', 'automatico', 'semi_automatico')),
    frequencia VARCHAR(50) CHECK (frequencia IN ('continuo', 'diario', 'semanal', 'mensal', 'trimestral', 'anual')),
    
    -- Design e operacionalidade
    design_adequado BOOLEAN DEFAULT NULL,
    opera_efetivamente BOOLEAN DEFAULT NULL,
    data_ultima_avaliacao DATE,
    avaliado_por UUID REFERENCES profiles(id),
    
    -- Responsabilidades
    responsavel_design UUID REFERENCES profiles(id),
    responsavel_operacao UUID REFERENCES profiles(id),
    
    -- Evidências e documentação
    evidencias_esperadas TEXT[],
    documentacao_controle TEXT,
    
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_revisao')),
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_controle_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 4. TESTES DE AUDITORIA
-- Procedimentos de teste para controles (templates)
CREATE TABLE testes_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    controle_id UUID NOT NULL REFERENCES controles_auditoria(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    objetivo TEXT NOT NULL,
    procedimento TEXT NOT NULL,
    
    -- Metodologia
    metodologia VARCHAR(50) CHECK (metodologia IN ('inspecao', 'observacao', 'indagacao', 'recalculo', 'reexecucao', 'analitico')),
    tipo_amostra VARCHAR(50) CHECK (tipo_amostra IN ('censo', 'estatistica', 'aleatoria', 'direcionada')),
    tamanho_amostra_minimo INTEGER,
    criterio_selecao TEXT,
    
    -- Frequência e timing
    frequencia VARCHAR(50) CHECK (frequencia IN ('anual', 'rotativa', 'por_demanda')),
    periodo_execucao VARCHAR(100), -- "Janeiro a Dezembro", "Último trimestre", etc.
    
    -- Recursos necessários
    horas_estimadas DECIMAL(5,2),
    nivel_experiencia VARCHAR(50) CHECK (nivel_experiencia IN ('junior', 'pleno', 'senior', 'especialista')),
    skills_necessarias TEXT[],
    ferramentas_necessarias TEXT[],
    
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_revisao')),
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_teste_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 5. PROJETOS DE AUDITORIA
-- Container para execuções de auditoria
CREATE TABLE projetos_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    universo_auditavel_id UUID NOT NULL REFERENCES universo_auditavel(id),
    
    -- Planejamento
    tipo_auditoria VARCHAR(50) CHECK (tipo_auditoria IN ('interna', 'externa', 'regulatoria', 'especial')),
    escopo TEXT,
    objetivos TEXT[],
    data_inicio DATE NOT NULL,
    data_fim_planejada DATE NOT NULL,
    data_fim_real DATE,
    
    -- Equipe
    chefe_auditoria UUID NOT NULL REFERENCES profiles(id),
    equipe_ids UUID[],
    horas_orcadas DECIMAL(7,2),
    horas_realizadas DECIMAL(7,2) DEFAULT 0,
    
    -- Status e fases
    status VARCHAR(50) DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'em_execucao', 'em_revisao', 'concluido', 'cancelado')),
    fase_atual VARCHAR(50) DEFAULT 'planejamento' CHECK (fase_atual IN ('planejamento', 'fieldwork', 'relatorio', 'followup')),
    
    -- Resultados
    rating_geral VARCHAR(20) CHECK (rating_geral IN ('eficaz', 'parcialmente_eficaz', 'ineficaz')),
    total_apontamentos INTEGER DEFAULT 0,
    apontamentos_criticos INTEGER DEFAULT 0,
    apontamentos_altos INTEGER DEFAULT 0,
    apontamentos_medios INTEGER DEFAULT 0,
    apontamentos_baixos INTEGER DEFAULT 0,
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_projeto_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 6. EXECUÇÕES DE TESTE
-- Instâncias de testes executados em projetos específicos
CREATE TABLE execucoes_teste (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    projeto_id UUID NOT NULL REFERENCES projetos_auditoria(id) ON DELETE CASCADE,
    teste_id UUID NOT NULL REFERENCES testes_auditoria(id) ON DELETE CASCADE,
    
    -- Planejamento da execução
    auditor_responsavel UUID NOT NULL REFERENCES profiles(id),
    data_planejada DATE,
    data_execucao DATE,
    horas_realizadas DECIMAL(5,2),
    
    -- Amostragem realizada
    tamanho_amostra_real INTEGER,
    criterio_selecao_usado TEXT,
    populacao_total INTEGER,
    itens_selecionados JSONB, -- Detalhes dos itens testados
    
    -- Resultados
    resultado VARCHAR(50) CHECK (resultado IN ('eficaz', 'parcialmente_eficaz', 'ineficaz', 'nao_aplicavel')),
    total_itens_testados INTEGER DEFAULT 0,
    itens_com_excecao INTEGER DEFAULT 0,
    taxa_erro DECIMAL(5,4), -- Percentual de erro
    
    -- Documentação
    procedimento_executado TEXT,
    observacoes TEXT,
    conclusao TEXT,
    evidencias_obtidas TEXT[],
    limitacoes TEXT,
    
    -- Arquivos anexos
    arquivos_evidencia JSONB DEFAULT '[]',
    
    status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_execucao', 'concluido', 'cancelado')),
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- 7. APONTAMENTOS (FINDINGS)
-- Gerados automaticamente de execuções ineficazes
CREATE TABLE apontamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    projeto_id UUID NOT NULL REFERENCES projetos_auditoria(id) ON DELETE CASCADE,
    execucao_teste_id UUID REFERENCES execucoes_teste(id) ON DELETE CASCADE,
    
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    
    -- Estrutura 4C's (Condição, Critério, Causa, Efeito/Consequência)
    condicao TEXT NOT NULL, -- O que foi encontrado
    criterio TEXT NOT NULL, -- O que deveria ser
    causa TEXT NOT NULL, -- Por que aconteceu
    efeito TEXT NOT NULL, -- Impacto potencial
    
    -- Classificação de risco
    classificacao_risco VARCHAR(20) NOT NULL CHECK (classificacao_risco IN ('baixo', 'medio', 'alto', 'critico')),
    impacto_financeiro DECIMAL(15,2),
    impacto_operacional TEXT,
    impacto_reputacional TEXT,
    impacto_regulatorio TEXT,
    
    -- Recomendações
    recomendacao TEXT NOT NULL,
    recomendacoes_adicionais TEXT[],
    prazo_sugerido INTEGER, -- Em dias
    
    -- Status
    status VARCHAR(50) DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'aguardando_evidencia', 'concluido', 'rejeitado')),
    data_comunicacao DATE,
    comunicado_para UUID REFERENCES profiles(id),
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_apontamento_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 8. PLANOS DE AÇÃO
-- Vinculados aos apontamentos
CREATE TABLE planos_acao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    apontamento_id UUID NOT NULL REFERENCES apontamentos(id) ON DELETE CASCADE,
    
    descricao_acao TEXT NOT NULL,
    responsavel_id UUID NOT NULL REFERENCES profiles(id),
    data_vencimento DATE NOT NULL,
    data_conclusao DATE,
    
    -- Progresso
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'atrasado', 'cancelado')),
    percentual_conclusao INTEGER DEFAULT 0 CHECK (percentual_conclusao BETWEEN 0 AND 100),
    
    -- Acompanhamento
    ultima_atualizacao_responsavel DATE,
    comentario_responsavel TEXT,
    evidencias_conclusao TEXT[],
    arquivos_evidencia JSONB DEFAULT '[]',
    
    -- Avaliação da auditoria
    avaliado_por UUID REFERENCES profiles(id),
    data_avaliacao DATE,
    resultado_avaliacao VARCHAR(50) CHECK (resultado_avaliacao IN ('aceito', 'parcialmente_aceito', 'rejeitado')),
    comentario_auditoria TEXT,
    
    metadados JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- 9. RELACIONAMENTOS (MOTOR DE VINCULAÇÃO)
-- Tabela de vínculos entre objetos para o linking engine
CREATE TABLE audit_object_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Objeto origem
    source_table VARCHAR(100) NOT NULL,
    source_id UUID NOT NULL,
    
    -- Objeto destino
    target_table VARCHAR(100) NOT NULL,
    target_id UUID NOT NULL,
    
    -- Tipo de relacionamento
    relationship_type VARCHAR(100) NOT NULL, -- 'risco_universo', 'controle_risco', 'teste_controle', etc.
    
    -- Metadados do relacionamento
    properties JSONB DEFAULT '{}',
    strength DECIMAL(3,2) DEFAULT 1.0, -- Força da ligação (0.0 a 1.0)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_audit_link UNIQUE (tenant_id, source_table, source_id, target_table, target_id, relationship_type)
);

-- 10. TRILHA DE AUDITORIA IMUTÁVEL
-- Log blockchain-style de todas as alterações
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identificação da operação
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'DELETE', 'LINK', 'UNLINK')),
    
    -- Dados da mudança
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[], -- Campos que mudaram
    
    -- Contexto
    user_id UUID NOT NULL REFERENCES profiles(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp imutável
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Hash para integridade (opcional, para futuro blockchain)
    hash_previous VARCHAR(64),
    hash_current VARCHAR(64),
    
    -- Metadados
    reason TEXT,
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices principais
CREATE INDEX idx_universo_auditavel_tenant ON universo_auditavel(tenant_id);
CREATE INDEX idx_universo_auditavel_tipo ON universo_auditavel(tipo);
CREATE INDEX idx_universo_auditavel_pai ON universo_auditavel(universo_pai);

CREATE INDEX idx_riscos_auditoria_tenant ON riscos_auditoria(tenant_id);
CREATE INDEX idx_riscos_auditoria_categoria ON riscos_auditoria(categoria);
CREATE INDEX idx_riscos_risco_residual ON riscos_auditoria(risco_residual DESC);

CREATE INDEX idx_controles_auditoria_tenant ON controles_auditoria(tenant_id);
CREATE INDEX idx_controles_tipo_natureza ON controles_auditoria(tipo, natureza);

CREATE INDEX idx_projetos_auditoria_tenant ON projetos_auditoria(tenant_id);
CREATE INDEX idx_projetos_status_fase ON projetos_auditoria(status, fase_atual);
CREATE INDEX idx_projetos_chefe ON projetos_auditoria(chefe_auditoria);

CREATE INDEX idx_execucoes_projeto ON execucoes_teste(projeto_id);
CREATE INDEX idx_execucoes_teste ON execucoes_teste(teste_id);
CREATE INDEX idx_execucoes_resultado ON execucoes_teste(resultado);

CREATE INDEX idx_apontamentos_tenant ON apontamentos(tenant_id);
CREATE INDEX idx_apontamentos_projeto ON apontamentos(projeto_id);
CREATE INDEX idx_apontamentos_classificacao ON apontamentos(classificacao_risco);
CREATE INDEX idx_apontamentos_status ON apontamentos(status);

CREATE INDEX idx_planos_responsavel ON planos_acao(responsavel_id);
CREATE INDEX idx_planos_status ON planos_acao(status);
CREATE INDEX idx_planos_vencimento ON planos_acao(data_vencimento);

-- Índices para o linking engine
CREATE INDEX idx_audit_links_source ON audit_object_links(tenant_id, source_table, source_id);
CREATE INDEX idx_audit_links_target ON audit_object_links(tenant_id, target_table, target_id);
CREATE INDEX idx_audit_links_type ON audit_object_links(relationship_type);

-- Índices para trilha de auditoria
CREATE INDEX idx_audit_trail_table_record ON audit_trail(table_name, record_id);
CREATE INDEX idx_audit_trail_user_time ON audit_trail(user_id, timestamp DESC);
CREATE INDEX idx_audit_trail_tenant_time ON audit_trail(tenant_id, timestamp DESC);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_audit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas principais
CREATE TRIGGER tr_universo_auditavel_updated_at BEFORE UPDATE ON universo_auditavel FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();
CREATE TRIGGER tr_riscos_auditoria_updated_at BEFORE UPDATE ON riscos_auditoria FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();
CREATE TRIGGER tr_controles_auditoria_updated_at BEFORE UPDATE ON controles_auditoria FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();
CREATE TRIGGER tr_testes_auditoria_updated_at BEFORE UPDATE ON testes_auditoria FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();
CREATE TRIGGER tr_projetos_auditoria_updated_at BEFORE UPDATE ON projetos_auditoria FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();
CREATE TRIGGER tr_execucoes_teste_updated_at BEFORE UPDATE ON execucoes_teste FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();
CREATE TRIGGER tr_apontamentos_updated_at BEFORE UPDATE ON apontamentos FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();
CREATE TRIGGER tr_planos_acao_updated_at BEFORE UPDATE ON planos_acao FOR EACH ROW EXECUTE FUNCTION update_audit_updated_at();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE universo_auditavel IS 'Entidades auditáveis: processos, subsidiárias, sistemas, etc.';
COMMENT ON TABLE riscos_auditoria IS 'Objetos de risco reutilizáveis com matriz de risco';
COMMENT ON TABLE controles_auditoria IS 'Controles internos vinculados a riscos';
COMMENT ON TABLE testes_auditoria IS 'Templates de procedimentos de teste';
COMMENT ON TABLE projetos_auditoria IS 'Projetos de auditoria com planejamento e execução';
COMMENT ON TABLE execucoes_teste IS 'Instâncias de testes executados em projetos específicos';
COMMENT ON TABLE apontamentos IS 'Findings gerados de testes ineficazes';
COMMENT ON TABLE planos_acao IS 'Planos de ação para remediar apontamentos';
COMMENT ON TABLE audit_object_links IS 'Motor de vinculação entre objetos (linking engine)';
COMMENT ON TABLE audit_trail IS 'Trilha de auditoria imutável estilo blockchain';

-- =====================================================
-- INSERIR DADOS INICIAIS DE EXEMPLO
-- =====================================================

-- Exemplo de tipos de universo auditável
INSERT INTO universo_auditavel (tenant_id, codigo, nome, descricao, tipo, criticidade) VALUES
((SELECT id FROM tenants LIMIT 1), 'PROC-001', 'Contas a Pagar', 'Processo de pagamento de fornecedores', 'processo', 'alta'),
((SELECT id FROM tenants LIMIT 1), 'PROC-002', 'Contas a Receber', 'Processo de recebimento de clientes', 'processo', 'alta'),
((SELECT id FROM tenants LIMIT 1), 'SYS-001', 'ERP Financeiro', 'Sistema integrado de gestão financeira', 'sistema', 'critica'),
((SELECT id FROM tenants LIMIT 1), 'DEPT-001', 'Controladoria', 'Departamento de controladoria', 'departamento', 'media');

-- Exemplo de riscos
INSERT INTO riscos_auditoria (tenant_id, codigo, titulo, descricao, categoria, impacto, probabilidade, impacto_residual, probabilidade_residual) VALUES
((SELECT id FROM tenants LIMIT 1), 'R-AP-001', 'Pagamento Duplicado', 'Risco de pagar a mesma fatura duas vezes', 'Financeiro', 4, 3, 2, 2),
((SELECT id FROM tenants LIMIT 1), 'R-AP-002', 'Pagamento Não Autorizado', 'Risco de pagar sem aprovação adequada', 'Compliance', 5, 2, 3, 1),
((SELECT id FROM tenants LIMIT 1), 'R-AR-001', 'Perda por Inadimplência', 'Risco de não receber valores de clientes', 'Financeiro', 4, 4, 3, 3);

-- Exemplo de controles
INSERT INTO controles_auditoria (tenant_id, codigo, titulo, descricao, tipo, natureza, frequencia) VALUES
((SELECT id FROM tenants LIMIT 1), 'C-AP-001', 'Batimento 3 Vias', 'Conferência entre pedido, nota fiscal e recebimento', 'preventivo', 'manual', 'continuo'),
((SELECT id FROM tenants LIMIT 1), 'C-AP-002', 'Aprovação de Pagamentos', 'Workflow de aprovação por alçadas', 'preventivo', 'automatico', 'continuo'),
((SELECT id FROM tenants LIMIT 1), 'C-AR-001', 'Análise de Crédito', 'Avaliação da capacidade de pagamento do cliente', 'preventivo', 'manual', 'mensal');

-- Criar vínculos básicos
INSERT INTO audit_object_links (tenant_id, source_table, source_id, target_table, target_id, relationship_type) 
SELECT 
    r.tenant_id,
    'riscos_auditoria',
    r.id,
    'universo_auditavel',
    u.id,
    'risco_universo'
FROM riscos_auditoria r
CROSS JOIN universo_auditavel u
WHERE r.tenant_id = u.tenant_id
LIMIT 3;

INSERT INTO audit_object_links (tenant_id, source_table, source_id, target_table, target_id, relationship_type)
SELECT 
    c.tenant_id,
    'controles_auditoria',
    c.id,
    'riscos_auditoria',
    r.id,
    'controle_risco'
FROM controles_auditoria c
CROSS JOIN riscos_auditoria r
WHERE c.tenant_id = r.tenant_id
LIMIT 3;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE universo_auditavel ENABLE ROW LEVEL SECURITY;
ALTER TABLE riscos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE controles_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE testes_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE execucoes_teste ENABLE ROW LEVEL SECURITY;
ALTER TABLE apontamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_acao ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_object_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de RLS (usuário só vê dados do próprio tenant)
CREATE POLICY audit_universo_tenant_policy ON universo_auditavel
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_riscos_tenant_policy ON riscos_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_controles_tenant_policy ON controles_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_testes_tenant_policy ON testes_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_projetos_tenant_policy ON projetos_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_execucoes_tenant_policy ON execucoes_teste
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_apontamentos_tenant_policy ON apontamentos
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_planos_tenant_policy ON planos_acao
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_links_tenant_policy ON audit_object_links
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY audit_trail_tenant_policy ON audit_trail
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================