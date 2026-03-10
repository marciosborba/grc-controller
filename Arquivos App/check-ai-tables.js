#!/usr/bin/env node

/**
 * Script para verificar tabelas de IA e seus dados no banco Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são necessárias');
  console.error('Disponíveis:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verificando tabelas de IA no banco de dados Supabase...\n');

// Lista de tabelas relacionadas a IA/prompts para verificar
const aiTables = [
  'ai_grc_providers',
  'ai_grc_prompt_templates', 
  'ai_module_prompts',
  'ai_configurations',
  'ai_usage_logs',
  'ai_workflows',
  'ai_conversation_contexts',
  'mcp_providers',
  'integrations'
];

async function checkTable(tableName) {
  try {
    console.log(`📋 Verificando tabela: ${tableName}`);
    
    // Tentar fazer uma consulta simples para ver se a tabela existe
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.log(`❌ Tabela ${tableName}: ${error.message}`);
      return { table: tableName, exists: false, count: 0, error: error.message };
    } else {
      console.log(`✅ Tabela ${tableName}: ${count || 0} registros`);
      if (data && data.length > 0) {
        console.log(`   📄 Primeiros registros:`, JSON.stringify(data.slice(0, 2), null, 2));
      }
      return { table: tableName, exists: true, count: count || 0, data: data?.slice(0, 2) };
    }
  } catch (error) {
    console.log(`💥 Erro ao verificar tabela ${tableName}:`, error.message);
    return { table: tableName, exists: false, count: 0, error: error.message };
  }
}

async function main() {
  const results = [];
  
  for (const table of aiTables) {
    const result = await checkTable(table);
    results.push(result);
    console.log(''); // Linha em branco entre tabelas
  }
  
  console.log('📊 RESUMO DOS RESULTADOS:');
  console.log('========================');
  
  const existingTables = results.filter(r => r.exists);
  const tablesWithData = results.filter(r => r.exists && r.count > 0);
  
  console.log(`✅ Tabelas que existem: ${existingTables.length}/${aiTables.length}`);
  console.log(`📄 Tabelas com dados: ${tablesWithData.length}/${aiTables.length}`);
  
  if (tablesWithData.length > 0) {
    console.log('\n📄 TABELAS COM DADOS:');
    tablesWithData.forEach(table => {
      console.log(`   • ${table.table}: ${table.count} registros`);
    });
  }
  
  const tablesWithoutData = existingTables.filter(r => r.count === 0);
  if (tablesWithoutData.length > 0) {
    console.log('\n📭 TABELAS VAZIAS:');
    tablesWithoutData.forEach(table => {
      console.log(`   • ${table.table}`);
    });
  }
  
  const missingTables = results.filter(r => !r.exists);
  if (missingTables.length > 0) {
    console.log('\n❌ TABELAS QUE NÃO EXISTEM:');
    missingTables.forEach(table => {
      console.log(`   • ${table.table}: ${table.error}`);
    });
  }
  
  // Se há prompts, mostrar onde estão
  const promptTables = tablesWithData.filter(t => 
    t.table.includes('prompt') && t.count > 0
  );
  
  if (promptTables.length > 0) {
    console.log('\n🎯 PROMPTS ENCONTRADOS:');
    promptTables.forEach(table => {
      console.log(`   📝 ${table.table}: ${table.count} prompts`);
    });
  } else {
    console.log('\n⚠️  Nenhuma tabela com prompts encontrada com dados');
  }
}

main().catch(console.error);