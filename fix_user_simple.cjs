/**
 * Script simples para corrigir permissões do usuário no banco de dados
 * Executa: node fix_user_simple.cjs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  console.error('Encontradas:', {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const USER_ID = '0c5c1433-2682-460c-992a-f4cce57c0d6d';

async function fixUserPermissions() {
  console.log('🔧 Iniciando correção de permissões do usuário...');
  console.log(`👤 Usuário ID: ${USER_ID}`);
  
  try {
    // 1. Verificar roles atuais
    console.log('\n📊 1. Verificando roles atuais...');
    
    const { data: currentRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError.message);
    } else {
      console.log('📋 Roles atuais:', currentRoles?.map(r => r.role) || []);
    }
    
    // 2. Adicionar roles de admin
    console.log('\n🚨 2. Adicionando roles de admin...');
    
    const adminRoles = ['platform_admin', 'super_admin', 'admin'];
    
    for (const role of adminRoles) {
      console.log(`➕ Adicionando role: ${role}`);
      
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: USER_ID,
          role: role
        });
      
      if (error) {
        if (error.code === '23505') { // Duplicate key
          console.log(`ℹ️  Role ${role} já existe`);
        } else {
          console.error(`❌ Erro ao adicionar role ${role}:`, error.message);
        }
      } else {
        console.log(`✅ Role ${role} adicionada com sucesso`);
      }
    }
    
    // 3. Verificar roles finais
    console.log('\n📊 3. Verificando roles finais...');
    
    const { data: finalRoles, error: finalRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', USER_ID);
    
    if (finalRolesError) {
      console.error('❌ Erro ao verificar roles finais:', finalRolesError.message);
    } else {
      console.log('🎉 Roles finais:', finalRoles?.map(r => r.role) || []);
    }
    
    console.log('\n✅ Correção concluída!');
    console.log('🔄 Agora faça logout e login novamente para aplicar as mudanças.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar correção
fixUserPermissions();