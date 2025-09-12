import { createClient } from '@supabase/supabase-js';

// Usar as mesmas configurações do projeto
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugMatrices() {
  try {
    console.log('🔍 DEBUG: Verificando configurações de matriz no banco...\n');
    
    // Buscar todos os tenants e suas configurações
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, settings')
      .limit(10);

    if (error) {
      console.error('❌ Erro ao consultar tenants:', error);
      return;
    }

    if (!tenants || tenants.length === 0) {
      console.log('⚠️ Nenhum tenant encontrado');
      return;
    }

    console.log(`✅ Encontrados ${tenants.length} tenant(s):\n`);

    tenants.forEach((tenant, index) => {
      console.log(`📋 TENANT ${index + 1}:`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Nome: ${tenant.name || 'N/A'}`);
      
      if (tenant.settings && tenant.settings.risk_matrix) {
        const riskMatrix = tenant.settings.risk_matrix;
        console.log(`   🎯 CONFIGURAÇÃO DE MATRIZ DE RISCO:`);
        console.log(`      Tipo: ${riskMatrix.type || 'N/A'}`);
        console.log(`      Método de Cálculo: ${riskMatrix.calculation_method || 'N/A'}`);
        console.log(`      Labels de Impacto: [${riskMatrix.impact_labels?.join(', ') || 'N/A'}]`);
        console.log(`      Labels de Probabilidade: [${riskMatrix.likelihood_labels?.join(', ') || 'N/A'}]`);
        
        if (riskMatrix.risk_levels_custom && riskMatrix.risk_levels_custom.length > 0) {
          console.log(`      Níveis de Risco Personalizados:`);
          riskMatrix.risk_levels_custom.forEach(level => {
            console.log(`         ${level.name}: ${level.minValue}-${level.maxValue} (cor: ${level.color})`);
          });
        }
        
        if (riskMatrix.risk_levels) {
          console.log(`      Níveis de Risco (formato legado):`);
          console.log(`         Baixo: [${riskMatrix.risk_levels.low?.join(', ') || 'N/A'}]`);
          console.log(`         Médio: [${riskMatrix.risk_levels.medium?.join(', ') || 'N/A'}]`);
          console.log(`         Alto: [${riskMatrix.risk_levels.high?.join(', ') || 'N/A'}]`);
          if (riskMatrix.risk_levels.critical) {
            console.log(`         Crítico: [${riskMatrix.risk_levels.critical?.join(', ') || 'N/A'}]`);
          }
        }
        
        console.log(`      Configuração RAW:`, JSON.stringify(riskMatrix, null, 2));
        
      } else {
        console.log(`   ⚠️ Nenhuma configuração de matriz de risco encontrada`);
      }
      
      console.log(''); // Linha em branco
    });

  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

// Executar a consulta
debugMatrices();