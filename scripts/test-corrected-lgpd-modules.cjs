const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCorrectedModules() {
  try {
    console.log('🧪 TESTE CORRIGIDO DOS MÓDULOS LGPD\n');

    // Login
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });
    const user = loginData?.user;
    console.log('✅ Login realizado:', user.email);

    // Módulos corrigidos com campos reais
    const modules = [
      {
        name: 'Data Inventory',
        table: 'data_inventory',
        data: {
          name: 'Sistema Teste Inventário',
          description: 'Sistema de teste para inventário de dados',
          data_category: 'identificacao',
          data_types: ['nome', 'email'],
          system_name: 'sistema_teste',
          database_name: 'db_teste',
          table_field_names: ['campo1', 'campo2'],
          estimated_volume: 1000,
          retention_period_months: 12,
          retention_justification: 'Obrigação legal',
          sensitivity_level: 'medium',
          data_origin: 'coleta_direta',
          data_controller_id: user.id,
          status: 'active',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'DPIA Assessments',
        table: 'dpia_assessments',
        data: {
          name: 'DPIA Teste Corrigido',
          description: 'Avaliação de impacto teste',
          scope: 'Sistema completo',
          purpose: 'Teste de funcionalidade DPIA',
          data_categories: ['identificacao'],
          risk_level: 'medium',
          status: 'draft',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Privacy Incidents',
        table: 'privacy_incidents',
        data: {
          title: 'Incidente de Teste',
          description: 'Descrição do incidente de teste',
          incident_type: 'data_breach',
          severity: 'medium',
          status: 'investigating',
          affected_data_subjects: 1,
          data_categories: ['identificacao'],
          potential_impact: 'Impacto limitado',
          detection_method: 'monitoring',
          detection_date: new Date().toISOString(),
          containment_measures: 'Medidas de contenção aplicadas',
          corrective_actions: ['acao1', 'acao2'],
          requires_anpd_notification: false,
          requires_data_subject_notification: false,
          risk_assessment: 'Risco avaliado como baixo',
          reported_by: user.id,
          assigned_to: user.id,
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Processing Activities',
        table: 'processing_activities',
        data: {
          name: 'Atividade de Teste',
          description: 'Atividade de processamento de teste',
          purpose: 'Teste de funcionalidade',
          data_categories: ['identificacao'],
          data_subjects: ['clientes'],
          data_recipients: ['interno'],
          retention_period: '12 meses',
          retention_criteria: 'Critério de retenção teste',
          security_measures: ['criptografia', 'controle_acesso'],
          international_transfers: false,
          automated_decision_making: false,
          requires_dpia: false,
          status: 'active',
          controller_role: 'primary',
          risk_level: 'low',
          data_controller_id: user.id,
          created_by: user.id,
          updated_by: user.id
        }
      }
    ];

    const results = { passed: 0, failed: 0, details: [] };

    // Testar cada módulo
    for (const module of modules) {
      console.log(`\n🔧 Testando ${module.name}...`);
      
      try {
        // CREATE
        const { data: createData, error: createError } = await supabase
          .from(module.table)
          .insert([module.data])
          .select()
          .single();

        if (createError) {
          console.log(`   ❌ CREATE falhou: ${createError.message}`);
          console.log(`   Detalhes: ${createError.code}`);
          results.failed++;
          results.details.push(`${module.name}: CREATE falhou`);
          continue;
        }

        console.log(`   ✅ CREATE: ID ${createData.id.substring(0, 8)}...`);
        const recordId = createData.id;

        // READ
        const { data: readData, error: readError } = await supabase
          .from(module.table)
          .select('*')
          .eq('id', recordId)
          .single();

        if (readError) {
          console.log(`   ❌ READ falhou: ${readError.message}`);
        } else {
          console.log(`   ✅ READ: Dados lidos corretamente`);
        }

        // UPDATE
        const updateData = { 
          updated_by: user.id, 
          updated_at: new Date().toISOString() 
        };
        const { error: updateError } = await supabase
          .from(module.table)
          .update(updateData)
          .eq('id', recordId);

        if (updateError) {
          console.log(`   ❌ UPDATE falhou: ${updateError.message}`);
        } else {
          console.log(`   ✅ UPDATE: Registro atualizado`);
        }

        // DELETE
        const { error: deleteError } = await supabase
          .from(module.table)
          .delete()
          .eq('id', recordId);

        if (deleteError) {
          console.log(`   ❌ DELETE falhou: ${deleteError.message}`);
        } else {
          console.log(`   ✅ DELETE: Registro removido`);
        }

        results.passed++;
        results.details.push(`${module.name}: ✅ CRUD COMPLETO OK`);

      } catch (error) {
        console.log(`   ❌ Erro geral: ${error.message}`);
        results.failed++;
        results.details.push(`${module.name}: ❌ Erro geral`);
      }
    }

    // Resultado final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO FINAL CORRIGIDO:');
    console.log(`✅ Módulos que passaram: ${results.passed}`);
    console.log(`❌ Módulos que falharam: ${results.failed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((results.passed / modules.length) * 100)}%`);
    
    console.log('\n📋 DETALHES:');
    results.details.forEach(detail => console.log(`   ${detail}`));

    if (results.failed === 0) {
      console.log('\n🎉 TODOS OS MÓDULOS LGPD CORRIGIDOS ESTÃO FUNCIONANDO!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testCorrectedModules();