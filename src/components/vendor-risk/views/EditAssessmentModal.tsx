
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Loader2,
    Save,
    AlertTriangle,
    CheckCircle,
    FileText,
    Download,
    ExternalLink,
    Calendar,
    Clock,
    Shield
} from 'lucide-react';
import {
    DEFAULT_ASSESSMENT_QUESTIONS,
    calculateAssessmentStats,
    AssessmentQuestion
} from '../shared/RiskAssessmentManager';

interface EditAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessmentId: string | null;
    onSave?: () => void;
}

export const EditAssessmentModal: React.FC<EditAssessmentModalProps> = ({
    isOpen,
    onClose,
    assessmentId,
    onSave
}) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [assessment, setAssessment] = useState<any>(null);
    const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [metadata, setMetadata] = useState<any>({});

    // Fetch assessment data when modal opens
    useEffect(() => {
        if (isOpen && assessmentId) {
            fetchAssessmentData(assessmentId);
        } else {
            // Reset state when closed
            setAssessment(null);
            setQuestions([]);
            setResponses({});
            setMetadata({});
        }
    }, [isOpen, assessmentId]);

    const fetchAssessmentData = async (id: string) => {
        setLoading(true);
        try {
            // 1. Fetch Assessment
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

            // Normalize nested data (handle array vs object from Supabase)
            const normalizedData = {
                ...data,
                vendor_registry: Array.isArray(data.vendor_registry) ? data.vendor_registry[0] : data.vendor_registry,
                vendor_assessment_frameworks: Array.isArray(data.vendor_assessment_frameworks) ? data.vendor_assessment_frameworks[0] : data.vendor_assessment_frameworks
            };

            setAssessment(normalizedData);
            setResponses(data.responses || {});
            setMetadata({
                due_date: data.due_date,
                priority: data.priority,
                status: data.status,
                reviewer_notes: data.reviewer_notes || ''
            });

            // 2. Load Questions
            let loadedQuestions: AssessmentQuestion[] = [];

            // Try framework questions first
            const frameworkData = normalizedData.vendor_assessment_frameworks;

            if (frameworkData?.questions && frameworkData.questions.length > 0) {
                loadedQuestions = frameworkData.questions;
            }
            // Fallback to default questions
            else {
                loadedQuestions = DEFAULT_ASSESSMENT_QUESTIONS;
            }

            setQuestions(loadedQuestions);

        } catch (error: any) {
            console.error('Error fetching assessment:', error);
            toast({
                title: "Erro ao carregar",
                description: error.message,
                variant: "destructive"
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!assessmentId) return;
        setSaving(true);

        try {
            // Calculate stats
            const stats = calculateAssessmentStats(questions, responses);

            // Determine status
            let newStatus = metadata.status;
            if (stats.progress === 100 && newStatus !== 'completed') {
                newStatus = 'completed';
            } else if (stats.progress > 0 && stats.progress < 100 && newStatus === 'sent') {
                newStatus = 'in_progress';
            }

            // Update DB
            const { error } = await supabase
                .from('vendor_assessments')
                .update({
                    responses: responses,
                    due_date: metadata.due_date,
                    priority: metadata.priority,
                    status: newStatus,
                    progress_percentage: stats.progress,
                    reviewer_notes: metadata.reviewer_notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', assessmentId);

            if (error) throw error;

            toast({
                title: "Sucesso",
                description: "Assessment atualizado com sucesso",
            });

            if (onSave) onSave();
            onClose();

        } catch (error: any) {
            console.error('Error saving assessment:', error);
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const stats = calculateAssessmentStats(questions, responses);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] sm:w-auto max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">

                {/* Header */}
                <DialogHeader className="p-4 sm:p-6 border-b border-border/40 bg-muted/20">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="w-full sm:w-auto min-w-0">
                            <DialogTitle className="text-base sm:text-xl font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                                <span className="truncate">Editar Assessment - {assessment?.vendor_registry?.name || 'Fornecedor'}</span>
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-xs sm:text-sm truncate">
                                {assessment?.assessment_name || 'Assessment de Segurança'}
                            </DialogDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={stats.progress === 100 ? "default" : "secondary"} className="text-[10px] sm:text-xs">
                                {stats.progress}% Concluído
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden flex flex-col">

                        {/* Stats Bar */}
                        <div className="p-3 sm:px-6 sm:py-4 bg-muted/10 border-b border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                            <div className="text-center p-2 bg-background/50 rounded-lg sm:bg-transparent sm:p-0 sm:rounded-none">
                                <div className="text-xl sm:text-2xl font-bold text-primary">{questions.length}</div>
                                <div className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider">Questões</div>
                            </div>
                            <div className="text-center p-2 bg-background/50 rounded-lg sm:bg-transparent sm:p-0 sm:rounded-none">
                                <div className="text-xl sm:text-2xl font-bold text-green-500">{stats.answered}</div>
                                <div className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider">Respondidas</div>
                            </div>
                            <div className="text-center p-2 bg-background/50 rounded-lg sm:bg-transparent sm:p-0 sm:rounded-none">
                                <div className="text-xl sm:text-2xl font-bold text-orange-500">{stats.remaining}</div>
                                <div className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider">Restantes</div>
                            </div>
                            <div className="text-center p-2 bg-background/50 rounded-lg sm:bg-transparent sm:p-0 sm:rounded-none">
                                <div className="text-xl sm:text-2xl font-bold text-blue-500">{stats.progress}%</div>
                                <div className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-wider">Progresso</div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
                            <div className="p-3 sm:p-6 space-y-4 sm:space-y-8 max-w-full min-w-0">

                                {/* Metadata Section */}
                                <Card className="border-border/50 bg-card/50 max-w-full">
                                    <CardContent className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 max-w-full">
                                        <div className="space-y-1.5 sm:space-y-2 min-w-0">
                                            <Label className="text-xs sm:text-sm truncate block">Prazo</Label>
                                            <Input
                                                type="date"
                                                value={metadata.due_date ? metadata.due_date.split('T')[0] : ''}
                                                onChange={(e) => setMetadata({ ...metadata, due_date: e.target.value })}
                                                className="h-8 sm:h-10 text-xs sm:text-sm w-full"
                                            />
                                        </div>
                                        <div className="space-y-1.5 sm:space-y-2 min-w-0">
                                            <Label className="text-xs sm:text-sm truncate block">Prioridade</Label>
                                            <Select
                                                value={metadata.priority}
                                                onValueChange={(val) => setMetadata({ ...metadata, priority: val })}
                                            >
                                                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm w-full max-w-full"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Baixa</SelectItem>
                                                    <SelectItem value="medium">Média</SelectItem>
                                                    <SelectItem value="high">Alta</SelectItem>
                                                    <SelectItem value="critical">Crítica</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5 sm:space-y-2 min-w-0">
                                            <Label className="text-xs sm:text-sm truncate block">Status</Label>
                                            <Select
                                                value={metadata.status}
                                                onValueChange={(val) => setMetadata({ ...metadata, status: val })}
                                            >
                                                <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm w-full max-w-full"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="draft">Rascunho</SelectItem>
                                                    <SelectItem value="sent">Enviado</SelectItem>
                                                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                                                    <SelectItem value="completed">Concluído</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Questions Section */}
                                <div className="space-y-6 w-full max-w-full min-w-0">
                                    {questions.map((q, index) => {
                                        const response = responses[q.id];
                                        const answer = typeof response === 'object' && response !== null && 'answer' in response
                                            ? response.answer
                                            : response;

                                        return (
                                            <Card key={q.id} className={`border-l-4 w-full max-w-full min-w-0 overflow-hidden ${answer ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                                                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4 w-full max-w-full min-w-0">
                                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 max-w-full min-w-0">
                                                        <div className="space-y-1 w-full min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1 border-b border-border/10 pb-2 sm:border-0 sm:pb-0">
                                                                <Badge variant="outline" className="text-[9px] sm:text-xs whitespace-normal break-words">{q.category}</Badge>
                                                                {q.required && <Badge variant="destructive" className="text-[8px] sm:text-[10px] whitespace-normal">Obrigatória</Badge>}
                                                            </div>
                                                            <p className="font-medium text-[13px] sm:text-base leading-snug break-words whitespace-normal break-words m-0">{index + 1}. {q.question}</p>
                                                            {q.description && <p className="text-[11px] sm:text-sm text-muted-foreground mt-1 break-words whitespace-normal break-words">{q.description}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 w-full max-w-full min-w-0">
                                                        {/* Render Input based on type */}
                                                        {q.type === 'yes_no' && (
                                                            <div className="flex gap-2 sm:gap-4">
                                                                <Button
                                                                    variant={answer === 'yes' ? 'default' : 'outline'}
                                                                    onClick={() => setResponses({ ...responses, [q.id]: 'yes' })}
                                                                    className="flex-1 sm:flex-none sm:w-24 text-[10px] sm:text-sm h-8 sm:h-10"
                                                                >
                                                                    Sim
                                                                </Button>
                                                                <Button
                                                                    variant={answer === 'no' ? 'default' : 'outline'}
                                                                    onClick={() => setResponses({ ...responses, [q.id]: 'no' })}
                                                                    className="flex-1 sm:flex-none sm:w-24 text-[10px] sm:text-sm h-8 sm:h-10"
                                                                >
                                                                    Não
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {q.type === 'text' && (
                                                            <Textarea
                                                                value={answer || ''}
                                                                onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                                                                placeholder="Digite sua resposta..."
                                                                className="text-xs sm:text-sm min-h-[80px]"
                                                            />
                                                        )}

                                                        {q.type === 'multiple_choice' && (
                                                            <Select
                                                                value={answer || ''}
                                                                onValueChange={(val) => setResponses({ ...responses, [q.id]: val })}
                                                            >
                                                                <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                                <SelectContent>
                                                                    {q.options?.map(opt => (
                                                                        <SelectItem key={opt} value={opt} className="text-xs sm:text-sm">{opt}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}

                                                        {/* File Upload Display (Read-only for now in edit mode, or simple text fallback) */}
                                                        {q.type === 'file_upload' && (
                                                            <div className="p-3 sm:p-4 border rounded-md bg-muted/20">
                                                                {answer ? (
                                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
                                                                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                                                        <span className="truncate">Arquivo anexado: {typeof answer === 'string' ? answer : 'Objeto'}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                                                                        <span>Nenhum arquivo anexado</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-border/40 bg-muted/20 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                    <Button variant="outline" onClick={onClose} disabled={saving} className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving || loading} className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm">
                        {saving && <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
};
