# 🎨 Configuração de Cor do PDF - Setup

## 📋 Problema Identificado

O usuário estava tentando salvar a configuração de cor do PDF no tema UI Nativa, mas a tabela `company_settings` não existia no banco de dados, causando o erro:

```
relation "public.company_settings" does not exist
```

## ✅ Solução Implementada

### 1. **Criado Componente PDFColorSettings**
- **Arquivo**: `src/components/general-settings/PDFColorSettings.tsx`
- **Funcionalidades**:
  - Interface para configurar cor primária do PDF
  - Validação de formato hexadecimal
  - Carregamento e salvamento de configurações
  - Preview da cor selecionada
  - Integração com tema UI Nativa

### 2. **Integrado ao GlobalRulesSection**
- **Arquivo**: `src/components/general-settings/sections/GlobalRulesSection.tsx`
- **Modificações**:
  - Importado componente `PDFColorSettings`
  - Adicionado seção condicional que aparece apenas quando tema UI Nativa está ativo
  - Posicionado após o preview do tema ativo

### 3. **Criado SQL para Tabela company_settings**
- **Arquivo**: `create-company-settings.sql`
- **Estrutura da tabela**:
  ```sql
  CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    cnpj VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    pdf_primary_color VARCHAR(7) DEFAULT '#2962FF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id)
  );
  ```

## 🚀 Como Executar o Setup

### Passo 1: Criar a Tabela no Banco
Execute o SQL no Supabase Dashboard:

1. Acesse: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd
2. Vá para **SQL Editor**
3. Execute o conteúdo do arquivo `create-company-settings.sql`

### Passo 2: Verificar a Funcionalidade
1. Acesse **Configurações Globais** → **Temas & Cores**
2. Certifique-se que o tema **UI Nativa** está ativo
3. Você verá o card **"Configuração de PDF"** abaixo do preview do tema
4. Configure a cor desejada e clique em **"Salvar"**

## 🎯 Funcionalidades do Componente

### Interface do Usuário
- **Seletor de cor visual**: Preview da cor em tempo real
- **Input hexadecimal**: Entrada manual da cor (ex: #2962FF)
- **Botão de preview**: Visualizar a cor selecionada
- **Botão "Padrão"**: Resetar para cor padrão (#2962FF)
- **Status da configuração**: Indica se é primeira configuração ou atualização

### Validações
- **Formato hexadecimal**: Valida formato #RRGGBB
- **Tenant válido**: Verifica se usuário está associado a um tenant
- **Permissões**: Apenas administradores podem configurar

### Integração com Sistema
- **Hook useRiskLetterPrint**: Já configurado para usar a cor personalizada
- **PDF Generator**: Suporta cor customizada via parâmetro `primaryColor`
- **Fallback**: Se não houver configuração, usa cor padrão #2962FF

## 📊 Estrutura de Dados

### Tabela company_settings
```sql
-- Exemplo de registro
INSERT INTO company_settings (
  tenant_id,
  company_name,
  pdf_primary_color,
  email,
  phone
) VALUES (
  '46b1c048-85a1-423b-96fc-776007c8de1f', -- ID do tenant GRC-Controller
  'GRC-Controller',
  '#2962FF',
  'contato@grc-controller.com.br',
  '(11) 1234-5678'
);
```

### Integração com PDF
```typescript
// No useRiskLetterPrint.ts
const getPDFColor = async (): Promise<string> => {
  const { data: settings } = await supabase
    .from('company_settings')
    .select('pdf_primary_color')
    .eq('tenant_id', user.tenantId)
    .maybeSingle();
    
  return settings?.pdf_primary_color || '#2962FF';
};
```

## 🔧 Troubleshooting

### Erro: "Tabela company_settings não existe"
**Solução**: Execute o SQL de criação da tabela no Supabase Dashboard

### Erro: "Tenant não encontrado"
**Solução**: Verifique se o usuário está associado a um tenant válido

### Cor não aparece nos PDFs
**Solução**: 
1. Verifique se a cor foi salva corretamente
2. Teste gerando um novo PDF
3. Verifique logs do console para erros

### Interface não aparece
**Solução**:
1. Certifique-se que o tema UI Nativa está ativo
2. Verifique se o usuário tem permissões de administrador
3. Recarregue a página

## 📝 Logs e Monitoramento

O componente registra atividades importantes:
- **pdf_color_updated**: Quando cor é alterada
- **Logs detalhados**: Console do navegador para debugging
- **Toast notifications**: Feedback visual para o usuário

## 🎉 Resultado Final

Agora os administradores podem:
1. **Configurar cor do PDF** diretamente na interface
2. **Ver preview** da cor selecionada
3. **Salvar configurações** por tenant
4. **Gerar PDFs** com cores personalizadas
5. **Resetar para padrão** quando necessário

A funcionalidade está totalmente integrada ao sistema de temas e aparece apenas quando o tema UI Nativa está ativo, mantendo a consistência da interface.