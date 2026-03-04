import React, { useState, useEffect } from 'react';
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
import { Activity, Calendar, ExternalLink, FileText, CheckCircle, Clock, ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ActionPlan, ActionPlanActivity } from '@/hooks/useVendorActionPlans';

export const VendorActionPlans = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const selectedPlan = actionPlans.find(p => p.id === selectedPlanId) || null;

    const [expandedAssessments, setExpandedAssessments] = useState<string[]>([]);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

    // Activity Form
    const [activityForm, setActivityForm] = useState({
        title: '',
        description: '',
        due_date: '',
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

            const { data: vendorUser, error: vendorError } = await supabase
                .from('vendor_users')
                .select('vendor_id')
                .eq('auth_user_id', user.id)
                .single();

            if (vendorError || !vendorUser) {
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
                .eq('entidade_origem_id', vendorUser.vendor_id)
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
                    action_plan_id: plan.id
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
                    activities: activities
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

    const handleAddActivity = async () => {
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
            const { error } = await supabase
                .from('action_plan_activities')
                .insert({
                    action_plan_id: selectedPlan.id,
                    titulo: activityForm.title,
                    descricao: activityForm.description,
                    prioridade: 'media',
                    data_inicio_planejada: new Date().toISOString(),
                    data_fim_planejada: activityForm.due_date,
                    status: 'planejado'
                });

            if (error) throw error;

            toast({ title: "Atividade adicionada", description: "A nova atividade foi salva." });
            setActivityForm({ title: '', description: '', due_date: '' });
            setIsActivityModalOpen(false);
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

    const toggleAssessment = (assessmentName: string) => {
        setExpandedAssessments(prev => prev.includes(assessmentName) ? prev.filter(a => a !== assessmentName) : [...prev, assessmentName]);
    };

    const groupedPlans = () => {
        const grouped: Record<string, ActionPlan[]> = {};
        actionPlans.forEach(plan => {
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
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary" />
                        Planos de Ação
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-base">
                        Acompanhe, gerencie e responda aos planos de ação sugeridos para mitigar riscos e garantir a conformidade da sua empresa.
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="h-48 w-48 text-primary transform rotate-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 border rounded-xl bg-card overflow-hidden h-fit">
                    <div className="bg-muted p-4 border-b">
                        <h3 className="font-semibold text-foreground">Meus Planos Ativos</h3>
                    </div>
                    {actionPlans.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground text-sm">
                            Nenhum plano disponível no momento.
                        </div>
                    ) : (
                        <div className="divide-y max-h-[600px] overflow-y-auto">
                            {Object.entries(groupedPlans()).map(([assessmentName, plans]) => (
                                <div key={assessmentName} className="flex flex-col border-b last:border-0">
                                    <div
                                        className="flex items-center gap-2 p-3 bg-muted/20 hover:bg-muted/40 cursor-pointer"
                                        onClick={() => toggleAssessment(assessmentName)}
                                    >
                                        {expandedAssessments.includes(assessmentName) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        <span className="font-semibold text-sm truncate flex-1">{assessmentName}</span>
                                        <Badge variant="secondary" className="text-xs">{plans.length}</Badge>
                                    </div>

                                    {expandedAssessments.includes(assessmentName) && (
                                        <div className="pl-4 pb-1">
                                            {plans.map(plan => (
                                                <div
                                                    key={plan.id}
                                                    className={`p-3 cursor-pointer border-b last:border-0 hover:bg-muted/10 transition-colors ${selectedPlanId === plan.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                                                    onClick={() => setSelectedPlanId(plan.id)}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-medium text-sm text-foreground line-clamp-1">{plan.title}</h4>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {plan.due_date ? new Date(plan.due_date).toLocaleDateString() : 'S/ Data'}</span>
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
                </div>

                <div className="md:col-span-2">
                    {selectedPlan ? (
                        <Card className="h-full border shadow-sm">
                            <CardHeader className="bg-muted/30 border-b pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge className="mb-2 uppercase text-[10px]" variant="outline">{selectedPlan.assessment_name}</Badge>
                                        <CardTitle className="text-xl">{selectedPlan.title}</CardTitle>
                                    </div>
                                    {getStatusBadge(selectedPlan.status)}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{selectedPlan.description}</p>

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
                                    <Button size="sm" onClick={() => setIsActivityModalOpen(true)}>
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
                                                    <h4 className="font-medium">{activity.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={activity.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}>
                                                            {activity.status}
                                                        </Badge>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteActivity(activity.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                {activity.description && <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>}
                                                <div className="flex gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Prazo: {activity.due_date ? new Date(activity.due_date).toLocaleDateString() : '-'}
                                                    </span>
                                                    {activity.responsible_name && (
                                                        <span className="flex items-center gap-1">
                                                            Pessoa: {activity.responsible_name}
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
                        <DialogTitle>Nova Atividade</DialogTitle>
                        <DialogDescription>
                            Adicione uma nova tarefa para ajudar a cumprir este plano.
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
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>Cancelar</Button>
                        <Button disabled={isLoading} onClick={handleAddActivity}>{isLoading ? 'Salvando...' : 'Adicionar Atividade'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VendorActionPlans;
