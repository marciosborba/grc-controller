import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft, ShieldAlert, Users, Target, AlertTriangle,
    Calendar, UploadCloud, Paperclip, FileText, Trash2,
    CheckCircle, XCircle, Clock, Activity, Plus, Edit2, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const RESP_LABELS: Record<string, string> = {
    pending: '⏳ Pendente', acknowledged: '👁️ Ciência Tomada',
    approved: '✅ Aprovado', rejected: '❌ Rejeitado',
};

const AP_STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
    in_progress: { label: 'Em Andamento', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
    completed: { label: 'Concluído', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
    delayed: { label: 'Atrasado', color: 'bg-red-500/10 text-red-700 border-red-500/20' },
    awaiting_validation: { label: 'Aguard. Validação', color: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
};

export const RiskPortalRiskDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [risk, setRisk] = useState<any>(null);
    const [stakeholders, setStakeholders] = useState<any[]>([]);
    const [actionPlans, setActionPlans] = useState<any[]>([]);
    const [myStakeholder, setMyStakeholder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedPlanForEvidence, setSelectedPlanForEvidence] = useState<any>(null);
    const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [evidenceForm, setEvidenceForm] = useState({ notes: '', evidence_url: '', evidence_name: '' });
    const [evidencePreview, setEvidencePreview] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });

    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<any>(null);
    const [activityForm, setActivityForm] = useState({
        activity_name: '',
        activity_description: '',
        responsible_name: '',
        responsible_email: '',
        due_date: '',
        priority: 'medium',
        status: 'pending',
        sub_activities: [] as { id: string; text: string; done: boolean }[],
    });

    const fetchData = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [riskRes, stkRes, apRes] = await Promise.all([
                supabase.from('risk_registrations').select('*').eq('id', id).single(),
                supabase.from('risk_stakeholders').select('*').eq('risk_registration_id', id),
                supabase.from('risk_registration_action_plans')
                    .select('id, risk_registration_id, activity_name, activity_description, responsible_name, due_date, status, evidence_url, evidence_name, stakeholder_notes, analyst_validation_status, analyst_notes, sub_activities')
                    .eq('risk_registration_id', id)
                    .order('due_date'),
            ]);
            if (riskRes.error) throw riskRes.error;
            setRisk(riskRes.data);
            setStakeholders(stkRes.data || []);
            setActionPlans(apRes.data || []);
            const mine = (stkRes.data || []).find((s: any) => s.email === user?.email?.trim().toLowerCase());
            setMyStakeholder(mine || null);
        } catch (err: any) {
            toast({ title: 'Erro ao carregar risco', description: err.message, variant: 'destructive' });
        } finally { setLoading(false); }
    }, [id, user, toast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const updateMyStatus = async (newStatus: string) => {
        if (!myStakeholder) return;
        setUpdating(true);
        try {
            const { error } = await supabase.from('risk_stakeholders').update({ response_status: newStatus }).eq('id', myStakeholder.id);
            if (error) throw error;
            setMyStakeholder({ ...myStakeholder, response_status: newStatus });
            setStakeholders(prev => prev.map(s => s.id === myStakeholder.id ? { ...s, response_status: newStatus } : s));
            toast({ title: 'Resposta registrada!', description: RESP_LABELS[newStatus] });
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally { setUpdating(false); }
    };

    const openEvidenceModal = (plan: any) => {
        setSelectedPlanForEvidence(plan);
        setEvidenceForm({ notes: plan.stakeholder_notes || '', evidence_url: plan.evidence_url || '', evidence_name: plan.evidence_name || '' });
        setIsEvidenceModalOpen(true);
    };

    const handleUploadEvidence = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `risk_evidence/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(fileName, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(fileName);
            setEvidenceForm(prev => ({ ...prev, evidence_url: publicUrl, evidence_name: file.name }));
            toast({ title: 'Evidência anexada!', description: file.name });
        } catch (err: any) {
            toast({ title: 'Erro no upload', description: err.message, variant: 'destructive' });
        } finally { setIsUploading(false); }
    };

    const handleSaveEvidence = async () => {
        if (!selectedPlanForEvidence) return;
        setIsSaving(true);
        try {
            const newStatus = evidenceForm.evidence_url ? 'awaiting_validation' : selectedPlanForEvidence.status;
            const { error } = await supabase.from('risk_registration_action_plans').update({
                stakeholder_notes: evidenceForm.notes || null,
                evidence_url: evidenceForm.evidence_url || null,
                evidence_name: evidenceForm.evidence_name || null,
                status: newStatus,
            }).eq('id', selectedPlanForEvidence.id);
            if (error) throw error;
            toast({ title: 'Evidência enviada!', description: 'Aguardando validação do analista.' });
            setIsEvidenceModalOpen(false);
            fetchData();
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally { setIsSaving(false); }
    };

    const handleUpdatePlanStatus = async (planId: string, newStatus: string) => {
        try {
            const { error } = await supabase.from('risk_registration_action_plans').update({ status: newStatus }).eq('id', planId);
            if (error) throw error;
            setActionPlans(prev => prev.map(p => p.id === planId ? { ...p, status: newStatus } : p));
            toast({ title: 'Status atualizado!' });
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        }
    };

    const openActivityModal = (activity?: any) => {
        if (activity) {
            setEditingActivity(activity);
            setActivityForm({
                activity_name: activity.activity_name || '',
                activity_description: activity.activity_description || '',
                responsible_name: activity.responsible_name || '',
                responsible_email: activity.responsible_email || '',
                due_date: activity.due_date || '',
                priority: activity.priority || 'medium',
                status: activity.status || 'pending',
                sub_activities: activity.sub_activities || [],
            });
        } else {
            setEditingActivity(null);
            setActivityForm({
                activity_name: '',
                activity_description: '',
                responsible_name: (user as any)?.user_metadata?.full_name || '',
                responsible_email: user?.email || '',
                due_date: new Date().toISOString().split('T')[0],
                priority: 'medium',
                status: 'pending',
                sub_activities: [],
            });
        }
        setIsActivityModalOpen(true);
    };

    const handleUpsertActivity = async () => {
        if (!activityForm.activity_name) {
            toast({ title: 'Erro', description: 'Nome da atividade é obrigatório', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            if (editingActivity) {
                const { error } = await supabase
                    .from('risk_registration_action_plans')
                    .update({
                        activity_name: activityForm.activity_name,
                        activity_description: activityForm.activity_description,
                        responsible_name: activityForm.responsible_name,
                        responsible_email: activityForm.responsible_email,
                        due_date: activityForm.due_date,
                        priority: activityForm.priority,
                        status: activityForm.status,
                        sub_activities: activityForm.sub_activities,
                    })
                    .eq('id', editingActivity.id);
                if (error) throw error;
                toast({ title: 'Atividade atualizada!' });
            } else {
                const { error } = await supabase
                    .from('risk_registration_action_plans')
                    .insert([{
                        risk_registration_id: id,
                        activity_name: activityForm.activity_name,
                        activity_description: activityForm.activity_description,
                        responsible_name: activityForm.responsible_name,
                        responsible_email: activityForm.responsible_email,
                        due_date: activityForm.due_date,
                        priority: activityForm.priority,
                        status: activityForm.status,
                        sub_activities: activityForm.sub_activities,
                        tenant_id: (user as any)?.user_metadata?.tenant_id
                    }]);
                if (error) throw error;
                toast({ title: 'Atividade criada!' });
            }
            setIsActivityModalOpen(false);
            fetchData();
        } catch (err: any) {
            toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
        } finally { setIsSaving(false); }
    };

    const handleDeleteActivity = async (apId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta atividade?')) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('risk_registration_action_plans')
                .delete()
                .eq('id', apId);
            if (error) throw error;
            toast({ title: 'Atividade excluída' });
            fetchData();
        } catch (err: any) {
            toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
        } finally { setIsSaving(false); }
    };

    const handleAnalystValidation = async (apId: string) => {
        if (!window.confirm('Tem certeza que deseja validar este plano de ação? Ele será marcado como concluído.')) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('risk_registration_action_plans')
                .update({ analyst_validation_status: 'approved', status: 'completed' })
                .eq('id', apId);
            if (error) throw error;
            toast({ title: 'Plano Validado', description: 'O plano de ação foi validado e movido para concluídos.' });
            fetchData();
        } catch (err: any) {
            toast({ title: 'Erro na validação', description: err.message, variant: 'destructive' });
        } finally { setIsSaving(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4" />
        </div>
    );

    if (!risk) return (
        <div className="text-center py-16">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-bold">Risco não encontrado</p>
            <Button className="mt-4" onClick={() => navigate('/risk-portal/my-risks')}>Voltar</Button>
        </div>
    );

    const levelColors: Record<string, string> = {
        'Muito Alto': 'bg-red-500/10 text-red-700 border-red-500/20',
        'Alto': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
        'Médio': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        'Baixo': 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-600" /> {risk.risk_title}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className={levelColors[risk.risk_level] || 'bg-gray-500/10'}>{risk.risk_level || 'Não definido'}</Badge>
                        <Badge variant="outline">{risk.risk_category || 'Sem categoria'}</Badge>
                        <Badge variant="outline">{risk.status}</Badge>
                    </div>
                </div>
            </div>

            {/* My Response Banner */}
            {myStakeholder && (
                <Card className={`border-2 ${myStakeholder.response_status === 'pending' ? 'border-red-600/40 bg-red-600/5' : 'border-emerald-500/40 bg-emerald-500/5'}`}>
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <p className="font-bold text-foreground mb-1">Minha Resposta</p>
                                <p className="text-sm text-muted-foreground">
                                    Tipo: <strong>{myStakeholder.notification_type === 'approval' ? 'Para Aprovação' : 'Para Ciência'}</strong>
                                    {' — '} Status atual: <strong>{RESP_LABELS[myStakeholder.response_status] || myStakeholder.response_status}</strong>
                                </p>
                            </div>
                            {myStakeholder.response_status === 'pending' && (
                                <div className="flex gap-2 flex-wrap">
                                    {myStakeholder.notification_type !== 'approval' ? (
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating} onClick={() => updateMyStatus('acknowledged')}>
                                            👁️ Tomar Ciência
                                        </Button>
                                    ) : (
                                        <>
                                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={updating} onClick={() => updateMyStatus('approved')}>✅ Aprovar</Button>
                                            <Button variant="outline" className="border-red-500/50 text-red-600" disabled={updating} onClick={() => updateMyStatus('rejected')}>❌ Rejeitar</Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Risk Details */}
            <Card className="border border-border shadow-sm">
                <CardHeader className="bg-muted/50 border-b border-border">
                    <CardTitle className="text-base flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-600" /> Detalhes do Risco</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Descrição</p>
                        <p className="text-sm text-foreground">{risk.risk_description || 'Não informada'}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Nível</p><p className="text-sm font-semibold">{risk.risk_level || '—'}</p></div>
                        <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Probabilidade</p><p className="text-sm font-semibold">{risk.likelihood_score || '—'}</p></div>
                        <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Impacto</p><p className="text-sm font-semibold">{risk.impact_score || '—'}</p></div>
                        <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Status</p><p className="text-sm font-semibold">{risk.status || '—'}</p></div>
                    </div>
                    {risk.existing_controls && (
                        <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Controles Existentes</p><p className="text-sm">{risk.existing_controls}</p></div>
                    )}
                    {risk.closure_criteria && (
                        <div><p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Critérios de Encerramento</p><p className="text-sm">{risk.closure_criteria}</p></div>
                    )}
                </CardContent>
            </Card>

            {/* Action Plans — interactive */}
            <Card className="border border-border shadow-sm">
                <CardHeader className="bg-muted/50 border-b border-border flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-purple-600" /> Planos de Ação ({actionPlans.length})
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => openActivityModal()} className="h-8 border-purple-600/30 text-purple-700 hover:bg-purple-600/5">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Nova Atividade
                    </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {actionPlans.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum plano de ação registrado.</p>
                    ) : (
                        <Tabs defaultValue="pending" className="w-full">
                            <TabsList className="mb-4 bg-muted">
                                <TabsTrigger value="pending" className="data-[state=active]:bg-background">
                                    Em Aberto ({actionPlans.filter(ap => ap.analyst_validation_status !== 'approved' && ap.status !== 'completed').length})
                                </TabsTrigger>
                                <TabsTrigger value="completed" className="data-[state=active]:bg-background">
                                    Concluídos ({actionPlans.filter(ap => ap.analyst_validation_status === 'approved' || ap.status === 'completed').length})
                                </TabsTrigger>
                            </TabsList>

                            {['pending', 'completed'].map(tab => {
                                const plansInTab = actionPlans.filter(ap =>
                                    tab === 'completed'
                                        ? (ap.analyst_validation_status === 'approved' || ap.status === 'completed')
                                        : (ap.analyst_validation_status !== 'approved' && ap.status !== 'completed')
                                );

                                return (
                                    <TabsContent key={tab} value={tab} className="space-y-4 m-0 outline-none">
                                        {plansInTab.length === 0 ? (
                                            <p className="text-sm text-muted-foreground italic">Nenhum plano nesta categoria.</p>
                                        ) : plansInTab.map((ap) => {
                                            const s = AP_STATUS_MAP[ap.status] || AP_STATUS_MAP.pending;
                                            return (
                                                <div key={ap.id} className="p-4 rounded-lg border border-border bg-card hover:border-purple-600/30 transition-colors">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap gap-2 mb-1">
                                                                <Badge variant="outline" className={`text-xs ${s.color}`}>{s.label}</Badge>
                                                                {ap.analyst_validation_status === 'approved' && (
                                                                    <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600 bg-emerald-500/10">✅ Validado</Badge>
                                                                )}
                                                                {ap.analyst_validation_status === 'rejected' && (
                                                                    <Badge variant="outline" className="text-xs border-red-500/40 text-red-600 bg-red-500/10">❌ Rejeitado</Badge>
                                                                )}
                                                            </div>
                                                            <p className="font-semibold text-sm text-foreground">{ap.activity_name || 'Sem título'}</p>
                                                            {ap.activity_description && <p className="text-xs text-muted-foreground mt-1">{ap.activity_description}</p>}

                                                            {ap.sub_activities && ap.sub_activities.length > 0 && (
                                                                <div className="mt-3 space-y-1.5 p-3 rounded-md bg-muted/20 border border-border">
                                                                    <p className="text-xs font-semibold text-muted-foreground uppercase">Sub-atividades</p>
                                                                    {ap.sub_activities.map((sub: any, idx: number) => (
                                                                        <div key={sub.id || idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <div className={`h-3 w-3 rounded-sm border flex items-center justify-center shrink-0 ${sub.done ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground'}`}>
                                                                                {sub.done && <CheckCircle className="h-2 w-2 text-white" />}
                                                                            </div>
                                                                            <span className={sub.done ? 'line-through opacity-70' : ''}>{sub.text}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="icon" title="Editar" className="h-7 w-7 text-blue-600" onClick={() => openActivityModal(ap)}>
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" title="Excluir" className="h-7 w-7 text-red-600" onClick={() => handleDeleteActivity(ap.id)}>
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                            {ap.analyst_validation_status !== 'approved' && (
                                                                <Select
                                                                    value={ap.status}
                                                                    onValueChange={v => handleUpdatePlanStatus(ap.id, v)}
                                                                    disabled={ap.status === 'awaiting_validation'}
                                                                >
                                                                    <SelectTrigger className="h-7 text-xs w-[140px]">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="pending">⏳ Pendente</SelectItem>
                                                                        <SelectItem value="in_progress">🔄 Em Andamento</SelectItem>
                                                                        <SelectItem value="completed">✅ Concluído</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                            {ap.analyst_validation_status !== 'approved' && ap.status === 'awaiting_validation' && (
                                                                <Button size="sm" onClick={() => handleAnalystValidation(ap.id)} className="h-7 mt-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                                                                    ✅ Validar (Analista)
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                                                        {ap.responsible_name && (
                                                            <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {ap.responsible_name}</span>
                                                        )}
                                                        {ap.due_date && (
                                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(ap.due_date).toLocaleDateString('pt-BR')}</span>
                                                        )}
                                                    </div>

                                                    {(ap.evidence_url || ap.stakeholder_notes) && (
                                                        <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2 mb-3">
                                                            {ap.stakeholder_notes && (
                                                                <p className="text-xs text-foreground">
                                                                    <span className="font-semibold text-muted-foreground uppercase text-[10px] mr-1">Obs.:</span>
                                                                    {ap.stakeholder_notes}
                                                                </p>
                                                            )}
                                                            {ap.evidence_url && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 text-xs text-blue-600 px-2 mt-1 p-0 justify-start"
                                                                    onClick={() => setEvidencePreview({ isOpen: true, url: ap.evidence_url, title: ap.evidence_name || 'Evidência' })}
                                                                >
                                                                    <Eye className="h-3 w-3 mr-1" /> Preview Documento
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {ap.analyst_notes && (
                                                        <div className={`p-3 rounded-lg border text-xs mb-3 ${ap.analyst_validation_status === 'approved' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700' : 'border-red-500/30 bg-red-500/5 text-red-700'}`}>
                                                            <span className="font-semibold mr-1">Analista:</span>{ap.analyst_notes}
                                                        </div>
                                                    )}

                                                    {ap.analyst_validation_status !== 'approved' && (
                                                        <Button variant="outline" size="sm" onClick={() => openEvidenceModal(ap)} className="border-purple-600/30 text-purple-700 hover:bg-purple-600/5">
                                                            <UploadCloud className="h-3.5 w-3.5 mr-1" />
                                                            {ap.evidence_url ? 'Atualizar Evidência' : 'Enviar Evidência'}
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            {/* Stakeholders */}
            <Card className="border border-border shadow-sm">
                <CardHeader className="bg-muted/50 border-b border-border">
                    <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-blue-600" /> Partes Interessadas ({stakeholders.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {stakeholders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma parte interessada cadastrada.</p>
                    ) : (
                        <div className="space-y-3">
                            {stakeholders.map((stk) => (
                                <div key={stk.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/30">
                                    <div>
                                        <p className="font-semibold text-sm text-foreground">{stk.name || 'Sem nome'}</p>
                                        <p className="text-xs text-muted-foreground">{stk.position || ''} {stk.email ? `· ${stk.email}` : ''}</p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-500/20">
                                            {stk.notification_type === 'approval' ? '🔐 Aprovação' : '👁️ Ciência'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">{RESP_LABELS[stk.response_status] || '⏳ Pendente'}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Evidence Modal */}
            <Dialog open={isEvidenceModalOpen} onOpenChange={setIsEvidenceModalOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5 text-purple-600" />
                            Enviar Evidência e Observações
                        </DialogTitle>
                        <DialogDescription>
                            Anexe evidências de conclusão e deixe observações para o analista validar esta atividade.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="p-3 rounded-lg bg-muted/30 border">
                            <p className="text-xs font-medium text-muted-foreground">Atividade:</p>
                            <p className="text-sm font-semibold mt-0.5">{selectedPlanForEvidence?.activity_name}</p>
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
                                    <Button variant="ghost" size="sm" onClick={() => setEvidenceForm(prev => ({ ...prev, evidence_url: '', evidence_name: '' }))} className="h-6 w-6 p-0 text-red-500">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Input type="file" onChange={handleUploadEvidence} disabled={isUploading} className="text-xs cursor-pointer" />
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

            {/* Activity Modal (Create/Edit) */}
            <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            {editingActivity ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingActivity ? 'Atualize os detalhes desta atividade.' : 'Crie uma nova atividade para este risco.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome da Atividade</Label>
                            <Input
                                id="name"
                                value={activityForm.activity_name}
                                onChange={e => setActivityForm(prev => ({ ...prev, activity_name: e.target.value }))}
                                placeholder="Ex: Implementar criptografia"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={activityForm.activity_description}
                                onChange={e => setActivityForm(prev => ({ ...prev, activity_description: e.target.value }))}
                                placeholder="Detalhes..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="resp">Responsável</Label>
                                <Input
                                    id="resp"
                                    value={activityForm.responsible_name}
                                    onChange={e => setActivityForm(prev => ({ ...prev, responsible_name: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="resp_email">E-mail do Responsável</Label>
                                <Input
                                    id="resp_email"
                                    value={activityForm.responsible_email}
                                    onChange={e => setActivityForm(prev => ({ ...prev, responsible_email: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="due">Prazo</Label>
                                <Input
                                    id="due"
                                    type="date"
                                    value={activityForm.due_date}
                                    onChange={e => setActivityForm(prev => ({ ...prev, due_date: e.target.value }))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Prioridade</Label>
                                <Select
                                    value={activityForm.priority}
                                    onValueChange={v => setActivityForm(prev => ({ ...prev, priority: v }))}
                                >
                                    <SelectTrigger id="priority">
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
                        </div>
                    </div>

                    <div className="grid gap-2 py-2 border-t mt-2">
                        <Label>Sub-atividades</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nova sub-atividade"
                                id="new-sub-activity"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.currentTarget;
                                        if (input.value.trim()) {
                                            setActivityForm(prev => ({
                                                ...prev,
                                                sub_activities: [...prev.sub_activities, { id: Math.random().toString(36).substring(7), text: input.value.trim(), done: false }]
                                            }));
                                            input.value = '';
                                        }
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={(e) => {
                                    const input = document.getElementById('new-sub-activity') as HTMLInputElement;
                                    if (input?.value.trim()) {
                                        setActivityForm(prev => ({
                                            ...prev,
                                            sub_activities: [...prev.sub_activities, { id: Math.random().toString(36).substring(7), text: input.value.trim(), done: false }]
                                        }));
                                        input.value = '';
                                    }
                                }}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {activityForm.sub_activities.length > 0 && (
                            <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto pr-1">
                                {activityForm.sub_activities.map((sub, i) => (
                                    <div key={sub.id || i} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={sub.done}
                                                onChange={(e) => {
                                                    const updated = [...activityForm.sub_activities];
                                                    updated[i].done = e.target.checked;
                                                    setActivityForm(prev => ({ ...prev, sub_activities: updated }));
                                                }}
                                                className="h-4 w-4 text-emerald-600 rounded"
                                            />
                                            <span className={`text-sm ${sub.done ? 'line-through text-muted-foreground' : ''}`}>{sub.text}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-red-500 hover:bg-red-50"
                                            onClick={() => {
                                                const updated = [...activityForm.sub_activities];
                                                updated.splice(i, 1);
                                                setActivityForm(prev => ({ ...prev, sub_activities: updated }));
                                            }}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUpsertActivity} disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Salvar Atividade'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog Preview Evidência */}
            <Dialog open={evidencePreview.isOpen} onOpenChange={(open) => setEvidencePreview(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle>Visualização de Evidência: {evidencePreview.title}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full relative bg-muted/30 overflow-hidden flex items-center justify-center p-4">
                        {evidencePreview.url.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                            <img src={evidencePreview.url} alt="Evidência" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <iframe src={evidencePreview.url} title="Preview Documento" className="w-full h-full border-0 bg-white" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default RiskPortalRiskDetail;
