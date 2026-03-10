import React, { useState } from 'react';
import { 
  Mail, 
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
  Server,
  Cloud,
  Shield,
  Clock
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
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface EmailProvider {
  id: string;
  name: string;
  type: 'smtp' | 'sendgrid' | 'aws-ses' | 'mailgun' | 'custom';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  status: 'connected' | 'disconnected' | 'error';
  isActive: boolean;
  isDefault: boolean;
  emailsSentToday: number;
  monthlyLimit?: number;
  lastUsed?: string;
  encryption: 'none' | 'tls' | 'ssl';
  description?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category: 'notification' | 'alert' | 'report' | 'welcome' | 'custom';
  isActive: boolean;
  usageCount: number;
  variables: string[];
}

const EmailServiceSection: React.FC = () => {
  const [providers, setProviders] = useState<EmailProvider[]>([
    {
      id: '1',
      name: 'SMTP Corporativo',
      type: 'smtp',
      host: 'smtp.empresa.com',
      port: 587,
      username: 'grc@empresa.com',
      fromEmail: 'grc@empresa.com',
      fromName: 'GRC Controller',
      status: 'connected',
      isActive: true,
      isDefault: true,
      emailsSentToday: 23,
      monthlyLimit: 5000,
      lastUsed: new Date().toISOString(),
      encryption: 'tls',
      description: 'Servidor SMTP principal da empresa'
    },
    {
      id: '2',
      name: 'SendGrid',
      type: 'sendgrid',
      fromEmail: 'notifications@empresa.com',
      fromName: 'GRC Notifications',
      status: 'disconnected',
      isActive: false,
      isDefault: false,
      emailsSentToday: 0,
      monthlyLimit: 100000,
      encryption: 'tls',
      description: 'Backup para alto volume de emails'
    }
  ]);

  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Alerta de Risco Crítico',
      subject: '[CRÍTICO] Novo risco identificado: {{risk_title}}',
      htmlContent: '<h2>Alerta de Risco Crítico</h2><p>Um novo risco crítico foi identificado: <strong>{{risk_title}}</strong></p>',
      textContent: 'Alerta de Risco Crítico\n\nUm novo risco crítico foi identificado: {{risk_title}}',
      category: 'alert',
      isActive: true,
      usageCount: 45,
      variables: ['risk_title', 'risk_description', 'owner_name']
    },
    {
      id: '2',
      name: 'Relatório Semanal',
      subject: 'Relatório Semanal de GRC - {{week_date}}',
      htmlContent: '<h2>Relatório Semanal</h2><p>Resumo das atividades de GRC da semana {{week_date}}</p>',
      textContent: 'Relatório Semanal\n\nResumo das atividades de GRC da semana {{week_date}}',
      category: 'report',
      isActive: true,
      usageCount: 12,
      variables: ['week_date', 'total_risks', 'completed_assessments']
    }
  ]);

  const [activeTab, setActiveTab] = useState('providers');
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<EmailProvider | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const [providerForm, setProviderForm] = useState({
    name: '',
    type: 'smtp' as const,
    host: '',
    port: 587,
    username: '',
    password: '',
    apiKey: '',
    fromEmail: '',
    fromName: '',
    monthlyLimit: 5000,
    encryption: 'tls' as const,
    description: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    category: 'notification' as const,
    variables: ''
  });

  const resetProviderForm = () => {
    setProviderForm({
      name: '',
      type: 'smtp',
      host: '',
      port: 587,
      username: '',
      password: '',
      apiKey: '',
      fromEmail: '',
      fromName: '',
      monthlyLimit: 5000,
      encryption: 'tls',
      description: ''
    });
    setEditingProvider(null);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      htmlContent: '',
      textContent: '',
      category: 'notification',
      variables: ''
    });
    setEditingTemplate(null);
  };

  const handleTestProvider = async (provider: EmailProvider) => {
    setTestingProvider(provider.id);
    
    // Simular teste de email
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = Math.random() > 0.2; // 80% chance de sucesso
    
    setProviders(prev => 
      prev.map(p => 
        p.id === provider.id 
          ? { 
              ...p, 
              status: success ? 'connected' : 'error',
              lastUsed: success ? new Date().toISOString() : p.lastUsed,
              emailsSentToday: success ? p.emailsSentToday + 1 : p.emailsSentToday
            } 
          : p
      )
    );
    
    setTestingProvider(null);
    
    if (success) {
      toast.success(`Email de teste enviado com sucesso via ${provider.name}!`);
    } else {
      toast.error(`Falha ao enviar email via ${provider.name}`);
    }
  };

  const handleSaveProvider = () => {
    const newProvider: EmailProvider = {
      id: editingProvider?.id || Date.now().toString(),
      name: providerForm.name,
      type: providerForm.type,
      host: providerForm.host || undefined,
      port: providerForm.port,
      username: providerForm.username || undefined,
      password: providerForm.password || undefined,
      apiKey: providerForm.apiKey || undefined,
      fromEmail: providerForm.fromEmail,
      fromName: providerForm.fromName,
      status: 'disconnected',
      isActive: true,
      isDefault: false,
      emailsSentToday: 0,
      monthlyLimit: providerForm.monthlyLimit,
      encryption: providerForm.encryption,
      description: providerForm.description
    };

    if (editingProvider) {
      setProviders(prev => 
        prev.map(p => p.id === editingProvider.id ? newProvider : p)
      );
      toast.success('Provedor atualizado com sucesso!');
    } else {
      setProviders(prev => [...prev, newProvider]);
      toast.success('Novo provedor adicionado com sucesso!');
    }

    setIsProviderDialogOpen(false);
    resetProviderForm();
  };

  const handleSaveTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: templateForm.name,
      subject: templateForm.subject,
      htmlContent: templateForm.htmlContent,
      textContent: templateForm.textContent,
      category: templateForm.category,
      isActive: true,
      usageCount: editingTemplate?.usageCount || 0,
      variables: templateForm.variables.split(',').map(v => v.trim()).filter(v => v)
    };

    if (editingTemplate) {
      setTemplates(prev => 
        prev.map(t => t.id === editingTemplate.id ? newTemplate : t)
      );
      toast.success('Template atualizado com sucesso!');
    } else {
      setTemplates(prev => [...prev, newTemplate]);
      toast.success('Novo template criado com sucesso!');
    }

    setIsTemplateDialogOpen(false);
    resetTemplateForm();
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'smtp':
        return <Server className="h-5 w-5 text-blue-600" />;
      case 'sendgrid':
      case 'mailgun':
        return <Cloud className="h-5 w-5 text-green-600" />;
      case 'aws-ses':
        return <Cloud className="h-5 w-5 text-orange-600" />;
      default:
        return <Mail className="h-5 w-5 text-purple-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'alert':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'notification':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'report':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'welcome':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalEmailsToday = providers.reduce((sum, p) => sum + p.emailsSentToday, 0);
  const activeProviders = providers.filter(p => p.isActive && p.status === 'connected');
  const activeTemplates = templates.filter(t => t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
            Serviços de E-mail
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure provedores de e-mail e templates para notificações
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">E-mails Hoje</CardTitle>
            <Send className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{totalEmailsToday}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              enviados hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Provedores</CardTitle>
            <Server className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{activeProviders.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Templates</CardTitle>
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{activeTemplates.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Taxa de Entrega</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Shield className="h-4 w-4" />
        <AlertTitle>Segurança de E-mail</AlertTitle>
        <AlertDescription>
          Configure sempre autenticação segura (TLS/SSL) e mantenha suas credenciais 
          em variáveis de ambiente. Use provedores com boa reputação para evitar 
          problemas de entrega.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Provedores</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Provedores de E-mail</h3>
            <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetProviderForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Provedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProvider ? 'Editar' : 'Novo'} Provedor de E-mail
                  </DialogTitle>
                  <DialogDescription>
                    Configure um novo provedor de e-mail para envio de notificações
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="advanced">Avançado</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="providerName">Nome do Provedor</Label>
                        <Input
                          id="providerName"
                          value={providerForm.name}
                          onChange={(e) => setProviderForm(prev => ({...prev, name: e.target.value}))}
                          placeholder="Ex: SMTP Corporativo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="providerType">Tipo</Label>
                        <Select 
                          value={providerForm.type} 
                          onValueChange={(value: any) => setProviderForm(prev => ({...prev, type: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smtp">SMTP</SelectItem>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="aws-ses">AWS SES</SelectItem>
                            <SelectItem value="mailgun">Mailgun</SelectItem>
                            <SelectItem value="custom">Customizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fromEmail">E-mail de Origem</Label>
                        <Input
                          id="fromEmail"
                          type="email"
                          value={providerForm.fromEmail}
                          onChange={(e) => setProviderForm(prev => ({...prev, fromEmail: e.target.value}))}
                          placeholder="grc@empresa.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fromName">Nome de Origem</Label>
                        <Input
                          id="fromName"
                          value={providerForm.fromName}
                          onChange={(e) => setProviderForm(prev => ({...prev, fromName: e.target.value}))}
                          placeholder="GRC Controller"
                        />
                      </div>
                    </div>

                    {providerForm.type === 'smtp' && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <Label htmlFor="host">Servidor SMTP</Label>
                            <Input
                              id="host"
                              value={providerForm.host}
                              onChange={(e) => setProviderForm(prev => ({...prev, host: e.target.value}))}
                              placeholder="smtp.empresa.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="port">Porta</Label>
                            <Input
                              id="port"
                              type="number"
                              value={providerForm.port}
                              onChange={(e) => setProviderForm(prev => ({...prev, port: parseInt(e.target.value)}))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="username">Usuário</Label>
                            <Input
                              id="username"
                              value={providerForm.username}
                              onChange={(e) => setProviderForm(prev => ({...prev, username: e.target.value}))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword[editingProvider?.id || 'new'] ? 'text' : 'password'}
                                value={providerForm.password}
                                onChange={(e) => setProviderForm(prev => ({...prev, password: e.target.value}))}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => togglePasswordVisibility(editingProvider?.id || 'new')}
                              >
                                {showPassword[editingProvider?.id || 'new'] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {(providerForm.type === 'sendgrid' || providerForm.type === 'mailgun' || providerForm.type === 'aws-ses') && (
                      <div>
                        <Label htmlFor="apiKey">Chave da API</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          value={providerForm.apiKey}
                          onChange={(e) => setProviderForm(prev => ({...prev, apiKey: e.target.value}))}
                          placeholder="Sua chave de API..."
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="encryption">Criptografia</Label>
                        <Select 
                          value={providerForm.encryption} 
                          onValueChange={(value: any) => setProviderForm(prev => ({...prev, encryption: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="monthlyLimit">Limite Mensal</Label>
                        <Input
                          id="monthlyLimit"
                          type="number"
                          value={providerForm.monthlyLimit}
                          onChange={(e) => setProviderForm(prev => ({...prev, monthlyLimit: parseInt(e.target.value)}))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={providerForm.description}
                        onChange={(e) => setProviderForm(prev => ({...prev, description: e.target.value}))}
                        placeholder="Descreva o uso deste provedor..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProviderDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProvider}>
                    {editingProvider ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        {getProviderIcon(provider.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          {provider.name}
                          {provider.isDefault && (
                            <Badge variant="outline" className="text-xs">Padrão</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {provider.type.toUpperCase()} • {provider.fromEmail}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(provider.status)}
                      <Switch checked={provider.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>E-mails hoje</span>
                      <span>{provider.emailsSentToday}/{provider.monthlyLimit}</span>
                    </div>
                    <Progress 
                      value={(provider.emailsSentToday / (provider.monthlyLimit || 1)) * 100} 
                      className="h-2" 
                    />
                  </div>

                  {provider.description && (
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Criptografia:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {provider.encryption.toUpperCase()}
                    </Badge>
                  </div>

                  {provider.lastUsed && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Último uso:</span>
                      <span className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(provider.lastUsed).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestProvider(provider)}
                      disabled={testingProvider === provider.id}
                      className="flex items-center gap-1"
                    >
                      <TestTube className="h-3 w-3" />
                      {testingProvider === provider.id ? 'Enviando...' : 'Testar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProvider(provider);
                        setProviderForm({
                          name: provider.name,
                          type: provider.type,
                          host: provider.host || '',
                          port: provider.port || 587,
                          username: provider.username || '',
                          password: provider.password || '',
                          apiKey: provider.apiKey || '',
                          fromEmail: provider.fromEmail,
                          fromName: provider.fromName,
                          monthlyLimit: provider.monthlyLimit || 5000,
                          encryption: provider.encryption,
                          description: provider.description || ''
                        });
                        setIsProviderDialogOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Templates de E-mail</h3>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetTemplateForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Editar' : 'Novo'} Template de E-mail
                  </DialogTitle>
                  <DialogDescription>
                    Crie um template reutilizável para diferentes tipos de notificação
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templateName">Nome do Template</Label>
                      <Input
                        id="templateName"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({...prev, name: e.target.value}))}
                        placeholder="Ex: Alerta de Risco Crítico"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={templateForm.category} 
                        onValueChange={(value: any) => setTemplateForm(prev => ({...prev, category: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notification">Notificação</SelectItem>
                          <SelectItem value="alert">Alerta</SelectItem>
                          <SelectItem value="report">Relatório</SelectItem>
                          <SelectItem value="welcome">Boas-vindas</SelectItem>
                          <SelectItem value="custom">Customizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm(prev => ({...prev, subject: e.target.value}))}
                      placeholder="Ex: [CRÍTICO] Novo risco identificado: {{risk_title}}"
                    />
                  </div>

                  <div>
                    <Label htmlFor="htmlContent">Conteúdo HTML</Label>
                    <Textarea
                      id="htmlContent"
                      value={templateForm.htmlContent}
                      onChange={(e) => setTemplateForm(prev => ({...prev, htmlContent: e.target.value}))}
                      placeholder="<h2>Título</h2><p>Conteúdo com {{variavel}}</p>"
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="textContent">Conteúdo Texto</Label>
                    <Textarea
                      id="textContent"
                      value={templateForm.textContent}
                      onChange={(e) => setTemplateForm(prev => ({...prev, textContent: e.target.value}))}
                      placeholder="Versão em texto simples do e-mail"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="variables">Variáveis (separadas por vírgula)</Label>
                    <Input
                      id="variables"
                      value={templateForm.variables}
                      onChange={(e) => setTemplateForm(prev => ({...prev, variables: e.target.value}))}
                      placeholder="risk_title, risk_description, owner_name"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use {`{{nome_da_variavel}}`} no conteúdo para inserir valores dinâmicos
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveTemplate}>
                    {editingTemplate ? 'Atualizar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {template.subject}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <Switch checked={template.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uso:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {template.usageCount} vezes
                    </Badge>
                  </div>

                  {template.variables.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Variáveis:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {'{{'}{variable}{'}}'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(template);
                        setTemplateForm({
                          name: template.name,
                          subject: template.subject,
                          htmlContent: template.htmlContent,
                          textContent: template.textContent,
                          category: template.category,
                          variables: template.variables.join(', ')
                        });
                        setIsTemplateDialogOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Implementar preview do template
                        toast.info('Funcionalidade de preview em desenvolvimento');
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailServiceSection;