#!/usr/bin/env node
/**
 * Script para criar dados de exemplo completos para o módulo LGPD
 * Insere dados fictícios em todas as tabelas do módulo de privacidade
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuração do Supabase
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de exemplo
const sampleData = {
  // 1. Fontes de Discovery de Dados
  dataDiscoverySources: [
    {
      name: 'Sistema CRM Principal',
      description: 'Sistema de relacionamento com clientes contendo dados pessoais',
      type: 'database',
      location: 'crm-prod.empresa.com:5432/crm_db',
      credentials_stored: true,
      status: 'active',
      scan_frequency: 'monthly'
    },
    {
      name: 'Base de Dados RH',
      description: 'Sistema de recursos humanos com dados de funcionários',
      type: 'database', 
      location: 'hr-system.empresa.com:3306/hr_db',
      credentials_stored: true,
      status: 'active',
      scan_frequency: 'quarterly'
    },
    {
      name: 'Sistema ERP',
      description: 'Sistema integrado de gestão empresarial',
      type: 'application',
      location: 'erp.empresa.com.br',
      credentials_stored: false,
      status: 'active',
      scan_frequency: 'monthly'
    }
  ],

  // 2. Bases Legais
  legalBases: [
    {
      name: 'Consentimento para Marketing Digital',
      description: 'Autorização para envio de comunicações promocionais por email e SMS',
      legal_basis_type: 'consentimento',
      legal_article: 'Art. 7º, I da LGPD',
      justification: 'Titular forneceu consentimento livre, informado e específico para recebimento de materiais promocionais',
      applies_to_categories: JSON.stringify(['contato', 'comportamental']),
      applies_to_processing: JSON.stringify(['marketing_direto', 'comunicacao_promocional']),
      valid_from: '2024-01-01',
      status: 'active'
    },
    {
      name: 'Execução de Contrato - Prestação de Serviços',
      description: 'Tratamento necessário para execução de contrato de prestação de serviços',
      legal_basis_type: 'execucao_contrato',
      legal_article: 'Art. 7º, V da LGPD',
      justification: 'Dados necessários para cumprimento das obrigações contratuais de prestação de serviços',
      applies_to_categories: JSON.stringify(['identificacao', 'contato', 'financeiro']),
      applies_to_processing: JSON.stringify(['prestacao_servicos', 'faturamento', 'cobranca']),
      valid_from: '2024-01-01',
      status: 'active'
    },
    {
      name: 'Interesse Legítimo - Segurança da Informação',
      description: 'Monitoramento de segurança e prevenção de fraudes',
      legal_basis_type: 'interesse_legitimo',
      legal_article: 'Art. 7º, IX da LGPD',
      justification: 'Necessário para proteção dos sistemas e prevenção de atividades ilícitas',
      applies_to_categories: JSON.stringify(['tecnico', 'comportamental']),
      applies_to_processing: JSON.stringify(['monitoramento_seguranca', 'prevencao_fraudes']),
      valid_from: '2024-01-01',
      status: 'active'
    }
  ],

  // 3. Inventário de Dados Pessoais
  dataInventory: [
    {
      name: 'Cadastro de Clientes - Portal Web',
      description: 'Dados de identificação e contato coletados no cadastro do portal de clientes',
      data_category: 'identificacao',
      data_types: JSON.stringify(['nome_completo', 'cpf', 'email', 'telefone', 'data_nascimento']),
      system_name: 'Portal de Clientes',
      database_name: 'customer_portal_db',
      table_field_names: JSON.stringify(['users.full_name', 'users.document', 'users.email', 'users.phone']),
      estimated_volume: 25000,
      retention_period_months: 84,
      retention_justification: 'Dados mantidos por 7 anos após encerramento do relacionamento conforme regulamentação fiscal',
      sensitivity_level: 'media',
      data_origin: 'coleta_direta',
      status: 'active',
      next_review_date: '2025-02-15'
    },
    {
      name: 'Dados Financeiros - Transações',
      description: 'Informações sobre transações financeiras e histórico de pagamentos',
      data_category: 'financeiro',
      data_types: JSON.stringify(['historico_pagamentos', 'dados_bancarios', 'valor_transacoes']),
      system_name: 'Sistema de Pagamentos',
      database_name: 'payments_db',
      table_field_names: JSON.stringify(['transactions.amount', 'transactions.bank_data', 'transactions.payment_method']),
      estimated_volume: 150000,
      retention_period_months: 120,
      retention_justification: 'Obrigação legal de manter registros financeiros por 10 anos',
      sensitivity_level: 'alta',
      data_origin: 'coleta_direta',
      status: 'active',
      next_review_date: '2025-03-01'
    },
    {
      name: 'Logs de Acesso e Navegação',
      description: 'Registros de acesso ao sistema e padrões de navegação dos usuários',
      data_category: 'comportamental',
      data_types: JSON.stringify(['logs_acesso', 'historico_navegacao', 'ip_address', 'user_agent']),
      system_name: 'Sistema de Analytics',
      database_name: 'analytics_db',
      table_field_names: JSON.stringify(['access_logs.ip_address', 'access_logs.user_agent', 'access_logs.session_data']),
      estimated_volume: 500000,
      retention_period_months: 24,
      retention_justification: 'Dados mantidos por 2 anos para análises de segurança e melhoria da experiência',
      sensitivity_level: 'baixa',
      data_origin: 'coleta_automatica',
      status: 'active',
      next_review_date: '2025-01-30'
    }
  ],

  // 4. Consentimentos
  consents: [
    {
      data_subject_email: 'joao.silva@email.com',
      data_subject_name: 'João Silva Santos',
      data_subject_document: '12345678901',
      purpose: 'Recebimento de newsletters e ofertas promocionais por email',
      data_categories: JSON.stringify(['contato']),
      status: 'granted',
      granted_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 dias atrás
      collection_method: 'website_form',
      collection_source: 'https://www.empresa.com.br/newsletter',
      is_informed: true,
      is_specific: true,
      is_free: true,
      is_unambiguous: true,
      privacy_policy_version: '2.1',
      terms_of_service_version: '1.8',
      language: 'pt-BR'
    },
    {
      data_subject_email: 'maria.santos@email.com',
      data_subject_name: 'Maria Santos Oliveira',
      data_subject_document: '98765432100',
      purpose: 'Comunicações sobre produtos e serviços via WhatsApp',
      data_categories: JSON.stringify(['contato']),
      status: 'granted',
      granted_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 dias atrás
      collection_method: 'mobile_app',
      collection_source: 'App Mobile - Tela de Configurações',
      is_informed: true,
      is_specific: true,
      is_free: true,
      is_unambiguous: true,
      privacy_policy_version: '2.1',
      terms_of_service_version: '1.8',
      language: 'pt-BR'
    },
    {
      data_subject_email: 'carlos.pereira@email.com',
      data_subject_name: 'Carlos Pereira Costa',
      data_subject_document: '45678912300',
      purpose: 'Personalização de conteúdo e recomendações',
      data_categories: JSON.stringify(['comportamental', 'preferencias']),
      status: 'revoked',
      granted_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 dias atrás
      revoked_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dias atrás
      collection_method: 'website_form',
      collection_source: 'Portal de Preferências',
      is_informed: true,
      is_specific: true,
      is_free: true,
      is_unambiguous: true,
      privacy_policy_version: '2.0',
      terms_of_service_version: '1.7',
      language: 'pt-BR'
    }
  ],

  // 5. Atividades de Tratamento (RAT)
  processingActivities: [
    {
      name: 'Gestão de Relacionamento com Clientes',
      description: 'Tratamento de dados para gestão do relacionamento comercial e prestação de serviços',
      purpose: 'Execução de contrato de prestação de serviços e gestão do relacionamento comercial',
      data_categories: JSON.stringify(['identificacao', 'contato', 'financeiro']),
      data_subjects: JSON.stringify(['clientes', 'prospects']),
      data_recipients: JSON.stringify(['equipe_comercial', 'equipe_financeira', 'suporte_tecnico']),
      retention_period: '84 meses',
      retention_criteria: 'Dados mantidos por 7 anos após término do relacionamento comercial',
      security_measures: JSON.stringify(['criptografia', 'controle_acesso', 'logs_auditoria']),
      international_transfers: false,
      automated_decision_making: false,
      requires_dpia: false,
      status: 'active',
      controller_role: 'Controlador',
      processor_role: null,
      risk_level: 'medio'
    },
    {
      name: 'Marketing Digital e Comunicação',
      description: 'Envio de comunicações promocionais e análise de efetividade de campanhas',
      purpose: 'Marketing direto e comunicação comercial com base em consentimento',
      data_categories: JSON.stringify(['contato', 'comportamental', 'preferencias']),
      data_subjects: JSON.stringify(['clientes', 'prospects', 'leads']),
      data_recipients: JSON.stringify(['equipe_marketing', 'agencia_publicidade']),
      retention_period: '36 meses',
      retention_criteria: 'Dados mantidos por 3 anos ou até revogação do consentimento',
      security_measures: JSON.stringify(['criptografia', 'pseudonimizacao', 'controle_acesso']),
      international_transfers: true,
      transfer_countries: JSON.stringify(['Estados Unidos']),
      transfer_safeguards: 'Cláusulas Contratuais Padrão da Comissão Europeia',
      automated_decision_making: true,
      automated_decision_description: 'Segmentação automática para personalização de campanhas',
      requires_dpia: true,
      status: 'active',
      controller_role: 'Controlador',
      processor_role: 'Operador (Agência de Publicidade)',
      risk_level: 'alto'
    },
    {
      name: 'Recursos Humanos e Gestão de Pessoal',
      description: 'Gestão de dados de funcionários para administração de RH',
      purpose: 'Cumprimento de obrigações trabalhistas e administração de recursos humanos',
      data_categories: JSON.stringify(['identificacao', 'profissional', 'financeiro', 'saude']),
      data_subjects: JSON.stringify(['funcionarios', 'ex_funcionarios', 'candidatos']),
      data_recipients: JSON.stringify(['equipe_rh', 'contabilidade', 'medicina_trabalho']),
      retention_period: '30 anos',
      retention_criteria: 'Conforme legislação trabalhista e previdenciária',
      security_measures: JSON.stringify(['criptografia_forte', 'controle_acesso_rigoroso', 'segregacao_dados']),
      international_transfers: false,
      automated_decision_making: false,
      requires_dpia: true,
      status: 'active',
      controller_role: 'Controlador',
      processor_role: null,
      risk_level: 'alto'
    }
  ],

  // 6. Solicitações de Titulares (exemplos)
  dataSubjectRequests: [
    {
      request_type: 'acesso',
      data_subject_name: 'Ana Paula Silva',
      data_subject_email: 'ana.paula@email.com',
      data_subject_document: '11122233444',
      description: 'Solicito acesso a todos os meus dados pessoais tratados pela empresa',
      status: 'em_processamento',
      priority: 'normal',
      channel: 'email',
      verification_status: 'verified',
      verification_method: 'documento_oficial',
      verification_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
      due_date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(), // 13 dias a partir de hoje
      estimated_response_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      request_type: 'exclusao',
      data_subject_name: 'Roberto Lima Santos',
      data_subject_email: 'roberto.lima@email.com',
      data_subject_document: '55566677788',
      description: 'Solicito a exclusão de todos os meus dados, pois não tenho mais interesse nos serviços',
      status: 'pendente_verificacao',
      priority: 'normal',
      channel: 'portal_web',
      verification_status: 'pending',
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      estimated_response_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      request_type: 'correcao',
      data_subject_name: 'Fernanda Costa Oliveira',
      data_subject_email: 'fernanda.costa@email.com',
      data_subject_document: '99988877766',
      description: 'Meu endereço está incorreto no sistema. Preciso atualizar para: Rua das Flores, 123, São Paulo - SP',
      status: 'concluida',
      priority: 'normal',
      channel: 'telefone',
      verification_status: 'verified',
      verification_method: 'codigo_sms',
      verification_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      response_details: 'Endereço atualizado conforme solicitado. Dados corrigidos em todos os sistemas.'
    }
  ],

  // 7. Incidentes de Privacidade
  privacyIncidents: [
    {
      title: 'Vazamento de emails em sistema de newsletter',
      description: 'Descoberto vazamento de lista de emails devido a configuração incorreta no sistema de newsletter',
      incident_type: 'vazamento_dados',
      severity: 'media',
      status: 'investigando',
      affected_data_subjects: 1500,
      data_categories: JSON.stringify(['contato']),
      potential_impact: 'Exposição de endereços de email para terceiros não autorizados',
      detection_method: 'auditoria_interna',
      detection_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      containment_measures: 'Sistema temporariamente offline, acesso restrito, investigação em andamento',
      requires_anpd_notification: true,
      requires_data_subject_notification: true,
      risk_assessment: 'Risco moderado de uso indevido dos emails para spam',
      lessons_learned: 'Necessária revisão dos procedimentos de configuração de sistemas'
    },
    {
      title: 'Acesso não autorizado a relatórios financeiros',
      description: 'Funcionário acessou relatórios financeiros fora de sua alçada de responsabilidade',
      incident_type: 'acesso_nao_autorizado',
      severity: 'alta',
      status: 'resolvido',
      affected_data_subjects: 500,
      data_categories: JSON.stringify(['financeiro', 'identificacao']),
      potential_impact: 'Exposição de dados financeiros sensíveis de clientes',
      detection_method: 'logs_sistema',
      detection_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      resolved_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      containment_measures: 'Acesso revogado imediatamente, revisão de permissões, treinamento adicional',
      corrective_actions: 'Implementação de controles de acesso mais rigorosos, monitoramento aprimorado',
      requires_anpd_notification: true,
      requires_data_subject_notification: false,
      anpd_notification_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      risk_assessment: 'Alto risco devido à sensibilidade dos dados financeiros',
      lessons_learned: 'Necessária revisão periódica de permissões de acesso'
    }
  ],

  // 8. DPIAs (Data Protection Impact Assessment)
  dpiaAssessments: [
    {
      name: 'DPIA - Sistema de Marketing Automatizado',
      description: 'Avaliação de impacto para implementação de sistema de marketing automatizado com IA',
      processing_activity: 'Marketing Digital com Decisão Automatizada',
      scope: 'Implementação de algoritmos de machine learning para segmentação e personalização automática',
      necessity_justification: 'Melhoria da efetividade das campanhas e experiência personalizada',
      proportionality_assessment: 'Benefícios superam riscos com implementação de salvaguardas adequadas',
      risk_level: 'alto',
      status: 'concluida',
      high_risk_factors: JSON.stringify([
        'decisao_automatizada',
        'transferencia_internacional',
        'grande_escala',
        'perfil_comportamental'
      ]),
      data_categories: JSON.stringify(['contato', 'comportamental', 'preferencias']),
      data_subjects_count: 50000,
      identified_risks: JSON.stringify([
        'Discriminação automática',
        'Perda de controle pelo titular',
        'Vazamento de dados comportamentais',
        'Uso indevido para outros fins'
      ]),
      mitigation_measures: JSON.stringify([
        'Revisão humana de decisões críticas',
        'Transparência nos algoritmos',
        'Opt-out facilitado',
        'Criptografia de dados comportamentais',
        'Auditoria regular dos algoritmos'
      ]),
      residual_risk_level: 'medio',
      requires_monitoring: true,
      review_date: '2025-06-01',
      approval_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      implementation_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'DPIA - Expansão do Sistema de RH',
      description: 'Avaliação para expansão do sistema de RH incluindo dados biométricos',
      processing_activity: 'Gestão de RH com Biometria',
      scope: 'Implementação de controle de acesso biométrico e monitoramento de desempenho',
      necessity_justification: 'Melhoria da segurança e controle de ponto mais eficiente',
      proportionality_assessment: 'Necessário ajustar escopo para reduzir invasividade',
      risk_level: 'alto',
      status: 'em_revisao',
      high_risk_factors: JSON.stringify([
        'dados_biometricos',
        'monitoramento_sistematico',
        'dados_trabalhistas',
        'dados_sensivel'
      ]),
      data_categories: JSON.stringify(['biometrico', 'profissional', 'localizacao']),
      data_subjects_count: 200,
      identified_risks: JSON.stringify([
        'Invasão excessiva da privacidade',
        'Risco de discriminação',
        'Vazamento de dados biométricos',
        'Uso para vigilância excessiva'
      ]),
      mitigation_measures: JSON.stringify([
        'Limitação do escopo de monitoramento',
        'Consentimento específico para biometria',
        'Criptografia forte de dados biométricos',
        'Política clara de retenção',
        'Treinamento específico para operadores'
      ]),
      residual_risk_level: 'medio',
      requires_monitoring: true,
      review_date: '2025-04-01'
    }
  ]
};

async function getFirstUser() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error || !data.users.length) {
    console.log('Criando usuário de teste...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@teste.com',
      password: 'senha123',
      email_confirm: true
    });
    if (createError) {
      console.error('Erro ao criar usuário:', createError);
      return null;
    }
    return newUser.user.id;
  }
  return data.users[0].id;
}

async function insertSampleData() {
  try {
    console.log('🚀 Iniciando inserção de dados de exemplo do módulo LGPD...\n');

    // Obter usuário para referências
    const userId = await getFirstUser();
    if (!userId) {
      throw new Error('Não foi possível obter/criar usuário');
    }

    console.log(`📝 Usando usuário ID: ${userId}`);

    // 1. Inserir Fontes de Discovery
    console.log('📊 Inserindo fontes de discovery de dados...');
    const sourcesToInsert = sampleData.dataDiscoverySources.map(source => ({
      ...source,
      data_steward_id: userId,
      created_by: userId,
      updated_by: userId
    }));

    const { data: sources, error: sourcesError } = await supabase
      .from('data_discovery_sources')
      .insert(sourcesToInsert)
      .select('id, name');

    if (sourcesError) {
      console.error('Erro ao inserir fontes de discovery:', sourcesError);
    } else {
      console.log(`✅ ${sources.length} fontes de discovery inseridas`);
    }

    // 2. Inserir Bases Legais
    console.log('⚖️ Inserindo bases legais...');
    const basesToInsert = sampleData.legalBases.map(base => ({
      ...base,
      legal_responsible_id: userId,
      created_by: userId,
      updated_by: userId
    }));

    const { data: bases, error: basesError } = await supabase
      .from('legal_bases')
      .insert(basesToInsert)
      .select('id, name');

    if (basesError) {
      console.error('Erro ao inserir bases legais:', basesError);
    } else {
      console.log(`✅ ${bases.length} bases legais inseridas`);
    }

    // 3. Inserir Inventário de Dados
    console.log('📋 Inserindo inventário de dados...');
    const inventoryToInsert = sampleData.dataInventory.map(item => ({
      ...item,
      data_controller_id: userId,
      data_processor_id: userId,
      data_steward_id: userId,
      created_by: userId,
      updated_by: userId
    }));

    const { data: inventory, error: inventoryError } = await supabase
      .from('data_inventory')
      .insert(inventoryToInsert)
      .select('id, name');

    if (inventoryError) {
      console.error('Erro ao inserir inventário:', inventoryError);
    } else {
      console.log(`✅ ${inventory.length} itens de inventário inseridos`);
    }

    // 4. Inserir Consentimentos (com base legal)
    if (bases && bases.length > 0) {
      console.log('✅ Inserindo consentimentos...');
      const consentsToInsert = sampleData.consents.map(consent => ({
        ...consent,
        legal_basis_id: bases[0].id, // Usar primeira base legal
        created_by: userId,
        updated_by: userId
      }));

      const { data: consents, error: consentsError } = await supabase
        .from('consents')
        .insert(consentsToInsert)
        .select('id, data_subject_name');

      if (consentsError) {
        console.error('Erro ao inserir consentimentos:', consentsError);
      } else {
        console.log(`✅ ${consents.length} consentimentos inseridos`);
      }
    }

    // 5. Inserir Atividades de Tratamento
    console.log('📝 Inserindo atividades de tratamento...');
    const activitiesToInsert = sampleData.processingActivities.map(activity => ({
      ...activity,
      data_controller_id: userId,
      created_by: userId,
      updated_by: userId
    }));

    const { data: activities, error: activitiesError } = await supabase
      .from('processing_activities')
      .insert(activitiesToInsert)
      .select('id, name');

    if (activitiesError) {
      console.error('Erro ao inserir atividades:', activitiesError);
    } else {
      console.log(`✅ ${activities.length} atividades de tratamento inseridas`);
    }

    // 6. Inserir Solicitações de Titulares
    console.log('👥 Inserindo solicitações de titulares...');
    const requestsToInsert = sampleData.dataSubjectRequests.map(request => ({
      ...request,
      created_by: userId,
      updated_by: userId
    }));

    const { data: requests, error: requestsError } = await supabase
      .from('data_subject_requests')
      .insert(requestsToInsert)
      .select('id, data_subject_name');

    if (requestsError) {
      console.error('Erro ao inserir solicitações:', requestsError);
    } else {
      console.log(`✅ ${requests.length} solicitações de titulares inseridas`);
    }

    // 7. Inserir Incidentes de Privacidade
    console.log('🚨 Inserindo incidentes de privacidade...');
    const incidentsToInsert = sampleData.privacyIncidents.map(incident => ({
      ...incident,
      reported_by: userId,
      assigned_to: userId,
      created_by: userId,
      updated_by: userId
    }));

    const { data: incidents, error: incidentsError } = await supabase
      .from('privacy_incidents')
      .insert(incidentsToInsert)
      .select('id, title');

    if (incidentsError) {
      console.error('Erro ao inserir incidentes:', incidentsError);
    } else {
      console.log(`✅ ${incidents.length} incidentes de privacidade inseridos`);
    }

    // 8. Inserir DPIAs
    console.log('🛡️ Inserindo DPIAs...');
    const dpiasToInsert = sampleData.dpiaAssessments.map(dpia => ({
      ...dpia,
      responsible_id: userId,
      reviewer_id: userId,
      approver_id: userId,
      created_by: userId,
      updated_by: userId
    }));

    const { data: dpias, error: dpiasError } = await supabase
      .from('dpia_assessments')
      .insert(dpiasToInsert)
      .select('id, name');

    if (dpiasError) {
      console.error('Erro ao inserir DPIAs:', dpiasError);
    } else {
      console.log(`✅ ${dpias.length} DPIAs inseridas`);
    }

    // Resumo final
    console.log('\n🎉 DADOS DE EXEMPLO INSERIDOS COM SUCESSO!');
    console.log('==========================================');
    console.log(`📊 Fontes de Discovery: ${sources?.length || 0}`);
    console.log(`⚖️ Bases Legais: ${bases?.length || 0}`);
    console.log(`📋 Inventário de Dados: ${inventory?.length || 0}`);
    console.log(`✅ Consentimentos: ${sampleData.consents.length}`);
    console.log(`📝 Atividades de Tratamento: ${activities?.length || 0}`);
    console.log(`👥 Solicitações de Titulares: ${requests?.length || 0}`);
    console.log(`🚨 Incidentes de Privacidade: ${incidents?.length || 0}`);
    console.log(`🛡️ DPIAs: ${dpias?.length || 0}`);
    console.log('==========================================');
    console.log('✨ Módulo LGPD pronto para testes!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

// Executar script
insertSampleData();