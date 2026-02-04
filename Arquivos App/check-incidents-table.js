// Script para verificar a estrutura da tabela incidents
// Execute no console do navegador

console.log('🔍 VERIFICANDO ESTRUTURA DA TABELA INCIDENTS');

async function checkIncidentsTable() {
  try {
    // Buscar um incidente para ver os campos disponíveis
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao buscar incidentes:', error);
      return;
    }
    
    if (incidents && incidents.length > 0) {
      const incident = incidents[0];
      console.log('📊 CAMPOS DISPONÍVEIS NA TABELA INCIDENTS:');
      console.log(Object.keys(incident).sort());
      console.log('\n📋 EXEMPLO DE REGISTRO:');
      console.log(incident);
      
      // Verificar tipos de dados
      console.log('\n🔍 TIPOS DE DADOS:');
      Object.keys(incident).forEach(key => {
        const value = incident[key];
        const type = value === null ? 'null' : typeof value;
        console.log(`${key}: ${type} = ${value}`);
      });
      
    } else {
      console.log('ℹ️ Tabela incidents está vazia');
      
      // Tentar criar um incidente de teste para ver quais campos são aceitos
      console.log('🧪 Tentando criar incidente de teste para verificar campos...');
      
      const testData = {
        title: 'Teste de Estrutura',
        description: 'Teste para verificar campos',
        category: 'Teste',
        priority: 'low',
        status: 'open'
      };
      
      const { data: createData, error: createError } = await supabase
        .from('incidents')
        .insert(testData)
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erro ao criar incidente de teste:', createError);
      } else {
        console.log('✅ Incidente de teste criado:', createData);
        console.log('📊 Campos aceitos:', Object.keys(createData));
        
        // Deletar o incidente de teste
        await supabase.from('incidents').delete().eq('id', createData.id);
        console.log('🗑️ Incidente de teste removido');
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
  }
}

// Função para testar update com campos específicos
async function testUpdateFields() {
  console.log('\n🧪 TESTANDO UPDATE COM CAMPOS ESPECÍFICOS');
  
  try {
    // Buscar um incidente existente
    const { data: incidents, error } = await supabase
      .from('incidents')
      .select('*')
      .limit(1);
    
    if (error || !incidents || incidents.length === 0) {
      console.log('ℹ️ Nenhum incidente disponível para teste');
      return;
    }
    
    const incident = incidents[0];
    console.log('📋 Testando com incidente:', incident.id);
    
    // Testar campos um por um
    const fieldsToTest = [
      { title: incident.title + ' (updated)' },
      { description: 'Descrição atualizada' },
      { category: 'Teste' },
      { priority: 'medium' },
      { status: 'investigating' },
      { type: 'security_breach' },
      { severity: 'medium' },
      { detection_date: new Date().toISOString() },
      { affected_systems: ['Sistema 1', 'Sistema 2'] },
      { business_impact: 'Impacto de teste' }
    ];
    
    for (const fieldTest of fieldsToTest) {
      const fieldName = Object.keys(fieldTest)[0];
      console.log(`\n🔄 Testando campo: ${fieldName}`);
      
      const { data, error } = await supabase
        .from('incidents')
        .update(fieldTest)
        .eq('id', incident.id)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ ERRO no campo ${fieldName}:`, {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
      } else {
        console.log(`✅ Campo ${fieldName} atualizado com sucesso`);
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO no teste de campos:', error);
  }
}

// Executar verificações
checkIncidentsTable().then(() => {
  return testUpdateFields();
}).then(() => {
  console.log('\n✅ VERIFICAÇÃO COMPLETA');
});

// Disponibilizar funções globalmente
window.checkIncidentsTable = checkIncidentsTable;
window.testUpdateFields = testUpdateFields;