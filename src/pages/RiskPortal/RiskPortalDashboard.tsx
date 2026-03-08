import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ShieldAlert, AlertTriangle, Clock, ArrowRight, Target, CheckCircle, Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getRiskLevelBadge = (level: string) => {
    const map: Record<string, string> = {
        'Muito Alto': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        'Alto': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
        'Médio': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        'Baixo': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        'critical': 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
        'high': 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
        'medium': 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        'low': 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    };
    return map[level] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
};

export const RiskPortalDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [myRisks, setMyRisks] = useState<any[]>([]);
    const [actionPlansCount, setActionPlansCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;
        try {
            setIsLoading(true);

            // Buscar stakeholders onde o email do usuário está cadastrado
            const { data: stakeholderData, error: stkError } = await supabase
                .from('risk_stakeholders')
                .select(`
          id, notification_type, response_status,
          risk_registration_id,
          risk_registrations!inner (
            id, risk_title, risk_description, risk_level, risk_category, status, created_at
          )
        `)
                .eq('email', user.email?.trim().toLowerCase() || '');

            if (stkError) throw stkError;

            const risks = (stakeholderData || []).map((s: any) => ({
                stakeholder_id: s.id,
                notification_type: s.notification_type,
                response_status: s.response_status,
                ...s.risk_registrations,
            }));

            setMyRisks(risks);
            setPendingCount(risks.filter(r => r.response_status === 'pending').length);

            // Buscar action plans dos riscos associados
            if (risks.length > 0) {
                const riskIds = risks.map(r => r.id);
                const { count } = await supabase
                    .from('risk_registration_action_plans')
                    .select('*', { count: 'exact', head: true })
                    .in('risk_registration_id', riskIds)
                    .neq('status', 'completed');
                setActionPlansCount(count || 0);
            }
        } catch (error: any) {
            toast({ title: 'Erro ao carregar dashboard', description: error.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4 shadow-lg" />
                <p className="text-muted-foreground animate-pulse font-medium">Carregando painel...</p>
            </div>
        );
    }

    const urgentRisks = myRisks.filter(r => ['Muito Alto', 'Alto', 'critical', 'high'].includes(r.risk_level));

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12 w-full max-w-full overflow-hidden px-2 sm:px-0">

            {/* Hero Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-6 sm:p-10 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                    <div>
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 opacity-90">
                            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-muted-foreground">Portal de Riscos</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-foreground leading-tight">
                            Olá, {user?.email?.split('@')[0]}!
                        </h1>
                        <p className="text-sm sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                            Você possui <strong className="text-foreground">{myRisks.length} risco(s)</strong> associados à sua conta.
                            Revise os detalhes e registre sua resposta para manter a organização protegida.
                        </p>
                    </div>
                    {pendingCount > 0 && (
                        <div className="bg-red-600/10 backdrop-blur-md rounded-2xl p-4 border border-red-600/20 shadow-sm flex items-center gap-4 shrink-0">
                            <div className="h-14 w-14 bg-red-600/20 rounded-full flex items-center justify-center border border-red-600/30">
                                <span className="text-2xl font-bold text-red-600">{pendingCount}</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Resposta</p>
                                <p className="text-xl font-bold text-red-600">Pendente</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                <Card className="border-l-4 border-l-red-600 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-2! space-y-0">
                        <CardTitle className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2">Riscos Associados</CardTitle>
                        <div className="p-1.5 sm:p-2 bg-red-600/10 rounded-full text-red-600 shrink-0">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
                        <div className="text-2xl sm:text-4xl font-black text-foreground">{myRisks.length}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 font-medium">
                            {urgentRisks.length > 0 ? `${urgentRisks.length} requer(em) atenção urgente` : 'Nenhum risco crítico'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-2! space-y-0">
                        <CardTitle className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2">Respostas Pendentes</CardTitle>
                        <div className="p-1.5 sm:p-2 bg-amber-500/10 rounded-full text-amber-500 shrink-0">
                            <Clock className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
                        <div className="text-2xl sm:text-4xl font-black text-foreground">{pendingCount}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 font-medium">
                            {pendingCount > 0 ? 'Ação requerida de sua parte' : 'Tudo respondido!'}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group col-span-2 md:col-span-1"
                    onClick={() => navigate('/risk-portal/action-plans')}
                >
                    <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6 pb-2! space-y-0">
                        <CardTitle className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-purple-600 transition-colors">Planos de Ação</CardTitle>
                        <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                            <Target className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 pt-2 sm:pt-4">
                        <div className="text-2xl sm:text-4xl font-black text-foreground">{actionPlansCount}</div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2 font-medium flex items-center gap-1">
                            Em andamento <ArrowRight className="h-3 w-3" />
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Risks — Pending */}
            {myRisks.filter(r => r.response_status === 'pending').length > 0 && (
                <Card className="shadow-sm border border-border overflow-hidden">
                    <CardHeader className="bg-red-600/5 border-b border-border py-3 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                Aguardando Sua Resposta
                            </h2>
                            <Badge className="bg-red-600/10 text-red-700 border-0">{pendingCount} pendente(s)</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {myRisks.filter(r => r.response_status === 'pending').slice(0, 5).map((risk) => (
                                <div key={risk.stakeholder_id} className="p-4 sm:p-5 hover:bg-muted/50 transition-colors group">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-foreground text-base truncate mb-1 group-hover:text-red-600 transition-colors">
                                                {risk.risk_title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{risk.risk_description || 'Sem descrição'}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                <Badge variant="outline" className={`text-xs ${getRiskLevelBadge(risk.risk_level)}`}>{risk.risk_level || 'Não definido'}</Badge>
                                                <Badge variant="outline" className="text-xs">{risk.risk_category || 'Sem categoria'}</Badge>
                                                <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/20">
                                                    {risk.notification_type === 'approval' ? '🔐 Aprovação' : '👁️ Ciência'} — ⏳ Pendente
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button onClick={() => navigate(`/risk-portal/risk/${risk.id}`)} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-sm shrink-0">
                                            Responder <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    {myRisks.filter(r => r.response_status === 'pending').length > 5 && (
                        <CardFooter className="bg-muted/30 p-3 justify-center border-t border-border">
                            <Button variant="ghost" onClick={() => navigate('/risk-portal/my-risks')} className="text-red-600 text-sm font-medium">
                                Ver todos os pendentes →
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            )}

            {/* Risks — Responded/Concluded */}
            {myRisks.filter(r => r.response_status !== 'pending').length > 0 && (
                <Card className="shadow-sm border border-border overflow-hidden opacity-90">
                    <CardHeader className="bg-muted/50 border-b border-border py-3 px-4 sm:px-6">
                        <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            Concluídos / Respondidos ({myRisks.filter(r => r.response_status !== 'pending').length})
                        </h2>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {myRisks.filter(r => r.response_status !== 'pending').slice(0, 4).map((risk) => (
                                <div key={risk.stakeholder_id} className="p-3 sm:p-4 hover:bg-muted/30 transition-colors group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-foreground truncate group-hover:text-red-600 transition-colors">{risk.risk_title}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                <Badge variant="outline" className={`text-xs ${getRiskLevelBadge(risk.risk_level)}`}>{risk.risk_level || '—'}</Badge>
                                                <Badge variant="outline" className={`text-xs ${risk.response_status === 'rejected' ? 'bg-red-500/10 text-red-700 border-red-500/20' : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'}`}>
                                                    {risk.response_status === 'acknowledged' ? '✅ Ciência Tomada' : risk.response_status === 'approved' ? '✅ Aprovado' : '❌ Rejeitado'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => navigate(`/risk-portal/risk/${risk.id}`)} className="shrink-0 text-xs gap-1">
                                            Ver <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    {myRisks.filter(r => r.response_status !== 'pending').length > 4 && (
                        <CardFooter className="bg-muted/30 p-3 justify-center border-t border-border">
                            <Button variant="ghost" onClick={() => navigate('/risk-portal/my-risks')} className="text-xs font-medium">Ver todos →</Button>
                        </CardFooter>
                    )}
                </Card>
            )}

            {myRisks.length === 0 && (
                <Card className="shadow-sm border border-border">
                    <CardContent className="text-center py-16 px-4">
                        <div className="bg-emerald-500/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-10 w-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Nenhum risco associado</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Você não possui riscos associados ao seu e-mail neste momento.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default RiskPortalDashboard;
