#!/usr/bin/env node

/**
 * Script para verificar e corrigir problemas com roles no banco de dados
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (usando variáveis de ambiente se disponíveis)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RianciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjg2NzE5NywiZXhwIjoyMDUyNDQzMTk3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

console.log('🔗 Conectando ao Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('🔍 Verificando banco de dados...');
  
  try {
    // 1. Verificar se a tabela custom_roles existe
    console.log('\n1️⃣ Verificando tabela custom_roles...');
    
    const { data: customRoles, error: customRolesError } = await supabase
      .from('custom_roles')
      .select('*')
      .limit(5);
    
    if (customRolesError) {
      console.log('❌ Erro ao acessar custom_roles:', customRolesError.message);
      
      if (customRolesError.code === '42P01') {
        console.log('📋 A tabela custom_roles não existe');
        console.log('💡 Isso explica o erro "Erro inesperado ao carregar roles"');
        console.log('✅ A aplicação agora usa fallback para roles do sistema');
      } else if (customRolesError.code === '42501') {
        console.log('🔒 Problema de permissões RLS na tabela custom_roles');
        console.log('✅ A aplicação agora usa fallback para roles do sistema');
      }
    } else {
      console.log('✅ Tabela custom_roles acessível');
      console.log(`📊 Encontradas ${customRoles?.length || 0} roles`);
      
      if (customRoles && customRoles.length > 0) {
        console.log('📋 Roles encontradas:');
        customRoles.forEach(role => {
          console.log(`  - ${role.display_name || role.name} (${role.permissions?.length || 0} permissões)`);
        });
      }
    }
    
    // 2. Verificar tabela user_roles
    console.log('\n2️⃣ Verificando tabela user_roles...');
    
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5);
    
    if (userRolesError) {
      console.log('❌ Erro ao acessar user_roles:', userRolesError.message);
    } else {
      console.log('✅ Tabela user_roles acessível');
      console.log(`📊 Encontrados ${userRoles?.length || 0} registros de roles de usuário`);
    }
    
    // 3. Verificar tabela profiles
    console.log('\n3️⃣ Verificando tabela profiles...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, full_name, tenant_id')
      .limit(3);
    
    if (profilesError) {
      console.log('❌ Erro ao acessar profiles:', profilesError.message);
    } else {
      console.log('✅ Tabela profiles acessível');
      console.log(`📊 Encontrados ${profiles?.length || 0} perfis de usuário`);
    }
    
    // 4. Verificar autenticação atual
    console.log('\n4️⃣ Verificando autenticação...');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Erro de autenticação:', authError.message);
      console.log('💡 Execute este script após fazer login na aplicação');
    } else if (user) {
      console.log('✅ Usuário autenticado:', user.email);
    } else {
      console.log('⚠️ Nenhum usuário autenticado');
      console.log('💡 Execute este script após fazer login na aplicação');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  console.log('\n📋 RESUMO:');
  console.log('==========================================');
  console.log('✅ Correções aplicadas no código:');
  console.log('  - AppSidebar com try-catch robusto');
  console.log('  - Timeout de 5 segundos para queries');
  console.log('  - Fallback para roles do sistema');
  console.log('  - AuthContext otimizado');
  console.log('');
  console.log('🎯 Resultado esperado:');
  console.log('  - Erro "Erro inesperado ao carregar roles" eliminado');
  console.log('  - Aplicação carrega com roles básicas do sistema');
  console.log('  - Performance melhorada');
  console.log('');
  console.log('🔄 Reinicie o servidor se ainda não fez:');
  console.log('  npm run dev');
}

checkDatabase();