#!/usr/bin/env node

/**
 * 🎯 Query Matrix Data - Consulta específica dos dados da matriz de risco
 */

const { Client } = require('pg');
require('dotenv').config();

class MatrixDataQuery {
  constructor() {
    this.config = {
      host: 'db.myxvxponlmulnjstbjwd.supabase.co',
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password: process.env.SUPABASE_DB_PASSWORD,
      ssl: { rejectUnauthorized: false }
    };
    
    this.client = null;
  }

  async connect() {
    try {
      this.client = new Client(this.config);
      await this.client.connect();
      console.log('🔗 Conectado ao PostgreSQL do Supabase\n');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
      console.log('🔌 Desconectado do PostgreSQL');
    }
  }

  async queryMatrixData() {
    try {
      console.log('🔍 CONSULTANDO DADOS DA MATRIZ DE RISCO - GRC-Controller\n');
      
      // Buscar dados específicos da GRC-Controller
      const query = `
        SELECT 
          id,
          name,
          settings,
          created_at,
          updated_at
        FROM tenants 
        WHERE name ILIKE '%grc%' OR name ILIKE '%controller%'
        ORDER BY created_at;
      `;
      
      const result = await this.client.query(query);
      
      if (result.rows.length === 0) {
        console.log('⚠️  Nenhuma tenant encontrada com nome relacionado a GRC-Controller');
        
        // Buscar todas as tenants como fallback
        const allQuery = 'SELECT id, name, settings FROM tenants ORDER BY created_at;';
        const allResult = await this.client.query(allQuery);
        
        console.log(`\n📋 TODAS AS TENANTS DISPONÍVEIS (${allResult.rows.length} registros):`);
        allResult.rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ID: ${row.id}`);
          console.log(`      Nome: ${row.name}`);
          console.log(`      Tem configurações: ${row.settings ? 'Sim' : 'Não'}`);
          console.log(`      Tem matriz de risco: ${row.settings?.risk_matrix ? 'Sim' : 'Não'}`);
          console.log('');
        });
        return;
      }

      console.log(`✅ TENANT ENCONTRADA: ${result.rows[0].name}`);
      console.log(`📊 ID: ${result.rows[0].id}`);
      console.log(`📅 Criado em: ${result.rows[0].created_at}`);
      console.log(`🔄 Atualizado em: ${result.rows[0].updated_at}\n`);

      const tenant = result.rows[0];
      
      if (!tenant.settings) {
        console.log('⚠️  A tenant não possui campo settings configurado');
        return;
      }

      console.log('🎯 DADOS DO CAMPO SETTINGS:');
      console.log('═'.repeat(60));
      console.log(JSON.stringify(tenant.settings, null, 2));
      console.log('═'.repeat(60));

      // Verificar se existe configuração de matriz de risco
      if (tenant.settings.risk_matrix) {
        const matrix = tenant.settings.risk_matrix;
        
        console.log('\n✅ CONFIGURAÇÃO DA MATRIZ DE RISCO ENCONTRADA!');
        console.log('═'.repeat(60));
        
        console.log(`🔢 Tipo da Matriz: ${matrix.type || 'N/A'}`);
        console.log(`🧮 Método de Cálculo: ${matrix.calculation_method || 'N/A'}`);
        
        if (matrix.impact_labels) {
          console.log(`📊 Labels de Impacto (${matrix.impact_labels.length}): [${matrix.impact_labels.join(', ')}]`);
        }
        
        if (matrix.likelihood_labels) {
          console.log(`🎲 Labels de Probabilidade (${matrix.likelihood_labels.length}): [${matrix.likelihood_labels.join(', ')}]`);
        }
        
        if (matrix.risk_levels_custom && matrix.risk_levels_custom.length > 0) {
          console.log(`\n🎨 NÍVEIS DE RISCO PERSONALIZADOS (${matrix.risk_levels_custom.length} níveis):`);
          matrix.risk_levels_custom.forEach((level, index) => {
            console.log(`   ${index + 1}. ${level.name}`);
            console.log(`      - Faixa: ${level.minValue} até ${level.maxValue}`);
            console.log(`      - Cor: ${level.color}`);
            console.log(`      - Descrição: ${level.description || 'N/A'}`);
          });
        }
        
        if (matrix.risk_levels) {
          console.log(`\n📈 MAPEAMENTO AUTOMÁTICO DE NÍVEIS:`);
          if (matrix.risk_levels.low) console.log(`   🟢 Baixo: [${matrix.risk_levels.low.join(', ')}]`);
          if (matrix.risk_levels.medium) console.log(`   🟡 Médio: [${matrix.risk_levels.medium.join(', ')}]`);
          if (matrix.risk_levels.high) console.log(`   🟠 Alto: [${matrix.risk_levels.high.join(', ')}]`);
          if (matrix.risk_levels.critical) console.log(`   🔴 Crítico: [${matrix.risk_levels.critical.join(', ')}]`);
        }
        
        console.log('\n📋 ESTRUTURA COMPLETA DA MATRIZ (JSON):');
        console.log('═'.repeat(60));
        console.log(JSON.stringify(matrix, null, 2));
        console.log('═'.repeat(60));
        
      } else {
        console.log('\n⚠️  NENHUMA CONFIGURAÇÃO DE MATRIZ DE RISCO ENCONTRADA');
        console.log('💡 A matriz ainda não foi configurada para esta tenant');
        
        if (tenant.settings.company_data) {
          console.log('\n📊 DADOS DA EMPRESA ENCONTRADOS:');
          console.log('═'.repeat(60));
          console.log(JSON.stringify(tenant.settings.company_data, null, 2));
          console.log('═'.repeat(60));
        }
      }
      
    } catch (error) {
      console.error('💥 Erro ao consultar dados:', error.message);
    }
  }
}

// Executar consulta
async function main() {
  const query = new MatrixDataQuery();
  
  if (await query.connect()) {
    await query.queryMatrixData();
    await query.disconnect();
  }
}

main();