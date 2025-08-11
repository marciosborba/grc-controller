import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  FileText,
  Shield,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface Framework {
  id: string;
  name: string;
  short_name: string;
  version: string;
  description: string;
  category: 'security' | 'privacy' | 'governance' | 'compliance' | 'custom';
  status: 'active' | 'draft' | 'deprecated';
  is_public: boolean;
  controls_count: number;
  assessments_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  organization?: string;
}

const FRAMEWORK_CATEGORIES = [
  { value: 'security', label: 'Segurança', color: 'bg-red-100 text-red-800' },
  { value: 'privacy', label: 'Privacidade', color: 'bg-purple-100 text-purple-800' },
  { value: 'governance', label: 'Governança', color: 'bg-blue-100 text-blue-800' },
  { value: 'compliance', label: 'Compliance', color: 'bg-green-100 text-green-800' },
  { value: 'custom', label: 'Personalizado', color: 'bg-gray-100 text-gray-800' }
];

const PREDEFINED_FRAMEWORKS = [
  { name: 'ISO 27001:2022', short_name: 'ISO27001', category: 'security', description: 'Sistema de Gestão de Segurança da Informação' },
  { name: 'NIST Cybersecurity Framework', short_name: 'NIST-CSF', category: 'security', description: 'Framework de Cibersegurança do NIST' },
  { name: 'CIS Controls v8', short_name: 'CIS-V8', category: 'security', description: 'Controles Críticos de Segurança do CIS' },
  { name: 'PCI DSS v4.0', short_name: 'PCI-DSS', category: 'compliance', description: 'Padrão de Segurança de Dados da Indústria de Cartões' },
  { name: 'LGPD', short_name: 'LGPD', category: 'privacy', description: 'Lei Geral de Proteção de Dados Pessoais' },
  { name: 'COBIT 2019', short_name: 'COBIT', category: 'governance', description: 'Control Objectives for Information Technologies' },
  { name: 'SOX', short_name: 'SOX', category: 'compliance', description: 'Sarbanes-Oxley Act' }
];

export const FrameworksPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    framework: Framework | null;
  }>({
    isOpen: false,
    framework: null,
  });

  // Mock data - substitua pela integração real com Supabase
  useEffect(() => {
    const mockFrameworks: Framework[] = [
      {
        id: '1',
        name: 'ISO 27001:2022',
        short_name: 'ISO27001',
        version: '2022',
        description: 'Sistema de Gestão de Segurança da Informação',
        category: 'security',
        status: 'active',
        is_public: true,
        controls_count: 93,
        assessments_count: 5,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-08-01T14:30:00Z',
        created_by: 'Sistema',
        organization: 'Padrão Internacional'
      },
      {
        id: '2',
        name: 'NIST Cybersecurity Framework',
        short_name: 'NIST-CSF',
        version: '1.1',
        description: 'Framework de Cibersegurança do NIST',
        category: 'security',
        status: 'active',
        is_public: true,
        controls_count: 108,
        assessments_count: 3,
        created_at: '2024-02-01T09:00:00Z',
        updated_at: '2024-07-15T16:20:00Z',
        created_by: 'Sistema',
        organization: 'NIST'
      },
      {
        id: '3',
        name: 'Framework Interno - Segurança',
        short_name: 'FW-INT-SEC',
        version: '1.0',
        description: 'Framework personalizado para avaliação de segurança interna',
        category: 'custom',
        status: 'active',
        is_public: false,
        controls_count: 45,
        assessments_count: 2,
        created_at: '2024-03-10T11:30:00Z',
        updated_at: '2024-08-05T10:15:00Z',
        created_by: 'João Silva',
        organization: 'Minha Empresa'
      },
      {
        id: '4',
        name: 'LGPD Framework',
        short_name: 'LGPD',
        version: '2020',
        description: 'Framework baseado na Lei Geral de Proteção de Dados',
        category: 'privacy',
        status: 'active',
        is_public: true,
        controls_count: 32,
        assessments_count: 1,
        created_at: '2024-01-20T15:00:00Z',
        updated_at: '2024-07-30T09:45:00Z',
        created_by: 'Sistema',
        organization: 'Governo Federal'
      },
      {
        id: '5',
        name: 'PCI DSS v4.0',
        short_name: 'PCI-DSS',
        version: '4.0',
        description: 'Padrão de Segurança de Dados da Indústria de Cartões',
        category: 'compliance',
        status: 'draft',
        is_public: true,
        controls_count: 78,
        assessments_count: 0,
        created_at: '2024-07-01T08:00:00Z',
        updated_at: '2024-08-08T13:20:00Z',
        created_by: 'Maria Santos',
        organization: 'PCI Security Standards Council'
      }
    ];

    setFrameworks(mockFrameworks);
    setIsLoading(false);
  }, []);

  const filteredFrameworks = frameworks.filter(framework => {
    const matchesSearch = framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      framework.short_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      framework.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || framework.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || framework.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = async () => {
    if (!deleteDialog.framework) return;

    try {
      // Aqui você implementaria a exclusão no Supabase
      setFrameworks(prev => prev.filter(f => f.id !== deleteDialog.framework?.id));
      
      toast({
        title: "Framework excluído",
        description: "Framework removido com sucesso.",
      });
      
      setDeleteDialog({ isOpen: false, framework: null });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir framework.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (framework: Framework) => {
    try {
      const newFramework: Framework = {
        ...framework,
        id: Date.now().toString(),
        name: `${framework.name} (Cópia)`,
        short_name: `${framework.short_name}-COPY`,
        status: 'draft',
        assessments_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setFrameworks(prev => [...prev, newFramework]);
      
      toast({
        title: "Framework duplicado",
        description: "Framework copiado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao duplicar framework.",
        variant: "destructive",
      });
    }
  };

  const getCategoryInfo = (category: string) => {
    return FRAMEWORK_CATEGORIES.find(c => c.value === category) || 
           { label: category, color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'deprecated': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'active': CheckCircle,
      'draft': Clock,
      'deprecated': AlertCircle
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getOverallStats = () => {
    return {
      total: frameworks.length,
      active: frameworks.filter(f => f.status === 'active').length,
      draft: frameworks.filter(f => f.status === 'draft').length,
      totalControls: frameworks.reduce((acc, f) => acc + f.controls_count, 0),
      totalAssessments: frameworks.reduce((acc, f) => acc + f.assessments_count, 0)
    };
  };

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>
            Gerenciamento de Frameworks
          </h1>
          <p className="text-muted-foreground">
            Gerencie frameworks de compliance e crie questionários personalizados
          </p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
          <Button
            variant="outline"
            onClick={() => navigate('/assessments/manage')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Assessments
          </Button>
          <Button
            onClick={() => navigate('/assessments/frameworks/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Framework
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">frameworks</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">em produção</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">em desenvolvimento</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Controles</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalControls}</div>
            <p className="text-xs text-muted-foreground">total de controles</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssessments}</div>
            <p className="text-xs text-muted-foreground">assessments ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Frameworks</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Templates de Frameworks</CardTitle>
              <p className="text-sm text-muted-foreground">
                Crie novos frameworks baseados em padrões reconhecidos do mercado
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {PREDEFINED_FRAMEWORKS.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                    <CardHeader className="pb-3 rounded-t-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge className={getCategoryInfo(template.category).color} variant="secondary">
                            {getCategoryInfo(template.category).label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {template.description}
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/assessments/frameworks/create?template=${template.short_name}`)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Usar Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Search and Filters */}
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-4'}`}>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar frameworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    {FRAMEWORK_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="deprecated">Depreciado</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros Avançados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Frameworks Table */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Framework</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Controles</TableHead>
                      <TableHead>Assessments</TableHead>
                      <TableHead>Atualização</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Carregando frameworks...
                        </TableCell>
                      </TableRow>
                    ) : filteredFrameworks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          {searchTerm ? 'Nenhum framework encontrado.' : 'Nenhum framework criado ainda.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFrameworks.map((framework) => (
                        <TableRow key={framework.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{framework.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {framework.short_name} v{framework.version}
                              </div>
                              {!framework.is_public && (
                                <Badge variant="secondary" className="text-xs">
                                  Privado
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryInfo(framework.category).color}>
                              {getCategoryInfo(framework.category).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(framework.status)}
                              <Badge className={getStatusColor(framework.status)}>
                                {framework.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">{framework.controls_count}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-medium">{framework.assessments_count}</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(framework.updated_at)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/assessments/frameworks/${framework.id}`)}
                                  className="cursor-pointer"
                                >
                                  <Edit3 className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/assessments/frameworks/${framework.id}/controls`)}
                                  className="cursor-pointer"
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Ver Controles
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDuplicate(framework)}
                                  className="cursor-pointer"
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteDialog({ isOpen: true, framework })}
                                  className="cursor-pointer text-destructive"
                                  disabled={framework.assessments_count > 0}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => 
        setDeleteDialog({ isOpen: open, framework: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o framework 
              <span className="font-semibold"> "{deleteDialog.framework?.name}"</span>?
              Esta ação não pode ser desfeita e removerá todos os controles associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Framework
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};