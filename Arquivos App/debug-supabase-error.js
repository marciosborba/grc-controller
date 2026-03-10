// Script para debugar erro específico do Supabase UPDATE
// Execute no console do navegador na página de incidentes

console.log('🔧 INICIANDO DEBUG DO ERRO SUPABASE UPDATE');

// Função para testar update com dados mínimos
async function testMinimalUpdate() {
  console.log('🧪 Testando UPDATE com dados mínimos...');
  
  try {
    // Primeiro, vamos buscar um incidente existente
    const { data: incidents, error: fetchError } = await supabase
      .from('incidents')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar incidentes:', fetchError);
      return;
    }
    
    if (!incidents || incidents.length === 0) {
      console.log('ℹ️ Nenhum incidente encontrado para testar');
      return;
    }
    
    const incident = incidents[0];
    console.log('📋 Incidente encontrado para teste:', incident);
    
    // Testar update com apenas um campo
    console.log('🔄 Testando UPDATE com apenas title...');
    const { data: updateData1, error: updateError1 } = await supabase
      .from('incidents')
      .update({ title: incident.title + ' (teste)' })
      .eq('id', incident.id)
      .select()
      .single();
    
    console.log('📥 Resultado UPDATE title:', { data: updateData1, error: updateError1 });
    
    if (updateError1) {
      console.error('❌ ERRO DETALHADO UPDATE title:', {
        message: updateError1.message,
        details: updateError1.details,
        hint: updateError1.hint,
        code: updateError1.code
      });
    }
    
    // Testar update com campos que não existem na tabela
    console.log('🔄 Testando UPDATE com campos inexistentes...');
    const { data: updateData2, error: updateError2 } = await supabase
      .from('incidents')
      .update({ 
        title: incident.title,
        type: 'security_breach',  // Este campo pode não existir
        severity: 'medium'        // Este campo pode não existir
      })
      .eq('id', incident.id)
      .select()
      .single();
    
    console.log('📥 Resultado UPDATE com campos extras:', { data: updateData2, error: updateError2 });
    
    if (updateError2) {
      console.error('❌ ERRO DETALHADO UPDATE campos extras:', {
        message: updateError2.message,
        details: updateError2.details,
        hint: updateError2.hint,
        code: updateError2.code
      });
    }
    
  } catch (error) {
    console.error('❌ ERRO GERAL no teste:', error);
  }
}

// Função para verificar estrutura da tabela
async function checkTableStructure() {
  console.log('🔍 Verificando estrutura da tabela incidents...');
  
  try {
    // Tentar buscar todos os campos de um incidente
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao verificar estrutura:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📊 Campos disponíveis na tabela incidents:');
      console.log(Object.keys(data[0]));
      console.log('📋 Exemplo de registro:', data[0]);
    } else {
      console.log('ℹ️ Tabela incidents está vazia');
    }
    
  } catch (error) {
    console.error('❌ ERRO ao verificar estrutura:', error);
  }
}

// Função para testar com dados exatos do modal
async function testModalData() {
  console.log('🎭 Testando com dados similares ao modal...');
  
  try {
    // Buscar um incidente para testar
    const { data: incidents, error: fetchError } = await supabase
      .from('incidents')
      .select('*')
      .limit(1);
    
    if (fetchError || !incidents || incidents.length === 0) {
      console.log('ℹ️ Não foi possível buscar incidente para teste');
      return;
    }
    
    const incident = incidents[0];
    
    // Dados similares aos enviados pelo modal
    const modalData = {
      title: 'Teste de Update do Modal',
      description: 'Descrição de teste',
      type: 'security_breach',
      category: 'Segurança da Informação',
      severity: 'medium',
      priority: 'medium',
      status: 'open',
      detection_date: new Date().toISOString(),
      resolution_date: null,
      affected_systems: ['Sistema Teste'],
      business_impact: 'Impacto de teste',
      reporter_id: null,
      assignee_id: null,
      tenant_id: null,
      updated_at: new Date().toISOString()
    };
    
    console.log('📤 Dados do modal para teste:', modalData);
    
    const { data: updateData, error: updateError } = await supabase
      .from('incidents')
      .update(modalData)
      .eq('id', incident.id)
      .select()
      .single();
    
    console.log('📥 Resultado UPDATE modal data:', { data: updateData, error: updateError });
    
    if (updateError) {
      console.error('❌ ERRO DETALHADO UPDATE modal data:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
        stack: updateError.stack
      });
    }
    
  } catch (error) {
    console.error('❌ ERRO GERAL no teste modal:', error);
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 EXECUTANDO TODOS OS TESTES DE DEBUG');
  
  await checkTableStructure();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testMinimalUpdate();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testModalData();
  
  console.log('✅ TESTES DE DEBUG CONCLUÍDOS');
}

// Executar automaticamente
runAllTests();

// Exportar funções para uso manual
window.debugSupabase = {
  testMinimalUpdate,
  checkTableStructure,
  testModalData,
  runAllTests
};

console.log('💡 Funções disponíveis em window.debugSupabase:');
console.log('- testMinimalUpdate()');
console.log('- checkTableStructure()');
console.log('- testModalData()');
console.log('- runAllTests()');