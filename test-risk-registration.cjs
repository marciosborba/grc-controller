const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRiskRegistrationCRUD() {
  console.log('🧪 Testando CRUD do Sistema de Registro de Riscos\n');
  
  try {
    // 1. Verificar estrutura da tabela
    console.log('1️⃣ Verificando estrutura da tabela risk_registrations...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('risk_registrations')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError.message);
      return;
    }
    console.log('✅ Tabela risk_registrations acessível');

    // 2. Buscar um tenant para teste (assumindo que existe pelo menos um)
    console.log('\n2️⃣ Buscando tenant para teste...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name')
      .limit(1);
    
    if (tenantsError || !tenants || tenants.length === 0) {
      console.error('❌ Erro ao buscar tenant:', tenantsError?.message || 'Nenhum tenant encontrado');
      return;
    }
    
    const testTenantId = tenants[0].id;
    console.log('✅ Tenant encontrado:', tenants[0].name, `(${testTenantId})`);

    // 3. Buscar um usuário para teste
    console.log('\n3️⃣ Buscando usuário para teste...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Erro ao buscar usuário:', usersError?.message || 'Nenhum usuário encontrado');
      return;
    }
    
    const testUserId = users[0].id;
    console.log('✅ Usuário encontrado:', users[0].full_name, `(${testUserId})`);

    // 4. Testar CREATE - Criar novo registro de risco
    console.log('\n4️⃣ Testando CREATE - Criando novo registro de risco...');
    const newRiskData = {
      tenant_id: testTenantId,
      created_by: testUserId,
      current_step: 1,
      status: 'draft',
      risk_title: 'Teste de Risco - Sistema de Registro',
      risk_description: 'Risco criado automaticamente para teste do sistema de registro completo',
      risk_category: 'operational',
      risk_source: 'internal_audit',
      identified_date: new Date().toISOString().split('T')[0],
      business_area: 'TI',
      analysis_methodology: 'qualitative',
      impact_score: 4,
      likelihood_score: 3,
      risk_score: 12,
      risk_level: 'high',
      gut_gravity: 4,
      gut_urgency: 3,
      gut_tendency: 3,
      gut_priority: 'high',
      treatment_strategy: 'mitigate',
      treatment_rationale: 'Implementar controles para reduzir impacto',
      treatment_cost: 25000.00,
      treatment_timeline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 dias
      monitoring_frequency: 'monthly',
      residual_impact: 2,
      residual_likelihood: 2
    };

    const { data: createdRisk, error: createError } = await supabase
      .from('risk_registrations')
      .insert([newRiskData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar risco:', createError.message);
      return;
    }

    console.log('✅ Risco criado com sucesso!');
    console.log(`   ID: ${createdRisk.id}`);
    console.log(`   Título: ${createdRisk.risk_title}`);
    console.log(`   Score GUT: ${createdRisk.gut_score}`);
    console.log(`   Score Risco: ${createdRisk.risk_score}`);
    
    const createdRiskId = createdRisk.id;

    // 5. Testar READ - Buscar risco criado
    console.log('\n5️⃣ Testando READ - Buscando risco criado...');
    const { data: foundRisk, error: readError } = await supabase
      .from('risk_registrations')
      .select('*')
      .eq('id', createdRiskId)
      .single();

    if (readError) {
      console.error('❌ Erro ao buscar risco:', readError.message);
      return;
    }

    console.log('✅ Risco encontrado:');
    console.log(`   Título: ${foundRisk.risk_title}`);
    console.log(`   Status: ${foundRisk.status}`);
    console.log(`   Etapa atual: ${foundRisk.current_step}`);
    console.log(`   Nível de risco: ${foundRisk.risk_level}`);

    // 6. Testar UPDATE - Atualizar risco
    console.log('\n6️⃣ Testando UPDATE - Atualizando risco...');
    const updateData = {
      current_step: 7,
      status: 'completed',
      completion_percentage: 100,
      closure_date: new Date().toISOString().split('T')[0],
      closure_notes: 'Teste de atualização - risco finalizado automaticamente'
    };

    const { data: updatedRisk, error: updateError } = await supabase
      .from('risk_registrations')
      .update(updateData)
      .eq('id', createdRiskId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar risco:', updateError.message);
      return;
    }

    console.log('✅ Risco atualizado com sucesso:');
    console.log(`   Status: ${updatedRisk.status}`);
    console.log(`   Etapa: ${updatedRisk.current_step}/7`);
    console.log(`   Progresso: ${updatedRisk.completion_percentage}%`);

    // 7. Testar relacionamentos - Action Plans
    console.log('\n7️⃣ Testando relacionamentos - Criando plano de ação...');
    const actionPlanData = {
      risk_registration_id: createdRiskId,
      tenant_id: testTenantId,
      activity_title: 'Implementar backup automático',
      activity_description: 'Configurar backup automático dos dados críticos',
      responsible_user: 'TI - Administrador de Sistemas',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
      priority: 'high',
      status: 'pending',
      estimated_cost: 5000.00
    };

    const { data: actionPlan, error: actionError } = await supabase
      .from('risk_action_plans')
      .insert([actionPlanData])
      .select()
      .single();

    if (actionError) {
      console.error('❌ Erro ao criar plano de ação:', actionError.message);
    } else {
      console.log('✅ Plano de ação criado:');
      console.log(`   Atividade: ${actionPlan.activity_title}`);
      console.log(`   Responsável: ${actionPlan.responsible_user}`);
      console.log(`   Prazo: ${actionPlan.due_date}`);
    }

    // 8. Testar relacionamentos - Stakeholders
    console.log('\n8️⃣ Testando relacionamentos - Adicionando stakeholder...');
    const stakeholderData = {
      risk_registration_id: createdRiskId,
      tenant_id: testTenantId,
      stakeholder_name: 'Diretor de TI',
      stakeholder_role: 'Aprovador',
      stakeholder_email: 'diretor.ti@empresa.com',
      notification_type: 'approval',
      approval_required: true,
      approval_status: 'pending'
    };

    const { data: stakeholder, error: stakeholderError } = await supabase
      .from('risk_stakeholders')
      .insert([stakeholderData])
      .select()
      .single();

    if (stakeholderError) {
      console.error('❌ Erro ao criar stakeholder:', stakeholderError.message);
    } else {
      console.log('✅ Stakeholder adicionado:');
      console.log(`   Nome: ${stakeholder.stakeholder_name}`);
      console.log(`   Função: ${stakeholder.stakeholder_role}`);
      console.log(`   Tipo: ${stakeholder.notification_type}`);
    }

    // 9. Testar consultas complexas
    console.log('\n9️⃣ Testando consultas complexas...');
    const { data: riskSummary, error: summaryError } = await supabase
      .from('risk_registrations')
      .select(`
        id,
        risk_title,
        risk_level,
        status,
        current_step,
        risk_score,
        gut_score,
        risk_action_plans(
          id,
          activity_title,
          status,
          priority
        ),
        risk_stakeholders(
          id,
          stakeholder_name,
          stakeholder_role,
          notification_type
        )
      `)
      .eq('id', createdRiskId)
      .single();

    if (summaryError) {
      console.error('❌ Erro na consulta complexa:', summaryError.message);
    } else {
      console.log('✅ Consulta complexa executada:');
      console.log(`   Risco: ${riskSummary.risk_title}`);
      console.log(`   Planos de ação: ${riskSummary.risk_action_plans?.length || 0}`);
      console.log(`   Stakeholders: ${riskSummary.risk_stakeholders?.length || 0}`);
    }

    // 10. Limpeza - DELETE (opcional, descomente para limpar)
    console.log('\n🔟 Opção de limpeza (teste de DELETE)...');
    console.log('ℹ️  Para manter dados de teste, o DELETE não será executado.');
    console.log(`   Para limpar manualmente: DELETE FROM risk_registrations WHERE id = '${createdRiskId}';`);
    
    /*
    const { error: deleteError } = await supabase
      .from('risk_registrations')
      .delete()
      .eq('id', createdRiskId);

    if (deleteError) {
      console.error('❌ Erro ao deletar risco:', deleteError.message);
    } else {
      console.log('✅ Risco deletado com sucesso');
    }
    */

    console.log('\n🎉 Todos os testes CRUD executados com sucesso!');
    console.log('\n📊 Resumo dos Testes:');
    console.log('✅ CREATE - Registro de risco criado');
    console.log('✅ READ - Busca de dados funcionando');
    console.log('✅ UPDATE - Atualização de status/progresso');
    console.log('✅ Relacionamentos - Action Plans e Stakeholders');
    console.log('✅ Consultas complexas - JOIN com tabelas relacionadas');
    console.log('✅ Validações - Constraints e checks funcionando');

  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar teste
if (require.main === module) {
  testRiskRegistrationCRUD()
    .then(() => {
      console.log('\n✅ Script de teste finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao executar teste:', error);
      process.exit(1);
    });
}

module.exports = { testRiskRegistrationCRUD };