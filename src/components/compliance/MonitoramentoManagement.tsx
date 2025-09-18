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
import { Progress } from "@/components/ui/progress";
import { 
  Activity,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Calendar,
  User,
  Database,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { sanitizeInput, sanitizeObject, secureLog } from '@/utils/securityLogger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

interface MonitoringItem {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  tipo_objeto?: string;
  objeto_id: string;
  frequencia?: string;
  metrica_monitorada: string;
  unidade_medida?: string;
  valor_alvo?: number;
  limite_inferior?: number;
  limite_superior?: number;
  limite_critico?: number;
  fonte_dados?: string;
  status?: string;
  automatizado?: boolean;
  requer_aprovacao_manual?: boolean;
  ultimo_valor_coletado?: number;
  data_ultima_coleta?: string;
  data_proxima_coleta?: string;
  responsavel_nome?: string;
  aprovador_nome?: string;
}

interface User {
  id: string;
  full_name: string;
}

const monitoringSchema = z.object({
  codigo: z.string().min(1, "Código é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  tipo_objeto: z.string().min(1, "Tipo de objeto é obrigatório"),
  frequencia: z.string().min(1, "Frequência é obrigatória"),
  metrica_monitorada: z.string().min(1, "Métrica é obrigatória"),
  unidade_medida: z.string().optional(),
  valor_alvo: z.number().optional(),
  limite_inferior: z.number().optional(),
  limite_superior: z.number().optional(),
  limite_critico: z.number().optional(),
  fonte_dados: z.string().optional(),
  responsavel_monitoramento: z.string().min(1, "Responsável é obrigatório"),
  aprovador_alertas: z.string().optional(),
  automatizado: z.boolean().default(false),
  requer_aprovacao_manual: z.boolean().default(false)
});

const MonitoramentoManagement: React.FC = () => {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [monitoringItems, setMonitoringItems] = useState<MonitoringItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonitoringItem | null>(null);
  
  const monitoringForm = useForm<z.infer<typeof monitoringSchema>>({
    resolver: zodResolver(monitoringSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      tipo_objeto: '',
      frequencia: '',
      metrica_monitorada: '',
      unidade_medida: '',
      valor_alvo: 0,
      limite_inferior: 0,
      limite_superior: 0,
      limite_critico: 0,
      fonte_dados: '',
      responsavel_monitoramento: '',
      aprovador_alertas: '',
      automatizado: false,
      requer_aprovacao_manual: false
    }
  });

  useEffect(() => {
    loadData();
  }, [effectiveTenantId]);

  const loadData = async () => {
    if (!effectiveTenantId) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadMonitoringItems(),
        loadUsers()
      ]);
    } catch (error) {
      secureLog('error', 'Erro ao carregar dados de monitoramento', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMonitoringItems = async () => {
    const { data, error } = await supabase
      .from('monitoramento_conformidade')
      .select(`
        *,
        responsavel:responsavel_monitoramento(full_name),
        aprovador:aprovador_alertas(full_name)
      `)
      .eq('tenant_id', effectiveTenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedData = data?.map(item => ({
      ...item,
      responsavel_nome: item.responsavel?.full_name || 'N/A',
      aprovador_nome: item.aprovador?.full_name || 'N/A'
    })) || [];

    setMonitoringItems(formattedData);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('tenant_id', effectiveTenantId);

    if (error) throw error;
    setUsers(data || []);
  };

  const handleCreateMonitoring = async (values: z.infer<typeof monitoringSchema>) => {
    if (!effectiveTenantId || !user) return;

    try {
      // Gerar objeto_id temporário para este exemplo
      const objeto_id = crypto.randomUUID();
      
      const sanitizedValues = sanitizeObject(values);
      const { error } = await supabase
        .from('monitoramento_conformidade')
        .insert({
          ...sanitizedValues,
          tenant_id: effectiveTenantId,
          objeto_id: objeto_id,
          status: 'ativo'
        });

      if (error) throw error;

      toast.success('Monitoramento criado com sucesso');
      setIsDialogOpen(false);
      monitoringForm.reset();
      loadMonitoringItems();
    } catch (error) {
      secureLog('error', 'Erro ao criar monitoramento', error);
      toast.error('Erro ao criar monitoramento');
    }
  };

  const handleEditMonitoring = (item: MonitoringItem) => {
    setEditingItem(item);
    monitoringForm.reset({
      codigo: item.codigo,
      nome: item.nome,
      descricao: item.descricao || '',
      tipo_objeto: item.tipo_objeto || '',
      frequencia: item.frequencia || '',
      metrica_monitorada: item.metrica_monitorada,
      unidade_medida: item.unidade_medida || '',
      valor_alvo: item.valor_alvo || 0,
      limite_inferior: item.limite_inferior || 0,
      limite_superior: item.limite_superior || 0,
      limite_critico: item.limite_critico || 0,
      fonte_dados: item.fonte_dados || '',
      responsavel_monitoramento: item.responsavel_monitoramento,
      aprovador_alertas: item.aprovador_alertas || '',
      automatizado: item.automatizado || false,
      requer_aprovacao_manual: item.requer_aprovacao_manual || false
    });
    setIsDialogOpen(true);
  };

  const handleUpdateMonitoring = async (values: z.infer<typeof monitoringSchema>) => {
    if (!editingItem || !effectiveTenantId) return;

    try {
      const { error } = await supabase
        .from('monitoramento_conformidade')
        .update(values)
        .eq('id', editingItem.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Monitoramento atualizado com sucesso');
      setIsDialogOpen(false);
      setEditingItem(null);
      monitoringForm.reset();
      loadMonitoringItems();
    } catch (error) {
      secureLog('error', 'Erro ao atualizar monitoramento', error);
      toast.error('Erro ao atualizar monitoramento');
    }
  };

  const handleDeleteMonitoring = async (item: MonitoringItem) => {
    if (!confirm('Tem certeza que deseja excluir este monitoramento?')) return;

    try {
      const { error } = await supabase
        .from('monitoramento_conformidade')
        .delete()
        .eq('id', item.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Monitoramento excluído com sucesso');
      loadMonitoringItems();
    } catch (error) {
      secureLog('error', 'Erro ao excluir monitoramento', error);
      toast.error('Erro ao excluir monitoramento');
    }
  };

  const handleToggleStatus = async (item: MonitoringItem) => {
    const newStatus = item.status === 'ativo' ? 'pausado' : 'ativo';
    
    try {
      const { error } = await supabase
        .from('monitoramento_conformidade')
        .update({ status: newStatus })
        .eq('id', item.id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success(`Monitoramento ${newStatus === 'ativo' ? 'ativado' : 'pausado'} com sucesso`);
      loadMonitoringItems();
    } catch (error) {
      secureLog('error', 'Erro ao alterar status', error);
      toast.error('Erro ao alterar status do monitoramento');
    }
  };

  const handleSubmit = (values: z.infer<typeof monitoringSchema>) => {
    if (editingItem) {
      handleUpdateMonitoring(values);
    } else {
      handleCreateMonitoring(values);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    monitoringForm.reset();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800 border-green-300';
      case 'pausado': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'inativo': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <CheckCircle className="h-4 w-4" />;
      case 'pausado': return <Pause className="h-4 w-4" />;
      case 'inativo': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredItems = monitoringItems.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.metrica_monitorada.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: monitoringItems.length,
    ativos: monitoringItems.filter(item => item.status === 'ativo').length,
    pausados: monitoringItems.filter(item => item.status === 'suspenso' || item.status === 'inativo').length,
    automatizados: monitoringItems.filter(item => item.automatizado).length
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
            <Activity className="h-8 w-8 text-blue-600" />
            Monitoramento de Conformidade
          </h1>
          <p className="text-muted-foreground">
            Monitore métricas e indicadores de conformidade em tempo real
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {setEditingItem(null); monitoringForm.reset();}}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Monitoramento
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pausados</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pausados}</p>
              </div>
              <Pause className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Automatizados</p>
                <p className="text-2xl font-bold text-purple-600">{stats.automatizados}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
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
              placeholder="Buscar monitoramentos por nome, código ou métrica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-lg">
            <Button 
              variant={selectedStatus === 'all' ? 'default' : 'ghost'}
              onClick={() => setSelectedStatus('all')}
              size="sm"
            >
              Todos
            </Button>
            <Button 
              variant={selectedStatus === 'ativo' ? 'default' : 'ghost'}
              onClick={() => setSelectedStatus('ativo')}
              size="sm"
            >
              Ativos
            </Button>
            <Button 
              variant={selectedStatus === 'pausado' ? 'default' : 'ghost'}
              onClick={() => setSelectedStatus('pausado')}
              size="sm"
            >
              Pausados
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Monitoramentos */}
      <div className="grid gap-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{item.codigo}</CardTitle>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.nome}</h3>
                  <CardDescription className="text-sm">
                    {item.descricao || 'Sem descrição'}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getStatusColor(item.status || 'inativo')}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status || 'inativo')}
                      {item.status?.toUpperCase() || 'INATIVO'}
                    </div>
                  </Badge>
                  {item.automatizado && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Automatizado
                    </Badge>
                  )}
                  {item.requer_aprovacao_manual && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Aprovação Manual
                    </Badge>
                  )}
                  <div className="flex gap-1 ml-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleToggleStatus(item)}
                      className="h-6 w-6 p-0"
                    >
                      {item.status === 'ativo' ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditMonitoring(item)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteMonitoring(item)}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="metrics">Métricas</TabsTrigger>
                  <TabsTrigger value="schedule">Agendamento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tipo de Objeto</p>
                      <p className="text-sm">{item.tipo_objeto || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Métrica</p>
                      <p className="text-sm">{item.metrica_monitorada}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                      <p className="text-sm">{item.responsavel_nome}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fonte de Dados</p>
                      <p className="text-sm">{item.fonte_dados || 'N/A'}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="metrics" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor Alvo</p>
                      <p className="text-sm font-semibold text-green-600">
                        {item.valor_alvo || 0} {item.unidade_medida || ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Limite Inferior</p>
                      <p className="text-sm">{item.limite_inferior || 0} {item.unidade_medida || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Limite Superior</p>
                      <p className="text-sm">{item.limite_superior || 0} {item.unidade_medida || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Limite Crítico</p>
                      <p className="text-sm font-semibold text-red-600">
                        {item.limite_critico || 0} {item.unidade_medida || ''}
                      </p>
                    </div>
                  </div>
                  {item.ultimo_valor_coletado !== null && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Último Valor Coletado</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {item.ultimo_valor_coletado} {item.unidade_medida || ''}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="schedule" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Frequência</p>
                      <p className="text-sm">{item.frequencia || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Última Coleta</p>
                      <p className="text-sm">
                        {item.data_ultima_coleta ? format(new Date(item.data_ultima_coleta), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Próxima Coleta</p>
                      <p className="text-sm">
                        {item.data_proxima_coleta ? format(new Date(item.data_proxima_coleta), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum monitoramento encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Tente ajustar os filtros ou termo de busca.' : 'Crie o primeiro monitoramento de conformidade.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Monitoramento' : 'Novo Monitoramento'}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? 'Edite as informações do monitoramento de conformidade.' 
                : 'Crie um novo monitoramento de conformidade para acompanhar métricas importantes.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...monitoringForm}>
            <form onSubmit={monitoringForm.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={monitoringForm.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: MON-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={monitoringForm.control}
                  name="tipo_objeto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Objeto *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="controle">Controle</SelectItem>
                          <SelectItem value="processo">Processo</SelectItem>
                          <SelectItem value="politica">Política</SelectItem>
                          <SelectItem value="framework">Framework</SelectItem>
                          <SelectItem value="sistema">Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={monitoringForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do monitoramento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={monitoringForm.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição detalhada do monitoramento"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={monitoringForm.control}
                  name="metrica_monitorada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Métrica Monitorada *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Taxa de Conformidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={monitoringForm.control}
                  name="unidade_medida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidade de Medida</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: %, quantidade, dias" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={monitoringForm.control}
                  name="valor_alvo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Alvo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={monitoringForm.control}
                  name="limite_inferior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite Inferior</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={monitoringForm.control}
                  name="limite_superior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite Superior</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={monitoringForm.control}
                  name="limite_critico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite Crítico</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={monitoringForm.control}
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
                  control={monitoringForm.control}
                  name="fonte_dados"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte de Dados</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sistema ERP, Base de dados" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={monitoringForm.control}
                  name="responsavel_monitoramento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável pelo Monitoramento *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={monitoringForm.control}
                  name="aprovador_alertas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aprovador de Alertas</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o aprovador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <FormField
                  control={monitoringForm.control}
                  name="automatizado"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Monitoramento automatizado
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={monitoringForm.control}
                  name="requer_aprovacao_manual"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="rounded"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Requer aprovação manual
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Atualizar Monitoramento' : 'Criar Monitoramento'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitoramentoManagement;