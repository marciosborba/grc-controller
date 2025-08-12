-- ============================================================================
-- MIGRAÇÃO: MÓDULO DE VENDOR RISK MANAGEMENT
-- ============================================================================
-- Criação de tabelas e estrutura para o módulo de gestão de riscos de fornecedores

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: VENDOR_RISKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Informações Básicas do Risco
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_category VARCHAR(50) NOT NULL DEFAULT 'Operational Risk',
    
    -- Avaliação de Risco
    likelihood VARCHAR(20) NOT NULL DEFAULT 'Medium',
    impact VARCHAR(20) NOT NULL DEFAULT 'Medium',
    risk_score INTEGER NOT NULL DEFAULT 9,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'medium',
    
    -- Status e Responsabilidade
    status VARCHAR(30) NOT NULL DEFAULT 'open',
    risk_owner UUID REFERENCES auth.users(id),
    
    -- Datas
    identified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_review_date TIMESTAMPTZ,
    last_review_date TIMESTAMPTZ,
    
    -- Controle de auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_risk_category CHECK (risk_category IN (
        'Operational Risk', 'Financial Risk', 'Security Risk', 
        'Compliance Risk', 'Reputation Risk', 'Strategic Risk'
    )),
    CONSTRAINT valid_likelihood CHECK (likelihood IN (
        'Very Low', 'Low', 'Medium', 'High', 'Very High'
    )),
    CONSTRAINT valid_impact CHECK (impact IN (
        'Very Low', 'Low', 'Medium', 'High', 'Very High'
    )),
    CONSTRAINT valid_risk_level CHECK (risk_level IN (
        'low', 'medium', 'high', 'critical'
    )),
    CONSTRAINT valid_status CHECK (status IN (
        'open', 'in_treatment', 'monitored', 'closed'
    )),
    CONSTRAINT valid_risk_score CHECK (risk_score >= 1 AND risk_score <= 25)
);

-- ============================================================================
-- TABELA: VENDOR_RISK_ACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_risk_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_risk_id UUID NOT NULL REFERENCES vendor_risks(id) ON DELETE CASCADE,
    
    -- Informações da Ação
    title VARCHAR(255) NOT NULL,
    description TEXT,
    responsible_party VARCHAR(255) NOT NULL,
    
    -- Cronograma
    target_completion_date DATE,
    actual_completion_date DATE,
    
    -- Status e Progresso
    status VARCHAR(20) NOT NULL DEFAULT 'Planned',
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    
    -- Controle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_action_status CHECK (status IN (
        'Planned', 'In Progress', 'Completed', 'Cancelled'
    )),
    CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

-- ============================================================================
-- TABELA: VENDOR_COMMUNICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendor_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    vendor_risk_id UUID REFERENCES vendor_risks(id) ON DELETE SET NULL,
    
    -- Comunicação
    type VARCHAR(30) NOT NULL DEFAULT 'General Communication',
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Destinatário
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'Draft',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    
    -- Datas
    sent_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    
    -- Controle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_communication_type CHECK (type IN (
        'General Communication', 'Issue Notification', 'Assessment Request',
        'Contract Renewal', 'Risk Notification', 'Compliance Update'
    )),
    CONSTRAINT valid_communication_status CHECK (status IN (
        'Draft', 'Sent', 'Received', 'Responded'
    )),
    CONSTRAINT valid_priority CHECK (priority IN (
        'Low', 'Medium', 'High', 'Urgent'
    ))
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para vendor_risks
CREATE INDEX IF NOT EXISTS idx_vendor_risks_vendor ON vendor_risks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_risks_status ON vendor_risks(status);
CREATE INDEX IF NOT EXISTS idx_vendor_risks_risk_level ON vendor_risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_vendor_risks_owner ON vendor_risks(risk_owner);
CREATE INDEX IF NOT EXISTS idx_vendor_risks_review_date ON vendor_risks(next_review_date);
CREATE INDEX IF NOT EXISTS idx_vendor_risks_created_at ON vendor_risks(created_at DESC);

-- Índices para vendor_risk_actions
CREATE INDEX IF NOT EXISTS idx_vendor_risk_actions_risk ON vendor_risk_actions(vendor_risk_id);
CREATE INDEX IF NOT EXISTS idx_vendor_risk_actions_status ON vendor_risk_actions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_risk_actions_target_date ON vendor_risk_actions(target_completion_date);

-- Índices para vendor_communications
CREATE INDEX IF NOT EXISTS idx_vendor_communications_vendor ON vendor_communications(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_communications_risk ON vendor_communications(vendor_risk_id);
CREATE INDEX IF NOT EXISTS idx_vendor_communications_status ON vendor_communications(status);
CREATE INDEX IF NOT EXISTS idx_vendor_communications_sent_at ON vendor_communications(sent_at DESC);

-- ============================================================================
-- TRIGGERS PARA AUDITORIA
-- ============================================================================

-- Trigger para atualizar updated_at automaticamente nas tabelas vendor_risks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_vendor_risks_updated_at ON vendor_risks;
CREATE TRIGGER update_vendor_risks_updated_at
    BEFORE UPDATE ON vendor_risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_risk_actions_updated_at ON vendor_risk_actions;
CREATE TRIGGER update_vendor_risk_actions_updated_at
    BEFORE UPDATE ON vendor_risk_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendor_communications_updated_at ON vendor_communications;
CREATE TRIGGER update_vendor_communications_updated_at
    BEFORE UPDATE ON vendor_communications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular o risk_score baseado em likelihood e impact
CREATE OR REPLACE FUNCTION calculate_vendor_risk_score(
    p_likelihood VARCHAR(20),
    p_impact VARCHAR(20)
) RETURNS INTEGER AS $$
DECLARE
    likelihood_score INTEGER;
    impact_score INTEGER;
BEGIN
    -- Mapear likelihood para score
    likelihood_score := CASE p_likelihood
        WHEN 'Very Low' THEN 1
        WHEN 'Low' THEN 2
        WHEN 'Medium' THEN 3
        WHEN 'High' THEN 4
        WHEN 'Very High' THEN 5
        ELSE 3
    END;
    
    -- Mapear impact para score
    impact_score := CASE p_impact
        WHEN 'Very Low' THEN 1
        WHEN 'Low' THEN 2
        WHEN 'Medium' THEN 3
        WHEN 'High' THEN 4
        WHEN 'Very High' THEN 5
        ELSE 3
    END;
    
    -- Retornar o produto
    RETURN likelihood_score * impact_score;
END;
$$ LANGUAGE plpgsql;

-- Função para determinar o risk_level baseado no risk_score
CREATE OR REPLACE FUNCTION determine_vendor_risk_level(p_risk_score INTEGER)
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN CASE
        WHEN p_risk_score >= 20 THEN 'critical'
        WHEN p_risk_score >= 15 THEN 'high'
        WHEN p_risk_score >= 9 THEN 'medium'
        ELSE 'low'
    END;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar risk_score e risk_level automaticamente
CREATE OR REPLACE FUNCTION update_vendor_risk_calculations()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular risk_score
    NEW.risk_score := calculate_vendor_risk_score(NEW.likelihood, NEW.impact);
    
    -- Determinar risk_level
    NEW.risk_level := determine_vendor_risk_level(NEW.risk_score);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS calculate_vendor_risk_trigger ON vendor_risks;
CREATE TRIGGER calculate_vendor_risk_trigger
    BEFORE INSERT OR UPDATE OF likelihood, impact ON vendor_risks
    FOR EACH ROW EXECUTE FUNCTION update_vendor_risk_calculations();

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE vendor_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_risk_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_communications ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: usuários autenticados podem ver
CREATE POLICY "Users can view vendor risks" ON vendor_risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view vendor risk actions" ON vendor_risk_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view vendor communications" ON vendor_communications FOR SELECT TO authenticated USING (true);

-- Políticas para edição (apenas criador ou risk_owner)
CREATE POLICY "Users can edit their vendor risks" ON vendor_risks FOR UPDATE TO authenticated 
USING (created_by = auth.uid() OR risk_owner = auth.uid());

CREATE POLICY "Users can create vendor risks" ON vendor_risks FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Risk owners can delete vendor risks" ON vendor_risks FOR DELETE TO authenticated 
USING (created_by = auth.uid() OR risk_owner = auth.uid());

-- Políticas similares para actions e communications
CREATE POLICY "Users can create vendor risk actions" ON vendor_risk_actions FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can edit their vendor risk actions" ON vendor_risk_actions FOR UPDATE TO authenticated 
USING (created_by = auth.uid());

CREATE POLICY "Users can create vendor communications" ON vendor_communications FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can edit their vendor communications" ON vendor_communications FOR UPDATE TO authenticated 
USING (created_by = auth.uid());

-- ============================================================================
-- DADOS FICTÍCIOS PARA TESTE
-- ============================================================================

-- Inserir riscos de fornecedores fictícios
INSERT INTO vendor_risks (vendor_id, title, description, risk_category, likelihood, impact, status, risk_owner, identified_date, next_review_date, created_by) VALUES
-- Risco para TechSolutions Corp
((SELECT id FROM vendors WHERE name = 'TechSolutions Corp' LIMIT 1), 
'Dependência Crítica de Fornecedor Único', 
'Risco de interrupção dos serviços devido à dependência crítica de um único fornecedor de tecnologia para sistemas essenciais da organização.',
'Operational Risk', 'High', 'Very High', 'open', 
(SELECT id FROM auth.users LIMIT 1), 
NOW() - INTERVAL '30 days', 
NOW() + INTERVAL '60 days',
(SELECT id FROM auth.users LIMIT 1)),

-- Risco para CloudServices Ltd  
((SELECT id FROM vendors WHERE name = 'CloudServices Ltd' LIMIT 1),
'Compliance e Segurança de Dados na Nuvem',
'Riscos relacionados à proteção de dados e compliance em serviços de nuvem terceirizados, incluindo potencial exposição de dados sensíveis.',
'Security Risk', 'Medium', 'High', 'in_treatment',
(SELECT id FROM auth.users LIMIT 1),
NOW() - INTERVAL '45 days',
NOW() + INTERVAL '30 days',
(SELECT id FROM auth.users LIMIT 1)),

-- Risco para SecureData Inc
((SELECT id FROM vendors WHERE name = 'SecureData Inc' LIMIT 1),
'Risco de Continuidade de Negócios',
'Avaliação da capacidade do fornecedor em manter operações durante situações de crise e garantir continuidade dos serviços críticos.',
'Financial Risk', 'Low', 'Very High', 'monitored',
(SELECT id FROM auth.users LIMIT 1),
NOW() - INTERVAL '60 days', 
NOW() + INTERVAL '15 days',
(SELECT id FROM auth.users LIMIT 1)),

-- Risco adicional para CloudServices Ltd
((SELECT id FROM vendors WHERE name = 'CloudServices Ltd' LIMIT 1),
'Conformidade Regulatória Internacional',
'Risco de não conformidade com regulamentações internacionais de proteção de dados (GDPR, LGPD) nos serviços em nuvem.',
'Compliance Risk', 'High', 'High', 'open',
(SELECT id FROM auth.users LIMIT 1),
NOW() - INTERVAL '15 days',
NOW() + INTERVAL '45 days', 
(SELECT id FROM auth.users LIMIT 1)),

-- Risco para TechSolutions Corp
((SELECT id FROM vendors WHERE name = 'TechSolutions Corp' LIMIT 1),
'Vulnerabilidades de Segurança em Software',
'Potencial exposição a vulnerabilidades de segurança devido a patches atrasados e atualizações de software insuficientes.',
'Security Risk', 'Medium', 'High', 'in_treatment',
(SELECT id FROM auth.users LIMIT 1),
NOW() - INTERVAL '20 days',
NOW() + INTERVAL '40 days',
(SELECT id FROM auth.users LIMIT 1));

-- Inserir ações de mitigação fictícias
INSERT INTO vendor_risk_actions (vendor_risk_id, title, description, responsible_party, target_completion_date, status, progress_percentage, created_by) VALUES
-- Ações para o primeiro risco
((SELECT id FROM vendor_risks WHERE title = 'Dependência Crítica de Fornecedor Único' LIMIT 1),
'Identificar Fornecedores Alternativos',
'Mapear e qualificar fornecedores alternativos capazes de fornecer os mesmos serviços críticos em caso de necessidade.',
'João Silva - Gerente de Procurement',
CURRENT_DATE + INTERVAL '90 days', 'In Progress', 40,
(SELECT id FROM auth.users LIMIT 1)),

((SELECT id FROM vendor_risks WHERE title = 'Dependência Crítica de Fornecedor Único' LIMIT 1),
'Implementar Plano de Contingência',
'Desenvolver e testar plano de contingência para transição rápida para fornecedor alternativo.',
'Maria Santos - Gerente de Continuidade',
CURRENT_DATE + INTERVAL '120 days', 'Planned', 0,
(SELECT id FROM auth.users LIMIT 1)),

-- Ações para o segundo risco
((SELECT id FROM vendor_risks WHERE title = 'Compliance e Segurança de Dados na Nuvem' LIMIT 1),
'Auditoria de Segurança Completa',
'Conduzir auditoria detalhada dos controles de segurança implementados pelo fornecedor de nuvem.',
'Carlos Oliveira - CISO',
CURRENT_DATE + INTERVAL '45 days', 'In Progress', 75,
(SELECT id FROM auth.users LIMIT 1)),

-- Ação para o terceiro risco  
((SELECT id FROM vendor_risks WHERE title = 'Conformidade Regulatória Internacional' LIMIT 1),
'Revisão de Contratos de Compliance',
'Revisar e atualizar cláusulas contratuais relacionadas ao compliance com regulamentações internacionais.',
'Ana Costa - Gerente Jurídico',
CURRENT_DATE + INTERVAL '60 days', 'Planned', 10,
(SELECT id FROM auth.users LIMIT 1)),

-- Ação para o quarto risco
((SELECT id FROM vendor_risks WHERE title = 'Vulnerabilidades de Segurança em Software' LIMIT 1),
'Estabelecer SLA para Patches',
'Definir acordo de nível de serviço específico para aplicação de patches de segurança críticos.',
'Pedro Lima - Gerente de TI',
CURRENT_DATE + INTERVAL '30 days', 'In Progress', 60,
(SELECT id FROM auth.users LIMIT 1));

-- Inserir comunicações fictícias
INSERT INTO vendor_communications (vendor_id, vendor_risk_id, type, subject, message, recipient_name, recipient_email, status, priority, sent_at, created_by) VALUES
-- Comunicação sobre dependência crítica
((SELECT id FROM vendors WHERE name = 'TechSolutions Corp' LIMIT 1),
(SELECT id FROM vendor_risks WHERE title = 'Dependência Crítica de Fornecedor Único' LIMIT 1),
'Risk Notification',
'Notificação sobre Avaliação de Risco de Dependência',
'Prezado parceiro, estamos conduzindo uma avaliação de riscos relacionados à nossa dependência de fornecedor único. Gostaríamos de agendar uma reunião para discutir planos de contingência e diversificação de fornecedores.',
'João Silva',
'joao.silva@techsolutions.com',
'Sent', 'High',
NOW() - INTERVAL '5 days',
(SELECT id FROM auth.users LIMIT 1)),

-- Comunicação sobre compliance
((SELECT id FROM vendors WHERE name = 'CloudServices Ltd' LIMIT 1),
(SELECT id FROM vendor_risks WHERE title = 'Compliance e Segurança de Dados na Nuvem' LIMIT 1),
'Compliance Update',
'Solicitação de Documentação de Compliance LGPD/GDPR',
'Prezada equipe, como parte de nossa avaliação contínua de riscos, solicitamos documentação atualizada sobre certificações de compliance com LGPD e GDPR, incluindo relatórios de auditoria recentes.',
'Maria Santos',
'maria.santos@cloudservices.com',
'Sent', 'Medium',
NOW() - INTERVAL '10 days',
(SELECT id FROM auth.users LIMIT 1)),

-- Comunicação geral
((SELECT id FROM vendors WHERE name = 'SecureData Inc' LIMIT 1),
NULL,
'General Communication',
'Reunião Trimestral de Revisão de Serviços',
'Gostaríamos de agendar nossa reunião trimestral para revisar o desempenho dos serviços, discutir melhorias e alinhar expectativas para o próximo período.',
'Carlos Oliveira', 
'carlos.oliveira@securedata.com',
'Draft', 'Medium',
NULL,
(SELECT id FROM auth.users LIMIT 1)),

-- Follow-up sobre patches
((SELECT id FROM vendors WHERE name = 'TechSolutions Corp' LIMIT 1),
(SELECT id FROM vendor_risks WHERE title = 'Vulnerabilidades de Segurança em Software' LIMIT 1),
'Issue Notification',
'Follow-up: Política de Patches de Segurança',
'Dando seguimento à nossa discussão sobre vulnerabilidades, precisamos estabelecer uma política clara para aplicação de patches críticos com SLA definido.',
'João Silva',
'joao.silva@techsolutions.com',
'Responded', 'High',
NOW() - INTERVAL '7 days',
(SELECT id FROM auth.users LIMIT 1));

-- Inserir assessments fictícios adicionais
INSERT INTO vendor_assessments (vendor_id, title, assessment_type, status, score, risk_rating, responses, questionnaire_data, created_by) VALUES
((SELECT id FROM vendors WHERE name = 'TechSolutions Corp' LIMIT 1),
'Avaliação de Risco de Terceiros - Q1 2024',
'Risk Assessment',
'completed', 75, 'Medium',
'{"security": 4, "compliance": 3, "operational": 4, "financial": 5}',
'{"total_questions": 50, "categories": ["security", "compliance", "operational", "financial"]}',
(SELECT id FROM auth.users LIMIT 1)),

((SELECT id FROM vendors WHERE name = 'CloudServices Ltd' LIMIT 1),
'Assessment de Segurança da Informação',
'Security Assessment', 
'in_progress', NULL, NULL,
'{"security": 3, "data_protection": 2}',
'{"total_questions": 30, "categories": ["security", "data_protection"]}',
(SELECT id FROM auth.users LIMIT 1)),

((SELECT id FROM vendors WHERE name = 'SecureData Inc' LIMIT 1),
'Avaliação de Conformidade Regulatória',
'Compliance Assessment',
'completed', 90, 'Low',
'{"lgpd": 5, "iso27001": 4, "sox": 5}',
'{"total_questions": 25, "categories": ["lgpd", "iso27001", "sox"]}',
(SELECT id FROM auth.users LIMIT 1));

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO  
-- ============================================================================

COMMENT ON TABLE vendor_risks IS 'Tabela para armazenar riscos identificados relacionados a fornecedores';
COMMENT ON TABLE vendor_risk_actions IS 'Ações de mitigação para riscos de fornecedores';
COMMENT ON TABLE vendor_communications IS 'Comunicações relacionadas a fornecedores e seus riscos';

COMMENT ON COLUMN vendor_risks.risk_score IS 'Score calculado automaticamente: likelihood × impact (1-25)';
COMMENT ON COLUMN vendor_risks.risk_level IS 'Nível de risco determinado pelo score: low(1-8), medium(9-14), high(15-19), critical(20-25)';

-- Finalização
SELECT 'Módulo Vendor Risk Management criado e populado com sucesso!' as status;