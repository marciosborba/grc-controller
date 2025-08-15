# 🔧 CORREÇÃO: Edição de Probabilidade e Impacto no RiskCard

## 🎯 Problema Identificado

Quando editamos um card de risco e alteramos a probabilidade e o impacto, os valores não estavam sendo salvos corretamente e o risco ficava como "Muito Baixo".

## 🔍 Causa Raiz

1. **Falta de logs**: Não havia visibilidade sobre o que estava sendo enviado e recebido
2. **Lógica de verificação**: A verificação `if (data.probability || data.impact)` não funcionava para valores `0` ou `false`
3. **Cálculo inconsistente**: A função `calculateRiskLevel` usava thresholds diferentes da correção automática

## 🔧 Correções Implementadas

### **1. Logs Detalhados no RiskCard**
```typescript
// Em RiskCard.tsx - handleSaveGeneral
console.log('💾 RiskCard: Salvando dados gerais:', {
  riskId: risk.id,
  updates: updates,
  originalProbability: risk.probability,
  newProbability: generalData.probability,
  originalImpact: risk.impact,
  newImpact: generalData.impact
});
```

### **2. Logs Detalhados no Hook**
```typescript
// Em useRiskManagement.ts - updateRiskMutation
console.log('🔄 useRiskManagement: Atualizando risco', {
  riskId,
  dataReceived: data,
  hasProbability: 'probability' in data,
  hasImpact: 'impact' in data,
  probabilityValue: data.probability,
  impactValue: data.impact
});
```

### **3. Correção da Lógica de Verificação**
```typescript
// ANTES (problemático):
if (data.probability || data.impact) {

// DEPOIS (correto):
if (data.probability !== undefined || data.impact !== undefined) {
```

### **4. Correção da Função calculateRiskLevel**
```typescript
// ANTES:
if (score >= 21) return 'Muito Alto';
if (score >= 16) return 'Alto';

// DEPOIS (consistente com correção automática):
if (score >= 20) return 'Muito Alto';
if (score >= 15) return 'Alto';
```

### **5. Logs de Confirmação**
```typescript
console.log('✅ Risco atualizado com sucesso no banco:', {
  id: result.id,
  title: result.title,
  likelihood_score: result.likelihood_score,
  impact_score: result.impact_score,
  risk_level: result.risk_level,
  risk_score: result.risk_score
});
```

## 🚀 Como Testar

### **1. Editar um Risco Existente:**
1. Abra um card de risco
2. Clique em "Editar" nas Informações Gerais
3. Altere a **Probabilidade** para `5`
4. Altere o **Impacto** para `5`
5. Clique em **"Salvar Alterações"**

### **2. Verificar Logs no Console:**
```
💾 RiskCard: Salvando dados gerais: { probability: 5, impact: 5 }
🔄 useRiskManagement: Atualizando risco { probabilityValue: 5, impactValue: 5 }
📊 Recalculando scores - probability: 5 impact: 5
📊 calculateRiskLevel: score = 25
📊 Novos valores calculados: { riskScore: 25, newRiskLevel: "Muito Alto" }
✅ Risco atualizado com sucesso no banco: { risk_level: "Muito Alto" }
```

### **3. Verificar Resultado:**
- **Score calculado**: 5 × 5 = 25
- **Nível esperado**: "Muito Alto" (score ≥ 20)
- **Card deve mostrar**: Badge "Muito Alto" vermelho
- **Métricas devem atualizar**: Card "Muito Alto" deve incrementar

## 🎯 Cenários de Teste

### **Teste 1: Risco Muito Alto**
- **Probabilidade**: 5, **Impacto**: 5
- **Score**: 25
- **Nível esperado**: "Muito Alto"

### **Teste 2: Risco Alto**
- **Probabilidade**: 3, **Impacto**: 5
- **Score**: 15
- **Nível esperado**: "Alto"

### **Teste 3: Risco Médio**
- **Probabilidade**: 3, **Impacto**: 3
- **Score**: 9
- **Nível esperado**: "Médio"

### **Teste 4: Risco Baixo**
- **Probabilidade**: 2, **Impacto**: 2
- **Score**: 4
- **Nível esperado**: "Baixo"

## 🔍 Logs Esperados

### **Sucesso:**
```
💾 RiskCard: Salvando dados gerais
🔄 useRiskManagement: Atualizando risco
📊 Recalculando scores
📊 calculateRiskLevel: score = X
✅ Risco atualizado com sucesso no banco
✅ RiskCard: Dados salvos com sucesso
```

### **Erro:**
```
❌ Erro ao atualizar no banco: [detalhes do erro]
❌ RiskCard: Erro ao salvar: [detalhes do erro]
```

## ✅ Resultado Esperado

Após as correções:
1. **✅ Probabilidade e impacto são salvos corretamente**
2. **✅ Risk level é calculado automaticamente**
3. **✅ Badge do card mostra o nível correto**
4. **✅ Métricas são atualizadas automaticamente**
5. **✅ Logs detalhados para debugging**

**Teste agora editando um risco e alterando probabilidade/impacto!** 🎯