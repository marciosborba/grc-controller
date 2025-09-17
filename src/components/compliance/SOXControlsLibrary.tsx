import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Shield,
  Search,
  BookOpen,
  FileText,
  Settings,
  Lock,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Copy,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Globe,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface SOXControl {
  id: string;
  codigo: string;
  categoria: string;
  subcategoria: string;
  titulo: string;
  descricao: string;
  objetivo_controle: string;
  natureza: string;
  nivel: string;
  frequencia: string;
  atividades_controle: string;
  evidencias_funcionamento: string[];
  metodo_teste: string;
  criticidade: string;
  risco_processo: string;
  sistemas_aplicaveis: string[];
  tenant_id?: string;
  is_global?: boolean;
  created_by?: string;
}

const controlSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  subcategoria: z.string().optional(),
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  objetivo_controle: z.string().min(1, "Objetivo do controle é obrigatório"),
  natureza: z.string().min(1, "Natureza é obrigatória"),
  nivel: z.string().min(1, "Nível é obrigatório"),
  frequencia: z.string().min(1, "Frequência é obrigatória"),
  atividades_controle: z.string().min(1, "Atividades do controle são obrigatórias"),
  metodo_teste: z.string().optional(),
  criticidade: z.string().min(1, "Criticidade é obrigatória"),
  risco_processo: z.string().optional(),
  evidencias_funcionamento: z.string().min(1, "Evidências são obrigatórias"),
  sistemas_aplicaveis: z.string().optional()
});

const SOXControlsLibrary: React.FC = () => {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [controls, setControls] = useState<SOXControl[]>([]);
  const [filteredControls, setFilteredControls] = useState<SOXControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<SOXControl | null>(null);
  
  const controlForm = useForm<z.infer<typeof controlSchema>>({
    resolver: zodResolver(controlSchema),
    defaultValues: {
      codigo: '',
      categoria: '',
      subcategoria: '',
      titulo: '',
      descricao: '',
      objetivo_controle: '',
      natureza: '',
      nivel: '',
      frequencia: '',
      atividades_controle: '',
      metodo_teste: '',
      criticidade: 'alta',
      risco_processo: '',
      evidencias_funcionamento: '',
      sistemas_aplicaveis: ''
    }
  });

  useEffect(() => {
    loadSOXControls();
  }, []);

  useEffect(() => {
    filterControls();
  }, [controls, searchTerm, selectedCategory]);

  const loadSOXControls = async () => {
    if (!effectiveTenantId) return;
    
    try {
      // Carregar controles globais e específicos do tenant
      const { data, error } = await supabase
        .from('biblioteca_controles_sox')
        .select(`
          *,
          created_by_profile:created_by(full_name)
        `)
        .or(`is_global.eq.true,tenant_id.eq.${effectiveTenantId}`)
        .order('is_global', { ascending: false })
        .order('codigo');

      if (error) throw error;

      setControls(data || []);
    } catch (error) {
      console.error('Erro ao carregar biblioteca SOX:', error);
      toast.error('Erro ao carregar biblioteca de controles SOX');
    } finally {
      setLoading(false);
    }
  };

  const filterControls = () => {
    let filtered = controls;

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(control => control.categoria === selectedCategory);
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(control => 
        control.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        control.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        control.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (control.subcategoria && control.subcategoria.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredControls(filtered);
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'entity_level': return <Shield className="h-5 w-5 text-blue-600" />;
      case 'transaction_level': return <FileText className="h-5 w-5 text-green-600" />;
      case 'itgc': return <Settings className="h-5 w-5 text-purple-600" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'entity_level': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'transaction_level': return 'bg-green-100 text-green-800 border-green-300';
      case 'itgc': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCriticalityColor = (criticidade: string) => {
    switch (criticidade) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-300';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getNaturezaIcon = (natureza: string) => {
    switch (natureza) {
      case 'preventivo': return <Shield className="h-4 w-4" />;
      case 'detectivo': return <AlertTriangle className="h-4 w-4" />;
      case 'corretivo': return <CheckCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const copyControlCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast.success('Código copiado para a área de transferência');
  };

  const handleCreateControl = async (values: z.infer<typeof controlSchema>) => {
    if (!effectiveTenantId || !user) return;

    try {
      // Converter strings de evidências e sistemas para arrays
      const evidencias = values.evidencias_funcionamento.split('\n').filter(e => e.trim());
      const sistemas = values.sistemas_aplicaveis ? values.sistemas_aplicaveis.split('\n').filter(s => s.trim()) : [];

      const { error } = await supabase
        .from('biblioteca_controles_sox')
        .insert({
          ...values,
          evidencias_funcionamento: evidencias,
          sistemas_aplicaveis: sistemas,
          tenant_id: effectiveTenantId,
          created_by: user.id,
          is_global: false
        });

      if (error) throw error;

      toast.success('Controle criado com sucesso');
      setIsDialogOpen(false);
      controlForm.reset();
      loadSOXControls();
    } catch (error) {
      console.error('Erro ao criar controle:', error);
      toast.error('Erro ao criar controle');
    }
  };

  const handleEditControl = (control: SOXControl) => {
    if (control.is_global) {
      toast.error('Controles globais não podem ser editados');
      return;
    }
    
    if (control.tenant_id !== effectiveTenantId) {
      toast.error('Você não tem permissão para editar este controle');
      return;
    }

    setEditingControl(control);
    controlForm.reset({
      codigo: control.codigo,
      categoria: control.categoria,
      subcategoria: control.subcategoria || '',
      titulo: control.titulo,
      descricao: control.descricao,
      objetivo_controle: control.objetivo_controle,
      natureza: control.natureza,
      nivel: control.nivel,
      frequencia: control.frequencia,
      atividades_controle: control.atividades_controle,
      metodo_teste: control.metodo_teste || '',
      criticidade: control.criticidade,
      risco_processo: control.risco_processo || '',
      evidencias_funcionamento: control.evidencias_funcionamento.join('\n'),
      sistemas_aplicaveis: control.sistemas_aplicaveis.join('\n')
    });
    setIsDialogOpen(true);
  };

  const handleUpdateControl = async (values: z.infer<typeof controlSchema>) => {
    if (!editingControl || !effectiveTenantId) return;

    try {
      const evidencias = values.evidencias_funcionamento.split('\n').filter(e => e.trim());
      const sistemas = values.sistemas_aplicaveis ? values.sistemas_aplicaveis.split('\n').filter(s => s.trim()) : [];

      const { error } = await supabase
        .from('biblioteca_controles_sox')
        .update({
          ...values,
          evidencias_funcionamento: evidencias,
          sistemas_aplicaveis: sistemas
        })
        .eq('id', editingControl.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Controle atualizado com sucesso');
      setIsDialogOpen(false);
      setEditingControl(null);
      controlForm.reset();
      loadSOXControls();
    } catch (error) {
      console.error('Erro ao atualizar controle:', error);
      toast.error('Erro ao atualizar controle');
    }
  };

  const handleDeleteControl = async (control: SOXControl) => {
    if (control.is_global) {
      toast.error('Controles globais não podem ser excluídos');
      return;
    }
    
    if (control.tenant_id !== effectiveTenantId) {
      toast.error('Você não tem permissão para excluir este controle');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este controle?')) return;

    try {
      const { error } = await supabase
        .from('biblioteca_controles_sox')
        .delete()
        .eq('id', control.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Controle excluído com sucesso');
      loadSOXControls();
    } catch (error) {
      console.error('Erro ao excluir controle:', error);
      toast.error('Erro ao excluir controle');
    }
  };

  const handleSubmit = (values: z.infer<typeof controlSchema>) => {
    if (editingControl) {
      handleUpdateControl(values);
    } else {
      handleCreateControl(values);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingControl(null);
    controlForm.reset();
  };

  const categoryStats = {
    entity_level: controls.filter(c => c.categoria === 'entity_level').length,
    transaction_level: controls.filter(c => c.categoria === 'transaction_level').length,
    itgc: controls.filter(c => c.categoria === 'itgc').length
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            Biblioteca SOX
          </h1>
          <p className="text-muted-foreground">
            Biblioteca global de controles Sarbanes-Oxley para todas as organizações
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {setEditingControl(null); controlForm.reset();}}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Controle
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Documentação
          </Button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Controles</p>
                <p className="text-2xl font-bold text-red-600">{controls.length}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entity Level</p>
                <p className="text-2xl font-bold text-blue-600">{categoryStats.entity_level}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transaction Level</p>
                <p className="text-2xl font-bold text-green-600">{categoryStats.transaction_level}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ITGC</p>
                <p className="text-2xl font-bold text-purple-600">{categoryStats.itgc}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>



      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar controles por código, título ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
          <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-lg">
            <Button 
              variant={selectedCategory === 'all' ? 'default' : 'ghost'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              Todos
            </Button>
            <Button 
              variant={selectedCategory === 'entity_level' ? 'default' : 'ghost'}
              onClick={() => setSelectedCategory('entity_level')}
              size="sm"
            >
              Entity Level
            </Button>
            <Button 
              variant={selectedCategory === 'transaction_level' ? 'default' : 'ghost'}
              onClick={() => setSelectedCategory('transaction_level')}
              size="sm"
            >
              Transaction Level
            </Button>
            <Button 
              variant={selectedCategory === 'itgc' ? 'default' : 'ghost'}
              onClick={() => setSelectedCategory('itgc')}
              size="sm"
            >
              ITGC
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Controles */}
      <div className="grid gap-3">
        {filteredControls.map((control) => (
          <Card key={control.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getCategoryIcon(control.categoria)}
                    <CardTitle className="text-lg flex items-center gap-2">
                      {control.codigo}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyControlCode(control.codigo)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </CardTitle>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{control.titulo}</h3>
                  <CardDescription className="text-sm">
                    {control.descricao}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(control.categoria)}>
                    {control.categoria.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getCriticalityColor(control.criticidade)}>
                    {control.criticidade.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getNaturezaIcon(control.natureza)}
                    {control.natureza}
                  </Badge>
                  {control.is_global ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Global
                    </Badge>
                  ) : (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      Personalizado
                    </Badge>
                  )}
                  {/* Botões de ação para controles personalizados */}
                  {!control.is_global && control.tenant_id === effectiveTenantId && (
                    <div className="flex gap-1 ml-auto">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditControl(control)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteControl(control)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="activities">Atividades</TabsTrigger>
                  <TabsTrigger value="evidence">Evidências</TabsTrigger>
                  <TabsTrigger value="systems">Sistemas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subcategoria</p>
                      <p className="text-sm">{control.subcategoria}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nível</p>
                      <p className="text-sm">{control.nivel}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Frequência</p>
                      <p className="text-sm">{control.frequencia}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Método de Teste</p>
                      <p className="text-sm">{control.metodo_teste}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Objetivo do Controle</p>
                    <p className="text-sm text-muted-foreground">{control.objetivo_controle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Risco do Processo</p>
                    <p className="text-sm text-muted-foreground">{control.risco_processo}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="activities">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Atividades do Controle</p>
                    <p className="text-sm text-muted-foreground">{control.atividades_controle}</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="evidence">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Evidências de Funcionamento</p>
                    <ul className="space-y-1">
                      {control.evidencias_funcionamento.map((evidencia, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                          {evidencia}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="systems">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Sistemas Aplicáveis</p>
                    <div className="flex flex-wrap gap-2">
                      {control.sistemas_aplicaveis.map((sistema, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sistema}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredControls.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum controle encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termo de busca para encontrar controles específicos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Criação/Edição de Controle */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingControl ? 'Editar Controle SOX' : 'Adicionar Novo Controle SOX'}
            </DialogTitle>
            <DialogDescription>
              {editingControl 
                ? 'Edite as informações do controle personalizado.' 
                : 'Crie um novo controle SOX personalizado para sua organização.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...controlForm}>
            <form onSubmit={controlForm.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={controlForm.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: CTRL-CUSTOM-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={controlForm.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entity_level">Entity Level</SelectItem>
                          <SelectItem value="transaction_level">Transaction Level</SelectItem>
                          <SelectItem value="itgc">ITGC</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={controlForm.control}
                  name="subcategoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Controles de Acesso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={controlForm.control}
                  name="natureza"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Natureza *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a natureza" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="preventivo">Preventivo</SelectItem>
                          <SelectItem value="detectivo">Detectivo</SelectItem>
                          <SelectItem value="corretivo">Corretivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={controlForm.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do controle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={controlForm.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição detalhada do controle"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={controlForm.control}
                name="objetivo_controle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo do Controle *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Qual é o objetivo específico deste controle?"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={controlForm.control}
                  name="nivel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="corporativo">Corporativo</SelectItem>
                          <SelectItem value="divisional">Divisional</SelectItem>
                          <SelectItem value="operacional">Operacional</SelectItem>
                          <SelectItem value="processo">Processo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={controlForm.control}
                  name="frequencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="continua">Contínua</SelectItem>
                          <SelectItem value="diaria">Diária</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={controlForm.control}
                  name="criticidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criticidade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a criticidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critica">Crítica</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={controlForm.control}
                name="atividades_controle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atividades do Controle *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva as atividades específicas do controle"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={controlForm.control}
                  name="metodo_teste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Teste</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Inspeção, Inquérito, Observação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={controlForm.control}
                  name="risco_processo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risco do Processo</FormLabel>
                      <FormControl>
                        <Input placeholder="Qual risco este controle mitiga?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={controlForm.control}
                name="evidencias_funcionamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidências de Funcionamento *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Liste as evidências, uma por linha&#10;Ex:&#10;Relatório de aprovações&#10;Log de sistema&#10;Documentos assinados"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={controlForm.control}
                name="sistemas_aplicaveis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sistemas Aplicáveis</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Liste os sistemas, um por linha&#10;Ex:&#10;SAP&#10;Oracle ERP&#10;Sistema Financeiro"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingControl ? 'Atualizar Controle' : 'Criar Controle'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SOXControlsLibrary;