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
  Server,
  ArrowLeft,
  Search,
  Plus,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Monitor,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu,
  Network,
  Settings,
  ChevronDown,
  Database,
  Cloud,
  FileText,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextSimple';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

export default function CMDB() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tenantId = useCurrentTenantId();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedImportTool, setSelectedImportTool] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Check if user can manage custom fields (admin only)
  const canManageFields = () => {
    if (!user) {
      return false;
    }
    
    const hasPermission = user.isPlatformAdmin || 
                         user.roles?.includes('admin') || 
                         user.roles?.includes('tenant_admin') ||
                         user.roles?.includes('super_admin') ||
                         user.roles?.includes('platform_admin');
    
    return hasPermission;
  };

  // Mock data
  const [mockAssets, setMockAssets] = useState([
    {
      id: 'SRV-001',
      name: 'Web Server 01',
      type: 'Server',
      status: 'Ativo',
      ip_address: '192.168.1.10',
      location: 'Datacenter SP',
      os: 'Ubuntu 22.04 LTS',
      owner: 'Equipe Infraestrutura',
      vulnerabilities: 8,
      last_scan: '2024-01-15',
      risk_level: 'Médio'
    },
    {
      id: 'WKS-001',
      name: 'Workstation Dev-01',
      type: 'Workstation',
      status: 'Ativo',
      ip_address: '192.168.1.50',
      location: 'Escritório SP',
      os: 'Windows 11 Pro',
      owner: 'João Silva',
      vulnerabilities: 3,
      last_scan: '2024-01-14',
      risk_level: 'Baixo'
    },
    {
      id: 'NET-001',
      name: 'Switch Core',
      type: 'Network Device',
      status: 'Ativo',
      ip_address: '192.168.1.1',
      location: 'Datacenter SP',
      os: 'Cisco IOS 15.2',
      owner: 'Equipe Rede',
      vulnerabilities: 12,
      last_scan: '2024-01-13',
      risk_level: 'Alto'
    },
    {
      id: 'SRV-002',
      name: 'Database Server',
      type: 'Server',
      status: 'Ativo',
      ip_address: '192.168.1.20',
      location: 'Datacenter RJ',
      os: 'CentOS 8',
      owner: 'Equipe DBA',
      vulnerabilities: 5,
      last_scan: '2024-01-12',
      risk_level: 'Médio'
    },
    {
      id: 'MOB-001',
      name: 'Tablet Vendas',
      type: 'Mobile Device',
      status: 'Ativo',
      ip_address: '192.168.1.100',
      location: 'Escritório RJ',
      os: 'Android 13',
      owner: 'Equipe Vendas',
      vulnerabilities: 2,
      last_scan: '2024-01-11',
      risk_level: 'Baixo'
    },
    {
      id: 'SRV-003',
      name: 'Backup Server',
      type: 'Server',
      status: 'Manutenção',
      ip_address: '192.168.1.30',
      location: 'Datacenter SP',
      os: 'Ubuntu 20.04 LTS',
      owner: 'Equipe Backup',
      vulnerabilities: 15,
      last_scan: '2024-01-10',
      risk_level: 'Alto'
    }
  ]);

  const getTypeIcon = (type: string) => {
    const icons = {
      'Server': Server,
      'Workstation': Monitor,
      'Network Device': Network,
      'Mobile Device': Smartphone,
      'Storage': HardDrive,
      'Infrastructure': Cpu,
    };
    const IconComponent = icons[type as keyof typeof icons] || Server;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      'Ativo': 'bg-green-600 text-white border border-green-700',
      'Inativo': 'bg-gray-600 text-white border border-gray-700',
      'Manutenção': 'bg-yellow-600 text-white border border-yellow-700',
      'Descomissionado': 'bg-red-600 text-white border border-red-700',
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
      
      const response = await fetch('/api/integrations/cmdb/test-connection', {
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
      
      const response = await fetch('/api/integrations/cmdb/import-assets', {
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
        // Refresh the page or update the asset list
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
        credentials.table = (document.querySelector('[data-testid="snow-table"]') as HTMLSelectElement)?.value || 'cmdb_ci';
        credentials.filter = (document.getElementById('snow-filter') as HTMLInputElement)?.value;
        break;
        
      case 'lansweeper':
        credentials.server = (document.getElementById('ls-server') as HTMLInputElement)?.value;
        credentials.database = (document.getElementById('ls-database') as HTMLInputElement)?.value;
        credentials.username = (document.getElementById('ls-username') as HTMLInputElement)?.value;
        credentials.password = (document.getElementById('ls-password') as HTMLInputElement)?.value;
        credentials.customQuery = (document.getElementById('ls-query') as HTMLTextAreaElement)?.value;
        break;
        
      case 'sccm':
        credentials.server = (document.getElementById('sccm-server') as HTMLInputElement)?.value;
        credentials.username = (document.getElementById('sccm-username') as HTMLInputElement)?.value;
        credentials.password = (document.getElementById('sccm-password') as HTMLInputElement)?.value;
        credentials.additionalParams = {
          siteCode: (document.getElementById('sccm-site') as HTMLInputElement)?.value,
          collection: (document.getElementById('sccm-collection') as HTMLInputElement)?.value
        };
        break;
        
      case 'aws':
        credentials.region = (document.querySelector('[data-testid="aws-region"]') as HTMLSelectElement)?.value;
        credentials.username = (document.getElementById('aws-access-key') as HTMLInputElement)?.value; // Using username field for access key
        credentials.password = (document.getElementById('aws-secret-key') as HTMLInputElement)?.value; // Using password field for secret
        credentials.resourceTypes = (document.getElementById('aws-resource-types') as HTMLInputElement)?.value?.split(',').map(s => s.trim());
        break;
        
      case 'azure':
        credentials.tenantId = (document.getElementById('azure-tenant') as HTMLInputElement)?.value;
        credentials.subscriptionId = (document.getElementById('azure-subscription') as HTMLInputElement)?.value;
        credentials.clientId = (document.getElementById('azure-client-id') as HTMLInputElement)?.value;
        credentials.clientSecret = (document.getElementById('azure-client-secret') as HTMLInputElement)?.value;
        credentials.additionalParams = {
          resourceGroups: (document.getElementById('azure-resource-groups') as HTMLInputElement)?.value?.split(',').map(s => s.trim())
        };
        break;
        
      case 'api':
        credentials.server = (document.getElementById('cmdb-api-url') as HTMLInputElement)?.value;
        credentials.method = (document.querySelector('[data-testid="cmdb-api-method"]') as HTMLSelectElement)?.value || 'GET';
        credentials.authType = (document.querySelector('[data-testid="cmdb-api-auth-type"]') as HTMLSelectElement)?.value || 'none';
        credentials.apiKey = (document.getElementById('cmdb-api-key') as HTMLInputElement)?.value;
        credentials.token = (document.getElementById('cmdb-api-token') as HTMLInputElement)?.value;
        credentials.username = (document.getElementById('cmdb-api-username') as HTMLInputElement)?.value;
        credentials.password = (document.getElementById('cmdb-api-password') as HTMLInputElement)?.value;
        credentials.dataPath = (document.getElementById('cmdb-api-data-path') as HTMLInputElement)?.value;
        
        const cmdbHeaders = (document.getElementById('cmdb-api-headers') as HTMLTextAreaElement)?.value;
        const cmdbBody = (document.getElementById('cmdb-api-body') as HTMLTextAreaElement)?.value;
        const cmdbFieldMapping = (document.getElementById('cmdb-api-field-mapping') as HTMLTextAreaElement)?.value;
        
        try {
          credentials.headers = cmdbHeaders ? JSON.parse(cmdbHeaders) : {};
          credentials.body = cmdbBody ? JSON.parse(cmdbBody) : undefined;
          credentials.fieldMapping = cmdbFieldMapping ? JSON.parse(cmdbFieldMapping) : {};
        } catch (e) {
          console.error('JSON parse error for CMDB API:', e);
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
    
    return filters;
  };

  const handleImportFromTool = (tool: string) => {
    setSelectedImportTool(tool);
    setImportModalOpen(true);
  };

  const handleExportToFormat = (format: string) => {
    setSelectedExportFormat(format);
    setExportModalOpen(true);
  };

  const executeExport = (format: string, options: any = {}) => {
    const dataToExport = filteredAssets.map(asset => ({
      ID: asset.id,
      Nome: asset.name,
      Tipo: asset.type,
      Status: asset.status,
      'Endereço IP': asset.ip_address,
      'Localização': asset.location,
      'Sistema Operacional': asset.os,
      'Responsável': asset.owner,
      'Vulnerabilidades': asset.vulnerabilities,
      'Nível de Risco': asset.risk_level,
      'Último Scan': asset.last_scan
    }));

    switch (format) {
      case 'csv':
        exportToCSV(dataToExport, options);
        break;
      case 'excel':
        exportToExcel(dataToExport, options);
        break;
      case 'pdf':
        exportToPDF(dataToExport, options);
        break;
      case 'json':
        exportToJSON(dataToExport, options);
        break;
      case 'xml':
        exportToXML(dataToExport, options);
        break;
      default:
        console.error('Formato de exportação não suportado:', format);
    }
  };

  const exportToCSV = (data: any[], options: any) => {
    const delimiter = options.delimiter || ',';
    const headers = Object.keys(data[0]).join(delimiter);
    const rows = data.map(row => Object.values(row).join(delimiter));
    const csvContent = [headers, ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ativos_cmdb_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = (data: any[], options: any) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ativos_cmdb_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const exportToXML = (data: any[], options: any) => {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<ativos>\n';
    data.forEach(item => {
      xmlContent += '  <ativo>\n';
      Object.entries(item).forEach(([key, value]) => {
        xmlContent += `    <${key.toLowerCase().replace(/\s+/g, '_')}>${value}</${key.toLowerCase().replace(/\s+/g, '_')}>\n`;
      });
      xmlContent += '  </ativo>\n';
    });
    xmlContent += '</ativos>';
    
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ativos_cmdb_${new Date().toISOString().split('T')[0]}.xml`;
    link.click();
  };

  const exportToExcel = (data: any[], options: any) => {
    // Simulação de exportação Excel (em produção usaria uma biblioteca como xlsx)
    console.log('Exportação Excel não implementada. Use CSV como alternativa.');
    exportToCSV(data, { delimiter: ',' });
  };

  const exportToPDF = (data: any[], options: any) => {
    // Simulação de exportação PDF (em produção usaria uma biblioteca como jsPDF)
    console.log('Exportação PDF não implementada. Use CSV como alternativa.');
    exportToCSV(data, { delimiter: ',' });
  };

  const IMPORT_TOOLS = [
    {
      id: 'servicenow',
      name: 'ServiceNow',
      description: 'Importar ativos do ServiceNow CMDB',
      icon: Database,
      fields: ['sys_id', 'name', 'ip_address', 'serial_number', 'model_id', 'location', 'assigned_to']
    },
    {
      id: 'lansweeper',
      name: 'Lansweeper',
      description: 'Importar descoberta de ativos do Lansweeper',
      icon: Network,
      fields: ['AssetName', 'IPAddress', 'Domain', 'Username', 'OS', 'Model', 'SerialNumber']
    },
    {
      id: 'sccm',
      name: 'Microsoft SCCM',
      description: 'Importar inventário do System Center Configuration Manager',
      icon: Monitor,
      fields: ['Name', 'IPAddresses', 'OperatingSystem', 'Model', 'SerialNumber', 'LastLogonUser']
    },
    {
      id: 'aws',
      name: 'AWS Config',
      description: 'Importar recursos da AWS via Config Service',
      icon: Cloud,
      fields: ['resourceId', 'resourceName', 'resourceType', 'availabilityZone', 'tags']
    },
    {
      id: 'azure',
      name: 'Azure Resource Graph',
      description: 'Importar recursos do Azure Resource Manager',
      icon: Cloud,
      fields: ['id', 'name', 'type', 'location', 'resourceGroup', 'tags']
    },
    {
      id: 'csv',
      name: 'Arquivo CSV',
      description: 'Importar ativos de arquivo CSV personalizado',
      icon: FileText,
      fields: ['customizable']
    },
    {
      id: 'api',
      name: 'API Genérica',
      description: 'Conectar com qualquer API REST para importar ativos',
      icon: Globe,
      fields: ['url', 'method', 'auth', 'headers', 'body', 'mapping']
    }
  ];

  const EXPORT_FORMATS = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'Arquivo de valores separados por vírgula',
      icon: FileText,
      extension: '.csv'
    },
    {
      id: 'excel',
      name: 'Excel',
      description: 'Planilha do Microsoft Excel',
      icon: FileText,
      extension: '.xlsx'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Formato de dados JavaScript Object Notation',
      icon: FileText,
      extension: '.json'
    },
    {
      id: 'xml',
      name: 'XML',
      description: 'Arquivo de marcação extensível',
      icon: FileText,
      extension: '.xml'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Documento portátil para relatórios',
      icon: FileText,
      extension: '.pdf'
    }
  ];

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.ip_address.includes(searchTerm) ||
                         asset.os.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || asset.location === locationFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  const assetStats = {
    total: mockAssets.length,
    active: mockAssets.filter(asset => asset.status === 'Ativo').length,
    servers: mockAssets.filter(asset => asset.type === 'Server').length,
    workstations: mockAssets.filter(asset => asset.type === 'Workstation').length,
    network: mockAssets.filter(asset => asset.type === 'Network Device').length,
    mobile: mockAssets.filter(asset => asset.type === 'Mobile Device').length,
    highRisk: mockAssets.filter(asset => asset.risk_level === 'Alto').length,
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
              <Server className="h-8 w-8 text-primary" />
              CMDB - Configuration Management Database
            </h1>
            <p className="text-muted-foreground">
              Inventário de servidores, workstations e ativos de infraestrutura e rede
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2">
            {canManageFields() && (
              <Button variant="outline" onClick={() => navigate('/vulnerabilities/cmdb/fields-customization')}>
                <Settings className="h-4 w-4 mr-2" />
                Customizar
              </Button>
            )}
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
                  <FileText className="h-4 w-4 mr-2" />
                  Importação Manual
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                {EXPORT_FORMATS.map((format) => {
                  const IconComponent = format.icon;
                  return (
                    <DropdownMenuItem
                      key={format.id}
                      onClick={() => handleExportToFormat(format.id)}
                      className="flex items-start gap-3 p-3"
                    >
                      <IconComponent className="h-4 w-4 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{format.name}</div>
                        <div className="text-sm text-muted-foreground">{format.description}</div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => executeExport('csv', { delimiter: ',' })}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportação Rápida (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => navigate('/vulnerabilities/cmdb/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ativo
            </Button>
          </div>
        </div>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>
                Filtre e pesquise ativos no CMDB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pesquisar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome, ID, IP ou SO..."
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
                      <SelectItem value="Server">Servidor</SelectItem>
                      <SelectItem value="Workstation">Workstation</SelectItem>
                      <SelectItem value="Network Device">Dispositivo de Rede</SelectItem>
                      <SelectItem value="Mobile Device">Dispositivo Móvel</SelectItem>
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
                      <SelectItem value="Inativo">Inativo</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Descomissionado">Descomissionado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Localização</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="Datacenter SP">Datacenter SP</SelectItem>
                      <SelectItem value="Datacenter RJ">Datacenter RJ</SelectItem>
                      <SelectItem value="Escritório SP">Escritório SP</SelectItem>
                      <SelectItem value="Escritório RJ">Escritório RJ</SelectItem>
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

          {/* Assets Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ativos ({filteredAssets.length})</CardTitle>
                  <CardDescription>
                    Lista de ativos no CMDB
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
                      <TableHead>IP</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>SO</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Vulnerabilidades</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Último Scan</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(asset.type)}
                            <span className="font-medium">{asset.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{asset.type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(asset.status)}>
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{asset.ip_address}</TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell>{asset.os}</TableCell>
                        <TableCell>{asset.owner}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {asset.vulnerabilities} vuln.
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(asset.risk_level)}>
                            {asset.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(asset.last_scan).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
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
                return 'Importar Ativos';
              })()}
            </DialogTitle>
            <DialogDescription>
              {selectedImportTool && (() => {
                const tool = IMPORT_TOOLS.find(t => t.id === selectedImportTool);
                return tool?.description || 'Configure a importação de ativos';
              })()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedImportTool === 'servicenow' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="snow-instance">Instância ServiceNow</Label>
                    <Input
                      id="snow-instance"
                      placeholder="https://sua-empresa.service-now.com"
                    />
                  </div>
                <div className="space-y-2">
                  <Label htmlFor="snow-table">Tabela CMDB</Label>
                  <Select defaultValue="cmdb_ci">
                    <SelectTrigger data-testid="snow-table">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cmdb_ci">cmdb_ci (Configuration Items)</SelectItem>
                      <SelectItem value="cmdb_ci_computer">cmdb_ci_computer (Computers)</SelectItem>
                      <SelectItem value="cmdb_ci_server">cmdb_ci_server (Servers)</SelectItem>
                      <SelectItem value="cmdb_ci_netgear">cmdb_ci_netgear (Network Equipment)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center pt-2">
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
                  <Label htmlFor="snow-filter">Filtro (opcional)</Label>
                  <Input
                    id="snow-filter"
                    placeholder="ex: install_status=1^operational_status=1"
                  />
                </div>
              </div>
            )}

            {selectedImportTool === 'lansweeper' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ls-server">Servidor Lansweeper</Label>
                    <Input id="ls-server" placeholder="lansweeper.empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ls-database">Database</Label>
                    <Input id="ls-database" placeholder="lansweeperdb" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ls-username">Usuário SQL</Label>
                    <Input id="ls-username" placeholder="lansweeper_user" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ls-password">Senha</Label>
                    <Input id="ls-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ls-query">Query SQL Personalizada (opcional)</Label>
                  <Textarea
                    id="ls-query"
                    placeholder="SELECT AssetName, IPAddress, Domain, Username, OS FROM tblAssets WHERE..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {selectedImportTool === 'sccm' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sccm-server">Servidor SCCM</Label>
                    <Input id="sccm-server" placeholder="sccm.empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sccm-site">Site Code</Label>
                    <Input id="sccm-site" placeholder="PS1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sccm-username">Usuário</Label>
                    <Input id="sccm-username" placeholder="DOMAIN\\usuario" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sccm-password">Senha</Label>
                    <Input id="sccm-password" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sccm-collection">Coleção (opcional)</Label>
                  <Input
                    id="sccm-collection"
                    placeholder="All Systems"
                  />
                </div>
              </div>
            )}

            {selectedImportTool === 'aws' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aws-region">Região AWS</Label>
                    <Select defaultValue="us-east-1">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">us-east-1 (N. Virginia)</SelectItem>
                        <SelectItem value="us-west-2">us-west-2 (Oregon)</SelectItem>
                        <SelectItem value="sa-east-1">sa-east-1 (São Paulo)</SelectItem>
                        <SelectItem value="eu-west-1">eu-west-1 (Ireland)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aws-profile">Perfil AWS</Label>
                    <Input id="aws-profile" placeholder="default" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aws-access-key">Access Key ID</Label>
                    <Input id="aws-access-key" placeholder="AKIA..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aws-secret-key">Secret Access Key</Label>
                    <Input id="aws-secret-key" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aws-resource-types">Tipos de Recurso</Label>
                  <Input
                    id="aws-resource-types"
                    placeholder="EC2::Instance,RDS::DBInstance,S3::Bucket"
                  />
                </div>
              </div>
            )}

            {selectedImportTool === 'azure' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="azure-tenant">Tenant ID</Label>
                    <Input id="azure-tenant" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="azure-subscription">Subscription ID</Label>
                    <Input id="azure-subscription" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="azure-client-id">Client ID</Label>
                    <Input id="azure-client-id" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="azure-client-secret">Client Secret</Label>
                    <Input id="azure-client-secret" type="password" placeholder="••••••••" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-resource-groups">Resource Groups (opcional)</Label>
                  <Input
                    id="azure-resource-groups"
                    placeholder="rg-prod,rg-dev,rg-test"
                  />
                </div>
              </div>
            )}

            {selectedImportTool === 'csv' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arraste e solte o arquivo CSV aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-4">
                    Formato esperado: Nome, Tipo, IP, SO, Localização, Responsável
                  </p>
                  <Button variant="outline">
                    Selecionar Arquivo CSV
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csv-delimiter">Delimitador</Label>
                  <Select defaultValue="comma">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comma">Vírgula (,)</SelectItem>
                      <SelectItem value="semicolon">Ponto e vírgula (;)</SelectItem>
                      <SelectItem value="tab">Tab (\t)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedImportTool === 'api' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cmdb-api-url">URL da API</Label>
                  <Input
                    id="cmdb-api-url"
                    placeholder="https://api.exemplo.com/assets"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cmdb-api-method">Método HTTP</Label>
                    <Select defaultValue="GET">
                      <SelectTrigger data-testid="cmdb-api-method">
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
                    <Label htmlFor="cmdb-api-auth-type">Tipo de Autenticação</Label>
                    <Select defaultValue="none">
                      <SelectTrigger data-testid="cmdb-api-auth-type">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cmdb-api-key">API Key (opcional)</Label>
                    <Input
                      id="cmdb-api-key"
                      type="password"
                      placeholder="sua-api-key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cmdb-api-token">Bearer Token (opcional)</Label>
                    <Input
                      id="cmdb-api-token"
                      type="password"
                      placeholder="seu-bearer-token"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cmdb-api-username">Usuário (opcional)</Label>
                    <Input
                      id="cmdb-api-username"
                      placeholder="usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cmdb-api-password">Senha (opcional)</Label>
                    <Input
                      id="cmdb-api-password"
                      type="password"
                      placeholder="senha"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cmdb-api-data-path">Caminho dos Dados (JSONPath)</Label>
                  <Input
                    id="cmdb-api-data-path"
                    placeholder="data.assets ou response.devices"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cmdb-api-headers">Headers Customizados (JSON)</Label>
                  <Textarea
                    id="cmdb-api-headers"
                    placeholder='{"X-Custom-Header": "valor", "Accept": "application/json"}'
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cmdb-api-body">Body da Requisição (JSON)</Label>
                  <Textarea
                    id="cmdb-api-body"
                    placeholder='{"filters": {"type": "server"}, "limit": 100}'
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cmdb-api-field-mapping">Mapeamento de Campos (JSON)</Label>
                  <Textarea
                    id="cmdb-api-field-mapping"
                    placeholder='{"name": "hostname", "type": "device_type", "ip_address": "ip"}'
                    rows={4}
                  />
                </div>
                <div className="flex justify-center pt-2">
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
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
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

      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Ativos
              {selectedExportFormat && (() => {
                const format = EXPORT_FORMATS.find(f => f.id === selectedExportFormat);
                return format ? ` - ${format.name}` : '';
              })()}
            </DialogTitle>
            <DialogDescription>
              Configure as opções de exportação para {filteredAssets.length} ativo(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Dados a serem exportados:</h4>
              <p className="text-sm text-muted-foreground">
                {filteredAssets.length} ativo(s) filtrado(s) da lista atual
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                Campos: ID, Nome, Tipo, Status, IP, Localização, SO, Responsável, Vulnerabilidades, Risco, Último Scan
              </div>
            </div>

            {selectedExportFormat === 'csv' && (
              <div className="space-y-2">
                <Label htmlFor="csv-delimiter">Delimitador</Label>
                <Select defaultValue="comma">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comma">Vírgula (,)</SelectItem>
                    <SelectItem value="semicolon">Ponto e vírgula (;)</SelectItem>
                    <SelectItem value="tab">Tab (\t)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedExportFormat === 'pdf' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pdf-orientation">Orientação</Label>
                  <Select defaultValue="landscape">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Retrato</SelectItem>
                      <SelectItem value="landscape">Paisagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdf-title">Título do Relatório</Label>
                  <Input
                    id="pdf-title"
                    placeholder="Relatório de Ativos CMDB"
                    defaultValue="Relatório de Ativos CMDB"
                  />
                </div>
              </div>
            )}

            {selectedExportFormat === 'excel' && (
              <div className="space-y-2">
                <Label htmlFor="excel-sheet">Nome da Planilha</Label>
                <Input
                  id="excel-sheet"
                  placeholder="Ativos"
                  defaultValue="Ativos"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setExportModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                if (selectedExportFormat) {
                  const options: any = {};
                  
                  if (selectedExportFormat === 'csv') {
                    const delimiterSelect = document.querySelector('[data-testid="csv-delimiter"]') as HTMLSelectElement;
                    options.delimiter = delimiterSelect?.value === 'semicolon' ? ';' : delimiterSelect?.value === 'tab' ? '\t' : ',';
                  }
                  
                  if (selectedExportFormat === 'pdf') {
                    const titleInput = document.getElementById('pdf-title') as HTMLInputElement;
                    options.title = titleInput?.value || 'Relatório de Ativos CMDB';
                  }
                  
                  if (selectedExportFormat === 'excel') {
                    const sheetInput = document.getElementById('excel-sheet') as HTMLInputElement;
                    options.sheetName = sheetInput?.value || 'Ativos';
                  }
                  
                  executeExport(selectedExportFormat, options);
                  setExportModalOpen(false);
                }
              }}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}