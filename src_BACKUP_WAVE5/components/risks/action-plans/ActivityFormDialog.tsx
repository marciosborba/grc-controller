import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar as CalendarIcon, 
  User, 
  Mail, 
  Flag, 
  Clock, 
  FileText,
  Upload,
  Download,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ActionActivity {
  id?: string;
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
  rescheduled_from?: Date;
  reschedule_reason?: string;
  estimated_hours?: number;
  actual_hours?: number;
  cost_estimate?: number;
  actual_cost?: number;
}

interface ActivityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity?: ActionActivity;
  actionPlanId: string;
  onSave: (activity: ActionActivity) => Promise<void>;
  mode: 'create' | 'edit' | 'view';
}

export const ActivityFormDialog: React.FC<ActivityFormDialogProps> = ({
  open,
  onOpenChange,
  activity,
  actionPlanId,
  onSave,
  mode
}) => {
  const [formData, setFormData] = useState<ActionActivity>({
    action_plan_id: actionPlanId,
    description: '',
    responsible_person: '',
    responsible_email: '',
    deadline: new Date(),
    status: 'not_started',
    priority: 'medium',
    completion_percentage: 0,
    estimated_hours: 0,
    actual_hours: 0,
    cost_estimate: 0,
    actual_cost: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [newDeadline, setNewDeadline] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    if (activity) {
      setFormData({
        ...activity,
        deadline: new Date(activity.deadline)
      });
    } else {
      setFormData({
        action_plan_id: actionPlanId,
        description: '',
        responsible_person: '',
        responsible_email: '',
        deadline: new Date(),
        status: 'not_started',
        priority: 'medium',
        completion_percentage: 0,
        estimated_hours: 0,
        actual_hours: 0,
        cost_estimate: 0,
        actual_cost: 0
      });
    }
  }, [activity, actionPlanId]);

  const handleSave = async () => {
    if (!formData.description.trim()) {
      toast({
        title: "Erro de Validação",
        description: "A descrição da atividade é obrigatória.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.responsible_person.trim()) {
      toast({
        title: "Erro de Validação",
        description: "O responsável pela atividade é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast({
        title: "Sucesso",
        description: `Atividade ${mode === 'create' ? 'criada' : 'atualizada'} com sucesso.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} atividade.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleReason.trim()) {
      toast({
        title: "Erro",
        description: "Motivo do reagendamento é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    const updatedActivity = {
      ...formData,
      rescheduled_from: formData.deadline,
      deadline: newDeadline,
      reschedule_reason: rescheduleReason
    };

    setFormData(updatedActivity);
    setShowRescheduleDialog(false);
    setRescheduleReason('');
    
    toast({
      title: "Reagendamento",
      description: "Prazo reagendado. Salve para confirmar as alterações.",
    });
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const isOverdue = formData.deadline < new Date() && formData.status !== 'completed';
  const isReadOnly = mode === 'view';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {mode === 'create' ? 'Nova Atividade' : 
               mode === 'edit' ? 'Editar Atividade' : 'Detalhes da Atividade'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' ? 'Crie uma nova atividade para o plano de ação' :
               mode === 'edit' ? 'Edite os detalhes da atividade' :
               'Visualize os detalhes completos da atividade'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal - Formulário */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição da Atividade *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva detalhadamente a atividade a ser executada..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isReadOnly}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible">Responsável *</Label>
                    <Input
                      id="responsible"
                      placeholder="Nome do responsável"
                      value={formData.responsible_person}
                      onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail do Responsável</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@empresa.com"
                      value={formData.responsible_email || ''}
                      onChange={(e) => setFormData({ ...formData, responsible_email: e.target.value })}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Não Iniciada</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Prazo</Label>
                    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.deadline && "text-muted-foreground",
                            isOverdue && "border-red-500 text-red-600"
                          )}
                          disabled={isReadOnly}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.deadline ? (
                            format(formData.deadline, "dd/MM/yyyy", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.deadline}
                          onSelect={(date) => {
                            if (date) {
                              setFormData({ ...formData, deadline: date });
                              setShowCalendar(false);
                            }
                          }}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Progresso e Métricas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Progresso e Métricas</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Progresso da Atividade</Label>
                    <span className="text-sm font-medium">{formData.completion_percentage}%</span>
                  </div>
                  <Progress value={formData.completion_percentage} className="h-3" />
                  {!isReadOnly && (
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.completion_percentage}
                      onChange={(e) => setFormData({ ...formData, completion_percentage: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimated_hours || ''}
                      onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="actual_hours">Horas Reais</Label>
                    <Input
                      id="actual_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.actual_hours || ''}
                      onChange={(e) => setFormData({ ...formData, actual_hours: parseFloat(e.target.value) || 0 })}
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cost_estimate">Custo Estimado (R$)</Label>
                    <Input
                      id="cost_estimate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost_estimate || ''}
                      onChange={(e) => setFormData({ ...formData, cost_estimate: parseFloat(e.target.value) || 0 })}
                      disabled={isReadOnly}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="actual_cost">Custo Real (R$)</Label>
                    <Input
                      id="actual_cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.actual_cost || ''}
                      onChange={(e) => setFormData({ ...formData, actual_cost: parseFloat(e.target.value) || 0 })}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Evidências */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Evidências e Documentação</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="evidence_description">Descrição da Evidência</Label>
                  <Textarea
                    id="evidence_description"
                    placeholder="Descreva as evidências ou documentos relacionados..."
                    value={formData.evidence_description || ''}
                    onChange={(e) => setFormData({ ...formData, evidence_description: e.target.value })}
                    disabled={isReadOnly}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidence_url">URL da Evidência</Label>
                  <div className="flex gap-2">
                    <Input
                      id="evidence_url"
                      placeholder="https://..."
                      value={formData.evidence_url || ''}
                      onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })}
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && (
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    )}
                    {formData.evidence_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={formData.evidence_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Lateral - Informações e Ações */}
            <div className="space-y-6">
              {/* Status e Badges */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prioridade:</span>
                    <Badge className={getPriorityColor(formData.priority)}>
                      {formData.priority === 'critical' ? 'Crítica' :
                       formData.priority === 'high' ? 'Alta' :
                       formData.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className={getStatusColor(formData.status)}>
                      {formData.status === 'completed' ? 'Concluída' :
                       formData.status === 'in_progress' ? 'Em Andamento' :
                       formData.status === 'not_started' ? 'Não Iniciada' : 'Cancelada'}
                    </Badge>
                  </div>
                  
                  {isOverdue && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">Atividade em Atraso</span>
                    </div>
                  )}
                  
                  {formData.rescheduled_from && (
                    <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <RotateCcw className="h-4 w-4 text-orange-600" />
                      <div className="text-sm">
                        <div className="font-medium text-orange-600">Reagendada</div>
                        <div className="text-orange-500">
                          De: {format(formData.rescheduled_from, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        {formData.reschedule_reason && (
                          <div className="text-orange-500 text-xs mt-1">
                            {formData.reschedule_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações Rápidas */}
              {!isReadOnly && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ações</h3>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowRescheduleDialog(true)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reagendar Prazo
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setFormData({ ...formData, status: 'completed', completion_percentage: 100 })}
                      disabled={formData.status === 'completed'}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Concluída
                    </Button>
                  </div>
                </div>
              )}

              {/* Métricas Resumidas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resumo</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Progresso:</span>
                    <span className="font-medium">{formData.completion_percentage}%</span>
                  </div>
                  
                  {formData.estimated_hours > 0 && (
                    <div className="flex justify-between">
                      <span>Horas:</span>
                      <span className="font-medium">
                        {formData.actual_hours || 0} / {formData.estimated_hours}h
                      </span>
                    </div>
                  )}
                  
                  {formData.cost_estimate > 0 && (
                    <div className="flex justify-between">
                      <span>Custo:</span>
                      <span className="font-medium">
                        R$ {(formData.actual_cost || 0).toFixed(2)} / R$ {formData.cost_estimate.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Prazo:</span>
                    <span className={cn(
                      "font-medium",
                      isOverdue ? "text-red-600" : "text-green-600"
                    )}>
                      {format(formData.deadline, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer com Botões */}
          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              {isReadOnly ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isReadOnly && (
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Reagendamento */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reagendar Atividade</DialogTitle>
            <DialogDescription>
              Defina um novo prazo e o motivo do reagendamento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Novo Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(newDeadline, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDeadline}
                    onSelect={(date) => date && setNewDeadline(date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reschedule_reason">Motivo do Reagendamento *</Label>
              <Textarea
                id="reschedule_reason"
                placeholder="Explique o motivo do reagendamento..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleReschedule}>
              Reagendar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivityFormDialog;