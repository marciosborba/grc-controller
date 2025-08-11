# Implementação de Dark Mode com Persistência

Este documento descreve a implementação da funcionalidade de dark mode com persistência no banco de dados.

## Arquitetura

A implementação utiliza `next-themes` para gerenciar temas e nosso `ThemeContext` customizado para integração com o banco de dados.

### Componentes Principais

1. **ThemeContext** (`src/contexts/ThemeContext.tsx`)
   - Integra `next-themes` com persistência no banco
   - Gerencia preferências de tema e cores
   - Auto-salva configurações no banco de dados

2. **ThemeToggle** (`src/components/ui/theme-toggle.tsx`)
   - Componente de alternância de tema com dropdown
   - Salva automaticamente as preferências
   - Disponível no header da aplicação

3. **ColorSelector** (`src/components/profile/ColorSelector.tsx`)
   - Permite personalização da paleta de cores
   - Inclui botão para salvar cores personalizadas
   - Integrado com ThemeContext

## Funcionalidades

### Persistência de Tema
- **Armazenamento**: Banco de dados na tabela `profiles.notification_preferences`
- **Auto-save**: Mudanças de tema são salvas automaticamente
- **Carregamento**: Tema é restaurado no login/refresh

### Persistência de Cores
- **Armazenamento**: Banco de dados na tabela `profiles.notification_preferences.colorPalette`
- **Controle manual**: Usuário clica em "Salvar Cores" para persistir
- **Preview em tempo real**: Cores são aplicadas imediatamente na interface

### Opções de Tema
- **Light**: Tema claro
- **Dark**: Tema escuro
- **System**: Segue preferência do sistema operacional

## Estrutura do Banco de Dados

```sql
-- Tabela profiles
profiles.notification_preferences (JSONB)
├── theme: 'light' | 'dark' | 'system'
├── colorPalette: {
│   ├── primary: string (hex color)
│   ├── secondary: string (hex color)
│   └── tertiary: string (hex color)
│   }
├── notifications: { ... }
└── privacy: { ... }
```

## Como Usar

### Para desenvolvedores

1. **Importar o hook de tema**:
```tsx
import { useThemeContext } from '@/contexts/ThemeContext';

const { theme, setTheme, savePreferences } = useThemeContext();
```

2. **Usar o componente ThemeToggle**:
```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

<ThemeToggle />
```

3. **Acessar preferências de cor**:
```tsx
const { preferences } = useThemeContext();
const { primary, secondary, tertiary } = preferences.colorPalette;
```

### Para usuários

1. **Alternar tema**: Clique no botão de tema no header
2. **Personalizar cores**: Vá para Perfil > Preferências > Paleta de Cores
3. **Salvar cores**: Clique em "Salvar Cores" após personalizar

## Integração com shadcn/ui

As cores personalizadas são aplicadas automaticamente às variáveis CSS do shadcn/ui:
- `--primary`
- `--secondary` 
- `--accent`

## Benefícios

1. **UX Melhorada**: Tema e cores são mantidos entre sessões
2. **Flexibilidade**: Usuários podem personalizar aparência
3. **Performance**: Carregamento rápido das preferências
4. **Consistência**: Integração nativa com design system