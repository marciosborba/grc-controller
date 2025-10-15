import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RefreshCw,
  Monitor,
  Smartphone,
  Wifi,
  HardDrive,
  Cpu,
  Network
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CMDB() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Mock data
  const mockAssets = [
    {
      id: 'SRV-001',
      name: 'Web Server 01',
      type: 'Server',
      status: 'Active',
      ip_address: '192.168.1.10',
      location: 'Datacenter SP',
      os: 'Ubuntu 22.04 LTS',
      owner: 'Equipe Infraestrutura',
      vulnerabilities: 8,
      last_scan: '2024-01-15',
      risk_level: 'Medium'
    },
    {
      id: 'WKS-001',
      name: 'Workstation Dev-01',
      type: 'Workstation',
      status: 'Active',
      ip_address: '192.168.1.50',
      location: 'Escritório SP',
      os: 'Windows 11 Pro',
      owner: 'João Silva',
      vulnerabilities: 3,
      last_scan: '2024-01-14',
      risk_level: 'Low'
    },
    {
      id: 'NET-001',
      name: 'Switch Core',
      type: 'Network Device',
      status: 'Active',
      ip_address: '192.168.1.1',
      location: 'Datacenter SP',
      os: 'Cisco IOS 15.2',
      owner: 'Equipe Rede',
      vulnerabilities: 12,
      last_scan: '2024-01-13',
      risk_level: 'High'
    },
    {
      id: 'SRV-002',
      name: 'Database Server',
      type: 'Server',
      status: 'Active',
      ip_address: '192.168.1.20',
      location: 'Datacenter RJ',
      os: 'CentOS 8',
      owner: 'Equipe DBA',
      vulnerabilities: 5,
      last_scan: '2024-01-12',
      risk_level: 'Medium'
    },
    {
      id: 'MOB-001',
      name: 'Tablet Vendas',
      type: 'Mobile Device',
      status: 'Active',
      ip_address: '192.168.1.100',
      location: 'Escritório RJ',
      os: 'Android 13',
      owner: 'Equipe Vendas',
      vulnerabilities: 2,
      last_scan: '2024-01-11',
      risk_level: 'Low'
    },
    {
      id: 'SRV-003',
      name: 'Backup Server',
      type: 'Server',
      status: 'Maintenance',
      ip_address: '192.168.1.30',
      location: 'Datacenter SP',
      os: 'Ubuntu 20.04 LTS',
      owner: 'Equipe Backup',
      vulnerabilities: 15,
      last_scan: '2024-01-10',
      risk_level: 'High'
    }
  ];

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
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Maintenance: 'bg-yellow-100 text-yellow-800',
      Decommissioned: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.Active;
  };

  const getRiskBadgeColor = (risk: string) => {
    const colors = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800',
      Critical: 'bg-red-200 text-red-900',
    };
    return colors[risk as keyof typeof colors] || colors.Low;
  };

  const handleRefresh = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

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
    active: mockAssets.filter(asset => asset.status === 'Active').length,
    servers: mockAssets.filter(asset => asset.type === 'Server').length,
    workstations: mockAssets.filter(asset => asset.type === 'Workstation').length,
    network: mockAssets.filter(asset => asset.type === 'Network Device').length,
    mobile: mockAssets.filter(asset => asset.type === 'Mobile Device').length,
    highRisk: mockAssets.filter(asset => asset.risk_level === 'High').length,
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Ativo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="import">Importar</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          <TabsTrigger value="topology">Topologia</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
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
                      <SelectItem value="Active">Ativo</SelectItem>
                      <SelectItem value="Inactive">Inativo</SelectItem>
                      <SelectItem value="Maintenance">Manutenção</SelectItem>
                      <SelectItem value="Decommissioned">Descomissionado</SelectItem>
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
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Importar Ativos</CardTitle>
              <CardDescription>
                Importe ativos via API, XML, CSV ou TXT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Importação via Arquivo</h3>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arraste e solte arquivos aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Formatos suportados: XML, CSV, TXT
                    </p>
                    <Button className="mt-4">
                      Selecionar Arquivo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Descoberta Automática</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Faixa de IP</label>
                      <Input placeholder="192.168.1.0/24" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Credenciais SNMP</label>
                      <Input placeholder="Community string..." />
                    </div>
                    <Button className="w-full">
                      <Wifi className="h-4 w-4 mr-2" />
                      Iniciar Descoberta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total de Ativos</p>
                  <p className="text-2xl font-bold">{assetStats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Ativos Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{assetStats.active}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Servidores</p>
                  <p className="text-2xl font-bold text-blue-600">{assetStats.servers}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Alto Risco</p>
                  <p className="text-2xl font-bold text-red-600">{assetStats.highRisk}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Servidores</span>
                    <Badge variant="outline">{assetStats.servers}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Workstations</span>
                    <Badge variant="outline">{assetStats.workstations}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dispositivos de Rede</span>
                    <Badge variant="outline">{assetStats.network}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dispositivos Móveis</span>
                    <Badge variant="outline">{assetStats.mobile}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Datacenter SP</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Datacenter RJ</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Escritório SP</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Escritório RJ</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Topologia de Rede</CardTitle>
              <CardDescription>
                Visualização da topologia de rede e relacionamentos entre ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Network className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Visualização de Topologia</p>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}