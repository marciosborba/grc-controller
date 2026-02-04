# 📋 INFO.md - Guia Completo do Ambiente de Desenvolvimento

## 🎯 Visão Geral do Projeto

**Projeto**: GRC Controller  
**Localização**: `/home/marciosb/grc/grc-controller`  
**Tipo**: Aplicação React/TypeScript com Supabase  
**Objetivo**: Plataforma de Governança, Riscos e Compliance  

---

## 🌐 Banco de Dados Remoto - Supabase PostgreSQL

### **Informações de Conexão:**
- **Provedor**: Supabase (PostgreSQL na nuvem)
- **Versão**: PostgreSQL 17.4 on aarch64-unknown-linux-gnu
- **Região**: South America (São Paulo)
- **URL**: https://myxvxponlmulnjstbjwd.supabase.co
- **Host**: db.myxvxponlmulnjstbjwd.supabase.co:5432
- **Projeto**: Controller GRC (myxvxponlmulnjstbjwd)
- **Status**: ✅ 100% Configurado e Funcional

### **Credenciais (Configuradas no .env):**
```bash
SUPABASE_URL=https://myxvxponlmulnjstbjwd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=[senha_configurada]
```

### **Estrutura Atual do Banco:**
- **Tabela tenants**: 2 registros ativos
  - `empresa 2` (ID: 37b809d4-1a23-40b9-8ef1-17f24ed4c08b)
  - `GRC-Controller` (ID: 46b1c048-85a1-423b-96fc-776007c8de1f) - COM DADOS DE EMPRESA
- **Campo settings**: ✅ Implementado (JSONB)
- **Nome fantasia**: ✅ "GRC-Controller" ativo no sidebar

---

## 🔐 Configuração Sudo - Acesso Administrativo

### **Status**: ✅ 100% Configurado e Funcional

### **Comandos Liberados (sem senha):**
```bash
# Gerenciamento de pacotes
sudo apt update
sudo apt upgrade  
sudo apt install [pacote]
sudo apt remove [pacote]
sudo apt autoremove
sudo apt autoclean

# Comandos de rede e sistema
sudo netstat [opções]
sudo ss [opções]
sudo lsof [opções]
sudo ps aux
sudo systemctl status [serviço]

# Comandos de arquivo seguros
sudo find [opções]
sudo grep [opções]
sudo cat /var/log/*
sudo tail /var/log/*
```

### **Comandos Protegidos (ainda pedem senha - SEGURO):**
```bash
sudo visudo      # Editar sudoers
sudo passwd      # Alterar senhas
sudo su          # Trocar usuário
sudo rm -rf /    # Comandos destrutivos
```

### **Arquivo de Configuração:**
- **Localização**: `/etc/sudoers.d/dev-commands`
- **Backup**: `/etc/sudoers.backup.*`
- **Reversão**: `./remove-sudo-access.sh`

---

## 🛠️ Scripts e Ferramentas Disponíveis

### **Database Manager (100% Funcional):**
```bash
# Script principal para gerenciar banco remoto
node database-manager.cjs [comando] [argumentos]

# Comandos disponíveis:
node database-manager.cjs test-connection                    # Testar conexão
node database-manager.cjs show-structure tenants           # Ver estrutura
node database-manager.cjs execute-sql "SELECT * FROM tenants;" # SQL customizado
node database-manager.cjs backup-table tenants             # Fazer backup
node database-manager.cjs add-column tenants nova_col TEXT  # Adicionar coluna
```

### **Supabase CLI (Configurado):**
```bash
# CLI v2.33.9 linkado ao projeto remoto
supabase projects list                    # Listar projetos (● Controller GRC)
supabase db dump --linked                # Dump do schema
supabase db dump --linked --data-only    # Dump dos dados
supabase db push                         # Aplicar migrations
```

### **Scripts de Configuração:**
```bash
./configure-sudo-access.sh    # Configurar sudo (já executado)
./remove-sudo-access.sh       # Remover configuração sudo
./test-sudo-config.sh         # Testar configuração sudo
```

---

## 📊 Capacidades Atuais - O que Posso Fazer

### **✅ Sistema Operacional:**
- Atualizar repositórios automaticamente
- Instalar/remover pacotes sem senha
- Fazer upgrade do sistema
- Verificar status de serviços
- Monitorar logs do sistema
- Gerenciar processos

### **✅ Banco de Dados Remoto:**
- Executar comandos SQL no PostgreSQL 17.4
- Alterar estrutura de tabelas (DDL)
- Fazer backup de dados
- Verificar estrutura de tabelas
- Debugging completo do banco
- Gerenciar dados das tenants

### **✅ Desenvolvimento:**
- Gerenciar dependências do projeto
- Executar scripts de manutenção
- Automação de tarefas repetitivas
- Configurar ambiente de desenvolvimento
- Acesso total ao banco de produção

---

## 🎯 Dados Específicos do Projeto

### **Tenants Atuais:**
```javascript
// Mapeamento real das tenants
const TENANT_NAMES = {
  '37b809d4-1a23-40b9-8ef1-17f24ed4c08b': 'empresa 2',
  '46b1c048-85a1-423b-96fc-776007c8de1f': 'GRC-Controller', // ✅ ATIVO
};
```

### **Dados da Empresa GRC-Controller:**
```json
{
  "company_data": {
    "corporate_name": "GRC Controller Ltda",
    "trading_name": "GRC-Controller",
    "tax_id": "12.345.678/0001-90",
    "industry": "tecnologia",
    "size": "media",
    "address": "Rua da Governança, 123",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01234-567",
    "country": "Brasil",
    "description": "Plataforma completa de Governança, Riscos e Compliance para empresas modernas"
  }
}
```

### **AuthContext - Fallback Configurado:**
- ✅ Mapeamento de tenant IDs atualizado
- ✅ Nome fantasia "GRC-Controller" ativo no sidebar
- ✅ Fallback robusto para RLS

---

## 🚀 Comandos Frequentes - Referência Rápida

### **Manutenção do Sistema:**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade

# Instalar dependência
sudo apt install [pacote]

# Verificar serviços
sudo systemctl status nginx
```

### **Gerenciamento do Banco:**
```bash
# Testar conexão
node database-manager.cjs test-connection

# Ver estrutura da tabela principal
node database-manager.cjs show-structure tenants

# Executar SQL customizado
node database-manager.cjs execute-sql "SELECT name, settings FROM tenants;"

# Backup de segurança
node database-manager.cjs backup-table tenants
```

### **Desenvolvimento:**
```bash
# Verificar status do projeto Supabase
supabase projects list

# Gerar tipos TypeScript atualizados
supabase gen types typescript --project-id myxvxponlmulnjstbjwd > src/types/database.types.ts

# Aplicar migrations
supabase db push
```

---

## 🔧 Estrutura de Arquivos Importantes

### **Configuração:**
```
.env                           # Credenciais (protegido no .gitignore)
.env.example                   # Template de configuração
supabase/config.toml          # Configuração do Supabase CLI
```

### **Scripts:**
```
database-manager.cjs          # Script principal de banco
configure-sudo-access.sh      # Configuração sudo
remove-sudo-access.sh         # Remoção sudo
test-sudo-config.sh          # Teste sudo
```

### **Documentação:**
```
info.md                       # Este arquivo (guia completo)
Banco_Dados.md               # Lições aprendidas sobre banco
CONFIGURACAO_SUPABASE_CLI.md # Guia do Supabase CLI
PostgreSQL_CLI_Access.md     # Documentação técnica
status-configuracao-final.md # Status da configuração
```

---

## 🔒 Segurança e Boas Práticas

### **Credenciais Protegidas:**
- ✅ `.env` no `.gitignore`
- ✅ Senhas não commitadas
- ✅ Service role key segura
- ✅ Backup do sudoers original

### **Acesso Controlado:**
- ✅ Sudo apenas para comandos específicos
- ✅ Comandos críticos protegidos
- ✅ Configuração auditável
- ✅ Reversão fácil

### **Banco de Dados:**
- ✅ Conexão SSL
- ✅ Credenciais via variáveis de ambiente
- ✅ RLS (Row Level Security) ativo
- ✅ Backup automático disponível

---

## 🎯 Limitações Conhecidas

### **NPM Global:**
- ⚠️ NPM via NVM não configurado no sudo
- 💡 Solução: Usar npm local ou configurar caminhos específicos

### **Supabase CLI:**
- ⚠️ Versão atual: v2.33.9 (v2.34.3 disponível)
- 💡 Atualização via repositório oficial quando necessário

### **Comandos de Sistema:**
- ⚠️ Alguns comandos systemctl específicos podem precisar de configuração adicional
- 💡 Adicionar conforme necessário no sudoers

---

## 🔄 Histórico de Configuração

### **2025-01-14 - Configuração Completa:**
- ✅ **Conexão PostgreSQL**: Estabelecida com banco remoto
- ✅ **Campo settings**: Adicionado via Dashboard (JSONB)
- ✅ **Dados de empresa**: Configurados para "GRC-Controller"
- ✅ **Nome fantasia**: Ativo no sidebar
- ✅ **Acesso DDL**: Scripts 100% funcionais
- ✅ **Supabase CLI**: v2.33.9 linkado ao projeto
- ✅ **Sudo access**: Configurado para comandos específicos
- ✅ **Documentação**: Completa e atualizada

---

## 🚀 Como Trabalhar com Este Ambiente

### **Para Tarefas de Sistema:**
1. Use `sudo` normalmente para comandos liberados
2. Comandos críticos ainda pedirão senha (seguro)
3. Instale dependências conforme necessário

### **Para Banco de Dados:**
1. Use `database-manager.cjs` para operações DDL
2. Teste sempre com `test-connection` primeiro
3. Faça backup antes de alterações importantes
4. Use `show-structure` para verificar mudanças

### **Para Desenvolvimento:**
1. Mantenha `.env` atualizado mas nunca commite
2. Use Supabase CLI para migrations
3. Gere tipos TypeScript quando necessário
4. Documente mudanças importantes

### **Para Manutenção:**
1. Execute `sudo apt update` regularmente
2. Monitore logs com `sudo tail /var/log/*`
3. Verifique status de serviços conforme necessário
4. Mantenha backups atualizados

---

## 📞 Troubleshooting

### **Se Sudo Parar de Funcionar:**
```bash
# Verificar configuração
sudo visudo -c -f /etc/sudoers.d/dev-commands

# Restaurar backup se necessário
sudo cp /etc/sudoers.backup.* /etc/sudoers

# Remover configuração
./remove-sudo-access.sh
```

### **Se Banco Não Conectar:**
```bash
# Verificar credenciais
node database-manager.cjs test-connection

# Verificar .env
grep SUPABASE .env

# Testar conexão manual
psql "postgresql://postgres:[PASSWORD]@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres"
```

### **Se Supabase CLI Não Funcionar:**
```bash
# Verificar status
supabase projects list

# Verificar linkagem
supabase status

# Re-linkar se necessário
supabase link --project-ref myxvxponlmulnjstbjwd
```

---

## 🎉 Status Final

### **✅ 100% Configurado e Operacional:**
- **Sistema Ubuntu**: Acesso sudo controlado
- **PostgreSQL Remoto**: Acesso total via scripts
- **Supabase CLI**: Linkado e funcional
- **Desenvolvimento**: Ambiente completo
- **Segurança**: Mantida e auditável
- **Documentação**: Completa e atualizada

### **🚀 Pronto para:**
- Desenvolvimento eficiente
- Manutenção automatizada
- Gerenciamento de banco
- Automação de tarefas
- Trabalho colaborativo

---

*Documento criado em: 14 Janeiro 2025*  
*Última atualização: 14 Janeiro 2025*  
*Ambiente: Ubuntu 25.04 + Supabase PostgreSQL Remoto*  
*Status: 100% Configurado e Funcional*  

**Este arquivo serve como referência completa para trabalhar eficientemente neste ambiente de desenvolvimento.**