#!/usr/bin/env node

/**
 * 🐘 Database Manager - Executor de comandos PostgreSQL
 * 
 * Este script permite executar comandos DDL diretamente no PostgreSQL do Supabase
 * Uso: node database-manager.js [comando] [argumentos]
 * 
 * Exemplos:
 * node database-manager.js add-column tenants settings JSONB '{}'
 * node database-manager.js execute-sql "ALTER TABLE tenants ADD COLUMN test TEXT;"
 * node database-manager.js test-connection
 */

const { Client } = require('pg');
require('dotenv').config();

class DatabaseManager {
  constructor() {
    // Configuração da conexão PostgreSQL
    this.config = {
      host: 'db.myxvxponlmulnjstbjwd.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    };
    
    this.client = null;
  }

  async connect() {
    try {
      this.client = new Client(this.config);
      await this.client.connect();
      console.log('🔗 Conectado ao PostgreSQL do Supabase');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar:', error.message);
      console.error('💡 Verifique se SUPABASE_DB_PASSWORD está configurado no .env');
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
      console.log('🔌 Desconectado do PostgreSQL');
    }
  }

  async executeSQL(sql, description = '') {
    try {
      console.log(`🔧 Executando: ${description || sql}`);
      const result = await this.client.query(sql);
      console.log(`✅ Sucesso: ${result.rowCount || 0} linhas afetadas`);
      return result;
    } catch (error) {
      console.error('❌ Erro SQL:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      const result = await this.client.query('SELECT version();');
      console.log('✅ Conexão OK - PostgreSQL:', result.rows[0].version);
      
      // Testar acesso à tabela tenants
      const tenants = await this.client.query('SELECT COUNT(*) FROM tenants;');
      console.log(`✅ Acesso à tabela tenants OK - ${tenants.rows[0].count} registros`);
      
      return true;
    } catch (error) {
      console.error('❌ Teste de conexão falhou:', error.message);
      return false;
    }
  }

  async addColumn(table, column, type, defaultValue = null) {
    // Verificar se coluna já existe
    const exists = await this.columnExists(table, column);
    if (exists) {
      console.log(`✅ Coluna ${column} já existe na tabela ${table}`);
      return;
    }

    const defaultClause = defaultValue ? ` DEFAULT ${defaultValue}` : '';
    const sql = `ALTER TABLE ${table} ADD COLUMN ${column} ${type}${defaultClause};`;
    
    return this.executeSQL(sql, `Adicionando coluna ${column} à tabela ${table}`);
  }

  async columnExists(tableName, columnName) {
    const sql = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      );
    `;
    const result = await this.client.query(sql, [tableName, columnName]);
    return result.rows[0].exists;
  }

  async createIndex(table, column, indexName = null, indexType = 'BTREE') {
    const name = indexName || `idx_${table}_${column}`;
    const typeClause = indexType === 'GIN' ? ' USING GIN' : '';
    const sql = `CREATE INDEX IF NOT EXISTS ${name} ON ${table}${typeClause} (${column});`;
    
    return this.executeSQL(sql, `Criando índice ${name}`);
  }

  async showTableStructure(tableName) {
    const sql = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;
    
    const result = await this.client.query(sql, [tableName]);
    
    console.log(`📋 Estrutura da tabela ${tableName}:`);
    console.table(result.rows);
    
    return result.rows;
  }

  async backupTable(tableName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupName = `${tableName}_backup_${timestamp}`;
    
    const sql = `CREATE TABLE ${backupName} AS SELECT * FROM ${tableName};`;
    await this.executeSQL(sql, `Criando backup da tabela ${tableName}`);
    
    console.log(`💾 Backup criado: ${backupName}`);
    return backupName;
  }

  // Comandos específicos para o projeto GRC
  async setupTenantSettings() {
    console.log('🏢 Configurando campo settings para tenants...');
    
    try {
      // 1. Adicionar coluna settings se não existir
      await this.addColumn('tenants', 'settings', 'JSONB', "'{}'");
      
      // 2. Criar índice GIN para performance em queries JSON
      await this.createIndex('tenants', 'settings', 'idx_tenants_settings_gin', 'GIN');
      
      // 3. Adicionar comentário
      await this.executeSQL(
        "COMMENT ON COLUMN tenants.settings IS 'Configurações da tenant incluindo dados da empresa';",
        'Adicionando comentário à coluna settings'
      );
      
      console.log('🎉 Campo settings configurado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao configurar settings:', error.message);
      throw error;
    }
  }

  async addCompanyDataToTenant(tenantId, companyData) {
    const settings = { company_data: companyData };
    const sql = 'UPDATE tenants SET settings = $1 WHERE id = $2;';
    
    await this.executeSQL(
      sql,
      `Atualizando dados da empresa para tenant ${tenantId}`
    );
    
    // Usar parâmetros para evitar SQL injection
    await this.client.query(sql, [JSON.stringify(settings), tenantId]);
    
    console.log('✅ Dados da empresa atualizados');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
🐘 Database Manager - Comandos disponíveis:

📋 Informações:
  test-connection              - Testar conexão com o banco
  show-structure <table>       - Mostrar estrutura de uma tabela
  
🔧 Alterações de Schema:
  add-column <table> <column> <type> [default]  - Adicionar coluna
  create-index <table> <column> [name] [type]   - Criar índice
  execute-sql "<sql>"                           - Executar SQL customizado
  
🏢 Comandos Específicos GRC:
  setup-tenant-settings        - Configurar campo settings na tabela tenants
  backup-table <table>         - Criar backup de uma tabela
  
📝 Exemplos:
  node database-manager.js test-connection
  node database-manager.js add-column tenants settings JSONB '{}'
  node database-manager.js setup-tenant-settings
  node database-manager.js show-structure tenants
  
⚠️  Certifique-se de ter SUPABASE_DB_PASSWORD configurado no .env
    `);
    return;
  }

  const db = new DatabaseManager();
  
  try {
    const connected = await db.connect();
    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }

    switch (command) {
      case 'test-connection':
        await db.testConnection();
        break;
        
      case 'add-column':
        const [table, column, type, defaultValue] = args.slice(1);
        if (!table || !column || !type) {
          console.error('❌ Uso: add-column <table> <column> <type> [default]');
          process.exit(1);
        }
        await db.addColumn(table, column, type, defaultValue);
        break;
        
      case 'create-index':
        const [indexTable, indexColumn, indexName, indexType] = args.slice(1);
        if (!indexTable || !indexColumn) {
          console.error('❌ Uso: create-index <table> <column> [name] [type]');
          process.exit(1);
        }
        await db.createIndex(indexTable, indexColumn, indexName, indexType);
        break;
        
      case 'execute-sql':
        const sql = args[1];
        if (!sql) {
          console.error('❌ Uso: execute-sql "<sql>"');
          process.exit(1);
        }
        await db.executeSQL(sql, 'SQL customizado');
        break;
        
      case 'show-structure':
        const tableName = args[1];
        if (!tableName) {
          console.error('❌ Uso: show-structure <table>');
          process.exit(1);
        }
        await db.showTableStructure(tableName);
        break;
        
      case 'setup-tenant-settings':
        await db.setupTenantSettings();
        break;
        
      case 'backup-table':
        const backupTable = args[1];
        if (!backupTable) {
          console.error('❌ Uso: backup-table <table>');
          process.exit(1);
        }
        await db.backupTable(backupTable);
        break;
        
      default:
        console.error(`❌ Comando desconhecido: ${command}`);
        console.log('💡 Use sem argumentos para ver a lista de comandos');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DatabaseManager;