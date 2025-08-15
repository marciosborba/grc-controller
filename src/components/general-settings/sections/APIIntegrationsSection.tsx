import React, { useState } from 'react';
import { 
  Plus, 
  Plug, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  Globe,
  Key,
  Clock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface APIConnection {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'soap';
  baseUrl: string;
  apiKey?: string;
  authType: 'none' | 'api-key' | 'bearer' | 'basic' | 'oauth2';
  status: 'connected' | 'disconnected' | 'error';
  lastTested?: string;
  description?: string;
  headers?: Record<string, string>;
  isActive: boolean;
  rateLimitPerHour?: number;
}

const APIIntegrationsSection: React.FC = () => {
  const [connections, setConnections] = useState<APIConnection[]>([
    {
      id: '1',
      name: 'Slack API',
      type: 'rest',
      baseUrl: 'https://slack.com/api',
      authType: 'bearer',
      status: 'connected',
      lastTested: new Date().toISOString(),
      description: 'Integração com Slack para notificações',
      isActive: true,
      rateLimitPerHour: 1000
    },
    {
      id: '2',
      name: 'Microsoft Graph API',
      type: 'rest',
      baseUrl: 'https://graph.microsoft.com/v1.0',
      authType: 'oauth2',
      status: 'disconnected',
      description: 'Acesso a dados do Microsoft 365',
      isActive: false,
      rateLimitPerHour: 5000
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<APIConnection | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'rest' as const,
    baseUrl: '',
    authType: 'none' as const,
    apiKey: '',
    username: '',
    password: '',
    description: '',
    rateLimitPerHour: 1000,
    headers: '{}'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'rest',
      baseUrl: '',
      authType: 'none',
      apiKey: '',
      username: '',
      password: '',
      description: '',
      rateLimitPerHour: 1000,
      headers: '{}'
    });
    setEditingConnection(null);
  };

  const handleEdit = (connection: APIConnection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      type: connection.type,
      baseUrl: connection.baseUrl,
      authType: connection.authType,
      apiKey: connection.apiKey || '',
      username: '',
      password: '',
      description: connection.description || '',
      rateLimitPerHour: connection.rateLimitPerHour || 1000,
      headers: JSON.stringify(connection.headers || {}, null, 2)
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    try {
      const newConnection: APIConnection = {
        id: editingConnection?.id || Date.now().toString(),
        name: formData.name,
        type: formData.type,
        baseUrl: formData.baseUrl,
        authType: formData.authType,
        apiKey: formData.apiKey || undefined,
        status: 'disconnected',
        description: formData.description,
        headers: JSON.parse(formData.headers),
        isActive: true,
        rateLimitPerHour: formData.rateLimitPerHour
      };

      if (editingConnection) {
        setConnections(prev => 
          prev.map(conn => conn.id === editingConnection.id ? newConnection : conn)
        );
        toast.success('Conexão atualizada com sucesso!');
      } else {
        setConnections(prev => [...prev, newConnection]);
        toast.success('Nova conexão adicionada com sucesso!');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar: verifique o JSON dos headers');
    }
  };

  const handleDelete = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    toast.success('Conexão removida com sucesso!');
  };

  const handleTest = async (connection: APIConnection) => {
    setTestingConnection(connection.id);
    
    // Simular teste de conexão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.3; // 70% chance de sucesso
    
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connection.id 
          ? { 
              ...conn, 
              status: success ? 'connected' : 'error',
              lastTested: new Date().toISOString()
            } 
          : conn
      )
    );
    
    setTestingConnection(null);
    
    if (success) {
      toast.success(`Conexão com ${connection.name} testada com sucesso!`);
    } else {
      toast.error(`Falha na conexão com ${connection.name}`);
    }
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Conectado</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Erro</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Desconectado</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Plug className="h-5 w-5 sm:h-6 sm:w-6" />
            Integrações de APIs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure conexões com APIs REST, GraphQL e SOAP
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingConnection ? 'Editar' : 'Nova'} Integração de API
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes da conexão com a API externa
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="auth">Autenticação</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Integração</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      placeholder="Ex: Slack API"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de API</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'rest' | 'graphql' | 'soap') => 
                        setFormData(prev => ({...prev, type: value}))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rest">REST API</SelectItem>
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
                    value={formData.baseUrl}
                    onChange={(e) => setFormData(prev => ({...prev, baseUrl: e.target.value}))}
                    placeholder="https://api.exemplo.com/v1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Descreva o propósito desta integração..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="auth" className="space-y-4">
                <div>
                  <Label htmlFor="authType">Tipo de Autenticação</Label>
                  <Select 
                    value={formData.authType} 
                    onValueChange={(value: any) => setFormData(prev => ({...prev, authType: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="api-key">API Key</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.authType === 'api-key' || formData.authType === 'bearer') && (
                  <div>
                    <Label htmlFor="apiKey">
                      {formData.authType === 'api-key' ? 'API Key' : 'Bearer Token'}
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({...prev, apiKey: e.target.value}))}
                      placeholder="Sua chave de API..."
                    />
                  </div>
                )}

                {formData.authType === 'basic' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="username">Usuário</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({...prev, username: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div>
                  <Label htmlFor="rateLimitPerHour">Limite de Requisições por Hora</Label>
                  <Input
                    id="rateLimitPerHour"
                    type="number"
                    value={formData.rateLimitPerHour}
                    onChange={(e) => setFormData(prev => ({...prev, rateLimitPerHour: parseInt(e.target.value)}))}
                  />
                </div>

                <div>
                  <Label htmlFor="headers">Headers Customizados (JSON)</Label>
                  <Textarea
                    id="headers"
                    value={formData.headers}
                    onChange={(e) => setFormData(prev => ({...prev, headers: e.target.value}))}
                    placeholder='{"Content-Type": "application/json"}'
                    className="font-mono text-sm"
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingConnection ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Globe className="h-4 w-4" />
        <AlertTitle>Dica de Segurança</AlertTitle>
        <AlertDescription>
          Use variáveis de ambiente para armazenar chaves de API sensíveis. 
          Nunca exponha credenciais em logs ou interfaces públicas.
        </AlertDescription>
      </Alert>

      {/* Connections List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {connections.map((connection) => (
          <Card key={connection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">{connection.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {connection.type.toUpperCase()} • {connection.baseUrl}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(connection.status)}
                  <Switch checked={connection.isActive} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(connection.status)}
              </div>

              {connection.authType !== 'none' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Autenticação:</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {connection.authType.toUpperCase()}
                  </Badge>
                </div>
              )}

              {connection.rateLimitPerHour && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate Limit:</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {connection.rateLimitPerHour}/h
                  </Badge>
                </div>
              )}

              {connection.lastTested && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Último teste:</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(connection.lastTested).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}

              {connection.description && (
                <p className="text-sm text-muted-foreground">{connection.description}</p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest(connection)}
                  disabled={testingConnection === connection.id}
                  className="flex items-center gap-1"
                >
                  <TestTube className="h-3 w-3" />
                  {testingConnection === connection.id ? 'Testando...' : 'Testar'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(connection)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(connection.baseUrl)}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copiar URL
                </Button>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(connection.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {connections.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Nenhuma integração configurada</h3>
            <p className="text-muted-foreground mb-4">
              Adicione sua primeira integração de API para começar
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Integração
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default APIIntegrationsSection;