const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnoseAllCards() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO: Todos os cards do dashboard\n');

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

    // 2. Contar registros reais em cada tabela
    console.log('\n2️⃣ CONTAGEM DIRETA NAS TABELAS:');
    
    const tables = [
      'legal_bases',
      'consents', 
      'data_inventory',
      'data_subject_requests',
      'privacy_incidents',
      'processing_activities',
      'dpia_assessments'
    ];

    const realCounts = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.log(`❌ ${table}: Erro - ${error.message}`);
          realCounts[table] = 'ERRO';
        } else {
          const count = data?.length || 0;
          console.log(`📊 ${table}: ${count} registros`);
          realCounts[table] = count;
        }
      } catch (e) {
        console.log(`❌ ${table}: Exceção - ${e.message}`);
        realCounts[table] = 'ERRO';
      }
    }

    // 3. Executar função de métricas
    console.log('\n3️⃣ DADOS DA FUNÇÃO calculate_privacy_metrics:');
    
    const { data: metrics, error: metricsError } = await supabase.rpc('calculate_privacy_metrics');
    
    if (metricsError) {
      console.log('❌ ERRO na função:', metricsError.message);
      return;
    }

    console.log('✅ Função executada com sucesso');
    
    // 4. Comparar cada card do dashboard
    console.log('\n4️⃣ COMPARAÇÃO CARD POR CARD:');
    console.log('='.repeat(70));
    
    // Legal Bases
    const legalBasesReal = realCounts['legal_bases'];
    const legalBasesMetrics = metrics?.legal_bases?.total_bases || 0;
    console.log(`📋 BASES LEGAIS:`);
    console.log(`   Tabela: ${legalBasesReal} | Dashboard: ${legalBasesMetrics} | ${legalBasesReal === legalBasesMetrics ? '✅' : '❌'}`);
    
    // Consents 
    const consentsReal = realCounts['consents'];
    const consentsMetrics = metrics?.consents?.total_active || 0;
    console.log(`📋 CONSENTIMENTOS:`);
    console.log(`   Tabela: ${consentsReal} | Dashboard: ${consentsMetrics} | ${consentsReal === consentsMetrics ? '✅' : '❌'}`);
    
    // Inventory
    const inventoryReal = realCounts['data_inventory'];
    const inventoryMetrics = metrics?.data_inventory?.total_inventories || 0;
    console.log(`📋 INVENTÁRIO:`);
    console.log(`   Tabela: ${inventoryReal} | Dashboard: ${inventoryMetrics} | ${inventoryReal === inventoryMetrics ? '✅' : '❌'}`);
    
    // Data Subject Requests - PROBLEMA PROVÁVEL
    const requestsReal = realCounts['data_subject_requests'];
    const requestsMetrics = metrics?.data_subject_requests?.pending_requests || 0;
    const requestsTotal = metrics?.data_subject_requests?.total_requests || 0;
    console.log(`📋 SOLICITAÇÕES DE TITULARES:`);
    console.log(`   Tabela: ${requestsReal} | Dashboard (pending): ${requestsMetrics} | Dashboard (total): ${requestsTotal}`);
    console.log(`   Card usa 'pending_requests' mas deveria usar 'total_requests'? ${requestsReal === requestsTotal ? '✅' : '❌'}`);
    
    // Privacy Incidents - PROBLEMA PROVÁVEL  
    const incidentsReal = realCounts['privacy_incidents'];
    const incidentsMetrics = metrics?.privacy_incidents?.open_incidents || 0;
    const incidentsTotal = metrics?.privacy_incidents?.total_incidents || 0;
    console.log(`📋 INCIDENTES DE PRIVACIDADE:`);
    console.log(`   Tabela: ${incidentsReal} | Dashboard (open): ${incidentsMetrics} | Dashboard (total): ${incidentsTotal}`);
    console.log(`   Card usa 'open_incidents' mas deveria usar 'total_incidents'? ${incidentsReal === incidentsTotal ? '✅' : '❌'}`);
    
    // Processing Activities
    const activitiesReal = realCounts['processing_activities'];
    const activitiesMetrics = metrics?.processing_activities?.total_activities || 0;
    console.log(`📋 ATIVIDADES DE TRATAMENTO:`);
    console.log(`   Tabela: ${activitiesReal} | Dashboard: ${activitiesMetrics} | ${activitiesReal === activitiesMetrics ? '✅' : '❌'}`);
    
    // DPIA
    const dpiaReal = realCounts['dpia_assessments'];
    const dpiaMetrics = metrics?.dpia_assessments?.total_dpias || 0;
    const dpiaExists = metrics?.dpia_assessments ? 'SIM' : 'NÃO';
    console.log(`📋 DPIA:`);
    console.log(`   Tabela: ${dpiaReal} | Dashboard: ${dpiaMetrics} | Seção existe: ${dpiaExists}`);
    
    // 5. RESULTADO FINAL E CORREÇÕES NECESSÁRIAS
    console.log('\n' + '='.repeat(70));
    console.log('🔧 CORREÇÕES NECESSÁRIAS:');
    console.log('='.repeat(70));
    
    const corrections = [];
    
    if (requestsReal !== requestsMetrics && requestsReal === requestsTotal) {
      corrections.push('• Solicitações: Mudar de pending_requests para total_requests');
    }
    
    if (incidentsReal !== incidentsMetrics && incidentsReal === incidentsTotal) {
      corrections.push('• Incidentes: Mudar de open_incidents para total_incidents');
    }
    
    if (!metrics?.dpia_assessments) {
      corrections.push('• DPIA: Adicionar seção dpia_assessments na função');
    }
    
    if (corrections.length > 0) {
      console.log('Correções identificadas:');
      corrections.forEach(correction => console.log(correction));
    } else {
      console.log('✅ Todos os cards estão sincronizados!');
    }
    
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

diagnoseAllCards();