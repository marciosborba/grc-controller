# 🚑 CORREÇÃO URGENTE - Campo assigned_to

## 🎯 Problema Identificado
- Campo `assigned_to` na tabela `risk_assessments` é do tipo **UUID**
- Aplicação está enviando texto "teste" para campo UUID
- Erro: `invalid input syntax for type uuid: "teste"`

## ✅ Diagnóstico Completo Realizado
- ✅ Scripts de diagnóstico executados
- ✅ Problema confirmado via Supabase API
- ✅ Solução temporária implementada no código
- ✅ Instruções de correção geradas

## 🚀 SOLUÇÃO IMEDIATA

### 1. Acesse o Dashboard do Supabase
```
https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd
```

### 2. Vá em "SQL Editor" (menu lateral)

### 3. Execute este SQL:
```sql
-- Limpar dados existentes no campo assigned_to
UPDATE public.risk_assessments SET assigned_to = NULL;

-- Alterar tipo da coluna de UUID para TEXT
ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;

-- Verificar se funcionou
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'risk_assessments' AND column_name = 'assigned_to';
```

### 4. Verificar Resultado
- Se mostrar `data_type = 'text'` → ✅ Correção funcionou!
- Se mostrar `data_type = 'uuid'` → ❌ Tente novamente

### 5. Atualizar o Código
Após aplicar a migração, descomente esta linha no arquivo `src/hooks/useRiskManagement.ts`:
```typescript
// TODO: Descomentar após aplicar migração
baseRiskData.assigned_to = riskData.assignedTo;
```

## 🔧 Status Atual do Código
- ✅ Campo `assigned_to` temporariamente removido da inserção
- ✅ Debug detalhado implementado
- ✅ Mensagens de orientação no console
- ✅ Criação de riscos funcionará (sem campo assigned_to)

## 📊 Logs de Debug Disponíveis
O console do navegador agora mostra:
- 📝 Dados recebidos do formulário
- 👤 Validação de usuário e UUIDs
- 🏢 Validação de tenant
- 💾 Dados preparados para inserção
- 🔍 Verificação campo por campo
- 🚑 Instruções de correção quando há erro

## ⚡ Após Aplicar a Migração
1. Descomente a linha no hook
2. Teste criação de risco com "teste" no campo Responsável
3. Deve funcionar normalmente

## 📞 Scripts Criados
- `fix_database.js` - Diagnóstico via API
- `fix_database_admin.js` - Solução alternativa
- `fix_assigned_to_urgent.sql` - SQL direto
- `debug_risk_creation.js` - Debug no navegador

## 🎉 Resultado Final
Após aplicar a migração SQL, o campo `assigned_to` aceitará nomes como "Marcio Borba", "teste", etc.