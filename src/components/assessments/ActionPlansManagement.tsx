import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Target, Calendar, Users, DollarSign, CheckCircle, AlertTriangle, Clock, FileText, TrendingUp, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Assessment, AssessmentActionPlan, AssessmentActionItem, AssessmentResponse } from '@/types/assessment';
import { sanitizeInput, sanitizeObject, auditLog } from '@/utils/securityLogger';
import { useCRUDRateLimit } from '@/hooks/useRateLimit';

export default function ActionPlansManagement() {
  const { user, effectiveTenantId } = useAuth();
  const navigate = useNavigate();
  const rateLimitCRUD = useCRUDRateLimit(user?.id || 'anonymous');

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [actionPlans, setActionPlans] = useState<AssessmentActionPlan[]>([]);
  const [actionItems, setActionItems] = useState<AssessmentActionItem[]>([]);
  const [gaps, setGaps] = useState<AssessmentResponse[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [selectedActionPlan, setSelectedActionPlan] = useState<AssessmentActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todas');
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);

  const [planForm, setPlanForm] = useState({
    assessment_id: '',
    codigo: '',
    titulo: '',
    descricao: '',
    objetivo: '',
    prioridade: '',
    impacto_esperado: '',
    beneficios_esperados: [],
    data_inicio_planejada: '',
    data_fim_planejada: '',
    responsavel_plano: '',
    equipe_responsavel: [],
    orcamento_estimado: 0,
    recursos_necessarios: []
  });

  const [itemForm, setItemForm] = useState({
    action_plan_id: '',
    response_id: '',
    control_id: '',
    codigo: '',
    titulo: '',
    descricao: '',
    ordem: 1,
    tipo_acao: '',
    categoria: '',
    data_inicio_planejada: '',
    data_fim_planejada: '',
    responsavel: '',
    colaboradores: [],
    prioridade: '',
    impacto_estimado: '',
    custo_estimado: 0,
    entregaveis: [],
    criterios_aceitacao: []
  });

  const statusOptions = [
    { value: 'planejado', label: 'Planejado', color: 'bg-blue-100 text-blue-800' },
    { value: 'aprovado', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
    { value: 'iniciado', label: 'Iniciado', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'em_andamento', label: 'Em Andamento', color: 'bg-orange-100 text-orange-800' },
    { value: 'suspenso', label: 'Suspenso', color: 'bg-gray-100 text-gray-800' },
    { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    { value: 'atrasado', label: 'Atrasado', color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'baixa', label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
    { value: 'media', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'alta', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    { value: 'critica', label: 'Crítica', color: 'bg-red-100 text-red-800' }
  ];

  const tiposAcao = [
    { value: 'implementacao', label: 'Implementação' },
    { value: 'melhoria', label: 'Melhoria' },
    { value: 'correcao', label: 'Correção' },
    { value: 'documentacao', label: 'Documentação' },
    { value: 'treinamento', label: 'Treinamento' },
    { value: 'monitoramento', label: 'Monitoramento' },
    { value: 'auditoria', label: 'Auditoria' },
    { value: 'outro', label: 'Outro' }
  ];

  useEffect(() => {
    loadAssessments();
  }, [effectiveTenantId]);

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

  const loadAssessments = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('read')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

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

      setAssessments(data || []);
    } catch (error) {
      console.error('Erro ao carregar assessments:', error);
      toast.error('Erro ao carregar assessments');
    } finally {
      setLoading(false);
    }
  };

  const loadActionPlans = async (assessmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_action_plans')
        .select(`
          *,
          assessment:assessments(titulo, codigo),
          responsavel_profile:profiles!assessment_action_plans_responsavel_plano_fkey(full_name, email),
          items_count:assessment_action_items(count),
          items_completed:assessment_action_items(count)
        `)
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActionPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos de ação:', error);
      toast.error('Erro ao carregar planos de ação');
    }
  };

  const loadActionItems = async (actionPlanId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_action_items')
        .select(`
          *,
          action_plan:assessment_action_plans(titulo),
          control:assessment_controls(titulo, codigo),
          response:assessment_responses(status_conformidade),
          responsavel_profile:profiles!assessment_action_items_responsavel_fkey(full_name, email)
        `)
        .eq('action_plan_id', actionPlanId)
        .eq('tenant_id', effectiveTenantId)
        .order('ordem', { ascending: true });

      if (error) throw error;

      setActionItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar itens do plano:', error);
      toast.error('Erro ao carregar itens do plano');
    }
  };

  const loadGaps = async (assessmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('assessment_responses')
        .select(`
          *,
          question:assessment_questions(texto),
          control:assessment_controls(titulo, codigo, criticidade)
        `)
        .eq('assessment_id', assessmentId)
        .eq('tenant_id', effectiveTenantId)
        .eq('gap_identificado', true)
        .order('criticidade_gap', { ascending: false });

      if (error) throw error;

      setGaps(data || []);
    } catch (error) {
      console.error('Erro ao carregar gaps:', error);
      toast.error('Erro ao carregar gaps identificados');
    }
  };

  const handleCreateActionPlan = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('create')) {
        toast.error('Limite de operações excedido. Tente novamente em alguns segundos.');
        return;
      }

      if (!selectedAssessment) {
        toast.error('Selecione um assessment primeiro');
        return;
      }

      const sanitizedFormData = sanitizeObject({
        ...planForm,
        codigo: sanitizeInput(planForm.codigo),
        titulo: sanitizeInput(planForm.titulo),
        descricao: sanitizeInput(planForm.descricao),
        objetivo: sanitizeInput(planForm.objetivo),
        impacto_esperado: sanitizeInput(planForm.impacto_esperado)
      });

      const planData = {
        ...sanitizedFormData,
        assessment_id: selectedAssessment.id,
        tenant_id: effectiveTenantId,
        beneficios_esperados: planForm.beneficios_esperados.filter(b => b.trim()),
        equipe_responsavel: planForm.equipe_responsavel.filter(e => e.trim()),
        recursos_necessarios: planForm.recursos_necessarios.filter(r => r.trim()),
        status: 'planejado' as const,
        percentual_conclusao: 0,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('assessment_action_plans')
        .insert(planData);

      if (error) throw error;

      await auditLog('CREATE', 'assessment_action_plans', {
        codigo: sanitizedFormData.codigo,
        titulo: sanitizedFormData.titulo,
        assessment_id: selectedAssessment.id,
        tenant_id: effectiveTenantId
      });

      toast.success('Plano de ação criado com sucesso!');
      setIsCreatePlanOpen(false);
      resetPlanForm();
      loadActionPlans(selectedAssessment.id);
    } catch (error) {
      console.error('Erro ao criar plano de ação:', error);
      toast.error('Erro ao criar plano de ação');
    }
  };

  const handleCreateActionItem = async () => {
    try {
      if (!rateLimitCRUD.checkRateLimit('create')) {
        toast.error('Limite de operações excedido.');
        return;
      }

      if (!selectedActionPlan) {
        toast.error('Selecione um plano de ação primeiro');
        return;
      }

      const sanitizedFormData = sanitizeObject({
        ...itemForm,
        codigo: sanitizeInput(itemForm.codigo),
        titulo: sanitizeInput(itemForm.titulo),
        descricao: sanitizeInput(itemForm.descricao),
        categoria: sanitizeInput(itemForm.categoria),
        impacto_estimado: sanitizeInput(itemForm.impacto_estimado)
      });

      const itemData = {
        ...sanitizedFormData,
        action_plan_id: selectedActionPlan.id,
        tenant_id: effectiveTenantId,
        colaboradores: itemForm.colaboradores.filter(c => c.trim()),
        entregaveis: itemForm.entregaveis.filter(e => e.trim()),
        criterios_aceitacao: itemForm.criterios_aceitacao.filter(c => c.trim()),
        status: 'pendente' as const,
        percentual_conclusao: 0,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('assessment_action_items')
        .insert(itemData);

      if (error) throw error;

      await auditLog('CREATE', 'assessment_action_items', {
        codigo: sanitizedFormData.codigo,
        titulo: sanitizedFormData.titulo,
        action_plan_id: selectedActionPlan.id,
        tenant_id: effectiveTenantId
      });

      toast.success('Item de ação criado com sucesso!');
      setIsCreateItemOpen(false);
      resetItemForm();
      loadActionItems(selectedActionPlan.id);
    } catch (error) {
      console.error('Erro ao criar item de ação:', error);
      toast.error('Erro ao criar item de ação');
    }
  };

  const handleUpdateItemStatus = async (itemId: string, newStatus: string, percentual: number = 0) => {
    try {
      if (!rateLimitCRUD.checkRateLimit('update')) {
        toast.error('Limite de operações excedido.');
        return;
      }

      const { error } = await supabase
        .from('assessment_action_items')
        .update({
          status: newStatus,
          percentual_conclusao: percentual,
          data_fim_real: newStatus === 'concluido' ? new Date().toISOString() : null,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      await auditLog('UPDATE', 'assessment_action_items', {
        id: itemId,
        action: 'status_change',
        new_status: newStatus,
        percentual_conclusao: percentual,
        tenant_id: effectiveTenantId
      });

      toast.success('Status atualizado com sucesso!');
      if (selectedActionPlan) {
        loadActionItems(selectedActionPlan.id);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const resetPlanForm = () => {
    setPlanForm({
      assessment_id: '',
      codigo: '',
      titulo: '',
      descricao: '',
      objetivo: '',
      prioridade: '',
      impacto_esperado: '',
      beneficios_esperados: [],
      data_inicio_planejada: '',
      data_fim_planejada: '',
      responsavel_plano: '',
      equipe_responsavel: [],
      orcamento_estimado: 0,
      recursos_necessarios: []
    });
  };

  const resetItemForm = () => {
    setItemForm({
      action_plan_id: '',
      response_id: '',
      control_id: '',
      codigo: '',
      titulo: '',
      descricao: '',
      ordem: 1,
      tipo_acao: '',
      categoria: '',
      data_inicio_planejada: '',
      data_fim_planejada: '',
      responsavel: '',
      colaboradores: [],
      prioridade: '',
      impacto_estimado: '',
      custo_estimado: 0,
      entregaveis: [],
      criterios_aceitacao: []
    });
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityOption = priorityOptions.find(p => p.value === priority);
    return priorityOption ? priorityOption.color : 'bg-gray-100 text-gray-800';
  };

  const filteredActionPlans = actionPlans.filter(plan => {
    const matchesSearch = plan.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || plan.status === filterStatus;
    const matchesPriority = filterPriority === 'todas' || plan.prioridade === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredActionItems = actionItems.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.codigo && item.codigo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'todos' || item.status === filterStatus;
    const matchesPriority = filterPriority === 'todas' || item.prioridade === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/assessments')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="border-l border-muted-foreground/20 pl-4">
            <h2 className="text-2xl font-bold tracking-tight">Planos de Ação</h2>
            <p className="text-muted-foreground">
              Gerencie planos de ação baseados em gaps identificados nos assessments
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedAssessment}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Plano de Ação</DialogTitle>
                <DialogDescription>
                  Crie um plano de ação para tratar gaps identificados no assessment
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-codigo">Código</Label>
                    <Input
                      id="plan-codigo"
                      value={planForm.codigo}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, codigo: e.target.value }))}
                      placeholder="Ex: PA-ASS-2025-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-prioridade">Prioridade</Label>
                    <Select value={planForm.prioridade} onValueChange={(value) => setPlanForm(prev => ({ ...prev, prioridade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
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
                  <Label htmlFor="plan-titulo">Título</Label>
                  <Input
                    id="plan-titulo"
                    value={planForm.titulo}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Ex: Plano de Melhoria da Segurança da Informação"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-descricao">Descrição</Label>
                  <Textarea
                    id="plan-descricao"
                    value={planForm.descricao}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descrição detalhada do plano de ação"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-objetivo">Objetivo</Label>
                  <Textarea
                    id="plan-objetivo"
                    value={planForm.objetivo}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, objetivo: e.target.value }))}
                    placeholder="Objetivo principal do plano de ação"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-impacto">Impacto Esperado</Label>
                  <Textarea
                    id="plan-impacto"
                    value={planForm.impacto_esperado}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, impacto_esperado: e.target.value }))}
                    placeholder="Descreva o impacto esperado após a implementação"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-inicio">Data de Início Planejada</Label>
                    <Input
                      id="plan-inicio"
                      type="date"
                      value={planForm.data_inicio_planejada}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, data_inicio_planejada: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan-fim">Data de Fim Planejada</Label>
                    <Input
                      id="plan-fim"
                      type="date"
                      value={planForm.data_fim_planejada}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, data_fim_planejada: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-orcamento">Orçamento Estimado (R$)</Label>
                  <Input
                    id="plan-orcamento"
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
                <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateActionPlan}>
                  Criar Plano
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar planos e itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as prioridades</SelectItem>
            {priorityOptions.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="selection" className="space-y-4">
        <TabsList>
          <TabsTrigger value="selection">Seleção de Assessment</TabsTrigger>
          <TabsTrigger value="gaps" disabled={!selectedAssessment}>
            Gaps Identificados {selectedAssessment && `(${gaps.length})`}
          </TabsTrigger>
          <TabsTrigger value="plans" disabled={!selectedAssessment}>
            Planos de Ação {selectedAssessment && `(${actionPlans.length})`}
          </TabsTrigger>
          <TabsTrigger value="items" disabled={!selectedActionPlan}>
            Itens de Ação {selectedActionPlan && `(${actionItems.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="selection" className="space-y-4">
          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Carregando assessments...</p>
                  </div>
                </CardContent>
              </Card>
            ) : assessments.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum assessment encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Apenas assessments em andamento ou concluídos aparecem aqui
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              assessments.map((assessment) => (
                <Card 
                  key={assessment.id} 
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAssessment?.id === assessment.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{assessment.titulo}</CardTitle>
                        <CardDescription>
                          {assessment.codigo} • {assessment.framework?.nome}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(assessment.status)}>
                          {assessment.status}
                        </Badge>
                        <Badge variant="outline">
                          {assessment.gaps_identificados} gaps
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Maturidade: {assessment.percentual_maturidade || 0}%
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Controles não conformes: {assessment.controles_nao_conformes}
                      </span>
                      {assessment.responsavel_profile && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {assessment.responsavel_profile.full_name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
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
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{gap.control?.titulo}</h4>
                              <Badge className={getPriorityBadge(gap.criticidade_gap || 'media')}>
                                {gap.criticidade_gap}
                              </Badge>
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
                              setItemForm(prev => ({
                                ...prev,
                                response_id: gap.id,
                                control_id: gap.control_id,
                                titulo: `Tratar gap: ${gap.control?.titulo}`,
                                prioridade: gap.criticidade_gap || 'media'
                              }));
                              setIsCreateItemOpen(true);
                            }}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            Criar Ação
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4">
            {filteredActionPlans.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum plano de ação encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Comece criando um plano de ação para tratar os gaps identificados'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredActionPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedActionPlan?.id === plan.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedActionPlan(plan)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{plan.titulo}</CardTitle>
                        <CardDescription>
                          {plan.codigo} • {plan.assessment?.titulo}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(plan.status)}>
                          {plan.status}
                        </Badge>
                        <Badge className={getPriorityBadge(plan.prioridade)}>
                          {plan.prioridade}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.descricao}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-muted-foreground">
                        {plan.percentual_conclusao}%
                      </span>
                    </div>
                    <Progress value={plan.percentual_conclusao} className="mb-4" />
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {plan.responsavel_profile && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {plan.responsavel_profile.full_name}
                        </span>
                      )}
                      {plan.data_fim_planejada && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(plan.data_fim_planejada).toLocaleDateString()}
                        </span>
                      )}
                      {plan.orcamento_estimado > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          R$ {plan.orcamento_estimado.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              Itens do Plano: {selectedActionPlan?.titulo}
            </h3>
            <Dialog open={isCreateItemOpen} onOpenChange={setIsCreateItemOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Item de Ação</DialogTitle>
                  <DialogDescription>
                    Adicione um novo item ao plano de ação
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-codigo">Código (opcional)</Label>
                      <Input
                        id="item-codigo"
                        value={itemForm.codigo}
                        onChange={(e) => setItemForm(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="Ex: IT-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-ordem">Ordem</Label>
                      <Input
                        id="item-ordem"
                        type="number"
                        value={itemForm.ordem}
                        onChange={(e) => setItemForm(prev => ({ ...prev, ordem: parseInt(e.target.value) }))}
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-titulo">Título</Label>
                    <Input
                      id="item-titulo"
                      value={itemForm.titulo}
                      onChange={(e) => setItemForm(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Implementar política de backup"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-descricao">Descrição</Label>
                    <Textarea
                      id="item-descricao"
                      value={itemForm.descricao}
                      onChange={(e) => setItemForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição detalhada da ação"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-tipo">Tipo de Ação</Label>
                      <Select value={itemForm.tipo_acao} onValueChange={(value) => setItemForm(prev => ({ ...prev, tipo_acao: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposAcao.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-prioridade">Prioridade</Label>
                      <Select value={itemForm.prioridade} onValueChange={(value) => setItemForm(prev => ({ ...prev, prioridade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item-inicio">Data de Início</Label>
                      <Input
                        id="item-inicio"
                        type="date"
                        value={itemForm.data_inicio_planejada}
                        onChange={(e) => setItemForm(prev => ({ ...prev, data_inicio_planejada: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item-fim">Data de Fim</Label>
                      <Input
                        id="item-fim"
                        type="date"
                        value={itemForm.data_fim_planejada}
                        onChange={(e) => setItemForm(prev => ({ ...prev, data_fim_planejada: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item-custo">Custo Estimado (R$)</Label>
                    <Input
                      id="item-custo"
                      type="number"
                      value={itemForm.custo_estimado}
                      onChange={(e) => setItemForm(prev => ({ ...prev, custo_estimado: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateItemOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateActionItem}>
                    Criar Item
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {filteredActionItems.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? 'Tente ajustar os filtros de pesquisa' : 'Comece adicionando itens ao plano de ação'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredActionItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {item.codigo ? `${item.codigo} - ` : ''}
                          {item.titulo}
                        </CardTitle>
                        <CardDescription>
                          {item.tipo_acao} • Ordem: {item.ordem}
                          {item.control && ` • Controle: ${item.control.codigo}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge className={getPriorityBadge(item.prioridade)}>
                          {item.prioridade}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {item.descricao}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-muted-foreground">
                        {item.percentual_conclusao}%
                      </span>
                    </div>
                    <Progress value={item.percentual_conclusao} className="mb-4" />

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                      {item.responsavel_profile && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {item.responsavel_profile.full_name}
                        </span>
                      )}
                      {item.data_fim_planejada && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.data_fim_planejada).toLocaleDateString()}
                        </span>
                      )}
                      {item.custo_estimado > 0 && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          R$ {item.custo_estimado.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.status === 'pendente' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateItemStatus(item.id, 'iniciado', 10)}
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {(item.status === 'iniciado' || item.status === 'em_andamento') && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateItemStatus(item.id, 'em_andamento', 50)}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Em Progresso
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateItemStatus(item.id, 'concluido', 100)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Concluir
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}