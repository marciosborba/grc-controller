# 🔧 Migração RLS para Módulo de IA

## ⚠️ **IMPORTANTE: Migração Pendente**

O módulo de Gestão de IA está funcionando, mas as políticas RLS (Row Level Security) precisam ser atualizadas para permitir que os dados sejam exibidos corretamente após as operações de update.

## 📋 **Status Atual:**
- ✅ **Salvamento**: Funcionando (dados são salvos no banco)
- ❌ **Exibição**: Limitada (políticas RLS impedem visualização completa)
- 🔄 **Migração**: Criada mas não aplicada

## 🚀 **Como Aplicar a Migração:**

### **Opção 1: Via Supabase Dashboard (Recomendado)**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Execute o conteúdo do arquivo: `supabase/migrations/20250818120000_fix_ai_templates_rls.sql`

### **Opção 2: Via CLI (se configurado)**
```bash
npx supabase db push
```

### **Opção 3: Aplicação Manual**
Execute as seguintes queries no banco de dados:

```sql
-- Remover políticas restritivas existentes
DROP POLICY IF EXISTS "Users can view public templates and own tenant templates" ON ai_grc_prompt_templates;
DROP POLICY IF EXISTS "Users can manage own templates" ON ai_grc_prompt_templates;

-- Criar políticas para administradores
CREATE POLICY "Platform admins can view all templates" ON ai_grc_prompt_templates FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
);

CREATE POLICY "Platform admins can manage all templates" ON ai_grc_prompt_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
    OR
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'admin')
);

-- Política para templates públicos
CREATE POLICY "Users can view public templates" ON ai_grc_prompt_templates FOR SELECT USING (
    is_public = true
);

-- Política para templates próprios
CREATE POLICY "Users can manage own templates" ON ai_grc_prompt_templates FOR ALL USING (
    created_by = auth.uid()
);
```

## 🎯 **Após Aplicar a Migração:**

1. **Recarregue a página** do módulo de IA
2. **Teste o salvamento** de templates
3. **Verifique se os dados** aparecem corretamente após salvar
4. **Confirme que não há mais** mensagens sobre RLS nos logs

## 📊 **Verificação:**

Após aplicar a migração, você deve ver nos logs:
```
=== TEMPLATE PÚBLICO ATUALIZADO ===
Dados retornados: [objeto com dados do template]
Saved data: [objeto com dados do template]
```

Em vez de:
```
=== TEMPLATE PÚBLICO ATUALIZADO ===
Dados retornados: Array []
Saved data: Array []
```

## 🔍 **Troubleshooting:**

Se ainda houver problemas após a migração:

1. **Verifique as políticas** no Supabase Dashboard → Authentication → Policies
2. **Confirme que o usuário** tem `is_platform_admin = true`
3. **Teste com um usuário** que tenha permissão 'admin'

## 📝 **Arquivos Relacionados:**
- `supabase/migrations/20250818120000_fix_ai_templates_rls.sql` - Migração RLS
- `src/components/ai/sections/AIPromptsSection.tsx` - Componente principal
- Este arquivo: `MIGRATION_RLS_AI.md` - Instruções

---

**Desenvolvido por**: Qodo Command CLI  
**Data**: 18/08/2025  
**Status**: Aguardando aplicação da migração