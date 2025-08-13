import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

// Configuração para banco Supabase (remoto)
const supabaseConfig = {
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.myxvxponlmulnjstbjwd',
  password: process.env.SUPABASE_DB_PASSWORD || 'sua_senha_aqui', // Defina a senha via env
  ssl: {
    rejectUnauthorized: false
  }
};

// Configuração para banco local
const localConfig = {
  host: '127.0.0.1',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres'
};

async function applyMigrationDirect(useLocal = true) {
  const config = useLocal ? localConfig : supabaseConfig;
  const client = new Client(config);
  
  console.log('🚀 Conectando ao banco:', useLocal ? 'Local' : 'Supabase Remoto');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  try {
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250813000000_create_privacy_lgpd_module.sql');
    console.log('📁 Lendo migração:', migrationPath);
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('💾 Tamanho da migração:', migrationSQL.length, 'caracteres');
    console.log('───────────────────────────────────');
    
    // Executar a migração completa em uma única transação
    console.log('⏳ Iniciando transação...');
    await client.query('BEGIN');
    
    try {
      console.log('📝 Executando migração completa...');
      await client.query(migrationSQL);
      
      await client.query('COMMIT');
      console.log('✅ Migração aplicada com sucesso!');
      
      // Verificar tabelas criadas
      console.log('\n🔍 Verificando tabelas criadas...');
      await verifyTablesCreated(client);
      
    } catch (migrationError) {
      await client.query('ROLLBACK');
      throw migrationError;
    }
    
  } catch (error) {
    console.error('💥 ERRO na migração:', error.message);
    console.error('📝 Detalhes:', error);
    
    if (error.message.includes('already exists') || 
        error.message.includes('already defined')) {
      console.log('⚠️  As tabelas podem já existir. Verificando...');
      await verifyTablesCreated(client);
    } else {
      throw error;
    }
  } finally {
    await client.end();
    console.log('🔌 Conexão com banco fechada');
  }
}

async function verifyTablesCreated(client) {
  const privacyTables = [
    'data_discovery_sources',
    'data_discovery_results', 
    'data_inventory',
    'legal_bases',
    'consents',
    'processing_activities',
    'dpia_assessments',
    'data_subject_requests',
    'privacy_incidents',
    'anpd_communications',
    'privacy_training',
    'privacy_audits'
  ];
  
  for (const tableName of privacyTables) {
    try {
      const result = await client.query(
        `SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_schema = 'public' 
           AND table_name = $1
         );`,
        [tableName]
      );
      
      if (result.rows[0].exists) {
        console.log(`✅ Tabela ${tableName}: criada com sucesso`);
      } else {
        console.log(`❌ Tabela ${tableName}: não encontrada`);
      }
    } catch (err) {
      console.log(`❌ Tabela ${tableName}: erro de verificação -`, err.message);
    }
  }
}

// Executar a migração
const useLocal = process.argv.includes('--local');
console.log('🎯 Aplicando migração no banco:', useLocal ? 'LOCAL' : 'REMOTO');

if (!useLocal) {
  console.log('⚠️  Para usar banco remoto, defina SUPABASE_DB_PASSWORD no ambiente');
  console.log('💡 Use --local para aplicar no banco local');
}

applyMigrationDirect(useLocal).then(() => {
  console.log('\n🏁 Migração finalizada com sucesso');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro inesperado:', error);
  process.exit(1);
});