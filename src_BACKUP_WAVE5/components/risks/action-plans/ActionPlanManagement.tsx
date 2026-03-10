import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw,
  Activity,
  TrendingUp,
  Users,
  Paperclip,
  MessageSquare,
  Flag,
  BarChart3,
  Loader2,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useActionPlans } from '@/hooks/useActionPlans';
import { ActivityFormDialog } from './ActivityFormDialog';

// Tipos para o sistema de gestão
interface ActionPlan {
  id: string;
  risk_id: string;
  treatment_type: 'mitigate' | 'transfer' | 'avoid' | 'accept';
  description: string;
  target_date: Date;
  budget: number;
  approved_by?: string;
  approval_date?: Date;
  status: 'draft' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  created_by: string;
  created_at: Date;
  updated_at: Date;
  activities: ActionActivity[];
}

interface ActionActivity {
  id: string;
  action_plan_id: string;
  description: string;
  responsible_person: string;
  responsible_email?: string;
  deadline: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  evidence_url?: string;
  evidence_description?: string;
  completion_percentage: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  rescheduled_from?: Date;
  reschedule_reason?: string;
  estimated_hours?: number;
  actual_hours?: number;
  cost_estimate?: number;
  actual_cost?: number;
}

interface ActionPlanManagementProps {
  riskId: string;
  riskTitle: string;
  onUpdate?: () => void;
}

export const ActionPlanManagement: React.FC<ActionPlanManagementProps> = ({
  riskId,
  riskTitle,
  onUpdate
}) => {
  const [selectedActivity, setSelectedActivity] = useState<ActionActivity | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);
  const [showActivityDetailDialog, setShowActivityDetailDialog] = useState(false);
  const [activityFormMode, setActivityFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const { toast } = useToast();

  // Hook para gerenciar planos de ação
  const {
    actionPlans,
    activities,
    statistics,
    isLoading,
    createActivity,
    updateActivity,
    deleteActivity,
    isCreatingActivity,
    isUpdatingActivity,
    getOverdueActivities,
    getUpcomingActivities
  } = useActionPlans(riskId);

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      case 'overdue': return 'bg-red-500 text-white';
      case 'not_started': return 'bg-gray-500 text-white';
      case 'cancelled': return 'bg-gray-400 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Função para obter cor da prioridade
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Função para calcular dias até o prazo
  const getDaysUntilDeadline = (deadline: Date) => {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Função para verificar se está atrasado
  const isOverdue = (deadline: Date, status: string) => {
    return status !== 'completed' && new Date() > deadline;
  };

  // Handler para salvar atividade
  const handleSaveActivity = async (activityData: any) => {
    try {
      if (activityFormMode === 'create') {
        // Encontrar o primeiro plano de ação ou criar um padrão
        let actionPlanId = actionPlans[0]?.id;
        
        if (!actionPlanId) {
          // Se não há plano de ação, mostrar erro
          toast({
            title: "Erro",
            description: "É necessário ter um plano de ação antes de criar atividades.",
            variant: "destructive"
          });
          return;
        }

        await createActivity({
          action_plan_id: actionPlanId,
          description: activityData.description,
          responsible_person: activityData.responsible_person,
          responsible_email: activityData.responsible_email,
          deadline: activityData.deadline,
          priority: activityData.priority,
          estimated_hours: activityData.estimated_hours,
          cost_estimate: activityData.cost_estimate
        });
      } else if (activityFormMode === 'edit' && selectedActivity) {
        await updateActivity({
          activityId: selectedActivity.id,
          data: {
            description: activityData.description,
            responsible_person: activityData.responsible_person,
            responsible_email: activityData.responsible_email,
            deadline: activityData.deadline,
            status: activityData.status,
            priority: activityData.priority,
            evidence_url: activityData.evidence_url,
            evidence_description: activityData.evidence_description,
            completion_percentage: activityData.completion_percentage,
            rescheduled_from: activityData.rescheduled_from,
            reschedule_reason: activityData.reschedule_reason,
            estimated_hours: activityData.estimated_hours,
            actual_hours: activityData.actual_hours,
            cost_estimate: activityData.cost_estimate,
            actual_cost: activityData.actual_cost
          }
        });
      }
      
      onUpdate?.();
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
    }
  };

  // Componente de Card de Atividade
  const ActivityCard: React.FC<{ activity: ActionActivity }> = ({ activity }) => {
    const daysUntil = getDaysUntilDeadline(activity.deadline);
    const overdue = isOverdue(activity.deadline, activity.status);

    return (
      <Card className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        overdue && "border-red-200 bg-red-50/50",
        activity.status === 'completed' && "border-green-200 bg-green-50/50"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                {activity.description}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{activity.responsible_person}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={getPriorityColor(activity.priority)} size="sm">
                {activity.priority === 'critical' ? 'Crítica' :
                 activity.priority === 'high' ? 'Alta' :
                 activity.priority === 'medium' ? 'Média' : 'Baixa'}
              </Badge>
              <Badge className={getStatusColor(activity.status)} size="sm">
                {activity.status === 'completed' ? 'Concluída' :
                 activity.status === 'in_progress' ? 'Em Andamento' :
                 activity.status === 'overdue' ? 'Atrasada' :
                 activity.status === 'not_started' ? 'Não Iniciada' : 'Cancelada'}
              </Badge>
            </div>
          </div>

          {/* Progresso */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progresso</span>
              <span>{activity.completion_percentage}%</span>
            </div>
            <Progress value={activity.completion_percentage} className="h-2" />
          </div>

          {/* Prazo */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{format(activity.deadline, 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
            <div className={cn(
              "flex items-center gap-1 font-medium",
              overdue ? "text-red-600" : 
              daysUntil <= 3 ? "text-orange-600" : "text-green-600"
            )}>
              <Clock className="h-3 w-3" />
              <span>
                {overdue ? `${Math.abs(daysUntil)} dias atrasado` :
                 daysUntil === 0 ? 'Vence hoje' :
                 daysUntil === 1 ? '1 dia restante' :
                 `${daysUntil} dias restantes`}
              </span>
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <div className="flex items-center gap-2">
              {activity.evidence_url && (
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Paperclip className="h-3 w-3" />
                  <span>Evidência</span>
                </div>
              )}
              {activity.rescheduled_from && (
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <RotateCcw className="h-3 w-3" />
                  <span>Reagendada</span>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedActivity(activity);
                  setActivityFormMode('view');
                  setShowActivityDetailDialog(true);
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedActivity(activity);
                  setActivityFormMode('edit');
                  setShowActivityDetailDialog(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Componente de Estatísticas
  const StatsOverview: React.FC = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalActivities}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.completedActivities}</div>
            <div className="text-xs text-muted-foreground">Concluídas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{statistics.inProgressActivities}</div>
            <div className="text-xs text-muted-foreground">Em Andamento</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{statistics.overdueActivities}</div>
            <div className="text-xs text-muted-foreground">Atrasadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{statistics.averageProgress}%</div>
            <div className="text-xs text-muted-foreground">Progresso Médio</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando planos de ação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Gestão de Planos de Ação
          </h2>
          <p className="text-muted-foreground mt-1">
            Risco: {riskTitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setSelectedActivity(null);
              setActivityFormMode('create');
              setShowNewActivityDialog(true);
            }}
            disabled={isCreatingActivity}
          >
            {isCreatingActivity ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Nova Atividade
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <StatsOverview />

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="timeline">Cronograma</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          {activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma atividade encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando atividades para gerenciar o plano de ação deste risco.
                </p>
                <Button 
                  onClick={() => {
                    setSelectedActivity(null);
                    setActivityFormMode('create');
                    setShowNewActivityDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Atividade
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Lista de Atividades */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Atividades</CardTitle>
              <CardDescription>
                Gestão detalhada de todas as atividades do plano de ação
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{activity.description}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{activity.responsible_person}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{format(activity.deadline, 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(activity.priority)} size="sm">
                              {activity.priority === 'critical' ? 'Crítica' :
                               activity.priority === 'high' ? 'Alta' :
                               activity.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            <Badge className={getStatusColor(activity.status)} size="sm">
                              {activity.status === 'completed' ? 'Concluída' :
                               activity.status === 'in_progress' ? 'Em Andamento' :
                               activity.status === 'not_started' ? 'Não Iniciada' : 'Cancelada'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {activity.completion_percentage}% concluído
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedActivity(activity);
                              setActivityFormMode('view');
                              setShowActivityDetailDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedActivity(activity);
                              setActivityFormMode('edit');
                              setShowActivityDetailDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma atividade encontrada</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSelectedActivity(null);
                      setActivityFormMode('create');
                      setShowNewActivityDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Atividade
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cronograma */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Execução</CardTitle>
              <CardDescription>
                Visualização temporal das atividades e marcos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Cronograma será implementado em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Análises</CardTitle>
              <CardDescription>
                Métricas de desempenho e relatórios executivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Relatórios serão implementados em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para Nova/Editar Atividade */}
      <ActivityFormDialog
        open={showNewActivityDialog || showActivityDetailDialog}
        onOpenChange={(open) => {
          setShowNewActivityDialog(false);
          setShowActivityDetailDialog(false);
          if (!open) {
            setSelectedActivity(null);
          }
        }}
        activity={selectedActivity || undefined}
        actionPlanId={actionPlans[0]?.id || ''}
        onSave={handleSaveActivity}
        mode={activityFormMode}
      />
    </div>
  );
};

export default ActionPlanManagement;