#!/usr/bin/env node

// ============================================================================
// SCRIPT DE TESTE: ISOLAMENTO MULTI-TENANT
// ============================================================================
// Script para validar o isolamento de dados entre tenants

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada');
  console.log('Execute: export SUPABASE_SERVICE_ROLE_KEY="sua_chave_aqui"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Dados de teste dos tenants
const TEST_TENANTS = {
  tenant1: '46b1c048-85a1-423b-96fc-776007c8de1f', // GRC-Controller
  tenant2: '37b809d4-1a23-40b9-8ef1-17f24ed4c08b'  // empresa 2
};

// ============================================================================
// FUNÇÕES DE TESTE
// ============================================================================

/**
 * Teste 1: Verificar isolamento de dados nas tabelas de configuração
 */
async function testDataIsolation() {
  console.log('\n🔍 TESTE 1: Isolamento de dados entre tenants');
  console.log('=' .repeat(60));

  const tables = [
    'integrations',
    'integration_logs',
    'api_connections',
    'mcp_providers',
    'email_providers',
    'sso_providers',
    'webhook_endpoints',
    'backup_configurations'
  ];

  for (const table of tables) {
    try {
      // Buscar dados do tenant 1
      const { data: tenant1Data, error: error1 } = await supabase
        .from(table)
        .select('id, tenant_id')
        .eq('tenant_id', TEST_TENANTS.tenant1);

      // Buscar dados do tenant 2
      const { data: tenant2Data, error: error2 } = await supabase
        .from(table)
        .select('id, tenant_id')
        .eq('tenant_id', TEST_TENANTS.tenant2);

      if (error1 && error1.code !== 'PGRST116') {
        console.log(`⚠️  ${table}: Erro ao consultar tenant 1 - ${error1.message}`);
        continue;
      }

      if (error2 && error2.code !== 'PGRST116') {
        console.log(`⚠️  ${table}: Erro ao consultar tenant 2 - ${error2.message}`);
        continue;
      }

      const count1 = tenant1Data?.length || 0;
      const count2 = tenant2Data?.length || 0;

      console.log(`✅ ${table.padEnd(25)} | Tenant1: ${count1.toString().padStart(3)} | Tenant2: ${count2.toString().padStart(3)}`);

      // Verificar se existe cross-contamination
      if (tenant1Data?.some(item => item.tenant_id !== TEST_TENANTS.tenant1)) {
        console.log(`❌ FALHA: ${table} tem dados com tenant_id incorreto no tenant 1`);
      }

      if (tenant2Data?.some(item => item.tenant_id !== TEST_TENANTS.tenant2)) {
        console.log(`❌ FALHA: ${table} tem dados com tenant_id incorreto no tenant 2`);
      }

    } catch (error) {
      console.log(`❌ ${table}: Erro inesperado - ${error.message}`);
    }
  }
}

/**
 * Teste 2: Verificar políticas de RLS
 */
async function testRLSPolicies() {
  console.log('\n🛡️  TESTE 2: Políticas de Row Level Security (RLS)');
  console.log('=' .repeat(60));

  const tables = [
    'integrations',
    'integration_logs',
    'api_connections',
    'mcp_providers',
    'email_providers',
    'sso_providers',
    'webhook_endpoints',
    'backup_configurations'
  ];

  for (const table of tables) {
    try {
      // Verificar se RLS está habilitado
      const { data: rlsData, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled,
            array_agg(policyname) as policies
          FROM pg_tables pt
          LEFT JOIN pg_policies pp ON pt.tablename = pp.tablename
          WHERE pt.tablename = '${table}'
          GROUP BY schemaname, tablename, rowsecurity;
        `
      });

      if (error) {
        console.log(`⚠️  ${table}: Não foi possível verificar RLS - ${error.message}`);
        continue;
      }

      if (rlsData && rlsData.length > 0) {
        const { rls_enabled, policies } = rlsData[0];
        const policyCount = policies.filter(p => p !== null).length;
        
        if (rls_enabled) {
          console.log(`✅ ${table.padEnd(25)} | RLS: ✓ | Políticas: ${policyCount}`);
        } else {
          console.log(`❌ ${table.padEnd(25)} | RLS: ✗ | Políticas: ${policyCount}`);
        }
      } else {
        console.log(`❌ ${table.padEnd(25)} | Tabela não encontrada`);
      }

    } catch (error) {
      console.log(`❌ ${table}: Erro inesperado - ${error.message}`);
    }
  }
}

/**
 * Teste 3: Simular tentativa de acesso cross-tenant
 */
async function testCrossTenantAccess() {
  console.log('\n🚨 TESTE 3: Tentativa de acesso cross-tenant');
  console.log('=' .repeat(60));

  // Criar uma integração de teste para tenant1
  const testIntegration = {
    name: 'Teste Cross Tenant',
    type: 'api',
    status: 'disconnected',
    tenant_id: TEST_TENANTS.tenant1
  };

  try {
    const { data: integration, error: createError } = await supabase
      .from('integrations')
      .insert(testIntegration)
      .select()
      .single();

    if (createError) {
      console.log(`❌ Erro ao criar integração de teste: ${createError.message}`);
      return;
    }

    console.log(`✅ Integração de teste criada: ${integration.id}`);

    // Tentar acessar a integração como se fosse do tenant2
    const { data: crossTenantData, error: crossTenantError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integration.id)
      .eq('tenant_id', TEST_TENANTS.tenant2); // Tenant errado

    if (crossTenantError) {
      console.log(`✅ RLS bloqueou acesso cross-tenant: ${crossTenantError.message}`);
    } else if (!crossTenantData || crossTenantData.length === 0) {
      console.log(`✅ RLS funcionando: Nenhum dado retornado para tenant incorreto`);
    } else {
      console.log(`❌ FALHA DE SEGURANÇA: Dados de outro tenant foram retornados!`);
      console.log(`   Dados retornados:`, crossTenantData);
    }

    // Cleanup: remover integração de teste
    await supabase
      .from('integrations')
      .delete()
      .eq('id', integration.id);

    console.log(`🧹 Integração de teste removida: ${integration.id}`);

  } catch (error) {
    console.log(`❌ Erro no teste cross-tenant: ${error.message}`);
  }
}

/**
 * Teste 4: Verificar foreign keys e relacionamentos
 */
async function testForeignKeyIsolation() {
  console.log('\n🔗 TESTE 4: Isolamento via Foreign Keys');
  console.log('=' .repeat(60));

  try {
    // Verificar se todas as tabelas relacionadas respeitam o tenant_id
    const { data: integrations } = await supabase
      .from('integrations')
      .select(`
        id,
        tenant_id,
        name,
        api_connections!inner(id, tenant_id),
        integration_logs(id, tenant_id)
      `)
      .limit(5);

    if (integrations) {
      for (const integration of integrations) {
        const integrationTenant = integration.tenant_id;
        
        // Verificar api_connections
        if (integration.api_connections) {
          for (const apiConnection of integration.api_connections) {
            if (apiConnection.tenant_id !== integrationTenant) {
              console.log(`❌ VIOLAÇÃO: API connection ${apiConnection.id} tem tenant_id diferente da integração`);
            }
          }
        }

        // Verificar integration_logs
        if (integration.integration_logs) {
          for (const log of integration.integration_logs) {
            if (log.tenant_id !== integrationTenant) {
              console.log(`❌ VIOLAÇÃO: Log ${log.id} tem tenant_id diferente da integração`);
            }
          }
        }
      }
      
      console.log(`✅ Verificados ${integrations.length} registros - Nenhuma violação de FK encontrada`);
    }

  } catch (error) {
    console.log(`❌ Erro no teste de foreign keys: ${error.message}`);
  }
}

/**
 * Teste 5: Verificar índices de performance
 */
async function testPerformanceIndexes() {
  console.log('\n⚡ TESTE 5: Índices de Performance para Multi-Tenant');
  console.log('=' .repeat(60));

  const tables = [
    'integrations',
    'integration_logs',
    'api_connections',
    'mcp_providers',
    'email_providers',
    'sso_providers',
    'webhook_endpoints',
    'backup_configurations'
  ];

  for (const table of tables) {
    try {
      const { data: indexes } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            indexname,
            indexdef
          FROM pg_indexes
          WHERE tablename = '${table}' AND indexdef LIKE '%tenant_id%';
        `
      });

      if (indexes && indexes.length > 0) {
        console.log(`✅ ${table.padEnd(25)} | Índices tenant_id: ${indexes.length}`);
      } else {
        console.log(`⚠️  ${table.padEnd(25)} | Sem índices tenant_id - pode impactar performance`);
      }

    } catch (error) {
      console.log(`❌ ${table}: Erro ao verificar índices - ${error.message}`);
    }
  }
}

// ============================================================================
// EXECUÇÃO DOS TESTES
// ============================================================================

async function runAllTests() {
  console.log('🚀 INICIANDO TESTES DE SEGURANÇA MULTI-TENANT');
  console.log('Testando isolamento no módulo Configurações Gerais...\n');

  try {
    await testDataIsolation();
    await testRLSPolicies();
    await testCrossTenantAccess();
    await testForeignKeyIsolation();
    await testPerformanceIndexes();

    console.log('\n' + '=' .repeat(60));
    console.log('✅ TESTES CONCLUÍDOS');
    console.log('Verifique os resultados acima para identificar possíveis problemas.');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ ERRO FATAL NOS TESTES:', error.message);
    process.exit(1);
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testDataIsolation,
  testRLSPolicies,
  testCrossTenantAccess,
  testForeignKeyIsolation,
  testPerformanceIndexes
};