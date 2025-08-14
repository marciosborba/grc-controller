# 🚀 Configuração do Supabase CLI - Concluída!

## ✅ Status da Configuração

### **O que já está funcionando:**
- ✅ Supabase CLI instalado (versão 2.33.9)
- ✅ Projeto linkado corretamente (myxvxponlmulnjstbjwd)
- ✅ Autenticação funcionando
- ✅ Arquivo .env criado
- ✅ Dependências instaladas (pg, dotenv, @types/pg)
- ✅ Script database-manager.cjs pronto para uso
- ✅ .gitignore configurado para proteger credenciais

### **O que precisa ser configurado:**
- ⚠️  Senha do banco PostgreSQL no arquivo .env

---

## 🔐 Como Obter e Configurar a Senha do Banco

### **Passo 1: Acessar o Dashboard do Supabase**
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **"Controller GRC"**

### **Passo 2: Obter a Senha do Banco**
1. No dashboard, vá em **Settings** (⚙️) no menu lateral
2. Clique em **Database**
3. Na seção **"Database password"**, você verá:
   - Se já tem uma senha: use a senha atual
   - Se não lembra: clique em **"Reset database password"**

### **Passo 3: Configurar no .env**
1. Abra o arquivo `.env` no seu editor
2. Substitua `sua_senha_do_banco_aqui` pela senha real:
```bash
SUPABASE_DB_PASSWORD=sua_senha_real_aqui
```

### **Passo 4: Obter as API Keys (opcional, mas recomendado)**
1. No dashboard, vá em **Settings** > **API**
2. Copie as seguintes chaves:
   - **anon public**: para SUPABASE_ANON_KEY
   - **service_role**: para SUPABASE_SERVICE_ROLE_KEY

---

## 🧪 Testando a Configuração

### **Teste 1: Conexão Básica**
```bash
node database-manager.cjs test-connection
```

**Resultado esperado:**
```
🔗 Conectado ao PostgreSQL do Supabase
✅ Conexão OK - PostgreSQL: PostgreSQL 15.x...
✅ Acesso à tabela tenants OK - X registros
🔌 Desconectado do PostgreSQL
```

### **Teste 2: Verificar Estrutura da Tabela Tenants**
```bash
node database-manager.cjs show-structure tenants
```

### **Teste 3: Configurar Campo Settings (se ainda não existir)**
```bash
node database-manager.cjs setup-tenant-settings
```

---

## 🛠️ Comandos Disponíveis

### **Informações:**
```bash
# Ver todos os comandos
node database-manager.cjs

# Testar conexão
node database-manager.cjs test-connection

# Ver estrutura de uma tabela
node database-manager.cjs show-structure tenants
```

### **Alterações de Schema:**
```bash
# Adicionar coluna
node database-manager.cjs add-column tenants nova_coluna TEXT

# Criar índice
node database-manager.cjs create-index tenants settings

# Executar SQL customizado
node database-manager.cjs execute-sql "SELECT COUNT(*) FROM tenants;"
```

### **Comandos Específicos GRC:**
```bash
# Configurar campo settings
node database-manager.cjs setup-tenant-settings

# Fazer backup de tabela
node database-manager.cjs backup-table tenants
```

### **Supabase CLI Nativo:**
```bash
# Listar projetos
supabase projects list

# Ver status do projeto local
supabase status

# Fazer dump do schema
supabase db dump --linked --schema-only

# Fazer dump dos dados
supabase db dump --linked --data-only
```

---

## 📋 Scripts NPM (Adicionar ao package.json)

Adicione estes scripts ao seu `package.json`:

```json
{
  "scripts": {
    "db:test": "node database-manager.cjs test-connection",
    "db:setup": "node database-manager.cjs setup-tenant-settings",
    "db:structure": "node database-manager.cjs show-structure tenants",
    "db:backup": "node database-manager.cjs backup-table tenants",
    "db:dump-schema": "supabase db dump --linked --schema-only",
    "db:dump-data": "supabase db dump --linked --data-only"
  }
}
```

Depois você pode usar:
```bash
npm run db:test
npm run db:setup
npm run db:structure
```

---

## 🔧 Resolução de Problemas

### **Erro: "password authentication failed"**
- ✅ Verifique se a senha no .env está correta
- ✅ Tente resetar a senha no Dashboard
- ✅ Certifique-se de não ter espaços extras na senha

### **Erro: "connection refused"**
- ✅ Verifique sua conexão com a internet
- ✅ Confirme se o projeto está ativo no Supabase

### **Erro: "table doesn't exist"**
- ✅ Verifique se está conectado ao projeto correto
- ✅ Confirme se a tabela existe no Dashboard

### **Erro: "permission denied"**
- ✅ Verifique se está usando a senha correta
- ✅ Confirme se o usuário tem permissões adequadas

---

## 🎯 Próximos Passos

1. **Configure a senha** no arquivo .env
2. **Teste a conexão** com `node database-manager.cjs test-connection`
3. **Configure o campo settings** com `node database-manager.cjs setup-tenant-settings`
4. **Teste o nome fantasia** no sidebar da aplicação
5. **Explore outros comandos** conforme necessário

---

## 🔒 Segurança

### **IMPORTANTE:**
- ❌ **NUNCA** commite o arquivo `.env` com credenciais reais
- ✅ O `.env` já está no `.gitignore`
- ✅ Use senhas fortes para o banco de dados
- ✅ Mantenha as API keys seguras

### **Verificação de Segurança:**
```bash
# Verificar se .env está no .gitignore
grep -n ".env" .gitignore

# Verificar status do git (não deve mostrar .env)
git status
```

---

*Configuração realizada em: Janeiro 2025*  
*Projeto: GRC Controller*  
*Status: ✅ Pronto para uso*