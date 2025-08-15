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
  Globe
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

interface IntegrationStatus {
  id: string;
  name: string;
  type: 'api' | 'email' | 'sso' | 'webhook' | 'backup' | 'mcp';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
  errorMessage?: string;
}

export const GeneralSettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIntegrationsStatus();
  }, []);

  const loadIntegrationsStatus = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento do status das integrações
      // Em produção, isso viria de uma API
      const mockIntegrations: IntegrationStatus[] = [
        {
          id: 'slack-api',
          name: 'Slack API',
          type: 'api',
          status: 'connected',
          lastSync: new Date().toISOString()
        },
        {
          id: 'email-service',
          name: 'Serviço de E-mail',
          type: 'email',
          status: 'disconnected'
        },
        {
          id: 'sso-azure',
          name: 'Azure AD SSO',
          type: 'sso',
          status: 'pending'
        },
        {
          id: 'mcp-claude',
          name: 'Claude MCP',
          type: 'mcp',
          status: 'connected',
          lastSync: new Date().toISOString()
        }
      ];
      
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Erro ao carregar status das integrações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
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

  const getStatusBadge = (status: string) => {
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
            onClick={loadIntegrationsStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Status
          </Button>
          <Button size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Documentação
          </Button>
        </div>
      </div>

      {/* Alert de Informação */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertTitle>Centro de Integrações</AlertTitle>
        <AlertDescription>
          Configure e gerencie todas as integrações externas da plataforma GRC. 
          Cada integração pode ser testada individualmente e monitorada em tempo real.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
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
            isLoading={isLoading}
            onRefresh={loadIntegrationsStatus}
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
              {integrations.slice(0, 5).map((integration) => (
                <div key={integration.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <p className="font-medium text-sm">{integration.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {integration.lastSync 
                          ? `Última sincronização: ${new Date(integration.lastSync).toLocaleString('pt-BR')}`
                          : 'Nunca sincronizado'
                        }
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

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
    </div>
  );
};

export default GeneralSettingsPage;