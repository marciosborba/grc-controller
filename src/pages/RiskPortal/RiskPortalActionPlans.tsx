import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Target, Calendar, FileText, CheckCircle, Clock, ChevronRight, ChevronDown,
    ArrowLeft, UploadCloud, Paperclip, ShieldAlert, Trash2, AlertTriangle,
    CheckCheck, XCircle, MessageSquare, Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const LEVEL_COLORS: Record<string, string> = {
    'Muito Alto': 'bg-red-500/10 text-red-700 border-red-500/20',
    'Alto': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'Médio': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    'Baixo': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    in_progress: { label: 'Em Andamento', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    completed: { label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    delayed: { label: 'Atrasado', color: 'bg-red-500/10 text-red-700 border-red-500/20' },
    awaiting_validation: { label: 'Aguard. Validação', color: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
};

const VALIDATION_MAP: Record<string, { label: string; icon: React.ReactNode }> = {
    pending: { label: 'Não validado', icon: <Clock className="h-3 w-3" /> },
    approved: { label: 'Aprovado pelo analista', icon: <CheckCircle className="h-3 w-3 text-emerald-600" /> },
    rejected: { label: 'Rejeitado pelo analista', icon: <XCircle className="h-3 w-3 text-red-600" /> },
};

interface RiskPlan {
    id: string;
    risk_registration_id: string;
    activity_name: string;
    description?: string;
    responsible_name?: string;
    due_date?: string;
    status: string;
    evidence_url?: string;
    evidence_name?: string;
    stakeholder_notes?: string;
    analyst_validation_status?: string;
    analyst_notes?: string;
    risk?: { id: string; risk_title: string; risk_level: string; risk_category: string };
}

export const RiskPortalActionPlans = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('open');
    const [plans, setPlans] = useState<RiskPlan[]>([]);
    const [expandedRisks, setExpandedRisks] = useState<string[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<RiskPlan | null>(null);
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [evidenceForm, setEvidenceForm] = useState({
        notes: '',
        evidence_url: '',
        evidence_name: '',
    });

    const fetchPlans = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data: stkData } = await supabase
                .from('risk_stakeholders')
                .select('risk_registration_id')
                .eq('email', user.email?.trim().toLowerCase() || '');

            const riskIds = (stkData || []).map((s: any) => s.risk_registration_id).filter(Boolean);
            if (riskIds.length === 0) { setPlans([]); return; }

            const { data: apData, error } = await supabase
                .from('risk_registration_action_plans')
                .select(`
                    id, risk_registration_id, activity_name, description, responsible_name,
                    due_date, status, evidence_url, evidence_name, stakeholder_notes,
                    analyst_validation_status, analyst_notes,
                    risk_registrations!inner(id, risk_title, risk_level, risk_category)
                `)
                .in('risk_registration_id', riskIds)
                .order('due_date', { ascending: true });

            if (error) throw error;

            const mapped = (apData || []).map((ap: any) => ({
                ...ap,
                risk: ap.risk_registrations,
            }));
            setPlans(mapped);
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally { setLoading(false); }
    }, [user, toast]);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const toggleRisk = (riskId: string) => {
        setExpandedRisks(prev =>
            prev.includes(riskId) ? prev.filter(r => r !== riskId) : [...prev, riskId]
        );
    };

    const openEvidenceModal = (plan: RiskPlan) => {
        setSelectedPlan(plan);
        setEvidenceForm({
            notes: plan.stakeholder_notes || '',
            evidence_url: plan.evidence_url || '',
            evidence_name: plan.evidence_name || '',
        });
        setIsEvidenceModalOpen(true);
    };

    const handleUploadEvidence = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `risk_evidence/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(fileName);

            setEvidenceForm(prev => ({ ...prev, evidence_url: publicUrl, evidence_name: file.name }));
            toast({ title: 'Evidência anexada!', description: file.name });
        } catch (err: any) {
            toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
        } finally { setIsUploading(false); }
    };

    const handleSaveEvidence = async () => {
        if (!selectedPlan) return;
        setIsSaving(true);
        try {
            const newStatus = evidenceForm.evidence_url ? 'awaiting_validation' :
                selectedPlan.status === 'awaiting_validation' ? 'in_progress' : selectedPlan.status;

            const { error } = await supabase
                .from('risk_registration_action_plans')
                .update({
                    stakeholder_notes: evidenceForm.notes || null,
                    evidence_url: evidenceForm.evidence_url || null,
                    evidence_name: evidenceForm.evidence_name || null,
                    status: newStatus,
                })
                .eq('id', selectedPlan.id);

            if (error) throw error;
            toast({ title: 'Informações salvas!', description: 'Evidência e notas enviadas para validação do analista.' });
            setIsEvidenceModalOpen(false);
            fetchPlans();
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally { setIsSaving(false); }
    };

    const handleUpdatePlanStatus = async (planId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('risk_registration_action_plans')
                .update({ status: newStatus })
                .eq('id', planId);
            if (error) throw error;
            toast({ title: 'Status atualizado!' });
            setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: newStatus } : p));
            if (selectedPlan?.id === planId) {
                setSelectedPlan(prev => prev ? { ...prev, status: newStatus } : prev);
            }
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        }
    };

    // Group plans by risk
    const groupByRisk = (list: RiskPlan[]): Record<string, { risk: any; plans: RiskPlan[] }> => {
        const grouped: Record<string, { risk: any; plans: RiskPlan[] }> = {};
        list.forEach(plan => {
            const riskId = plan.risk_registration_id;
            if (!grouped[riskId]) {
                grouped[riskId] = { risk: plan.risk, plans: [] };
            }
            grouped[riskId].plans.push(plan);
        });
        return grouped;
    };

    const filteredPlans = plans.filter(p =>
        activeTab === 'open'
            ? !['completed'].includes(p.status)
            : p.status === 'completed' || p.analyst_validation_status === 'approved'
    );

    const groupedData = groupByRisk(filteredPlans);
    const allCompleted = plans.filter(p => p.status === 'completed' || p.analyst_validation_status === 'approved');
    const allOpen = plans.filter(p => p.status !== 'completed');

    const getValidationBadge = (plan: RiskPlan) => {
        const vStatus = plan.analyst_validation_status || 'pending';
        const info = VALIDATION_MAP[vStatus] || VALIDATION_MAP.pending;
        if (vStatus === 'pending') return null;
        return (
            <Badge variant="outline" className={`text-xs ${vStatus === 'approved' ? 'border-emerald-500/50 text-emerald-700 bg-emerald-500/10' : 'border-red-500/50 text-red-700 bg-red-500/10'}`}>
                {info.icon} <span className="ml-1">{info.label}</span>
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const s = STATUS_MAP[status] || STATUS_MAP.pending;
        return <Badge variant="outline" className={`text-xs ${s.color}`}>{s.label}</Badge>;
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4" />
            <p className="text-muted-foreground animate-pulse">Carregando planos de ação...</p>
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600/10 via-red-600/5 to-transparent p-4 sm:p-6 rounded-2xl border border-red-600/10 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 sm:gap-3">
                        <Target className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                        Planos de Ação
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
                        Acompanhe, gerencie e envie evidências dos planos de ação dos riscos aos quais você está vinculado.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-500" /> <strong>{allOpen.length}</strong> em aberto</span>
                        <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> <strong>{allCompleted.length}</strong> concluídos</span>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Target className="h-48 w-48 text-red-600 transform rotate-12" />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Sidebar — plan list grouped by risk */}
                <div className="md:col-span-1 border rounded-xl bg-card overflow-hidden h-fit flex flex-col">
                    <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSelectedPlan(null); }} className="w-full">
                        <div className="bg-muted p-2 border-b">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="open">Em Aberto ({allOpen.length})</TabsTrigger>
                                <TabsTrigger value="completed">Concluídos ({allCompleted.length})</TabsTrigger>
                            </TabsList>
                        </div>
                        {['open', 'completed'].map(tabValue => (
                            <TabsContent key={tabValue} value={tabValue} className="m-0 border-0 p-0 outline-none">
                                {Object.keys(groupedData).length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-sm">
                                        <Target className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        Nenhum plano nesta aba.
                                    </div>
                                ) : (
                                    <div className="divide-y max-h-[500px] overflow-y-auto">
                                        {Object.entries(groupedData).map(([riskId, { risk, plans: riskPlans }]) => (
                                            <div key={riskId} className="flex flex-col">
                                                {/* Risk Group Header */}
                                                <button
                                                    className="flex items-center gap-2 p-3 bg-muted/20 hover:bg-muted/40 cursor-pointer text-left w-full"
                                                    onClick={() => toggleRisk(riskId)}
                                                >
                                                    {expandedRisks.includes(riskId)
                                                        ? <ChevronDown className="h-4 w-4 shrink-0 text-red-600" />
                                                        : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    }
                                                    <ShieldAlert className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                                    <span className="font-semibold text-xs sm:text-sm truncate flex-1">
                                                        {risk?.risk_title || 'Risco'}
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] px-1.5">{riskPlans.length}</Badge>
                                                </button>

                                                {/* Plan items */}
                                                {expandedRisks.includes(riskId) && (
                                                    <div className="pl-4 pb-1">
                                                        {riskPlans.map(plan => (
                                                            <button
                                                                key={plan.id}
                                                                className={`w-full text-left p-2 sm:p-3 cursor-pointer border-b last:border-0 hover:bg-muted/10 transition-colors ${selectedPlan?.id === plan.id ? 'bg-red-600/5 border-l-2 border-l-red-600' : ''}`}
                                                                onClick={() => setSelectedPlan(plan)}
                                                            >
                                                                <div className="flex justify-between items-start mb-1 gap-1">
                                                                    <h4 className="font-medium text-[11px] sm:text-sm text-foreground line-clamp-1 flex-1">{plan.activity_name || 'Sem título'}</h4>
                                                                </div>
                                                                <div className="flex gap-1.5 flex-wrap">
                                                                    {getStatusBadge(plan.status)}
                                                                    {plan.analyst_validation_status === 'approved' && (
                                                                        <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-600">✓ Validado</Badge>
                                                                    )}
                                                                    {plan.analyst_validation_status === 'rejected' && (
                                                                        <Badge variant="outline" className="text-[9px] border-red-500/40 text-red-600">✗ Rejeitado</Badge>
                                                                    )}
                                                                </div>
                                                                {plan.due_date && (
                                                                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                                        <Calendar className="h-2.5 w-2.5" />
                                                                        {new Date(plan.due_date).toLocaleDateString('pt-BR')}
                                                                    </p>
                                                                )}
                                                            </button>
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

                {/* Main Panel — plan detail */}
                <div className="md:col-span-2">
                    {selectedPlan ? (
                        <Card className="border shadow-sm">
                            <CardHeader className="bg-muted/30 border-b pb-4 p-4 sm:p-6">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        {selectedPlan.risk && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                                                <span className="text-xs text-muted-foreground font-medium truncate">{selectedPlan.risk.risk_title}</span>
                                                <Badge variant="outline" className={`text-[10px] shrink-0 ${LEVEL_COLORS[selectedPlan.risk.risk_level] || ''}`}>
                                                    {selectedPlan.risk.risk_level}
                                                </Badge>
                                            </div>
                                        )}
                                        <CardTitle className="text-lg sm:text-xl leading-tight">{selectedPlan.activity_name}</CardTitle>
                                    </div>
                                    <div className="shrink-0 flex gap-2 flex-wrap">
                                        {getStatusBadge(selectedPlan.status)}
                                        {getValidationBadge(selectedPlan)}
                                    </div>
                                </div>

                                {selectedPlan.description && (
                                    <p className="text-sm text-muted-foreground mt-2">{selectedPlan.description}</p>
                                )}

                                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-dashed text-sm">
                                    {selectedPlan.responsible_name && (
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Responsável:</span>
                                            <span className="font-medium">{selectedPlan.responsible_name}</span>
                                        </div>
                                    )}
                                    {selectedPlan.due_date && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">Prazo:</span>
                                            <span className="font-medium">{new Date(selectedPlan.due_date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="p-4 sm:p-6 space-y-6">
                                {/* Status control */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Atualizar Status</Label>
                                    <Select
                                        value={selectedPlan.status}
                                        onValueChange={v => handleUpdatePlanStatus(selectedPlan.id, v)}
                                        disabled={selectedPlan.status === 'awaiting_validation' || selectedPlan.analyst_validation_status === 'approved'}
                                    >
                                        <SelectTrigger className="w-full sm:w-60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">⏳ Pendente</SelectItem>
                                            <SelectItem value="in_progress">🔄 Em Andamento</SelectItem>
                                            <SelectItem value="completed">✅ Concluído</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selectedPlan.status === 'awaiting_validation' && (
                                        <p className="text-xs text-purple-600">⏳ Aguardando validação do analista</p>
                                    )}
                                    {selectedPlan.analyst_validation_status === 'approved' && (
                                        <p className="text-xs text-emerald-600">✅ Validado e aprovado pelo analista</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Evidence / Notes section */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-base flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-red-600" />
                                        Evidências e Observações
                                    </h3>

                                    {/* Submitted evidence display */}
                                    {(selectedPlan.evidence_url || selectedPlan.stakeholder_notes) && (
                                        <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                                            {selectedPlan.stakeholder_notes && (
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Suas Observações</p>
                                                    <p className="text-sm text-foreground">{selectedPlan.stakeholder_notes}</p>
                                                </div>
                                            )}
                                            {selectedPlan.evidence_url && (
                                                <div>
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Evidência Anexada</p>
                                                    <a
                                                        href={selectedPlan.evidence_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                                                    >
                                                        <Paperclip className="h-4 w-4" />
                                                        {selectedPlan.evidence_name || 'Ver Evidência'}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Analyst feedback */}
                                    {selectedPlan.analyst_notes && (
                                        <div className={`p-4 rounded-lg border ${selectedPlan.analyst_validation_status === 'approved' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                                            <p className="text-xs font-semibold uppercase mb-1">
                                                {selectedPlan.analyst_validation_status === 'approved' ? '✅ Feedback do Analista (Aprovado)' : '❌ Feedback do Analista (Rejeitado)'}
                                            </p>
                                            <p className="text-sm">{selectedPlan.analyst_notes}</p>
                                        </div>
                                    )}

                                    {selectedPlan.analyst_validation_status !== 'approved' && (
                                        <Button
                                            onClick={() => openEvidenceModal(selectedPlan)}
                                            className="w-full sm:w-auto"
                                            variant={selectedPlan.evidence_url ? 'outline' : 'default'}
                                        >
                                            <UploadCloud className="h-4 w-4 mr-2" />
                                            {selectedPlan.evidence_url ? 'Atualizar Evidência / Observações' : 'Enviar Evidência / Observações'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center border rounded-xl border-dashed bg-muted/10">
                            <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground text-center max-w-sm px-4">
                                Selecione um plano de ação na lista lateral para visualizar detalhes, atualizar o status e enviar evidências.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Evidence / Notes Modal */}
            <Dialog open={isEvidenceModalOpen} onOpenChange={setIsEvidenceModalOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5 text-red-600" />
                            Enviar Evidência e Observações
                        </DialogTitle>
                        <DialogDescription>
                            Anexe o comprovante de execução da atividade e/ou deixe observações para o analista.
                            Após enviar, a atividade ficará aguardando validação.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="p-3 rounded-lg bg-muted/30 border">
                            <p className="text-xs font-medium text-muted-foreground">Atividade:</p>
                            <p className="text-sm font-semibold mt-0.5">{selectedPlan?.activity_name}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Observações / Descrição da Execução</Label>
                            <Textarea
                                value={evidenceForm.notes}
                                onChange={e => setEvidenceForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Descreva o que foi executado, quando e como foi feito..."
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            <Label>Evidência de Conclusão</Label>
                            {evidenceForm.evidence_name ? (
                                <div className="flex items-center justify-between border rounded p-2 bg-muted/20 text-sm">
                                    <span className="flex items-center gap-2">
                                        <Paperclip className="h-4 w-4 text-primary" />
                                        <span className="truncate max-w-[280px]">{evidenceForm.evidence_name}</span>
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEvidenceForm(prev => ({ ...prev, evidence_url: '', evidence_name: '' }))}
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Input
                                        type="file"
                                        onChange={handleUploadEvidence}
                                        disabled={isUploading}
                                        className="text-xs cursor-pointer"
                                    />
                                    {isUploading && <p className="text-xs text-muted-foreground animate-pulse">Enviando arquivo...</p>}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">Aceita: PDF, DOC, DOCX, XLSX, PNG, JPG, etc.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEvidenceModalOpen(false)}>Cancelar</Button>
                        <Button
                            disabled={isSaving || isUploading || (!evidenceForm.notes && !evidenceForm.evidence_url)}
                            onClick={handleSaveEvidence}
                        >
                            {isSaving ? 'Salvando...' : 'Enviar para Validação'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RiskPortalActionPlans;
