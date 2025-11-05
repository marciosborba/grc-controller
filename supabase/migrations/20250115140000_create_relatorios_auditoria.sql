-- =====================================================
-- MÓDULO RELATÓRIOS DE AUDITORIA
-- Sistema completo de geração e gestão de relatórios
-- =====================================================

-- 1. TABELA PRINCIPAL DE RELATÓRIOS
CREATE TABLE IF NOT EXISTS relatorios_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    projeto_id UUID REFERENCES projetos_auditoria(id) ON DELETE CASCADE,
    
    -- Identificação
    codigo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    -- Classificação
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('executivo', 'tecnico', 'compliance', 'risco', 'performance', 'seguimento', 'especial')),
    categoria VARCHAR(50) CHECK (categoria IN ('interno', 'externo', 'regulatorio', 'investigativo')),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    
    -- Conteúdo
    resumo_executivo TEXT,
    objetivo TEXT,
    escopo TEXT,
    metodologia TEXT,
    limitacoes TEXT,
    conclusao TEXT,
    
    -- Estrutura do relatório
    secoes JSONB DEFAULT '[]', -- Array de seções do relatório
    anexos JSONB DEFAULT '[]', -- Array de anexos
    referencias JSONB DEFAULT '[]', -- Array de referências
    
    -- Métricas e resultados
    total_apontamentos INTEGER DEFAULT 0,
    apontamentos_criticos INTEGER DEFAULT 0,
    apontamentos_altos INTEGER DEFAULT 0,
    apontamentos_medios INTEGER DEFAULT 0,
    apontamentos_baixos INTEGER DEFAULT 0,
    
    -- Scores e avaliações
    compliance_score INTEGER CHECK (compliance_score BETWEEN 0 AND 100),
    eficiencia_score INTEGER CHECK (eficiencia_score BETWEEN 0 AND 100),
    qualidade_score INTEGER CHECK (qualidade_score BETWEEN 0 AND 100),
    
    -- Workflow e aprovação
    status VARCHAR(50) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'revisao', 'aprovado', 'publicado', 'distribuido', 'arquivado')),
    fase_atual VARCHAR(50) DEFAULT 'elaboracao' CHECK (fase_atual IN ('elaboracao', 'revisao_tecnica', 'revisao_gerencial', 'aprovacao', 'distribuicao')),
    
    -- Responsáveis
    autor_id UUID NOT NULL REFERENCES profiles(id),
    revisor_tecnico_id UUID REFERENCES profiles(id),
    revisor_gerencial_id UUID REFERENCES profiles(id),
    aprovador_id UUID REFERENCES profiles(id),
    
    -- Datas importantes
    data_inicio_elaboracao DATE,
    data_conclusao_elaboracao DATE,
    data_revisao_tecnica DATE,
    data_revisao_gerencial DATE,
    data_aprovacao DATE,
    data_distribuicao DATE,
    data_vencimento DATE,
    
    -- Versionamento
    versao VARCHAR(10) DEFAULT '1.0',
    versao_anterior_id UUID REFERENCES relatorios_auditoria(id),
    motivo_revisao TEXT,
    
    -- Distribuição e acesso
    distribuido_para JSONB DEFAULT '[]', -- Array de IDs de usuários/grupos
    nivel_confidencialidade VARCHAR(20) DEFAULT 'interno' CHECK (nivel_confidencialidade IN ('publico', 'interno', 'confidencial', 'restrito')),
    
    -- Configurações de exportação
    configuracao_exportacao JSONB DEFAULT '{}',
    
    -- Metadados
    metadados JSONB DEFAULT '{}',
    tags TEXT[],
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id),
    
    CONSTRAINT uk_relatorio_codigo_tenant UNIQUE (tenant_id, codigo)
);

-- 2. TABELA DE EXPORTAÇÕES
CREATE TABLE IF NOT EXISTS relatorios_exportacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    relatorio_id UUID NOT NULL REFERENCES relatorios_auditoria(id) ON DELETE CASCADE,
    
    -- Identificação
    relatorio_titulo VARCHAR(255) NOT NULL,
    formato VARCHAR(20) NOT NULL CHECK (formato IN ('pdf', 'docx', 'html', 'excel', 'pptx')),
    
    -- Status do processamento
    status VARCHAR(20) DEFAULT 'processando' CHECK (status IN ('processando', 'concluido', 'erro', 'cancelado')),
    progresso INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
    
    -- Arquivo gerado
    url_download TEXT,
    tamanho_arquivo BIGINT, -- em bytes
    hash_arquivo VARCHAR(64),
    
    -- Configurações utilizadas
    configuracao JSONB NOT NULL DEFAULT '{}',
    distribuicao JSONB DEFAULT '{}',
    
    -- Métricas de uso
    downloads_count INTEGER DEFAULT 0,
    visualizacoes_count INTEGER DEFAULT 0,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    
    -- Expiração
    data_expiracao TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    criado_por UUID NOT NULL REFERENCES profiles(id),
    
    -- Metadados
    metadados JSONB DEFAULT '{}'
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_relatorios_auditoria_tenant ON relatorios_auditoria(tenant_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_auditoria_projeto ON relatorios_auditoria(projeto_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_auditoria_tipo ON relatorios_auditoria(tipo);
CREATE INDEX IF NOT EXISTS idx_relatorios_auditoria_status ON relatorios_auditoria(status);
CREATE INDEX IF NOT EXISTS idx_relatorios_auditoria_autor ON relatorios_auditoria(autor_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_auditoria_data ON relatorios_auditoria(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_relatorios_exportacoes_relatorio ON relatorios_exportacoes(relatorio_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_exportacoes_status ON relatorios_exportacoes(status);
CREATE INDEX IF NOT EXISTS idx_relatorios_exportacoes_data ON relatorios_exportacoes(data_criacao DESC);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_relatorios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
CREATE TRIGGER tr_relatorios_auditoria_updated_at 
    BEFORE UPDATE ON relatorios_auditoria 
    FOR EACH ROW EXECUTE FUNCTION update_relatorios_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE relatorios_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_exportacoes ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (usuário só vê dados do próprio tenant)
CREATE POLICY relatorios_auditoria_tenant_policy ON relatorios_auditoria
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY relatorios_exportacoes_tenant_policy ON relatorios_exportacoes
    USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- =====================================================
-- DADOS INICIAIS DE EXEMPLO
-- =====================================================

-- Inserir alguns relatórios de exemplo (se existirem projetos)
DO $$
DECLARE
    tenant_uuid UUID;
    projeto_uuid UUID;
    autor_uuid UUID;
BEGIN
    -- Buscar dados necessários
    SELECT id INTO tenant_uuid FROM tenants LIMIT 1;
    SELECT id INTO projeto_uuid FROM projetos_auditoria WHERE tenant_id = tenant_uuid LIMIT 1;
    SELECT id INTO autor_uuid FROM profiles WHERE tenant_id = tenant_uuid LIMIT 1;
    
    -- Inserir apenas se existirem os dados necessários
    IF tenant_uuid IS NOT NULL AND autor_uuid IS NOT NULL THEN
        INSERT INTO relatorios_auditoria (
            tenant_id, projeto_id, codigo, titulo, tipo, categoria, 
            resumo_executivo, status, autor_id, prioridade,
            total_apontamentos, apontamentos_criticos, compliance_score,
            created_by
        ) VALUES
        (
            tenant_uuid,
            projeto_uuid,
            'REL-001',
            'Relatório Executivo - Auditoria de Processos Financeiros Q4 2024',
            'executivo',
            'interno',
            'Análise abrangente dos controles internos financeiros identificou 3 deficiências críticas que requerem ação imediata da administração.',
            'publicado',
            autor_uuid,
            'alta',
            12,
            3,
            85,
            autor_uuid
        ),
        (
            tenant_uuid,
            projeto_uuid,
            'REL-002',
            'Relatório Técnico - Avaliação de Controles de TI',
            'tecnico',
            'interno',
            'Avaliação detalhada dos controles de acesso, backup e segurança da informação.',
            'revisao',
            autor_uuid,
            'media',
            8,
            1,
            78,
            autor_uuid
        ),
        (
            tenant_uuid,
            projeto_uuid,
            'REL-003',
            'Relatório de Compliance - LGPD e Proteção de Dados',
            'compliance',
            'regulatorio',
            'Avaliação da conformidade com a Lei Geral de Proteção de Dados.',
            'aprovado',
            autor_uuid,
            'media',
            6,
            0,
            92,
            autor_uuid
        );
    END IF;
END $$;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE relatorios_auditoria IS 'Relatórios de auditoria com workflow completo de aprovação';
COMMENT ON TABLE relatorios_exportacoes IS 'Histórico de exportações de relatórios em diferentes formatos';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================