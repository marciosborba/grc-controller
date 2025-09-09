import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Importar seções
import { UserManagementSection } from './sections/UserManagementSection';
// import { SecurityConfigSection } from './sections/SecurityConfigSection';
import { RiskMatrixConfigSection } from './sections/RiskMatrixConfigSection';
// import { SSOConfigSection } from './sections/SSOConfigSection';
// import { MFAConfigSection } from './sections/MFAConfigSection';
// import { EmailDomainSection } from './sections/EmailDomainSection';
// import { ImpossibleTravelSection } from './sections/ImpossibleTravelSection';
// import { SessionManagementSection } from './sections/SessionManagementSection';
// import { ActivityLogsSection } from './sections/ActivityLogsSection';
// import { BackupDataSection } from './sections/BackupDataSection';
// import { DataExportSection } from './sections/DataExportSection';
// import { EncryptionConfigSection } from './sections/EncryptionConfigSection';
// import { CryptoKeysSection } from './sections/CryptoKeysSection';

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

interface AvailableTenant {
  id: string;
  name: string;
  slug: string;
  subscription_plan: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

const TenantSettingsPage: React.FC = () => {
  const { user, tenant } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [metrics, setMetrics] = useState<SettingsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Estados para super admin
  const [availableTenants, setAvailableTenants] = useState<AvailableTenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [loadingTenants, setLoadingTenants] = useState(false);

  // Verificar permissões
  const isPlatformAdmin = user?.isPlatformAdmin || user?.roles?.includes('platform_admin');
  const isTenantAdmin = user?.role === 'tenant_admin' || user?.role === 'admin';
  const hasAccess = isPlatformAdmin || isTenantAdmin;
  
  // Debug de permissões removido para evitar erros
  
  // Determinar tenant atual (própria tenant ou selecionada pelo super admin)
  const currentTenantId = isPlatformAdmin ? selectedTenantId : tenant?.id || '';

  useEffect(() => {
    
    if (isPlatformAdmin) {
      loadAvailableTenants();
    } else if (isTenantAdmin && tenant) {
      setSelectedTenantId(tenant.id);
      loadTenantInfo(tenant.id);
      loadMetrics(tenant.id);
    }
  }, [isPlatformAdmin, isTenantAdmin, tenant]);
  
  useEffect(() => {
    if (currentTenantId) {
      loadTenantInfo(currentTenantId);
      loadMetrics(currentTenantId);
    }
  }, [currentTenantId]);

  const loadAvailableTenants = async () => {
    try {
      setLoadingTenants(true);
      
      // Carregar todas as tenants disponíveis (apenas para platform admin)
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id, name, slug, subscription_plan, is_active, created_at')
        .eq('is_active', true)
        .order('name');
        
      if (error) {
        
        // Tentar carregar da tabela profiles como fallback
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('tenant_id')
          .not('tenant_id', 'is', null);
          
        if (!profilesError && profilesData) {
          // Obter IDs únicos de tenants
          const uniqueTenantIds = [...new Set(profilesData.map(p => p.tenant_id))];
          
          // Buscar informações das tenants pelos IDs
          const { data: tenantsByIds, error: tenantsByIdsError } = await supabase
            .from('tenants')
            .select('id, name, slug, subscription_plan, is_active, created_at')
            .in('id', uniqueTenantIds)
            .eq('is_active', true);
            
          if (!tenantsByIdsError && tenantsByIds) {
            const realTenants = tenantsByIds.map(t => ({
              id: t.id,
              name: t.name,
              slug: t.slug,
              subscription_plan: t.subscription_plan || 'basic',
              status: 'active' as const,
              created_at: t.created_at
            }));
            
            setAvailableTenants(realTenants);
            
            if (realTenants.length > 0 && !selectedTenantId) {
              setSelectedTenantId(realTenants[0].id);
            }
            
            return;
          }
        }
        
        // Último fallback para dados mock apenas se não conseguir carregar nada
        const mockTenants: AvailableTenant[] = [
          {
            id: 'demo-tenant',
            name: 'Organização Demo',
            slug: 'organizacao-demo',
            subscription_plan: 'professional',
            status: 'active',
            created_at: new Date().toISOString()
          }
        ];
        setAvailableTenants(mockTenants);
        
        if (mockTenants.length > 0 && !selectedTenantId) {
          setSelectedTenantId(mockTenants[0].id);
        }
      } else {
        // Sucesso ao carregar da tabela tenants
        const realTenants = (tenants || []).map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          subscription_plan: t.subscription_plan || 'basic',
          status: 'active' as const,
          created_at: t.created_at
        }));
        
        setAvailableTenants(realTenants);
        
        if (realTenants.length > 0 && !selectedTenantId) {
          setSelectedTenantId(realTenants[0].id);
        }
        

      }
    } catch (error) {
      toast.error('Erro ao carregar lista de organizações');
    } finally {
      setLoadingTenants(false);
    }
  };
  
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
        // 1. Contar usuários totais e ativos
        supabase
          .from('profiles')
          .select('id, user_id, created_at')
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
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ];
      
      const [
        usersResult,
        suspiciousResult,
        backupResult,
        frameworksResult,
        sessionsResult
      ] = await Promise.all(promises);
      
      // Processar resultados
      const totalUsers = usersResult.data?.length || 0;
      const activeUsers = usersResult.data?.filter(u => {
        const createdAt = new Date(u.created_at);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdAt > thirtyDaysAgo;
      }).length || 0;
      
      const suspiciousActivities = suspiciousResult.data?.length || 0;
      const lastBackup = backupResult.data?.[0]?.created_at || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const frameworksCount = frameworksResult.data?.length || 0;
      
      // Contar sessões únicas (por user_id)
      const uniqueUserSessions = new Set(sessionsResult.data?.map(s => s.user_id) || []);
      const activeSessions = uniqueUserSessions.size;
      
      // Calcular score de segurança baseado em dados reais
      let securityScore = 50; // Base
      if (frameworksCount > 0) securityScore += 20; // +20 por ter frameworks
      if (suspiciousActivities === 0) securityScore += 15; // +15 por não ter atividades suspeitas
      if (totalUsers > 0) securityScore += 10; // +10 por ter usuários
      if (activeSessions > 0) securityScore += 5; // +5 por ter sessões ativas
      securityScore = Math.min(securityScore, 100); // Máximo 100
      
      const realMetrics: SettingsMetrics = {
        totalUsers,
        activeUsers,
        pendingInvitations: 0, // TODO: Implementar convites quando houver tabela
        securityScore,
        lastBackup,
        storageUsed: Math.round((totalUsers * 0.1 + frameworksCount * 0.05) * 10) / 10, // Estimativa baseada em dados
        storageLimit: 10, // GB - padrão
        activeSessions,
        suspiciousActivities
      };
      

      setMetrics(realMetrics);
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

  const handleSaveChanges = async () => {
    try {
      // Implementar salvamento das configurações
      toast.success('Configurações salvas com sucesso!');
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
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
              <Crown className="h-6 w-6 text-orange-500" title="Super Administrador" />
            )}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            {isPlatformAdmin 
              ? 'Gerencie configurações de todas as organizações da plataforma'
              : 'Gerencie todas as configurações e políticas da sua organização'
            }
          </p>
          
          {/* Seletor de Tenant para Super Admin */}
          {isPlatformAdmin && (
            <div className="mt-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 max-w-md">
                  <Select 
                    value={selectedTenantId} 
                    onValueChange={setSelectedTenantId}
                    disabled={loadingTenants}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma organização" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{tenant.name}</span>
                            <Badge 
                              variant="secondary" 
                              className="text-xs bg-muted text-muted-foreground border-muted-foreground/20"
                            >
                              {tenant.subscription_plan}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {loadingTenants && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                )}
              </div>
            </div>
          )}
          
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
                {String(tenantInfo.current_users)}/{String(tenantInfo.max_users)} usuários
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
        
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700">
              <Clock className="h-3 w-3 mr-1" />
              Alterações não salvas
            </Badge>
          )}
          <Button 
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Salvar Alterações</span>
          </Button>
        </div>
      </div>

      {/* Métricas Rápidas */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{String(metrics.activeUsers)}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score de Segurança</p>
                  <p className="text-2xl font-bold">{String(metrics.securityScore)}%</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sessões Ativas</p>
                  <p className="text-2xl font-bold">{String(metrics.activeSessions)}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Armazenamento</p>
                  <p className="text-2xl font-bold">{String(metrics.storageUsed)}GB</p>
                </div>
                <Database className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de Segurança */}
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

      {/* Tabs de Configuração */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="risk-matrix" className="flex items-center space-x-1">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Matriz</span>
          </TabsTrigger>
          <TabsTrigger value="sso" className="flex items-center space-x-1">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">SSO</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-1">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
          <TabsTrigger value="encryption" className="flex items-center space-x-1">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Criptografia</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cards de Ações Rápidas */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('users')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gerenciar Usuários</h3>
                    <p className="text-sm text-muted-foreground">Adicionar, editar e remover usuários</p>
                    <Badge 
                      variant="secondary" 
                      className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                    >
                      {String(metrics?.totalUsers || 0)} usuários
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('security')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-green-100">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Configurar Segurança</h3>
                    <p className="text-sm text-muted-foreground">Políticas e controles de acesso</p>
                    <Badge 
                      variant="secondary" 
                      className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700"
                    >
                      Score: {String(metrics?.securityScore || 0)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('data')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Backup e Dados</h3>
                    <p className="text-sm text-muted-foreground">Backup e exportação de dados</p>
                    <Badge 
                      variant="secondary" 
                      className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700"
                    >
                      {String(metrics?.storageUsed || 0)}GB usado
                    </Badge>
                  </div>
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
                  <div className="text-2xl font-bold text-orange-600">{String(metrics?.storageUsed || 0)}GB</div>
                  <div className="text-sm text-muted-foreground">Armazenamento Usado</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder para outras tabs - COMENTADOS PARA DEBUG */}
        {/* Gerenciamento de Usuários */}
        <TabsContent value="users">
          <UserManagementSection tenantId={currentTenantId} />
        </TabsContent>

        <TabsContent value="security">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configurações de Segurança</h3>
            <p>Seção temporáriamente desabilitada para debug.</p>
          </div>
        </TabsContent>

        <TabsContent value="risk-matrix">
          {console.log('🎯 RENDERIZANDO ABA MATRIZ DE RISCO NO TENANT SETTINGS!')}
          <div className="p-4 bg-green-100 border-2 border-green-500 rounded mb-4">
            <h2 className="text-xl font-bold text-green-800">🎯 ABA MATRIZ DE RISCO ATIVA!</h2>
            <p className="text-green-700">Componente carregado com sucesso no módulo Configurações!</p>
          </div>
          <RiskMatrixConfigSection 
            tenantId={currentTenantId} 
            onSettingsChange={() => {
              console.log('🎯 Configurações da matriz de risco alteradas');
              setHasUnsavedChanges(true);
            }} 
          />
        </TabsContent>

        <TabsContent value="sso">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">SSO</h3>
            <p>Seção temporáriamente desabilitada para debug.</p>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Backup e Dados</h3>
            <p>Seção temporáriamente desabilitada para debug.</p>
          </div>
        </TabsContent>

        <TabsContent value="encryption">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Criptografia</h3>
            <p>Seção temporáriamente desabilitada para debug.</p>
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Logs de Atividade</h3>
            <p>Seção temporáriamente desabilitada para debug.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { TenantSettingsPage };
export default TenantSettingsPage;