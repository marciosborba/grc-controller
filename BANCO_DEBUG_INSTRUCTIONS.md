# 🔍 INSTRUÇÕES PARA DEBUGAR O BANCO

## Problema Identificado
O banco de dados **NÃO ESTÁ SALVANDO** `is_active: false`. Sempre retorna `true`.

## Como Verificar

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Acesse seu projeto
- Vá em "SQL Editor"

### 2. Execute estas queries para investigar:

```sql
-- 1. Verificar estrutura da coluna is_active
SELECT column_name, column_default, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_grc_prompt_templates' 
AND column_name = 'is_active';

-- 2. Verificar se há triggers
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'ai_grc_prompt_templates';

-- 3. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'ai_grc_prompt_templates';

-- 4. Teste direto
SELECT id, name, is_active FROM ai_grc_prompt_templates 
WHERE id = 'e20d72be-b98d-464f-a94a-bd6e2385f765';

-- 5. Tentar update direto
UPDATE ai_grc_prompt_templates 
SET is_active = false 
WHERE id = 'e20d72be-b98d-464f-a94a-bd6e2385f765';

-- 6. Verificar se funcionou
SELECT id, name, is_active FROM ai_grc_prompt_templates 
WHERE id = 'e20d72be-b98d-464f-a94a-bd6e2385f765';
```

## Possíveis Causas

1. **DEFAULT VALUE**: Coluna tem `DEFAULT true`
2. **TRIGGER**: Trigger que força `is_active = true` 
3. **RLS POLICY**: Política que impede `false`
4. **CHECK CONSTRAINT**: Constraint que só permite `true`

## Solução Temporária

Enquanto isso, o código agora **força o valor no estado local**, então a UI vai funcionar mesmo que o banco não salve.

## Próximos Passos

1. Execute as queries acima
2. Identifique qual é o problema (trigger/constraint/default)
3. Remova ou ajuste a restrição
4. Teste novamente