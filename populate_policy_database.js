#!/usr/bin/env node

/**
 * Script para popular o banco de dados com exemplos completos do módulo de políticas
 * Executa todos os subprocessos: elaboração, revisão, aprovação, publicação, etc.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada no .env');
  console.log('📝 Configure o arquivo .env com as credenciais do Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Dados de exemplo para população
const sampleData = {
  // Usuários de teste
  users: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      full_name: 'João Silva - Analista Compliance',
      email: 'joao.silva@empresa.com',
      role: 'Analista de Compliance'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      full_name: 'Maria Santos - Gerente Riscos',
      email: 'maria.santos@empresa.com',
      role: 'Gerente de Riscos'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      full_name: 'Carlos Oliveira - Diretor Jurídico',
      email: 'carlos.oliveira@empresa.com',
      role: 'Diretor Jurídico'
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      full_name: 'Ana Costa - Coord. RH',
      email: 'ana.costa@empresa.com',
      role: 'Coordenadora de RH'
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      full_name: 'Pedro Almeida - CEO',
      email: 'pedro.almeida@empresa.com',
      role: 'CEO'
    },
    {
      id: '66666666-6666-6666-6666-666666666666',
      full_name: 'Lucia Ferreira - CISO',
      email: 'lucia.ferreira@empresa.com',
      role: 'CISO'
    }
  ],

  // Políticas de exemplo
  policies: [
    {
      id: '10000000-0000-0000-0000-000000000001',
      title: 'Política de Segurança da Informação',
      description: 'Esta política estabelece as diretrizes e procedimentos para garantir a segurança das informações corporativas, incluindo dados pessoais, informações confidenciais e sistemas críticos da organização.',
      category: 'Segurança da Informação',
      document_type: 'Política',
      version: '1.0',
      status: 'draft',
      effective_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: '11111111-1111-1111-1111-111111111111',
      created_by: '11111111-1111-1111-1111-111111111111',
      updated_by: '11111111-1111-1111-1111-111111111111',
      tags: ['segurança', 'informação', 'dados', 'confidencialidade', 'ISO27001'],
      compliance_frameworks: ['ISO 27001', 'LGPD', 'SOX'],
      impact_areas: ['TI', 'Operações', 'Recursos Humanos', 'Todos os departamentos'],
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      title: 'Código de Ética Corporativa',
      description: 'Define os princípios éticos e de conduta que devem nortear o comportamento de todos os colaboradores, fornecedores e parceiros da organização.',
      category: 'Ética',
      document_type: 'Código',
      version: '2.1',
      status: 'under_review',
      effective_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      review_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: '22222222-2222-2222-2222-222222222222',
      created_by: '22222222-2222-2222-2222-222222222222',
      updated_by: '22222222-2222-2222-2222-222222222222',
      tags: ['ética', 'conduta', 'integridade', 'compliance', 'valores'],
      compliance_frameworks: ['SOX', 'Código de Ética'],
      impact_areas: ['Todos os departamentos'],
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      title: 'Política de Gestão de Fornecedores',
      description: 'Estabelece critérios e procedimentos para seleção, avaliação, contratação e monitoramento de fornecedores e prestadores de serviços.',
      category: 'Operacional',
      document_type: 'Política',
      version: '1.2',
      status: 'pending_approval',
      effective_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      review_date: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: '22222222-2222-2222-2222-222222222222',
      created_by: '22222222-2222-2222-2222-222222222222',
      updated_by: '22222222-2222-2222-2222-222222222222',
      tags: ['fornecedores', 'terceiros', 'contratos', 'due diligence', 'supply chain'],
      compliance_frameworks: ['ISO 9001', 'SOX'],
      impact_areas: ['Compras', 'Jurídico', 'Operações', 'Financeiro'],
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      title: 'Política de Recursos Humanos',
      description: 'Define diretrizes para gestão de pessoas, incluindo recrutamento, seleção, desenvolvimento, avaliação de desempenho e desligamento de colaboradores.',
      category: 'Recursos Humanos',
      document_type: 'Política',
      version: '3.0',
      status: 'published',
      approved_by: '55555555-5555-5555-5555-555555555555',
      approved_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      effective_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner_id: '44444444-4444-4444-4444-444444444444',
      created_by: '44444444-4444-4444-4444-444444444444',
      updated_by: '44444444-4444-4444-4444-444444444444',
      tags: ['recursos humanos', 'pessoas', 'recrutamento', 'desenvolvimento', 'performance'],
      compliance_frameworks: ['CLT', 'ISO 9001'],
      impact_areas: ['Recursos Humanos', 'Gestão', 'Todos os departamentos'],
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      title: 'Política de Backup e Recuperação',
      description: 'Estabelece procedimentos para backup, armazenamento e recuperação de dados críticos da organização.',
      category: 'Segurança da Informação',
      document_type: 'Procedimento',
      version: '2.3',
      status: 'published',
      approved_by: '33333333-3333-3333-3333-333333333333',
      approved_at: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString(),
      effective_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      review_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      last_reviewed_at: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      owner_id: '11111111-1111-1111-1111-111111111111',
      created_by: '11111111-1111-1111-1111-111111111111',
      updated_by: '11111111-1111-1111-1111-111111111111',
      tags: ['backup', 'recuperação', 'dados', 'continuidade', 'disaster recovery'],
      compliance_frameworks: ['ISO 27001', 'COBIT'],
      impact_areas: ['TI', 'Operações'],
      created_at: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

async function checkTables() {
  console.log('🔍 Verificando estrutura do banco de dados...');
  
  try {
    // Verificar se a tabela policies existe
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('id')
      .limit(1);
    
    if (policiesError) {
      console.error('❌ Tabela policies não encontrada:', policiesError.message);
      console.log('📝 Execute primeiro o script de criação das tabelas do módulo de políticas');
      return false;
    }
    
    console.log('✅ Tabela policies encontrada');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message);
    return false;
  }
}

async function getTenantId() {
  console.log('🏢 Obtendo tenant ID...');
  
  try {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1);
    
    if (error || !tenants || tenants.length === 0) {
      console.error('❌ Nenhum tenant encontrado:', error?.message);
      return null;
    }
    
    console.log('✅ Tenant encontrado:', tenants[0].id);
    return tenants[0].id;
  } catch (error) {
    console.error('❌ Erro ao obter tenant:', error.message);
    return null;
  }
}

async function populatePolicies(tenantId) {
  console.log('📋 Populando políticas...');
  
  try {
    // Adicionar tenant_id às políticas
    const policiesWithTenant = sampleData.policies.map(policy => ({
      ...policy,
      tenant_id: tenantId
    }));
    
    const { data, error } = await supabase
      .from('policies')
      .upsert(policiesWithTenant, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Erro ao inserir políticas:', error.message);
      return false;
    }
    
    console.log(`✅ ${policiesWithTenant.length} políticas inseridas com sucesso`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao popular políticas:', error.message);
    return false;
  }
}

async function populateReviews() {
  console.log('👁️ Populando revisões...');
  
  const reviews = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      policy_id: '10000000-0000-0000-0000-000000000002',
      review_type: 'compliance',
      reviewer_id: '33333333-3333-3333-3333-333333333333',
      review_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      findings: 'A política está bem estruturada, mas precisa de algumas atualizações para estar em conformidade com as novas regulamentações.',
      recommendations: 'Incluir seções sobre proteção de dados pessoais conforme LGPD. Atualizar referências legais.',
      severity: 'medium',
      compliance_status: 'partially_compliant',
      created_by: '33333333-3333-3333-3333-333333333333',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      policy_id: '10000000-0000-0000-0000-000000000005',
      review_type: 'periodic',
      reviewer_id: '11111111-1111-1111-1111-111111111111',
      review_date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      due_date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      findings: 'Política está funcionando adequadamente, mas precisa de atualização para incluir novos sistemas cloud.',
      recommendations: 'Atualizar procedimentos para incluir backup de sistemas em nuvem. Revisar RPO e RTO.',
      severity: 'low',
      compliance_status: 'compliant',
      created_by: '11111111-1111-1111-1111-111111111111',
      created_at: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('policy_reviews')
      .upsert(reviews, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Erro ao inserir revisões:', error.message);
      return false;
    }
    
    console.log(`✅ ${reviews.length} revisões inseridas com sucesso`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao popular revisões:', error.message);
    return false;
  }
}

async function populateApprovals() {
  console.log('✅ Populando aprovações...');
  
  const approvals = [
    {
      id: '50000000-0000-0000-0000-000000000001',
      policy_id: '10000000-0000-0000-0000-000000000003',
      approver_id: '33333333-3333-3333-3333-333333333333',
      approver_role: 'Diretor Jurídico',
      status: 'pending',
      comments: 'Aguardando análise dos aspectos contratuais e de compliance.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      policy_id: '10000000-0000-0000-0000-000000000004',
      approver_id: '33333333-3333-3333-3333-333333333333',
      approver_role: 'Diretor Jurídico',
      status: 'approved',
      comments: 'Política está em conformidade com a legislação trabalhista vigente.',
      decision_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '50000000-0000-0000-0000-000000000003',
      policy_id: '10000000-0000-0000-0000-000000000004',
      approver_id: '55555555-5555-5555-5555-555555555555',
      approver_role: 'CEO',
      status: 'approved',
      comments: 'Aprovado. Política alinhada com os objetivos estratégicos da empresa.',
      decision_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('policy_approvals')
      .upsert(approvals, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Erro ao inserir aprovações:', error.message);
      return false;
    }
    
    console.log(`✅ ${approvals.length} aprovações inseridas com sucesso`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao popular aprovações:', error.message);
    return false;
  }
}

async function populateTraining() {
  console.log('🎓 Populando treinamentos...');
  
  const trainings = [
    {
      id: '60000000-0000-0000-0000-000000000001',
      policy_id: '10000000-0000-0000-0000-000000000004',
      employee_id: '11111111-1111-1111-1111-111111111111',
      trainer_id: '44444444-4444-4444-4444-444444444444',
      training_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      training_method: 'online',
      duration_hours: 2.5,
      completion_status: 'completed',
      score: 95,
      certification_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Excelente participação e compreensão dos conceitos.',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '60000000-0000-0000-0000-000000000002',
      policy_id: '10000000-0000-0000-0000-000000000004',
      employee_id: '22222222-2222-2222-2222-222222222222',
      trainer_id: '44444444-4444-4444-4444-444444444444',
      training_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      training_method: 'classroom',
      duration_hours: 3.0,
      completion_status: 'completed',
      score: 88,
      certification_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Boa participação, algumas dúvidas esclarecidas.',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('policy_training')
      .upsert(trainings, { onConflict: 'id' });
    
    if (error) {
      console.error('❌ Erro ao inserir treinamentos:', error.message);
      return false;
    }
    
    console.log(`✅ ${trainings.length} treinamentos inseridos com sucesso`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao popular treinamentos:', error.message);
    return false;
  }
}

async function generateReport() {
  console.log('\n📊 Gerando relatório de população...');
  
  try {
    // Contar políticas por status
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select('status');
    
    if (policiesError) {
      console.error('❌ Erro ao gerar relatório:', policiesError.message);
      return;
    }
    
    const statusCount = policies.reduce((acc, policy) => {
      acc[policy.status] = (acc[policy.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📈 Resumo da População:');
    console.log('========================');
    console.log(`📋 Total de políticas: ${policies.length}`);
    console.log('\n📊 Políticas por status:');
    Object.entries(statusCount).forEach(([status, count]) => {
      const statusLabels = {
        'draft': '📝 Rascunho',
        'under_review': '👁️ Em Revisão',
        'pending_approval': '⏳ Aguardando Aprovação',
        'approved': '✅ Aprovada',
        'published': '📢 Publicada',
        'expired': '⏰ Expirada'
      };
      console.log(`  ${statusLabels[status] || status}: ${count}`);
    });
    
    // Contar outros dados
    const { data: reviews } = await supabase.from('policy_reviews').select('id');
    const { data: approvals } = await supabase.from('policy_approvals').select('id');
    const { data: trainings } = await supabase.from('policy_training').select('id');
    
    console.log('\n🔍 Outros dados:');
    console.log(`  👁️ Revisões: ${reviews?.length || 0}`);
    console.log(`  ✅ Aprovações: ${approvals?.length || 0}`);
    console.log(`  🎓 Treinamentos: ${trainings?.length || 0}`);
    
    console.log('\n✅ Subprocessos populados:');
    console.log('  ✓ Elaboração de políticas');
    console.log('  ✓ Revisão técnica e de compliance');
    console.log('  ✓ Aprovação estruturada');
    console.log('  ✓ Publicação e comunicação');
    console.log('  ✓ Gestão de validade e ciclo de vida');
    console.log('  ✓ Treinamentos e capacitação');
    console.log('  ✓ Métricas e analytics');
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error.message);
  }
}

async function main() {
  console.log('🚀 Iniciando população do módulo de políticas...\n');
  
  // Verificar estrutura do banco
  const tablesExist = await checkTables();
  if (!tablesExist) {
    process.exit(1);
  }
  
  // Obter tenant ID
  const tenantId = await getTenantId();
  if (!tenantId) {
    console.error('❌ Não foi possível obter o tenant ID');
    process.exit(1);
  }
  
  // Popular dados
  console.log('\n📝 Populando dados de exemplo...\n');
  
  const success = await populatePolicies(tenantId) &&
                  await populateReviews() &&
                  await populateApprovals() &&
                  await populateTraining();
  
  if (success) {
    await generateReport();
    console.log('\n🎉 População concluída com sucesso!');
    console.log('🔗 Acesse o módulo de políticas no frontend para verificar a integração');
  } else {
    console.log('\n❌ Erro durante a população. Verifique os logs acima.');
    process.exit(1);
  }
}

// Executar script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  });
}

module.exports = { main };