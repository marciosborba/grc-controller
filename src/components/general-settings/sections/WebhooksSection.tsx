import React, { useState } from 'react';
import { 
  Webhook, 
  Send, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  Clock,
  Globe,
  Lock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  retryAttempts: number;
  timeout: number;
  description?: string;
  headers?: Record<string, string>;
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
  status: 'healthy' | 'warning' | 'error';
}

interface WebhookEvent {
  id: string;
  eventType: string;
  webhookId: string;
  payload: any;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  timestamp: string;
  responseCode?: number;
  responseTime?: number;
  retryCount: number;
  errorMessage?: string;
}

const WebhooksSection: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: '1',
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      events: ['risk.created', 'risk.updated', 'incident.created'],
      isActive: true,
      retryAttempts: 3,
      timeout: 30,
      description: 'Notificações de riscos e incidentes no Slack',
      lastTriggered: new Date().toISOString(),
      successCount: 234,
      failureCount: 12,
      status: 'healthy'
    },
    {
      id: '2',
      name: 'External System API',
      url: 'https://api.external-system.com/webhooks/grc',
      secret: 'webhook-secret-key',
      events: ['assessment.completed', 'compliance.updated'],
      isActive: true,
      retryAttempts: 5,
      timeout: 60,
      description: 'Integração com sistema externo de compliance',
      headers: {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json'
      },
      successCount: 89,
      failureCount: 3,
      status: 'healthy'
    }
  ]);

  const [recentEvents, setRecentEvents] = useState<WebhookEvent[]>([
    {
      id: '1',
      eventType: 'risk.created',
      webhookId: '1',
      payload: { riskId: 'RISK-001', title: 'Novo risco identificado' },
      status: 'success',
      timestamp: new Date().toISOString(),
      responseCode: 200,
      responseTime: 150,
      retryCount: 0
    },
    {
      id: '2',
      eventType: 'incident.created',
      webhookId: '1',
      payload: { incidentId: 'INC-001', severity: 'high' },
      status: 'failed',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      responseCode: 500,
      responseTime: 5000,
      retryCount: 2,
      errorMessage: 'Internal Server Error'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookEndpoint | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret: '',
    events: [] as string[],
    retryAttempts: 3,
    timeout: 30,
    description: '',
    headers: '{}'
  });

  const availableEvents = [
    { id: 'risk.created', label: 'Risco Criado', category: 'Riscos' },
    { id: 'risk.updated', label: 'Risco Atualizado', category: 'Riscos' },
    { id: 'risk.deleted', label: 'Risco Removido', category: 'Riscos' },
    { id: 'incident.created', label: 'Incidente Criado', category: 'Incidentes' },
    { id: 'incident.resolved', label: 'Incidente Resolvido', category: 'Incidentes' },
    { id: 'assessment.started', label: 'Assessment Iniciado', category: 'Assessments' },
    { id: 'assessment.completed', label: 'Assessment Concluído', category: 'Assessments' },
    { id: 'compliance.updated', label: 'Compliance Atualizado', category: 'Compliance' },
    { id: 'user.created', label: 'Usuário Criado', category: 'Usuários' },
    { id: 'policy.published', label: 'Política Publicada', category: 'Políticas' }
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      secret: '',
      events: [],
      retryAttempts: 3,
      timeout: 30,
      description: '',
      headers: '{}'
    });
    setEditingWebhook(null);
  };

  const handleEdit = (webhook: WebhookEndpoint) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret || '',
      events: webhook.events,
      retryAttempts: webhook.retryAttempts,
      timeout: webhook.timeout,
      description: webhook.description || '',
      headers: JSON.stringify(webhook.headers || {}, null, 2)
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    try {
      const newWebhook: WebhookEndpoint = {
        id: editingWebhook?.id || Date.now().toString(),
        name: formData.name,
        url: formData.url,
        secret: formData.secret || undefined,
        events: formData.events,
        isActive: true,
        retryAttempts: formData.retryAttempts,
        timeout: formData.timeout,
        description: formData.description,
        headers: JSON.parse(formData.headers),
        successCount: editingWebhook?.successCount || 0,
        failureCount: editingWebhook?.failureCount || 0,
        status: 'healthy'
      };

      if (editingWebhook) {
        setWebhooks(prev => 
          prev.map(w => w.id === editingWebhook.id ? newWebhook : w)
        );
        toast.success('Webhook atualizado com sucesso!');
      } else {
        setWebhooks(prev => [...prev, newWebhook]);
        toast.success('Novo webhook adicionado com sucesso!');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar: verifique o JSON dos headers');
    }
  };

  const handleTest = async (webhook: WebhookEndpoint) => {
    setTestingWebhook(webhook.id);
    
    // Simular teste de webhook
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3; // 70% chance de sucesso
    
    if (success) {
      setWebhooks(prev => 
        prev.map(w => 
          w.id === webhook.id 
            ? { 
                ...w, 
                lastTriggered: new Date().toISOString(),
                successCount: w.successCount + 1,
                status: 'healthy'
              } 
            : w
        )
      );
      
      // Adicionar evento de teste
      const testEvent: WebhookEvent = {
        id: Date.now().toString(),
        eventType: 'webhook.test',
        webhookId: webhook.id,
        payload: { test: true, timestamp: new Date().toISOString() },
        status: 'success',
        timestamp: new Date().toISOString(),
        responseCode: 200,
        responseTime: 150,
        retryCount: 0
      };
      
      setRecentEvents(prev => [testEvent, ...prev.slice(0, 9)]);
      toast.success(`Webhook ${webhook.name} testado com sucesso!`);
    } else {
      setWebhooks(prev => 
        prev.map(w => 
          w.id === webhook.id 
            ? { 
                ...w, 
                failureCount: w.failureCount + 1,
                status: 'error'
              } 
            : w
        )
      );
      toast.error(`Falha no teste do webhook ${webhook.name}`);
    }
    
    setTestingWebhook(null);
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecret(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'retrying':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalWebhooks = webhooks.length;
  const activeWebhooks = webhooks.filter(w => w.isActive).length;
  const totalEvents = recentEvents.length;
  const successRate = recentEvents.length > 0 
    ? (recentEvents.filter(e => e.status === 'success').length / recentEvents.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Webhook className="h-5 w-5 sm:h-6 sm:w-6" />
            Webhooks
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure notificações em tempo real para sistemas externos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWebhook ? 'Editar' : 'Novo'} Webhook
              </DialogTitle>
              <DialogDescription>
                Configure um endpoint para receber notificações de eventos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Webhook</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Ex: Slack Notifications"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL do Endpoint</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({...prev, url: e.target.value}))}
                    placeholder="https://api.exemplo.com/webhook"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secret">Chave Secreta (Opcional)</Label>
                <div className="relative">
                  <Input
                    id="secret"
                    type={showSecret[editingWebhook?.id || 'new'] ? 'text' : 'password'}
                    value={formData.secret}
                    onChange={(e) => setFormData(prev => ({...prev, secret: e.target.value}))}
                    placeholder="Chave para assinatura HMAC"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility(editingWebhook?.id || 'new')}
                  >
                    {showSecret[editingWebhook?.id || 'new'] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Eventos para Notificar</Label>
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {Object.entries(
                    availableEvents.reduce((acc, event) => {
                      if (!acc[event.category]) acc[event.category] = [];
                      acc[event.category].push(event);
                      return acc;
                    }, {} as Record<string, typeof availableEvents>)
                  ).map(([category, events]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">{category}</h4>
                      <div className="space-y-1 ml-2">
                        {events.map((event) => (
                          <div key={event.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={event.id}
                              checked={formData.events.includes(event.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  events: checked 
                                    ? [...prev.events, event.id]
                                    : prev.events.filter(id => id !== event.id)
                                }));
                              }}
                              className="rounded"
                            />
                            <Label htmlFor={event.id} className="text-sm">
                              {event.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retryAttempts">Tentativas de Retry</Label>
                  <Input
                    id="retryAttempts"
                    type="number"
                    min="0"
                    max="10"
                    value={formData.retryAttempts}
                    onChange={(e) => setFormData(prev => ({...prev, retryAttempts: parseInt(e.target.value)}))}
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (segundos)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="5"
                    max="300"
                    value={formData.timeout}
                    onChange={(e) => setFormData(prev => ({...prev, timeout: parseInt(e.target.value)}))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headers">Headers Customizados (JSON)</Label>
                <Textarea
                  id="headers"
                  value={formData.headers}
                  onChange={(e) => setFormData(prev => ({...prev, headers: e.target.value}))}
                  placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                  className="font-mono text-sm"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Descreva o propósito deste webhook..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingWebhook ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Webhooks Ativos</CardTitle>
            <Webhook className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{activeWebhooks}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              de {totalWebhooks} configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Eventos Hoje</CardTitle>
            <Send className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{totalEvents}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              enviados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{Math.round(successRate)}%</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Tempo Resposta</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">150ms</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Zap className="h-4 w-4" />
        <AlertTitle>Webhooks Seguros</AlertTitle>
        <AlertDescription>
          Use sempre HTTPS para URLs de webhook e implemente verificação de assinatura 
          HMAC quando possível. Configure timeouts apropriados para evitar bloqueios.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Endpoints Configurados</h3>
          
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Webhook className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">{webhook.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm break-all">
                        {webhook.url}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(webhook.status)}
                    <Switch checked={webhook.isActive} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {webhook.description && (
                  <p className="text-sm text-muted-foreground">{webhook.description}</p>
                )}

                <div className="flex flex-wrap gap-1">
                  {webhook.events.slice(0, 3).map((event) => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {availableEvents.find(e => e.id === event)?.label || event}
                    </Badge>
                  ))}
                  {webhook.events.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{webhook.events.length - 3} mais
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sucessos:</span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {webhook.successCount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Falhas:</span>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {webhook.failureCount}
                    </Badge>
                  </div>
                </div>

                {webhook.lastTriggered && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Último envio:</span>
                    <span className="text-xs">
                      {new Date(webhook.lastTriggered).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(webhook)}
                    disabled={testingWebhook === webhook.id}
                    className="flex items-center gap-1"
                  >
                    <TestTube className="h-3 w-3" />
                    {testingWebhook === webhook.id ? 'Testando...' : 'Testar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(webhook)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Editar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setWebhooks(prev => prev.filter(w => w.id !== webhook.id));
                      toast.success('Webhook removido com sucesso!');
                    }}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remover
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {webhooks.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum webhook configurado</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione seu primeiro webhook para começar a receber notificações
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Webhook
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Events */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Eventos Recentes</h3>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Últimas Entregas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {recentEvents.slice(0, 10).map((event) => (
                <div key={event.id} className={`p-3 rounded-lg border ${getEventStatusColor(event.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {availableEvents.find(e => e.id === event.eventType)?.label || event.eventType}
                    </Badge>
                    <span className="text-xs">
                      {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize font-medium">{event.status}</span>
                    {event.responseCode && (
                      <span>HTTP {event.responseCode}</span>
                    )}
                  </div>
                  
                  {event.responseTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.responseTime}ms
                    </div>
                  )}
                  
                  {event.errorMessage && (
                    <div className="text-xs text-red-600 mt-1 truncate">
                      {event.errorMessage}
                    </div>
                  )}
                </div>
              ))}
              
              {recentEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Nenhum evento recente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WebhooksSection;