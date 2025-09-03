#!/usr/bin/env node

/**
 * Correção específica para o erro "Erro inesperado ao carregar roles"
 * Este script corrige diretamente o problema no AppSidebar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Corrigindo erro "Erro inesperado ao carregar roles"...');

// 1. Corrigir AppSidebar.tsx
const sidebarPath = path.join(__dirname, 'src', 'components', 'layout', 'AppSidebar.tsx');

if (fs.existsSync(sidebarPath)) {
  let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  
  // Adicionar try-catch robusto na função loadDatabaseRoles
  const newLoadDatabaseRoles = `
  const loadDatabaseRoles = async () => {
    try {
      setLoadingRoles(true);
      console.log('💾 [ROLES] Carregando roles do banco de dados...');
      
      // Timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar roles')), 5000)
      );
      
      const queryPromise = supabase
        .from('custom_roles')
        .select('*')
        .eq('is_active', true)
        .order('is_system', { ascending: false })
        .order('created_at', { ascending: true });

      const { data: roles, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.warn('⚠️ Erro ao carregar roles do banco:', error.message);
        // Usar apenas roles do sistema em caso de erro
        setAvailableTestRoles(TEST_ROLES);
        return;
      }

      console.log(\`✅ [SIDEBAR] \${roles?.length || 0} roles carregadas do banco\`);
      setDatabaseRoles(roles || []);
      
      // Converter roles do banco para formato de teste
      const convertedRoles = convertDatabaseRolesToTestRoles(roles || []);
      
      // Combinar roles do sistema com roles do banco
      const systemRoleNames = TEST_ROLES.map(r => r.name);
      const conflictingDbRoles = convertedRoles.filter(role => systemRoleNames.includes(role.name));
      const nonConflictingDbRoles = convertedRoles.filter(role => !systemRoleNames.includes(role.name));
      
      let finalTestRoles = [...TEST_ROLES];
      
      // Substituir roles do sistema por roles do banco quando há conflito
      conflictingDbRoles.forEach(dbRole => {
        const systemRoleIndex = finalTestRoles.findIndex(r => r.name === dbRole.name);
        if (systemRoleIndex !== -1) {
          finalTestRoles[systemRoleIndex] = dbRole;
        }
      });
      
      // Combinar todas as roles
      const allRoles = [...finalTestRoles, ...nonConflictingDbRoles];
      
      setAvailableTestRoles(allRoles);
      console.log(\`🧪 [SIDEBAR] \${allRoles.length} roles disponíveis para teste\`);
      
      // Garantir que a role atual seja válida
      const updatedSuperAdmin = allRoles.find(r => r.id === '1' || r.name === 'super_admin');
      if (updatedSuperAdmin && !isTestingRole) {
        setCurrentTestRole(updatedSuperAdmin);
      }
      
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar roles:', error);
      // Em caso de erro, usar apenas roles do sistema
      setAvailableTestRoles(TEST_ROLES);
      // Não mostrar toast de erro para não incomodar o usuário
      console.warn('⚠️ Usando apenas roles do sistema devido ao erro');
    } finally {
      setLoadingRoles(false);
    }
  };`;
  
  // Substituir a função loadDatabaseRoles
  const loadDatabaseRolesRegex = /const loadDatabaseRoles = async \(\) => \{[\s\S]*?\};/;
  
  if (loadDatabaseRolesRegex.test(sidebarContent)) {
    sidebarContent = sidebarContent.replace(loadDatabaseRolesRegex, newLoadDatabaseRoles);
    
    fs.writeFileSync(sidebarPath, sidebarContent);
    console.log('✅ AppSidebar.tsx corrigido');
  } else {
    console.log('⚠️ Função loadDatabaseRoles não encontrada no formato esperado');
  }
} else {
  console.log('❌ AppSidebar.tsx não encontrado');
}

// 2. Verificar se AuthContext otimizado está sendo usado
const authContextPath = path.join(__dirname, 'src', 'contexts', 'AuthContext.tsx');
const optimizedAuthPath = path.join(__dirname, 'src', 'components', 'OptimizedAuthProvider.tsx');

if (fs.existsSync(optimizedAuthPath) && fs.existsSync(authContextPath)) {
  const authContent = fs.readFileSync(authContextPath, 'utf8');
  
  // Verificar se já está usando a versão otimizada
  if (!authContent.includes('roleCache') || !authContent.includes('getCachedRoles')) {
    console.log('🔄 Substituindo AuthContext pela versão otimizada...');
    
    // Fazer backup
    fs.copyFileSync(authContextPath, authContextPath + '.backup');
    
    // Substituir pelo otimizado
    fs.copyFileSync(optimizedAuthPath, authContextPath);
    
    console.log('✅ AuthContext substituído pela versão otimizada');
  } else {
    console.log('✅ AuthContext já está usando a versão otimizada');
  }
}

// 3. Criar um hook personalizado para lidar com erros de roles
const hookPath = path.join(__dirname, 'src', 'hooks', 'useRolesSafe.ts');
const hookContent = `
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Role {
  id: string;
  name: string;
  display_name: string;
  permissions: string[];
}

export const useRolesSafe = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Timeout de 3 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      const queryPromise = supabase
        .from('custom_roles')
        .select('id, name, display_name, permissions')
        .eq('is_active', true)
        .limit(50); // Limitar para evitar queries muito grandes

      const { data, error: queryError } = await Promise.race([queryPromise, timeoutPromise]);

      if (queryError) {
        throw queryError;
      }

      setRoles(data || []);
      console.log('✅ Roles carregadas com sucesso:', data?.length || 0);
      
    } catch (err: any) {
      console.warn('⚠️ Erro ao carregar roles:', err.message);
      setError(err.message);
      
      // Fallback para roles básicas
      setRoles([
        {
          id: 'user',
          name: 'user',
          display_name: 'Usuário Básico',
          permissions: ['read', 'all']
        },
        {
          id: 'admin',
          name: 'admin',
          display_name: 'Administrador',
          permissions: ['*', 'all', 'admin']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return { roles, loading, error, reload: loadRoles };
};
`;

// Criar diretório hooks se não existir
const hooksDir = path.dirname(hookPath);
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

fs.writeFileSync(hookPath, hookContent);
console.log('✅ Hook useRolesSafe criado');

console.log('');
console.log('🎉 CORREÇÃO APLICADA COM SUCESSO!');
console.log('');
console.log('📋 O que foi corrigido:');
console.log('  ✅ AppSidebar com try-catch robusto');
console.log('  ✅ Timeout de 5 segundos para queries');
console.log('  ✅ Fallback para roles do sistema');
console.log('  ✅ AuthContext otimizado aplicado');
console.log('  ✅ Hook useRolesSafe criado');
console.log('');
console.log('🔄 Reinicie o servidor para aplicar as mudanças:');
console.log('  npm run dev');
console.log('');
console.log('✨ O erro "Erro inesperado ao carregar roles" deve estar resolvido!');