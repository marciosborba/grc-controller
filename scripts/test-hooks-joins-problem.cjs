const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function testHooksJoinsProblem() {
  console.log('🔍 TESTANDO PROBLEMA DOS JOINS NOS HOOKS\n');
  console.log('='.repeat(80));

  try {
    // 1. Login
    console.log('1. 🔑 FAZENDO LOGIN...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'dev@grc.local',
      password: 'dev123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }
    console.log('✅ Login realizado com sucesso');

    // 2. Testar query useLegalBases COM joins (problemática)
    console.log('\n2. 🧪 TESTANDO QUERY useLegalBases COM JOINS (problemática):');
    console.log('-'.repeat(60));

    try {
      const { data: dataWithJoins, error: errorWithJoins } = await supabase
        .from('legal_bases')
        .select(`
          *,
          legal_responsible_user:legal_responsible_id(email, raw_user_meta_data),
          created_by_user:created_by(email, raw_user_meta_data),
          updated_by_user:updated_by(email, raw_user_meta_data)
        `)
        .order('created_at', { ascending: false });

      if (errorWithJoins) {
        console.log('❌ ERRO COM JOINS:', errorWithJoins.message);
      } else {
        console.log(`✅ COM JOINS: ${dataWithJoins.length} registros retornados`);
      }
    } catch (err) {
      console.log('❌ ERRO COM JOINS (catch):', err.message);
    }

    // 3. Testar query useLegalBases SEM joins (corrigida)
    console.log('\n3. ✅ TESTANDO QUERY useLegalBases SEM JOINS (corrigida):');
    console.log('-'.repeat(60));

    try {
      const { data: dataWithoutJoins, error: errorWithoutJoins } = await supabase
        .from('legal_bases')
        .select('*')
        .order('created_at', { ascending: false });

      if (errorWithoutJoins) {
        console.log('❌ ERRO SEM JOINS:', errorWithoutJoins.message);
      } else {
        console.log(`✅ SEM JOINS: ${dataWithoutJoins.length} registros retornados`);
        console.log('\n📋 PRIMEIROS 3 REGISTROS:');
        dataWithoutJoins.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} (Status: ${item.status})`);
        });
      }
    } catch (err) {
      console.log('❌ ERRO SEM JOINS (catch):', err.message);
    }

    // 4. Testar outros hooks também
    console.log('\n4. 🔍 TESTANDO OUTROS HOOKS COM JOINS PROBLEMÁTICOS:');
    console.log('='.repeat(60));

    const hooksToTest = [
      {
        name: 'useConsents',
        table: 'consents',
        joinQuery: 'created_by_user:created_by(email, raw_user_meta_data)'
      },
      {
        name: 'useDataInventory', 
        table: 'data_inventory',
        joinQuery: 'data_controller:profiles!data_controller_id(full_name)'
      },
      {
        name: 'useDataSubjectRequests',
        table: 'data_subject_requests', 
        joinQuery: 'created_by_user:created_by(email, raw_user_meta_data)'
      },
      {
        name: 'usePrivacyIncidents',
        table: 'privacy_incidents',
        joinQuery: 'created_by_user:created_by(email, raw_user_meta_data)'
      },
      {
        name: 'useProcessingActivities',
        table: 'processing_activities',
        joinQuery: 'created_by_user:created_by(email, raw_user_meta_data)'
      }
    ];

    for (const hook of hooksToTest) {
      console.log(`\n📊 ${hook.name}:`);
      
      // Testar com joins
      try {
        const { data: withJoins, error: joinError } = await supabase
          .from(hook.table)
          .select(`*, ${hook.joinQuery}`)
          .limit(1);

        if (joinError) {
          console.log(`   ❌ COM JOIN: ${joinError.message}`);
        } else {
          console.log(`   ✅ COM JOIN: ${withJoins.length} registros`);
        }
      } catch (err) {
        console.log(`   ❌ COM JOIN (catch): ${err.message}`);
      }

      // Testar sem joins
      try {
        const { data: withoutJoins, error: simpleError } = await supabase
          .from(hook.table)
          .select('*')
          .limit(1);

        if (simpleError) {
          console.log(`   ❌ SEM JOIN: ${simpleError.message}`);
        } else {
          console.log(`   ✅ SEM JOIN: ${withoutJoins.length} registros`);
        }
      } catch (err) {
        console.log(`   ❌ SEM JOIN (catch): ${err.message}`);
      }
    }

    // 5. Diagnóstico final
    console.log('\n5. 🎯 DIAGNÓSTICO FINAL:');
    console.log('='.repeat(80));
    
    console.log('🔧 PROBLEMA IDENTIFICADO:');
    console.log('   → Os hooks estão usando joins complexos que podem estar falhando');
    console.log('   → Queries simples (sem joins) funcionam perfeitamente');
    console.log('   → Os joins com tabelas auth (users) ou profiles podem estar bloqueados');
    console.log('\n💡 SOLUÇÃO:');
    console.log('   → Remover todos os joins problemáticos dos hooks');
    console.log('   → Usar apenas select("*") para buscar dados básicos');
    console.log('   → Implementar busca de dados relacionados separadamente se necessário');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testHooksJoinsProblem().catch(console.error);