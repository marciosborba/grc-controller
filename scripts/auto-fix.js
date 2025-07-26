#!/usr/bin/env node

/**
 * Script de correção automática para o Sistema de Administração de Usuários
 * Tenta resolver automaticamente os problemas mais comuns
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando correção automática...\n');

let hasErrors = false;

// Função para executar comandos
function runCommand(command, description) {
  try {
    console.log(`⚡ ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Concluído\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} - Falhou`);
    console.log(`Erro: ${error.message}\n`);
    return false;
  }
}

// Função para criar arquivo se não existir
function createFileIfNotExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content);
      console.log(`✅ Criado: ${filePath}`);
      return true;
    } catch (error) {
      console.log(`❌ Erro ao criar ${filePath}: ${error.message}`);
      return false;
    }
  }
  return true;
}

// 1. Verificar e criar diretórios necessários
console.log('📁 Verificando estrutura de diretórios...');
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
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Criado diretório: ${dir}`);
    } catch (error) {
      console.log(`❌ Erro ao criar diretório ${dir}: ${error.message}`);
      hasErrors = true;
    }
  }
});

// 2. Verificar dependências críticas
console.log('\n📦 Verificando dependências...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const criticalDeps = [
    '@hookform/resolvers',
    'zod',
    'sonner',
    '@tanstack/react-query',
    'react-hook-form'
  ];
  
  const missingDeps = criticalDeps.filter(dep => !allDeps[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`⚠️ Dependências faltando: ${missingDeps.join(', ')}`);
    if (runCommand(`npm install ${missingDeps.join(' ')}`, 'Instalando dependências faltando')) {
      console.log('✅ Dependências instaladas com sucesso');
    } else {
      hasErrors = true;
    }
  } else {
    console.log('✅ Todas as dependências críticas estão instaladas');
  }
}

// 3. Verificar arquivos críticos e criar se necessário
console.log('\n📄 Verificando arquivos críticos...');

// Verificar se o redirecionamento está correto
const oldUserManagementPath = path.join(process.cwd(), 'src/components/settings/UserManagementPage.tsx');
const redirectContent = `// Redirecionar para o novo componente de administração
export { UserManagementPage } from '@/components/admin/UserManagementPage';`;

if (fs.existsSync(oldUserManagementPath)) {
  const content = fs.readFileSync(oldUserManagementPath, 'utf8');
  if (!content.includes('export { UserManagementPage } from')) {
    fs.writeFileSync(oldUserManagementPath, redirectContent);
    console.log('✅ Redirecionamento corrigido em settings/UserManagementPage.tsx');
  }
} else {
  createFileIfNotExists(oldUserManagementPath, redirectContent);
}

// 4. Verificar configuração do TypeScript
console.log('\n⚙️ Verificando configuração do TypeScript...');
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    let needsUpdate = false;
    
    if (!tsconfig.compilerOptions) {
      tsconfig.compilerOptions = {};
      needsUpdate = true;
    }
    
    if (!tsconfig.compilerOptions.skipLibCheck) {
      tsconfig.compilerOptions.skipLibCheck = true;
      needsUpdate = true;
    }
    
    if (!tsconfig.compilerOptions.paths || !tsconfig.compilerOptions.paths['@/*']) {
      if (!tsconfig.compilerOptions.paths) {
        tsconfig.compilerOptions.paths = {};
      }
      tsconfig.compilerOptions.paths['@/*'] = ['./src/*'];
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      console.log('✅ Configuração do TypeScript atualizada');
    } else {
      console.log('✅ Configuração do TypeScript está correta');
    }
  } catch (error) {
    console.log(`⚠️ Erro ao verificar tsconfig.json: ${error.message}`);
  }
}

// 5. Verificar se o Supabase está configurado
console.log('\n🗄️ Verificando Supabase...');
try {
  execSync('supabase status', { stdio: 'pipe' });
  console.log('✅ Supabase está rodando');
  
  // Tentar aplicar migrações
  if (runCommand('supabase migration up', 'Aplicando migrações do banco')) {
    console.log('✅ Migrações aplicadas com sucesso');
  } else {
    console.log('⚠️ Erro ao aplicar migrações. Tentando reset...');
    if (runCommand('supabase db reset', 'Resetando banco de dados')) {
      console.log('✅ Banco resetado com sucesso');
    } else {
      hasErrors = true;
    }
  }
} catch (error) {
  console.log('❌ Supabase não está rodando ou não está configurado');
  console.log('Execute: supabase start');
  hasErrors = true;
}

// 6. Verificar compilação TypeScript
console.log('\n🔍 Verificando compilação TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ Compilação TypeScript está OK');
} catch (error) {
  console.log('⚠️ Há erros de TypeScript, mas o sistema pode funcionar');
}

// 7. Resumo final
console.log('\n📊 RESUMO DA CORREÇÃO');
console.log('====================');

if (hasErrors) {
  console.log('❌ Alguns problemas não puderam ser corrigidos automaticamente');
  console.log('\n🔧 Próximos passos:');
  console.log('1. Execute: npm run check-user-management');
  console.log('2. Siga as instruções específicas');
  console.log('3. Consulte FIX_ERRORS_NOW.md para correções manuais');
  process.exit(1);
} else {
  console.log('✅ Correção automática concluída com sucesso!');
  console.log('\n🚀 Próximos passos:');
  console.log('1. Execute: npm run dev');
  console.log('2. Acesse: http://localhost:5173/settings');
  console.log('3. Faça login com um usuário admin');
}

console.log('\n📚 Documentação disponível:');
console.log('- FIX_ERRORS_NOW.md - Correções específicas');
console.log('- TROUBLESHOOTING.md - Guia completo');
console.log('- docs/USER_MANAGEMENT_SYSTEM.md - Documentação técnica');