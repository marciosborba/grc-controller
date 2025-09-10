-- ============================================================================
-- ADICIONAR CAMPOS DO WIZARD (Execute se não existirem)
-- ============================================================================

-- CAMPOS DO PLANO DE AÇÃO
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS activity_1_name VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS activity_1_description TEXT;
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS activity_1_responsible VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS activity_1_email VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS activity_1_priority VARCHAR(20);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS activity_1_status VARCHAR(20);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS activity_1_due_date DATE;

-- CAMPOS DE COMUNICAÇÃO - CIÊNCIA
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS awareness_person_1_name VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS awareness_person_1_position VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS awareness_person_1_email VARCHAR(255);

-- CAMPOS DE COMUNICAÇÃO - APROVAÇÃO
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS approval_person_1_name VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS approval_person_1_position VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS approval_person_1_email VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS approval_person_1_status VARCHAR(20);

-- CAMPOS DE TRATAMENTO
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS treatment_rationale TEXT;
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS treatment_cost DECIMAL(15,2);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS treatment_timeline VARCHAR(255);

-- CAMPOS DE MONITORAMENTO
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS monitoring_frequency VARCHAR(50);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS monitoring_responsible VARCHAR(255);
ALTER TABLE risk_registrations ADD COLUMN IF NOT EXISTS closure_criteria TEXT;