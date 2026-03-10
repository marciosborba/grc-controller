import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Shield, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Target,
  CheckCircle,
  AlertCircle,
  Activity,
  Edit2,
  Trash2,
  Play,
  Pause,
  X,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface RiskAction {
  id: string;
  risk_id: string;
  title: string;
  description: string;
  action_type: 'Preventive' | 'Detective' | 'Corrective' | 'Compensating';
  responsible_party: string;
  target_completion_date: string;
  actual_completion_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  progress_percentage: number;
  effectiveness_rating?: 'High' | 'Medium' | 'Low' | 'Not Assessed';
  validation_method?: string;
  validation_date?: string;
  validated_by?: string;
  progress_notes?: string;
  created_at: string;
  updated_at: string;
}

interface VendorRiskActionsProps {
  riskId: string;
  actions: RiskAction[];
  profiles: any[];
  onCreateAction: (data: any) => void;
  onUpdateAction: (actionId: string, data: any) => void;
  onDeleteAction: (actionId: string) => void;
}

const VendorRiskActions = ({ 
  riskId, 
  actions, 
  profiles, 
  onCreateAction,
  onUpdateAction,
  onDeleteAction 
}: VendorRiskActionsProps) => {
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<RiskAction | null>(null);
  
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    action_type: 'Preventive' as const,
    responsible_party: '',
    target_completion_date: '',
    estimated_cost: 0,
    validation_method: '',
    progress_notes: ''
  });

  const [targetDate, setTargetDate] = useState<Date>();

  const actionTypes = [
    { value: 'Preventive', label: 'Preventiva', color: 'bg-blue-100 text-blue-800', icon: Shield },
    { value: 'Detective', label: 'Detectiva', color: 'bg-yellow-100 text-yellow-800', icon: Activity },
    { value: 'Corrective', label: 'Corretiva', color: 'bg-orange-100 text-orange-800', icon: Target },
    { value: 'Compensating', label: 'Compensatória', color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
  ];

  const statusOptions = [
    { value: 'Planned', label: 'Planejada', color: 'bg-gray-100 text-gray-800', icon: Clock },
    { value: 'In Progress', label: 'Em Progresso', color: 'bg-blue-100 text-blue-800', icon: Play },
    { value: 'Completed', label: 'Concluída', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'Cancelled', label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: X },
    { value: 'On Hold', label: 'Em Espera', color: 'bg-yellow-100 text-yellow-800', icon: Pause }
  ];

  const effectivenessOptions = [
    { value: 'High', label: 'Alta', color: 'bg-green-100 text-green-800' },
    { value: 'Medium', label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Low', label: 'Baixa', color: 'bg-red-100 text-red-800' },
    { value: 'Not Assessed', label: 'Não Avaliada', color: 'bg-gray-100 text-gray-800' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setNewAction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    setTargetDate(date);
    handleInputChange('target_completion_date', date.toISOString());
  };

  const handleSubmit = () => {
    const actionData = {
      ...newAction,
      risk_id: riskId,
      progress_percentage: 0,
      status: 'Planned'
    };
    
    onCreateAction(actionData);
    resetForm();
  };

  const resetForm = () => {
    setNewAction({
      title: '',
      description: '',
      action_type: 'Preventive',
      responsible_party: '',
      target_completion_date: '',
      estimated_cost: 0,
      validation_method: '',
      progress_notes: ''
    });
    setTargetDate(undefined);
    setIsNewActionOpen(false);
    setEditingAction(null);
  };

  const getActionTypeColor = (type: string) => {
    const typeObj = actionTypes.find(t => t.value === type);
    return typeObj ? typeObj.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.icon : Clock;
  };

  const getEffectivenessColor = (effectiveness?: string) => {
    const effObj = effectivenessOptions.find(e => e.value === effectiveness);
    return effObj ? effObj.color : 'bg-gray-100 text-gray-800';
  };

  const isOverdue = (targetDate: string, status: string) => {
    if (status === 'Completed') return false;
    return new Date(targetDate) < new Date();
  };

  const getOverallProgress = () => {
    if (actions.length === 0) return 0;
    const totalProgress = actions.reduce((sum, action) => sum + action.progress_percentage, 0);
    return Math.round(totalProgress / actions.length);
  };

  const getCompletedActions = () => {
    return actions.filter(action => action.status === 'Completed').length;
  };

  return (
    <div className="space-y-6">
      {/* Métricas das Ações */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-blue-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{actions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Concluídas</p>
                <p className="text-lg font-bold">{getCompletedActions()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Progresso</p>
                <p className="text-lg font-bold">{getOverallProgress()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div className="ml-2">
                <p className="text-xs font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-lg font-bold">
                  {actions.filter(a => isOverdue(a.target_completion_date, a.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Geral */}
      {actions.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso Geral das Ações</span>
                <span>{getOverallProgress()}%</span>
              </div>
              <Progress value={getOverallProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header com botão de nova ação */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ações de Mitigação</h3>
        
        <Dialog open={isNewActionOpen} onOpenChange={setIsNewActionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAction ? 'Editar Ação' : 'Nova Ação de Mitigação'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações da Ação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título da Ação *</Label>
                    <Input
                      value={newAction.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ex: Implementar controle de acesso biométrico"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição Detalhada *</Label>
                    <Textarea
                      value={newAction.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descreva detalhadamente a ação a ser implementada..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Ação *</Label>
                      <Select 
                        value={newAction.action_type} 
                        onValueChange={(value: any) => handleInputChange('action_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTypes.map((type) => {
                            const IconComponent = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Responsável *</Label>
                      <Select 
                        value={newAction.responsible_party} 
                        onValueChange={(value) => handleInputChange('responsible_party', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((profile) => (
                            <SelectItem key={profile.user_id} value={profile.user_id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {profile.full_name} ({profile.job_title})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data Limite *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !targetDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {targetDate ? format(targetDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={targetDate}
                            onSelect={handleDateChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Custo Estimado (R$)</Label>
                      <Input
                        type="number"
                        value={newAction.estimated_cost}
                        onChange={(e) => handleInputChange('estimated_cost', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Método de Validação</Label>
                    <Textarea
                      value={newAction.validation_method}
                      onChange={(e) => handleInputChange('validation_method', e.target.value)}
                      placeholder="Como será validada a eficácia desta ação?"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingAction ? 'Atualizar Ação' : 'Criar Ação'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Ações */}
      <div className="space-y-4">
        {actions.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Nenhuma ação de mitigação encontrada
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Comece criando a primeira ação para mitigar este risco.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          actions.map((action) => {
            const StatusIcon = getStatusIcon(action.status);
            const isActionOverdue = isOverdue(action.target_completion_date, action.status);
            const responsibleProfile = profiles.find(p => p.user_id === action.responsible_party);
            
            return (
              <Card key={action.id} className={`transition-shadow hover:shadow-md ${isActionOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium">{action.title}</h4>
                        
                        <Badge className={`text-xs ${getActionTypeColor(action.action_type)}`}>
                          {actionTypes.find(t => t.value === action.action_type)?.label}
                        </Badge>
                        
                        <Badge className={`text-xs ${getStatusColor(action.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusOptions.find(s => s.value === action.status)?.label}
                        </Badge>

                        {isActionOverdue && (
                          <Badge className="text-xs bg-red-100 text-red-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Atrasada
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Responsável</p>
                          <p className="text-sm">{responsibleProfile?.full_name || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Data Limite</p>
                          <p className={`text-sm ${isActionOverdue ? 'text-red-600' : ''}`}>
                            {format(new Date(action.target_completion_date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Custo Estimado</p>
                          <p className="text-sm">
                            {action.estimated_cost ? 
                              `R$ ${action.estimated_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                              'N/A'
                            }
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Eficácia</p>
                          <Badge className={`text-xs ${getEffectivenessColor(action.effectiveness_rating)}`}>
                            {effectivenessOptions.find(e => e.value === action.effectiveness_rating)?.label || 'N/A'}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span>{action.progress_percentage}%</span>
                        </div>
                        <Progress value={action.progress_percentage} className="h-2" />
                      </div>

                      {action.progress_notes && (
                        <div className="bg-muted/50 p-3 rounded-md">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Notas de Progresso</p>
                          <p className="text-sm">{action.progress_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Implementar atualização de progresso
                          console.log('Atualizar progresso:', action.id);
                        }}
                      >
                        <TrendingUp className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingAction(action);
                          setIsNewActionOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta ação?')) {
                            onDeleteAction(action.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VendorRiskActions;