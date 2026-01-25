const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, anonKey);

async function populateAdditionalTestData() {
  console.log('🎯 POPULANDO DADOS ADICIONAIS PARA TESTE\n');

  try {
    // 1. Login
    console.log('1. 🔑 FAZENDO LOGIN:');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'dev@grc.local',
      password: 'dev123456'
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }
    console.log('✅ Login realizado com sucesso');

    const userId = loginData.user.id;

    // 2. Adicionar mais bases legais
    console.log('\n2. ➕ ADICIONANDO BASES LEGAIS:');
    
    const additionalLegalBases = [
      {
        name: 'Interesse Legítimo - Segurança da Informação',
        description: 'Base legal para processamento de dados para fins de segurança da informação e prevenção de fraudes',
        legal_basis_type: 'interesse_legitimo',
        legal_article: 'Art. 7º, IX da LGPD',
        justification: 'Necessário para proteger a segurança dos sistemas e prevenir fraudes',
        applies_to_categories: ['tecnico', 'comportamental'],
        applies_to_processing: ['seguranca', 'monitoramento'],
        valid_from: '2024-01-01',
        status: 'active',
        created_by: userId,
        updated_by: userId
      },
      {
        name: 'Obrigação Legal - Retenção Fiscal',
        description: 'Base legal para retenção de dados conforme exigências fiscais e tributárias',
        legal_basis_type: 'obrigacao_legal',
        legal_article: 'Art. 7º, II da LGPD',
        justification: 'Cumprimento de obrigações fiscais e tributárias previstas em lei',
        applies_to_categories: ['financeiro', 'identificacao'],
        applies_to_processing: ['contabilidade', 'declaracoes_fiscais'],
        valid_from: '2024-01-01',
        valid_until: '2029-12-31',
        status: 'active',
        created_by: userId,
        updated_by: userId
      },
      {
        name: 'Consentimento - Marketing Personalizado',
        description: 'Consentimento específico para envio de comunicações de marketing personalizadas',
        legal_basis_type: 'consentimento',
        legal_article: 'Art. 7º, I da LGPD',
        justification: 'Consentimento livre e específico para comunicações personalizadas',
        applies_to_categories: ['comportamental', 'preferencias'],
        applies_to_processing: ['marketing', 'analytics'],
        valid_from: '2024-01-01',
        status: 'active',
        created_by: userId,
        updated_by: userId
      }
    ];

    let legalBasesAdded = 0;
    for (const basis of additionalLegalBases) {
      const { error } = await supabase.from('legal_bases').insert([basis]);
      if (error) {
        console.log('   ❌ Erro ao adicionar:', basis.name, '-', error.message);
      } else {
        legalBasesAdded++;
        console.log('   ✅ Adicionada:', basis.name);
      }
    }
    console.log('   → Total adicionadas:', legalBasesAdded);

    // 3. Adicionar mais consentimentos
    console.log('\n3. 🤝 ADICIONANDO CONSENTIMENTOS:');
    
    const additionalConsents = [
      {
        data_subject_name: 'João Silva',
        data_subject_email: 'joao.silva@example.com',
        consent_text: 'Autorizo o uso dos meus dados para comunicações de marketing',
        purpose: 'Marketing direto e comunicações promocionais',
        data_categories: ['identificacao', 'contato'],
        status: 'granted',
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
        legal_basis_id: null,
        created_by: userId
      },
      {
        data_subject_name: 'Maria Santos',
        data_subject_email: 'maria.santos@example.com',
        consent_text: 'Autorizo o tratamento dos meus dados para análise de perfil',
        purpose: 'Análise de comportamento e personalização',
        data_categories: ['comportamental', 'preferencias'],
        status: 'granted',
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        legal_basis_id: null,
        created_by: userId
      },
      {
        data_subject_name: 'Pedro Costa',
        data_subject_email: 'pedro.costa@example.com',
        consent_text: 'Consinto com o uso dos dados para suporte técnico',
        purpose: 'Prestação de suporte e atendimento',
        data_categories: ['identificacao', 'tecnico'],
        status: 'revoked',
        granted_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias atrás
        revoked_at: new Date().toISOString(),
        legal_basis_id: null,
        created_by: userId
      }
    ];

    let consentsAdded = 0;
    for (const consent of additionalConsents) {
      const { error } = await supabase.from('consents').insert([consent]);
      if (error) {
        console.log('   ❌ Erro ao adicionar consentimento para:', consent.data_subject_name, '-', error.message);
      } else {
        consentsAdded++;
        console.log('   ✅ Adicionado consentimento para:', consent.data_subject_name, '(' + consent.status + ')');
      }
    }
    console.log('   → Total adicionados:', consentsAdded);

    // 4. Adicionar mais inventário
    console.log('\n4. 📦 ADICIONANDO INVENTÁRIO:');
    
    const additionalInventory = [
      {
        name: 'Sistema de Recursos Humanos',
        description: 'Dados de funcionários para gestão de RH e folha de pagamento',
        data_category: 'rh',
        data_types: ['nome_completo', 'cpf', 'banco', 'salario'],
        system_name: 'HR System',
        database_name: 'hr_db',
        table_field_names: ['employees.full_name', 'employees.cpf', 'payroll.salary'],
        estimated_volume: 150,
        retention_period_months: 60,
        retention_justification: 'Dados mantidos por 5 anos conforme legislação trabalhista',
        sensitivity_level: 'alta',
        data_origin: 'coleta_direta',
        data_controller_id: userId,
        data_steward_id: userId,
        status: 'active',
        next_review_date: '2025-06-01',
        created_by: userId,
        updated_by: userId
      },
      {
        name: 'Logs de Acesso ao Sistema',
        description: 'Registros de acesso e atividades dos usuários no sistema',
        data_category: 'tecnico',
        data_types: ['ip_address', 'timestamp', 'user_agent', 'acao'],
        system_name: 'Security Monitoring',
        database_name: 'logs_db',
        table_field_names: ['access_logs.ip', 'access_logs.timestamp', 'access_logs.action'],
        estimated_volume: 50000,
        retention_period_months: 12,
        retention_justification: 'Logs mantidos por 1 ano para fins de segurança',
        sensitivity_level: 'media',
        data_origin: 'coleta_automatica',
        data_controller_id: userId,
        data_steward_id: userId,
        status: 'active',
        next_review_date: '2025-03-01',
        created_by: userId,
        updated_by: userId
      }
    ];

    let inventoryAdded = 0;
    for (const item of additionalInventory) {
      const { error } = await supabase.from('data_inventory').insert([item]);
      if (error) {
        console.log('   ❌ Erro ao adicionar:', item.name, '-', error.message);
      } else {
        inventoryAdded++;
        console.log('   ✅ Adicionado:', item.name);
      }
    }
    console.log('   → Total adicionados:', inventoryAdded);

    // 5. Adicionar mais solicitações
    console.log('\n5. 📝 ADICIONANDO SOLICITAÇÕES:');
    
    const additionalRequests = [
      {
        data_subject_name: 'Ana Paula Silva',
        data_subject_email: 'ana.paula@example.com',
        request_type: 'acesso',
        description: 'Solicito acesso a todos os meus dados pessoais',
        status: 'completed',
        received_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId
      },
      {
        data_subject_name: 'Carlos Mendes',
        data_subject_email: 'carlos.mendes@example.com',
        request_type: 'exclusao',
        description: 'Solicito a exclusão completa dos meus dados',
        status: 'em_processamento',
        received_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId
      },
      {
        data_subject_name: 'Fernanda Lima',
        data_subject_email: 'fernanda.lima@example.com',
        request_type: 'portabilidade',
        description: 'Solicito a portabilidade dos meus dados em formato estruturado',
        status: 'received',
        received_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: userId
      }
    ];

    let requestsAdded = 0;
    for (const request of additionalRequests) {
      const { error } = await supabase.from('data_subject_requests').insert([request]);
      if (error) {
        console.log('   ❌ Erro ao adicionar solicitação de:', request.data_subject_name, '-', error.message);
      } else {
        requestsAdded++;
        console.log('   ✅ Adicionada solicitação de:', request.data_subject_name, '(' + request.request_type + ')');
      }
    }
    console.log('   → Total adicionadas:', requestsAdded);

    // 6. Adicionar mais incidentes
    console.log('\n6. ⚠️ ADICIONANDO INCIDENTES:');
    
    const additionalIncidents = [
      {
        title: 'Acesso não autorizado por ex-funcionário',
        description: 'Ex-funcionário tentou acessar sistemas corporativos após desligamento',
        category: 'acesso_nao_autorizado',
        severity: 'alta',
        status: 'resolvido',
        affected_data_types: ['identificacao', 'corporativo'],
        affected_individuals_count: 0,
        source: 'monitoramento_automatico',
        discovered_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        resolved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        requires_anpd_notification: false,
        created_by: userId,
        updated_by: userId
      },
      {
        title: 'Phishing direcionado a funcionários',
        description: 'Tentativa de phishing visando obter credenciais de acesso',
        category: 'engenharia_social',
        severity: 'media',
        status: 'em_remediacao',
        affected_data_types: ['credenciais'],
        affected_individuals_count: 3,
        source: 'relato_funcionario',
        discovered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        requires_anpd_notification: true,
        anpd_notified: false,
        created_by: userId,
        updated_by: userId
      }
    ];

    let incidentsAdded = 0;
    for (const incident of additionalIncidents) {
      const { error } = await supabase.from('privacy_incidents').insert([incident]);
      if (error) {
        console.log('   ❌ Erro ao adicionar incidente:', incident.title, '-', error.message);
      } else {
        incidentsAdded++;
        console.log('   ✅ Adicionado incidente:', incident.title);
      }
    }
    console.log('   → Total adicionados:', incidentsAdded);

    // 7. Adicionar mais atividades de processamento
    console.log('\n7. 🔄 ADICIONANDO ATIVIDADES:');
    
    const additionalActivities = [
      {
        name: 'Sistema de Videomonitoramento',
        description: 'Monitoramento de segurança através de câmeras nas instalações',
        purpose: 'seguranca',
        data_categories: ['biometrico', 'imagem'],
        data_subjects: ['funcionarios', 'visitantes'],
        legal_basis_id: null,
        data_controller: 'Empresa LTDA',
        department: 'Segurança',
        is_high_risk: true,
        requires_dpia: true,
        status: 'active',
        created_by: userId,
        updated_by: userId
      },
      {
        name: 'Programa de Fidelidade',
        description: 'Sistema de pontuação e benefícios para clientes frequentes',
        purpose: 'marketing',
        data_categories: ['identificacao', 'comportamental', 'financeiro'],
        data_subjects: ['clientes'],
        legal_basis_id: null,
        data_controller: 'Empresa LTDA',
        department: 'Marketing',
        is_high_risk: false,
        requires_dpia: false,
        status: 'active',
        created_by: userId,
        updated_by: userId
      }
    ];

    let activitiesAdded = 0;
    for (const activity of additionalActivities) {
      const { error } = await supabase.from('processing_activities').insert([activity]);
      if (error) {
        console.log('   ❌ Erro ao adicionar atividade:', activity.name, '-', error.message);
      } else {
        activitiesAdded++;
        console.log('   ✅ Adicionada atividade:', activity.name);
      }
    }
    console.log('   → Total adicionadas:', activitiesAdded);

    // 8. Resultado final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS DADOS ADICIONADOS:');
    console.log('='.repeat(60));
    console.log('✅ Legal Bases:', legalBasesAdded, 'adicionadas');
    console.log('✅ Consentimentos:', consentsAdded, 'adicionados');
    console.log('✅ Inventário:', inventoryAdded, 'adicionados');
    console.log('✅ Solicitações:', requestsAdded, 'adicionadas');
    console.log('✅ Incidentes:', incidentsAdded, 'adicionados');
    console.log('✅ Atividades:', activitiesAdded, 'adicionadas');
    
    console.log('\n🎯 DADOS DE TESTE POPULADOS COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

populateAdditionalTestData().catch(console.error);