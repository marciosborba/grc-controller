const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAllModules() {
  try {
    console.log('🧪 TESTE COMPLETO DOS MÓDULOS LGPD\n');
    console.log('=' .repeat(50));

    // 1. Login
    console.log('\n1️⃣ Fazendo login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });

    if (loginError) {
      console.log('❌ Erro no login:', loginError.message);
      return;
    }

    const user = loginData?.user;
    console.log('✅ Login realizado:', user.email);

    // Módulos a testar
    const modules = [
      {
        name: 'Legal Bases',
        table: 'legal_bases',
        data: {
          name: 'Teste Legal Basis',
          description: 'Descrição teste',
          legal_basis_type: 'consentimento',
          legal_article: 'Art. 7º, I',
          justification: 'Justificativa teste',
          applies_to_categories: ['nome'],
          applies_to_processing: ['marketing'],
          valid_from: new Date().toISOString().split('T')[0],
          status: 'active',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Consents',
        table: 'consents', 
        data: {
          data_subject_email: 'teste@exemplo.com',
          data_subject_name: 'Teste Nome',
          purpose: 'Teste',
          data_categories: ['nome'],
          collection_method: 'web_form',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Data Inventory',
        table: 'data_inventory',
        data: {
          name: 'Sistema Teste',
          description: 'Descrição sistema teste',
          data_categories: ['nome'],
          data_sources: ['sistema_interno'],
          retention_period: 12,
          storage_location: 'brasil',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'DPIA Assessments',
        table: 'dpia_assessments',
        data: {
          name: 'DPIA Teste',
          description: 'Descrição DPIA teste',
          scope: 'Sistema de teste',
          purpose: 'Teste de funcionalidade',
          data_categories: ['nome'],
          risk_level: 'medium',
          status: 'draft',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Data Subject Requests',
        table: 'data_subject_requests',
        data: {
          data_subject_name: 'Teste Nome',
          data_subject_email: 'teste@exemplo.com',
          request_type: 'access',
          description: 'Solicitação de teste',
          status: 'pending',
          priority: 'medium',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Privacy Incidents',
        table: 'privacy_incidents',
        data: {
          title: 'Incidente Teste',
          description: 'Descrição incidente teste',
          severity: 'medium',
          status: 'investigating',
          affected_data_subjects_count: 1,
          data_categories_affected: ['nome'],
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Processing Activities',
        table: 'processing_activities',
        data: {
          name: 'Atividade Teste',
          purpose: 'Teste processamento',
          legal_basis_type: 'consentimento',
          data_categories: ['nome'],
          data_sources: ['sistema_teste'],
          retention_period: 12,
          recipients: ['interno'],
          created_by: user.id,
          updated_by: user.id
        }
      }
    ];

    const results = {
      passed: 0,
      failed: 0,
      details: []
    };

    // Testar cada módulo
    for (const module of modules) {
      console.log(`\n2️⃣ Testando ${module.name}...`);
      
      try {
        // CREATE
        const { data: createData, error: createError } = await supabase
          .from(module.table)
          .insert([module.data])
          .select()
          .single();

        if (createError) {
          console.log(`   ❌ CREATE falhou: ${createError.message}`);
          results.failed++;
          results.details.push(`${module.name}: CREATE falhou`);
          continue;
        }

        console.log(`   ✅ CREATE: ID ${createData.id}`);
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
        const updateData = { updated_by: user.id, updated_at: new Date().toISOString() };
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
        results.details.push(`${module.name}: TODOS OS CRUDS OK`);

      } catch (error) {
        console.log(`   ❌ Erro geral: ${error.message}`);
        results.failed++;
        results.details.push(`${module.name}: Erro geral`);
      }
    }

    // Resultado final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO FINAL:');
    console.log(`✅ Módulos que passaram: ${results.passed}`);
    console.log(`❌ Módulos que falharam: ${results.failed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((results.passed / modules.length) * 100)}%`);
    
    console.log('\n📋 DETALHES:');
    results.details.forEach(detail => console.log(`   ${detail}`));

    if (results.failed === 0) {
      console.log('\n🎉 TODOS OS MÓDULOS LGPD ESTÃO FUNCIONANDO PERFEITAMENTE!');
    } else {
      console.log('\n⚠️ Alguns módulos precisam de correção');
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testAllModules();