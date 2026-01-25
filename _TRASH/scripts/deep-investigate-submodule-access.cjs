const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabaseAnon = createClient(supabaseUrl, anonKey);
const supabaseService = createClient(supabaseUrl, serviceKey);

async function deepInvestigateSubmoduleAccess() {
  console.log('🔍 INVESTIGAÇÃO PROFUNDA: Por que submódulos não veem os dados?\n');
  console.log('='.repeat(80));

  try {
    // 1. Verificar dados com Service Role (como dashboard)
    console.log('\n1. 📊 DADOS VIA SERVICE ROLE (como dashboard vê):');
    console.log('-'.repeat(50));

    const serviceData = {};
    const tables = ['legal_bases', 'consents', 'data_inventory', 'data_subject_requests', 'privacy_incidents', 'processing_activities'];

    for (const table of tables) {
      const { data, error } = await supabaseService.from(table).select('*');
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        serviceData[table] = [];
      } else {
        console.log(`   ✅ ${table}: ${data.length} registros`);
        serviceData[table] = data;
      }
    }

    // 2. Login como usuário e testar acesso
    console.log('\n2. 🔑 FAZENDO LOGIN COMO USUÁRIO:');
    console.log('-'.repeat(50));

    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: 'dev@grc.local',
      password: 'dev123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso');
    console.log(`   → Usuário: ${loginData.user.email}`);
    console.log(`   → ID: ${loginData.user.id}`);

    // 3. Testar acesso aos dados com usuário logado (como submódulos)
    console.log('\n3. 📋 DADOS VIA ANON KEY + LOGIN (como submódulos veem):');
    console.log('-'.repeat(50));

    const anonData = {};
    
    for (const table of tables) {
      const { data, error } = await supabaseAnon.from(table).select('*');
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        anonData[table] = [];
      } else {
        console.log(`   ✅ ${table}: ${data.length} registros`);
        anonData[table] = data;
      }
    }

    // 4. Comparação direta
    console.log('\n4. ⚖️ COMPARAÇÃO SERVICE vs ANON:');
    console.log('='.repeat(80));

    for (const table of tables) {
      const serviceCount = serviceData[table]?.length || 0;
      const anonCount = anonData[table]?.length || 0;
      const diff = serviceCount - anonCount;
      
      if (diff === 0) {
        console.log(`✅ ${table}: Service=${serviceCount} | Anon=${anonCount} (IGUAIS)`);
      } else {
        console.log(`❌ ${table}: Service=${serviceCount} | Anon=${anonCount} (DIFERENÇA: ${diff})`);
        
        // Mostrar registros que estão no service mas não no anon
        if (serviceCount > anonCount && serviceData[table].length > 0) {
          console.log(`   📝 Registros apenas no Service (${diff}):`);
          const anonIds = new Set(anonData[table]?.map(r => r.id) || []);
          const missingInAnon = serviceData[table].filter(r => !anonIds.has(r.id));
          
          missingInAnon.slice(0, 3).forEach(record => {
            console.log(`      → ID: ${record.id} | Nome: ${record.name || record.title || record.data_subject_name || 'N/A'}`);
          });
          
          if (missingInAnon.length > 3) {
            console.log(`      → ...e mais ${missingInAnon.length - 3} registros`);
          }
        }
      }
    }

    // 5. Análise específica dos registros criados recentemente
    console.log('\n5. 🔎 ANALISANDO REGISTROS CRIADOS RECENTEMENTE:');
    console.log('-'.repeat(50));

    // Verificar legal_bases criadas recentemente
    const recentLegalBases = serviceData.legal_bases?.filter(item => 
      item.name?.includes('Interesse Legítimo') || 
      item.name?.includes('Obrigação Legal') || 
      item.name?.includes('Marketing Personalizado')
    ) || [];

    console.log(`   📊 Legal Bases criadas por mim (Service): ${recentLegalBases.length}`);
    recentLegalBases.forEach(item => {
      console.log(`      → ${item.name} (ID: ${item.id})`);
    });

    const recentLegalBasesAnon = anonData.legal_bases?.filter(item => 
      item.name?.includes('Interesse Legítimo') || 
      item.name?.includes('Obrigação Legal') || 
      item.name?.includes('Marketing Personalizado')
    ) || [];

    console.log(`   📋 Legal Bases criadas por mim (Anon): ${recentLegalBasesAnon.length}`);
    recentLegalBasesAnon.forEach(item => {
      console.log(`      → ${item.name} (ID: ${item.id})`);
    });

    // Verificar inventário criado recentemente  
    const recentInventory = serviceData.data_inventory?.filter(item => 
      item.name?.includes('Sistema de Recursos Humanos') || 
      item.name?.includes('Logs de Acesso')
    ) || [];

    console.log(`   📦 Inventário criado por mim (Service): ${recentInventory.length}`);
    recentInventory.forEach(item => {
      console.log(`      → ${item.name} (ID: ${item.id})`);
    });

    const recentInventoryAnon = anonData.data_inventory?.filter(item => 
      item.name?.includes('Sistema de Recursos Humanos') || 
      item.name?.includes('Logs de Acesso')
    ) || [];

    console.log(`   📋 Inventário criado por mim (Anon): ${recentInventoryAnon.length}`);
    recentInventoryAnon.forEach(item => {
      console.log(`      → ${item.name} (ID: ${item.id})`);
    });

    // 6. Testar RLS policies
    console.log('\n6. 🔒 VERIFICANDO RLS POLICIES:');
    console.log('-'.repeat(50));

    for (const table of tables) {
      try {
        const { data: policies, error } = await supabaseService
          .from('pg_policies')
          .select('*')
          .eq('tablename', table);

        if (error) {
          console.log(`   ❓ ${table}: Erro ao verificar policies - ${error.message}`);
        } else if (policies.length === 0) {
          console.log(`   ✅ ${table}: Sem RLS policies (acesso livre)`);
        } else {
          console.log(`   🔒 ${table}: ${policies.length} policies ativas`);
          policies.forEach(policy => {
            console.log(`      → ${policy.policyname}: ${policy.cmd} - ${policy.qual || 'N/A'}`);
          });
        }
      } catch (err) {
        console.log(`   ⚠️ ${table}: Não foi possível verificar policies`);
      }
    }

    // 7. Resultado e recomendações
    console.log('\n7. 🎯 DIAGNÓSTICO E SOLUÇÃO:');
    console.log('='.repeat(80));

    let totalDiff = 0;
    for (const table of tables) {
      const serviceCount = serviceData[table]?.length || 0;
      const anonCount = anonData[table]?.length || 0;
      totalDiff += (serviceCount - anonCount);
    }

    if (totalDiff === 0) {
      console.log('✅ PROBLEMA RESOLVIDO: Ambos os acessos veem os mesmos dados!');
    } else {
      console.log('❌ PROBLEMA CONFIRMADO: Service vê mais dados que Anon');
      console.log(`   → Diferença total: ${totalDiff} registros`);
      console.log('\n🔧 POSSÍVEIS CAUSAS:');
      console.log('   1. RLS policies bloqueando acesso para usuários logados');
      console.log('   2. Dados criados com permissões incorretas');
      console.log('   3. Problemas de autenticação/autorização');
      console.log('   4. Filtros nos hooks dos submódulos');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

deepInvestigateSubmoduleAccess().catch(console.error);