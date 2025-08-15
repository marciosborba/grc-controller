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
import DocumentationModal from './DocumentationModal';
import { useGeneralSettings } from '@/hooks/useGeneralSettings';
import type { IntegrationStatus as IntegrationStatusType } from '@/types/general-settings';


export const GeneralSettingsPage = () => {
  const navigate = useNavigate();
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="apis" className="text-xs sm:text-sm">APIs</TabsTrigger>
          <TabsTrigger value="mcp" className="text-xs sm:text-sm">MCP</TabsTrigger>
          <TabsTrigger value="email" className="text-xs sm:text-sm">E-mail</TabsTrigger>
          <TabsTrigger value="sso" className="text-xs sm:text-sm">SSO</TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs sm:text-sm">Webhooks</TabsTrigger>
          <TabsTrigger value="backup" className="text-xs sm:text-sm">Backup</TabsTrigger>
          <TabsTrigger value="global-config" className="text-xs sm:text-sm">Conf. Globais</TabsTrigger>
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

        {/* Global Configuration Tab */}
        <TabsContent value="global-config">
          <div className="space-y-6">
            {/* Platform Appearance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações Globais da Plataforma
                </CardTitle>
                <CardDescription>
                  Configure a aparência, cores, fontes e opções globais da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Paleta de Cores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cor Primária</label>
                      <div className="flex items-center gap-2">
                        <input type="color" defaultValue="#3b82f6" className="w-12 h-10 rounded border" />
                        <input type="text" defaultValue="#3b82f6" className="flex-1 px-3 py-2 border rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cor Secundária</label>
                      <div className="flex items-center gap-2">
                        <input type="color" defaultValue="#6b7280" className="w-12 h-10 rounded border" />
                        <input type="text" defaultValue="#6b7280" className="flex-1 px-3 py-2 border rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cor de Sucesso</label>
                      <div className="flex items-center gap-2">
                        <input type="color" defaultValue="#10b981" className="w-12 h-10 rounded border" />
                        <input type="text" defaultValue="#10b981" className="flex-1 px-3 py-2 border rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cor de Aviso</label>
                      <div className="flex items-center gap-2">
                        <input type="color" defaultValue="#f59e0b" className="w-12 h-10 rounded border" />
                        <input type="text" defaultValue="#f59e0b" className="flex-1 px-3 py-2 border rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cor de Erro</label>
                      <div className="flex items-center gap-2">
                        <input type="color" defaultValue="#ef4444" className="w-12 h-10 rounded border" />
                        <input type="text" defaultValue="#ef4444" className="flex-1 px-3 py-2 border rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cor de Fundo</label>
                      <div className="flex items-center gap-2">
                        <input type="color" defaultValue="#ffffff" className="w-12 h-10 rounded border" />
                        <input type="text" defaultValue="#ffffff" className="flex-1 px-3 py-2 border rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Typography Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tipografia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fonte Principal</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="open-sans">Open Sans</option>
                        <option value="lato">Lato</option>
                        <option value="poppins">Poppins</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fonte de Títulos</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="playfair">Playfair Display</option>
                        <option value="montserrat">Montserrat</option>
                        <option value="source-serif">Source Serif Pro</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tamanho Base (px)</label>
                      <input type="number" defaultValue="16" min="12" max="24" className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Altura da Linha</label>
                      <input type="number" step="0.1" defaultValue="1.5" min="1.0" max="2.0" className="w-full px-3 py-2 border rounded-md" />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Button Styles */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Estilos de Botões</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bordas dos Botões</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option value="rounded-none">Quadrado</option>
                        <option value="rounded-sm">Pequeno</option>
                        <option value="rounded-md">Médio</option>
                        <option value="rounded-lg">Grande</option>
                        <option value="rounded-full">Circular</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tamanho Padrão</label>
                      <select className="w-full px-3 py-2 border rounded-md">
                        <option value="sm">Pequeno</option>
                        <option value="md">Médio</option>
                        <option value="lg">Grande</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dropdown Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Opções de Dropdowns</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Níveis de Risco</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="text" defaultValue="Baixo" className="flex-1 px-3 py-2 border rounded-md" />
                          <input type="color" defaultValue="#10b981" className="w-12 h-10 rounded border" />
                          <Button variant="outline" size="sm">Remover</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="text" defaultValue="Médio" className="flex-1 px-3 py-2 border rounded-md" />
                          <input type="color" defaultValue="#f59e0b" className="w-12 h-10 rounded border" />
                          <Button variant="outline" size="sm">Remover</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="text" defaultValue="Alto" className="flex-1 px-3 py-2 border rounded-md" />
                          <input type="color" defaultValue="#ef4444" className="w-12 h-10 rounded border" />
                          <Button variant="outline" size="sm">Remover</Button>
                        </div>
                        <Button variant="outline" size="sm">Adicionar Nível</Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Status de Compliance</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="text" defaultValue="Conforme" className="flex-1 px-3 py-2 border rounded-md" />
                          <input type="color" defaultValue="#10b981" className="w-12 h-10 rounded border" />
                          <Button variant="outline" size="sm">Remover</Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="text" defaultValue="Não Conforme" className="flex-1 px-3 py-2 border rounded-md" />
                          <input type="color" defaultValue="#ef4444" className="w-12 h-10 rounded border" />
                          <Button variant="outline" size="sm">Remover</Button>
                        </div>
                        <Button variant="outline" size="sm">Adicionar Status</Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Departamentos</label>
                      <div className="mt-2 space-y-2">
                        {['TI', 'Jurídico', 'RH', 'Financeiro', 'Operações'].map((dept, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input type="text" defaultValue={dept} className="flex-1 px-3 py-2 border rounded-md" />
                            <Button variant="outline" size="sm">Remover</Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm">Adicionar Departamento</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Resetar Padrões</Button>
                  <Button variant="outline">Pré-visualizar</Button>
                  <Button>Salvar Configurações</Button>
                </div>
              </CardContent>
            </Card>
          </div>
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