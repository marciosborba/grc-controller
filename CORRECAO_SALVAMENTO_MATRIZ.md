# 🔧 CORREÇÃO: Salvamento da Matriz de Risco

## 🚨 Problema Identificado

O botão "Salvar Configuração" da matriz de risco não estava salvando a seleção da matriz escolhida pelo usuário.

## 🔍 Possíveis Causas

1. **Estado não sincronizado** - O estado local pode não estar refletindo as mudanças
2. **Erro na função de salvamento** - Problemas na RPC ou estrutura de dados
3. **Inicialização incorreta** - Estado inicial pode estar sobrescrevendo mudanças
4. **Tipo não definido** - Campo `type` pode não estar sendo salvo corretamente

## 🔧 Correções Implementadas

### **1. Logs Detalhados na Função `saveRiskMatrix`**

```typescript
const saveRiskMatrix = async (e?: React.MouseEvent) => {
  // ...
  console.log('💾 Salvando configuração da matriz de risco:', {
    tenantId: tenant.id,
    currentRiskMatrix: riskMatrix,
    currentSettings: tenant.settings
  });

  console.log('📤 Dados que serão enviados:', {
    action: 'update',
    tenant_data: { settings: updatedSettings },
    tenant_id_param: tenant.id
  });

  const { error } = await supabase.rpc('rpc_manage_tenant', {
    action: 'update',
    tenant_data: { settings: updatedSettings },
    tenant_id_param: tenant.id
  });

  if (error) {
    console.error('❌ Erro na RPC:', error);
    throw error;
  }

  console.log('✅ Configuração salva com sucesso!');
  // ...
};
```

### **2. Melhorias na Função `switchMatrixType`**

```typescript
const switchMatrixType = (newType: '4x4' | '5x5') => {
  console.log('🔄 Alterando tipo de matriz:', {
    from: riskMatrix.type,
    to: newType,
    currentMatrix: riskMatrix
  });

  const defaultMatrix = newType === '4x4' ? DEFAULT_RISK_MATRIX_4X4 : DEFAULT_RISK_MATRIX_5X5;
  
  const newMatrix = {
    ...defaultMatrix,
    type: newType, // ✅ GARANTIR que o tipo seja definido corretamente
    // Preservar customizações se existirem
    impact_labels: riskMatrix.impact_labels.length === defaultMatrix.impact_labels.length 
      ? riskMatrix.impact_labels 
      : defaultMatrix.impact_labels,
    likelihood_labels: riskMatrix.likelihood_labels?.length === defaultMatrix.likelihood_labels.length
      ? riskMatrix.likelihood_labels
      : defaultMatrix.likelihood_labels
  };

  console.log('⚙️ Nova configuração da matriz:', newMatrix);
  setRiskMatrix(newMatrix);
};
```

### **3. Inicialização Robusta do Estado**

```typescript
const [riskMatrix, setRiskMatrix] = useState<RiskMatrixConfig>(() => {
  const savedMatrix = tenant.settings?.risk_matrix;
  
  console.log('🔍 Inicializando matriz de risco:', {
    tenantId: tenant.id,
    savedMatrix,
    tenantSettings: tenant.settings
  });
  
  // Se não há configuração salva, usar padrão 4x4
  if (!savedMatrix) {
    console.log('⚠️ Nenhuma matriz salva, usando padrão 4x4');
    return DEFAULT_RISK_MATRIX_4X4;
  }
  
  // ✅ GARANTIR que o tipo está definido
  const matrixType = savedMatrix.type || '4x4';
  const defaultMatrix = matrixType === '4x4' ? DEFAULT_RISK_MATRIX_4X4 : DEFAULT_RISK_MATRIX_5X5;
  
  // Converter configuração salva para estrutura esperada
  const initialMatrix = {
    type: matrixType, // ✅ SEMPRE definir o tipo
    impact_labels: savedMatrix.impact_labels || defaultMatrix.impact_labels,
    likelihood_labels: savedMatrix.likelihood_labels || defaultMatrix.likelihood_labels,
    risk_levels: savedMatrix.risk_levels || defaultMatrix.risk_levels
  };
  
  console.log('⚙️ Matriz inicializada:', initialMatrix);
  return initialMatrix;
});
```

## 🔍 Como Debugar

### **1. Abrir DevTools (F12)**

Procurar pelos seguintes logs no console:

#### **Inicialização:**
```
🔍 Inicializando matriz de risco: { tenantId: "...", savedMatrix: {...}, tenantSettings: {...} }
⚙️ Matriz inicializada: { type: "5x5", impact_labels: [...], ... }
```

#### **Mudança de Tipo:**
```
🔄 Alterando tipo de matriz: { from: "4x4", to: "5x5", currentMatrix: {...} }
⚙️ Nova configuração da matriz: { type: "5x5", ... }
```

#### **Salvamento:**
```
💾 Salvando configuração da matriz de risco: { tenantId: "...", currentRiskMatrix: {...}, ... }
📤 Dados que serão enviados: { action: "update", tenant_data: {...}, ... }
✅ Configuração salva com sucesso!
```

### **2. Verificar Estrutura dos Dados**

#### **Estado Esperado:**
```json
{
  "type": "5x5",
  "impact_labels": ["Insignificante", "Menor", "Moderado", "Maior", "Catastrófico"],
  "likelihood_labels": ["Raro", "Improvável", "Possível", "Provável", "Quase Certo"],
  "risk_levels": {
    "low": [1, 2, 3, 5, 6],
    "medium": [4, 7, 8, 9, 10, 11],
    "high": [12, 13, 14, 15, 16, 17, 18],
    "critical": [19, 20, 21, 22, 23, 24, 25]
  }
}
```

#### **Dados Salvos no Banco:**
```json
{
  "settings": {
    "risk_matrix": {
      "type": "5x5",
      "impact_labels": [...],
      "likelihood_labels": [...],
      "risk_levels": {...}
    }
  }
}
```

## 🎯 Pontos de Verificação

### **1. Fluxo Completo**

1. **Usuário seleciona tipo** → `switchMatrixType()` é chamada
2. **Estado é atualizado** → `setRiskMatrix()` com novo tipo
3. **Usuário clica "Salvar"** → `saveRiskMatrix()` é chamada
4. **Dados são enviados** → RPC `rpc_manage_tenant` é executada
5. **Cache é invalidado** → `queryClient.invalidateQueries()`
6. **Interface atualiza** → Componente re-renderiza com novos dados

### **2. Possíveis Problemas**

#### **❌ Estado não atualiza:**
- Verificar se `switchMatrixType()` está sendo chamada
- Confirmar se `setRiskMatrix()` está funcionando
- Checar se há conflitos de estado

#### **❌ Salvamento falha:**
- Verificar logs de erro na RPC
- Confirmar estrutura dos dados enviados
- Checar permissões do usuário

#### **❌ Interface não atualiza:**
- Verificar se `queryClient.invalidateQueries()` está funcionando
- Confirmar se o componente re-renderiza
- Checar se há cache persistente

### **3. Validações**

#### **✅ Antes do Salvamento:**
```typescript
// Verificar se o tipo está definido
console.log('Tipo da matriz:', riskMatrix.type);

// Verificar estrutura completa
console.log('Matriz completa:', riskMatrix);

// Verificar dados que serão enviados
console.log('Settings a serem salvos:', updatedSettings);
```

#### **✅ Após o Salvamento:**
```typescript
// Verificar se não houve erro
if (error) {
  console.error('Erro na RPC:', error);
}

// Verificar invalidação do cache
queryClient.invalidateQueries({ queryKey: ['tenants'] });

// Verificar se o dialog foi fechado
setIsEditingRiskMatrix(false);
```

## 🚀 Próximos Passos

1. **Testar o salvamento** - Selecionar tipo diferente e salvar
2. **Verificar logs** - Confirmar que todos os logs aparecem
3. **Validar banco** - Verificar se dados foram salvos corretamente
4. **Testar análise** - Confirmar que nova análise usa tipo correto
5. **Reportar resultados** - Informar se problema foi resolvido

## 📝 Resumo das Melhorias

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Logs** | ❌ Sem debug | ✅ Logs detalhados |
| **Tipo** | ❌ Pode ser undefined | ✅ Sempre definido |
| **Inicialização** | ❌ Lógica complexa | ✅ Lógica simplificada |
| **Salvamento** | ❌ Sem validação | ✅ Com logs e validação |
| **Debug** | ❌ Difícil identificar problemas | ✅ Fácil rastreamento |

**Com essas correções, o salvamento da matriz deve funcionar corretamente. Teste e verifique os logs para confirmar!** 🎯