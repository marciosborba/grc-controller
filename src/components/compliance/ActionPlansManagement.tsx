import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, CheckCircle, AlertTriangle, Clock, Edit, Trash2, User } from 'lucide-react';
import { useComplianceActionPlans, ActionPlan, ActionPlanActivity } from '@/hooks/useComplianceActionPlans';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';

export function ActionPlansManagement() {
  const { plans, loading, fetchPlans, createPlan, updatePlan, addActivity, updateActivity, deleteActivity, updateActivityStatus } = useComplianceActionPlans();
  const effectiveTenantId = useCurrentTenantId();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);
  const [showEditActivityDialog, setShowEditActivityDialog] = useState(false);
  const [nonConformities, setNonConformities] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || null;

  // Form States
  const [newPlanForm, setNewPlanForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    nao_conformidade_id: '',
    objetivo: '',
    causa_raiz: '',
    responsavel_id: ''
  });

  const [editPlanForm, setEditPlanForm] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'open',
    objetivo: '',
    causa_raiz: '',
    responsavel_id: ''
  });

  const [newActivityForm, setNewActivityForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    responsibleId: ''
  });

  const [editActivityForm, setEditActivityForm] = useState({
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    responsibleId: '',
    status: 'open'
  });

  useEffect(() => {
    fetchPlans();
    loadNonConformities();
    loadProfiles();
  }, [fetchPlans]);

  const loadNonConformities = async () => {
    if (!effectiveTenantId) return;
    const { data } = await supabase
      .from('nao_conformidades')
      .select('id, codigo, titulo')
      .eq('tenant_id', effectiveTenantId)
      .in('status', ['aberta', 'em_tratamento']);
    setNonConformities(data || []);
  };

  const loadProfiles = async () => {
    // Basic profile fetch - could be optimized to filter by roles if needed
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email');
    setProfiles(data || []);
  };

  const handleCreatePlan = async () => {
    if (!newPlanForm.title) return;

    await createPlan({
      title: newPlanForm.title,
      description: newPlanForm.description,
      priority: newPlanForm.priority,
      due_date: newPlanForm.dueDate,
      nao_conformidade_id: newPlanForm.nao_conformidade_id === 'none' ? undefined : newPlanForm.nao_conformidade_id,
      objetivo: newPlanForm.objetivo,
      causa_raiz: newPlanForm.causa_raiz,
      responsavel_id: newPlanForm.responsavel_id
    });

    setShowNewPlanDialog(false);
    setNewPlanForm({ title: '', description: '', priority: 'medium', dueDate: '', nao_conformidade_id: '', objetivo: '', causa_raiz: '', responsavel_id: '' });
  };

  const handleUpdatePlan = async () => {
    if (!editPlanForm.id || !editPlanForm.title) return;

    await updatePlan(editPlanForm.id, {
      title: editPlanForm.title,
      description: editPlanForm.description,
      priority: editPlanForm.priority as any,
      due_date: editPlanForm.dueDate,
      status: editPlanForm.status as any,
      objetivo: editPlanForm.objetivo,
      causa_raiz: editPlanForm.causa_raiz
    });

    setShowEditPlanDialog(false);
  };

  const openEditPlanDialog = (plan: ActionPlan) => {
    setEditPlanForm({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      priority: plan.priority,
      dueDate: plan.due_date || '',
      status: plan.status,
      objetivo: plan.objetivo || '',
      causa_raiz: plan.causa_raiz || '',
      responsavel_id: '' // Not easily available in plan object without extra profile join mapping in hook, keeping simple
    });
    setShowEditPlanDialog(true);
  };

  const handleAddActivity = async () => {
    if (!selectedPlan || !newActivityForm.title) return;

    await addActivity(selectedPlan.id, {
      title: newActivityForm.title,
      description: newActivityForm.description,
      priority: newActivityForm.priority,
      due_date: newActivityForm.dueDate,
      responsible_id: newActivityForm.responsibleId
    });

    setShowNewActivityDialog(false);
    setNewActivityForm({ title: '', description: '', priority: 'medium', dueDate: '', responsibleId: '' });
  };

  const handleUpdateActivity = async () => {
    if (!editActivityForm.id || !editActivityForm.title) return;

    await updateActivity(editActivityForm.id, {
      title: editActivityForm.title,
      description: editActivityForm.description,
      priority: editActivityForm.priority,
      due_date: editActivityForm.dueDate,
      responsible_id: editActivityForm.responsibleId,
      status: editActivityForm.status
    });

    setShowEditActivityDialog(false);
  };

  const openEditActivityDialog = (activity: ActionPlanActivity) => {
    setEditActivityForm({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      priority: activity.priority,
      dueDate: activity.due_date || '',
      responsibleId: activity.responsible_id || '',
      status: activity.status
    });
    setShowEditActivityDialog(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-transparent';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-transparent';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-transparent';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planos de Ação e Correção</h2>
          <p className="text-muted-foreground">Gerencie planos de ação para conformidade e tratamento de não conformidades.</p>
        </div>
        <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Plano</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Plano de Ação</DialogTitle>
              <DialogDescription>Preencha os dados do plano de ação corretiva ou preventiva.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Não Conformidade (Opcional)</Label>
                <Select value={newPlanForm.nao_conformidade_id} onValueChange={(val) => setNewPlanForm({ ...newPlanForm, nao_conformidade_id: val })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma / Ação Preventiva</SelectItem>
                    {nonConformities.map(nc => (
                      <SelectItem key={nc.id} value={nc.id}>{nc.codigo} - {nc.titulo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Título do Plano</Label>
                <Input value={newPlanForm.title} onChange={e => setNewPlanForm({ ...newPlanForm, title: e.target.value })} placeholder="Ex: Implementação de Backup" />
              </div>

              <div className="grid gap-2">
                <Label>Objetivo</Label>
                <Textarea value={newPlanForm.objetivo} onChange={e => setNewPlanForm({ ...newPlanForm, objetivo: e.target.value })} placeholder="Qual o objetivo a ser atingido?" />
              </div>

              <div className="grid gap-2">
                <Label>Causa Raiz</Label>
                <Textarea value={newPlanForm.causa_raiz} onChange={e => setNewPlanForm({ ...newPlanForm, causa_raiz: e.target.value })} placeholder="Qual a causa raiz identificada?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Responsável</Label>
                  <Select value={newPlanForm.responsavel_id} onValueChange={val => setNewPlanForm({ ...newPlanForm, responsavel_id: val })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {profiles.map(profile => (
                        <SelectItem key={profile.id} value={profile.id}>{profile.full_name || profile.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Prazo</Label>
                  <Input type="date" value={newPlanForm.dueDate} onChange={e => setNewPlanForm({ ...newPlanForm, dueDate: e.target.value })} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select value={newPlanForm.priority} onValueChange={val => setNewPlanForm({ ...newPlanForm, priority: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePlan}>Criar Plano</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List View */}
        <div className="md:col-span-1 space-y-4">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Planos Ativos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {plans.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">Nenhum plano encontrado.</div>
                ) : (
                  plans.map(plan => (
                    <div
                      key={plan.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedPlanId === plan.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm line-clamp-1">{plan.title}</h4>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(plan.status)} border-0`}>
                          {plan.status === 'open' ? 'Planejado' :
                            plan.status === 'in_progress' ? 'Em Andamento' :
                              plan.status === 'completed' ? 'Concluído' : plan.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {plan.due_date ? format(new Date(plan.due_date), 'dd/MM/yyyy') : 'Sem prazo'}
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getPriorityColor(plan.priority)}`}>{plan.priority}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail View */}
        <div className="md:col-span-2">
          {selectedPlan ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">{selectedPlan.title}</CardTitle>
                    <CardDescription className="mt-1">{selectedPlan.description || "Sem descrição"}</CardDescription>
                    {(selectedPlan.causa_raiz || selectedPlan.objetivo || selectedPlan.responsavel_nome) && (
                      <div className="mt-2 text-sm text-muted-foreground space-y-1">
                        {selectedPlan.responsavel_nome && <p><span className="font-medium">Responsável:</span> {selectedPlan.responsavel_nome}</p>}
                        {selectedPlan.objetivo && <p><span className="font-medium">Objetivo:</span> {selectedPlan.objetivo}</p>}
                        {selectedPlan.causa_raiz && <p><span className="font-medium">Causa Raiz:</span> {selectedPlan.causa_raiz}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setShowNewActivityDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Nova Atividade
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => openEditPlanDialog(selectedPlan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span>Prazo: <span className="font-medium">{selectedPlan.due_date ? format(new Date(selectedPlan.due_date), 'dd/MM/yyyy') : 'N/A'}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="text-muted-foreground h-4 w-4" />
                    <span>Prioridade: <span className="capitalize">{selectedPlan.priority}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="text-muted-foreground h-4 w-4" />
                    <span>Conclusão: <span className="font-medium">{selectedPlan.progress}%</span></span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="p-4 bg-muted/20 border-b">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    Atividades e Etapas
                    <Badge variant="secondary" className="text-xs">{selectedPlan.activities?.length || 0}</Badge>
                  </h3>
                </div>
                <div className="divide-y">
                  {selectedPlan.activities && selectedPlan.activities.length > 0 ? (
                    selectedPlan.activities.map(activity => (
                      <div key={activity.id} className="p-4 hover:bg-muted/30 group">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-5 w-5 rounded-full border ${activity.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground'}`}
                              onClick={e => { e.stopPropagation(); updateActivityStatus(activity.id, activity.status === 'completed' ? 'open' : 'completed'); }}
                            >
                              {activity.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                            </Button>
                            <div className={activity.status === 'completed' ? 'opacity-60 line-through' : ''}>
                              <h4 className="text-sm font-medium">{activity.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                              {activity.responsible_name && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <User className="h-3 w-3" /> {activity.responsible_name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-[10px] ${getPriorityColor(activity.priority)}`}>{activity.priority}</Badge>
                            <span className="text-xs text-muted-foreground">{activity.due_date ? format(new Date(activity.due_date), 'dd/MM') : '-'}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); openEditActivityDialog(activity); }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); deleteActivity(activity.id); }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">Nenhuma atividade registrada.</p>
                      <Button variant="link" size="sm" onClick={() => setShowNewActivityDialog(true)}>Adicionar primeira atividade</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-center bg-muted/10">
              <div className="bg-muted p-4 rounded-full mb-4"><CheckCircle className="h-8 w-8 text-muted-foreground" /></div>
              <h3 className="text-lg font-medium">Selecione um Plano</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2">Selecione um plano de ação na lista ao lado para ver detalhes e gerenciar suas atividades.</p>
              <Button className="mt-6" onClick={() => setShowNewPlanDialog(true)}><Plus className="mr-2 h-4 w-4" /> Criar Novo Plano</Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano de Ação</DialogTitle>
            <DialogDescription>Atualize as informações do plano.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título do Plano</Label>
              <Input value={editPlanForm.title} onChange={e => setEditPlanForm({ ...editPlanForm, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea value={editPlanForm.description} onChange={e => setEditPlanForm({ ...editPlanForm, description: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Objetivo</Label>
              <Textarea value={editPlanForm.objetivo} onChange={e => setEditPlanForm({ ...editPlanForm, objetivo: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Causa Raiz</Label>
              <Textarea value={editPlanForm.causa_raiz} onChange={e => setEditPlanForm({ ...editPlanForm, causa_raiz: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select value={editPlanForm.priority} onValueChange={val => setEditPlanForm({ ...editPlanForm, priority: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Prazo</Label>
                <Input type="date" value={editPlanForm.dueDate} onChange={e => setEditPlanForm({ ...editPlanForm, dueDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={editPlanForm.status} onValueChange={val => setEditPlanForm({ ...editPlanForm, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Planejado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="verified">Verificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdatePlan}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Activity Dialog */}
      <Dialog open={showNewActivityDialog} onOpenChange={setShowNewActivityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Atividade</DialogTitle>
            <DialogDescription>Adicione uma tarefa ao plano "{selectedPlan?.title}".</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input value={newActivityForm.title} onChange={e => setNewActivityForm({ ...newActivityForm, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea value={newActivityForm.description} onChange={e => setNewActivityForm({ ...newActivityForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Responsável</Label>
                <Select value={newActivityForm.responsibleId} onValueChange={val => setNewActivityForm({ ...newActivityForm, responsibleId: val })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>{profile.full_name || profile.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select value={newActivityForm.priority} onValueChange={val => setNewActivityForm({ ...newActivityForm, priority: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Prazo</Label>
                <Input type="date" value={newActivityForm.dueDate} onChange={e => setNewActivityForm({ ...newActivityForm, dueDate: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddActivity}>Salvar Atividade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={showEditActivityDialog} onOpenChange={setShowEditActivityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
            <DialogDescription>Atualize os detalhes da atividade.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Título</Label>
              <Input value={editActivityForm.title} onChange={e => setEditActivityForm({ ...editActivityForm, title: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea value={editActivityForm.description} onChange={e => setEditActivityForm({ ...editActivityForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Responsável</Label>
                <Select value={editActivityForm.responsibleId} onValueChange={val => setEditActivityForm({ ...editActivityForm, responsibleId: val })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {profiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>{profile.full_name || profile.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select value={editActivityForm.priority} onValueChange={val => setEditActivityForm({ ...editActivityForm, priority: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Prazo</Label>
                <Input type="date" value={editActivityForm.dueDate} onChange={e => setEditActivityForm({ ...editActivityForm, dueDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={editActivityForm.status} onValueChange={val => setEditActivityForm({ ...editActivityForm, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Planejado</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="verified">Verificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateActivity}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}