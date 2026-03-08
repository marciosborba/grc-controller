import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AP_STATUS: Record<string, string> = {
    pending: '⏳ Pendente', in_progress: '🔄 Em Andamento',
    completed: '✅ Concluído', delayed: '⚠️ Atrasado',
};
const AP_COLORS: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    in_progress: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    delayed: 'bg-red-500/10 text-red-700 border-red-500/20',
};

export const RiskPortalActionPlans = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => { fetchPlans(); }, [user]);

    const fetchPlans = async () => {
        if (!user) return;
        try {
            setLoading(true);
            // Get all risk IDs where the user is a stakeholder
            const { data: stkData } = await supabase
                .from('risk_stakeholders')
                .select('risk_registration_id')
                .eq('email', user.email?.trim().toLowerCase() || '');

            const riskIds = (stkData || []).map((s: any) => s.risk_registration_id).filter(Boolean);

            if (riskIds.length === 0) { setPlans([]); return; }

            const { data: apData, error } = await supabase
                .from('risk_registration_action_plans')
                .select(`*, risk_registrations(id, risk_title, risk_level)`)
                .in('risk_registration_id', riskIds)
                .order('due_date', { ascending: true });

            if (error) throw error;
            setPlans(apData || []);
        } catch (err: any) {
            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
        } finally { setLoading(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4" />
        </div>
    );

    const open = plans.filter(p => p.status !== 'completed');
    const done = plans.filter(p => p.status === 'completed');

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                    <Target className="h-6 w-6 text-purple-600" /> Planos de Ação
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    {plans.length} plano(s) relacionados aos seus riscos · {open.length} em aberto · {done.length} concluídos
                </p>
            </div>

            {plans.length === 0 ? (
                <Card className="border border-border shadow-sm">
                    <CardContent className="text-center py-16">
                        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-bold text-foreground">Nenhum plano de ação</p>
                        <p className="text-muted-foreground text-sm mt-1">Não há planos de ação associados aos seus riscos.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {open.length > 0 && (
                        <Card className="border border-border shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/50 border-b border-border py-3 px-4 sm:px-6">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target className="h-4 w-4 text-purple-600" /> Em Aberto ({open.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {open.map((ap) => (
                                        <div key={ap.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap gap-2 mb-1">
                                                        <Badge variant="outline" className={`text-xs ${AP_COLORS[ap.status] || 'bg-gray-500/10'}`}>
                                                            {AP_STATUS[ap.status] || ap.status}
                                                        </Badge>
                                                        {ap.risk_registrations?.risk_level && (
                                                            <Badge variant="outline" className="text-xs">{ap.risk_registrations.risk_level}</Badge>
                                                        )}
                                                    </div>
                                                    <p className="font-semibold text-foreground text-sm sm:text-base mb-1">{ap.activity_name || 'Sem título'}</p>
                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        Risco: <span className="font-medium text-foreground">{ap.risk_registrations?.risk_title || '—'}</span>
                                                    </p>
                                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                                        {ap.responsible_name && (
                                                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ap.responsible_name}</span>
                                                        )}
                                                        {ap.due_date && (
                                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(ap.due_date).toLocaleDateString('pt-BR')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" onClick={() => navigate(`/risk-portal/risk/${ap.risk_registration_id}`)}>
                                                    Ver Risco <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {done.length > 0 && (
                        <Card className="border border-border shadow-sm overflow-hidden opacity-80">
                            <CardHeader className="bg-muted/50 border-b border-border py-3 px-4 sm:px-6">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Target className="h-4 w-4 text-emerald-600" /> Concluídos ({done.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {done.map((ap) => (
                                        <div key={ap.id} className="p-4 sm:p-4 hover:bg-muted/30 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground line-through opacity-70">{ap.activity_name || 'Sem título'}</p>
                                                    <p className="text-xs text-muted-foreground">{ap.risk_registrations?.risk_title || '—'}</p>
                                                </div>
                                                <Badge variant="outline" className={`text-xs shrink-0 ${AP_COLORS['completed']}`}>✅ Concluído</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default RiskPortalActionPlans;
