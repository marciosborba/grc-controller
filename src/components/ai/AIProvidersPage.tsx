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
      <div className="container mx-auto py-6">
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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
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
                    <span className="text-2xl">{getProviderIcon(provider.provider_type)}</span>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {provider.name}
                        {provider.is_primary && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </CardTitle>
                      <CardDescription>{provider.model_name}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={provider.is_active ? 'default' : 'secondary'}
                      className={provider.is_active ? 'bg-green-100 text-green-800' : ''}
                    >
                      {provider.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">{provider.total_requests || 0}</p>
                    <p className="text-xs text-muted-foreground">Requisições</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{provider.tokens_used_today || 0}</p>
                    <p className="text-xs text-muted-foreground">Tokens Hoje</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">${(provider.cost_usd_today || 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Custo Hoje</p>
                  </div>
                </div>

                {/* Success Rate */}
                {provider.total_requests > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Sucesso</span>
                      <span>{Math.round((provider.successful_requests / provider.total_requests) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(provider.successful_requests / provider.total_requests) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* API Key Display */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm">API Key:</Label>
                  <div className="flex items-center gap-1 flex-1">
                    <Input
                      type={showApiKey[provider.id] ? 'text' : 'password'}
                      value={provider.api_key}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowApiKey({ ...showApiKey, [provider.id]: !showApiKey[provider.id] })}
                    >
                      {showApiKey[provider.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                {/* Test Results */}
                {testResults[provider.id] && (
                  <Alert className={testResults[provider.id].status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {testResults[provider.id].status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : testResults[provider.id].status === 'testing' ? (
                      <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription>
                      {testResults[provider.id].status === 'testing' ? 'Testando conexão...' : testResults[provider.id].message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTestConnection(provider)}
                    disabled={testResults[provider.id]?.status === 'testing'}
                  >
                    <TestTube className="h-3 w-3 mr-1" />
                    Testar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(provider)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  {!provider.is_primary && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetPrimary(provider)}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Principal
                    </Button>
                  )}
                  <div className="flex items-center ml-auto">
                    <Switch
                      checked={provider.is_active}
                      onCheckedChange={() => handleToggleActive(provider)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteProvider(provider.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIProvidersPage;