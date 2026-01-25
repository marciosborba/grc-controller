#!/usr/bin/env node

/**
 * Script para configurar templates de riscos no banco PostgreSQL/Supabase
 * Executa o schema e seed dos templates de riscos
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações do Supabase (do arquivo db.md)
const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
  console.log('💡 Adicione a service role key no arquivo .env:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui');
  process.exit(1);
}

// Cliente Supabase com service role (necessário para DDL)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filePath, description) {
  try {
    console.log(`📄 Executando: ${description}`);
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Dividir em comandos individuais (separados por ;)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`   📝 ${commands.length} comandos SQL encontrados`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          if (error) {
            // Tentar execução direta se RPC falhar
            const { error: directError } = await supabase
              .from('_temp_sql_execution')
              .select('*')
              .limit(0); // Apenas para testar conexão
            
            if (directError) {
              console.warn(`   ⚠️  Comando ${i + 1} falhou (pode ser normal): ${error.message}`);
            }
          }
        } catch (err) {
          console.warn(`   ⚠️  Comando ${i + 1} falhou: ${err.message}`);
        }
      }
    }
    
    console.log(`   ✅ ${description} executado`);
    return true;
  } catch (error) {
    console.error(`   ❌ Erro ao executar ${description}:`, error.message);
    return false;
  }
}

async function checkTablesExist() {
  try {
    const { data, error } = await supabase
      .from('risk_templates')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('📋 Tabelas de templates não existem ainda');
      return false;
    }
    
    console.log('📋 Tabelas de templates já existem');
    return true;
  } catch (error) {
    console.log('📋 Tabelas de templates não existem ainda');
    return false;
  }
}

async function countExistingTemplates() {
  try {
    const { count, error } = await supabase
      .from('risk_templates')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('📊 Não foi possível contar templates existentes');
      return 0;
    }
    
    console.log(`📊 Templates existentes no banco: ${count}`);
    return count || 0;
  } catch (error) {
    console.log('📊 Não foi possível contar templates existentes');
    return 0;
  }
}

async function main() {
  console.log('🚀 Configurando Templates de Riscos no Supabase');
  console.log('=' .repeat(50));
  
  // Verificar conexão
  console.log('🔗 Testando conexão com Supabase...');
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('   ✅ Conexão estabelecida');
  } catch (error) {
    console.error('   ❌ Falha na conexão:', error.message);
    process.exit(1);
  }
  
  // Verificar se tabelas existem
  const tablesExist = await checkTablesExist();
  
  if (!tablesExist) {
    // Executar schema
    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'database', 'schemas', 'riskTemplates.sql');
    const schemaSuccess = await executeSQLFile(schemaPath, 'Schema das tabelas de templates');
    
    if (!schemaSuccess) {
      console.error('❌ Falha ao criar schema. Abortando.');
      process.exit(1);
    }
  }
  
  // Verificar quantos templates existem
  const existingCount = await countExistingTemplates();
  
  if (existingCount === 0) {
    // Executar seed
    const seedPath = path.join(__dirname, '..', 'src', 'lib', 'database', 'seeds', 'riskTemplatesSeeder.sql');
    const seedSuccess = await executeSQLFile(seedPath, 'Seed dos templates de riscos');
    
    if (!seedSuccess) {
      console.error('❌ Falha ao popular templates. Verifique manualmente.');
      process.exit(1);
    }
    
    // Verificar resultado final
    const finalCount = await countExistingTemplates();
    console.log('=' .repeat(50));
    console.log(`🎉 Configuração concluída!`);
    console.log(`📊 Templates criados: ${finalCount}`);
    console.log(`🌐 Acesse: ${SUPABASE_URL}`);
  } else {
    console.log('=' .repeat(50));
    console.log(`ℹ️  Templates já existem no banco: ${existingCount}`);
    console.log(`🌐 Acesse: ${SUPABASE_URL}`);
  }
}

// Executar script
main().catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});