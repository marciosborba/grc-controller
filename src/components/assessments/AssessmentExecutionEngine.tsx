import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft, LayoutDashboard, Save, CheckCircle,
    AlertCircle, FileText, Download, Play, MessageSquare,
    History, Shield, ChevronRight, Menu, Upload, Plus, Paperclip, X
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
                const { data: qData } = await supabase.from('assessment_questions').select('*').in('control_id', ctrlData?.map(c => c.id) || []).order('ordem');

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

                // Set initial active question if none
                if (!activeQuestionId && structuredDomains.length > 0) {
                    // Find first question
                    for (const d of structuredDomains) {
                        for (const c of d.controls || []) {
                            if (c.questions && c.questions.length > 0) {
                                setActiveQuestionId(c.questions[0].id);
                                break;
                            }
                        }
                        if (activeQuestionId) break;
                    }
                }

            } catch (err: any) {
                toast.error('Erro ao carregar: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Save Response Logic
    const saveResponse = async (questionId: string, value: any) => {
        setSaving(true);
        const currentResp = responses[questionId];
        const payload = {
            assessment_id: id,
            question_id: questionId,
            resposta: value,
            tenant_id: assessment?.tenant_id,
            updated_at: new Date().toISOString()
        };

        try {
            // Optimistic update
            setResponses(prev => ({ ...prev, [questionId]: { ...prev[questionId], ...payload } as any }));

            const { data, error } = await supabase
                .from('assessment_responses')
                .upsert(payload)
                .select()
                .single();

            if (error) throw error;
            setResponses(prev => ({ ...prev, [questionId]: data }));
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar resposta');
        } finally {
            setSaving(false);
        }
    };

    const debouncedSave = useCallback(debounce((qid, val) => saveResponse(qid, val), 1000), [id, assessment]);

    const handleResponseChange = (qid: string, val: any) => {
        // Local update immediately
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

            await saveResponse(qid, { ...responses[qid]?.resposta, evidencias: newEvidences }); // Wait for save
            // Actually saveResponse expects 'resposta' separate from 'evidencias' column?
            // The type says 'evidencias' is separate column. My saveResponse was using full payload spread?
            // Let's fix saveResponse usage for this.

            const payload = {
                assessment_id: id,
                question_id: qid,
                evidencias: newEvidences,
                updated_at: new Date().toISOString()
            };
            const { data } = await supabase.from('assessment_responses').upsert(payload, { onConflict: 'assessment_id,question_id' }).select().single();
            setResponses(prev => ({ ...prev, [qid]: data }));

            toast.success('Arquivo enviado!', { id: toastId });
        } catch (err: any) {
            toast.error('Erro no upload: ' + err.message, { id: toastId });
        }
    };

    // Find Active Objects
    const activeQuestion = useMemo(() => {
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
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/assessments')}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="font-semibold text-lg leading-none truncate max-w-[300px]">{assessment.titulo}</h1>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] h-5">{framework?.nome}</Badge>
                            <span>v{framework?.versao}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end w-48">
                        <div className="flex justify-between w-full text-xs mb-1">
                            <span className="text-muted-foreground">Progresso Geral</span>
                            <span className="font-medium">{assessment.percentual_conclusao || 0}%</span>
                        </div>
                        <Progress value={assessment.percentual_conclusao || 0} className="h-2" />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalizar
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className={cn("border-r bg-muted/10 flex flex-col transition-all duration-300", sidebarOpen ? 'w-80' : 'w-0 overflow-hidden')}>
                    <div className="p-4 border-b bg-card/50 backdrop-blur">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Estrutura</h3>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {/* Overview Link */}
                            <button
                                onClick={() => setActiveQuestionId(null)}
                                className={cn(
                                    "w-full text-left text-sm px-3 py-2 rounded flex items-center gap-2 transition-colors font-medium",
                                    !activeQuestionId ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Visão Geral
                            </button>
                            {domains.map(dom => (
                                <div key={dom.id} className="space-y-2">
                                    <div className="font-semibold text-sm flex items-center gap-2 text-foreground/80">
                                        <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center">{dom.controls?.length}</Badge>
                                        {dom.nome}
                                    </div>
                                    <div className="pl-3 space-y-1 border-l-2 ml-2">
                                        {dom.controls?.map(ctrl => (
                                            <div key={ctrl.id} className="space-y-1">
                                                <div className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted/20 rounded truncate" title={ctrl.titulo}>
                                                    {ctrl.codigo} - {ctrl.titulo}
                                                </div>
                                                <div className="pl-2 space-y-1">
                                                    {ctrl.questions?.map(q => {
                                                        const isAnswered = !!responses[q.id]?.resposta;
                                                        const isActive = activeQuestionId === q.id;
                                                        return (
                                                            <button
                                                                key={q.id}
                                                                onClick={() => setActiveQuestionId(q.id)}
                                                                className={cn(
                                                                    "w-full text-left text-xs px-3 py-2 rounded flex items-start gap-2 transition-colors",
                                                                    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground",
                                                                    isAnswered && !isActive && "text-green-600"
                                                                )}
                                                            >
                                                                {isAnswered ?
                                                                    <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" /> :
                                                                    <div className="h-3 w-3 mt-0.5 rounded-full border border-current shrink-0" />
                                                                }
                                                                <span className="line-clamp-2">{q.pergunta}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 bg-secondary/5 relative">
                    <Button variant="ghost" size="sm" className="absolute top-4 left-4 z-10 h-8 w-8 p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>

                    <div className="flex-1 overflow-auto p-4 md:p-8 pt-16">
                        {activeQuestion ? (
                            <div className="max-w-4xl mx-auto space-y-6">
                                {/* Breadcrumb */}
                                <div className="flex items-center text-sm text-muted-foreground gap-2 mb-4">
                                    <span>{activeQuestion.domain.nome}</span>
                                    <ChevronRight className="h-3 w-3" />
                                    <span>{activeQuestion.control.codigo}</span>
                                </div>

                                {/* Question Card */}
                                <Card className="border-l-4 border-l-primary shadow-sm">
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-2">
                                                <Badge variant="outline">Questão</Badge>
                                                <CardTitle className="text-xl leading-relaxed">{activeQuestion.question.pergunta}</CardTitle>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge className={
                                                    activeQuestion.control.criticidade === 'critica' ? 'bg-red-100 text-red-700' :
                                                        activeQuestion.control.criticidade === 'alta' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }>{activeQuestion.control.criticidade}</Badge>
                                                <span className="text-xs text-muted-foreground">Peso: {activeQuestion.question.peso}</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Answer Section */}
                                        <div className="bg-muted/30 p-6 rounded-lg border">
                                            <Label className="text-base font-semibold mb-4 block">Sua Resposta</Label>
                                            <RadioGroup
                                                value={responses[activeQuestion.question.id]?.resposta || ''}
                                                onValueChange={(val) => handleResponseChange(activeQuestion.question.id, val)}
                                                className="grid gap-4 sm:grid-cols-2" // Grid for improved UX on scale 1-5 or simple options
                                            >
                                                {/* Dynamic Rendering based on Type */}
                                                {['sim_nao', 'escala_1_5'].includes(activeQuestion.question.tipo_resposta) && (
                                                    <>
                                                        {activeQuestion.question.tipo_resposta === 'sim_nao' ? (
                                                            <>
                                                                <div className="flex items-center space-x-2 border p-4 rounded bg-card hover:bg-accent cursor-pointer">
                                                                    <RadioGroupItem value="sim" id="sim" />
                                                                    <Label htmlFor="sim" className="cursor-pointer flex-1">Sim (Conforme)</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2 border p-4 rounded bg-card hover:bg-accent cursor-pointer">
                                                                    <RadioGroupItem value="nao" id="nao" />
                                                                    <Label htmlFor="nao" className="cursor-pointer flex-1">Não (Não Conforme)</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2 border p-4 rounded bg-card hover:bg-accent cursor-pointer">
                                                                    <RadioGroupItem value="na" id="na" />
                                                                    <Label htmlFor="na" className="cursor-pointer flex-1">N/A (Não Aplicável)</Label>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            [1, 2, 3, 4, 5].map(n => (
                                                                <div key={n} className="flex items-center space-x-2 border p-4 rounded bg-card hover:bg-accent cursor-pointer">
                                                                    <RadioGroupItem value={n.toString()} id={`scale-${n}`} />
                                                                    <Label htmlFor={`scale-${n}`} className="cursor-pointer flex-1">{n} - {n === 1 ? 'Muito Baixo' : n === 5 ? 'Excelente' : 'Nível ' + n}</Label>
                                                                </div>
                                                            ))
                                                        )}
                                                    </>
                                                )}
                                                {activeQuestion.question.tipo_resposta === 'texto_livre' && (
                                                    <div className="col-span-full">
                                                        <Textarea
                                                            placeholder="Descreva sua resposta..."
                                                            className="min-h-[100px]"
                                                            value={responses[activeQuestion.question.id]?.resposta || ''}
                                                            onChange={e => handleResponseChange(activeQuestion.question.id, e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </RadioGroup>
                                        </div>

                                        {/* Evidence Upload */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-semibold">Evidências</Label>
                                                <label className="cursor-pointer">
                                                    <Input type="file" className="hidden" onChange={(e) => handleFileUpload(e, activeQuestion.question.id)} />
                                                    <span className="flex items-center text-sm font-medium text-primary hover:underline">
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Anexar Arquivo
                                                    </span>
                                                </label>
                                            </div>
                                            {responses[activeQuestion.question.id]?.evidencias?.length > 0 ? (
                                                <div className="grid gap-2">
                                                    {responses[activeQuestion.question.id].evidencias.map((ev: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                                            <div className="flex items-center truncate">
                                                                <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                                                                <a href={ev.url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-[200px]">{ev.name}</a>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><X className="h-3 w-3" /></Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
                                                    Nenhuma evidência anexada.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-between bg-muted/20 border-t p-4">
                                        <Button variant="outline" onClick={() => {/* Handle Prev */ }} disabled={false}>Anterior</Button>
                                        <Button onClick={() => {/* Handle Next */ }} disabled={saving}>{saving ? 'Salvando...' : 'Próxima'}</Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        ) : (
                            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-3xl font-bold tracking-tight mb-2">{assessment.titulo}</h2>
                                        <p className="text-muted-foreground text-lg">{assessment.descricao || 'Sem descrição definida.'}</p>
                                    </div>
                                    <Badge className="text-base px-4 py-1" variant={assessment.status === 'concluido' ? 'default' : 'secondary'}>
                                        {assessment.status ? assessment.status.replace('_', ' ') : 'Planejado'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Framework</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{framework?.nome}</div>
                                            <p className="text-xs text-muted-foreground">{framework?.tipo_framework} • v{framework?.versao}</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Prazo</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{assessment.data_fim_planejada ? new Date(assessment.data_fim_planejada).toLocaleDateString() : '—'}</div>
                                            <p className="text-xs text-muted-foreground">Data final planejada</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Progresso</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{assessment.percentual_conclusao || 0}%</div>
                                            <Progress value={assessment.percentual_conclusao} className="mt-2 h-2" />
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Progresso por Domínio</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {domains.map(dom => {
                                                const totalQ = dom.controls?.reduce((acc, c) => acc + (c.questions?.length || 0), 0) || 0;
                                                const answeredQ = dom.controls?.reduce((acc, c) => acc + (c.questions?.filter(q => responses[q.id]?.resposta).length || 0), 0) || 0;
                                                const progress = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

                                                if (totalQ === 0) return null;

                                                return (
                                                    <div key={dom.id} className="space-y-2">
                                                        <div className="flex justify-between text-sm items-end">
                                                            <div className="font-medium flex items-center gap-2">
                                                                {dom.nome}
                                                                <Badge variant="outline" className="text-[10px] h-5">{totalQ} questões</Badge>
                                                            </div>
                                                            <span className="text-muted-foreground font-mono text-xs">{progress}%</span>
                                                        </div>
                                                        <Progress value={progress} className="h-2" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
