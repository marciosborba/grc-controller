// Script para verificar e corrigir a estrutura da tabela incidents
// Execute no console do navegador na página de incidentes

console.log('🔧 VERIFICANDO E CORRIGINDO ESTRUTURA DA TABELA INCIDENTS');

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura atual da tabela...');
  
  try {
    // Primeiro, vamos tentar buscar um incidente para ver os campos disponíveis
    const { data: incidents, error: fetchError } = await supabase
      .from('incidents')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar incidentes:', fetchError);
      return null;
    }
    
    if (incidents && incidents.length > 0) {
      const incident = incidents[0];
      console.log('📊 CAMPOS DISPONÍVEIS NA TABELA:');
      const fields = Object.keys(incident).sort();
      console.log(fields);
      
      console.log('📋 EXEMPLO DE REGISTRO:');
      console.log(incident);
      
      return fields;
    } else {
      console.log('ℹ️ Tabela incidents está vazia');
      return [];
    }
    
  } catch (error) {
    console.error('❌ ERRO ao verificar estrutura:', error);
    return null;
  }
}

async function testMinimalUpdate() {
  console.log('🧪 Testando UPDATE com dados mínimos...');
  
  try {
    // Buscar um incidente para testar
    const { data: incidents, error: fetchError } = await supabase
      .from('incidents')
      .select('*')
      .limit(1);
    
    if (fetchError || !incidents || incidents.length === 0) {
      console.log('ℹ️ Nenhum incidente disponível para teste');
      return;
    }
    
    const incident = incidents[0];
    console.log('📋 Testando com incidente ID:', incident.id);
    
    // Teste 1: Apenas título
    console.log('🔄 Teste 1: Atualizando apenas título...');
    const { data: data1, error: error1 } = await supabase
      .from('incidents')
      .update({ title: incident.title + ' (teste 1)' })
      .eq('id', incident.id)
      .select()
      .single();
    
    if (error1) {
      console.error('❌ ERRO Teste 1:', {
        message: error1.message,
        details: error1.details,
        hint: error1.hint,
        code: error1.code
      });
    } else {
      console.log('✅ Teste 1 bem-sucedido');
    }
    
    // Teste 2: Campos básicos
    console.log('🔄 Teste 2: Atualizando campos básicos...');
    const basicData = {
      title: incident.title,
      description: 'Teste de descrição',
      category: 'Teste',
      priority: 'medium',
      status: 'open'
    };
    
    const { data: data2, error: error2 } = await supabase
      .from('incidents')
      .update(basicData)
      .eq('id', incident.id)
      .select()
      .single();
    
    if (error2) {
      console.error('❌ ERRO Teste 2:', {
        message: error2.message,
        details: error2.details,
        hint: error2.hint,
        code: error2.code
      });
    } else {
      console.log('✅ Teste 2 bem-sucedido');
    }
    
    // Teste 3: Com campos que podem não existir
    console.log('🔄 Teste 3: Testando campos que podem não existir...');
    const extendedData = {
      title: incident.title,
      description: 'Teste de descrição',
      category: 'Teste',
      priority: 'medium',
      status: 'open',
      type: 'security_breach',
      severity: 'medium',
      detection_date: new Date().toISOString(),
      affected_systems: ['Sistema 1'],
      business_impact: 'Impacto teste'
    };
    
    const { data: data3, error: error3 } = await supabase
      .from('incidents')
      .update(extendedData)
      .eq('id', incident.id)
      .select()
      .single();
    
    if (error3) {
      console.error('❌ ERRO Teste 3 (esperado se campos não existem):', {
        message: error3.message,
        details: error3.details,
        hint: error3.hint,
        code: error3.code
      });
      
      // Identificar campo problemático
      if (error3.message.includes('column') && error3.message.includes('does not exist')) {
        const match = error3.message.match(/column "([^"]+)" does not exist/);
        if (match) {
          console.log(`🔍 Campo problemático identificado: ${match[1]}`);
        }
      }
    } else {
      console.log('✅ Teste 3 bem-sucedido - todos os campos existem');
    }
    
  } catch (error) {
    console.error('❌ ERRO GERAL nos testes:', error);
  }
}

async function testFieldByField() {
  console.log('🔬 Testando campos individualmente...');
  
  try {
    // Buscar um incidente para testar
    const { data: incidents, error: fetchError } = await supabase
      .from('incidents')
      .select('*')
      .limit(1);
    
    if (fetchError || !incidents || incidents.length === 0) {
      console.log('ℹ️ Nenhum incidente disponível para teste');
      return;
    }
    
    const incident = incidents[0];
    
    // Lista de campos para testar
    const fieldsToTest = [
      { field: 'title', value: 'Teste título' },
      { field: 'description', value: 'Teste descrição' },
      { field: 'category', value: 'Teste' },
      { field: 'priority', value: 'medium' },
      { field: 'status', value: 'open' },
      { field: 'type', value: 'security_breach' },
      { field: 'severity', value: 'medium' },
      { field: 'detection_date', value: new Date().toISOString() },
      { field: 'resolution_date', value: new Date().toISOString() },
      { field: 'affected_systems', value: ['Sistema 1'] },
      { field: 'business_impact', value: 'Impacto teste' },
      { field: 'reporter_id', value: null },
      { field: 'assignee_id', value: null },
      { field: 'tenant_id', value: null },
      { field: 'updated_at', value: new Date().toISOString() }
    ];
    
    const workingFields = [];
    const failingFields = [];
    
    for (const { field, value } of fieldsToTest) {
      console.log(`🔄 Testando campo: ${field}`);
      
      const updateData = { [field]: value };
      
      const { data, error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', incident.id)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Campo ${field} falhou:`, error.message);
        failingFields.push({ field, error: error.message });
      } else {
        console.log(`✅ Campo ${field} funcionou`);
        workingFields.push(field);
      }
      
      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('✅ Campos que funcionam:', workingFields);
    console.log('❌ Campos que falham:', failingFields);
    
    return { workingFields, failingFields };
    
  } catch (error) {
    console.error('❌ ERRO GERAL no teste campo por campo:', error);
  }
}

async function createSafeUpdateFunction() {
  console.log('🛠️ Criando função de update segura...');
  
  const results = await testFieldByField();
  
  if (results && results.workingFields) {
    console.log('📝 Criando função de update apenas com campos seguros...');
    
    window.safeIncidentUpdate = async function(incidentId, formData) {
      console.log('🔒 Executando update seguro para incidente:', incidentId);
      
      // Usar apenas campos que sabemos que funcionam
      const safeData = {};
      
      // Campos básicos que sempre devem funcionar
      if (formData.title) safeData.title = formData.title;
      if (formData.description) safeData.description = formData.description;
      if (formData.category) safeData.category = formData.category;
      if (formData.priority) safeData.priority = formData.priority;
      if (formData.status) safeData.status = formData.status;
      
      // Adicionar campos opcionais apenas se estiverem na lista de funcionando
      if (results.workingFields.includes('reporter_id') && formData.reporter_id) {
        safeData.reporter_id = formData.reporter_id;
      }
      if (results.workingFields.includes('assignee_id') && formData.assignee_id) {
        safeData.assignee_id = formData.assignee_id;
      }
      if (results.workingFields.includes('tenant_id') && formData.tenant_id) {
        safeData.tenant_id = formData.tenant_id;
      }
      if (results.workingFields.includes('updated_at')) {
        safeData.updated_at = new Date().toISOString();
      }
      
      console.log('📤 Dados seguros para update:', safeData);
      
      const { data, error } = await supabase
        .from('incidents')
        .update(safeData)
        .eq('id', incidentId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ ERRO no update seguro:', error);
        throw error;
      }
      
      console.log('✅ Update seguro bem-sucedido:', data);
      return data;
    };
    
    console.log('✅ Função window.safeIncidentUpdate criada e disponível');
  }
}

// Executar todos os testes
async function runFullDiagnostic() {
  console.log('🚀 EXECUTANDO DIAGNÓSTICO COMPLETO');
  
  const fields = await checkTableStructure();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testMinimalUpdate();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await createSafeUpdateFunction();
  
  console.log('\n✅ DIAGNÓSTICO COMPLETO FINALIZADO');
  console.log('💡 Use window.safeIncidentUpdate(incidentId, formData) para updates seguros');
}

// Executar automaticamente
runFullDiagnostic();

// Disponibilizar funções globalmente
window.incidentDiagnostic = {
  checkTableStructure,
  testMinimalUpdate,
  testFieldByField,
  createSafeUpdateFunction,
  runFullDiagnostic
};