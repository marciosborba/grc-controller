import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
    Plus, Calendar, CheckCircle, AlertTriangle, Clock, Trash2, Edit,
    ShieldAlert, ThumbsUp, ThumbsDown, Settings, ListChecks, Eye,
    AlertCircle, Zap,
} from 'lucide-react';
import { useVendorActionPlans, ActionPlan, ActionPlanActivity } from '@/hooks/useVendorActionPlans';
import useVendorRiskManagement from '@/hooks/useVendorRiskManagement';
import { ActionPlanConfigurator } from './ActionPlanConfigurator';
import { format } from 'date-fns';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getPriorityLabel = (p: string) =>
    ({ critical: 'Crítica', high: 'Alta', medium: 'Média', low: 'Baixa' }[p] ?? p);

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
        case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'verified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'pending_validation': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
        case 'available_to_vendor': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

const getStatusLabel = (status: string) => ({
    open: 'Planejado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    verified: 'Verificado',
    pending_validation: 'Aguardando Validação',
    available_to_vendor: 'Disponível ao Fornecedor',
}[status] ?? status);

// ─── Plan Card (shared between tabs) ─────────────────────────────────────────
const PlanCard: React.FC<{
    plan: ActionPlan;
    selected: boolean;
    onClick: () => void;
    getPriorityColor: (p: string) => string;
}> = ({ plan, selected, onClick }) => (
    <div
        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b last:border-0 ${selected ? 'bg-muted' : ''}`}
        onClick={onClick}
    >
        <div className="flex justify-between items-start mb-1 gap-1">
            <h4 className="font-medium text-sm line-clamp-2 flex-1">{plan.title}</h4>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${getStatusColor(plan.status)} border-0`}>
                {getStatusLabel(plan.status)}
            </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{plan.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {plan.due_date ? format(new Date(plan.due_date), 'dd/MM/yyyy') : 'Sem prazo'}
            </div>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getPriorityColor(plan.priority)}`}>
                {getPriorityLabel(plan.priority)}
            </Badge>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const VendorActionPlanManager: React.FC = () => {
    const {
        plans, loading: plansLoading,
        fetchPlans, createPlan, updatePlan, updateActivity, addActivity,
        updateActivityStatus, deleteActivity, approvePlan, rejectPlan,
    } = useVendorActionPlans();
    const { assessments, fetchAssessments } = useVendorRiskManagement();

    const [activeTab, setActiveTab] = useState('plans');
    const [showNewPlanDialog, setShowNewPlanDialog] = useState(false);
    const [showNewActivityDialog, setShowNewActivityDialog] = useState(false);
    const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
    const [showEditActivityDialog, setShowEditActivityDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectPlanId, setRejectPlanId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    const selectedPlan = plans.find(p => p.id === selectedPlanId) || null;

    const pendingPlans = plans.filter(p => p.status === 'pending_validation' || p.status === 'open');
    const activePlans = plans.filter(p => !['pending_validation', 'open'].includes(p.status));

    // ── Forms ──────────────────────────────────────────────────────────────
    const [newPlanForm, setNewPlanForm] = useState({ assessmentId: '', title: '', description: '', priority: 'medium', dueDate: '' });
    const [editPlanForm, setEditPlanForm] = useState({ id: '', title: '', description: '', priority: 'medium', dueDate: '', status: 'open' });
    const [newActivityForm, setNewActivityForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', responsibleId: '' });
    const [editActivityForm, setEditActivityForm] = useState({ id: '', title: '', description: '', priority: 'medium', dueDate: '', responsibleId: '', status: 'open' });

    useEffect(() => { fetchPlans(); fetchAssessments(); }, []);

    useEffect(() => {
        if (newPlanForm.assessmentId) {
            const a = assessments.find(a => a.id === newPlanForm.assessmentId);
            if (a) setNewPlanForm(prev => prev.title ? prev : { ...prev, title: `Plano de Ação - ${a.vendor_registry?.name ?? 'Fornecedor'}` });
        }
    }, [newPlanForm.assessmentId, assessments]);

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleCreatePlan = async () => {
        if (!newPlanForm.assessmentId || !newPlanForm.title) return;
        const assessment = assessments.find(a => a.id === newPlanForm.assessmentId);
        if (!assessment) return;
        const ok = await createPlan({ vendor_id: assessment.vendor_id, title: newPlanForm.title, description: newPlanForm.description, priority: newPlanForm.priority, due_date: newPlanForm.dueDate });
        if (ok) { setShowNewPlanDialog(false); setNewPlanForm({ assessmentId: '', title: '', description: '', priority: 'medium', dueDate: '' }); }
    };

    const handleAddActivity = async () => {
        if (!selectedPlan || !newActivityForm.title || !newActivityForm.dueDate) return;
        await addActivity(selectedPlan.id, { title: newActivityForm.title, description: newActivityForm.description, priority: newActivityForm.priority, due_date: newActivityForm.dueDate });
        setShowNewActivityDialog(false);
        setNewActivityForm({ title: '', description: '', priority: 'medium', dueDate: '', responsibleId: '' });
    };

    const openEditPlanDialog = (plan: ActionPlan) => {
        setEditPlanForm({ id: plan.id, title: plan.title, description: plan.description, priority: plan.priority, dueDate: plan.due_date ?? '', status: plan.status });
        setShowEditPlanDialog(true);
    };

    const handleUpdatePlan = async () => {
        if (!editPlanForm.id || !editPlanForm.title) return;
        const ok = await updatePlan(editPlanForm.id, { title: editPlanForm.title, description: editPlanForm.description, priority: editPlanForm.priority, due_date: editPlanForm.dueDate, status: editPlanForm.status });
        if (ok) setShowEditPlanDialog(false);
    };

    const openEditActivityDialog = (activity: ActionPlanActivity) => {
        setEditActivityForm({ id: activity.id, title: activity.title, description: activity.description, priority: activity.priority, dueDate: activity.due_date ?? '', responsibleId: activity.responsible_id ?? '', status: activity.status });
        setShowEditActivityDialog(true);
    };

    const handleUpdateActivity = async () => {
        if (!editActivityForm.id || !editActivityForm.title) return;
        const ok = await updateActivity(editActivityForm.id, { title: editActivityForm.title, description: editActivityForm.description, priority: editActivityForm.priority, due_date: editActivityForm.dueDate, responsible_id: editActivityForm.responsibleId, status: editActivityForm.status });
        if (ok) setShowEditActivityDialog(false);
    };

    const handleOpenRejectDialog = (planId: string) => {
        setRejectPlanId(planId);
        setRejectReason('');
        setShowRejectDialog(true);
    };

    const handleRejectPlan = async () => {
        if (!rejectPlanId) return;
        await rejectPlan(rejectPlanId, rejectReason);
        setShowRejectDialog(false);
        setRejectPlanId(null);
    };

    // ── Plan Detail Panel ──────────────────────────────────────────────────
    const renderPlanDetail = (plan: ActionPlan, showValidationActions = false) => (
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-base sm:text-lg line-clamp-2">{plan.title}</CardTitle>
                            {!showValidationActions && (
                                <Button size="icon" variant="ghost" onClick={() => openEditPlanDialog(plan)} className="shrink-0 h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <CardDescription className="mt-1 text-xs">{plan.description}</CardDescription>
                    </div>
                    {showValidationActions && (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleOpenRejectDialog(plan.id)}>
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                Rejeitar
                            </Button>
                            <Button size="sm" className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white" onClick={() => approvePlan(plan.id)}>
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Aprovar
                            </Button>
                        </div>
                    )}
                </div>

                {showValidationActions && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Gerado automaticamente</p>
                            <p>Este plano foi gerado pelo sistema após o fornecedor enviar o assessment. Revise antes de aprovar — ele ficará visível no portal do fornecedor após aprovação.</p>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span>Prazo: <span className="font-medium">{plan.due_date ? format(new Date(plan.due_date), 'dd/MM/yyyy') : 'N/A'}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <AlertTriangle className="text-muted-foreground h-4 w-4" />
                        <span>Prioridade: <span className="capitalize">{getPriorityLabel(plan.priority)}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CheckCircle className="text-muted-foreground h-4 w-4" />
                        <span>Conclusão: <span className="font-medium">{plan.progress}%</span></span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <div className="p-3 bg-muted/20 border-b flex items-center justify-between">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                        Atividades
                        <Badge variant="secondary" className="text-xs">{plan.activities?.length || 0}</Badge>
                    </h3>
                    {!showValidationActions && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowNewActivityDialog(true)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Nova Atividade
                        </Button>
                    )}
                </div>
                <div className="divide-y">
                    {plan.activities && plan.activities.length > 0 ? (
                        plan.activities.map(activity => (
                            <div key={activity.id} className="p-3 hover:bg-muted/30 group">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                        <Button
                                            variant="ghost" size="icon"
                                            className={`h-5 w-5 rounded-full border shrink-0 mt-0.5 ${activity.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground'}`}
                                            onClick={e => { e.stopPropagation(); updateActivityStatus(activity.id, activity.status === 'completed' ? 'open' : 'completed'); }}
                                        >
                                            {activity.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                                        </Button>
                                        <div className={`flex-1 min-w-0 ${activity.status === 'completed' ? 'opacity-60 line-through' : ''}`}>
                                            <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{activity.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 hidden sm:inline-flex ${getPriorityColor(activity.priority)}`}>
                                            {getPriorityLabel(activity.priority)}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {activity.due_date ? format(new Date(activity.due_date), 'dd/MM') : '-'}
                                        </span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={e => { e.stopPropagation(); openEditActivityDialog(activity); }}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => deleteActivity(activity.id)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <p className="text-sm">Nenhuma atividade registrada.</p>
                            {!showValidationActions && (
                                <Button variant="link" size="sm" onClick={() => setShowNewActivityDialog(true)}>
                                    Adicionar primeira atividade
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const EmptyState: React.FC<{ message: string; action?: React.ReactNode }> = ({ message, action }) => (
        <div className="h-64 flex flex-col items-center justify-center border rounded-lg border-dashed text-center bg-muted/10 p-6">
            <CheckCircle className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );

    // ────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Planos de Ação</h2>
                    <p className="text-sm text-muted-foreground">Gerencie ações corretivas e preventivas para fornecedores</p>
                </div>
                <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Plano de Ação
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Plano de Ação</DialogTitle>
                            <DialogDescription>Selecione um assessment base para gerar o plano de ação.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Assessment Origem</Label>
                                <Select value={newPlanForm.assessmentId} onValueChange={val => setNewPlanForm(prev => ({ ...prev, assessmentId: val }))}>
                                    <SelectTrigger><SelectValue placeholder="Selecione um assessment..." /></SelectTrigger>
                                    <SelectContent>
                                        {assessments.map(a => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.assessment_name || `Assessment ${a.id.slice(0, 8)}`} — {a.vendor_registry?.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Título do Plano</Label>
                                <Input value={newPlanForm.title} onChange={e => setNewPlanForm({ ...newPlanForm, title: e.target.value })} placeholder="Ex: Adequação LGPD" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Descrição</Label>
                                <Textarea value={newPlanForm.description} onChange={e => setNewPlanForm({ ...newPlanForm, description: e.target.value })} placeholder="Descreva o objetivo..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="grid gap-2">
                                    <Label>Prazo</Label>
                                    <Input type="date" value={newPlanForm.dueDate} onChange={e => setNewPlanForm({ ...newPlanForm, dueDate: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreatePlan}>Criar Plano</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* ── 3-TAB LAYOUT ─────────────────────────────────────────────── */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full sm:w-auto flex">
                    <TabsTrigger value="plans" className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs sm:text-sm">
                        <ListChecks className="h-4 w-4" />
                        <span>Planos</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{activePlans.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="validation" className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs sm:text-sm">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Validação</span>
                        {pendingPlans.length > 0 && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-white">{pendingPlans.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="config" className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs sm:text-sm">
                        <Settings className="h-4 w-4" />
                        <span>Configuração</span>
                    </TabsTrigger>
                </TabsList>

                {/* ── TAB: Planos de Ação ──────────────────────────────────── */}
                <TabsContent value="plans" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="md:col-span-1">
                            <Card className="h-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Planos Ativos</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y max-h-[600px] overflow-y-auto">
                                        {activePlans.length === 0 ? (
                                            <div className="p-6 text-center text-muted-foreground text-sm">Nenhum plano ativo.</div>
                                        ) : (
                                            activePlans.map(plan => (
                                                <PlanCard
                                                    key={plan.id}
                                                    plan={plan}
                                                    selected={selectedPlanId === plan.id}
                                                    onClick={() => setSelectedPlanId(plan.id)}
                                                    getPriorityColor={getPriorityColor}
                                                />
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-2">
                            {selectedPlan && activePlans.find(p => p.id === selectedPlan.id)
                                ? renderPlanDetail(selectedPlan, false)
                                : <EmptyState message="Selecione um plano de ação para ver detalhes e gerenciar atividades." action={<Button onClick={() => setShowNewPlanDialog(true)}><Plus className="h-4 w-4 mr-1" />Criar Novo Plano</Button>} />
                            }
                        </div>
                    </div>
                </TabsContent>

                {/* ── TAB: Aguardando Validação ────────────────────────────── */}
                <TabsContent value="validation" className="mt-4">
                    {pendingPlans.length === 0 ? (
                        <EmptyState message="Nenhum plano aguardando validação. Quando o fornecedor enviar o assessment, os planos gerados automaticamente aparecerão aqui." />
                    ) : (
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200">
                                <Zap className="h-4 w-4 shrink-0" />
                                <span><strong>{pendingPlans.length} plano(s)</strong> foram gerados automaticamente após envio do assessment. Revise e aprove para disponibilizar ao fornecedor.</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                                <div className="md:col-span-1">
                                    <Card className="h-full">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                                Aguardando Revisão
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="divide-y max-h-[600px] overflow-y-auto">
                                                {pendingPlans.map(plan => (
                                                    <PlanCard
                                                        key={plan.id}
                                                        plan={plan}
                                                        selected={selectedPlanId === plan.id}
                                                        onClick={() => setSelectedPlanId(plan.id)}
                                                        getPriorityColor={getPriorityColor}
                                                    />
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="md:col-span-2">
                                    {selectedPlan && pendingPlans.find(p => p.id === selectedPlan.id)
                                        ? renderPlanDetail(selectedPlan, true)
                                        : <EmptyState message="Selecione um plano para revisar e aprovar ou rejeitar." />
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* ── TAB: Configuração ────────────────────────────────────── */}
                <TabsContent value="config" className="mt-4">
                    <ActionPlanConfigurator />
                </TabsContent>
            </Tabs>

            {/* ── Dialogs ────────────────────────────────────────────────── */}
            {/* New Activity */}
            <Dialog open={showNewActivityDialog} onOpenChange={setShowNewActivityDialog}>
                <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nova Atividade</DialogTitle>
                        <DialogDescription>Adicione uma tarefa ao plano "{selectedPlan?.title}".</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label>Título</Label><Input value={newActivityForm.title} onChange={e => setNewActivityForm({ ...newActivityForm, title: e.target.value })} placeholder="O que precisa ser feito?" /></div>
                        <div className="grid gap-2"><Label>Descrição</Label><Textarea value={newActivityForm.description} onChange={e => setNewActivityForm({ ...newActivityForm, description: e.target.value })} placeholder="Detalhes..." /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Prioridade</Label>
                                <Select value={newActivityForm.priority} onValueChange={val => setNewActivityForm({ ...newActivityForm, priority: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="critical">Crítica</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2"><Label>Prazo</Label><Input type="date" value={newActivityForm.dueDate} onChange={e => setNewActivityForm({ ...newActivityForm, dueDate: e.target.value })} /></div>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleAddActivity}>Salvar Atividade</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Plan */}
            <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
                <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Plano de Ação</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label>Título</Label><Input value={editPlanForm.title} onChange={e => setEditPlanForm({ ...editPlanForm, title: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Descrição</Label><Textarea value={editPlanForm.description} onChange={e => setEditPlanForm({ ...editPlanForm, description: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Prioridade</Label>
                                <Select value={editPlanForm.priority} onValueChange={val => setEditPlanForm({ ...editPlanForm, priority: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="critical">Crítica</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2"><Label>Prazo</Label><Input type="date" value={editPlanForm.dueDate} onChange={e => setEditPlanForm({ ...editPlanForm, dueDate: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Status</Label>
                            <Select value={editPlanForm.status} onValueChange={val => setEditPlanForm({ ...editPlanForm, status: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="open">Planejado</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="completed">Concluído</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleUpdatePlan}>Salvar Alterações</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Activity */}
            <Dialog open={showEditActivityDialog} onOpenChange={setShowEditActivityDialog}>
                <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Atividade</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2"><Label>Título</Label><Input value={editActivityForm.title} onChange={e => setEditActivityForm({ ...editActivityForm, title: e.target.value })} /></div>
                        <div className="grid gap-2"><Label>Descrição</Label><Textarea value={editActivityForm.description} onChange={e => setEditActivityForm({ ...editActivityForm, description: e.target.value })} /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Prioridade</Label>
                                <Select value={editActivityForm.priority} onValueChange={val => setEditActivityForm({ ...editActivityForm, priority: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem><SelectItem value="high">Alta</SelectItem><SelectItem value="critical">Crítica</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2"><Label>Prazo</Label><Input type="date" value={editActivityForm.dueDate} onChange={e => setEditActivityForm({ ...editActivityForm, dueDate: e.target.value })} /></div>
                        </div>
                        <div className="grid gap-2"><Label>Status</Label>
                            <Select value={editActivityForm.status} onValueChange={val => setEditActivityForm({ ...editActivityForm, status: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="open">Planejado</SelectItem><SelectItem value="in_progress">Em Andamento</SelectItem><SelectItem value="completed">Concluído</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleUpdateActivity}>Salvar Alterações</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Plan Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <ThumbsDown className="h-5 w-5" />
                            Rejeitar Plano
                        </DialogTitle>
                        <DialogDescription>O plano será devolvido para edição. Informe o motivo da rejeição (opcional).</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Motivo da Rejeição</Label>
                        <Textarea
                            className="mt-2"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Ex: Prazo muito longo, precisa de mais detalhes..."
                            rows={3}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleRejectPlan}>Confirmar Rejeição</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
