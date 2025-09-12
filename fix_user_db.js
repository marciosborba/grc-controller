#!/usr/bin/env node

/**
 * Script para corrigir permissões do usuário no banco de dados
 * Executa: node fix_user_db.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_ID = '0c5c1433-2682-460c-992a-f4cce57c0d6d';

async function fixUserPermissions() {
  console.log('🔧 Iniciando correção de permissões do usuário...');
  console.log(`👤 Usuário ID: ${USER_ID}`);
  
  try {
    // 1. Verificar estado atual do usuário
    console.log('\n📊 1. Verificando estado atual...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', USER_ID)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', {
        id: profile.id,
        full_name: profile.full_name,
        tenant_id: profile.tenant_id
      });
    }
    
    // 2. Verificar roles atuais
    console.log('\n📊 2. Verificando roles atuais...');
    
    const { data: currentRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
    } else {
      console.log('📋 Roles atuais:', currentRoles.map(r => r.role));
    }
    
    // 3. Adicionar roles de admin
    console.log('\n🚨 3. Adicionando roles de admin...');
    
    const adminRoles = ['platform_admin', 'super_admin', 'admin'];
    
    for (const role of adminRoles) {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: USER_ID,
          role: role
        }, {
          onConflict: 'user_id,role'
        });
      
      if (error) {
        console.error(`❌ Erro ao adicionar role ${role}:`, error);
      } else {
        console.log(`✅ Role ${role} adicionada com sucesso`);
      }
    }
    
    // 4. Verificar roles finais
    console.log('\n📊 4. Verificando roles finais...');
    
    const { data: finalRoles, error: finalRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (finalRolesError) {
      console.error('❌ Erro ao verificar roles finais:', finalRolesError);
    } else {
      console.log('🎉 Roles finais:', finalRoles.map(r => r.role));
    }
    
    // 5. Verificar se existe tabela de permissões
    console.log('\n📊 5. Verificando tabelas de permissões...');
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (!tablesError && tables) {
      const permissionTables = tables.filter(t => t.includes('permission'));
      console.log('📋 Tabelas de permissões encontradas:', permissionTables);
    }
    
    console.log('\n✅ Correção concluída!');
    console.log('🔄 Agora faça logout e login novamente para aplicar as mudanças.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar correção
fixUserPermissions();