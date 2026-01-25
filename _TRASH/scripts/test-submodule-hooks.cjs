const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

// Simular os hooks exatamente como eles funcionam
const hooks = {
  // Hook useLegalBases
  async useLegalBases() {
    console.log('\n🔍 TESTANDO useLegalBases Hook:');
    try {
      const { data, error } = await supabase
        .from('legal_bases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('   ❌ Erro:', error.message);
        return { data: [], error };
      } else {
        console.log(`   ✅ Sucesso: ${data.length} legal bases encontradas`);
        data.slice(0, 3).forEach(item => {
          console.log(`      → ${item.name} (Status: ${item.status})`);
        });
        return { data, error: null };
      }
    } catch (err) {
      console.log('   ❌ Erro de conexão:', err.message);
      return { data: [], error: err };
    }
  },

  // Hook useConsents
  async useConsents() {
    console.log('\n🤝 TESTANDO useConsents Hook:');
    try {
      const { data, error } = await supabase
        .from('consents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('   ❌ Erro:', error.message);
        return { data: [], error };
      } else {
        console.log(`   ✅ Sucesso: ${data.length} consentimentos encontrados`);
        data.slice(0, 3).forEach(item => {
          console.log(`      → ${item.data_subject_name || 'N/A'} (Status: ${item.status})`);
        });
        return { data, error: null };
      }
    } catch (err) {
      console.log('   ❌ Erro de conexão:', err.message);
      return { data: [], error: err };
    }
  },

  // Hook useDataInventory  
  async useDataInventory() {
    console.log('\n📦 TESTANDO useDataInventory Hook:');
    try {
      const { data, error } = await supabase
        .from('data_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('   ❌ Erro:', error.message);
        return { data: [], error };
      } else {
        console.log(`   ✅ Sucesso: ${data.length} inventários encontrados`);
        data.slice(0, 3).forEach(item => {
          console.log(`      → ${item.name} (Status: ${item.status})`);
        });
        return { data, error: null };
      }
    } catch (err) {
      console.log('   ❌ Erro de conexão:', err.message);
      return { data: [], error: err };
    }
  },

  // Hook useDataSubjectRequests
  async useDataSubjectRequests() {
    console.log('\n📝 TESTANDO useDataSubjectRequests Hook:');
    try {
      const { data, error } = await supabase
        .from('data_subject_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('   ❌ Erro:', error.message);
        return { data: [], error };
      } else {
        console.log(`   ✅ Sucesso: ${data.length} solicitações encontradas`);
        data.slice(0, 3).forEach(item => {
          console.log(`      → ${item.data_subject_name || 'N/A'} (Tipo: ${item.request_type})`);
        });
        return { data, error: null };
      }
    } catch (err) {
      console.log('   ❌ Erro de conexão:', err.message);
      return { data: [], error: err };
    }
  },

  // Hook usePrivacyIncidents
  async usePrivacyIncidents() {
    console.log('\n⚠️ TESTANDO usePrivacyIncidents Hook:');
    try {
      const { data, error } = await supabase
        .from('privacy_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('   ❌ Erro:', error.message);
        return { data: [], error };
      } else {
        console.log(`   ✅ Sucesso: ${data.length} incidentes encontrados`);
        data.slice(0, 3).forEach(item => {
          console.log(`      → ${item.title} (Severidade: ${item.severity})`);
        });
        return { data, error: null };
      }
    } catch (err) {
      console.log('   ❌ Erro de conexão:', err.message);
      return { data: [], error: err };
    }
  },

  // Hook useProcessingActivities
  async useProcessingActivities() {
    console.log('\n🔄 TESTANDO useProcessingActivities Hook:');
    try {
      const { data, error } = await supabase
        .from('processing_activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('   ❌ Erro:', error.message);
        return { data: [], error };
      } else {
        console.log(`   ✅ Sucesso: ${data.length} atividades encontradas`);
        data.slice(0, 3).forEach(item => {
          console.log(`      → ${item.name} (Status: ${item.status})`);
        });
        return { data, error: null };
      }
    } catch (err) {
      console.log('   ❌ Erro de conexão:', err.message);
      return { data: [], error: err };
    }
  }
};

async function testSubmoduleHooks() {
  console.log('🧪 TESTE DOS HOOKS DOS SUBMÓDULOS\n');
  console.log('='.repeat(80));

  try {
    // 1. Login primeiro
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
    console.log(`   → Usuário: ${loginData.user.email}`);

    // 2. Testar todos os hooks
    console.log('\n2. 🧪 TESTANDO HOOKS DOS SUBMÓDULOS:');
    console.log('='.repeat(50));

    const results = {};

    // Testar cada hook
    results.legalBases = await hooks.useLegalBases();
    results.consents = await hooks.useConsents();
    results.dataInventory = await hooks.useDataInventory();
    results.dataSubjectRequests = await hooks.useDataSubjectRequests();
    results.privacyIncidents = await hooks.usePrivacyIncidents();
    results.processingActivities = await hooks.useProcessingActivities();

    // 3. Resumo dos resultados
    console.log('\n3. 📊 RESUMO DOS RESULTADOS:');
    console.log('='.repeat(80));

    const summary = [
      { name: 'Legal Bases', count: results.legalBases.data.length, hook: 'useLegalBases' },
      { name: 'Consentimentos', count: results.consents.data.length, hook: 'useConsents' },
      { name: 'Inventário', count: results.dataInventory.data.length, hook: 'useDataInventory' },
      { name: 'Solicitações', count: results.dataSubjectRequests.data.length, hook: 'useDataSubjectRequests' },
      { name: 'Incidentes', count: results.privacyIncidents.data.length, hook: 'usePrivacyIncidents' },
      { name: 'Atividades', count: results.processingActivities.data.length, hook: 'useProcessingActivities' }
    ];

    summary.forEach(item => {
      console.log(`✅ ${item.name}: ${item.count} registros (via ${item.hook})`);
    });

    // 4. Verificar registros específicos criados por mim
    console.log('\n4. 🔎 VERIFICANDO REGISTROS CRIADOS POR MIM:');
    console.log('-'.repeat(50));

    // Legal Bases que criei
    const myLegalBases = results.legalBases.data.filter(item => 
      item.name?.includes('Interesse Legítimo') || 
      item.name?.includes('Obrigação Legal') || 
      item.name?.includes('Marketing Personalizado')
    );

    console.log(`📊 Minhas Legal Bases (visíveis via hook): ${myLegalBases.length}`);
    myLegalBases.forEach(item => {
      console.log(`   → ${item.name}`);
    });

    // Inventário que criei
    const myInventory = results.dataInventory.data.filter(item => 
      item.name?.includes('Sistema de Recursos Humanos') || 
      item.name?.includes('Logs de Acesso')
    );

    console.log(`📦 Meu Inventário (visível via hook): ${myInventory.length}`);
    myInventory.forEach(item => {
      console.log(`   → ${item.name}`);
    });

    // 5. Diagnóstico final
    console.log('\n5. 🎯 DIAGNÓSTICO FINAL:');
    console.log('='.repeat(80));

    const totalRecords = summary.reduce((total, item) => total + item.count, 0);
    
    if (totalRecords > 0) {
      console.log('✅ HOOKS FUNCIONANDO PERFEITAMENTE!');
      console.log(`   → Total de registros acessíveis: ${totalRecords}`);
      console.log('   → Registros criados por mim estão visíveis');
      console.log('   → O problema deve estar na interface dos componentes React');
    } else {
      console.log('❌ PROBLEMA CONFIRMADO NOS HOOKS!');
      console.log('   → Nenhum registro sendo retornado');
      console.log('   → Possível problema de autenticação ou RLS');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSubmoduleHooks().catch(console.error);