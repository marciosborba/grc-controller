const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function finalDPIADiagnosis() {
  try {
    console.log('🔬 DIAGNÓSTICO FINAL: Por que o card DPIA está em branco?\n');

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

    // 2. Simular exatamente o que o dashboard faz
    console.log('\n2️⃣ Simulando fetchPrivacyMetrics do dashboard:');
    
    try {
      const { data, error } = await supabase.rpc('calculate_privacy_metrics');
      
      if (error) {
        console.log('❌ ERRO na função RPC:', error.message);
        console.log('Código:', error.code);
        console.log('🚨 Dashboard usará fallback (valores zerados)');
        
        // Simular fallback do dashboard
        const fallbackMetrics = {
          dpia_assessments: {
            total_dpias: 0,
            pending_dpias: 0,
            high_risk_dpias: 0
          }
        };
        
        console.log('📊 Card mostrará:', fallbackMetrics.dpia_assessments.total_dpias);
        return;
      }
      
      console.log('✅ Função RPC executada sem erro');
      console.log('📊 Dados recebidos:', JSON.stringify(data, null, 2));
      
      // 3. Verificar seção DPIA especificamente
      const dpiaSection = data?.dpia_assessments;
      console.log('\n3️⃣ Seção DPIA específica:');
      
      if (dpiaSection) {
        console.log('✅ dpia_assessments encontrado:', dpiaSection);
        console.log('📊 total_dpias:', dpiaSection.total_dpias);
        console.log('📊 Card mostrará:', dpiaSection.total_dpias || 0);
      } else {
        console.log('❌ dpia_assessments NÃO encontrado no resultado');
        console.log('🚨 Card mostrará: 0 (valor padrão)');
      }
      
      // 4. Simular lógica do card
      const cardCount = data?.dpia_assessments?.total_dpias || 0;
      console.log('\n4️⃣ Simulação do card:');
      console.log(`metrics?.dpia_assessments?.total_dpias = ${data?.dpia_assessments?.total_dpias}`);
      console.log(`|| 0 = ${cardCount}`);
      console.log(`Card final mostrará: ${cardCount}`);
      
    } catch (fetchError) {
      console.log('❌ ERRO GERAL na fetch:', fetchError.message);
      console.log('🚨 Dashboard usará fallback (valores zerados)');
    }

    // 5. Contagem direta para comparação
    console.log('\n5️⃣ Contagem direta (para comparar):');
    const { data: directCount } = await supabase
      .from('dpia_assessments')
      .select('*');
    
    console.log(`Registros reais na tabela: ${directCount?.length || 0}`);

    // 6. DIAGNÓSTICO FINAL
    console.log('\n' + '='.repeat(70));
    console.log('🏥 DIAGNÓSTICO FINAL');
    console.log('='.repeat(70));
    
    console.log('Possíveis causas do card em branco:');
    console.log('1. ❓ Função RPC com erro -> Dashboard usa fallback = 0');
    console.log('2. ❓ Função RPC OK mas sem seção dpia_assessments -> undefined || 0 = 0');
    console.log('3. ❓ Cache do browser -> Dados antigos');
    console.log('4. ❓ Problema de permissão na função -> Erro silencioso');
    console.log('');
    console.log('SOLUÇÕES:');
    console.log('1. 🔧 Execute: supabase/emergency-dpia-fix.sql');
    console.log('2. 🔄 Recarregue dashboard (Ctrl+F5)');
    console.log('3. 🧹 Limpe cache do browser');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Erro geral no diagnóstico:', error);
  }
}

finalDPIADiagnosis();