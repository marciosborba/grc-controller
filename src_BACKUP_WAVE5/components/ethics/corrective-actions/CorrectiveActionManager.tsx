import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Plus,
  Edit,
  Save,
  X,
  BookOpen,
  Settings,
  Users,
  Shield,
  Award,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

interface CorrectiveAction {
  id: string;
  ethics_report_id: string;
  action_type: string;
  action_category: string;
  action_title: string;
  action_description: string;
  target_individual?: string;
  target_department?: string;
  target_process?: string;
  responsible_party_id: string;
  assigned_to_id?: string;
  priority: string;
  due_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  status: string;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
  started_date?: string;
  completed_date?: string;
  effectiveness_measure?: string;
  success_criteria?: string;
  verification_method?: string;
  verification_date?: string;
  verified_by?: string;
  effectiveness_rating?: number;
  lessons_learned?: string;
  recommendations?: string;
  related_policies: string[];
  related_training: string[];
  communication_plan?: string;
  monitoring_plan?: string;
  created_at: string;
  updated_at: string;
}

interface CorrectiveActionManagerProps {
  reportId?: string;
  onUpdate?: () => void;
}

const CorrectiveActionManager: React.FC<CorrectiveActionManagerProps> = ({
  reportId,
  onUpdate
}) => {
  const { user } = useAuth();
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CorrectiveAction | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CorrectiveAction>>({
    action_type: 'corrective',
    action_category: 'corrective',
    priority: 'medium',
    status: 'planned',
    approval_required: true,
    related_policies: [],
    related_training: []
  });

  useEffect(() => {
    if (user && (user.tenantId || user.isPlatformAdmin)) {
      fetchCorrectiveActions();
    }
  }, [reportId, user]);

  const fetchCorrectiveActions = async () => {
    if (!user?.tenantId && !user?.isPlatformAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('ethics_corrective_actions')
        .select('*, ethics_reports(title, protocol_number)');

      if (reportId) {
        query = query.eq('ethics_report_id', reportId);
      } else if (!user.isPlatformAdmin && user.tenantId) {
        query = query.eq('tenant_id', user.tenantId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error fetching corrective actions:', error);
      toast.error('Erro ao carregar ações corretivas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.action_title || !formData.action_description) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const actionData = {
        ...formData,
        ethics_report_id: reportId,
        tenant_id: user?.tenantId,
        responsible_party_id: formData.responsible_party_id || user?.id,
        updated_at: new Date().toISOString()
      };

      if (editingAction) {
        const { error } = await supabase
          .from('ethics_corrective_actions')
          .update(actionData)
          .eq('id', editingAction.id);

        if (error) throw error;
        toast.success('Ação corretiva atualizada com sucesso');
      } else {
        const { error } = await supabase
          .from('ethics_corrective_actions')
          .insert(actionData);

        if (error) throw error;
        toast.success('Ação corretiva criada com sucesso');
      }

      setIsCreateDialogOpen(false);
      setEditingAction(null);
      setFormData({
        action_type: 'corrective',
        action_category: 'corrective',
        priority: 'medium',
        status: 'planned',
        approval_required: true,
        related_policies: [],
        related_training: []
      });
      fetchCorrectiveActions();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving corrective action:', error);
      toast.error('Erro ao salvar ação corretiva');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from('ethics_corrective_actions')
        .delete()
        .eq('id', itemToDelete);

      if (error) throw error;

      toast.success('Ação corretiva excluída com sucesso');
      fetchCorrectiveActions();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting corrective action:', error);
      toast.error('Erro ao excluir ação corretiva');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleEdit = (action: CorrectiveAction) => {
    setEditingAction(action);
    setFormData(action);
    setIsCreateDialogOpen(true);
  };

  const updateActionStatus = async (actionId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'in_progress' && !actions.find(a => a.id === actionId)?.started_date) {
        updateData.started_date = new Date().toISOString().split('T')[0];
      }

      if (newStatus === 'completed') {
        updateData.completed_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('ethics_corrective_actions')
        .update(updateData)
        .eq('id', actionId);

      if (error) throw error;

      toast.success('Status da ação atualizado');
      fetchCorrectiveActions();
    } catch (error) {
      console.error('Error updating action status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const getActionTypeIcon = (type: string) => {
    const icons = {
      'disciplinary': <Shield className="h-4 w-4" />,
      'training': <BookOpen className="h-4 w-4" />,
      'policy_change': <Settings className="h-4 w-4" />,
      'process_improvement': <TrendingUp className="h-4 w-4" />,
      'system_change': <Settings className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <CheckCircle className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'planned': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      'approved': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      'in_progress': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300',
      'completed': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
      'cancelled': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      'overdue': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'critical': 'bg-red-500',
      'high': 'bg-orange-500',
      'medium': 'bg-yellow-500',
      'low': 'bg-blue-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  const getCompletionPercentage = () => {
    if (actions.length === 0) return 0;
    const completed = actions.filter(a => a.status === 'completed').length;
    return Math.round((completed / actions.length) * 100);
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando ações corretivas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Ações Corretivas</h3>
        </div>
        <div className="flex items-center gap-4">
          {actions.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span>Progresso:</span>
              <div className="w-20">
                <Progress value={getCompletionPercentage()} className="h-2" />
              </div>
              <span>{getCompletionPercentage()}%</span>
            </div>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Ação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAction ? 'Editar Ação Corretiva' : 'Nova Ação Corretiva'}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="planning">Planejamento</TabsTrigger>
                  <TabsTrigger value="execution">Execução</TabsTrigger>
                  <TabsTrigger value="verification">Verificação</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="action_type">Tipo de Ação</Label>
                      <Select
                        value={formData.action_type}
                        onValueChange={(value) => setFormData({ ...formData, action_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disciplinary">Disciplinar</SelectItem>
                          <SelectItem value="training">Treinamento</SelectItem>
                          <SelectItem value="policy_change">Mudança de Política</SelectItem>
                          <SelectItem value="process_improvement">Melhoria de Processo</SelectItem>
                          <SelectItem value="system_change">Mudança de Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="action_category">Categoria</Label>
                      <Select
                        value={formData.action_category}
                        onValueChange={(value) => setFormData({ ...formData, action_category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="preventive">Preventiva</SelectItem>
                          <SelectItem value="corrective">Corretiva</SelectItem>
                          <SelectItem value="punitive">Punitiva</SelectItem>
                          <SelectItem value="remedial">Remedial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Crítica</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="low">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planejada</SelectItem>
                          <SelectItem value="approved">Aprovada</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="action_title">Título da Ação *</Label>
                    <Input
                      id="action_title"
                      value={formData.action_title}
                      onChange={(e) => setFormData({ ...formData, action_title: e.target.value })}
                      placeholder="Título conciso da ação corretiva"
                    />
                  </div>

                  <div>
                    <Label htmlFor="action_description">Descrição da Ação *</Label>
                    <Textarea
                      id="action_description"
                      value={formData.action_description}
                      onChange={(e) => setFormData({ ...formData, action_description: e.target.value })}
                      rows={4}
                      placeholder="Descrição detalhada da ação a ser implementada..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="target_individual">Indivíduo Alvo</Label>
                      <Input
                        id="target_individual"
                        value={formData.target_individual}
                        onChange={(e) => setFormData({ ...formData, target_individual: e.target.value })}
                        placeholder="Nome da pessoa (se aplicável)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="target_department">Departamento Alvo</Label>
                      <Input
                        id="target_department"
                        value={formData.target_department}
                        onChange={(e) => setFormData({ ...formData, target_department: e.target.value })}
                        placeholder="Departamento afetado"
                      />
                    </div>

                    <div>
                      <Label htmlFor="target_process">Processo Alvo</Label>
                      <Input
                        id="target_process"
                        value={formData.target_process}
                        onChange={(e) => setFormData({ ...formData, target_process: e.target.value })}
                        placeholder="Processo a ser alterado"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="planning" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="due_date">Data de Vencimento</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="approval_required"
                        checked={formData.approval_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, approval_required: checked as boolean })}
                      />
                      <Label htmlFor="approval_required">Requer Aprovação</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimated_cost">Custo Estimado (R$)</Label>
                      <Input
                        id="estimated_cost"
                        type="number"
                        step="0.01"
                        value={formData.estimated_cost}
                        onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="actual_cost">Custo Real (R$)</Label>
                      <Input
                        id="actual_cost"
                        type="number"
                        step="0.01"
                        value={formData.actual_cost}
                        onChange={(e) => setFormData({ ...formData, actual_cost: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="communication_plan">Plano de Comunicação</Label>
                    <Textarea
                      id="communication_plan"
                      value={formData.communication_plan}
                      onChange={(e) => setFormData({ ...formData, communication_plan: e.target.value })}
                      rows={3}
                      placeholder="Como a ação será comunicada aos stakeholders..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="monitoring_plan">Plano de Monitoramento</Label>
                    <Textarea
                      id="monitoring_plan"
                      value={formData.monitoring_plan}
                      onChange={(e) => setFormData({ ...formData, monitoring_plan: e.target.value })}
                      rows={3}
                      placeholder="Como o progresso será monitorado..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="execution" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="started_date">Data de Início</Label>
                      <Input
                        id="started_date"
                        type="date"
                        value={formData.started_date}
                        onChange={(e) => setFormData({ ...formData, started_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="completed_date">Data de Conclusão</Label>
                      <Input
                        id="completed_date"
                        type="date"
                        value={formData.completed_date}
                        onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="success_criteria">Critérios de Sucesso</Label>
                    <Textarea
                      id="success_criteria"
                      value={formData.success_criteria}
                      onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                      rows={3}
                      placeholder="Como será medido o sucesso desta ação..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="effectiveness_measure">Medidas de Eficácia</Label>
                    <Textarea
                      id="effectiveness_measure"
                      value={formData.effectiveness_measure}
                      onChange={(e) => setFormData({ ...formData, effectiveness_measure: e.target.value })}
                      rows={3}
                      placeholder="Métricas para avaliar a eficácia da ação..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="verification" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="verification_date">Data de Verificação</Label>
                      <Input
                        id="verification_date"
                        type="date"
                        value={formData.verification_date}
                        onChange={(e) => setFormData({ ...formData, verification_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="effectiveness_rating">Classificação de Eficácia (1-5)</Label>
                      <Select
                        value={formData.effectiveness_rating?.toString()}
                        onValueChange={(value) => setFormData({ ...formData, effectiveness_rating: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Ineficaz</SelectItem>
                          <SelectItem value="2">2 - Pouco Eficaz</SelectItem>
                          <SelectItem value="3">3 - Moderadamente Eficaz</SelectItem>
                          <SelectItem value="4">4 - Eficaz</SelectItem>
                          <SelectItem value="5">5 - Altamente Eficaz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="verification_method">Método de Verificação</Label>
                    <Textarea
                      id="verification_method"
                      value={formData.verification_method}
                      onChange={(e) => setFormData({ ...formData, verification_method: e.target.value })}
                      rows={3}
                      placeholder="Como a eficácia será verificada..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="lessons_learned">Lições Aprendidas</Label>
                    <Textarea
                      id="lessons_learned"
                      value={formData.lessons_learned}
                      onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                      rows={3}
                      placeholder="O que foi aprendido durante a implementação..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="recommendations">Recomendações</Label>
                    <Textarea
                      id="recommendations"
                      value={formData.recommendations}
                      onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      rows={3}
                      placeholder="Recomendações para ações futuras..."
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Ação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {actions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma ação corretiva definida ainda.</p>
            <p>Clique em "Nova Ação" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getActionTypeIcon(action.action_type)}
                    <div>
                      <CardTitle className="text-lg">{action.action_title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.action_type === 'disciplinary' ? 'Ação Disciplinar' :
                          action.action_type === 'training' ? 'Treinamento' :
                            action.action_type === 'policy_change' ? 'Mudança de Política' :
                              action.action_type === 'process_improvement' ? 'Melhoria de Processo' :
                                action.action_type === 'system_change' ? 'Mudança de Sistema' :
                                  action.action_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getPriorityColor(action.priority)}`}
                      title={`Prioridade ${action.priority}`}
                    />
                    <Badge className={`text-xs px-2 py-0.5 ${getStatusColor(action.status)}`}>
                      {action.status === 'planned' ? 'Planejada' :
                        action.status === 'approved' ? 'Aprovada' :
                          action.status === 'in_progress' ? 'Em Andamento' :
                            action.status === 'completed' ? 'Concluída' :
                              action.status === 'cancelled' ? 'Cancelada' :
                                action.status === 'overdue' ? 'Atrasada' :
                                  action.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(action)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setItemToDelete(action.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.action_description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {action.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Vence: {format(new Date(action.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                    )}
                    {action.estimated_cost && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>R$ {action.estimated_cost.toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                    {action.target_department && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{action.target_department}</span>
                      </div>
                    )}
                    {action.effectiveness_rating && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-500" />
                        <span>Eficácia: {action.effectiveness_rating}/5</span>
                      </div>
                    )}
                  </div>

                  {action.status !== 'completed' && action.status !== 'cancelled' && (
                    <div className="flex gap-2 pt-2 border-t">
                      {action.status === 'planned' && (
                        <Button
                          size="sm"
                          onClick={() => updateActionStatus(action.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                      )}
                      {(action.status === 'approved' || action.status === 'planned') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateActionStatus(action.id, 'in_progress')}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {action.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateActionStatus(action.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ação corretiva? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CorrectiveActionManager;