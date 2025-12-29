import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RiskLevelDisplay } from '@/components/ui/risk-level-display';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar as CalendarIcon,
  Clock,
  User,
  FileText,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Building,
  Settings,
  Download,
  Upload,
  BarChart3,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { sanitizeInput, sanitizeObject, secureLog } from '@/utils/securityLogger';

interface NonConformity {
  id: string;
  codigo: string;
  titulo: string;
  o_que: string;
  onde?: string;
  quando?: string;
  quem?: string;
  por_que?: string;
  categoria?: string;
  criticidade?: string;
  status?: string;
  responsavel_tratamento?: string;
  responsavel_nome?: string;
  data_identificacao: string;
  prazo_resolucao?: string;
  data_resolucao?: string;
  risco_score?: number;
  impacto_operacional?: number;
  impacto_financeiro?: number;
  planos_acao_count?: number;
}

interface ActionPlan {
  id: string;
  codigo: string;
  titulo: string;
  descricao_acao: string;
  status: string;
  responsavel_execucao?: string;
  responsavel_nome?: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  data_fim_real?: string;
  percentual_conclusao: number;
}

interface Requirement {
  id: string;
  titulo: string;
  framework_id: string;
  framework_nome: string;
}

const nonConformitySchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  requisito_id: z.string().min(1, "Requisito é obrigatório"),
  o_que: z.string().min(1, "Descrição é obrigatória"),
  onde: z.string().optional(),
  quando: z.date().optional(),
  quem: z.string().optional(),
  por_que: z.string().optional(),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  criticidade: z.string().min(1, "Criticidade é obrigatória"),
  responsavel_tratamento: z.string().min(1, "Responsável é obrigatório"),
  prazo_resolucao: z.date().min(new Date(), "Prazo deve ser futuro"),
  data_identificacao: z.date()
});

const actionPlanSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao_acao: z.string().min(1, "Descrição é obrigatória"),
  objetivo_acao: z.string().min(1, "Objetivo é obrigatório"),
  responsavel_execucao: z.string().min(1, "Responsável é obrigatório"),
  data_inicio_planejada: z.date(),
  data_fim_planejada: z.date(),
  tipo_acao: z.string().optional(),
  categoria_acao: z.string().optional()
});

const NonConformitiesManagement: React.FC = () => {
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCriticality, setSelectedCriticality] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isActionPlanDialogOpen, setIsActionPlanDialogOpen] = useState(false);
  const [selectedNonConformity, setSelectedNonConformity] = useState<NonConformity | null>(null);
  const [editingNonConformity, setEditingNonConformity] = useState<NonConformity | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const { user } = useAuth();
  const tenantId = useCurrentTenantId();

  const nonConformityForm = useForm<z.infer<typeof nonConformitySchema>>({
    resolver: zodResolver(nonConformitySchema),
    defaultValues: {
      data_identificacao: new Date(),
    }
  });

  const actionPlanForm = useForm<z.infer<typeof actionPlanSchema>>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: {
      data_inicio_planejada: new Date(),
    }
  });

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    if (!tenantId) return;

    setLoading(true);
    try {
      await Promise.all([
        loadNonConformities(),
        loadRequirements(),
        loadUsers()
      ]);
    } catch (error) {
      secureLog('error', 'Erro ao carregar dados de não conformidades', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadNonConformities = async () => {
    const { data, error } = await supabase
      .from('nao_conformidades')
      .select(`
        *,
        profiles:responsavel_tratamento(full_name),
        planos_acao_conformidade(id)
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedData = data?.map(nc => ({
      ...nc,
      responsavel_nome: nc.profiles?.full_name || 'Não atribuído',
      planos_acao_count: nc.planos_acao_conformidade?.length || 0
    })) || [];

    setNonConformities(processedData);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('tenant_id', tenantId)
      .order('full_name');

    if (error) throw error;
    setUsers(data || []);
  };

  const loadRequirements = async () => {
    const { data, error } = await supabase
      .from('requisitos_compliance')
      .select(`
        id,
        titulo,
        framework_id,
        frameworks_compliance!inner(nome)
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'ativo')
      .order('titulo');

    if (error) throw error;

    const processedRequirements = data?.map(req => ({
      id: req.id,
      titulo: req.titulo,
      framework_id: req.framework_id,
      framework_nome: req.frameworks_compliance?.nome || 'N/A'
    })) || [];

    setRequirements(processedRequirements);
  };

  const loadActionPlans = async (nonConformityId: string) => {
    const { data, error } = await supabase
      .from('planos_acao_conformidade')
      .select(`
        *,
        profiles:responsavel_execucao(full_name)
      `)
      .eq('nao_conformidade_id', nonConformityId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedPlans = data?.map(plan => ({
      ...plan,
      responsavel_nome: plan.profiles?.full_name || 'Não atribuído'
    })) || [];

    setActionPlans(processedPlans);
  };

  const filteredNonConformities = nonConformities.filter(nc => {
    const matchesSearch = nc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nc.o_que.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || nc.status === selectedStatus;
    const matchesCriticality = selectedCriticality === 'all' || nc.criticidade === selectedCriticality;

    return matchesSearch && matchesStatus && matchesCriticality;
  });

  const handleSaveNonConformity = async (data: z.infer<typeof nonConformitySchema>) => {
    try {
      const sanitizedData = sanitizeObject(data);
      const payload = {
        titulo: sanitizedData.titulo,
        requisito_id: sanitizedData.requisito_id,
        o_que: sanitizedData.o_que,
        onde: sanitizedData.onde,
        quando: sanitizedData.quando,
        quem: sanitizedData.quem,
        por_que: sanitizedData.por_que,
        categoria: sanitizedData.categoria,
        criticidade: sanitizedData.criticidade,
        responsavel_tratamento: sanitizedData.responsavel_tratamento,
        data_identificacao: format(data.data_identificacao, 'yyyy-MM-dd'),
        prazo_resolucao: data.prazo_resolucao ? format(data.prazo_resolucao, 'yyyy-MM-dd') : null,
        updated_by: user?.id
      };

      if (editingNonConformity) {
        const { error } = await supabase
          .from('nao_conformidades')
          .update(payload)
          .eq('id', editingNonConformity.id);

        if (error) throw error;
        toast.success('Não conformidade atualizada com sucesso');
      } else {
        const codigo = `NC-${Date.now()}`;
        const { error } = await supabase
          .from('nao_conformidades')
          .insert({
            ...payload,
            tenant_id: tenantId,
            codigo,
            status: 'aberta',
            created_by: user?.id
          });

        if (error) throw error;
        toast.success('Não conformidade criada com sucesso');
      }

      setIsDialogOpen(false);
      setEditingNonConformity(null);
      nonConformityForm.reset();
      loadNonConformities();
    } catch (error) {
      secureLog('error', 'Erro ao salvar não conformidade', error);
      toast.error('Erro ao salvar não conformidade');
    }
  };

  const handleEdit = (nc: NonConformity) => {
    setEditingNonConformity(nc);
    nonConformityForm.reset({
      titulo: nc.titulo,
      requisito_id: nc.requisito_id,
      o_que: nc.o_que,
      onde: nc.onde,
      quando: nc.quando ? new Date(nc.quando) : undefined,
      quem: nc.quem,
      por_que: nc.por_que,
      categoria: nc.categoria,
      criticidade: nc.criticidade,
      responsavel_tratamento: nc.responsavel_tratamento,
      data_identificacao: new Date(nc.data_identificacao),
      prazo_resolucao: nc.prazo_resolucao ? new Date(nc.prazo_resolucao) : undefined
    });
    setIsDialogOpen(true);
  };

  const handleCreateActionPlan = async (data: z.infer<typeof actionPlanSchema>) => {
    if (!selectedNonConformity) return;

    try {
      const codigo = `PA-${selectedNonConformity.codigo}-${Date.now()}`;
      const sanitizedData = sanitizeObject(data);

      const { error } = await supabase
        .from('planos_acao_conformidade')
        .insert({
          tenant_id: tenantId,
          nao_conformidade_id: selectedNonConformity.id,
          codigo,
          titulo: sanitizedData.titulo,
          descricao_acao: sanitizedData.descricao_acao,
          objetivo_acao: sanitizedData.objetivo_acao,
          responsavel_execucao: sanitizedData.responsavel_execucao,
          data_inicio_planejada: format(data.data_inicio_planejada, 'yyyy-MM-dd'),
          data_fim_planejada: format(data.data_fim_planejada, 'yyyy-MM-dd'),
          tipo_acao: sanitizedData.tipo_acao || 'corretiva',
          categoria_acao: sanitizedData.categoria_acao || 'processo',
          status: 'planejado',
          percentual_conclusao: 0,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Plano de ação criado com sucesso');
      setIsActionPlanDialogOpen(false);
      actionPlanForm.reset();
      loadActionPlans(selectedNonConformity.id);
      loadNonConformities(); // Reload to update counts
    } catch (error) {
      secureLog('error', 'Erro ao criar plano de ação', error);
      toast.error('Erro ao criar plano de ação');
    }
  };

  const getCriticalityColor = (criticidade: string) => {
    switch (criticidade) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-300';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'baixa': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta': return 'bg-red-100 text-red-800 border-red-300';
      case 'em_tratamento': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'resolvida': return 'bg-green-100 text-green-800 border-green-300';
      case 'fechada': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aberta': return <XCircle className="h-4 w-4" />;
      case 'em_tratamento': return <Clock className="h-4 w-4" />;
      case 'resolvida': return <CheckCircle className="h-4 w-4" />;
      case 'fechada': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const calculateDaysToDeadline = (prazoResolucao: string) => {
    if (!prazoResolucao) return null;
    const deadline = new Date(prazoResolucao);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Não Conformidades
          </h1>
          <p className="text-muted-foreground">
            Gestão de gaps de conformidade e planos de ação corretiva
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingNonConformity(null);
              nonConformityForm.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Não Conformidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingNonConformity ? 'Editar Não Conformidade' : 'Nova Não Conformidade'}</DialogTitle>
                <DialogDescription>
                  {editingNonConformity ? 'Atualize os dados da não conformidade' : 'Registre uma nova não conformidade identificada'}
                </DialogDescription>
              </DialogHeader>
              <Form {...nonConformityForm}>
                <form onSubmit={nonConformityForm.handleSubmit(handleSaveNonConformity)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={nonConformityForm.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Título da não conformidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={nonConformityForm.control}
                      name="requisito_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requisito Relacionado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o requisito" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {requirements.map((req) => (
                                <SelectItem key={req.id} value={req.id}>
                                  {req.framework_nome} - {req.titulo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nonConformityForm.control}
                      name="categoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="controle_interno">Controle Interno</SelectItem>
                              <SelectItem value="regulatorio">Regulatório</SelectItem>
                              <SelectItem value="processo">Processo</SelectItem>
                              <SelectItem value="documentacao">Documentação</SelectItem>
                              <SelectItem value="sistema">Sistema</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={nonConformityForm.control}
                    name="o_que"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>O que (Descrição)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva detalhadamente a não conformidade..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={nonConformityForm.control}
                      name="onde"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Onde</FormLabel>
                          <FormControl>
                            <Input placeholder="Local/processo onde foi identificada" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={nonConformityForm.control}
                      name="quem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quem</FormLabel>
                          <FormControl>
                            <Input placeholder="Pessoa/equipe responsável" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={nonConformityForm.control}
                    name="por_que"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Por que (Causa raiz)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Análise de causa raiz..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={nonConformityForm.control}
                      name="criticidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Criticidade</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Criticidade" />
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
                    <FormField
                      control={nonConformityForm.control}
                      name="responsavel_tratamento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Responsável pelo tratamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map(user => (
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
                      control={nonConformityForm.control}
                      name="prazo_resolucao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prazo de Resolução</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy")
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingNonConformity ? 'Salvar Alterações' : 'Criar Não Conformidade'}</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{nonConformities.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abertas</p>
                <p className="text-2xl font-bold text-red-600">
                  {nonConformities.filter(nc => nc.status === 'aberta').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Tratamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {nonConformities.filter(nc => nc.status === 'em_tratamento').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticas</p>
                <p className="text-2xl font-bold text-red-600">
                  {nonConformities.filter(nc => nc.criticidade === 'critica').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar não conformidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="aberta">Aberta</SelectItem>
              <SelectItem value="em_tratamento">Em Tratamento</SelectItem>
              <SelectItem value="resolvida">Resolvida</SelectItem>
              <SelectItem value="fechada">Fechada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCriticality} onValueChange={setSelectedCriticality}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Criticidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critica">Crítica</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Não Conformidades */}
      <div className="grid gap-4">
        {filteredNonConformities.map((nc) => {
          const daysToDeadline = calculateDaysToDeadline(nc.prazo_resolucao || '');

          return (
            <Card key={nc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{nc.codigo}</CardTitle>
                      <Badge className={getCriticalityColor(nc.criticidade || '')}>
                        {nc.criticidade?.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(nc.status || '')} variant="outline">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(nc.status || '')}
                          {nc.status?.replace('_', ' ').toUpperCase()}
                        </div>
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{nc.titulo}</h3>
                    <CardDescription className="text-sm">
                      {nc.o_que}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedNonConformity(nc);
                        loadActionPlans(nc.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(nc)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Responsável</p>
                    <p className="text-sm">{nc.responsavel_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Identificação</p>
                    <p className="text-sm">{nc.data_identificacao ? format(new Date(nc.data_identificacao), 'dd/MM/yyyy') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prazo</p>
                    <p className={`text-sm ${daysToDeadline !== null && daysToDeadline < 0 ? 'text-red-600' : daysToDeadline !== null && daysToDeadline < 7 ? 'text-orange-600' : ''}`}>
                      {nc.prazo_resolucao ? format(new Date(nc.prazo_resolucao), 'dd/MM/yyyy') : 'Não definido'}
                      {daysToDeadline !== null && (
                        <span className="block text-xs">
                          {daysToDeadline < 0 ? `${Math.abs(daysToDeadline)} dias atrasado` :
                            daysToDeadline === 0 ? 'Vence hoje' :
                              `${daysToDeadline} dias restantes`}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Planos de Ação</p>
                    <p className="text-sm flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {nc.planos_acao_count || 0} planos
                    </p>
                  </div>
                </div>

                {nc.risco_score && (
                  <div className="mb-4">
                    <RiskLevelDisplay level={nc.risco_score} />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNonConformities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma não conformidade encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedCriticality !== 'all'
                ? 'Tente ajustar os filtros para encontrar não conformidades específicas.'
                : 'Comece registrando a primeira não conformidade do seu sistema.'}
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedCriticality === 'all' && (
              <Button onClick={() => {
                setEditingNonConformity(null);
                nonConformityForm.reset();
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeira Não Conformidade
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes da Não Conformidade */}
      {selectedNonConformity && (
        <Dialog open={!!selectedNonConformity} onOpenChange={() => setSelectedNonConformity(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {selectedNonConformity.codigo} - {selectedNonConformity.titulo}
              </DialogTitle>
              <DialogDescription>
                Detalhes completos da não conformidade e planos de ação
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="action-plans">Planos de Ação ({actionPlans.length})</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Informações Básicas</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Status:</p>
                          <Badge className={getStatusColor(selectedNonConformity.status || '')}>
                            {selectedNonConformity.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Criticidade:</p>
                          <Badge className={getCriticalityColor(selectedNonConformity.criticidade || '')}>
                            {selectedNonConformity.criticidade?.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Categoria:</p>
                          <p>{selectedNonConformity.categoria}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Responsável:</p>
                          <p>{selectedNonConformity.responsavel_nome}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Análise 5W1H</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium">O que:</p>
                          <p>{selectedNonConformity.o_que}</p>
                        </div>
                        {selectedNonConformity.onde && (
                          <div>
                            <p className="text-muted-foreground font-medium">Onde:</p>
                            <p>{selectedNonConformity.onde}</p>
                          </div>
                        )}
                        {selectedNonConformity.quem && (
                          <div>
                            <p className="text-muted-foreground font-medium">Quem:</p>
                            <p>{selectedNonConformity.quem}</p>
                          </div>
                        )}
                        {selectedNonConformity.por_que && (
                          <div>
                            <p className="text-muted-foreground font-medium">Por que:</p>
                            <p>{selectedNonConformity.por_que}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Prazos</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Data de Identificação:</p>
                          <p>{selectedNonConformity.data_identificacao ? format(new Date(selectedNonConformity.data_identificacao), 'dd/MM/yyyy') : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prazo de Resolução:</p>
                          <p>{selectedNonConformity.prazo_resolucao ? format(new Date(selectedNonConformity.prazo_resolucao), 'dd/MM/yyyy') : 'Não definido'}</p>
                        </div>
                        {selectedNonConformity.data_resolucao && (
                          <div>
                            <p className="text-muted-foreground">Data de Resolução:</p>
                            <p>{format(new Date(selectedNonConformity.data_resolucao), 'dd/MM/yyyy')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedNonConformity.risco_score && (
                      <div>
                        <h4 className="font-semibold mb-2">Análise de Risco</h4>
                        <RiskLevelDisplay level={selectedNonConformity.risco_score} />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="action-plans" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Planos de Ação ({actionPlans.length})</h4>
                  <Dialog open={isActionPlanDialogOpen} onOpenChange={setIsActionPlanDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Plano
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Novo Plano de Ação</DialogTitle>
                        <DialogDescription>
                          Crie um plano de ação para resolver esta não conformidade
                        </DialogDescription>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground mb-4">
                        Esta funcionalidade está em desenvolvimento...
                      </p>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {actionPlans.length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h4 className="font-semibold mb-2">Nenhum plano de ação</h4>
                      <p className="text-muted-foreground mb-4">
                        Esta não conformidade ainda não possui planos de ação definidos.
                      </p>
                      <Button onClick={() => setIsActionPlanDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Plano
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history">
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-semibold mb-2">Histórico</h4>
                  <p className="text-muted-foreground">
                    Funcionalidade de histórico em desenvolvimento...
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NonConformitiesManagement;