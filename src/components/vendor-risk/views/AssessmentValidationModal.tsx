import React, { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Shield,
    FileCheck,
    MessageSquare,
    Star,
    ChevronDown,
    ChevronUp,
    Info,
    Eye,
    Paperclip,
} from 'lucide-react';
import { scoreAssessment, ScoringConfig, DEFAULT_SCORING_CONFIG } from '@/hooks/useAssessmentScoring';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_ASSESSMENT_QUESTIONS } from '../shared/RiskAssessmentManager';

const DEFAULT_QUESTIONS = DEFAULT_ASSESSMENT_QUESTIONS.map(q => ({
    id: q.id,
    category: q.category,
    question: q.question,
    type: q.type as any,
    options: q.options,
    required: q.required,
    weight: q.weight,
    help_text: q.description,
    scale_min: q.scale_min,
    scale_max: q.scale_max,
    scale_labels: q.scale_labels
}));

interface AssessmentValidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: any;
    onValidate: (assessmentId: string, action: 'approved' | 'rejected' | 'requires_clarification' | 'unlock', data: any) => Promise<void>;
}

interface ControlValidation {
    questionId: string;
    observation: string;
}

const CRITICALITY_LABELS: Record<string, string> = {
    baixo: 'Baixo',
    medio: 'Médio',
    alto: 'Alto',
    critico: 'Crítico',
    info: 'Info',
};

const CRITICALITY_COLORS: Record<string, string> = {
    baixo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medio: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    alto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    critico: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export const AssessmentValidationModal: React.FC<AssessmentValidationModalProps> = ({
    isOpen,
    onClose,
    assessment,
    onValidate,
}) => {
    const [controlValidations, setControlValidations] = useState<Record<string, ControlValidation>>({});
    const [overallObservation, setOverallObservation] = useState('');
    const [finalScoreAdjustment, setFinalScoreAdjustment] = useState<number>(0);
    const [finalScoreJustification, setFinalScoreJustification] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fetchedQuestions, setFetchedQuestions] = useState<any[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [selectedEvidence, setSelectedEvidence] = useState<{ url: string; name: string; type: string } | null>(null);

    // Fetch questions if absent
    useEffect(() => {
        const loadQuestions = async () => {
            let foundQuestions: any[] | null = null;

            if (assessment?.vendor_assessment_frameworks?.questions) {
                foundQuestions = assessment.vendor_assessment_frameworks.questions;
            } else if (assessment?.metadata?.questions && assessment.metadata.questions.length > 0) {
                // Prefer snapshot questions from metadata directly first  
                foundQuestions = assessment.metadata.questions;
            } else {
                const vendorFrameworkId = assessment?.metadata?.vendor_framework_id;
                const coreFrameworkId = assessment?.framework_id;

                if (vendorFrameworkId || coreFrameworkId) {
                    setLoadingQuestions(true);
                    try {
                        // Try to fetch from vendor_assessment_frameworks first (using the specific ID if available)
                        if (vendorFrameworkId) {
                            const { data } = await supabase
                                .from('vendor_assessment_frameworks')
                                .select('questions')
                                .eq('id', vendorFrameworkId)
                                .single();
                            if (data?.questions) foundQuestions = data.questions;
                        }

                        // If not found, try using the core framework_id on the vendor_assessment_frameworks table
                        if (!foundQuestions && coreFrameworkId) {
                            const { data } = await supabase
                                .from('vendor_assessment_frameworks')
                                .select('questions')
                                .eq('id', coreFrameworkId)
                                .single();
                            if (data?.questions) foundQuestions = data.questions;
                        }

                        // If still not found, try formal framework
                        if (!foundQuestions && coreFrameworkId) {
                            const { data: data2 } = await supabase
                                .from('assessment_frameworks')
                                .select('questions')
                                .eq('id', coreFrameworkId)
                                .single();
                            if (data2?.questions) foundQuestions = data2.questions;
                        }
                    } catch (e) {
                        console.error('Error fetching questions:', e);
                    } finally {
                        setLoadingQuestions(false);
                    }
                }
            }

            if (!foundQuestions || foundQuestions.length === 0) {
                // Fallback to default questions if the framework actually has none
                foundQuestions = DEFAULT_QUESTIONS;
            }

            // Normalize questions so `scoreAssessment` engine functions properly
            const normalized = foundQuestions.map(q => ({
                ...q,
                question: q.question || q.text || 'Questão sem título'
            }));

            setFetchedQuestions(normalized);
        };

        if (isOpen) {
            loadQuestions();
        }
    }, [assessment, isOpen]);

    const questions = fetchedQuestions;

    const responses: Record<string, any> = useMemo(() => {
        return assessment?.responses || {};
    }, [assessment]);

    // Calculate scores using the scoring engine
    const scoreResult = useMemo(() => {
        console.log('--- SCORING DEBUG ---');
        console.log('Questions received:', questions.length, questions.map(q => q.id));
        console.log('Responses available:', Object.keys(responses));
        if (!questions.length) return null;
        try {
            const config: ScoringConfig = (() => {
                const stored = localStorage.getItem('scoringConfig');
                return stored ? { ...DEFAULT_SCORING_CONFIG, ...JSON.parse(stored) } : DEFAULT_SCORING_CONFIG;
            })();
            const result = scoreAssessment(responses, questions, config);
            console.log('Score Result:', result);
            return result;
        } catch {
            return null;
        }
    }, [questions, responses]);

    // Group questions by category
    const categorizedQuestions = useMemo(() => {
        const categories: Record<string, any[]> = {};
        questions.forEach(q => {
            const cat = q.category || 'Geral';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(q);
        });
        return categories;
    }, [questions]);

    // Initialize expanded categories
    useEffect(() => {
        const initial: Record<string, boolean> = {};
        Object.keys(categorizedQuestions).forEach(cat => {
            initial[cat] = true;
        });
        setExpandedCategories(initial);
    }, [categorizedQuestions]);

    const getScoredControl = (questionId: string) => {
        return scoreResult?.scoredControls.find(c => c.questionId === questionId);
    };

    const getMaxScore = (questionId: string) => {
        const scored = getScoredControl(questionId);
        return scored?.maxMaturityValue ?? 4;
    };

    const updateControlValidation = (questionId: string, field: keyof ControlValidation, value: any) => {
        setControlValidations(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId] || { questionId, observation: '' },
                [field]: value,
            }
        }));
    };

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const totalQuestions = questions.length;
    const answeredQuestions = useMemo(() => {
        let count = 0;
        questions.forEach(q => {
            const answer = responses[q.id];
            if (answer !== undefined && answer !== null && answer !== '') {
                count++;
            }
        });
        return count;
    }, [questions, responses]);

    // Force live recalculation to ensure accuracy over potentially broken persisted ones
    const persistedScore = assessment?.metadata?.submission_summary?.maturity_score ?? assessment?.overall_score;
    const liveScore = scoreResult ? Math.round(scoreResult.score * 100) / 100 : null;
    const systemScore = liveScore !== null ? liveScore : (persistedScore !== undefined ? Math.round(persistedScore * 100) / 100 : 0);

    // Final score calculation with adjustment
    const finalCalculatedScore = Math.max(0, Math.min(100, systemScore + finalScoreAdjustment));

    const config: ScoringConfig = (() => {
        const stored = localStorage.getItem('scoringConfig');
        return stored ? { ...DEFAULT_SCORING_CONFIG, ...JSON.parse(stored) } : DEFAULT_SCORING_CONFIG;
    })();
    const finalMaturityLevelObj = config.maturityBands.find(b => finalCalculatedScore >= b.minScore && finalCalculatedScore <= b.maxScore) ?? config.maturityBands[0];
    const finalMaturityLevel = finalMaturityLevelObj?.name || 'N/A';

    const handleSubmit = async (action: 'approved' | 'rejected' | 'requires_clarification' | 'unlock') => {
        if (action !== 'unlock' && finalScoreAdjustment !== 0 && !finalScoreJustification.trim()) {
            alert('Uma justificativa de ajuste deve ser preenchida caso uma ponderação tenha sido aplicada.');
            return;
        }

        setIsSubmitting(true);
        try {
            const validationData = {
                controlValidations: Object.fromEntries(
                    Object.entries(controlValidations).map(([k, v]) => [k, { observation: v.observation }])
                ),
                overallObservation,
                finalScoreAdjustment,
                finalScoreJustification,
                validatedAt: new Date().toISOString(),
                overallScore: finalCalculatedScore,
                maturityLevel: finalMaturityLevel,
            };
            await onValidate(assessment.id, action, validationData);
            onClose();
        } catch (error) {
            console.error('Validation error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getAnswerDisplay = (question: any, answer: any) => {
        if (answer === undefined || answer === null || answer === '') {
            return <span className="text-muted-foreground italic text-xs">Não respondida</span>;
        }

        if (question.type === 'file_upload' && answer && typeof answer === 'object') {
            return (
                <button
                    onClick={() => setSelectedEvidence({ url: answer.url, name: answer.name, type: answer.type })}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded-md transition-colors text-left"
                >
                    <Paperclip className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs truncate max-w-[200px] font-medium">{answer.name}</span>
                </button>
            );
        }

        if (question.type === 'yes_no' || question.type === 'yes_no_na') {
            const val = String(answer).toLowerCase();
            if (val === 'yes' || val === 'sim') return <Badge className="bg-green-500/10 text-green-700 dark:text-green-300 border-green-300">Sim</Badge>;
            if (val === 'no' || val === 'não' || val === 'nao') return <Badge variant="destructive">Não</Badge>;
            if (val === 'na' || val === 'n/a') return <Badge variant="secondary">N/A</Badge>;
        }

        if (question.type === 'checkbox' && Array.isArray(answer)) {
            return (
                <div className="flex flex-wrap gap-1">
                    {answer.map((item: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                </div>
            );
        }
        return <span className="text-sm">{String(answer)}</span>;
    };

    const getScoreColor = (score: number, max: number) => {
        const ratio = max > 0 ? score / max : 0;
        if (ratio >= 0.75) return 'text-green-600 dark:text-green-400';
        if (ratio >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
        if (ratio >= 0.25) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[95vw] md:max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0">
                    <DialogHeader className="px-6 pt-6 pb-2">
                        <DialogTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-amber-600" />
                            Validação de Assessment
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            {assessment?.assessment_name} — {assessment?.vendor_registry?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 px-6 overflow-y-auto">
                        <div className="space-y-4 pb-4 mt-2">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <Card className="border-blue-200 dark:border-blue-800">
                                    <CardContent className="p-3 text-center">
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">Respondidas</p>
                                        <p className="text-lg font-bold text-blue-600">{answeredQuestions}/{totalQuestions}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-purple-200 dark:border-purple-800">
                                    <CardContent className="p-3 text-center">
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">Nota do Sistema</p>
                                        <p className="text-lg font-bold text-purple-600">{systemScore.toFixed(1)}%</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-green-200 dark:border-green-800">
                                    <CardContent className="p-3 text-center">
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">Score Final (Ajustado)</p>
                                        <p className="text-lg font-bold text-green-600">{finalCalculatedScore.toFixed(1)}%</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-amber-200 dark:border-amber-800">
                                    <CardContent className="p-3 text-center">
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">Maturidade Final</p>
                                        <p className="text-sm mt-1 font-bold text-amber-600 truncate">{finalMaturityLevel}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Separator />

                            {loadingQuestions && <div className="p-8 text-center text-sm text-muted-foreground">Carregando controles do assessment...</div>}

                            {/* Controls by Category */}
                            {!loadingQuestions && Object.entries(categorizedQuestions).map(([category, catQuestions]) => (
                                <div key={category} className="border rounded-lg overflow-hidden">
                                    {/* Category Header */}
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileCheck className="h-4 w-4 text-primary" />
                                            <span className="text-sm font-semibold">{category}</span>
                                            <Badge variant="outline" className="text-[10px]">{catQuestions.length} controles</Badge>
                                        </div>
                                        {expandedCategories[category] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>

                                    {/* Category Questions */}
                                    {expandedCategories[category] && (
                                        <div className="divide-y">
                                            {catQuestions.map((q: any) => {
                                                const answer = responses[q.id];
                                                const evidence = responses[`${q.id}_evidence`];
                                                const scored = getScoredControl(q.id);
                                                const validation = controlValidations[q.id];
                                                const maxScore = getMaxScore(q.id);
                                                const criticality = q.criticality || 'medio';
                                                const isInfoOnly = criticality === 'info';

                                                return (
                                                    <div key={q.id} className={`p-3 sm:p-4 space-y-2 ${isInfoOnly ? 'bg-purple-50/30 dark:bg-purple-950/10' : ''}`}>
                                                        {/* Question Header */}
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <p className="text-xs sm:text-sm font-medium">{q.question || q.text}</p>
                                                                    <Badge className={`text-[9px] px-1.5 py-0 ${CRITICALITY_COLORS[criticality] || ''}`}>
                                                                        {CRITICALITY_LABELS[criticality] || criticality}
                                                                    </Badge>
                                                                    {isInfoOnly && (
                                                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-purple-300">
                                                                            <Info className="h-2.5 w-2.5 mr-0.5" /> Apenas Risco
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Answer Row */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-muted/30 rounded-md p-2">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                                <span className="text-[10px] text-muted-foreground shrink-0">Resposta:</span>
                                                                <div className="min-w-0">{getAnswerDisplay(q, answer)}</div>
                                                            </div>

                                                            {/* Evidence Indicator */}
                                                            {evidence && evidence.url && q.type !== 'file_upload' && (
                                                                <button
                                                                    onClick={() => setSelectedEvidence({ url: evidence.url, name: evidence.name, type: evidence.type })}
                                                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 bg-blue-50/50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-800 rounded-md px-2 py-1.5 transition-colors text-left"
                                                                >
                                                                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                                                        <Paperclip className="h-3 w-3 shrink-0" />
                                                                        <span className="text-[10px] font-semibold max-w-[150px] truncate">{evidence.name || 'Anexo de Evidência'}</span>
                                                                    </div>
                                                                    <span className="text-[9px] text-muted-foreground ml-0 sm:ml-1">Ver evidência anexada</span>
                                                                </button>
                                                            )}

                                                            {!isInfoOnly && (
                                                                <div className="flex items-center gap-2 shrink-0 border-l border-border/50 pl-3">
                                                                    <Star className="h-3.5 w-3.5 text-muted-foreground" />
                                                                    <span className="text-[10px] text-muted-foreground">Nota do Sistema:</span>
                                                                    <span className={`text-xs font-mono font-bold ${getScoreColor(scored?.maturityValue ?? 0, maxScore)}`}>
                                                                        {scored?.maturityValue ?? 0}/{maxScore}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Control Observation (Optional details per question) */}
                                                        <div className="flex items-center gap-2 pt-1 border-t border-border/20">
                                                            <MessageSquare className="h-3w-3.5 text-muted-foreground shrink-0" />
                                                            <Input
                                                                value={validation?.observation || ''}
                                                                onChange={(e) => updateControlValidation(q.id, 'observation', e.target.value)}
                                                                placeholder={isInfoOnly ? "Observação sobre esta informação (opcional)" : "Observação da validação (opcional)"}
                                                                className="h-7 text-xs flex-1 bg-background"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <Separator className="my-6" />

                            {/* Overall Final Score Adjustment Section */}
                            <div className="bg-muted/30 border border-border rounded-lg p-5 space-y-4">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    Análise Qualitativa e Ajuste de Maturidade
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Essa avaliação atingiu a nota automática de <strong>{systemScore.toFixed(1)}%</strong> baseada nas ponderações.
                                    É possível ajustar o resultado final em até um nível de maturidade (-20 ou +20 pontos) conforme sua análise holística.
                                </p>

                                <RadioGroup
                                    value={finalScoreAdjustment.toString()}
                                    onValueChange={(val) => setFinalScoreAdjustment(Number(val))}
                                    className="flex flex-col sm:flex-row gap-4 mb-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="-20" id="adj-neg" />
                                        <Label htmlFor="adj-neg" className="cursor-pointer font-medium text-xs text-red-600 dark:text-red-400">
                                            Diminuir Maturidade (-20 pontos)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="0" id="adj-none" />
                                        <Label htmlFor="adj-none" className="cursor-pointer font-medium text-xs">
                                            Manter Nota do Sistema
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="20" id="adj-pos" />
                                        <Label htmlFor="adj-pos" className="cursor-pointer font-medium text-xs text-green-600 dark:text-green-400">
                                            Aumentar Maturidade (+20 pontos)
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {finalScoreAdjustment !== 0 && (
                                    <div className="space-y-2 pt-2 border-t border-border/50 animate-in fade-in zoom-in-95">
                                        <Label className="text-xs font-semibold text-destructive flex items-center gap-1.5">
                                            <AlertTriangle className="h-3 w-3" />
                                            Justificativa Obrigatória para Ponderação
                                        </Label>
                                        <Textarea
                                            value={finalScoreJustification}
                                            onChange={(e) => setFinalScoreJustification(e.target.value)}
                                            placeholder={`Explique o motivo do ajuste de ${finalScoreAdjustment > 0 ? '+20' : '-20'} pontos no score final...`}
                                            className="min-h-[60px] text-xs bg-background"
                                            required={finalScoreAdjustment !== 0}
                                        />
                                    </div>
                                )}

                            </div>

                            <Separator className="my-6" />

                            {/* Overall Observation */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary" />
                                    Parecer Geral do Validador
                                </Label>
                                <Textarea
                                    value={overallObservation}
                                    onChange={(e) => setOverallObservation(e.target.value)}
                                    placeholder="Descreva seu parecer geral sobre este assessment..."
                                    className="min-h-[80px] text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t px-6 py-4 bg-muted/30">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                {finalScoreAdjustment !== 0 ? (
                                    <Badge variant="outline" className={`font-semibold ${finalScoreAdjustment > 0 ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}`}>
                                        Score Ajustado: {systemScore.toFixed(1)}% → {finalCalculatedScore.toFixed(1)}%
                                    </Badge>
                                ) : (
                                    <span>Sem ajuste na ponderação ({systemScore.toFixed(1)}%)</span>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm('Tem certeza que deseja reabilitar este questionário para edição pelo fornecedor? Ele será movido para "Em Andamento".')) {
                                            handleSubmit('unlock');
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="text-xs"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                                    Habilitar para Edição
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSubmit('requires_clarification')}
                                    disabled={isSubmitting}
                                    className="text-xs"
                                >
                                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                                    Solicitar Esclarecimento
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleSubmit('rejected')}
                                    disabled={isSubmitting}
                                    className="text-xs"
                                >
                                    <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                    Rejeitar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => handleSubmit('approved')}
                                    disabled={isSubmitting}
                                    className="text-xs bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                                    Aprovar Assessment
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Evidence View Dialog */}
            <Dialog open={!!selectedEvidence} onOpenChange={(open) => !open && setSelectedEvidence(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            Visualizar Evidência
                        </DialogTitle>
                        <DialogDescription className="truncate">
                            {selectedEvidence?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-4 bg-muted/20 rounded-lg border min-h-[300px] overflow-auto">
                        {selectedEvidence?.type?.startsWith('image/') ? (
                            <img src={selectedEvidence.url} alt={selectedEvidence.name} className="max-w-full max-h-[60vh] object-contain rounded-md" />
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <FileCheck className="h-16 w-16 text-muted-foreground/50" />
                                <div>
                                    <p className="text-sm font-medium mb-1">Pré-visualização {selectedEvidence?.type?.includes('pdf') ? 'do PDF pendente' : 'não disponível'}</p>
                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        {selectedEvidence?.type?.includes('pdf')
                                            ? 'Para visualizar PDFs ou outros formatos complexos, faça o download do arquivo.'
                                            : 'O arquivo selecionado pode não ser suportado para visualização direta no navegador.'}
                                    </p>
                                </div>
                                <Button asChild variant="outline" className="mt-2">
                                    <a href={selectedEvidence?.url} target="_blank" rel="noopener noreferrer" download>
                                        Baixar ou Abrir Arquivo Completo
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AssessmentValidationModal;
