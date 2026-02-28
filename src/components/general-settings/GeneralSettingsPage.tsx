import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Plug,
  Mail,
  Shield,
  Webhook,
  Cloud,
  Activity,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Info,
  Zap,
  Database,
  Key,
  Globe,
  Crown,
  Palette,
  Grid3x3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import APIIntegrationsSection from './sections/APIIntegrationsSection';
import MCPConfigurationSection from './sections/MCPConfigurationSection';
import EmailServiceSection from './sections/EmailServiceSection';
import SSOConfigurationSection from './sections/SSOConfigurationSection';
import WebhooksSection from './sections/WebhooksSection';
import BackupSyncSection from './sections/BackupSyncSection';
import IntegrationsStatusDashboard from './sections/IntegrationsStatusDashboard';
import GlobalRulesSection from './sections/GlobalRulesSection';
import { StaticColorController } from './sections/StaticColorController';
// import RiskMatrixConfigSection from './sections/RiskMatrixConfigSection'; // REMOVIDO - matriz deve ficar apenas em tenant-settings
import DocumentationModal from './DocumentationModal';
import CryptoFieldMappingConfig from '../admin/CryptoFieldMappingConfig';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { cn } from '@/lib/utils';
import type { IntegrationStatus as IntegrationStatusType } from '@/types/general-settings';


export const GeneralSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);

  // Debug: Log quando o componente é renderizado
  console.log('🏗️ GeneralSettingsPage renderizado!', {
    activeTab,
    user: user ? { id: user.id, tenantId: user.tenantId } : null,
    timestamp: new Date().toISOString(),
    url: window.location.pathname
  });

  // Usar hook real para carregar dados
  const {
    integrations,
    stats,
    recentLogs,
    isLoading,
    error,
    refreshAll,
    updateIntegrationStatus,
    testConnection
  } = useGeneralSettings();


  const getStatusIcon = (status: IntegrationStatusType) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatusType) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Conectado</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Erro</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white border-yellow-600">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Desconectado</Badge>;
    }
  };

  // Calcular categorias baseadas nos dados reais
  const integrationCategories = [
    {
      id: 'apis',
      title: 'Integrações de APIs',
      description: 'Conecte com serviços externos via APIs REST e GraphQL',
      icon: Plug,
      count: integrations.filter(i => i.type === 'api').length,
      color: 'blue'
    },
    {
      id: 'mcp',
      title: 'Model Context Protocol (MCP)',
      description: 'Configuração avançada de contexto para IA',
      icon: Zap,
      count: integrations.filter(i => i.type === 'mcp').length,
      color: 'purple'
    },
    {
      id: 'email',
      title: 'Serviços de E-mail',
      description: 'SMTP, SendGrid, AWS SES e outros provedores',
      icon: Mail,
      count: integrations.filter(i => i.type === 'email').length,
      color: 'green'
    },
    {
      id: 'sso',
      title: 'Single Sign-On (SSO)',
      description: 'Azure AD, Google, SAML 2.0 e OAuth 2.0',
      icon: Shield,
      count: integrations.filter(i => i.type === 'sso').length,
      color: 'orange'
    },
    {
      id: 'webhooks',
      title: 'Webhooks',
      description: 'Notificações em tempo real para sistemas externos',
      icon: Webhook,
      count: integrations.filter(i => i.type === 'webhook').length,
      color: 'indigo'
    },
    {
      id: 'backup',
      title: 'Backup & Sincronização',
      description: 'AWS S3, Google Drive, Azure Blob Storage',
      icon: Cloud,
      count: integrations.filter(i => i.type === 'backup').length,
      color: 'cyan'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header - Identical to IncidentManagementPage */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-2 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
            Configurações Gerais
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Integre a plataforma com serviços externos e amplie suas funcionalidades.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end sm:justify-start gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAll}
            disabled={isLoading}
            className="h-9 flex-1 sm:flex-none border-gray-200 dark:border-gray-800"
          >
            <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs sm:text-sm whitespace-nowrap">Atualizar Status</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsDocumentationOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 h-9 flex-1 sm:flex-none"
          >
            <ExternalLink className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm whitespace-nowrap">Documentação</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
      }} className="space-y-6">
        <div className="overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:w-full bg-muted/50 p-1 h-10 sm:h-11">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">Visão Geral</TabsTrigger>
            <TabsTrigger value="risk-matrix" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1">
              <Grid3x3 className="h-3 w-3" />
              Matriz
            </TabsTrigger>
            {(user?.isPlatformAdmin || user?.roles?.includes('admin')) && (
              <TabsTrigger value="global-rules" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Regras Globais
              </TabsTrigger>
            )}
            {(user?.isPlatformAdmin || user?.roles?.includes('admin')) && (
              <TabsTrigger value="static-colors" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1">
                <Palette className="h-3 w-3" />
                APP Color
              </TabsTrigger>
            )}
            {(user?.isPlatformAdmin || user?.roles?.includes('admin')) && (
              <TabsTrigger value="crypto-mapping" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1">
                <Key className="h-3 w-3" />
                Cripto
              </TabsTrigger>
            )}
            <TabsTrigger value="apis" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">APIs</TabsTrigger>
            <TabsTrigger value="mcp" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">MCP</TabsTrigger>
            <TabsTrigger value="email" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">E-mail</TabsTrigger>
            <TabsTrigger value="sso" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">SSO</TabsTrigger>
            <TabsTrigger value="webhooks" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">Webhooks</TabsTrigger>
            <TabsTrigger value="backup" className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">Backup</TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <IntegrationsStatusDashboard
            integrations={integrations}
            stats={stats}
            recentLogs={recentLogs}
            isLoading={isLoading}
            onRefresh={refreshAll}
            onTestConnection={testConnection}
          />

          {/* Categories Grid - Optimized for Mobile Width */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Categorias de Integração</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {integrationCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group bg-secondary"
                  onClick={() => setActiveTab(category.id)}
                >
                  <CardHeader className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg bg-${category.color}-100 dark:bg-${category.color}-900/20`}>
                        <category.icon className={`h-4 w-4 text-${category.color}-600 dark:text-${category.color}-400`} />
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">{category.count}</Badge>
                    </div>
                    <CardTitle className="text-sm sm:text-base font-bold truncate">{category.title}</CardTitle>
                    <CardDescription className="text-[11px] leading-tight line-clamp-2 mt-1 sm:text-sm">{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma atividade recente registrada
                </p>
              ) : (
                recentLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      {log.level === 'error' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{log.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={log.level === 'error' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {log.log_type}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Matrix Tab */}
        <TabsContent value="risk-matrix">
          <div className="space-y-6">
            <div className="p-4 bg-green-100 border-2 border-green-500 rounded">
              <h2 className="text-xl font-bold text-green-800">🎯 ABA MATRIZ RENDERIZADA!</h2>
              <p className="text-green-700">Se você está vendo isso, a aba está funcionando!</p>
            </div>
            <div className="flex items-center gap-3">
              <Grid3x3 className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Configuração da Matriz de Risco</h2>
                <p className="text-sm text-muted-foreground">
                  Configure a matriz de risco padrão da sua organização (4x4 ou 5x5)
                </p>
              </div>
            </div>
            {/* REMOVIDO: RiskMatrixConfigSection - matriz deve ficar apenas em tenant-settings */}
          </div>
        </TabsContent>

        {/* Global Rules Tab - Only for Platform Admins or System Admins */}
        {(user?.isPlatformAdmin || user?.roles?.includes('admin')) && (
          <TabsContent value="global-rules">
            <GlobalRulesSection />
          </TabsContent>
        )}

        {/* Static Colors Tab - Only for Platform Admins or System Admins */}
        {(user?.isPlatformAdmin || user?.roles?.includes('admin')) && (
          <TabsContent value="static-colors">
            <StaticColorController />
          </TabsContent>
        )}

        {/* Crypto Field Mapping Tab - Only for Platform Admins or System Admins */}
        {(user?.isPlatformAdmin || user?.roles?.includes('admin')) && (
          <TabsContent value="crypto-mapping">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Key className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Mapeamento de Campos Criptográficos</h2>
                  <p className="text-sm text-muted-foreground">
                    Configure globalmente quais campos usam quais chaves de criptografia para todos os tenants
                  </p>
                </div>
              </div>
              <Separator />
              <CryptoFieldMappingConfig />
            </div>
          </TabsContent>
        )}

        {/* API Integrations Tab */}
        <TabsContent value="apis">
          <APIIntegrationsSection />
        </TabsContent>

        {/* MCP Configuration Tab */}
        <TabsContent value="mcp">
          <MCPConfigurationSection />
        </TabsContent>

        {/* Email Service Tab */}
        <TabsContent value="email">
          <EmailServiceSection />
        </TabsContent>

        {/* SSO Configuration Tab */}
        <TabsContent value="sso">
          <SSOConfigurationSection />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <WebhooksSection />
        </TabsContent>

        {/* Backup & Sync Tab */}
        <TabsContent value="backup">
          <BackupSyncSection />
        </TabsContent>
      </Tabs>

      {/* Documentation Modal */}
      <DocumentationModal
        isOpen={isDocumentationOpen}
        onClose={() => setIsDocumentationOpen(false)}
      />
    </div>
  );
};

export default GeneralSettingsPage;