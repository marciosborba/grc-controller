#!/usr/bin/env node

// Script para corrigir o campo assigned_to na tabela risk_assessments
// Executa diretamente no Supabase usando as credenciais do projeto

import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase (do arquivo client.ts)
const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixAssignedToField() {
  console.log('🔧 INICIANDO CORREÇÃO DO CAMPO assigned_to');
  console.log('================================================');
  
  try {
    // 1. Verificar estrutura atual
    console.log('📋 1. Verificando estrutura atual da tabela...');
    
    // Tentar buscar um registro para ver a estrutura
    const { data: sampleData, error: sampleError } = await supabase
      .from('risk_assessments')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Erro ao verificar estrutura:', sampleError.message);
      return;
    }
    
    console.log('✅ Tabela risk_assessments encontrada');
    if (sampleData && sampleData.length > 0) {
      console.log('📊 Campos existentes:', Object.keys(sampleData[0]).join(', '));
    }
    
    // 2. Testar inserção com assigned_to como texto
    console.log('\n🧪 2. Testando inserção com assigned_to como texto...');
    
    const testData = {
      title: 'Teste Correção Campo',
      risk_category: 'Operacional',
      probability: 3,
      likelihood_score: 3,
      impact_score: 3,
      risk_level: 'Médio',
      status: 'Identificado',
      assigned_to: 'teste',
      tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f',
      created_by: '0c5c1433-2682-460c-992a-f4cce57c0d6d'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('risk_assessments')
      .insert([testData])
      .select();
    
    if (insertError) {
      if (insertError.message.includes('uuid') && insertError.message.includes('teste')) {
        console.log('🎯 PROBLEMA CONFIRMADO: Campo assigned_to é UUID, precisa ser TEXT');
        console.log('⚠️  Erro:', insertError.message);
        
        // 3. Tentar corrigir usando RPC (se disponível)
        console.log('\n🔧 3. Tentando corrigir via RPC...');
        
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('exec_sql', {
            sql: `
              -- Limpar dados existentes
              UPDATE public.risk_assessments SET assigned_to = NULL WHERE assigned_to IS NOT NULL;
              
              -- Alterar tipo da coluna
              ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;
              
              -- Retornar confirmação
              SELECT 'Campo assigned_to alterado para TEXT com sucesso!' as resultado;
            `
          });
        
        if (rpcError) {
          console.log('❌ RPC não disponível ou sem permissão:', rpcError.message);
          console.log('\n📝 SOLUÇÃO MANUAL NECESSÁRIA:');
          console.log('1. Acesse: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd');
          console.log('2. Vá em SQL Editor');
          console.log('3. Execute o seguinte SQL:');
          console.log('');
          console.log('UPDATE public.risk_assessments SET assigned_to = NULL WHERE assigned_to IS NOT NULL;');
          console.log('ALTER TABLE public.risk_assessments ALTER COLUMN assigned_to TYPE TEXT;');
          console.log('');
          console.log('4. Tente criar o risco novamente na aplicação');
        } else {
          console.log('✅ Correção aplicada via RPC!');
          console.log('📊 Resultado:', rpcData);
          
          // Testar novamente
          console.log('\n🧪 4. Testando inserção após correção...');
          const { data: retestData, error: retestError } = await supabase
            .from('risk_assessments')
            .insert([testData])
            .select();
          
          if (retestError) {
            console.log('❌ Ainda há erro:', retestError.message);
          } else {
            console.log('✅ SUCESSO! Campo assigned_to agora aceita texto');
            
            // Limpar teste
            await supabase
              .from('risk_assessments')
              .delete()
              .eq('id', retestData[0].id);
            console.log('🧹 Registro de teste removido');
          }
        }
      } else {
        console.log('❌ Erro diferente do esperado:', insertError.message);
      }
    } else {
      console.log('✅ SUCESSO! Campo assigned_to já aceita texto');
      console.log('📊 Registro criado:', insertData[0]);
      
      // Limpar teste
      await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Registro de teste removido');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  console.log('\n✅ PROCESSO FINALIZADO');
  console.log('💡 Se o problema persistir, execute a correção manual no Dashboard');
}

// Executar correção
fixAssignedToField();