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
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckSquare,
  Award,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Save,
  ListFilter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { NewAssessmentWizard } from './NewAssessmentWizard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { sanitizeInput, sanitizeObject, secureLog } from '@/utils/securityLogger';

interface Assessment {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  requisito_id?: string;
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

  // Requirement Details (Fetched)
  requisito_titulo?: string;
  requisito_codigo?: string;
  requisito_descricao?: string;
  requisito_criterios?: string;
  framework_nome?: string;

  // Execution Fields
  observacoes?: string;
  evidencias?: string[];

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
  const [executingAssessment, setExecutingAssessment] = useState<Assessment | null>(null);

  // Header Actions State
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

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
  }, [effectiveTenantId]);

  const loadData = async () => {
    if (!effectiveTenantId) return;

    setLoading(true);
    try {
      await Promise.all([
        loadAssessments(),
        loadRequirements(),
        loadUsers()
      ]);
    } catch (error) {
      secureLog('error', 'Erro ao carregar dados de avaliações', error);
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
          codigo,
          descricao,
          criterios_conformidade,
          frameworks_compliance!inner(nome)
        )
      `)
      .eq('tenant_id', effectiveTenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const processedData = data?.map(assessment => ({
      ...assessment,
      avaliador_nome: assessment.avaliador?.full_name || 'Não atribuído',
      requisito_titulo: assessment.requisitos_compliance?.titulo || 'N/A',
      requisito_codigo: assessment.requisitos_compliance?.codigo || '',
      requisito_descricao: assessment.requisitos_compliance?.descricao || '',
      requisito_criterios: assessment.requisitos_compliance?.criterios_conformidade || '',
      framework_nome: assessment.requisitos_compliance?.frameworks_compliance?.nome || 'N/A',
      // Ensure execution fields are mapped if they exist in DB types but not in default select
      // (Actually select * gets them, so we just need them in the interface which we fixed)
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
      .eq('tenant_id', effectiveTenantId)
      .eq('status', 'ativo')
      .order('titulo');

    if (error) throw error;

    const processedRequirements = data?.map(req => ({
      id: req.id,
      titulo: req.titulo,
      framework_id: req.framework_id,
      framework_nome: (req.frameworks_compliance as any)?.nome || 'N/A'
    })) || [];

    setRequirements(processedRequirements);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('tenant_id', effectiveTenantId)
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
      const sanitizedData = sanitizeObject(data);

      const { error } = await supabase
        .from('avaliacoes_conformidade')
        .insert({
          tenant_id: effectiveTenantId,
          requisito_id: sanitizedData.requisito_id,
          codigo,
          titulo: sanitizedData.titulo,
          descricao: sanitizedData.descricao,
          tipo_avaliacao: sanitizedData.tipo_avaliacao,
          metodologia: sanitizedData.metodologia,
          data_planejada: format(data.data_planejada, 'yyyy-MM-dd'),
          data_inicio: data.data_inicio ? format(data.data_inicio, 'yyyy-MM-dd') : null,
          avaliador_responsavel: sanitizedData.avaliador_responsavel,
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
      secureLog('error', 'Erro ao criar avaliação', error);
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
      secureLog('error', 'Erro ao iniciar avaliação', error);
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
      secureLog('error', 'Erro ao concluir avaliação', error);
      toast.error('Erro ao concluir avaliação');
    }
  };

  const handleUpdateAssessment = async (data: z.infer<typeof assessmentSchema>, id: string) => {
    try {
      const sanitizedData = sanitizeObject(data);
      const { error } = await supabase
        .from('avaliacoes_conformidade')
        .update({
          titulo: sanitizedData.titulo,
          descricao: sanitizedData.descricao,
          tipo_avaliacao: sanitizedData.tipo_avaliacao,
          metodologia: sanitizedData.metodologia,
          data_planejada: format(data.data_planejada, 'yyyy-MM-dd'),
          avaliador_responsavel: sanitizedData.avaliador_responsavel,
          amostra_testada: data.amostra_testada,
          populacao_total: data.populacao_total,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Avaliação atualizada com sucesso');
      setEditingAssessment(null);
      loadAssessments();
    } catch (error) {
      secureLog('error', 'Erro ao atualizar avaliação', error);
      toast.error('Erro ao atualizar avaliação');
    }
  };

  const handleEditClick = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    assessmentForm.reset({
      titulo: assessment.titulo,
      descricao: assessment.descricao || '',
      requisito_id: assessment.requisito_id || '', // Keep existing logic for ID
      tipo_avaliacao: assessment.tipo_avaliacao || '',
      metodologia: assessment.metodologia || '',
      data_planejada: new Date(assessment.data_planejada),
      data_inicio: assessment.data_inicio ? new Date(assessment.data_inicio) : undefined,
      avaliador_responsavel: assessment.avaliador_responsavel || '',
      amostra_testada: assessment.amostra_testada || 1,
      populacao_total: assessment.populacao_total || 1
    });
  };

  // State for Execution (Audit)
  const [executionData, setExecutionData] = useState({
    resultado_conformidade: '',
    observacoes: '',
    evidencias: [] as string[],
    concluir: false
  });

  const handleExecuteClick = (assessment: Assessment) => {
    setExecutingAssessment(assessment);
    setExecutionData({
      resultado_conformidade: assessment.resultado_conformidade || '',
      observacoes: assessment.observacoes || '',
      evidencias: Array.isArray(assessment.evidencias) ? assessment.evidencias : [],
      concluir: assessment.status === 'concluida'
    });
  };

  const handleSaveExecution = async () => {
    if (!executingAssessment) return;

    try {
      const updates: any = {
        resultado_conformidade: executionData.resultado_conformidade,
        observacoes: executionData.observacoes,
        evidencias: executionData.evidencias,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      if (executionData.concluir) {
        updates.status = 'concluida';
        updates.data_conclusao = new Date().toISOString();

        // Calculate Score based on result
        if (executionData.resultado_conformidade === 'conforme') {
          updates.score_conformidade = 100;
          updates.pontos_conformes = 1;
          updates.pontos_nao_conformes = 0;
        } else if (executionData.resultado_conformidade === 'nao_conforme') {
          updates.score_conformidade = 0;
          updates.pontos_conformes = 0;
          updates.pontos_nao_conformes = 1;
        } else if (executionData.resultado_conformidade === 'parcial') {
          updates.score_conformidade = 50;
          updates.pontos_conformes = 0;
          updates.pontos_nao_conformes = 1; // Count as non-compliant for strict metrics? Or split? Let's keep simple.
        }
      } else if (executingAssessment.status === 'planejada') {
        updates.status = 'em_andamento';
        updates.data_inicio = new Date().toISOString();
      }

      const { error } = await supabase
        .from('avaliacoes_conformidade')
        .update(updates)
        .eq('id', executingAssessment.id);

      if (error) throw error;

      toast.success('Avaliação atualizada com sucesso');
      setExecutingAssessment(null);
      loadAssessments();
    } catch (error) {
      secureLog('error', 'Erro ao salvar execução', error);
      toast.error('Erro ao salvar execução');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-50">
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
          <Button
            variant={showSearch ? "secondary" : "outline"}
            onClick={() => {
              console.log('Clicked Search, toggling to:', !showSearch);
              setShowSearch(!showSearch);
              if (showFilters) setShowFilters(false);
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => {
              console.log('Clicked Filters, toggling to:', !showFilters);
              setShowFilters(!showFilters);
              if (showSearch) setShowSearch(false);
            }}
          >
            <ListFilter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => {
            console.log('Clicked Nova Avaliacao');
            setIsDialogOpen(true);
          }} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* Search and Filters Area (Collapsible) */}
      {(showSearch || showFilters) && (
        <div className="bg-muted/30 border rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Buscar por título, código, requisito ou framework..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="planejada">Planejada</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluida">Concluída</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px] bg-background">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="auto_avaliacao">Auto-avaliação</SelectItem>
                    <SelectItem value="auditoria_interna">Auditoria Interna</SelectItem>
                    <SelectItem value="auditoria_externa">Auditoria Externa</SelectItem>
                    <SelectItem value="revisao_continua">Revisão Contínua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="ghost" onClick={() => {
                  setSelectedStatus('all');
                  setSelectedType('all');
                }}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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
                      variant="default"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleExecuteClick(assessment)}
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Auditar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAssessment(assessment)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(assessment)}
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

      {/* Modal de Execução (Auditoria) */}
      <Dialog open={!!executingAssessment} onOpenChange={(open) => !open && setExecutingAssessment(null)}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/40 shrink-0">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                Auditoria de Conformidade
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-2">
                Avaliação {executingAssessment?.codigo}
                {executingAssessment?.framework_nome && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {executingAssessment.framework_nome}
                  </Badge>
                )}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setExecutingAssessment(null)}>
                X
              </Button>
            </div>
          </div>

          {executingAssessment && (
            <div className="flex-1 flex overflow-hidden">

              {/* Left Column: Context (Requirement Details) */}
              <div className="w-[45%] border-r bg-muted/10 flex flex-col overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Requisito em Análise
                  </h4>
                  <div className="bg-card border rounded-lg p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        {executingAssessment.requisito_codigo || 'N/A'}
                      </span>
                      <h3 className="text-lg font-semibold mt-2 leading-tight">
                        {executingAssessment.requisito_titulo || executingAssessment.titulo}
                      </h3>
                    </div>

                    {executingAssessment.requisito_descricao && (
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {executingAssessment.requisito_descricao}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Critérios de Auditoria
                  </h4>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-5">
                    {executingAssessment.requisito_criterios ? (
                      <div className="text-sm prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                        {executingAssessment.requisito_criterios}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nenhum critério específico definido para este requisito.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-4 border-t">
                  <div>
                    <span className="block font-medium mb-1">Responsável</span>
                    {executingAssessment.avaliador_nome}
                  </div>
                  <div>
                    <span className="block font-medium mb-1">Data Planejada</span>
                    {format(new Date(executingAssessment.data_planejada), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>

              {/* Right Column: Execution Form */}
              <div className="flex-1 flex flex-col overflow-y-auto bg-background p-6 space-y-6">

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Resultado da Avaliação</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={cn(
                        "cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all hover:bg-muted/50",
                        executionData.resultado_conformidade === 'conforme' ? "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500" : ""
                      )}
                      onClick={() => setExecutionData({ ...executionData, resultado_conformidade: 'conforme' })}
                    >
                      <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                        {executionData.resultado_conformidade === 'conforme' && <div className="h-2 w-2 rounded-full bg-green-600" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium block text-green-700 dark:text-green-400">Conforme</span>
                        <span className="text-xs text-muted-foreground">Requisito atendido integralmente</span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "cursor-pointer border rounded-lg p-4 flex items-center gap-3 transition-all hover:bg-muted/50",
                        executionData.resultado_conformidade === 'nao_conforme' ? "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500" : ""
                      )}
                      onClick={() => setExecutionData({ ...executionData, resultado_conformidade: 'nao_conforme' })}
                    >
                      <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                        {executionData.resultado_conformidade === 'nao_conforme' && <div className="h-2 w-2 rounded-full bg-red-600" />}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium block text-red-700 dark:text-red-400">Não Conforme</span>
                        <span className="text-xs text-muted-foreground">Requisito não atendido</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {/* Additional options (Partial, N/A) as smaller buttons or select if preferred. 
                             Keeping select for full range but highlighting main ones above. 
                             Actually, let's just sync the select or show all options. 
                             Let's use a Select for the full list to be safe.
                         */}
                    <Select
                      value={executionData.resultado_conformidade}
                      onValueChange={(val) => setExecutionData({ ...executionData, resultado_conformidade: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Outros resultados..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">✅ Conforme</SelectItem>
                        <SelectItem value="nao_conforme">❌ Não Conforme</SelectItem>
                        <SelectItem value="parcial">⚠️ Parcialmente Conforme</SelectItem>
                        <SelectItem value="nao_aplicavel">⚪ Não Aplicável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <hr className="border-dashed" />

                <div className="space-y-3 flex-1">
                  <Label className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Parecer Técnico / Observações
                  </Label>
                  <Textarea
                    placeholder="Registre aqui as constatações detalhadas, pontos de atenção ou justificativas..."
                    className="min-h-[150px] resize-none font-normal"
                    value={executionData.observacoes}
                    onChange={(e) => setExecutionData({ ...executionData, observacoes: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Evidências</Label>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                      const input = document.getElementById('evidence-input') as HTMLInputElement;
                      input?.focus();
                    }}>
                      <Plus className="h-3 w-3 mr-1" /> Adicionar Link
                    </Button>
                  </div>

                  <div className="bg-muted/30 border rounded-lg p-3 space-y-2 min-h-[100px]">
                    {executionData.evidencias.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        Nenhuma evidência vinculada.
                      </div>
                    )}
                    {executionData.evidencias.map((ev, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm bg-background p-2 rounded border shadow-sm group">
                        <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded">
                          <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <a href={ev} target="_blank" rel="noopener noreferrer" className="flex-1 truncate hover:underline text-blue-600 font-medium">
                          {ev}
                        </a>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                          const newEv = [...executionData.evidencias];
                          newEv.splice(idx, 1);
                          setExecutionData({ ...executionData, evidencias: newEv });
                        }}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cole a URL da evidência (Sharepoint, Drive, etc)..."
                      id="evidence-input"
                    />
                    <Button size="sm" onClick={() => {
                      const input = document.getElementById('evidence-input') as HTMLInputElement;
                      if (input.value) {
                        setExecutionData({ ...executionData, evidencias: [...executionData.evidencias, input.value] });
                        input.value = '';
                      }
                    }}>
                      Adicionar
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="p-4 border-t bg-background shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="complete-check"
                checked={executionData.concluir}
                onCheckedChange={(c) => setExecutionData({ ...executionData, concluir: !!c })}
                className="h-5 w-5"
              />
              <div className="grid gap-0.5 leading-none">
                <label htmlFor="complete-check" className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Marcar avaliação como Concluída
                </label>
                <span className="text-xs text-muted-foreground">Isso encerrará a auditoria e calculará a pontuação.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setExecutingAssessment(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveExecution} className="min-w-[140px] bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar Execução
              </Button>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={!!editingAssessment} onOpenChange={(open) => !open && setEditingAssessment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Avaliação</DialogTitle>
            <DialogDescription>
              Atualize os detalhes da avaliação de conformidade
            </DialogDescription>
          </DialogHeader>

          {editingAssessment && (
            <Form {...assessmentForm}>
              <form onSubmit={(e) => {
                e.preventDefault();
                // We need to construct the object manually or restart form with defaultValues
                // Since we are reusing the form, let's use the current state of inputs or re-submit
                assessmentForm.handleSubmit((data) => handleUpdateAssessment(data, editingAssessment.id))(e);
              }} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <FormField
                      control={assessmentForm.control}
                      name="titulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ex: Avaliação Anual LGPD" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={assessmentForm.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Descreva o objetivo desta avaliação..." className="h-24" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={assessmentForm.control}
                        name="tipo_avaliacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="auto_avaliacao">Auto-Avaliação</SelectItem>
                                <SelectItem value="auditoria_interna">Auditoria Interna</SelectItem>
                                <SelectItem value="auditoria_externa">Auditoria Externo</SelectItem>
                                <SelectItem value="revisao_continua">Revisão Contínua</SelectItem>
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
                                  <SelectValue placeholder="Selecione a metodologia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="amostragem">Amostragem</SelectItem>
                                <SelectItem value="integral">Análise Integral</SelectItem>
                                <SelectItem value="entrevista">Entrevista</SelectItem>
                                <SelectItem value="observacao">Observação</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Non-editable Context Fields */}
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <h4 className="font-medium text-sm text-foreground mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" /> Contexto (Fixo)
                      </h4>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Framework</p>
                        <p className="text-sm font-medium">{editingAssessment?.framework_nome}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Requisito</p>
                        <p className="text-sm font-medium">{editingAssessment?.requisito_titulo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Código</p>
                        <p className="text-sm font-mono">{editingAssessment?.codigo}</p>
                      </div>
                    </div>

                    {/* Hidden Requirement Field to satisfy schema */}
                    <FormField
                      control={assessmentForm.control}
                      name="requisito_id"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={assessmentForm.control}
                        name="data_planejada"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data Planejada</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
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
                                  disabled={(date) =>
                                    date < new Date("1900-01-01")
                                  }
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
                        name="avaliador_responsavel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Responsável</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {users.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.full_name || u.email}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={assessmentForm.control}
                        name="amostra_testada"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amostra</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
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
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" type="button" onClick={() => setEditingAssessment(null)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

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
      <NewAssessmentWizard
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={loadData}
      />
    </div>
  );
};

export default AssessmentsManagement;