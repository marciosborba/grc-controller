// =============================================================================
// SCRIPT DE DEBUG PARA CRIAÇÃO DE RISCOS
// =============================================================================
// Cole este código no console do navegador (F12) na página de riscos
// e execute as funções para debugar o problema

// Função para testar a estrutura da tabela
window.debugRiskTable = async function() {
  console.group('🔍 DEBUG: Estrutura da Tabela risk_assessments');
  
  try {
    // Tentar buscar um registro existente para ver a estrutura
    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao buscar estrutura:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Estrutura da tabela (baseada em registro existente):');
      const sample = data[0];
      Object.entries(sample).forEach(([key, value]) => {
        console.log(`• ${key}:`, {
          valor: value,
          tipo: typeof value,
          éUUID: typeof value === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'Sim' : 'Não'
        });
      });
    } else {
      console.log('⚠️ Nenhum registro encontrado na tabela');
    }
  } catch (err) {
    console.error('❌ Erro na função:', err);
  }
  
  console.groupEnd();
};

// Função para testar inserção com dados mínimos
window.debugMinimalInsert = async function() {
  console.group('🧪 DEBUG: Teste de Inserção Mínima');
  
  const testData = {
    title: 'Teste Debug',
    risk_category: 'Operacional',
    probability: 3,
    likelihood_score: 3,
    impact_score: 3,
    risk_level: 'Médio',
    status: 'Identificado'
  };
  
  console.log('📝 Dados de teste:');
  console.table(testData);
  
  try {
    const { data, error } = await supabase
      .from('risk_assessments')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('❌ Erro na inserção mínima:', error);
      console.table({
        'Mensagem': error.message,
        'Código': error.code,
        'Detalhes': error.details,
        'Hint': error.hint
      });
    } else {
      console.log('✅ Inserção mínima bem-sucedida!');
      console.table(data[0]);
      
      // Limpar o teste
      await supabase.from('risk_assessments').delete().eq('id', data[0].id);
      console.log('🧹 Registro de teste removido');
    }
  } catch (err) {
    console.error('❌ Erro na função:', err);
  }
  
  console.groupEnd();
};

// Função para testar inserção com assigned_to
window.debugAssignedToInsert = async function() {
  console.group('🧪 DEBUG: Teste com assigned_to');
  
  const testData = {
    title: 'Teste assigned_to',
    risk_category: 'Operacional',
    probability: 3,
    likelihood_score: 3,
    impact_score: 3,
    risk_level: 'Médio',
    status: 'Identificado',
    assigned_to: 'teste'  // Este é o valor que pode estar causando problema
  };
  
  console.log('📝 Dados de teste com assigned_to:');
  console.table(testData);
  
  try {
    const { data, error } = await supabase
      .from('risk_assessments')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('❌ Erro com assigned_to:', error);
      console.table({
        'Mensagem': error.message,
        'Código': error.code,
        'Detalhes': error.details,
        'Hint': error.hint
      });
      
      if (error.message.includes('uuid')) {
        console.error('🎯 PROBLEMA IDENTIFICADO: assigned_to está sendo tratado como UUID!');
        console.log('💡 Solução: O campo assigned_to na tabela precisa ser alterado para TEXT');
      }
    } else {
      console.log('✅ Inserção com assigned_to bem-sucedida!');
      console.table(data[0]);
      
      // Limpar o teste
      await supabase.from('risk_assessments').delete().eq('id', data[0].id);
      console.log('🧹 Registro de teste removido');
    }
  } catch (err) {
    console.error('❌ Erro na função:', err);
  }
  
  console.groupEnd();
};

// Função para testar todos os campos UUID
window.debugUUIDFields = async function() {
  console.group('🔍 DEBUG: Teste de Campos UUID');
  
  const uuidFields = {
    tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f',
    created_by: '46b1c048-85a1-423b-96fc-776007c8de1f'
  };
  
  console.log('📝 Testando campos UUID individualmente:');
  
  for (const [fieldName, uuidValue] of Object.entries(uuidFields)) {
    console.log(`\n🧪 Testando campo: ${fieldName}`);
    
    const testData = {
      title: `Teste ${fieldName}`,
      risk_category: 'Operacional',
      probability: 3,
      likelihood_score: 3,
      impact_score: 3,
      risk_level: 'Médio',
      status: 'Identificado',
      [fieldName]: uuidValue
    };
    
    try {
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert([testData])
        .select();
      
      if (error) {
        console.error(`❌ Erro com ${fieldName}:`, error.message);
      } else {
        console.log(`✅ Campo ${fieldName} funcionou!`);
        // Limpar o teste
        await supabase.from('risk_assessments').delete().eq('id', data[0].id);
      }
    } catch (err) {
      console.error(`❌ Erro testando ${fieldName}:`, err);
    }
  }
  
  console.groupEnd();
};

// Função principal de debug
window.debugRiskCreation = async function() {
  console.clear();
  console.log('🚀 INICIANDO DEBUG COMPLETO DA CRIAÇÃO DE RISCOS');
  console.log('================================================');
  
  await debugRiskTable();
  await debugMinimalInsert();
  await debugAssignedToInsert();
  await debugUUIDFields();
  
  console.log('✅ DEBUG COMPLETO FINALIZADO!');
  console.log('💡 Verifique os logs acima para identificar o problema');
};

// Instruções
console.log('🔧 FUNÇÕES DE DEBUG CARREGADAS!');
console.log('📋 Funções disponíveis:');
console.log('• debugRiskCreation() - Executa todos os testes');
console.log('• debugRiskTable() - Verifica estrutura da tabela');
console.log('• debugMinimalInsert() - Testa inserção mínima');
console.log('• debugAssignedToInsert() - Testa campo assigned_to');
console.log('• debugUUIDFields() - Testa campos UUID');
console.log('');
console.log('🚀 Para começar, execute: debugRiskCreation()');