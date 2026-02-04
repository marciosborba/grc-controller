
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
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">

                {/* Header */}
                <DialogHeader className="p-6 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Editar Assessment - {assessment?.vendor_registry?.name || 'Fornecedor'}
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                {assessment?.assessment_name || 'Assessment de Segurança'}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={stats.progress === 100 ? "default" : "secondary"}>
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
                        <div className="px-6 py-4 bg-muted/10 border-b border-border/40 grid grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Questões</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-500">{stats.answered}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Respondidas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-500">{stats.remaining}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Restantes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-500">{stats.progress}%</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Progresso</div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-8">

                                {/* Metadata Section */}
                                <Card className="border-border/50 bg-card/50">
                                    <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Prazo</Label>
                                            <Input
                                                type="date"
                                                value={metadata.due_date ? metadata.due_date.split('T')[0] : ''}
                                                onChange={(e) => setMetadata({ ...metadata, due_date: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Prioridade</Label>
                                            <Select
                                                value={metadata.priority}
                                                onValueChange={(val) => setMetadata({ ...metadata, priority: val })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Baixa</SelectItem>
                                                    <SelectItem value="medium">Média</SelectItem>
                                                    <SelectItem value="high">Alta</SelectItem>
                                                    <SelectItem value="critical">Crítica</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select
                                                value={metadata.status}
                                                onValueChange={(val) => setMetadata({ ...metadata, status: val })}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
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
                                <div className="space-y-6">
                                    {questions.map((q, index) => {
                                        const response = responses[q.id];
                                        const answer = typeof response === 'object' && response !== null && 'answer' in response
                                            ? response.answer
                                            : response;

                                        return (
                                            <Card key={q.id} className={`border-l-4 ${answer ? 'border-l-green-500' : 'border-l-orange-500'}`}>
                                                <CardContent className="p-6 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">{q.category}</Badge>
                                                                {q.required && <Badge variant="destructive" className="text-[10px]">Obrigatória</Badge>}
                                                            </div>
                                                            <p className="font-medium text-base">{index + 1}. {q.question}</p>
                                                            {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2">
                                                        {/* Render Input based on type */}
                                                        {q.type === 'yes_no' && (
                                                            <div className="flex gap-4">
                                                                <Button
                                                                    variant={answer === 'yes' ? 'default' : 'outline'}
                                                                    onClick={() => setResponses({ ...responses, [q.id]: 'yes' })}
                                                                    className="w-24"
                                                                >
                                                                    Sim
                                                                </Button>
                                                                <Button
                                                                    variant={answer === 'no' ? 'default' : 'outline'}
                                                                    onClick={() => setResponses({ ...responses, [q.id]: 'no' })}
                                                                    className="w-24"
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
                                                            />
                                                        )}

                                                        {q.type === 'multiple_choice' && (
                                                            <Select
                                                                value={answer || ''}
                                                                onValueChange={(val) => setResponses({ ...responses, [q.id]: val })}
                                                            >
                                                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                                                <SelectContent>
                                                                    {q.options?.map(opt => (
                                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}

                                                        {/* File Upload Display (Read-only for now in edit mode, or simple text fallback) */}
                                                        {q.type === 'file_upload' && (
                                                            <div className="p-4 border rounded-md bg-muted/20">
                                                                {answer ? (
                                                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                                                        <CheckCircle className="h-4 w-4" />
                                                                        <span>Arquivo anexado (JSON): {typeof answer === 'string' ? answer.substring(0, 50) + '...' : 'Objeto de arquivo'}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <AlertTriangle className="h-4 w-4" />
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
                        </ScrollArea>
                    </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-border/40 bg-muted/20 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
};
