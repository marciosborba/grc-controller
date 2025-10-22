import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Layers,
  ArrowLeft,
  Search,
  Plus,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Globe,
  Smartphone,
  Code,
  Database,
  Cloud,
  Monitor,
  Settings,
  ChevronDown,
  Shield,
  FileText,
  Target,
  GitBranch
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

export default function Applications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tenantId = useCurrentTenantId();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedImportTool, setSelectedImportTool] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Mock data
  const mockApplications = [
    {
      id: 'APP-WEB-001',
      name: 'Portal Web Principal',
      type: 'Web Application',
      status: 'Ativo',
      url: 'https://portal.empresa.com',
      technology: 'React/Node.js',
      owner: 'Equipe Frontend',
      vulnerabilities: 15,
      last_scan: '2024-01-15',
      risk_level: 'Alto'
    },
    {
      id: 'APP-API-001',
      name: 'API Gateway',
      type: 'API',
      status: 'Ativo',
      url: 'https://api.empresa.com',
      technology: 'Spring Boot',
      owner: 'Equipe Backend',
      vulnerabilities: 8,
      last_scan: '2024-01-14',
      risk_level: 'Médio'
    },
    {
      id: 'APP-MOB-001',
      name: 'App Mobile iOS',
      type: 'Mobile App',
      status: 'Ativo',
      url: 'App Store',
      technology: 'Swift',
      owner: 'Equipe Mobile',
      vulnerabilities: 3,
      last_scan: '2024-01-13',
      risk_level: 'Baixo'
    },
    {
      id: 'APP-WEB-002',
      name: 'Admin Dashboard',
      type: 'Web Application',
      status: 'Desenvolvimento',
      url: 'https://admin.empresa.com',
      technology: 'Vue.js',
      owner: 'Equipe DevOps',
      vulnerabilities: 12,
      last_scan: '2024-01-12',
      risk_level: 'Alto'
    },
    {
      id: 'APP-DB-001',
      name: 'Database Principal',
      type: 'Database',
      status: 'Ativo',
      url: 'db.empresa.com:5432',
      technology: 'PostgreSQL',
      owner: 'Equipe DBA',
      vulnerabilities: 2,
      last_scan: '2024-01-11',
      risk_level: 'Baixo'
    }
  ];

  const getTypeIcon = (type: string) => {
    const icons = {
      'Web Application': Globe,
      'Mobile App': Smartphone,
      'API': Code,
      'Database': Database,
      'Cloud Service': Cloud,
      'Desktop App': Monitor,
    };
    const IconComponent = icons[type as keyof typeof icons] || Globe;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      'Ativo': 'bg-green-600 text-white border border-green-700',
      'Desenvolvimento': 'bg-yellow-600 text-white border border-yellow-700',
      'Teste': 'bg-blue-600 text-white border border-blue-700',
      'Descontinuado': 'bg-gray-600 text-white border border-gray-700',
      'Manutenção': 'bg-orange-600 text-white border border-orange-700',
    };
    return colors[status as keyof typeof colors] || colors['Ativo'];
  };

  const getRiskBadgeColor = (risk: string) => {
    const colors = {
      'Crítico': 'bg-red-600 text-white border border-red-700',
      'Alto': 'bg-orange-600 text-white border border-orange-700',
      'Médio': 'bg-yellow-600 text-white border border-yellow-700',
      'Baixo': 'bg-green-600 text-white border border-green-700',
    };
    return colors[risk as keyof typeof colors] || colors['Baixo'];
  };

  // Real API integration functions
  const testConnection = async () => {
    if (!selectedImportTool || !tenantId) {
      toast.error('Selecione uma ferramenta e verifique se está logado');
      return;
    }

    setIsTestingConnection(true);
    
    try {
      const credentials = getCredentialsFromForm();
      
      const response = await fetch('/api/integrations/applications/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: selectedImportTool,
          credentials
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Conexão estabelecida com sucesso!');
      } else {
        toast.error(result.error || 'Falha na conexão');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Erro ao testar conexão');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleRealImport = async () => {
    if (!selectedImportTool || !tenantId) {
      toast.error('Selecione uma ferramenta e verifique se está logado');
      return;
    }

    setIsImporting(true);
    
    try {
      const credentials = getCredentialsFromForm();
      const filters = getFiltersFromForm();
      
      const response = await fetch('/api/integrations/applications/import-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: selectedImportTool,
          credentials,
          tenantId,
          filters
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setImportModalOpen(false);
        // Refresh the page or update the application list
        window.location.reload();
      } else {
        toast.error(result.error || 'Falha na importação');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro durante a importação');
    } finally {
      setIsImporting(false);
    }
  };

  const getCredentialsFromForm = () => {
    const credentials: any = {};
    
    switch (selectedImportTool) {
      case 'servicenow':
        credentials.server = (document.getElementById('snow-instance') as HTMLInputElement)?.value;
        credentials.username = (document.getElementById('snow-username') as HTMLInputElement)?.value;
        credentials.password = (document.getElementById('snow-password') as HTMLInputElement)?.value;
        credentials.table = (document.querySelector('[data-testid="snow-table"]') as HTMLSelectElement)?.value || 'cmdb_ci_appl';
        credentials.filter = (document.getElementById('snow-filter') as HTMLInputElement)?.value;
        break;
        
      case 'jira':
        credentials.server = (document.getElementById('jira-server') as HTMLInputElement)?.value;
        credentials.username = (document.getElementById('jira-username') as HTMLInputElement)?.value;
        credentials.apiKey = (document.getElementById('jira-token') as HTMLInputElement)?.value;
        credentials.projectKeys = (document.getElementById('jira-projects') as HTMLInputElement)?.value?.split(',').map(s => s.trim());
        break;
        
      case 'github':
        credentials.server = (document.getElementById('github-server') as HTMLInputElement)?.value || 'https://api.github.com';
        credentials.token = (document.getElementById('github-token') as HTMLInputElement)?.value;
        credentials.organization = (document.getElementById('github-org') as HTMLInputElement)?.value;
        credentials.repositories = (document.getElementById('github-repos') as HTMLInputElement)?.value?.split(',').map(s => s.trim());
        break;
        
      case 'api':
        credentials.server = (document.getElementById('app-api-url') as HTMLInputElement)?.value;
        credentials.method = (document.querySelector('[data-testid="app-api-method"]') as HTMLSelectElement)?.value || 'GET';
        credentials.authType = (document.querySelector('[data-testid="app-api-auth-type"]') as HTMLSelectElement)?.value || 'none';
        credentials.apiKey = (document.getElementById('app-api-key') as HTMLInputElement)?.value;
        credentials.token = (document.getElementById('app-api-token') as HTMLInputElement)?.value;
        credentials.username = (document.getElementById('app-api-username') as HTMLInputElement)?.value;
        credentials.password = (document.getElementById('app-api-password') as HTMLInputElement)?.value;
        credentials.dataPath = (document.getElementById('app-api-data-path') as HTMLInputElement)?.value;
        
        const appHeaders = (document.getElementById('app-api-headers') as HTMLTextAreaElement)?.value;
        const appBody = (document.getElementById('app-api-body') as HTMLTextAreaElement)?.value;
        const appFieldMapping = (document.getElementById('app-api-field-mapping') as HTMLTextAreaElement)?.value;
        
        try {
          credentials.headers = appHeaders ? JSON.parse(appHeaders) : {};
          credentials.body = appBody ? JSON.parse(appBody) : undefined;
          credentials.fieldMapping = appFieldMapping ? JSON.parse(appFieldMapping) : {};
        } catch (e) {
          console.error('JSON parse error for Application API:', e);
        }
        break;
    }
    
    return credentials;
  };

  const getFiltersFromForm = () => {
    const filters: any = {};
    
    // Add any additional filters based on the tool
    if (selectedImportTool === 'servicenow') {
      const table = (document.querySelector('[data-testid="snow-table"]') as HTMLSelectElement)?.value;
      if (table) filters.table = table;
    }
    
    if (selectedImportTool === 'github') {
      const includeArchived = (document.getElementById('github-include-archived') as HTMLInputElement)?.checked;
      filters.includeArchived = includeArchived;
    }
    
    return filters;
  };

  const handleImportFromTool = (tool: string) => {
    setSelectedImportTool(tool);
    setImportModalOpen(true);
  };

  // Import tools configuration
  const IMPORT_TOOLS = [
    {
      id: 'servicenow',
      name: 'ServiceNow CMDB',
      description: 'Importar aplicações do ServiceNow CMDB',
      icon: Database,
      fields: ['sys_id', 'name', 'version', 'install_status', 'operational_status', 'owned_by']
    },
    {
      id: 'jira',
      name: 'Atlassian Jira',
      description: 'Importar projetos do Jira como aplicações',
      icon: FileText,
      fields: ['id', 'key', 'name', 'projectTypeKey', 'lead', 'description']
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Importar repositórios do GitHub como aplicações',
      icon: GitBranch,
      fields: ['id', 'name', 'full_name', 'html_url', 'language', 'description', 'owner']
    },
    {
      id: 'api',
      name: 'API Genérica',
      description: 'Conectar com qualquer API REST para importar aplicações',
      icon: Globe,
      fields: ['customizable']
    }
  ];



  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.technology.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || app.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleExport = () => {
    try {
      // Preparar dados para exportação
      const exportData = filteredApplications.map(app => ({
        'ID': app.id,
        'Nome': app.name,
        'Tipo': app.type,
        'Status': app.status,
        'URL': app.url,
        'Tecnologia': app.technology,
        'Responsável': app.owner,
        'Vulnerabilidades': app.vulnerabilities,
        'Nível de Risco': app.risk_level,
        'Último Scan': app.last_scan
      }));

      // Converter para CSV
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escapar valores que contêm vírgulas ou aspas
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `aplicacoes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Feedback para o usuário
      const count = filteredApplications.length;
      toast.success(`Exportação concluída! ${count} aplicação${count !== 1 ? 'ões' : ''} exportada${count !== 1 ? 's' : ''}.`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar dados. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/vulnerabilities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Layers className="h-8 w-8 text-primary" />
              Inventário de Aplicações
            </h1>
            <p className="text-muted-foreground">
              Gerencie o inventário das aplicações da organização
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/vulnerabilities/applications/fields-customization')}>
              <Settings className="h-4 w-4 mr-2" />
              Customizar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                {IMPORT_TOOLS.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <DropdownMenuItem
                      key={tool.id}
                      onClick={() => handleImportFromTool(tool.id)}
                      className="flex items-start gap-3 p-3"
                    >
                      <IconComponent className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-muted-foreground">{tool.description}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleImportFromTool('manual')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Importação Manual (CSV, XML, JSON)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => navigate('/vulnerabilities/applications/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Aplicação
            </Button>
          </div>
        </div>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Filtre e pesquise aplicações no inventário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pesquisar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome, ID ou tecnologia..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Web Application">Web Application</SelectItem>
                      <SelectItem value="Mobile App">Mobile App</SelectItem>
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Cloud Service">Cloud Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Desenvolvimento">Desenvolvimento</SelectItem>
                      <SelectItem value="Teste">Teste</SelectItem>
                      <SelectItem value="Descontinuado">Descontinuado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ações</label>
                  <Button variant="outline" className="w-full">
                    Filtros Avançados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aplicações ({filteredApplications.length})</CardTitle>
                  <CardDescription>
                    Lista de aplicações no inventário
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tecnologia</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Vulnerabilidades</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Último Scan</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(app.type)}
                            <div>
                              <p className="font-medium">{app.name}</p>
                              <p className="text-xs text-muted-foreground">{app.url}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{app.type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(app.status)}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.technology}</TableCell>
                        <TableCell>{app.owner}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {app.vulnerabilities} vuln.
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(app.risk_level)}>
                            {app.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(app.last_scan).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Edit Application"
                              onClick={() => navigate(`/vulnerabilities/applications/edit/${app.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Delete Application">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedImportTool && (() => {
                const tool = IMPORT_TOOLS.find(t => t.id === selectedImportTool);
                if (tool) {
                  const IconComponent = tool.icon;
                  return (
                    <>
                      <IconComponent className="h-5 w-5" />
                      Importar de {tool.name}
                    </>
                  );
                }
                return 'Importar Aplicações';
              })()}
            </DialogTitle>
            <DialogDescription>
              {selectedImportTool && (() => {
                const tool = IMPORT_TOOLS.find(t => t.id === selectedImportTool);
                return tool?.description || 'Configure a importação de aplicações';
              })()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedImportTool === 'servicenow' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Configuração ServiceNow
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure a conexão com o ServiceNow CMDB para importar aplicações
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="snow-instance">Instância ServiceNow *</Label>
                  <Input
                    id="snow-instance"
                    placeholder="https://sua-empresa.service-now.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="snow-username">Usuário</Label>
                    <Input id="snow-username" placeholder="usuario.api" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="snow-password">Senha/Token</Label>
                    <Input id="snow-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="snow-table">Tabela CMDB</Label>
                  <Select defaultValue="cmdb_ci_appl">
                    <SelectTrigger data-testid="snow-table">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cmdb_ci_appl">cmdb_ci_appl (Applications)</SelectItem>
                      <SelectItem value="cmdb_ci_service">cmdb_ci_service (Services)</SelectItem>
                      <SelectItem value="cmdb_ci_business_app">cmdb_ci_business_app (Business Applications)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="snow-filter">Filtro (opcional)</Label>
                  <Input
                    id="snow-filter"
                    placeholder="ex: install_status=1^operational_status=1"
                  />
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Button 
                    variant="outline" 
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="w-full"
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Testando Conexão...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {selectedImportTool === 'jira' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Configuração Jira
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure a conexão com o Atlassian Jira para importar projetos como aplicações
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jira-server">Servidor Jira *</Label>
                  <Input
                    id="jira-server"
                    placeholder="https://sua-empresa.atlassian.net"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jira-username">Email</Label>
                    <Input id="jira-username" placeholder="usuario@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jira-token">API Token</Label>
                    <Input id="jira-token" type="password" placeholder="••••••••" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jira-projects">Projetos (opcional)</Label>
                  <Input
                    id="jira-projects"
                    placeholder="PROJ1,PROJ2,PROJ3 (deixe vazio para todos)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Chaves dos projetos separadas por vírgula. Deixe vazio para importar todos os projetos.
                  </p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Button 
                    variant="outline" 
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="w-full"
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Testando Conexão...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {selectedImportTool === 'github' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Configuração GitHub
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure a conexão com o GitHub para importar repositórios como aplicações
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github-token">Token de Acesso *</Label>
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    Personal Access Token ou GitHub App token
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="github-server">Servidor GitHub (opcional)</Label>
                  <Input
                    id="github-server"
                    placeholder="https://api.github.com (padrão)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para GitHub Enterprise, use: https://github.empresa.com/api/v3
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-org">Organização (opcional)</Label>
                    <Input id="github-org" placeholder="nome-da-organizacao" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-repos">Repositórios (opcional)</Label>
                    <Input id="github-repos" placeholder="org/repo1,org/repo2" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="github-include-archived"
                    className="rounded"
                  />
                  <Label htmlFor="github-include-archived">Incluir repositórios arquivados</Label>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Button 
                    variant="outline" 
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="w-full"
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Testando Conexão...
                      </>
                    ) : (
                      <>
                        <GitBranch className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {selectedImportTool === 'api' && (
              <div className="space-y-6">
                {/* Configuração Básica */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Configuração da API
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Configure a URL e método HTTP para conectar com sua API de aplicações
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app-api-url">URL da API *</Label>
                    <Input
                      id="app-api-url"
                      placeholder="https://api.exemplo.com/applications"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="app-api-method">Método HTTP</Label>
                      <Select defaultValue="GET">
                        <SelectTrigger data-testid="app-api-method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app-api-auth-type">Tipo de Autenticação</Label>
                      <Select defaultValue="none">
                        <SelectTrigger data-testid="app-api-auth-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                          <SelectItem value="apikey">API Key</SelectItem>
                          <SelectItem value="custom">Custom Headers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Autenticação */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Credenciais de Acesso
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="app-api-key">API Key</Label>
                      <Input
                        id="app-api-key"
                        type="password"
                        placeholder="sua-api-key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app-api-token">Bearer Token</Label>
                      <Input
                        id="app-api-token"
                        type="password"
                        placeholder="seu-bearer-token"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="app-api-username">Usuário</Label>
                      <Input
                        id="app-api-username"
                        placeholder="usuario"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="app-api-password">Senha</Label>
                      <Input
                        id="app-api-password"
                        type="password"
                        placeholder="senha"
                      />
                    </div>
                  </div>
                </div>

                {/* Configuração de Dados */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Processamento de Dados
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app-api-data-path">Caminho dos Dados (JSONPath)</Label>
                    <Input
                      id="app-api-data-path"
                      placeholder="data.applications ou response.projects"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app-api-field-mapping">Mapeamento de Campos (JSON)</Label>
                    <Textarea
                      id="app-api-field-mapping"
                      placeholder='{"name": "app_name", "type": "category", "owner": "responsible"}'
                      rows={4}
                    />
                  </div>
                </div>

                {/* Configuração Avançada */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configuração Avançada
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app-api-headers">Headers Customizados (JSON)</Label>
                    <Textarea
                      id="app-api-headers"
                      placeholder='{"X-Custom-Header": "valor", "Accept": "application/json"}'
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app-api-body">Body da Requisição (JSON)</Label>
                    <Textarea
                      id="app-api-body"
                      placeholder='{"filters": {"status": "active"}, "limit": 100}'
                      rows={3}
                    />
                  </div>
                </div>

                {/* Teste de Conexão */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    <span className="font-medium">Teste de Conectividade</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Teste a conexão com a API antes de iniciar a importação
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={testConnection}
                    disabled={isTestingConnection}
                    className="w-full"
                  >
                    {isTestingConnection ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                        Testando Conexão...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {selectedImportTool === 'manual' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Selecione arquivos para importação manual
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-4">
                    Formatos suportados: CSV, XML, JSON, TXT
                  </p>
                  <Button variant="outline">
                    Selecionar Arquivos
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setImportModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => handleRealImport()}
                disabled={isImporting || isTestingConnection}
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Iniciar Importação
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}