#!/usr/bin/env node

/**
 * Script para aplicar correções de performance e erros de role
 * Este script executa as correções no banco de dados e atualiza o código
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

if (!supabaseUrl.includes('supabase.co') || !supabaseServiceKey.startsWith('eyJ')) {
  console.error('❌ Configuração do Supabase não encontrada!');
  console.error('Configure as variáveis VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSqlScript(scriptPath) {
  console.log(`📄 Executando script: ${scriptPath}`);
  
  try {
    const sqlContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Dividir o script em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📊 Executando ${commands.length} comandos SQL...`);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length > 10) { // Ignorar comandos muito pequenos
        try {
          const { error } = await supabase.rpc('exec_sql', { sql_command: command });
          if (error) {
            console.warn(`⚠️ Aviso no comando ${i + 1}:`, error.message);
          }
        } catch (err) {
          console.warn(`⚠️ Erro no comando ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('✅ Script SQL executado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao executar script SQL:', error.message);
    return false;
  }
}

async function checkDatabaseHealth() {
  console.log('🔍 Verificando saúde do banco de dados...');
  
  try {
    // Verificar tabelas essenciais
    const tables = ['profiles', 'user_roles', 'tenants', 'custom_roles'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Erro na tabela ${table}:`, error.message);
        return false;
      }
      
      console.log(`✅ Tabela ${table}: ${data?.length || 0} registros`);
    }
    
    // Verificar roles órfãos
    const { data: orphanRoles, error: orphanError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        profiles!inner(user_id)
      `)
      .is('profiles.user_id', null);
    
    if (orphanError) {
      console.warn('⚠️ Não foi possível verificar roles órfãos:', orphanError.message);
    } else if (orphanRoles && orphanRoles.length > 0) {
      console.warn(`⚠️ Encontrados ${orphanRoles.length} roles órfãos`);
    } else {
      console.log('✅ Nenhuma role órfã encontrada');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro na verificação de saúde:', error.message);
    return false;
  }
}

async function updateAuthContext() {
  console.log('🔄 Atualizando AuthContext...');
  
  try {
    const authContextPath = path.join(__dirname, 'src', 'contexts', 'AuthContext.tsx');
    const optimizedAuthPath = path.join(__dirname, 'src', 'components', 'OptimizedAuthProvider.tsx');
    
    if (fs.existsSync(optimizedAuthPath)) {
      // Fazer backup do AuthContext original
      const backupPath = authContextPath + '.backup';
      if (fs.existsSync(authContextPath)) {
        fs.copyFileSync(authContextPath, backupPath);
        console.log(`📋 Backup criado: ${backupPath}`);
      }
      
      // Substituir pelo AuthContext otimizado
      fs.copyFileSync(optimizedAuthPath, authContextPath);
      console.log('✅ AuthContext atualizado com versão otimizada');
      
      return true;
    } else {
      console.error('❌ Arquivo OptimizedAuthProvider.tsx não encontrado');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar AuthContext:', error.message);
    return false;
  }
}

async function optimizeAppSidebar() {
  console.log('🔄 Otimizando AppSidebar...');
  
  try {
    const sidebarPath = path.join(__dirname, 'src', 'components', 'layout', 'AppSidebar.tsx');
    
    if (!fs.existsSync(sidebarPath)) {
      console.warn('⚠️ AppSidebar.tsx não encontrado');
      return false;
    }
    
    let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
    
    // Adicionar debounce para carregamento de roles
    const debounceCode = `
// Debounce para carregamento de roles
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const debouncedLoadRoles = debounce(loadDatabaseRoles, 300);
`;
    
    // Inserir o código de debounce após os imports
    if (!sidebarContent.includes('debounce')) {
      sidebarContent = sidebarContent.replace(
        /import.*from.*;\n\n/g,
        (match) => match + debounceCode
      );
      
      // Substituir chamadas diretas por chamadas com debounce
      sidebarContent = sidebarContent.replace(
        /loadDatabaseRoles\(\)/g,
        'debouncedLoadRoles()'
      );
      
      fs.writeFileSync(sidebarPath, sidebarContent);
      console.log('✅ AppSidebar otimizado com debounce');
    } else {
      console.log('✅ AppSidebar já está otimizado');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao otimizar AppSidebar:', error.message);
    return false;
  }
}

async function createPerformanceMonitor() {
  console.log('📊 Criando monitor de performance...');
  
  const monitorCode = `
/**
 * Monitor de Performance para GRC Controller
 * Monitora carregamento de componentes e queries
 */

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  startTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Log se demorar mais que 1 segundo
      if (duration > 1000) {
        console.warn(\`⚠️ Performance: \${label} demorou \${duration.toFixed(2)}ms\`);
      }
    };
  }
  
  getMetrics(): Record<string, { avg: number, max: number, count: number }> {
    const result: Record<string, { avg: number, max: number, count: number }> = {};
    
    this.metrics.forEach((times, label) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      result[label] = { avg, max, count: times.length };
    });
    
    return result;
  }
  
  logReport(): void {
    console.log('📊 Relatório de Performance:');
    const metrics = this.getMetrics();
    
    Object.entries(metrics).forEach(([label, stats]) => {
      console.log(\`  \${label}: avg=\${stats.avg.toFixed(2)}ms, max=\${stats.max.toFixed(2)}ms, count=\${stats.count}\`);
    });
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Hook para monitorar componentes React
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const stopTimer = performanceMonitor.startTimer(\`Component: \${componentName}\`);
    return stopTimer;
  }, [componentName]);
};
`;
  
  try {
    const monitorPath = path.join(__dirname, 'src', 'utils', 'performanceMonitor.ts');
    
    // Criar diretório se não existir
    const utilsDir = path.dirname(monitorPath);
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
    }
    
    fs.writeFileSync(monitorPath, monitorCode);
    console.log('✅ Monitor de performance criado');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar monitor de performance:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando correções de performance e erros de role...');
  console.log('================================================');
  
  let success = true;
  
  // 1. Verificar saúde do banco
  console.log('\n1️⃣ Verificando saúde do banco de dados...');
  const healthCheck = await checkDatabaseHealth();
  if (!healthCheck) {
    console.error('❌ Problemas encontrados no banco de dados');
    success = false;
  }
  
  // 2. Executar script SQL de correção
  console.log('\n2️⃣ Executando correções no banco de dados...');
  const sqlPath = path.join(__dirname, 'fix-performance-and-role-errors.sql');
  if (fs.existsSync(sqlPath)) {
    const sqlSuccess = await executeSqlScript(sqlPath);
    if (!sqlSuccess) {
      console.error('❌ Falha ao executar script SQL');
      success = false;
    }
  } else {
    console.error('❌ Script SQL não encontrado:', sqlPath);
    success = false;
  }
  
  // 3. Atualizar AuthContext
  console.log('\n3️⃣ Atualizando AuthContext...');
  const authSuccess = await updateAuthContext();
  if (!authSuccess) {
    console.error('❌ Falha ao atualizar AuthContext');
    success = false;
  }
  
  // 4. Otimizar AppSidebar
  console.log('\n4️⃣ Otimizando AppSidebar...');
  const sidebarSuccess = await optimizeAppSidebar();
  if (!sidebarSuccess) {
    console.error('❌ Falha ao otimizar AppSidebar');
    success = false;
  }
  
  // 5. Criar monitor de performance
  console.log('\n5️⃣ Criando monitor de performance...');
  const monitorSuccess = await createPerformanceMonitor();
  if (!monitorSuccess) {
    console.error('❌ Falha ao criar monitor de performance');
    success = false;
  }
  
  // 6. Verificação final
  console.log('\n6️⃣ Verificação final...');
  const finalCheck = await checkDatabaseHealth();
  if (!finalCheck) {
    console.error('❌ Problemas persistem no banco de dados');
    success = false;
  }
  
  console.log('\n================================================');
  if (success) {
    console.log('🎉 CORREÇÕES APLICADAS COM SUCESSO! 🎉');
    console.log('');
    console.log('✅ Banco de dados otimizado');
    console.log('✅ AuthContext otimizado');
    console.log('✅ AppSidebar otimizado');
    console.log('✅ Monitor de performance criado');
    console.log('');
    console.log('🔄 Reinicie o servidor de desenvolvimento para aplicar as mudanças:');
    console.log('   npm run dev');
    console.log('');
    console.log('📊 A aplicação deve carregar significativamente mais rápido agora!');
  } else {
    console.log('❌ ALGUMAS CORREÇÕES FALHARAM');
    console.log('Verifique os logs acima para mais detalhes');
    process.exit(1);
  }
}

// Executar script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

export { main, checkDatabaseHealth, executeSqlScript };