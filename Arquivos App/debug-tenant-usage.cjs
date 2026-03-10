#!/usr/bin/env node

/**
 * 🔍 Debug Tenant Usage - Verificar qual tenant está sendo usado
 */

const { Client } = require('pg');
require('dotenv').config();

class TenantDebugger {
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

  async debugTenantUsage() {
    try {
      console.log('🔍 DEBUGGING TENANT USAGE - GRC-Controller\n');
      
      // 1. Verificar todas as tenants
      console.log('📋 STEP 1: LISTAR TODAS AS TENANTS');
      console.log('═'.repeat(50));
      const tenantsQuery = 'SELECT id, name, slug, is_active FROM tenants ORDER BY name;';
      const tenantsResult = await this.client.query(tenantsQuery);
      
      tenantsResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name}`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Slug: ${row.slug}`);
        console.log(`   Ativo: ${row.is_active ? 'Sim' : 'Não'}`);
        console.log('');
      });

      // 2. Verificar usuários e seus tenant_ids
      console.log('👥 STEP 2: VERIFICAR USUÁRIOS E TENANT_IDS');
      console.log('═'.repeat(50));
      const usersQuery = `
        SELECT 
          id, email, tenant_id, role,
          (SELECT name FROM tenants WHERE id = profiles.tenant_id) as tenant_name
        FROM profiles 
        WHERE email LIKE '%grc%' OR email LIKE '%admin%'
        ORDER BY email;
      `;
      
      try {
        const usersResult = await this.client.query(usersQuery);
        
        if (usersResult.rows.length > 0) {
          usersResult.rows.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Tenant ID: ${user.tenant_id}`);
            console.log(`   Tenant Name: ${user.tenant_name || 'N/A'}`);
            console.log(`   Role: ${user.role}`);
            console.log('');
          });
        } else {
          console.log('⚠️  Nenhum usuário encontrado com filtro GRC/admin');
        }
      } catch (error) {
        console.log('⚠️  Erro ao consultar usuários (tabela profiles pode não existir)');
      }

      // 3. Verificar GRC-Controller especificamente
      console.log('🎯 STEP 3: FOCAR NA GRC-CONTROLLER');
      console.log('═'.repeat(50));
      const grcQuery = "SELECT id, name, settings FROM tenants WHERE name = 'GRC-Controller';";
      const grcResult = await this.client.query(grcQuery);
      
      if (grcResult.rows.length > 0) {
        const grcTenant = grcResult.rows[0];
        console.log(`✅ GRC-Controller encontrada!`);
        console.log(`   ID: ${grcTenant.id}`);
        console.log(`   Nome: ${grcTenant.name}`);
        
        if (grcTenant.settings?.risk_matrix) {
          console.log(`   ✅ TEM matriz de risco configurada!`);
          console.log(`   Tipo: ${grcTenant.settings.risk_matrix.type}`);
        } else {
          console.log(`   ❌ NÃO TEM matriz de risco configurada`);
        }
        
        console.log(`\n🎯 TENANT ID DA GRC-CONTROLLER: ${grcTenant.id}`);
        console.log(`📋 Este é o ID que deveria estar sendo usado no componente!`);
        
      } else {
        console.log('❌ GRC-Controller não encontrada!');
      }

      // 4. Instruções para debugging no navegador
      console.log('\n🌐 STEP 4: DEBUGGING NO NAVEGADOR');
      console.log('═'.repeat(50));
      console.log('Para verificar qual tenant_id está sendo usado:');
      console.log('1. Abra o DevTools (F12)');
      console.log('2. Vá para a aba Console');
      console.log('3. Procure por logs que começam com "🎯 MATRIZ 1"');
      console.log('4. Verifique os valores de:');
      console.log('   - tenantId (prop)');
      console.log('   - userTenantId (do contexto)');
      console.log('   - currentTenantId (final)');
      console.log('');
      console.log('5. O currentTenantId deveria ser:');
      if (grcResult.rows.length > 0) {
        console.log(`   ${grcResult.rows[0].id}`);
      }
      console.log('');
      console.log('6. Se for diferente, há um problema no mapeamento!');
      
    } catch (error) {
      console.error('💥 Erro:', error.message);
    }
  }
}

// Executar debug
async function main() {
  const tenantDebugger = new TenantDebugger();
  
  if (await tenantDebugger.connect()) {
    await tenantDebugger.debugTenantUsage();
    await tenantDebugger.disconnect();
  }
}

main();