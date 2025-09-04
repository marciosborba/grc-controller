-- ============================================================================
-- ALEX ASSESSMENT ENGINE - FOUNDATION MIGRATION
-- ============================================================================
-- Criação da estrutura base para o Assessment Engine modular e adaptativo
-- Autor: Claude Code (Alex Assessment)
-- Data: 2025-09-04

-- ============================================================================
-- 1. ASSESSMENT TEMPLATES - Templates personalizáveis por tenant
-- ============================================================================
CREATE TABLE assessment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'custom',
    
    -- Configuração JSON flexível para campos customizados
    config_schema JSONB NOT NULL DEFAULT '{}',
    ui_schema JSONB NOT NULL DEFAULT '{}',
    workflow_config JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB NOT NULL DEFAULT '{}',
    
    -- Metadados do template
    version VARCHAR(10) NOT NULL DEFAULT '1.0',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_global BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    -- Relacionamento com framework base (opcional)
    base_framework_id UUID REFERENCES frameworks(id),
    
    -- Configurações de IA
    ai_enabled BOOLEAN NOT NULL DEFAULT true,
    ai_prompts JSONB NOT NULL DEFAULT '{}',
    
    -- Auditoria
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_assessment_templates_tenant_id ON assessment_templates(tenant_id);
CREATE INDEX idx_assessment_templates_category ON assessment_templates(category);
CREATE INDEX idx_assessment_templates_active ON assessment_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_assessment_templates_global ON assessment_templates(is_global) WHERE is_global = true;

-- ============================================================================
-- 2. FRAMEWORK LIBRARY - Biblioteca expandida de frameworks
-- ============================================================================
CREATE TABLE framework_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) NOT NULL,
    
    -- Definição flexível de controles
    controls_definition JSONB NOT NULL DEFAULT '[]',
    domains_structure JSONB NOT NULL DEFAULT '{}',
    maturity_levels JSONB NOT NULL DEFAULT '[1,2,3,4,5]',
    
    -- Configurações de mercado
    industry_focus TEXT[],
    compliance_domains TEXT[],
    applicable_regions TEXT[],
    certification_requirements JSONB DEFAULT '{}',
    
    -- Metadados
    is_global BOOLEAN NOT NULL DEFAULT true,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    tenant_id UUID REFERENCES tenants(id), -- NULL para frameworks globais
    
    -- Estatísticas de uso
    usage_count INTEGER NOT NULL DEFAULT 0,
    avg_completion_time INTEGER, -- em dias
    avg_compliance_score DECIMAL(5,2),
    
    -- Configurações de IA
    ai_recommendations JSONB DEFAULT '{}',
    benchmarking_data JSONB DEFAULT '{}',
    
    -- Auditoria
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_framework_library_category ON framework_library(category);
CREATE INDEX idx_framework_library_global ON framework_library(is_global) WHERE is_global = true;
CREATE INDEX idx_framework_library_tenant ON framework_library(tenant_id) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_framework_library_industry ON framework_library USING GIN (industry_focus);

-- ============================================================================
-- 3. TENANT ASSESSMENT CONFIGS - Configurações personalizáveis por tenant
-- ============================================================================
CREATE TABLE tenant_assessment_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Configurações de campos customizados
    custom_fields JSONB NOT NULL DEFAULT '{}',
    
    -- Regras de workflow personalizáveis
    workflow_rules JSONB NOT NULL DEFAULT '{
        "default_flow": ["draft", "in_progress", "review", "completed"],
        "approval_required": false,
        "auto_assignment_rules": {},
        "notification_settings": {}
    }',
    
    -- Configurações de UI/UX
    ui_settings JSONB NOT NULL DEFAULT '{
        "theme_colors": {},
        "logo_url": null,
        "custom_terminology": {},
        "dashboard_layout": "default",
        "mobile_enabled": true
    }',
    
    -- Configurações de IA específicas
    ai_settings JSONB NOT NULL DEFAULT '{
        "auto_suggestions": true,
        "smart_validation": true,
        "predictive_scoring": true,
        "benchmark_comparison": true
    }',
    
    -- Configurações de compliance
    compliance_settings JSONB NOT NULL DEFAULT '{
        "required_evidence_types": [],
        "mandatory_approvals": false,
        "audit_trail_required": true,
        "retention_period_days": 2555
    }',
    
    -- Configurações de performance
    performance_settings JSONB NOT NULL DEFAULT '{
        "max_concurrent_assessments": 50,
        "cache_duration_minutes": 30,
        "auto_save_interval_seconds": 60
    }',
    
    -- Auditoria
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. AI ASSESSMENT RECOMMENDATIONS - Histórico de recomendações IA
-- ============================================================================
CREATE TABLE ai_assessment_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    
    -- Tipo e contexto da recomendação
    recommendation_type VARCHAR(100) NOT NULL, -- 'control_suggestion', 'risk_priority', 'evidence_match', etc.
    trigger_context JSONB NOT NULL DEFAULT '{}',
    
    -- Resposta da IA
    ai_provider VARCHAR(100) NOT NULL,
    ai_model VARCHAR(100) NOT NULL,
    ai_prompt_used TEXT NOT NULL,
    ai_response JSONB NOT NULL,
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Status e aplicação
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'applied', 'dismissed', 'expired'
    applied_by UUID,
    applied_at TIMESTAMP WITH TIME ZONE,
    dismissal_reason TEXT,
    
    -- Feedback e aprendizado
    user_feedback JSONB,
    effectiveness_score DECIMAL(3,2), -- 0.00 to 1.00 (feedback do usuário)
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ai_recommendations_assessment ON ai_assessment_recommendations(assessment_id);
CREATE INDEX idx_ai_recommendations_type ON ai_assessment_recommendations(recommendation_type);
CREATE INDEX idx_ai_recommendations_status ON ai_assessment_recommendations(status);
CREATE INDEX idx_ai_recommendations_created ON ai_assessment_recommendations(created_at);

-- ============================================================================
-- 5. ASSESSMENT SNAPSHOTS - Versionamento de assessments
-- ============================================================================
CREATE TABLE assessment_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    
    -- Versionamento
    version_number INTEGER NOT NULL DEFAULT 1,
    snapshot_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'manual', 'auto_save', 'milestone', 'ai_suggestion'
    
    -- Dados do snapshot
    assessment_data JSONB NOT NULL,
    responses_data JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Informações contextuais
    trigger_event VARCHAR(100),
    description TEXT,
    tags TEXT[],
    
    -- Auditoria
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_assessment_snapshots_assessment ON assessment_snapshots(assessment_id);
CREATE INDEX idx_assessment_snapshots_version ON assessment_snapshots(assessment_id, version_number);
CREATE INDEX idx_assessment_snapshots_type ON assessment_snapshots(snapshot_type);

-- ============================================================================
-- 6. ASSESSMENT ANALYTICS - Analytics e métricas detalhadas
-- ============================================================================
CREATE TABLE assessment_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    
    -- Métricas de progresso
    completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    controls_total INTEGER NOT NULL DEFAULT 0,
    controls_completed INTEGER NOT NULL DEFAULT 0,
    controls_in_progress INTEGER NOT NULL DEFAULT 0,
    controls_not_started INTEGER NOT NULL DEFAULT 0,
    
    -- Métricas de qualidade
    avg_maturity_score DECIMAL(3,2),
    compliance_score DECIMAL(5,2),
    evidence_coverage_percentage DECIMAL(5,2),
    
    -- Métricas de tempo
    time_to_complete_days INTEGER,
    avg_response_time_hours DECIMAL(10,2),
    time_in_review_hours DECIMAL(10,2),
    
    -- Métricas de colaboração
    total_participants INTEGER NOT NULL DEFAULT 0,
    active_participants INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    revisions_count INTEGER NOT NULL DEFAULT 0,
    
    -- Métricas de IA
    ai_recommendations_received INTEGER NOT NULL DEFAULT 0,
    ai_recommendations_applied INTEGER NOT NULL DEFAULT 0,
    ai_effectiveness_score DECIMAL(3,2),
    
    -- Timestamp do cálculo
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Dados de benchmark (opcional)
    benchmark_data JSONB,
    
    UNIQUE(assessment_id, calculated_at)
);

-- Índices para performance
CREATE INDEX idx_assessment_analytics_assessment ON assessment_analytics(assessment_id);
CREATE INDEX idx_assessment_analytics_tenant ON assessment_analytics(tenant_id);
CREATE INDEX idx_assessment_analytics_calculated ON assessment_analytics(calculated_at);

-- ============================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_assessment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assessment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_analytics ENABLE ROW LEVEL SECURITY;

-- Assessment Templates Policies
CREATE POLICY "Users can view their tenant's assessment templates" ON assessment_templates
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        OR is_global = true
    );

CREATE POLICY "Users can create assessment templates for their tenant" ON assessment_templates
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their tenant's assessment templates" ON assessment_templates
    FOR UPDATE USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can delete their tenant's assessment templates" ON assessment_templates
    FOR DELETE USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Framework Library Policies  
CREATE POLICY "Users can view global and tenant frameworks" ON framework_library
    FOR SELECT USING (
        is_global = true 
        OR tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can create frameworks for their tenant" ON framework_library
    FOR INSERT WITH CHECK (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
        OR (is_global = true AND EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'platform_admin'
        ))
    );

-- Tenant Assessment Configs Policies
CREATE POLICY "Users can manage their tenant configs" ON tenant_assessment_configs
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- AI Recommendations Policies
CREATE POLICY "Users can view their tenant's AI recommendations" ON ai_assessment_recommendations
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Assessment Snapshots Policies  
CREATE POLICY "Users can manage their tenant's snapshots" ON assessment_snapshots
    FOR ALL USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- Assessment Analytics Policies
CREATE POLICY "Users can view their tenant's analytics" ON assessment_analytics
    FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- ============================================================================
-- 8. TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_assessment_templates_updated_at 
    BEFORE UPDATE ON assessment_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_framework_library_updated_at 
    BEFORE UPDATE ON framework_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_assessment_configs_updated_at 
    BEFORE UPDATE ON tenant_assessment_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_assessment_recommendations_updated_at 
    BEFORE UPDATE ON ai_assessment_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. FUNCTIONS FOR ASSESSMENT ENGINE
-- ============================================================================

-- Function to get assessment template with inherited configurations
CREATE OR REPLACE FUNCTION get_assessment_template_config(template_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    template_config JSONB;
    tenant_config JSONB;
    merged_config JSONB;
BEGIN
    -- Get template configuration
    SELECT config_schema INTO template_config
    FROM assessment_templates 
    WHERE id = template_id_param;
    
    -- Get tenant configuration
    SELECT 
        jsonb_build_object(
            'custom_fields', custom_fields,
            'workflow_rules', workflow_rules,
            'ui_settings', ui_settings,
            'ai_settings', ai_settings
        ) INTO tenant_config
    FROM tenant_assessment_configs tac
    JOIN assessment_templates at ON at.tenant_id = tac.tenant_id
    WHERE at.id = template_id_param;
    
    -- Merge configurations (tenant overrides template)
    merged_config := template_config || COALESCE(tenant_config, '{}'::jsonb);
    
    RETURN merged_config;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate assessment analytics
CREATE OR REPLACE FUNCTION calculate_assessment_analytics(assessment_id_param UUID)
RETURNS VOID AS $$
DECLARE
    tenant_id_var UUID;
    total_controls INTEGER := 0;
    completed_controls INTEGER := 0;
    in_progress_controls INTEGER := 0;
    completion_pct DECIMAL(5,2);
BEGIN
    -- Get tenant_id from assessment
    SELECT tenant_id INTO tenant_id_var 
    FROM assessments WHERE id = assessment_id_param;
    
    -- Calculate control statistics
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE question_status = 'completed'),
        COUNT(*) FILTER (WHERE question_status = 'in_progress')
    INTO total_controls, completed_controls, in_progress_controls
    FROM assessment_responses 
    WHERE assessment_id = assessment_id_param;
    
    -- Calculate completion percentage
    completion_pct := CASE 
        WHEN total_controls > 0 THEN (completed_controls * 100.0) / total_controls 
        ELSE 0 
    END;
    
    -- Insert or update analytics
    INSERT INTO assessment_analytics (
        tenant_id,
        assessment_id, 
        completion_percentage,
        controls_total,
        controls_completed,
        controls_in_progress,
        controls_not_started
    ) VALUES (
        tenant_id_var,
        assessment_id_param,
        completion_pct,
        total_controls,
        completed_controls, 
        in_progress_controls,
        total_controls - completed_controls - in_progress_controls
    )
    ON CONFLICT (assessment_id, calculated_at)
    DO UPDATE SET
        completion_percentage = EXCLUDED.completion_percentage,
        controls_completed = EXCLUDED.controls_completed,
        controls_in_progress = EXCLUDED.controls_in_progress,
        controls_not_started = EXCLUDED.controls_not_started;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE assessment_templates IS 'Templates personalizáveis para assessments, permitindo customização por tenant';
COMMENT ON TABLE framework_library IS 'Biblioteca expandida de frameworks com mais de 25 opções pré-configuradas';
COMMENT ON TABLE tenant_assessment_configs IS 'Configurações específicas por tenant para personalização de UX/UI e workflows';
COMMENT ON TABLE ai_assessment_recommendations IS 'Histórico de recomendações da IA com tracking de aplicação e efetividade';
COMMENT ON TABLE assessment_snapshots IS 'Versionamento e snapshots de assessments para auditoria e rollback';
COMMENT ON TABLE assessment_analytics IS 'Métricas detalhadas e analytics de assessments para dashboards executivos';

-- Migration completed successfully
SELECT 'Alex Assessment Engine Foundation - Migration completed successfully' as status;