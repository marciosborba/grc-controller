import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Mail,
  User,
  Phone,
  Shield,
  CheckCircle,
  AlertTriangle,
  Send,
  Eye,
  Clock,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Stakeholder {
  id?: string;
  name: string;
  position: string;
  email: string;
  phone?: string;
  notification_type: 'awareness' | 'approval';
  response_status?: 'pending' | 'acknowledged' | 'approved' | 'rejected';
}

interface Step6Props {
  data: any;
  updateData: (data: any) => void;
  registrationId?: string | null;
  stakeholders: Stakeholder[];
  setStakeholders: (stakeholders: Stakeholder[]) => void;
  onSave?: () => void;
}

const NOTIFICATION_TYPES = [
  {
    value: 'awareness',
    label: 'Ciência',
    icon: <Eye className="h-4 w-4" />,
    description: 'Stakeholder precisa apenas tomar ciência do risco',
    color: 'bg-blue-500',
    requirement: 'Confirmação de leitura'
  },
  {
    value: 'approval',
    label: 'Aprovação',
    icon: <Shield className="h-4 w-4" />,
    description: 'Stakeholder deve aprovar formalmente a estratégia',
    color: 'bg-red-500',
    requirement: 'Aprovação obrigatória'
  }
];

const PREDEFINED_ROLES = [
  { position: 'CEO / Presidente', needsApproval: true },
  { position: 'CFO / Diretor Financeiro', needsApproval: true },
  { position: 'CRO / Chief Risk Officer', needsApproval: true },
  { position: 'CISO / Chief Information Security Officer', needsApproval: false },
  { position: 'Diretor de Compliance', needsApproval: true },
  { position: 'Gerente de Riscos', needsApproval: false },
  { position: 'Auditor Interno', needsApproval: false },
  { position: 'Gerente da Área Afetada', needsApproval: false },
  { position: 'Coordenador de Segurança', needsApproval: false },
  { position: 'Responsável pelo Processo', needsApproval: false }
];

export const Step6Communication: React.FC<Step6Props> = ({
  data,
  updateData,
  registrationId,
  stakeholders,
  setStakeholders
}) => {
  
  // Debug logs
  console.log('Step6Communication props:', {
    registrationId,
    stakeholders,
    hasSetStakeholders: typeof setStakeholders === 'function',
    data
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newStakeholder, setNewStakeholder] = useState<Stakeholder>({
    name: '',
    position: '',
    email: '',
    phone: '',
    notification_type: 'awareness'
  });
  const [requiresApproval, setRequiresApproval] = useState(false);

  // Verificar se é carta de risco (estratégia de aceitação)
  const isRiskLetter = data.treatment_strategy === 'accept';
  
  // Carregar stakeholders do banco quando registrationId estiver disponível
  useEffect(() => {
    const loadStakeholders = async () => {
      if (!registrationId) {
        console.log('Step6: Sem registrationId, não carregando stakeholders');
        return;
      }
      
      try {
        console.log('Step6: Carregando stakeholders para registrationId:', registrationId);
        const { data: items, error } = await supabase
          .from('risk_stakeholders')
          .select('*')
          .eq('risk_registration_id', registrationId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Step6: Erro ao carregar stakeholders:', error);
          return;
        }
        
        console.log('Step6: Stakeholders carregados:', items);
        if (items && items.length > 0) {
          setStakeholders(items);
        }
      } catch (error) {
        console.error('Step6: Erro ao carregar stakeholders:', error);
      }
    };
    
    loadStakeholders();
  }, [registrationId, setStakeholders]);

  useEffect(() => {
    // Atualizar se requer aprovação baseado nos stakeholders
    if (stakeholders && Array.isArray(stakeholders)) {
      const hasApprovalStakeholders = stakeholders.some(s => s.notification_type === 'approval');
      setRequiresApproval(hasApprovalStakeholders);
      updateData({ requires_approval: hasApprovalStakeholders || isRiskLetter });
    }
  }, [stakeholders, isRiskLetter]);

  const resetForm = () => {
    setNewStakeholder({
      name: '',
      position: '',
      email: '',
      phone: '',
      notification_type: 'awareness'
    });
    setIsEditing(false);
    setEditingIndex(null);
  };

  const validateStakeholder = (stakeholder: Stakeholder) => {
    return stakeholder.name && 
           stakeholder.position && 
           stakeholder.email;
  };

  const addOrUpdateStakeholder = async () => {
    if (!validateStakeholder(newStakeholder)) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      let updatedStakeholders = [...(stakeholders || [])];

      if (editingIndex !== null) {
        // Atualizar stakeholder existente
        updatedStakeholders[editingIndex] = { ...newStakeholder };
        
        if (registrationId && newStakeholder.id) {
          // Atualizar no banco
          const { error } = await supabase
            .from('risk_stakeholders')
            .update(newStakeholder)
            .eq('id', newStakeholder.id);
          
          if (error) throw error;
        }
      } else {
        // Adicionar novo stakeholder
        if (registrationId) {
          // Salvar no banco
          const { data: savedStakeholder, error } = await supabase
            .from('risk_stakeholders')
            .insert([{
              ...newStakeholder,
              risk_registration_id: registrationId,
              tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f'
            }])
            .select()
            .single();
          
          if (error) throw error;
          updatedStakeholders.push(savedStakeholder);
        } else {
          // Apenas na memória
          updatedStakeholders.push({ ...newStakeholder, id: `temp-${Date.now()}` });
        }
      }

      setStakeholders(updatedStakeholders);
      resetForm();
      toast.success(editingIndex !== null ? 'Stakeholder atualizado!' : 'Stakeholder adicionado!');
    } catch (error) {
      console.error('Erro ao salvar stakeholder:', error);
      toast.error('Erro ao salvar stakeholder');
    }
  };

  const editStakeholder = (index: number) => {
    if (stakeholders && stakeholders[index]) {
      setNewStakeholder({ ...stakeholders[index] });
      setEditingIndex(index);
      setIsEditing(true);
    }
  };

  const deleteStakeholder = async (index: number) => {
    try {
      if (!stakeholders || !stakeholders[index]) return;
      
      const stakeholder = stakeholders[index];
      
      if (registrationId && stakeholder.id && !stakeholder.id.toString().startsWith('temp-')) {
        // Deletar do banco
        const { error } = await supabase
          .from('risk_stakeholders')
          .delete()
          .eq('id', stakeholder.id);
        
        if (error) throw error;
      }

      const updatedStakeholders = stakeholders.filter((_, i) => i !== index);
      setStakeholders(updatedStakeholders);
      toast.success('Stakeholder removido!');
    } catch (error) {
      console.error('Erro ao remover stakeholder:', error);
      toast.error('Erro ao remover stakeholder');
    }
  };

  const addPredefinedRole = (role: any) => {
    setNewStakeholder({
      ...newStakeholder,
      position: role.position,
      notification_type: role.needsApproval ? 'approval' : 'awareness'
    });
  };

  const sendNotifications = async () => {
    if (!registrationId) {
      toast.error('Salve o registro antes de enviar notificações');
      return;
    }

    try {
      // Aqui implementaríamos o envio de emails/notificações
      // Por ora, apenas atualizar o status
      if (!stakeholders || stakeholders.length === 0) {
        toast.error('Nenhum stakeholder cadastrado');
        return;
      }
      
      const updates = stakeholders.map(stakeholder => ({
        ...stakeholder,
        notified_at: new Date().toISOString()
      }));

      setStakeholders(updates);
      toast.success('Notificações enviadas com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      toast.error('Erro ao enviar notificações');
    }
  };

  const getNotificationTypeInfo = (type: string) => {
    return NOTIFICATION_TYPES.find(t => t.value === type) || NOTIFICATION_TYPES[0];
  };

  return (
    <div className="space-y-6">
      {/* Introdução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Comunicação e Stakeholders
          </CardTitle>
          <CardDescription>
            Defina os stakeholders que devem ser comunicados sobre este risco e o tipo de resposta necessária.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRiskLetter ? (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
              <Shield className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                <strong>Carta de Risco:</strong> Como foi escolhida a estratégia de aceitação, 
                este processo gerará uma carta de risco que deve ser aprovada pelos stakeholders 
                apropriados antes da finalização.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Comunicação de Risco:</strong> Identifique todos os stakeholders que 
                precisam ter ciência ou aprovar as ações relacionadas a este risco.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Stakeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isEditing ? 'Editar Stakeholder' : 'Adicionar Stakeholder'}
          </CardTitle>
          {!isEditing && (
            <CardDescription>
              Adicione pessoas que devem ser comunicadas sobre este risco
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cargos Predefinidos */}
          {!isEditing && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Cargos Sugeridos:</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_ROLES.map((role, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => addPredefinedRole(role)}
                    className="text-xs"
                  >
                    {role.position}
                    {role.needsApproval && <Shield className="h-3 w-3 ml-1 text-red-500" />}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <Label htmlFor="stakeholder_name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="stakeholder_name"
                value={newStakeholder.name}
                onChange={(e) => setNewStakeholder({...newStakeholder, name: e.target.value})}
                placeholder="Nome do stakeholder"
              />
            </div>

            {/* Cargo */}
            <div>
              <Label htmlFor="stakeholder_position">Cargo/Posição *</Label>
              <Input
                id="stakeholder_position"
                value={newStakeholder.position}
                onChange={(e) => setNewStakeholder({...newStakeholder, position: e.target.value})}
                placeholder="Ex: Diretor de Riscos"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="stakeholder_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="stakeholder_email"
                type="email"
                value={newStakeholder.email}
                onChange={(e) => setNewStakeholder({...newStakeholder, email: e.target.value})}
                placeholder="email@empresa.com"
              />
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="stakeholder_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="stakeholder_phone"
                value={newStakeholder.phone || ''}
                onChange={(e) => setNewStakeholder({...newStakeholder, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Tipo de Notificação */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Tipo de Comunicação *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {NOTIFICATION_TYPES.map((type) => (
                <Card 
                  key={type.value}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    newStakeholder.notification_type === type.value 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setNewStakeholder({...newStakeholder, notification_type: type.value as any})}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${type.color} text-white`}>
                        {type.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{type.label}</h4>
                          {newStakeholder.notification_type === type.value && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>{type.requirement}</strong>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-2">
            <Button onClick={addOrUpdateStakeholder}>
              {isEditing ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Atualizar Stakeholder
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Stakeholder
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

      {/* Lista de Stakeholders */}
      {stakeholders && stakeholders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Stakeholders Cadastrados ({stakeholders?.length || 0})
                </CardTitle>
                <CardDescription>
                  Lista de pessoas que serão comunicadas sobre este risco
                </CardDescription>
              </div>
              {registrationId && (
                <Button onClick={sendNotifications} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Notificações
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stakeholders?.map((stakeholder, index) => {
                const typeInfo = getNotificationTypeInfo(stakeholder.notification_type);
                
                return (
                  <Card key={stakeholder.id || index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{stakeholder.name}</h4>
                            <Badge className={`${typeInfo.color} text-white text-xs`}>
                              {typeInfo.icon} {typeInfo.label}
                            </Badge>
                            {stakeholder.response_status && (
                              <Badge variant="outline" className="text-xs">
                                {stakeholder.response_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {stakeholder.response_status === 'acknowledged' && <Eye className="h-3 w-3 mr-1" />}
                                {stakeholder.response_status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {stakeholder.response_status === 'rejected' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {stakeholder.response_status}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="font-medium">{stakeholder.position}</div>
                              <div className="text-xs text-muted-foreground">Cargo</div>
                            </div>
                            
                            <div>
                              <div className="font-medium">{stakeholder.email}</div>
                              <div className="text-xs text-muted-foreground">Email</div>
                            </div>
                            
                            <div>
                              <div className="font-medium">{stakeholder.phone || 'Não informado'}</div>
                              <div className="text-xs text-muted-foreground">Telefone</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editStakeholder(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteStakeholder(index)}
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

            {/* Resumo de Aprovações */}
            {requiresApproval && (
              <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Aprovação Necessária:</strong> Este risco requer aprovação formal de{' '}
                  {stakeholders?.filter(s => s.notification_type === 'approval').length || 0} stakeholder(s) 
                  antes da finalização.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status da Etapa */}
      <Card className="bg-slate-50 dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                (stakeholders?.length || 0) > 0 ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                Status da Etapa 6: Comunicação
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {stakeholders?.length || 0} stakeholder{(stakeholders?.length || 0) !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-muted-foreground">
                {stakeholders?.filter(s => s.notification_type === 'approval').length || 0} aprovação(ões) necessária(s)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};