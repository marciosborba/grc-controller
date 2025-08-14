import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createSimpleTestData() {
  console.log('🚀 Criando dados de teste simples...');

  try {
    // Deletar dados existentes primeiro
    console.log('🗑️ Limpando dados existentes...');
    await supabase.from('privacy_incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('data_subject_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Criar incidentes simples
    console.log('📋 Criando incidentes...');
    const incidents = [
      {
        title: 'Teste Incidente 1',
        description: 'Descrição do incidente de teste',
        incident_type: 'data_breach',
        severity_level: 'high',
        status: 'open',
        discovered_at: new Date().toISOString(),
        anpd_notification_required: true,
        anpd_notified: false,
        estimated_affected_individuals: 100,
        affected_data_categories: ['email', 'nome']
      },
      {
        title: 'Teste Incidente 2',
        description: 'Outro incidente de teste',
        incident_type: 'unauthorized_access',
        severity_level: 'critical',
        status: 'investigating',
        discovered_at: new Date().toISOString(),
        anpd_notification_required: true,
        anpd_notified: false,
        estimated_affected_individuals: 200,
        affected_data_categories: ['cpf', 'telefone']
      },
      {
        title: 'Teste Incidente 3',
        description: 'Incidente resolvido',
        incident_type: 'human_error',
        severity_level: 'medium',
        status: 'resolved',
        discovered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        anpd_notification_required: false,
        anpd_notified: false,
        estimated_affected_individuals: 50,
        affected_data_categories: ['email']
      }
    ];

    for (const incident of incidents) {
      try {
        const { error } = await supabase
          .from('privacy_incidents')
          .insert([incident]);
        
        if (error) {
          console.error('Erro ao inserir incidente:', error);
        }
      } catch (e) {
        console.error('Erro na inserção:', e);
      }
    }

    // Criar solicitações simples
    console.log('📋 Criando solicitações...');
    const requests = [
      {
        requester_name: 'João Silva',
        requester_email: 'joao@teste.com',
        request_type: 'acesso',
        request_description: 'Solicito acesso aos meus dados',
        status: 'received',
        identity_verified: false,
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        received_at: new Date().toISOString()
      },
      {
        requester_name: 'Maria Santos',
        requester_email: 'maria@teste.com',
        request_type: 'eliminacao',
        request_description: 'Solicito exclusão dos dados',
        status: 'verified',
        identity_verified: true,
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        received_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        requester_name: 'Pedro Costa',
        requester_email: 'pedro@teste.com',
        request_type: 'correcao',
        request_description: 'Solicito correção de dados',
        status: 'in_progress',
        identity_verified: true,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        received_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        requester_name: 'Ana Oliveira',
        requester_email: 'ana@teste.com',
        request_type: 'portabilidade',
        request_description: 'Solicito portabilidade',
        status: 'completed',
        identity_verified: true,
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        received_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        responded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const request of requests) {
      try {
        const { error } = await supabase
          .from('data_subject_requests')
          .insert([request]);
        
        if (error) {
          console.error('Erro ao inserir solicitação:', error);
        }
      } catch (e) {
        console.error('Erro na inserção:', e);
      }
    }

    // Verificar dados criados
    console.log('🔍 Verificando dados criados...');
    
    const { data: incidentsCheck } = await supabase
      .from('privacy_incidents')
      .select('id');
    
    const { data: requestsCheck } = await supabase
      .from('data_subject_requests')
      .select('id');

    console.log(`✅ Incidentes criados: ${incidentsCheck?.length || 0}`);
    console.log(`✅ Solicitações criadas: ${requestsCheck?.length || 0}`);
    console.log('🎉 Dados de teste criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createSimpleTestData();