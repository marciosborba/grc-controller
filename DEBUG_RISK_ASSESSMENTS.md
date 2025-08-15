# 🔍 DEBUG: Problema com risk_assessments

## 🎯 Investigação Ativa

Adicionei logs detalhados para identificar por que o card ainda mostra "0" mesmo tendo riscos.

## 🔍 Logs Adicionados

### **1. Verificação de Autenticação:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
console.log('👤 Usuário autenticado:', user);
console.log('🏢 Tenant do contexto:', user?.user_metadata?.tenant_id);
```

### **2. Debug da Query:**
```typescript
supabase.from('risk_assessments').select('*').then(result => {
  console.log('🔍 Resultado da query risk_assessments:', result);
  if (result.error) {
    console.error('❌ Erro na query risk_assessments:', result.error);
  }
  return result;
})
```

### **3. Análise dos Dados:**
```typescript
console.log('📊 risks array:', risks);
console.log('📊 risks.length:', risks.length);

if (risks.length > 0) {
  console.log('📊 Primeiro risco:', risks[0]);
  console.log('📊 Campos disponíveis:', Object.keys(risks[0]));
  
  const riskLevels = risks.map(r => r.risk_level);
  console.log('📊 Todos os risk_level encontrados:', riskLevels);
  console.log('📊 risk_level únicos:', [...new Set(riskLevels)]);
}
```

### **4. Debug Quando Não Há Dados:**
```typescript
if (risks.length === 0) {
  // Query alternativa para debug
  const debugQuery = await supabase
    .from('risk_assessments')
    .select('id, title, risk_level')
    .limit(5);
  
  console.log('🔍 Query de debug (primeiros 5):', debugQuery);
  
  // Verificar contagem total
  const countQuery = await supabase
    .from('risk_assessments')
    .select('id', { count: 'exact', head: true });
  
  console.log('🔢 Contagem total na tabela:', countQuery);
}
```

## 🔍 O Que Verificar Agora

### **1. Abra o DevTools (F12)**
### **2. Vá para o Dashboard**
### **3. Procure pelos logs:**

#### **Se há dados:**
```
👤 Usuário autenticado: { ... }
🏢 Tenant do contexto: [tenant-id]
🔍 Resultado da query risk_assessments: { data: [...], error: null }
📊 risks array: [array com riscos]
📊 risks.length: X
📊 Primeiro risco: { id: "...", title: "...", risk_level: "..." }
📊 Campos disponíveis: ["id", "title", "risk_level", ...]
📊 Todos os risk_level encontrados: ["Muito Alto", "Alto", ...]
📊 risk_level únicos: ["Muito Alto", "Alto", "Médio"]
```

#### **Se não há dados:**
```
⚠️ NENHUM RISCO ENCONTRADO! Verificando possíveis causas...
🔍 Query de debug (primeiros 5): { data: [...], error: ... }
🔢 Contagem total na tabela: { count: X, error: ... }
```

## 🚨 Possíveis Problemas

### **1. Problema de RLS (Row Level Security):**
- **Sintoma**: `count: 0` mas você sabe que há dados
- **Causa**: Políticas RLS bloqueando acesso
- **Solução**: Verificar se usuário tem permissão

### **2. Problema de Tenant:**
- **Sintoma**: Usuário sem tenant_id
- **Causa**: Usuário não associado a tenant
- **Solução**: Verificar tabela `profiles`

### **3. Problema de Dados:**
- **Sintoma**: Tabela realmente vazia
- **Causa**: Dados não foram inseridos
- **Solução**: Inserir dados de teste

### **4. Problema de Campos:**
- **Sintoma**: `risk_level` é `null` ou diferente
- **Causa**: Trigger não funcionou ou dados antigos
- **Solução**: Atualizar dados existentes

## 🔧 Comandos SQL para Verificar

### **1. Verificar se há dados:**
```sql
SELECT COUNT(*) FROM risk_assessments;
```

### **2. Ver estrutura dos dados:**
```sql
SELECT id, title, risk_level, risk_score, impact_score, likelihood_score 
FROM risk_assessments 
LIMIT 5;
```

### **3. Verificar RLS:**
```sql
-- Como admin, ver todas as políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'risk_assessments';
```

### **4. Verificar tenant do usuário:**
```sql
SELECT user_id, tenant_id 
FROM profiles 
WHERE user_id = '[seu-user-id]';
```

## 🎯 Próximos Passos

1. **Execute o dashboard** e verifique os logs
2. **Copie e cole** os logs aqui
3. **Identifique** qual dos cenários está acontecendo
4. **Aplique** a correção específica

## 📝 Cenários Esperados

### **✅ Cenário Ideal:**
```
📊 risks.length: 5
📊 risk_level únicos: ["Muito Alto", "Alto", "Médio"]
📊 ExecutiveDashboard: Riscos por nível: { critical: 1, high: 2 }
```

### **❌ Cenário Problema:**
```
⚠️ NENHUM RISCO ENCONTRADO!
🔢 Contagem total na tabela: { count: 0 }
```

**Execute agora e me informe quais logs aparecem!** 🔍