#!/usr/bin/env node

/**
 * Script para verificar e criar tabelas do módulo Vendor Risk Management
 * Executado como parte da reestruturação do módulo conforme personalidade Alex Vendor
 */

import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const SUPABASE_URL = "https://myxvxponlmulnjstbjwd.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.xFqQLKv6TCYgwEw7tpD3nHrckXB6zsBMK-xA3QSNnNc"; // Service role para admin

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkVendorRiskTables() {
  console.log('🔍 Verificando tabelas do módulo Vendor Risk Management...');
  
  try {
    // Lista das tabelas que devem existir
    const requiredTables = [
      'vendor_registry',
      'vendor_contacts',
      'vendor_assessment_frameworks',
      'vendor_assessments',
      'vendor_risks',
      'vendor_risk_action_plans',
      'vendor_incidents',
      'vendor_communications',
      'vendor_performance_metrics'
    ];

    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'vendor_%');

    if (error) {
      console.error('❌ Erro ao verificar tabelas:', error);
      return false;
    }

    const existingTables = tables?.map(t => t.table_name) || [];
    console.log(`✅ Tabelas encontradas (${existingTables.length}):`, existingTables);

    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`⚠️ Tabelas ausentes (${missingTables.length}):`, missingTables);
      return false;
    } else {
      console.log('✅ Todas as tabelas do Vendor Risk Management estão presentes!');
      return true;
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    return false;
  }
}

async function testVendorRiskOperations() {
  console.log('\n🧪 Testando operações básicas do Vendor Risk Management...');
  
  try {
    // Teste 1: Verificar se consegue listar vendor_registry
    const { data: vendors, error: vendorsError } = await supabase
      .from('vendor_registry')
      .select('id, name, status')
      .limit(5);

    if (vendorsError) {
      console.error('❌ Erro ao consultar vendor_registry:', vendorsError);
      return false;
    }

    console.log(`✅ vendor_registry: ${vendors?.length || 0} registros encontrados`);

    // Teste 2: Verificar frameworks de assessment
    const { data: frameworks, error: frameworksError } = await supabase
      .from('vendor_assessment_frameworks')
      .select('id, name, framework_type')
      .limit(5);

    if (frameworksError) {
      console.error('❌ Erro ao consultar vendor_assessment_frameworks:', frameworksError);
      return false;
    }

    console.log(`✅ vendor_assessment_frameworks: ${frameworks?.length || 0} registros encontrados`);

    // Teste 3: Verificar assessments
    const { data: assessments, error: assessmentsError } = await supabase
      .from('vendor_assessments')
      .select('id, assessment_name, status')
      .limit(5);

    if (assessmentsError) {
      console.error('❌ Erro ao consultar vendor_assessments:', assessmentsError);
      return false;
    }

    console.log(`✅ vendor_assessments: ${assessments?.length || 0} registros encontrados`);

    console.log('\n✅ Testes básicos concluídos com sucesso!');
    return true;

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    return false;
  }
}

async function createSampleData() {
  console.log('\n📝 Criando dados de exemplo para testes...');
  
  try {
    // Criar um framework de assessment padrão
    const { data: existingFramework, error: checkError } = await supabase
      .from('vendor_assessment_frameworks')
      .select('id')
      .eq('name', 'Alex Vendor Standard Framework')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar framework existente:', checkError);
      return false;
    }

    if (!existingFramework) {
      const sampleFramework = {
        name: 'Alex Vendor Standard Framework',
        description: 'Framework padrão criado pelo Alex Vendor para avaliação de fornecedores',
        framework_type: 'custom',
        industry: 'technology',
        version: '1.0',
        is_active: true,
        questions: [
          {
            id: 'q1',
            category: 'security',
            question: 'A empresa possui certificação ISO 27001 válida?',
            type: 'yes_no',
            weight: 5,
            required: true
          },
          {
            id: 'q2',
            category: 'compliance',
            question: 'A empresa está em conformidade com a LGPD?',
            type: 'yes_no',
            weight: 4,
            required: true
          },
          {
            id: 'q3',
            category: 'operational',
            question: 'Qual o SLA garantido para disponibilidade do serviço?',
            type: 'text',
            weight: 3,
            required: false
          }
        ],
        scoring_model: {
          max_score: 5,
          weight_distribution: {
            security: 40,
            compliance: 30,
            operational: 20,
            financial: 10
          }
        },
        alex_recommendations: {
          created_by: 'ALEX VENDOR AI',
          recommendations: [
            'Este framework foi otimizado para avaliação de fornecedores de tecnologia',
            'Considere personalizar as perguntas conforme o tipo de serviço prestado',
            'Revise periodicamente os pesos das categorias baseado na evolução dos riscos'
          ]
        }
      };

      const { data: framework, error: createError } = await supabase
        .from('vendor_assessment_frameworks')
        .insert(sampleFramework)
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar framework padrão:', createError);
        return false;
      }

      console.log('✅ Framework padrão criado:', framework.name);
    } else {
      console.log('✅ Framework padrão já existe');
    }

    // Criar dados de exemplo de vendor se não existir
    const { data: existingVendor, error: vendorCheckError } = await supabase
      .from('vendor_registry')
      .select('id')
      .eq('name', 'Exemplo Fornecedor Tech')
      .single();

    if (vendorCheckError && vendorCheckError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar vendor existente:', vendorCheckError);
      return false;
    }

    if (!existingVendor) {
      const sampleVendor = {
        name: 'Exemplo Fornecedor Tech',
        legal_name: 'Exemplo Fornecedor Tecnologia Ltda',
        tax_id: '12.345.678/0001-90',
        website: 'https://exemplo-fornecedor.com',
        description: 'Fornecedor de exemplo criado pelo Alex Vendor para demonstração',
        business_category: 'Technology Services',
        vendor_type: 'operational',
        criticality_level: 'medium',
        annual_spend: 120000.00,
        contract_value: 240000.00,
        contract_start_date: '2024-01-01',
        contract_end_date: '2025-12-31',
        contract_status: 'active',
        primary_contact_name: 'João Silva',
        primary_contact_email: 'joao.silva@exemplo-fornecedor.com',
        primary_contact_phone: '+55 11 99999-9999',
        address: {
          street: 'Rua da Tecnologia, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567',
          country: 'Brasil'
        },
        status: 'active',
        onboarding_status: 'completed',
        onboarding_progress: 100,
        risk_score: 2.5,
        alex_analysis: {
          created_by: 'ALEX VENDOR AI',
          risk_assessment: 'Fornecedor de risco médio com bom histórico de entrega',
          recommendations: [
            'Realizar assessment anual de segurança',
            'Monitorar indicadores de performance mensalmente',
            'Revisar contratos semestralmente'
          ],
          last_updated: new Date().toISOString()
        }
      };

      const { data: vendor, error: createVendorError } = await supabase
        .from('vendor_registry')
        .insert(sampleVendor)
        .select()
        .single();

      if (createVendorError) {
        console.error('❌ Erro ao criar vendor de exemplo:', createVendorError);
        return false;
      }

      console.log('✅ Vendor de exemplo criado:', vendor.name);
    } else {
      console.log('✅ Vendor de exemplo já existe');
    }

    return true;

  } catch (error) {
    console.error('❌ Erro ao criar dados de exemplo:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 ALEX VENDOR - Verificação do Módulo Vendor Risk Management');
  console.log('================================================================\n');

  // Passo 1: Verificar se as tabelas existem
  const tablesOk = await checkVendorRiskTables();
  
  if (!tablesOk) {
    console.log('\n❌ As tabelas do módulo Vendor Risk Management não estão completas.');
    console.log('💡 Execute a migração 20250823000000_create_vendor_risk_management_complete.sql');
    process.exit(1);
  }

  // Passo 2: Testar operações básicas
  const operationsOk = await testVendorRiskOperations();
  
  if (!operationsOk) {
    console.log('\n❌ Erro nas operações básicas do módulo.');
    process.exit(1);
  }

  // Passo 3: Criar dados de exemplo
  const sampleDataOk = await createSampleData();
  
  if (!sampleDataOk) {
    console.log('\n❌ Erro ao criar dados de exemplo.');
    process.exit(1);
  }

  console.log('\n✅ ALEX VENDOR: Módulo Vendor Risk Management está funcionando corretamente!');
  console.log('🎯 O módulo está pronto para ser utilizado.\n');
}

// Executar script
main().catch(console.error);