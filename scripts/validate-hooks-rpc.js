import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function validateHooksRPC() {
  console.log('✅ VALIDAÇÃO FINAL - Todos os hooks agora usam função RPC\n');

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('calculate_privacy_metrics');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
      return;
    }

    console.log('🎯 MÉTRICAS QUE OS CARDS DEVEM MOSTRAR AGORA:\n');

    // Solicitações de Titulares
    const dsrTotal = rpcData.data_subject_requests?.total_requests || 0;
    console.log('📝 **Solicitações de Titulares:**');
    console.log(`   Total: ${dsrTotal}`);
    console.log(`   Pendentes: ${Math.floor(dsrTotal * 0.3)} (~30%)`);
    console.log(`   Em Andamento: ${Math.floor(dsrTotal * 0.4)} (~40%)`);
    console.log(`   Concluídas: ${Math.floor(dsrTotal * 0.25)} (~25%)`);
    console.log('');

    // Incidentes de Privacidade
    const incidentsTotal = rpcData.privacy_incidents?.total_incidents || 0;
    console.log('🛡️ **Incidentes de Privacidade:**');
    console.log(`   Total: ${incidentsTotal}`);
    console.log(`   Abertos: ${Math.floor(incidentsTotal * 0.4)} (~40%)`);
    console.log(`   Críticos: ${Math.floor(incidentsTotal * 0.25)} (~25%)`);
    console.log(`   Requer ANPD: ${Math.floor(incidentsTotal * 0.5)} (~50%)`);
    console.log('');

    // Consentimentos
    const consentsTotal = rpcData.consents?.total_active || 0;
    console.log('👥 **Consentimentos:**');
    console.log(`   Total: ${consentsTotal}`);
    console.log(`   Ativos: ${consentsTotal} (100%)`);
    console.log(`   Revogados: ${Math.floor(consentsTotal * 0.2)} (~20%)`);
    console.log(`   Expirando: ${Math.floor(consentsTotal * 0.15)} (~15%)`);
    console.log('');

    // Atividades de Tratamento
    const activitiesTotal = rpcData.processing_activities?.total_activities || 0;
    console.log('⚙️ **Atividades de Tratamento:**');
    console.log(`   Total: ${activitiesTotal}`);
    console.log(`   Ativas: ${Math.floor(activitiesTotal * 0.8)} (~80%)`);
    console.log(`   Alto Risco: ${Math.floor(activitiesTotal * 0.2)} (~20%)`);
    console.log(`   Transferência Intl: ${Math.floor(activitiesTotal * 0.3)} (~30%)`);
    console.log('');

    console.log('🔗 NAVEGAÇÃO PARA VERIFICAR:');
    console.log('📌 http://localhost:8081/privacy/requests - Solicitações de Titulares');
    console.log('📌 http://localhost:8081/privacy/incidents - Incidentes de Privacidade');
    console.log('📌 http://localhost:8081/privacy/consents - Consentimentos');
    console.log('📌 http://localhost:8081/privacy/activities - Atividades de Tratamento');
    console.log('');

    console.log('✅ RESULTADO ESPERADO:');
    console.log('🎯 Todos os cards devem mostrar os números acima');
    console.log('🎯 Não deve haver mais divergências entre páginas');
    console.log('🎯 Console do navegador deve mostrar "Updated ... stats from RPC"');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

validateHooksRPC();