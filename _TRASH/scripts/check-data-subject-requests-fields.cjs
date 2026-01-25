const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function checkDataSubjectRequestsFields() {
  console.log('🔍 VERIFICANDO CAMPOS DE DATA_SUBJECT_REQUESTS\n');

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

    // 2. Buscar um registro para ver a estrutura
    const { data, error } = await supabase
      .from('data_subject_requests')
      .select('*')
      .limit(3);

    if (error) {
      console.error('❌ Erro ao buscar registros:', error.message);
      return;
    }

    console.log('\n📋 ESTRUTURA DOS REGISTROS:');
    console.log('Total de registros:', data.length);

    if (data.length > 0) {
      console.log('\n📝 CAMPOS DISPONÍVEIS (primeiro registro):');
      const firstRecord = data[0];
      
      Object.keys(firstRecord).forEach(key => {
        const value = firstRecord[key];
        const type = typeof value;
        const isNull = value === null;
        const isEmpty = value === '';
        
        console.log(`   ${key}: ${isNull ? 'NULL' : isEmpty ? 'EMPTY' : value} (${type})`);
      });

      console.log('\n📋 TODOS OS REGISTROS:');
      data.forEach((record, index) => {
        console.log(`\n${index + 1}. ID: ${record.id}`);
        console.log(`   data_subject_name: ${record.data_subject_name || 'NULL'}`);
        console.log(`   requester_name: ${record.requester_name || 'NULL'}`);
        console.log(`   data_subject_email: ${record.data_subject_email || 'NULL'}`);
        console.log(`   requester_email: ${record.requester_email || 'NULL'}`);
        console.log(`   request_type: ${record.request_type || 'NULL'}`);
        console.log(`   description: ${record.description || 'NULL'}`);
        console.log(`   request_description: ${record.request_description || 'NULL'}`);
      });

      console.log('\n🔧 DIAGNÓSTICO:');
      const hasRequesterName = data.some(r => r.requester_name);
      const hasDataSubjectName = data.some(r => r.data_subject_name);
      const hasRequesterEmail = data.some(r => r.requester_email);
      const hasDataSubjectEmail = data.some(r => r.data_subject_email);
      
      console.log(`   → requester_name presente: ${hasRequesterName ? 'SIM' : 'NÃO'}`);
      console.log(`   → data_subject_name presente: ${hasDataSubjectName ? 'SIM' : 'NÃO'}`);
      console.log(`   → requester_email presente: ${hasRequesterEmail ? 'SIM' : 'NÃO'}`);
      console.log(`   → data_subject_email presente: ${hasDataSubjectEmail ? 'SIM' : 'NÃO'}`);

      console.log('\n💡 CORREÇÃO NECESSÁRIA:');
      if (!hasRequesterName && hasDataSubjectName) {
        console.log('   → Usar data_subject_name em vez de requester_name');
      }
      if (!hasRequesterEmail && hasDataSubjectEmail) {
        console.log('   → Usar data_subject_email em vez de requester_email');
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkDataSubjectRequestsFields().catch(console.error);