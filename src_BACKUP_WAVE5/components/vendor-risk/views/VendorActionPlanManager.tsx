import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Calendar, CheckCircle, AlertTriangle, Clock, ArrowRight, Trash2, Edit } from 'lucide-react';
import { useVendorActionPlans, ActionPlan, ActionPlanActivity } from '@/hooks/useVendorActionPlans';
import useVendorRiskManagement from '@/hooks/useVendorRiskManagement';
import { format } from 'date-fns';

export const VendorActionPlanManager: React.FC = () => {
    const { plans, loading: plansLoading, fetchPlans, createPlan, updatePlan, updateActivity, addActivity, updateActivityStatus, deleteActivity } = useVendorActionPlans();
    const { assessments, fetchAssessments } = useVendorRiskManagement();

    const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
    const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);
    const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
    const [showEditActivityDialog, setShowEditActivityDialog] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const selectedPlan = plans.find(p => p.id === selectedPlanId) || null;

    // New Plan Form State
    const [newPlanForm, setNewPlanForm] = useState({
        assessmentId: '',
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
    });

    // Edit Plan Form State
    const [editPlanForm, setEditPlanForm] = useState({
        id: '',
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        status: 'open'
    });

    // New Activity Form State
    const [newActivityForm, setNewActivityForm] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        responsibleId: ''
    });

    // Edit Activity Form State
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
        fetchAssessments();
    }, []);

    // Auto-fill title when assessment is selected
    useEffect(() => {
        if (newPlanForm.assessmentId) {
            const assessment = assessments.find(a => a.id === newPlanForm.assessmentId);
            if (assessment) {
                setNewPlanForm(prev => {
                    // Only update if title is empty to avoid overwriting user edits
                    if (!prev.title) {
                        return {
                            ...prev,
                            title: `Plano de Ação - ${assessment.vendor_registry?.name || 'Fornecedor'}`
                        };
                    }
                    return prev;
                });
            }
        }
    }, [newPlanForm.assessmentId, assessments]);

    console.log('ActionPlanManager: Loaded assessments:', assessments.length);

    const handleCreatePlan = async () => {
        console.log('handleCreatePlan called', newPlanForm);
        if (!newPlanForm.assessmentId || !newPlanForm.title) {
            console.warn('Missing required fields');
            return;
        }

        // Find assessment to get vendor_id
        const assessment = assessments.find(a => a.id === newPlanForm.assessmentId);
        if (!assessment) {
            console.error('Assessment not found for id:', newPlanForm.assessmentId);
            return;
        }

        const success = await createPlan({
            vendor_id: assessment.vendor_id,
            title: newPlanForm.title,
            description: newPlanForm.description,
            priority: newPlanForm.priority,
            due_date: newPlanForm.dueDate
        });

        if (success) {
            setShowNewPlanDialog(false);
            setNewPlanForm({ assessmentId: '', title: '', description: '', priority: 'medium', dueDate: '' });
        }
    };

    const handleAddActivity = async () => {
        if (!selectedPlan || !newActivityForm.title) {
            console.warn('Missing title or selected plan');
            return;
        }

        if (!newActivityForm.dueDate) {
            // Basic validation, could be improved with toast
            console.warn('Missing due date for activity (Required)');
            // Optional: You might want to use useToast here to alert the user
            return;
        }

        await addActivity(selectedPlan.id, {
            title: newActivityForm.title,
            description: newActivityForm.description,
            priority: newActivityForm.priority,
            due_date: newActivityForm.dueDate
            // responsible_id: newActivityForm.responsibleId // TODO: Add user selection later
        });

        setShowNewActivityDialog(false);
        setNewActivityForm({ title: '', description: '', priority: 'medium', dueDate: '', responsibleId: '' });
    };

    const openEditActivityDialog = (activity: ActionPlanActivity) => {
        setEditActivityForm({
            id: activity.id,
            title: activity.title,
            description: activity.description,
            priority: activity.priority,
            dueDate: activity.due_date ? activity.due_date : '',
            responsibleId: activity.responsible_id || '',
            status: activity.status
        });
        setShowEditActivityDialog(true);
    };

    const handleUpdateActivity = async () => {
        if (!editActivityForm.id || !editActivityForm.title) return;

        const success = await updateActivity(editActivityForm.id, {
            title: editActivityForm.title,
            description: editActivityForm.description,
            priority: editActivityForm.priority,
            due_date: editActivityForm.dueDate,
            responsible_id: editActivityForm.responsibleId,
            status: editActivityForm.status
        });

        if (success) {
            setShowEditActivityDialog(false);
        }
    };

    const openEditPlanDialog = (plan: ActionPlan) => {
        setEditPlanForm({
            id: plan.id,
            title: plan.title,
            description: plan.description,
            priority: plan.priority,
            dueDate: plan.due_date ? plan.due_date : '',
            status: plan.status
        });
        setShowEditPlanDialog(true);
    };

    const handleUpdatePlan = async () => {
        if (!editPlanForm.id || !editPlanForm.title) return;

        const success = await updatePlan(editPlanForm.id, {
            title: editPlanForm.title,
            description: editPlanForm.description,
            priority: editPlanForm.priority,
            due_date: editPlanForm.dueDate,
            status: editPlanForm.status
        });

        if (success) {
            setShowEditPlanDialog(false);
            // No need to manually update selectedPlan as it is derived from plans
            // and fetchPlans is called in updatePlan
        }
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
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-transparent';
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-transparent';
            case 'verified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-transparent';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-transparent';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Planos de Ação</h2>
                    <p className="text-muted-foreground">
                        Gerencie ações corretivas e preventivas para fornecedores
                    </p>
                </div>
                <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Plano de Ação
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Plano de Ação</DialogTitle>
                            <DialogDescription>
                                Selecione um assessment base para gerar o plano de ação.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Assessment Origem</Label>
                                <Select
                                    value={newPlanForm.assessmentId}
                                    onValueChange={(val) => {
                                        setNewPlanForm(prev => ({
                                            ...prev,
                                            assessmentId: val
                                            // Note: Title will be updated by useEffect if needed, 
                                            // but distinct separation avoids render loops or undefined access in render
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um assessment..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assessments.map(assessment => (
                                            <SelectItem key={assessment.id} value={assessment.id}>
                                                {assessment.assessment_name || `Assessment ${assessment.id.slice(0, 8)}`} - {assessment.vendor_registry?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground text-right px-1">
                                    {assessments.length} assessment(s) disponível(is)
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label>Título do Plano</Label>
                                <Input
                                    value={newPlanForm.title}
                                    onChange={(e) => setNewPlanForm({ ...newPlanForm, title: e.target.value })}
                                    placeholder="Ex: Adequação LGPD"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Descrição</Label>
                                <Textarea
                                    value={newPlanForm.description}
                                    onChange={(e) => setNewPlanForm({ ...newPlanForm, description: e.target.value })}
                                    placeholder="Descreva o objetivo deste plano..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Prioridade</Label>
                                    <Select
                                        value={newPlanForm.priority}
                                        onValueChange={(val) => setNewPlanForm({ ...newPlanForm, priority: val })}
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
                                <div className="grid gap-2">
                                    <Label>Prazo</Label>
                                    <Input
                                        type="date"
                                        value={newPlanForm.dueDate}
                                        onChange={(e) => setNewPlanForm({ ...newPlanForm, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreatePlan}>Criar Plano</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: List of Plans */}
                <div className="md:col-span-1 space-y-4">
                    <Card className="h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Planos Ativos</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y max-h-[600px] overflow-y-auto">
                                {plans.length === 0 ? (
                                    <div className="p-4 text-center text-muted-foreground text-sm">
                                        Nenhum plano encontrado.
                                    </div>
                                ) : (
                                    plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedPlanId === plan.id ? 'bg-muted' : ''}`}
                                            onClick={() => setSelectedPlanId(plan.id)}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-sm line-clamp-1">{plan.title}</h4>
                                                <Badge variant="outline" className={`text-xs ${getStatusColor(plan.status)} border-0`}>
                                                    {plan.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                {plan.description}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {plan.due_date ? format(new Date(plan.due_date), 'dd/MM/yyyy') : 'Sem prazo'}
                                                </div>
                                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getPriorityColor(plan.priority)}`}>
                                                    {plan.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Plan Details & Activities */}
                <div className="md:col-span-2">
                    {selectedPlan ? (
                        <Card className="h-full flex flex-col">
                            <CardHeader className="border-b pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {selectedPlan.title}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {selectedPlan.description}
                                        </CardDescription>
                                    </div>
                                    <Button size="sm" onClick={() => setShowNewActivityDialog(true)}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Nova Atividade
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => openEditPlanDialog(selectedPlan)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
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
                                        Atividades do Plano
                                        <Badge variant="secondary" className="text-xs">{selectedPlan.activities?.length || 0}</Badge>
                                    </h3>
                                </div>
                                <div className="divide-y">
                                    {selectedPlan.activities && selectedPlan.activities.length > 0 ? (
                                        selectedPlan.activities.map(activity => (
                                            <div key={activity.id} className="p-4 hover:bg-muted/30 group">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex  gap-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={`h-5 w-5 rounded-full border ${activity.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground'}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                console.log('Click activity:', activity.id, 'Current status:', activity.status);
                                                                updateActivityStatus(activity.id, activity.status === 'completed' ? 'open' : 'completed');
                                                            }}
                                                        >
                                                            {activity.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                                                        </Button>
                                                        <div className={activity.status === 'completed' ? 'opacity-60 line-through' : ''}>
                                                            <h4 className="text-sm font-medium">{activity.title}</h4>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={`text-[10px] ${getPriorityColor(activity.priority)}`}>
                                                            {activity.priority}
                                                        </Badge>
                                                        <div className="text-xs text-muted-foreground w-20 text-right">
                                                            {activity.due_date ? format(new Date(activity.due_date), 'dd/MM') : '-'}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditActivityDialog(activity);
                                                            }}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deleteActivity(activity.id)}
                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <p className="text-sm">Nenhuma atividade registrada neste plano.</p>
                                            <Button variant="link" size="sm" onClick={() => setShowNewActivityDialog(true)}>
                                                Adicionar primeira atividade
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 border rounded-lg border-dashed text-center bg-muted/10">
                            <div className="bg-muted p-4 rounded-full mb-4">
                                <CheckCircle className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">Selecione um Plano</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                Selecione um plano de ação na lista ao lado para ver detalhes e gerenciar suas atividades.
                            </p>
                            <Button className="mt-6" onClick={() => setShowNewPlanDialog(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Criar Novo Plano
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* New Activity Dialog */}
            <Dialog open={showNewActivityDialog} onOpenChange={setShowNewActivityDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Atividade</DialogTitle>
                        <DialogDescription>
                            Adicione uma tarefa ao plano de ação "{selectedPlan?.title}".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Título</Label>
                            <Input
                                value={newActivityForm.title}
                                onChange={(e) => setNewActivityForm({ ...newActivityForm, title: e.target.value })}
                                placeholder="O que precisa ser feito?"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={newActivityForm.description}
                                onChange={(e) => setNewActivityForm({ ...newActivityForm, description: e.target.value })}
                                placeholder="Detalhes da atividade..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Prioridade</Label>
                                <Select
                                    value={newActivityForm.priority}
                                    onValueChange={(val) => setNewActivityForm({ ...newActivityForm, priority: val })}
                                >
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
                                <Input
                                    type="date"
                                    value={newActivityForm.dueDate}
                                    onChange={(e) => setNewActivityForm({ ...newActivityForm, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddActivity}>Salvar Atividade</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Edit Plan Dialog */}
            <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Editar Plano de Ação</DialogTitle>
                        <DialogDescription>
                            Atualize as informações do plano de ação.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Título do Plano</Label>
                            <Input
                                value={editPlanForm.title}
                                onChange={(e) => setEditPlanForm({ ...editPlanForm, title: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={editPlanForm.description}
                                onChange={(e) => setEditPlanForm({ ...editPlanForm, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Prioridade</Label>
                                <Select
                                    value={editPlanForm.priority}
                                    onValueChange={(val) => setEditPlanForm({ ...editPlanForm, priority: val })}
                                >
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
                                <Input
                                    type="date"
                                    value={editPlanForm.dueDate}
                                    onChange={(e) => setEditPlanForm({ ...editPlanForm, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={editPlanForm.status}
                                    onValueChange={(val) => setEditPlanForm({ ...editPlanForm, status: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Planejado</SelectItem>
                                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                                        <SelectItem value="completed">Concluído</SelectItem>
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

            {/* Edit Activity Dialog */}
            <Dialog open={showEditActivityDialog} onOpenChange={setShowEditActivityDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Atividade</DialogTitle>
                        <DialogDescription>
                            Atualize os detalhes da atividade.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Título</Label>
                            <Input
                                value={editActivityForm.title}
                                onChange={(e) => setEditActivityForm({ ...editActivityForm, title: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={editActivityForm.description}
                                onChange={(e) => setEditActivityForm({ ...editActivityForm, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Prioridade</Label>
                                <Select
                                    value={editActivityForm.priority}
                                    onValueChange={(val) => setEditActivityForm({ ...editActivityForm, priority: val })}
                                >
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
                                <Input
                                    type="date"
                                    value={editActivityForm.dueDate}
                                    onChange={(e) => setEditActivityForm({ ...editActivityForm, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select
                                    value={editActivityForm.status}
                                    onValueChange={(val) => setEditActivityForm({ ...editActivityForm, status: val })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Planejado</SelectItem>
                                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                                        <SelectItem value="completed">Concluído</SelectItem>
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
};
