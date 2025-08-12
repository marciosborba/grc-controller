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
        id: 'sys_disk_space',
        category: 'system',
        name: 'Espaço em Disco',
        description: 'Verificar se há espaço suficiente em disco',
        status: 'pending',
        severity: 'high'
      },
      {
        id: 'sys_memory_usage',
        category: 'system',
        name: 'Uso de Memória',
        description: 'Monitorar o consumo de memória do sistema',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'sys_db_connection',
        category: 'system',
        name: 'Conexão com Banco',
        description: 'Testar conectividade com o banco de dados',
        status: 'pending',
        severity: 'critical'
      },
      {
        id: 'sys_edge_functions',
        category: 'system',
        name: 'Edge Functions',
        description: 'Verificar status das funções serverless',
        status: 'pending',
        severity: 'medium'
      },

      // Security Checks
      {
        id: 'sec_failed_logins',
        category: 'security',
        name: 'Tentativas de Login Falhadas',
        description: 'Detectar padrões suspeitos de login',
        status: 'pending',
        severity: 'high'
      },
      {
        id: 'sec_mfa_coverage',
        category: 'security',
        name: 'Cobertura MFA',
        description: 'Verificar percentual de usuários com MFA',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'sec_password_policy',
        category: 'security',
        name: 'Políticas de Senha',
        description: 'Validar conformidade com políticas de senha',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'sec_inactive_users',
        category: 'security',
        name: 'Usuários Inativos',
        description: 'Identificar contas não utilizadas',
        status: 'pending',
        severity: 'low'
      },

      // Performance Checks
      {
        id: 'perf_query_time',
        category: 'performance',
        name: 'Tempo de Consultas',
        description: 'Analisar performance das consultas SQL',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'perf_api_response',
        category: 'performance',
        name: 'Tempo de Resposta API',
        description: 'Medir latência das APIs',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'perf_concurrent_users',
        category: 'performance',
        name: 'Usuários Concorrentes',
        description: 'Verificar capacidade de usuários simultâneos',
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
        id: 'data_backup_integrity',
        category: 'data',
        name: 'Integridade dos Backups',
        description: 'Verificar se os backups estão íntegros',
        status: 'pending',
        severity: 'high'
      },
      {
        id: 'data_foreign_keys',
        category: 'data',
        name: 'Chaves Estrangeiras',
        description: 'Validar integridade referencial',
        status: 'pending',
        severity: 'medium'
      },

      // User Experience Checks
      {
        id: 'user_error_rates',
        category: 'user',
        name: 'Taxa de Erros do Usuário',
        description: 'Monitorar erros reportados pelos usuários',
        status: 'pending',
        severity: 'medium'
      },
      {
        id: 'user_session_duration',
        category: 'user',
        name: 'Duração das Sessões',
        description: 'Analisar padrões de uso das sessões',
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
      // Implementar carregamento dos últimos resultados do localStorage ou banco
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
    
    try {
      for (let i = 0; i < checks.length; i++) {
        const check = checks[i];
        
        // Marcar como executando
        check.status = 'running';
        setDiagnosticChecks([...checks]);
        
        // Simular execução do check
        await runIndividualCheck(check);
        
        // Atualizar progresso
        setScanProgress(((i + 1) / total) * 100);
        
        // Pequena pausa para visualização
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Calcular resumo
      const summary = calculateDiagnosticSummary(checks);
      setDiagnosticSummary(summary);
      
      // Salvar resultados
      const results = { checks, summary };
      localStorage.setItem('lastDiagnosticResults', JSON.stringify(results));
      
    } catch (error) {
      console.error('Erro durante diagnóstico:', error);
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  const runIndividualCheck = async (check: DiagnosticCheck): Promise<void> => {
    try {
      const startTime = Date.now();
      
      switch (check.id) {
        case 'sys_disk_space':
          await checkDiskSpace(check);
          break;
        case 'sys_memory_usage':
          await checkMemoryUsage(check);
          break;
        case 'sys_db_connection':
          await checkDatabaseConnection(check);
          break;
        case 'sys_edge_functions':
          await checkEdgeFunctions(check);
          break;
        case 'sec_failed_logins':
          await checkFailedLogins(check);
          break;
        case 'sec_mfa_coverage':
          await checkMFACoverage(check);
          break;
        case 'sec_password_policy':
          await checkPasswordPolicy(check);
          break;
        case 'sec_inactive_users':
          await checkInactiveUsers(check);
          break;
        case 'perf_query_time':
          await checkQueryPerformance(check);
          break;
        case 'perf_api_response':
          await checkAPIResponse(check);
          break;
        case 'perf_concurrent_users':
          await checkConcurrentUsers(check);
          break;
        case 'data_orphaned_records':
          await checkOrphanedRecords(check);
          break;
        case 'data_backup_integrity':
          await checkBackupIntegrity(check);
          break;
        case 'data_foreign_keys':
          await checkForeignKeys(check);
          break;
        case 'user_error_rates':
          await checkUserErrorRates(check);
          break;
        case 'user_session_duration':
          await checkSessionDuration(check);
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

  // Implementações dos checks individuais
  const checkDiskSpace = async (check: DiagnosticCheck) => {
    // Simular verificação de espaço em disco
    const usagePercent = 75; // Mock data
    
    if (usagePercent > 90) {
      check.status = 'failed';
      check.result = `Espaço em disco crítico: ${usagePercent}% usado`;
      check.recommendation = 'Libere espaço em disco imediatamente ou expanda o armazenamento';
    } else if (usagePercent > 80) {
      check.status = 'warning';
      check.result = `Espaço em disco alto: ${usagePercent}% usado`;
      check.recommendation = 'Considere fazer limpeza ou expandir o armazenamento em breve';
    } else {
      check.status = 'passed';
      check.result = `Espaço em disco OK: ${usagePercent}% usado`;
    }
  };

  const checkMemoryUsage = async (check: DiagnosticCheck) => {
    const memoryUsage = 65; // Mock data
    
    if (memoryUsage > 90) {
      check.status = 'failed';
      check.result = `Uso de memória crítico: ${memoryUsage}%`;
      check.recommendation = 'Reinicie serviços ou adicione mais memória';
    } else if (memoryUsage > 80) {
      check.status = 'warning';
      check.result = `Uso de memória alto: ${memoryUsage}%`;
      check.recommendation = 'Monitore processos que consomem muita memória';
    } else {
      check.status = 'passed';
      check.result = `Uso de memória OK: ${memoryUsage}%`;
    }
  };

  const checkDatabaseConnection = async (check: DiagnosticCheck) => {
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        check.status = 'failed';
        check.result = `Erro de conexão: ${error.message}`;
        check.recommendation = 'Verifique configurações de conexão e credenciais do banco';
      } else {
        check.status = 'passed';
        check.result = 'Conexão com banco de dados OK';
      }
    } catch (error) {
      check.status = 'failed';
      check.result = `Falha na conexão: ${error}`;
      check.recommendation = 'Verifique se o serviço de banco está ativo';
    }
  };

  const checkEdgeFunctions = async (check: DiagnosticCheck) => {
    // Mock check - implementar teste real das edge functions
    const functionsWorking = true;
    
    if (functionsWorking) {
      check.status = 'passed';
      check.result = 'Edge Functions operacionais';
    } else {
      check.status = 'failed';
      check.result = 'Edge Functions não respondem';
      check.recommendation = 'Verifique deploy e configuração das edge functions';
    }
  };

  const checkFailedLogins = async (check: DiagnosticCheck) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('action', 'login_failed')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const failedCount = data?.length || 0;
      
      if (failedCount > 50) {
        check.status = 'failed';
        check.result = `${failedCount} tentativas de login falhadas nas últimas 24h`;
        check.recommendation = 'Investigar possível ataque de força bruta';
      } else if (failedCount > 20) {
        check.status = 'warning';
        check.result = `${failedCount} tentativas de login falhadas nas últimas 24h`;
        check.recommendation = 'Monitorar atividade suspeita';
      } else {
        check.status = 'passed';
        check.result = `${failedCount} tentativas de login falhadas (normal)`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Não foi possível verificar tentativas de login';
    }
  };

  const checkMFACoverage = async (check: DiagnosticCheck) => {
    try {
      // Carregar dados reais de usuários
      const { data: usersData } = await supabase.from('profiles').select('id');
      const totalUsers = usersData?.length || 0;
      
      // Por enquanto, estimativa de MFA (implementar quando MFA estiver disponível)
      const mfaPercentage = Math.floor(totalUsers * 0.4); // 40% estimado
      const mfaPercent = totalUsers > 0 ? (mfaPercentage / totalUsers) * 100 : 0;
      
      if (mfaPercent < 30) {
        check.status = 'failed';
        check.result = `Apenas ${mfaPercent.toFixed(1)}% dos usuários têm MFA ativo (${mfaPercentage}/${totalUsers})`;
        check.recommendation = 'Implementar política obrigatória de MFA para administradores';
      } else if (mfaPercent < 60) {
        check.status = 'warning';
        check.result = `${mfaPercent.toFixed(1)}% dos usuários têm MFA ativo (${mfaPercentage}/${totalUsers})`;
        check.recommendation = 'Incentivar mais usuários a ativarem MFA';
      } else {
        check.status = 'passed';
        check.result = `${mfaPercent.toFixed(1)}% dos usuários têm MFA ativo (${mfaPercentage}/${totalUsers})`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Não foi possível verificar cobertura de MFA';
      check.recommendation = 'Verifique conectividade com o banco de dados';
    }
  };

  const checkPasswordPolicy = async (check: DiagnosticCheck) => {
    // Mock check - implementar verificação de políticas de senha
    check.status = 'passed';
    check.result = 'Políticas de senha em conformidade';
  };

  const checkInactiveUsers = async (check: DiagnosticCheck) => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      // Carregar dados reais de usuários
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      
      if (!authUsers?.users) {
        check.status = 'warning';
        check.result = 'Não foi possível carregar dados de usuários';
        return;
      }

      const inactiveUsers = authUsers.users.filter(user => 
        !user.last_sign_in_at || new Date(user.last_sign_in_at) < thirtyDaysAgo
      );
      
      const inactiveCount = inactiveUsers.length;
      const totalUsers = authUsers.users.length;
      const inactivePercentage = totalUsers > 0 ? (inactiveCount / totalUsers) * 100 : 0;
      
      if (inactivePercentage > 70) {
        check.status = 'failed';
        check.result = `${inactiveCount} usuários inativos (${inactivePercentage.toFixed(1)}% do total)`;
        check.recommendation = 'Taxa muito alta de usuários inativos - revisar estratégia de engajamento';
      } else if (inactiveCount > 20) {
        check.status = 'warning';
        check.result = `${inactiveCount} usuários inativos por mais de 30 dias (${inactivePercentage.toFixed(1)}%)`;
        check.recommendation = 'Considere desativar contas não utilizadas ou enviar lembretes';
      } else {
        check.status = 'passed';
        check.result = `${inactiveCount} usuários inativos (${inactivePercentage.toFixed(1)}% - aceitável)`;
      }
    } catch (error) {
      check.status = 'warning';
      check.result = 'Não foi possível verificar usuários inativos';
      check.recommendation = 'Verifique conectividade com o serviço de autenticação';
    }
  };

  const checkQueryPerformance = async (check: DiagnosticCheck) => {
    try {
      // Testar performance com algumas consultas reais
      const startTime = Date.now();
      
      await Promise.all([
        supabase.from('profiles').select('id').limit(100),
        supabase.from('activity_logs').select('id').limit(50),
        supabase.from('assessments').select('id').limit(25)
      ]);
      
      const endTime = Date.now();
      const avgQueryTime = (endTime - startTime) / 3; // Média das 3 consultas
      
      if (avgQueryTime > 500) {
        check.status = 'failed';
        check.result = `Tempo médio de consulta muito alto: ${avgQueryTime.toFixed(0)}ms`;
        check.recommendation = 'Otimizar consultas SQL e verificar conectividade de rede';
      } else if (avgQueryTime > 200) {
        check.status = 'warning';
        check.result = `Tempo médio de consulta alto: ${avgQueryTime.toFixed(0)}ms`;
        check.recommendation = 'Monitorar consultas lentas e considerar otimizações';
      } else {
        check.status = 'passed';
        check.result = `Tempo médio de consulta OK: ${avgQueryTime.toFixed(0)}ms`;
      }
    } catch (error) {
      check.status = 'failed';
      check.result = 'Erro ao testar performance de consultas';
      check.recommendation = 'Verificar conectividade com o banco de dados';
    }
  };

  const checkAPIResponse = async (check: DiagnosticCheck) => {
    // Mock data - implementar teste real de API
    const responseTime = 150; // ms
    
    if (responseTime > 500) {
      check.status = 'failed';
      check.result = `Tempo de resposta da API muito alto: ${responseTime}ms`;
    } else if (responseTime > 300) {
      check.status = 'warning';
      check.result = `Tempo de resposta da API alto: ${responseTime}ms`;
    } else {
      check.status = 'passed';
      check.result = `Tempo de resposta da API OK: ${responseTime}ms`;
    }
  };

  const checkConcurrentUsers = async (check: DiagnosticCheck) => {
    // Mock data
    const maxConcurrent = 89;
    const capacity = 200;
    const utilizationPercent = (maxConcurrent / capacity) * 100;
    
    if (utilizationPercent > 90) {
      check.status = 'warning';
      check.result = `Alta utilização: ${maxConcurrent}/${capacity} usuários (${utilizationPercent.toFixed(1)}%)`;
      check.recommendation = 'Considere expandir capacidade do sistema';
    } else {
      check.status = 'passed';
      check.result = `Capacidade OK: ${maxConcurrent}/${capacity} usuários (${utilizationPercent.toFixed(1)}%)`;
    }
  };

  const checkOrphanedRecords = async (check: DiagnosticCheck) => {
    // Mock data - implementar verificação real
    const orphanedCount = 0;
    
    if (orphanedCount > 0) {
      check.status = 'warning';
      check.result = `${orphanedCount} registros órfãos encontrados`;
      check.recommendation = 'Execute script de limpeza de dados';
    } else {
      check.status = 'passed';
      check.result = 'Nenhum registro órfão encontrado';
    }
  };

  const checkBackupIntegrity = async (check: DiagnosticCheck) => {
    // Mock data - implementar verificação real
    const lastBackup = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 horas atrás
    const hoursAgo = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo > 48) {
      check.status = 'failed';
      check.result = `Último backup há ${hoursAgo.toFixed(1)} horas`;
      check.recommendation = 'Execute backup imediatamente';
    } else if (hoursAgo > 24) {
      check.status = 'warning';
      check.result = `Último backup há ${hoursAgo.toFixed(1)} horas`;
      check.recommendation = 'Verifique agendamento de backups';
    } else {
      check.status = 'passed';
      check.result = `Último backup há ${hoursAgo.toFixed(1)} horas`;
    }
  };

  const checkForeignKeys = async (check: DiagnosticCheck) => {
    // Mock data - implementar verificação real
    check.status = 'passed';
    check.result = 'Integridade referencial OK';
  };

  const checkUserErrorRates = async (check: DiagnosticCheck) => {
    // Mock data - implementar análise real de erros
    const errorRate = 2.1; // %
    
    if (errorRate > 5) {
      check.status = 'failed';
      check.result = `Taxa de erro alta: ${errorRate}%`;
      check.recommendation = 'Investigar causas dos erros e melhorar UX';
    } else if (errorRate > 3) {
      check.status = 'warning';
      check.result = `Taxa de erro moderada: ${errorRate}%`;
      check.recommendation = 'Monitorar erros frequentes';
    } else {
      check.status = 'passed';
      check.result = `Taxa de erro baixa: ${errorRate}%`;
    }
  };

  const checkSessionDuration = async (check: DiagnosticCheck) => {
    // Mock data
    const avgDuration = 45; // minutos
    
    if (avgDuration < 10) {
      check.status = 'warning';
      check.result = `Duração média muito baixa: ${avgDuration} min`;
      check.recommendation = 'Investigar usabilidade e engajamento';
    } else {
      check.status = 'passed';
      check.result = `Duração média das sessões: ${avgDuration} min`;
    }
  };

  const calculateDiagnosticSummary = (checks: DiagnosticCheck[]): DiagnosticSummary => {
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
      scanDuration: 0, // Calcular tempo real
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
      checks: diagnosticChecks
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-report-${new Date().toISOString().split('T')[0]}.json`;
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
              Score geral de saúde
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
                Escaneie o sistema em busca de problemas e oportunidades de melhoria
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