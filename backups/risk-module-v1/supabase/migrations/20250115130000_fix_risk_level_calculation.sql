-- Corrigir cálculo do risk_level que está incorreto
-- O risco com score 25 está aparecendo como "Muito Baixo" quando deveria ser "Muito Alto"

-- 1. Primeiro, vamos corrigir a função update_risk_level
CREATE OR REPLACE FUNCTION update_risk_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular nível de risco baseado no score (likelihood_score * impact_score)
    -- Para matriz 5x5: scores vão de 1 (1x1) até 25 (5x5)
    IF NEW.risk_score >= 20 THEN 
        NEW.risk_level := 'Muito Alto';
    ELSIF NEW.risk_score >= 15 THEN 
        NEW.risk_level := 'Alto';
    ELSIF NEW.risk_score >= 8 THEN 
        NEW.risk_level := 'Médio';
    ELSIF NEW.risk_score >= 4 THEN 
        NEW.risk_level := 'Baixo';
    ELSE 
        NEW.risk_level := 'Muito Baixo';
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Recriar o trigger para garantir que está ativo
DROP TRIGGER IF EXISTS update_risk_assessments_trigger ON public.risk_assessments;
CREATE TRIGGER update_risk_assessments_trigger
    BEFORE INSERT OR UPDATE ON public.risk_assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_risk_level();

-- 3. Atualizar todos os registros existentes para recalcular o risk_level
UPDATE public.risk_assessments 
SET updated_at = NOW()
WHERE risk_level != CASE 
    WHEN risk_score >= 20 THEN 'Muito Alto'
    WHEN risk_score >= 15 THEN 'Alto'
    WHEN risk_score >= 8 THEN 'Médio'
    WHEN risk_score >= 4 THEN 'Baixo'
    ELSE 'Muito Baixo'
END;

-- 4. Forçar recálculo de todos os risk_levels
UPDATE public.risk_assessments 
SET risk_level = CASE 
    WHEN risk_score >= 20 THEN 'Muito Alto'
    WHEN risk_score >= 15 THEN 'Alto'
    WHEN risk_score >= 8 THEN 'Médio'
    WHEN risk_score >= 4 THEN 'Baixo'
    ELSE 'Muito Baixo'
END,
updated_at = NOW();

-- 5. Verificar se a correção funcionou
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT id, title, risk_score, risk_level 
        FROM public.risk_assessments 
        ORDER BY risk_score DESC
    LOOP
        RAISE NOTICE 'Risco: % | Score: % | Level: %', rec.title, rec.risk_score, rec.risk_level;
    END LOOP;
END $$;

-- 6. Comentário sobre a correção
COMMENT ON FUNCTION update_risk_level() IS 'Função corrigida para calcular risk_level baseado no risk_score - Score 25 = Muito Alto';

RAISE NOTICE 'Correção do risk_level concluída! Todos os riscos foram recalculados.';