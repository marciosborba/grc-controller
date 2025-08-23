#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAllTemplateFields() {
  console.log('🧪 TESTANDO TODOS OS CAMPOS DA TABELA');
  console.log('====================================');
  
  try {
    const templateId = 'e20d72be-b98d-464f-a94a-bd6e2385f765';
    
    // 1. Buscar template atual
    console.log('\n1. 📋 TEMPLATE ATUAL:');
    const { data: currentTemplate, error: getCurrentError } = await supabase
      .from('ai_grc_prompt_templates')
      .select('*')
      .eq('id', templateId)
      .single();
      
    if (getCurrentError) {
      console.log('❌ Erro ao buscar template:', getCurrentError);
      return;
    }
    
    console.log('✅ Template encontrado:', currentTemplate.name);
    console.log('📊 Campos atuais:');
    Object.keys(currentTemplate).forEach(key => {
      console.log(`   ${key}: ${typeof currentTemplate[key]} = ${JSON.stringify(currentTemplate[key]).substring(0, 100)}...`);
    });
    
    // 2. Testar campos básicos
    console.log('\n2. 🧪 TESTANDO CAMPOS BÁSICOS:');
    
    const basicFields = {
      name: 'TESTE - Nome Alterado',
      title: 'TESTE - Título Alterado',
      description: 'TESTE - Descrição alterada para verificar se salva',
      use_case: 'TESTE - Caso de uso alterado',
      category: 'compliance-check', // Diferente do atual
      version: '2.0', // Diferente do atual
    };
    
    for (const [field, value] of Object.entries(basicFields)) {
      console.log(`\n   Testando campo: ${field}`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('ai_grc_prompt_templates')
        .update({ [field]: value })
        .eq('id', templateId)
        .select(`id, ${field}`);
        
      if (updateError) {
        console.log(`   ❌ Erro ao atualizar ${field}:`, updateError);
      } else {
        console.log(`   ✅ Update ${field} executado:`, updateResult);
        
        // Verificar se foi salvo
        const { data: verifyResult, error: verifyError } = await supabase
          .from('ai_grc_prompt_templates')
          .select(field)
          .eq('id', templateId)
          .single();
          
        if (verifyError) {
          console.log(`   ❌ Erro ao verificar ${field}:`, verifyError);
        } else {
          const savedValue = verifyResult[field];
          if (savedValue === value) {
            console.log(`   ✅ ${field} SALVO CORRETAMENTE: ${savedValue}`);
          } else {
            console.log(`   ❌ ${field} NÃO SALVO:`);
            console.log(`      Esperado: ${value}`);
            console.log(`      Atual: ${savedValue}`);
          }
        }
      }
    }
    
    // 3. Testar campos numéricos
    console.log('\n3. 🔢 TESTANDO CAMPOS NUMÉRICOS:');
    
    const numericFields = {
      min_context_window: 8000,
      max_output_tokens: 4000,
      recommended_temperature: 0.7,
      quality_score: 8.5,
      usage_count: 100,
      success_rate: 95.5,
      avg_quality_rating: 4.2
    };
    
    for (const [field, value] of Object.entries(numericFields)) {
      console.log(`\n   Testando campo numérico: ${field}`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('ai_grc_prompt_templates')
        .update({ [field]: value })
        .eq('id', templateId)
        .select(`id, ${field}`);
        
      if (updateError) {
        console.log(`   ❌ Erro ao atualizar ${field}:`, updateError);
      } else {
        // Verificar se foi salvo
        const { data: verifyResult, error: verifyError } = await supabase
          .from('ai_grc_prompt_templates')
          .select(field)
          .eq('id', templateId)
          .single();
          
        if (verifyError) {
          console.log(`   ❌ Erro ao verificar ${field}:`, verifyError);
        } else {
          const savedValue = verifyResult[field];
          if (savedValue == value) { // == para comparação numérica flexível
            console.log(`   ✅ ${field} SALVO CORRETAMENTE: ${savedValue}`);
          } else {
            console.log(`   ❌ ${field} NÃO SALVO:`);
            console.log(`      Esperado: ${value} (${typeof value})`);
            console.log(`      Atual: ${savedValue} (${typeof savedValue})`);
          }
        }
      }
    }
    
    // 4. Testar arrays
    console.log('\n4. 📋 TESTANDO CAMPOS ARRAY:');
    
    const arrayFields = {
      applicable_frameworks: ['ISO 31000:2018', 'COSO ERM 2017', 'TESTE'],
      compliance_domains: ['Gestão de Riscos', 'TESTE'],
      risk_categories: ['Estratégicos', 'Operacionais', 'TESTE'],
      maturity_levels: ['Inicial', 'Básico', 'TESTE']
    };
    
    for (const [field, value] of Object.entries(arrayFields)) {
      console.log(`\n   Testando array: ${field}`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('ai_grc_prompt_templates')
        .update({ [field]: value })
        .eq('id', templateId)
        .select(`id, ${field}`);
        
      if (updateError) {
        console.log(`   ❌ Erro ao atualizar ${field}:`, updateError);
      } else {
        // Verificar se foi salvo
        const { data: verifyResult, error: verifyError } = await supabase
          .from('ai_grc_prompt_templates')
          .select(field)
          .eq('id', templateId)
          .single();
          
        if (verifyError) {
          console.log(`   ❌ Erro ao verificar ${field}:`, verifyError);
        } else {
          const savedValue = verifyResult[field];
          if (JSON.stringify(savedValue) === JSON.stringify(value)) {
            console.log(`   ✅ ${field} SALVO CORRETAMENTE: ${JSON.stringify(savedValue)}`);
          } else {
            console.log(`   ❌ ${field} NÃO SALVO:`);
            console.log(`      Esperado: ${JSON.stringify(value)}`);
            console.log(`      Atual: ${JSON.stringify(savedValue)}`);
          }
        }
      }
    }
    
    // 5. Testar JSON
    console.log('\n5. 📄 TESTANDO CAMPOS JSON:');
    
    const jsonFields = {
      variables: { test_var: 'valor teste', number_var: 123 },
      validation_criteria: { accuracy: 'teste', completeness: 'teste' }
    };
    
    for (const [field, value] of Object.entries(jsonFields)) {
      console.log(`\n   Testando JSON: ${field}`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('ai_grc_prompt_templates')
        .update({ [field]: value })
        .eq('id', templateId)
        .select(`id, ${field}`);
        
      if (updateError) {
        console.log(`   ❌ Erro ao atualizar ${field}:`, updateError);
      } else {
        // Verificar se foi salvo
        const { data: verifyResult, error: verifyError } = await supabase
          .from('ai_grc_prompt_templates')
          .select(field)
          .eq('id', templateId)
          .single();
          
        if (verifyError) {
          console.log(`   ❌ Erro ao verificar ${field}:`, verifyError);
        } else {
          const savedValue = verifyResult[field];
          if (JSON.stringify(savedValue) === JSON.stringify(value)) {
            console.log(`   ✅ ${field} SALVO CORRETAMENTE: ${JSON.stringify(savedValue)}`);
          } else {
            console.log(`   ❌ ${field} NÃO SALVO:`);
            console.log(`      Esperado: ${JSON.stringify(value)}`);
            console.log(`      Atual: ${JSON.stringify(savedValue)}`);
          }
        }
      }
    }
    
    console.log('\n6. 📊 RESUMO FINAL:');
    const { data: finalTemplate, error: finalError } = await supabase
      .from('ai_grc_prompt_templates')
      .select('*')
      .eq('id', templateId)
      .single();
      
    if (finalError) {
      console.log('❌ Erro ao buscar template final:', finalError);
    } else {
      console.log('✅ Template final após todos os testes:');
      console.log('   name:', finalTemplate.name);
      console.log('   title:', finalTemplate.title);
      console.log('   version:', finalTemplate.version);
      console.log('   is_active:', finalTemplate.is_active);
      console.log('   is_public:', finalTemplate.is_public);
    }
    
  } catch (error) {
    console.log('❌ ERRO GERAL:', error);
  }
}

// Executar teste
testAllTemplateFields().then(() => {
  console.log('\n🏁 Teste concluído');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});