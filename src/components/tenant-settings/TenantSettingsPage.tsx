import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Settings,
  Users,
  Shield,
  Key,
  Activity,
  Database,
  Lock,
  Eye,
  FileText,
  Zap,
  Crown,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { defaultSecuritySettings, calculateSecurityScore } from '@/utils/security-score';

import { UserManagementSection } from './sections/UserManagementSection';
import { GroupManagementSection } from './sections/GroupManagementSection';
import { SecurityConfigSection } from './sections/SecurityConfigSection';
import { RiskMatrixConfigSection } from './sections/RiskMatrixConfigSection';
import { SsoConfigSection } from './sections/SSOConfigSection';
import { ApiTokensSection } from './sections/ApiTokensSection';
import { DataManagementSection } from './sections/DataManagementSection';
import { ActivityLogsSection } from './sections/ActivityLogsSection';
import { EncryptionConfigSection } from './sections/EncryptionConfigSection';
import { CryptoKeysSection } from './sections/CryptoKeysSection';
import { AISettingsTab } from './tabs/AISettingsTab';

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  subscription_plan: string;
  max_users: number;
  current_users: number;
  created_at: string;
  settings: {
    security_level: 'basic' | 'standard' | 'advanced';
    features_enabled: string[];
    compliance_frameworks: string[];
  };
}

interface SettingsMetrics {
  totalUsers: number;
  activeUsers: number;
  pendingInvitations: number;
  securityScore: number;
  lastBackup: string;
  storageUsed: number;
  storageLimit: number;
  activeSessions: number;
  activeUsersList: string[]; // List of active user names/emails
  suspiciousActivities: number;
}

const TenantSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [metrics, setMetrics] = useState<SettingsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { selectedTenantId } = useTenantSelector();

  const isPlatformAdmin = user?.isPlatformAdmin || user?.roles?.includes('platform_admin');
  const isTenantAdmin = user?.roles?.includes('tenant_admin') || user?.roles?.includes('admin');
  const hasAccess = isPlatformAdmin || isTenantAdmin;

  useEffect(() => {
    if (selectedTenantId) {
      loadTenantInfo(selectedTenantId);
      loadMetrics(selectedTenantId);
    }
  }, [selectedTenantId]);

  const loadTenantInfo = async (tenantId: string) => {
    if (!tenantId) return;

    try {
      setIsLoading(true);

      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name, slug, subscription_plan, max_users, current_users_count, created_at, settings')
        .eq('id', tenantId)
        .single();

      if (tenantError) {
        toast.error('Erro ao carregar informações da organização');
        return;
      }

      if (!tenantData) {
        toast.error('Tenant não encontrada');
        return;
      }

      const realTenantInfo: TenantInfo = {
        id: tenantData.id,
        name: tenantData.name,
        slug: tenantData.slug || 'org',
        subscription_plan: tenantData.subscription_plan || 'basic',
        max_users: tenantData.max_users || 10,
        current_users: tenantData.current_users_count || 0,
        created_at: tenantData.created_at || new Date().toISOString(),
        settings: {
          security_level: (tenantData.settings as any)?.security_level || 'standard',
          features_enabled: Array.isArray((tenantData.settings as any)?.features_enabled) ? (tenantData.settings as any).features_enabled : ['audit_logs'],
          compliance_frameworks: Array.isArray((tenantData.settings as any)?.compliance_frameworks) ? (tenantData.settings as any).compliance_frameworks : []
        }
      };

      setTenantInfo(realTenantInfo);
    } catch (error) {
      toast.error('Erro ao carregar configurações da organização');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async (tenantId: string) => {
    if (!tenantId) return;

    try {
      const promises = [
        // 1. Contar usuários totais e ativos
        supabase
          .from('profiles')
          .select('id, user_id, created_at, is_active')
          .eq('tenant_id', tenantId),

        // 2. Contar atividades suspeitas
        supabase
          .from('activity_logs')
          .select('id')
          .eq('tenant_id', tenantId)
          .in('action', ['failed_login', 'suspicious_activity', 'security_violation'])
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

        // 3. Buscar último backup
        supabase
          .from('activity_logs')
          .select('created_at')
          .eq('tenant_id', tenantId)
          .eq('action', 'backup_created')
          .order('created_at', { ascending: false })
          .limit(1),

        // 4. Contar frameworks de compliance
        supabase
          .from('compliance_frameworks')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('is_active', true),

        // 5. Contar sessões ativas (activity_logs recentes)
        supabase
          .from('activity_logs')
          .select('user_id')
          .eq('tenant_id', tenantId)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .limit(100),

        // 6. Buscar estatísticas reais de armazenamento
        supabase.rpc('get_tenant_storage_stats', { p_tenant_id: tenantId }),

        // 7. Buscar configurações de segurança
        supabase
          .from('tenants')
          .select('settings')
          .eq('id', tenantId)
          .single()
      ];

      const [
        usersResult,
        suspiciousResult,
        backupResult,
        frameworksResult,
        sessionsResult,
        storageResult,
        settingsResult
      ] = await Promise.all(promises);

      const totalUsers = usersResult.data?.length || 0;
      const activeUsers = (usersResult.data as any[])?.filter(u => u.is_active).length || 0;
      const suspiciousActivities = suspiciousResult.data?.length || 0;
      const lastBackup = (backupResult.data?.[0] as any)?.created_at || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Contar sessões únicas e buscar nomes
      // Robust filtering removing null/undefined IDs
      const uniqueUserSessions = [...new Set(
        sessionsResult.data
          ?.map(s => s.user_id)
          .filter((id): id is string => !!id && typeof id === 'string') || []
      )];

      const activeSessions = uniqueUserSessions.length;

      let activeUsersList: string[] = [];

      if (uniqueUserSessions.length > 0) {
        try {
          const { data: activeProfiles, error: profilesError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .in('user_id', uniqueUserSessions);

          if (profilesError) {
            console.error('Error fetching active profiles:', profilesError);
          } else if (activeProfiles) {
            activeUsersList = activeProfiles.map(p => {
              const name = p.full_name || 'Usuário';
              const email = p.email ? `(${p.email})` : '';
              return `${name} ${email}`.trim();
            });
          }
        } catch (err) {
          console.error('Failed to fetch profiles:', err);
        }
      }

      // Storage
      const storageStats = storageResult.data as any;
      const totalSizeMB = (storageStats?.total_size_mb || storageStats?.[0]?.total_size_mb) || 0;
      const totalSizeGB = totalSizeMB / 1024;

      // Security Settings & Score
      const fetchedSettings = settingsResult.data?.settings?.security || {};
      const securitySettings = {
        passwordPolicy: { ...defaultSecuritySettings.passwordPolicy, ...fetchedSettings.passwordPolicy },
        sessionSecurity: { ...defaultSecuritySettings.sessionSecurity, ...fetchedSettings.sessionSecurity },
        accessControl: { ...defaultSecuritySettings.accessControl, ...fetchedSettings.accessControl },
        monitoring: { ...defaultSecuritySettings.monitoring, ...fetchedSettings.monitoring }
      };
      const securityScore = calculateSecurityScore(securitySettings);

      setMetrics({
        totalUsers,
        activeUsers,
        pendingInvitations: 0,
        securityScore,
        lastBackup,
        storageUsed: totalSizeGB,
        storageLimit: 10,
        activeSessions,
        activeUsersList,
        suspiciousActivities
      });

      if (tenantInfo) {
        setTenantInfo(prev => prev ? { ...prev, current_users: totalUsers } : prev);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Fallback handled by initial null state or could set defaults here
    }
  };

  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Settings className="mx-auto h-12 w-12 mb-4" />
            <p>Acesso restrito a administradores da organização ou super administradores.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !tenantInfo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold leading-tight">
            Configurações da Organização
          </h1>
          {isPlatformAdmin && <Crown className="h-4 w-4 text-orange-500 shrink-0" />}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {isPlatformAdmin ? 'Gerencie configurações de todas as organizações da plataforma' : 'Gerencie todas as configurações e políticas da sua organização'}
        </p>

        {tenantInfo && (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs sm:text-sm font-semibold text-green-600">{tenantInfo.name}</span>
            </div>
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5 capitalize">
              {tenantInfo.subscription_plan}
            </Badge>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {String(metrics?.totalUsers || 0)}/{String(tenantInfo.max_users)} usuários
            </span>
            {isPlatformAdmin && (
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 text-[10px] sm:text-xs px-2 py-0.5 border border-orange-200 dark:border-orange-700">
                <Crown className="h-2.5 w-2.5 mr-1" />
                Super Admin
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────── */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Security Score */}
          <div className={`rounded-xl border p-3 sm:p-4 relative overflow-hidden ${metrics.securityScore >= 80 ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10' : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10'}`}>
            <div className="absolute -right-3 -top-3 opacity-[0.07]">
              {metrics.securityScore >= 80 ? <Shield className="h-20 w-20" /> : <AlertTriangle className="h-20 w-20" />}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-1">Score de Segurança</p>
            <p className={`text-xl sm:text-3xl font-bold ${metrics.securityScore >= 80 ? 'text-emerald-600' : 'text-orange-600'}`}>{metrics.securityScore}%</p>
            <div className="mt-2 w-full bg-muted/50 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${metrics.securityScore >= 80 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                style={{ width: `${metrics.securityScore}%` }}
              />
            </div>
            <p className={`text-[10px] sm:text-xs mt-1 font-medium ${metrics.securityScore >= 80 ? 'text-emerald-600' : 'text-orange-600'}`}>
              {metrics.securityScore >= 80 ? 'Protegido' : 'Requer atenção'}
            </p>
          </div>

          {/* Usuários */}
          <div className="rounded-xl border p-3 sm:p-4 relative overflow-hidden bg-card">
            <div className="absolute -right-3 -top-3 opacity-[0.05]"><Users className="h-20 w-20 text-blue-500" /></div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Usuários</p>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-foreground">{metrics.totalUsers}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{metrics.activeUsers} ativos</p>
          </div>

          {/* Sessões */}
          <div className="rounded-xl border p-3 sm:p-4 relative overflow-hidden bg-card">
            <div className="absolute -right-3 -top-3 opacity-[0.05]"><Activity className="h-20 w-20 text-purple-500" /></div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Sessões</p>
            </div>
            <div className="flex items-center gap-1.5">
              <p className="text-xl sm:text-3xl font-bold text-foreground">{metrics.activeSessions}</p>
              {metrics.activeUsersList.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Eye className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[200px]">
                      <p className="font-semibold mb-1 text-xs">Usuários Ativos:</p>
                      <ul className="text-xs space-y-1 list-disc pl-4">
                        {metrics.activeUsersList.map((u, i) => <li key={i}>{u}</li>)}
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Últimas 24h</p>
          </div>

          {/* Armazenamento */}
          <div className="rounded-xl border p-3 sm:p-4 relative overflow-hidden bg-card">
            <div className="absolute -right-3 -top-3 opacity-[0.05]"><Database className="h-20 w-20 text-orange-500" /></div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Database className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Armazenamento</p>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-foreground">
              {metrics.storageUsed < 1
                ? `${(metrics.storageUsed * 1024).toFixed(0)}MB`
                : `${metrics.storageUsed.toFixed(1)}GB`}
            </p>
            <div className="mt-2 w-full bg-muted/50 h-1 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min((metrics.storageUsed / metrics.storageLimit) * 100, 100)}%` }} />
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">de {metrics.storageLimit}GB</p>
          </div>
        </div>
      )}

      {/* ── Alerta ─────────────────────────────────────────────── */}
      {metrics && metrics.suspiciousActivities > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50 py-2">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200 text-xs sm:text-sm">
            <strong>Atenção:</strong> {String(metrics.suspiciousActivities)} atividade(s) suspeita(s) detectada(s) nas últimas 24h.
            <Button variant="link" className="p-0 h-auto ml-2 text-orange-600 dark:text-orange-400 text-xs sm:text-sm">Ver detalhes</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <div className="w-full overflow-x-auto -mx-1 px-1 pb-1">
          <TabsList className="flex w-max min-w-full h-auto bg-muted/50 p-1 gap-0.5">
            {[
              { value: 'overview', icon: Eye, label: 'Visão Geral' },
              { value: 'users', icon: Users, label: 'Usuários' },
              { value: 'groups', icon: Users, label: 'Grupos' },
              { value: 'security', icon: Shield, label: 'Segurança' },
              { value: 'risk-matrix', icon: Activity, label: 'Matriz' },
              { value: 'sso', icon: Key, label: 'SSO' },
              { value: 'data', icon: Database, label: 'Dados' },
              { value: 'encryption', icon: Lock, label: 'Criptografia' },
              { value: 'logs', icon: FileText, label: 'Logs' },
              { value: 'api-tokens', icon: Key, label: 'API' },
              { value: 'ai-config', icon: Zap, label: 'IA' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] sm:text-xs whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-blue-500" onClick={() => setActiveTab('users')}>
              <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity">
                <Users className="h-20 w-20 text-blue-500" />
              </div>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Gerenciar Usuários
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-muted-foreground text-xs sm:text-sm mb-3">Adicione membros, gerencie permissões e controle convites pendentes.</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-xs font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                    Gerenciar Acessos <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{metrics?.totalUsers || 0} ativos</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-green-500" onClick={() => setActiveTab('security')}>
              <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity">
                <Shield className="h-20 w-20 text-green-500" />
              </div>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  Políticas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-muted-foreground text-xs sm:text-sm mb-3">Configure MFA, políticas de senha e restrições de acesso.</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-xs font-medium text-green-600 group-hover:translate-x-1 transition-transform">
                    Ver Configurações <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                  <Badge variant="secondary" className="text-[10px]">Score: {metrics?.securityScore || 0}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-purple-500" onClick={() => setActiveTab('data')}>
              <div className="absolute top-0 right-0 p-4 opacity-[0.07] group-hover:opacity-[0.14] transition-opacity">
                <Database className="h-20 w-20 text-purple-500" />
              </div>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Dados e Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-muted-foreground text-xs sm:text-sm mb-3">Gerencie armazenamento, backups automáticos e exportação.</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-xs font-medium text-purple-600 group-hover:translate-x-1 transition-transform">
                    Gerenciar Dados <ArrowRight className="h-3 w-3 ml-1" />
                  </span>
                  <Badge variant="secondary" className="text-[10px]">{(metrics?.storageUsed || 0).toFixed(1)}GB</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Activity className="h-4 w-4" />
                Status da Organização
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Usuários Ativos', value: String(metrics?.activeUsers || 0), color: 'text-green-600' },
                  { label: 'Sessões Ativas', value: String(metrics?.activeSessions || 0), color: 'text-blue-600' },
                  { label: 'Score Segurança', value: `${metrics?.securityScore || 0}%`, color: 'text-purple-600' },
                  {
                    label: 'Armazenamento', color: 'text-orange-600',
                    value: (metrics?.storageUsed || 0) < 1
                      ? `${((metrics?.storageUsed || 0) * 1024).toFixed(0)}MB`
                      : `${(metrics?.storageUsed || 0).toFixed(1)}GB`
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-3 border rounded-lg bg-muted/20">
                    <div className={`text-lg sm:text-2xl font-bold ${color}`}>{value}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <UserManagementSection
            tenantId={selectedTenantId}
            onMetricsUpdate={(userMetrics) => {
              if (metrics) {
                setMetrics(prev => prev ? { ...prev, totalUsers: userMetrics.totalUsers, activeUsers: userMetrics.activeUsers } : prev);
              }
              if (tenantInfo) {
                setTenantInfo(prev => prev ? { ...prev, current_users: userMetrics.totalUsers } : prev);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="groups">
          <GroupManagementSection tenantId={selectedTenantId} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityConfigSection
            tenantId={selectedTenantId}
            onSettingsChange={() => {
              if (selectedTenantId) {
                loadTenantInfo(selectedTenantId);
                toast.success("Segurança atualizada");
              }
            }}
          />
        </TabsContent>

        <TabsContent value="risk-matrix">
          <RiskMatrixConfigSection
            tenantId={selectedTenantId}
            onSettingsChange={() => {
              setHasUnsavedChanges(true);
            }}
          />
        </TabsContent>

        <TabsContent value="sso">
          <SsoConfigSection tenantId={selectedTenantId} />
        </TabsContent>

        <TabsContent value="data">
          <DataManagementSection tenantId={selectedTenantId} />
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <EncryptionConfigSection
            tenantId={selectedTenantId}
            onSettingsChange={() => {
              if (selectedTenantId) {
                toast.success("Configurações de criptografia atualizadas");
              }
            }}
          />
          <CryptoKeysSection
            tenantId={selectedTenantId}
            onSettingsChange={() => {
              // Refresh logic if needed
            }}
          />
        </TabsContent>

        <TabsContent value="logs">
          <ActivityLogsSection tenantId={selectedTenantId} />
        </TabsContent>

        <TabsContent value="api-tokens">
          <ApiTokensSection />
        </TabsContent>

        <TabsContent value="ai-config">
          <AISettingsTab tenantId={selectedTenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { TenantSettingsPage };
export default TenantSettingsPage;