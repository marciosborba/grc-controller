import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  Search,
  Zap,
  Shield,
  Database,
  Users,
  Activity,
  TrendingDown,
  TrendingUp,
  Info,
  Download,
  FileText,
  Bug
} from 'lucide-react';

interface DiagnosticCheck {
  id: string;
  category: 'system' | 'security' | 'performance' | 'data' | 'user';
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'warning' | 'failed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  result?: string;
  recommendation?: string;
  lastRun?: string;
  duration?: number;
  realData?: any; // Para armazenar dados reais
}

interface DiagnosticSummary {
  totalChecks: number;
  passed: number;
  warnings: number;
  failed: number;
  critical: number;
  lastFullScan: string | null;
  scanDuration: number;
  systemHealth: number;
}

export const SystemDiagnosticSection = () => {
  const [diagnosticChecks, setDiagnosticChecks] = useState<DiagnosticCheck[]>([]);
  const [diagnosticSummary, setDiagnosticSummary] = useState<DiagnosticSummary>({
    totalChecks: 0,
    passed: 0,
    warnings: 0,
    failed: 0,
    critical: 0,
    lastFullScan: null,
    scanDuration: 0,
    systemHealth: 0
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const initializeDiagnosticChecks = (): DiagnosticCheck[] => {
    return [
      // System Checks
      {
        id: 'sys_db_connection',
        category: 'system',
        name: 'Conexão com Banco',
        description: 'Testar conectividade e performance do banco de dados',
        status: 'pending',
        severity: 'critical'
      },
      {
        id: 'sys_table_integrity',
        category: 'system',
        name: 'Integridade das Tabelas',
        description: 'Verificar se todas as tabelas principais existem',
        status: 'pending',
        severity: 'high'
      },
      {
        id: 'sys_storage_usage',
        category: 'system',
        name: 'Uso de Armazenamento',
        description: 'Monitorar o consumo de storage do banco',
        status: 'pending',
        severity: 'medium'
      },

      // Security Checks
      {
        id: 'sec_failed_logins',
        category: 'security',
        name: 'Tentativas de Login Falhadas',
        description: 'Detectar padrões suspeitos de login nas últimas 24h',
        status: 'pending',
        severity: 'high'
      },
      {
        id: 'sec_inactive_users',
        category: 'security',
        name: 'Usuários Inativos',
        description: 'Identificar contas não utilizadas há mais de 30 dias',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'sec_locked_accounts',
        category: 'security',
        name: 'Contas Bloqueadas',
        description: 'Verificar usuários com contas bloqueadas',
        status: 'pending',
        severity: 'medium'
      },

      // Performance Checks
      {
        id: 'perf_query_time',
        category: 'performance',
        name: 'Tempo de Consultas',
        description: 'Analisar performance das consultas SQL principais',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'perf_large_tables',
        category: 'performance',
        name: 'Tabelas Grandes',
        description: 'Identificar tabelas com muitos registros',
        status: 'pending',
        severity: 'low'
      },

      // Data Integrity Checks
      {
        id: 'data_orphaned_records',
        category: 'data',
        name: 'Registros Órfãos',
        description: 'Detectar dados inconsistentes ou órfãos',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'data_tenant_consistency',
        category: 'data',
        name: 'Consistência de Tenants',
        description: 'Verificar integridade dos dados de organizações',
        status: 'pending',
        severity: 'high'
      },
      {
        id: 'data_user_profiles',
        category: 'data',
        name: 'Perfis de Usuário',
        description: 'Validar consistência entre auth e profiles',
        status: 'pending',
        severity: 'medium'
      },

      // User Experience Checks
      {
        id: 'user_activity_patterns',
        category: 'user',
        name: 'Padrões de Atividade',
        description: 'Analisar padrões de uso dos usuários',
        status: 'pending',
        severity: 'low'
      },
      {
        id: 'user_engagement',
        category: 'user',
        name: 'Engajamento de Usuários',
        description: 'Medir engajamento baseado em atividade recente',
        status: 'pending',
        severity: 'low'
      }
    ];
  };

  useEffect(() => {
    const checks = initializeDiagnosticChecks();
    setDiagnosticChecks(checks);
    
    // Carregar último resultado se existir
    loadLastDiagnosticResults();
  }, []);

  const loadLastDiagnosticResults = async () => {
    try {
      const savedResults = localStorage.getItem('lastDiagnosticResults');
      if (savedResults) {
        const results = JSON.parse(savedResults);
        setDiagnosticChecks(results.checks);
        setDiagnosticSummary(results.summary);
      }
    } catch (error) {
      console.error('Erro ao carregar últimos resultados:', error);
    }
  };

  const runFullDiagnostic = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const checks = [...diagnosticChecks];
    const total = checks.length;
    const startTime = Date.now();
    
    try {
      for (let i = 0; i < checks.length; i++) {
        const check = checks[i];
        
        // Marcar como executando
        check.status = 'running';
        setDiagnosticChecks([...checks]);
        
        // Executar check real
        await runIndividualCheck(check);
        
        // Atualizar progresso
        setScanProgress(((i + 1) / total) * 100);
        
        // Pequena pausa para visualização
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Calcular resumo
      const scanDuration = Date.now() - startTime;
      const summary = calculateDiagnosticSummary(checks, scanDuration);
      setDiagnosticSummary(summary);
      
      // Salvar resultados
      const results = { checks, summary };
      localStorage.setItem('lastDiagnosticResults', JSON.stringify(results));
      
      console.log('✅ Diagnóstico completo finalizado:', summary);
      
    } catch (error) {
      console.error('❌ Erro durante diagnóstico:', error);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  const runIndividualCheck = async (check: DiagnosticCheck): Promise<void> => {
    try {
      const startTime = Date.now();
      
      switch (check.id) {
        case 'sys_db_connection':
          await checkDatabaseConnection(check);
          break;
        case 'sys_table_integrity':
          await checkTableIntegrity(check);
          break;
        case 'sys_storage_usage':
          await checkStorageUsage(check);
          break;
        case 'sec_failed_logins':
          await checkFailedLogins(check);
          break;
        case 'sec_inactive_users':
          await checkInactiveUsers(check);
          break;
        case 'sec_locked_accounts':
          await checkLockedAccounts(check);
          break;
        case 'perf_query_time':
          await checkQueryPerformance(check);
          break;
        case 'perf_large_tables':
          await checkLargeTables(check);
          break;
        case 'data_orphaned_records':
          await checkOrphanedRecords(check);
          break;
        case 'data_tenant_consistency':
          await checkTenantConsistency(check);
          break;
        case 'data_user_profiles':
          await checkUserProfiles(check);
          break;
        case 'user_activity_patterns':
          await checkActivityPatterns(check);
          break;
        case 'user_engagement':
          await checkUserEngagement(check);
          break;
        default:
          check.status = 'warning';
          check.result = 'Check não implementado';
      }
      
      check.duration = Date.now() - startTime;
      check.lastRun = new Date().toISOString();
      
    } catch (error) {
      check.status = 'failed';
      check.result = `Erro durante execução: ${error}`;
      check.recommendation = 'Verifique os logs do sistema para mais detalhes';
    }
  };

  // Implementações dos checks com dados reais
  const checkDatabaseConnection = async (check: DiagnosticCheck) => {
    try {
      const startTime = Date.now();
      
      // Testar múltiplas consultas para medir performance
      const results = await Promise.allSettled([
        supabase.from('profiles').select('id').limit(1),
        supabase.from('tenants').select('id').limit(1),
        supabase.from('activity_logs').select('id').limit(1)
      ]);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      const successfulQueries = results.filter(r => r.status === 'fulfilled').length;
      const totalQueries = results.length;
      
      check.realData = { responseTime, successfulQueries, totalQueries };
      
      if (successfulQueries === totalQueries && responseTime < 500) {
        check.status = 'passed';
        check.result = `Conexão OK - ${responseTime}ms para ${totalQueries} consultas`;
      } else if (successfulQueries === totalQueries && responseTime < 1000) {
        check.status = 'warning';
        check.result = `Conexão lenta - ${responseTime}ms para ${totalQueries} consultas`;
        check.recommendation = 'Monitorar performance da rede ou banco';
      } else {
        check.status = 'failed';
        check.result = `Falhas na conexão - ${successfulQueries}/${totalQueries} consultas OK, ${responseTime}ms`;
        check.recommendation = 'Verificar conectividade e status do banco';
      }
    } catch (error) {
      check.status = 'failed';
      check.result = `Erro de conexão: ${error}`;
      check.recommendation = 'Verificar configurações de rede e credenciais';
    }
  };

  const checkTableIntegrity = async (check: DiagnosticCheck) => {
    try {
      // Usar apenas tabelas que realmente existem no banco
      const requiredTables = ['profiles', 'tenants', 'assessments', 'risk_assessments', 'policies', 'activity_logs'];
      const tableResults = [];
      
      for (const table of requiredTables) {
        try {
          const { error } = await supabase.from(table).select('id').limit(1);
          tableResults.push({ table, exists: !error, error: error?.message });
        } catch (err) {
          tableResults.push({ table, exists: false, error: err });
        }
      }
      
      const existingTables = tableResults.filter(t => t.exists).length;
      const missingTables = tableResults.filter(t => !t.exists);
      
      check.realData = { tableResults, existingTables, totalTables: requiredTables.length };
      
      if (existingTables === requiredTables.length) {
        check.status = 'passed';
        check.result = `Todas as ${requiredTables.length} tabelas principais existem`;
      } else {
        check.status = 'failed';
        check.result = `${missingTables.length} tabelas faltando: ${missingTables.map(t => t.table).join(', ')}`;
        check.recommendation = 'Executar migrations ou verificar estrutura do banco';
      }
    } catch (error) {
      check.status = 'failed';
      check.result = `Erro ao verificar tabelas: ${error}`;
    }
  };

  const checkStorageUsage = async (check: DiagnosticCheck) => {
    try {
      // Contar registros em tabelas principais
      const tableCounts = await Promise.allSettled([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('tenants').select('id', { count: 'exact', head: true }),
        supabase.from('assessments').select('id', { count: 'exact', head: true }),
        supabase.from('risk_assessments').select('id', { count: 'exact', head: true }),
        supabase.from('policies').select('id', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
      ]);
      
      const counts = tableCounts.map((result, index) => {
        const tableName = ['profiles', 'tenants', 'assessments', 'risk_assessments', 'policies', 'activity_logs'][index];
        const count = result.status === 'fulfilled' ? result.value.count || 0 : 0;
        return { table: tableName, count };
      });
      
      const totalRecords = counts.reduce((sum, item) => sum + item.count, 0);
      const estimatedSizeKB = totalRecords * 2; // ~2KB por registro
      const estimatedSizeMB = estimatedSizeKB / 1024;
      
      check.realData = { counts, totalRecords, estimatedSizeMB };
      
      if (estimatedSizeMB < 100) {
        check.status = 'passed';
        check.result = `${totalRecords} registros (~${estimatedSizeMB.toFixed(1)}MB estimado)`;
      } else if (estimatedSizeMB < 500) {
        check.status = 'warning';
        check.result = `${totalRecords} registros (~${estimatedSizeMB.toFixed(1)}MB estimado)`;
        check.recommendation = 'Monitorar crescimento e considerar arquivamento';
      } else {
        check.status = 'failed';
        check.result = `${totalRecords} registros (~${estimatedSizeMB.toFixed(1)}MB estimado)`;
        check.recommendation = 'Implementar estratégia de arquivamento ou limpeza';
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Não foi possível calcular uso de storage';
    }
  };

  const checkFailedLogins = async (check: DiagnosticCheck) => {
    try {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: failedLogins, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('action', 'login_failed')
        .gte('created_at', last24Hours);

      if (error) throw error;

      const failedCount = failedLogins?.length || 0;
      
      // Analisar IPs únicos para detectar ataques
      const uniqueIPs = new Set(failedLogins?.map(log => log.ip_address).filter(Boolean));
      const suspiciousIPs = [];
      
      for (const ip of uniqueIPs) {
        const ipFailures = failedLogins?.filter(log => log.ip_address === ip).length || 0;
        if (ipFailures > 5) {
          suspiciousIPs.push({ ip, failures: ipFailures });
        }
      }
      
      check.realData = { failedCount, uniqueIPs: uniqueIPs.size, suspiciousIPs };
      
      if (failedCount > 50 || suspiciousIPs.length > 0) {
        check.status = 'failed';
        check.result = `${failedCount} tentativas falhadas, ${suspiciousIPs.length} IPs suspeitos`;
        check.recommendation = 'Investigar possível ataque de força bruta';
      } else if (failedCount > 20) {
        check.status = 'warning';
        check.result = `${failedCount} tentativas falhadas nas últimas 24h`;
        check.recommendation = 'Monitorar atividade suspeita';
      } else {
        check.status = 'passed';
        check.result = `${failedCount} tentativas falhadas (normal)`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Não foi possível verificar tentativas de login';
    }
  };

  const checkInactiveUsers = async (check: DiagnosticCheck) => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Buscar usuários de autenticação
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      if (!authUsers?.users) {
        check.status = 'warning';
        check.result = 'Não foi possível carregar dados de usuários';
        return;
      }

      const inactiveUsers = authUsers.users.filter(user => 
        !user.last_sign_in_at || new Date(user.last_sign_in_at) < thirtyDaysAgo
      );
      
      const totalUsers = authUsers.users.length;
      const inactiveCount = inactiveUsers.length;
      const inactivePercentage = totalUsers > 0 ? (inactiveCount / totalUsers) * 100 : 0;
      
      check.realData = { 
        totalUsers, 
        inactiveCount, 
        inactivePercentage,
        oldestInactive: inactiveUsers.length > 0 ? 
          Math.min(...inactiveUsers.map(u => u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0)) : null
      };
      
      if (inactivePercentage > 70) {
        check.status = 'failed';
        check.result = `${inactiveCount}/${totalUsers} usuários inativos (${inactivePercentage.toFixed(1)}%)`;
        check.recommendation = 'Taxa muito alta - revisar estratégia de engajamento';
      } else if (inactiveCount > 10) {
        check.status = 'warning';
        check.result = `${inactiveCount}/${totalUsers} usuários inativos (${inactivePercentage.toFixed(1)}%)`;
        check.recommendation = 'Considerar desativar contas não utilizadas';
      } else {
        check.status = 'passed';
        check.result = `${inactiveCount}/${totalUsers} usuários inativos (${inactivePercentage.toFixed(1)}%)`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Não foi possível verificar usuários inativos';
    }
  };

  const checkLockedAccounts = async (check: DiagnosticCheck) => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, locked_until, is_active')
        .or('locked_until.gte.now(),is_active.eq.false');

      if (error) throw error;

      const now = new Date();
      const lockedUsers = profiles?.filter(profile => 
        !profile.is_active || (profile.locked_until && new Date(profile.locked_until) > now)
      ) || [];
      
      const temporaryLocks = lockedUsers.filter(u => u.locked_until && new Date(u.locked_until) > now).length;
      const permanentLocks = lockedUsers.filter(u => !u.is_active).length;
      
      check.realData = { 
        totalLocked: lockedUsers.length, 
        temporaryLocks, 
        permanentLocks 
      };
      
      if (lockedUsers.length > 20) {
        check.status = 'warning';
        check.result = `${lockedUsers.length} contas bloqueadas (${temporaryLocks} temporárias, ${permanentLocks} permanentes)`;
        check.recommendation = 'Revisar motivos dos bloqueios e considerar desbloqueios';
      } else {
        check.status = 'passed';
        check.result = `${lockedUsers.length} contas bloqueadas (${temporaryLocks} temporárias, ${permanentLocks} permanentes)`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Não foi possível verificar contas bloqueadas';
    }
  };

  const checkQueryPerformance = async (check: DiagnosticCheck) => {
    try {
      const queries = [
        { name: 'profiles', query: () => supabase.from('profiles').select('id').limit(100) },
        { name: 'tenants', query: () => supabase.from('tenants').select('id').limit(50) },
        { name: 'activity_logs', query: () => supabase.from('activity_logs').select('id').limit(50) },
        { name: 'assessments', query: () => supabase.from('assessments').select('id').limit(25) }
      ];
      
      const results = [];
      
      for (const { name, query } of queries) {
        const startTime = Date.now();
        try {
          await query();
          const duration = Date.now() - startTime;
          results.push({ table: name, duration, success: true });
        } catch (error) {
          results.push({ table: name, duration: Date.now() - startTime, success: false, error });
        }
      }
      
      const avgQueryTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
      const slowQueries = results.filter(r => r.duration > 300);
      const failedQueries = results.filter(r => !r.success);
      
      check.realData = { results, avgQueryTime, slowQueries: slowQueries.length, failedQueries: failedQueries.length };
      
      if (failedQueries.length > 0 || avgQueryTime > 500) {
        check.status = 'failed';
        check.result = `Tempo médio: ${avgQueryTime.toFixed(0)}ms, ${failedQueries.length} falhas, ${slowQueries.length} lentas`;
        check.recommendation = 'Otimizar consultas SQL e verificar conectividade';
      } else if (avgQueryTime > 200 || slowQueries.length > 0) {
        check.status = 'warning';
        check.result = `Tempo médio: ${avgQueryTime.toFixed(0)}ms, ${slowQueries.length} consultas lentas`;
        check.recommendation = 'Monitorar consultas lentas';
      } else {
        check.status = 'passed';
        check.result = `Tempo médio: ${avgQueryTime.toFixed(0)}ms - Performance OK`;
      }
    } catch (error) {
      check.status = 'failed';
      check.result = 'Erro ao testar performance de consultas';
    }
  };

  const checkLargeTables = async (check: DiagnosticCheck) => {
    try {
      // Usar tabelas reais do banco
      const tables = ['profiles', 'tenants', 'assessments', 'risk_assessments', 'policies', 'activity_logs'];
      const tableSizes = [];
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('id', { count: 'exact', head: true });
            
          if (!error) {
            tableSizes.push({ table, count: count || 0 });
          }
        } catch (err) {
          tableSizes.push({ table, count: 0, error: err });
        }
      }
      
      const largeTables = tableSizes.filter(t => t.count > 10000);
      const totalRecords = tableSizes.reduce((sum, t) => sum + t.count, 0);
      
      check.realData = { tableSizes, largeTables: largeTables.length, totalRecords };
      
      if (largeTables.length > 3) {
        check.status = 'warning';
        check.result = `${largeTables.length} tabelas grandes (>10k registros), ${totalRecords} total`;
        check.recommendation = 'Considerar estratégias de otimização ou arquivamento';
      } else {
        check.status = 'passed';
        check.result = `${largeTables.length} tabelas grandes, ${totalRecords} registros total`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Não foi possível verificar tamanho das tabelas';
    }
  };

  const checkOrphanedRecords = async (check: DiagnosticCheck) => {
    try {
      // Verificar profiles sem usuário de auth correspondente
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const { data: profiles } = await supabase.from('profiles').select('user_id');
      
      if (!authUsers?.users || !profiles) {
        check.status = 'warning';
        check.result = 'Não foi possível verificar consistência';
        return;
      }
      
      const authUserIds = new Set(authUsers.users.map(u => u.id));
      const orphanedProfiles = profiles.filter(p => !authUserIds.has(p.user_id));
      
      check.realData = { 
        totalProfiles: profiles.length, 
        totalAuthUsers: authUsers.users.length,
        orphanedProfiles: orphanedProfiles.length 
      };
      
      if (orphanedProfiles.length > 0) {
        check.status = 'warning';
        check.result = `${orphanedProfiles.length} perfis órfãos encontrados`;
        check.recommendation = 'Execute script de limpeza de dados órfãos';
      } else {
        check.status = 'passed';
        check.result = 'Nenhum registro órfão encontrado';
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Erro ao verificar registros órfãos';
    }
  };

  const checkTenantConsistency = async (check: DiagnosticCheck) => {
    try {
      const { data: tenants } = await supabase.from('tenants').select('id, name, is_active');
      const { data: profiles } = await supabase.from('profiles').select('tenant_id');
      
      if (!tenants || !profiles) {
        check.status = 'warning';
        check.result = 'Não foi possível verificar consistência de tenants';
        return;
      }
      
      const tenantIds = new Set(tenants.map(t => t.id));
      const profilesWithInvalidTenant = profiles.filter(p => p.tenant_id && !tenantIds.has(p.tenant_id));
      const activeTenants = tenants.filter(t => t.is_active).length;
      
      check.realData = {
        totalTenants: tenants.length,
        activeTenants,
        profilesWithInvalidTenant: profilesWithInvalidTenant.length
      };
      
      if (profilesWithInvalidTenant.length > 0) {
        check.status = 'failed';
        check.result = `${profilesWithInvalidTenant.length} perfis com tenant inválido`;
        check.recommendation = 'Corrigir referências de tenant nos perfis';
      } else {
        check.status = 'passed';
        check.result = `${tenants.length} tenants (${activeTenants} ativas) - Consistência OK`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Erro ao verificar consistência de tenants';
    }
  };

  const checkUserProfiles = async (check: DiagnosticCheck) => {
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const { data: profiles } = await supabase.from('profiles').select('user_id, is_active');
      
      if (!authUsers?.users || !profiles) {
        check.status = 'warning';
        check.result = 'Não foi possível verificar perfis';
        return;
      }
      
      const profileUserIds = new Set(profiles.map(p => p.user_id));
      const usersWithoutProfile = authUsers.users.filter(u => !profileUserIds.has(u.id));
      const activeProfiles = profiles.filter(p => p.is_active).length;
      
      check.realData = {
        totalAuthUsers: authUsers.users.length,
        totalProfiles: profiles.length,
        activeProfiles,
        usersWithoutProfile: usersWithoutProfile.length
      };
      
      if (usersWithoutProfile.length > 0) {
        check.status = 'warning';
        check.result = `${usersWithoutProfile.length} usuários sem perfil`;
        check.recommendation = 'Criar perfis para usuários sem perfil';
      } else {
        check.status = 'passed';
        check.result = `${profiles.length} perfis (${activeProfiles} ativos) - Consistência OK`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Erro ao verificar perfis de usuário';
    }
  };

  const checkActivityPatterns = async (check: DiagnosticCheck) => {
    try {
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentActivity } = await supabase
        .from('activity_logs')
        .select('action, created_at')
        .gte('created_at', last7Days);
      
      if (!recentActivity) {
        check.status = 'warning';
        check.result = 'Não foi possível analisar padrões de atividade';
        return;
      }
      
      const dailyActivity = {};
      recentActivity.forEach(log => {
        const date = new Date(log.created_at).toDateString();
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
      });
      
      const avgDailyActivity = Object.values(dailyActivity).reduce((sum: number, count: number) => sum + count, 0) / 7;
      const actionTypes = {};
      recentActivity.forEach(log => {
        actionTypes[log.action] = (actionTypes[log.action] || 0) + 1;
      });
      
      check.realData = {
        totalActivity: recentActivity.length,
        avgDailyActivity: Math.round(avgDailyActivity),
        uniqueActions: Object.keys(actionTypes).length,
        topActions: Object.entries(actionTypes).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 3)
      };
      
      if (avgDailyActivity < 10) {
        check.status = 'warning';
        check.result = `Baixa atividade: ${Math.round(avgDailyActivity)} ações/dia em média`;
        check.recommendation = 'Investigar baixo engajamento dos usuários';
      } else {
        check.status = 'passed';
        check.result = `Atividade normal: ${Math.round(avgDailyActivity)} ações/dia em média`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Erro ao analisar padrões de atividade';
    }
  };

  const checkUserEngagement = async (check: DiagnosticCheck) => {
    try {
      const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentActivity } = await supabase
        .from('activity_logs')
        .select('user_id, created_at')
        .gte('created_at', last30Days);
      
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      if (!recentActivity || !authUsers?.users) {
        check.status = 'warning';
        check.result = 'Não foi possível calcular engajamento';
        return;
      }
      
      const activeUserIds = new Set(recentActivity.map(log => log.user_id).filter(Boolean));
      const totalUsers = authUsers.users.length;
      const engagementRate = totalUsers > 0 ? (activeUserIds.size / totalUsers) * 100 : 0;
      
      check.realData = {
        totalUsers,
        activeUsers: activeUserIds.size,
        engagementRate: Math.round(engagementRate * 100) / 100,
        totalActivity: recentActivity.length
      };
      
      if (engagementRate < 30) {
        check.status = 'warning';
        check.result = `Baixo engajamento: ${engagementRate.toFixed(1)}% usuários ativos (${activeUserIds.size}/${totalUsers})`;
        check.recommendation = 'Implementar estratégias para aumentar engajamento';
      } else {
        check.status = 'passed';
        check.result = `Engajamento OK: ${engagementRate.toFixed(1)}% usuários ativos (${activeUserIds.size}/${totalUsers})`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Erro ao calcular engajamento';
    }
  };

  const calculateDiagnosticSummary = (checks: DiagnosticCheck[], scanDuration: number): DiagnosticSummary => {
    const passed = checks.filter(c => c.status === 'passed').length;
    const warnings = checks.filter(c => c.status === 'warning').length;
    const failed = checks.filter(c => c.status === 'failed').length;
    const critical = checks.filter(c => c.status === 'failed' && c.severity === 'critical').length;
    
    const healthScore = Math.round(((passed + warnings * 0.5) / checks.length) * 100);
    
    return {
      totalChecks: checks.length,
      passed,
      warnings,
      failed,
      critical,
      lastFullScan: new Date().toISOString(),
      scanDuration,
      systemHealth: healthScore
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-700 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-700 bg-red-50 border-red-200';
      case 'running': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      case 'user': return <Users className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const exportDiagnosticReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: diagnosticSummary,
      checks: diagnosticChecks.map(check => ({
        ...check,
        realData: check.realData // Incluir dados reais no relatório
      }))
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-report-real-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredChecks = selectedCategory === 'all' 
    ? diagnosticChecks 
    : diagnosticChecks.filter(check => check.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Diagnostic Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saúde do Sistema</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnosticSummary.systemHealth}%</div>
            <Progress value={diagnosticSummary.systemHealth} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Score baseado em dados reais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checks OK</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{diagnosticSummary.passed}</div>
            <p className="text-xs text-muted-foreground">de {diagnosticSummary.totalChecks} checks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avisos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{diagnosticSummary.warnings}</div>
            <p className="text-xs text-muted-foreground">requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{diagnosticSummary.failed}</div>
            <p className="text-xs text-muted-foreground">necessitam correção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <XCircle className="h-4 w-4 text-red-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{diagnosticSummary.critical}</div>
            <p className="text-xs text-muted-foreground">alta prioridade</p>
          </CardContent>
        </Card>
      </div>

      {/* Scan Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Diagnóstico do Sistema - Dados Reais</span>
              </CardTitle>
              <CardDescription>
                Escaneie o sistema usando dados reais do banco de dados para identificar problemas
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={exportDiagnosticReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button 
                onClick={runFullDiagnostic} 
                disabled={isScanning}
                size="sm"
              >
                {isScanning ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isScanning ? 'Escaneando...' : 'Executar Diagnóstico'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isScanning && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progresso do Scan:</span>
                <span>{scanProgress.toFixed(1)}%</span>
              </div>
              <Progress value={scanProgress} />
            </div>
          )}

          {diagnosticSummary.lastFullScan && (
            <div className="mb-4 text-sm text-muted-foreground">
              Último scan completo: {new Date(diagnosticSummary.lastFullScan).toLocaleString('pt-BR')} 
              (duração: {(diagnosticSummary.scanDuration / 1000).toFixed(1)}s)
            </div>
          )}

          {/* Category Filter */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              Todos
            </Button>
            <Button
              variant={selectedCategory === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('system')}
            >
              <Settings className="h-3 w-3 mr-1" />
              Sistema
            </Button>
            <Button
              variant={selectedCategory === 'security' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('security')}
            >
              <Shield className="h-3 w-3 mr-1" />
              Segurança
            </Button>
            <Button
              variant={selectedCategory === 'performance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('performance')}
            >
              <Zap className="h-3 w-3 mr-1" />
              Performance
            </Button>
            <Button
              variant={selectedCategory === 'data' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('data')}
            >
              <Database className="h-3 w-3 mr-1" />
              Dados
            </Button>
            <Button
              variant={selectedCategory === 'user' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('user')}
            >
              <Users className="h-3 w-3 mr-1" />
              Usuário
            </Button>
          </div>

          {/* Diagnostic Checks */}
          <div className="space-y-3">
            {filteredChecks.map((check) => (
              <div key={check.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(check.category)}
                      {getStatusIcon(check.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{check.name}</h4>
                        <Badge className={`text-xs ${getStatusColor(check.status)}`}>
                          {check.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {check.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {check.description}
                      </p>
                      
                      {check.result && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Resultado:</p>
                          <p className="text-sm">{check.result}</p>
                        </div>
                      )}
                      
                      {check.recommendation && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-blue-600">Recomendação:</p>
                          <p className="text-sm text-blue-600">{check.recommendation}</p>
                        </div>
                      )}
                      
                      {check.realData && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-600">Dados Reais:</p>
                          <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(check.realData, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {check.lastRun && (
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Executado: {new Date(check.lastRun).toLocaleString('pt-BR')}</span>
                          {check.duration && (
                            <span>Duração: {check.duration}ms</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runIndividualCheck(check)}
                    disabled={check.status === 'running'}
                  >
                    {check.status === 'running' ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredChecks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bug className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum check encontrado para a categoria selecionada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real Data Indicator */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dados Reais:</strong> Todos os diagnósticos são baseados em dados reais do banco de dados. 
          Os resultados refletem o estado atual do sistema e são atualizados em tempo real.
        </AlertDescription>
      </Alert>

      {/* Critical Issues Alert */}
      {diagnosticSummary.critical > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {diagnosticSummary.critical} problema(s) crítico(s) detectado(s). 
            Esses problemas podem afetar a operação do sistema e devem ser corrigidos imediatamente.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};