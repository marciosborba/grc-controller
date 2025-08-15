# 🔍 DEBUG: Configuração da Matriz da Tenant

## 🎯 Problema Identificado

A matriz está aparecendo diferente do configurado na tenant durante a análise de risco.

## 🔧 Correções Implementadas

### 1. **Logs Detalhados na `getTenantMatrixConfig`**

```typescript
console.log('🔍 getTenantMatrixConfig chamada com tenantId:', tenantId);
console.log('📡 Buscando configuração da tenant no banco...');
console.log('📊 Resposta do banco:', { data, error });
console.log('✅ Configuração da matriz encontrada:', data.settings.risk_matrix);
```

### 2. **Sincronização Forçada no RiskCard**

```typescript
// SEMPRE atualizar o tipo de matriz conforme a configuração da tenant
setMatrixSize(config.type);
console.log('⚙️ Tipo de matriz DEFINIDO para:', config.type);

// Se já existe analysisData, atualizar o matrixSize nela também
if (analysisData && analysisData.matrixSize !== config.type) {
  console.log('🔄 Atualizando matrixSize na analysisData existente');
  setAnalysisData(prev => prev ? {
    ...prev,
    matrixSize: config.type
  } : null);
}
```

### 3. **Logs na Função de Análise**

```typescript
console.log('🔍 processRiskAnalysisWithTenantConfig chamada:', {
  riskType,
  tenantId,
  probabilityAnswersCount: probabilityAnswers.length,
  impactAnswersCount: impactAnswers.length
});

console.log('🏢 Usando configuração da tenant para análise:', {
  tenantId,
  matrixType: config.type,
  config
});

console.log('✅ Análise processada com matriz:', config.type, 'Resultado:', result);
```

### 4. **Interface Atualizada**

- ❌ **Removido**: Seletor manual de matriz
- ✅ **Adicionado**: Display da configuração da tenant
- ✅ **Texto**: "Matriz de Risco (Configurada pela Organização)"

## 🔍 Como Debugar

### **1. Verificar Logs no Console**

Abra o DevTools (F12) e procure por:

```
🔍 getTenantMatrixConfig chamada com tenantId: [tenant-id]
📡 Buscando configuração da tenant no banco...
📊 Resposta do banco: { data: {...}, error: null }
✅ Configuração da matriz encontrada: { type: "5x5", ... }
```

### **2. Verificar Estado do RiskCard**

```
🔄 Carregando configuração da matriz para tenant: [tenant-id]
🏢 Configuração da matriz da tenant carregada: {
  tenantId: "[tenant-id]",
  configMatrixType: "5x5",
  currentMatrixSize: "4x4",
  needsUpdate: true
}
⚙️ Tipo de matriz DEFINIDO para: 5x5
```

### **3. Verificar Análise**

```
🔍 processRiskAnalysisWithTenantConfig chamada: {
  riskType: "Técnico",
  tenantId: "[tenant-id]",
  probabilityAnswersCount: 5,
  impactAnswersCount: 5
}
🏢 Usando configuração da tenant para análise: {
  tenantId: "[tenant-id]",
  matrixType: "5x5",
  config: { type: "5x5", ... }
}
✅ Análise processada com matriz: 5x5
```

## 🎯 Pontos de Verificação

### **1. Configuração da Tenant no Banco**

Verificar se a configuração está salva corretamente:

```sql
SELECT id, name, settings->'risk_matrix' as risk_matrix_config 
FROM tenants 
WHERE id = '[seu-tenant-id]';
```

### **2. Estrutura Esperada**

```json
{
  "type": "5x5",
  "impact_labels": ["Muito Baixo", "Baixo", "Médio", "Alto", "Muito Alto"],
  "likelihood_labels": ["Muito Raro", "Raro", "Possível", "Provável", "Muito Provável"]
}
```

### **3. Fluxo de Dados**

```
1. Usuário abre análise de risco
2. useEffect carrega configuração da tenant
3. setMatrixSize(config.type) atualiza estado
4. Interface mostra matriz configurada
5. Análise usa processRiskAnalysisWithTenantConfig
6. Função busca configuração novamente
7. Processa com matriz correta
```

## 🚨 Possíveis Problemas

### **1. Cache do Browser**
- Limpar cache e recarregar página
- Verificar se não há dados antigos no localStorage

### **2. Configuração Não Salva**
- Verificar se a configuração foi salva corretamente na admin
- Confirmar que o usuário tem o tenant_id correto

### **3. Timing de Carregamento**
- Verificar se a configuração carrega antes da análise
- Confirmar que os useEffects executam na ordem correta

### **4. Dados Antigos**
- Verificar se analysisData existente não está sobrescrevendo
- Confirmar que resetAnalysis() limpa tudo corretamente

## 🔧 Próximos Passos

1. **Abrir DevTools** e verificar logs
2. **Testar nova análise** do zero
3. **Verificar configuração** na admin da tenant
4. **Confirmar salvamento** no banco de dados
5. **Reportar logs** específicos se problema persistir

## 📝 Logs Esperados

Se tudo estiver funcionando, você deve ver:

```
🔍 getTenantMatrixConfig chamada com tenantId: 46b1c048-85a1-423b-96fc-776007c8de1f
📡 Buscando configuração da tenant no banco...
📊 Resposta do banco: { data: { settings: { risk_matrix: { type: "5x5" } } }, error: null }
✅ Configuração da matriz encontrada: { type: "5x5", impact_labels: [...], likelihood_labels: [...] }
🔄 Carregando configuração da matriz para tenant: 46b1c048-85a1-423b-96fc-776007c8de1f
⚙️ Tipo de matriz DEFINIDO para: 5x5
🔍 processRiskAnalysisWithTenantConfig chamada: { riskType: "Técnico", tenantId: "46b1c048-85a1-423b-96fc-776007c8de1f" }
🏢 Usando configuração da tenant para análise: { matrixType: "5x5" }
✅ Análise processada com matriz: 5x5
```

**Com esses logs detalhados, podemos identificar exatamente onde está o problema!** 🎯