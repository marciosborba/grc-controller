# 🔒 Migração de Segurança: Platform Admins

## 📋 Visão Geral

Esta migração implementa as recomendações de segurança para verificação de Platform Admin, migrando usuários da tabela `user_roles` para a tabela `platform_admins` como fonte autoritativa.

## ⚠️ Problema de Segurança Identificado

**Antes:** O sistema verificava Platform Admin usando operador OR entre duas fontes:
```typescript
// ❌ INSEGURO - Qualquer uma das condições dava acesso admin
const isPlatformAdmin = !!platformAdmin || roles.some(...)
```

**Depois:** Sistema hierárquico com fonte autoritativa:
```typescript
// ✅ SEGURO - Prioridade para tabela platform_admins
if (platformAdmin) {
  isPlatformAdmin = true;
  adminSource = 'platform_admins_table';
} else {
  // Fallback apenas para compatibilidade
}
```

## 🚀 Como Executar a Migração

### Opção 1: Interface Web (Recomendado)

1. Acesse: `/admin/platform-migration`
2. Clique em "Migrar Usuários"
3. Após confirmação, clique em "Limpar Roles Redundantes"

### Opção 2: SQL Direto

Execute o script no Supabase SQL Editor:

```sql
-- Copie e cole o conteúdo de scripts/quick_migration.sql
```

### Opção 3: Script Completo

Para análise detalhada, execute:

```sql
-- Copie e cole o conteúdo de scripts/migrate_platform_admins.sql
```

## 📊 Verificações de Segurança

### Antes da Migração
- [ ] Backup do banco de dados realizado
- [ ] Identificados usuários com roles administrativas
- [ ] Verificado estado da tabela platform_admins

### Durante a Migração
- [ ] Usuários migrados para platform_admins
- [ ] Nenhum usuário perdeu acesso administrativo
- [ ] Logs de auditoria funcionando

### Após a Migração
- [ ] Todos os platform admins estão na tabela platform_admins
- [ ] Sistema funcionando corretamente
- [ ] Roles redundantes removidas (opcional)

## 🔍 Verificação Manual

Execute para verificar o estado atual:

```sql
-- Verificar platform admins
SELECT 
    p.full_name,
    p.email,
    pa.created_at
FROM platform_admins pa
JOIN profiles p ON pa.user_id = p.user_id;

-- Verificar roles administrativas restantes
SELECT 
    p.full_name,
    p.email,
    ur.role
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE ur.role IN ('admin', 'super_admin', 'platform_admin');
```

## 🛡️ Benefícios de Segurança

1. **✅ Fonte Única de Verdade:** `platform_admins` é autoritativa
2. **✅ Auditoria Completa:** Logs quando fallback é usado
3. **✅ Rastreabilidade:** Origem do acesso admin é conhecida
4. **✅ Fail Secure:** Falha de forma segura
5. **✅ Compatibilidade:** Mantém usuários existentes

## 📝 Logs de Auditoria

O sistema agora registra:

```typescript
console.log('🔐 [AUTH] Platform Admin verification (SECURE):', {
  isPlatformAdmin,
  adminSource,           // ← Como obteve acesso admin
  securityNote          // ← Método usado (primário/fallback)
});
```

## 🚨 Troubleshooting

### Usuário perdeu acesso administrativo

1. Verificar se está na tabela platform_admins:
```sql
SELECT * FROM platform_admins WHERE user_id = 'USER_ID';
```

2. Se não estiver, adicionar manualmente:
```sql
INSERT INTO platform_admins (user_id, created_at, updated_at)
VALUES ('USER_ID', NOW(), NOW());
```

### Sistema usando fallback

Se aparecer no log `USING_FALLBACK_METHOD`:

1. Verificar por que usuário não está em platform_admins
2. Migrar usuário para a tabela principal
3. Remover role administrativa redundante

## 📞 Suporte

Em caso de problemas:

1. Verificar logs do navegador (F12 → Console)
2. Procurar por mensagens `[AUTH]` e `[SECURITY]`
3. Executar verificações manuais SQL
4. Restaurar backup se necessário

## ✅ Checklist Final

- [ ] Migração executada com sucesso
- [ ] Todos os platform admins funcionando
- [ ] Logs de auditoria ativos
- [ ] Roles redundantes removidas (opcional)
- [ ] Sistema mais seguro e auditável