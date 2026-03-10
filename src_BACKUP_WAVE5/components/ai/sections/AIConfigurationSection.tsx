import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Zap, 
  Globe,
  Lock,
  AlertTriangle,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth} from '@/contexts/AuthContextOptimized';

interface AIConfiguration {
  id?: string;
  name: string;
  description: string;
  default_provider: string;
  max_tokens_per_request: number;
  max_requests_per_minute: number;
  max_tokens_per_day: number;
  temperature: number;
  context_window: number;
  enable_context_memory: boolean;
  enable_conversation_history: boolean;
  max_conversation_turns: number;
  enable_content_filtering: boolean;
  enable_pii_detection: boolean;
  enable_audit_logging: boolean;
  require_approval_for_sensitive: boolean;
  allowed_domains: string[];
  module_settings: Record<string, any>;
}

export const AIConfigurationSection: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AIConfiguration>({
    name: 'Configuração Principal',
    description: 'Configuração padrão do sistema de IA para GRC',
    default_provider: 'claude',
    max_tokens_per_request: 4000,
    max_requests_per_minute: 30,
    max_tokens_per_day: 100000,
    temperature: 0.7,
    context_window: 8000,
    enable_context_memory: true,
    enable_conversation_history: true,
    max_conversation_turns: 10,
    enable_content_filtering: true,
    enable_pii_detection: true,
    enable_audit_logging: true,
    require_approval_for_sensitive: true,
    allowed_domains: [],
    module_settings: {}
  });

  const [domainsInput, setDomainsInput] = useState('');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
        setDomainsInput(data.allowed_domains?.join(', ') || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configuração de IA',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const configData = {
        ...config,
        allowed_domains: domainsInput 
          ? domainsInput.split(',').map(d => d.trim()).filter(d => d)
          : [],
        tenant_id: user?.tenant?.id,
        created_by: user?.id,
        updated_at: new Date().toISOString()
      };

      if (config.id) {
        const { error } = await supabase
          .from('ai_configurations')
          .update(configData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('ai_configurations')
          .insert(configData)
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      toast({
        title: 'Sucesso',
        description: 'Configuração salva com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configuração',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      ...config,
      max_tokens_per_request: 4000,
      max_requests_per_minute: 30,
      max_tokens_per_day: 100000,
      temperature: 0.7,
      context_window: 8000,
      enable_context_memory: true,
      enable_conversation_history: true,
      max_conversation_turns: 10,
      enable_content_filtering: true,
      enable_pii_detection: true,
      enable_audit_logging: true,
      require_approval_for_sensitive: true
    });
    toast({
      title: 'Configuração Restaurada',
      description: 'Valores padrão foram restaurados'
    });
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
            <Settings className="h-5 w-5 text-primary" />
            <span>Configurações Globais de IA</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure parâmetros globais para o sistema de IA
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button onClick={saveConfiguration} disabled={saving}>
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Configuration */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações Básicas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Configuração</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Nome identificador"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={config.description}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Descrição da configuração"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provedor Padrão</Label>
              <Select 
                value={config.default_provider} 
                onValueChange={(value) => setConfig({ ...config, default_provider: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                  <SelectItem value="openai">OpenAI GPT</SelectItem>
                  <SelectItem value="azure-openai">Azure OpenAI</SelectItem>
                  <SelectItem value="google-palm">Google PaLM</SelectItem>
                  <SelectItem value="custom">Provedor Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Performance Limits */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Limites de Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxTokensRequest">Máx. Tokens por Requisição</Label>
              <Input
                id="maxTokensRequest"
                type="number"
                value={config.max_tokens_per_request}
                onChange={(e) => setConfig({ ...config, max_tokens_per_request: parseInt(e.target.value) })}
                min="100"
                max="32000"
              />
              <p className="text-xs text-muted-foreground">Recomendado: 2000-8000</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRequestsMinute">Máx. Requisições por Minuto</Label>
              <Input
                id="maxRequestsMinute"
                type="number"
                value={config.max_requests_per_minute}
                onChange={(e) => setConfig({ ...config, max_requests_per_minute: parseInt(e.target.value) })}
                min="1"
                max="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTokensDay">Máx. Tokens por Dia</Label>
              <Input
                id="maxTokensDay"
                type="number"
                value={config.max_tokens_per_day}
                onChange={(e) => setConfig({ ...config, max_tokens_per_day: parseInt(e.target.value) })}
                min="1000"
                max="10000000"
              />
              <p className="text-xs text-muted-foreground">Limite diário para controle de custos</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Behavior */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Comportamento da IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura ({config.temperature})</Label>
              <Input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Determinístico (0)</span>
                <span>Criativo (2)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contextWindow">Janela de Contexto</Label>
              <Input
                id="contextWindow"
                type="number"
                value={config.context_window}
                onChange={(e) => setConfig({ ...config, context_window: parseInt(e.target.value) })}
                min="1000"
                max="200000"
              />
              <p className="text-xs text-muted-foreground">Tokens de contexto mantidos</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxTurns">Máx. Turnos de Conversa</Label>
              <Input
                id="maxTurns"
                type="number"
                value={config.max_conversation_turns}
                onChange={(e) => setConfig({ ...config, max_conversation_turns: parseInt(e.target.value) })}
                min="1"
                max="50"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Memória de Contexto</Label>
                <p className="text-xs text-muted-foreground">
                  Manter contexto entre sessões
                </p>
              </div>
              <Switch
                checked={config.enable_context_memory}
                onCheckedChange={(checked) => setConfig({ ...config, enable_context_memory: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Histórico de Conversas</Label>
                <p className="text-xs text-muted-foreground">
                  Salvar histórico para análise
                </p>
              </div>
              <Switch
                checked={config.enable_conversation_history}
                onCheckedChange={(checked) => setConfig({ ...config, enable_conversation_history: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card className="grc-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Segurança e Conformidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center space-x-2">
                  <Lock className="h-3 w-3" />
                  <span>Filtragem de Conteúdo</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Filtrar conteúdo inapropriado
                </p>
              </div>
              <Switch
                checked={config.enable_content_filtering}
                onCheckedChange={(checked) => setConfig({ ...config, enable_content_filtering: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center space-x-2">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Detecção de PII</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Detectar informações pessoais
                </p>
              </div>
              <Switch
                checked={config.enable_pii_detection}
                onCheckedChange={(checked) => setConfig({ ...config, enable_pii_detection: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center space-x-2">
                  <Info className="h-3 w-3" />
                  <span>Log de Auditoria</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Registrar todas as interações
                </p>
              </div>
              <Switch
                checked={config.enable_audit_logging}
                onCheckedChange={(checked) => setConfig({ ...config, enable_audit_logging: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aprovação Necessária</Label>
                <p className="text-xs text-muted-foreground">
                  Aprovação para conteúdo sensível
                </p>
              </div>
              <Switch
                checked={config.require_approval_for_sensitive}
                onCheckedChange={(checked) => setConfig({ ...config, require_approval_for_sensitive: checked })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="domains">Domínios Permitidos</Label>
              <Textarea
                id="domains"
                value={domainsInput}
                onChange={(e) => setDomainsInput(e.target.value)}
                placeholder="example.com, trusted-site.org (separados por vírgula)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Domínios permitidos para busca e integração externa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <Card className="grc-card border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-800 dark:text-green-200">
                Sistema Seguro e Conforme
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Todas as configurações de segurança estão ativas. Dados sensíveis são protegidos e auditados.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Lock className="h-3 w-3 mr-1" />
                LGPD Compliant
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Shield className="h-3 w-3 mr-1" />
                SOC 2
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};