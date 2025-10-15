import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Applications() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/vulnerabilities/applications/fields-customization')}>
              <Settings className="h-4 w-4 mr-2" />
              Customizar Campos
            </Button>
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

        <TabsContent value="list" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Importar Aplicações</CardTitle>
              <CardDescription>
                Importe aplicações via API, CSV, XML ou TXT
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
                      Formatos suportados: CSV, XML, TXT
                    </p>
                    <Button className="mt-4">
                      Selecionar Arquivo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Importação via API</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">URL da API</label>
                      <Input placeholder="https://api.exemplo.com/applications" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Token de Autenticação</label>
                      <Input type="password" placeholder="Bearer token..." />
                    </div>
                    <Button className="w-full">
                      Conectar e Importar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total de Aplicações</p>
                  <p className="text-2xl font-bold">{mockApplications.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Aplicações Ativas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockApplications.filter(app => app.status === 'Ativo').length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Alto Risco</p>
                  <p className="text-2xl font-bold text-red-600">
                    {mockApplications.filter(app => app.risk_level === 'Alto').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}