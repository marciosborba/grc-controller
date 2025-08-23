-- Script para debugar por que is_active não está sendo salvo como false

-- 1. Verificar a estrutura da tabela
\d ai_grc_prompt_templates;

-- 2. Verificar se há default value na coluna is_active
SELECT column_name, column_default, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_grc_prompt_templates' 
AND column_name = 'is_active';

-- 3. Verificar se há triggers na tabela
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'ai_grc_prompt_templates';

-- 4. Verificar se há check constraints
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.constraint_column_usage 
    WHERE table_name = 'ai_grc_prompt_templates' 
    AND column_name = 'is_active'
);

-- 5. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'ai_grc_prompt_templates';

-- 6. Teste direto de update
SELECT id, name, is_active FROM ai_grc_prompt_templates 
WHERE id = 'e20d72be-b98d-464f-a94a-bd6e2385f765';

-- Tentar update direto
UPDATE ai_grc_prompt_templates 
SET is_active = false, updated_at = NOW()
WHERE id = 'e20d72be-b98d-464f-a94a-bd6e2385f765';

-- Verificar se foi salvo
SELECT id, name, is_active FROM ai_grc_prompt_templates 
WHERE id = 'e20d72be-b98d-464f-a94a-bd6e2385f765';