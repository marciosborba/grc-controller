import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Cpu,
  Plus,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Zap,
  Star,
  Edit,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';
import { createGLMService, validateGLMApiKey } from '@/services/glmService';

interface AIProvider {
  id?: string;
  name: string;
  provider_type: string;
  endpoint_url?: string;
  api_version?: string;
  model_name: string;
  api_key_encrypted: string;
  organization_id?: string;
  project_id?: string;
  context_window: number;
  max_output_tokens: number;
  temperature: number;
  top_p: number;
  top_k: number;
  frequency_penalty: number;
  presence_penalty: number;
  grc_specialization: Record<string, any>;
  supported_modules: string[];
  compliance_frameworks: string[];
  risk_assessment_capabilities: Record<string, any>;
  fallback_provider_id?: string;
  fallback_on_error: boolean;
  fallback_on_rate_limit: boolean;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  tokens_used_today: number;
  cost_usd_today: number;
  last_request_at?: string;
  is_active: boolean;
  is_primary: boolean;
  priority: number;
}

export const AIProvidersSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [formData, setFormData] = useState<Partial<AIProvider>>({
    name: '',
    provider_type: 'claude',
    endpoint_url: '',
    model_name: '',
    api_key_encrypted: '',
    context_window: 8000,
    max_output_tokens: 4000,
    temperature: 0.7,
    top_p: 1.0,
    top_k: 40,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    grc_specialization: {},
    supported_modules: [],
    compliance_frameworks: [],
    risk_assessment_capabilities: {},
    fallback_on_error: false,
    fallback_on_rate_limit: true,
    is_active: true,
    is_primary: false,
    priority: 1
  });

  useEffect(() => {
    if (user?.tenantId) {
      loadProviders();
    } else {
      setLoading(false);
    }
  }, [user?.tenantId]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', user?.tenantId)
        .order('priority', { ascending: true });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar provedores de IA',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProvider = async () => {
    try {
      // Validar dados obrigatórios
      if (!formData.name?.trim()) {
        toast({
          title: 'Erro',
          description: 'Nome do provedor é obrigatório',
          variant: 'destructive'
        });
        return;
      }
      
      if (!formData.model_name?.trim()) {
        toast({
          title: 'Erro',
          description: 'Nome do modelo é obrigatório',
          variant: 'destructive'
        });
        return;
      }
      
      if (!formData.api_key_encrypted?.trim()) {
        toast({
          title: 'Erro',
          description: 'Chave da API é obrigatória',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('User object:', user);
      console.log('Tenant ID:', user?.tenantId);
      console.log('User ID:', user?.id);
      
      const providerData = {
        ...formData,
        tenant_id: user?.tenantId,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };
      
      console.log('Provider data to save:', providerData);

      if (editingProvider?.id) {
        const { error } = await supabase
          .from('ai_grc_providers')
          .update(providerData)
          .eq('id', editingProvider.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_grc_providers')
          .insert(providerData);

        if (error) throw error;
      }

      await loadProviders();
      setShowCreateDialog(false);
      setEditingProvider(null);
      resetForm();

      toast({
        title: 'Sucesso',
        description: editingProvider ? 'Provedor atualizado!' : 'Provedor criado!'
      });
    } catch (error: any) {
      console.error('Erro ao salvar provedor:', error);
      
      let errorMessage = 'Erro ao salvar provedor';
      
      if (error?.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Já existe um provedor com este nome';
        } else if (error.message.includes('foreign key')) {
          errorMessage = 'Erro de referência: verifique os dados do tenant';
        } else if (error.message.includes('not null')) {
          errorMessage = 'Campos obrigatórios não preenchidos';
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }
      
      toast({
        title: 'Erro ao Salvar',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_grc_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadProviders();
      toast({
        title: 'Sucesso',
        description: 'Provedor removido!'
      });
    } catch (error) {
      console.error('Erro ao deletar provedor:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover provedor',
        variant: 'destructive'
      });
    }
  };

  const toggleProviderStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_grc_providers')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      await loadProviders();
      toast({
        title: 'Sucesso',
        description: `Provedor ${isActive ? 'ativado' : 'desativado'}!`
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status do provedor',
        variant: 'destructive'
      });
    }
  };

  const setPrimaryProvider = async (id: string) => {
    try {
      // Primeiro, remove is_primary de todos os provedores
      await supabase
        .from('ai_grc_providers')
        .update({ is_primary: false })
        .eq('tenant_id', user?.tenantId);

      // Depois define o novo provedor como primário
      const { error } = await supabase
        .from('ai_grc_providers')
        .update({ is_primary: true })
        .eq('id', id);

      if (error) throw error;

      await loadProviders();
      toast({
        title: 'Sucesso',
        description: 'Provedor principal definido!'
      });
    } catch (error) {
      console.error('Erro ao definir provedor principal:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao definir provedor principal',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider_type: 'claude',
      endpoint_url: '',
      model_name: '',
      api_key_encrypted: '',
      context_window: 8000,
      max_output_tokens: 4000,
      temperature: 0.7,
      top_p: 1.0,
      top_k: 40,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      grc_specialization: {},
      supported_modules: [],
      compliance_frameworks: [],
      risk_assessment_capabilities: {},
      fallback_on_error: false,
      fallback_on_rate_limit: true,
      is_active: true,
      is_primary: false,
      priority: 1
    });
  };

  const openEditDialog = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData(provider);
    setShowCreateDialog(true);
  };

  // Função para pré-popular dados baseados no tipo de provedor
  const handleProviderTypeChange = (providerType: string) => {
    const updates: Partial<AIProvider> = { provider_type: providerType };
    
    switch (providerType) {
      case 'glm':
        updates.endpoint_url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        updates.model_name = 'glm-4';
        updates.context_window = 8000;
        updates.max_output_tokens = 4000;
        updates.temperature = 0.7;
        break;
      case 'claude':
        updates.endpoint_url = '';
        updates.model_name = 'claude-3-5-sonnet';
        updates.context_window = 200000;
        updates.max_output_tokens = 4000;
        break;
      case 'openai':
        updates.endpoint_url = 'https://api.openai.com/v1/chat/completions';
        updates.model_name = 'gpt-4-turbo';
        updates.context_window = 128000;
        updates.max_output_tokens = 4000;
        break;
      case 'azure-openai':
        updates.endpoint_url = '';
        updates.model_name = 'gpt-4';
        updates.context_window = 128000;
        updates.max_output_tokens = 4000;
        break;
      default:
        updates.endpoint_url = '';
        updates.model_name = '';
        break;
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Função para testar conexão com o provedor
  const testConnection = async () => {
    if (!formData.api_key_encrypted?.trim()) {
      toast({
        title: 'Erro',
        description: 'Chave da API é necessária para testar a conexão',
        variant: 'destructive'
      });
      return;
    }

    setTestingConnection(true);
    
    try {
      if (formData.provider_type === 'glm') {
        // Validar formato da chave GLM
        if (!validateGLMApiKey(formData.api_key_encrypted)) {
          toast({
            title: 'Erro',
            description: 'Formato da chave GLM inválido. Esperado: 32 caracteres + ponto + 16 caracteres',
            variant: 'destructive'
          });
          return;
        }

        // Testar conexão GLM
        const glmService = createGLMService(formData.api_key_encrypted);
        const result = await glmService.testConnection();
        
        if (result.success) {
          toast({
            title: 'Sucesso',
            description: 'Conexão com GLM estabelecida com sucesso!'
          });
        } else {
          toast({
            title: 'Erro na Conexão',
            description: result.error || 'Falha ao conectar com GLM',
            variant: 'destructive'
          });
        }
      } else {
        // Para outros provedores, apenas mostrar mensagem informativa
        toast({
          title: 'Teste de Conexão',
          description: 'Teste de conexão ainda não implementado para este provedor',
          variant: 'default'
        });
      }
    } catch (error: any) {
      console.error('Erro no teste de conexão:', error);
      toast({
        title: 'Erro',
        description: `Falha no teste: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'claude': return '🤖';
      case 'openai': return '🧠';
      case 'azure-openai': return '☁️';
      case 'google-palm': return '🔍';
      case 'llama': return '🦙';
      case 'glm': return '🎆';
      case 'custom': return '⚙️';
      default: return '⚙️';
    }
  };

  const getStatusColor = (provider: AIProvider) => {
    if (!provider.is_active) return 'bg-gray-500';
    if (provider.failed_requests > provider.successful_requests * 0.1) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getStatusText = (provider: AIProvider) => {
    if (!provider.is_active) return 'Inativo';
    if (provider.failed_requests > provider.successful_requests * 0.1) return 'Com Problemas';
    return 'Operacional';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-primary" />
            <span>Provedores de IA</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure e gerencie provedores de IA especializados em GRC
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProvider(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Provedor
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProvider ? 'Editar Provedor' : 'Novo Provedor de IA'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Seção 1: Informações Básicas */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Informações Básicas</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Provedor *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: GLM Production, Claude Dev"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="providerType">Tipo de Provedor *</Label>
                    <Select 
                      value={formData.provider_type} 
                      onValueChange={handleProviderTypeChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="azure-openai">Azure OpenAI</SelectItem>
                        <SelectItem value="google-palm">Google PaLM</SelectItem>
                        <SelectItem value="llama">LLaMA</SelectItem>
                        <SelectItem value="glm">GLM (Zhipu AI)</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modelName">Nome do Modelo *</Label>
                    {formData.provider_type === 'glm' ? (
                      <Select 
                        value={formData.model_name} 
                        onValueChange={(value) => setFormData({ ...formData, model_name: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o modelo GLM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="glm-4">GLM-4 (mais recente)</SelectItem>
                          <SelectItem value="glm-3-turbo">GLM-3-Turbo (rápido e econômico)</SelectItem>
                          <SelectItem value="glm-4-air">GLM-4-Air (versão leve)</SelectItem>
                          <SelectItem value="glm-4v">GLM-4V (com suporte a imagens)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="modelName"
                        value={formData.model_name}
                        onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                        placeholder="ex: claude-3-5-sonnet, gpt-4-turbo"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                      placeholder="1 = maior prioridade"
                    />
                    <p className="text-xs text-muted-foreground">
                      Ordem de preferência (1 = maior prioridade)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seção 2: Configuração de Conexão */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Configuração de Conexão</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Endpoint URL - mostrar para GLM, custom e alguns outros */}
                  {(formData.provider_type === 'glm' || formData.provider_type === 'custom' || formData.provider_type === 'openai') && (
                    <div className="space-y-2">
                      <Label htmlFor="endpointUrl">URL do Endpoint</Label>
                      <Input
                        id="endpointUrl"
                        value={formData.endpoint_url}
                        onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                        placeholder="https://api.exemplo.com/v1/chat/completions"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">Chave da API *</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.api_key_encrypted}
                      onChange={(e) => setFormData({ ...formData, api_key_encrypted: e.target.value })}
                      placeholder={formData.provider_type === 'glm' ? 'Chave da API GLM' : 'Chave de API do provedor'}
                    />
                    {formData.provider_type === 'glm' && (
                      <p className="text-xs text-muted-foreground">
                        Formato: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx (obtida em open.bigmodel.cn)
                      </p>
                    )}
                    
                    {/* Botão de teste de conexão */}
                    {formData.api_key_encrypted && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={testConnection}
                        disabled={testingConnection}
                        className="mt-2"
                      >
                        {testingConnection ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 mr-2" />
                            Testar Conexão
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Campos opcionais para alguns provedores */}
                  {(formData.provider_type === 'azure-openai' || formData.provider_type === 'openai') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="organizationId">Organization ID</Label>
                        <Input
                          id="organizationId"
                          value={formData.organization_id || ''}
                          onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                          placeholder="org-xxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projectId">Project ID</Label>
                        <Input
                          id="projectId"
                          value={formData.project_id || ''}
                          onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                          placeholder="proj-xxxxxxxxxxxxxxxx"
                        />
                      </div>
                    </div>
                  )}

                  {formData.provider_type === 'azure-openai' && (
                    <div className="space-y-2">
                      <Label htmlFor="apiVersion">Versão da API</Label>
                      <Input
                        id="apiVersion"
                        value={formData.api_version || ''}
                        onChange={(e) => setFormData({ ...formData, api_version: e.target.value })}
                        placeholder="2024-02-15-preview"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Seção 3: Parâmetros do Modelo */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Parâmetros do Modelo</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contextWindow">Janela de Contexto</Label>
                    <Input
                      id="contextWindow"
                      type="number"
                      min="1000"
                      max="1000000"
                      value={formData.context_window}
                      onChange={(e) => setFormData({ ...formData, context_window: parseInt(e.target.value) || 8000 })}
                    />
                    <p className="text-xs text-muted-foreground">Número máximo de tokens de entrada</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Máx. Tokens de Saída</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min="1"
                      max="32000"
                      value={formData.max_output_tokens}
                      onChange={(e) => setFormData({ ...formData, max_output_tokens: parseInt(e.target.value) || 4000 })}
                    />
                    <p className="text-xs text-muted-foreground">Número máximo de tokens de saída</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperatura</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) || 0.7 })}
                    />
                    <p className="text-xs text-muted-foreground">Criatividade da resposta (0.0 - 2.0)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topP">Top P</Label>
                    <Input
                      id="topP"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={formData.top_p}
                      onChange={(e) => setFormData({ ...formData, top_p: parseFloat(e.target.value) || 1.0 })}
                    />
                    <p className="text-xs text-muted-foreground">Amostragem nucleus (0.0 - 1.0)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topK">Top K</Label>
                    <Input
                      id="topK"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.top_k}
                      onChange={(e) => setFormData({ ...formData, top_k: parseInt(e.target.value) || 40 })}
                    />
                    <p className="text-xs text-muted-foreground">Número de tokens candidatos</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequencyPenalty">Penalidade de Frequência</Label>
                    <Input
                      id="frequencyPenalty"
                      type="number"
                      step="0.1"
                      min="-2"
                      max="2"
                      value={formData.frequency_penalty}
                      onChange={(e) => setFormData({ ...formData, frequency_penalty: parseFloat(e.target.value) || 0.0 })}
                    />
                    <p className="text-xs text-muted-foreground">Reduz repetição (-2.0 - 2.0)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="presencePenalty">Penalidade de Presença</Label>
                    <Input
                      id="presencePenalty"
                      type="number"
                      step="0.1"
                      min="-2"
                      max="2"
                      value={formData.presence_penalty}
                      onChange={(e) => setFormData({ ...formData, presence_penalty: parseFloat(e.target.value) || 0.0 })}
                    />
                    <p className="text-xs text-muted-foreground">Incentiva novos tópicos (-2.0 - 2.0)</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Seção 4: Configurações de Comportamento */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Configurações de Comportamento</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status e Prioridade */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Status e Prioridade</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Provedor Ativo</Label>
                          <p className="text-xs text-muted-foreground">
                            Habilita o uso deste provedor no sistema
                          </p>
                        </div>
                        <Switch
                          checked={formData.is_active ?? true}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Provedor Principal</Label>
                          <p className="text-xs text-muted-foreground">
                            Define como provedor padrão para novas requisições
                          </p>
                        </div>
                        <Switch
                          checked={formData.is_primary ?? false}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fallback e Recuperação */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Fallback e Recuperação</h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Fallback em Erro</Label>
                          <p className="text-xs text-muted-foreground">
                            Usar como alternativa quando outros provedores falharem
                          </p>
                        </div>
                        <Switch
                          checked={formData.fallback_on_error ?? false}
                          onCheckedChange={(checked) => setFormData({ ...formData, fallback_on_error: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Fallback em Rate Limit</Label>
                          <p className="text-xs text-muted-foreground">
                            Usar quando outros provedores atingirem limite de taxa
                          </p>
                        </div>
                        <Switch
                          checked={formData.fallback_on_rate_limit ?? true}
                          onCheckedChange={(checked) => setFormData({ ...formData, fallback_on_rate_limit: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveProvider} disabled={!formData.name || !formData.model_name || !formData.api_key_encrypted}>
                  {editingProvider ? 'Atualizar' : 'Criar'} Provedor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {providers.map((provider) => (
          <Card key={provider.id} className="grc-card relative">
            {provider.is_primary && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="h-3 w-3 mr-1" />
                  Principal
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {getProviderIcon(provider.provider_type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{provider.model_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(provider)}`}></div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge 
                  variant={provider.is_active ? "secondary" : "outline"}
                  className={provider.is_active ? "bg-green-100 text-green-800" : ""}
                >
                  {getStatusText(provider)}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Requisições</p>
                  <p className="font-medium">{provider.total_requests}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxa de Sucesso</p>
                  <p className="font-medium">
                    {provider.total_requests > 0 
                      ? Math.round((provider.successful_requests / provider.total_requests) * 100)
                      : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tempo Médio</p>
                  <p className="font-medium">{provider.avg_response_time_ms || 0}ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Custo Hoje</p>
                  <p className="font-medium">${provider.cost_usd_today?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(provider)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleProviderStatus(provider.id!, !provider.is_active)}
                  >
                    {provider.is_active ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {!provider.is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPrimaryProvider(provider.id!)}
                    >
                      <Star className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProvider(provider.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {providers.length === 0 && (
          <div className="col-span-full">
            <Card className="grc-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cpu className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Nenhum provedor configurado
                </h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Configure seu primeiro provedor de IA para começar a usar assistentes especializados em GRC
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Provedor
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};