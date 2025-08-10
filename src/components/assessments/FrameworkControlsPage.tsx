import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  FileText,
  Upload,
  Download,
  Settings,
  Shield,
  Info,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

interface FrameworkControl {
  id: string;
  control_number: string;
  title: string;
  description: string;
  category: string;
  domain: string;
  guidance?: string;
  compliance_criteria?: string;
  references?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  control_type: 'preventive' | 'detective' | 'corrective' | 'directive';
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Framework {
  id: string;
  name: string;
  short_name: string;
  version: string;
  description: string;
  category: string;
  status: string;
}

const CONTROL_PRIORITIES = [
  { value: 'critical', label: 'Crítico', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'Alto', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'low', label: 'Baixo', color: 'bg-green-100 text-green-800' }
];

const CONTROL_TYPES = [
  { value: 'preventive', label: 'Preventivo' },
  { value: 'detective', label: 'Detectivo' },
  { value: 'corrective', label: 'Corretivo' },
  { value: 'directive', label: 'Diretivo' }
];

export const FrameworkControlsPage: React.FC = () => {
  const { frameworkId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [framework, setFramework] = useState<Framework | null>(null);
  const [controls, setControls] = useState<FrameworkControl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    control: FrameworkControl | null;
    isNew: boolean;
  }>({
    isOpen: false,
    control: null,
    isNew: false,
  });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    control: FrameworkControl | null;
  }>({
    isOpen: false,
    control: null,
  });

  const [formData, setFormData] = useState<Partial<FrameworkControl>>({
    control_number: '',
    title: '',
    description: '',
    category: '',
    domain: '',
    guidance: '',
    compliance_criteria: '',
    references: '',
    priority: 'medium',
    control_type: 'preventive',
    is_active: true,
    order_index: 0
  });

  // Mock data - substitua pela integração real com Supabase
  useEffect(() => {
    const mockFramework: Framework = {
      id: frameworkId || '',
      name: 'ISO 27001:2022',
      short_name: 'ISO27001',
      version: '2022',
      description: 'Sistema de Gestão de Segurança da Informação',
      category: 'security',
      status: 'active'
    };

    const mockControls: FrameworkControl[] = [
      {
        id: '1',
        control_number: 'A.5.1.1',
        title: 'Políticas para segurança da informação',
        description: 'Um conjunto de políticas para segurança da informação deve ser definido, aprovado pela direção, publicado e comunicado para todos os funcionários e partes externas relevantes.',
        category: 'Organizacional',
        domain: 'Políticas de Segurança',
        guidance: 'As políticas devem incluir uma declaração de comprometimento da direção e definir a abordagem da organização para gerenciar a segurança da informação.',
        compliance_criteria: '• Política de segurança aprovada pela alta direção\n• Política publicada e comunicada\n• Revisão periódica definida\n• Responsabilidades claramente definidas',
        references: 'ISO 27001:2022 - Anexo A.5.1.1',
        priority: 'critical',
        control_type: 'directive',
        order_index: 1,
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-08-01T14:30:00Z'
      },
      {
        id: '2',
        control_number: 'A.5.1.2',
        title: 'Análise crítica das políticas para segurança da informação',
        description: 'As políticas para segurança da informação devem ser analisadas criticamente a intervalos planejados ou se mudanças significativas ocorrerem.',
        category: 'Organizacional',
        domain: 'Políticas de Segurança',
        guidance: 'A análise crítica deve assegurar sua contínua adequação, suficiência e eficácia.',
        compliance_criteria: '• Processo de revisão definido e documentado\n• Cronograma de revisões estabelecido\n• Registro das revisões mantido\n• Aprovação formal das atualizações',
        references: 'ISO 27001:2022 - Anexo A.5.1.2',
        priority: 'high',
        control_type: 'directive',
        order_index: 2,
        is_active: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-07-15T16:20:00Z'
      },
      {
        id: '3',
        control_number: 'A.6.1.1',
        title: 'Funções e responsabilidades para segurança da informação',
        description: 'Todas as responsabilidades de segurança da informação devem ser definidas e atribuídas.',
        category: 'Organizacional',
        domain: 'Organização da Segurança',
        guidance: 'As responsabilidades devem ser claramente documentadas e comunicadas aos indivíduos relevantes.',
        compliance_criteria: '• Matriz de responsabilidades documentada\n• Responsável pela segurança designado\n• Segregação de funções implementada\n• Comunicação formal das responsabilidades',
        references: 'ISO 27001:2022 - Anexo A.6.1.1',
        priority: 'high',
        control_type: 'directive',
        order_index: 3,
        is_active: true,
        created_at: '2024-01-16T11:30:00Z',
        updated_at: '2024-08-03T09:45:00Z'
      },
      {
        id: '4',
        control_number: 'A.8.1.1',
        title: 'Inventário dos ativos',
        description: 'Os ativos associados com a informação e instalações de processamento da informação devem ser identificados e um inventário desses ativos deve ser elaborado e mantido.',
        category: 'Ativos',
        domain: 'Gestão de Ativos',
        guidance: 'O inventário deve incluir todos os ativos que tenham valor para a organização.',
        compliance_criteria: '• Inventário completo de ativos mantido\n• Proprietário de cada ativo identificado\n• Classificação dos ativos realizada\n• Atualizações regulares do inventário',
        references: 'ISO 27001:2022 - Anexo A.8.1.1',
        priority: 'critical',
        control_type: 'preventive',
        order_index: 4,
        is_active: true,
        created_at: '2024-01-17T08:15:00Z',
        updated_at: '2024-08-05T12:10:00Z'
      },
      {
        id: '5',
        control_number: 'A.12.6.1',
        title: 'Gestão de vulnerabilidades técnicas',
        description: 'Informações sobre vulnerabilidades técnicas dos sistemas de informação devem ser obtidas de forma oportuna.',
        category: 'Técnico',
        domain: 'Segurança Operacional',
        guidance: 'A organização deve estabelecer um processo para identificar e avaliar vulnerabilidades técnicas.',
        compliance_criteria: '• Processo de gestão de vulnerabilidades definido\n• Fontes de informação sobre vulnerabilidades identificadas\n• Avaliação regular de vulnerabilidades\n• Plano de correção de vulnerabilidades',
        references: 'ISO 27001:2022 - Anexo A.12.6.1',
        priority: 'high',
        control_type: 'detective',
        order_index: 5,
        is_active: true,
        created_at: '2024-01-18T14:45:00Z',
        updated_at: '2024-07-30T11:25:00Z'
      }
    ];

    setFramework(mockFramework);
    setControls(mockControls);
    setIsLoading(false);
  }, [frameworkId]);

  const filteredControls = controls.filter(control => {
    const matchesSearch = control.control_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      control.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || control.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || control.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || control.control_type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesType;
  });

  const categories = [...new Set(controls.map(c => c.category))];
  const domains = [...new Set(controls.map(c => c.domain))];

  const handleSaveControl = async () => {
    try {
      if (editDialog.isNew) {
        const newControl: FrameworkControl = {
          ...formData,
          id: Date.now().toString(),
          order_index: controls.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as FrameworkControl;

        setControls(prev => [...prev, newControl]);
        
        toast({
          title: "Controle criado",
          description: "Novo controle adicionado com sucesso.",
        });
      } else {
        setControls(prev => prev.map(c => 
          c.id === editDialog.control?.id 
            ? { ...c, ...formData, updated_at: new Date().toISOString() }
            : c
        ));
        
        toast({
          title: "Controle atualizado",
          description: "Controle salvo com sucesso.",
        });
      }
      
      setEditDialog({ isOpen: false, control: null, isNew: false });
      setFormData({
        control_number: '',
        title: '',
        description: '',
        category: '',
        domain: '',
        guidance: '',
        compliance_criteria: '',
        references: '',
        priority: 'medium',
        control_type: 'preventive',
        is_active: true,
        order_index: controls.length + 1
      });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar controle.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteControl = async () => {
    if (!deleteDialog.control) return;

    try {
      setControls(prev => prev.filter(c => c.id !== deleteDialog.control?.id));
      
      toast({
        title: "Controle excluído",
        description: "Controle removido com sucesso.",
      });
      
      setDeleteDialog({ isOpen: false, control: null });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir controle.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (control: FrameworkControl | null, isNew: boolean) => {
    if (control) {
      setFormData(control);
    } else {
      setFormData({
        control_number: '',
        title: '',
        description: '',
        category: '',
        domain: '',
        guidance: '',
        compliance_criteria: '',
        references: '',
        priority: 'medium',
        control_type: 'preventive',
        is_active: true,
        order_index: controls.length + 1
      });
    }
    setEditDialog({ isOpen: true, control, isNew });
  };

  const getPriorityColor = (priority: string) => {
    return CONTROL_PRIORITIES.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    return CONTROL_TYPES.find(t => t.value === type)?.label || type;
  };

  if (isLoading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/assessments/frameworks')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            Controles do Framework
          </h1>
          <p className="text-muted-foreground">
            {framework?.name} • {controls.length} controles
          </p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
          <Button
            variant="outline"
            onClick={() => {/* Implementar importação */}}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button
            onClick={() => openEditDialog(null, true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Controle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{controls.length}</div>
            <p className="text-xs text-muted-foreground">controles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {controls.filter(c => c.priority === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">alta prioridade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Domínios</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domains.length}</div>
            <p className="text-xs text-muted-foreground">diferentes áreas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preventivos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {controls.filter(c => c.control_type === 'preventive').length}
            </div>
            <p className="text-xs text-muted-foreground">controles preventivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-5'}`}>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar controles..."
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
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                {CONTROL_PRIORITIES.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {CONTROL_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controls Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Controle</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredControls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm ? 'Nenhum controle encontrado.' : 'Nenhum controle criado ainda.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredControls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{control.control_number}</div>
                          <div className="text-sm font-medium">{control.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {control.description}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {control.domain}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{control.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(control.priority)}>
                          {CONTROL_PRIORITIES.find(p => p.value === control.priority)?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getTypeLabel(control.control_type)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={control.is_active ? "default" : "secondary"}>
                          {control.is_active ? "Ativo" : "Inativo"}
                        </Badge>
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
                              onClick={() => openEditDialog(control, false)}
                              className="cursor-pointer"
                            >
                              <Edit3 className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {/* Implementar duplicação */}}
                              className="cursor-pointer"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ isOpen: true, control })}
                              className="cursor-pointer text-destructive"
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

      {/* Edit Control Dialog */}
      <Dialog open={editDialog.isOpen} onOpenChange={(open) => 
        setEditDialog(prev => ({ ...prev, isOpen: open }))
      }>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialog.isNew ? 'Novo Controle' : 'Editar Controle'}
            </DialogTitle>
            <DialogDescription>
              {editDialog.isNew 
                ? 'Crie um novo controle para este framework.'
                : 'Edite as informações do controle selecionado.'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList>
              <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="criteria">Critérios</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="control_number">Número do Controle</Label>
                  <Input
                    id="control_number"
                    value={formData.control_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, control_number: e.target.value }))}
                    placeholder="Ex: A.5.1.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={formData.category || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: Organizacional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domínio</Label>
                  <Input
                    id="domain"
                    value={formData.domain || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="Ex: Políticas de Segurança"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select 
                    value={formData.priority || 'medium'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTROL_PRIORITIES.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="control_type">Tipo de Controle</Label>
                  <Select 
                    value={formData.control_type || 'preventive'} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, control_type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTROL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do controle"
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição detalhada do controle"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guidance">Orientação</Label>
                <Textarea
                  id="guidance"
                  value={formData.guidance || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, guidance: e.target.value }))}
                  placeholder="Orientações para implementação"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="references">Referências</Label>
                <Input
                  id="references"
                  value={formData.references || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, references: e.target.value }))}
                  placeholder="Ex: ISO 27001:2022 - Anexo A.5.1.1"
                />
              </div>
            </TabsContent>

            <TabsContent value="criteria" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="compliance_criteria">Critérios de Conformidade</Label>
                <Textarea
                  id="compliance_criteria"
                  value={formData.compliance_criteria || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, compliance_criteria: e.target.value }))}
                  placeholder="• Primeiro critério&#10;• Segundo critério&#10;• Terceiro critério"
                  rows={6}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditDialog({ isOpen: false, control: null, isNew: false });
                setFormData({
                  control_number: '',
                  title: '',
                  description: '',
                  category: '',
                  domain: '',
                  guidance: '',
                  compliance_criteria: '',
                  references: '',
                  priority: 'medium',
                  control_type: 'preventive',
                  is_active: true,
                  order_index: controls.length + 1
                });
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveControl}>
              {editDialog.isNew ? 'Criar Controle' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={(open) => 
        setDeleteDialog({ isOpen: open, control: null })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o controle 
              <span className="font-semibold"> "{deleteDialog.control?.control_number}"</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteControl}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Controle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};