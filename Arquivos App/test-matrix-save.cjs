#!/usr/bin/env node

/**
 * 🧪 Test Matrix Save - Testar salvamento direto da matriz de risco
 */

const { Client } = require('pg');
require('dotenv').config();

class MatrixSaveTester {
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
    this.grcTenantId = '46b1c048-85a1-423b-96fc-776007c8de1f';
  }

  async connect() {
    try {
      this.client = new Client(this.config);
      await this.client.connect();
      console.log('🔗 Conectado ao PostgreSQL\n');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.end();
      console.log('\n🔌 Desconectado');
    }
  }

  async testMatrixSave() {
    try {
      console.log('🧪 TESTANDO SALVAMENTO DA MATRIZ DE RISCO\n');
      console.log(`🎯 Tenant ID: ${this.grcTenantId}`);
      console.log(`📋 Tenant: GRC-Controller\n`);

      // 1. Buscar configurações atuais
      console.log('📥 STEP 1: BUSCAR CONFIGURAÇÕES ATUAIS');
      console.log('═'.repeat(50));
      
      const currentQuery = 'SELECT settings FROM tenants WHERE id = $1';
      const currentResult = await this.client.query(currentQuery, [this.grcTenantId]);
      
      if (currentResult.rows.length === 0) {
        console.log('❌ Tenant não encontrada!');
        return;
      }
      
      const currentSettings = currentResult.rows[0].settings || {};
      console.log('✅ Configurações atuais obtidas');
      console.log(`📊 Tem risk_matrix: ${currentSettings.risk_matrix ? 'Sim' : 'Não'}`);

      // 2. Criar configuração de teste da matriz
      console.log('\n🎨 STEP 2: CRIAR CONFIGURAÇÃO DE TESTE');
      console.log('═'.repeat(50));
      
      const testMatrixConfig = {
        type: '5x5',
        calculation_method: 'multiplication',
        impact_labels: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Muito Alto'],
        likelihood_labels: ['Muito Raro', 'Raro', 'Possível', 'Provável', 'Muito Provável'],
        risk_levels_custom: [
          {
            id: '1',
            name: 'Muito Baixo',
            value: 1,
            color: '#3b82f6',
            description: 'Risco aceitável',
            minValue: 1,
            maxValue: 2
          },
          {
            id: '2',
            name: 'Baixo',
            value: 2,
            color: '#22c55e',
            description: 'Risco tolerável',
            minValue: 3,
            maxValue: 4
          },
          {
            id: '3',
            name: 'Médio',
            value: 3,
            color: '#eab308',
            description: 'Risco que requer atenção',
            minValue: 5,
            maxValue: 8
          },
          {
            id: '4',
            name: 'Alto',
            value: 4,
            color: '#f97316',
            description: 'Risco que requer ação imediata',
            minValue: 9,
            maxValue: 16
          },
          {
            id: '5',
            name: 'Muito Alto',
            value: 5,
            color: '#ef4444',
            description: 'Risco inaceitável',
            minValue: 17,
            maxValue: 25
          }
        ],
        risk_levels: {
          low: [1, 2, 3, 4, 5],
          medium: [6, 7, 8, 9, 10],
          high: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
          critical: [21, 22, 23, 24, 25]
        }
      };

      console.log('✅ Configuração de teste criada:');
      console.log(`   Tipo: ${testMatrixConfig.type}`);
      console.log(`   Método: ${testMatrixConfig.calculation_method}`);
      console.log(`   Impact Labels: ${testMatrixConfig.impact_labels.length} itens`);
      console.log(`   Likelihood Labels: ${testMatrixConfig.likelihood_labels.length} itens`);
      console.log(`   Risk Levels: ${testMatrixConfig.risk_levels_custom.length} níveis`);

      // 3. Mesclar com configurações existentes
      console.log('\n🔄 STEP 3: MESCLAR COM CONFIGURAÇÕES EXISTENTES');
      console.log('═'.repeat(50));
      
      const updatedSettings = {
        ...currentSettings,
        risk_matrix: testMatrixConfig
      };

      console.log('✅ Configurações mescladas');
      console.log(`📊 Tamanho dos settings: ${JSON.stringify(updatedSettings).length} chars`);

      // 4. Salvar no banco de dados
      console.log('\n💾 STEP 4: SALVAR NO BANCO DE DADOS');
      console.log('═'.repeat(50));
      
      const updateQuery = `
        UPDATE tenants 
        SET 
          settings = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, updated_at
      `;

      const updateResult = await this.client.query(updateQuery, [
        JSON.stringify(updatedSettings),
        this.grcTenantId
      ]);

      if (updateResult.rows.length > 0) {
        const updated = updateResult.rows[0];
        console.log('✅ SALVAMENTO REALIZADO COM SUCESSO!');
        console.log(`   Tenant: ${updated.name}`);
        console.log(`   ID: ${updated.id}`);
        console.log(`   Atualizado em: ${updated.updated_at}`);
      } else {
        console.log('❌ Falha no salvamento - nenhuma linha afetada');
        return;
      }

      // 5. Verificar se foi salvo corretamente
      console.log('\n🔍 STEP 5: VERIFICAR SALVAMENTO');
      console.log('═'.repeat(50));
      
      const verifyQuery = 'SELECT settings FROM tenants WHERE id = $1';
      const verifyResult = await this.client.query(verifyQuery, [this.grcTenantId]);
      
      if (verifyResult.rows.length > 0) {
        const savedSettings = verifyResult.rows[0].settings;
        
        if (savedSettings?.risk_matrix) {
          const savedMatrix = savedSettings.risk_matrix;
          console.log('✅ VERIFICAÇÃO CONCLUÍDA - MATRIZ SALVA!');
          console.log(`   Tipo: ${savedMatrix.type}`);
          console.log(`   Método: ${savedMatrix.calculation_method}`);
          console.log(`   Impact Labels: ${savedMatrix.impact_labels?.length || 0} itens`);
          console.log(`   Likelihood Labels: ${savedMatrix.likelihood_labels?.length || 0} itens`);
          console.log(`   Risk Levels: ${savedMatrix.risk_levels_custom?.length || 0} níveis`);
          
          console.log('\n📋 CONFIGURAÇÃO SALVA (JSON):');
          console.log('═'.repeat(60));
          console.log(JSON.stringify(savedMatrix, null, 2));
          console.log('═'.repeat(60));
          
        } else {
          console.log('❌ VERIFICAÇÃO FALHOU - Matriz não encontrada nos dados salvos');
        }
      } else {
        console.log('❌ VERIFICAÇÃO FALHOU - Tenant não encontrada');
      }

      console.log('\n🎉 TESTE CONCLUÍDO!');
      console.log('💡 Se chegou até aqui, o problema NÃO É no salvamento no banco.');
      console.log('💡 O problema deve estar no componente ou no contexto de autenticação.');
      
    } catch (error) {
      console.error('💥 Erro no teste:', error.message);
      console.error(error.stack);
    }
  }
}

// Executar teste
async function main() {
  const tester = new MatrixSaveTester();
  
  if (await tester.connect()) {
    await tester.testMatrixSave();
    await tester.disconnect();
  }
}

main();