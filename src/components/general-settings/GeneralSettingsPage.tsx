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
  Palette
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
import DocumentationModal from './DocumentationModal';
import CryptoFieldMappingConfig from '../admin/CryptoFieldMappingConfig';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { cn } from '@/lib/utils';
import type { IntegrationStatus as IntegrationStatusType } from '@/types/general-settings';


export const GeneralSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  
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
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
            Configurações Gerais
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Integre a plataforma com serviços externos e amplie suas funcionalidades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAll}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
          <Button size="sm" onClick={() => setIsDocumentationOpen(true)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Documentação
          </Button>
        </div>
      </div>

      {/* Alert de Informação ou Erro */}
      {error ? (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar integrações</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <Info className="h-4 w-4" />
          <AlertTitle>Centro de Integrações</AlertTitle>
          <AlertDescription>
            Configure e gerencie todas as integrações externas da plataforma GRC. 
            Cada integração pode ser testada individualmente e monitorada em tempo real.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={cn(
          "grid w-full",
          (user?.isPlatformAdmin || user?.role === 'admin') 
            ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-10" 
            : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"
        )}>
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
          {(user?.isPlatformAdmin || user?.role === 'admin') && (
            <TabsTrigger value="global-rules" className="text-xs sm:text-sm flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Regras Globais
            </TabsTrigger>
          )}
          {(user?.isPlatformAdmin || user?.role === 'admin') && (
            <TabsTrigger value="static-colors" className="text-xs sm:text-sm flex items-center gap-1">
              <Palette className="h-3 w-3" />
              APP Color
            </TabsTrigger>
          )}
          {(user?.isPlatformAdmin || user?.role === 'admin') && (
            <TabsTrigger value="crypto-mapping" className="text-xs sm:text-sm flex items-center gap-1">
              <Key className="h-3 w-3" />
              Mapeamento Cripto
            </TabsTrigger>
          )}
          <TabsTrigger value="apis" className="text-xs sm:text-sm">APIs</TabsTrigger>
          <TabsTrigger value="mcp" className="text-xs sm:text-sm">MCP</TabsTrigger>
          <TabsTrigger value="email" className="text-xs sm:text-sm">E-mail</TabsTrigger>
          <TabsTrigger value="sso" className="text-xs sm:text-sm">SSO</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs sm:text-sm">Webhooks</TabsTrigger>
          <TabsTrigger value="backup" className="text-xs sm:text-sm">Backup</TabsTrigger>
        </TabsList>

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

          {/* Categories Grid */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Categorias de Integração</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrationCategories.map((category) => (
                <Card 
                  key={category.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setActiveTab(category.id)}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-${category.color}-100 dark:bg-${category.color}-900/20`}>
                        <category.icon className={`h-5 w-5 text-${category.color}-600 dark:text-${category.color}-400`} />
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                    <CardTitle className="text-base">{category.title}</CardTitle>
                    <CardDescription className="text-sm">{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
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

        {/* Global Rules Tab - Only for Platform Admins or System Admins */}
        {(user?.isPlatformAdmin || user?.role === 'admin') && (
          <TabsContent value="global-rules">
            <GlobalRulesSection />
          </TabsContent>
        )}

        {/* Static Colors Tab - Only for Platform Admins or System Admins */}
        {(user?.isPlatformAdmin || user?.role === 'admin') && (
          <TabsContent value="static-colors">
            <StaticColorController />
          </TabsContent>
        )}

        {/* Crypto Field Mapping Tab - Only for Platform Admins or System Admins */}
        {(user?.isPlatformAdmin || user?.role === 'admin') && (
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