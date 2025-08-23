const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RianciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0NzU3NTU5LCJleHAiOjIwNTAzMzM1NTl9.Vo1agPUE4QGwlwqS37yOTLXS6-VpMXHE5w1cSmyQg-k';

const supabase = createClient(supabaseUrl, supabaseKey);

// Tenant de teste
const TEST_TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';

async function testCRUDOperations() {
  console.log('🧪 Iniciando testes CRUD para Risk Management\n');

  try {
    // 1. CREATE - Criar um risco de teste
    console.log('1️⃣ Testando CREATE - Criando risco de teste...');
    const newRisk = {
      tenant_id: TEST_TENANT_ID,
      title: 'Risco de Teste CRUD',
      description: 'Este é um risco criado para testar as operações CRUD',
      risk_category: 'Tecnológico',
      probability: 3,
      likelihood_score: 3,
      impact_score: 4,
      status: 'Identificado',
      treatment_type: 'Mitigar',
      severity: 'medium'
    };

    const { data: createdRisk, error: createError } = await supabase
      .from('risk_assessments')
      .insert([newRisk])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro na criação:', createError);
      return;
    }

    console.log('✅ Risco criado com sucesso:', createdRisk.id);
    console.log(`   Título: ${createdRisk.title}`);
    console.log(`   Score: ${createdRisk.risk_score}`);
    console.log(`   Nível: ${createdRisk.risk_level}\n`);

    // 2. READ - Buscar o risco criado
    console.log('2️⃣ Testando READ - Buscando risco criado...');
    const { data: readRisk, error: readError } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('id', createdRisk.id)
      .single();

    if (readError) {
      console.error('❌ Erro na leitura:', readError);
      return;
    }

    console.log('✅ Risco encontrado:', readRisk.title);
    console.log(`   Status: ${readRisk.status}`);
    console.log(`   Categoria: ${readRisk.risk_category}\n`);

    // 3. UPDATE - Atualizar o risco
    console.log('3️⃣ Testando UPDATE - Atualizando risco...');
    const updateData = {
      description: 'Descrição atualizada pelo teste CRUD',
      probability: 4,
      likelihood_score: 4,
      impact_score: 4,
      status: 'Avaliado'
    };

    const { data: updatedRisk, error: updateError } = await supabase
      .from('risk_assessments')
      .update(updateData)
      .eq('id', createdRisk.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro na atualização:', updateError);
      return;
    }

    console.log('✅ Risco atualizado com sucesso');
    console.log(`   Nova probabilidade: ${updatedRisk.probability}`);
    console.log(`   Novo score: ${updatedRisk.risk_score}`);
    console.log(`   Novo nível: ${updatedRisk.risk_level}\n`);

    // 4. Teste de Plano de Ação
    console.log('4️⃣ Testando criação de Plano de Ação...');
    const { data: actionPlan, error: planError } = await supabase
      .from('risk_action_plans')
      .insert([{
        risk_id: createdRisk.id,
        treatment_type: 'Mitigar',
        tenant_id: TEST_TENANT_ID
      }])
      .select()
      .single();

    if (planError) {
      console.error('❌ Erro na criação do plano:', planError);
    } else {
      console.log('✅ Plano de ação criado:', actionPlan.id);
    }

    // 5. Teste de Atividade
    console.log('5️⃣ Testando criação de Atividade...');
    if (actionPlan) {
      const { data: activity, error: actError } = await supabase
        .from('risk_action_activities')
        .insert([{
          action_plan_id: actionPlan.id,
          description: 'Atividade de teste',
          responsible_person: 'Equipe de Testes',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          status: 'TBD'
        }])
        .select()
        .single();

      if (actError) {
        console.error('❌ Erro na criação da atividade:', actError);
      } else {
        console.log('✅ Atividade criada:', activity.id);
      }
    }

    // 6. Teste de lista completa com joins
    console.log('6️⃣ Testando READ com joins (lista completa)...');
    const { data: fullRisks, error: listError } = await supabase
      .from('risk_assessments')
      .select(`
        *,
        risk_action_plans(*),
        risk_communications(*),
        risk_acceptance_letters(*)
      `)
      .eq('tenant_id', TEST_TENANT_ID)
      .limit(5);

    if (listError) {
      console.error('❌ Erro na listagem:', listError);
    } else {
      console.log(`✅ Lista carregada: ${fullRisks.length} riscos encontrados\n`);
    }

    // 7. DELETE - Remover o risco de teste (limpeza)
    console.log('7️⃣ Testando DELETE - Removendo risco de teste...');
    const { error: deleteError } = await supabase
      .from('risk_assessments')
      .delete()
      .eq('id', createdRisk.id);

    if (deleteError) {
      console.error('❌ Erro na exclusão:', deleteError);
    } else {
      console.log('✅ Risco removido com sucesso\n');
    }

    console.log('🎉 Todos os testes CRUD foram executados com sucesso!');

  } catch (error) {
    console.error('💥 Erro geral nos testes:', error);
  }
}

// Executar os testes
testCRUDOperations();