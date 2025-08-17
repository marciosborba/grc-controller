import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Settings,
  Cpu,
  MessageSquare,
  Workflow,
  BarChart3,
  Plus,
  Zap,
  Database,
  Lock,
  Globe,
  Shield as ShieldIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AIConfigurationSection } from './sections/AIConfigurationSection';
import { AIProvidersSection } from './sections/AIProvidersSection';
import { AIPromptsSection } from './sections/AIPromptsSection';
import { AIWorkflowsSection } from './sections/AIWorkflowsSection';
import { AIUsageStatsSection } from './sections/AIUsageStatsSection';
import { AISecuritySection } from './sections/AISecuritySection';

export const AIManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Verificar se o usuário é platform admin
  if (!user?.isPlatformAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const statsCards = [
    {
      title: 'Provedores Ativos',
      value: '3',
      description: 'Claude, OpenAI, Custom',
      icon: Cpu,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Prompts Personalizados',
      value: '12',
      description: 'Templates por módulo',
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Workflows Ativos',
      value: '5',
      description: 'Automatizações em execução',
      icon: Workflow,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Requisições Hoje',
      value: '234',
      description: 'Tokens consumidos: 45.2K',
      icon: BarChart3,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950'
    }
  ];

  const quickActions = [
    {
      title: 'Configurar Novo Provedor',
      description: 'Adicionar Claude, OpenAI, ou provedor customizado',
      icon: Plus,
      action: () => setActiveTab('providers'),
      color: 'text-blue-500'
    },
    {
      title: 'Criar Template de Prompt',
      description: 'Criar prompt especializado para módulos GRC',
      icon: MessageSquare,
      action: () => setActiveTab('prompts'),
      color: 'text-purple-500'
    },
    {
      title: 'Configurar Workflow',
      description: 'Automatizar análises e relatórios com IA',
      icon: Zap,
      action: () => setActiveTab('workflows'),
      color: 'text-green-500'
    },
    {
      title: 'Ver Estatísticas',
      description: 'Monitorar uso, custos e performance',
      icon: BarChart3,
      action: () => setActiveTab('usage'),
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Gestão de IA
              </h1>
              <p className="text-sm text-muted-foreground">
                Configuração e gerenciamento de assistentes IA especializados em GRC
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <ShieldIcon className="h-3 w-3 mr-1" />
            Platform Admin
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Globe className="h-3 w-3 mr-1" />
            Sistema Ativo
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Lock className="h-3 w-3 mr-1" />
            Seguro
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-fit">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center space-x-2">
            <Cpu className="h-4 w-4" />
            <span className="hidden sm:inline">Provedores</span>
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Prompts</span>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center space-x-2">
            <Workflow className="h-4 w-4" />
            <span className="hidden sm:inline">Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Uso</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat) => (
              <Card key={stat.title} className="grc-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="grc-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <div
                    key={action.title}
                    className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={action.action}
                  >
                    <div className="p-2 bg-muted rounded-lg">
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{action.title}</h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="grc-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-blue-500" />
                  <span>Status dos Provedores</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Claude 3.5 Sonnet</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">OpenAI GPT-4</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Standby
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="font-medium">Custom Model</span>
                  </div>
                  <Badge variant="outline">
                    Inativo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="grc-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-green-500" />
                  <span>Segurança e Conformidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Filtragem de Conteúdo</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Detecção de PII</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Log de Auditoria</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Aprovação para Sensível</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativa
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration">
          <AIConfigurationSection />
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <AIProvidersSection />
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts">
          <AIPromptsSection />
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <AIWorkflowsSection />
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <AIUsageStatsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};