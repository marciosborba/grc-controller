import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    ChevronLeft, LayoutDashboard, Save, CheckCircle,
    AlertCircle, FileText, Download, Play, MessageSquare,
    History, Shield, ChevronRight, Menu, Upload, Plus, Paperclip, X,
    ArrowLeft, ArrowRight, CornerDownRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { Assessment, AssessmentFramework, AssessmentDomain, AssessmentControl, AssessmentQuestion, AssessmentResponse } from '@/types/assessment';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';

// Extended types for UI
interface ExtendedControl extends AssessmentControl {
    questions?: AssessmentQuestion[];
}
interface ExtendedDomain extends AssessmentDomain {
    controls?: ExtendedControl[];
}

export default function AssessmentExecutionEngine() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Data State
    const [assessment, setAssessment] = useState<Assessment | null>(null);
    const [framework, setFramework] = useState<AssessmentFramework | null>(null);
    const [domains, setDomains] = useState<ExtendedDomain[]>([]);
    const [responses, setResponses] = useState<Record<string, AssessmentResponse>>({});

    // UI State
    const [loading, setLoading] = useState(true);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load Data
    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Assessment & Framework
                const { data: assessData, error: assessError } = await supabase
                    .from('assessments')
                    .select('*, framework:assessment_frameworks(*)')
                    .eq('id', id)
                    .single();
                if (assessError) throw assessError;
                setAssessment(assessData);
                setFramework(assessData.framework);

                // 2. Structure (Domains -> Controls -> Questions)
                // Sequential fetch for reliability.
                const { data: domData } = await supabase.from('assessment_domains').select('*').eq('framework_id', assessData.framework_id).order('ordem');
                const { data: ctrlData } = await supabase.from('assessment_controls').select('*').in('domain_id', domData?.map(d => d.id) || []).order('ordem');
                const { data: qData } = await supabase.from('assessment_questions').select('*, tipo_resposta:tipo_pergunta, pergunta:texto').in('control_id', ctrlData?.map(c => c.id) || []).order('ordem');

                // Organize Tree
                const structuredDomains = domData?.map(d => ({
                    ...d,
                    controls: ctrlData?.filter(c => c.domain_id === d.id).map(c => ({
                        ...c,
                        questions: qData?.filter(q => q.control_id === c.id)
                    }))
                })) || [];
                setDomains(structuredDomains);

                // 3. Responses
                const { data: respData, error: respError } = await supabase.from('assessment_responses').select('*').eq('assessment_id', id);
                if (respError) throw respError;

                const respMap: Record<string, AssessmentResponse> = {};
                if (respData) respData.forEach(r => { respMap[r.question_id] = r; });
                setResponses(respMap);

            } catch (err: any) {
                toast.error('Erro ao carregar: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Lightweight refresh for progress status
    const refreshAssessmentStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('assessments')
                .select('percentual_conclusao, status, percentual_maturidade')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data && assessment) {
                setAssessment(prev => prev ? ({ ...prev, ...data }) : null);
            }
        } catch (err) {
            console.error('Failed to refresh status:', err);
        }
    };

    // Save Response Logic
    const saveResponseDirect = async (questionId: string, value: any, evidences?: any[]) => {
        setSaving(true);
        const payload: any = {
            assessment_id: id,
            question_id: questionId,
            resposta: value,
            tenant_id: assessment?.tenant_id,
            updated_at: new Date().toISOString()
        };

        if (evidences) {
            payload.evidencias = evidences;
        }

        try {
            // Optimistic update
            setResponses(prev => ({
                ...prev,
                [questionId]: { ...prev[questionId], ...payload } as any
            }));

            const { data, error } = await supabase
                .from('assessment_responses')
                .upsert(payload, { onConflict: 'assessment_id,question_id' })
                .select()
                .single();

            if (error) throw error;
            // Update with server response
            setResponses(prev => ({ ...prev, [questionId]: data }));

            // Refresh progress from DB (Trigger updated it)
            await refreshAssessmentStatus();
        } catch (err: any) {
            console.error('Erro detalhado ao salvar:', err);
            toast.error('Erro ao salvar: ' + (err.message || err.error_description || 'Erro desconhecido'));
        } finally {
            setSaving(false);
        }
    };

    // Debounced version for text areas
    const debouncedSave = useCallback(
        debounce((qid, val) => saveResponseDirect(qid, val), 1000),
        [id, assessment]
    );

    const handleResponseChange = (qid: string, val: any) => {
        // Local update immediately for UI responsiveness
        setResponses(prev => ({
            ...prev,
            [qid]: { ...prev[qid], assessment_id: id!, question_id: qid, resposta: val } as any
        }));
        debouncedSave(qid, val);
    };

    // Upload Evidence
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, qid: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading('Enviando arquivo...');
        try {
            const fileName = `${id}/${qid}/${Date.now()}_${file.name}`;
            const { error: uploadError } = await supabase.storage.from('evidence-attachments').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('evidence-attachments').getPublicUrl(fileName);

            // Add to evidence list in response
            const currentEvidences = responses[qid]?.evidencias || [];
            const newEvidences = [...(Array.isArray(currentEvidences) ? currentEvidences : []), { name: file.name, url: publicUrl, type: file.type }];

            // Save immediately with new evidences
            await saveResponseDirect(qid, responses[qid]?.resposta, newEvidences);

            toast.success('Arquivo enviado!', { id: toastId });
        } catch (err: any) {
            toast.error('Erro no upload: ' + err.message, { id: toastId });
        }
    };

    // Flatten questions for navigation
    const allQuestions = useMemo(() => {
        const questions: { id: string, index: number }[] = [];
        let idx = 0;
        domains.forEach(d => {
            d.controls?.forEach(c => {
                c.questions?.forEach(q => {
                    questions.push({ id: q.id, index: idx++ });
                });
            });
        });
        return questions;
    }, [domains]);

    const handleNavigation = (direction: 'next' | 'prev') => {
        if (!activeQuestionId) return;
        const currentIndex = allQuestions.findIndex(q => q.id === activeQuestionId);
        if (currentIndex === -1) return;

        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        // Bounds check
        if (nextIndex >= 0 && nextIndex < allQuestions.length) {
            setActiveQuestionId(allQuestions[nextIndex].id);
        } else if (direction === 'next') {
            // End of assessment
            toast.success("Você chegou ao final do questionário!");
            setActiveQuestionId(null);
        }
    };

    const hasNext = useMemo(() => {
        if (!activeQuestionId) return false;
        const idx = allQuestions.findIndex(q => q.id === activeQuestionId);
        return idx < allQuestions.length - 1;
    }, [activeQuestionId, allQuestions]);

    const hasPrev = useMemo(() => {
        if (!activeQuestionId) return false;
        const idx = allQuestions.findIndex(q => q.id === activeQuestionId);
        return idx > 0;
    }, [activeQuestionId, allQuestions]);

    // Find Active Objects
    const activeQuestionObj = useMemo(() => {
        if (!activeQuestionId) return null;
        for (const d of domains) {
            for (const c of d.controls || []) {
                const q = c.questions?.find(q => q.id === activeQuestionId);
                if (q) return { question: q, control: c, domain: d };
            }
        }
        return null;
    }, [activeQuestionId, domains]);

    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
    if (!assessment) return <div>Assessment não encontrado</div>;

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/assessments')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-lg leading-none truncate max-w-[300px] text-foreground">{assessment.titulo}</h1>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5">{framework?.nome}</Badge>
                            <span>v{framework?.versao}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end w-48 hidden sm:flex">
                        <div className="flex justify-between w-full text-xs mb-1">
                            <span className="text-muted-foreground">Progresso Geral</span>
                            <span className="font-medium text-foreground">{assessment.percentual_conclusao || 0}%</span>
                        </div>
                        <Progress value={assessment.percentual_conclusao || 0} className="h-2" />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalizar Assessment
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={cn("border-r bg-card/30 flex flex-col transition-all duration-300", sidebarOpen ? 'w-96' : 'w-0 overflow-hidden')}>
                    <div className="p-4 border-b bg-card/50 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4" /> Navegação
                        </h3>
                        <div className="text-xs text-muted-foreground">
                            {allQuestions.length} questões
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4 pb-20">
                            {domains.map((dom, domIdx) => (
                                <div key={dom.id} className="space-y-1">
                                    <div className="font-semibold text-sm flex items-center gap-2 text-foreground/90 sticky top-0 bg-background/95 backdrop-blur py-2 z-10 border-b mb-2">
                                        <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                            {domIdx + 1}
                                        </div>
                                        {dom.nome}
                                    </div>
                                    <div className="pl-2 space-y-2 border-l ml-2.5 border-border/40">
                                        {dom.controls?.map(ctrl => (
                                            <div key={ctrl.id} className="space-y-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const firstQ = ctrl.questions?.[0];
                                                        if (firstQ) setActiveQuestionId(firstQ.id);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left group flex flex-col gap-1 p-2 rounded transition-all duration-200 border border-transparent",
                                                        // Active state if ANY question in this control is active
                                                        ctrl.questions?.some(q => activeQuestionId === q.id)
                                                            ? "bg-primary/10 border-primary/20 shadow-sm"
                                                            : "hover:bg-muted/50 hover:shadow-sm"
                                                    )}
                                                >
                                                    {/* Control Header with aggregated status */}
                                                    <div className="flex items-start gap-2 w-full">
                                                        <div className="mt-0.5 shrink-0 w-4 flex justify-center">
                                                            {(() => {
                                                                const allAnswered = ctrl.questions?.length && ctrl.questions.every(q => !!responses[q.id]?.resposta);
                                                                // Active indicator logic
                                                                const isActive = ctrl.questions?.some(q => activeQuestionId === q.id);

                                                                if (allAnswered) return <CheckCircle className="h-4 w-4 text-green-600" />;
                                                                if (isActive) return <div className="h-2 w-2 rounded-full bg-primary mt-1" />;
                                                                return <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 mt-1 opacity-50" />;
                                                            })()}
                                                        </div>
                                                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-muted rounded border opacity-70 shrink-0 mt-0.5">{ctrl.codigo}</span>
                                                        <span className={cn(
                                                            "text-xs font-medium leading-snug break-words mt-0.5 text-left flex-1",
                                                            ctrl.questions?.some(q => activeQuestionId === q.id) ? "text-primary" : "text-muted-foreground"
                                                        )} title={ctrl.titulo}>{ctrl.titulo}</span>

                                                        {/* Active Arrow Indicator */}
                                                        {ctrl.questions?.some(q => activeQuestionId === q.id) && (
                                                            <CornerDownRight className="h-3 w-3 text-primary opacity-50 shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 bg-muted/10 relative overflow-hidden">
                    <Button variant="ghost" size="sm" className={cn("absolute top-4 left-4 z-10 h-8 w-8 p-0 bg-background shadow-sm border opacity-0 hover:opacity-100 transition-opacity", !sidebarOpen && "left-4 opacity-100", sidebarOpen && "hidden")} onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 overflow-auto p-4 md:p-8">
                        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                            {/* Dashboard Header */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight mb-2 text-foreground">{assessment.titulo}</h2>
                                    <p className="text-muted-foreground text-lg max-w-2xl text-balance">{assessment.descricao || 'Execute sua avaliação de conformidade verificando os requisitos abaixo.'}</p>
                                </div>
                                <Badge className="text-sm px-4 py-1.5 shadow-sm uppercase tracking-wide" variant={assessment.status === 'concluido' ? 'default' : 'secondary'}>
                                    {assessment.status ? assessment.status.replace('_', ' ') : 'Planejado'}
                                </Badge>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-card/50 hover:bg-card transition-colors border-l-4 border-l-blue-500 shadow-sm">
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Framework Utilizado</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold tracking-tight">{framework?.nome}</div>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            {framework?.tipo_framework} • v{framework?.versao}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card/50 hover:bg-card transition-colors border-l-4 border-l-orange-500 shadow-sm">
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Prazo de Entrega</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold tracking-tight">{assessment.data_fim_planejada ? new Date(assessment.data_fim_planejada).toLocaleDateString() : '—'}</div>
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <History className="h-3 w-3" />
                                            Planejado
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card/50 hover:bg-card transition-colors border-l-4 border-l-green-500 shadow-sm">
                                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Conclusão</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold tracking-tight">{assessment.percentual_conclusao || 0}%</div>
                                        <Progress value={assessment.percentual_conclusao} className="mt-2 h-1.5 bg-green-100" />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Analysis */}
                            <Card className="shadow-sm border-muted">
                                <CardHeader>
                                    <CardTitle>Progresso por Domínio</CardTitle>
                                    <CardDescription>Visão detalhada do seu avanço em cada área de conhecimento.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                        {domains.map(dom => {
                                            const totalQ = dom.controls?.reduce((acc, c) => acc + (c.questions?.length || 0), 0) || 0;
                                            const answeredQ = dom.controls?.reduce((acc, c) => acc + (c.questions?.filter(q => responses[q.id]?.resposta).length || 0), 0) || 0;
                                            const progress = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

                                            if (totalQ === 0) return null;

                                            return (
                                                <div key={dom.id} className="space-y-2 group cursor-default">
                                                    <div className="flex justify-between text-sm items-end">
                                                        <div className="font-medium flex items-center gap-2 truncate max-w-[80%]">
                                                            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground shrink-0">{dom.controls?.length}</div>
                                                            <span className="group-hover:text-primary transition-colors truncate">{dom.nome}</span>
                                                        </div>
                                                        <span className="text-muted-foreground font-mono text-xs bg-muted px-2 py-0.5 rounded">{progress}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary/80 transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>

            {/* MAIN INTERACTION MODAL */}
            {activeQuestionObj && (
                <Dialog open={!!activeQuestionId} onOpenChange={(open) => !open && setActiveQuestionId(null)}>
                    <DialogContent className="max-w-5xl w-[90vw] h-[90vh] max-h-[900px] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl border-border/60 shadow-2xl">
                        {/* Modal Header - Professional Style */}
                        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-8 py-6 flex items-start justify-between shrink-0 sticky top-0 z-20">
                            <div className="space-y-3 pr-8 flex-1">
                                <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/10 transition-colors hover:bg-primary/20 cursor-default">
                                        {activeQuestionObj.domain.nome}
                                    </span>
                                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-[11px]">{activeQuestionObj.control.codigo}</span>
                                </div>
                                <DialogTitle className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-foreground/90">
                                    {activeQuestionObj.question.pergunta}
                                </DialogTitle>
                            </div>
                            <div className="flex flex-col items-end gap-3 shrink-0 ml-4">
                                <Badge variant="outline" className={cn(
                                    "px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-sm",
                                    activeQuestionObj.control.criticidade === 'critica' ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800' :
                                        activeQuestionObj.control.criticidade === 'alta' ? 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800' :
                                            'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800'
                                )}>
                                    {activeQuestionObj.control.criticidade}
                                </Badge>
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium border-t pt-1 mt-1">
                                    Peso {activeQuestionObj.question.peso}
                                </span>
                            </div>
                        </div>

                        {/* Modal Scrollable Content */}
                        <ScrollArea className="flex-1">
                            <div className="p-6 md:p-10 space-y-10 max-w-4xl mx-auto">

                                <div className="space-y-8">
                                    <div className="border rounded-xl p-8 shadow-sm bg-card/50">
                                        <Label className="text-lg font-semibold mb-6 flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-primary" /> Sua Resposta
                                            {(!['sim_nao', 'escala_1_5', 'escala_1_10', 'texto_livre'].includes(activeQuestionObj.question.tipo_resposta) && activeQuestionObj.question.tipo_resposta) &&
                                                <Badge variant="outline" className="ml-auto text-xs font-mono">{activeQuestionObj.question.tipo_resposta}</Badge>
                                            }
                                        </Label>

                                        <RadioGroup
                                            value={responses[activeQuestionObj.question.id]?.resposta?.toString() || ''}
                                            onValueChange={(val) => handleResponseChange(activeQuestionObj.question.id, val)}
                                            className="grid gap-4 sm:grid-cols-1"
                                        >
                                            {/* Standard conformidade check (sim_nao) or default fallback if undefined */}
                                            {(['sim_nao'].includes(activeQuestionObj.question.tipo_resposta) || !activeQuestionObj.question.tipo_resposta) && (
                                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    <div className={cn("flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all hover:bg-accent hover:border-primary/50", responses[activeQuestionObj.question.id]?.resposta === 'sim' ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md" : "border-muted")}>
                                                        <RadioGroupItem value="sim" id="sim" className="data-[state=checked]:border-green-600 data-[state=checked]:text-green-600" />
                                                        <Label htmlFor="sim" className="cursor-pointer flex-1 font-medium">Conforme (Sim)</Label>
                                                    </div>
                                                    <div className={cn("flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all hover:bg-accent hover:border-primary/50", responses[activeQuestionObj.question.id]?.resposta === 'nao' ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md" : "border-muted")}>
                                                        <RadioGroupItem value="nao" id="nao" className="data-[state=checked]:border-red-600 data-[state=checked]:text-red-600" />
                                                        <Label htmlFor="nao" className="cursor-pointer flex-1 font-medium">Não Conforme</Label>
                                                    </div>
                                                    <div className={cn("flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-all hover:bg-accent hover:border-primary/50", responses[activeQuestionObj.question.id]?.resposta === 'na' ? "border-gray-500 bg-gray-50 dark:bg-gray-800/20 shadow-md" : "border-muted")}>
                                                        <RadioGroupItem value="na" id="na" />
                                                        <Label htmlFor="na" className="cursor-pointer flex-1 font-medium">N/A</Label>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Maturity Scales */}
                                            {['escala_1_5', 'escala_1_10'].includes(activeQuestionObj.question.tipo_resposta) && (
                                                <div className={cn("grid gap-3", activeQuestionObj.question.tipo_resposta === 'escala_1_10' ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-1 sm:grid-cols-3")}>
                                                    {Array.from({ length: activeQuestionObj.question.tipo_resposta === 'escala_1_10' ? 10 : 5 }, (_, i) => i + 1).map(n => (
                                                        <div key={n} className={cn("flex items-center space-x-3 border-2 p-3 rounded-xl cursor-pointer transition-all hover:bg-accent hover:border-primary/50", responses[activeQuestionObj.question.id]?.resposta === n.toString() ? "border-primary bg-primary/5 shadow-md" : "border-muted")}>
                                                            <RadioGroupItem value={n.toString()} id={`scale-${n}`} />
                                                            <Label htmlFor={`scale-${n}`} className="cursor-pointer flex-1 font-medium text-center">
                                                                {n}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Free Text */}
                                            {activeQuestionObj.question.tipo_resposta === 'texto_livre' && (
                                                <div className="col-span-full">
                                                    <Textarea
                                                        placeholder="Descreva sua resposta detalhadamente..."
                                                        className="min-h-[150px] resize-y text-base p-4"
                                                        value={responses[activeQuestionObj.question.id]?.resposta || ''}
                                                        onChange={e => handleResponseChange(activeQuestionObj.question.id, e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {/* Fallback for unknown types (safe default to text) */}
                                            {(!['sim_nao', 'escala_1_5', 'escala_1_10', 'texto_livre'].includes(activeQuestionObj.question.tipo_resposta) && activeQuestionObj.question.tipo_resposta) && (
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-sm text-yellow-600 dark:text-yellow-400">
                                                        Modo de resposta genérico (Tipo: {activeQuestionObj.question.tipo_resposta})
                                                    </div>
                                                    <Textarea
                                                        placeholder="Insira sua resposta..."
                                                        className="min-h-[100px]"
                                                        value={responses[activeQuestionObj.question.id]?.resposta || ''}
                                                        onChange={e => handleResponseChange(activeQuestionObj.question.id, e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </RadioGroup>
                                    </div>

                                    {/* Additional Comments / Evidence */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-lg font-semibold flex items-center gap-2">
                                                <Paperclip className="h-5 w-5 text-primary" /> Evidências & Anexos
                                            </Label>
                                            <label className="cursor-pointer inline-flex">
                                                <Input type="file" className="hidden" onChange={(e) => handleFileUpload(e, activeQuestionObj.question.id)} />
                                                <span className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Adicionar Evidência
                                                </span>
                                            </label>
                                        </div>

                                        {responses[activeQuestionObj.question.id]?.evidencias?.length > 0 ? (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {responses[activeQuestionObj.question.id].evidencias.map((ev: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 border rounded-lg text-sm group hover:border-primary/40 transition-colors">
                                                        <div className="flex items-center truncate gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shrink-0 shadow-sm">
                                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                            <div className="flex flex-col truncate">
                                                                <a href={ev.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline truncate max-w-[200px] text-foreground">{ev.name}</a>
                                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">{ev.type?.split('/')[1] || 'FILE'}</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4 text-muted-foreground hover:text-destructive" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed rounded-xl p-10 text-center text-sm text-muted-foreground/60 hover:bg-muted/30 transition-colors flex flex-col items-center gap-3">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Upload className="h-6 w-6 opacity-40" />
                                                </div>
                                                <div>
                                                    <span className="font-medium text-foreground">Clique para adicionar arquivos</span>
                                                    <p className="text-xs">Documentos, imagens ou comprovantes</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        {/* Modal Footer */}
                        <div className="border-t p-4 bg-muted/30 flex items-center justify-between shrink-0">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleNavigation('prev')}
                                    disabled={!hasPrev}
                                    className="gap-2 pl-4 pr-6"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Anterior
                                </Button>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setActiveQuestionId(null)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => handleNavigation('next')}
                                    disabled={saving}
                                    className="gap-2 pl-6 pr-4 min-w-[140px]"
                                >
                                    {saving ? 'Salvando...' : (hasNext ? 'Salvar e Próxima' : 'Finalizar Assessment')}
                                    {!saving && <ArrowRight className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
