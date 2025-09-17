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
import { 
  CheckCircle,
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
  Users,
  AlertTriangle,
  BarChart3,
  Download,
  Upload,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Activity,
  ClipboardList,
  Award,
  AlertCircle,
  TrendingUp,
  TrendingDown
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

interface Assessment {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  tipo_avaliacao?: string;
  data_planejada: string;
  data_inicio?: string;
  data_conclusao?: string;
  avaliador_responsavel?: string;
  avaliador_nome?: string;
  metodologia?: string;
  status?: string;
  resultado_conformidade?: string;
  score_conformidade?: number;
  pontos_conformes?: number;
  pontos_nao_conformes?: number;
  total_pontos_avaliados?: number;
  requisito_titulo?: string;
  framework_nome?: string;
  equipe_avaliacao?: string[];
  amostra_testada?: number;
  populacao_total?: number;
}

interface Requirement {
  id: string;
  titulo: string;
  framework_id: string;
  framework_nome: string;
}

const assessmentSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().optional(),
  requisito_id: z.string().min(1, "Requisito é obrigatório"),
  tipo_avaliacao: z.string().min(1, "Tipo de avaliação é obrigatório"),
  metodologia: z.string().min(1, "Metodologia é obrigatória"),
  data_planejada: z.date(),
  data_inicio: z.date().optional(),
  avaliador_responsavel: z.string().min(1, "Avaliador responsável é obrigatório"),
  amostra_testada: z.number().min(1, "Amostra deve ser maior que 0"),
  populacao_total: z.number().min(1, "População total deve ser maior que 0")
});

const AssessmentsManagement: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  const { user } = useAuth();
  const tenantId = useCurrentTenantId();

  const assessmentForm = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      data_planejada: new Date(),
      amostra_testada: 1,
      populacao_total: 1
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
        loadAssessments(),
        loadRequirements(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async () => {
    const { data, error } = await supabase
      .from('avaliacoes_conformidade')
      .select(`
        *,
        avaliador:avaliador_responsavel(full_name),
        requisitos_compliance!inner(
          titulo,
          frameworks_compliance!inner(nome)
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedData = data?.map(assessment => ({
      ...assessment,
      avaliador_nome: assessment.avaliador?.full_name || 'Não atribuído',
      requisito_titulo: assessment.requisitos_compliance?.titulo || 'N/A',
      framework_nome: assessment.requisitos_compliance?.frameworks_compliance?.nome || 'N/A'
    })) || [];

    setAssessments(processedData);
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

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('tenant_id', tenantId)
      .order('full_name');

    if (error) throw error;
    setUsers(data || []);
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.requisito_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.framework_nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || assessment.status === selectedStatus;
    const matchesType = selectedType === 'all' || assessment.tipo_avaliacao === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateAssessment = async (data: z.infer<typeof assessmentSchema>) => {
    try {
      const codigo = `AV-${Date.now()}`;
      
      const { error } = await supabase
        .from('avaliacoes_conformidade')
        .insert({
          tenant_id: tenantId,
          requisito_id: data.requisito_id,
          codigo,
          titulo: data.titulo,
          descricao: data.descricao,
          tipo_avaliacao: data.tipo_avaliacao,
          metodologia: data.metodologia,
          data_planejada: format(data.data_planejada, 'yyyy-MM-dd'),
          data_inicio: data.data_inicio ? format(data.data_inicio, 'yyyy-MM-dd') : null,
          avaliador_responsavel: data.avaliador_responsavel,
          amostra_testada: data.amostra_testada,
          populacao_total: data.populacao_total,
          status: 'planejada',
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Avaliação criada com sucesso');
      setIsDialogOpen(false);
      assessmentForm.reset();
      loadAssessments();
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      toast.error('Erro ao criar avaliação');
    }
  };

  const handleStartAssessment = async (assessmentId: string) => {
    try {
      const { error } = await supabase
        .from('avaliacoes_conformidade')
        .update({
          status: 'em_andamento',
          data_inicio: format(new Date(), 'yyyy-MM-dd'),
          updated_by: user?.id
        })
        .eq('id', assessmentId);

      if (error) throw error;

      toast.success('Avaliação iniciada com sucesso');
      loadAssessments();
    } catch (error) {
      console.error('Erro ao iniciar avaliação:', error);
      toast.error('Erro ao iniciar avaliação');
    }
  };

  const handleCompleteAssessment = async (assessmentId: string) => {
    try {
      const { error } = await supabase
        .from('avaliacoes_conformidade')
        .update({
          status: 'concluida',
          data_conclusao: format(new Date(), 'yyyy-MM-dd'),
          updated_by: user?.id
        })
        .eq('id', assessmentId);

      if (error) throw error;

      toast.success('Avaliação concluída com sucesso');
      loadAssessments();
    } catch (error) {
      console.error('Erro ao concluir avaliação:', error);
      toast.error('Erro ao concluir avaliação');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejada': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'concluida': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelada': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejada': return <Clock className="h-4 w-4" />;
      case 'em_andamento': return <PlayCircle className="h-4 w-4" />;
      case 'concluida': return <CheckCircle className="h-4 w-4" />;
      case 'cancelada': return <StopCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'auto_avaliacao': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'auditoria_interna': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'auditoria_externa': return 'bg-red-100 text-red-800 border-red-300';
      case 'revisao_continua': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConformityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateDaysToPlanned = (dataPlaneada: string) => {
    const planned = new Date(dataPlaneada);
    const today = new Date();
    const diffTime = planned.getTime() - today.getTime();
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
            <CheckCircle className="h-8 w-8 text-green-600" />
            Avaliações de Conformidade
          </h1>
          <p className="text-muted-foreground">
            Gestão de avaliações periódicas de conformidade e compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Avaliação de Conformidade</DialogTitle>
                <DialogDescription>
                  Crie uma nova avaliação para verificar conformidade com requisitos
                </DialogDescription>
              </DialogHeader>
              <Form {...assessmentForm}>
                <form onSubmit={assessmentForm.handleSubmit(handleCreateAssessment)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={assessmentForm.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Título da avaliação" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assessmentForm.control}
                      name="tipo_avaliacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Avaliação</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="auto_avaliacao">Auto Avaliação</SelectItem>
                              <SelectItem value="auditoria_interna">Auditoria Interna</SelectItem>
                              <SelectItem value="auditoria_externa">Auditoria Externa</SelectItem>
                              <SelectItem value="revisao_continua">Revisão Contínua</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={assessmentForm.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descreva o objetivo e escopo da avaliação..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={assessmentForm.control}
                      name="requisito_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requisito</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o requisito" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {requirements.map(req => (
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
                      control={assessmentForm.control}
                      name="metodologia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metodologia</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Metodologia de teste" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="walkthrough">Walkthrough</SelectItem>
                              <SelectItem value="teste_substantivo">Teste Substantivo</SelectItem>
                              <SelectItem value="amostragem_estatistica">Amostragem Estatística</SelectItem>
                              <SelectItem value="revisao_analitica">Revisão Analítica</SelectItem>
                              <SelectItem value="inspecao_fisica">Inspeção Física</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={assessmentForm.control}
                      name="avaliador_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avaliador Responsável</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Responsável pela avaliação" />
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
                      control={assessmentForm.control}
                      name="data_planejada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Planejada</FormLabel>
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
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assessmentForm.control}
                      name="data_inicio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Início (Opcional)</FormLabel>
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
                                    <span>Data de início</span>
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
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={assessmentForm.control}
                      name="amostra_testada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamanho da Amostra</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Quantidade de itens testados"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={assessmentForm.control}
                      name="populacao_total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>População Total</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Total de itens na população"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Criar Avaliação</Button>
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
                <p className="text-2xl font-bold">{assessments.length}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planejadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {assessments.filter(a => a.status === 'planejada').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {assessments.filter(a => a.status === 'em_andamento').length}
                </p>
              </div>
              <PlayCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">
                  {assessments.filter(a => a.status === 'concluida').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
              placeholder="Buscar avaliações..."
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
              <SelectItem value="planejada">Planejada</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
              <SelectItem value="cancelada">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="auto_avaliacao">Auto Avaliação</SelectItem>
              <SelectItem value="auditoria_interna">Auditoria Interna</SelectItem>
              <SelectItem value="auditoria_externa">Auditoria Externa</SelectItem>
              <SelectItem value="revisao_continua">Revisão Contínua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="grid gap-4">
        {filteredAssessments.map((assessment) => {
          const daysToPlanned = calculateDaysToPlanned(assessment.data_planejada);
          const conformityPercentage = assessment.score_conformidade || 0;
          
          return (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{assessment.codigo}</CardTitle>
                      <Badge className={getStatusColor(assessment.status || '')}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(assessment.status || '')}
                          {assessment.status?.replace('_', ' ').toUpperCase()}
                        </div>
                      </Badge>
                      <Badge className={getTypeColor(assessment.tipo_avaliacao || '')} variant="outline">
                        {assessment.tipo_avaliacao?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{assessment.titulo}</h3>
                    <CardDescription className="text-sm">
                      {assessment.framework_nome} - {assessment.requisito_titulo}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    {assessment.status === 'planejada' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartAssessment(assessment.id)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Iniciar
                      </Button>
                    )}
                    {assessment.status === 'em_andamento' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteAssessment(assessment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avaliador</p>
                    <p className="text-sm">{assessment.avaliador_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data Planejada</p>
                    <p className={`text-sm ${daysToPlanned < 0 ? 'text-red-600' : daysToPlanned < 7 ? 'text-orange-600' : ''}`}>
                      {format(new Date(assessment.data_planejada), 'dd/MM/yyyy')}
                      {daysToPlanned !== null && (
                        <span className="block text-xs">
                          {daysToPlanned < 0 ? `${Math.abs(daysToPlanned)} dias atrasado` :
                           daysToPlanned === 0 ? 'Hoje' :
                           `Em ${daysToPlanned} dias`}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Metodologia</p>
                    <p className="text-sm capitalize">{assessment.metodologia?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Amostra</p>
                    <p className="text-sm">
                      {assessment.amostra_testada}/{assessment.populacao_total}
                      {assessment.populacao_total && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({((assessment.amostra_testada || 0) / assessment.populacao_total * 100).toFixed(1)}%)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                {assessment.status === 'concluida' && assessment.score_conformidade && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Score de Conformidade</span>
                      <span className={`text-sm font-bold ${getConformityColor(conformityPercentage)}`}>
                        {conformityPercentage}%
                      </span>
                    </div>
                    <Progress value={conformityPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Conformes: {assessment.pontos_conformes || 0}</span>
                      <span>Não conformes: {assessment.pontos_nao_conformes || 0}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAssessments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
                ? 'Tente ajustar os filtros para encontrar avaliações específicas.'
                : 'Comece criando a primeira avaliação de conformidade.'}
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedType === 'all' && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Avaliação
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes da Avaliação */}
      {selectedAssessment && (
        <Dialog open={!!selectedAssessment} onOpenChange={() => setSelectedAssessment(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {selectedAssessment.codigo} - {selectedAssessment.titulo}
              </DialogTitle>
              <DialogDescription>
                Detalhes completos da avaliação de conformidade
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="results">Resultados</TabsTrigger>
                <TabsTrigger value="evidence">Evidências</TabsTrigger>
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
                          <Badge className={getStatusColor(selectedAssessment.status || '')}>
                            {selectedAssessment.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tipo:</p>
                          <Badge className={getTypeColor(selectedAssessment.tipo_avaliacao || '')}>
                            {selectedAssessment.tipo_avaliacao?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Framework:</p>
                          <p>{selectedAssessment.framework_nome}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requisito:</p>
                          <p>{selectedAssessment.requisito_titulo}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Escopo da Avaliação</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground font-medium">Descrição:</p>
                          <p>{selectedAssessment.descricao || 'Não informada'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground font-medium">Metodologia:</p>
                          <p className="capitalize">{selectedAssessment.metodologia?.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Cronograma</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Data Planejada:</p>
                          <p>{format(new Date(selectedAssessment.data_planejada), 'dd/MM/yyyy')}</p>
                        </div>
                        {selectedAssessment.data_inicio && (
                          <div>
                            <p className="text-muted-foreground">Data Início:</p>
                            <p>{format(new Date(selectedAssessment.data_inicio), 'dd/MM/yyyy')}</p>
                          </div>
                        )}
                        {selectedAssessment.data_conclusao && (
                          <div>
                            <p className="text-muted-foreground">Data Conclusão:</p>
                            <p>{format(new Date(selectedAssessment.data_conclusao), 'dd/MM/yyyy')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Responsáveis</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Avaliador Principal:</p>
                          <p>{selectedAssessment.avaliador_nome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="results" className="space-y-4">
                {selectedAssessment.status === 'concluida' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className={`text-2xl font-bold ${getConformityColor(selectedAssessment.score_conformidade || 0)}`}>
                            {selectedAssessment.score_conformidade || 0}%
                          </div>
                          <p className="text-sm text-muted-foreground">Score de Conformidade</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedAssessment.pontos_conformes || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Pontos Conformes</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {selectedAssessment.pontos_nao_conformes || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Não Conformes</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Análise da Amostra</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amostra Testada:</p>
                          <p>{selectedAssessment.amostra_testada || 0} itens</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">População Total:</p>
                          <p>{selectedAssessment.populacao_total || 0} itens</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-semibold mb-2">Resultados não disponíveis</h4>
                    <p className="text-muted-foreground">
                      Os resultados serão exibidos após a conclusão da avaliação.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="evidence">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h4 className="font-semibold mb-2">Evidências</h4>
                  <p className="text-muted-foreground">
                    Funcionalidade de gestão de evidências em desenvolvimento...
                  </p>
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

export default AssessmentsManagement;