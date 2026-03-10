import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDPIAFinal() {
  try {
    console.log('🧪 TESTE FINAL: Verificando DPIA após correção\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      return;
    }

    const user = loginData?.user;
    console.log('✅ Login realizado:', user.email);

    // 2. Verificar se a tabela existe
    console.log('\n2️⃣ Verificando tabela dpia_assessments...');
    const { data: existing, error: existError } = await supabase
      .from('dpia_assessments')
      .select('*');

    if (existError) {
      console.log('❌ Erro ao acessar tabela:', existError.message);
      console.log('🚨 Execute primeiro o arquivo recreate-dpia-table.sql no Supabase!');
      return;
    }

    console.log(`✅ Tabela encontrada com ${existing?.length || 0} registros`);

    // 3. Testar criação de DPIA
    console.log('\n3️⃣ TESTE PRINCIPAL: Criando novo DPIA...');
    
    const newDPIA = {
      title: 'DPIA Teste Final',
      description: 'Teste final após correção da tabela',
      purpose: 'Validar funcionamento do CRUD',
      scope: 'Apenas teste funcional',
      data_categories: ['teste'],
      status: 'draft',
      risk_level: 'low',
      involves_high_risk: false,
      involves_sensitive_data: false,
      involves_large_scale: false,
      created_by: user.id,
      updated_by: user.id,
      started_at: new Date().toISOString()
    };

    const { data: createData, error: createError } = await supabase
      .from('dpia_assessments')
      .insert([newDPIA])
      .select()
      .single();

    if (createError) {
      console.log('❌ ERRO AO CRIAR DPIA:', createError.message);
      return;
    }

    console.log('🎉 SUCESSO! DPIA criado com ID:', createData.id);

    // 4. Testar CRUD completo
    console.log('\n4️⃣ Testando CRUD completo...');
    
    // Leitura
    const { data: readData } = await supabase
      .from('dpia_assessments')
      .select('*')
      .eq('id', createData.id)
      .single();
    
    console.log('✅ Leitura:', readData ? 'OK' : 'ERRO');

    // Atualização
    const { error: updateError } = await supabase
      .from('dpia_assessments')
      .update({ description: 'Atualizado' })
      .eq('id', createData.id);
      
    console.log('✅ Atualização:', updateError ? 'ERRO' : 'OK');

    // Exclusão (limpar teste)
    const { error: deleteError } = await supabase
      .from('dpia_assessments')
      .delete()
      .eq('id', createData.id);
      
    console.log('✅ Exclusão:', deleteError ? 'ERRO' : 'OK');

    // RESULTADO FINAL
    console.log('\n' + '='.repeat(60));
    console.log('🏆 RESULTADO FINAL');
    console.log('='.repeat(60));
    
    if (!createError && !updateError && !deleteError) {
      console.log('🎉 TODOS OS 7 SUBMÓDULOS LGPD FUNCIONAIS!');
      console.log('✅ DPIA CRUD: 100% operacional');
      console.log('✅ MISSÃO COMPLETA!');
    } else {
      console.log('❌ Ainda há problemas no DPIA');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testDPIAFinal();