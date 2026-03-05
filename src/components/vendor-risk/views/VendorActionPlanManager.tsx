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
    AlertCircle, Zap, ChevronRight, ChevronDown
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
        case 'critical': return 'bg-red-500 text-white dark:bg-red-600 border-none font-medium';
        case 'high': return 'bg-orange-500 text-white dark:bg-orange-600 border-none font-medium';
        case 'medium': return 'bg-yellow-500 text-white dark:bg-yellow-600 border-none font-medium';
        case 'low': return 'bg-green-500 text-white dark:bg-green-600 border-none font-medium';
        default: return 'bg-gray-500 text-white dark:bg-gray-600 border-none font-medium';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'bg-emerald-500 text-white dark:bg-emerald-600 border-none font-medium';
        case 'in_progress': return 'bg-blue-500 text-white dark:bg-blue-600 border-none font-medium';
        case 'verified': return 'bg-purple-500 text-white dark:bg-purple-600 border-none font-medium';
        case 'pending_validation': return 'bg-amber-500 text-white dark:bg-amber-600 border-none font-medium';
        case 'available_to_vendor': return 'bg-teal-500 text-white dark:bg-teal-600 border-none font-medium';
        case 'open': return 'bg-slate-500 text-white dark:bg-slate-600 border-none font-medium';
        default: return 'bg-gray-500 text-white dark:bg-gray-600 border-none font-medium';
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

    const [expandedVendors, setExpandedVendors] = useState<string[]>([]);
    const [expandedAssessments, setExpandedAssessments] = useState<string[]>([]);

    const selectedPlan = plans.find(p => p.id === selectedPlanId) || null;

    const pendingPlans = plans.filter(p => p.status === 'pending_validation');
    const completedPlans = plans.filter(p => ['completed', 'verified'].includes(p.status));
    const activePlans = plans.filter(p => !['pending_validation', 'completed', 'verified'].includes(p.status));

    const toggleVendor = (vendor: string) => {
        setExpandedVendors(prev => prev.includes(vendor) ? prev.filter(v => v !== vendor) : [...prev, vendor]);
    };

    const toggleAssessment = (assessmentKey: string) => {
        setExpandedAssessments(prev => prev.includes(assessmentKey) ? prev.filter(a => a !== assessmentKey) : [...prev, assessmentKey]);
    };

    const groupPlans = (plansToGroup: ActionPlan[]) => {
        const grouped: Record<string, Record<string, ActionPlan[]>> = {};
        plansToGroup.forEach(plan => {
            const assessmentFromState = assessments.find(a => a.id === plan.assessment_id);
            const vendorName = plan.vendor_name || assessmentFromState?.vendor_registry?.name || 'Fornecedor Desconhecido';
            const assessmentName = plan.assessment_name || assessmentFromState?.assessment_name || 'Outros / Sem Assessment';

            if (!grouped[vendorName]) grouped[vendorName] = {};
            if (!grouped[vendorName][assessmentName]) grouped[vendorName][assessmentName] = [];
            grouped[vendorName][assessmentName].push(plan);
        });
        return grouped;
    };

    const activeGrouped = groupPlans(activePlans);
    const pendingGrouped = groupPlans(pendingPlans);
    const completedGrouped = groupPlans(completedPlans);

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
        const ok = await createPlan({
            vendor_id: assessment.vendor_id,
            assessment_id: assessment.id,
            assessment_name: assessment.assessment_name,
            title: newPlanForm.title,
            description: newPlanForm.description,
            priority: newPlanForm.priority,
            due_date: newPlanForm.dueDate
        });
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
                            <Button size="icon" variant="ghost" onClick={() => openEditPlanDialog(plan)} className="shrink-0 h-8 w-8">
                                <Edit className="h-4 w-4" />
                            </Button>
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
                            <div key={activity.id} className={`p-3 hover:bg-muted/30 group transition-colors ${activity.status === 'completed' ? 'bg-green-50/50 dark:bg-green-950/10' : ''
                                }`}>
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
                                            {activity.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{activity.description}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getStatusColor(activity.status)}`}>
                                            {getStatusLabel(activity.status)}
                                        </Badge>
                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 hidden sm:inline-flex ${getPriorityColor(activity.priority)}`}>
                                            {getPriorityLabel(activity.priority)}
                                        </Badge>
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
                                <div className="flex items-center gap-3 mt-1.5 ml-7 text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Prazo: {activity.due_date ? format(new Date(activity.due_date), 'dd/MM/yyyy') : 'Sem prazo'}
                                    </span>
                                    {(activity.responsible_name || (activity as any).metadados?.responsavel_nome) && (
                                        <span className="flex items-center gap-1">
                                            👤 {(activity as any).metadados?.responsavel_nome || activity.responsible_name}
                                        </span>
                                    )}
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

    const renderTreeView = (groupedData: Record<string, Record<string, ActionPlan[]>>) => {
        if (Object.keys(groupedData).length === 0) return <div className="p-6 text-center text-muted-foreground text-sm">Nenhum plano encontrado.</div>;

        return (
            <div className="divide-y max-h-[600px] overflow-y-auto">
                {Object.entries(groupedData).map(([vendorName, assessmentsMap]) => (
                    <div key={vendorName} className="flex flex-col">
                        <div
                            className="flex items-center gap-2 p-3 bg-muted/30 hover:bg-muted/50 cursor-pointer border-b"
                            onClick={() => toggleVendor(vendorName)}
                        >
                            {expandedVendors.includes(vendorName) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <span className="font-semibold text-sm truncate flex-1">{vendorName}</span>
                            <Badge variant="secondary" className="text-xs">{Object.values(assessmentsMap).flat().length}</Badge>
                        </div>

                        {expandedVendors.includes(vendorName) && Object.entries(assessmentsMap).map(([assessmentName, plansList]) => {
                            const assessmentKey = `${vendorName}-${assessmentName}`;
                            return (
                                <div key={assessmentKey} className="flex flex-col border-b last:border-0 pl-4 bg-muted/10">
                                    <div className="flex items-center justify-between p-3 hover:bg-muted/30 border-b border-dashed group">
                                        <div
                                            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                            onClick={() => toggleAssessment(assessmentKey)}
                                        >
                                            {expandedAssessments.includes(assessmentKey) ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                                            <span className="font-medium text-sm text-muted-foreground truncate">{assessmentName}</span>
                                            <Badge variant="outline" className="text-[10px] shrink-0">{plansList.length}</Badge>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 px-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 border border-transparent hover:border-input"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const asm = assessments.find(a => a.assessment_name === assessmentName);
                                                if (asm) setNewPlanForm(prev => ({ ...prev, assessmentId: asm.id }));
                                                setShowNewPlanDialog(true);
                                            }}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Novo Plano
                                        </Button>
                                    </div>

                                    {expandedAssessments.includes(assessmentKey) && (
                                        <div className="pl-6 border-l-2 border-muted ml-2">
                                            {plansList.map(plan => (
                                                <div key={plan.id} className="border-b last:border-0">
                                                    <PlanCard
                                                        plan={plan}
                                                        selected={selectedPlanId === plan.id}
                                                        onClick={() => setSelectedPlanId(plan.id)}
                                                        getPriorityColor={getPriorityColor}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

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
                <TabsList className="w-full sm:w-auto flex flex-wrap gap-1">
                    <TabsTrigger value="plans" className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs sm:text-sm">
                        <ListChecks className="h-4 w-4" />
                        <span>Planos Ativos</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{activePlans.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="validation" className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs sm:text-sm">
                        <ShieldAlert className="h-4 w-4" />
                        <span>Validação</span>
                        {pendingPlans.length > 0 && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-white">{pendingPlans.length}</Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs sm:text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Concluídos</span>
                        {completedPlans.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{completedPlans.length}</Badge>
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
                                    {renderTreeView(activeGrouped)}
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
                                            {renderTreeView(pendingGrouped)}
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

                {/* ── TAB: Planos Concluídos ─────────────────────────────── */}
                <TabsContent value="completed" className="mt-4">
                    {completedPlans.length === 0 ? (
                        <EmptyState message="Nenhum plano concluído encontrado." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            <div className="md:col-span-1">
                                <Card className="h-full">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            Histórico de Planos
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {renderTreeView(completedGrouped)}
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="md:col-span-2">
                                {selectedPlan && completedPlans.find(p => p.id === selectedPlan.id)
                                    ? renderPlanDetail(selectedPlan, false)
                                    : <EmptyState message="Selecione um plano concluído para visualizar seu histórico e evidências." />
                                }
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
