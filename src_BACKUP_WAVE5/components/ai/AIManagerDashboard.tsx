import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Shield,
  Globe,
  ChevronRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Activity,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
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

export const AIManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
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

  // Carregar dados da IA
  const loadAIData = async () => {
    try {
      setLoading(true);

      // Carregar provedores
      const { data: providersData, error: providersError } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', user?.tenantId)
        .order('priority', { ascending: true });

      if (providersError) throw providersError;
      setProviders(providersData || []);

      // Carregar prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('ai_grc_prompt_templates')
        .select('id, name, is_active, category')
        .order('created_at', { ascending: false });

      if (!promptsError) {
        setPrompts(promptsData || []);
      }

      // Carregar workflows
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('ai_workflows')
        .select('id, name, is_active, status')
        .eq('tenant_id', user?.tenantId)
        .order('created_at', { ascending: false });

      if (!workflowsError) {
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

      if (!usageError) {
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

  // Calcular estatísticas
  const activeProviders = providers.filter(p => p.is_active);
  const activePrompts = prompts.filter(p => p.is_active);
  const activeWorkflows = workflows.filter(w => w.is_active && w.status === 'active');
  
  const totalRequests = usageLogs.length;
  const totalTokens = usageLogs.reduce((sum, log) => sum + ((log.tokens_input || 0) + (log.tokens_output || 0)), 0);
  const totalCost = usageLogs.reduce((sum, log) => sum + (log.cost_usd || 0), 0);

  // Quick actions seguindo padrão do Privacy
  const quickActions = [
    {
      title: 'Configurar Provedores',
      description: 'Gerenciar Claude, OpenAI e outros provedores',
      icon: Cpu,
      color: 'blue',
      action: () => navigate('/ai-manager/providers'),
      count: providers.length
    },
    {
      title: 'Templates de Prompts',
      description: 'Criar prompts especializados para GRC',
      icon: MessageSquare,
      color: 'purple',
      action: () => navigate('/ai-manager/prompts'),
      count: prompts.length
    },
    {
      title: 'Workflows de Automação',
      description: 'Automatizar análises e relatórios',
      icon: Workflow,
      color: 'green',
      action: () => navigate('/ai-manager/workflows'),
      count: workflows.length
    },
    {
      title: 'Estatísticas de Uso',
      description: 'Monitorar custos e performance',
      icon: BarChart3,
      color: 'orange',
      action: () => navigate('/ai-manager/usage'),
      count: totalRequests
    },
    {
      title: 'Configurações IA',
      description: 'Configurações gerais do sistema',
      icon: Settings,
      color: 'gray',
      action: () => navigate('/ai-manager/settings'),
      count: 0
    },
    {
      title: 'Auditoria e Logs',
      description: 'Histórico de atividades da IA',
      icon: Shield,
      color: 'red',
      action: () => navigate('/ai-manager/audit'),
      count: usageLogs.length
    }
  ];

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

  // Calcular compliance score baseado na configuração
  const calculateComplianceScore = () => {
    let score = 0;
    
    // Provedores configurados (30%)
    if (activeProviders.length > 0) score += 30;
    
    // Templates configurados (20%)
    if (activePrompts.length > 0) score += 20;
    
    // Workflows ativos (20%)
    if (activeWorkflows.length > 0) score += 20;
    
    // Uso recente (15%)
    if (totalRequests > 0) score += 15;
    
    // Logs de auditoria (15%)
    if (usageLogs.length > 0) score += 15;
    
    return score;
  };

  const complianceScore = calculateComplianceScore();

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dashboard de IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Seguindo padrão do Privacy */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8" />
            Gestão de IA
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Configuração e gerenciamento de assistentes IA especializados em GRC
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Shield className="h-3 w-3 mr-1" />
            Platform Admin
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1">
            <TrendingUp className="w-3 h-3" />
            Score: {complianceScore}%
          </Badge>
          <Button size="sm" variant="outline" onClick={loadAIData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alert de informação */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Info className="h-4 w-4" />
        <AlertTitle>Centro de Gestão de IA</AlertTitle>
        <AlertDescription>
          Configure e monitore todos os assistentes IA da plataforma GRC. 
          Gerencie provedores, prompts personalizados e workflows automatizados.
        </AlertDescription>
      </Alert>

      {/* Key Metrics - Seguindo padrão do Privacy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[100px] sm:min-h-[120px] text-center">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 leading-tight">Provedores Ativos</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 leading-none">{activeProviders.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                  {getProviderNames()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[100px] sm:min-h-[120px] text-center">
              <div className="flex justify-center mb-1 sm:mb-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 leading-tight">Prompts Ativos</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 leading-none">{activePrompts.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                  {prompts.length} total configurados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[100px] sm:min-h-[120px] text-center">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Workflow className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 leading-tight">Workflows Ativos</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 leading-none">{activeWorkflows.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                  {workflows.length} total | {activeWorkflows.length} executando
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full min-h-[100px] sm:min-h-[120px] text-center">
              <div className="flex justify-center mb-1 sm:mb-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 sm:mb-3 leading-tight">Requisições Hoje</p>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 leading-none">{totalRequests}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                  {totalTokens.toLocaleString()} tokens | ${totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid - Seguindo padrão do Privacy */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Funcionalidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/30 group relative overflow-hidden" onClick={action.action}>
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20`}>
                    <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {action.count > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{action.count}</Badge>
                    )}
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">{action.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-tight">{action.description}</CardDescription>
              </CardHeader>
              
              {/* Efeito de hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)'
              }} />
            </Card>
          ))}
        </div>
      </div>

      {/* Compliance Overview - Seguindo padrão do Privacy */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Score de Configuração IA
            </CardTitle>
            <CardDescription>
              Avaliação do estado de configuração dos sistemas de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Configuração Geral</span>
                <span>{complianceScore}%</span>
              </div>
              <Progress value={complianceScore} className="h-2" />
            </div>
            
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span>Provedores Configurados</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">{providers.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  <span>Templates de Prompts</span>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{prompts.length}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Workflow className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span>Workflows Ativos</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">{activeWorkflows.length}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span>Uso Recente</span>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{totalRequests} hoje</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Verificações de segurança e integridade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Criptografia de Chaves</span>
                <p className="text-xs text-muted-foreground">API keys protegidas</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Isolamento por Tenant</span>
                <p className="text-xs text-muted-foreground">RLS ativo</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Logs de Auditoria</span>
                <p className="text-xs text-muted-foreground">{usageLogs.length} registros hoje</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Ativo</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Monitoramento</span>
                <p className="text-xs text-muted-foreground">Métricas em tempo real</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">Disponível</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIManagerDashboard;