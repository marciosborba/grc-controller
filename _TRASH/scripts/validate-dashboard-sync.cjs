const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function validateDashboardSync() {
  console.log('🔍 VALIDAÇÃO FINAL: Dashboard vs Submódulos\n');
  console.log('='.repeat(60));

  try {
    // 1. Login
    console.log('\n1. 🔑 FAZENDO LOGIN...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'dev@grc.local',
      password: 'dev123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }
    console.log('✅ Login realizado com sucesso');

    // 2. Testar função de métricas do dashboard
    console.log('\n2. 📊 TESTANDO MÉTRICAS DO DASHBOARD...');
    const { data: dashboardMetrics, error: dashboardError } = await supabase.rpc('calculate_privacy_metrics');

    if (dashboardError) {
      console.error('❌ Erro ao obter métricas do dashboard:', dashboardError.message);
    } else {
      console.log('✅ Métricas do dashboard obtidas com sucesso');
      console.log('   → Legal Bases (Dashboard):', dashboardMetrics.legal_bases?.total_bases || 0);
      console.log('   → Consentimentos Ativos (Dashboard):', dashboardMetrics.consents?.total_active || 0);
      console.log('   → Inventário (Dashboard):', dashboardMetrics.data_inventory?.total_inventories || 0);
      console.log('   → Solicitações (Dashboard):', dashboardMetrics.data_subject_requests?.total_requests || 0);
      console.log('   → Incidentes (Dashboard):', dashboardMetrics.privacy_incidents?.total_incidents || 0);
      console.log('   → Atividades (Dashboard):', dashboardMetrics.processing_activities?.total_activities || 0);
    }

    // 3. Testar dados diretos dos submódulos
    console.log('\n3. 📋 TESTANDO DADOS DOS SUBMÓDULOS...');

    const modules = [
      { name: 'legal_bases', label: 'Legal Bases' },
      { name: 'consents', label: 'Consentimentos' },
      { name: 'data_inventory', label: 'Inventário' },
      { name: 'data_subject_requests', label: 'Solicitações' },
      { name: 'privacy_incidents', label: 'Incidentes' },
      { name: 'processing_activities', label: 'Atividades' }
    ];

    const submoduleData = {};

    for (const module of modules) {
      const { data, error } = await supabase
        .from(module.name)
        .select('*');

      if (error) {
        console.log(`   ❌ ${module.label}: ${error.message}`);
        submoduleData[module.name] = { count: 0, accessible: false };
      } else {
        console.log(`   ✅ ${module.label}: ${data.length} registros acessíveis`);
        submoduleData[module.name] = { count: data.length, accessible: true, data: data };
      }
    }

    // 4. Comparação final
    console.log('\n4. ⚖️ COMPARAÇÃO DASHBOARD vs SUBMÓDULOS:');
    console.log('='.repeat(60));

    const comparisons = [
      {
        name: 'Legal Bases',
        dashboard: dashboardMetrics.legal_bases?.total_bases || 0,
        submodule: submoduleData.legal_bases?.count || 0
      },
      {
        name: 'Consentimentos',
        dashboard: dashboardMetrics.consents?.total_consents || 0,
        submodule: submoduleData.consents?.count || 0
      },
      {
        name: 'Inventário',
        dashboard: dashboardMetrics.data_inventory?.total_inventories || 0,
        submodule: submoduleData.data_inventory?.count || 0
      },
      {
        name: 'Solicitações',
        dashboard: dashboardMetrics.data_subject_requests?.total_requests || 0,
        submodule: submoduleData.data_subject_requests?.count || 0
      },
      {
        name: 'Incidentes',
        dashboard: dashboardMetrics.privacy_incidents?.total_incidents || 0,
        submodule: submoduleData.privacy_incidents?.count || 0
      },
      {
        name: 'Atividades',
        dashboard: dashboardMetrics.processing_activities?.total_activities || 0,
        submodule: submoduleData.processing_activities?.count || 0
      }
    ];

    let allSynced = true;
    for (const comp of comparisons) {
      const synced = comp.dashboard === comp.submodule;
      const status = synced ? '✅' : '❌';
      console.log(`${status} ${comp.name}: Dashboard=${comp.dashboard} | Submódulo=${comp.submodule}`);
      if (!synced) allSynced = false;
    }

    // 5. Resultado final
    console.log('\n5. 🏆 RESULTADO FINAL:');
    console.log('='.repeat(60));

    if (allSynced) {
      console.log('🎉 ✅ SINCRONIZAÇÃO PERFEITA!');
      console.log('   → Dashboard e submódulos mostram os mesmos números');
      console.log('   → Todos os dados estão acessíveis');
      console.log('   → Divergência TOTALMENTE RESOLVIDA!');
    } else {
      console.log('⚠️  DIVERGÊNCIAS ENCONTRADAS:');
      for (const comp of comparisons) {
        if (comp.dashboard !== comp.submodule) {
          console.log(`   → ${comp.name}: Dashboard=${comp.dashboard} ≠ Submódulo=${comp.submodule}`);
        }
      }
    }

    // 6. Status detalhado por módulo
    console.log('\n6. 📋 DETALHES POR MÓDULO:');
    console.log('   → Consentimentos Ativos:', dashboardMetrics.consents?.total_active || 0, 'de', submoduleData.consents?.count || 0, 'total');
    console.log('   → Solicitações Pendentes:', dashboardMetrics.data_subject_requests?.pending_requests || 0);
    console.log('   → Incidentes Abertos:', dashboardMetrics.privacy_incidents?.open_incidents || 0);
    console.log('   → Legal Bases Ativas:', dashboardMetrics.legal_bases?.active_bases || 0);

    console.log('\n🎯 VALIDAÇÃO CONCLUÍDA!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

validateDashboardSync().catch(console.error);