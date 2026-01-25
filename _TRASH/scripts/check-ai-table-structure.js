#!/usr/bin/env node

/**
 * Script para verificar a estrutura da tabela ai_grc_prompt_templates
 */

import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura das tabelas de IA...\n');

  try {
    // Tentar listar todas as tabelas que começam com 'ai'
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names') // Esta function talvez não exista
      .then(null, () => null);

    // Tentar uma consulta simples para ver se a tabela existe
    const { data: testQuery, error: testError } = await supabase
      .from('ai_grc_prompt_templates')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Erro ao acessar ai_grc_prompt_templates:', testError);
      
      // Tentar outras tabelas de IA
      const possibleTables = [
        'ai_prompt_templates',
        'prompt_templates',
        'ai_templates',
        'grc_ai_prompts',
        'ai_grc_prompts'
      ];

      for (const tableName of possibleTables) {
        const { data: altTest, error: altError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (altError) {
          console.log(`❌ ${tableName}: ${altError.message}`);
        } else {
          console.log(`✅ ${tableName}: encontrada!`, Object.keys(altTest[0] || {}));
        }
      }
      
      return false;
    }

    console.log('✅ ai_grc_prompt_templates encontrada!');
    
    if (testQuery && testQuery.length > 0) {
      console.log('📋 Campos disponíveis:', Object.keys(testQuery[0]));
      console.log('🎯 Exemplo de dados:', testQuery[0]);
    } else {
      console.log('📋 Tabela vazia, tentando inserir dados de teste...');
      
      // Tentar inserir um registro simples para descobrir a estrutura
      const { data: insertTest, error: insertError } = await supabase
        .from('ai_grc_prompt_templates')
        .insert({
          name: 'test',
          description: 'test',
          category: 'test'
        })
        .select();

      if (insertError) {
        console.error('❌ Erro no teste de inserção:', insertError);
      } else {
        console.log('✅ Estrutura descoberta através de inserção:', Object.keys(insertTest[0]));
        
        // Limpar o registro de teste
        await supabase
          .from('ai_grc_prompt_templates')
          .delete()
          .eq('name', 'test');
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Verificação de Estrutura de Tabelas IA');
  console.log('=====================================\n');

  await checkTableStructure();
}

main().catch(console.error);