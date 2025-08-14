const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function fixConsentsTotal() {
  console.log('🔧 CORRIGINDO TOTAL DE CONSENTIMENTOS\n');

  try {
    // 1. Login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'dev@grc.local',
      password: 'dev123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }
    console.log('✅ Login realizado');

    // 2. Analisar estrutura da função de métricas
    console.log('\n📊 ANALISANDO MÉTRICAS DETALHADAS...');
    const { data: fullMetrics, error: metricsError } = await supabase.rpc('calculate_privacy_metrics');

    if (metricsError) {
      console.error('❌ Erro:', metricsError.message);
      return;
    }

    console.log('📋 ESTRUTURA COMPLETA DOS CONSENTIMENTOS:');
    console.log(JSON.stringify(fullMetrics.consents, null, 2));

    // 3. Verificar contagem direta
    console.log('\n🔢 CONTAGEM DIRETA:');
    const { data: directCount, error: countError } = await supabase
      .from('consents')
      .select('*');

    if (countError) {
      console.error('❌ Erro na contagem direta:', countError.message);
    } else {
      console.log('✅ Total de consentimentos (direto):', directCount.length);
      
      const statusCount = directCount.reduce((acc, consent) => {
        acc[consent.status] = (acc[consent.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Por status:', statusCount);
    }

    // 4. Comparação final
    console.log('\n🎯 COMPARAÇÃO FINAL:');
    console.log('   → Total pela função:', fullMetrics.consents?.total_consents || 'UNDEFINED');
    console.log('   → Total direto:', directCount.length);
    console.log('   → Ativos pela função:', fullMetrics.consents?.total_active || 0);
    console.log('   → Revogados pela função:', fullMetrics.consents?.total_revoked || 0);
    console.log('   → Expirados pela função:', fullMetrics.consents?.total_expired || 0);

    // Verificar se soma confere
    const totalBySum = (fullMetrics.consents?.total_active || 0) + 
                      (fullMetrics.consents?.total_revoked || 0) + 
                      (fullMetrics.consents?.total_expired || 0);
    
    console.log('   → Soma dos status:', totalBySum);

    if (totalBySum === directCount.length) {
      console.log('✅ A função está calculando corretamente, apenas o total_consents está missing');
    } else {
      console.log('❌ Há inconsistência nos cálculos');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

fixConsentsTotal().catch(console.error);