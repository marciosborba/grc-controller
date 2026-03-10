import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import { OwaspVulnerabilityScanner } from './OwaspVulnerabilityScanner';
import { PrivacyScanner } from '../privacy/scanner/PrivacyScanner';
import EthicsDiagnostic from './EthicsDiagnostic';
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
  Bug,
  Filter,
  ChevronDown
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'safe'>('all');

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
        id: 'sys_rls_policies',
        category: 'security',
        name: 'Row Level Security (RLS)',
        description: 'Verificar se RLS está ativo em todas as tabelas públicas',
        status: 'pending',
        severity: 'critical'
      },
      {
        id: 'sys_public_buckets',
        category: 'security',
        name: 'Buckets Públicos',
        description: 'Identificar buckets de armazenamento expostos publicamente',
        status: 'pending',
        severity: 'high'
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
      // Otimização: Paralelismo em batches de 4 para performance sem flood
      const BATCH_SIZE = 4;
      for (let i = 0; i < checks.length; i += BATCH_SIZE) {
        const batch = checks.slice(i, i + BATCH_SIZE);

        batch.forEach(c => c.status = 'running');
        setDiagnosticChecks([...checks]);

        // Executar batch em paralelo
        await Promise.all(batch.map(check => runIndividualCheck(check)));

        setScanProgress(((Math.min(i + BATCH_SIZE, total)) / total) * 100);

        // Breve pausa para UI respirar
        await new Promise(r => setTimeout(r, 100));
      }

      const scanDuration = Date.now() - startTime;
      const summary = calculateDiagnosticSummary(checks, scanDuration);
      setDiagnosticSummary(summary);

      const results = { checks, summary };
      localStorage.setItem('lastDiagnosticResults', JSON.stringify(results));

      console.log('✅ Diagnóstico OTIMIZADO finalizado:', summary);

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
        case 'sys_db_connection': await checkDatabaseConnection(check); break;
        case 'sys_rls_policies': await checkRowLevelSecurity(check); break;
        case 'sys_public_buckets': await checkPublicBuckets(check); break;
        case 'sys_table_integrity': await checkTableIntegrity(check); break;
        case 'sys_storage_usage': await checkStorageUsage(check); break;
        case 'sec_failed_logins': await checkFailedLogins(check); break;
        case 'sec_inactive_users': await checkInactiveUsers(check); break;
        case 'sec_locked_accounts': await checkLockedAccounts(check); break;
        case 'perf_query_time': await checkQueryPerformance(check); break;
        case 'perf_large_tables': await checkLargeTables(check); break;
        case 'data_orphaned_records': await checkOrphanedRecords(check); break;
        case 'data_tenant_consistency': await checkTenantConsistency(check); break;
        case 'data_user_profiles': await checkUserProfiles(check); break;
        case 'user_activity_patterns': await checkActivityPatterns(check); break;
        case 'user_engagement': await checkUserEngagement(check); break;
        default:
          check.status = 'warning';
          check.result = 'Check não implementado';
      }

      check.duration = Date.now() - startTime;
      check.lastRun = new Date().toISOString();

    } catch (error) {
      check.status = 'failed';
      check.result = `Erro crítico: ${error}`;
    }
  };

  // --- NOVOS CHECKS DE SEGURANÇA (RPC & Storage) ---

  const checkRowLevelSecurity = async (check: DiagnosticCheck) => {
    try {
      // Usa a nova RPC para auditoria completa instantânea
      const { data, error } = await supabase.rpc('get_security_stats');
      if (error) throw error;

      const stats = data as any;
      check.realData = stats;
      const missing = stats.tables_without_rls?.length || 0;

      if (missing > 0) {
        check.status = 'failed'; // RLS desativado é CRÍTICO
        check.result = `🚨 ${missing} Tabelas desprotegidas (sem RLS)`;
        // Mostra as 3 primeiras para o user saber onde atuar
        const examples = stats.tables_without_rls.slice(0, 3).join(', ');
        check.recommendation = `ATIVAR RLS IMEDIATAMENTE EM: ${examples}...`;
      } else {
        check.status = 'passed';
        check.result = `🛡️ 100% Seguro: Todas as ${stats.total_tables} tabelas públicas têm RLS ativo.`;
      }
    } catch (e) {
      check.status = 'warning';
      check.result = 'Falha ao verificar RLS (RPC)';
    }
  };

  const checkPublicBuckets = async (check: DiagnosticCheck) => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) throw error;

      const publicBuckets = buckets.filter(b => b.public);
      check.realData = { total: buckets.length, publicCount: publicBuckets.length };

      if (publicBuckets.length > 0) {
        check.status = 'warning';
        check.result = `${publicBuckets.length} Buckets configurados como PÚBLICOS`;
        check.recommendation = `Verifique se '${publicBuckets[0].name}' deve realmente ser público.`;
      } else {
        check.status = 'passed';
        check.result = 'Todos os buckets de arquivos são Privados.';
      }
    } catch (e) {
      check.status = 'warning';
      check.result = 'Não foi possível listar buckets.';
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

      if (failedQueries.length > 0 || avgQueryTime > 2000) {
        check.status = 'failed';
        check.result = `Tempo médio: ${avgQueryTime.toFixed(0)}ms, ${failedQueries.length} falhas, ${slowQueries.length} lentas`;
        check.recommendation = 'Otimizar consultas SQL e verificar conectividade';
      } else if (avgQueryTime > 1000 || slowQueries.length > 0) {
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
      // Usar RPC segura para verificar consistência sem expor dados de auth
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { data: stats, error } = await supabase.rpc('get_diagnostic_stats');

      if (error) throw error;

      const orphanedProfiles = (stats as any).orphaned_profiles || 0;
      const totalProfiles = count || 0;

      check.realData = {
        totalProfiles,
        orphanedProfiles
      };

      if (orphanedProfiles > 0) {
        check.status = 'warning';
        check.result = `${orphanedProfiles} perfis órfãos encontrados`;
        check.recommendation = 'Execute script de limpeza de dados órfãos';
      } else {
        check.status = 'passed';
        check.result = 'Nenhum perfil órfão encontrado';
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
        topActions: Object.entries(actionTypes).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 3)
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

      const { data: stats } = await supabase.rpc('get_diagnostic_stats');
      const totalUsers = (stats as any).total_users || 0;

      if (!recentActivity) {
        check.status = 'warning';
        check.result = 'Não foi possível calcular engajamento';
        return;
      }

      const activeUserIds = new Set(recentActivity.map(log => log.user_id).filter(Boolean));
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
      default: return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-700 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-700 bg-red-50 border-red-200';
      case 'running': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600';
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


  const exportDiagnosticReport = (format: 'json' | 'pdf' | 'txt') => {
    const timestamp = new Date().toISOString().split('T')[0];

    const report = {
      timestamp: new Date().toISOString(),
      summary: diagnosticSummary,
      checks: filteredChecks.map(check => ({
        ...check,
        realData: check.realData // Incluir dados reais no relatório
      })),
      scanType: `System Diagnostic (${{ 'active': 'Ativos', 'safe': 'Seguros', 'all': 'Todos' }[statusFilter]})`
    };

    switch (format) {
      case 'json':
        exportAsJSON(report, timestamp);
        break;
      case 'pdf':
        exportAsPDF(report, timestamp);
        break;
      case 'txt':
        exportAsTXT(report, timestamp);
        break;
    }
  };

  const exportAsJSON = (report: any, timestamp: string) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-diagnostic-report-${timestamp}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAsPDF = (report: any, timestamp: string) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Color scheme
    const colors = {
      primary: [41, 128, 185],    // Blue
      secondary: [52, 73, 94],    // Dark gray
      success: [39, 174, 96],     // Green
      warning: [241, 196, 15],    // Yellow
      danger: [231, 76, 60],      // Red
      light: [236, 240, 241],     // Light gray
      text: [44, 62, 80]          // Dark text
    };

    // Helper functions
    const checkNewPage = (requiredSpace: number = 12) => {
      if (yPosition + requiredSpace > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    const addLine = (x1: number, y1: number, x2: number, y2: number, color: number[] = colors.light) => {
      pdf.setDrawColor(...color);
      pdf.setLineWidth(0.5);
      pdf.line(x1, y1, x2, y2);
    };

    const addRect = (x: number, y: number, width: number, height: number, fillColor: number[], borderColor: number[] = colors.light) => {
      pdf.setFillColor(...fillColor);
      pdf.setDrawColor(...borderColor);
      pdf.setLineWidth(0.3);
      pdf.rect(x, y, width, height, 'FD');
    };

    const addText = (text: string, x: number, y: number, options: {
      fontSize?: number;
      isBold?: boolean;
      color?: number[];
      align?: 'left' | 'center' | 'right';
      maxWidth?: number;
    } = {}) => {
      const {
        fontSize = 6,
        isBold = false,
        color = colors.text,
        align = 'left',
        maxWidth = contentWidth
      } = options;

      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(...color);

      const lines = pdf.splitTextToSize(text, maxWidth);

      if (align === 'center') {
        x = pageWidth / 2;
      } else if (align === 'right') {
        x = pageWidth - margin;
      }

      pdf.text(lines, x, y, { align });
      return lines.length * fontSize * 0.25;
    };

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'passed': return colors.success;
        case 'warning': return colors.warning;
        case 'failed': return colors.danger;
        default: return colors.secondary;
      }
    };

    const getSeverityColor = (severity: string) => {
      switch (severity.toLowerCase()) {
        case 'critical': return colors.danger;
        case 'high': return [230, 126, 34]; // Orange
        case 'medium': return colors.warning;
        case 'low': return colors.success;
        default: return colors.secondary;
      }
    };

    // Header
    addRect(margin, yPosition, contentWidth, 15, colors.primary);
    addText('RELATÓRIO DE DIAGNÓSTICO DO SISTEMA', margin + 3, yPosition + 6, {
      fontSize: 10,
      isBold: true,
      color: [255, 255, 255]
    });
    addText(`${new Date(report.timestamp).toLocaleDateString('pt-BR')} • ${report.scanType}`, margin + 3, yPosition + 12, {
      fontSize: 6,
      color: [255, 255, 255]
    });
    yPosition += 20;

    // Executive Summary
    addText('RESUMO EXECUTIVO', margin, yPosition, {
      fontSize: 8,
      isBold: true,
      color: colors.primary
    });
    yPosition += 5;
    addLine(margin, yPosition, pageWidth - margin, yPosition, colors.primary);
    yPosition += 6;

    // System Health
    const health = report.summary.systemHealth;
    const healthColor = health > 80 ? colors.success : health > 50 ? colors.warning : colors.danger;

    addText(`Saúde do Sistema: ${health}%`, margin, yPosition, {
      fontSize: 7,
      isBold: true
    });

    const barWidth = 50;
    const barHeight = 3;
    addRect(margin + 45, yPosition - 1.5, barWidth, barHeight, [240, 240, 240]);
    addRect(margin + 45, yPosition - 1.5, (barWidth * health) / 100, barHeight, healthColor);
    yPosition += 10;

    // Metrics
    const metrics = [
      { label: 'Total', value: report.summary.totalChecks, color: colors.secondary },
      { label: 'OK', value: report.summary.passed, color: colors.success },
      { label: 'Avisos', value: report.summary.warnings, color: colors.warning },
      { label: 'Falhas', value: report.summary.failed, color: colors.danger },
      { label: 'Críticos', value: report.summary.critical, color: colors.danger }
    ];

    const cardWidth = (contentWidth - 6) / 5;
    metrics.forEach((metric, index) => {
      const x = margin + (index * (cardWidth + 1.5));
      addRect(x, yPosition, cardWidth, 12, [248, 248, 248]);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...metric.color);
      pdf.text(metric.value.toString(), x + (cardWidth / 2), yPosition + 5, { align: 'center' });
      pdf.setFontSize(5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.secondary);
      pdf.text(metric.label, x + (cardWidth / 2), yPosition + 9, { align: 'center' });
    });
    yPosition += 18;

    // Details Header
    addText('DETALHES DO DIAGNÓSTICO', margin, yPosition, {
      fontSize: 8,
      isBold: true,
      color: colors.primary
    });
    yPosition += 5;
    addLine(margin, yPosition, pageWidth - margin, yPosition, colors.primary);
    yPosition += 8;

    // Check Details
    report.checks.forEach((check: any, index: number) => {
      checkNewPage(25);

      const statusColor = getStatusColor(check.status);
      const severityColor = getSeverityColor(check.severity);

      addRect(margin, yPosition, 1.5, 15, statusColor);
      addRect(margin + 3, yPosition, contentWidth - 3, 15, [252, 252, 252]);

      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...colors.text);
      pdf.text(`${index + 1}. ${check.name}`, margin + 5, yPosition + 5);

      const badgeY = yPosition + 10;
      addRect(margin + 5, badgeY, 20, 4, statusColor);
      addText(check.status.toUpperCase(), margin + 15, badgeY + 2.5, {
        fontSize: 4,
        isBold: true,
        color: [255, 255, 255],
        align: 'center'
      });

      addRect(margin + 27, badgeY, 20, 4, severityColor);
      addText(check.severity.toUpperCase(), margin + 37, badgeY + 2.5, {
        fontSize: 4,
        isBold: true,
        color: [255, 255, 255],
        align: 'center'
      });

      addText(check.category.toUpperCase(), margin + 50, badgeY + 2.5, {
        fontSize: 5,
        color: colors.secondary
      });

      yPosition += 18;

      if (check.description) {
        const descHeight = addText(check.description, margin + 5, yPosition, {
          fontSize: 6,
          color: colors.text,
          maxWidth: contentWidth - 10
        });
        yPosition += descHeight + 2;
      }

      if (check.result) {
        addText('Resultado:', margin + 5, yPosition, { fontSize: 6, isBold: true, color: colors.secondary });
        yPosition += 3;
        const resHeight = addText(check.result, margin + 8, yPosition, { fontSize: 6, color: colors.text, maxWidth: contentWidth - 13 });
        yPosition += resHeight + 2;
      }

      if (check.recommendation) {
        addText('Recomendação:', margin + 5, yPosition, { fontSize: 6, isBold: true, color: colors.primary });
        yPosition += 3;
        const recHeight = addText(check.recommendation, margin + 8, yPosition, { fontSize: 6, color: colors.text, maxWidth: contentWidth - 13 });
        yPosition += recHeight + 2;
      }

      if (index < report.checks.length - 1) {
        addLine(margin + 5, yPosition, pageWidth - margin - 5, yPosition, colors.light);
        yPosition += 4;
      }
    });

    // Footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      addLine(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18, colors.light);
      addText('Sistema GRC - Diagnóstico do Sistema', margin, pageHeight - 10, { fontSize: 5, color: colors.secondary });
      addText(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 10, { fontSize: 5, color: colors.secondary, align: 'right' });
    }

    pdf.save(`system-diagnostic-report-${timestamp}.pdf`);
  };

  const exportAsTXT = (report: any, timestamp: string) => {
    let content = '';
    content += '='.repeat(80) + '\n';
    content += 'RELATÓRIO DE DIAGNÓSTICO DO SISTEMA\n';
    content += '='.repeat(80) + '\n\n';
    content += `Data: ${new Date(report.timestamp).toLocaleString('pt-BR')}\n`;
    content += `Tipo de Scan: ${report.scanType}\n\n`;
    content += '-'.repeat(50) + '\n';
    content += 'RESUMO EXECUTIVO\n';
    content += '-'.repeat(50) + '\n';
    content += `Saúde do Sistema: ${report.summary.systemHealth}%\n`;
    content += `Total de Checks: ${report.summary.totalChecks}\n`;
    content += `Passed: ${report.summary.passed}\n`;
    content += `Warnings: ${report.summary.warnings}\n`;
    content += `Failed: ${report.summary.failed}\n\n`;

    content += '-'.repeat(50) + '\n';
    content += 'DETALHES DO DIAGNÓSTICO\n';
    content += '-'.repeat(50) + '\n\n';

    report.checks.forEach((check: any, index: number) => {
      content += `${index + 1}. ${check.name}\n`;
      content += `   Categoria: ${check.category}\n`;
      content += `   Severidade: ${check.severity.toUpperCase()}\n`;
      content += `   Status: ${check.status.toUpperCase()}\n`;
      content += `   Descrição: ${check.description}\n`;
      if (check.result) content += `   Resultado: ${check.result}\n`;
      if (check.recommendation) content += `   Recomendação: ${check.recommendation}\n`;
      if (check.realData) content += `   Dados: ${JSON.stringify(check.realData, null, 2)}\n`;
      content += '\n' + '-'.repeat(30) + '\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-diagnostic-report-${timestamp}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredChecks = diagnosticChecks.filter(check => {
    const categoryMatch = selectedCategory === 'all' || check.category === selectedCategory;
    const statusMatch = statusFilter === 'all'
      ? true
      : statusFilter === 'active'
        ? ['warning', 'failed', 'running', 'pending'].includes(check.status)
        : check.status === 'passed';
    return categoryMatch && statusMatch;
  });

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Informações do Sistema
        </TabsTrigger>
        <TabsTrigger value="vulnerabilities" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Vulnerabilidades
        </TabsTrigger>
        <TabsTrigger value="ethics" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Módulo Ética
        </TabsTrigger>
        <TabsTrigger value="privacy" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Scanner Priv.
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
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
                  <span>Diagnóstico do Sistema</span>
                </CardTitle>
                <CardDescription>
                  Escaneie o sistema usando dados reais do banco de dados para identificar problemas
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtro: {{ 'active': 'Ativos', 'safe': 'Seguros', 'all': 'Todos' }[statusFilter]}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>Ativos (Falhas/Avisos)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('safe')}>Seguros</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>Todos</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Relatório
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportDiagnosticReport('json')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar como JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportDiagnosticReport('pdf')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar como PDF (Profissional)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportDiagnosticReport('txt')}>
                      <FileText className="h-4 w-4 mr-2" />
                      Exportar como TXT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dados Reais:</p>
                            <pre className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
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
      </TabsContent>

      <TabsContent value="vulnerabilities">
        <OwaspVulnerabilityScanner />
      </TabsContent>

      <TabsContent value="ethics">
        <EthicsDiagnostic />
      </TabsContent>

      <TabsContent value="privacy">
        <PrivacyScanner />
      </TabsContent>
    </Tabs>
  );
};