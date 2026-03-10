import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Target, 
  Calendar, 
  Users, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft,
  Filter,
  MoreHorizontal,
  Eye,
  PlayCircle,
  PauseCircle,
  XCircle,
  RotateCcw,
  Save,
  Send,
  MessageSquare,
  Paperclip,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

interface Assessment {
  id: string;
  codigo: string;
  titulo: string;
  status: string;
  percentual_maturidade: number;
  gaps_identificados: number;
  controles_nao_conformes: number;
  framework?: {
    nome: string;
    codigo: string;
  };
  responsavel_profile?: {
    full_name: string;
  };
}

interface ActionPlan {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  objetivo: string;
  status: string;
  prioridade: string;
  percentual_conclusao: number;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  data_inicio_real?: string;
  data_fim_real?: string;
  orcamento_estimado: number;
  orcamento_aprovado?: number;
  responsavel_plano?: string;
  responsavel_profile?: {
    full_name: string;
    email: string;
  };
  assessment_id: string;
  created_at: string;
  updated_at: string;
}

interface ActionItem {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
  percentual_conclusao: number;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  responsavel?: string;
  responsavel_profile?: {
    full_name: string;
  };
  tipo_acao: string;
  custo_estimado: number;
  action_plan_id: string;
}

interface Gap {
  id: string;
  control_id: string;
  percentual_conformidade: number;
  criticidade_gap: string;
  justificativa: string;
  comentarios: string;
  control?: {
    titulo: string;
    codigo: string;
    criticidade: string;
  };
}

export default function ActionPlansManagementProfessional() {
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados principais
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de seleção
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedActionPlan, setSelectedActionPlan] = useState<ActionPlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);

  // Estados de UI
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [forceEnableTabs, setForceEnableTabs] = useState(false);

  // Formulários
  const [planForm, setPlanForm] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    objetivo: '',
    prioridade: 'media',
    data_inicio_planejada: '',
    data_fim_planejada: '',
    orcamento_estimado: 0,
    responsavel_plano: ''
  });

  const [itemForm, setItemForm] = useState({
    codigo: '',
    titulo: '',
    descricao: '',
    tipo_acao: 'implementacao',
    prioridade: 'media',
    data_inicio_planejada: '',
    data_fim_planejada: '',
    responsavel: '',
    custo_estimado: 0
  });

  // Configurações
  const statusOptions = [
    { value: 'planejado', label: 'Planejado', color: 'bg-blue-100 text-blue-800' },
    { value: 'aprovado', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'bg-orange-100 text-orange-800' },
    { value: 'suspenso', label: 'Suspenso', color: 'bg-gray-100 text-gray-800' },
    { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'baixa', label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
    { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-800' }
  ];

  const actionTypes = [
    { value: 'implementacao', label: 'Implementação' },
    { value: 'melhoria', label: 'Melhoria' },
    { value: 'correcao', label: 'Correção' },
    { value: 'documentacao', label: 'Documentação' },
    { value: 'treinamento', label: 'Treinamento' },
    { value: 'monitoramento', label: 'Monitoramento' }
  ];

  // Carregamento inicial
  useEffect(() => {
    if (effectiveTenantId) {
      loadAssessments();
    }
  }, [effectiveTenantId]);

  // Auto-seleção de assessment via URL
  useEffect(() => {
    const assessmentId = searchParams.get('assessment');
    if (assessmentId && assessments.length > 0) {
      const assessment = assessments.find(a => a.id === assessmentId);
      if (assessment) {
        setSelectedAssessment(assessment);
        setActiveTab('plans');
        setForceEnableTabs(true);
      }
    } else if (assessments.length > 0) {
      // Auto-selecionar o primeiro assessment se não houver seleção
      setSelectedAssessment(assessments[0]);
      setForceEnableTabs(true);
    }
  }, [assessments, searchParams]);

  // Carregamento de dados relacionados
  useEffect(() => {
    if (selectedAssessment) {
      loadActionPlans(selectedAssessment.id);
      loadGaps(selectedAssessment.id);
    }
  }, [selectedAssessment]);

  useEffect(() => {
    if (selectedActionPlan) {
      loadActionItems(selectedActionPlan.id);
    }
  }, [selectedActionPlan]);

  // Funções de carregamento
  const loadAssessments = async () => {
    try {
      setLoading(true);
      console.log('🔍 Carregando assessments para tenant:', effectiveTenantId);

      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          framework:assessment_frameworks(nome, codigo),
          responsavel_profile:profiles!assessments_responsavel_assessment_fkey(full_name)
        `)
        .eq('tenant_id', effectiveTenantId)
        .in('status', ['em_andamento', 'em_revisao', 'concluido'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📊 Assessments carregados:', data?.length || 0);
      setAssessments(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar assessments:', error);
      toast.error('Erro ao carregar assessments');
    } finally {
      setLoading(false);
    }
  };

  const loadActionPlans = async (assessmentId: string) => {
    try {
      console.log('🔍 Carregando planos para assessment:', assessmentId);

      const { data, error } = await supabase
        .from('assessment_action_plans')
        .select(`
          *,
          responsavel_profile:profiles!assessment_action_plans_responsavel_plano_fkey(full_name, email)
        `)
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📊 Planos carregados:', data?.length || 0);
      setActionPlans(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos de ação');
    }
  };

  const loadActionItems = async (planId: string) => {
    try {
      console.log('🔍 Carregando itens para plano:', planId);
      console.log('🔍 Tenant ID:', effectiveTenantId);
      
      const { data, error } = await supabase
        .from('assessment_action_items')
        .select(`
          *,
          responsavel_profile:profiles!assessment_action_items_responsavel_fkey(full_name)
        `)
        .eq('action_plan_id', planId)
        .eq('tenant_id', effectiveTenantId)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('❌ Erro na query de itens:', error);
        throw error;
      }

      console.log('📊 Itens carregados:', data?.length || 0, data);
      setActionItems(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens do plano');
    }
  };

  const loadGaps = async (assessmentId: string) => {
    try {
      console.log('🔍 Carregando gaps para assessment:', assessmentId);
      console.log('🔍 Tenant ID:', effectiveTenantId);
      
      const { data, error } = await supabase
        .from('assessment_responses')
        .select(`
          *,
          control:assessment_controls(titulo, codigo, criticidade)
        `)
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', effectiveTenantId)
        .eq('gap_identificado', true)
        .order('criticidade_gap', { ascending: false });

      if (error) {
        console.error('❌ Erro na query de gaps:', error);
        throw error;
      }

      console.log('📊 Gaps carregados:', data?.length || 0, data);
      setGaps(data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar gaps:', error);
    }
  };

  // Funções de ação
  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setSelectedActionPlan(null);
    setSearchParams({ assessment: assessment.id });
    setActiveTab('plans');
    setForceEnableTabs(true);
  };

  const handleCreatePlan = async () => {
    try {
      if (!selectedAssessment) return;

      const planData = {
        ...planForm,
        assessment_id: selectedAssessment.id,
        tenant_id: effectiveTenantId,
        status: 'planejado',
        percentual_conclusao: 0,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('assessment_action_plans')
        .insert(planData);

      if (error) throw error;

      toast.success('Plano de ação criado com sucesso!');
      setShowCreatePlan(false);
      resetPlanForm();
      loadActionPlans(selectedAssessment.id);
    } catch (error) {
      console.error('❌ Erro ao criar plano:', error);
      toast.error('Erro ao criar plano de ação');
    }
  };

  const handleUpdatePlanStatus = async (planId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('assessment_action_plans')
        .update({ 
          status: newStatus,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso!');
      if (selectedAssessment) {
        loadActionPlans(selectedAssessment.id);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      codigo: '',
      titulo: '',
      descricao: '',
      objetivo: '',
      prioridade: 'media',
      data_inicio_planejada: '',
      data_fim_planejada: '',
      orcamento_estimado: 0,
      responsavel_plano: ''
    });
  };

  // Funções de utilidade
  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    if (!statusOption) return <Badge>Desconhecido</Badge>;
    
    return (
      <Badge className={statusOption.color}>
        {statusOption.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'aprovado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'suspenso':
      case 'cancelado':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const priorityOption = priorityOptions.find(p => p.value === priority);
    return priorityOption ? (
      <Badge className={priorityOption.color}>{priorityOption.label}</Badge>
    ) : <Badge>Média</Badge>;
  };

  const filteredPlans = actionPlans.filter(plan => {
    const matchesSearch = !searchTerm || 
      plan.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || plan.prioridade === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Verificação de tenant
  if (!effectiveTenantId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Tenant não identificado</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível identificar o tenant atual.
            </p>
            <Button onClick={() => window.location.reload()}>
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/assessments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="border-l border-muted-foreground/20 pl-4">
            <h1 className="text-2xl font-bold">Gestão de Planos de Ação</h1>
            <p className="text-muted-foreground">
              Gerencie planos de ação baseados em gaps identificados nos assessments
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/assessments/reports')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          {selectedAssessment && (
            <Button onClick={() => setShowCreatePlan(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      {selectedAssessment && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Assessment:</span>
          <Badge variant="outline">{selectedAssessment.codigo}</Badge>
          <span>{selectedAssessment.titulo}</span>
          {selectedActionPlan && (
            <>
              <ArrowRight className="h-3 w-3" />
              <span>Plano:</span>
              <Badge variant="outline">{selectedActionPlan.codigo}</Badge>
              <span>{selectedActionPlan.titulo}</span>
            </>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="plans" disabled={!selectedAssessment && !forceEnableTabs}>
            Planos de Ação {selectedAssessment && `(${actionPlans.length})`}
          </TabsTrigger>
          <TabsTrigger value="gaps" disabled={!selectedAssessment && !forceEnableTabs}>
            Gaps Identificados ({gaps.length})
          </TabsTrigger>
          <TabsTrigger value="items" disabled={!selectedActionPlan && !forceEnableTabs}>
            Itens de Ação ({actionItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4">
            {assessments.map((assessment) => (
              <Card 
                key={assessment.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  selectedAssessment?.id === assessment.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectAssessment(assessment)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(assessment.status)}
                        <h3 className="text-lg font-semibold">{assessment.titulo}</h3>
                        {getStatusBadge(assessment.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {assessment.codigo} • {assessment.framework?.nome}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Maturidade</span>
                            <span>{assessment.percentual_maturidade || 0}%</span>
                          </div>
                          <Progress value={assessment.percentual_maturidade || 0} className="h-2" />
                        </div>
                        
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Gaps: {assessment.gaps_identificados || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{assessment.responsavel_profile?.full_name || 'Não atribuído'}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline">
                            <Target className="h-3 w-3 mr-1" />
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {assessments.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Nenhum assessment encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Apenas assessments em andamento ou concluídos aparecem aqui
                </p>
                <Button onClick={() => navigate('/assessments')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ir para Assessments
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Planos de Ação */}
        <TabsContent value="plans" className="space-y-6">
          {!selectedAssessment && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhum assessment selecionado</h3>
                <p className="text-muted-foreground mb-4">
                  Selecione um assessment na aba "Visão Geral" para ver os planos de ação
                </p>
                <Button onClick={() => setActiveTab('overview')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Visão Geral
                </Button>
              </CardContent>
            </Card>
          )}
          
          {selectedAssessment && (
            <>
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar planos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Planos */}
          <div className="space-y-4">
            {filteredPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`transition-shadow hover:shadow-md ${
                  selectedActionPlan?.id === plan.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(plan.status)}
                        <h3 className="text-lg font-semibold">{plan.titulo}</h3>
                        {getStatusBadge(plan.status)}
                        {getPriorityBadge(plan.prioridade)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {plan.codigo} • Criado em {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                      
                      {plan.descricao && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {plan.descricao}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{plan.percentual_conclusao}%</span>
                          </div>
                          <Progress value={plan.percentual_conclusao} className="h-2" />
                        </div>
                        
                        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                          {plan.responsavel_profile && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{plan.responsavel_profile.full_name}</span>
                            </div>
                          )}
                          {plan.data_fim_planejada && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Prazo: {new Date(plan.data_fim_planejada).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {plan.orcamento_estimado > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>R$ {plan.orcamento_estimado.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedActionPlan(plan)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver Itens
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPlan(plan)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {plan.status === 'planejado' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePlanStatus(plan.id, 'aprovado')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        {plan.status === 'aprovado' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdatePlanStatus(plan.id, 'em_andamento')}
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        {plan.status === 'em_andamento' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdatePlanStatus(plan.id, 'suspenso')}
                            >
                              <PauseCircle className="h-3 w-3 mr-1" />
                              Suspender
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePlanStatus(plan.id, 'concluido')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Concluir
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedActionPlan(plan)}
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPlans.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Nenhum plano de ação encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                    ? 'Tente ajustar os filtros de pesquisa'
                    : 'Comece criando um plano de ação para tratar os gaps identificados'
                  }
                </p>
                {selectedAssessment && (
                  <Button onClick={() => setShowCreatePlan(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Plano
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
            </>
          )}
        </TabsContent>

        {/* Tab: Gaps Identificados */}
        <TabsContent value="gaps" className="space-y-6">
          {!selectedAssessment && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhum assessment selecionado</h3>
                <p className="text-muted-foreground mb-4">
                  Selecione um assessment na aba "Visão Geral" para ver os gaps identificados
                </p>
                <Button onClick={() => setActiveTab('overview')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Visão Geral
                </Button>
              </CardContent>
            </Card>
          )}
          
          {selectedAssessment && (
          <Card>
            <CardHeader>
              <CardTitle>Gaps Identificados - {selectedAssessment?.titulo}</CardTitle>
              <CardDescription>
                Gaps que requerem ações corretivas ou de melhoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gaps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Nenhum gap identificado</h3>
                  <p className="text-sm text-muted-foreground">
                    Parabéns! Todos os controles estão em conformidade.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gaps.map((gap) => (
                    <Card key={gap.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{gap.control?.titulo}</h4>
                              {getPriorityBadge(gap.criticidade_gap)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {gap.control?.codigo} • Conformidade: {gap.percentual_conformidade}%
                            </p>
                            {gap.justificativa && (
                              <p className="text-sm">
                                <strong>Justificativa:</strong> {gap.justificativa}
                              </p>
                            )}
                            {gap.comentarios && (
                              <p className="text-sm">
                                <strong>Comentários:</strong> {gap.comentarios}
                              </p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Lógica para criar ação baseada no gap
                              setActiveTab('plans');
                              setShowCreatePlan(true);
                            }}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            Criar Plano
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* Tab: Itens de Ação */}
        <TabsContent value="items" className="space-y-6">
          {!selectedActionPlan && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Nenhum plano de ação selecionado</h3>
                <p className="text-muted-foreground mb-4">
                  Selecione um plano de ação na aba "Planos de Ação" para ver os itens
                </p>
                <Button onClick={() => setActiveTab('plans')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Planos
                </Button>
              </CardContent>
            </Card>
          )}
          
          {selectedActionPlan && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Itens do Plano: {selectedActionPlan.titulo}</CardTitle>
                      <CardDescription>
                        Gerencie as atividades específicas do plano de ação
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowCreateItem(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Item
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                {actionItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{item.titulo}</h4>
                            {getStatusBadge(item.status)}
                            {getPriorityBadge(item.prioridade)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.codigo} • {actionTypes.find(t => t.value === item.tipo_acao)?.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.descricao}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{item.percentual_conclusao}%</span>
                          </div>
                          <Progress value={item.percentual_conclusao} className="h-2" />
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">Responsável</div>
                          <div className="font-medium">
                            {item.responsavel_profile?.full_name || 'Não atribuído'}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">Prazo</div>
                          <div className="font-medium">
                            {item.data_fim_planejada ? 
                              new Date(item.data_fim_planejada).toLocaleDateString() : 
                              'Não definido'
                            }
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">Custo</div>
                          <div className="font-medium">
                            R$ {item.custo_estimado?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {actionItems.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Nenhum item encontrado</h3>
                    <p className="text-muted-foreground mb-6">
                      Comece adicionando itens específicos ao plano de ação
                    </p>
                    <Button onClick={() => setShowCreateItem(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Item
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog: Criar Plano */}
      <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Plano de Ação</DialogTitle>
            <DialogDescription>
              Crie um plano de ação para tratar gaps identificados no assessment
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={planForm.codigo}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, codigo: e.target.value }))}
                  placeholder="Ex: PA-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={planForm.prioridade} onValueChange={(value) => setPlanForm(prev => ({ ...prev, prioridade: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={planForm.titulo}
                onChange={(e) => setPlanForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Plano de Melhoria da Segurança da Informação"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={planForm.descricao}
                onChange={(e) => setPlanForm(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição detalhada do plano de ação"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objetivo">Objetivo</Label>
              <Textarea
                id="objetivo"
                value={planForm.objetivo}
                onChange={(e) => setPlanForm(prev => ({ ...prev, objetivo: e.target.value }))}
                placeholder="Objetivo principal do plano de ação"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={planForm.data_inicio_planejada}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, data_inicio_planejada: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={planForm.data_fim_planejada}
                  onChange={(e) => setPlanForm(prev => ({ ...prev, data_fim_planejada: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orcamento">Orçamento Estimado (R$)</Label>
              <Input
                id="orcamento"
                type="number"
                value={planForm.orcamento_estimado}
                onChange={(e) => setPlanForm(prev => ({ ...prev, orcamento_estimado: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreatePlan(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreatePlan}>
              <Save className="h-4 w-4 mr-2" />
              Criar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}