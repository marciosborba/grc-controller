# 🐘 Acesso PostgreSQL via CLI - Guia Completo

## 🎯 Objetivo

Este guia explica como configurar acesso direto ao PostgreSQL do Supabase via CLI, permitindo execução automática de comandos DDL (ALTER TABLE, CREATE TABLE, etc.) através de scripts.

---

## 🔧 Métodos de Acesso ao PostgreSQL

### 1. **Supabase CLI** (Recomendado)

#### **Instalação**
```bash
# Via npm (global)
npm install -g supabase

# Via Homebrew (macOS)
brew install supabase/tap/supabase

# Via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### **Configuração do Projeto**
```bash
# 1. Inicializar Supabase no projeto (se ainda não foi feito)
supabase init

# 2. Conectar ao projeto remoto
supabase link --project-ref myxvxponlmulnjstbjwd

# 3. Fazer login (se necessário)
supabase login
```

#### **Comandos Úteis**
```bash
# Executar SQL diretamente
supabase db sql --file migration.sql

# Aplicar migrations
supabase db push

# Reset do banco (cuidado!)
supabase db reset

# Gerar tipos TypeScript
supabase gen types typescript --project-id myxvxponlmulnjstbjwd > src/types/database.types.ts
```

### 2. **PostgreSQL Client Direto** (psql)

#### **Obter String de Conexão**
```bash
# Via Supabase CLI
supabase db url --project-ref myxvxponlmulnjstbjwd

# Ou no Dashboard: Settings > Database > Connection string
```

#### **Conectar via psql**
```bash
# Formato da conexão
psql "postgresql://postgres:[PASSWORD]@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres"

# Exemplo com variáveis de ambiente
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres"
psql $SUPABASE_DB_URL
```

### 3. **Node.js com pg (PostgreSQL driver)**

#### **Instalação**
```bash
npm install pg @types/pg
```

#### **Configuração**
```javascript
// db-direct.js
const { Client } = require('pg');

const client = new Client({
  host: 'db.myxvxponlmulnjstbjwd.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD, // Senha do banco
  ssl: { rejectUnauthorized: false }
});

async function executeDDL(sql) {
  try {
    await client.connect();
    const result = await client.query(sql);
    console.log('✅ SQL executado com sucesso:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Exemplo de uso
executeDDL('ALTER TABLE tenants ADD COLUMN IF NOT EXISTS new_field TEXT;');
```

---

## 🔐 Configuração de Credenciais

### **Método 1: Variáveis de Ambiente**
```bash
# .env (adicionar ao .gitignore!)
SUPABASE_URL=https://myxvxponlmulnjstbjwd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=sua_senha_do_banco_aqui

# Para usar no terminal
export SUPABASE_DB_PASSWORD="sua_senha_aqui"
```

### **Método 2: Arquivo de Configuração**
```javascript
// config/database.js
module.exports = {
  development: {
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  }
};
```

### **Método 3: Supabase CLI Config**
```bash
# Configurar projeto
supabase projects list
supabase link --project-ref myxvxponlmulnjstbjwd

# O CLI salva as configurações em ~/.supabase/
```

---

## 🛠️ Scripts Automatizados para DDL

### **Script 1: Executor de SQL Genérico**
```javascript
// scripts/execute-sql.js
const { Client } = require('pg');
require('dotenv').config();

class DatabaseManager {
  constructor() {
    this.client = new Client({
      host: 'db.myxvxponlmulnjstbjwd.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    });
  }

  async connect() {
    await this.client.connect();
    console.log('🔗 Conectado ao PostgreSQL');
  }

  async disconnect() {
    await this.client.end();
    console.log('🔌 Desconectado do PostgreSQL');
  }

  async executeSQL(sql, description = '') {
    try {
      console.log(`🔧 Executando: ${description || sql}`);
      const result = await this.client.query(sql);
      console.log('✅ Sucesso:', result.rowCount, 'linhas afetadas');
      return result;
    } catch (error) {
      console.error('❌ Erro:', error.message);
      throw error;
    }
  }

  async addColumn(table, column, type, defaultValue = null) {
    const sql = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}${defaultValue ? ` DEFAULT ${defaultValue}` : ''};`;
    return this.executeSQL(sql, `Adicionando coluna ${column} à tabela ${table}`);
  }

  async createIndex(table, column, indexName = null) {
    const name = indexName || `idx_${table}_${column}`;
    const sql = `CREATE INDEX IF NOT EXISTS ${name} ON ${table} (${column});`;
    return this.executeSQL(sql, `Criando índice ${name}`);
  }

  async tableExists(tableName) {
    const sql = `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${tableName}');`;
    const result = await this.executeSQL(sql, `Verificando se tabela ${tableName} existe`);
    return result.rows[0].exists;
  }

  async columnExists(tableName, columnName) {
    const sql = `SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = '${tableName}' AND column_name = '${columnName}');`;
    const result = await this.executeSQL(sql, `Verificando se coluna ${columnName} existe`);
    return result.rows[0].exists;
  }
}

// Exemplo de uso
async function main() {
  const db = new DatabaseManager();
  
  try {
    await db.connect();
    
    // Verificar se coluna existe antes de adicionar
    const hasSettings = await db.columnExists('tenants', 'settings');
    if (!hasSettings) {
      await db.addColumn('tenants', 'settings', 'JSONB', "'{}'");
      await db.createIndex('tenants', 'settings', 'idx_tenants_settings_gin');
    } else {
      console.log('✅ Coluna settings já existe');
    }
    
  } finally {
    await db.disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseManager;
```

### **Script 2: Migrations Automáticas**
```javascript
// scripts/run-migrations.js
const DatabaseManager = require('./execute-sql');
const fs = require('fs');
const path = require('path');

class MigrationRunner {
  constructor() {
    this.db = new DatabaseManager();
    this.migrationsDir = path.join(__dirname, '../supabase/migrations');
  }

  async runMigration(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`🚀 Executando migration: ${fileName}`);
    await this.db.executeSQL(sql, `Migration: ${fileName}`);
  }

  async runAllMigrations() {
    await this.db.connect();
    
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of files) {
        const filePath = path.join(this.migrationsDir, file);
        await this.runMigration(filePath);
      }
      
      console.log('🎉 Todas as migrations executadas com sucesso!');
    } finally {
      await this.db.disconnect();
    }
  }
}

// Uso
const runner = new MigrationRunner();
runner.runAllMigrations().catch(console.error);
```

### **Script 3: Comandos Específicos**
```javascript
// scripts/database-commands.js
const DatabaseManager = require('./execute-sql');

const commands = {
  async addSettingsColumn() {
    const db = new DatabaseManager();
    await db.connect();
    
    try {
      await db.addColumn('tenants', 'settings', 'JSONB', "'{}'");
      console.log('✅ Campo settings adicionado');
    } finally {
      await db.disconnect();
    }
  },

  async createTenantIndexes() {
    const db = new DatabaseManager();
    await db.connect();
    
    try {
      await db.createIndex('tenants', 'slug', 'idx_tenants_slug_unique');
      await db.executeSQL('CREATE INDEX IF NOT EXISTS idx_tenants_settings_gin ON tenants USING GIN (settings);');
      console.log('✅ Índices criados');
    } finally {
      await db.disconnect();
    }
  },

  async updateTenantSettings(tenantId, settings) {
    const db = new DatabaseManager();
    await db.connect();
    
    try {
      const sql = 'UPDATE tenants SET settings = $1 WHERE id = $2';
      await db.client.query(sql, [JSON.stringify(settings), tenantId]);
      console.log('✅ Settings atualizadas');
    } finally {
      await db.disconnect();
    }
  }
};

// Exportar comandos
module.exports = commands;

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  if (commands[command]) {
    commands[command](...process.argv.slice(3)).catch(console.error);
  } else {
    console.log('Comandos disponíveis:', Object.keys(commands));
  }
}
```

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "db:connect": "psql $SUPABASE_DB_URL",
    "db:execute": "node scripts/execute-sql.js",
    "db:migrate": "node scripts/run-migrations.js",
    "db:add-settings": "node scripts/database-commands.js addSettingsColumn",
    "db:create-indexes": "node scripts/database-commands.js createTenantIndexes",
    "db:status": "supabase db status",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --project-id myxvxponlmulnjstbjwd > src/types/database.types.ts"
  }
}
```

---

## 🔒 Segurança e Boas Práticas

### **1. Proteção de Credenciais**
```bash
# .env (NUNCA commitar!)
SUPABASE_DB_PASSWORD=sua_senha_super_secreta

# .gitignore
.env
.env.local
.env.production
config/database.json
```

### **2. Validação Antes de Executar**
```javascript
// Sempre validar antes de executar DDL
async function safeExecute(sql, description) {
  // Verificar se é ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DDL não permitido em produção via script');
  }
  
  // Confirmar ação
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    rl.question(`Executar: ${description}? (y/N) `, (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y') {
        resolve(true);
      } else {
        reject(new Error('Operação cancelada pelo usuário'));
      }
    });
  });
}
```

### **3. Backup Antes de Alterações**
```javascript
async function backupTable(tableName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${tableName}_backup_${timestamp}`;
  
  const sql = `CREATE TABLE ${backupName} AS SELECT * FROM ${tableName};`;
  await db.executeSQL(sql, `Backup da tabela ${tableName}`);
  
  console.log(`💾 Backup criado: ${backupName}`);
}
```

---

## 🚀 Exemplo de Uso Completo

```javascript
// scripts/setup-tenant-settings.js
const DatabaseManager = require('./execute-sql');

async function setupTenantSettings() {
  const db = new DatabaseManager();
  
  try {
    await db.connect();
    
    // 1. Verificar se coluna existe
    const hasSettings = await db.columnExists('tenants', 'settings');
    
    if (!hasSettings) {
      console.log('🔧 Adicionando campo settings...');
      await db.addColumn('tenants', 'settings', 'JSONB', "'{}'");
      
      // 2. Criar índice para performance
      await db.executeSQL(
        'CREATE INDEX idx_tenants_settings_gin ON tenants USING GIN (settings);',
        'Criando índice GIN para settings'
      );
      
      // 3. Adicionar comentário
      await db.executeSQL(
        "COMMENT ON COLUMN tenants.settings IS 'Configurações da tenant incluindo dados da empresa';",
        'Adicionando comentário à coluna'
      );
      
      console.log('✅ Campo settings configurado com sucesso!');
    } else {
      console.log('✅ Campo settings já existe');
    }
    
    // 4. Atualizar tenant específica com dados de exemplo
    const grcTenantId = '46b1c048-85a1-423b-96fc-776007c8de1f';
    const companyData = {
      company_data: {
        corporate_name: 'GRC Controller Ltda',
        trading_name: 'GRC-Controller',
        tax_id: '12.345.678/0001-90'
      }
    };
    
    await db.executeSQL(
      'UPDATE tenants SET settings = $1 WHERE id = $2',
      'Atualizando dados da empresa'
    );
    
    console.log('🎉 Configuração completa!');
    
  } finally {
    await db.disconnect();
  }
}

// Executar
setupTenantSettings().catch(console.error);
```

---

## 📋 Checklist de Configuração

### **Para Configurar Acesso PostgreSQL:**

- [ ] Instalar Supabase CLI ou PostgreSQL client
- [ ] Obter credenciais do banco (Dashboard > Settings > Database)
- [ ] Configurar variáveis de ambiente
- [ ] Testar conexão básica
- [ ] Criar scripts de automação
- [ ] Configurar backup automático
- [ ] Testar em ambiente de desenvolvimento
- [ ] Documentar comandos no package.json

### **Para Uso Seguro:**

- [ ] Nunca commitar credenciais
- [ ] Validar ambiente antes de executar DDL
- [ ] Fazer backup antes de alterações importantes
- [ ] Testar scripts em ambiente local primeiro
- [ ] Usar transações para operações complexas
- [ ] Monitorar logs de execução

---

## 🎯 Comandos de Teste

```bash
# Testar conexão
npm run db:status

# Executar migration específica
node scripts/execute-sql.js

# Adicionar campo settings
npm run db:add-settings

# Gerar tipos TypeScript atualizados
npm run db:types
```

---

*Documento criado em: Janeiro 2025*  
*Projeto: GRC Controller*  
*Objetivo: Automatizar alterações de schema via CLI*