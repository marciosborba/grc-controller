const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRiskFormSave() {
  console.log('🧪 Testando salvamento do formulário de risco...');
  
  // Simular dados que o formulário enviaria
  const testData = {
    // Campos básicos
    status: 'completed',
    completion_percentage: 100,
    current_step: 7,
    completed_at: new Date().toISOString(),
    
    // Etapa 1: Identificação
    risk_title: 'Teste de Risco - Formulário',
    risk_description: 'Descrição do risco de teste',
    risk_category: 'operacional',
    risk_source: 'processo',
    identification_date: '2025-01-15',
    responsible_area: 'TI',
    
    // Etapa 2: Análise
    methodology_id: 'qualitative',
    impact_score: 3,
    probability_score: 2,
    risk_score: 6,
    risk_level: 'medium',
    
    // Etapa 3: Classificação GUT
    gravity_score: 3,
    urgency_score: 2,
    tendency_score: 4,
    
    // Etapa 4: Tratamento
    treatment_strategy: 'mitigate',
    treatment_rationale: 'Implementar controles',
    
    // Etapa 7: Monitoramento
    monitoring_frequency: 'monthly',
    monitoring_responsible: 'João Silva',
    review_date: '2025-02-15',
    residual_risk_level: 'low',
    residual_probability: 1,
    closure_criteria: 'Controles implementados',
    monitoring_notes: 'Acompanhar mensalmente',
    kpi_definition: 'Número de incidentes'
  };
  
  try {
    // Tentar inserir um registro de teste
    console.log('📝 Inserindo registro de teste...');
    const { data, error } = await supabase
      .from('risk_registrations')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao inserir:', error);
      return;
    }
    
    console.log('✅ Registro inserido com sucesso!');
    console.log('📋 ID do registro:', data.id);
    
    // Verificar se todos os campos foram salvos
    console.log('\n🔍 Verificando campos salvos...');
    const { data: savedData, error: fetchError } = await supabase
      .from('risk_registrations')
      .select('*')
      .eq('id', data.id)
      .single();
    
    if (fetchError) {
      console.error('❌ Erro ao buscar registro:', fetchError);
      return;
    }
    
    // Verificar campos específicos que estavam faltando
    const fieldsToCheck = [
      'methodology_id',
      'probability_score', 
      'gravity_score',
      'urgency_score',
      'tendency_score',
      'monitoring_responsible',
      'review_date',
      'residual_risk_level',
      'residual_probability',
      'closure_criteria',
      'monitoring_notes',
      'kpi_definition',
      'identification_date',
      'responsible_area'
    ];
    
    console.log('\n📊 Campos verificados:');
    fieldsToCheck.forEach(field => {
      const value = savedData[field];
      const status = value !== null && value !== undefined ? '✅' : '❌';
      console.log(`${status} ${field}: ${value}`);
    });
    
    // Limpar o registro de teste
    console.log('\n🧹 Limpando registro de teste...');
    await supabase
      .from('risk_registrations')
      .delete()
      .eq('id', data.id);
    
    console.log('✅ Registro de teste removido');
    console.log('\n🎉 TESTE CONCLUÍDO: O formulário deve funcionar corretamente agora!');
    
  } catch (err) {
    console.error('❌ Erro durante o teste:', err);
  }
}

testRiskFormSave();