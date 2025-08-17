#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixTemplateDatabase() {
  console.log('🔧 CORRIGINDO PROBLEMA DO BANCO DE DADOS');
  console.log('========================================');
  
  try {
    // 1. Verificar se RLS está habilitado
    console.log('\n1. 🔒 Verificando RLS na tabela...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('ai_grc_prompt_templates')
      .select('id')
      .limit(1);
      
    if (tableError) {
      console.log('❌ Erro ao acessar tabela:', tableError);
      return;
    }
    
    // 2. Tentar diferentes abordagens de update
    console.log('\n2. 🧪 Testando diferentes abordagens...');
    
    const templateId = 'e20d72be-b98d-464f-a94a-bd6e2385f765';
    
    // Abordagem 1: Update com upsert
    console.log('\n   Abordagem 1: Update com upsert');
    const { data: upsertResult, error: upsertError } = await supabase
      .from('ai_grc_prompt_templates')
      .upsert({ 
        id: templateId,
        is_active: false,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select('id, name, is_active');
      
    if (upsertError) {
      console.log('   ❌ Erro no upsert:', upsertError);
    } else {
      console.log('   ✅ Upsert executado:', upsertResult);
    }
    
    // Verificar resultado
    const { data: check1, error: checkError1 } = await supabase
      .from('ai_grc_prompt_templates')
      .select('is_active')
      .eq('id', templateId)
      .single();
      
    console.log('   🔍 Valor após upsert:', check1?.is_active);
    
    // Abordagem 2: Update com diferentes campos
    console.log('\n   Abordagem 2: Update múltiplos campos');
    const { data: multiResult, error: multiError } = await supabase
      .from('ai_grc_prompt_templates')
      .update({ 
        is_active: false,
        is_public: true, // Manter público
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select('id, name, is_active, is_public');
      
    if (multiError) {
      console.log('   ❌ Erro no update múltiplo:', multiError);
    } else {
      console.log('   ✅ Update múltiplo executado:', multiResult);
    }
    
    // Verificar resultado
    const { data: check2, error: checkError2 } = await supabase
      .from('ai_grc_prompt_templates')
      .select('is_active, is_public')
      .eq('id', templateId)
      .single();
      
    console.log('   🔍 Valor após update múltiplo:', check2);
    
    // Abordagem 3: Tentar com diferentes valores
    console.log('\n   Abordagem 3: Testando com string');
    const { data: stringResult, error: stringError } = await supabase
      .from('ai_grc_prompt_templates')
      .update({ 
        is_active: 'false' // Como string
      })
      .eq('id', templateId)
      .select('id, name, is_active');
      
    if (stringError) {
      console.log('   ❌ Erro com string:', stringError);
    } else {
      console.log('   ✅ Update com string executado:', stringResult);
    }
    
    // Verificar resultado final
    const { data: finalCheck, error: finalError } = await supabase
      .from('ai_grc_prompt_templates')
      .select('id, name, is_active, is_public, updated_at')
      .eq('id', templateId)
      .single();
      
    console.log('\n3. 🏁 RESULTADO FINAL:');
    if (finalError) {
      console.log('❌ Erro na verificação final:', finalError);
    } else {
      console.log('✅ Estado final do template:', finalCheck);
      
      if (finalCheck.is_active === false) {
        console.log('🎉 SUCESSO: is_active foi salvo como false!');
      } else {
        console.log('❌ PROBLEMA PERSISTE: is_active ainda é true');
        console.log('💡 Possíveis causas:');
        console.log('   - Trigger que força is_active = true');
        console.log('   - Constraint CHECK que impede false');
        console.log('   - Política RLS que bloqueia updates');
        console.log('   - Default value que sobrescreve');
      }
    }
    
  } catch (error) {
    console.log('❌ ERRO GERAL:', error);
  }
}

// Executar a correção
fixTemplateDatabase().then(() => {
  console.log('\n🏁 Correção concluída');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});