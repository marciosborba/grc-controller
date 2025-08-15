# 🔍 DEBUG: Badge Divergente no RiskCard

## 🎯 Problema Identificado

O elemento Badge na linha 680 do RiskCard.tsx está mostrando "Muito Baixo" quando deveria mostrar o nível correto do risco.

## 🔧 Logs de Debug Adicionados

### **1. Função calculateRiskLevel**
```typescript
console.log('📊 RiskCard calculateRiskLevel:', {
  riskId: risk.id,
  riskName: risk.name,
  analysisDataLevel: analysisData?.qualitativeRiskLevel,
  generalDataLevel: generalData.riskLevel,
  originalRiskLevel: risk.riskLevel,
  probability: generalData.probability,
  impact: generalData.impact,
  score: generalData.probability * generalData.impact
});
```

### **2. Sincronização de Props**
```typescript
console.log('🔄 RiskCard: Sincronizando dados do prop risk:', {
  riskId: risk.id,
  riskName: risk.name,
  riskLevel: risk.riskLevel,
  probability: risk.probability,
  impact: risk.impact,
  riskScore: risk.riskScore
});
```

### **3. Badges Específicos**
```typescript
// Badge do Header (linha ~684)
console.log('🏷️ Badge Header - currentRiskLevel:', currentRiskLevel);

// Badge da Edição (linha ~914)
console.log('🏷️ Badge Edição - currentRiskLevel:', currentRiskLevel);

// Badge da Visualização (linha ~945)
console.log('🏷️ Badge Visualização - currentRiskLevel:', currentRiskLevel);
```

## 🚀 Como Testar

### **1. Abrir um Card de Risco**
1. Vá para "Gestão de Riscos"
2. Clique em um card para expandir
3. Verifique os logs no console

### **2. Verificar Logs Esperados**
```
🔄 RiskCard: Sincronizando dados do prop risk: { riskLevel: "Muito Alto", probability: 5, impact: 5 }
📊 RiskCard calculateRiskLevel: { score: 25, originalRiskLevel: "Muito Alto" }
🔬 Usando nível do generalData: "Muito Alto"
🏷️ Badge Header - currentRiskLevel: "Muito Alto"
🏷️ Badge Visualização - currentRiskLevel: "Muito Alto"
```

### **3. Identificar o Problema**
- **Se `originalRiskLevel` está correto** mas `currentRiskLevel` está errado → Problema na função `calculateRiskLevel`
- **Se `generalData.riskLevel` está errado** → Problema na sincronização
- **Se `risk.riskLevel` está errado** → Problema no hook ou banco de dados

## 🔍 Possíveis Causas

### **1. Estado Local Desatualizado**
```typescript
// generalData pode não estar sincronizado com risk
if (generalData.riskLevel !== risk.riskLevel) {
  // Problema de sincronização
}
```

### **2. Lógica de Priorização**
```typescript
// Ordem de prioridade na calculateRiskLevel:
1. analysisData?.qualitativeRiskLevel (análise estruturada)
2. generalData.riskLevel (estado local)
3. Cálculo tradicional (probability * impact)
```

### **3. Cache do React Query**
- O hook pode estar retornando dados antigos
- O `risk` prop pode não estar atualizado

## 🎯 Cenários de Debug

### **Cenário 1: Badge Header Divergente**
```
🏷️ Badge Header - currentRiskLevel: "Muito Baixo"
📊 RiskCard calculateRiskLevel: { originalRiskLevel: "Muito Alto" }
```
**Causa**: Problema na função `calculateRiskLevel`

### **Cenário 2: Props Desatualizados**
```
🔄 RiskCard: Sincronizando dados do prop risk: { riskLevel: "Muito Baixo" }
```
**Causa**: Hook não está retornando dados atualizados

### **Cenário 3: Estado Local Incorreto**
```
📊 RiskCard calculateRiskLevel: { generalDataLevel: "Muito Baixo", originalRiskLevel: "Muito Alto" }
```
**Causa**: Sincronização entre prop e estado local

## 🔧 Soluções Possíveis

### **1. Forçar Recálculo**
```typescript
const currentRiskLevel = useMemo(() => {
  return calculateRiskLevel();
}, [risk.riskLevel, generalData.probability, generalData.impact, analysisData?.qualitativeRiskLevel]);
```

### **2. Usar Diretamente o Prop**
```typescript
// Em vez de calculateRiskLevel(), usar diretamente:
const currentRiskLevel = risk.riskLevel;
```

### **3. Invalidar Cache**
```typescript
// Forçar atualização do hook
queryClient.invalidateQueries({ queryKey: ['risks'] });
```

## 📊 Logs de Diagnóstico

Após implementar os logs, execute:

1. **Abra um card de risco**
2. **Copie todos os logs do console**
3. **Identifique onde está a divergência**
4. **Compare os valores esperados vs reais**

**Execute agora e me informe quais logs aparecem no console!** 🎯