import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  FileText,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Função helper para formatar datas corretamente (evita problemas de fuso horário)
const formatDateSafe = (dateString: string) => {
  if (!dateString) return 'Não definido';
  
  // Se a data já está no formato correto (YYYY-MM-DD), parse manualmente
  const dateParts = dateString.split('T')[0].split('-'); // Remove hora se existir e pega apenas a data
  if (dateParts.length === 3) {
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // JavaScript months são 0-indexed
    const day = parseInt(dateParts[2]);
    return new Date(year, month, day).toLocaleDateString('pt-BR');
  }
  
  // Fallback para outros formatos
  return new Date(dateString).toLocaleDateString('pt-BR');
};

interface ActionPlan {
  id?: string;
  tenant_id: string;
  projeto_id: string;
  apontamento_id?: string;
  codigo: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  area_responsavel?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'pendente' | 'em_andamento' | 'concluido' | 'verificado' | 'atrasado';
  data_inicio_planejada?: string;
  data_fim_planejada?: string;
  prazo_implementacao?: string;
  data_inicio_real?: string;
  data_conclusao_real?: string;
  progresso: number;
  marcos?: string[];
  observacoes?: string;
  custo_estimado?: number;
  recursos_necessarios?: string[];
  evidencias_implementacao?: string[];
  created_at?: string;
  updated_at?: string;
}

interface ActionPlanManagerProps {
  project: any;
  onUpdate?: () => void;
}

export function ActionPlanManager({ project, onUpdate }: ActionPlanManagerProps) {
  const { user } = useAuth();
  const selectedTenantId = useCurrentTenantId();
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<ActionPlan | null>(null);

  const [formData, setFormData] = useState<Partial<ActionPlan>>({
    tenant_id: effectiveTenantId || '',
    projeto_id: project.id,
    codigo: '',
    titulo: '',
    descricao: '',
    responsavel: '',
    area_responsavel: '',
    prioridade: 'media',
    status: 'pendente',
    progresso: 0,
    custo_estimado: 0,
    observacoes: '',
    marcos: [],
    recursos_necessarios: [],
    evidencias_implementacao: []
  });

  useEffect(() => {
    loadActionPlans();
  }, [project.id]);

  const loadActionPlans = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('planos_acao')
        .select('*')
        .eq('projeto_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActionPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos de ação:', error);
      toast.error('Erro ao carregar planos de ação');
    } finally {
      setLoading(false);
    }
  };

  const generateNextCode = () => {
    const existingCodes = actionPlans.map(plan => plan.codigo);
    let nextNumber = 1;
    
    while (existingCodes.includes(`PA-${String(nextNumber).padStart(3, '0')}`)) {
      nextNumber++;
    }
    
    return `PA-${String(nextNumber).padStart(3, '0')}`;
  };

  const handleSave = async () => {
    try {
      if (!formData.titulo || !formData.descricao || !formData.responsavel) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const planData = {
        ...formData,
        codigo: formData.codigo || generateNextCode(),
        tenant_id: effectiveTenantId,
        projeto_id: project.id,
        updated_at: new Date().toISOString()
      };

      if (editingPlan) {
        // Atualizar plano existente
        const { error } = await supabase
          .from('planos_acao')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Plano de ação atualizado com sucesso!');
      } else {
        // Criar novo plano
        const { error } = await supabase
          .from('planos_acao')
          .insert([planData]);

        if (error) throw error;
        toast.success('Plano de ação criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingPlan(null);
      resetForm();
      loadActionPlans();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao salvar plano de ação:', error);
      toast.error('Erro ao salvar plano de ação');
    }
  };

  const handleEdit = (plan: ActionPlan) => {
    setEditingPlan(plan);
    setFormData({
      ...plan,
      marcos: plan.marcos || [],
      recursos_necessarios: plan.recursos_necessarios || [],
      evidencias_implementacao: plan.evidencias_implementacao || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano de ação?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('planos_acao')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast.success('Plano de ação excluído com sucesso!');
      loadActionPlans();
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao excluir plano de ação:', error);
      toast.error('Erro ao excluir plano de ação');
    }
  };

  const handleView = (plan: ActionPlan) => {
    setViewingPlan(plan);
    setViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      tenant_id: effectiveTenantId || '',
      projeto_id: project.id,
      codigo: '',
      titulo: '',
      descricao: '',
      responsavel: '',
      area_responsavel: '',
      prioridade: 'media',
      status: 'pendente',
      progresso: 0,
      custo_estimado: 0,
      observacoes: '',
      marcos: [],
      recursos_necessarios: [],
      evidencias_implementacao: []
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pendente: 'bg-gray-100 text-gray-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      concluido: 'bg-green-100 text-green-800',
      verificado: 'bg-emerald-100 text-emerald-800',
      atrasado: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pendente: Clock,
      em_andamento: TrendingUp,
      concluido: CheckCircle,
      verificado: Target,
      atrasado: AlertTriangle
    };
    return icons[status] || Clock;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Planos de Ação</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os planos de ação para implementação das recomendações
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingPlan(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano de Ação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo || ''}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="PA-001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo || ''}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Título do plano de ação"
                  />
                </div>
                
                <div>
                  <Label htmlFor="responsavel">Responsável *</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel || ''}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do responsável"
                  />
                </div>
                
                <div>
                  <Label htmlFor="area_responsavel">Área Responsável</Label>
                  <Input
                    id="area_responsavel"
                    value={formData.area_responsavel || ''}
                    onChange={(e) => setFormData({ ...formData, area_responsavel: e.target.value })}
                    placeholder="Área ou departamento"
                  />
                </div>
                
                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select 
                    value={formData.prioridade} 
                    onValueChange={(value) => setFormData({ ...formData, prioridade: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="verificado">Verificado</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="progresso">Progresso (%)</Label>
                  <Input
                    id="progresso"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progresso || 0}
                    onChange={(e) => setFormData({ ...formData, progresso: parseInt(e.target.value) || 0 })}
                  />
                  <Progress value={formData.progresso || 0} className="mt-2" />
                </div>
                
                <div>
                  <Label htmlFor="custo_estimado">Custo Estimado (R$)</Label>
                  <Input
                    id="custo_estimado"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.custo_estimado || 0}
                    onChange={(e) => setFormData({ ...formData, custo_estimado: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_inicio_planejada">Data Início Planejada</Label>
                  <Input
                    id="data_inicio_planejada"
                    type="date"
                    value={formData.data_inicio_planejada || ''}
                    onChange={(e) => setFormData({ ...formData, data_inicio_planejada: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_fim_planejada">Data Fim Planejada</Label>
                  <Input
                    id="data_fim_planejada"
                    type="date"
                    value={formData.data_fim_planejada || ''}
                    onChange={(e) => setFormData({ ...formData, data_fim_planejada: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="prazo_implementacao">Prazo de Implementação</Label>
                  <Input
                    id="prazo_implementacao"
                    type="date"
                    value={formData.prazo_implementacao || ''}
                    onChange={(e) => setFormData({ ...formData, prazo_implementacao: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição detalhada do plano de ação"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais"
                  rows={2}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingPlan ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Planos de Ação */}
      <div className="space-y-4">
        {actionPlans.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum plano de ação criado</h3>
              <p className="text-muted-foreground">
                Crie o primeiro plano de ação para acompanhar a implementação das recomendações.
              </p>
              <Button className="mt-4" onClick={() => { resetForm(); setEditingPlan(null); setDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Plano de Ação
              </Button>
            </CardContent>
          </Card>
        ) : (
          actionPlans.map((plan) => {
            const StatusIcon = getStatusIcon(plan.status);
            
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <StatusIcon className={`h-5 w-5 mt-1 ${
                        plan.status === 'concluido' || plan.status === 'verificado' ? 'text-green-600' :
                        plan.status === 'atrasado' ? 'text-red-600' :
                        plan.status === 'em_andamento' ? 'text-blue-600' :
                        'text-gray-600'
                      }`} />
                      <div>
                        <CardTitle className="text-base">{plan.codigo}</CardTitle>
                        <CardDescription className="font-medium">{plan.titulo}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(plan.prioridade)}>
                        {plan.prioridade}
                      </Badge>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {plan.descricao}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Responsável</p>
                        <p className="font-medium">{plan.responsavel}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prazo</p>
                        <p className="font-medium">
                          {formatDateSafe(plan.prazo_implementacao)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progresso</p>
                        <div className="flex items-center gap-2">
                          <Progress value={plan.progresso || 0} className="flex-1 h-2" />
                          <span className="text-xs">{plan.progresso || 0}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Custo</p>
                        <p className="font-medium">
                          {plan.custo_estimado ? 
                            `R$ ${plan.custo_estimado.toLocaleString('pt-BR')}` : 
                            'Não informado'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(plan)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(plan.id!)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Plano de Ação</DialogTitle>
          </DialogHeader>
          
          {viewingPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Código</Label>
                  <p className="font-medium">{viewingPlan.codigo}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(viewingPlan.status)}>
                    {viewingPlan.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label>Título</Label>
                <p className="font-medium">{viewingPlan.titulo}</p>
              </div>
              
              <div>
                <Label>Descrição</Label>
                <p className="text-sm">{viewingPlan.descricao}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Responsável</Label>
                  <p className="font-medium">{viewingPlan.responsavel}</p>
                </div>
                <div>
                  <Label>Área Responsável</Label>
                  <p className="font-medium">{viewingPlan.area_responsavel || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Badge className={getPriorityColor(viewingPlan.prioridade)}>
                    {viewingPlan.prioridade}
                  </Badge>
                </div>
                <div>
                  <Label>Progresso</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={viewingPlan.progresso || 0} className="flex-1" />
                    <span className="text-sm">{viewingPlan.progresso || 0}%</span>
                  </div>
                </div>
                <div>
                  <Label>Custo Estimado</Label>
                  <p className="font-medium">
                    {viewingPlan.custo_estimado ? 
                      `R$ ${viewingPlan.custo_estimado.toLocaleString('pt-BR')}` : 
                      'Não informado'
                    }
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data Início Planejada</Label>
                  <p className="font-medium">
                    {viewingPlan.data_inicio_planejada ? 
                      formatDateSafe(viewingPlan.data_inicio_planejada) : 
                      'Não definida'
                    }
                  </p>
                </div>
                <div>
                  <Label>Prazo de Implementação</Label>
                  <p className="font-medium">
                    {viewingPlan.prazo_implementacao ? 
                      formatDateSafe(viewingPlan.prazo_implementacao) : 
                      'Não definido'
                    }
                  </p>
                </div>
              </div>
              
              {viewingPlan.observacoes && (
                <div>
                  <Label>Observações</Label>
                  <p className="text-sm">{viewingPlan.observacoes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}