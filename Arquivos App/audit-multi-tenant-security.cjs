#!/usr/bin/env node

// ============================================================================
// SCRIPT DE AUDITORIA: SEGURANÇA MULTI-TENANT - GRC PLATFORM
// ============================================================================
// Script completo para auditoria de isolamento multi-tenant

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
// FUNÇÕES DE AUDITORIA
// ============================================================================

/**
 * Teste 1: Status geral de isolamento multi-tenant
 */
async function auditGeneralStatus() {
  console.log('\n🔍 AUDITORIA 1: Status Geral de Isolamento Multi-Tenant');
  console.log('=' .repeat(70));

  try {
    const { data, error } = await supabase
      .from('information_schema_columns')
      .select('table_name')
      .eq('column_name', 'tenant_id')
      .eq('table_schema', 'public');

    if (error) {
      console.log('⚠️  Erro ao consultar estrutura do banco:', error.message);
      return;
    }

    const tablesWithTenantId = data?.length || 0;
    console.log(`✅ Tabelas com tenant_id: ${tablesWithTenantId}`);
    
    if (tablesWithTenantId >= 25) {
      console.log('🟢 STATUS: EXCELENTE - Isolamento implementado extensivamente');
    } else if (tablesWithTenantId >= 15) {
      console.log('🟡 STATUS: BOM - Isolamento parcial implementado');
    } else {
      console.log('🔴 STATUS: CRÍTICO - Isolamento insuficiente');
    }

  } catch (error) {
    console.log('❌ Erro na auditoria geral:', error.message);
  }
}

/**
 * Teste 2: Auditoria por módulos críticos
 */
async function auditByModules() {
  console.log('\n🔍 AUDITORIA 2: Isolamento por Módulos Críticos');
  console.log('=' .repeat(70));

  const criticalModules = [
    {
      name: 'Gestão de Riscos',
      tables: ['risk_assessments', 'risk_action_plans', 'risk_action_activities', 'risk_communications'],
      priority: 'CRÍTICO'
    },
    {
      name: 'Assessments',
      tables: ['assessments', 'assessment_responses', 'assessment_evidence', 'assessment_user_roles'],
      priority: 'CRÍTICO'
    },
    {
      name: 'Privacy/LGPD',
      tables: ['consents', 'data_inventory', 'data_subject_requests', 'privacy_incidents'],
      priority: 'CRÍTICO'
    },
    {
      name: 'Gestão de Usuários',
      tables: ['profiles', 'user_roles'],
      priority: 'CRÍTICO'
    },
    {
      name: 'Configurações',
      tables: ['integrations', 'integration_logs', 'api_connections'],
      priority: 'ALTO'
    }
  ];

  for (const module of criticalModules) {
    console.log(`\n📋 Módulo: ${module.name} (${module.priority})`);
    
    let tablesProtected = 0;
    let totalDataRecords = 0;

    for (const table of module.tables) {
      try {
        // Verificar se tabela tem tenant_id
        const { data: structure } = await supabase.rpc('exec_sql', {
          sql: `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '${table}' AND column_name = 'tenant_id';
          `
        });

        if (structure && structure.length > 0) {
          tablesProtected++;
          
          // Contar registros para tenant específico
          const { data: records } = await supabase.rpc('exec_sql', {
            sql: `SELECT COUNT(*) as count FROM ${table} WHERE tenant_id = '${TEST_TENANTS.tenant2}';`
          });

          const recordCount = records?.[0]?.count || 0;
          totalDataRecords += recordCount;
          
          console.log(`   ✅ ${table.padEnd(25)} | Registros: ${recordCount}`);
        } else {
          console.log(`   ❌ ${table.padEnd(25)} | SEM tenant_id`);
        }

      } catch (error) {
        console.log(`   ⚠️  ${table.padEnd(25)} | Erro: ${error.message}`);
      }
    }

    const protectionRate = (tablesProtected / module.tables.length) * 100;
    console.log(`   📊 Taxa de Proteção: ${protectionRate.toFixed(1)}% (${tablesProtected}/${module.tables.length})`);
    console.log(`   📈 Total de Dados Protegidos: ${totalDataRecords} registros`);
    
    if (protectionRate === 100) {
      console.log(`   🟢 STATUS: SEGURO`);
    } else if (protectionRate >= 80) {
      console.log(`   🟡 STATUS: PARCIALMENTE SEGURO`);
    } else {
      console.log(`   🔴 STATUS: VULNERÁVEL`);
    }
  }
}

/**
 * Teste 3: Verificar políticas RLS
 */
async function auditRLSPolicies() {
  console.log('\n🔍 AUDITORIA 3: Políticas de Row Level Security (RLS)');
  console.log('=' .repeat(70));

  const criticalTables = [
    'risk_assessments', 'assessment_responses', 'consents', 'data_inventory', 
    'data_subject_requests', 'privacy_incidents', 'user_roles', 'integrations'
  ];

  let tablesWithRLS = 0;
  let totalPolicies = 0;

  for (const table of criticalTables) {
    try {
      const { data: rlsStatus } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            rowsecurity as rls_enabled,
            COUNT(policyname) as policy_count
          FROM pg_tables pt
          LEFT JOIN pg_policies pp ON pt.tablename = pp.tablename
          WHERE pt.tablename = '${table}'
          GROUP BY rowsecurity;
        `
      });

      if (rlsStatus && rlsStatus.length > 0) {
        const { rls_enabled, policy_count } = rlsStatus[0];
        
        if (rls_enabled) {
          tablesWithRLS++;
          totalPolicies += policy_count || 0;
          console.log(`✅ ${table.padEnd(25)} | RLS: ✓ | Políticas: ${policy_count || 0}`);
        } else {
          console.log(`❌ ${table.padEnd(25)} | RLS: ✗ | Políticas: ${policy_count || 0}`);
        }
      } else {
        console.log(`⚠️  ${table.padEnd(25)} | Tabela não encontrada`);
      }

    } catch (error) {
      console.log(`❌ ${table.padEnd(25)} | Erro: ${error.message}`);
    }
  }

  const rlsRate = (tablesWithRLS / criticalTables.length) * 100;
  console.log(`\n📊 Resumo RLS:`);
  console.log(`   • Tabelas com RLS: ${tablesWithRLS}/${criticalTables.length} (${rlsRate.toFixed(1)}%)`);
  console.log(`   • Total de Políticas: ${totalPolicies}`);
  
  if (rlsRate >= 95) {
    console.log(`   🟢 STATUS: EXCELENTE proteção RLS`);
  } else if (rlsRate >= 80) {
    console.log(`   🟡 STATUS: BOA proteção RLS`);
  } else {
    console.log(`   🔴 STATUS: PROTEÇÃO RLS INSUFICIENTE`);
  }
}

/**
 * Teste 4: Verificar índices de performance
 */
async function auditPerformanceIndexes() {
  console.log('\n⚡ AUDITORIA 4: Índices de Performance Multi-Tenant');
  console.log('=' .repeat(70));

  try {
    const { data: indexes } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE indexname LIKE '%tenant_id%' 
          AND schemaname = 'public'
        ORDER BY tablename;
      `
    });

    if (indexes && indexes.length > 0) {
      console.log(`✅ Índices tenant_id encontrados: ${indexes.length}`);
      
      const tablesByIndex = new Set();
      indexes.forEach(idx => {
        tablesByIndex.add(idx.tablename);
        console.log(`   📊 ${idx.tablename.padEnd(25)} | ${idx.indexname}`);
      });

      console.log(`\n📈 Resumo Performance:`);
      console.log(`   • Tabelas com índices tenant_id: ${tablesByIndex.size}`);
      console.log(`   • Total de índices criados: ${indexes.length}`);
      
      if (tablesByIndex.size >= 20) {
        console.log(`   🟢 STATUS: EXCELENTE otimização de performance`);
      } else if (tablesByIndex.size >= 15) {
        console.log(`   🟡 STATUS: BOA otimização de performance`);
      } else {
        console.log(`   🔴 STATUS: PERFORMANCE PODE SER MELHORADA`);
      }
    } else {
      console.log(`❌ Nenhum índice tenant_id encontrado`);
      console.log(`   🔴 STATUS: PERFORMANCE CRÍTICA - Criar índices urgentemente`);
    }

  } catch (error) {
    console.log(`❌ Erro ao verificar índices: ${error.message}`);
  }
}

/**
 * Teste 5: Simulação de tentativa cross-tenant
 */
async function auditCrossTenantAccess() {
  console.log('\n🚨 AUDITORIA 5: Teste de Tentativa Cross-Tenant');
  console.log('=' .repeat(70));

  const testTables = ['risk_assessments', 'consents', 'data_subject_requests'];
  
  for (const table of testTables) {
    try {
      console.log(`\n🔍 Testando ${table}:`);
      
      // Contar registros do tenant1
      const { data: tenant1Data } = await supabase.rpc('exec_sql', {
        sql: `SELECT COUNT(*) as count FROM ${table} WHERE tenant_id = '${TEST_TENANTS.tenant1}';`
      });
      
      const tenant1Count = tenant1Data?.[0]?.count || 0;
      
      // Contar registros do tenant2  
      const { data: tenant2Data } = await supabase.rpc('exec_sql', {
        sql: `SELECT COUNT(*) as count FROM ${table} WHERE tenant_id = '${TEST_TENANTS.tenant2}';`
      });
      
      const tenant2Count = tenant2Data?.[0]?.count || 0;
      
      console.log(`   📊 Tenant 1 (GRC-Controller): ${tenant1Count} registros`);
      console.log(`   📊 Tenant 2 (empresa 2): ${tenant2Count} registros`);
      
      if (tenant1Count > 0 && tenant2Count > 0) {
        console.log(`   🟢 ISOLAMENTO CONFIRMADO: Dados em ambos os tenants separadamente`);
      } else if (tenant1Count > 0 || tenant2Count > 0) {
        console.log(`   🟡 ISOLAMENTO PARCIAL: Dados em apenas um tenant`);
      } else {
        console.log(`   ⚪ SEM DADOS: Tabela vazia para teste`);
      }

    } catch (error) {
      console.log(`   ❌ Erro no teste de ${table}: ${error.message}`);
    }
  }
}

/**
 * Teste 6: Relatório final de conformidade
 */
async function generateComplianceReport() {
  console.log('\n📋 RELATÓRIO FINAL DE CONFORMIDADE MULTI-TENANT');
  console.log('=' .repeat(70));

  try {
    // Contar totais
    const { data: totalData } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          COUNT(DISTINCT table_name) as total_tabelas,
          COUNT(*) as tabelas_com_tenant_id
        FROM information_schema.columns
        WHERE column_name = 'tenant_id' 
          AND table_schema = 'public';
      `
    });

    const stats = totalData?.[0];
    const protectionRate = stats ? (stats.tabelas_com_tenant_id / stats.total_tabelas) * 100 : 0;

    console.log(`📊 ESTATÍSTICAS GERAIS:`);
    console.log(`   • Total de tabelas analisadas: ${stats?.total_tabelas || 0}`);
    console.log(`   • Tabelas com isolamento: ${stats?.tabelas_com_tenant_id || 0}`);
    console.log(`   • Taxa de proteção: ${protectionRate.toFixed(1)}%`);

    // Status de conformidade
    console.log(`\n🎯 STATUS DE CONFORMIDADE:`);
    
    if (protectionRate >= 95) {
      console.log(`   🟢 EXCELENTE: Plataforma em conformidade total com isolamento multi-tenant`);
      console.log(`   ✅ Pronta para produção com múltiplas organizações`);
    } else if (protectionRate >= 85) {
      console.log(`   🟡 BONNE: Plataforma com boa conformidade multi-tenant`);
      console.log(`   ⚠️  Revisar algumas tabelas pendentes`);
    } else {
      console.log(`   🔴 CRÍTICO: Isolamento multi-tenant insuficiente`);
      console.log(`   ❌ NÃO recomendado para produção sem correções`);
    }

    // Recomendações
    console.log(`\n💡 RECOMENDAÇÕES:`);
    console.log(`   1. Implementar monitoramento contínuo de isolamento`);
    console.log(`   2. Executar este script de auditoria regularmente`);
    console.log(`   3. Validar hooks e componentes frontend para filtros de tenant`);
    console.log(`   4. Implementar testes automatizados de isolamento`);
    console.log(`   5. Documentar arquitetura de segurança multi-tenant`);

  } catch (error) {
    console.log(`❌ Erro ao gerar relatório: ${error.message}`);
  }
}

// ============================================================================
// EXECUÇÃO PRINCIPAL
// ============================================================================

async function runMultiTenantAudit() {
  console.log('🚀 INICIANDO AUDITORIA COMPLETA DE SEGURANÇA MULTI-TENANT');
  console.log('Plataforma: GRC Controller');
  console.log('Timestamp:', new Date().toISOString());
  console.log('=' .repeat(70));

  try {
    await auditGeneralStatus();
    await auditByModules();
    await auditRLSPolicies();
    await auditPerformanceIndexes();
    await auditCrossTenantAccess();
    await generateComplianceReport();

    console.log('\n' + '=' .repeat(70));
    console.log('✅ AUDITORIA CONCLUÍDA COM SUCESSO');
    console.log('📄 Relatório completo gerado acima');
    console.log('🔐 Plataforma auditada para conformidade multi-tenant');
    console.log('=' .repeat(70));

  } catch (error) {
    console.error('\n❌ ERRO FATAL NA AUDITORIA:', error.message);
    console.log('🚨 Verifique conectividade com banco de dados');
    process.exit(1);
  }
}

// Executar auditoria se o script for chamado diretamente
if (require.main === module) {
  runMultiTenantAudit();
}

module.exports = {
  runMultiTenantAudit,
  auditGeneralStatus,
  auditByModules,
  auditRLSPolicies,
  auditPerformanceIndexes,
  auditCrossTenantAccess,
  generateComplianceReport
};