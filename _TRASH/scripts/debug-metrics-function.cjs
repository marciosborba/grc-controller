const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugMetricsFunction() {
  try {
    console.log('🔍 DEBUG: Função calculate_privacy_metrics\n');

    // 1. Fazer login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Login realizado');

    // 2. Verificar se a função existe
    console.log('\n2️⃣ SQL para verificar se função existe:');
    const checkFunctionSQL = `
SELECT 
    proname as function_name,
    pg_get_function_result(oid) as return_type,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'calculate_privacy_metrics';
    `;
    
    console.log(checkFunctionSQL);

    // 3. Executar função e mostrar resultado completo
    console.log('\n3️⃣ Executando função e mostrando resultado completo:');
    const { data: fullMetrics, error: metricsError } = await supabase.rpc('calculate_privacy_metrics');

    if (metricsError) {
      console.log('❌ ERRO na função:', metricsError.message);
      console.log('Código:', metricsError.code);
      
      if (metricsError.message.includes('function calculate_privacy_metrics() does not exist')) {
        console.log('\n🚨 PROBLEMA: Função não existe!');
        console.log('📝 Execute o SQL: supabase/fix-dpia-metrics.sql');
      }
      return;
    }

    console.log('✅ Função executada com sucesso');
    console.log('\n📊 Resultado completo:');
    console.log(JSON.stringify(fullMetrics, null, 2));

    // 4. Focar no DPIA especificamente
    console.log('\n4️⃣ Seção DPIA específica:');
    const dpiaSection = fullMetrics?.dpia_assessments;
    
    if (dpiaSection) {
      console.log('DPIA Assessments encontrado:', dpiaSection);
      console.log('Total DPIAs:', dpiaSection.total_dpias);
      console.log('Pending DPIAs:', dpiaSection.pending_dpias);
      console.log('High Risk DPIAs:', dpiaSection.high_risk_dpias);
    } else {
      console.log('❌ Seção dpia_assessments não encontrada no resultado');
    }

    // 5. Contar manualmente os DPIAs por status
    console.log('\n5️⃣ Contagem manual por status:');
    const { data: dpias, error: dpiaError } = await supabase
      .from('dpia_assessments')
      .select('status, risk_level');

    if (dpiaError) {
      console.log('❌ Erro ao contar DPIAs:', dpiaError.message);
    } else {
      console.log(`Total na tabela: ${dpias.length}`);
      
      const statusCount = {};
      const riskCount = {};
      
      dpias.forEach(dpia => {
        const status = dpia.status || 'undefined';
        const risk = dpia.risk_level || 'undefined';
        
        statusCount[status] = (statusCount[status] || 0) + 1;
        riskCount[risk] = (riskCount[risk] || 0) + 1;
      });
      
      console.log('Por status:', statusCount);
      console.log('Por risk_level:', riskCount);
      
      const pendingCount = (statusCount['draft'] || 0) + (statusCount['in_progress'] || 0) + (statusCount['pending_approval'] || 0);
      console.log('Pendentes calculado:', pendingCount);
    }

    // 6. SQL de correção se necessário
    console.log('\n6️⃣ Se a função ainda retorna 0, execute este SQL:');
    
    const correctionSQL = `
-- Verificar se função tem acesso à tabela dpia_assessments
SELECT COUNT(*) as total_dpias FROM dpia_assessments;

-- Se retornar 0 mas sabemos que há 4 registros, há problema de permissão
-- Execute então o fix completo:
`;
    
    console.log(correctionSQL);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

debugMetricsFunction();