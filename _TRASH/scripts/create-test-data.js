import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createTestData() {
  console.log('🚀 Criando dados de teste para LGPD...');

  try {
    // Primeiro, verificar se as tabelas existem
    console.log('🔍 Verificando se as tabelas existem...');
    
    const { data: tablesCheck, error: tablesError } = await supabase
      .from('privacy_incidents')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ Tabelas LGPD não encontradas. Execute as migrações primeiro.');
      return;
    }

    // Criar alguns incidentes de privacidade
    console.log('📋 Criando incidentes de privacidade...');
    const incidentsData = [
      {
        title: 'Vazamento de dados de usuários',
        description: 'Acesso não autorizado a dados pessoais de clientes',
        incident_type: 'data_breach',
        severity_level: 'high',
        status: 'open',
        discovered_at: new Date().toISOString(),
        occurred_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        anpd_notification_required: true,
        anpd_notified: false,
        estimated_affected_individuals: 150,
        incident_source: 'Internal audit',
        affected_data_categories: ['email', 'nome', 'telefone'],
        incident_manager_id: '12345678-1234-1234-1234-123456789012' // ID fictício
      },
      {
        title: 'Falha na segurança do sistema',
        description: 'Vulnerabilidade descoberta no sistema de autenticação',
        incident_type: 'system_compromise',
        severity_level: 'critical',
        status: 'investigating',
        discovered_at: new Date().toISOString(),
        occurred_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        anpd_notification_required: true,
        anpd_notified: false,
        estimated_affected_individuals: 500,
        incident_source: 'Security scan',
        affected_data_categories: ['email', 'senha', 'dados_financeiros'],
        incident_manager_id: '12345678-1234-1234-1234-123456789012' // ID fictício
      },
      {
        title: 'Acesso indevido por funcionário',
        description: 'Funcionário acessou dados sem autorização',
        incident_type: 'unauthorized_access',
        severity_level: 'medium',
        status: 'resolved',
        discovered_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        occurred_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        anpd_notification_required: false,
        anpd_notified: false,
        estimated_affected_individuals: 25,
        incident_source: 'HR Report',
        affected_data_categories: ['nome', 'endereco'],
        incident_manager_id: '12345678-1234-1234-1234-123456789012' // ID fictício
      }
    ];

    // Remover campos que requerem referências válidas para o teste
    const simplifiedIncidentsData = incidentsData.map(incident => ({
      title: incident.title,
      description: incident.description,
      incident_type: incident.incident_type,
      severity_level: incident.severity_level,
      status: incident.status,
      discovered_at: incident.discovered_at,
      occurred_at: incident.occurred_at,
      anpd_notification_required: incident.anpd_notification_required,
      anpd_notified: incident.anpd_notified,
      estimated_affected_individuals: incident.estimated_affected_individuals,
      incident_source: incident.incident_source,
      affected_data_categories: incident.affected_data_categories
    }));

    const { data: incidents, error: incidentsError } = await supabase
      .from('privacy_incidents')
      .insert(simplifiedIncidentsData);

    if (incidentsError) {
      console.error('❌ Erro ao criar incidentes:', incidentsError);
    } else {
      console.log('✅ Incidentes criados com sucesso');
    }

    // Criar algumas solicitações de titulares
    console.log('📋 Criando solicitações de titulares...');
    const requestsData = [
      {
        requester_name: 'João Silva',
        requester_email: 'joao.silva@email.com',
        request_type: 'acesso',
        description: 'Solicito acesso aos meus dados pessoais',
        status: 'received',
        identity_verified: false,
        escalated: false,
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        received_at: new Date().toISOString()
      },
      {
        requester_name: 'Maria Santos',
        requester_email: 'maria.santos@email.com',
        request_type: 'eliminacao',
        description: 'Solicito a exclusão dos meus dados pessoais',
        status: 'verified',
        identity_verified: true,
        escalated: false,
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        received_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        requester_name: 'Pedro Oliveira',
        requester_email: 'pedro.oliveira@email.com',
        request_type: 'correcao',
        description: 'Solicito correção do meu endereço',
        status: 'in_progress',
        identity_verified: true,
        escalated: false,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        received_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        requester_name: 'Ana Costa',
        requester_email: 'ana.costa@email.com',
        request_type: 'portabilidade',
        description: 'Solicito portabilidade dos meus dados',
        status: 'completed',
        identity_verified: true,
        escalated: false,
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        received_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        responded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        requester_name: 'Carlos Lima',
        requester_email: 'carlos.lima@email.com',
        request_type: 'oposicao',
        description: 'Me oponho ao tratamento dos meus dados para marketing',
        status: 'under_verification',
        identity_verified: false,
        escalated: false,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        received_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data: requests, error: requestsError } = await supabase
      .from('data_subject_requests')
      .insert(requestsData);

    if (requestsError) {
      console.error('❌ Erro ao criar solicitações:', requestsError);
    } else {
      console.log('✅ Solicitações criadas com sucesso');
    }

    console.log('🎉 Dados de teste criados com sucesso!');
    
    // Verificar se os dados foram criados
    console.log('🔍 Verificando dados criados...');
    
    const { data: incidentsCount, error: incidentsCountError } = await supabase
      .from('privacy_incidents')
      .select('id', { count: 'exact' });
    
    const { data: requestsCount, error: requestsCountError } = await supabase
      .from('data_subject_requests')
      .select('id', { count: 'exact' });

    if (!incidentsCountError && !requestsCountError) {
      console.log(`📊 Total de incidentes: ${incidentsCount?.length || 0}`);
      console.log(`📊 Total de solicitações: ${requestsCount?.length || 0}`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createTestData();