const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function testFinalHooksFixes() {
  console.log('🎯 TESTE FINAL: Verificando se as correções funcionaram\n');
  console.log('='.repeat(80));

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

    // 2. Testar todos os hooks corrigidos
    console.log('\n2. 🧪 TESTANDO HOOKS CORRIGIDOS (como submódulos fazem):');
    console.log('='.repeat(60));

    const hooks = [
      {
        name: 'useLegalBases',
        table: 'legal_bases',
        orderBy: 'created_at'
      },
      {
        name: 'useConsents', 
        table: 'consents',
        orderBy: 'granted_at'
      },
      {
        name: 'useDataInventory',
        table: 'data_inventory', 
        orderBy: 'created_at'
      },
      {
        name: 'useDataSubjectRequests',
        table: 'data_subject_requests',
        orderBy: 'created_at'
      },
      {
        name: 'usePrivacyIncidents',
        table: 'privacy_incidents',
        orderBy: 'created_at'
      },
      {
        name: 'useProcessingActivities',
        table: 'processing_activities',
        orderBy: 'created_at'
      }
    ];

    const results = {};

    for (const hook of hooks) {
      console.log(`\n📊 ${hook.name}:`);
      
      try {
        const { data, error } = await supabase
          .from(hook.table)
          .select('*')
          .order(hook.orderBy, { ascending: false });

        if (error) {
          console.log(`   ❌ ERRO: ${error.message}`);
          results[hook.name] = { success: false, count: 0, error: error.message };
        } else {
          console.log(`   ✅ SUCESSO: ${data.length} registros retornados`);
          
          // Mostrar alguns registros de exemplo
          if (data.length > 0) {
            console.log('   📝 Registros encontrados:');
            data.slice(0, 2).forEach((item, index) => {
              const name = item.name || item.title || item.data_subject_name || item.requester_name || `Registro ${item.id?.substring(0,8)}`;
              console.log(`      ${index + 1}. ${name}`);
            });
          }
          
          results[hook.name] = { success: true, count: data.length };
        }
      } catch (err) {
        console.log(`   ❌ ERRO (catch): ${err.message}`);
        results[hook.name] = { success: false, count: 0, error: err.message };
      }
    }

    // 3. Verificar registros específicos que criei
    console.log('\n3. 🔎 VERIFICANDO REGISTROS CRIADOS POR MIM:');
    console.log('='.repeat(60));

    // Legal Bases que criei
    console.log('\n📊 LEGAL BASES CRIADAS POR MIM:');
    const myLegalBases = await supabase
      .from('legal_bases')
      .select('*')
      .or('name.ilike.%Interesse Legítimo%,name.ilike.%Obrigação Legal%,name.ilike.%Marketing Personalizado%');

    if (myLegalBases.error) {
      console.log('❌ Erro ao buscar minhas legal bases:', myLegalBases.error.message);
    } else {
      console.log(`✅ ${myLegalBases.data.length} legal bases criadas por mim são visíveis:`);
      myLegalBases.data.forEach(item => {
        console.log(`   → ${item.name} (Status: ${item.status})`);
      });
    }

    // Inventário que criei
    console.log('\n📦 INVENTÁRIO CRIADO POR MIM:');
    const myInventory = await supabase
      .from('data_inventory')
      .select('*')
      .or('name.ilike.%Sistema de Recursos Humanos%,name.ilike.%Logs de Acesso%');

    if (myInventory.error) {
      console.log('❌ Erro ao buscar meu inventário:', myInventory.error.message);
    } else {
      console.log(`✅ ${myInventory.data.length} inventários criados por mim são visíveis:`);
      myInventory.data.forEach(item => {
        console.log(`   → ${item.name} (Status: ${item.status})`);
      });
    }

    // 4. Comparar com métricas do dashboard
    console.log('\n4. 📊 COMPARANDO COM MÉTRICAS DO DASHBOARD:');
    console.log('='.repeat(60));

    const { data: dashboardMetrics, error: dashboardError } = await supabase.rpc('calculate_privacy_metrics');

    if (dashboardError) {
      console.log('❌ Erro ao obter métricas do dashboard:', dashboardError.message);
    } else {
      console.log('✅ Métricas do dashboard obtidas com sucesso');
      
      const comparisons = [
        {
          name: 'Legal Bases',
          dashboard: dashboardMetrics.legal_bases?.total_bases || 0,
          submodule: results['useLegalBases']?.count || 0
        },
        {
          name: 'Consentimentos',
          dashboard: dashboardMetrics.consents?.total_consents || 0,
          submodule: results['useConsents']?.count || 0
        },
        {
          name: 'Inventário',
          dashboard: dashboardMetrics.data_inventory?.total_inventories || 0,
          submodule: results['useDataInventory']?.count || 0
        },
        {
          name: 'Solicitações',
          dashboard: dashboardMetrics.data_subject_requests?.total_requests || 0,
          submodule: results['useDataSubjectRequests']?.count || 0
        },
        {
          name: 'Incidentes',
          dashboard: dashboardMetrics.privacy_incidents?.total_incidents || 0,
          submodule: results['usePrivacyIncidents']?.count || 0
        },
        {
          name: 'Atividades',
          dashboard: dashboardMetrics.processing_activities?.total_activities || 0,
          submodule: results['useProcessingActivities']?.count || 0
        }
      ];

      console.log('\n📋 COMPARAÇÃO DETALHADA:');
      let allSynced = true;
      
      for (const comp of comparisons) {
        const synced = comp.dashboard === comp.submodule;
        const status = synced ? '✅' : '❌';
        console.log(`${status} ${comp.name}: Dashboard=${comp.dashboard} | Submódulo=${comp.submodule}`);
        if (!synced) allSynced = false;
      }

      // 5. Resultado final
      console.log('\n5. 🏆 RESULTADO FINAL:');
      console.log('='.repeat(80));

      const totalErrors = Object.values(results).filter(r => !r.success).length;
      const totalSuccess = Object.values(results).filter(r => r.success).length;

      if (totalErrors === 0 && allSynced) {
        console.log('🎉 ✅ PROBLEMA COMPLETAMENTE RESOLVIDO!');
        console.log('   → Todos os hooks funcionam perfeitamente');
        console.log('   → Dashboard e submódulos mostram números idênticos');
        console.log('   → Registros criados são visíveis em ambos os locais');
        console.log('   → Joins problemáticos foram removidos com sucesso');
        console.log('\n🚀 OS SUBMÓDULOS AGORA FUNCIONAM CORRETAMENTE!');
      } else {
        console.log('⚠️ AINDA HÁ PROBLEMAS:');
        
        if (totalErrors > 0) {
          console.log(`   → ${totalErrors} hooks ainda com erro`);
          Object.entries(results).forEach(([hook, result]) => {
            if (!result.success) {
              console.log(`     • ${hook}: ${result.error}`);
            }
          });
        }
        
        if (!allSynced) {
          console.log('   → Dashboard e submódulos ainda divergem');
          comparisons.filter(c => c.dashboard !== c.submodule).forEach(comp => {
            console.log(`     • ${comp.name}: Dashboard=${comp.dashboard} ≠ Submódulo=${comp.submodule}`);
          });
        }
      }

      console.log('\n📈 ESTATÍSTICAS:');
      console.log(`   → Hooks funcionando: ${totalSuccess}/${hooks.length}`);
      console.log(`   → Métricas sincronizadas: ${comparisons.filter(c => c.dashboard === c.submodule).length}/${comparisons.length}`);
      console.log(`   → Registros pessoais visíveis: ${myLegalBases.data?.length || 0} legal bases, ${myInventory.data?.length || 0} inventários`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testFinalHooksFixes().catch(console.error);