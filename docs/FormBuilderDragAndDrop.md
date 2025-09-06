# Form Builder com Drag & Drop

## 🎯 Visão Geral

O **Form Builder** foi aprimorado com funcionalidade completa de **Drag & Drop** e **Canvas Ajustável**, permitindo criar formulários de forma visual e intuitiva.

## 🚀 Funcionalidades Implementadas

### ✨ **Drag & Drop**
- **Arrastar campos** da biblioteca para o canvas
- **Posicionamento automático** em grid
- **Detecção de colisão** - impede sobreposição de campos
- **Feedback visual** durante o arraste
- **Preview em tempo real** dos campos

### 🎨 **Canvas Ajustável**
- **1 a 5 colunas** configuráveis
- **Linhas dinâmicas** que se expandem automaticamente
- **Grid visual** para facilitar o posicionamento
- **Responsivo** e adaptável

### 🔧 **Gerenciamento de Campos**
- **Seleção de campos** com clique
- **Painel de propriedades** dinâmico
- **Edição em tempo real** de propriedades
- **Remoção de campos** com confirmação
- **Validação de posicionamento**

## 📋 Tipos de Campos Disponíveis

### **Campos Básicos**
| Campo | Ícone | Descrição |
|-------|-------|-----------|
| Texto | 📝 | Campo de texto simples |
| Número | 🔢 | Campo numérico |
| Email | 📧 | Campo de email com validação |
| Data | 📅 | Seletor de data |
| Seleção | 📋 | Lista suspensa |
| Texto Longo | 📄 | Área de texto multilinha |

### **Campos Avançados**
| Campo | Ícone | Descrição |
|-------|-------|-----------|
| Tabela | 📊 | Tabela editável |
| Assinatura | ✍️ | Campo de assinatura digital |
| Geolocalização | 📍 | Captura de coordenadas GPS |
| QR Code | 📱 | Scanner de QR Code |
| Upload | 📎 | Upload de arquivos |
| Avaliação | ⭐ | Sistema de estrelas/rating |

## 🎮 Como Usar

### **1. Configurar Canvas**
```typescript
// Configurações disponíveis
interface CanvasConfig {
  columns: number;    // 1-5 colunas
  rows: number;       // Linhas dinâmicas
  showGrid: boolean;  // Mostrar grid
}
```

### **2. Arrastar Campos**
1. **Selecione** um campo na biblioteca
2. **Arraste** para o canvas
3. **Solte** na posição desejada
4. **Configure** as propriedades

### **3. Editar Propriedades**
```typescript
interface FormField {
  id: string;         // ID único
  type: string;       // Tipo do campo
  label: string;      // Rótulo
  placeholder?: string; // Texto de ajuda
  required: boolean;  // Campo obrigatório
  row: number;        // Linha no grid
  col: number;        // Coluna no grid
  colSpan: number;    // Largura em colunas
  properties: Record<string, any>; // Propriedades específicas
}
```

## 🎨 Interface do Canvas

### **Configurações do Canvas**
- **Seletor de Colunas**: 1-5 colunas
- **Botão Limpar**: Remove todos os campos
- **Contador de Campos**: Mostra quantidade atual

### **Área de Trabalho**
- **Grid Visual**: Linhas e colunas visíveis
- **Posicionamento Automático**: Snap to grid
- **Feedback Visual**: Destaque do campo selecionado
- **Scroll Automático**: Canvas se expande conforme necessário

### **Painel de Propriedades**
- **Label do Campo**: Nome exibido
- **Placeholder**: Texto de ajuda
- **Largura**: Quantas colunas ocupa
- **Campo Obrigatório**: Checkbox de validação
- **Botão Remover**: Exclusão do campo

## 🔧 Funcionalidades Técnicas

### **Detecção de Colisão**
```typescript
const isOccupied = formFields.some(field => 
  field.row === row && 
  field.col <= col && 
  field.col + field.colSpan > col
);
```

### **Cálculo de Posição**
```typescript
const getGridPosition = (e: React.DragEvent) => {
  const rect = canvasRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const cellWidth = rect.width / canvasConfig.columns;
  const cellHeight = 60;
  
  return {
    col: Math.floor(x / cellWidth),
    row: Math.floor(y / cellHeight)
  };
};
```

### **Renderização Dinâmica**
```typescript
const renderField = (field: FormField) => {
  return (
    <div
      style={{
        left: `${(field.col / canvasConfig.columns) * 100}%`,
        top: `${field.row * 60}px`,
        width: `${(field.colSpan / canvasConfig.columns) * 100}%`
      }}
    >
      {/* Conteúdo do campo */}
    </div>
  );
};
```

## 🎯 Estados e Controles

### **Estados Principais**
- `formFields`: Array de campos no canvas
- `selectedField`: Campo atualmente selecionado
- `canvasConfig`: Configurações do canvas
- `draggedField`: Campo sendo arrastado
- `hasUnsavedChanges`: Indicador de alterações

### **Controles de Interação**
- **Drag Start**: Inicia o arraste
- **Drag Over**: Permite o drop
- **Drop**: Adiciona campo ao canvas
- **Click**: Seleciona campo
- **Delete**: Remove campo

## 🎨 Estilos e Feedback Visual

### **Estados do Campo**
```css
/* Campo normal */
.field-normal {
  border: 2px solid #d1d5db;
  background: white;
}

/* Campo selecionado */
.field-selected {
  border: 2px solid #3b82f6;
  background: #eff6ff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Campo em hover */
.field-hover {
  border: 2px solid #9ca3af;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### **Grid do Canvas**
```css
.canvas-grid {
  background-image: 
    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
  background-size: calc(100% / columns) 60px;
}
```

## 🚀 Exemplo de Uso Completo

```typescript
// Configurar canvas para 3 colunas
setCanvasConfig({ columns: 3, rows: 10, showGrid: true });

// Adicionar campo de texto
const textField: FormField = {
  id: 'field_1',
  type: 'text',
  label: 'Nome Completo',
  placeholder: 'Digite seu nome...',
  required: true,
  row: 0,
  col: 0,
  colSpan: 2,
  properties: {}
};

// Adicionar campo de email
const emailField: FormField = {
  id: 'field_2',
  type: 'email',
  label: 'Email',
  placeholder: 'seu@email.com',
  required: true,
  row: 1,
  col: 0,
  colSpan: 3,
  properties: {}
};
```

## 🎉 Benefícios

- **Interface Intuitiva**: Drag & drop natural
- **Flexibilidade**: Canvas ajustável de 1-5 colunas
- **Produtividade**: Criação rápida de formulários
- **Validação**: Prevenção de erros de posicionamento
- **Responsividade**: Funciona em diferentes tamanhos de tela
- **Feedback Visual**: Interface clara e informativa

O Form Builder com Drag & Drop oferece uma experiência profissional e intuitiva para criação de formulários, combinando facilidade de uso com funcionalidades avançadas!