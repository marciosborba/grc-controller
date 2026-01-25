import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function simpleDataCheck() {
  console.log('🔍 Verificação simples de dados...');

  try {
    // Contar solicitações de titulares
    console.log('\n📋 Contando solicitações de titulares...');
    const { count: requestsCount, error: requestsError } = await supabase
      .from('data_subject_requests')
      .select('*', { count: 'exact', head: true });

    if (requestsError) {
      console.log('❌ Erro:', requestsError.message);
    } else {
      console.log(`✅ Total de solicitações: ${requestsCount || 0}`);
      
      // Tentar buscar algumas solicitações para ver quais campos existem
      const { data: sampleRequests, error: sampleError } = await supabase
        .from('data_subject_requests')
        .select('*')
        .limit(1);
        
      if (!sampleError && sampleRequests && sampleRequests.length > 0) {
        console.log('📊 Campos disponíveis:', Object.keys(sampleRequests[0]));
      }
    }

    // Contar incidentes de privacidade
    console.log('\n🛡️ Contando incidentes de privacidade...');
    const { count: incidentsCount, error: incidentsError } = await supabase
      .from('privacy_incidents')
      .select('*', { count: 'exact', head: true });

    if (incidentsError) {
      console.log('❌ Erro:', incidentsError.message);
    } else {
      console.log(`✅ Total de incidentes: ${incidentsCount || 0}`);
      
      // Tentar buscar alguns incidentes para ver quais campos existem
      const { data: sampleIncidents, error: sampleError } = await supabase
        .from('privacy_incidents')
        .select('*')
        .limit(1);
        
      if (!sampleError && sampleIncidents && sampleIncidents.length > 0) {
        console.log('📊 Campos disponíveis:', Object.keys(sampleIncidents[0]));
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

simpleDataCheck();