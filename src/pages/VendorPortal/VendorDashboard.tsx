import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, AlertTriangle, Clock, ArrowRight, Activity, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const VendorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [vendorData, setVendorData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            // 1. Obter informações do fornecedor
            const { data: vendorUser, error: vendorError } = await supabase
                .from('vendor_users')
                .select(`
          id, vendor_id,
          vendor_registry:vendor_id (id, name, type)
        `)
                .eq('auth_user_id', user.id)
                .single();

            if (vendorError || !vendorUser) {
                throw new Error("Perfil de fornecedor não encontrado.");
            }

            setVendorData(vendorUser);

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
          framework:framework_id (name)
        `)
                .eq('vendor_id', vendorUser.vendor_id)
                .order('created_at', { ascending: false });

            if (assessError) throw assessError;

            setAssessments(vendorAssessments || []);

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
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    const pendingAssessments = assessments.filter(a => a.status === 'draft' || a.status === 'sent');
    const completedAssessments = assessments.filter(a => a.status === 'completed' || a.status === 'under_review' || a.status === 'approved');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
            case 'sent':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pendente</Badge>;
            case 'under_review':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Em Avaliação (Admin)</Badge>;
            case 'completed':
            case 'approved':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Concluído</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Bom dia, {vendorData?.vendor_registry?.name || 'Fornecedor'}</h1>
                    <p className="text-muted-foreground mt-1">
                        Aqui está o resumo das suas atividades de Compliance e Riscos.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avaliações Pendentes</CardTitle>
                        <Clock className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{pendingAssessments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Que aguardam sua resposta</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avaliações Concluídas</CardTitle>
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{completedAssessments.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total de formulários enviados</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/vendor-portal/action-plans')}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Planos de Ação</CardTitle>
                        <Activity className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">N/A</div>
                        <p className="text-xs text-muted-foreground mt-1">Acesso aos planos de mitigação</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4 shadow-sm border border-border/50 rounded-xl bg-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                            Tarefas Urgentes
                        </h2>
                    </div>

                    <div className="space-y-4 mt-4">
                        {pendingAssessments.length > 0 ? (
                            pendingAssessments.slice(0, 3).map((assessment) => (
                                <div key={assessment.id} className="p-4 rounded-lg border border-border/60 hover:border-primary/50 transition-colors bg-gray-50/50 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-gray-900 truncate pr-4">{assessment.assessment_name}</h3>
                                        {getStatusBadge(assessment.status)}
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                                        <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                        Prazo final: {new Date(assessment.due_date).toLocaleDateString('pt-BR')}
                                    </div>

                                    <div className="space-y-1.5 mb-4">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-gray-600">Progresso</span>
                                            <span className="text-primary">{assessment.progress_percentage || 0}%</span>
                                        </div>
                                        <Progress value={assessment.progress_percentage || 0} className="h-2" />
                                    </div>

                                    <Button
                                        className="w-full sm:w-auto"
                                        size="sm"
                                        onClick={() => navigate(`/vendor-portal/assessment/${assessment.id}`)}
                                    >
                                        {assessment.progress_percentage > 0 ? 'Continuar Avaliação' : 'Iniciar Avaliação'}
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <CheckSquare className="mx-auto h-8 w-8 mb-2 text-gray-300" />
                                <p>Nenhuma tarefa pendente no momento.</p>
                                <p className="text-sm">Você está em dia com suas entregas.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 shadow-sm border border-border/50 rounded-xl bg-white p-6">
                    <h2 className="text-lg font-semibold border-b border-border/50 pb-2">Planos de Ação (Acompanhamento)</h2>
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <Activity className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Portal Aberto</h3>
                        <p className="text-sm text-gray-500 max-w-sm mt-2 mb-6">
                            Você pode acompanhar os planos de ação recomendados pela organização, fornecer prazos de mitigação e anexar evidências corretivas.
                        </p>
                        <Button onClick={() => navigate('/vendor-portal/action-plans')}>
                            Acessar Planos de Ação
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
