import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShieldAlert, Users, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RESP_LABELS: Record<string, string> = {
    pending: '⏳ Pendente', acknowledged: '👁️ Ciência Tomada',
    approved: '✅ Aprovado', rejected: '❌ Rejeitado',
};
const APStatus: Record<string, string> = {
    pending: '⏳ Pendente', in_progress: '🔄 Em Andamento',
    completed: '✅ Concluído', delayed: '⚠️ Atrasado',
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

    useEffect(() => { if (id) fetchData(); }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [riskRes, stkRes, apRes] = await Promise.all([
                supabase.from('risk_registrations').select('*').eq('id', id).single(),
                supabase.from('risk_stakeholders').select('*').eq('risk_registration_id', id),
                supabase.from('risk_registration_action_plans').select('*').eq('risk_registration_id', id),
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
    };

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
                                        <Badge variant="outline" className="text-xs">
                                            {RESP_LABELS[stk.response_status] || stk.response_status || '⏳ Pendente'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Plans */}
            <Card className="border border-border shadow-sm">
                <CardHeader className="bg-muted/50 border-b border-border">
                    <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4 text-purple-600" /> Planos de Ação ({actionPlans.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {actionPlans.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum plano de ação registrado.</p>
                    ) : (
                        <div className="space-y-3">
                            {actionPlans.map((ap) => (
                                <div key={ap.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/30">
                                    <div>
                                        <p className="font-semibold text-sm text-foreground">{ap.activity_name || 'Sem título'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Responsável: {ap.responsible_name || '—'} · Prazo: {ap.due_date ? new Date(ap.due_date).toLocaleDateString('pt-BR') : '—'}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-xs shrink-0">{APStatus[ap.status] || ap.status || '⏳ Pendente'}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RiskPortalRiskDetail;
