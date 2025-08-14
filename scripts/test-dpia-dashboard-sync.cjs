const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDPIADashboardSync() {
  try {
    console.log('🔄 TESTE: Sincronização entre dashboard e submódulo DPIA\n');

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

    // 2. Contar DPIAs diretamente na tabela
    console.log('\n2️⃣ Contagem direta da tabela dpia_assessments:');
    const { data: directCount, error: directError } = await supabase
      .from('dpia_assessments')
      .select('*');

    if (directError) {
      console.log('❌ Erro ao contar DPIAs:', directError.message);
      return;
    }

    const totalDPIAs = directCount?.length || 0;
    console.log(`📊 Total de DPIAs na tabela: ${totalDPIAs}`);

    if (totalDPIAs > 0) {
      console.log('📋 Status dos DPIAs:');
      const statusCount = {};
      directCount.forEach(dpia => {
        const status = dpia.status || 'undefined';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
    }

    // 3. Testar função calculate_privacy_metrics
    console.log('\n3️⃣ Testando função calculate_privacy_metrics:');
    const { data: metricsData, error: metricsError } = await supabase.rpc('calculate_privacy_metrics');

    if (metricsError) {
      console.log('❌ Erro na função de métricas:', metricsError.message);
      console.log('🚨 Execute primeiro o SQL: supabase/fix-dpia-metrics.sql');
      return;
    }

    console.log('✅ Função de métricas executada com sucesso');
    
    const dashboardDPIAs = metricsData?.dpia_assessments?.total_dpias || 0;
    const pendingDPIAs = metricsData?.dpia_assessments?.pending_dpias || 0;
    const completedDPIAs = metricsData?.dpia_assessments?.completed_dpias || 0;
    
    console.log(`📊 Dashboard - Total DPIAs: ${dashboardDPIAs}`);
    console.log(`📊 Dashboard - DPIAs Pendentes: ${pendingDPIAs}`);
    console.log(`📊 Dashboard - DPIAs Concluídos: ${completedDPIAs}`);

    // 4. Comparar valores
    console.log('\n4️⃣ Comparação de valores:');
    
    const isSync = totalDPIAs === dashboardDPIAs;
    
    if (isSync) {
      console.log('✅ SINCRONIZAÇÃO PERFEITA!');
      console.log(`   Tabela: ${totalDPIAs} registros`);
      console.log(`   Dashboard: ${dashboardDPIAs} registros`);
      console.log('✅ Card do dashboard deve mostrar o número correto agora');
    } else {
      console.log('❌ DIVERGÊNCIA ENCONTRADA:');
      console.log(`   Tabela: ${totalDPIAs} registros`);
      console.log(`   Dashboard: ${dashboardDPIAs} registros`);
      console.log('🚨 Diferença de:', Math.abs(totalDPIAs - dashboardDPIAs), 'registros');
    }

    // 5. RESULTADO FINAL
    console.log('\n' + '='.repeat(60));
    console.log('🏆 RESULTADO DA CORREÇÃO');
    console.log('='.repeat(60));
    
    if (isSync) {
      console.log('🎉 PROBLEMA RESOLVIDO!');
      console.log('✅ Dashboard e submódulo estão sincronizados');
      console.log('✅ Card do DPIA mostra a contagem correta');
      console.log(`✅ Total de registros: ${totalDPIAs}`);
    } else {
      console.log('🔧 Ainda há divergência');
      console.log('📝 Verifique se executou: supabase/fix-dpia-metrics.sql');
      console.log('🔄 Atualize o dashboard no browser');
    }
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDPIADashboardSync();