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
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  const [formData, setFormData] = useState<Partial<AIProvider>>({
    name: '',
    provider_type: 'claude',
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
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
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
      const providerData = {
        ...formData,
        tenant_id: user?.tenant?.id,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

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
    } catch (error) {
      console.error('Erro ao salvar provedor:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar provedor',
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
        .eq('tenant_id', user?.tenant?.id);

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

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'claude': return '🤖';
      case 'openai': return '🧠';
      case 'azure-openai': return '☁️';
      case 'google-palm': return '🔍';
      case 'llama': return '🦙';
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
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do provedor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="providerType">Tipo de Provedor</Label>
                  <Select 
                    value={formData.provider_type} 
                    onValueChange={(value) => setFormData({ ...formData, provider_type: value })}
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
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelName">Nome do Modelo</Label>
                  <Input
                    id="modelName"
                    value={formData.model_name}
                    onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                    placeholder="ex: claude-3-5-sonnet, gpt-4-turbo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">Chave da API</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.api_key_encrypted}
                    onChange={(e) => setFormData({ ...formData, api_key_encrypted: e.target.value })}
                    placeholder="Chave de API do provedor"
                  />
                </div>
              </div>

              {/* Advanced Config */}
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contextWindow">Janela de Contexto</Label>
                  <Input
                    id="contextWindow"
                    type="number"
                    value={formData.context_window}
                    onChange={(e) => setFormData({ ...formData, context_window: parseInt(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Máx. Tokens de Saída</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={formData.max_output_tokens}
                    onChange={(e) => setFormData({ ...formData, max_output_tokens: parseInt(e.target.value) })}
                  />
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
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Ativo</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Provedor Principal</Label>
                  <Switch
                    checked={formData.is_primary}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Fallback em Erro</Label>
                  <Switch
                    checked={formData.fallback_on_error}
                    onCheckedChange={(checked) => setFormData({ ...formData, fallback_on_error: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Fallback em Rate Limit</Label>
                  <Switch
                    checked={formData.fallback_on_rate_limit}
                    onCheckedChange={(checked) => setFormData({ ...formData, fallback_on_rate_limit: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={saveProvider}>
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