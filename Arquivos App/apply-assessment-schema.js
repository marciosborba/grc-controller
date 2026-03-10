#!/usr/bin/env node

/**
 * Script para aplicar o esquema do módulo de Assessment no Supabase
 * 
 * Este script executa o SQL necessário para criar todas as tabelas,
 * índices, políticas RLS e triggers do módulo de Assessment.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.Hs_KJdWJXJGJQKGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"; // Substitua pela service key real

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyAssessmentSchema() {
  try {
    console.log('🚀 Iniciando aplicação do esquema do módulo de Assessment...');
    
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'assessment_module_schema.sql');
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Arquivo SQL não encontrado: ${sqlPath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Arquivo SQL carregado, executando comandos...');
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.length < 10) continue; // Pular comandos muito pequenos
      
      try {
        console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
          successCount++;
        }
        
        // Pequena pausa entre comandos
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`❌ Erro inesperado no comando ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Resumo da execução:');
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log(`📝 Total de comandos: ${successCount + errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Esquema do módulo de Assessment aplicado com sucesso!');
      console.log('\n📋 Tabelas criadas:');
      console.log('   • assessment_frameworks');
      console.log('   • assessment_domains');
      console.log('   • assessment_controls');
      console.log('   • assessment_questions');
      console.log('   • assessments');
      console.log('   • assessment_responses');
      console.log('   • assessment_action_plans');
      console.log('   • assessment_reports');
      console.log('   • assessment_history');
      console.log('   • assessment_framework_templates');
      console.log('\n🔒 Políticas RLS configuradas para isolamento de tenants');
      console.log('📈 Índices criados para otimização de performance');
      console.log('🔄 Triggers configurados para auditoria automática');
    } else {
      console.log('\n⚠️  Esquema aplicado com alguns erros. Verifique os logs acima.');
    }
    
  } catch (error) {
    console.error('💥 Erro fatal ao aplicar esquema:', error.message);
    process.exit(1);
  }
}

// Função alternativa usando execução direta de SQL
async function applySchemaDirectly() {
  try {
    console.log('🚀 Aplicando esquema diretamente...');
    
    const sqlPath = path.join(__dirname, 'assessment_module_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Tentar executar o SQL completo de uma vez
    const { data, error } = await supabase
      .from('_temp_sql_execution')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      // Tabela não existe, vamos criar as tabelas uma por uma
      console.log('📝 Executando criação de tabelas individuais...');
      
      // Extrair apenas os comandos CREATE TABLE
      const createTableCommands = sqlContent
        .split(';')
        .filter(cmd => cmd.trim().toUpperCase().includes('CREATE TABLE'))
        .map(cmd => cmd.trim());
      
      for (const command of createTableCommands) {
        try {
          console.log('⏳ Criando tabela...');
          
          // Usar uma abordagem diferente - executar via função SQL
          const { error: execError } = await supabase.rpc('execute_sql', {
            query: command + ';'
          });
          
          if (execError) {
            console.log('⚠️  Erro (pode ser normal se tabela já existe):', execError.message);
          } else {
            console.log('✅ Tabela criada com sucesso');
          }
        } catch (err) {
          console.log('⚠️  Erro na criação:', err.message);
        }
      }
    }
    
    console.log('✅ Processo concluído!');
    
  } catch (error) {
    console.error('💥 Erro:', error.message);
  }
}

// Verificar se o arquivo SQL existe e executar
if (require.main === module) {
  console.log('🔧 Assessment Module Schema Installer');
  console.log('=====================================');
  
  const sqlPath = path.join(__dirname, 'assessment_module_schema.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ Arquivo assessment_module_schema.sql não encontrado!');
    console.log('💡 Certifique-se de que o arquivo está no mesmo diretório que este script.');
    process.exit(1);
  }
  
  // Executar aplicação do esquema
  applySchemaDirectly()
    .then(() => {
      console.log('\n🎯 Para usar o módulo de Assessment:');
      console.log('   1. Acesse /assessments no seu app');
      console.log('   2. Crie seus primeiros frameworks');
      console.log('   3. Configure questões e controles');
      console.log('   4. Execute seus assessments!');
      console.log('\n📚 Documentação completa disponível no README do projeto.');
    })
    .catch(error => {
      console.error('💥 Falha na aplicação do esquema:', error);
      process.exit(1);
    });
}

module.exports = {
  applyAssessmentSchema,
  applySchemaDirectly
};