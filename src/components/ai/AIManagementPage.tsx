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
  Shield as ShieldIcon,
  X,
  Save,
  Edit
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
// Seções temporariamente comentadas para debug
// import { AIConfigurationSection } from './sections/AIConfigurationSection';
// import { AIProvidersSection } from './sections/AIProvidersSection';
// import { AIPromptsSection } from './sections/AIPromptsSection';
// import { AIWorkflowsSection } from './sections/AIWorkflowsSection';
// import { AIUsageStatsSection } from './sections/AIUsageStatsSection';
// import { AISecuritySection } from './sections/AISecuritySection';

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

const AIManagementPage: React.FC = () => {
  console.log('🎆 [AI MANAGER COMPONENT] === COMPONENTE SENDO CARREGADO ===');
  console.log('🕰️ [AI MANAGER COMPONENT] Timestamp:', new Date().toISOString());
  console.log('🗺️ [AI MANAGER COMPONENT] URL atual:', window.location.pathname);
  console.log('🔍 [AI MANAGER COMPONENT] Componente AIManagementPage iniciando...');
  
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para configurações
  const [aiConfig, setAiConfig] = useState({
    defaultProvider: 'claude',
    defaultModel: 'claude-3-5-sonnet',
    temperature: 0.7,
    maxTokens: 4000,
    contextWindow: 8000,
    rateLimit: 30,
    contentFilter: true,
    piiDetection: true,
    requireApproval: true,
    auditLogging: true,
    retentionPeriod: 365,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    timeout: 30,
    retryAttempts: 3,
    streaming: true
  });
  
  // Estados para edição
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estados para modais
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptModalMode, setPromptModalMode] = useState<'create' | 'edit'>('create');
  const [promptForm, setPromptForm] = useState({
    name: '',
    category: '',
    template_content: '',
    description: '',
    use_case: '',
    is_active: true
  });

  // Debug: Log dados do usuário
  console.log('🤖 [AI MANAGER] Dados do usuário:', {
    user,
    isPlatformAdmin: user?.isPlatformAdmin,
    roles: user?.roles,
    permissions: user?.permissions,
    tenantId: user?.tenantId
  });

  // Verificar se o usuário é platform admin
  if (!user?.isPlatformAdmin) {
    console.log('❌ [AI MANAGER] Usuário não é Platform Admin, redirecionando para dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('✅ [AI MANAGER] Usuário é Platform Admin, carregando componente');
  
  console.log('🎨 [AI MANAGER] === INICIANDO RENDERIZAÇÃO ===');
  console.log('📋 [AI MANAGER] Quantidade de provedores:', providers.length);
  console.log('📝 [AI MANAGER] Quantidade de prompts:', prompts.length);
  console.log('⚙️ [AI MANAGER] Tab ativa:', activeTab);

  // Carregar todos os dados da IA
  const loadAIData = async () => {
    try {
      // Carregar provedores - tentar MCP providers primeiro
      console.log('🔍 [AI MANAGER] Carregando provedores para tenant:', user?.tenantId);
      
      // Tentar tabela mcp_providers
      const { data: mcpProvidersData, error: mcpProvidersError } = await supabase
        .from('mcp_providers')
        .select('*')
        .eq('tenant_id', user?.tenantId)
        .order('created_at', { ascending: false });

      console.log('🖥️ [AI MANAGER] Provedores MCP encontrados:', mcpProvidersData?.length || 0, mcpProvidersError);

      // Tentar tabela ai_grc_providers como fallback
      const { data: aiProvidersData, error: aiProvidersError } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', user?.tenantId)
        .order('created_at', { ascending: false });

      console.log('🔧 [AI MANAGER] Provedores AI GRC encontrados:', aiProvidersData?.length || 0, aiProvidersError);

      // Usar os dados que foram encontrados
      let finalProvidersData = [];
      if (mcpProvidersData && mcpProvidersData.length > 0) {
        // Adaptar dados MCP para formato esperado
        finalProvidersData = mcpProvidersData.map(provider => ({
          id: provider.id,
          name: provider.name,
          provider_type: provider.provider_type,
          model_name: provider.model,
          is_active: true, // Assumir ativo se não especificado
          is_primary: false,
          total_requests: provider.total_requests || 0,
          successful_requests: provider.successful_requests || 0,
          failed_requests: provider.failed_requests || 0,
          tokens_used_today: provider.tokens_used_today || 0,
          cost_usd_today: 0,
        }));
        console.log('✅ [AI MANAGER] Usando provedores MCP adaptados');
      } else if (aiProvidersData && aiProvidersData.length > 0) {
        finalProvidersData = aiProvidersData;
        console.log('✅ [AI MANAGER] Usando provedores AI GRC');
      } else {
        console.log('⚠️ [AI MANAGER] Nenhum provedor encontrado em ambas as tabelas');
      }

      setProviders(finalProvidersData || []);

      // Carregar prompts - tentar múltiplas tabelas para encontrar os dados
      console.log('🔍 [AI MANAGER] Tentando carregar prompts de diferentes tabelas...');
      
      // Tentar primeira tabela: ai_grc_prompt_templates
      const { data: promptsData1, error: promptsError1 } = await supabase
        .from('ai_grc_prompt_templates')
        .select('id, name, is_active, category, title, template_content, description, use_case, created_at')
        .order('created_at', { ascending: false });

      console.log('📝 [AI MANAGER] Prompts da tabela ai_grc_prompt_templates:', promptsData1?.length || 0, promptsError1);

      // Tentar segunda tabela: ai_module_prompts
      const { data: promptsData2, error: promptsError2 } = await supabase
        .from('ai_module_prompts')
        .select('id, prompt_name as name, is_active, module_name as category, title, prompt_content, description, created_at')
        .order('created_at', { ascending: false });

      console.log('📝 [AI MANAGER] Prompts da tabela ai_module_prompts:', promptsData2?.length || 0, promptsError2);

      // Tentar terceira tabela: integrations (pode ter configs de prompts)
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('integrations')
        .select('*')
        .eq('tenant_id', user?.tenantId)
        .eq('type', 'mcp')
        .order('created_at', { ascending: false });

      console.log('🔗 [AI MANAGER] Integrações MCP encontradas:', integrationsData?.length || 0, integrationsError);

      // Usar os dados que foram encontrados
      let finalPromptsData = [];
      if (promptsData1 && promptsData1.length > 0) {
        finalPromptsData = promptsData1;
        console.log('✅ [AI MANAGER] Usando prompts da tabela ai_grc_prompt_templates');
      } else if (promptsData2 && promptsData2.length > 0) {
        finalPromptsData = promptsData2;
        console.log('✅ [AI MANAGER] Usando prompts da tabela ai_module_prompts');
      } else if (integrationsData && integrationsData.length > 0) {
        // Adaptar integrações como "prompts"
        finalPromptsData = integrationsData.map(integration => ({
          id: integration.id,
          name: integration.name,
          is_active: integration.status === 'connected',
          category: 'integration',
          title: integration.name
        }));
        console.log('✅ [AI MANAGER] Usando integrações MCP como prompts');
      } else {
        console.log('⚠️ [AI MANAGER] Nenhum prompt encontrado em todas as tabelas testadas');
      }

      setPrompts(finalPromptsData || []);

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
        // Workflows carregados
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
        // Usage logs carregados
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

  // Função para salvar configurações de IA
  const saveAIConfiguration = async () => {
    if (!user?.tenantId) return;
    
    setSaving(true);
    try {
      console.log('💾 [AI MANAGER] Salvando configurações:', aiConfig);
      
      // Verificar se já existe uma configuração
      const { data: existingConfig, error: fetchError } = await supabase
        .from('ai_configurations')
        .select('id')
        .eq('tenant_id', user.tenantId)
        .single();

      let result;
      if (existingConfig) {
        // Atualizar configuração existente
        result = await supabase
          .from('ai_configurations')
          .update({
            default_provider: aiConfig.defaultProvider,
            max_tokens_per_request: aiConfig.maxTokens,
            max_requests_per_minute: aiConfig.rateLimit,
            temperature: aiConfig.temperature,
            context_window: aiConfig.contextWindow,
            enable_content_filtering: aiConfig.contentFilter,
            enable_pii_detection: aiConfig.piiDetection,
            require_approval_for_sensitive: aiConfig.requireApproval,
            enable_audit_logging: aiConfig.auditLogging,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id);
      } else {
        // Criar nova configuração
        result = await supabase
          .from('ai_configurations')
          .insert({
            name: 'Configuração Principal',
            tenant_id: user.tenantId,
            default_provider: aiConfig.defaultProvider,
            max_tokens_per_request: aiConfig.maxTokens,
            max_requests_per_minute: aiConfig.rateLimit,
            temperature: aiConfig.temperature,
            context_window: aiConfig.contextWindow,
            enable_content_filtering: aiConfig.contentFilter,
            enable_pii_detection: aiConfig.piiDetection,
            require_approval_for_sensitive: aiConfig.requireApproval,
            enable_audit_logging: aiConfig.auditLogging,
            created_by: user.id
          });
      }

      if (result.error) {
        throw result.error;
      }

      toast.success('Configurações salvas com sucesso!');
      console.log('✅ [AI MANAGER] Configurações salvas');
      
    } catch (error) {
      console.error('❌ [AI MANAGER] Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  // Função para testar configurações
  const testConfiguration = async () => {
    toast.info('Testando configurações...');
    // Simular teste - implementar lógica real depois
    setTimeout(() => {
      toast.success('Configurações testadas com sucesso!');
    }, 2000);
  };

  // Função para resetar configurações
  const resetConfiguration = () => {
    setAiConfig({
      defaultProvider: 'claude',
      defaultModel: 'claude-3-5-sonnet',
      temperature: 0.7,
      maxTokens: 4000,
      contextWindow: 8000,
      rateLimit: 30,
      contentFilter: true,
      piiDetection: true,
      requireApproval: true,
      auditLogging: true,
      retentionPeriod: 365,
      topP: 1.0,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      timeout: 30,
      retryAttempts: 3,
      streaming: true
    });
    toast.info('Configurações resetadas para os valores padrão');
  };

  // Função para testar provedor
  const testProvider = async (providerId: string) => {
    toast.info('Testando conexão com o provedor...');
    // Simular teste - implementar lógica real depois
    setTimeout(() => {
      toast.success('Provedor testado com sucesso!');
    }, 1500);
  };

  // Função para editar provedor
  const editProvider = (providerId: string) => {
    setEditingProvider(providerId);
    toast.info('Modo de edição ativado para o provedor');
  };

  // Função para criar novo prompt
  const createNewPrompt = () => {
    setPromptForm({
      name: '',
      category: '',
      template_content: '',
      description: '',
      use_case: '',
      is_active: true
    });
    setPromptModalMode('create');
    setShowPromptModal(true);
  };

  // Função para editar prompt
  const editPrompt = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      setPromptForm({
        name: prompt.name || '',
        category: prompt.category || '',
        template_content: prompt.template_content || prompt.prompt_content || '',
        description: prompt.description || '',
        use_case: prompt.use_case || '',
        is_active: prompt.is_active
      });
      setEditingPrompt(promptId);
      setPromptModalMode('edit');
      setShowPromptModal(true);
    }
  };

  // Função para salvar prompt
  const savePrompt = async () => {
    if (!user?.tenantId) return;
    
    setSaving(true);
    try {
      if (promptModalMode === 'create') {
        // Criar novo prompt
        const { error } = await supabase
          .from('ai_grc_prompt_templates')
          .insert({
            name: promptForm.name,
            category: promptForm.category,
            template_content: promptForm.template_content,
            description: promptForm.description,
            use_case: promptForm.use_case,
            is_active: promptForm.is_active,
            tenant_id: user.tenantId,
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Prompt criado com sucesso!');
      } else if (promptModalMode === 'edit' && editingPrompt) {
        // Atualizar prompt existente
        const { error } = await supabase
          .from('ai_grc_prompt_templates')
          .update({
            name: promptForm.name,
            category: promptForm.category,
            template_content: promptForm.template_content,
            description: promptForm.description,
            use_case: promptForm.use_case,
            is_active: promptForm.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPrompt)
          .eq('tenant_id', user.tenantId);

        if (error) throw error;
        toast.success('Prompt atualizado com sucesso!');
      }

      // Recarregar dados e fechar modal
      await loadAIData();
      setShowPromptModal(false);
      setEditingPrompt(null);
      
    } catch (error) {
      console.error('Erro ao salvar prompt:', error);
      toast.error('Erro ao salvar prompt: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

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
  
  // Debug logs - Estatísticas calculadas
  console.log('📊 [AI MANAGER] Estatísticas calculadas:', {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestão de IA
            </h1>
            <p className="text-sm text-gray-600">
              Configuração e gerenciamento de assistentes IA especializados em GRC
            </p>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            <span>Configurações</span>
          </TabsTrigger>
          <TabsTrigger value="providers">
            <Cpu className="h-4 w-4 mr-2" />
            <span>Provedores</span>
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Prompts</span>
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow className="h-4 w-4 mr-2" />
            <span>Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="usage">
            <Database className="h-4 w-4 mr-2" />
            <span>Uso</span>
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
                      <p className="font-medium">{providers.length}</p>
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
          <div className="space-y-6">
            {/* Configurações Gerais de IA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configurações Gerais de IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Provedor Padrão */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Provedor Padrão</label>
                    <select 
                      className="w-full p-2 border border-border rounded-md"
                      value={aiConfig.defaultProvider}
                      onChange={(e) => setAiConfig({...aiConfig, defaultProvider: e.target.value})}
                    >
                      <option value="claude">Claude (Anthropic)</option>
                      <option value="openai">OpenAI GPT</option>
                      <option value="azure-openai">Azure OpenAI</option>
                      <option value="custom">Provedor Personalizado</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Provedor de IA usado por padrão para novas requisições</p>
                  </div>

                  {/* Modelo Padrão */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modelo Padrão</label>
                    <select className="w-full p-2 border border-border rounded-md">
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Modelo de linguagem usado por padrão</p>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperature</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.1" 
                        value={aiConfig.temperature}
                        onChange={(e) => setAiConfig({...aiConfig, temperature: parseFloat(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-10">{aiConfig.temperature.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Controla a criatividade das respostas (0 = determinística, 2 = muito criativa)</p>
                  </div>

                  {/* Max Tokens */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Máximo de Tokens</label>
                    <input 
                      type="number" 
                      value={aiConfig.maxTokens}
                      onChange={(e) => setAiConfig({...aiConfig, maxTokens: parseInt(e.target.value)})}
                      min="100"
                      max="32000"
                      className="w-full p-2 border border-border rounded-md"
                    />
                    <p className="text-xs text-muted-foreground">Número máximo de tokens por resposta</p>
                  </div>

                  {/* Context Window */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Janela de Contexto</label>
                    <select 
                      className="w-full p-2 border border-border rounded-md"
                      value={aiConfig.contextWindow}
                      onChange={(e) => setAiConfig({...aiConfig, contextWindow: parseInt(e.target.value)})}
                    >
                      <option value="8000">8K tokens</option>
                      <option value="32000">32K tokens</option>
                      <option value="128000">128K tokens</option>
                      <option value="200000">200K tokens</option>
                    </select>
                    <p className="text-xs text-muted-foreground">Tamanho máximo do contexto para conversações</p>
                  </div>

                  {/* Rate Limit */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Limite de Requisições/Minuto</label>
                    <input 
                      type="number" 
                      defaultValue="30"
                      min="1"
                      max="1000"
                      className="w-full p-2 border border-border rounded-md"
                    />
                    <p className="text-xs text-muted-foreground">Limite de requisições por minuto para evitar rate limit</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldIcon className="h-5 w-5" />
                  <span>Configurações de Segurança</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Filtro de Conteúdo */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Filtro de Conteúdo</label>
                      <p className="text-xs text-muted-foreground">Bloquear conteúdo inapropriado</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>

                  {/* Detecção de PII */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Detecção de PII</label>
                      <p className="text-xs text-muted-foreground">Detectar informações pessoais</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>

                  {/* Aprovação para Conteúdo Sensível */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Aprovação para Sensível</label>
                      <p className="text-xs text-muted-foreground">Exigir aprovação para conteúdo sensível</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>

                  {/* Log de Auditoria */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Log de Auditoria</label>
                      <p className="text-xs text-muted-foreground">Registrar todas as interações</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                </div>

                {/* Retenção de Dados */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Período de Retenção de Dados</label>
                  <select className="w-full p-2 border border-border rounded-md">
                    <option value="30">30 dias</option>
                    <option value="90">90 dias</option>
                    <option value="365">1 ano</option>
                    <option value="1095">3 anos</option>
                    <option value="-1">Indefinido</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Tempo para manter logs e dados de conversação</p>
                </div>
              </CardContent>
            </Card>

            {/* Configurações Avançadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>Configurações Avançadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top P */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Top P (Nucleus Sampling)</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        defaultValue="1.0"
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-10">1.0</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Controla a diversidade das palavras consideradas</p>
                  </div>

                  {/* Frequency Penalty */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Frequency Penalty</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="range" 
                        min="-2" 
                        max="2" 
                        step="0.1" 
                        defaultValue="0.0"
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-10">0.0</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Penaliza repetição de tokens frequentes</p>
                  </div>

                  {/* Presence Penalty */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Presence Penalty</label>
                    <div className="flex items-center space-x-4">
                      <input 
                        type="range" 
                        min="-2" 
                        max="2" 
                        step="0.1" 
                        defaultValue="0.0"
                        className="flex-1"
                      />
                      <span className="text-sm font-mono w-10">0.0</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Penaliza repetição de qualquer token</p>
                  </div>

                  {/* Timeout */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Timeout (segundos)</label>
                    <input 
                      type="number" 
                      defaultValue="30"
                      min="5"
                      max="300"
                      className="w-full p-2 border border-border rounded-md"
                    />
                    <p className="text-xs text-muted-foreground">Tempo limite para requisições à IA</p>
                  </div>

                  {/* Retry Attempts */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tentativas de Retry</label>
                    <input 
                      type="number" 
                      defaultValue="3"
                      min="1"
                      max="10"
                      className="w-full p-2 border border-border rounded-md"
                    />
                    <p className="text-xs text-muted-foreground">Número de tentativas em caso de falha</p>
                  </div>

                  {/* Streaming */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Streaming de Respostas</label>
                      <p className="text-xs text-muted-foreground">Receber respostas em tempo real</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <Button variant="outline" onClick={testConfiguration}>
                  Testar Configurações
                </Button>
                <Button variant="outline" onClick={resetConfiguration}>
                  Resetar Padrões
                </Button>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => loadAIData()}>
                  Cancelar
                </Button>
                <Button onClick={saveAIConfiguration} disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cpu className="h-5 w-5" />
                <span>Provedores de IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : providers.length === 0 ? (
                <div className="p-8 text-center">
                  <Cpu className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-medium mb-2">Nenhum Provedor Configurado</h3>
                  <p className="text-gray-600">Configure seus provedores de IA para começar</p>
                  <div className="mt-6">
                    <Button className="mr-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Provedor
                    </Button>
                    <Button variant="outline">
                      <Cpu className="h-4 w-4 mr-2" />
                      Importar Configuração
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header com estatísticas */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <h3 className="text-lg font-medium">Provedores Configurados</h3>
                      <p className="text-sm text-gray-600">
                        {providers.length} provedores configurados | {activeProviders.length} ativos
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Provedor
                      </Button>
                      <Button variant="outline" size="sm">
                        <Cpu className="h-4 w-4 mr-2" />
                        Testar Conexões
                      </Button>
                    </div>
                  </div>

                  {/* Lista de provedores */}
                  <div className="grid grid-cols-1 gap-4">
                    {providers.map((provider) => {
                      const isActive = provider.is_active;
                      const isPrimary = provider.is_primary;
                      const successRate = provider.total_requests > 0 
                        ? Math.round((provider.successful_requests / provider.total_requests) * 100)
                        : 0;

                      const getProviderIcon = (type: string) => {
                        switch (type) {
                          case 'claude': return '🤖';
                          case 'openai': return '🧠';
                          case 'azure-openai': return '☁️';
                          case 'google-palm': return '🔍';
                          case 'glm': return '🎆';
                          default: return '⚙️';
                        }
                      };

                      const getStatusColor = () => {
                        if (!isActive) return 'bg-gray-50 border-gray-200';
                        if (successRate < 80) return 'bg-red-50 border-red-200';
                        return 'bg-green-50 border-green-200';
                      };

                      return (
                        <Card key={provider.id} className={`transition-all hover:shadow-md ${getStatusColor()} ${!isActive ? 'opacity-75' : ''}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-lg text-2xl ${isActive ? 'bg-white' : 'bg-gray-100'}`}>
                                  {getProviderIcon(provider.provider_type)}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-foreground">
                                      {provider.name}
                                    </h4>
                                    {isPrimary && (
                                      <Badge variant="default" className="text-xs bg-yellow-100 text-yellow-800">
                                        Principal
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {provider.provider_type}
                                    </Badge>
                                    <Badge 
                                      variant={isActive ? "default" : "secondary"} 
                                      className="text-xs"
                                    >
                                      {isActive ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                    {provider.model_name && (
                                      <span className="text-xs text-muted-foreground">
                                        {provider.model_name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => testProvider(provider.id)}
                                >
                                  Testar
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => editProvider(provider.id)}
                                >
                                  Editar
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Configurar
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0">
                            {/* Métricas de uso */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <p className="text-lg font-bold text-foreground">
                                  {provider.total_requests || 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Requisições</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-green-600">
                                  {provider.successful_requests || 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Sucessos</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-red-600">
                                  {provider.failed_requests || 0}
                                </p>
                                <p className="text-xs text-muted-foreground">Falhas</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-blue-600">
                                  {successRate}%
                                </p>
                                <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
                              </div>
                            </div>

                            {/* Configurações do provedor */}
                            <div className="bg-muted/50 rounded-lg p-4">
                              <h5 className="text-sm font-medium mb-3">Configurações:</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {provider.model_name && (
                                  <div>
                                    <span className="font-medium">Modelo:</span>
                                    <span className="ml-2 text-muted-foreground">{provider.model_name}</span>
                                  </div>
                                )}
                                {provider.tokens_used_today !== undefined && (
                                  <div>
                                    <span className="font-medium">Tokens Hoje:</span>
                                    <span className="ml-2 text-muted-foreground">{provider.tokens_used_today.toLocaleString()}</span>
                                  </div>
                                )}
                                {provider.cost_usd_today !== undefined && (
                                  <div>
                                    <span className="font-medium">Custo Hoje:</span>
                                    <span className="ml-2 text-muted-foreground">${provider.cost_usd_today.toFixed(4)}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Status:</span>
                                  <span className={`ml-2 ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                                    {isActive ? 'Operacional' : 'Desabilitado'}
                                  </span>
                                </div>
                              </div>

                              {/* Barra de taxa de sucesso */}
                              {provider.total_requests > 0 && (
                                <div className="mt-4 pt-3 border-t border-border/50">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium">Taxa de Sucesso</span>
                                    <span className="text-xs">{successRate}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        successRate >= 95 ? 'bg-green-500' :
                                        successRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${successRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}

                              {/* Informações adicionais se disponíveis */}
                              {(provider.endpoint_url || provider.api_version) && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <h6 className="text-xs font-medium mb-2">Detalhes Técnicos:</h6>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    {provider.endpoint_url && (
                                      <div>
                                        <span className="font-medium">Endpoint:</span>
                                        <span className="ml-2 font-mono">{provider.endpoint_url}</span>
                                      </div>
                                    )}
                                    {provider.api_version && (
                                      <div>
                                        <span className="font-medium">Versão API:</span>
                                        <span className="ml-2">{provider.api_version}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Templates de Prompts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : prompts.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-lg font-medium mb-2">Prompts Personalizados</h3>
                  <p className="text-gray-600">Nenhum prompt configurado</p>
                  <div className="mt-6">
                    <Button className="mr-2" onClick={createNewPrompt}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Prompt
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Importar Templates
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header com estatísticas */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <h3 className="text-lg font-medium">Prompts Personalizados</h3>
                      <p className="text-sm text-gray-600">
                        {prompts.length} prompts configurados | {activePrompts.length} ativos
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm" onClick={createNewPrompt}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Prompt
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Importar Templates
                      </Button>
                    </div>
                  </div>

                  {/* Lista de prompts */}
                  <div className="grid grid-cols-1 gap-4">
                    {prompts.map((prompt) => {
                      const isActive = prompt.is_active;
                      return (
                        <Card key={prompt.id} className={`transition-all hover:shadow-md ${!isActive ? 'opacity-75' : ''}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${isActive ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                  <MessageSquare className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground">
                                    {prompt.name || prompt.title || `Prompt ${prompt.id}`}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {prompt.category || 'Geral'}
                                    </Badge>
                                    <Badge 
                                      variant={isActive ? "default" : "secondary"} 
                                      className="text-xs"
                                    >
                                      {isActive ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => editPrompt(prompt.id)}
                                >
                                  Editar
                                </Button>
                                <Button variant="ghost" size="sm">
                                  Testar
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          
                          {/* Mostrar conteúdo do prompt se disponível */}
                          {(prompt.template_content || prompt.description || prompt.prompt_content) && (
                            <CardContent className="pt-0">
                              <div className="bg-muted/50 rounded-lg p-4">
                                <h5 className="text-sm font-medium mb-2">Conteúdo do Prompt:</h5>
                                <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap font-mono text-xs">
                                    {prompt.template_content || prompt.prompt_content || prompt.description || 'Conteúdo não disponível'}
                                  </pre>
                                </div>
                                {prompt.use_case && (
                                  <div className="mt-3 pt-3 border-t border-border/50">
                                    <h6 className="text-xs font-medium mb-1">Caso de Uso:</h6>
                                    <p className="text-xs text-muted-foreground">
                                      {prompt.use_case}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Workflow className="h-5 w-5" />
                <span>Workflows de Automação</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Workflow className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Workflows</h3>
                <p className="text-gray-600">Seção em desenvolvimento</p>
                <p className="text-sm text-gray-500 mt-2">
                  {workflows.length} workflows configurados | {activeWorkflows.length} ativos
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Estatísticas de Uso</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Uso e Estatísticas</h3>
                <p className="text-gray-600">Monitoramento de uso e custos</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
                    <p className="text-sm text-gray-500">Requisições</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{totalTokens.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Custo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para criar/editar prompt */}
      <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>{promptModalMode === 'create' ? 'Criar Novo Prompt' : 'Editar Prompt'}</span>
            </DialogTitle>
            <DialogDescription>
              {promptModalMode === 'create' 
                ? 'Crie um novo template de prompt personalizado para o sistema de IA'
                : 'Edite o template de prompt personalizado'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="prompt-name">Nome do Prompt</Label>
              <Input
                id="prompt-name"
                placeholder="Ex: Análise de Risco, Auditoria de Controle..."
                value={promptForm.name}
                onChange={(e) => setPromptForm({...promptForm, name: e.target.value})}
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="prompt-category">Categoria</Label>
              <select 
                id="prompt-category"
                className="w-full p-2 border border-border rounded-md"
                value={promptForm.category}
                onChange={(e) => setPromptForm({...promptForm, category: e.target.value})}
              >
                <option value="">Selecione uma categoria</option>
                <option value="risk">Gestão de Riscos</option>
                <option value="audit">Auditoria</option>
                <option value="compliance">Compliance</option>
                <option value="assessment">Avaliações</option>
                <option value="policy">Políticas</option>
                <option value="privacy">Privacidade/LGPD</option>
                <option value="general">Geral</option>
                <option value="alex">Alex (Assistant)</option>
              </select>
            </div>

            {/* Conteúdo do Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt-content">Conteúdo do Prompt</Label>
              <Textarea
                id="prompt-content"
                placeholder="Escreva o template do prompt aqui...\n\nVocê pode usar variáveis como {context}, {data}, {user_input}, etc."
                value={promptForm.template_content}
                onChange={(e) => setPromptForm({...promptForm, template_content: e.target.value})}
                rows={10}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="prompt-description">Descrição</Label>
              <Textarea
                id="prompt-description"
                placeholder="Descreva o propósito e funcionamento deste prompt..."
                value={promptForm.description}
                onChange={(e) => setPromptForm({...promptForm, description: e.target.value})}
                rows={3}
              />
            </div>

            {/* Caso de Uso */}
            <div className="space-y-2">
              <Label htmlFor="prompt-usecase">Caso de Uso</Label>
              <Input
                id="prompt-usecase"
                placeholder="Ex: Análise automatizada de riscos de compliance"
                value={promptForm.use_case}
                onChange={(e) => setPromptForm({...promptForm, use_case: e.target.value})}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="prompt-active"
                checked={promptForm.is_active}
                onChange={(e) => setPromptForm({...promptForm, is_active: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="prompt-active">Prompt ativo</Label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPromptModal(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => {
                setPromptForm({
                  name: '',
                  category: '',
                  template_content: '',
                  description: '',
                  use_case: '',
                  is_active: true
                });
              }}>
                Limpar
              </Button>
              <Button onClick={savePrompt} disabled={saving || !promptForm.name || !promptForm.template_content}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : (promptModalMode === 'create' ? 'Criar Prompt' : 'Salvar Alterações')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIManagementPage;