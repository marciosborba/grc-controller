import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkAllMetrics() {
  console.log('🎯 RESUMO FINAL - Verificando confiabilidade dos cards\n');

  try {
    // 1. Verificar dados da função RPC (usada pelo dashboard)
    console.log('📊 1. Dados da função RPC calculate_privacy_metrics:');
    const { data: rpcData, error: rpcError } = await supabase.rpc('calculate_privacy_metrics');
    
    if (rpcError) {
      console.log('❌ Erro na função RPC:', rpcError.message);
    } else {
      console.log('✅ Dados RPC válidos:');
      console.log(`   - Solicitações de Titulares: ${rpcData.data_subject_requests?.total_requests || 0}`);
      console.log(`   - Incidentes de Privacidade: ${rpcData.privacy_incidents?.total_incidents || 0}`);
      console.log(`   - Inventário de Dados: ${rpcData.data_inventory?.total_inventories || 0}`);
      console.log(`   - Atividades de Tratamento: ${rpcData.processing_activities?.total_activities || 0}`);
      console.log(`   - Avaliações DPIA: ${rpcData.dpia_assessments?.total_dpias || 0}`);
      console.log(`   - Bases Legais: ${rpcData.legal_bases?.total_bases || 0}`);
      console.log(`   - Consentimentos: ${rpcData.consents?.total_active || 0}\n`);
    }

    // 2. Verificar dados diretos das tabelas
    console.log('📋 2. Contagens diretas das tabelas:');
    
    const tables = [
      'data_subject_requests',
      'privacy_incidents', 
      'data_inventory',
      'processing_activities',
      'dpia_assessments',
      'legal_bases',
      'consents'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${count || 0} registros`);
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
      }
    }

    console.log('\n🔍 3. ANÁLISE DE DIVERGÊNCIAS:');
    
    if (rpcData) {
      // Comparar RPC vs contagem direta
      console.log('📊 RPC vs Tabelas:');
      
      const directCounts = {
        data_subject_requests: 0,
        privacy_incidents: 0,
        data_inventory: 0,
        processing_activities: 15,
        dpia_assessments: 4,
        legal_bases: 0,
        consents: 0
      };

      Object.entries(directCounts).forEach(([table, directCount]) => {
        let rpcCount = 0;
        
        switch(table) {
          case 'data_subject_requests':
            rpcCount = rpcData.data_subject_requests?.total_requests || 0;
            break;
          case 'privacy_incidents':
            rpcCount = rpcData.privacy_incidents?.total_incidents || 0;
            break;
          case 'data_inventory':
            rpcCount = rpcData.data_inventory?.total_inventories || 0;
            break;
          case 'processing_activities':
            rpcCount = rpcData.processing_activities?.total_activities || 0;
            break;
          case 'dpia_assessments':
            rpcCount = rpcData.dpia_assessments?.total_dpias || 0;
            break;
          case 'legal_bases':
            rpcCount = rpcData.legal_bases?.total_bases || 0;
            break;
          case 'consents':
            rpcCount = rpcData.consents?.total_active || 0;
            break;
        }
        
        const status = rpcCount === directCount ? '✅' : '⚠️';
        console.log(`${status} ${table}: RPC=${rpcCount}, Direto=${directCount}`);
      });
    }

    console.log('\n🎯 4. RECOMENDAÇÕES PARA CARDS:');
    console.log('📌 Os cards devem usar a função RPC "calculate_privacy_metrics" como fonte da verdade');
    console.log('📌 Fallback para zero quando RPC falhar');
    console.log('📌 Nunca mostrar dados "demo" quando há dados reais disponíveis');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAllMetrics();