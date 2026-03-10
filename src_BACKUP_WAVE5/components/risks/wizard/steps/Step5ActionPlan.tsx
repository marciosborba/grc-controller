import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList,
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  FileText,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ActionPlanItem {
  id?: string;
  activity_name: string;
  activity_description: string;
  responsible_name: string;
  responsible_email: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

interface Step5Props {
  data: any;
  updateData: (data: any) => void;
  registrationId?: string | null;
  actionPlanItems: ActionPlanItem[];
  setActionPlanItems: (items: ActionPlanItem[]) => void;
  onSave?: () => void;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baixa', color: 'bg-green-500', icon: '🟢' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-500', icon: '🟡' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500', icon: '🟠' },
  { value: 'critical', label: 'Crítica', color: 'bg-red-500', icon: '🔴' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendente', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'Em Andamento', color: 'bg-blue-500' },
  { value: 'completed', label: 'Concluída', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelada', color: 'bg-red-500' }
];

export const Step5ActionPlan: React.FC<Step5Props> = ({
  data,
  updateData,
  registrationId,
  actionPlanItems,
  setActionPlanItems
}) => {
  
  // Debug logs
  console.log('Step5ActionPlan props:', {
    registrationId,
    actionPlanItems,
    hasSetActionPlanItems: typeof setActionPlanItems === 'function',
    data
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState<ActionPlanItem>({
    activity_name: '',
    activity_description: '',
    responsible_name: '',
    responsible_email: '',
    due_date: '',
    priority: 'medium',
    status: 'pending'
  });

  // Se a estratégia é aceitar, pular esta etapa
  const isAcceptStrategy = data.treatment_strategy === 'accept';
  
  // Carregar action plan items do banco quando registrationId estiver disponível
  useEffect(() => {
    const loadActionPlanItems = async () => {
      if (!registrationId) {
        console.log('Step5: Sem registrationId, não carregando items');
        return;
      }
      
      try {
        console.log('Step5: Carregando action plan items para registrationId:', registrationId);
        const { data: items, error } = await supabase
          .from('risk_registration_action_plans')
          .select('*')
          .eq('risk_registration_id', registrationId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Step5: Erro ao carregar action plan items:', error);
          return;
        }
        
        console.log('Step5: Action plan items carregados:', items);
        if (items && items.length > 0) {
          setActionPlanItems(items);
        }
      } catch (error) {
        console.error('Step5: Erro ao carregar action plan items:', error);
      }
    };
    
    loadActionPlanItems();
  }, [registrationId, setActionPlanItems]);

  const resetForm = () => {
    setNewItem({
      activity_name: '',
      activity_description: '',
      responsible_name: '',
      responsible_email: '',
      due_date: '',
      priority: 'medium',
      status: 'pending'
    });
    setIsEditing(false);
    setEditingIndex(null);
  };

  const validateItem = (item: ActionPlanItem) => {
    const errors = [];
    
    if (!item.activity_name?.trim()) {
      errors.push('Nome da atividade é obrigatório');
    }
    
    if (!item.responsible_name?.trim()) {
      errors.push('Nome do responsável é obrigatório');
    }
    
    if (!item.responsible_email?.trim()) {
      errors.push('Email do responsável é obrigatório');
    } else {
      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(item.responsible_email)) {
        errors.push('Email do responsável deve ter um formato válido');
      }
    }
    
    if (!item.due_date) {
      errors.push('Data de vencimento é obrigatória');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const addOrUpdateItem = async () => {
    const validation = validateItem(newItem);
    if (!validation.isValid) {
      toast.error(`Erro de validação:\n${validation.errors.join('\n')}`);
      return;
    }
    
    console.log('Iniciando salvamento da atividade:', {
      newItem,
      registrationId,
      editingIndex,
      hasRegistrationId: !!registrationId
    });
    
    // Verificar se registrationId existe
    if (!registrationId) {
      console.warn('registrationId não encontrado, salvando apenas na memória');
    }

    try {
      const updatedItems = [...(actionPlanItems || [])];

      if (editingIndex !== null) {
        // Atualizar item existente
        updatedItems[editingIndex] = { ...newItem };
        
        if (registrationId && newItem.id) {
          // Atualizar no banco
          console.log('Atualizando item existente no banco:', newItem.id);
          const { error } = await supabase
            .from('risk_registration_action_plans')
            .update({
              activity_name: newItem.activity_name,
              activity_description: newItem.activity_description,
              responsible_name: newItem.responsible_name,
              responsible_email: newItem.responsible_email,
              due_date: newItem.due_date,
              priority: newItem.priority,
              status: newItem.status
            })
            .eq('id', newItem.id);
          
          if (error) {
            console.error('Erro ao atualizar no banco:', error);
            throw error;
          }
          console.log('Item atualizado com sucesso no banco');
        }
      } else {
        // Adicionar novo item
        if (registrationId) {
          // Salvar no banco
          console.log('Salvando novo item no banco para registrationId:', registrationId);
          const itemToInsert = {
            activity_name: newItem.activity_name,
            activity_description: newItem.activity_description,
            responsible_name: newItem.responsible_name,
            responsible_email: newItem.responsible_email,
            due_date: newItem.due_date,
            priority: newItem.priority,
            status: newItem.status,
            risk_registration_id: registrationId,
            tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f'
          };
          
          console.log('Dados a serem inseridos:', itemToInsert);
          
          const { data: savedItem, error } = await supabase
            .from('risk_registration_action_plans')
            .insert([itemToInsert])
            .select()
            .single();
          
          if (error) {
            console.error('Erro ao salvar no banco:', error);
            throw error;
          }
          
          console.log('Item salvo com sucesso:', savedItem);
          updatedItems.push(savedItem);
        } else {
          // Apenas na memória (ainda não foi salvo o registro principal)
          console.log('Salvando item apenas na memória (sem registrationId)');
          updatedItems.push({ ...newItem, id: `temp-${Date.now()}` });
        }
      }

      setActionPlanItems(updatedItems);
      resetForm();
      
      const successMessage = editingIndex !== null ? 'Atividade atualizada!' : 'Atividade adicionada!';
      console.log(successMessage);
      toast.success(successMessage);
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      
      let errorMessage = 'Erro ao salvar atividade';
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      if (error?.details) {
        errorMessage += ` (${error.details})`;
      }
      
      toast.error(errorMessage);
    }
  };

  const editItem = (index: number) => {
    if (actionPlanItems && actionPlanItems[index]) {
      setNewItem({ ...actionPlanItems[index] });
      setEditingIndex(index);
      setIsEditing(true);
    }
  };

  const deleteItem = async (index: number) => {
    try {
      if (!actionPlanItems || !actionPlanItems[index]) return;
      
      const item = actionPlanItems[index];
      
      if (registrationId && item.id && !item.id.toString().startsWith('temp-')) {
        // Deletar do banco
        const { error } = await supabase
          .from('risk_registration_action_plans')
          .delete()
          .eq('id', item.id);
        
        if (error) throw error;
      }

      const updatedItems = actionPlanItems.filter((_, i) => i !== index);
      setActionPlanItems(updatedItems);
      toast.success('Atividade removida!');
    } catch (error) {
      console.error('Erro ao remover atividade:', error);
      toast.error('Erro ao remover atividade');
    }
  };

  const getPriorityInfo = (priority: string) => {
    return PRIORITY_OPTIONS.find(p => p.value === priority) || PRIORITY_OPTIONS[1];
  };

  const getStatusInfo = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  if (isAcceptStrategy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Etapa 5: Plano de Ação
          </CardTitle>
          <CardDescription>
            Esta etapa foi automaticamente dispensada devido à estratégia de aceitação selecionada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Estratégia de Aceitação:</strong> Como você escolheu aceitar o risco, 
              não é necessário definir um plano de ação específico. O risco será tratado 
              através de comunicação e monitoramento (próximas etapas).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Introdução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Plano de Ação para Tratamento do Risco
          </CardTitle>
          <CardDescription>
            Defina as atividades específicas necessárias para implementar a estratégia de tratamento selecionada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Target className="h-4 w-4" />
            <AlertDescription>
              <strong>Estratégia Selecionada:</strong> {data.treatment_strategy ? 
                data.treatment_strategy.charAt(0).toUpperCase() + data.treatment_strategy.slice(1) : 
                'Não definida'
              }. Crie atividades específicas, mensuráveis e com responsáveis definidos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Formulário de Atividade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isEditing ? 'Editar Atividade' : 'Adicionar Nova Atividade'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da Atividade */}
            <div className="md:col-span-2">
              <Label htmlFor="activity_name">Nome da Atividade *</Label>
              <Input
                id="activity_name"
                value={newItem.activity_name}
                onChange={(e) => setNewItem({...newItem, activity_name: e.target.value})}
                placeholder="Ex: Implementar backup automático diário"
              />
            </div>

            {/* Responsável */}
            <div>
              <Label htmlFor="responsible_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsável *
              </Label>
              <Input
                id="responsible_name"
                value={newItem.responsible_name}
                onChange={(e) => setNewItem({...newItem, responsible_name: e.target.value})}
                placeholder="Nome do responsável"
              />
            </div>

            {/* Email do Responsável */}
            <div>
              <Label htmlFor="responsible_email">Email do Responsável *</Label>
              <Input
                id="responsible_email"
                type="email"
                value={newItem.responsible_email}
                onChange={(e) => setNewItem({...newItem, responsible_email: e.target.value})}
                placeholder="email@empresa.com"
              />
            </div>

            {/* Data de Vencimento */}
            <div>
              <Label htmlFor="due_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Vencimento *
              </Label>
              <Input
                id="due_date"
                type="date"
                value={newItem.due_date}
                onChange={(e) => setNewItem({...newItem, due_date: e.target.value})}
              />
            </div>

            {/* Prioridade */}
            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={newItem.priority} 
                onValueChange={(value: any) => setNewItem({...newItem, priority: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className="flex items-center gap-2">
                        {priority.icon} {priority.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="activity_description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição Detalhada
            </Label>
            <Textarea
              id="activity_description"
              value={newItem.activity_description}
              onChange={(e) => setNewItem({...newItem, activity_description: e.target.value})}
              placeholder="Descreva detalhadamente o que deve ser feito, como e quais recursos são necessários..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2">
            <Button onClick={addOrUpdateItem}>
              {isEditing ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Atualizar Atividade
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Atividade
                </>
              )}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Atividades */}
      {actionPlanItems && actionPlanItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Atividades do Plano de Ação ({actionPlanItems?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {actionPlanItems?.map((item, index) => {
                const priorityInfo = getPriorityInfo(item.priority);
                const statusInfo = getStatusInfo(item.status);
                
                return (
                  <Card key={item.id || index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{item.activity_name}</h4>
                            <Badge className={`${priorityInfo.color} text-white text-xs`}>
                              {priorityInfo.icon} {priorityInfo.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {statusInfo.label}
                            </Badge>
                          </div>
                          
                          {item.activity_description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {item.activity_description}
                            </p>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{item.responsible_name}</div>
                                <div className="text-xs text-muted-foreground">{item.responsible_email}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {new Date(item.due_date).toLocaleDateString('pt-BR')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(item.due_date) < new Date() ? 'Vencido' : 'Pendente'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Status</div>
                                <div className="text-xs text-muted-foreground">{statusInfo.label}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editItem(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diretrizes */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Diretrizes para Plano de Ação Eficaz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">✅ Características de Boas Atividades</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span><strong>Específicas:</strong> Descreva exatamente o que deve ser feito</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span><strong>Mensuráveis:</strong> Defina critérios claros de conclusão</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span><strong>Realizáveis:</strong> Considere recursos e capacidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span><strong>Relevantes:</strong> Contribuam diretamente para o tratamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span><strong>Temporais:</strong> Tenham prazos definidos e realistas</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3">💡 Exemplos por Estratégia</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-blue-600">Mitigar:</span>
                  <p className="text-xs">Implementar controles, treinar equipe, criar procedimentos</p>
                </div>
                <div>
                  <span className="font-medium text-purple-600">Transferir:</span>
                  <p className="text-xs">Contratar seguro, negociar contratos, terceirizar</p>
                </div>
                <div>
                  <span className="font-medium text-red-600">Evitar:</span>
                  <p className="text-xs">Descontinuar atividade, mudar processo, cancelar projeto</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status da Etapa */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
(actionPlanItems?.length || 0) > 0 ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                Status da Etapa 5: Plano de Ação
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {actionPlanItems?.length || 0} atividade{(actionPlanItems?.length || 0) !== 1 ? 's' : ''}
              </div>
              {(actionPlanItems?.length || 0) === 0 && (
                <div className="text-xs text-amber-600">
                  Adicione pelo menos uma atividade
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};