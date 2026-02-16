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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Settings className="h-8 w-8 text-primary" />
            <span>Configurações da Organização</span>
            {isPlatformAdmin && <Crown className="h-6 w-6 text-orange-500" />}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            {isPlatformAdmin ? 'Gerencie configurações de todas as organizações da plataforma' : 'Gerencie todas as configurações e políticas da sua organização'}
          </p>

          {tenantInfo && (
            <div className="flex items-center space-x-4 text-sm mt-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-green-600 font-medium">{tenantInfo.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-muted-foreground/20">
                {tenantInfo.subscription_plan}
              </Badge>
              <span className="text-muted-foreground">
                {String(metrics?.totalUsers || 0)}/{String(tenantInfo.max_users)} usuários
              </span>
              {isPlatformAdmin && (
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs border border-orange-200 dark:border-orange-700">
                  <Crown className="h-3 w-3 mr-1" />
                  Modo Super Admin
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Security Score */}
          <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              {metrics.securityScore >= 80 ? <Shield className="h-24 w-24" /> : <AlertTriangle className="h-24 w-24" />}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg font-bold flex items-center gap-2 ${metrics.securityScore >= 80 ? 'text-emerald-500' : 'text-orange-500'}`}>
                {metrics.securityScore >= 80 ? 'Alta Segurança' : 'Melhorias Possíveis'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-3xl font-bold ${metrics.securityScore >= 80 ? 'text-emerald-600' : 'text-orange-600'}`}>{metrics.securityScore}%</span>
                <span className="text-sm text-muted-foreground">de proteção</span>
              </div>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                {metrics.securityScore >= 80 ? 'Sua organização está seguindo as melhores práticas de segurança.' : 'Sugerimos ativar mais recursos (como MFA e Logs) para atingir 100%.'}
              </p>
              <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${metrics.securityScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                {metrics.securityScore >= 80 ? 'Ambiente Protegido' : 'Requer Atenção'}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Users */}
          <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="h-24 w-24 text-blue-500" />
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Usuários Totais</p>
                <h3 className="text-3xl font-bold text-foreground">{metrics.totalUsers}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.activeUsers} credenciais ativas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Active Sessions with Tooltip */}
          <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="h-24 w-24 text-purple-500" />
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessões Ativas</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-bold text-foreground">{metrics.activeSessions}</h3>
                  {metrics.activeUsersList.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help p-1 hover:bg-muted rounded-full transition-colors">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="font-semibold mb-1">Usuários Ativos:</p>
                          <ul className="text-xs space-y-1 list-disc pl-4">
                            {metrics.activeUsersList.map((user, i) => (
                              <li key={i}>{user}</li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Usuários ativos (24h)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Storage */}
          <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Database className="h-24 w-24 text-orange-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">Armazenamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {metrics.storageUsed < 1 ? (metrics.storageUsed * 1024).toFixed(2) : metrics.storageUsed.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {metrics.storageUsed < 1 ? 'MB utilizados' : 'GB utilizados'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Limite do plano: {metrics.storageLimit} GB</p>
              <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min((metrics.storageUsed / metrics.storageLimit) * 100, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {metrics && metrics.suspiciousActivities > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <strong>Atenção:</strong> {String(metrics.suspiciousActivities)} atividade(s) suspeita(s) detectada(s) nas últimas 24 horas.
            <Button variant="link" className="p-0 h-auto ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
              Ver detalhes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Eye className="h-3.5 w-3.5 mr-1.5" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Grupos
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Shield className="h-3.5 w-3.5 mr-1.5" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="risk-matrix" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Activity className="h-3.5 w-3.5 mr-1.5" /> Matriz
          </TabsTrigger>
          <TabsTrigger value="sso" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Key className="h-3.5 w-3.5 mr-1.5" /> SSO
          </TabsTrigger>
          <TabsTrigger value="data" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Database className="h-3.5 w-3.5 mr-1.5" /> Dados
          </TabsTrigger>
          <TabsTrigger value="encryption" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Lock className="h-3.5 w-3.5 mr-1.5" /> Criptografia
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <FileText className="h-3.5 w-3.5 mr-1.5" /> Logs
          </TabsTrigger>
          <TabsTrigger value="api-tokens" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Key className="h-3.5 w-3.5 mr-1.5" /> API
          </TabsTrigger>
          <TabsTrigger value="ai-config" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 mr-1.5" /> IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-blue-500" onClick={() => setActiveTab('users')}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="h-24 w-24 text-blue-500" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  Gerenciar Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Adicione novos membros, gerencie permissões baseadas em função e controle convites pendentes.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                    Gerenciar Acessos <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">{metrics?.totalUsers || 0} ativos</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-green-500" onClick={() => setActiveTab('security')}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="h-24 w-24 text-green-500" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  Políticas de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Configure autenticação Multi-Fator (MFA), políticas de senha e restrições de IP.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-green-600 group-hover:translate-x-1 transition-transform">
                    Ver Configurações <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">Score: {metrics?.securityScore || 0}%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-purple-500" onClick={() => setActiveTab('data')}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database className="h-24 w-24 text-purple-500" />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  Dados e Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Gerencie o armazenamento, agende backups automáticos e solicite exportação de dados.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-purple-600 group-hover:translate-x-1 transition-transform">
                    Gerenciar Dados <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">{metrics?.storageUsed || 0}GB usado</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Status da Organização</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{String(metrics?.activeUsers || 0)}</div>
                  <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{String(metrics?.activeSessions || 0)}</div>
                  <div className="text-sm text-muted-foreground">Sessões Ativas</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{String(metrics?.securityScore || 0)}%</div>
                  <div className="text-sm text-muted-foreground">Score de Segurança</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {(metrics?.storageUsed || 0) < 1 ? `${((metrics?.storageUsed || 0) * 1024).toFixed(2)}MB` : `${(metrics?.storageUsed || 0).toFixed(2)}GB`}
                  </div>
                  <div className="text-sm text-muted-foreground">Armazenamento Usado</div>
                </div>
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