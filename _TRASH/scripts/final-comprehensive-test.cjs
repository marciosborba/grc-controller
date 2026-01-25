const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function finalTest() {
  try {
    console.log('🎯 TESTE FINAL COMPLETO DOS SUBMÓDULOS LGPD');
    console.log('='.repeat(60));

    // Login
    console.log('\n🔐 Fazendo login...');
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: 'test@exemplo.com',
      password: 'testpassword123'
    });
    const user = loginData?.user;
    console.log('✅ Login bem-sucedido:', user.email);

    // Lista de todos os módulos funcionais
    const functionalModules = [
      {
        name: 'Bases Legais',
        table: 'legal_bases',
        data: {
          name: 'Base Legal Final Test',
          description: 'Teste final da base legal',
          legal_basis_type: 'consentimento',
          legal_article: 'Art. 7º, I da LGPD',
          justification: 'Justificativa para teste final',
          applies_to_categories: ['nome', 'email'],
          applies_to_processing: ['marketing'],
          valid_from: new Date().toISOString().split('T')[0],
          status: 'active',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Consentimentos',
        table: 'consents',
        data: {
          data_subject_email: 'teste.final@exemplo.com',
          data_subject_name: 'Usuário Teste Final',
          data_subject_document: '999.999.999-99',
          purpose: 'Teste final do módulo de consentimentos',
          data_categories: ['nome', 'email'],
          collection_method: 'web_form',
          collection_source: 'Teste automatizado',
          is_informed: true,
          is_specific: true,
          is_free: true,
          is_unambiguous: true,
          language: 'pt-BR',
          privacy_policy_version: '1.0',
          terms_of_service_version: '1.0',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Inventário de Dados',
        table: 'data_inventory',
        data: {
          name: 'Sistema Teste Final',
          description: 'Sistema para teste final do inventário',
          data_category: 'identificacao',
          data_types: ['nome', 'email', 'telefone'],
          system_name: 'sistema_teste_final',
          database_name: 'db_teste_final',
          table_field_names: ['users.name', 'users.email'],
          estimated_volume: 5000,
          retention_period_months: 24,
          retention_justification: 'Obrigação legal e necessidade comercial',
          sensitivity_level: 'medium',
          data_origin: 'coleta_direta',
          data_controller_id: user.id,
          status: 'active',
          next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Solicitações de Titulares',
        table: 'data_subject_requests',
        data: {
          data_subject_name: 'Titular Teste Final',
          data_subject_email: 'titular.teste.final@exemplo.com',
          request_type: 'access',
          description: 'Solicitação de acesso aos dados pessoais - teste final',
          status: 'pending',
          priority: 'medium',
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Incidentes de Privacidade',
        table: 'privacy_incidents',
        data: {
          title: 'Incidente de Teste Final',
          description: 'Descrição detalhada do incidente de teste final',
          incident_type: 'data_breach',
          severity: 'medium',
          status: 'investigating',
          affected_data_subjects: 10,
          data_categories: ['identificacao', 'contato'],
          potential_impact: 'Impacto potencial limitado aos dados de identificação',
          detection_method: 'monitoring',
          detection_date: new Date().toISOString(),
          containment_measures: 'Sistema isolado, acesso revogado, logs auditados',
          corrective_actions: ['patch_aplicado', 'treinamento_realizado'],
          requires_anpd_notification: true,
          requires_data_subject_notification: false,
          risk_assessment: 'Risco avaliado como médio, com medidas de mitigação aplicadas',
          reported_by: user.id,
          assigned_to: user.id,
          created_by: user.id,
          updated_by: user.id
        }
      },
      {
        name: 'Atividades de Tratamento',
        table: 'processing_activities',
        data: {
          name: 'Atividade de Teste Final',
          description: 'Atividade de tratamento para teste final do módulo',
          purpose: 'Gestão de relacionamento com clientes e marketing',
          data_categories: ['identificacao', 'contato', 'comportamental'],
          data_subjects: ['clientes', 'prospects'],
          data_recipients: ['equipe_marketing', 'equipe_vendas'],
          retention_period: '60 meses',
          retention_criteria: 'Dados mantidos enquanto houver relacionamento comercial ativo',
          security_measures: ['criptografia', 'controle_acesso', 'backup_seguro'],
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

    let totalTested = 0;
    let totalPassed = 0;
    const results = [];

    // Testar cada módulo
    for (const module of functionalModules) {
      console.log(`\n🧪 Testando ${module.name}...`);
      totalTested++;
      
      try {
        // CREATE
        const { data: createData, error: createError } = await supabase
          .from(module.table)
          .insert([module.data])
          .select()
          .single();

        if (createError) {
          console.log(`   ❌ CREATE falhou: ${createError.message}`);
          results.push(`${module.name}: ❌ CREATE falhou`);
          continue;
        }

        const recordId = createData.id;
        console.log(`   ✅ CREATE: Registro criado`);

        // READ
        const { data: readData, error: readError } = await supabase
          .from(module.table)
          .select('*')
          .eq('id', recordId)
          .single();

        if (readError) {
          console.log(`   ❌ READ falhou: ${readError.message}`);
          results.push(`${module.name}: ❌ READ falhou`);
          continue;
        }

        console.log(`   ✅ READ: Dados recuperados`);

        // UPDATE
        const { error: updateError } = await supabase
          .from(module.table)
          .update({ 
            updated_by: user.id, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', recordId);

        if (updateError) {
          console.log(`   ❌ UPDATE falhou: ${updateError.message}`);
          results.push(`${module.name}: ❌ UPDATE falhou`);
          continue;
        }

        console.log(`   ✅ UPDATE: Registro atualizado`);

        // DELETE
        const { error: deleteError } = await supabase
          .from(module.table)
          .delete()
          .eq('id', recordId);

        if (deleteError) {
          console.log(`   ❌ DELETE falhou: ${deleteError.message}`);
          results.push(`${module.name}: ❌ DELETE falhou`);
          continue;
        }

        console.log(`   ✅ DELETE: Registro removido`);
        console.log(`   🎉 ${module.name}: CRUD COMPLETO FUNCIONANDO!`);

        totalPassed++;
        results.push(`${module.name}: ✅ TODOS OS CRUDS OK`);

      } catch (error) {
        console.log(`   ❌ Erro inesperado: ${error.message}`);
        results.push(`${module.name}: ❌ Erro inesperado`);
      }
    }

    // Relatório Final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL - MÓDULOS LGPD');
    console.log('='.repeat(60));
    console.log(`🧪 Módulos testados: ${totalTested}`);
    console.log(`✅ Módulos funcionais: ${totalPassed}`);
    console.log(`❌ Módulos com problemas: ${totalTested - totalPassed}`);
    console.log(`📈 Taxa de sucesso: ${Math.round((totalPassed / totalTested) * 100)}%`);

    console.log('\n📋 DETALHES POR MÓDULO:');
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result}`);
    });

    if (totalPassed === totalTested) {
      console.log('\n🎉 PARABÉNS! TODOS OS MÓDULOS LGPD ESTÃO FUNCIONANDO PERFEITAMENTE!');
      console.log('✨ O sistema está pronto para uso em produção!');
      
      console.log('\n📌 MÓDULOS FUNCIONAIS:');
      console.log('   • Bases Legais - Gestão completa de fundamentos legais');
      console.log('   • Consentimentos - Coleta e gestão de consentimentos LGPD');
      console.log('   • Inventário de Dados - Mapeamento completo de dados pessoais');
      console.log('   • Solicitações de Titulares - Portal de exercício de direitos');
      console.log('   • Incidentes de Privacidade - Gestão de vazamentos e incidentes');
      console.log('   • Atividades de Tratamento - Registro oficial (RAT) Art. 37 LGPD');
      
      console.log('\n🚀 PRÓXIMOS PASSOS:');
      console.log('   1. Testar interface web (formulários e campos)');
      console.log('   2. Validar fluxos de trabalho completos');
      console.log('   3. Testar integrações e relatórios');
      console.log('   4. Configurar ambiente de produção');

    } else {
      console.log('\n⚠️ Alguns módulos precisam de atenção adicional');
    }

  } catch (error) {
    console.error('❌ Erro crítico no teste final:', error);
  }
}

finalTest();