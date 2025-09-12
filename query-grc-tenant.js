import { createClient } from '@supabase/supabase-js';

// Configurações diretas do Supabase
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
// Tentando usar a service role key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RianciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM2ODY3MTk3LCJleHAiOjIwNTI0NDMxOTd9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function consultarTenantGRC() {
  try {
    console.log('🔍 Consultando dados da GRC-Controller...\n');
    
    // Buscar todos os tenants primeiro
    const { data: allTenants, error: allError } = await supabase
      .from('tenants')
      .select('id, name, settings, created_at, updated_at')
      .order('created_at', { ascending: true });

    if (allError) {
      console.error('❌ Erro ao consultar tenants:', allError);
      return;
    }

    if (!allTenants || allTenants.length === 0) {
      console.log('⚠️ Nenhum tenant encontrado na base de dados');
      
      // Verificar se a tabela existe
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'tenants');
        
      if (tablesError) {
        console.log('📊 Não foi possível verificar a estrutura da tabela');
      } else if (!tables || tables.length === 0) {
        console.log('❌ Tabela "tenants" não existe no banco de dados');
      } else {
        console.log('✅ Tabela "tenants" existe mas está vazia');
      }
      return;
    }

    console.log(`✅ Total de tenants encontrados: ${allTenants.length}\n`);

    // Mostrar todos os tenants primeiro
    console.log('📋 LISTA DE TODOS OS TENANTS:');
    allTenants.forEach((tenant, index) => {
      console.log(`   ${index + 1}. ID: ${tenant.id}`);
      console.log(`      Nome: ${tenant.name || 'N/A'}`);
      console.log(`      Criado: ${tenant.created_at || 'N/A'}`);
      console.log(`      Atualizado: ${tenant.updated_at || 'N/A'}`);
      console.log(`      Tem configurações: ${tenant.settings ? 'Sim' : 'Não'}`);
      console.log(`      Tem matriz de risco: ${tenant.settings?.risk_matrix ? 'Sim' : 'Não'}`);
      console.log('');
    });

    // Buscar especificamente por GRC-Controller (nome similar)
    const grcTenants = allTenants.filter(tenant => 
      tenant.name && (
        tenant.name.toLowerCase().includes('grc') ||
        tenant.name.toLowerCase().includes('controller') ||
        tenant.name.toLowerCase().includes('grc-controller')
      )
    );

    if (grcTenants.length > 0) {
      console.log('🎯 TENANTS RELACIONADOS À GRC-CONTROLLER:');
      grcTenants.forEach((tenant, index) => {
        console.log(`\n📋 TENANT ${index + 1} (GRC):`);
        console.log(`   ID: ${tenant.id}`);
        console.log(`   Nome: ${tenant.name}`);
        
        if (tenant.settings?.risk_matrix) {
          const matrix = tenant.settings.risk_matrix;
          console.log(`   🎯 CONFIGURAÇÃO DA MATRIZ DE RISCO:`);
          console.log(`      ✅ Tipo: ${matrix.type || 'N/A'}`);
          console.log(`      ✅ Método de Cálculo: ${matrix.calculation_method || 'N/A'}`);
          
          if (matrix.impact_labels) {
            console.log(`      ✅ Labels de Impacto: [${matrix.impact_labels.join(', ')}]`);
          }
          
          if (matrix.likelihood_labels) {
            console.log(`      ✅ Labels de Probabilidade: [${matrix.likelihood_labels.join(', ')}]`);
          }
          
          if (matrix.risk_levels_custom && matrix.risk_levels_custom.length > 0) {
            console.log(`      ✅ Níveis de Risco Personalizados: ${matrix.risk_levels_custom.length} níveis`);
            matrix.risk_levels_custom.forEach(level => {
              console.log(`         - ${level.name}: faixa ${level.minValue}-${level.maxValue} (cor: ${level.color})`);
            });
          }
          
          if (matrix.risk_levels) {
            console.log(`      ✅ Mapeamento de Níveis:`);
            console.log(`         - Baixo: [${matrix.risk_levels.low?.join(', ') || 'N/A'}]`);
            console.log(`         - Médio: [${matrix.risk_levels.medium?.join(', ') || 'N/A'}]`);
            console.log(`         - Alto: [${matrix.risk_levels.high?.join(', ') || 'N/A'}]`);
            if (matrix.risk_levels.critical) {
              console.log(`         - Crítico: [${matrix.risk_levels.critical.join(', ')}]`);
            }
          }
          
          console.log(`\n   📊 DADOS COMPLETOS DA MATRIZ (JSON):`);
          console.log(JSON.stringify(matrix, null, 4));
        } else {
          console.log(`   ⚠️ Nenhuma configuração de matriz de risco encontrada`);
        }
      });
    } else {
      console.log('⚠️ Nenhum tenant com nome relacionado a "GRC-Controller" encontrado');
      
      // Se não encontrar por nome, mostrar o primeiro tenant com matriz configurada
      const tenantWithMatrix = allTenants.find(tenant => tenant.settings?.risk_matrix);
      if (tenantWithMatrix) {
        console.log('\n📊 EXEMPLO - PRIMEIRO TENANT COM MATRIZ CONFIGURADA:');
        console.log(`   ID: ${tenantWithMatrix.id}`);
        console.log(`   Nome: ${tenantWithMatrix.name}`);
        const matrix = tenantWithMatrix.settings.risk_matrix;
        console.log(`\n   📊 DADOS DA MATRIZ (JSON):`);
        console.log(JSON.stringify(matrix, null, 4));
      }
    }

  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

// Executar consulta
consultarTenantGRC();