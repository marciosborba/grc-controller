import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Select components removidos - não mais necessários
import {
  Settings,
  Users,
  Shield,
  Key,
  Mail,
  Globe,
  Activity,
  Database,
  Download,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Server,
  Zap,
  Bell,
  Crown,
  Building2,
  ArrowRight
  // Rocket, Edit, Loader2 removidos junto com o Enhanced Designer
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { defaultSecuritySettings, calculateSecurityScore } from '@/utils/security-score';

// Enhanced Modal removido junto com o módulo Assessment
// const AlexProcessDesignerEnhancedModal = React.lazy(() => import('../assessments/alex/AlexProcessDesignerEnhancedModal'));

// Importar seções
import { UserManagementSection } from './sections/UserManagementSection';
import { GroupManagementSection } from './sections/GroupManagementSection';
import { SecurityConfigSection } from './sections/SecurityConfigSection';
import { RiskMatrixConfigSection } from './sections/RiskMatrixConfigSection';
import { SsoConfigSection } from './sections/SSOConfigSection';
import { ApiTokensSection } from './sections/ApiTokensSection';
import { DataManagementSection } from './sections/DataManagementSection';
// import { MFAConfigSection } from './sections/MFAConfigSection';
// import { EmailDomainSection } from './sections/EmailDomainSection';
// import { ImpossibleTravelSection } from './sections/ImpossibleTravelSection';
// import { SessionManagementSection } from './sections/SessionManagementSection';
import { ActivityLogsSection } from './sections/ActivityLogsSection';
// import { BackupDataSection } from './sections/BackupDataSection';
// import { DataExportSection } from './sections/DataExportSection';
import { EncryptionConfigSection } from './sections/EncryptionConfigSection';
import { CryptoKeysSection } from './sections/CryptoKeysSection';
import { AISettingsTab } from './tabs/AISettingsTab';


// Componentes compartilhados removidos temporariamente

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
  suspiciousActivities: number;
}

// Interface movida para TenantSelectorContext

const TenantSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [metrics, setMetrics] = useState<SettingsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados do Enhanced Modal removidos junto com o módulo Assessment
  // const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  // const [enhancedModalMode, setEnhancedModalMode] = useState<'create' | 'edit'>('create');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Usar contexto global de seleção de tenant
  const {
    selectedTenantId,
    isGlobalTenantSelection
  } = useTenantSelector();

  // Verificar permissões
  const isPlatformAdmin = user?.isPlatformAdmin || user?.roles?.includes('platform_admin');
  const isTenantAdmin = user?.roles?.includes('tenant_admin') || user?.roles?.includes('admin');
  const hasAccess = isPlatformAdmin || isTenantAdmin;

  // Debug de permissões removido para evitar erros

  // O contexto já gerencia isso automaticamente
  const currentTenantId = selectedTenantId;

  // O contexto global já carrega os tenants automaticamente

  useEffect(() => {
    if (currentTenantId) {
      loadTenantInfo(currentTenantId);
      loadMetrics(currentTenantId);
    }
  }, [currentTenantId]);

  // Função removida - agora gerenciada pelo TenantSelectorContext

  const loadTenantInfo = async (tenantId: string) => {
    if (!tenantId) return;

    try {
      setIsLoading(true);

      // Buscar informações reais da tenant no banco
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

      // Montar informações da tenant com dados reais
      const realTenantInfo: TenantInfo = {
        id: tenantData.id,
        name: tenantData.name,
        slug: tenantData.slug || 'org',
        subscription_plan: tenantData.subscription_plan || 'basic',
        max_users: tenantData.max_users || 10,
        current_users: tenantData.current_users_count || 0,
        created_at: tenantData.created_at || new Date().toISOString(),
        settings: {
          security_level: (tenantData.settings?.security_level as 'basic' | 'standard' | 'advanced') || 'standard',
          features_enabled: Array.isArray(tenantData.settings?.features_enabled) ? tenantData.settings.features_enabled : ['audit_logs'],
          compliance_frameworks: Array.isArray(tenantData.settings?.compliance_frameworks) ? tenantData.settings.compliance_frameworks : []
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


      // Carregar dados reais do banco de dados
      const promises = [
        // 1. Contar usuários totais e ativos (agora incluindo is_active na query)
        supabase
          .from('profiles')
          .select('id, user_id, created_at, is_active')
          .eq('tenant_id', tenantId),

        // 2. Contar atividades suspeitas (activity_logs com ações de segurança)
        supabase
          .from('activity_logs')
          .select('id')
          .eq('tenant_id', tenantId)
          .in('action', ['failed_login', 'suspicious_activity', 'security_violation'])
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

        // 3. Buscar último backup (activity_logs com ação de backup)
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

        // 5. Contar sessões ativas (activity_logs de login nas últimas 24h)
        supabase
          .from('activity_logs')
          .select('user_id')
          .eq('tenant_id', tenantId)
          .eq('action', 'login')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

        // 6. Buscar estatísticas reais de armazenamento
        supabase.rpc('get_tenant_storage_stats', { p_tenant_id: tenantId }),

        // 7. Buscar configurações de segurança (MFA, Logs)
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

      // Processar resultados
      // Total = todos os perfis vinculados ao tenant
      const totalUsers = usersResult.data?.length || 0;

      // Ativos = apenas perfis com is_active = true
      // Type assertion needed because Promise.all returns union type
      const activeUsers = (usersResult.data as any[])?.filter(u => u.is_active).length || 0;

      // Métricas: total = usuários ativos, activeUsers = usuários ativos (mesmo valor)

      const suspiciousActivities = suspiciousResult.data?.length || 0;
      const lastBackup = (backupResult.data?.[0] as any)?.created_at || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const frameworksCount = frameworksResult.data?.length || 0;

      // Contar sessões únicas (por user_id)
      const uniqueUserSessions = new Set(sessionsResult.data?.map(s => s.user_id) || []);
      const activeSessions = uniqueUserSessions.size;

      // Processar Storage (RPC retorna total_size_mb)
      const storageStats = storageResult.data as any;
      // Se storageResult.data for array ou objeto direto
      const totalSizeMB = (storageStats?.total_size_mb || storageStats?.[0]?.total_size_mb) || 0;
      const totalSizeGB = totalSizeMB / 1024;

      // Obter configurações de segurança
      const fetchedSettings = settingsResult.data?.settings?.security || {};

      // Defaults para evitar crash e garantir consistência com SecurityConfigSection
      const securitySettings = {
        passwordPolicy: {
          ...defaultSecuritySettings.passwordPolicy,
          ...fetchedSettings.passwordPolicy
        },
        sessionSecurity: {
          ...defaultSecuritySettings.sessionSecurity,
          ...fetchedSettings.sessionSecurity
        },
        accessControl: {
          ...defaultSecuritySettings.accessControl,
          ...fetchedSettings.accessControl
        },
        monitoring: {
          ...defaultSecuritySettings.monitoring,
          ...fetchedSettings.monitoring
        }
      };

      // Calcular score de segurança DETALHADO usando a utility
      const securityScore = calculateSecurityScore(securitySettings);

      const realMetrics: SettingsMetrics = {
        totalUsers,
        activeUsers,
        pendingInvitations: 0, // TODO: Implementar convites quando houver tabela
        securityScore,
        lastBackup,
        // Usar valor real, mantendo precisão para formatação no front
        storageUsed: totalSizeGB,
        storageLimit: 10, // GB - padrão
        activeSessions,
        suspiciousActivities
      };


      setMetrics(realMetrics);

      // Atualizar também o current_users no tenantInfo para manter consistência
      if (tenantInfo) {
        setTenantInfo(prev => prev ? {
          ...prev,
          current_users: totalUsers
        } : prev);
      }
    } catch (error) {

      // Fallback com dados mínimos em caso de erro
      const fallbackMetrics: SettingsMetrics = {
        totalUsers: 0,
        activeUsers: 0,
        pendingInvitations: 0,
        securityScore: 50,
        lastBackup: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        storageUsed: 0,
        storageLimit: 10,
        activeSessions: 0,
        suspiciousActivities: 0
      };

      setMetrics(fallbackMetrics);
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

  if (isLoading) {
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
            {isPlatformAdmin && (
              <Crown className="h-6 w-6 text-orange-500" />
            )}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            {isPlatformAdmin
              ? 'Gerencie configurações de todas as organizações da plataforma'
              : 'Gerencie todas as configurações e políticas da sua organização'
            }
          </p>


          {/* Info da Tenant */}
          {tenantInfo && (
            <div className="flex items-center space-x-4 text-sm mt-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-green-600 font-medium">{tenantInfo.name}</span>
              </div>
              <Badge
                variant="secondary"
                className="text-xs bg-muted text-muted-foreground border-muted-foreground/20"
              >
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

        {/* Botão "Salvar Alterações" removido - não tinha funcionalidade */}
      </div>

      {/* Métricas Rápidas */}
      {/* Premium Storytelling Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1: Security Score Storytelling */}
          <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
            <div className={`absolute top-0 right-0 p-3 opacity-10`}>
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
                {metrics.securityScore >= 80
                  ? 'Sua organização está seguindo as melhores práticas de segurança.'
                  : `Sugerimos ativar mais recursos (como MFA e Logs) para atingir 100%.`}
              </p>
              <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${metrics.securityScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                {metrics.securityScore >= 80 ? 'Ambiente Protegido' : 'Requer Atenção'}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Users (Reliable Data) */}
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

          {/* Card 3: Active Sessions */}
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
                <h3 className="text-3xl font-bold text-foreground">{metrics.activeSessions}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Dispositivos conectados
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Storage Usage */}
          <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Database className="h-24 w-24 text-orange-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-foreground">
                Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {metrics.storageUsed < 1
                    ? (metrics.storageUsed * 1024).toFixed(2)
                    : metrics.storageUsed.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {metrics.storageUsed < 1 ? 'MB utilizados' : 'GB utilizados'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Limite do plano: {metrics.storageLimit} GB
              </p>
              <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min((metrics.storageUsed / metrics.storageLimit) * 100, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
      }

      {/* Alertas de Segurança */}
      {
        metrics && metrics.suspiciousActivities > 0 && (
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Atenção:</strong> {String(metrics.suspiciousActivities)} atividade(s) suspeita(s) detectada(s) nas últimas 24 horas.
              <Button variant="link" className="p-0 h-auto ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300">
                Ver detalhes
              </Button>
            </AlertDescription>
          </Alert>
        )
      }

      {/* Tabs de Configuração */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full h-auto flex flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Grupos
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="risk-matrix" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            Matriz
          </TabsTrigger>
          <TabsTrigger value="sso" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Key className="h-3.5 w-3.5 mr-1.5" />
            SSO
          </TabsTrigger>
          <TabsTrigger value="data" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Database className="h-3.5 w-3.5 mr-1.5" />
            Dados
          </TabsTrigger>
          <TabsTrigger value="encryption" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Lock className="h-3.5 w-3.5 mr-1.5" />
            Criptografia
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="api-tokens" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Key className="h-3.5 w-3.5 mr-1.5" />
            API
          </TabsTrigger>
          <TabsTrigger value="ai-config" className="flex-1 min-w-fit data-[state=active]:bg-background px-3 py-1.5 text-xs">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            IA
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Premium Navigation Cards */}
            <Card
              className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-blue-500"
              onClick={() => setActiveTab('users')}
            >
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
                <p className="text-muted-foreground mb-4">
                  Adicione novos membros, gerencie permissões baseadas em função e controle convites pendentes.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                    Gerenciar Acessos <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    {metrics?.totalUsers || 0} ativos
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-green-500"
              onClick={() => setActiveTab('security')}
            >
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
                <p className="text-muted-foreground mb-4">
                  Configure autenticação Multi-Fator (MFA), políticas de senha e restrições de IP.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-green-600 group-hover:translate-x-1 transition-transform">
                    Ver Configurações <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    Score: {metrics?.securityScore || 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card
              className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-purple-500"
              onClick={() => setActiveTab('data')}
            >
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
                <p className="text-muted-foreground mb-4">
                  Gerencie o armazenamento, agende backups automáticos e solicite exportação de dados.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-purple-600 group-hover:translate-x-1 transition-transform">
                    Gerenciar Dados <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                    {metrics?.storageUsed || 0}GB usado
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status da Organização */}
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
                    {(metrics?.storageUsed || 0) < 1
                      ? `${((metrics?.storageUsed || 0) * 1024).toFixed(2)}MB`
                      : `${(metrics?.storageUsed || 0).toFixed(2)}GB`}
                  </div>
                  <div className="text-sm text-muted-foreground">Armazenamento Usado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder para outras tabs - COMENTADOS PARA DEBUG */}
        {/* Gerenciamento de Usuários */}
        <TabsContent value="users">
          <UserManagementSection
            tenantId={currentTenantId}
            onMetricsUpdate={(userMetrics) => {
              if (metrics) {
                setMetrics(prev => prev ? {
                  ...prev,
                  totalUsers: userMetrics.totalUsers,
                  activeUsers: userMetrics.activeUsers
                } : prev);
              }

              // Atualizar também o tenantInfo para manter consistência
              if (tenantInfo) {
                setTenantInfo(prev => prev ? {
                  ...prev,
                  current_users: userMetrics.totalUsers
                } : prev);
              }
            }}
          />
        </TabsContent>

        {/* Gerenciamento de Grupos */}
        <TabsContent value="groups">
          <GroupManagementSection tenantId={currentTenantId} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityConfigSection
            tenantId={currentTenantId}
            onSettingsChange={() => {
              if (currentTenantId) {
                loadTenantInfo(currentTenantId);
                toast.success("Segurança atualizada");
              }
            }}
          />
        </TabsContent>

        <TabsContent value="risk-matrix">
          {/* console.log('🎯 RENDERIZANDO ABA MATRIZ DE RISCO NO TENANT SETTINGS!') */}
          <RiskMatrixConfigSection
            tenantId={currentTenantId}
            onSettingsChange={() => {
              console.log('🎯 Configurações da matriz de risco alteradas');
              setHasUnsavedChanges(true);
            }}
          />
        </TabsContent>



        <TabsContent value="sso">
          <SsoConfigSection tenantId={currentTenantId} />
        </TabsContent>

        <TabsContent value="data">
          <DataManagementSection tenantId={currentTenantId} />
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <EncryptionConfigSection
            tenantId={currentTenantId}
            onSettingsChange={() => {
              if (currentTenantId) {
                toast.success("Configurações de criptografia atualizadas");
              }
            }}
          />
          <CryptoKeysSection
            tenantId={currentTenantId}
            onSettingsChange={() => {
              // Refresh logic if needed
            }}
          />
        </TabsContent>

        <TabsContent value="logs">
          <ActivityLogsSection tenantId={currentTenantId} />
        </TabsContent>

        <TabsContent value="api-tokens">
          <ApiTokensSection />
        </TabsContent>

        <TabsContent value="ai-config">
          <AISettingsTab tenantId={currentTenantId} />
        </TabsContent>

        {/* Aba Enhanced Designer removida junto com o módulo Assessment */}
      </Tabs>

      {/* Modal do Enhanced Designer removido junto com o módulo Assessment */}
    </div >
  );
};

export { TenantSettingsPage };
export default TenantSettingsPage;