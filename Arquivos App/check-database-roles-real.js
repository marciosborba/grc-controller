#!/usr/bin/env node

/**
 * Script para verificar roles reais no banco de dados
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RianciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjg2NzE5NywiZXhwIjoyMDUyNDQzMTk3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

console.log('🔗 Conectando ao Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRoles() {
  console.log('🔍 VERIFICANDO ROLES NO BANCO DE DADOS');
  console.log('='.repeat(60));
  
  try {
    // 1. Verificar tabela custom_roles
    console.log('\n1️⃣ Verificando tabela custom_roles...');
    
    const { data: customRoles, error: customRolesError } = await supabase
      .from('custom_roles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (customRolesError) {
      console.log('❌ Erro ao acessar custom_roles:', customRolesError.message);
      console.log('📋 Código do erro:', customRolesError.code);
      
      if (customRolesError.code === '42P01') {
        console.log('💡 A tabela custom_roles não existe no banco de dados');
      } else if (customRolesError.code === '42501') {
        console.log('💡 Problema de permissões RLS na tabela custom_roles');
      }
    } else {
      console.log('✅ Tabela custom_roles acessível');
      console.log(`📊 Total de roles encontradas: ${customRoles?.length || 0}`);
      
      if (customRoles && customRoles.length > 0) {
        console.log('\n📋 ROLES ENCONTRADAS:');
        console.log('-'.repeat(40));
        
        customRoles.forEach((role, index) => {
          console.log(`${index + 1}. ${role.display_name || role.name}`);
          console.log(`   ID: ${role.id}`);
          console.log(`   Nome: ${role.name}`);
          console.log(`   Ativa: ${role.is_active ? '✅' : '❌'}`);
          console.log(`   Sistema: ${role.is_system ? '✅' : '❌'}`);
          console.log(`   Permissões: ${role.permissions?.length || 0} configuradas`);
          if (role.permissions && role.permissions.length > 0) {
            console.log(`   Lista: ${role.permissions.slice(0, 5).join(', ')}${role.permissions.length > 5 ? '...' : ''}`);
          }
          console.log(`   Criada em: ${role.created_at ? new Date(role.created_at).toLocaleDateString('pt-BR') : 'N/A'}`);
          console.log('');
        });
        
        // Verificar roles ativas
        const activeRoles = customRoles.filter(role => role.is_active);
        console.log(`🟢 Roles ativas: ${activeRoles.length}`);
        
        // Verificar roles do sistema vs customizadas
        const systemRoles = customRoles.filter(role => role.is_system);
        const customRolesOnly = customRoles.filter(role => !role.is_system);
        console.log(`🏛️ Roles do sistema: ${systemRoles.length}`);
        console.log(`🎨 Roles customizadas: ${customRolesOnly.length}`);
        
      } else {
        console.log('📝 Nenhuma role encontrada na tabela custom_roles');
        console.log('💡 Isso explica por que o seletor mostra apenas roles hardcoded');
      }
    }
    
    // 2. Verificar se há roles específicas que deveriam existir
    console.log('\n2️⃣ Verificando roles específicas...');
    
    const expectedRoles = ['auditor', 'compliance_manager', 'security_analyst', 'user'];
    
    for (const roleName of expectedRoles) {
      try {
        const { data: specificRole, error: specificError } = await supabase
          .from('custom_roles')
          .select('*')
          .eq('name', roleName)
          .maybeSingle();
        
        if (specificError) {
          console.log(`❌ Erro ao buscar role '${roleName}':`, specificError.message);
        } else if (specificRole) {
          console.log(`✅ Role '${roleName}' encontrada: ${specificRole.display_name}`);
        } else {
          console.log(`❌ Role '${roleName}' NÃO encontrada no banco`);
        }
      } catch (err) {
        console.log(`❌ Erro ao verificar role '${roleName}':`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
  
  console.log('\n📋 RESUMO:');
  console.log('='.repeat(60));
  console.log('🎯 PROBLEMA IDENTIFICADO:');
  console.log('  O seletor mostra roles hardcoded (TEST_ROLES) porque:');
  console.log('  1. A tabela custom_roles pode não existir');
  console.log('  2. A tabela pode estar vazia');
  console.log('  3. Pode haver problemas de permissão RLS');
  console.log('');
  console.log('✅ SOLUÇÃO APLICADA:');
  console.log('  - Modificado AppSidebar para mostrar apenas Super Admin');
  console.log('  - Roles do banco serão adicionadas quando existirem');
  console.log('  - Eliminadas roles fictícias do seletor');
  console.log('');
  console.log('🔄 Reinicie o servidor para aplicar as mudanças:');
  console.log('  npm run dev');
}

checkRoles();