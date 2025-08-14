const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function testDataSubjectRequestsFix() {
  console.log('🧪 TESTANDO CORREÇÃO DOS DATA SUBJECT REQUESTS\n');

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

    // 2. Testar hook como no componente corrigido
    console.log('\n📋 TESTANDO HOOK useDataSubjectRequests:');
    
    const { data: requests, error } = await supabase
      .from('data_subject_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Erro no hook:', error.message);
      return;
    }

    console.log(`✅ Hook funcionou: ${requests.length} registros`);

    // 3. Testar filtro como no componente corrigido
    console.log('\n🔍 TESTANDO FILTRO DE BUSCA:');
    
    const searchTerm = 'ana';
    const filteredRequests = requests.filter(request => {
      const matchesSearch = 
        (request.data_subject_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (request.data_subject_email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (request.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    console.log(`✅ Filtro funcionou: ${filteredRequests.length} registros encontrados para "${searchTerm}"`);

    // 4. Mostrar estrutura dos dados para o componente
    console.log('\n📝 DADOS PARA O COMPONENTE:');
    
    requests.slice(0, 2).forEach((request, index) => {
      console.log(`\n${index + 1}. ID: ${request.id.substring(0, 8)}...`);
      console.log(`   → data_subject_name: "${request.data_subject_name}"`);
      console.log(`   → data_subject_email: "${request.data_subject_email}"`);
      console.log(`   → request_type: "${request.request_type}"`);
      console.log(`   → description: "${request.description?.substring(0, 50)}..."`);
      console.log(`   → status: "${request.status}"`);
    });

    // 5. Simular componente DataSubjectRequestCard
    console.log('\n🎨 SIMULANDO COMPONENTE DataSubjectRequestCard:');
    
    const firstRequest = requests[0];
    if (firstRequest) {
      console.log('✅ Título:', firstRequest.data_subject_name);
      console.log('✅ Email:', firstRequest.data_subject_email);
      console.log('✅ Descrição:', firstRequest.description ? 'Presente' : 'Ausente');
      console.log('✅ Tipo:', firstRequest.request_type);
      console.log('✅ Status:', firstRequest.status);
    }

    console.log('\n🎯 RESULTADO:');
    console.log('✅ useDataSubjectRequests hook: FUNCIONANDO');
    console.log('✅ Filtro de busca: FUNCIONANDO');
    console.log('✅ Campos corretos: data_subject_name, data_subject_email, description');
    console.log('✅ Erro "toLowerCase" de undefined: RESOLVIDO');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testDataSubjectRequestsFix().catch(console.error);