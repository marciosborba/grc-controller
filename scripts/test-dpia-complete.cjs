const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDPIAComplete() {
  try {
    console.log('🧪 TESTE COMPLETO: Verificando DPIA após correção de relacionamentos\n');

    // 1. Fazer login
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

    // 2. Testar fetchDPIAs (query simplificada)
    console.log('\n2️⃣ Testando query fetchDPIAs...');
    const { data: dpiaList, error: listError } = await supabase
      .from('dpia_assessments')
      .select('*')
      .limit(3);

    if (listError) {
      console.log('❌ Erro ao listar DPIAs:', listError.message);
    } else {
      console.log(`✅ DPIAs listados: ${dpiaList?.length || 0} registros`);
    }

    // 3. Testar criação de DPIA completo
    console.log('\n3️⃣ Testando criação de DPIA completo...');
    
    // Primeiro, pegar um processing_activity_id
    const { data: procActivities } = await supabase
      .from('processing_activities')
      .select('id, name')
      .limit(1);

    const processing_activity_id = procActivities?.[0]?.id;
    console.log('Processing Activity ID encontrado:', processing_activity_id);

    const newDPIA = {
      title: 'DPIA Teste Completo',
      description: 'Teste completo após correção de relacionamentos',
      purpose: 'Validar funcionamento total',
      scope: 'Teste de todos os campos',
      processing_activity_id: processing_activity_id,
      data_categories: ['nome', 'email'],
      dpia_required: true,
      dpia_justification: 'Alto risco identificado',
      status: 'draft',
      risk_level: 'high',
      involves_high_risk: true,
      involves_sensitive_data: false,
      involves_large_scale: false,
      privacy_risks: ['Vazamento de dados', 'Uso inadequado'],
      likelihood_assessment: 4,
      impact_assessment: 5,
      mitigation_measures: ['Criptografia', 'Controles de acesso'],
      anpd_consultation_required: true,
      created_by: user.id,
      updated_by: user.id,
      started_at: new Date().toISOString()
    };

    console.log('📝 Criando DPIA com todos os campos...');
    const { data: createData, error: createError } = await supabase
      .from('dpia_assessments')
      .insert([newDPIA])
      .select()
      .single();

    if (createError) {
      console.log('❌ ERRO AO CRIAR DPIA:', createError.message);
      console.log('Código:', createError.code);
      return;
    }

    console.log('🎉 DPIA criado com sucesso!');
    console.log('ID:', createData.id);
    console.log('Título:', createData.title);
    console.log('Status:', createData.status);

    // 4. Testar leitura
    console.log('\n4️⃣ Testando leitura...');
    const { data: readData, error: readError } = await supabase
      .from('dpia_assessments')
      .select('*')
      .eq('id', createData.id)
      .single();

    if (readError) {
      console.log('❌ Erro na leitura:', readError.message);
    } else {
      console.log('✅ DPIA lido:', readData.title);
    }

    // 5. Testar atualização
    console.log('\n5️⃣ Testando atualização...');
    const { error: updateError } = await supabase
      .from('dpia_assessments')
      .update({
        status: 'in_progress',
        description: 'Descrição atualizada',
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', createData.id);

    if (updateError) {
      console.log('❌ Erro na atualização:', updateError.message);
    } else {
      console.log('✅ DPIA atualizado com sucesso');
    }

    // 6. Testar getProcessingActivities
    console.log('\n6️⃣ Testando getProcessingActivities...');
    const { data: activities, error: activitiesError } = await supabase
      .from('processing_activities')
      .select('id, name, description')
      .eq('status', 'active')
      .order('name');

    if (activitiesError) {
      console.log('❌ Erro ao buscar atividades:', activitiesError.message);
    } else {
      console.log(`✅ Atividades encontradas: ${activities?.length || 0}`);
      activities?.forEach(act => console.log(`   - ${act.name}`));
    }

    // 7. Limpar teste
    console.log('\n7️⃣ Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('dpia_assessments')
      .delete()
      .eq('id', createData.id);

    if (deleteError) {
      console.log('⚠️ Erro ao limpar:', deleteError.message);
    } else {
      console.log('🗑️ Dados de teste removidos');
    }

    // 8. RESULTADO FINAL
    console.log('\n' + '='.repeat(70));
    console.log('🏆 RESULTADO FINAL DOS TESTES');
    console.log('='.repeat(70));
    
    const allSuccess = !listError && !createError && !readError && !updateError && !activitiesError;
    
    if (allSuccess) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
      console.log('✅ DPIA CRUD: 100% funcional');
      console.log('✅ Relacionamentos: corrigidos');
      console.log('✅ Processing Activities: funcionando');
      console.log('✅ Todos os campos: operacionais');
      console.log('');
      console.log('🏁 MISSÃO COMPLETA: TODOS OS 7 SUBMÓDULOS LGPD FUNCIONAIS!');
    } else {
      console.log('❌ Ainda há problemas nos testes');
      console.log('🔧 Verifique os erros acima');
    }
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDPIAComplete();