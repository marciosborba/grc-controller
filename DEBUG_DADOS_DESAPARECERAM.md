# 🚨 DEBUG: DADOS DESAPARECERAM DO MÓDULO

## 🚨 **Problema Reportado**

**Status:** \"agora os dados desapareceram do modulo\"

**Sintomas:**
- ❌ Políticas não aparecem mais no módulo
- ❌ Lista vazia ou carregamento infinito
- ❌ Possível problema de autenticação ou tenant

---

## 🔧 **Debug Implementado**

### **Logs Adicionados:**

#### **1. Debug Completo de Autenticação**
```javascript
console.log('🔍 user completo:', user);
console.log('🔍 user.tenant:', user?.tenant);
console.log('🔍 user.tenantId:', user?.tenantId);
console.log('🔍 user.tenant?.id:', user?.tenant?.id);
console.log('🔍 tenantId final:', tenantId);
```

#### **2. Debug do useEffect**
```javascript
console.log('🔄 useEffect disparado - tenantId:', tenantId);
```

#### **3. Debug de Consulta SQL**
```javascript
// Consulta simples primeiro
console.log('🔍 Testando consulta simples...');
// Depois consulta completa
console.log('🔍 Fazendo consulta completa...');
```

#### **4. Botão de Debug Manual**
- Adicionado botão "🔄 Debug" para forçar recarregamento

---

## 🧪 **Como Testar**

### **1. Acesse a aplicação:**
```
http://localhost:8080
```

### **2. Abra o Console do Navegador:**
- **Chrome/Firefox:** F12 → Console
- **Safari:** Cmd+Option+C

### **3. Vá para "Gestão de Políticas"**

### **4. Observe os logs automáticos:**

**Logs esperados na inicialização:**
```
🔄 useEffect disparado - tenantId: 46b1c048-85a1-423b-96fc-776007c8de1f

=== 🔍 DEBUG CARREGAMENTO DE POLÍTICAS ===
🔍 loadPolicies chamado
🔍 user completo: {id: "...", email: "...", tenantId: "...", tenant: {...}}
🔍 user.tenant: {id: "46b1c048-85a1-423b-96fc-776007c8de1f", name: "GRC-Controller"}
🔍 user.tenantId: 46b1c048-85a1-423b-96fc-776007c8de1f
🔍 user.tenant?.id: 46b1c048-85a1-423b-96fc-776007c8de1f
🔍 tenantId final: 46b1c048-85a1-423b-96fc-776007c8de1f
🔍 Fazendo query para tenant_id: 46b1c048-85a1-423b-96fc-776007c8de1f

🔍 Testando consulta simples...
🔍 Resultado consulta simples:
  - data: [{id: "...", title: "...", status: "..."}, ...]
  - error: null
  - count: 5

🔍 Fazendo consulta completa...
🔍 Debug - Resultado da query:
🔍 Debug - data: [...]
🔍 Debug - error: null
🔍 Debug - data length: 19
✅ Políticas carregadas: 19
```

### **5. Se não aparecer dados, clique no botão "🔄 Debug"**

### **6. Verifique os logs de erro:**

---

## 🔍 **Possíveis Problemas e Soluções**

### **Problema 1: Usuário perdeu autenticação**
**Sintoma:** `user` é `null` ou `undefined`

**Logs esperados:**
```
🔍 user completo: null
❌ useEffect - Aguardando tenant_id...
❌ Sem tenant_id disponível, retornando
```

**Solução:** Fazer login novamente

### **Problema 2: Tenant perdido**
**Sintoma:** `user` existe mas `tenant` é `null`

**Logs esperados:**
```
🔍 user completo: {id: "...", email: "..."}
🔍 user.tenant: null
🔍 user.tenantId: null
🔍 tenantId final: undefined
❌ Sem tenant_id disponível, retornando
```

**Solução:** Verificar configuração do tenant no banco

### **Problema 3: Erro na consulta SQL**
**Sintoma:** Consulta retorna erro

**Logs esperados:**
```
🔍 Resultado consulta simples:
  - data: null
  - error: {message: "...", code: "..."}
  - count: 0
❌ Erro ao carregar políticas: ...
```

**Solução:** Verificar permissões RLS ou estrutura da tabela

### **Problema 4: Dados foram deletados**
**Sintoma:** Consulta funciona mas retorna array vazio

**Logs esperados:**
```
🔍 Resultado consulta simples:
  - data: []
  - error: null
  - count: 0
✅ Políticas carregadas: 0
```

**Solução:** Verificar se dados existem no banco

### **Problema 5: Cache do navegador**
**Sintoma:** Dados antigos ou inconsistentes

**Solução:** Limpar cache ou usar modo incógnito

---

## 🛠️ **Verificações Adicionais**

### **1. Verificar dados no banco:**
```sql
-- Conectar ao banco remoto
psql \"postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres\"

-- Verificar se existem políticas
SELECT COUNT(*) as total_policies FROM policies;

-- Verificar políticas por tenant
SELECT tenant_id, COUNT(*) as count 
FROM policies 
GROUP BY tenant_id;

-- Verificar políticas específicas do tenant
SELECT id, title, status, created_at 
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY updated_at DESC 
LIMIT 10;
```

### **2. Verificar autenticação:**
1. Abra DevTools → Application → Local Storage
2. Procure por chaves do Supabase
3. Verifique se o token está válido

### **3. Verificar RLS (Row Level Security):**
```sql
-- Verificar políticas RLS na tabela policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'policies';

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'policies';
```

### **4. Teste manual da consulta:**
```sql
-- Testar consulta diretamente no banco
SELECT id, title, status, tenant_id, created_at
FROM policies 
WHERE tenant_id = '46b1c048-85a1-423b-96fc-776007c8de1f'
ORDER BY updated_at DESC;
```

---

## 📋 **Checklist de Debug**

### **Autenticação:**
- [ ] `user` não é null
- [ ] `user.tenant` existe
- [ ] `user.tenantId` tem valor
- [ ] Token de autenticação válido

### **Consulta SQL:**
- [ ] Consulta simples funciona
- [ ] Consulta completa funciona
- [ ] Sem erros de RLS
- [ ] Tenant_id correto

### **Dados no Banco:**
- [ ] Políticas existem na tabela
- [ ] Tenant_id correto nas políticas
- [ ] RLS configurado corretamente
- [ ] Permissões adequadas

### **Interface:**
- [ ] Loading state funciona
- [ ] Dados são exibidos após carregamento
- [ ] Filtros funcionam
- [ ] Navegação entre tabs funciona

---

## 🎯 **Próximos Passos**

1. **Execute o teste** seguindo os passos acima
2. **Copie todos os logs** do console
3. **Identifique** qual problema está ocorrendo:
   - Problema de autenticação?
   - Problema de consulta SQL?
   - Dados foram deletados?
   - Problema de cache?
4. **Verifique** os dados diretamente no banco
5. **Teste** o botão de debug manual
6. **Reporte** os logs específicos do problema

---

## 🚨 **Ações de Emergência**

### **Se dados foram perdidos:**
1. Verificar backup do banco
2. Verificar logs de auditoria
3. Restaurar dados se necessário

### **Se problema de autenticação:**
1. Fazer logout/login
2. Limpar cache do navegador
3. Verificar configuração do Supabase

### **Se problema de RLS:**
1. Verificar políticas de segurança
2. Ajustar permissões se necessário
3. Testar com usuário admin

---

*Debug implementado em: 23 de Agosto de 2025*  
*Problema: Dados desapareceram do módulo*  
*Status: Aguardando logs para identificar causa raiz*

## 🚀 **TESTE AGORA E REPORTE OS LOGS!**

Com o debug detalhado implementado, será possível identificar exatamente o que aconteceu com os dados e corrigi-lo rapidamente.