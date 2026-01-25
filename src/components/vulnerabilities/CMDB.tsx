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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';

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
  Globe,
  Filter,
  Sliders,
  X,
  CalendarIcon,
  User,
  Shield,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Building,
  MapPin,
  Zap,
  Activity,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
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
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [ownerSearchOpen, setOwnerSearchOpen] = useState(false);
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    assetTypes: [] as string[],
    riskLevels: [] as string[],
    owners: [] as string[],
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined
    },
    vulnerabilityRange: {
      min: undefined as number | undefined,
      max: undefined as number | undefined
    },
    operatingSystems: [] as string[],
    hasVulnerabilities: 'all' as 'all' | 'with' | 'without'
  });

  // Available options for advanced filters
  const assetTypeOptions = [
    { value: 'Server', label: 'Servidor', icon: Server, color: 'bg-blue-500 text-white' },
    { value: 'Workstation', label: 'Workstation', icon: Monitor, color: 'bg-green-500 text-white' },
    { value: 'Network Device', label: 'Dispositivo de Rede', icon: Network, color: 'bg-purple-500 text-white' },
    { value: 'Mobile Device', label: 'Dispositivo Móvel', icon: Smartphone, color: 'bg-orange-500 text-white' },
    { value: 'Storage', label: 'Armazenamento', icon: HardDrive, color: 'bg-red-500 text-white' },
    { value: 'Infrastructure', label: 'Infraestrutura', icon: Cpu, color: 'bg-yellow-500 text-black' }
  ];

  const riskLevelOptions = [
    { value: 'Crítico', label: 'Crítico', icon: AlertTriangle, color: 'bg-red-600 text-white' },
    { value: 'Alto', label: 'Alto', icon: Zap, color: 'bg-orange-600 text-white' },
    { value: 'Médio', label: 'Médio', icon: Activity, color: 'bg-yellow-600 text-white' },
    { value: 'Baixo', label: 'Baixo', icon: CheckCircle2, color: 'bg-green-600 text-white' }
  ];

  type Asset = {
    id: string;
    name: string;
    type: string;
    status: string;
    ip_address: string;
    location: string;
    os: string;
    owner: string;
    vulnerabilities: number;
    last_scan: string | null;
    risk_level: string;
  };

  // State for real data
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  React.useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        if (!tenantId) return;

        // Fetch systems (acting as assets)
        const { data: systemsData, error: systemsError } = await supabase
          .from('sistemas')
          .select('*')
          .eq('tenant_id', tenantId);

        if (systemsError) throw systemsError;

        // Fetch profiles for owner names
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email');

        if (profilesError) console.error('Error fetching profiles:', profilesError);

        const profileMap = new Map((profilesData || []).map(p => [p.id, p.full_name || p.email]));

        // Fetch vulnerabilities to count them per asset
        const { data: vulnsData, error: vulnsError } = await supabase
          .from('vulnerabilities')
          .select('asset_name, created_at, severity')
          .eq('tenant_id', tenantId);

        if (vulnsError) console.error('Error fetching vulnerabilities:', vulnsError);

        // Map vulnerabilities to assets
        const vulnStats = new Map<string, { count: number, lastScan: string | null }>();

        (vulnsData || []).forEach(v => {
          const stats = vulnStats.get(v.asset_name) || { count: 0, lastScan: null };

          stats.count++;

          // Track latest date
          if (v.created_at) {
            if (!stats.lastScan || new Date(v.created_at) > new Date(stats.lastScan)) {
              stats.lastScan = v.created_at;
            }
          }

          vulnStats.set(v.asset_name, stats);
        });

        // Transform systems to assets format
        const transformedAssets: Asset[] = (systemsData || []).map(sys => {
          const stats = vulnStats.get(sys.nome) || { count: 0, lastScan: null };

          return {
            id: sys.id,
            name: sys.nome,
            type: sys.tipo || 'Server', // Default to Server if unknown
            status: sys.status || 'Ativo',
            ip_address: 'N/A', // Not available in sistemas table
            location: 'N/A', // Not available
            os: 'N/A', // Not available
            owner: sys.responsavel_tecnico ? (profileMap.get(sys.responsavel_tecnico) || 'Não atribuído') : 'Não atribuído',
            vulnerabilities: stats.count,
            last_scan: stats.lastScan || null,
            risk_level: sys.criticidade || 'Baixo'
          };
        });

        setAssets(transformedAssets);
      } catch (error) {
        console.error('Error fetching assets:', error);
        toast.error('Erro ao carregar ativos do CMDB.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [tenantId]);

  // Generate owner options from real data
  const generateOwnerOptions = () => {
    const owners = Array.from(new Set(assets.map(asset => asset.owner)));
    return owners.map(owner => ({
      value: owner,
      label: owner,
      team: owner.includes('Equipe') ? owner.replace('Equipe ', '') : 'Individual'
    }));
  };

  const ownerOptions = generateOwnerOptions();

  // Generate OS options from real data
  const generateOSOptions = () => {
    const osList = Array.from(new Set(assets.map(asset => asset.os)));
    return osList.map(os => ({
      value: os,
      label: os,
      type: os.includes('Windows') ? 'Windows' : os.includes('Ubuntu') || os.includes('CentOS') || os === 'Linux' ? 'Linux' : os.includes('Android') ? 'Mobile' : 'Other'
    }));
  };

  const osOptions = generateOSOptions();

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

  // Advanced filters functions
  const getActiveFiltersCount = () => {
    let count = 0;
    if (advancedFilters.assetTypes.length > 0) count++;
    if (advancedFilters.riskLevels.length > 0) count++;
    if (advancedFilters.owners.length > 0) count++;
    if (advancedFilters.dateRange.from || advancedFilters.dateRange.to) count++;
    if (advancedFilters.vulnerabilityRange.min !== undefined || advancedFilters.vulnerabilityRange.max !== undefined) count++;
    if (advancedFilters.operatingSystems.length > 0) count++;
    if (advancedFilters.hasVulnerabilities !== 'all') count++;
    return count;
  };

  const clearAllAdvancedFilters = () => {
    setAdvancedFilters({
      assetTypes: [],
      riskLevels: [],
      owners: [],
      dateRange: { from: undefined, to: undefined },
      vulnerabilityRange: { min: undefined, max: undefined },
      operatingSystems: [],
      hasVulnerabilities: 'all'
    });
  };

  // Filter owners based on search term
  const filteredOwnerOptions = ownerOptions.filter(owner =>
    owner.value.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
    owner.label.toLowerCase().includes(ownerSearchTerm.toLowerCase()) ||
    owner.team.toLowerCase().includes(ownerSearchTerm.toLowerCase())
  );

  const addOwner = (ownerId: string) => {
    if (!advancedFilters.owners.includes(ownerId)) {
      setAdvancedFilters(prev => ({
        ...prev,
        owners: [...prev.owners, ownerId]
      }));
    }
    setOwnerSearchTerm('');
    setOwnerSearchOpen(false);
  };

  const removeOwner = (ownerId: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      owners: prev.owners.filter(id => id !== ownerId)
    }));
  };

  // Asset action handlers
  const handleViewAsset = (asset: any) => {
    console.log('Visualizar ativo clicado:', asset);
    setSelectedAsset(asset);
    setViewModalOpen(true);
  };

  const handleDeleteAsset = (assetId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ativo?')) {
      console.log('Excluindo ativo:', assetId);
      toast.success(`Ativo ${assetId} excluído com sucesso!`);
      // Aqui você implementaria a lógica real de exclusão
    }
  };



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
      name: 'ServiceNow CMDB',
      description: 'Importar ativos do ServiceNow CMDB (API v2)',
      icon: Database,
      apiVersion: 'v2',
      fields: ['sys_id', 'name', 'ip_address', 'serial_number', 'model_id', 'location', 'assigned_to', 'discovery_source', 'environment', 'business_criticality'],
      authMethods: ['basic', 'oauth2', 'jwt'],
      tables: ['cmdb_ci', 'cmdb_ci_computer', 'cmdb_ci_server', 'cmdb_ci_netgear', 'cmdb_ci_cloud_service']
    },
    {
      id: 'lansweeper',
      name: 'Lansweeper',
      description: 'Importar descoberta de ativos do Lansweeper (API v2)',
      icon: Network,
      apiVersion: 'v2',
      fields: ['AssetName', 'IPAddress', 'Domain', 'Username', 'OS', 'Model', 'SerialNumber', 'LastSeen', 'AssetType', 'Manufacturer'],
      authMethods: ['basic', 'token', 'windows_auth']
    },
    {
      id: 'sccm',
      name: 'Microsoft SCCM',
      description: 'Importar inventário do System Center Configuration Manager (WMI/PowerShell)',
      icon: Monitor,
      apiVersion: '2022',
      fields: ['Name', 'IPAddresses', 'OperatingSystem', 'Model', 'SerialNumber', 'LastLogonUser', 'InstallDate', 'TotalPhysicalMemory'],
      authMethods: ['windows_auth', 'powershell', 'wmi']
    },
    {
      id: 'aws',
      name: 'AWS Config',
      description: 'Importar recursos da AWS via Config Service (API 2023-01-01)',
      icon: Cloud,
      apiVersion: '2023-01-01',
      fields: ['resourceId', 'resourceName', 'resourceType', 'availabilityZone', 'tags', 'configuration', 'relationships', 'compliance'],
      authMethods: ['access_key', 'iam_role', 'sts_assume_role']
    },
    {
      id: 'azure',
      name: 'Azure Resource Graph',
      description: 'Importar recursos do Azure Resource Manager (API 2022-10-01)',
      icon: Cloud,
      apiVersion: '2022-10-01',
      fields: ['id', 'name', 'type', 'location', 'resourceGroup', 'tags', 'properties', 'sku', 'identity'],
      authMethods: ['service_principal', 'managed_identity', 'azure_cli']
    },
    {
      id: 'csv',
      name: 'Arquivo CSV',
      description: 'Importar ativos de arquivo CSV personalizado',
      icon: FileText,
      fields: ['customizable'],
      authMethods: ['none']
    },
    {
      id: 'api',
      name: 'API Genérica',
      description: 'Conectar com qualquer API REST para importar ativos',
      icon: Globe,
      fields: ['customizable'],
      authMethods: ['none', 'basic', 'bearer', 'apikey', 'oauth2', 'jwt']
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

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.ip_address.includes(searchTerm) ||
      asset.os.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || asset.location === locationFilter;

    // Advanced filters
    const matchesAdvancedAssetType = advancedFilters.assetTypes.length === 0 ||
      advancedFilters.assetTypes.includes(asset.type);
    const matchesRiskLevel = advancedFilters.riskLevels.length === 0 ||
      advancedFilters.riskLevels.includes(asset.risk_level);
    const matchesOwner = advancedFilters.owners.length === 0 ||
      advancedFilters.owners.includes(asset.owner);
    const matchesOS = advancedFilters.operatingSystems.length === 0 ||
      advancedFilters.operatingSystems.includes(asset.os);

    // Date range filter
    let matchesDateRange = true;
    if (advancedFilters.dateRange.from || advancedFilters.dateRange.to) {
      if (!asset.last_scan) {
        matchesDateRange = false; // Exclude if no date and date filter is active? Or handle differently.
      } else {
        const assetDate = new Date(asset.last_scan);
        if (advancedFilters.dateRange.from && assetDate < advancedFilters.dateRange.from) {
          matchesDateRange = false;
        }
        if (advancedFilters.dateRange.to && assetDate > advancedFilters.dateRange.to) {
          matchesDateRange = false;
        }
      }
    }

    // Vulnerability range filter
    let matchesVulnRange = true;
    if (advancedFilters.vulnerabilityRange.min !== undefined || advancedFilters.vulnerabilityRange.max !== undefined) {
      const vulnCount = asset.vulnerabilities;
      if (advancedFilters.vulnerabilityRange.min !== undefined && vulnCount < advancedFilters.vulnerabilityRange.min) {
        matchesVulnRange = false;
      }
      if (advancedFilters.vulnerabilityRange.max !== undefined && vulnCount > advancedFilters.vulnerabilityRange.max) {
        matchesVulnRange = false;
      }
    }

    // Has vulnerabilities filter
    const matchesHasVulnerabilities = advancedFilters.hasVulnerabilities === 'all' ||
      (advancedFilters.hasVulnerabilities === 'with' && asset.vulnerabilities > 0) ||
      (advancedFilters.hasVulnerabilities === 'without' && asset.vulnerabilities === 0);

    return matchesSearch && matchesType && matchesStatus && matchesLocation &&
      matchesAdvancedAssetType && matchesRiskLevel && matchesOwner && matchesOS &&
      matchesDateRange && matchesVulnRange && matchesHasVulnerabilities;
  });

  const assetStats = {
    total: assets.length,
    active: assets.filter(asset => asset.status === 'Ativo').length,
    servers: assets.filter(asset => asset.type === 'Server').length,
    workstations: assets.filter(asset => asset.type === 'Workstation').length,
    network: assets.filter(asset => asset.type === 'Network Device').length,
    mobile: assets.filter(asset => asset.type === 'Mobile Device').length,
    highRisk: assets.filter(asset => asset.risk_level === 'Alto' || asset.risk_level === 'Crítico').length,
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
            {canManageFields() && (
              <Button variant="outline" onClick={() => navigate('/vulnerabilities/cmdb/fields-customization')}>
                <Settings className="h-4 w-4 mr-2" />
                Customizar
              </Button>
            )}
            <Button onClick={() => navigate('/vulnerabilities/cmdb/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ativo
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Ativos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Ativos</p>
                  <p className="text-2xl font-bold">
                    {assetStats.total}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Server className="h-3 w-3 mr-1 text-blue-600" />
                    Inventário completo
                  </p>
                </div>
                <Server className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Ativos Ativos */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ativos Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assetStats.active}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                    Em operação
                  </p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Servidores */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Servidores</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {assetStats.servers}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <Database className="h-3 w-3 mr-1 text-purple-600" />
                    Infraestrutura crítica
                  </p>
                </div>
                <Database className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Risco Alto */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Risco Alto</p>
                  <p className="text-2xl font-bold text-red-600">
                    {assetStats.highRisk}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1 text-red-600" />
                    Requer atenção
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
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
                <Button
                  variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
                  className="w-full relative"
                  onClick={() => setAdvancedFiltersOpen(true)}
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  Filtros Avançados
                  {getActiveFiltersCount() > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Advanced Filters */}
        {getActiveFiltersCount() > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Filtros Avançados Ativos</span>
                  <Badge variant="secondary">
                    {getActiveFiltersCount()}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllAdvancedFilters}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Todos
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {advancedFilters.assetTypes.map((type) => {
                  const option = assetTypeOptions.find(o => o.value === type);
                  return (
                    <Badge key={type} variant="outline" className="gap-1 pr-1">
                      {option?.icon && <option.icon className="h-3 w-3" />}
                      {option?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                        onClick={() => setAdvancedFilters(prev => ({
                          ...prev,
                          assetTypes: prev.assetTypes.filter(t => t !== type)
                        }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
                {advancedFilters.riskLevels.map((risk) => {
                  const option = riskLevelOptions.find(o => o.value === risk);
                  return (
                    <Badge key={risk} variant="outline" className="gap-1 pr-1">
                      {option?.icon && <option.icon className="h-3 w-3" />}
                      {option?.label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                        onClick={() => setAdvancedFilters(prev => ({
                          ...prev,
                          riskLevels: prev.riskLevels.filter(r => r !== risk)
                        }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
                {advancedFilters.owners.length > 0 && (
                  <Badge variant="outline" className="gap-1 pr-1">
                    <User className="h-3 w-3" />
                    {advancedFilters.owners.length} responsável{advancedFilters.owners.length > 1 ? 'eis' : ''} selecionado{advancedFilters.owners.length > 1 ? 's' : ''}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, owners: [] }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {advancedFilters.operatingSystems.length > 0 && (
                  <Badge variant="outline" className="gap-1 pr-1">
                    <Monitor className="h-3 w-3" />
                    {advancedFilters.operatingSystems.length} SO selecionado{advancedFilters.operatingSystems.length > 1 ? 's' : ''}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, operatingSystems: [] }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {(advancedFilters.dateRange.from || advancedFilters.dateRange.to) && (
                  <Badge variant="outline" className="gap-1 pr-1">
                    <CalendarIcon className="h-3 w-3" />
                    Período Personalizado
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, dateRange: { from: undefined, to: undefined } }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {(advancedFilters.vulnerabilityRange.min !== undefined || advancedFilters.vulnerabilityRange.max !== undefined) && (
                  <Badge variant="outline" className="gap-1 pr-1">
                    <Shield className="h-3 w-3" />
                    Faixa de Vulnerabilidades
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, vulnerabilityRange: { min: undefined, max: undefined } }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {advancedFilters.hasVulnerabilities !== 'all' && (
                  <Badge variant="outline" className="gap-1 pr-1">
                    <AlertTriangle className="h-3 w-3" />
                    {advancedFilters.hasVulnerabilities === 'with' ? 'Com Vulnerabilidades' : 'Sem Vulnerabilidades'}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                      onClick={() => setAdvancedFilters(prev => ({ ...prev, hasVulnerabilities: 'all' }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Nome</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">IP</TableHead>
                    <TableHead className="text-xs">SO</TableHead>
                    <TableHead className="text-xs">Vulnerabilidades</TableHead>
                    <TableHead className="text-xs">Risco</TableHead>
                    <TableHead className="text-xs">Último Scan</TableHead>
                    <TableHead className="text-xs w-16">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium text-xs p-2">{asset.id}</TableCell>
                      <TableCell className="p-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(asset.type)}
                          <span className="font-medium text-xs truncate max-w-[120px]">{asset.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs p-2">{asset.type}</TableCell>
                      <TableCell className="p-2">
                        <Badge className={`${getStatusBadgeColor(asset.status)} text-xs px-1.5 py-0.5`}>
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs p-2">{asset.ip_address}</TableCell>
                      <TableCell className="text-xs p-2 truncate max-w-[100px]">{asset.os}</TableCell>
                      <TableCell className="p-2">
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {asset.vulnerabilities} vuln.
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2">
                        <Badge className={`${getRiskBadgeColor(asset.risk_level)} text-xs px-1.5 py-0.5`}>
                          {asset.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2">
                        <span className="text-xs">
                          {asset.last_scan ? new Date(asset.last_scan).toLocaleDateString() : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="p-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Ações"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => handleViewAsset(asset)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/vulnerabilities/cmdb/edit/${asset.id}`)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Ativo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteAsset(asset.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir Ativo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Advanced Filters Modal */}
      <Dialog open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sliders className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    Filtros Avançados - CMDB
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Configure filtros detalhados para refinar sua busca por ativos
                  </DialogDescription>
                </div>
              </div>
              {getActiveFiltersCount() > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    {getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} ativo{getActiveFiltersCount() > 1 ? 's' : ''}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllAdvancedFilters}
                    className="h-8 px-2"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Limpar Tudo
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Asset Types */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Tipos de Ativo
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Selecione os tipos de ativos para filtrar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {assetTypeOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <Checkbox
                              id={`asset-type-${option.value}`}
                              checked={advancedFilters.assetTypes.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAdvancedFilters(prev => ({
                                    ...prev,
                                    assetTypes: [...prev.assetTypes, option.value]
                                  }));
                                } else {
                                  setAdvancedFilters(prev => ({
                                    ...prev,
                                    assetTypes: prev.assetTypes.filter(t => t !== option.value)
                                  }));
                                }
                              }}
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div className={`p-1.5 rounded ${option.color}`}>
                                <IconComponent className="h-3 w-3" />
                              </div>
                              <Label htmlFor={`asset-type-${option.value}`} className="text-sm font-medium cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Levels */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Níveis de Risco
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Filtre por nível de risco dos ativos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {riskLevelOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <Checkbox
                              id={`risk-${option.value}`}
                              checked={advancedFilters.riskLevels.includes(option.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAdvancedFilters(prev => ({
                                    ...prev,
                                    riskLevels: [...prev.riskLevels, option.value]
                                  }));
                                } else {
                                  setAdvancedFilters(prev => ({
                                    ...prev,
                                    riskLevels: prev.riskLevels.filter(r => r !== option.value)
                                  }));
                                }
                              }}
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <div className={`p-1.5 rounded ${option.color}`}>
                                <IconComponent className="h-3 w-3" />
                              </div>
                              <Label htmlFor={`risk-${option.value}`} className="text-sm font-medium cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Date Range */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Período do Último Scan
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Filtre ativos por data do último scan de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {advancedFilters.dateRange.from ? (
                              advancedFilters.dateRange.to ? (
                                <>
                                  {new Date(advancedFilters.dateRange.from).toLocaleDateString('pt-BR')} - {new Date(advancedFilters.dateRange.to).toLocaleDateString('pt-BR')}
                                </>
                              ) : (
                                new Date(advancedFilters.dateRange.from).toLocaleDateString('pt-BR')
                              )
                            ) : (
                              <span className="text-muted-foreground">Selecione um período</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Data Inicial</Label>
                              <Input
                                type="date"
                                value={advancedFilters.dateRange.from ?
                                  new Date(advancedFilters.dateRange.from.getTime() - advancedFilters.dateRange.from.getTimezoneOffset() * 60000)
                                    .toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const date = new Date(e.target.value + 'T00:00:00');
                                    setAdvancedFilters(prev => ({
                                      ...prev,
                                      dateRange: {
                                        ...prev.dateRange,
                                        from: date
                                      }
                                    }));
                                  } else {
                                    setAdvancedFilters(prev => ({
                                      ...prev,
                                      dateRange: {
                                        ...prev.dateRange,
                                        from: undefined
                                      }
                                    }));
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Data Final</Label>
                              <Input
                                type="date"
                                value={advancedFilters.dateRange.to ?
                                  new Date(advancedFilters.dateRange.to.getTime() - advancedFilters.dateRange.to.getTimezoneOffset() * 60000)
                                    .toISOString().split('T')[0] : ''}
                                min={advancedFilters.dateRange.from ?
                                  new Date(advancedFilters.dateRange.from.getTime() - advancedFilters.dateRange.from.getTimezoneOffset() * 60000)
                                    .toISOString().split('T')[0] : undefined}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const date = new Date(e.target.value + 'T23:59:59');
                                    setAdvancedFilters(prev => ({
                                      ...prev,
                                      dateRange: {
                                        ...prev.dateRange,
                                        to: date
                                      }
                                    }));
                                  } else {
                                    setAdvancedFilters(prev => ({
                                      ...prev,
                                      dateRange: {
                                        ...prev.dateRange,
                                        to: undefined
                                      }
                                    }));
                                  }
                                }}
                              />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAdvancedFilters(prev => ({
                                    ...prev,
                                    dateRange: { from: undefined, to: undefined }
                                  }));
                                }}
                              >
                                Limpar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const today = new Date();
                                  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                                  setAdvancedFilters(prev => ({
                                    ...prev,
                                    dateRange: { from: lastWeek, to: today }
                                  }));
                                }}
                              >
                                Últimos 7 dias
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const today = new Date();
                                  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                                  setAdvancedFilters(prev => ({
                                    ...prev,
                                    dateRange: { from: lastMonth, to: today }
                                  }));
                                }}
                              >
                                Últimos 30 dias
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Owners */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Responsáveis
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Busque e selecione responsáveis pelos ativos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search Input */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Buscar Responsáveis</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Digite nome ou equipe..."
                          value={ownerSearchTerm}
                          onChange={(e) => setOwnerSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Search Results */}
                    {ownerSearchTerm && filteredOwnerOptions.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Resultados da Busca</Label>
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                          {filteredOwnerOptions.slice(0, 10).map((owner) => (
                            <div
                              key={owner.value}
                              className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${advancedFilters.owners.includes(owner.value) ? 'bg-primary/10' : ''
                                }`}
                              onClick={() => addOwner(owner.value)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">{owner.label}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      {owner.team}
                                    </Badge>
                                  </div>
                                </div>
                                {advancedFilters.owners.includes(owner.value) && (
                                  <CheckCircle2 className="h-4 w-4 text-primary ml-2" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Owners */}
                    {advancedFilters.owners.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Responsáveis Selecionados</Label>
                        <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                          <div className="space-y-2">
                            {advancedFilters.owners.map((ownerId) => {
                              const owner = ownerOptions.find(o => o.value === ownerId);
                              return (
                                <div key={ownerId} className="flex items-center justify-between p-2 bg-muted/50 rounded border">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">
                                      {owner?.label || ownerId}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                      {owner && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                          {owner.team}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => removeOwner(ownerId)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Operating Systems */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Sistemas Operacionais
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Filtre por sistema operacional dos ativos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {osOptions.map((os) => (
                        <div key={os.value} className="flex items-center space-x-3 p-2 border rounded hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={`os-${os.value}`}
                            checked={advancedFilters.operatingSystems.includes(os.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setAdvancedFilters(prev => ({
                                  ...prev,
                                  operatingSystems: [...prev.operatingSystems, os.value]
                                }));
                              } else {
                                setAdvancedFilters(prev => ({
                                  ...prev,
                                  operatingSystems: prev.operatingSystems.filter(o => o !== os.value)
                                }));
                              }
                            }}
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {os.type}
                            </Badge>
                            <Label htmlFor={`os-${os.value}`} className="text-sm cursor-pointer truncate">
                              {os.label}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Vulnerability Filters */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Vulnerabilidades
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Filtre por quantidade e presença de vulnerabilidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Presença de Vulnerabilidades</Label>
                      <Select
                        value={advancedFilters.hasVulnerabilities}
                        onValueChange={(value: 'all' | 'with' | 'without') =>
                          setAdvancedFilters(prev => ({ ...prev, hasVulnerabilities: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Ativos</SelectItem>
                          <SelectItem value="with">Apenas com Vulnerabilidades</SelectItem>
                          <SelectItem value="without">Apenas sem Vulnerabilidades</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Mínimo</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          value={advancedFilters.vulnerabilityRange.min || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            setAdvancedFilters(prev => ({
                              ...prev,
                              vulnerabilityRange: {
                                ...prev.vulnerabilityRange,
                                min: value
                              }
                            }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Máximo</Label>
                        <Input
                          type="number"
                          placeholder="100"
                          min="0"
                          value={advancedFilters.vulnerabilityRange.max || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            setAdvancedFilters(prev => ({
                              ...prev,
                              vulnerabilityRange: {
                                ...prev.vulnerabilityRange,
                                max: value
                              }
                            }));
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t bg-background">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                {getActiveFiltersCount() > 0 ? (
                  <span>{getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} aplicado{getActiveFiltersCount() > 1 ? 's' : ''}</span>
                ) : (
                  <span>Nenhum filtro aplicado</span>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={clearAllAdvancedFilters}
                  disabled={getActiveFiltersCount() === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
                <Button variant="outline" onClick={() => setAdvancedFiltersOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => {
                  setAdvancedFiltersOpen(false);
                  toast.success(`Filtros aplicados! ${getActiveFiltersCount()} filtro${getActiveFiltersCount() > 1 ? 's' : ''} ativo${getActiveFiltersCount() > 1 ? 's' : ''}.`);
                }}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Asset Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  {selectedAsset?.name || 'Detalhes do Ativo'}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Ativo identificado no CMDB - {selectedAsset?.id}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusBadgeColor(selectedAsset?.status)} text-sm px-3 py-1`}>
                  {selectedAsset?.status}
                </Badge>
                <Badge className={`${getRiskBadgeColor(selectedAsset?.risk_level)} text-sm px-3 py-1`}>
                  {selectedAsset?.risk_level}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-6">
              {/* Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Server className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <p className="font-medium">{selectedAsset.type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-destructive/10">
                        <Shield className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vulnerabilidades</p>
                        <p className="text-2xl font-bold text-destructive">{selectedAsset.vulnerabilities}</p>
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
                        <Badge className={getRiskBadgeColor(selectedAsset.risk_level)}>
                          {selectedAsset.risk_level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                        <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Último Scan</p>
                        <p className="text-sm font-medium">{new Date(selectedAsset.last_scan).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informações Detalhadas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/20">
                        <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      Informações Básicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-semibold text-muted-foreground">ID do Ativo</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="p-1 bg-blue-100 rounded">
                              <FileText className="h-3 w-3 text-blue-600" />
                            </div>
                            <span className="font-mono text-sm font-medium">{selectedAsset.id}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-muted-foreground">Endereço IP</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="p-1 bg-green-100 rounded">
                              <Network className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="font-mono text-sm font-medium">{selectedAsset.ip_address}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-muted-foreground">Sistema Operacional</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="p-1 bg-purple-100 rounded">
                            <Monitor className="h-3 w-3 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium">{selectedAsset.os}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-muted-foreground">Localização</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="p-1 bg-orange-100 rounded">
                            <MapPin className="h-3 w-3 text-orange-600" />
                          </div>
                          <span className="text-sm font-medium">{selectedAsset.location}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-semibold text-muted-foreground">Responsável</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="p-1 bg-indigo-100 rounded">
                            <User className="h-3 w-3 text-indigo-600" />
                          </div>
                          <span className="text-sm font-medium">{selectedAsset.owner}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/20">
                        <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      Segurança e Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-800">
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">Vulnerabilidades Ativas</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{selectedAsset.vulnerabilities}</p>
                      </div>
                      <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                        <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Nível de Risco</p>
                        <Badge className={getRiskBadgeColor(selectedAsset.risk_level)}>
                          {selectedAsset.risk_level}
                        </Badge>
                      </div>
                      <div className="p-3 rounded-lg border">
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge className={getStatusBadgeColor(selectedAsset.status)}>
                          {selectedAsset.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Última Verificação</p>
                        <p className="text-xs text-muted-foreground">{new Date(selectedAsset.last_scan).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Vulnerabilidades Tab */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Vulnerabilidades Identificadas
                </h3>

                {assetVulnerabilitiesLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : assetVulnerabilities.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Severidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data Identificação</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assetVulnerabilities.map((vuln) => (
                          <TableRow key={vuln.id}>
                            <TableCell className="font-medium">{vuln.title}</TableCell>
                            <TableCell>
                              <Badge className={
                                vuln.severity === 'Critical' ? 'bg-red-600' :
                                  vuln.severity === 'High' ? 'bg-orange-600' :
                                    vuln.severity === 'Medium' ? 'bg-yellow-600' :
                                      'bg-green-600'
                              }>
                                {vuln.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{vuln.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(vuln.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/vulnerabilities/edit/${vuln.id}`)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center p-8 border rounded-lg bg-muted/20">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                    <p className="font-medium">Nenhuma vulnerabilidade encontrada</p>
                    <p className="text-sm text-muted-foreground">Este ativo não possui vulnerabilidades registradas.</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Server className="h-4 w-4" />
                  <span>Ativo {selectedAsset.id}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Fechar
                  </Button>
                  <Button onClick={() => {
                    setViewModalOpen(false);
                    navigate(`/vulnerabilities/cmdb/edit/${selectedAsset.id}`);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Ativo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}