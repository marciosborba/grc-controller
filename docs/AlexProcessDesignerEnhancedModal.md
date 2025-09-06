# Alex Process Designer Enhanced Modal

## 📋 Visão Geral

O **Alex Process Designer Enhanced Modal** é uma versão modal do Designer Enhanced que cobre toda a tela, proporcionando uma experiência imersiva para criação e edição de formulários e processos.

## 🚀 Funcionalidades

### ✨ **Características Principais**

- **Modal Full-Screen**: Cobre toda a tela para máxima área de trabalho
- **Modo Criar/Editar**: Suporte para criação de novos itens e edição de existentes
- **5 Camadas Arquiteturais**: Form Builder, Workflow Engine, Analytics, Reports, Integrations
- **Controle de Alterações**: Detecta mudanças não salvas e avisa antes de fechar
- **Maximizar/Minimizar**: Botão para alternar entre tela cheia e janela reduzida

### 🎯 **Modos de Operação**

1. **Modo Criação** (`create`)
   - Interface otimizada para criar novos formulários/processos
   - Canvas vazio pronto para receber elementos
   - Título: "Criar Novo - Alex Process Designer Enhanced"

2. **Modo Edição** (`edit`)
   - Interface para editar formulários/processos existentes
   - Pode receber dados iniciais via `initialData`
   - Título: "Editar - Alex Process Designer Enhanced"

## 🛠️ Como Usar

### **1. Importação**

```tsx
import AlexProcessDesignerEnhancedModal from './alex/AlexProcessDesignerEnhancedModal';
```

### **2. Estado do Componente**

```tsx
const [showEnhancedModal, setShowEnhancedModal] = useState(false);
const [enhancedModalMode, setEnhancedModalMode] = useState<'create' | 'edit'>('create');
```

### **3. Implementação**

```tsx
{/* Botões para abrir o modal */}
<Button onClick={() => {
  setEnhancedModalMode('create');
  setShowEnhancedModal(true);
}}>
  Criar Enhanced
</Button>

<Button onClick={() => {
  setEnhancedModalMode('edit');
  setShowEnhancedModal(true);
}}>
  Editar Enhanced
</Button>

{/* Modal */}
{showEnhancedModal && (
  <AlexProcessDesignerEnhancedModal
    isOpen={showEnhancedModal}
    onClose={() => setShowEnhancedModal(false)}
    mode={enhancedModalMode}
    onSave={(data) => {
      console.log('Dados salvos:', data);
      setShowEnhancedModal(false);
    }}
  />
)}
```

## 📊 Interface do Modal

### **Header**
- Logo animado com indicador de status
- Título dinâmico baseado no modo (Criar/Editar)
- Badge de versão v4.0.0 Enhanced
- Indicador de alterações não salvas
- Botões: Maximizar/Minimizar, Salvar, Fechar

### **Navegação**
- 5 tabs para as camadas arquiteturais
- Ícones e labels responsivos
- Indicação visual da camada ativa

### **Conteúdo**
- Layout de 5 colunas: Biblioteca + Canvas + Propriedades
- Altura otimizada para aproveitar toda a tela
- Scroll automático quando necessário

## 🎨 Camadas Disponíveis

### **1. Form Builder**
- **Biblioteca**: Campos básicos e avançados
- **Canvas**: Área de design do formulário
- **Propriedades**: Configurações dos campos

### **2. Workflow Engine**
- **Biblioteca**: Elementos BPMN (Eventos, Atividades, Gateways)
- **Canvas**: Designer de processos BPMN
- **Propriedades**: Configurações do processo

### **3. Analytics & Dashboard**
- **Biblioteca**: Widgets de visualização
- **Canvas**: Designer de dashboard
- **Propriedades**: Configurações do dashboard

### **4. Reports**
- **Biblioteca**: Seções de relatório
- **Canvas**: Designer de relatórios
- **Propriedades**: Configurações do relatório

### **5. Integrations**
- **Biblioteca**: Conectores disponíveis
- **Canvas**: API Gateway e endpoints
- **Propriedades**: Configurações de integração

## 🔧 Props da Interface

```tsx
interface AlexProcessDesignerEnhancedModalProps {
  isOpen: boolean;                    // Controla se o modal está aberto
  onClose: () => void;               // Callback para fechar o modal
  mode?: 'create' | 'edit';          // Modo de operação (padrão: 'create')
  initialData?: any;                 // Dados iniciais para modo edição
  onSave?: (data: any) => void;      // Callback para salvar dados
}
```

## 🎯 Funcionalidades Especiais

### **Controle de Alterações**
- Detecta automaticamente quando há mudanças não salvas
- Exibe badge "Não salvo" no header
- Confirma antes de fechar se há alterações pendentes

### **Responsividade**
- Layout adaptativo para diferentes tamanhos de tela
- Botões com labels que se adaptam ao espaço disponível
- Grid flexível que se ajusta automaticamente

### **Feedback Visual**
- Toasts informativos para todas as ações
- Indicadores visuais de status
- Animações suaves para transições

## 📱 Exemplo de Uso Completo

```tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AlexProcessDesignerEnhancedModal from './alex/AlexProcessDesignerEnhancedModal';

const MyComponent = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  const handleCreate = () => {
    setMode('create');
    setShowModal(true);
    toast.info('Abrindo Designer Enhanced - Modo Criação');
  };

  const handleEdit = () => {
    setMode('edit');
    setShowModal(true);
    toast.info('Abrindo Designer Enhanced - Modo Edição');
  };

  const handleSave = (data: any) => {
    console.log('Dados salvos:', data);
    toast.success(`${mode === 'create' ? 'Criado' : 'Salvo'} com sucesso!`);
    setShowModal(false);
  };

  return (
    <div>
      <Button onClick={handleCreate}>Criar Novo</Button>
      <Button onClick={handleEdit}>Editar Existente</Button>

      {showModal && (
        <AlexProcessDesignerEnhancedModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={mode}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
```

## 🎉 Benefícios

- **Experiência Imersiva**: Modal full-screen maximiza a área de trabalho
- **Flexibilidade**: Suporte para criação e edição
- **Usabilidade**: Interface intuitiva com feedback visual
- **Responsividade**: Funciona em diferentes tamanhos de tela
- **Modularidade**: Fácil integração em qualquer página

O modal Enhanced oferece uma experiência profissional e completa para criação e edição de formulários e processos, mantendo toda a funcionalidade da versão original em um formato mais acessível e focado.