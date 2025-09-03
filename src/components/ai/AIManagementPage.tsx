import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
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
import { useAuth} from '@/contexts/AuthContextOptimized';
import { Navigate } from 'react-router-dom';
import { AIConfigurationSection } from './sections/AIConfigurationSection';
import { AIProvidersSection } from './sections/AIProvidersSection';
import { AIPromptsSection } from './sections/AIPromptsSection';
import { AIWorkflowsSection } from './sections/AIWorkflowsSection';
import { AIUsageStatsSection } from './sections/AIUsageStatsSection';
import { AISecuritySection } from './sections/AISecuritySection';

interface AIProvider {
  id: string;
  name: string;
  provider_type: string;
  model_name: string;
  is_active: boolean;
  is_primary: boolean;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  tokens_used_today: number;
  cost_usd_today: number;
}

interface AIPromptTemplate {
  id: string;
  name: string;
  is_active: boolean;
  category: string;
}

interface AIWorkflow {
  id: string;
  name: string;
  is_active: boolean;
  status: string;
}

interface AIUsageLog {
  id: string;
  created_at: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
}

export const AIManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário é platform admin
  if (!user?.isPlatformAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Carregar todos os dados da IA
  const loadAIData = async () => {
    try {
      // Carregar provedores
      const { data: providersData, error: providersError } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', user?.tenantId)
        .order('priority', { ascending: true });

      if (providersError) throw providersError;
      setProviders(providersData || []);

      // Carregar prompts (globais e do usuário)
      const { data: promptsData, error: promptsError } = await supabase
        .from('ai_grc_prompt_templates')
        .select('id, name, is_active, category')
        .order('created_at', { ascending: false });

      if (promptsError) {
        console.warn('Erro ao carregar prompts:', promptsError);
        // Não falhar se prompts não existirem
      } else {
        console.log('Prompts carregados:', promptsData?.length || 0);
        setPrompts(promptsData || []);
      }

      // Carregar workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('ai_workflows')
        .select('id, name, is_active, status')
        .eq('tenant_id', user?.tenantId)
        .order('created_at', { ascending: false });

      if (workflowsError) {
        console.warn('Erro ao carregar workflows:', workflowsError);
        // Não falhar se workflows não existirem
      } else {
        console.log('Workflows carregados:', workflowsData?.length || 0);
        setWorkflows(workflowsData || []);
      }

      // Carregar logs de uso (hoje)
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData, error: usageError } = await supabase
        .from('ai_usage_logs')
        .select('id, created_at, tokens_input, tokens_output, cost_usd')
        .eq('tenant_id', user?.tenantId)
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      if (usageError) {
        console.warn('Erro ao carregar logs de uso:', usageError);
        // Não falhar se logs não existirem
      } else {
        console.log('Usage logs carregados:', usageData?.length || 0);
        setUsageLogs(usageData || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados da IA:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenantId) {
      loadAIData();
    }
  }, [user?.tenantId]);

  // Calcular estatísticas reais
  const activeProviders = providers.filter(p => p.is_active);
  const activePrompts = prompts.filter(p => p.is_active);
  const activeWorkflows = workflows.filter(w => w.is_active && w.status === 'active');
  
  // Estatísticas de uso - usar dados reais dos logs
  const totalRequestsFromProviders = providers.reduce((sum, p) => sum + (p.total_requests || 0), 0);
  const totalRequestsFromLogs = usageLogs.length; // Cada log representa uma requisição
  const totalTokensFromProviders = providers.reduce((sum, p) => sum + (p.tokens_used_today || 0), 0);
  const totalTokensFromLogs = usageLogs.reduce((sum, log) => sum + ((log.tokens_input || 0) + (log.tokens_output || 0)), 0);
  const totalCostFromProviders = providers.reduce((sum, p) => sum + (p.cost_usd_today || 0), 0);
  const totalCostFromLogs = usageLogs.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
  
  // Usar dados dos logs que são mais precisos e atualizados em tempo real
  const totalRequests = totalRequestsFromLogs; // Usar logs como fonte da verdade
  const totalTokens = totalTokensFromLogs; // Usar logs como fonte da verdade
  const totalCost = totalCostFromLogs; // Usar logs como fonte da verdade
  
  // Debug logs
  console.log('Estatísticas calculadas:', {
    providers: providers.length,
    activeProviders: activeProviders.length,
    prompts: prompts.length,
    activePrompts: activePrompts.length,
    workflows: workflows.length,
    activeWorkflows: activeWorkflows.length,
    usageLogs: usageLogs.length,
    totalRequestsFromProviders,
    totalRequestsFromLogs,
    totalRequests,
    totalTokensFromProviders,
    totalTokensFromLogs,
    totalTokens,
    totalCostFromProviders,
    totalCostFromLogs,
    totalCost
  });
  
  const getProviderNames = () => {
    if (activeProviders.length === 0) return 'Nenhum ativo';
    if (activeProviders.length <= 3) {
      return activeProviders.map(p => {
        switch(p.provider_type) {
          case 'glm': return 'GLM';
          case 'claude': return 'Claude';
          case 'openai': return 'OpenAI';
          case 'azure-openai': return 'Azure';
          default: return p.provider_type;
        }
      }).join(', ');
    }
    return `${activeProviders.length} provedores`;
  };

  const statsCards = [
    {
      title: 'Provedores Ativos',
      value: activeProviders.length.toString(),
      description: getProviderNames(),
      icon: Cpu,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'Prompts Personalizados',
      value: activePrompts.length.toString(),
      description: `${prompts.length} total | ${activePrompts.length} ativos`,
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Workflows Ativos',
      value: activeWorkflows.length.toString(),
      description: `${workflows.length} total | ${activeWorkflows.length} em execução`,
      icon: Workflow,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Requisições Hoje',
      value: totalRequests.toString(),
      description: `${usageLogs.length} logs | Tokens: ${totalTokens.toLocaleString()} | Custo: ${totalCost.toFixed(2)}`,
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

          {/* Métricas de Performance */}
          {(totalRequests > 0 || usageLogs.length > 0) && (
            <Card className="grc-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <span>Métricas de Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalRequests}</p>
                    <p className="text-muted-foreground">Requisições</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalTokens.toLocaleString()}</p>
                    <p className="text-muted-foreground">Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</p>
                    <p className="text-muted-foreground">Custo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{usageLogs.length}</p>
                    <p className="text-muted-foreground">Logs Hoje</p>
                  </div>
                </div>
                
                {providers.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Taxa de Sucesso por Provedor</h4>
                    <div className="space-y-2">
                      {providers.map(provider => {
                        const successRate = provider.total_requests > 0 
                          ? Math.round((provider.successful_requests / provider.total_requests) * 100)
                          : 0;
                        return (
                          <div key={provider.id} className="flex items-center justify-between text-sm">
                            <span>{provider.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    successRate >= 95 ? 'bg-green-500' :
                                    successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${successRate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium">{successRate}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : providers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Cpu className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum provedor configurado</p>
                  </div>
                ) : (
                  providers.map((provider) => {
                    const getProviderIcon = (type: string) => {
                      switch (type) {
                        case 'glm': return '🎆';
                        case 'claude': return '🤖';
                        case 'openai': return '🧠';
                        case 'azure-openai': return '☁️';
                        default: return '⚙️';
                      }
                    };
                    
                    const getStatusColor = () => {
                      if (!provider.is_active) return 'bg-gray-50 dark:bg-gray-950';
                      if (provider.failed_requests > provider.successful_requests * 0.1) return 'bg-red-50 dark:bg-red-950';
                      return 'bg-green-50 dark:bg-green-950';
                    };
                    
                    const getStatusDotColor = () => {
                      if (!provider.is_active) return 'bg-gray-500';
                      if (provider.failed_requests > provider.successful_requests * 0.1) return 'bg-red-500';
                      return 'bg-green-500';
                    };
                    
                    const getStatusText = () => {
                      if (!provider.is_active) return 'Inativo';
                      if (provider.failed_requests > provider.successful_requests * 0.1) return 'Com Problemas';
                      return 'Ativo';
                    };
                    
                    const getStatusBadgeClass = () => {
                      if (!provider.is_active) return 'bg-gray-100 text-gray-800';
                      if (provider.failed_requests > provider.successful_requests * 0.1) return 'bg-red-100 text-red-800';
                      return 'bg-green-100 text-green-800';
                    };
                    
                    return (
                      <div key={provider.id} className={`flex items-center justify-between p-3 rounded-lg ${getStatusColor()}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusDotColor()}`}></div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getProviderIcon(provider.provider_type)}</span>
                            <div>
                              <span className="font-medium">{provider.name}</span>
                              {provider.is_primary && (
                                <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800">
                                  Principal
                                </Badge>
                              )}
                              <p className="text-xs text-muted-foreground">{provider.model_name}</p>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className={getStatusBadgeClass()}>
                          {getStatusText()}
                        </Badge>
                      </div>
                    );
                  })
                )}
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
                  <div>
                    <span className="text-sm font-medium">Criptografia de API Keys</span>
                    <p className="text-xs text-muted-foreground">Chaves armazenadas com criptografia</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Isolamento por Tenant</span>
                    <p className="text-xs text-muted-foreground">RLS ativo para separação de dados</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Log de Auditoria</span>
                    <p className="text-xs text-muted-foreground">{usageLogs.length} registros hoje</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativa
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Validação de Conexão</span>
                    <p className="text-xs text-muted-foreground">Teste de conectividade disponível</p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Disponível
                  </Badge>
                </div>
                
                {/* Estatísticas de segurança */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Estatísticas de Segurança</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium">{providers.length}</p>
                      <p className="text-muted-foreground">Provedores Configurados</p>
                    </div>
                    <div>
                      <p className="font-medium">{activeProviders.length}</p>
                      <p className="text-muted-foreground">Provedores Ativos</p>
                    </div>
                    <div>
                      <p className="font-medium">{user?.tenantId ? '1' : '0'}</p>
                      <p className="text-muted-foreground">Tenant Isolado</p>
                    </div>
                    <div>
                      <p className="font-medium">{providers.filter(p => p.api_key_encrypted).length}</p>
                      <p className="text-muted-foreground">Chaves Criptografadas</p>
                    </div>
                  </div>
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