const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RianciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0NzU3NTU5LCJleHAiOjIwNTAzMzM1NTl9.Vo1agPUE4QGwlwqS37yOTLXS6-VpMXHE5w1cSmyQg-k';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAlexRiskIntegration() {
  console.log('🧪 Testando integração do Alex Risk Guided Process...\n');

  try {
    // 1. Verificar se a migração de matriz de risco foi aplicada
    console.log('1. Verificando configurações de matriz de risco nos tenants...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, settings')
      .limit(5);

    if (tenantsError) throw tenantsError;

    console.log(`   ✅ Encontrados ${tenants.length} tenants`);
    
    let tenantsWithMatrix = 0;
    tenants.forEach(tenant => {
      const hasMatrix = tenant.settings?.risk_matrix;
      if (hasMatrix) {
        tenantsWithMatrix++;
        console.log(`   📊 ${tenant.name}: Matriz ${tenant.settings.risk_matrix.type || '5x5'} configurada`);
      } else {
        console.log(`   ⚠️  ${tenant.name}: Sem configuração de matriz`);
      }
    });
    
    console.log(`   📈 ${tenantsWithMatrix}/${tenants.length} tenants com matriz configurada\n`);

    // 2. Testar criação de um registro de risco usando as tabelas do Alex Risk
    console.log('2. Testando criação de registro de risco (Alex Risk)...');
    
    const testTenant = tenants[0];
    if (!testTenant) {
      throw new Error('Nenhum tenant disponível para teste');
    }

    const mockRiskData = {
      tenant_id: testTenant.id,
      created_by: '00000000-0000-0000-0000-000000000000', // Mock UUID
      status: 'draft',
      current_step: 1,
      completion_percentage: 0,
      risk_title: 'Teste Alex Risk - Falha do Sistema Crítico',
      risk_description: 'Risco de falha no sistema crítico de produção que pode impactar operações',
      risk_category: 'technology',
      impact_score: 4,
      likelihood_score: 3,
      risk_score: 12,
      risk_level: 'Alto'
    };

    const { data: newRisk, error: riskError } = await supabase
      .from('risk_registrations')
      .insert(mockRiskData)
      .select()
      .single();

    if (riskError) throw riskError;

    console.log(`   ✅ Risco criado com ID: ${newRisk.id}`);
    console.log(`   📝 Título: ${newRisk.risk_title}`);
    console.log(`   📊 Score: ${newRisk.risk_score} (${newRisk.risk_level})`);

    // 3. Testar adição de stakeholders
    console.log('\n3. Testando adição de stakeholders...');
    
    const mockStakeholders = [
      {
        risk_registration_id: newRisk.id,
        name: 'João Silva',
        position: 'Gerente de TI',
        email: 'joao.silva@empresa.com',
        notification_type: 'approval',
        response_status: 'pending'
      },
      {
        risk_registration_id: newRisk.id,
        name: 'Maria Santos',
        position: 'Coordenadora de Riscos',
        email: 'maria.santos@empresa.com',
        notification_type: 'awareness',
        response_status: 'pending'
      }
    ];

    const { data: stakeholders, error: stakeholdersError } = await supabase
      .from('risk_stakeholders')
      .insert(mockStakeholders)
      .select();

    if (stakeholdersError) throw stakeholdersError;

    console.log(`   ✅ ${stakeholders.length} stakeholders adicionados`);
    stakeholders.forEach(s => {
      console.log(`   👤 ${s.name} (${s.position}) - ${s.notification_type}`);
    });

    // 4. Testar histórico de etapas
    console.log('\n4. Testando histórico de etapas...');
    
    const mockHistory = {
      risk_registration_id: newRisk.id,
      step_number: 1,
      step_name: 'Identificação',
      completed_by: '00000000-0000-0000-0000-000000000000',
      step_data: {
        alex_suggestions_used: 2,
        time_spent_minutes: 5,
        confidence_score: 0.85
      },
      notes: 'Etapa completada com assistência do Alex Risk'
    };

    const { data: history, error: historyError } = await supabase
      .from('risk_registration_history')
      .insert(mockHistory)
      .select()
      .single();

    if (historyError) throw historyError;

    console.log(`   ✅ Histórico criado para etapa ${history.step_number}`);
    console.log(`   📋 Etapa: ${history.step_name}`);
    console.log(`   🤖 Dados Alex: ${JSON.stringify(history.step_data)}`);

    // 5. Verificar integração completa
    console.log('\n5. Verificando integração completa...');
    
    const { data: fullRisk, error: fullError } = await supabase
      .from('risk_registrations')
      .select(`
        *,
        risk_stakeholders(*),
        risk_registration_history(*)
      `)
      .eq('id', newRisk.id)
      .single();

    if (fullError) throw fullError;

    console.log(`   ✅ Registro completo carregado:`);
    console.log(`   📊 Risco: ${fullRisk.risk_title}`);
    console.log(`   👥 Stakeholders: ${fullRisk.risk_stakeholders.length}`);
    console.log(`   📈 Histórico: ${fullRisk.risk_registration_history.length} etapas`);

    // 6. Limpeza dos dados de teste
    console.log('\n6. Limpando dados de teste...');
    
    const { error: deleteError } = await supabase
      .from('risk_registrations')
      .delete()
      .eq('id', newRisk.id);

    if (deleteError) throw deleteError;

    console.log('   ✅ Dados de teste removidos\n');

    // 7. Verificar configurações de metodologias
    console.log('7. Verificando metodologias de risco disponíveis...');
    
    const { data: methodologies, error: methodError } = await supabase
      .from('risk_methodologies')
      .select('name, code, is_default')
      .limit(5);

    if (methodError) throw methodError;

    console.log(`   ✅ ${methodologies.length} metodologias encontradas:`);
    methodologies.forEach(m => {
      const defaultFlag = m.is_default ? ' (padrão)' : '';
      console.log(`   🔬 ${m.name} (${m.code})${defaultFlag}`);
    });

    console.log('\n🎉 Todos os testes do Alex Risk passaram com sucesso!');
    console.log('\n📋 Resumo da integração:');
    console.log('✅ Tabelas de registro de risco funcionais');
    console.log('✅ Configuração de matriz por tenant');
    console.log('✅ Sistema de stakeholders integrado');
    console.log('✅ Histórico de etapas com dados da IA');
    console.log('✅ Metodologias de análise disponíveis');
    console.log('✅ Limpeza automática de dados de teste');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Detalhes:', error);
  }
}

// Executar testes
testAlexRiskIntegration();