import React, { useState } from 'react';
import { 
  Brain, 
  Zap, 
  Settings, 
  TestTube, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Copy,
  Upload,
  Download,
  RefreshCw,
  Activity,
  Code,
  Database,
  FileText,
  Globe
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

interface MCPProvider {
  id: string;
  name: string;
  type: 'claude' | 'openai' | 'custom';
  endpoint: string;
  apiKey?: string;
  model?: string;
  status: 'connected' | 'disconnected' | 'error';
  isActive: boolean;
  contextWindow: number;
  temperature: number;
  maxTokens: number;
  description?: string;
  capabilities: string[];
  lastUsed?: string;
  tokensUsed: number;
  requestsToday: number;
}

interface ContextProfile {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  contextSources: string[];
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
}

const MCPConfigurationSection: React.FC = () => {
  const [providers, setProviders] = useState<MCPProvider[]>([
    {
      id: '1',
      name: 'Claude 3.5 Sonnet',
      type: 'claude',
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-3-5-sonnet-20241022',
      status: 'connected',
      isActive: true,
      contextWindow: 200000,
      temperature: 0.7,
      maxTokens: 4096,
      description: 'Modelo principal para análises de GRC',
      capabilities: ['reasoning', 'analysis', 'code', 'math'],
      lastUsed: new Date().toISOString(),
      tokensUsed: 15420,
      requestsToday: 23
    },
    {
      id: '2',
      name: 'GPT-4 Turbo',
      type: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4-turbo-preview',
      status: 'disconnected',
      isActive: false,
      contextWindow: 128000,
      temperature: 0.3,
      maxTokens: 4096,
      description: 'Backup para análises complexas',
      capabilities: ['reasoning', 'analysis', 'code'],
      tokensUsed: 0,
      requestsToday: 0
    }
  ]);

  const [contextProfiles, setContextProfiles] = useState<ContextProfile[]>([
    {
      id: '1',
      name: 'Análise de Riscos',
      description: 'Perfil especializado para análise e avaliação de riscos corporativos',
      systemPrompt: 'Você é um especialista em gestão de riscos corporativos com foco em frameworks ISO 31000, COSO e NIST.',
      contextSources: ['risk_frameworks', 'regulations', 'industry_standards'],
      isDefault: true,
      isActive: true,
      usageCount: 156
    },
    {
      id: '2',
      name: 'Compliance LGPD',
      description: 'Perfil focado em conformidade com a Lei Geral de Proteção de Dados',
      systemPrompt: 'Você é um especialista em LGPD e proteção de dados pessoais, focado em compliance e interpretação legal.',
      contextSources: ['lgpd_articles', 'anpd_guidelines', 'case_studies'],
      isDefault: false,
      isActive: true,
      usageCount: 89
    }
  ]);

  const [activeTab, setActiveTab] = useState('providers');
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<MCPProvider | null>(null);
  const [editingProfile, setEditingProfile] = useState<ContextProfile | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  const [providerForm, setProviderForm] = useState({
    name: '',
    type: 'claude' as const,
    endpoint: '',
    apiKey: '',
    model: '',
    description: '',
    contextWindow: 100000,
    temperature: 0.7,
    maxTokens: 4096
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    contextSources: [] as string[],
    isDefault: false
  });

  const resetProviderForm = () => {
    setProviderForm({
      name: '',
      type: 'claude',
      endpoint: '',
      apiKey: '',
      model: '',
      description: '',
      contextWindow: 100000,
      temperature: 0.7,
      maxTokens: 4096
    });
    setEditingProvider(null);
  };

  const resetProfileForm = () => {
    setProfileForm({
      name: '',
      description: '',
      systemPrompt: '',
      contextSources: [],
      isDefault: false
    });
    setEditingProfile(null);
  };

  const handleTestProvider = async (provider: MCPProvider) => {
    setTestingProvider(provider.id);
    
    // Simular teste de conexão
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = Math.random() > 0.2; // 80% chance de sucesso
    
    setProviders(prev => 
      prev.map(p => 
        p.id === provider.id 
          ? { 
              ...p, 
              status: success ? 'connected' : 'error',
              lastUsed: success ? new Date().toISOString() : p.lastUsed
            } 
          : p
      )
    );
    
    setTestingProvider(null);
    
    if (success) {
      toast.success(`Conexão com ${provider.name} testada com sucesso!`);
    } else {
      toast.error(`Falha na conexão com ${provider.name}`);
    }
  };

  const handleSaveProvider = () => {
    const newProvider: MCPProvider = {
      id: editingProvider?.id || Date.now().toString(),
      name: providerForm.name,
      type: providerForm.type,
      endpoint: providerForm.endpoint,
      apiKey: providerForm.apiKey,
      model: providerForm.model,
      description: providerForm.description,
      status: 'disconnected',
      isActive: true,
      contextWindow: providerForm.contextWindow,
      temperature: providerForm.temperature,
      maxTokens: providerForm.maxTokens,
      capabilities: ['reasoning', 'analysis'],
      tokensUsed: 0,
      requestsToday: 0
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

  const handleSaveProfile = () => {
    const newProfile: ContextProfile = {
      id: editingProfile?.id || Date.now().toString(),
      name: profileForm.name,
      description: profileForm.description,
      systemPrompt: profileForm.systemPrompt,
      contextSources: profileForm.contextSources,
      isDefault: profileForm.isDefault,
      isActive: true,
      usageCount: editingProfile?.usageCount || 0
    };

    if (editingProfile) {
      setContextProfiles(prev => 
        prev.map(p => p.id === editingProfile.id ? newProfile : p)
      );
      toast.success('Perfil atualizado com sucesso!');
    } else {
      setContextProfiles(prev => [...prev, newProfile]);
      toast.success('Novo perfil criado com sucesso!');
    }

    setIsProfileDialogOpen(false);
    resetProfileForm();
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
      case 'claude':
        return <Brain className="h-5 w-5 text-purple-600" />;
      case 'openai':
        return <Zap className="h-5 w-5 text-green-600" />;
      default:
        return <Code className="h-5 w-5 text-blue-600" />;
    }
  };

  const connectedProviders = providers.filter(p => p.status === 'connected' && p.isActive);
  const totalTokensUsed = providers.reduce((sum, p) => sum + p.tokensUsed, 0);
  const totalRequests = providers.reduce((sum, p) => sum + p.requestsToday, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
            Model Context Protocol (MCP)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure provedores de IA e perfis de contexto avançados
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Provedores Ativos</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{connectedProviders.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              de {providers.length} configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Tokens Hoje</CardTitle>
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{totalTokensUsed.toLocaleString()}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              tokens consumidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Requisições</CardTitle>
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{totalRequests}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Perfis Ativos</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{contextProfiles.filter(p => p.isActive).length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              perfis de contexto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
        <Brain className="h-4 w-4" />
        <AlertTitle>Model Context Protocol</AlertTitle>
        <AlertDescription>
          O MCP permite configurar múltiplos provedores de IA com contextos especializados 
          para diferentes tipos de análise em GRC. Configure perfis específicos para riscos, 
          compliance, auditoria e outras áreas.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Provedores de IA</TabsTrigger>
          <TabsTrigger value="profiles">Perfis de Contexto</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Provedores de IA</h3>
            <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetProviderForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Provedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProvider ? 'Editar' : 'Novo'} Provedor de IA
                  </DialogTitle>
                  <DialogDescription>
                    Configure a conexão com um provedor de modelo de linguagem
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="providerName">Nome do Provedor</Label>
                      <Input
                        id="providerName"
                        value={providerForm.name}
                        onChange={(e) => setProviderForm(prev => ({...prev, name: e.target.value}))}
                        placeholder="Ex: Claude 3.5 Sonnet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="providerType">Tipo</Label>
                      <Select 
                        value={providerForm.type} 
                        onValueChange={(value: 'claude' | 'openai' | 'custom') => 
                          setProviderForm(prev => ({...prev, type: value}))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claude">Anthropic Claude</SelectItem>
                          <SelectItem value="openai">OpenAI GPT</SelectItem>
                          <SelectItem value="custom">Customizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="endpoint">Endpoint da API</Label>
                    <Input
                      id="endpoint"
                      value={providerForm.endpoint}
                      onChange={(e) => setProviderForm(prev => ({...prev, endpoint: e.target.value}))}
                      placeholder="https://api.anthropic.com/v1/messages"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        value={providerForm.model}
                        onChange={(e) => setProviderForm(prev => ({...prev, model: e.target.value}))}
                        placeholder="claude-3-5-sonnet-20241022"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contextWindow">Janela de Contexto</Label>
                      <Input
                        id="contextWindow"
                        type="number"
                        value={providerForm.contextWindow}
                        onChange={(e) => setProviderForm(prev => ({...prev, contextWindow: parseInt(e.target.value)}))}
                      />
                    </div>
                  </div>

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperatura ({providerForm.temperature})</Label>
                      <Input
                        id="temperature"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={providerForm.temperature}
                        onChange={(e) => setProviderForm(prev => ({...prev, temperature: parseFloat(e.target.value)}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxTokens">Tokens Máximos</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        value={providerForm.maxTokens}
                        onChange={(e) => setProviderForm(prev => ({...prev, maxTokens: parseInt(e.target.value)}))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="providerDescription">Descrição</Label>
                    <Textarea
                      id="providerDescription"
                      value={providerForm.description}
                      onChange={(e) => setProviderForm(prev => ({...prev, description: e.target.value}))}
                      placeholder="Descreva o uso deste provedor..."
                    />
                  </div>
                </div>

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
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        {getProviderIcon(provider.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">{provider.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {provider.model} • {provider.contextWindow.toLocaleString()} tokens
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
                      <span>Uso hoje</span>
                      <span>{provider.tokensUsed.toLocaleString()} tokens</span>
                    </div>
                    <Progress value={(provider.tokensUsed / 50000) * 100} className="h-2" />
                  </div>

                  {provider.description && (
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {provider.capabilities.map((capability) => (
                      <Badge key={capability} variant="outline" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestProvider(provider)}
                      disabled={testingProvider === provider.id}
                      className="flex items-center gap-1"
                    >
                      <TestTube className="h-3 w-3" />
                      {testingProvider === provider.id ? 'Testando...' : 'Testar'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProvider(provider);
                        setProviderForm({
                          name: provider.name,
                          type: provider.type,
                          endpoint: provider.endpoint,
                          apiKey: provider.apiKey || '',
                          model: provider.model || '',
                          description: provider.description || '',
                          contextWindow: provider.contextWindow,
                          temperature: provider.temperature,
                          maxTokens: provider.maxTokens
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

        {/* Context Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Perfis de Contexto</h3>
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetProfileForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Perfil
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProfile ? 'Editar' : 'Novo'} Perfil de Contexto
                  </DialogTitle>
                  <DialogDescription>
                    Configure um perfil especializado para um tipo específico de análise
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileName">Nome do Perfil</Label>
                    <Input
                      id="profileName"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({...prev, name: e.target.value}))}
                      placeholder="Ex: Análise de Riscos"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profileDescription">Descrição</Label>
                    <Input
                      id="profileDescription"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm(prev => ({...prev, description: e.target.value}))}
                      placeholder="Breve descrição do perfil..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="systemPrompt">Prompt do Sistema</Label>
                    <Textarea
                      id="systemPrompt"
                      value={profileForm.systemPrompt}
                      onChange={(e) => setProfileForm(prev => ({...prev, systemPrompt: e.target.value}))}
                      placeholder="Você é um especialista em..."
                      rows={6}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={profileForm.isDefault}
                      onCheckedChange={(checked) => setProfileForm(prev => ({...prev, isDefault: checked}))}
                    />
                    <Label>Definir como perfil padrão</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    {editingProfile ? 'Atualizar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contextProfiles.map((profile) => (
              <Card key={profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          {profile.name}
                          {profile.isDefault && (
                            <Badge variant="outline" className="text-xs">Padrão</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {profile.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch checked={profile.isActive} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Prompt do Sistema:</Label>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {profile.systemPrompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uso:</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {profile.usageCount} vezes
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProfile(profile);
                        setProfileForm({
                          name: profile.name,
                          description: profile.description,
                          systemPrompt: profile.systemPrompt,
                          contextSources: profile.contextSources,
                          isDefault: profile.isDefault
                        });
                        setIsProfileDialogOpen(true);
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
                        navigator.clipboard.writeText(profile.systemPrompt);
                        toast.success('Prompt copiado!');
                      }}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copiar Prompt
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

export default MCPConfigurationSection;