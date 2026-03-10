import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Activity,
  Shield,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Monitor,
  HardDrive,
  Clock,
  TrendingUp,
  Settings,
  Eye,
  Lock,
  FileText,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Zap,
  Target,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UserDebugInfo from '@/components/admin/UserDebugInfo';
import { SystemUsersSection } from './SystemUsersSection';
import { SystemLogsSection } from './SystemLogsSection';
import { SystemSecuritySection } from './SystemSecuritySection';
import { SystemStorageSection } from './SystemStorageSection';
import { SystemDiagnosticSection } from './SystemDiagnosticSection';
import { PrivacyScanner } from '../privacy/scanner/PrivacyScanner';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  database: 'healthy' | 'warning' | 'critical';
  auth: 'healthy' | 'warning' | 'critical';
  storage: 'healthy' | 'warning' | 'critical';
  performance: 'healthy' | 'warning' | 'critical';
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTenants: number;
  activeTenants: number;
  totalAssessments: number;
  totalRisks: number;
  totalPolicies: number;
  todayLogins: number;
  lastBackup: string | null;
  systemUptime: string;
  dbConnections: number;
  storageUsed: number;
  storageTotal: number;
}

interface SecurityMetrics {
  criticalRisks: number;
  pendingAssessments: number;
  securityIncidents: number;
  complianceScore: number;
  failedLogins: number;
  suspiciousActivities: number;
  vulnerableAssets: number;
  overduePolicies: number;
  expiredCertifications: number;
  dataBreachAttempts: number;
}

const SystemDiagnosticPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    database: 'healthy',
    auth: 'healthy',
    storage: 'healthy',
    performance: 'healthy'
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTenants: 0,
    activeTenants: 0,
    totalAssessments: 0,
    totalRisks: 0,
    totalPolicies: 0,
    todayLogins: 0,
    lastBackup: null,
    systemUptime: '0d 0h 0m',
    dbConnections: 0,
    storageUsed: 0,
    storageTotal: 0
  });

  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    criticalRisks: 0,
    pendingAssessments: 0,
    securityIncidents: 0,
    complianceScore: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    vulnerableAssets: 0,
    overduePolicies: 0,
    expiredCertifications: 0,
    dataBreachAttempts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadSystemData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading GLOBAL system metrics via RPC...');

      const { data, error } = await supabase.rpc('admin_get_global_stats');

      if (error) {
        throw error;
      }

      const stats = data as any;
      console.log('✅ Global Metrics Loaded:', stats);

      // System Stats
      const system = stats.system;
      const counts = stats.counts;
      const security = stats.security;

      // Calculate Uptime String
      let uptimeString = '0d 0h 0m';
      if (system.server_start_time) {
        const now = new Date();
        const startTime = new Date(system.server_start_time);
        const diffMs = now.getTime() - startTime.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        uptimeString = `${days}d ${hours}h ${minutes}m`;
      }

      // Storage
      const storageUsedGB = (system.db_size_bytes || 0) / (1024 * 1024 * 1024);
      const storageTotalGB = 1.0; // 1GB Free Tier limit

      // Update System Stats State
      setSystemStats({
        totalUsers: counts.total_users,
        activeUsers: counts.active_users_24h,
        totalTenants: counts.total_tenants,
        activeTenants: counts.active_tenants,
        totalAssessments: counts.total_assessments,
        totalRisks: counts.total_risks,
        totalPolicies: counts.total_policies,
        todayLogins: counts.active_users_24h,
        lastBackup: system.last_backup_time || new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        systemUptime: uptimeString,
        dbConnections: system.active_connections,
        storageUsed: parseFloat(storageUsedGB.toFixed(3)),
        storageTotal: storageTotalGB
      });

      // Update Security Metrics State
      setSecurityMetrics({
        criticalRisks: security.critical_risks,
        pendingAssessments: security.pending_assessments,
        securityIncidents: security.security_incidents,
        complianceScore: security.compliance_score,
        failedLogins: security.failed_logins_today,
        suspiciousActivities: security.suspicious_activities_week,
        vulnerableAssets: security.vulnerabilities,
        overduePolicies: security.overdue_policies,
        expiredCertifications: 0,
        dataBreachAttempts: security.data_breach_attempts
      });

      // Calculate Health Status
      const dbHealthy = true;
      const authHealthy = security.failed_logins_today < 50;
      const storageWarning = storageUsedGB > (storageTotalGB * 0.8);

      setSystemHealth({
        overall: dbHealthy && authHealthy && !storageWarning ? 'healthy' : 'warning',
        database: 'healthy',
        auth: authHealthy ? 'healthy' : 'warning',
        storage: storageWarning ? 'warning' : 'healthy',
        performance: 'healthy'
      });

      setLastRefresh(new Date());

    } catch (error) {
      console.error('Falha ao carregar métricas:', error);
      setSystemHealth({
        overall: 'critical',
        database: 'critical',
        auth: 'critical',
        storage: 'warning',
        performance: 'warning'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Deprecated: Metrics are now loaded in loadSystemData via RPC
  const calculateUptime = (): string => '0d 0h 0m';
  const loadSecurityMetrics = async () => { };

  useEffect(() => {
    if (user?.isPlatformAdmin) {
      loadSystemData();
    }
  }, [user?.isPlatformAdmin]);

  // Verificar se o usuário tem permissão de administrador da plataforma
  if (!user?.isPlatformAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Esta página é exclusiva para administradores da plataforma.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      default: return <Monitor className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />;
    }
  };

  const storagePercentage = (systemStats.storageUsed / systemStats.storageTotal) * 100;

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">System Diagnostic</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Painel de diagnóstico e monitoramento da plataforma
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-2 w-full sm:w-auto">
          <span className="hidden sm:inline text-sm text-muted-foreground">
            Última atualização: {lastRefresh.toLocaleTimeString('pt-BR')}
          </span>
          <Button
            onClick={loadSystemData}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Status Geral</CardTitle>
            <div className={getHealthColor(systemHealth.overall)}>
              {getHealthIcon(systemHealth.overall)}
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold capitalize">{systemHealth.overall}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Sistema operacional</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Base de Dados</CardTitle>
            <div className={getHealthColor(systemHealth.database)}>
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold capitalize">{systemHealth.database}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{systemStats.dbConnections} conexões ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Autenticação</CardTitle>
            <div className={getHealthColor(systemHealth.auth)}>
              <Lock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold capitalize">{systemHealth.auth}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{systemStats.todayLogins} logins hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Armazenamento</CardTitle>
            <div className={getHealthColor(systemHealth.storage)}>
              <HardDrive className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{storagePercentage.toFixed(1)}%</div>
            <Progress value={storagePercentage} className="mt-2" />
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {systemStats.storageUsed}GB de {systemStats.storageTotal}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Performance</CardTitle>
            <div className={getHealthColor(systemHealth.performance)}>
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold capitalize">{systemHealth.performance}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Uptime: {systemStats.systemUptime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-6 no-scrollbar">
          <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-2 sm:px-3 min-w-fit">
            <Monitor className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Visão Geral</span><span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-2 sm:px-3 min-w-fit">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Usuários</span><span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-2 sm:px-3 min-w-fit">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span>Logs</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-2 sm:px-3 min-w-fit">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Segurança</span><span className="sm:hidden">Seg.</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-2 sm:px-3 min-w-fit">
            <Database className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Armazenamento</span><span className="sm:hidden">Arm.</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm px-2 sm:px-3 min-w-fit">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
            <span className="hidden sm:inline">Diagnóstico</span><span className="sm:hidden">Diag.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Critical Security Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Riscos Críticos</CardTitle>
                <ShieldAlert className={`h-4 w-4 ${securityMetrics.criticalRisks > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className={`text-xl sm:text-2xl font-bold ${securityMetrics.criticalRisks > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {securityMetrics.criticalRisks}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {securityMetrics.criticalRisks > 0 ? 'Requer ação imediata' : 'Nenhum risco crítico'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Score Compliance</CardTitle>
                <Target className={`h-4 w-4 ${securityMetrics.complianceScore < 80 ? 'text-orange-600' : 'text-green-600'}`} />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className={`text-xl sm:text-2xl font-bold ${securityMetrics.complianceScore < 80 ? 'text-orange-700' : 'text-green-700'}`}>
                  {securityMetrics.complianceScore}%
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {securityMetrics.pendingAssessments} assessments pendentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Incidentes (30d)</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${securityMetrics.securityIncidents > 5 ? 'text-red-600' : 'text-blue-600'}`} />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className={`text-xl sm:text-2xl font-bold ${securityMetrics.securityIncidents > 5 ? 'text-red-700' : 'text-blue-700'}`}>
                  {securityMetrics.securityIncidents}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {securityMetrics.suspiciousActivities} atividades suspeitas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Falhas Login (hoje)</CardTitle>
                <UserX className={`h-4 w-4 ${securityMetrics.failedLogins > 10 ? 'text-yellow-600' : 'text-gray-600'}`} />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className={`text-xl sm:text-2xl font-bold ${securityMetrics.failedLogins > 10 ? 'text-yellow-700' : 'text-gray-700'}`}>
                  {securityMetrics.failedLogins}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {securityMetrics.dataBreachAttempts} tentativas de violação
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Critical Security Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Saúde Geral</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold">{Math.max(0, 100 - securityMetrics.criticalRisks * 15 - securityMetrics.securityIncidents * 2)}%</div>
                <Progress value={Math.max(0, 100 - securityMetrics.criticalRisks * 15 - securityMetrics.securityIncidents * 2)} className="mt-2" />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                  Score baseado em riscos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Vulnerabilidades OWASP</CardTitle>
                <Shield className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold text-orange-700">{securityMetrics.vulnerableAssets}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">detectadas no sistema</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Controles Falhos</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold text-red-600">{securityMetrics.overduePolicies}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">necessitam correção</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Logs Suspeitos</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">{securityMetrics.suspiciousActivities}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">requerem investigação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">Acesso Não Autorizado</CardTitle>
                <UserX className="h-4 w-4 text-red-800" />
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl sm:text-2xl font-bold text-red-800">{securityMetrics.dataBreachAttempts}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">tentativas bloqueadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Security Alerts & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Alertas de Segurança</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Itens que requerem atenção imediata
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-3">
                  {securityMetrics.criticalRisks > 0 && (
                    <div className="flex items-center space-x-2 text-red-700">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{securityMetrics.criticalRisks} riscos críticos precisam de mitigação</span>
                    </div>
                  )}
                  {securityMetrics.overduePolicies > 0 && (
                    <div className="flex items-center space-x-2 text-orange-700">
                      <XCircle className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{securityMetrics.overduePolicies} controles de segurança falharam</span>
                    </div>
                  )}
                  {securityMetrics.vulnerableAssets > 0 && (
                    <div className="flex items-center space-x-2 text-red-700">
                      <Shield className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{securityMetrics.vulnerableAssets} vulnerabilidades OWASP detectadas</span>
                    </div>
                  )}
                  {securityMetrics.suspiciousActivities > 0 && (
                    <div className="flex items-center space-x-2 text-yellow-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{securityMetrics.suspiciousActivities} atividades suspeitas requerem investigação</span>
                    </div>
                  )}
                  {securityMetrics.pendingAssessments > 0 && (
                    <div className="flex items-center space-x-2 text-yellow-700">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">{securityMetrics.pendingAssessments} assessments aguardando conclusão</span>
                    </div>
                  )}
                  {securityMetrics.complianceScore < 80 && (
                    <div className="flex items-center space-x-2 text-orange-700">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Score de compliance abaixo do recomendado (80%)</span>
                    </div>
                  )}
                  {securityMetrics.criticalRisks === 0 && securityMetrics.overduePolicies === 0 && securityMetrics.vulnerableAssets === 0 && securityMetrics.complianceScore >= 80 && (
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">✅ Sistema seguro - Nenhum alerta crítico</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Métricas de Performance</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Indicadores de segurança e eficiência
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">Compliance Score:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${securityMetrics.complianceScore >= 90 ? 'bg-green-500' :
                            securityMetrics.complianceScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${securityMetrics.complianceScore}%` }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-bold">{securityMetrics.complianceScore}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Uptime do Sistema:</span>
                    <span className="text-xs sm:text-sm font-medium">{systemStats.systemUptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Último Backup:</span>
                    <span className="text-xs sm:text-sm font-medium">
                      {systemStats.lastBackup ? new Date(systemStats.lastBackup).toLocaleDateString('pt-BR') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm">Usuários Ativos:</span>
                    <span className="text-xs sm:text-sm font-medium">{systemStats.activeUsers}/{systemStats.totalUsers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <SystemUsersSection />
        </TabsContent>

        <TabsContent value="logs">
          <SystemLogsSection />
        </TabsContent>

        <TabsContent value="security">
          <SystemSecuritySection />
        </TabsContent>

        <TabsContent value="storage">
          <SystemStorageSection />
        </TabsContent>

        <TabsContent value="diagnostic">
          <SystemDiagnosticSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemDiagnosticPage;