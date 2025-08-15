import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
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
  Users,
  Lock,
  Globe,
  Download,
  Upload,
  Copy,
  ExternalLink
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SSOProvider {
  id: string;
  name: string;
  type: 'azure-ad' | 'google' | 'okta' | 'auth0' | 'saml' | 'oidc';
  clientId?: string;
  clientSecret?: string;
  tenantId?: string;
  domain?: string;
  issuer?: string;
  authUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  certificateX509?: string;
  status: 'connected' | 'disconnected' | 'error';
  isActive: boolean;
  isDefault: boolean;
  usersCount: number;
  lastLogin?: string;
  description?: string;
  autoProvisioning: boolean;
  defaultRole: string;
  attributeMapping: Record<string, string>;
}

interface UserMapping {
  ssoAttribute: string;
  localAttribute: string;
  required: boolean;
  defaultValue?: string;
}

const SSOConfigurationSection: React.FC = () => {
  const [providers, setProviders] = useState<SSOProvider[]>([
    {
      id: '1',
      name: 'Azure Active Directory',
      type: 'azure-ad',
      clientId: 'abc123-def456-ghi789',
      tenantId: 'empresa.onmicrosoft.com',
      status: 'connected',
      isActive: true,
      isDefault: true,
      usersCount: 45,
      lastLogin: new Date().toISOString(),
      description: 'Integração principal com Azure AD corporativo',
      autoProvisioning: true,
      defaultRole: 'user',
      attributeMapping: {
        'email': 'email',
        'name': 'displayName',
        'department': 'department'
      }
    },
    {
      id: '2',
      name: 'Google Workspace',
      type: 'google',
      clientId: 'google-client-id.apps.googleusercontent.com',
      domain: 'empresa.com',
      status: 'disconnected',
      isActive: false,
      isDefault: false,
      usersCount: 0,
      description: 'Backup para usuários externos',
      autoProvisioning: false,
      defaultRole: 'user',
      attributeMapping: {
        'email': 'email',
        'name': 'name',
        'picture': 'picture'
      }
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<SSOProvider | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('providers');

  const [formData, setFormData] = useState({
    name: '',
    type: 'azure-ad' as const,
    clientId: '',
    clientSecret: '',
    tenantId: '',
    domain: '',
    issuer: '',
    authUrl: '',
    tokenUrl: '',
    userInfoUrl: '',
    certificateX509: '',
    description: '',
    autoProvisioning: true,
    defaultRole: 'user',
    attributeMapping: '{\n  "email": "email",\n  "name": "displayName"\n}'
  });

  const defaultMappings: UserMapping[] = [
    { ssoAttribute: 'email', localAttribute: 'email', required: true },
    { ssoAttribute: 'displayName', localAttribute: 'name', required: true },
    { ssoAttribute: 'department', localAttribute: 'department', required: false },
    { ssoAttribute: 'jobTitle', localAttribute: 'jobTitle', required: false },
    { ssoAttribute: 'phoneNumber', localAttribute: 'phone', required: false }
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'azure-ad',
      clientId: '',
      clientSecret: '',
      tenantId: '',
      domain: '',
      issuer: '',
      authUrl: '',
      tokenUrl: '',
      userInfoUrl: '',
      certificateX509: '',
      description: '',
      autoProvisioning: true,
      defaultRole: 'user',
      attributeMapping: '{\n  "email": "email",\n  "name": "displayName"\n}'
    });
    setEditingProvider(null);
  };

  const handleEdit = (provider: SSOProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      clientId: provider.clientId || '',
      clientSecret: provider.clientSecret || '',
      tenantId: provider.tenantId || '',
      domain: provider.domain || '',
      issuer: provider.issuer || '',
      authUrl: provider.authUrl || '',
      tokenUrl: provider.tokenUrl || '',
      userInfoUrl: provider.userInfoUrl || '',
      certificateX509: provider.certificateX509 || '',
      description: provider.description || '',
      autoProvisioning: provider.autoProvisioning,
      defaultRole: provider.defaultRole,
      attributeMapping: JSON.stringify(provider.attributeMapping, null, 2)
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    try {
      const newProvider: SSOProvider = {
        id: editingProvider?.id || Date.now().toString(),
        name: formData.name,
        type: formData.type,
        clientId: formData.clientId || undefined,
        clientSecret: formData.clientSecret || undefined,
        tenantId: formData.tenantId || undefined,
        domain: formData.domain || undefined,
        issuer: formData.issuer || undefined,
        authUrl: formData.authUrl || undefined,
        tokenUrl: formData.tokenUrl || undefined,
        userInfoUrl: formData.userInfoUrl || undefined,
        certificateX509: formData.certificateX509 || undefined,
        status: 'disconnected',
        isActive: true,
        isDefault: false,
        usersCount: editingProvider?.usersCount || 0,
        description: formData.description,
        autoProvisioning: formData.autoProvisioning,
        defaultRole: formData.defaultRole,
        attributeMapping: JSON.parse(formData.attributeMapping)
      };

      if (editingProvider) {
        setProviders(prev => 
          prev.map(p => p.id === editingProvider.id ? newProvider : p)
        );
        toast.success('Provedor SSO atualizado com sucesso!');
      } else {
        setProviders(prev => [...prev, newProvider]);
        toast.success('Novo provedor SSO adicionado com sucesso!');
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar: verifique o JSON do mapeamento de atributos');
    }
  };

  const handleTest = async (provider: SSOProvider) => {
    setTestingProvider(provider.id);
    
    // Simular teste de SSO
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = Math.random() > 0.2; // 80% chance de sucesso
    
    setProviders(prev => 
      prev.map(p => 
        p.id === provider.id 
          ? { 
              ...p, 
              status: success ? 'connected' : 'error',
              lastLogin: success ? new Date().toISOString() : p.lastLogin
            } 
          : p
      )
    );
    
    setTestingProvider(null);
    
    if (success) {
      toast.success(`Conexão SSO com ${provider.name} testada com sucesso!`);
    } else {
      toast.error(`Falha na conexão SSO com ${provider.name}`);
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecret(prev => ({
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

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'azure-ad':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'google':
        return <Globe className="h-5 w-5 text-red-600" />;
      case 'okta':
        return <Lock className="h-5 w-5 text-blue-800" />;
      case 'auth0':
        return <Key className="h-5 w-5 text-orange-600" />;
      default:
        return <Shield className="h-5 w-5 text-purple-600" />;
    }
  };

  const getProviderTemplateUrl = (type: string) => {
    const baseUrl = window.location.origin;
    switch (type) {
      case 'azure-ad':
        return `${baseUrl}/auth/callback/azure`;
      case 'google':
        return `${baseUrl}/auth/callback/google`;
      case 'okta':
        return `${baseUrl}/auth/callback/okta`;
      default:
        return `${baseUrl}/auth/callback/${type}`;
    }
  };

  const activeProviders = providers.filter(p => p.isActive && p.status === 'connected');
  const totalUsers = providers.reduce((sum, p) => sum + p.usersCount, 0);
  const ssoLoginRate = totalUsers > 0 ? ((activeProviders.reduce((sum, p) => sum + p.usersCount, 0) / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
            Single Sign-On (SSO)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure provedores de identidade para autenticação centralizada
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Provedores Ativos</CardTitle>
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{activeProviders.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              de {providers.length} configurados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Usuários SSO</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold">{totalUsers}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              autenticados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Taxa de Adoção</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{Math.round(ssoLoginRate)}%</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              dos logins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Segurança</CardTitle>
            <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">Alta</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              SAML 2.0 / OIDC
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alert */}
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
        <Lock className="h-4 w-4" />
        <AlertTitle>Segurança SSO</AlertTitle>
        <AlertDescription>
          Mantenha sempre os certificados atualizados e monitore logins suspeitos. 
          Use MFA quando disponível e configure timeouts de sessão apropriados.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Provedores SSO</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Provedores de Identidade</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Provedor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProvider ? 'Editar' : 'Novo'} Provedor SSO
                  </DialogTitle>
                  <DialogDescription>
                    Configure um provedor de identidade para autenticação SSO
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                    <TabsTrigger value="mapping">Mapeamento</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome do Provedor</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                          placeholder="Ex: Azure Active Directory"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Tipo</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value: any) => setFormData(prev => ({...prev, type: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="azure-ad">Azure Active Directory</SelectItem>
                            <SelectItem value="google">Google Workspace</SelectItem>
                            <SelectItem value="okta">Okta</SelectItem>
                            <SelectItem value="auth0">Auth0</SelectItem>
                            <SelectItem value="saml">SAML 2.0</SelectItem>
                            <SelectItem value="oidc">OpenID Connect</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientId">Client ID</Label>
                        <Input
                          id="clientId"
                          value={formData.clientId}
                          onChange={(e) => setFormData(prev => ({...prev, clientId: e.target.value}))}
                          placeholder="ID da aplicação"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientSecret">Client Secret</Label>
                        <div className="relative">
                          <Input
                            id="clientSecret"
                            type={showSecret[editingProvider?.id || 'new'] ? 'text' : 'password'}
                            value={formData.clientSecret}
                            onChange={(e) => setFormData(prev => ({...prev, clientSecret: e.target.value}))}
                            placeholder="Secret da aplicação"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => toggleSecretVisibility(editingProvider?.id || 'new')}
                          >
                            {showSecret[editingProvider?.id || 'new'] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {formData.type === 'azure-ad' && (
                      <div>
                        <Label htmlFor="tenantId">Tenant ID</Label>
                        <Input
                          id="tenantId"
                          value={formData.tenantId}
                          onChange={(e) => setFormData(prev => ({...prev, tenantId: e.target.value}))}
                          placeholder="empresa.onmicrosoft.com ou GUID"
                        />
                      </div>
                    )}

                    {(formData.type === 'google' || formData.type === 'okta') && (
                      <div>
                        <Label htmlFor="domain">Domínio</Label>
                        <Input
                          id="domain"
                          value={formData.domain}
                          onChange={(e) => setFormData(prev => ({...prev, domain: e.target.value}))}
                          placeholder="empresa.com"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                        placeholder="Descreva o uso deste provedor..."
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.autoProvisioning}
                          onCheckedChange={(checked) => setFormData(prev => ({...prev, autoProvisioning: checked}))}
                        />
                        <Label>Provisionamento automático de usuários</Label>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="defaultRole">Papel padrão</Label>
                          <Select 
                            value={formData.defaultRole} 
                            onValueChange={(value) => setFormData(prev => ({...prev, defaultRole: value}))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuário</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="auditor">Auditor</SelectItem>
                              <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>URL de Callback</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={getProviderTemplateUrl(formData.type)}
                              readOnly
                              className="bg-muted"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(getProviderTemplateUrl(formData.type))}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="endpoints" className="space-y-4">
                    <div>
                      <Label htmlFor="issuer">Issuer / Metadata URL</Label>
                      <Input
                        id="issuer"
                        value={formData.issuer}
                        onChange={(e) => setFormData(prev => ({...prev, issuer: e.target.value}))}
                        placeholder="https://login.microsoftonline.com/{tenant}/v2.0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="authUrl">Authorization URL</Label>
                      <Input
                        id="authUrl"
                        value={formData.authUrl}
                        onChange={(e) => setFormData(prev => ({...prev, authUrl: e.target.value}))}
                        placeholder="URL de autorização"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tokenUrl">Token URL</Label>
                      <Input
                        id="tokenUrl"
                        value={formData.tokenUrl}
                        onChange={(e) => setFormData(prev => ({...prev, tokenUrl: e.target.value}))}
                        placeholder="URL de token"
                      />
                    </div>

                    <div>
                      <Label htmlFor="userInfoUrl">UserInfo URL</Label>
                      <Input
                        id="userInfoUrl"
                        value={formData.userInfoUrl}
                        onChange={(e) => setFormData(prev => ({...prev, userInfoUrl: e.target.value}))}
                        placeholder="URL de informações do usuário"
                      />
                    </div>

                    {(formData.type === 'saml' || formData.type === 'oidc') && (
                      <div>
                        <Label htmlFor="certificateX509">Certificado X.509</Label>
                        <Textarea
                          id="certificateX509"
                          value={formData.certificateX509}
                          onChange={(e) => setFormData(prev => ({...prev, certificateX509: e.target.value}))}
                          placeholder="-----BEGIN CERTIFICATE-----"
                          rows={6}
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="mapping" className="space-y-4">
                    <div>
                      <Label htmlFor="attributeMapping">Mapeamento de Atributos (JSON)</Label>
                      <Textarea
                        id="attributeMapping"
                        value={formData.attributeMapping}
                        onChange={(e) => setFormData(prev => ({...prev, attributeMapping: e.target.value}))}
                        placeholder='{"email": "email", "name": "displayName"}'
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Mapeia atributos do provedor SSO para campos locais do usuário
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Mapeamentos Sugeridos:</h4>
                      <div className="space-y-2">
                        {defaultMappings.map((mapping) => (
                          <div key={mapping.ssoAttribute} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                            <div className="text-sm">
                              <span className="font-mono">{mapping.ssoAttribute}</span>
                              <span className="mx-2">→</span>
                              <span className="font-mono">{mapping.localAttribute}</span>
                            </div>
                            <Badge variant={mapping.required ? "default" : "outline"} className="text-xs">
                              {mapping.required ? 'Obrigatório' : 'Opcional'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
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
                          {provider.type.toUpperCase()} • {provider.usersCount} usuários
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
                  {provider.description && (
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Provisionamento automático:</span>
                      <Badge variant={provider.autoProvisioning ? "default" : "outline"} className="text-xs">
                        {provider.autoProvisioning ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Papel padrão:</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {provider.defaultRole}
                      </Badge>
                    </div>
                  </div>

                  {provider.lastLogin && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Último login:</span>
                      <span className="text-xs">
                        {new Date(provider.lastLogin).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(provider)}
                      disabled={testingProvider === provider.id}
                      className="flex items-center gap-1"
                    >
                      <TestTube className="h-3 w-3" />
                      {testingProvider === provider.id ? 'Testando...' : 'Testar SSO'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(provider)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(getProviderTemplateUrl(provider.type))}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Callback URL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {providers.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Nenhum provedor SSO configurado</h3>
                <p className="text-muted-foreground mb-4">
                  Configure seu primeiro provedor de identidade para começar
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Provedor SSO
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Globais de SSO
                </CardTitle>
                <CardDescription>
                  Defina comportamentos padrão para autenticação SSO
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Forçar SSO para novos usuários</Label>
                        <p className="text-xs text-muted-foreground">
                          Usuários devem usar SSO ao invés de senha local
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Logout centralizado</Label>
                        <p className="text-xs text-muted-foreground">
                          Logout da aplicação também faz logout do provedor
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Atualização automática de perfil</Label>
                        <p className="text-xs text-muted-foreground">
                          Sincronizar dados do usuário a cada login
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Timeout da sessão (minutos)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        defaultValue="480"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maxConcurrentSessions">Sessões simultâneas máximas</Label>
                      <Input
                        id="maxConcurrentSessions"
                        type="number"
                        defaultValue="3"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="failoverProvider">Provedor de fallback</Label>
                      <Select defaultValue="local">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Autenticação local</SelectItem>
                          <SelectItem value="azure">Azure AD</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Logs de Auditoria SSO
                </CardTitle>
                <CardDescription>
                  Monitoramento de eventos de autenticação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Login bem-sucedido</p>
                        <p className="text-xs text-muted-foreground">
                          user@empresa.com via Azure AD
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      há 2 minutos
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Tentativa de login</p>
                        <p className="text-xs text-muted-foreground">
                          admin@empresa.com via Google (falhou)
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      há 15 minutos
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Usuário provisionado</p>
                        <p className="text-xs text-muted-foreground">
                          novo.usuario@empresa.com via Azure AD
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      há 1 hora
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Todos os Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SSOConfigurationSection;