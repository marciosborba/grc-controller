const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, serviceKey);

async function calculateCorrectMetrics() {
  console.log('🔧 CALCULANDO MÉTRICAS CORRETAS DIRETAMENTE\n');

  try {
    // Buscar dados diretamente das tabelas
    const tables = ['legal_bases', 'consents', 'data_inventory', 'data_subject_requests', 'privacy_incidents', 'processing_activities'];
    const rawData = {};
    
    console.log('1. 📊 COLETANDO DADOS REAIS:');
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.log('❌ ' + table + ': ' + error.message);
        rawData[table] = [];
      } else {
        rawData[table] = data || [];
        console.log('✅ ' + table + ': ' + (data?.length || 0) + ' registros');
      }
    }
    
    console.log('\n2. 🧮 CALCULANDO MÉTRICAS CORRETAS:');
    
    // Legal Bases
    const legalBases = rawData.legal_bases;
    const legalBasesMetrics = {
      total_bases: legalBases.length,
      active_bases: legalBases.filter(item => item.status === 'active').length,
      suspended_bases: legalBases.filter(item => item.status === 'suspended').length,
      expired_bases: legalBases.filter(item => item.status === 'expired').length,
      expiring_soon: 0,
      needs_validation: legalBases.filter(item => item.is_validated === false || item.is_validated === null).length
    };
    console.log('   → Legal Bases:', legalBasesMetrics.total_bases);
    
    // Consents 
    const consents = rawData.consents;
    const consentsMetrics = {
      total_consents: consents.length,
      total_active: consents.filter(item => item.status === 'granted').length,
      total_revoked: consents.filter(item => item.status === 'revoked').length,
      total_expired: consents.filter(item => item.status === 'expired').length,
      expiring_soon: 0
    };
    console.log('   → Consentimentos ativos:', consentsMetrics.total_active, 'de', consentsMetrics.total_consents, 'total');
    
    // Data Inventory
    const inventory = rawData.data_inventory;
    const inventoryMetrics = {
      total_inventories: inventory.length,
      active_inventories: inventory.filter(item => item.status === 'active').length,
      needs_review: inventory.length, // Simplificado
      by_sensitivity: {
        alta: inventory.filter(item => item.sensitivity_level === 'alta').length,
        media: inventory.filter(item => item.sensitivity_level === 'media').length,
        baixa: inventory.filter(item => item.sensitivity_level === 'baixa').length
      }
    };
    console.log('   → Inventário:', inventoryMetrics.total_inventories);
    
    // Data Subject Requests
    const requests = rawData.data_subject_requests;
    const requestsMetrics = {
      total_requests: requests.length,
      pending_requests: requests.filter(item => 
        ['received', 'under_verification', 'in_progress', 'em_processamento'].includes(item.status)).length,
      completed_requests: requests.filter(item => item.status === 'completed').length,
      overdue_requests: 0,
      by_type: {
        acesso: requests.filter(item => item.request_type === 'acesso').length,
        correcao: requests.filter(item => item.request_type === 'correcao').length,
        exclusao: requests.filter(item => item.request_type === 'exclusao').length
      }
    };
    console.log('   → Solicitações:', requestsMetrics.total_requests, '(', requestsMetrics.pending_requests, 'pendentes)');
    
    // Privacy Incidents
    const incidents = rawData.privacy_incidents;
    const incidentsMetrics = {
      total_incidents: incidents.length,
      open_incidents: incidents.filter(item => 
        ['aberto', 'investigando', 'em_remediacao'].includes(item.status)).length,
      closed_incidents: incidents.filter(item => 
        ['resolvido', 'fechado'].includes(item.status)).length,
      anpd_notifications_required: incidents.filter(item => 
        item.requires_anpd_notification === true && item.anpd_notified !== true).length,
      by_severity: {
        critica: incidents.filter(item => item.severity === 'critica').length,
        alta: incidents.filter(item => item.severity === 'alta').length,
        media: incidents.filter(item => item.severity === 'media').length,
        baixa: incidents.filter(item => item.severity === 'baixa').length
      }
    };
    console.log('   → Incidentes:', incidentsMetrics.total_incidents, '(', incidentsMetrics.open_incidents, 'abertos)');
    
    // Processing Activities
    const activities = rawData.processing_activities;
    const activitiesMetrics = {
      total_activities: activities.length,
      active_activities: activities.filter(item => item.status === 'active').length,
      high_risk_activities: activities.filter(item => item.is_high_risk === true).length,
      requires_dpia: activities.filter(item => item.requires_dpia === true || item.is_high_risk === true).length
    };
    console.log('   → Atividades:', activitiesMetrics.total_activities);
    
    // Criar resultado final
    const finalMetrics = {
      legal_bases: legalBasesMetrics,
      consents: consentsMetrics,
      data_inventory: inventoryMetrics,
      data_subject_requests: requestsMetrics,
      privacy_incidents: incidentsMetrics,
      processing_activities: activitiesMetrics,
      compliance_overview: {
        legal_bases: legalBasesMetrics.total_bases,
        processing_activities: activitiesMetrics.total_activities,
        training_completion_rate: 0
      },
      dpia_assessments: {
        total_dpias: 0,
        pending_dpias: 0,
        high_risk_dpias: activitiesMetrics.high_risk_activities
      }
    };
    
    console.log('\n3. ✅ MÉTRICAS FINAIS CORRETAS:');
    console.log('   → Legal Bases: ' + finalMetrics.legal_bases.total_bases);
    console.log('   → Consentimentos Ativos: ' + finalMetrics.consents.total_active + ' (de ' + finalMetrics.consents.total_consents + ' total)');
    console.log('   → Inventário: ' + finalMetrics.data_inventory.total_inventories);
    console.log('   → Solicitações: ' + finalMetrics.data_subject_requests.total_requests);
    console.log('   → Incidentes: ' + finalMetrics.privacy_incidents.total_incidents);
    console.log('   → Atividades: ' + finalMetrics.processing_activities.total_activities);
    
    console.log('\n4. 📋 DETALHAMENTO:');
    console.log('   → Consentimentos por status:', {
      granted: finalMetrics.consents.total_active,
      revoked: finalMetrics.consents.total_revoked,
      expired: finalMetrics.consents.total_expired
    });
    
    console.log('   → Solicitações pendentes:', finalMetrics.data_subject_requests.pending_requests);
    console.log('   → Incidentes abertos:', finalMetrics.privacy_incidents.open_incidents);
    console.log('   → Atividades de alto risco:', finalMetrics.processing_activities.high_risk_activities);
    
    return finalMetrics;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

calculateCorrectMetrics().catch(console.error);