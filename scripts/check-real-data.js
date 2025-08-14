import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkRealData() {
  console.log('🔍 Verificando dados reais nas tabelas...');

  try {
    // Verificar solicitações de titulares
    console.log('\n📋 Solicitações de Titulares:');
    const { data: requests, error: requestsError } = await supabase
      .from('data_subject_requests')
      .select('id, status, request_type, received_at');

    if (requestsError) {
      console.log('❌ Erro ao buscar solicitações:', requestsError.message);
    } else if (requests) {
      console.log(`✅ Total de solicitações encontradas: ${requests.length}`);
      
      // Agrupar por status
      const statusCount = {};
      requests.forEach(req => {
        statusCount[req.status] = (statusCount[req.status] || 0) + 1;
      });
      
      console.log('📊 Por status:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

      // Agrupar por tipo
      const typeCount = {};
      requests.forEach(req => {
        typeCount[req.request_type] = (typeCount[req.request_type] || 0) + 1;
      });
      
      console.log('📊 Por tipo:');
      Object.entries(typeCount).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });
    } else {
      console.log('📝 Nenhuma solicitação encontrada');
    }

    // Verificar incidentes de privacidade
    console.log('\n🛡️ Incidentes de Privacidade:');
    const { data: incidents, error: incidentsError } = await supabase
      .from('privacy_incidents')
      .select('id, status, severity_level, discovered_at');

    if (incidentsError) {
      console.log('❌ Erro ao buscar incidentes:', incidentsError.message);
    } else if (incidents) {
      console.log(`✅ Total de incidentes encontrados: ${incidents.length}`);
      
      // Agrupar por status
      const statusCount = {};
      incidents.forEach(inc => {
        statusCount[inc.status] = (statusCount[inc.status] || 0) + 1;
      });
      
      console.log('📊 Por status:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });

      // Agrupar por severidade
      const severityCount = {};
      incidents.forEach(inc => {
        severityCount[inc.severity_level] = (severityCount[inc.severity_level] || 0) + 1;
      });
      
      console.log('📊 Por severidade:');
      Object.entries(severityCount).forEach(([severity, count]) => {
        console.log(`   ${severity}: ${count}`);
      });
    } else {
      console.log('📝 Nenhum incidente encontrado');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkRealData();