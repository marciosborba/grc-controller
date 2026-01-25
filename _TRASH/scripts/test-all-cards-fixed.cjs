const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAllCardsFixed() {
  try {
    console.log('✅ TESTE FINAL: Verificando se todos os cards estão corrigidos\n');

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

    // 2. Obter métricas
    const { data: metrics, error: metricsError } = await supabase.rpc('calculate_privacy_metrics');
    
    if (metricsError) {
      console.log('❌ ERRO na função:', metricsError.message);
      return;
    }

    console.log('✅ Métricas obtidas com sucesso');

    // 3. Obter contagens reais
    const tables = {
      'legal_bases': await supabase.from('legal_bases').select('*'),
      'consents': await supabase.from('consents').select('*'),
      'data_inventory': await supabase.from('data_inventory').select('*'),
      'data_subject_requests': await supabase.from('data_subject_requests').select('*'),
      'privacy_incidents': await supabase.from('privacy_incidents').select('*'),
      'processing_activities': await supabase.from('processing_activities').select('*'),
      'dpia_assessments': await supabase.from('dpia_assessments').select('*')
    };

    const realCounts = {};
    for (const [table, result] of Object.entries(tables)) {
      realCounts[table] = result.data?.length || 0;
    }

    // 4. Simular valores dos cards após correção
    console.log('\n4️⃣ SIMULAÇÃO DOS CARDS (após correções):');
    console.log('='.repeat(70));

    const cardValues = {
      'Discovery de Dados': 0,
      'Inventário de Dados': metrics?.data_inventory?.total_inventories || 0,
      'Solicitações de Titulares': metrics?.data_subject_requests?.total_requests || 0, // CORRIGIDO
      'Incidentes de Privacidade': metrics?.privacy_incidents?.total_incidents || 0, // CORRIGIDO  
      'DPIA/AIPD': metrics?.dpia_assessments?.total_dpias || 0, // CORRIGIDO
      'Bases Legais': metrics?.legal_bases?.total_bases || 0,
      'Consentimentos': metrics?.consents?.total_active || 0,
      'Atividades de Tratamento': metrics?.processing_activities?.total_activities || 0,
      'Relatório RAT': 0
    };

    // 5. Comparar cada card
    const cardComparisons = {
      'Inventário de Dados': realCounts['data_inventory'],
      'Solicitações de Titulares': realCounts['data_subject_requests'],
      'Incidentes de Privacidade': realCounts['privacy_incidents'],
      'DPIA/AIPD': realCounts['dpia_assessments'],
      'Bases Legais': realCounts['legal_bases'],
      'Atividades de Tratamento': realCounts['processing_activities']
    };

    let allCorrect = true;

    for (const [cardName, realCount] of Object.entries(cardComparisons)) {
      const cardValue = cardValues[cardName];
      const isCorrect = cardValue === realCount;
      const status = isCorrect ? '✅' : '❌';
      
      console.log(`${status} ${cardName}:`);
      console.log(`    Tabela: ${realCount} | Card: ${cardValue}`);
      
      if (!isCorrect) {
        allCorrect = false;
      }
    }

    // 6. Cards especiais (não comparáveis diretamente)
    console.log(`\n📋 CARDS ESPECIAIS:`);
    console.log(`✅ Discovery de Dados: ${cardValues['Discovery de Dados']} (sempre 0 por design)`);
    console.log(`✅ Relatório RAT: ${cardValues['Relatório RAT']} (sempre 0 por design)`);
    
    // Consentimentos (filtra por status)
    const consentsActive = metrics?.consents?.total_active || 0;
    console.log(`📋 Consentimentos: Tabela total: ${realCounts['consents']} | Card (ativos): ${consentsActive}`);

    // 7. Cards de métricas principais
    console.log(`\n📊 CARDS DE MÉTRICAS PRINCIPAIS (após correção):`);
    console.log(`✅ Total de Solicitações: ${metrics?.data_subject_requests?.total_requests || 0}`);
    console.log(`✅ Total de Incidentes: ${metrics?.privacy_incidents?.total_incidents || 0}`);

    // 8. RESULTADO FINAL
    console.log('\n' + '='.repeat(70));
    console.log('🏆 RESULTADO FINAL');
    console.log('='.repeat(70));
    
    if (allCorrect) {
      console.log('🎉 TODAS AS CORREÇÕES APLICADAS COM SUCESSO!');
      console.log('✅ Cards do dashboard sincronizados com submódulos');
      console.log('✅ Solicitações: mostram total correto');
      console.log('✅ Incidentes: mostram total correto'); 
      console.log('✅ DPIA: funcionando perfeitamente');
      console.log('✅ Outros cards: mantidos funcionais');
      console.log('');
      console.log('🚀 Dashboard 100% funcional e sincronizado!');
    } else {
      console.log('⚠️ Algumas correções ainda pendentes');
      console.log('🔄 Recarregue o dashboard no browser');
    }
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testAllCardsFixed();