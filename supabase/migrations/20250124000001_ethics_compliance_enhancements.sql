-- Ethics Module Compliance Enhancements
-- Phase 1: Critical Compliance Improvements

-- 1. Legal Privilege Protection Extensions
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS legal_privilege_claimed BOOLEAN DEFAULT FALSE;
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS legal_privilege_reason TEXT;
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS attorney_client_privileged BOOLEAN DEFAULT FALSE;
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS work_product_privileged BOOLEAN DEFAULT FALSE;
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS external_counsel_id UUID REFERENCES profiles(id);
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS legal_review_required BOOLEAN DEFAULT FALSE;
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS legal_review_completed_at TIMESTAMPTZ;
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS legal_reviewer_id UUID REFERENCES profiles(id);

-- 2. Enhanced Investigation Management
CREATE TABLE IF NOT EXISTS ethics_investigation_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ethics_report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
  investigation_type VARCHAR(50) NOT NULL, -- 'preliminary', 'full', 'external', 'legal'
  investigation_scope TEXT NOT NULL,
  investigation_objectives TEXT NOT NULL,
  estimated_duration_days INTEGER,
  planned_start_date DATE,
  planned_completion_date DATE,
  actual_start_date DATE,
  actual_completion_date DATE,
  assigned_investigator_id UUID REFERENCES profiles(id),
  external_investigator_firm TEXT,
  external_investigator_contact TEXT,
  budget_allocated DECIMAL(15,2),
  budget_consumed DECIMAL(15,2),
  investigation_methodology TEXT,
  evidence_preservation_plan TEXT,
  witness_interview_plan TEXT,
  document_review_plan TEXT,
  expert_consultation_plan TEXT,
  risk_assessment TEXT,
  confidentiality_requirements TEXT,
  legal_considerations TEXT,
  regulatory_implications TEXT,
  status VARCHAR(30) DEFAULT 'planning', -- 'planning', 'approved', 'active', 'suspended', 'completed', 'cancelled'
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Evidence Management System
CREATE TABLE IF NOT EXISTS ethics_evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ethics_report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
  investigation_plan_id UUID REFERENCES ethics_investigation_plans(id),
  evidence_type VARCHAR(50) NOT NULL, -- 'document', 'digital', 'physical', 'testimony', 'electronic', 'financial'
  evidence_source VARCHAR(100) NOT NULL, -- 'complainant', 'witness', 'subject', 'third_party', 'system', 'investigation'
  evidence_description TEXT NOT NULL,
  evidence_location TEXT,
  file_path TEXT,
  file_hash VARCHAR(128),
  file_size BIGINT,
  collected_date TIMESTAMPTZ NOT NULL,
  collected_by UUID NOT NULL REFERENCES profiles(id),
  chain_of_custody JSONB DEFAULT '[]'::jsonb,
  preservation_status VARCHAR(30) DEFAULT 'active', -- 'active', 'archived', 'destroyed', 'transferred'
  retention_period_months INTEGER DEFAULT 84, -- 7 years default
  destruction_date DATE,
  legal_hold BOOLEAN DEFAULT FALSE,
  legal_hold_reason TEXT,
  privileged BOOLEAN DEFAULT FALSE,
  privilege_type VARCHAR(50), -- 'attorney_client', 'work_product', 'trade_secret'
  access_restricted BOOLEAN DEFAULT FALSE,
  access_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Witness Management System
CREATE TABLE IF NOT EXISTS ethics_witnesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ethics_report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
  investigation_plan_id UUID REFERENCES ethics_investigation_plans(id),
  witness_type VARCHAR(50) NOT NULL, -- 'complainant', 'subject', 'fact_witness', 'expert_witness', 'character_witness'
  is_anonymous BOOLEAN DEFAULT FALSE,
  witness_name TEXT,
  witness_title TEXT,
  witness_department TEXT,
  witness_location TEXT,
  contact_information JSONB DEFAULT '{}'::jsonb,
  relationship_to_case TEXT,
  potential_bias TEXT,
  credibility_assessment TEXT,
  cooperation_level VARCHAR(30), -- 'cooperative', 'neutral', 'resistant', 'hostile', 'unavailable'
  interview_priority VARCHAR(20) DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  interview_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'scheduled', 'completed', 'declined', 'unavailable'
  interview_date TIMESTAMPTZ,
  interviewer_id UUID REFERENCES profiles(id),
  interview_location TEXT,
  interview_method VARCHAR(30), -- 'in_person', 'video', 'phone', 'written'
  interview_duration_minutes INTEGER,
  interview_summary TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_notes TEXT,
  confidentiality_agreement BOOLEAN DEFAULT FALSE,
  retaliation_concerns BOOLEAN DEFAULT FALSE,
  protection_measures TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Interview Documentation
CREATE TABLE IF NOT EXISTS ethics_interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ethics_report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
  witness_id UUID NOT NULL REFERENCES ethics_witnesses(id),
  investigation_plan_id UUID REFERENCES ethics_investigation_plans(id),
  interview_date TIMESTAMPTZ NOT NULL,
  interview_start_time TIMESTAMPTZ,
  interview_end_time TIMESTAMPTZ,
  interviewer_id UUID NOT NULL REFERENCES profiles(id),
  co_interviewer_id UUID REFERENCES profiles(id),
  interview_location TEXT,
  interview_method VARCHAR(30) NOT NULL,
  recording_permitted BOOLEAN DEFAULT FALSE,
  recording_exists BOOLEAN DEFAULT FALSE,
  transcript_exists BOOLEAN DEFAULT FALSE,
  interview_agenda TEXT,
  key_questions TEXT,
  witness_responses TEXT,
  key_findings TEXT,
  credibility_notes TEXT,
  follow_up_items TEXT,
  evidence_mentioned JSONB DEFAULT '[]'::jsonb,
  other_witnesses_mentioned JSONB DEFAULT '[]'::jsonb,
  document_requests TEXT,
  witness_demeanor TEXT,
  interview_quality VARCHAR(30), -- 'excellent', 'good', 'adequate', 'poor', 'inconclusive'
  legal_concerns TEXT,
  privileged_information BOOLEAN DEFAULT FALSE,
  confidentiality_level VARCHAR(30) DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Corrective Actions Management
CREATE TABLE IF NOT EXISTS ethics_corrective_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ethics_report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'disciplinary', 'training', 'policy_change', 'process_improvement', 'system_change'
  action_category VARCHAR(50) NOT NULL, -- 'preventive', 'corrective', 'punitive', 'remedial'
  action_title VARCHAR(200) NOT NULL,
  action_description TEXT NOT NULL,
  target_individual UUID REFERENCES profiles(id),
  target_department TEXT,
  target_process TEXT,
  responsible_party_id UUID NOT NULL REFERENCES profiles(id),
  assigned_to_id UUID REFERENCES profiles(id),
  priority VARCHAR(20) DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  due_date DATE,
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  status VARCHAR(30) DEFAULT 'planned', -- 'planned', 'approved', 'in_progress', 'completed', 'cancelled', 'overdue'
  approval_required BOOLEAN DEFAULT TRUE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  started_date DATE,
  completed_date DATE,
  effectiveness_measure TEXT,
  success_criteria TEXT,
  verification_method TEXT,
  verification_date DATE,
  verified_by UUID REFERENCES profiles(id),
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  lessons_learned TEXT,
  recommendations TEXT,
  related_policies JSONB DEFAULT '[]'::jsonb,
  related_training JSONB DEFAULT '[]'::jsonb,
  communication_plan TEXT,
  monitoring_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Regulatory Notifications
CREATE TABLE IF NOT EXISTS ethics_regulatory_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ethics_report_id UUID NOT NULL REFERENCES ethics_reports(id) ON DELETE CASCADE,
  regulatory_body VARCHAR(100) NOT NULL, -- 'SEC', 'CFTC', 'DOJ', 'FTC', 'OSHA', 'STATE_AG'
  notification_type VARCHAR(50) NOT NULL, -- 'mandatory', 'voluntary', 'whistleblower', 'cooperation'
  notification_trigger VARCHAR(100) NOT NULL,
  notification_deadline DATE,
  notification_status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'prepared', 'submitted', 'acknowledged', 'closed'
  notification_content TEXT,
  submission_method VARCHAR(50), -- 'online_portal', 'email', 'mail', 'phone', 'in_person'
  submission_date TIMESTAMPTZ,
  submission_reference VARCHAR(100),
  regulator_response TEXT,
  response_date TIMESTAMPTZ,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_deadline DATE,
  legal_counsel_involved BOOLEAN DEFAULT FALSE,
  outside_counsel_id UUID REFERENCES profiles(id),
  privilege_concerns BOOLEAN DEFAULT FALSE,
  confidentiality_requested BOOLEAN DEFAULT FALSE,
  public_disclosure_risk VARCHAR(20), -- 'none', 'low', 'medium', 'high', 'certain'
  business_impact_assessment TEXT,
  communication_restrictions TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enhanced Case Classification
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 100);
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS compliance_impact VARCHAR(20) DEFAULT 'low'; -- 'low', 'medium', 'high', 'critical'
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS regulatory_risk VARCHAR(20) DEFAULT 'low';
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS reputational_risk VARCHAR(20) DEFAULT 'low';
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS financial_impact_estimate DECIMAL(15,2);
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS business_unit_affected TEXT;
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS geographic_scope VARCHAR(50); -- 'local', 'regional', 'national', 'international'
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS stakeholders_affected JSONB DEFAULT '[]'::jsonb;
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS media_attention_risk VARCHAR(20) DEFAULT 'low';
ALTER TABLE ethics_reports ADD COLUMN IF NOT EXISTS litigation_risk VARCHAR(20) DEFAULT 'low';

-- 9. Communication Templates
CREATE TABLE IF NOT EXISTS ethics_communication_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  template_name VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'intake_acknowledgment', 'status_update', 'completion_notice', 'interview_request'
  template_category VARCHAR(50), -- 'complainant', 'subject', 'witness', 'management', 'board', 'regulator'
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb,
  language_code VARCHAR(10) DEFAULT 'pt-BR',
  is_active BOOLEAN DEFAULT TRUE,
  approval_required BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  usage_restrictions TEXT,
  legal_review_required BOOLEAN DEFAULT FALSE,
  legal_reviewed_by UUID REFERENCES profiles(id),
  legal_reviewed_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Analytics and Metrics
CREATE TABLE IF NOT EXISTS ethics_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_category VARCHAR(50) NOT NULL, -- 'volume', 'timing', 'resolution', 'satisfaction', 'compliance'
  metric_period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  metric_target DECIMAL(15,2),
  metric_benchmark DECIMAL(15,2),
  metric_trend VARCHAR(20), -- 'improving', 'stable', 'declining', 'volatile'
  calculation_method TEXT,
  data_sources JSONB DEFAULT '[]'::jsonb,
  quality_indicators JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for new tables
ALTER TABLE ethics_investigation_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_witnesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_regulatory_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_communication_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ethics_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (tenant isolation)
CREATE POLICY "Users can access investigation plans for their tenant" ON ethics_investigation_plans FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Users can access evidence for their tenant" ON ethics_evidence FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Users can access witnesses for their tenant" ON ethics_witnesses FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Users can access interviews for their tenant" ON ethics_interviews FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Users can access corrective actions for their tenant" ON ethics_corrective_actions FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Users can access regulatory notifications for their tenant" ON ethics_regulatory_notifications FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Users can access communication templates for their tenant" ON ethics_communication_templates FOR ALL USING (tenant_id = get_user_tenant_id());
CREATE POLICY "Users can access metrics for their tenant" ON ethics_metrics FOR ALL USING (tenant_id = get_user_tenant_id());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ethics_investigation_plans_tenant_report ON ethics_investigation_plans(tenant_id, ethics_report_id);
CREATE INDEX IF NOT EXISTS idx_ethics_evidence_tenant_report ON ethics_evidence(tenant_id, ethics_report_id);
CREATE INDEX IF NOT EXISTS idx_ethics_witnesses_tenant_report ON ethics_witnesses(tenant_id, ethics_report_id);
CREATE INDEX IF NOT EXISTS idx_ethics_interviews_tenant_report ON ethics_interviews(tenant_id, ethics_report_id);
CREATE INDEX IF NOT EXISTS idx_ethics_corrective_actions_tenant_report ON ethics_corrective_actions(tenant_id, ethics_report_id);
CREATE INDEX IF NOT EXISTS idx_ethics_regulatory_notifications_tenant_report ON ethics_regulatory_notifications(tenant_id, ethics_report_id);
CREATE INDEX IF NOT EXISTS idx_ethics_communication_templates_tenant_type ON ethics_communication_templates(tenant_id, template_type);
CREATE INDEX IF NOT EXISTS idx_ethics_metrics_tenant_period ON ethics_metrics(tenant_id, period_start_date, period_end_date);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ethics_investigation_plans_updated_at BEFORE UPDATE ON ethics_investigation_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ethics_evidence_updated_at BEFORE UPDATE ON ethics_evidence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ethics_witnesses_updated_at BEFORE UPDATE ON ethics_witnesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ethics_interviews_updated_at BEFORE UPDATE ON ethics_interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ethics_corrective_actions_updated_at BEFORE UPDATE ON ethics_corrective_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ethics_regulatory_notifications_updated_at BEFORE UPDATE ON ethics_regulatory_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ethics_communication_templates_updated_at BEFORE UPDATE ON ethics_communication_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ethics_metrics_updated_at BEFORE UPDATE ON ethics_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default communication templates
INSERT INTO ethics_communication_templates (tenant_id, template_name, template_type, template_category, subject_template, body_template, variables, created_by)
SELECT 
  t.id as tenant_id,
  'Confirmação de Recebimento',
  'intake_acknowledgment',
  'complainant',
  'Confirmação de Recebimento - Protocolo {{protocol_number}}',
  'Prezado(a),

Confirmamos o recebimento de sua denúncia registrada sob o protocolo {{protocol_number}} em {{submission_date}}.

Sua denúncia está sendo analisada por nossa equipe especializada e você será informado(a) sobre o andamento do processo.

Para acompanhar o status de sua denúncia, utilize o protocolo {{protocol_number}} em nosso portal.

Atenciosamente,
Comitê de Ética',
  '{"protocol_number": "string", "submission_date": "date", "case_title": "string"}'::jsonb,
  p.id
FROM tenants t
CROSS JOIN profiles p
WHERE p.tenant_id = t.id AND p.role = 'admin'
LIMIT 1;

-- Comments for documentation
COMMENT ON TABLE ethics_investigation_plans IS 'Comprehensive investigation planning and management';
COMMENT ON TABLE ethics_evidence IS 'Evidence collection and chain of custody management';
COMMENT ON TABLE ethics_witnesses IS 'Witness identification and interview management';
COMMENT ON TABLE ethics_interviews IS 'Detailed interview documentation and findings';
COMMENT ON TABLE ethics_corrective_actions IS 'Tracking of corrective and disciplinary actions';
COMMENT ON TABLE ethics_regulatory_notifications IS 'Management of regulatory reporting requirements';
COMMENT ON TABLE ethics_communication_templates IS 'Standardized communication templates';
COMMENT ON TABLE ethics_metrics IS 'Key performance indicators and compliance metrics';