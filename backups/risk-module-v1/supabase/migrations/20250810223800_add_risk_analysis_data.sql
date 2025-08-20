-- Adicionar coluna analysis_data na tabela risk_assessments
-- Para armazenar dados de análise estruturada de risco

-- Adicionar a coluna como JSONB para flexibilidade
ALTER TABLE risk_assessments 
ADD COLUMN analysis_data JSONB;

-- Comentário para documentar a coluna
COMMENT ON COLUMN risk_assessments.analysis_data IS 'Dados da análise estruturada de risco (tipo de risco, questões, scores, matriz GUT)';

-- Criar índice para consultas eficientes no JSONB
CREATE INDEX IF NOT EXISTS risk_assessments_analysis_data_idx ON risk_assessments USING gin (analysis_data);

-- Opcional: Criar índices específicos para campos frequentemente consultados
CREATE INDEX IF NOT EXISTS risk_assessments_risk_type_idx ON risk_assessments USING gin ((analysis_data->'riskType'));
CREATE INDEX IF NOT EXISTS risk_assessments_matrix_size_idx ON risk_assessments USING gin ((analysis_data->'matrixSize'));