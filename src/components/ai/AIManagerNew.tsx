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

const AIManagerNew: React.FC = () => {
  console.log('🎆 [AI MANAGER NEW] === COMPONENTE NOVO SENDO CARREGADO ===');
  console.log('🕰️ [AI MANAGER NEW] Timestamp:', new Date().toISOString());
  console.log('🗺️ [AI MANAGER NEW] URL atual:', window.location.pathname);
  console.log('🔍 [AI MANAGER NEW] Componente AIManagerNew iniciando...');
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug: Log dados do usuário
  console.log('🤖 [AI MANAGER NEW] Dados do usuário:', {
    user,
    isPlatformAdmin: user?.isPlatformAdmin,
    roles: user?.roles,
    permissions: user?.permissions,
    tenantId: user?.tenantId
  });

  // Verificar se o usuário é platform admin
  if (!user?.isPlatformAdmin) {
    console.log('❌ [AI MANAGER NEW] Usuário não é Platform Admin, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('✅ [AI MANAGER NEW] Usuário é Platform Admin, carregando componente');

  // Carregar todos os dados da IA
  const loadAIData = async () => {
    try {
      console.log('📊 [AI MANAGER NEW] Iniciando carregamento de dados...');
      
      // Carregar provedores
      const { data: providersData, error: providersError } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', user?.tenantId)
        .order('priority', { ascending: true });

      if (providersError) {
        console.warn('⚠️ [AI MANAGER NEW] Erro ao carregar provedores:', providersError);
      } else {
        console.log('✅ [AI MANAGER NEW] Provedores carregados:', providersData?.length || 0);
        setProviders(providersData || []);
      }

      // Carregar prompts (globais e do usuário)
      const { data: promptsData, error: promptsError } = await supabase
        .from('ai_grc_prompt_templates')
        .select('id, name, is_active, category')
        .order('created_at', { ascending: false });

      if (promptsError) {
        console.warn('⚠️ [AI MANAGER NEW] Erro ao carregar prompts:', promptsError);
      } else {
        console.log('✅ [AI MANAGER NEW] Prompts carregados:', promptsData?.length || 0);
        setPrompts(promptsData || []);
      }

      // Carregar workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('ai_workflows')
        .select('id, name, is_active, status')
        .eq('tenant_id', user?.tenantId)
        .order('created_at', { ascending: false });

      if (workflowsError) {
        console.warn('⚠️ [AI MANAGER NEW] Erro ao carregar workflows:', workflowsError);
      } else {
        console.log('✅ [AI MANAGER NEW] Workflows carregados:', workflowsData?.length || 0);
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
        console.warn('⚠️ [AI MANAGER NEW] Erro ao carregar logs de uso:', usageError);
      } else {
        console.log('✅ [AI MANAGER NEW] Logs de uso carregados:', usageData?.length || 0);
        setUsageLogs(usageData || []);
      }

      console.log('🎉 [AI MANAGER NEW] Carregamento de dados concluído!');
    } catch (error) {
      console.error('❌ [AI MANAGER NEW] Erro inesperado ao carregar dados:', error);
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
  
  // Estatísticas de uso
  const totalRequests = usageLogs.length;
  const totalTokens = usageLogs.reduce((sum, log) => sum + ((log.tokens_input || 0) + (log.tokens_output || 0)), 0);
  const totalCost = usageLogs.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
  
  const statsCards = [
    {
      title: 'Provedores Ativos',
      value: activeProviders.length.toString(),
      description: `${providers.length} total | ${activeProviders.length} ativos`,
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
      description: `${usageLogs.length} logs | Tokens: ${totalTokens.toLocaleString()} | Custo: $${totalCost.toFixed(2)}`,
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
      {console.log('🎨 [AI MANAGER NEW] Renderizando interface...')}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Gestão de IA (Novo)
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
          {console.log('📊 [AI MANAGER NEW] Renderizando tab Overview...')}
          
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
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="configuration">
          {console.log('⚙️ [AI MANAGER NEW] Renderizando tab Configurações...')}
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Configurações</h3>
                <p className="text-muted-foreground">Seção em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          {console.log('🖥️ [AI MANAGER NEW] Renderizando tab Provedores...')}
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Provedores de IA</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Cpu className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Provedores</h3>
                <p className="text-muted-foreground">Seção em desenvolvimento</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {providers.length} provedores configurados | {activeProviders.length} ativos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts">
          {console.log('💬 [AI MANAGER NEW] Renderizando tab Prompts...')}
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Templates de Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-lg font-medium mb-2">Prompts Personalizados</h3>
                <p className="text-muted-foreground">Gerencie templates de prompts especializados para GRC</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {prompts.length} prompts configurados | {activePrompts.length} ativos
                </p>
                <div className="mt-6">
                  <Button className="mr-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Prompt
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Importar Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          {console.log('🔄 [AI MANAGER NEW] Renderizando tab Workflows...')}
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Workflows de Automação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Workflows</h3>
                <p className="text-muted-foreground">Seção em desenvolvimento</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {workflows.length} workflows configurados | {activeWorkflows.length} ativos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          {console.log('📈 [AI MANAGER NEW] Renderizando tab Uso...')}
          <Card className="grc-card">
            <CardHeader>
              <CardTitle>Estatísticas de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Uso e Estatísticas</h3>
                <p className="text-muted-foreground">Monitoramento de uso e custos</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalRequests}</p>
                    <p className="text-sm text-muted-foreground">Requisições</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalTokens.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Custo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {console.log('✅ [AI MANAGER NEW] Interface renderizada com sucesso!')}
    </div>
  );
};

export default AIManagerNew;
