import React, { useState } from 'react';
import { 
  Plus, 
  Plug, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Globe,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useApiConnections } from '@/hooks/useApiConnections';
import type { ApiConnectionFormData } from '@/types/general-settings';

const APIIntegrationsSection: React.FC = () => {
  const {
    connections,
    metrics,
    isLoading,
    error,
    createConnection,
    deleteConnection,
    testConnection,
    refreshAll
  } = useApiConnections();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ApiConnectionFormData>({
    name: '',
    api_type: 'rest',
    base_url: '',
    auth_type: 'none',
    api_key: '',
    bearer_token: '',
    username: '',
    password: '',
    headers: {},
    rate_limit_per_minute: 60,
    timeout_seconds: 30,
    retry_attempts: 3,
    retry_delay_seconds: 5
  });

  const resetForm = () => {
    setFormData({
      name: '',
      api_type: 'rest',
      base_url: '',
      auth_type: 'none',
      api_key: '',
      bearer_token: '',
      username: '',
      password: '',
      headers: {},
      rate_limit_per_minute: 60,
      timeout_seconds: 30,
      retry_attempts: 3,
      retry_delay_seconds: 5
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.base_url) {
        toast.error('Nome e URL base são obrigatórios');
        return;
      }

      const result = await createConnection(formData);
      if (result) {
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success('Conexão criada com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao salvar conexão');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta conexão?')) {
      const success = await deleteConnection(id);
      if (success) {
        toast.success('Conexão removida com sucesso!');
      }
    }
  };

  const handleTest = async (id: string) => {
    setTestingConnection(id);
    try {
      const result = await testConnection(id);
      if (result.success) {
        toast.success(`Teste bem-sucedido! Tempo de resposta: ${result.response_time_ms}ms`);
      } else {
        toast.error(`Teste falhado: ${result.error_message}`);
      }
    } catch (error) {
      toast.error('Erro ao testar conexão');
    } finally {
      setTestingConnection(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconectado</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Integrações de APIs
          </h2>
          <p className="text-muted-foreground text-sm">
            Configure conexões com APIs REST, GraphQL e SOAP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAll}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova API
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Conexão de API</DialogTitle>
                <DialogDescription>
                  Configure uma nova conexão com API externa
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Conexão</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ex: Slack API"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo da API</Label>
                    <Select value={formData.api_type} onValueChange={(value: any) => setFormData({ ...formData, api_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rest">REST</SelectItem>
                        <SelectItem value="graphql">GraphQL</SelectItem>
                        <SelectItem value="soap">SOAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="baseUrl">URL Base</Label>
                  <Input
                    id="baseUrl"
                    value={formData.base_url}
                    onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                    placeholder="https://api.exemplo.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="authType">Tipo de Autenticação</Label>
                    <Select value={formData.auth_type} onValueChange={(value: any) => setFormData({ ...formData, auth_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem autenticação</SelectItem>
                        <SelectItem value="api-key">API Key</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rateLimit">Rate Limit (req/min)</Label>
                    <Input
                      id="rateLimit"
                      type="number"
                      value={formData.rate_limit_per_minute}
                      onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {formData.auth_type === 'api-key' && (
                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.api_key}
                      onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                      placeholder="Sua API Key"
                    />
                  </div>
                )}

                {formData.auth_type === 'bearer' && (
                  <div>
                    <Label htmlFor="bearerToken">Bearer Token</Label>
                    <Input
                      id="bearerToken"
                      type="password"
                      value={formData.bearer_token}
                      onChange={(e) => setFormData({ ...formData, bearer_token: e.target.value })}
                      placeholder="Seu Bearer Token"
                    />
                  </div>
                )}

                {formData.auth_type === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Usuário</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  Salvar Conexão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_requests}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.requests_today} hoje
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.success_rate)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.successful_requests} sucessos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.avg_response_time)}ms</div>
              <p className="text-xs text-muted-foreground">
                tempo de resposta
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.failed_requests}</div>
              <p className="text-xs text-muted-foreground">
                requests com erro
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connections List */}
      <div className="space-y-4">
        {connections.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma API configurada</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando sua primeira integração de API
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar primeira API
              </Button>
            </CardContent>
          </Card>
        ) : (
          connections.map((connection) => (
            <Card key={connection.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(connection.integrations.status)}
                    <div>
                      <h3 className="font-semibold">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {connection.api_type.toUpperCase()} • {connection.base_url}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(connection.integrations.status)}
                        <Badge variant="outline" className="text-xs">
                          {connection.auth_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(connection.id)}
                      disabled={testingConnection === connection.id}
                    >
                      {testingConnection === connection.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(connection.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Connection Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{connection.total_requests}</div>
                    <div className="text-xs text-muted-foreground">Total Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{connection.successful_requests}</div>
                    <div className="text-xs text-muted-foreground">Sucessos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{Math.round(connection.avg_response_time_ms || 0)}ms</div>
                    <div className="text-xs text-muted-foreground">Tempo Médio</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default APIIntegrationsSection;