# 🔍 DEBUG INSTRUCTIONS - Incident Edit Problem

## Problema
O modal de edição de incidentes não está salvando as alterações no banco de dados.

## Scripts de Debug Criados

### 1. 📋 `debug_incident_edit.js` - Debug Geral
**Execute no console do navegador:**
```javascript
// Carregue o script
fetch('/debug_incident_edit.js').then(r => r.text()).then(eval);

// Ou execute as funções manualmente:
runFullDebug();
debugSupabaseState();
simulateIncidentUpdate();
```

**O que verifica:**
- Contexto de autenticação
- Contexto de tenant
- Estado do formulário
- Interceptação de APIs
- Monitoramento de erros

### 2. 🧪 `test_incident_update.js` - Teste Direto
**Execute no console do navegador:**
```javascript
// Carregue o script
fetch('/test_incident_update.js').then(r => r.text()).then(eval);

// Ou execute diretamente:
testIncidentUpdate();
testRLSPolicies();
```

**O que faz:**
- Testa atualização direta via Supabase
- Verifica políticas RLS
- Identifica erros específicos
- Testa criação e atualização

### 3. 🔧 `debug_hook_state.js` - Debug do Hook
**Execute no console do navegador:**
```javascript
// Carregue o script
fetch('/debug_hook_state.js').then(r => r.text()).then(eval);

// Ou execute:
runHookDebug();
simulateHookCall();
```

**O que analisa:**
- Estado do React Query
- Contextos React
- Interceptação de chamadas do hook
- Estado do tenant

### 4. 🗄️ `debug_database_state.sql` - Debug do Banco
**Execute no Supabase SQL Editor:**
```sql
-- Copie e cole o conteúdo do arquivo debug_database_state.sql
-- Ele verificará:
-- - Estrutura da tabela incidents
-- - Políticas RLS ativas
-- - Dados de exemplo
-- - Usuários platform_admin
-- - Tenants disponíveis
```

## 📋 Checklist de Debug

### Passo 1: Verificar Autenticação
- [ ] Usuário está logado?
- [ ] É platform_admin?
- [ ] Tem tenant_id no perfil?

### Passo 2: Verificar Tenant
- [ ] Tenant está selecionado no TenantSelector?
- [ ] tenant_id está no localStorage?
- [ ] useCurrentTenantId() retorna valor?

### Passo 3: Verificar Formulário
- [ ] Modal está aberto?
- [ ] Dados estão preenchidos?
- [ ] Submit button funciona?

### Passo 4: Verificar API
- [ ] Request está sendo enviado?
- [ ] tenant_id está incluído no body?
- [ ] Response retorna sucesso?

### Passo 5: Verificar RLS
- [ ] Políticas RLS permitem UPDATE?
- [ ] Platform_admin tem acesso?
- [ ] Erro de RLS na resposta?

## 🚨 Possíveis Problemas e Soluções

### Problema 1: tenant_id não está sendo enviado
**Sintomas:**
- Request não inclui tenant_id
- Hook não pega tenant do TenantSelector

**Solução:**
```javascript
// Verificar se useCurrentTenantId está funcionando
console.log('Tenant ID:', useCurrentTenantId());

// Verificar localStorage
console.log('Selected Tenant:', localStorage.getItem('grc-selected-tenant-id'));
```

### Problema 2: Políticas RLS bloqueando
**Sintomas:**
- Erro "RLS policy violation"
- Response 403 ou similar
- Mensagem sobre permissões

**Solução:**
Execute o script SQL:
```sql
-- Execute fix_incidents_rls.sql no Supabase
```

### Problema 3: Hook não está funcionando
**Sintomas:**
- Mutation não executa
- Sem logs de debug
- Sem requests de API

**Solução:**
```javascript
// Verificar se React Query está funcionando
console.log('Query Client:', window.queryClient);

// Verificar se hook está montado
debugReactQuery();
```

### Problema 4: Dados não persistem
**Sintomas:**
- Request retorna sucesso
- Mas dados não mudam no banco
- Timestamp não atualiza

**Solução:**
```sql
-- Verificar triggers e constraints
SELECT * FROM information_schema.triggers WHERE event_object_table = 'incidents';
```

## 🎯 Execução Rápida

### No Console do Navegador:
```javascript
// 1. Carregar todos os scripts de debug
Promise.all([
  fetch('/debug_incident_edit.js').then(r => r.text()).then(eval),
  fetch('/test_incident_update.js').then(r => r.text()).then(eval),
  fetch('/debug_hook_state.js').then(r => r.text()).then(eval)
]).then(() => {
  console.log('🚀 Todos os scripts carregados!');
  
  // 2. Executar debug completo
  runFullDebug();
  testIncidentUpdate();
  runHookDebug();
});
```

### No Supabase SQL Editor:
```sql
-- Copie e cole o conteúdo de debug_database_state.sql
```

## 📊 Interpretando os Resultados

### ✅ Sucesso - O que procurar:
- `✅ [TEST] ATUALIZAÇÃO BEM-SUCEDIDA!`
- `✅ [TEST] TIMESTAMP ATUALIZADO CORRETAMENTE!`
- `✅ [HOOK DEBUG] tenant_id encontrado no body`
- Status 200 nas requisições

### ❌ Erro - O que procurar:
- `❌ [TEST] ERRO NA ATUALIZAÇÃO`
- `🚫 [TEST] ERRO DE RLS DETECTADO!`
- `⚠️ [HOOK DEBUG] tenant_id NÃO encontrado no body`
- Status 403, 401 ou 500 nas requisições

### 🔍 Investigar - Sinais de alerta:
- `⚠️ [DEBUG] Nenhum tenant_id disponível`
- `⚠️ [TEST] Usuário não autenticado`
- `⚠️ [HOOK DEBUG] React Query Client não encontrado`

## 📞 Próximos Passos

1. **Execute os scripts de debug**
2. **Identifique onde está falhando**
3. **Aplique a solução correspondente**
4. **Teste novamente**
5. **Reporte os resultados**

## 🛠️ Soluções Rápidas

### Se for problema de RLS:
```sql
-- Execute no Supabase:
\i fix_incidents_rls.sql
```

### Se for problema de tenant_id:
```javascript
// Verifique no console:
localStorage.setItem('grc-selected-tenant-id', 'SEU_TENANT_ID_AQUI');
```

### Se for problema de hook:
```javascript
// Force refresh do React Query:
window.queryClient?.invalidateQueries(['incidents']);
```

---

**Lembre-se:** Execute os scripts em ordem e observe os logs detalhadamente. Cada script fornece informações específicas que ajudarão a identificar exatamente onde está o problema.