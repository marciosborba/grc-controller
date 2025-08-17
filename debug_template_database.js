#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugTemplateDatabase() {
  console.log('🔍 INVESTIGANDO PROBLEMA DO BANCO DE DADOS');
  console.log('==========================================');
  
  try {
    // 1. Verificar estrutura da tabela
    console.log('\n1. 📋 ESTRUTURA DA TABELA:');
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, column_default, is_nullable 
          FROM information_schema.columns 
          WHERE table_name = 'ai_grc_prompt_templates' 
          AND column_name IN ('is_active', 'is_public')
          ORDER BY column_name;
        `
      });
    
    if (columnsError) {
      console.log('❌ Erro ao verificar colunas (tentando método alternativo)');
      
      // Método alternativo: buscar um template existente
      const { data: template, error: templateError } = await supabase
        .from('ai_grc_prompt_templates')
        .select('id, name, is_active, is_public')
        .limit(1)
        .single();
        
      if (templateError) {
        console.log('❌ Erro ao buscar template:', templateError);
      } else {
        console.log('✅ Template encontrado:', template);
        console.log('   - is_active tipo:', typeof template.is_active);
        console.log('   - is_public tipo:', typeof template.is_public);
      }
    } else {
      console.log('✅ Estrutura das colunas:', columns);
    }
    
    // 2. Verificar triggers
    console.log('\n2. ⚡ TRIGGERS NA TABELA:');
    const { data: triggers, error: triggersError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT trigger_name, event_manipulation, action_statement 
          FROM information_schema.triggers 
          WHERE event_object_table = 'ai_grc_prompt_templates';
        `
      });
      
    if (triggersError) {
      console.log('❌ Erro ao verificar triggers:', triggersError);
    } else {
      console.log('✅ Triggers encontrados:', triggers || 'Nenhum');
    }
    
    // 3. Verificar políticas RLS
    console.log('\n3. 🔒 POLÍTICAS RLS:');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies 
          WHERE tablename = 'ai_grc_prompt_templates';
        `
      });
      
    if (policiesError) {
      console.log('❌ Erro ao verificar políticas:', policiesError);
    } else {
      console.log('✅ Políticas RLS:', policies || 'Nenhuma');
    }
    
    // 4. Teste direto de update
    console.log('\n4. 🧪 TESTE DIRETO DE UPDATE:');
    
    // Primeiro, buscar um template
    const { data: testTemplate, error: findError } = await supabase
      .from('ai_grc_prompt_templates')
      .select('id, name, is_active, is_public')
      .limit(1)
      .single();
      
    if (findError) {
      console.log('❌ Erro ao buscar template para teste:', findError);
      return;
    }
    
    console.log('📝 Template para teste:', testTemplate);
    
    // Tentar update
    const newActiveValue = !testTemplate.is_active;
    console.log(`🔄 Tentando alterar is_active de ${testTemplate.is_active} para ${newActiveValue}`);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('ai_grc_prompt_templates')
      .update({ is_active: newActiveValue })
      .eq('id', testTemplate.id)
      .select('id, name, is_active, is_public');
      
    if (updateError) {
      console.log('❌ ERRO NO UPDATE:', updateError);
    } else {
      console.log('✅ Update executado:', updateResult);
      
      // Verificar se foi salvo
      const { data: verifyResult, error: verifyError } = await supabase
        .from('ai_grc_prompt_templates')
        .select('id, name, is_active, is_public')
        .eq('id', testTemplate.id)
        .single();
        
      if (verifyError) {
        console.log('❌ Erro ao verificar:', verifyError);
      } else {
        console.log('🔍 Valor após update:', verifyResult);
        
        if (verifyResult.is_active === newActiveValue) {
          console.log('✅ SUCESSO: Valor foi salvo corretamente!');
        } else {
          console.log('❌ PROBLEMA: Valor não foi salvo!');
          console.log(`   Esperado: ${newActiveValue}`);
          console.log(`   Atual: ${verifyResult.is_active}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ ERRO GERAL:', error);
  }
}

// Executar o debug
debugTemplateDatabase().then(() => {
  console.log('\n🏁 Debug concluído');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});