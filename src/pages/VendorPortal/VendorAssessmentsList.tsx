import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, ArrowRight, Target, Search, Award, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export const VendorAssessmentsList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAssessments();
    }, [user]);

    const fetchAssessments = async () => {
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

            if (!currentVendorId) throw new Error("Perfil de fornecedor não associado a uma conta válida.");

            const { data, error } = await supabase
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

            if (error) throw error;
            setAssessments(data || []);

        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao buscar avaliações",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

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

    const getMaturityInfo = (assessment: any) => {
        if (assessment.metadata?.validation) {
            const v = assessment.metadata.validation;
            return {
                score: v.overallScore ?? v.finalScore ?? null,
                level: v.maturityLevel ?? null
            };
        }
        if (assessment.submission_summary) {
            try {
                const summary = typeof assessment.submission_summary === 'string'
                    ? JSON.parse(assessment.submission_summary)
                    : assessment.submission_summary;
                return {
                    score: summary.maturity_score ?? null,
                    level: summary.maturity_level ?? null
                };
            } catch { }
        }
        return { score: null, level: null };
    };

    const getMaturityColor = (level: string | null) => {
        if (!level) return 'text-muted-foreground bg-muted';
        switch (level.toLowerCase()) {
            case 'otimizado': return 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
            case 'gerenciado': return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
            case 'básico': return 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30';
            case 'inicial': return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
            case 'inexistente': return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            default: return 'text-muted-foreground bg-muted';
        }
    };

    const filteredAssessments = assessments.filter(a =>
        a.assessment_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4 shadow-lg"></div>
                <p className="text-muted-foreground animate-pulse font-medium">Carregando avaliações...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12 w-full">
            <div className="mb-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/vendor-portal')} className="text-muted-foreground hover:text-foreground px-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                </Button>
            </div>
            <div className="mb-4">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Avaliações</h1>
                <p className="text-muted-foreground mt-1">
                    Gerencie todos os seus questionários de conformidade pendentes ou concluídos.
                </p>
            </div>

            <Card className="shadow-sm border border-border">
                <CardHeader className="bg-muted/50 border-b border-border pb-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                            <Target className="h-5 w-5 text-primary" />
                            Lista de Avaliações
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar avaliação..."
                                className="pl-9 bg-background border-border"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {filteredAssessments.length > 0 ? (
                            filteredAssessments.map((assessment) => (
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

                                    {/* Maturity Score & Level for approved/completed assessments */}
                                    {(() => {
                                        const isValidated = assessment.status === 'approved' || assessment.status === 'completed';
                                        const maturity = isValidated ? getMaturityInfo(assessment) : { score: null, level: null };
                                        if (isValidated && (maturity.score !== null || maturity.level)) {
                                            return (
                                                <div className="flex flex-wrap gap-4 mb-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
                                                    {maturity.score !== null && (
                                                        <div className="flex items-center gap-2">
                                                            <Award className="h-5 w-5 text-primary" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground font-medium">Nota</p>
                                                                <p className="text-xl font-bold text-primary">{maturity.score}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {maturity.level && (
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck className="h-5 w-5 text-primary" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground font-medium">Maturidade</p>
                                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-sm font-semibold ${getMaturityColor(maturity.level)}`}>
                                                                    {maturity.level}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

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
                                            {assessment.status === 'completed' || assessment.status === 'approved' || assessment.status === 'under_review'
                                                ? 'Ver Detalhes'
                                                : (assessment.progress_percentage > 0 ? 'Continuar Respostas' : 'Iniciar Questionário')}
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16 px-4">
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    Nenhuma avaliação encontrada.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default VendorAssessmentsList;
