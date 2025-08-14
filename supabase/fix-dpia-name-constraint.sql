-- ============================================================================
-- CORREÇÃO IMEDIATA: Remover constraint NOT NULL do campo 'name'
-- ============================================================================

-- Alterar o campo 'name' para permitir NULL
ALTER TABLE dpia_assessments ALTER COLUMN name DROP NOT NULL;

-- Verificar se a correção funcionou
SELECT 
    column_name, 
    is_nullable, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'dpia_assessments' 
AND column_name IN ('name', 'title')
ORDER BY column_name;