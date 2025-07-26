#!/usr/bin/env node

/**
 * Script de verificação do Sistema de Administração de Usuários
 * Verifica se todos os arquivos e dependências estão corretos
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando Sistema de Administração de Usuários...\n');

// Lista de arquivos que devem existir
const requiredFiles = [
  'src/types/user-management.ts',
  'src/hooks/useUserManagement.ts',
  'src/hooks/useMFA.ts',
  'src/components/admin/UserManagementPage.tsx',
  'src/components/admin/UserStatsCards.tsx',
  'src/components/admin/CreateUserDialog.tsx',
  'src/components/admin/EditUserDialog.tsx',
  'src/components/admin/UserDetailsDialog.tsx',
  'src/components/admin/UserFilters.tsx',
  'src/components/admin/BulkActionsDialog.tsx',
  'src/components/admin/MFASetupDialog.tsx',
  'src/utils/authCleanup.ts',
  'src/utils/securityLogger.ts',
  'src/config/user-management.ts',
  'supabase/migrations/20250125000000_user_management_system.sql',
  'supabase/migrations/20250125000001_seed_user_management_data.sql'
];

// Lista de dependências que devem estar instaladas
const requiredDependencies = [
  '@hookform/resolvers',
  'zod',
  'sonner',
  '@tanstack/react-query',
  'react-hook-form',
  '@radix-ui/react-dialog',
  '@radix-ui/react-tabs',
  '@radix-ui/react-select',
  '@radix-ui/react-checkbox'
];

let hasErrors = false;

// Verificar arquivos
console.log('📁 Verificando arquivos...');
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - ARQUIVO FALTANDO`);
    hasErrors = true;
  }
});

console.log('\n📦 Verificando dependências...');

// Verificar package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  requiredDependencies.forEach(dep => {
    if (allDependencies[dep]) {
      console.log(`✅ ${dep} (${allDependencies[dep]})`);
    } else {
      console.log(`❌ ${dep} - DEPENDÊNCIA FALTANDO`);
      hasErrors = true;
    }
  });
} else {
  console.log('❌ package.json não encontrado');
  hasErrors = true;
}

// Verificar configuração do TypeScript
console.log('\n⚙️ Verificando configuração...');
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@/*']) {
    console.log('✅ Alias @/* configurado no tsconfig.json');
  } else {
    console.log('⚠️ Alias @/* pode não estar configurado no tsconfig.json');
  }
} else {
  console.log('❌ tsconfig.json não encontrado');
  hasErrors = true;
}

// Verificar configuração do Vite
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  if (viteConfig.includes('@') && viteConfig.includes('resolve')) {
    console.log('✅ Alias configurado no vite.config.ts');
  } else {
    console.log('⚠️ Alias pode não estar configurado no vite.config.ts');
  }
} else {
  console.log('❌ vite.config.ts não encontrado');
}

// Verificar redirecionamento
const oldUserManagementPath = path.join(process.cwd(), 'src/components/settings/UserManagementPage.tsx');
if (fs.existsSync(oldUserManagementPath)) {
  const content = fs.readFileSync(oldUserManagementPath, 'utf8');
  if (content.includes('export { UserManagementPage } from')) {
    console.log('✅ Redirecionamento configurado em settings/UserManagementPage.tsx');
  } else {
    console.log('⚠️ Redirecionamento pode não estar configurado corretamente');
  }
}

// Verificar estrutura de diretórios
console.log('\n📂 Verificando estrutura de diretórios...');
const requiredDirs = [
  'src/components/admin',
  'src/hooks',
  'src/types',
  'src/utils',
  'src/config',
  'supabase/migrations'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - DIRETÓRIO FALTANDO`);
    hasErrors = true;
  }
});

// Verificar imports nos arquivos principais
console.log('\n🔗 Verificando imports...');

const appTsxPath = path.join(process.cwd(), 'src/App.tsx');
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf8');
  if (appContent.includes('UserManagementPage')) {
    console.log('✅ UserManagementPage importado no App.tsx');
  } else {
    console.log('⚠️ UserManagementPage pode não estar importado no App.tsx');
  }
}

// Resumo
console.log('\n📊 RESUMO DA VERIFICAÇÃO');
console.log('========================');

if (hasErrors) {
  console.log('❌ PROBLEMAS ENCONTRADOS!');
  console.log('\n🔧 Para corrigir os problemas:');
  console.log('1. Execute: npm install');
  console.log('2. Verifique se todos os arquivos foram criados');
  console.log('3. Execute as migrações: supabase migration up');
  console.log('4. Consulte o arquivo TROUBLESHOOTING.md para mais detalhes');
  process.exit(1);
} else {
  console.log('✅ TUDO OK! Sistema de Administração de Usuários está configurado corretamente.');
  console.log('\n🚀 Para usar o sistema:');
  console.log('1. Execute: npm run dev');
  console.log('2. Acesse: http://localhost:5173/settings');
  console.log('3. Faça login com um usuário admin');
}

console.log('\n📚 Documentação disponível em:');
console.log('- docs/USER_MANAGEMENT_SYSTEM.md');
console.log('- docs/USAGE_EXAMPLES.md');
console.log('- TROUBLESHOOTING.md');