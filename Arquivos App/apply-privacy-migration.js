import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPrivacyMigration() {
  console.log('🚀 Iniciando aplicação da migração do módulo de Privacidade/LGPD...');
  console.log('═══════════════════════════════════════════════════════════════════');
  
  try {
    // Ler o arquivo de migração
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250813000000_create_privacy_lgpd_module.sql');
    console.log('📁 Lendo migração:', migrationPath);
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('💾 Tamanho da migração:', migrationSQL.length, 'caracteres');
    console.log('───────────────────────────────────');
    
    // Dividir o SQL em comandos individuais para executar
    // Remove comentários e linhas vazias
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));
    
    console.log('📋 Total de comandos SQL:', sqlCommands.length);
    console.log('───────────────────────────────────');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Executar cada comando individualmente
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      if (command.trim().length === 0) continue;
      
      console.log(`\n⏳ Executando comando ${i + 1}/${sqlCommands.length}:`);
      console.log('🔍 SQL:', command.substring(0, 100) + (command.length > 100 ? '...' : ''));
      
      try {
        const { data, error } = await supabase.rpc('exec', { sql: command });
        
        if (error) {
          console.error('❌ Erro no comando:', error.message);
          console.error('📝 SQL que falhou:', command.substring(0, 200));
          errorCount++;
          
          // Se for erro crítico (tabela já existe), podemos continuar
          if (!error.message.includes('already exists') && 
              !error.message.includes('already defined') &&
              !error.message.includes('duplicate')) {
            throw error;
          } else {
            console.log('⚠️  Aviso: Comando ignorado (recurso já existe)');
          }
        } else {
          console.log('✅ Comando executado com sucesso');
          successCount++;
        }
        
        // Pequeno delay para não sobrecarregar o banco
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error('💥 Erro fatal:', err.message);
        console.error('📝 SQL que causou o erro:', command);
        errorCount++;
        
        // Para erros realmente críticos, paramos
        if (!err.message.includes('already exists') && 
            !err.message.includes('already defined')) {
          break;
        }
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA MIGRAÇÃO:');
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log(`📋 Total de comandos processados: ${successCount + errorCount}`);
    
    if (errorCount === 0) {
      console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('🔧 Todas as tabelas do módulo de Privacidade/LGPD foram criadas');
    } else {
      console.log('⚠️  Migração concluída com avisos. Verifique os erros acima.');
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    await verifyTablesCreated();
    
  } catch (error) {
    console.error('💥 ERRO FATAL NA MIGRAÇÃO:', error);
    process.exit(1);
  }
}

async function verifyTablesCreated() {
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
      const { data, error } = await supabase
        .from(tableName)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Tabela ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Tabela ${tableName}: criada com sucesso`);
      }
    } catch (err) {
      console.log(`❌ Tabela ${tableName}: erro de verificação`);
    }
  }
}

// Executar a migração
applyPrivacyMigration().then(() => {
  console.log('\n🏁 Script de migração finalizado');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro inesperado:', error);
  process.exit(1);
});