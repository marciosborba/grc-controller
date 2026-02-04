
ALTER TABLE vulnerabilities 
ADD COLUMN IF NOT EXISTS risk_assessment_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS risk_score NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS priority_score NUMERIC DEFAULT NULL;

COMMENT ON COLUMN vulnerabilities.risk_assessment_data IS 'Dados detalhados da avaliação de risco (CVSS vectors, impacto de negócio, etc)';
COMMENT ON COLUMN vulnerabilities.risk_score IS 'Score de risco de negócio calculado (0-10)';
COMMENT ON COLUMN vulnerabilities.priority_score IS 'Score de priorização calculado (0-10)';
