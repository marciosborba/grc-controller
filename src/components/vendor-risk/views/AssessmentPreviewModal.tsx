import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Loader2,
    CheckCircle,
    FileText,
    ChevronLeft,
    ChevronRight,
    Target,
    Shield,
    Link,
    Copy as CopyIcon,
    ExternalLink,
    Menu,
    X
} from 'lucide-react';
import {
    DEFAULT_ASSESSMENT_QUESTIONS,
    AssessmentQuestion
} from '../shared/RiskAssessmentManager';

interface AssessmentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessmentId: string | null;
    assessmentData?: any;
}

export const AssessmentPreviewModal: React.FC<AssessmentPreviewModalProps> = ({
    isOpen,
    onClose,
    assessmentId,
    assessmentData
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [assessment, setAssessment] = useState<any>(null);
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);

    const normalizeAndSetData = (data: any) => {
        // Normalize nested data
        const normalizedData = {
            ...data,
            vendor_registry: Array.isArray(data.vendor_registry) ? data.vendor_registry[0] : data.vendor_registry,
            vendor_assessment_frameworks: Array.isArray(data.vendor_assessment_frameworks) ? data.vendor_assessment_frameworks[0] : data.vendor_assessment_frameworks
        };

        setAssessment(normalizedData);
        setResponses(data.responses || {});

        // Load Questions
        let loadedQuestions: AssessmentQuestion[] = [];
        const frameworkData = normalizedData.vendor_assessment_frameworks;

        if (frameworkData?.questions && frameworkData.questions.length > 0) {
            loadedQuestions = frameworkData.questions;
        } else {
            loadedQuestions = DEFAULT_ASSESSMENT_QUESTIONS;
        }

        setQuestions(loadedQuestions);
    };

    useEffect(() => {
        if (isOpen) {
            if (assessmentData) {
                normalizeAndSetData(assessmentData);
            } else if (assessmentId) {
                fetchAssessmentData(assessmentId);
            }
        } else {
            setAssessment(null);
            setQuestions([]);
            setResponses({});
            setCurrentStep(0);
        }
    }, [isOpen, assessmentId, assessmentData]);

    const fetchAssessmentData = async (id: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vendor_assessments')
                .select(`
          *,
          vendor_registry:vendor_id (*),
          vendor_assessment_frameworks:framework_id (*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) throw new Error('Assessment not found');

            normalizeAndSetData(data);

        } catch (error: any) {
            console.error('Error fetching assessment preview:', error);
            toast({
                title: "Erro ao carregar preview",
                description: error.message,
                variant: "destructive"
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const currentQuestion = questions[currentStep];
    const progress = questions.length > 0 ? Math.round((Object.keys(responses).length / questions.length) * 100) : 0;

    // Group questions by category for sidebar
    const categories = Array.from(new Set(questions.map(q => q.category)));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 gap-0 bg-background overflow-hidden flex flex-col">
                {/* Header */}
                <div className="h-16 border-b flex items-center justify-between px-6 bg-card">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold leading-none">
                                {assessment?.assessment_name || 'Assessment Preview'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {assessment?.vendor_registry?.name || 'Fornecedor'} • {assessment?.vendor_assessment_frameworks?.name || 'Template'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <span className="text-sm font-medium">{progress}% Concluído</span>
                            <Progress value={progress} className="w-32 h-2 mt-1" />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)} className="md:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Fechar Preview
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar Navigation */}
                        <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 border-r bg-muted/10 flex flex-col overflow-hidden`}>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-6">
                                    {categories.map((category) => {
                                        const categoryQuestions = questions.filter(q => q.category === category);
                                        return (
                                            <div key={category} className="space-y-2">
                                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                                                    {category}
                                                </h3>
                                                <div className="space-y-1">
                                                    {categoryQuestions.map((q) => {
                                                        const index = questions.findIndex(quest => quest.id === q.id);
                                                        const isAnswered = !!responses[q.id];
                                                        const isCurrent = currentStep === index;

                                                        return (
                                                            <button
                                                                key={q.id}
                                                                onClick={() => setCurrentStep(index)}
                                                                className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-start gap-2 transition-colors ${isCurrent ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                                                    }`}
                                                            >
                                                                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isAnswered ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/40'
                                                                    }`}>
                                                                    {isAnswered && <CheckCircle className="h-3 w-3" />}
                                                                </div>
                                                                <span className="truncate">{index + 1}. {q.question}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-secondary/5">
                            <ScrollArea className="flex-1 p-6 md:p-10">
                                <div className="max-w-3xl mx-auto space-y-8">
                                    {currentQuestion && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            {/* Question Header */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{currentQuestion.category}</Badge>
                                                    {currentQuestion.required && <Badge variant="destructive">Obrigatória</Badge>}
                                                </div>
                                                <h1 className="text-2xl font-semibold text-foreground leading-tight">
                                                    {currentQuestion.question}
                                                </h1>
                                                {currentQuestion.description && (
                                                    <p className="text-muted-foreground text-lg">
                                                        {currentQuestion.description}
                                                    </p>
                                                )}
                                            </div>

                                            <Separator />

                                            {/* Answer Section (Read Only / Interactive Simulation) */}
                                            <Card>
                                                <CardContent className="p-6">
                                                    {/* We can reuse the rendering logic from EditAssessmentModal but simplified/read-only or interactive if desired. 
                                                        Since it's a preview, interactive is good but maybe clearly marked as "Preview Mode".
                                                        For now, I'll just show the answer state if it exists, or allow interaction but not save?
                                                        The user said "Assessment Preview option is not professional".
                                                        Usually preview means "see what it looks like".
                                                        So interactive is good.
                                                    */}
                                                    {(() => {
                                                        const q = currentQuestion;
                                                        const response = responses[q.id];
                                                        const answer = typeof response === 'object' && response !== null && 'answer' in response
                                                            ? response.answer
                                                            : response;

                                                        return (
                                                            <div className="space-y-6">
                                                                {q.type === 'yes_no' && (
                                                                    <div className="flex gap-4">
                                                                        <Button
                                                                            variant={answer === 'yes' ? 'default' : 'outline'}
                                                                            onClick={() => setResponses({ ...responses, [q.id]: 'yes' })}
                                                                            className="w-32 h-12 text-lg"
                                                                        >
                                                                            Sim
                                                                        </Button>
                                                                        <Button
                                                                            variant={answer === 'no' ? 'default' : 'outline'}
                                                                            onClick={() => setResponses({ ...responses, [q.id]: 'no' })}
                                                                            className="w-32 h-12 text-lg"
                                                                        >
                                                                            Não
                                                                        </Button>
                                                                    </div>
                                                                )}

                                                                {q.type === 'text' && (
                                                                    <Textarea
                                                                        value={answer || ''}
                                                                        onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                                                                        placeholder="Digite sua resposta detalhada aqui..."
                                                                        className="min-h-[150px] text-base"
                                                                    />
                                                                )}

                                                                {q.type === 'multiple_choice' && (
                                                                    <div className="space-y-3">
                                                                        {q.options?.map(opt => (
                                                                            <div
                                                                                key={opt}
                                                                                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${answer === opt ? 'border-primary bg-primary/5' : 'hover:bg-muted'}`}
                                                                                onClick={() => setResponses({ ...responses, [q.id]: opt })}
                                                                            >
                                                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answer === opt ? 'border-primary' : 'border-muted-foreground'}`}>
                                                                                    {answer === opt && <div className="w-3 h-3 rounded-full bg-primary" />}
                                                                                </div>
                                                                                <span className="text-base">{opt}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {q.type === 'scale' && (
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            {Array.from({ length: q.scale_max || 5 }, (_, i) => i + (q.scale_min || 1)).map((val) => (
                                                                                <Button
                                                                                    key={val}
                                                                                    variant={answer === val ? 'default' : 'outline'}
                                                                                    onClick={() => setResponses({ ...responses, [q.id]: val })}
                                                                                    className="h-12 w-12 text-lg font-bold rounded-full"
                                                                                >
                                                                                    {val}
                                                                                </Button>
                                                                            ))}
                                                                        </div>
                                                                        <div className="flex justify-between text-sm text-muted-foreground px-2">
                                                                            <span>{q.scale_labels?.[0] || 'Menor'}</span>
                                                                            <span>{q.scale_labels?.[q.scale_labels.length - 1] || 'Maior'}</span>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {q.type === 'file_upload' && (
                                                                    <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center gap-4 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
                                                                        <div className="p-4 bg-background rounded-full shadow-sm">
                                                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium">Clique para fazer upload ou arraste arquivos</p>
                                                                            <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, JPG (Max 10MB)</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Footer Navigation */}
                            <div className="h-20 border-t bg-card flex items-center justify-between px-6 md:px-10">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    disabled={currentStep === 0}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                                </Button>
                                <div className="text-sm text-muted-foreground">
                                    Questão {currentStep + 1} de {questions.length}
                                </div>
                                <Button
                                    onClick={() => setCurrentStep(Math.min(questions.length - 1, currentStep + 1))}
                                    disabled={currentStep === questions.length - 1}
                                >
                                    Próxima <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
