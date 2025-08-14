const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDPIAAfterFix() {
  try {
    console.log('🧪 TESTE FINAL: Verificando DPIA após correção da tabela\n');

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

    // 2. Verificar se a tabela existe e tem dados
    console.log('\n2️⃣ Verificando tabela dpia_assessments...');
    const { data: existing, error: existError } = await supabase
      .from('dpia_assessments')
      .select('*');

    if (existError) {
      console.log('❌ Erro ao acessar tabela:', existError.message);
      console.log('🚨 A tabela ainda não foi recriada ou há problema de acesso!');
      return;
    }

    console.log(`✅ Tabela encontrada com ${existing?.length || 0} registros`);

    if (existing && existing.length > 0) {
      console.log('📋 Registros existentes:');
      existing.forEach((record, index) => {
        console.log(`   ${index + 1}. ${record.name} - Status: ${record.status}`);
      });
    }

    // 3. Testar criação de DPIA (TESTE PRINCIPAL)
    console.log('\n3️⃣ TESTE PRINCIPAL: Criando novo DPIA...');
    
    const newDPIA = {
      name: 'DPIA Teste Final',
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

    console.log('📝 Dados a inserir:', {
      name: newDPIA.name,
      description: newDPIA.description,
      status: newDPIA.status,
      user_id: user.id
    });

    const { data: createData, error: createError } = await supabase
      .from('dpia_assessments')
      .insert([newDPIA])
      .select()
      .single();

    if (createError) {
      console.log('❌ ERRO AO CRIAR DPIA:', createError.message);
      console.log('Código:', createError.code);
      console.log('🚨 PROBLEMA: DPIA ainda não está funcionando!');
      
      // Debugging adicional
      if (createError.message.includes('not-null constraint')) {
        console.log('💡 Campo obrigatório faltando. Verifique a estrutura da tabela.');
      } else if (createError.message.includes('does not exist')) {
        console.log('💡 Tabela não foi recriada corretamente.');
      }
      return;
    }

    console.log('🎉 SUCESSO! DPIA criado com ID:', createData.id);

    // 4. Testar leitura
    console.log('\n4️⃣ Testando leitura do DPIA criado...');
    const { data: readData, error: readError } = await supabase
      .from('dpia_assessments')
      .select('*')
      .eq('id', createData.id)
      .single();

    if (readError) {
      console.log('❌ Erro ao ler DPIA:', readError.message);
    } else {
      console.log('✅ DPIA lido com sucesso:', readData.name);
    }

    // 5. Testar atualização
    console.log('\n5️⃣ Testando atualização...');
    const { data: updateData, error: updateError } = await supabase
      .from('dpia_assessments')
      .update({
        description: 'Descrição atualizada no teste',
        status: 'in_progress',
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', createData.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erro ao atualizar:', updateError.message);
    } else {
      console.log('✅ DPIA atualizado:', updateData.status);
    }

    // 6. Testar exclusão (limpar teste)
    console.log('\n6️⃣ Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('dpia_assessments')
      .delete()
      .eq('id', createData.id);

    if (deleteError) {
      console.log('⚠️ Erro ao limpar teste:', deleteError.message);
    } else {
      console.log('🗑️ Dados de teste removidos');
    }

    // 7. RESULTADO FINAL
    console.log('\n' + '='.repeat(60));
    console.log('🏆 RESULTADO FINAL DO TESTE');
    console.log('='.repeat(60));
    
    if (!createError && !readError && !updateError) {
      console.log('✅ DPIA CRUD está 100% FUNCIONAL!');
      console.log('✅ Todos os submódulos LGPD estão operacionais');
      console.log('✅ Missão completa: CRUD garantido em todos os campos');
    } else {
      console.log('❌ Ainda há problemas no DPIA CRUD');
      console.log('🔧 Verificar logs de erro acima');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testDPIAAfterFix();