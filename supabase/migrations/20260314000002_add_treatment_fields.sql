-- Migration: Add treatment fields to risk_registrations
-- Adds: treatment_evidence, acceptance_type, treatment_approvers

ALTER TABLE risk_registrations
  ADD COLUMN IF NOT EXISTS treatment_evidence TEXT,
  ADD COLUMN IF NOT EXISTS acceptance_type VARCHAR(20) CHECK (acceptance_type IN ('temporario', 'definitivo')),
  ADD COLUMN IF NOT EXISTS treatment_approvers JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN risk_registrations.treatment_evidence IS 'Evidence or documentation for the treatment (text or URL)';
COMMENT ON COLUMN risk_registrations.acceptance_type IS 'When treatment is accept: temporario or definitivo';
COMMENT ON COLUMN risk_registrations.treatment_approvers IS 'Array of approvers: [{id, name, email, approved, approved_at, sent_at}]';
