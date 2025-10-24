import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
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
  GitBranch,
  AlertTriangle,
  Calendar,
  ExternalLink,
  User,
  Clock
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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [riskFilter, setRiskFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [technologyFilter, setTechnologyFilter] = useState('all');

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

  const getStatusDisplayText = (status: string) => {
    const displayTexts = {
      'Ativo': 'Ativo',
      'Desenvolvimento': 'Desenv.',
      'Teste': 'Teste',
      'Descontinuado': 'Descontinuado',
      'Manutenção': 'Manutenção',
    };
    return displayTexts[status as keyof typeof displayTexts] || status;
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
        
      case 'gitlab':
        credentials.server = (document.getElementById('gitlab-server') as HTMLInputElement)?.value || 'https://gitlab.com';
        credentials.token = (document.getElementById('gitlab-token') as HTMLInputElement)?.value;
        credentials.group = (document.getElementById('gitlab-group') as HTMLInputElement)?.value;
        credentials.projects = (document.getElementById('gitlab-projects') as HTMLInputElement)?.value?.split(',').map(s => s.trim());
        credentials.includeArchived = (document.getElementById('gitlab-include-archived') as HTMLInputElement)?.checked;
        break;
        
      case 'azure-devops':
        credentials.organization = (document.getElementById('azure-org') as HTMLInputElement)?.value;
        credentials.token = (document.getElementById('azure-token') as HTMLInputElement)?.value;
        credentials.projects = (document.getElementById('azure-projects') as HTMLInputElement)?.value?.split(',').map(s => s.trim());
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
      fields: ['sys_id', 'name', 'version', 'install_status', 'operational_status', 'owned_by'],
      authMethods: ['basic', 'oauth2']
    },
    {
      id: 'jira',
      name: 'Atlassian Jira',
      description: 'Importar projetos do Jira como aplicações',
      icon: FileText,
      fields: ['id', 'key', 'name', 'projectTypeKey', 'lead', 'description'],
      authMethods: ['basic', 'token']
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Importar repositórios do GitHub como aplicações',
      icon: GitBranch,
      fields: ['id', 'name', 'full_name', 'html_url', 'language', 'description', 'owner'],
      authMethods: ['token', 'github_app']
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      description: 'Importar projetos do GitLab como aplicações',
      icon: GitBranch,
      fields: ['id', 'name', 'path_with_namespace', 'web_url', 'description', 'topics'],
      authMethods: ['token', 'oauth2']
    },
    {
      id: 'azure-devops',
      name: 'Azure DevOps',
      description: 'Importar projetos do Azure DevOps como aplicações',
      icon: Cloud,
      fields: ['id', 'name', 'description', 'url', 'state', 'visibility'],
      authMethods: ['pat', 'oauth2']
    },
    {
      id: 'api',
      name: 'API Genérica',
      description: 'Conectar com qualquer API REST para importar aplicações',
      icon: Globe,
      fields: ['customizable'],
      authMethods: ['none', 'basic', 'bearer', 'apikey', 'oauth2']
    }
  ];



  const handleViewApplication = (app: any) => {
    setSelectedApplication(app);
    setViewModalOpen(true);
  };

  const handleDeleteApplication = (appId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta aplicação?')) {
      toast.success('Aplicação excluída com sucesso!');
      // Aqui você implementaria a lógica real de exclusão
    }
  };

  const filteredApplications = mockApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || app.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || app.risk_level === riskFilter;
    const matchesOwner = ownerFilter === 'all' || app.owner === ownerFilter;
    const matchesTechnology = technologyFilter === 'all' || app.technology.includes(technologyFilter);
    
    return matchesSearch && matchesType && matchesStatus && matchesRisk && matchesOwner && matchesTechnology;
  });

  // Get unique values for filters
  const uniqueOwners = [...new Set(mockApplications.map(app => app.owner))];
  const uniqueTechnologies = [...new Set(mockApplications.map(app => app.technology))];
  const uniqueRisks = [...new Set(mockApplications.map(app => app.risk_level))];

  const clearAllFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setRiskFilter('all');
    setOwnerFilter('all');
    setTechnologyFilter('all');
    setAdvancedFiltersOpen(false);
  };

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
              Gerencie o inventário das aplicações da organização - Atualizado
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
                      <SelectItem value="Desenvolvimento">Desenv.</SelectItem>
                      <SelectItem value="Teste">Teste</SelectItem>
                      <SelectItem value="Descontinuado">Descontinuado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ações</label>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      console.log('Filtros avançados clicado:', !advancedFiltersOpen);
                      setAdvancedFiltersOpen(!advancedFiltersOpen);
                    }}
                  >
                    {advancedFiltersOpen ? 'Ocultar' : 'Mostrar'} Filtros Avançados
                  </Button>
                </div>
              </div>
              
              {/* Filtros Avançados */}
              {advancedFiltersOpen && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Filtros Avançados</h4>
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Limpar Todos
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nível de Risco</label>
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {uniqueRisks.map(risk => (
                              <SelectItem key={risk} value={risk}>{risk}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Responsável</label>
                        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {uniqueOwners.map(owner => (
                              <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tecnologia</label>
                        <Select value={technologyFilter} onValueChange={setTechnologyFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {uniqueTechnologies.map(tech => (
                              <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
                            {getStatusDisplayText(app.status)}
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
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Visualizar Detalhes"
                              onClick={() => {
                                console.log('Visualizar clicado:', app);
                                handleViewApplication(app);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Editar Aplicação"
                              onClick={() => navigate(`/vulnerabilities/applications/edit/${app.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Excluir Aplicação"
                              onClick={() => handleDeleteApplication(app.id)}
                            >
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

      {/* View Application Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              {selectedApplication && (
                <div className="p-2 rounded-lg bg-primary/10">
                  {getTypeIcon(selectedApplication.type)}
                </div>
              )}
              <div>
                <span>Detalhes da Aplicação</span>
                {selectedApplication && (
                  <p className="text-sm font-normal text-muted-foreground mt-1">
                    {selectedApplication.name} • {selectedApplication.id}
                  </p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
            {selectedApplication && (
              <div className="space-y-6 p-1">
                {/* Status e Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge className={getStatusBadgeColor(selectedApplication.status)}>
                            {getStatusDisplayText(selectedApplication.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-destructive">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-destructive/10">
                          <Target className="h-4 w-4 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vulnerabilidades</p>
                          <p className="text-2xl font-bold text-destructive">{selectedApplication.vulnerabilities}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Risco</p>
                          <Badge className={getRiskBadgeColor(selectedApplication.risk_level)}>
                            {selectedApplication.risk_level}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Último Scan</p>
                          <p className="text-sm font-medium">{new Date(selectedApplication.last_scan).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Informações Detalhadas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/20">
                          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          {getTypeIcon(selectedApplication.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">Tipo de Aplicação</p>
                          <p className="font-medium">{selectedApplication.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">URL/Localização</p>
                          <p className="text-sm break-all font-mono bg-muted/30 px-2 py-1 rounded">{selectedApplication.url}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Code className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">Tecnologia</p>
                          <Badge variant="outline" className="mt-1">{selectedApplication.technology}</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                          <p className="font-medium">{selectedApplication.owner}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/20">
                          <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        Segurança e Monitoramento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800">
                        <div>
                          <p className="text-sm font-medium text-red-700 dark:text-red-300">Vulnerabilidades Ativas</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{selectedApplication.vulnerabilities}</p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                          <Target className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1">Nível de Risco</p>
                          <Badge className={getRiskBadgeColor(selectedApplication.risk_level)}>
                            {selectedApplication.risk_level}
                          </Badge>
                        </div>
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1">Status</p>
                          <Badge className={getStatusBadgeColor(selectedApplication.status)}>
                            {getStatusDisplayText(selectedApplication.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Última Verificação</p>
                          <p className="text-xs text-muted-foreground">{new Date(selectedApplication.last_scan).toLocaleDateString('pt-BR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Ações Rápidas */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => {
                          setViewModalOpen(false);
                          navigate(`/vulnerabilities/applications/edit/${selectedApplication.id}`);
                        }}
                      >
                        <Edit className="h-5 w-5" />
                        <span className="text-sm">Editar Aplicação</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => {
                          // Ação para visualizar vulnerabilidades
                          toast.info('Redirecionando para vulnerabilidades...');
                        }}
                      >
                        <Target className="h-5 w-5" />
                        <span className="text-sm">Ver Vulnerabilidades</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center gap-2"
                        onClick={() => {
                          // Ação para iniciar scan
                          toast.info('Iniciando novo scan...');
                        }}
                      >
                        <Search className="h-5 w-5" />
                        <span className="text-sm">Novo Scan</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {/* Footer com Ações */}
          <div className="flex justify-between items-center pt-4 border-t bg-muted/20 -mx-6 -mb-6 px-6 py-4">
            <div className="text-sm text-muted-foreground">
              {selectedApplication && (
                <span>ID: {selectedApplication.id} • Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                Fechar
              </Button>
              <Button 
                onClick={() => {
                  setViewModalOpen(false);
                  navigate(`/vulnerabilities/applications/edit/${selectedApplication.id}`);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                
                <div className="space-y-2">
                  <Label htmlFor="snow-auth-type">Tipo de Autenticação</Label>
                  <Select defaultValue="basic">
                    <SelectTrigger data-testid="snow-auth-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic Authentication</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0 (Recomendado)</SelectItem>
                    </SelectContent>
                  </Select>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="snow-client-id">Client ID (OAuth)</Label>
                    <Input id="snow-client-id" placeholder="client-id-oauth" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="snow-client-secret">Client Secret (OAuth)</Label>
                    <Input id="snow-client-secret" type="password" placeholder="••••••••" />
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

            {selectedImportTool === 'gitlab' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Configuração GitLab
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure a conexão com o GitLab para importar projetos como aplicações
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gitlab-token">Token de Acesso *</Label>
                  <Input
                    id="gitlab-token"
                    type="password"
                    placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    Personal Access Token ou Project Access Token
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gitlab-server">Servidor GitLab (opcional)</Label>
                  <Input
                    id="gitlab-server"
                    placeholder="https://gitlab.com (padrão)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para GitLab self-hosted, use: https://gitlab.empresa.com
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gitlab-group">Grupo (opcional)</Label>
                    <Input id="gitlab-group" placeholder="nome-do-grupo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gitlab-projects">Projetos (opcional)</Label>
                    <Input id="gitlab-projects" placeholder="grupo/projeto1,grupo/projeto2" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="gitlab-include-archived"
                    className="rounded"
                  />
                  <Label htmlFor="gitlab-include-archived">Incluir projetos arquivados</Label>
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

            {selectedImportTool === 'azure-devops' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Configuração Azure DevOps
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure a conexão com o Azure DevOps para importar projetos como aplicações
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="azure-org">Organização *</Label>
                  <Input
                    id="azure-org"
                    placeholder="sua-organizacao"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome da organização no Azure DevOps
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="azure-token">Personal Access Token *</Label>
                  <Input
                    id="azure-token"
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••••••••••••••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    PAT com permissões de leitura para projetos
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="azure-projects">Projetos (opcional)</Label>
                  <Input
                    id="azure-projects"
                    placeholder="Projeto1,Projeto2,Projeto3 (deixe vazio para todos)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nomes dos projetos separados por vírgula. Deixe vazio para importar todos.
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
                        <Cloud className="h-4 w-4 mr-2" />
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