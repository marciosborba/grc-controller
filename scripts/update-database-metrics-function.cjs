const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, serviceKey);

async function updateMetricsFunction() {
  console.log('🔧 ATUALIZANDO FUNÇÃO DE MÉTRICAS NO BANCO\n');

  try {
    const sqlFunction = `
-- Recriar função calculate_privacy_metrics para garantir sincronização

DROP FUNCTION IF EXISTS calculate_privacy_metrics();

CREATE OR REPLACE FUNCTION calculate_privacy_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    legal_bases_data jsonb;
    consents_data jsonb;
    inventory_data jsonb;
    requests_data jsonb;
    incidents_data jsonb;
    activities_data jsonb;
BEGIN
    -- Legal Bases metrics
    SELECT jsonb_build_object(
        'total_bases', COUNT(*),
        'active_bases', COUNT(*) FILTER (WHERE status = 'active'),
        'suspended_bases', COUNT(*) FILTER (WHERE status = 'suspended'),
        'expired_bases', COUNT(*) FILTER (WHERE status = 'expired'),
        'expiring_soon', COUNT(*) FILTER (WHERE status = 'active' AND valid_until IS NOT NULL AND valid_until::date <= CURRENT_DATE + INTERVAL '30 days'),
        'needs_validation', COUNT(*) FILTER (WHERE is_validated = false OR is_validated IS NULL)
    ) INTO legal_bases_data
    FROM legal_bases;

    -- Consents metrics
    SELECT jsonb_build_object(
        'total_active', COUNT(*) FILTER (WHERE status = 'granted'),
        'total_revoked', COUNT(*) FILTER (WHERE status = 'revoked'),
        'total_expired', COUNT(*) FILTER (WHERE status = 'expired'),
        'expiring_soon', COUNT(*) FILTER (WHERE status = 'granted' AND expires_at IS NOT NULL AND expires_at::date <= CURRENT_DATE + INTERVAL '30 days'),
        'total_consents', COUNT(*)
    ) INTO consents_data
    FROM consents;

    -- Data Inventory metrics
    SELECT jsonb_build_object(
        'total_inventories', COUNT(*),
        'active_inventories', COUNT(*) FILTER (WHERE status = 'active'),
        'needs_review', COUNT(*) FILTER (WHERE next_review_date IS NULL OR next_review_date <= CURRENT_DATE),
        'by_sensitivity', jsonb_build_object(
            'alta', COUNT(*) FILTER (WHERE sensitivity_level = 'alta'),
            'media', COUNT(*) FILTER (WHERE sensitivity_level = 'media'),
            'baixa', COUNT(*) FILTER (WHERE sensitivity_level = 'baixa')
        )
    ) INTO inventory_data
    FROM data_inventory;

    -- Data Subject Requests metrics
    SELECT jsonb_build_object(
        'total_requests', COUNT(*),
        'pending_requests', COUNT(*) FILTER (WHERE status IN ('received', 'under_verification', 'in_progress', 'em_processamento')),
        'completed_requests', COUNT(*) FILTER (WHERE status = 'completed'),
        'overdue_requests', COUNT(*) FILTER (WHERE status NOT IN ('completed', 'rejected') AND created_at <= CURRENT_DATE - INTERVAL '15 days'),
        'by_type', jsonb_build_object(
            'acesso', COUNT(*) FILTER (WHERE request_type = 'acesso'),
            'correcao', COUNT(*) FILTER (WHERE request_type = 'correcao'),
            'exclusao', COUNT(*) FILTER (WHERE request_type = 'exclusao'),
            'portabilidade', COUNT(*) FILTER (WHERE request_type = 'portabilidade'),
            'oposicao', COUNT(*) FILTER (WHERE request_type = 'oposicao')
        )
    ) INTO requests_data
    FROM data_subject_requests;

    -- Privacy Incidents metrics
    SELECT jsonb_build_object(
        'total_incidents', COUNT(*),
        'open_incidents', COUNT(*) FILTER (WHERE status IN ('aberto', 'investigando', 'em_remediacao')),
        'closed_incidents', COUNT(*) FILTER (WHERE status IN ('resolvido', 'fechado')),
        'anpd_notifications_required', COUNT(*) FILTER (WHERE requires_anpd_notification = true AND anpd_notified = false),
        'by_severity', jsonb_build_object(
            'critica', COUNT(*) FILTER (WHERE severity = 'critica'),
            'alta', COUNT(*) FILTER (WHERE severity = 'alta'),
            'media', COUNT(*) FILTER (WHERE severity = 'media'),
            'baixa', COUNT(*) FILTER (WHERE severity = 'baixa')
        )
    ) INTO incidents_data
    FROM privacy_incidents;

    -- Processing Activities metrics
    SELECT jsonb_build_object(
        'total_activities', COUNT(*),
        'active_activities', COUNT(*) FILTER (WHERE status = 'active'),
        'suspended_activities', COUNT(*) FILTER (WHERE status = 'suspended'),
        'under_review', COUNT(*) FILTER (WHERE status = 'under_review'),
        'high_risk_activities', COUNT(*) FILTER (WHERE is_high_risk = true),
        'requires_dpia', COUNT(*) FILTER (WHERE requires_dpia = true OR is_high_risk = true)
    ) INTO activities_data
    FROM processing_activities;

    -- Combine all metrics
    result := jsonb_build_object(
        'legal_bases', legal_bases_data,
        'consents', consents_data,
        'data_inventory', inventory_data,
        'data_subject_requests', requests_data,
        'privacy_incidents', incidents_data,
        'processing_activities', activities_data,
        'compliance_overview', jsonb_build_object(
            'legal_bases', (legal_bases_data->>'total_bases')::int,
            'processing_activities', (activities_data->>'total_activities')::int,
            'training_completion_rate', 0
        ),
        'dpia_assessments', jsonb_build_object(
            'total_dpias', 0,
            'pending_dpias', 0,
            'high_risk_dpias', (activities_data->>'high_risk_activities')::int
        )
    );

    RETURN result;
END;
$$;
`;

    console.log('1. 🗃️ EXECUTANDO SQL...');
    const { error } = await supabase.rpc('exec', { sql: sqlFunction });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error.message);
      
      // Try alternative approach - using raw query execution
      console.log('\n2. 🔄 TENTANDO ABORDAGEM ALTERNATIVA...');
      const { error: rpcError } = await supabase.rpc('update_metrics_function');
      
      if (rpcError) {
        console.error('❌ Erro na abordagem alternativa:', rpcError.message);
        console.log('\n3. ⚠️ NOTA: A função pode precisar ser criada via interface SQL do Supabase');
        console.log('   → Acesse: https://supabase.com/dashboard/project/myxvxponlmulnjstbjwd/sql');
        console.log('   → Cole o conteúdo do arquivo: scripts/update-metrics-function.sql');
      }
    } else {
      console.log('✅ Função SQL executada com sucesso!');
    }

    console.log('\n4. 🧪 TESTANDO NOVA FUNÇÃO...');
    const { data: metricsData, error: metricsError } = await supabase.rpc('calculate_privacy_metrics');

    if (metricsError) {
      console.error('❌ Erro ao testar função:', metricsError.message);
    } else {
      console.log('✅ Função testada com sucesso!');
      console.log('\n📊 MÉTRICAS RETORNADAS PELA FUNÇÃO:');
      console.log('   → Legal Bases:', metricsData.legal_bases?.total_bases || 0);
      console.log('   → Consentimentos Ativos:', metricsData.consents?.total_active || 0, 'de', metricsData.consents?.total_consents || 0);
      console.log('   → Inventário:', metricsData.data_inventory?.total_inventories || 0);
      console.log('   → Solicitações:', metricsData.data_subject_requests?.total_requests || 0);
      console.log('   → Incidentes:', metricsData.privacy_incidents?.total_incidents || 0);
      console.log('   → Atividades:', metricsData.processing_activities?.total_activities || 0);
    }

    console.log('\n🎯 ATUALIZAÇÃO DA FUNÇÃO CONCLUÍDA!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

updateMetricsFunction().catch(console.error);