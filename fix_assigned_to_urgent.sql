-- CORREÇÃO URGENTE: Alterar campo assigned_to de UUID para TEXT
-- Execute este SQL AGORA no Dashboard do Supabase: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd

-- 1. Limpar dados existentes no campo assigned_to (se houver)
UPDATE public.risk_assessments SET assigned_to = NULL WHERE assigned_to IS NOT NULL;

-- 2. Alterar tipo da coluna de UUID para TEXT
ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;

-- 3. Verificar se a alteração funcionou
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'risk_assessments' 
AND column_name = 'assigned_to';

-- Se o resultado mostrar data_type = 'text', a correção funcionou!

-- 4. Teste de inserção para confirmar
INSERT INTO public.risk_assessments (
    title,
    risk_category,
    probability,
    likelihood_score,
    impact_score,
    risk_level,
    status,
    assigned_to,
    tenant_id,
    created_by
) VALUES (
    'Teste Correção',
    'Operacional',
    3,
    3,
    3,
    'Médio',
    'Identificado',
    'teste',  -- Agora deve funcionar!
    '46b1c048-85a1-423b-96fc-776007c8de1f',
    '0c5c1433-2682-460c-992a-f4cce57c0d6d'
);

-- 5. Limpar o teste
DELETE FROM public.risk_assessments WHERE title = 'Teste Correção';

-- ✅ PRONTO! Agora o campo assigned_to aceita texto como "teste"