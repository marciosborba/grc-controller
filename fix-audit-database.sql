-- Script para corrigir a estrutura da tabela projetos_auditoria
-- Adiciona campo fases_visitadas se não existir

ALTER TABLE projetos_auditoria 
ADD COLUMN IF NOT EXISTS fases_visitadas JSONB DEFAULT '["planejamento"]';

-- Atualizar projetos existentes que não têm fases_visitadas
UPDATE projetos_auditoria 
SET fases_visitadas = '["planejamento"]' 
WHERE fases_visitadas IS NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_projetos_auditoria_fases_visitadas 
ON projetos_auditoria USING GIN (fases_visitadas);

-- Comentário na coluna
COMMENT ON COLUMN projetos_auditoria.fases_visitadas 
IS 'Array JSON das fases já visitadas pelo usuário para permitir navegação livre';

-- Verificar estrutura
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'projetos_auditoria' 
AND column_name IN ('fases_visitadas', 'fase_atual', 'completude_planejamento', 'completude_execucao', 'completude_achados', 'completude_relatorio', 'completude_followup')
ORDER BY ordinal_position;
