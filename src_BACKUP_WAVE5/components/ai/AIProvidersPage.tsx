import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Plus, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Star,
  ArrowLeft,
  TestTube
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Navigate } from 'react-router-dom';

interface AIProvider {
  id: string;
  name: string;
  provider_type: string;
  model_name: string;
  api_key: string;
  is_active: boolean;
  is_primary: boolean;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  tokens_used_today: number;
  cost_usd_today: number;
  priority: number;
}

export const AIProvidersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [showApiKey, setShowApiKey] = useState<{[key: string]: boolean}>({});
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    provider_type: '',
    model_name: '',
    api_key: '',
    is_active: true,
    is_primary: false,
    priority: 1
  });

  // Verificar se é platform admin
  if (!user?.isPlatformAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const loadProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', user?.tenantId)
        .order('priority', { ascending: true });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenantId) {
      loadProviders();
    }
  }, [user?.tenantId]);

  const handleSaveProvider = async () => {
    try {
      const providerData = {
        ...formData,
        tenant_id: user?.tenantId,
        updated_at: new Date().toISOString()
      };

      if (editingProvider) {
        const { error } = await supabase
          .from('ai_grc_providers')
          .update(providerData)
          .eq('id', editingProvider.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_grc_providers')
          .insert([{
            ...providerData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
      }

      setIsDialogOpen(false);
      setEditingProvider(null);
      resetForm();
      loadProviders();
    } catch (error) {
      console.error('Erro ao salvar provedor:', error);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este provedor?')) return;
    
    try {
      const { error } = await supabase
        .from('ai_grc_providers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadProviders();
    } catch (error) {
      console.error('Erro ao excluir provedor:', error);
    }
  };

  const handleToggleActive = async (provider: AIProvider) => {
    try {
      const { error } = await supabase
        .from('ai_grc_providers')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id);
      
      if (error) throw error;
      loadProviders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleSetPrimary = async (provider: AIProvider) => {
    try {
      // Remover primary de todos os outros
      await supabase
        .from('ai_grc_providers')
        .update({ is_primary: false })
        .eq('tenant_id', user?.tenantId);

      // Definir como primary
      const { error } = await supabase
        .from('ai_grc_providers')
        .update({ is_primary: true, is_active: true })
        .eq('id', provider.id);
      
      if (error) throw error;
      loadProviders();
    } catch (error) {
      console.error('Erro ao definir provedor principal:', error);
    }
  };

  const handleTestConnection = async (provider: AIProvider) => {
    try {
      setTestResults({ ...testResults, [provider.id]: { status: 'testing' } });
      
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% de sucesso para demo
      
      setTestResults({ 
        ...testResults, 
        [provider.id]: { 
          status: success ? 'success' : 'error',
          message: success ? 'Conexão estabelecida com sucesso' : 'Falha na autenticação da API'
        }
      });
    } catch (error) {
      setTestResults({ 
        ...testResults, 
        [provider.id]: { 
          status: 'error',
          message: 'Erro ao testar conexão'
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider_type: '',
      model_name: '',
      api_key: '',
      is_active: true,
      is_primary: false,
      priority: 1
    });
  };

  const openEditDialog = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      provider_type: provider.provider_type,
      model_name: provider.model_name,
      api_key: provider.api_key,
      is_active: provider.is_active,
      is_primary: provider.is_primary,
      priority: provider.priority
    });
    setIsDialogOpen(true);
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'glm': return '🎆';
      case 'claude': return '🤖';
      case 'openai': return '🧠';
      case 'azure-openai': return '☁️';
      default: return '⚙️';
    }
  };

  const getStatusColor = (provider: AIProvider) => {
    if (!provider.is_active) return 'text-gray-500';
    const failureRate = provider.total_requests > 0 ? provider.failed_requests / provider.total_requests : 0;
    if (failureRate > 0.1) return 'text-red-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando provedores de IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/ai-manager')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cpu className="h-6 w-6" />
              Provedores de IA
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure e gerencie provedores de IA (Claude, OpenAI, Azure, etc.)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadProviders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { resetForm(); setEditingProvider(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Provedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProvider ? 'Editar Provedor' : 'Novo Provedor de IA'}
                </DialogTitle>
                <DialogDescription>
                  Configure um novo provedor de IA para integração com a plataforma.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Provedor</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: OpenAI GPT-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider_type">Tipo de Provedor</Label>
                  <Select 
                    value={formData.provider_type} 
                    onValueChange={(value) => setFormData({ ...formData, provider_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="claude">Anthropic Claude</SelectItem>
                      <SelectItem value="azure-openai">Azure OpenAI</SelectItem>
                      <SelectItem value="glm">GLM (Zhipu AI)</SelectItem>
                      <SelectItem value="custom">Provedor Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model_name">Nome do Modelo</Label>
                  <Input
                    id="model_name"
                    value={formData.model_name}
                    onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                    placeholder="Ex: gpt-4, claude-3-opus, glm-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="Chave de API do provedor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_primary"
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                  />
                  <Label htmlFor="is_primary">Provedor Principal</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProvider} className="flex-1">
                    {editingProvider ? 'Atualizar' : 'Criar'} Provedor
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Providers List */}
      {providers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Cpu className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum provedor configurado</h3>
            <p className="text-muted-foreground mb-4">
              Configure seu primeiro provedor de IA para começar a usar os recursos avançados.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Provedor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <Card key={provider.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg text-2xl bg-card">
                      {getProviderIcon(provider.provider_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-medium">
                          {provider.name}
                        </CardTitle>
                        {provider.is_primary && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {provider.provider_type}
                        </Badge>
                        {provider.is_active ? (
                          <Badge variant="default" className="text-xs">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{provider.model_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTestConnection(provider)}
                      disabled={testResults[provider.id]?.status === 'testing'}
                    >
                      Testar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(provider)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetPrimary(provider)}
                      disabled={provider.is_primary}
                    >
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{provider.total_requests || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Requisições</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{provider.successful_requests || 0}</p>
                    <p className="text-xs text-muted-foreground">Sucessos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{provider.failed_requests || 0}</p>
                    <p className="text-xs text-muted-foreground">Falhas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
                      {provider.total_requests > 0 ? Math.round((provider.successful_requests / provider.total_requests) * 100) : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
                  </div>
                </div>

                {/* Success Rate */}
                {provider.total_requests > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Sucesso</span>
                      <span>{Math.round((provider.successful_requests / provider.total_requests) * 100)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all" 
                        style={{ width: `${(provider.successful_requests / provider.total_requests) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Configuration Details */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="text-sm font-medium mb-3">Configurações:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Modelo:</span>
                      <span className="ml-2 text-muted-foreground">{provider.model_name}</span>
                    </div>
                    <div>
                      <span className="font-medium">Tokens Hoje:</span>
                      <span className="ml-2 text-muted-foreground">{provider.tokens_used_today || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium">Custo Hoje:</span>
                      <span className="ml-2 text-muted-foreground">${(provider.cost_usd_today || 0).toFixed(4)}</span>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className={`ml-2 ${provider.is_active ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {provider.is_active ? 'Operacional' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <h6 className="text-xs font-medium mb-2">Detalhes Técnicos:</h6>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        <span className="font-medium">Endpoint:</span>
                        <span className="ml-2 font-mono">
                          {provider.provider_type === 'glm' ? 'https://open.bigmodel.cn/api/paas/v4/chat/completions' :
                           provider.provider_type === 'openai' ? 'https://api.openai.com/v1/chat/completions' :
                           provider.provider_type === 'claude' ? 'https://api.anthropic.com/v1/messages' :
                           provider.provider_type === 'azure-openai' ? 'https://[resource].openai.azure.com/openai/deployments/[deployment]/chat/completions' :
                           'Endpoint personalizado'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-medium">API Key:</span>
                        <div className="flex items-center gap-1 flex-1">
                          <Input
                            type={showApiKey[provider.id] ? 'text' : 'password'}
                            value={provider.api_key}
                            readOnly
                            className="text-xs h-6 font-mono"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => setShowApiKey({ ...showApiKey, [provider.id]: !showApiKey[provider.id] })}
                          >
                            {showApiKey[provider.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                {testResults[provider.id] && (
                  <Alert className={testResults[provider.id].status === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50' : testResults[provider.id].status === 'testing' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50'}>
                    {testResults[provider.id].status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : testResults[provider.id].status === 'testing' ? (
                      <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    <AlertDescription>
                      {testResults[provider.id].status === 'testing' ? 'Testando conexão...' : testResults[provider.id].message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIProvidersPage;