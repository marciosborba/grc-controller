import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckSquare,
  Plus,
  Edit,
  Eye,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Target,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

interface ActionPlan {
  id: string;
  codigo: string;
  titulo: string;
  descricao_acao: string;
  tipo_acao: string;
  categoria_acao: string;
  causa_raiz_endereçada: string;
  objetivo_acao: string;
  resultados_esperados: string;
  responsavel_execucao: string;
  responsavel_nome: string;
  responsavel_aprovacao: string;
  aprovador_nome: string;
  responsavel_monitoramento: string;
  monitor_nome: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  data_inicio_real: string;
  data_fim_real: string;
  orcamento_estimado: number;
  orcamento_realizado: number;
  recursos_necessarios: string[];
  dependencias: string[];
  status: string;
  percentual_conclusao: number;
  marcos_principais: any[];
  entregas_esperadas: string[];
  frequencia_monitoramento: string;
  data_proximo_monitoramento: string;
  data_verificacao_efetividade: string;
  efetividade_confirmada: boolean;
  evidencias_efetividade: string[];
  observacoes_efetividade: string;
  nao_conformidade_id: string;
  nao_conformidade_titulo: string;
  created_at: string;
  updated_at: string;
}

interface ActionPlanFormData {
  codigo: string;
  titulo: string;
  descricao_acao: string;
  nao_conformidade_id: string;
  tipo_acao: string;
  categoria_acao: string;
  causa_raiz_endereçada: string;
  objetivo_acao: string;
  resultados_esperados: string;
  responsavel_execucao: string;
  responsavel_aprovacao: string;
  responsavel_monitoramento: string;
  data_inicio_planejada: string;
  data_fim_planejada: string;
  orcamento_estimado: number;
  recursos_necessarios: string[];
  dependencias: string[];
  entregas_esperadas: string[];
  frequencia_monitoramento: string;
}

const TIPOS_ACAO = [
  { value: 'corretiva', label: 'Corretiva', color: 'bg-red-100 text-red-800' },
  { value: 'preventiva', label: 'Preventiva', color: 'bg-blue-100 text-blue-800' },
  { value: 'melhoria', label: 'Melhoria', color: 'bg-green-100 text-green-800' },
  { value: 'mitigacao', label: 'Mitigação', color: 'bg-yellow-100 text-yellow-800' }
];

const CATEGORIAS_ACAO = [
  'Processo',
  'Tecnologia',
  'Pessoas',
  'Documentação',
  'Treinamento',
  'Controles',
  'Políticas',
  'Sistemas'
];

const STATUS_OPTIONS = [
  { value: 'planejada', label: 'Planejada', color: 'bg-gray-100 text-gray-800', icon: Clock },
  { value: 'aprovada', label: 'Aprovada', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'em_execucao', label: 'Em Execução', color: 'bg-yellow-100 text-yellow-800', icon: PlayCircle },
  { value: 'suspensa', label: 'Suspensa', color: 'bg-orange-100 text-orange-800', icon: PauseCircle },
  { value: 'concluida', label: 'Concluída', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelada', label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle }
];

const FREQUENCIAS_MONITORAMENTO = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' }
];

export function ActionPlansManagement() {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [nonConformities, setNonConformities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const [formData, setFormData] = useState<ActionPlanFormData>({
    codigo: '',
    titulo: '',
    descricao_acao: '',
    nao_conformidade_id: '',
    tipo_acao: '',
    categoria_acao: '',
    causa_raiz_endereçada: '',
    objetivo_acao: '',
    resultados_esperados: '',
    responsavel_execucao: '',
    responsavel_aprovacao: '',
    responsavel_monitoramento: '',
    data_inicio_planejada: '',
    data_fim_planejada: '',
    orcamento_estimado: 0,
    recursos_necessarios: [],
    dependencias: [],
    entregas_esperadas: [],
    frequencia_monitoramento: 'mensal'
  });

  const [progressForm, setProgressForm] = useState({
    percentual_conclusao: 0,
    observacoes: '',
    marcos_atingidos: '',
    proximas_atividades: ''
  });

  useEffect(() => {
    if (effectiveTenantId) {
      loadData();
    }
  }, [effectiveTenantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadActionPlans(),
        loadNonConformities(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadActionPlans = async () => {
    const { data, error } = await supabase
      .from('planos_acao_conformidade')
      .select(`
        *,
        responsavel_profile:profiles!planos_acao_conformidade_responsavel_execucao_fkey(full_name),
        aprovador_profile:profiles!planos_acao_conformidade_responsavel_aprovacao_fkey(full_name),
        monitor_profile:profiles!planos_acao_conformidade_responsavel_monitoramento_fkey(full_name),
        nao_conformidades!inner(titulo)
      `)
      .eq('tenant_id', effectiveTenantId)
      .order('data_fim_planejada');

    if (error) throw error;

    const processedPlans = data?.map(plan => ({
      ...plan,
      responsavel_nome: plan.responsavel_profile?.full_name || 'Não atribuído',
      aprovador_nome: plan.aprovador_profile?.full_name || 'Não atribuído',
      monitor_nome: plan.monitor_profile?.full_name || 'Não atribuído',
      nao_conformidade_titulo: plan.nao_conformidades?.titulo || 'N/A',
      recursos_necessarios: plan.recursos_necessarios || [],
      dependencias: plan.dependencias || [],
      marcos_principais: plan.marcos_principais || [],
      entregas_esperadas: plan.entregas_esperadas || [],
      evidencias_efetividade: plan.evidencias_efetividade || []
    })) || [];

    setActionPlans(processedPlans);
  };

  const loadNonConformities = async () => {
    const { data, error } = await supabase
      .from('nao_conformidades')
      .select('id, codigo, titulo')
      .eq('tenant_id', effectiveTenantId)
      .in('status', ['aberta', 'em_tratamento']);

    if (error) throw error;
    setNonConformities(data || []);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('tenant_id', effectiveTenantId)
      .order('full_name');

    if (error) throw error;
    setUsers(data || []);
  };

  const generateNextCode = () => {
    const year = new Date().getFullYear();
    const count = actionPlans.length + 1;
    return `PA-${year}-${count.toString().padStart(3, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        tenant_id: effectiveTenantId,
        codigo: formData.codigo || generateNextCode(),
        status: 'planejada',
        percentual_conclusao: 0,
        created_by: user?.id,
        updated_by: user?.id
      };

      let error;
      if (editingPlan) {
        const { error: updateError } = await supabase
          .from('planos_acao_conformidade')
          .update(payload)
          .eq('id', editingPlan.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('planos_acao_conformidade')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingPlan ? 'Plano de ação atualizado!' : 'Plano de ação criado!');
      setDialogOpen(false);
      resetForm();
      loadActionPlans();
    } catch (error) {
      console.error('Erro ao salvar plano de ação:', error);
      toast.error('Erro ao salvar plano de ação');
    }
  };

  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) return;

    try {
      const { error } = await supabase
        .from('planos_acao_conformidade')
        .update({
          percentual_conclusao: progressForm.percentual_conclusao,
          updated_by: user?.id
        })
        .eq('id', selectedPlan.id);

      if (error) throw error;

      toast.success('Progresso atualizado!');
      setProgressDialogOpen(false);
      loadActionPlans();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast.error('Erro ao atualizar progresso');
    }
  };

  const handleStatusChange = async (planId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_by: user?.id
      };

      // Se marcando como concluída, definir data de conclusão
      if (newStatus === 'concluida') {
        updateData.data_fim_real = new Date().toISOString().split('T')[0];
        updateData.percentual_conclusao = 100;
      }

      const { error } = await supabase
        .from('planos_acao_conformidade')
        .update(updateData)
        .eq('id', planId);

      if (error) throw error;

      toast.success('Status atualizado!');
      loadActionPlans();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleEdit = (plan: ActionPlan) => {
    setEditingPlan(plan);
    setFormData({
      codigo: plan.codigo,
      titulo: plan.titulo,
      descricao_acao: plan.descricao_acao,
      nao_conformidade_id: plan.nao_conformidade_id,
      tipo_acao: plan.tipo_acao,
      categoria_acao: plan.categoria_acao,
      causa_raiz_endereçada: plan.causa_raiz_endereçada || '',
      objetivo_acao: plan.objetivo_acao,
      resultados_esperados: plan.resultados_esperados || '',
      responsavel_execucao: plan.responsavel_execucao,
      responsavel_aprovacao: plan.responsavel_aprovacao || '',
      responsavel_monitoramento: plan.responsavel_monitoramento || '',
      data_inicio_planejada: plan.data_inicio_planejada,
      data_fim_planejada: plan.data_fim_planejada,
      orcamento_estimado: plan.orcamento_estimado || 0,
      recursos_necessarios: plan.recursos_necessarios,
      dependencias: plan.dependencias,
      entregas_esperadas: plan.entregas_esperadas,
      frequencia_monitoramento: plan.frequencia_monitoramento
    });
    setDialogOpen(true);
  };

  const handleViewDetails = (plan: ActionPlan) => {
    setSelectedPlan(plan);
    setDetailsDialogOpen(true);
  };

  const handleUpdateProgress = (plan: ActionPlan) => {
    setSelectedPlan(plan);
    setProgressForm({
      percentual_conclusao: plan.percentual_conclusao,
      observacoes: '',
      marcos_atingidos: '',
      proximas_atividades: ''
    });
    setProgressDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      codigo: '',
      titulo: '',
      descricao_acao: '',
      nao_conformidade_id: '',
      tipo_acao: '',
      categoria_acao: '',
      causa_raiz_endereçada: '',
      objetivo_acao: '',
      resultados_esperados: '',
      responsavel_execucao: '',
      responsavel_aprovacao: '',
      responsavel_monitoramento: '',
      data_inicio_planejada: '',
      data_fim_planejada: '',
      orcamento_estimado: 0,
      recursos_necessarios: [],
      dependencias: [],
      entregas_esperadas: [],
      frequencia_monitoramento: 'mensal'
    });
    setEditingPlan(null);
  };

  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const getTipoColor = (tipo: string) => {
    const tipoInfo = TIPOS_ACAO.find(t => t.value === tipo);
    return tipoInfo?.color || 'bg-gray-100 text-gray-800';
  };

  const getDaysToDeadline = (dataFim: string) => {
    const deadline = new Date(dataFim);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredActionPlans = actionPlans.filter(plan => {
    const matchesSearch = plan.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.responsavel_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || plan.status === filterStatus;
    const matchesTipo = !filterTipo || plan.tipo_acao === filterTipo;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

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
          <h2 className="text-2xl font-bold">Planos de Ação</h2>
          <p className="text-muted-foreground">Gestão de planos de ação corretiva e preventiva</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano de Ação
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
              </DialogTitle>
              <DialogDescription>
                Configure um plano de ação para tratar não conformidades
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="planning">Planejamento</TabsTrigger>
                  <TabsTrigger value="resources">Recursos</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="codigo">Código</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                        placeholder="Será gerado automaticamente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nao_conformidade_id">Não Conformidade*</Label>
                      <Select value={formData.nao_conformidade_id} onValueChange={(value) => setFormData(prev => ({ ...prev, nao_conformidade_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a não conformidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {nonConformities.map(nc => (
                            <SelectItem key={nc.id} value={nc.id}>
                              {nc.codigo} - {nc.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="titulo">Título do Plano de Ação*</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Resumo do plano de ação"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao_acao">Descrição da Ação*</Label>
                    <Textarea
                      id="descricao_acao"
                      value={formData.descricao_acao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao_acao: e.target.value }))}
                      placeholder="Descreva detalhadamente as ações a serem executadas"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tipo_acao">Tipo de Ação*</Label>
                      <Select value={formData.tipo_acao} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_acao: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_ACAO.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="categoria_acao">Categoria*</Label>
                      <Select value={formData.categoria_acao} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_acao: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS_ACAO.map(categoria => (
                            <SelectItem key={categoria} value={categoria}>
                              {categoria}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="planning" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="causa_raiz_endereçada">Causa Raiz Endereçada</Label>
                    <Textarea
                      id="causa_raiz_endereçada"
                      value={formData.causa_raiz_endereçada}
                      onChange={(e) => setFormData(prev => ({ ...prev, causa_raiz_endereçada: e.target.value }))}
                      placeholder="Qual causa raiz será tratada por este plano"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="objetivo_acao">Objetivo da Ação*</Label>
                    <Textarea
                      id="objetivo_acao"
                      value={formData.objetivo_acao}
                      onChange={(e) => setFormData(prev => ({ ...prev, objetivo_acao: e.target.value }))}
                      placeholder="Qual o objetivo a ser alcançado"
                      rows={2}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="resultados_esperados">Resultados Esperados</Label>
                    <Textarea
                      id="resultados_esperados"
                      value={formData.resultados_esperados}
                      onChange={(e) => setFormData(prev => ({ ...prev, resultados_esperados: e.target.value }))}
                      placeholder="Quais resultados são esperados"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="data_inicio_planejada">Data Início Planejada*</Label>
                      <Input
                        id="data_inicio_planejada"
                        type="date"
                        value={formData.data_inicio_planejada}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_inicio_planejada: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_fim_planejada">Data Fim Planejada*</Label>
                      <Input
                        id="data_fim_planejada"
                        type="date"
                        value={formData.data_fim_planejada}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_fim_planejada: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="resources" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="responsavel_execucao">Responsável pela Execução*</Label>
                    <Select value={formData.responsavel_execucao} onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_execucao: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="responsavel_aprovacao">Responsável pela Aprovação</Label>
                      <Select value={formData.responsavel_aprovacao} onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_aprovacao: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o aprovador" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="responsavel_monitoramento">Responsável pelo Monitoramento</Label>
                      <Select value={formData.responsavel_monitoramento} onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_monitoramento: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o monitor" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="orcamento_estimado">Orçamento Estimado (R$)</Label>
                    <Input
                      id="orcamento_estimado"
                      type="number"
                      step="0.01"
                      value={formData.orcamento_estimado}
                      onChange={(e) => setFormData(prev => ({ ...prev, orcamento_estimado: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="recursos_necessarios">Recursos Necessários (separados por vírgula)</Label>
                    <Textarea
                      id="recursos_necessarios"
                      value={formData.recursos_necessarios.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        recursos_necessarios: e.target.value.split(',').map(r => r.trim()).filter(Boolean)
                      }))}
                      placeholder="Recursos humanos, tecnológicos, financeiros..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dependencias">Dependências (separadas por vírgula)</Label>
                    <Textarea
                      id="dependencias"
                      value={formData.dependencias.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dependencias: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                      }))}
                      placeholder="Dependências externas, aprovações, outros projetos..."
                      rows={2}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="monitoring" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="frequencia_monitoramento">Frequência de Monitoramento</Label>
                    <Select value={formData.frequencia_monitoramento} onValueChange={(value) => setFormData(prev => ({ ...prev, frequencia_monitoramento: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIAS_MONITORAMENTO.map(freq => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="entregas_esperadas">Entregas Esperadas (separadas por vírgula)</Label>
                    <Textarea
                      id="entregas_esperadas"
                      value={formData.entregas_esperadas.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        entregas_esperadas: e.target.value.split(',').map(e => e.trim()).filter(Boolean)
                      }))}
                      placeholder="Documentos, treinamentos, implementações..."
                      rows={2}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar planos de ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_OPTIONS.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {TIPOS_ACAO.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Planos de Ação */}
      <div className="space-y-4">
        {filteredActionPlans.map(plan => {
          const statusInfo = getStatusInfo(plan.status);
          const StatusIcon = statusInfo.icon;
          const daysToDeadline = getDaysToDeadline(plan.data_fim_planejada);
          const isOverdue = daysToDeadline < 0;
          const isUrgent = daysToDeadline <= 7 && daysToDeadline >= 0;
          
          return (
            <Card key={plan.id} className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200' : isUrgent ? 'border-yellow-200' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-muted-foreground">{plan.codigo}</span>
                      <Badge className={getTipoColor(plan.tipo_acao)}>
                        {TIPOS_ACAO.find(t => t.value === plan.tipo_acao)?.label}
                      </Badge>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">{plan.titulo}</CardTitle>
                    <CardDescription className="mt-1">
                      {plan.nao_conformidade_titulo}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progresso */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-bold">{plan.percentual_conclusao}%</span>
                  </div>
                  <Progress value={plan.percentual_conclusao} className="h-2" />
                </div>
                
                {/* Informações principais */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.responsavel_nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(plan.data_fim_planejada).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{plan.categoria_acao}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>R$ {(plan.orcamento_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                
                {/* Status do prazo */}
                <div className={`flex items-center gap-2 text-sm ${
                  isOverdue ? 'text-red-600' : isUrgent ? 'text-yellow-600' : 'text-muted-foreground'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span>
                    {isOverdue 
                      ? `${Math.abs(daysToDeadline)} dias atrasado`
                      : daysToDeadline === 0
                      ? 'Vence hoje'
                      : `${daysToDeadline} dias restantes`
                    }
                  </span>
                </div>
                
                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(plan)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Detalhes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateProgress(plan)}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Progresso
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  {plan.status === 'planejada' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(plan.id, 'aprovada')}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  
                  {plan.status === 'aprovada' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(plan.id, 'em_execucao')}>
                      <PlayCircle className="h-3 w-3 mr-1" />
                      Iniciar
                    </Button>
                  )}
                  
                  {plan.status === 'em_execucao' && plan.percentual_conclusao >= 100 && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(plan.id, 'concluida')}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {filteredActionPlans.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterStatus || filterTipo 
                ? 'Nenhum plano de ação encontrado com os filtros aplicados.'
                : 'Nenhum plano de ação criado ainda.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Detalhes */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Plano de Ação</DialogTitle>
            <DialogDescription>
              {selectedPlan?.codigo} - {selectedPlan?.titulo}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="execution">Execução</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Tipo de Ação</Label>
                      <p className="text-sm text-muted-foreground">{TIPOS_ACAO.find(t => t.value === selectedPlan.tipo_acao)?.label}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Categoria</Label>
                      <p className="text-sm text-muted-foreground">{selectedPlan.categoria_acao}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getStatusInfo(selectedPlan.status).color}>
                        {getStatusInfo(selectedPlan.status).label}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Progresso</Label>
                      <div className="flex items-center gap-2">
                        <Progress value={selectedPlan.percentual_conclusao} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{selectedPlan.percentual_conclusao}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Descrição da Ação</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedPlan.descricao_acao}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Objetivo</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedPlan.objetivo_acao}</p>
                  </div>
                  
                  {selectedPlan.causa_raiz_endereçada && (
                    <div>
                      <Label className="text-sm font-medium">Causa Raiz Endereçada</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedPlan.causa_raiz_endereçada}</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="execution" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Responsável Execução</Label>
                      <p className="text-sm text-muted-foreground">{selectedPlan.responsavel_nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Responsável Aprovação</Label>
                      <p className="text-sm text-muted-foreground">{selectedPlan.aprovador_nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Data Início Planejada</Label>
                      <p className="text-sm text-muted-foreground">{new Date(selectedPlan.data_inicio_planejada).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Data Fim Planejada</Label>
                      <p className="text-sm text-muted-foreground">{new Date(selectedPlan.data_fim_planejada).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Orçamento Estimado</Label>
                    <p className="text-sm text-muted-foreground">R$ {(selectedPlan.orcamento_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  
                  {selectedPlan.recursos_necessarios.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Recursos Necessários</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPlan.recursos_necessarios.map(recurso => (
                          <Badge key={recurso} variant="secondary" className="text-xs">
                            {recurso}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedPlan.dependencias.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Dependências</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPlan.dependencias.map(dependencia => (
                          <Badge key={dependencia} variant="outline" className="text-xs">
                            {dependencia}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="monitoring" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Responsável Monitoramento</Label>
                      <p className="text-sm text-muted-foreground">{selectedPlan.monitor_nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Frequência Monitoramento</Label>
                      <p className="text-sm text-muted-foreground">
                        {FREQUENCIAS_MONITORAMENTO.find(f => f.value === selectedPlan.frequencia_monitoramento)?.label}
                      </p>
                    </div>
                  </div>
                  
                  {selectedPlan.entregas_esperadas.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Entregas Esperadas</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPlan.entregas_esperadas.map(entrega => (
                          <Badge key={entrega} variant="secondary" className="text-xs">
                            {entrega}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedPlan.efetividade_confirmada !== null && (
                    <div>
                      <Label className="text-sm font-medium">Efetividade Confirmada</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedPlan.efetividade_confirmada ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmada
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Atualização de Progresso */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Atualizar Progresso</DialogTitle>
            <DialogDescription>
              {selectedPlan?.codigo} - {selectedPlan?.titulo}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleProgressUpdate} className="space-y-4">
            <div>
              <Label htmlFor="percentual_conclusao">Percentual de Conclusão (%)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Input
                  id="percentual_conclusao"
                  type="number"
                  min="0"
                  max="100"
                  value={progressForm.percentual_conclusao}
                  onChange={(e) => setProgressForm(prev => ({ ...prev, percentual_conclusao: parseInt(e.target.value) || 0 }))}
                  className="w-20"
                />
                <Progress value={progressForm.percentual_conclusao} className="flex-1" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="observacoes">Observações sobre o Progresso</Label>
              <Textarea
                id="observacoes"
                value={progressForm.observacoes}
                onChange={(e) => setProgressForm(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Descreva o progresso realizado, marcos atingidos, etc."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setProgressDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                <TrendingUp className="h-4 w-4 mr-2" />
                Atualizar Progresso
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ActionPlansManagement;