#!/usr/bin/env node

// Script para corrigir o campo assigned_to usando abordagem alternativa
// Tenta diferentes métodos para aplicar a correção

import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createWorkaroundSolution() {
  console.log('🔧 CRIANDO SOLUÇÃO ALTERNATIVA');
  console.log('================================');
  
  try {
    // Estratégia: Criar uma nova tabela com estrutura correta e migrar dados
    console.log('📋 1. Verificando se podemos criar uma função temporária...');
    
    // Tentar criar uma view ou função que contorne o problema
    const { data: viewData, error: viewError } = await supabase
      .from('risk_assessments')
      .select('id, title, risk_category, probability, likelihood_score, impact_score, risk_level, status, tenant_id, created_by')
      .limit(1);
    
    if (viewError) {
      console.error('❌ Erro ao acessar tabela:', viewError.message);
      return;
    }
    
    console.log('✅ Acesso à tabela confirmado');
    
    // Estratégia alternativa: Criar registros sem o campo assigned_to
    console.log('\n🧪 2. Testando inserção sem campo assigned_to...');
    
    const testDataWithoutAssigned = {
      title: 'Teste Sem Assigned',
      risk_category: 'Operacional',
      probability: 3,
      likelihood_score: 3,
      impact_score: 3,
      risk_level: 'Médio',
      status: 'Identificado',
      tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f',
      created_by: '0c5c1433-2682-460c-992a-f4cce57c0d6d'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('risk_assessments')
      .insert([testDataWithoutAssigned])
      .select();
    
    if (insertError) {
      console.log('❌ Erro mesmo sem assigned_to:', insertError.message);
    } else {
      console.log('✅ SUCESSO! Inserção funciona sem assigned_to');
      console.log('📊 ID criado:', insertData[0].id);
      
      // Tentar atualizar com assigned_to
      console.log('\n🔄 3. Tentando atualizar com assigned_to...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('risk_assessments')
        .update({ assigned_to: 'teste' })
        .eq('id', insertData[0].id)
        .select();
      
      if (updateError) {
        console.log('❌ Erro ao atualizar assigned_to:', updateError.message);
        console.log('✅ CONFIRMADO: Campo assigned_to é UUID na tabela');
      } else {
        console.log('✅ INCRÍVEL! Update funcionou - campo já é TEXT');
        console.log('📊 Dados atualizados:', updateData[0]);
      }
      
      // Limpar teste
      await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Registro de teste removido');
    }
    
    // Gerar instruções específicas
    console.log('\n📋 INSTRUÇÕES ESPECÍFICAS PARA CORREÇÃO:');
    console.log('=========================================');
    console.log('');
    console.log('🌐 1. Acesse o Dashboard do Supabase:');
    console.log('   https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd');
    console.log('');
    console.log('📝 2. Vá em "SQL Editor" no menu lateral');
    console.log('');
    console.log('⚡ 3. Cole e execute este SQL:');
    console.log('');
    console.log('-- Limpar dados existentes no campo assigned_to');
    console.log('UPDATE public.risk_assessments SET assigned_to = NULL;');
    console.log('');
    console.log('-- Alterar tipo da coluna de UUID para TEXT');
    console.log('ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;');
    console.log('');
    console.log('-- Verificar se funcionou');
    console.log('SELECT column_name, data_type FROM information_schema.columns');
    console.log('WHERE table_name = \'risk_assessments\' AND column_name = \'assigned_to\';');
    console.log('');
    console.log('✅ 4. Se o resultado mostrar data_type = \'text\', a correção funcionou!');
    console.log('');
    console.log('🚀 5. Volte à aplicação e tente criar o risco novamente');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar
createWorkaroundSolution();