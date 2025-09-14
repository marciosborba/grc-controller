# RiskLevelDisplay Component

## Visão Geral

O componente `RiskLevelDisplay` é uma solução dinâmica para exibir níveis de risco que se adapta automaticamente à configuração da matriz de risco da tenant. Ele substitui implementações hardcoded por uma abordagem configurável que respeita as definições organizacionais.

## Características Principais

- **Adaptação Automática**: Ajusta-se automaticamente ao tipo de matriz configurada (3x3, 4x4, 5x5)
- **Grid Dinâmico**: O layout do grid se adapta ao número de níveis (3, 4 ou 5 colunas)
- **Cores Personalizadas**: Usa cores configuradas na tenant ou cores padrão
- **Responsivo**: Layout adaptável para diferentes tamanhos de tela
- **Flexível**: Pode mostrar contagem de riscos ou apenas os níveis
- **Tamanhos Variados**: Suporte a diferentes tamanhos (sm, md, lg)

## Configuração da Tenant

O componente lê a configuração da matriz de risco da tenant através do hook `useTenantSettings()`:

### Matriz 3x3
```json
{
  "risk_matrix": {
    "type": "3x3",
    "risk_levels_custom": [
      { "name": "Baixo", "color": "#22c55e", "value": 1 },
      { "name": "Médio", "color": "#eab308", "value": 2 },
      { "name": "Alto", "color": "#ef4444", "value": 3 }
    ]
  }
}
```

### Matriz 4x4
```json
{
  "risk_matrix": {
    "type": "4x4",
    "risk_levels_custom": [
      { "name": "Baixo", "color": "#22c55e", "value": 1 },
      { "name": "Médio", "color": "#eab308", "value": 2 },
      { "name": "Alto", "color": "#f97316", "value": 3 },
      { "name": "Crítico", "color": "#ef4444", "value": 4 }
    ]
  }
}
```

### Matriz 5x5
```json
{
  "risk_matrix": {
    "type": "5x5",
    "risk_levels_custom": [
      { "name": "Muito Baixo", "color": "#3b82f6", "value": 1 },
      { "name": "Baixo", "color": "#22c55e", "value": 2 },
      { "name": "Médio", "color": "#eab308", "value": 3 },
      { "name": "Alto", "color": "#f97316", "value": 4 },
      { "name": "Muito Alto", "color": "#ef4444", "value": 5 }
    ]
  }
}
```

## Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `risks` | `Array<{risk_level?: string; riskLevel?: string}>` | `[]` | Array de riscos para contagem por nível |
| `className` | `string` | `''` | Classes CSS adicionais |
| `showOnlyLevels` | `boolean` | `false` | Mostra apenas os níveis sem contagem |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho dos cards |
| `responsive` | `boolean` | `true` | Layout responsivo ou fixo |

## Exemplos de Uso

### Exibição com Contagem de Riscos

```tsx
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';

const risks = [
  { risk_level: 'Alto' },
  { risk_level: 'Médio' },
  { risk_level: 'Baixo' }
];

<RiskLevelDisplay 
  risks={risks}
  size="md"
  responsive={true}
/>
```

### Apenas Níveis (sem contagem)

```tsx
<RiskLevelDisplay 
  showOnlyLevels={true}
  size="md"
  responsive={true}
/>
```

### Tamanho Pequeno para Dashboards

```tsx
<RiskLevelDisplay 
  risks={risks}
  size="sm"
  responsive={true}
/>
```

### Layout Fixo (adapta-se ao número de níveis)

```tsx
<RiskLevelDisplay 
  risks={risks}
  size="md"
  responsive={false}
/>
```

**Nota**: O layout fixo automaticamente usa o número correto de colunas baseado na configuração da matriz:
- Matriz 3x3: 3 colunas
- Matriz 4x4: 4 colunas  
- Matriz 5x5: 5 colunas

## Migração de Código Existente

### Antes (Hardcoded)
```tsx
<div className="grid grid-cols-5 gap-2">
  <div className="text-center">
    <div className="h-20 rounded bg-green-100 text-green-800 flex items-center justify-center font-bold text-lg">0</div>
    <p className="text-xs mt-1">Nível 1</p>
  </div>
  <div className="text-center">
    <div className="h-20 rounded bg-green-100 text-green-800 flex items-center justify-center font-bold text-lg">0</div>
    <p className="text-xs mt-1">Nível 2</p>
  </div>
  <div className="text-center">
    <div className="h-20 rounded bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold text-lg">0</div>
    <p className="text-xs mt-1">Nível 3</p>
  </div>
  <div className="text-center">
    <div className="h-20 rounded bg-red-100 text-red-800 flex items-center justify-center font-bold text-lg">0</div>
    <p className="text-xs mt-1">Nível 4</p>
  </div>
  <div className="text-center">
    <div className="h-20 rounded bg-red-100 text-red-800 flex items-center justify-center font-bold text-lg">0</div>
    <p className="text-xs mt-1">Nível 5</p>
  </div>
</div>
```

**Problemas do código hardcoded:**
- Sempre mostra 5 níveis, independente da configuração da tenant
- Grid fixo de 5 colunas
- Cores estáticas que não respeitam a configuração personalizada

### Depois (Dinâmico)
```tsx
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';

<RiskLevelDisplay 
  risks={risks}
  size="md"
  responsive={true}
/>
```

## Benefícios

1. **Configurabilidade**: Adapta-se automaticamente às configurações da tenant
2. **Grid Dinâmico**: Número de colunas se ajusta ao tipo de matriz (3, 4 ou 5)
3. **Manutenibilidade**: Código centralizado e reutilizável
4. **Consistência**: Garante que todos os componentes usem a mesma lógica
5. **Flexibilidade**: Suporte a diferentes tipos de matriz e cores personalizadas
6. **Responsividade**: Layout adaptável para diferentes dispositivos
7. **Performance**: Evita renderização desnecessária de níveis não configurados

## Estados de Carregamento

O componente inclui um estado de carregamento automático enquanto busca as configurações da tenant:

```tsx
// Skeleton loading state
<div className="grid grid-cols-2 md:grid-cols-5 gap-2">
  {[1, 2, 3, 4, 5].map((i) => (
    <div key={i} className="text-center">
      <div className="h-20 rounded bg-gray-200 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded mt-1 animate-pulse"></div>
    </div>
  ))}
</div>
```

## Integração com Temas

O componente suporta modo escuro automaticamente através das classes Tailwind:

- `dark:bg-*` para cores de fundo
- `dark:text-*` para cores de texto
- Cores personalizadas via `style` quando configuradas na tenant

## Exemplo Completo

```tsx
import React from 'react';
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';

const DashboardRiskSummary = () => {
  const risks = [
    { risk_level: 'Muito Alto' },
    { risk_level: 'Alto' },
    { risk_level: 'Alto' },
    { risk_level: 'Médio' },
    { risk_level: 'Baixo' }
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Resumo de Riscos por Nível
      </h3>
      <RiskLevelDisplay 
        risks={risks}
        size="md"
        responsive={true}
        className="mb-4"
      />
    </div>
  );
};
```

Este componente garante que a exibição de níveis de risco seja sempre consistente com a configuração da organização, eliminando a necessidade de hardcoding e facilitando a manutenção do sistema.