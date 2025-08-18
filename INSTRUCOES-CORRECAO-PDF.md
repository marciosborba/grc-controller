# 🎨 CORREÇÃO: Problema de Salvar Cor do PDF no Tema UI Nativa

## 📋 Problema Identificado

Você estava tentando salvar a configuração de cor do PDF através do botão **"Atualizar Tema"** no card UI Nativa, mas estava recebendo um erro porque a tabela `company_settings` não existe no banco de dados.

## ✅ Solução Implementada

### 🔧 **O que foi corrigido:**

1. **Criado componente específico para configuração de PDF**
   - Interface dedicada para configurar cor do PDF
   - Validação de formato hexadecimal
   - Preview da cor em tempo real

2. **Integrado ao tema UI Nativa**
   - Aparece automaticamente quando tema UI Nativa está ativo
   - Posicionado logo após o preview do tema ativo

3. **Criado estrutura de banco necessária**
   - SQL para criar tabela `company_settings`
   - Campos para dados da empresa e cor do PDF

## 🚀 **PASSOS PARA ATIVAR A FUNCIONALIDADE:**

### Passo 1: Criar a Tabela no Banco de Dados
1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd
   ```

2. **Vá para "SQL Editor"** (menu lateral esquerdo)

3. **Execute este SQL:**
   ```sql
   -- Criar tabela company_settings para armazenar configurações da empresa
   CREATE TABLE IF NOT EXISTS company_settings (
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

   -- Criar índices para performance
   CREATE INDEX IF NOT EXISTS idx_company_settings_tenant_id ON company_settings(tenant_id);

   -- Comentários para documentação
   COMMENT ON TABLE company_settings IS 'Configurações específicas da empresa/tenant incluindo dados para PDF';
   COMMENT ON COLUMN company_settings.pdf_primary_color IS 'Cor primária para PDFs em formato hexadecimal (ex: #2962FF)';
   COMMENT ON COLUMN company_settings.tenant_id IS 'Referência única para o tenant - cada tenant pode ter apenas uma configuração';

   -- Inserir configurações padrão para tenants existentes
   INSERT INTO company_settings (tenant_id, company_name, pdf_primary_color, email, phone, address, city, state, zip_code)
   SELECT 
     t.id,
     t.name,
     '#2962FF',
     COALESCE(t.contact_email, 'contato@empresa.com.br'),
     '(11) 1234-5678',
     'Endereço não configurado',
     'São Paulo',
     'SP',
     '01000-000'
   FROM tenants t
   WHERE NOT EXISTS (
     SELECT 1 FROM company_settings cs WHERE cs.tenant_id = t.id
   );
   ```

4. **Clique em "Run"** para executar

### Passo 2: Verificar se Funcionou
Execute este comando no terminal do projeto para testar:
```bash
node test-company-settings.cjs
```

Se aparecer "✅ Tabela company_settings existe!", está tudo certo!

### Passo 3: Usar a Nova Funcionalidade
1. **Acesse:** Configurações Globais → Temas & Cores
2. **Certifique-se** que o tema **"UI Nativa"** está ativo
3. **Você verá** um novo card **"Configuração de PDF"** abaixo do preview do tema
4. **Configure** a cor desejada (ex: #FF6B35 para laranja)
5. **Clique em "Salvar"** ou "Atualizar"

## 🎯 **Como Usar a Nova Interface:**

### Interface de Configuração de PDF
- **Preview da cor**: Quadrado colorido mostra a cor atual
- **Campo hexadecimal**: Digite a cor no formato #RRGGBB
- **Botão "Visualizar"**: Preview da cor selecionada
- **Botão "Padrão"**: Volta para a cor padrão (#2962FF)
- **Botão "Salvar/Atualizar"**: Salva a configuração

### Cores Sugeridas
- **Azul padrão**: #2962FF
- **Verde**: #4CAF50
- **Laranja**: #FF6B35
- **Roxo**: #9C27B0
- **Vermelho**: #F44336

## 🔍 **Verificar se Está Funcionando:**

1. **Configure uma cor** (ex: #FF6B35)
2. **Gere um PDF** de carta de aceitação de risco
3. **Verifique** se os cabeçalhos e destaques estão na cor escolhida

## ❌ **Troubleshooting:**

### "Tabela company_settings não encontrada"
- Execute o SQL do Passo 1 no Supabase Dashboard

### "Usuário não está associado a um tenant"
- Verifique se seu usuário tem um tenant válido
- Entre em contato com o administrador do sistema

### Interface não aparece
- Certifique-se que o tema **UI Nativa** está ativo
- Recarregue a página
- Verifique se você tem permissões de administrador

### Cor não muda nos PDFs
- Verifique se a cor foi salva (deve aparecer mensagem de sucesso)
- Gere um novo PDF (não use PDFs antigos)
- Verifique o console do navegador para erros

## 📊 **Resultado Final:**

Após seguir estes passos, você terá:
- ✅ Interface dedicada para configurar cor do PDF
- ✅ Configuração salva por empresa/tenant
- ✅ PDFs gerados com cores personalizadas
- ✅ Integração completa com o sistema de temas

## 🎉 **Pronto!**

Agora você pode configurar a cor dos PDFs diretamente na interface, sem precisar editar código ou arquivos de configuração. A funcionalidade está totalmente integrada ao tema UI Nativa e funciona de forma intuitiva.

---

**Arquivos criados/modificados:**
- ✅ `src/components/general-settings/PDFColorSettings.tsx` (novo)
- ✅ `src/components/general-settings/sections/GlobalRulesSection.tsx` (modificado)
- ✅ `create-company-settings.sql` (SQL para executar)
- ✅ `test-company-settings.cjs` (script de teste)

**Próximos passos:**
1. Execute o SQL no Supabase Dashboard
2. Teste a funcionalidade
3. Configure a cor desejada
4. Gere PDFs para verificar