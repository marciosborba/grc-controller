-- Migration para Sistema de Registro de Risco
-- Data: 2025-08-21

-- Tabela principal de registros de risco
CREATE TABLE risk_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Metadados do processo
    current_step INTEGER DEFAULT 1 CHECK (current_step >= 1 AND current_step <= 7),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled')),
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Etapa 1: Identificação
    risk_title VARCHAR(255),
    risk_description TEXT,
    risk_category VARCHAR(100),
    risk_source VARCHAR(100),
    identified_date DATE,
    business_area VARCHAR(100),
    
    -- Etapa 2: Análise
    analysis_methodology VARCHAR(50) CHECK (analysis_methodology IN ('qualitative', 'quantitative', 'semi_quantitative', 'bow_tie', 'fmea')),
    impact_score INTEGER,
    likelihood_score INTEGER,
    risk_score DECIMAL(10,2),
    risk_level VARCHAR(50),
    analysis_notes TEXT,
    methodology_config JSONB, -- Configurações específicas da metodologia
    
    -- Etapa 3: Classificação GUT
    gut_gravity INTEGER CHECK (gut_gravity >= 1 AND gut_gravity <= 5),
    gut_urgency INTEGER CHECK (gut_urgency >= 1 AND gut_urgency <= 5),
    gut_tendency INTEGER CHECK (gut_tendency >= 1 AND gut_tendency <= 5),
    gut_score INTEGER GENERATED ALWAYS AS (gut_gravity * gut_urgency * gut_tendency) STORED,
    gut_priority VARCHAR(20),
    
    -- Etapa 4: Tratamento
    treatment_strategy VARCHAR(20) CHECK (treatment_strategy IN ('mitigate', 'transfer', 'avoid', 'accept')),
    treatment_rationale TEXT,
    treatment_cost DECIMAL(15,2),
    treatment_timeline DATE,
    
    -- Etapa 6: Comunicação
    communication_plan JSONB,
    requires_approval BOOLEAN DEFAULT false,
    
    -- Etapa 7: Monitoramento
    monitoring_frequency VARCHAR(20) CHECK (monitoring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
    monitoring_indicators TEXT[],
    residual_impact INTEGER,
    residual_likelihood INTEGER,
    residual_score DECIMAL(10,2),
    closure_date DATE,
    closure_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atividades do plano de ação (Etapa 5)
CREATE TABLE risk_action_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    risk_registration_id UUID NOT NULL REFERENCES risk_registrations(id) ON DELETE CASCADE,
    
    activity_name VARCHAR(255) NOT NULL,
    activity_description TEXT,
    responsible_user_id UUID REFERENCES auth.users(id),
    responsible_name VARCHAR(255),
    responsible_email VARCHAR(255),
    
    due_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    
    completion_date DATE,
    completion_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de stakeholders e comunicação (Etapa 6)
CREATE TABLE risk_stakeholders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    risk_registration_id UUID NOT NULL REFERENCES risk_registrations(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    notification_type VARCHAR(20) DEFAULT 'awareness' CHECK (notification_type IN ('awareness', 'approval')),
    notified_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    response_status VARCHAR(20) DEFAULT 'pending' CHECK (response_status IN ('pending', 'acknowledged', 'approved', 'rejected')),
    response_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de etapas
CREATE TABLE risk_registration_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    risk_registration_id UUID NOT NULL REFERENCES risk_registrations(id) ON DELETE CASCADE,
    
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    completed_by UUID NOT NULL REFERENCES auth.users(id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    step_data JSONB, -- Dados específicos da etapa
    notes TEXT
);

-- Tabela de metodologias de análise de risco
CREATE TABLE risk_methodologies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    
    -- Configurações da metodologia
    config_schema JSONB, -- Schema JSON para validação
    default_config JSONB, -- Configurações padrão
    
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(tenant_id, code)
);

-- Tabela de templates de carta de risco
CREATE TABLE risk_letter_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) DEFAULT 'acceptance', -- acceptance, transfer, etc
    
    subject_template TEXT,
    body_template TEXT, -- Template com placeholders
    
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_risk_registrations_tenant ON risk_registrations(tenant_id);
CREATE INDEX idx_risk_registrations_status ON risk_registrations(status);
CREATE INDEX idx_risk_registrations_step ON risk_registrations(current_step);
CREATE INDEX idx_risk_action_plans_risk ON risk_action_plans(risk_registration_id);
CREATE INDEX idx_risk_stakeholders_risk ON risk_stakeholders(risk_registration_id);
CREATE INDEX idx_risk_history_risk ON risk_registration_history(risk_registration_id);

-- RLS Policies
ALTER TABLE risk_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_registration_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_letter_templates ENABLE ROW LEVEL SECURITY;

-- Policies para risk_registrations
CREATE POLICY "Users can view risk registrations from their tenant" ON risk_registrations FOR SELECT
    USING (tenant_id IN (SELECT tenant_id FROM user_tenant_access WHERE user_id = auth.uid()));

CREATE POLICY "Users can create risk registrations in their tenant" ON risk_registrations FOR INSERT
    WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_tenant_access WHERE user_id = auth.uid()));

CREATE POLICY "Users can update risk registrations from their tenant" ON risk_registrations FOR UPDATE
    USING (tenant_id IN (SELECT tenant_id FROM user_tenant_access WHERE user_id = auth.uid()));

-- Policies para risk_action_plans
CREATE POLICY "Users can view action plans from their tenant" ON risk_action_plans FOR SELECT
    USING (risk_registration_id IN (
        SELECT id FROM risk_registrations WHERE tenant_id IN (
            SELECT tenant_id FROM user_tenant_access WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can manage action plans from their tenant" ON risk_action_plans FOR ALL
    USING (risk_registration_id IN (
        SELECT id FROM risk_registrations WHERE tenant_id IN (
            SELECT tenant_id FROM user_tenant_access WHERE user_id = auth.uid()
        )
    ));

-- Policies similares para outras tabelas
CREATE POLICY "Users can view stakeholders from their tenant" ON risk_stakeholders FOR SELECT
    USING (risk_registration_id IN (
        SELECT id FROM risk_registrations WHERE tenant_id IN (
            SELECT tenant_id FROM user_tenant_access WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can manage stakeholders from their tenant" ON risk_stakeholders FOR ALL
    USING (risk_registration_id IN (
        SELECT id FROM risk_registrations WHERE tenant_id IN (
            SELECT tenant_id FROM user_tenant_access WHERE user_id = auth.uid()
        )
    ));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risk_registrations_updated_at
    BEFORE UPDATE ON risk_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_risk_action_plans_updated_at
    BEFORE UPDATE ON risk_action_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_risk_stakeholders_updated_at
    BEFORE UPDATE ON risk_stakeholders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Inserir metodologias padrão
INSERT INTO risk_methodologies (name, code, description, config_schema, default_config, is_default) VALUES
('Análise Qualitativa', 'qualitative', 'Metodologia baseada em escalas qualitativas de impacto e probabilidade', 
 '{"type": "object", "properties": {"impact_scale": {"type": "array"}, "likelihood_scale": {"type": "array"}}}',
 '{"impact_scale": ["Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto"], "likelihood_scale": ["Raro", "Improvável", "Possível", "Provável", "Quase Certo"]}',
 true),

('Análise Quantitativa', 'quantitative', 'Metodologia baseada em valores monetários e percentuais', 
 '{"type": "object", "properties": {"currency": {"type": "string"}, "time_horizon": {"type": "string"}}}',
 '{"currency": "BRL", "time_horizon": "12 months"}',
 false),

('Análise Semi-Quantitativa', 'semi_quantitative', 'Combinação de escalas qualitativas com valores numéricos', 
 '{"type": "object", "properties": {"score_range": {"type": "object"}}}',
 '{"score_range": {"min": 1, "max": 25}}',
 false),

('Bow-Tie Analysis', 'bow_tie', 'Análise de causas e consequências do risco', 
 '{"type": "object", "properties": {"barriers": {"type": "array"}}}',
 '{"barriers": []}',
 false),

('FMEA', 'fmea', 'Failure Mode and Effects Analysis', 
 '{"type": "object", "properties": {"detection_scale": {"type": "array"}}}',
 '{"detection_scale": [1, 2, 3, 4, 5]}',
 false);

-- Comentários nas tabelas
COMMENT ON TABLE risk_registrations IS 'Tabela principal para registro completo de riscos com processo de 7 etapas';
COMMENT ON TABLE risk_action_plans IS 'Planos de ação para tratamento de riscos (Etapa 5)';
COMMENT ON TABLE risk_stakeholders IS 'Stakeholders e comunicação de riscos (Etapa 6)';
COMMENT ON TABLE risk_registration_history IS 'Histórico de progresso das etapas do registro de risco';
COMMENT ON TABLE risk_methodologies IS 'Metodologias disponíveis para análise de risco';
COMMENT ON TABLE risk_letter_templates IS 'Templates para cartas de risco e comunicações';