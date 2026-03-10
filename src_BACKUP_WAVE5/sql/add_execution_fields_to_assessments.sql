-- Migration: Add Execution Fields to Assessments Table
-- Adds columns for storing audit results, observations, and evidence.

ALTER TABLE avaliacoes_conformidade
ADD COLUMN IF NOT EXISTS resultado_conformidade TEXT CHECK (resultado_conformidade IN ('conforme', 'nao_conforme', 'parcial', 'nao_aplicavel')),
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS evidencias JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN avaliacoes_conformidade.resultado_conformidade IS 'Resultado final da avaliação do requisito (Conforme, Não Conforme, etc)';
COMMENT ON COLUMN avaliacoes_conformidade.observacoes IS 'Parecer técnico ou observações detalhadas do avaliador';
COMMENT ON COLUMN avaliacoes_conformidade.evidencias IS 'Lista de links ou referências para arquivos de evidência';
