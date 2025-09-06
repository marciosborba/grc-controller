# Canvas Dinâmico Form Builder

## 🎯 Visão Geral

O **Canvas Dinâmico Form Builder** foi completamente reformulado para seguir o padrão do Editor de Processos, oferecendo uma experiência mais intuitiva e profissional para criação de formulários.

## 🚀 Principais Melhorias Implementadas

### ✨ **Canvas Dinâmico**
- **Inicia vazio** - Sem linhas ou colunas pré-definidas
- **Linhas sob demanda** - Usuário adiciona conforme necessidade
- **Colunas ajustáveis** - 1 a 4 colunas por linha
- **Altura configurável** - Auto, Pequena, Média, Grande, Extra
- **Larguras personalizáveis** - 1fr, 2fr, 3fr, auto, pixels

### 🎨 **Interface Aprimorada**
- **UI consistente** com o Editor de Processos
- **Cores legíveis** - Fundo branco/cinza escuro com texto contrastante
- **Componentes bem definidos** - Bordas, sombras e espaçamentos adequados
- **Feedback visual** claro para drag & drop

### 🔧 **Funcionalidades Avançadas**
- **Drag & Drop nativo** - Arrastar da biblioteca para o canvas
- **Edição in-place** - Propriedades editáveis diretamente
- **Preview em tempo real** - Visualização dos campos como aparecerão
- **Controles granulares** - Configuração detalhada de cada elemento

## 📋 Estrutura do Canvas

### **1. Canvas Vazio (Estado Inicial)**
```
┌─────────────────────────────────────────┐
│              Canvas Vazio               │
│                                         │
│  📊 Ícone de Database                   │
│  "Canvas Vazio"                         │
│  "Adicione uma linha para começar"      │
│                                         │
│  [+ Adicionar Primeira Linha (2 cols)] │
│  "Ou arraste campos da biblioteca"      │
└─────────────────────────────────────────┘
```

### **2. Canvas com Linhas**
```
┌─────────────────────────────────────────┐
│ Linha 1 [2col] [Cols: 2▼] [Alt: Auto▼] │
│ ┌─────────────┬─────────────────────────┐ │
│ │ 1 [1fr▼]    │ 2 [1fr▼]              │ │
│ │ Drop aqui   │ [Campo Texto]         │ │
│ │             │ Tipo: text [Req] ☰    │ │
│ └─────────────┴─────────────────────────┘ │
│                                         │
│ Linha 2 [3col] [Cols: 3▼] [Alt: Auto▼] │
│ ┌─────┬─────────┬─────────────────────┐   │
│ │ 1   │ 2       │ 3                   │   │
│ │     │         │                     │   │
│ └─────┴─────────┴─────────────────────┘   │
└─────────────────────────────────────────┘
```

## 🎮 Como Usar

### **1. Adicionar Linhas**
```typescript
// Botões na biblioteca
<Button onClick={() => addNewRow(2)}>Nova Linha (2 cols)</Button>
<Button onClick={() => addNewRow(3)}>Nova Linha (3 cols)</Button>
<Button onClick={() => addNewRow(4)}>Nova Linha (4 cols)</Button>

// Ou no header do canvas
<Button onClick={() => addNewRow(2)}>
  <Plus className="h-3 w-3 mr-1" />
  Nova Linha
</Button>
```

### **2. Configurar Linhas**
- **Colunas**: Dropdown 1-4 colunas
- **Altura**: Auto, Pequena, Média, Grande, Extra
- **Largura das colunas**: 1fr, 2fr, 3fr, auto, 200px, 300px, 400px

### **3. Adicionar Campos**
- **Arrastar** da biblioteca para a coluna desejada
- **Soltar** na área de drop da coluna
- **Configurar** propriedades no painel lateral

### **4. Editar Campos**
- **Clicar** no campo para selecioná-lo
- **Editar** propriedades no painel direito
- **Mover** arrastando para outra posição
- **Remover** com botão de lixeira

## 🎨 Tipos de Campos Disponíveis

### **Campos Básicos (7)**
| Campo | Ícone | Descrição | Preview |
|-------|-------|-----------|---------|
| Texto | ✏️ | Campo de texto simples | `<Input placeholder="Digite..." />` |
| Número | # | Campo numérico | `<Input type="number" />` |
| Email | 📧 | Campo de email | `<Input type="email" />` |
| Data | 📅 | Seletor de data | `<Input type="date" />` |
| Hora | 🕐 | Seletor de hora | `<Input type="time" />` |
| Seleção | ⬇️ | Lista suspensa | `<Select><SelectTrigger />` |
| Texto Longo | 📄 | Área de texto | `<Textarea rows={1} />` |

### **Campos Avançados (5)**
| Campo | Ícone | Descrição | Preview |
|-------|-------|-----------|---------|
| Checkbox | ☑️ | Caixa de seleção | `<input type="checkbox" />` |
| Radio | ⚪ | Botão de opção | `<input type="radio" />` |
| Upload | 📎 | Upload de arquivo | Área de drop com ícone |
| Avaliação | ⭐ | Sistema de estrelas | 5 estrelas clicáveis |
| Slider | 🎚️ | Controle deslizante | `<input type="range" />` |

## 🔧 Estrutura de Dados

### **FormRow Interface**
```typescript
interface FormRow {
  id: string;                    // ID único da linha
  columns: number;               // Número de colunas (1-4)
  height: string;                // 'auto', 'small', 'medium', 'large', 'xl'
  columnWidths: string[];        // ['1fr', '2fr', 'auto', '200px']
}
```

### **FormField Interface**
```typescript
interface FormField {
  id: string;                    // ID único do campo
  type: string;                  // Tipo do campo
  label: string;                 // Rótulo exibido
  placeholder?: string;          // Texto de ajuda
  required: boolean;             // Campo obrigatório
  rowId: string;                 // ID da linha pai
  rowIndex: number;              // Índice da linha
  column: number;                // Índice da coluna (0-3)
  width: number;                 // Span de colunas (1-4)
  options?: string[];            // Opções para select/radio
  validation?: {                 // Regras de validação
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}
```

## 🎯 Funcionalidades Técnicas

### **1. Drag & Drop**
```typescript
// Iniciar arraste
const handleDragStart = (e: React.DragEvent, field: any, isNewField: boolean) => {
  setDraggedField({ ...field, isNewField });
  e.dataTransfer.effectAllowed = 'move';
};

// Permitir drop
const handleDragOver = (e: React.DragEvent, rowId: string, column: number) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  setDragOverColumn(column);
  setSelectedRow(rowId);
};

// Processar drop
const handleDrop = (e: React.DragEvent, targetRowId: string, targetColumn: number) => {
  // Lógica para adicionar/mover campo
};
```

### **2. Gerenciamento de Linhas**
```typescript
// Adicionar linha
const addNewRow = (columns: number = 2) => {
  const newRow: FormRow = {
    id: `row_${Date.now()}`,
    columns: columns,
    height: 'auto',
    columnWidths: Array(columns).fill('1fr')
  };
  setFormRows(prev => [...prev, newRow]);
};

// Atualizar colunas
const updateRowColumns = (rowId: string, columns: number) => {
  setFormRows(prev => prev.map(row => {
    if (row.id === rowId) {
      const newColumnWidths = Array(columns).fill('1fr');
      return { ...row, columns, columnWidths: newColumnWidths };
    }
    return row;
  }));
};
```

### **3. Renderização Dinâmica**
```typescript
// Grid CSS dinâmico
<div 
  className="grid gap-2"
  style={{ gridTemplateColumns: row.columnWidths.join(' ') }}
>
  {Array.from({ length: row.columns }, (_, columnIndex) => (
    <div 
      key={`${row.id}-${columnIndex}`}
      className="min-h-16 border-2 border-dashed rounded p-1.5"
      onDrop={(e) => handleDrop(e, row.id, columnIndex)}
    >
      {/* Conteúdo da coluna */}
    </div>
  ))}
</div>
```

## 🎨 Estilos e Feedback Visual

### **Estados do Canvas**
```css
/* Canvas vazio */
.canvas-empty {
  border: 2px dashed #d1d5db;
  background: #f9fafb;
}

/* Canvas com drag over */
.canvas-drag-over {
  border: 2px dashed #3b82f6;
  background: #eff6ff;
}

/* Coluna com drag over */
.column-drag-over {
  border: 2px dashed #3b82f6;
  background: #eff6ff;
}
```

### **Estados dos Campos**
```css
/* Campo normal */
.field-normal {
  border: 1px solid #e5e7eb;
  background: white;
}

/* Campo selecionado */
.field-selected {
  border: 1px solid #3b82f6;
  background: #eff6ff;
}

/* Campo em hover */
.field-hover {
  border: 1px solid #9ca3af;
}
```

## 🚀 Exemplo de Uso Completo

```typescript
// Estado inicial - Canvas vazio
const [formRows, setFormRows] = useState<FormRow[]>([]);
const [formFields, setFormFields] = useState<FormField[]>([]);

// 1. Usuário clica "Nova Linha (2 cols)"
addNewRow(2);
// Resultado: Uma linha com 2 colunas vazias

// 2. Usuário arrasta campo "Texto" para coluna 1
handleDrop(dragEvent, 'row_1', 0);
// Resultado: Campo texto adicionado na primeira coluna

// 3. Usuário configura propriedades
updateField('field_1', { 
  label: 'Nome Completo', 
  required: true,
  placeholder: 'Digite seu nome...'
});

// 4. Usuário adiciona mais campos e linhas
// Resultado: Formulário completo e funcional
```

## 🎉 Benefícios da Nova Implementação

- **✅ Interface Consistente** - Segue padrão do Editor de Processos
- **✅ Canvas Dinâmico** - Inicia vazio, cresce conforme necessidade
- **✅ UI Legível** - Cores contrastantes e componentes bem definidos
- **✅ Flexibilidade Total** - Linhas e colunas completamente configuráveis
- **✅ Drag & Drop Intuitivo** - Experiência natural de arrastar e soltar
- **✅ Preview em Tempo Real** - Visualização imediata dos campos
- **✅ Controles Granulares** - Configuração detalhada de cada elemento
- **✅ Responsividade** - Funciona em diferentes tamanhos de tela

O Canvas Dinâmico Form Builder agora oferece uma experiência profissional e intuitiva, permitindo criar formulários complexos de forma visual e eficiente! 🎨✨