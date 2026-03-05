import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, AlertTriangle, Clock, ArrowRight, Activity, Calendar, ShieldCheck, Target, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [actionPlans, setActionPlans] = useState<any[]>([]);
    const [vendorRegistryInfo, setVendorRegistryInfo] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // 1. Obter informações do fornecedor (verificando ambas as tabelas)
            let currentVendorId = null;

            // Tentativa 1: vendor_users
            const { data: vendorUser } = await supabase
                .from('vendor_users')
                .select('vendor_id')
                .eq('auth_user_id', user.id)
                .limit(1)
                .maybeSingle();

            if (vendorUser?.vendor_id) {
                currentVendorId = vendorUser.vendor_id;
            } else {
                // Tentativa 2: vendor_portal_users
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
                throw new Error("Perfil de fornecedor não associado a uma conta válida.");
            }

            // Obter dados do vendor_registry
            const { data: registryData, error: registryError } = await supabase
                .from('vendor_registry')
                .select('id, name, vendor_type')
                .eq('id', currentVendorId)
                .single();

            if (registryError || !registryData) throw new Error("Registro do fornecedor não encontrado.");
            setVendorRegistryInfo(registryData);

            // 2. Obter assessments desse fornecedor
            const { data: vendorAssessments, error: assessError } = await supabase
                .from('vendor_assessments')
                .select(`
                  id,
                  assessment_name,
                  status,
                  due_date,
                  progress_percentage,
                  created_at,
                  overall_score,
                  risk_level,
                  submission_summary,
                  metadata,
                  framework:framework_id (nome)
                `)
                .eq('vendor_id', currentVendorId)
                .order('created_at', { ascending: false });

            if (assessError) throw assessError;
            setAssessments(vendorAssessments || []);

            // 3. Obter Planos de Ação (vendor + vendor_assessment)
            const { data: plansData, error: plansError } = await supabase
                .from('action_plans')
                .select('id, status')
                .eq('entidade_origem_id', currentVendorId)
                .in('entidade_origem_tipo', ['vendor', 'vendor_assessment']);

            if (!plansError && plansData) {
                setActionPlans(plansData);
            }

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao carregar dashboard",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4 shadow-lg"></div>
                <p className="text-muted-foreground animate-pulse font-medium">Carregando painel de controle...</p>
            </div>
        );
    }

    const pendingAssessments = assessments.filter(a => a.status === 'draft' || a.status === 'sent');
    const completedAssessments = assessments.filter(a => a.status === 'completed' || a.status === 'under_review' || a.status === 'approved');
    const activePlans = actionPlans.filter(p => !['completed', 'verified'].includes(p.status));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
            case 'sent':
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">Pendente</Badge>;
            case 'under_review':
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">Em Avaliação (Admin)</Badge>;
            case 'completed':
            case 'approved':
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Concluído</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 w-full max-w-full overflow-hidden">
            {/* Cabecalho de Boas Vindas com Design Premium */}
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border p-8 sm:p-10 shadow-sm">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2 opacity-90">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Portal Confiável</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-primary">
                            Olá, {vendorRegistryInfo?.name || (user as any)?.user_metadata?.name || (user as any)?.name || user?.email?.split('@')[0] || 'Fornecedor'}!
                        </h1>
                        <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
                            Bem-vindo ao seu painel central de conformidade. Acompanhe seus questionários, planos de correção e status regulatório.
                        </p>
                    </div>
                    <div className="hidden lg:block">
                        <div className="bg-muted backdrop-blur-md rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4 text-foreground">
                            <div className="h-14 w-14 bg-background rounded-full flex items-center justify-center border border-border">
                                <span className="text-2xl font-bold">{pendingAssessments.length}</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tarefas</p>
                                <p className="text-xl font-bold text-foreground">Pendentes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-amber-500/5 to-transparent">
                        <CardTitle className="text-sm font-semibold text-foreground">Avaliações Pendentes</CardTitle>
                        <div className="p-2 bg-amber-500/10 rounded-full text-amber-500 dark:text-amber-400">
                            <Clock className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-4xl font-black text-foreground">{pendingAssessments.length}</div>
                        <p className="text-sm md:text-xs text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
                            {pendingAssessments.length > 0 ? "Ação requerida de sua parte" : "Tudo em dia!"}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-emerald-500/5 to-transparent">
                        <CardTitle className="text-sm font-semibold text-foreground">Avaliações Concluídas</CardTitle>
                        <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500 dark:text-emerald-400">
                            <CheckSquare className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-4xl font-black text-foreground">{completedAssessments.length}</div>
                        <p className="text-sm md:text-xs text-muted-foreground mt-2 font-medium">Entregues com sucesso</p>
                    </CardContent>
                </Card>

                <Card
                    className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate('/vendor-portal/action-plans')}
                >
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-purple-500/5 to-transparent">
                        <CardTitle className="text-sm font-semibold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Planos de Ação (Abertos)</CardTitle>
                        <div className="p-2 bg-purple-500/10 rounded-full text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <Target className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-4xl font-black text-foreground">{activePlans.length}</div>
                        <p className="text-sm md:text-xs text-purple-600/80 dark:text-purple-400/80 mt-2 flex items-center gap-1 font-medium group-hover:underline">
                            Ver detalhes <ArrowRight className="h-3 w-3" />
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal: Assesssments */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border border-border overflow-hidden">
                        <CardHeader className="bg-muted/50 border-b border-border">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                                    <AlertTriangle className={`h-5 w-5 ${pendingAssessments.length > 0 ? "text-amber-500" : "text-emerald-500"}`} />
                                    Prioridades
                                </h2>
                                {pendingAssessments.length > 0 && (
                                    <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border-0">{pendingAssessments.length} requisições</Badge>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {pendingAssessments.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {pendingAssessments.slice(0, 5).map((assessment) => (
                                        <div key={assessment.id} className="p-5 sm:p-6 hover:bg-muted/50 transition-colors group">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-foreground text-lg truncate mb-1 group-hover:text-primary transition-colors">
                                                        {assessment.assessment_name}
                                                    </h3>
                                                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                                                        <span className="flex items-center">
                                                            <Calendar className="mr-1.5 h-4 w-4 text-muted-foreground/70" />
                                                            {new Date(assessment.due_date).toLocaleDateString('pt-BR')}
                                                        </span>
                                                        {assessment.framework && (
                                                            <span className="truncate hidden sm:inline-block border-l pl-4 border-border">
                                                                {assessment.framework.nome}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="shrink-0 flex items-center gap-3">
                                                    {getStatusBadge(assessment.status)}
                                                </div>
                                            </div>

                                            <div className="bg-card rounded-lg p-4 border border-border shadow-sm mb-4">
                                                <div className="flex justify-between text-sm font-semibold mb-2">
                                                    <span className="text-foreground">Completude do Questionário</span>
                                                    <span className="text-primary">{assessment.progress_percentage || 0}%</span>
                                                </div>
                                                <Progress value={assessment.progress_percentage || 0} className="h-2.5 bg-muted" />
                                            </div>

                                            <div className="flex justify-end">
                                                <Button
                                                    className="w-full sm:w-auto shadow-sm group-hover:shadow-md transition-shadow"
                                                    onClick={() => navigate(`/vendor-portal/assessment/${assessment.id}`)}
                                                >
                                                    {assessment.progress_percentage > 0 ? 'Continuar Respostas' : 'Iniciar Questionário'}
                                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 px-4">
                                    <div className="bg-emerald-500/10 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckSquare className="h-10 w-10 text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Tudo em conformidade!</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Nenhuma avaliação pendente para responder neste momento. Parabéns por manter sua conta atualizada.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        {pendingAssessments.length > 5 && (
                            <CardFooter className="bg-muted/30 p-4 justify-center border-t border-border">
                                <Button variant="ghost" onClick={() => navigate('/vendor-portal/assessments')} className="text-primary font-medium">
                                    Ver todas as {pendingAssessments.length} pendências
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>

                {/* Coluna Secundária: Destaques e Dicas */}
                <div className="space-y-6">
                    <Card className="shadow-sm border border-border bg-gradient-to-b from-card to-primary/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                                <Target className="h-5 w-5 text-indigo-500" />
                                Seu Próximo Passo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6 px-2">
                                <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shell shadow-sm">
                                    <Activity className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-foreground mb-2">Planos de Ação</h3>
                                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                                    Acesse a gestão de anomalias pontuadas pela auditoria. Interaja rapidamente para provar conformidade.
                                </p>
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all"
                                    onClick={() => navigate('/vendor-portal/action-plans')}
                                >
                                    Gerenciar Planos
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border border-border">
                        <CardHeader className="bg-muted/50 pb-3 border-b border-border">
                            <CardTitle className="text-base flex items-center gap-2 text-foreground">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                Suporte Técnico
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Dificuldades para preencher avaliações ou reportar evidências? Entre em contato com a equipe de compliance.
                            </p>
                            <Button variant="outline" className="w-full border-border hover:bg-muted" onClick={() => navigate('/vendor-portal/messages')}>
                                Fale Conosco
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
