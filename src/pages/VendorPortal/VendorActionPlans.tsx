import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Calendar, ExternalLink, FileText, CheckCircle, Clock, ChevronRight, ChevronDown, Plus, Trash2, ArrowLeft, Edit2, UploadCloud, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ActionPlan, ActionPlanActivity } from '@/hooks/useVendorActionPlans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const VendorActionPlans = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [activeTab, setActiveTab] = useState(searchParams.get('filter') || 'open');

    const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const selectedPlan = actionPlans.find(p => p.id === selectedPlanId) || null;

    const [expandedAssessments, setExpandedAssessments] = useState<string[]>([]);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Activity Form
    const [activityForm, setActivityForm] = useState({
        title: '',
        description: '',
        due_date: '',
        responsible: '',
        evidence_url: '',
        evidence_name: ''
    });

    const mapStatusFromDB = (status: string): any => {
        const map: Record<string, string> = {
            'planejado': 'open', 'em_andamento': 'in_progress', 'concluido': 'completed',
            'aguardando_validacao': 'pending_validation', 'disponivel_fornecedor': 'available_to_vendor'
        };
        return map[status?.toLowerCase()] || 'open';
    };

    const mapPriorityFromDB = (priority: string): any => {
        const map: Record<string, string> = {
            'baixa': 'low', 'media': 'medium', 'alta': 'high', 'critica': 'critical'
        };
        return map[priority?.toLowerCase()] || 'medium';
    };

    useEffect(() => {
        fetchActionPlans();
    }, [user]);

    const fetchActionPlans = async () => {
        if (!user) return;
        try {
            setIsLoading(true);

            let currentVendorId = null;

            const { data: vendorUser } = await supabase
                .from('vendor_users')
                .select('vendor_id')
                .eq('auth_user_id', user.id)
                .limit(1)
                .maybeSingle();

            if (vendorUser?.vendor_id) {
                currentVendorId = vendorUser.vendor_id;
            } else {
                const { data: portalUser } = await supabase
                    .from('vendor_portal_users')
                    .select('vendor_id')
                    .eq('email', user.email?.trim().toLowerCase())
                    .limit(1)
                    .maybeSingle();

                if (portalUser?.vendor_id) {
                    currentVendorId = portalUser.vendor_id;
                }
            }

            if (!currentVendorId) {
                throw new Error("Perfil de fornecedor não encontrado.");
            }

            const { data: plans, error: plansError } = await supabase
                .from('action_plans')
                .select(`
                    *,
                    action_plan_activities (
                        id,
                        titulo,
                        descricao,
                        status,
                        prioridade,
                        data_fim_planejada,
                        responsavel_execucao,
                        created_at,
                        updated_at
                    )
                `)
                .eq('modulo_origem', 'vendor_risk')
                .in('entidade_origem_tipo', ['vendor', 'vendor_assessment'])
                .eq('entidade_origem_id', currentVendorId)
                .in('status', ['disponivel_fornecedor', 'em_andamento', 'concluido'])
                .order('created_at', { ascending: false });

            if (plansError) throw plansError;

            const mappedPlans: ActionPlan[] = plans.map(plan => {
                const activities = plan.action_plan_activities?.map((act: any) => ({
                    id: act.id,
                    title: act.titulo,
                    description: act.descricao || '',
                    status: mapStatusFromDB(act.status),
                    priority: mapPriorityFromDB(act.prioridade),
                    due_date: act.data_fim_planejada,
                    responsible_id: act.responsavel_execucao,
                    created_at: act.created_at,
                    updated_at: act.updated_at,
                    action_plan_id: plan.id,
                    evidence_url: act.metadados?.evidence_url || '',
                    evidence_name: act.metadados?.evidence_name || ''
                })) || [];

                const calculatedProgress = activities.length > 0
                    ? Math.round((activities.filter(a => a.status === 'completed' || a.status === 'verified').length / activities.length) * 100)
                    : (plan.percentual_conclusao || 0);

                return {
                    id: plan.id,
                    title: plan.titulo,
                    description: plan.descricao || '',
                    status: mapStatusFromDB(plan.status),
                    priority: mapPriorityFromDB(plan.prioridade),
                    vendor_id: plan.entidade_origem_id,
                    assessment_id: plan.metadados?.assessment_id || '',
                    assessment_name: plan.metadados?.assessment_name || plan.metadados?.source_assessment_name || 'Diversos',
                    created_at: plan.created_at,
                    updated_at: plan.updated_at,
                    due_date: plan.data_fim_planejada,
                    progress: calculatedProgress,
                    activities: activities,
                    tenant_id: plan.tenant_id
                };
            });

            setActionPlans(mappedPlans);
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao carregar planos de ação",
                description: error instanceof Error ? error.message : "Erro desconhecido",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditActivity = (activity: any) => {
        setActivityForm({
            title: activity.title,
            description: activity.description || '',
            due_date: activity.due_date || '',
            responsible: activity.responsible_name || '',
            evidence_url: activity.evidence_url || '',
            evidence_name: activity.evidence_name || ''
        });
        setEditingActivityId(activity.id);
        setIsActivityModalOpen(true);
    };

    const handleUploadEvidence = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(fileName);

            setActivityForm(prev => ({
                ...prev,
                evidence_url: publicUrl,
                evidence_name: file.name
            }));
            toast({ title: "Evidência anexada", description: "O arquivo foi enviado com sucesso." });
        } catch (error) {
            console.error('Error uploading evidence:', error);
            toast({ title: "Erro no Upload", description: "Não foi possível enviar a evidência.", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveActivity = async () => {
        if (!selectedPlan || !activityForm.title || !activityForm.due_date) {
            toast({ title: 'Atenção', description: 'Preencha título e prazo.', variant: 'destructive' });
            return;
        }

        // Validate date
        if (selectedPlan.due_date && new Date(activityForm.due_date) > new Date(selectedPlan.due_date)) {
            toast({
                title: 'Data inválida',
                description: `A data da atividade não pode ultrapassar o prazo final do plano (${new Date(selectedPlan.due_date).toLocaleDateString('pt-BR')}).`,
                variant: 'destructive'
            });
            return;
        }

        try {
            setIsLoading(true);

            // Use the parent plan's tenant_id (required NOT NULL field)
            const planTenantId = (selectedPlan as any).tenant_id;
            if (!planTenantId) {
                throw new Error('tenant_id não encontrado no plano. Não é possível criar atividade.');
            }

            if (editingActivityId) {
                const { error } = await supabase
                    .from('action_plan_activities')
                    .update({
                        titulo: activityForm.title,
                        descricao: activityForm.description || null,
                        data_fim_planejada: activityForm.due_date,
                        metadados: {
                            responsavel_nome: activityForm.responsible || null,
                            created_by_vendor: true,
                            evidence_url: activityForm.evidence_url,
                            evidence_name: activityForm.evidence_name
                        }
                    })
                    .eq('id', editingActivityId);
                if (error) throw error;
                toast({ title: "Atividade atualizada", description: "A atividade foi salva." });
            } else {
                const { error } = await supabase
                    .from('action_plan_activities')
                    .insert({
                        tenant_id: planTenantId,
                        action_plan_id: selectedPlan.id,
                        titulo: activityForm.title,
                        descricao: activityForm.description || null,
                        prioridade: 'media',
                        data_inicio_planejada: new Date().toISOString().split('T')[0],
                        data_fim_planejada: activityForm.due_date,
                        status: 'planejado',
                        metadados: {
                            responsavel_nome: activityForm.responsible || null,
                            created_by_vendor: true,
                            evidence_url: activityForm.evidence_url,
                            evidence_name: activityForm.evidence_name
                        }
                    });
                if (error) throw error;
                toast({ title: "Atividade adicionada", description: "A nova atividade foi salva." });
            }

            setActivityForm({ title: '', description: '', due_date: '', responsible: '', evidence_url: '', evidence_name: '' });
            setIsActivityModalOpen(false);
            setEditingActivityId(null);
            fetchActionPlans();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao adicionar atividade", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteActivity = async (activityId: string) => {
        try {
            const { error } = await supabase.from('action_plan_activities').delete().eq('id', activityId);
            if (error) throw error;
            toast({ title: "Atividade removida" });
            fetchActionPlans();
        } catch (error) {
            toast({ title: "Erro ao remover", variant: "destructive" });
        }
    };

    const handleUpdateActivityStatus = async (activityId: string, newStatus: string) => {
        try {
            // Map display status back to DB status
            const statusMap: Record<string, string> = {
                'open': 'planejado',
                'in_progress': 'em_andamento',
                'completed': 'concluido'
            };
            const dbStatus = statusMap[newStatus] || newStatus;

            const { error } = await supabase
                .from('action_plan_activities')
                .update({ status: dbStatus })
                .eq('id', activityId);

            if (error) throw error;

            // Update local state immediately for better UX
            if (selectedPlan) {
                const updatedActivities = selectedPlan.activities.map(a =>
                    a.id === activityId ? { ...a, status: newStatus as ActionPlanActivity['status'] } : a
                );
                const newProgress = updatedActivities.length > 0
                    ? Math.round((updatedActivities.filter(a => a.status === 'completed').length / updatedActivities.length) * 100)
                    : 0;

                // Also update parent plan progress in DB
                await supabase
                    .from('action_plans')
                    .update({ percentual_conclusao: newProgress })
                    .eq('id', selectedPlan.id);

                setActionPlans(prev => prev.map(p =>
                    p.id === selectedPlan.id
                        ? { ...p, activities: updatedActivities, progress: newProgress }
                        : p
                ));
            }

            toast({ title: "Status atualizado", description: `Atividade ${newStatus === 'completed' ? 'concluída' : 'atualizada'}.` });
        } catch (error) {
            console.error('Error updating activity status:', error);
            toast({ title: "Erro ao atualizar status", variant: "destructive" });
        }
    };

    const toggleAssessment = (assessmentName: string) => {
        setExpandedAssessments(prev => prev.includes(assessmentName) ? prev.filter(a => a !== assessmentName) : [...prev, assessmentName]);
    };

    const groupedPlans = () => {
        const grouped: Record<string, ActionPlan[]> = {};

        // Filter action plans based on active Tab
        const filteredPlans = actionPlans.filter(plan => {
            if (activeTab === 'open') {
                return ['available_to_vendor', 'open', 'in_progress'].includes(plan.status);
            } else {
                return ['completed', 'verified', 'pending_validation'].includes(plan.status);
            }
        });

        filteredPlans.forEach(plan => {
            const asmName = plan.assessment_name || 'Outros Planos';
            if (!grouped[asmName]) grouped[asmName] = [];
            grouped[asmName].push(plan);
        });
        return grouped;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-emerald-100 text-emerald-800">Concluído</Badge>;
            case 'in_progress': return <Badge className="bg-blue-100 text-blue-800">Em Andamento</Badge>;
            case 'overdue': return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>;
            default: return <Badge variant="outline">Planejado</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <Badge className="bg-red-500 hover:bg-red-600 border-red-500">Urgente</Badge>;
            case 'high': return <Badge variant="destructive">Alto</Badge>;
            case 'medium': return <Badge className="bg-amber-500 hover:bg-amber-600">Médio</Badge>;
            default: return <Badge variant="secondary">Baixo</Badge>;
        }
    };

    if (isLoading && actionPlans.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="mb-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/vendor-portal')} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                </Button>
            </div>
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
                        <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        Planos de Ação
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
                        Acompanhe, gerencie e responda aos planos de ação sugeridos para mitigar riscos e garantir a conformidade da sua empresa.
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="h-48 w-48 text-primary transform rotate-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="md:col-span-1 border rounded-xl bg-card overflow-hidden h-fit flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="bg-muted p-2 border-b">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="open">Em Aberto</TabsTrigger>
                                <TabsTrigger value="completed">Concluídos</TabsTrigger>
                            </TabsList>
                        </div>
                        {['open', 'completed'].map(tabValue => (
                            <TabsContent key={tabValue} value={tabValue} className="m-0 border-0 p-0 outline-none">
                                {Object.keys(groupedPlans()).length === 0 ? (
                                    <div className="p-4 sm:p-6 text-center text-muted-foreground text-xs sm:text-sm">
                                        Nenhum plano disponível nesta aba.
                                    </div>
                                ) : (
                                    <div className="divide-y max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                                        {Object.entries(groupedPlans()).map(([assessmentName, plans]) => (
                                            <div key={assessmentName} className="flex flex-col border-b last:border-0">
                                                <div
                                                    className="flex items-center gap-2 p-3 bg-muted/20 hover:bg-muted/40 cursor-pointer"
                                                    onClick={() => toggleAssessment(assessmentName)}
                                                >
                                                    {expandedAssessments.includes(assessmentName) ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                                                    <span className="font-semibold text-xs sm:text-sm truncate flex-1">{assessmentName}</span>
                                                    <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5">{plans.length}</Badge>
                                                </div>

                                                {expandedAssessments.includes(assessmentName) && (
                                                    <div className="pl-3 sm:pl-4 pb-1">
                                                        {plans.map(plan => (
                                                            <div
                                                                key={plan.id}
                                                                className={`p-2 sm:p-3 cursor-pointer border-b last:border-0 hover:bg-muted/10 transition-colors ${selectedPlanId === plan.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                                                onClick={() => setSelectedPlanId(plan.id)}
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h4 className="font-medium text-[11px] sm:text-sm text-foreground line-clamp-1">{plan.title}</h4>
                                                                </div>
                                                                <div className="flex justify-between items-center text-[10px] sm:text-xs text-muted-foreground">
                                                                    <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> {plan.due_date ? new Date(plan.due_date).toLocaleDateString() : 'S/ Data'}</span>
                                                                    <span>{plan.progress}%</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                <div className="md:col-span-2">
                    {selectedPlan ? (
                        <Card className="h-full border shadow-sm">
                            <CardHeader className="bg-muted/30 border-b pb-3 sm:pb-4 p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                                    <div>
                                        <Badge className="mb-2 uppercase text-[9px] sm:text-[10px] px-1.5" variant="outline">{selectedPlan.assessment_name}</Badge>
                                        <CardTitle className="text-lg sm:text-xl line-clamp-2 leading-tight">{selectedPlan.title}</CardTitle>
                                    </div>
                                    <div className="shrink-0 mt-1 sm:mt-0">
                                        {getStatusBadge(selectedPlan.status)}
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{selectedPlan.description}</p>

                                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-dashed">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span className="font-medium">Prazo Final (Inalterável):</span>
                                        <span>{selectedPlan.due_date ? new Date(selectedPlan.due_date).toLocaleDateString('pt-BR') : 'Não definido'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm ml-auto">
                                        <span className="font-medium">Progresso Geral:</span>
                                        <Progress value={selectedPlan.progress} className="w-24 border" />
                                        <span className="text-xs">{selectedPlan.progress}%</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary" />
                                        Atividades do Plano
                                    </h3>
                                    <Button size="sm" onClick={() => {
                                        setActivityForm({ title: '', description: '', due_date: '', responsible: '', evidence_url: '', evidence_name: '' });
                                        setEditingActivityId(null);
                                        setIsActivityModalOpen(true);
                                    }}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        Nova Atividade
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {!selectedPlan.activities || selectedPlan.activities.length === 0 ? (
                                        <div className="text-center p-8 bg-muted/20 border border-dashed rounded-lg text-muted-foreground text-sm">
                                            Nenhuma atividade cadastrada. Quebre este plano em atividades menores para acompanhar a execução.
                                        </div>
                                    ) : (
                                        selectedPlan.activities.map(activity => (
                                            <div key={activity.id} className="p-4 border rounded-lg bg-card shadow-sm hover:border-primary/30 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-medium flex-1 mr-3">{activity.title}</h4>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Select
                                                            value={activity.status}
                                                            onValueChange={(val) => handleUpdateActivityStatus(activity.id, val)}
                                                        >
                                                            <SelectTrigger className={`h-7 text-xs w-[130px] border ${activity.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                activity.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    'bg-muted text-muted-foreground'
                                                                }`}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="open">Planejado</SelectItem>
                                                                <SelectItem value="in_progress">Em Andamento</SelectItem>
                                                                <SelectItem value="completed">Concluída</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleEditActivity(activity)}>
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteActivity(activity.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {activity.description && <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>}
                                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground items-center">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Prazo: {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : '-'}
                                                    </span>
                                                    {activity.responsible_name && (
                                                        <span className="flex items-center gap-1">
                                                            <Activity className="h-3 w-3" />
                                                            {activity.responsible_name}
                                                        </span>
                                                    )}
                                                    {(activity as any).evidence_url && (
                                                        <span className="flex items-center gap-1 border-l pl-4 cursor-pointer text-primary hover:underline" onClick={() => window.open((activity as any).evidence_url, '_blank')}>
                                                            <Paperclip className="h-3 w-3" />
                                                            {(activity as any).evidence_name || 'Evidência anexada'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border rounded-xl border-dashed bg-muted/10">
                            <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground text-center max-w-sm">
                                Selecione um plano de ação na lista lateral para visualizar detalhes e gerenciar as atividades.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingActivityId ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
                        <DialogDescription>
                            {editingActivityId ? 'Atualize os dados e anexe evidências, se aplicável.' : 'Adicione uma nova tarefa para ajudar a cumprir este plano.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Título da Atividade</Label>
                            <Input
                                value={activityForm.title}
                                onChange={e => setActivityForm({ ...activityForm, title: e.target.value })}
                                placeholder="E.g., Configurar firewall"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Prazo da Atividade</Label>
                            <Input
                                type="date"
                                value={activityForm.due_date}
                                onChange={e => setActivityForm({ ...activityForm, due_date: e.target.value })}
                            />
                            {selectedPlan?.due_date && (
                                <p className="text-[10px] text-muted-foreground">O limite máximo é a data final do plano: {new Date(selectedPlan.due_date).toLocaleDateString()}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição Mínima</Label>
                            <Textarea
                                value={activityForm.description}
                                onChange={e => setActivityForm({ ...activityForm, description: e.target.value })}
                                placeholder="Detalhes da execução..."
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Responsável</Label>
                            <Input
                                value={activityForm.responsible}
                                onChange={e => setActivityForm({ ...activityForm, responsible: e.target.value })}
                                placeholder="Nome do responsável pela execução"
                            />
                        </div>
                        <div className="space-y-2 pt-2 border-t mt-4">
                            <Label>Evidência de Conclusão (Opcional)</Label>
                            <div className="flex items-center gap-3">
                                {activityForm.evidence_name ? (
                                    <div className="flex-1 flex items-center justify-between border rounded p-2 bg-muted/20 text-sm">
                                        <span className="truncate mr-2 max-w-[250px]">{activityForm.evidence_name}</span>
                                        <Button variant="ghost" size="sm" onClick={() => setActivityForm(prev => ({ ...prev, evidence_url: '', evidence_name: '' }))} className="h-6 w-6 p-0 text-red-500">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex-1">
                                        <Input type="file" onChange={handleUploadEvidence} disabled={isUploading} className="text-xs" />
                                    </div>
                                )}
                                {isUploading && <span className="text-xs text-muted-foreground animate-pulse">Enviando...</span>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>Cancelar</Button>
                        <Button disabled={isLoading || isUploading} onClick={handleSaveActivity}>{isLoading ? 'Salvando...' : 'Salvar Atividade'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VendorActionPlans;
