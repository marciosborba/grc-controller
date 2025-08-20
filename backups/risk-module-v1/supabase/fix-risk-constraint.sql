-- ============================================================================
-- CORREÇÃO DE CONSTRAINT dpia_valid_risk
-- ============================================================================

-- 1. VERIFICAR constraint atual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'dpia_assessments' 
AND conname LIKE '%risk%';

-- 2. REMOVER constraint problemática
ALTER TABLE dpia_assessments DROP CONSTRAINT IF EXISTS dpia_valid_risk;

-- 3. REMOVER também residual_risk constraint se existir
ALTER TABLE dpia_assessments DROP CONSTRAINT IF EXISTS dpia_valid_residual_risk;

-- 4. RECRIAR constraints com valores usados pelo componente
ALTER TABLE dpia_assessments 
ADD CONSTRAINT dpia_valid_risk 
CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE dpia_assessments 
ADD CONSTRAINT dpia_valid_residual_risk 
CHECK (residual_risk_level IS NULL OR residual_risk_level IN ('low', 'medium', 'high', 'critical'));

-- 5. VERIFICAR constraints criadas
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class t ON t.oid = c.conrelid
WHERE t.relname = 'dpia_assessments' 
AND conname LIKE '%risk%';

-- 6. TESTE: Inserir um DPIA para verificar se funciona
-- (Descomente as linhas abaixo após executar as correções acima)

-- INSERT INTO dpia_assessments (title, description, risk_level, created_by, updated_by) 
-- VALUES ('Teste Risk', 'Teste constraint', 'medium', '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e', '0b11ee06-1ca6-45fd-812e-5c4b364b1a1e');

-- SELECT 'CONSTRAINT CORRIGIDA COM SUCESSO!' as status;