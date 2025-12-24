
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Save, FileText, ChevronRight, GripVertical, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentFramework, AssessmentDomain, AssessmentControl, AssessmentQuestion } from '@/types/assessment';

interface FrameworkEditorModalProps {
    framework: AssessmentFramework | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function FrameworkEditorModal({ framework, isOpen, onClose, onUpdate }: FrameworkEditorModalProps) {
    const [domains, setDomains] = useState<AssessmentDomain[]>([]);
    const [controls, setControls] = useState<Record<string, AssessmentControl[]>>({});
    const [questions, setQuestions] = useState<Record<string, AssessmentQuestion[]>>({});
    const [loading, setLoading] = useState(false);

    // Editing State
    const [editingQuestion, setEditingQuestion] = useState<Partial<AssessmentQuestion> | null>(null);

    useEffect(() => {
        if (framework && isOpen) {
            loadStructure();
        }
    }, [framework, isOpen]);

    const loadStructure = async () => {
        if (!framework) return;
        setLoading(true);
        try {
            // 1. Load Domains
            const { data: doms } = await supabase.from('assessment_domains').select('*').eq('framework_id', framework.id).order('ordem');
            setDomains(doms || []);

            // 2. Load Controls for all domains
            const domIds = doms?.map(d => d.id) || [];
            if (domIds.length > 0) {
                const { data: ctrls } = await supabase.from('assessment_controls').select('*').in('domain_id', domIds).order('ordem');

                // Group controls by domain
                const ctrlMap: Record<string, AssessmentControl[]> = {};
                const ctrlIds: string[] = [];
                ctrls?.forEach(c => {
                    if (!ctrlMap[c.domain_id]) ctrlMap[c.domain_id] = [];
                    ctrlMap[c.domain_id].push(c);
                    ctrlIds.push(c.id);
                });
                setControls(ctrlMap);

                // 3. Load Questions for all controls
                if (ctrlIds.length > 0) {
                    const { data: qs } = await supabase.from('assessment_questions').select('*').in('control_id', ctrlIds).order('ordem');
                    const qMap: Record<string, AssessmentQuestion[]> = {};
                    qs?.forEach(q => {
                        if (!qMap[q.control_id]) qMap[q.control_id] = [];
                        qMap[q.control_id].push(q);
                    });
                    setQuestions(qMap);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error('Erro ao carregar estrutura');
        } finally {
            setLoading(false);
        }
    };

    // --- CRUD OPERATIONS ---

    const handleSaveQuestion = async () => {
        if (!editingQuestion || !editingQuestion.pergunta) return toast.error('Pergunta é obrigatória');

        try {
            if (editingQuestion.id) {
                // Update
                const { error } = await supabase.from('assessment_questions').update({
                    pergunta: editingQuestion.pergunta,
                    tipo_resposta: editingQuestion.tipo_resposta,
                    evidencias_requeridas: editingQuestion.evidencias_requeridas,
                    opcoes_resposta: editingQuestion.opcoes_resposta
                }).eq('id', editingQuestion.id);
                if (error) throw error;
                toast.success('Questão atualizada');
            } else {
                // Create
                const { error } = await supabase.from('assessment_questions').insert({
                    ...editingQuestion,
                    tenant_id: framework?.tenant_id // Ensure tenant context
                });
                if (error) throw error;
                toast.success('Questão criada');
            }
            setEditingQuestion(null);
            loadStructure(); // Reload to refresh tree
        } catch (e: any) {
            toast.error('Erro ao salvar questão: ' + e.message);
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('Excluir esta questão?')) return;
        const { error } = await supabase.from('assessment_questions').delete().eq('id', id);
        if (error) toast.error('Erro ao excluir');
        else {
            toast.success('Questão excluída');
            loadStructure();
        }
    };

    const openNewQuestion = (controlId: string) => {
        setEditingQuestion({
            control_id: controlId,
            pergunta: '',
            tipo_resposta: 'sim_nao',
            evidencias_requeridas: false,
            opcoes_resposta: [],
            peso: 1,
            ordem: 1
        });
    };

    // --- RENDER HELPERS ---

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] md:max-w-7xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{framework?.nome}</DialogTitle>
                    <DialogDescription>Gerenciamento completo da estrutura e questões</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden grid grid-cols-12 min-h-[500px]">

                    {/* LEFT: Structure Tree */}
                    <div className="col-span-12 md:col-span-5 border-r bg-muted/10 overflow-hidden flex flex-col">
                        <div className="p-3 border-b font-medium text-sm flex justify-between items-center bg-muted/20">
                            <span>Estrutura (Domínios e Controles)</span>
                            <Button size="icon" variant="ghost" disabled className="h-6 w-6"><Plus className="h-3 w-3" /></Button>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            {loading && <div className="p-4 text-center text-sm text-muted-foreground">Carregando estrutura...</div>}
                            {!loading && domains.length === 0 && <div className="p-4 text-center text-sm text-muted-foreground">Nenhum domínio cadastrado. Verifique se o framework foi importado corretamente.</div>}
                            <Accordion type="multiple" className="w-full">
                                {domains.map(dom => (
                                    <AccordionItem value={dom.id} key={dom.id} className="border-b-0 mb-2">
                                        <AccordionTrigger className="hover:no-underline py-2 px-3 hover:bg-muted rounded-md text-sm font-semibold">
                                            <div className="flex items-center gap-2 text-left">
                                                <span className="text-muted-foreground text-xs">{dom.codigo}</span>
                                                <span>{dom.nome}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pl-4 pt-1">
                                            <div className="flex flex-col gap-1 border-l-2 border-muted pl-2 ml-2">
                                                {(controls[dom.id] || []).map(ctrl => (
                                                    <div key={ctrl.id} className="group flex flex-col gap-1">
                                                        <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm cursor-pointer"
                                                            onClick={() => { /* Highlight? */ }}>
                                                            <div className="font-medium flex items-center gap-2">
                                                                <span className="text-xs bg-muted px-1 rounded">{ctrl.codigo}</span>
                                                                <span className="truncate max-w-[180px]" title={ctrl.titulo}>{ctrl.titulo}</span>
                                                            </div>
                                                        </div>

                                                        {/* Questions List for Control */}
                                                        <div className="pl-4 space-y-1">
                                                            {(questions[ctrl.id] || []).map(q => (
                                                                <div key={q.id} className="flex items-start gap-2 p-2 text-xs bg-card text-foreground border rounded shadow-sm group/q relative">
                                                                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 shrink-0" />
                                                                    <span className="flex-1 line-clamp-2 text-zinc-700 dark:text-zinc-100" title={q.pergunta}>{q.pergunta || q.texto || 'Questão sem enunciado'}</span>
                                                                    <div className="flex gap-1 opacity-0 group-hover/q:opacity-100 transition-opacity absolute right-1 top-1 bg-card shadow-sm p-0.5 rounded border">
                                                                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingQuestion(q)}><FileText className="h-3 w-3" /></Button>
                                                                        <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => handleDeleteQuestion(q.id)}><Trash2 className="h-3 w-3" /></Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground h-7" onClick={() => openNewQuestion(ctrl.id)}>
                                                                <Plus className="h-3 w-3 mr-1" /> Nova Questão
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!controls[dom.id] || controls[dom.id].length === 0) && <span className="text-xs text-muted-foreground italic p-2">Sem controles</span>}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </ScrollArea>
                    </div>

                    {/* RIGHT: Editor Panel */}
                    <div className="col-span-12 md:col-span-7 p-6 flex flex-col overflow-y-auto bg-background/50">
                        {editingQuestion ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        {editingQuestion.id ? 'Editar Questão' : 'Nova Questão'}
                                    </h3>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingQuestion(null)}>Cancelar</Button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Texto da Pergunta</Label>
                                        <Textarea
                                            value={editingQuestion.pergunta}
                                            onChange={e => setEditingQuestion({ ...editingQuestion, pergunta: e.target.value })}
                                            className="min-h-[100px] text-base"
                                            placeholder="Digite a pergunta que será apresentada ao auditor..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Tipo de Resposta</Label>
                                            <Select value={editingQuestion.tipo_resposta} onValueChange={(v: any) => setEditingQuestion({ ...editingQuestion, tipo_resposta: v })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sim_nao">Sim / Não</SelectItem>
                                                    <SelectItem value="escala_1_5">Escala de Maturidade (1-5)</SelectItem>
                                                    <SelectItem value="texto_livre">Texto Livre (Descritiva)</SelectItem>
                                                    <SelectItem value="multipla_escolha">Múltipla Escolha (Lista)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Configurações</Label>
                                            <div className="flex items-center gap-2 border p-2 rounded-md h-10">
                                                <Checkbox
                                                    id="req_evidence"
                                                    checked={editingQuestion.evidencias_requeridas}
                                                    onCheckedChange={(c) => setEditingQuestion({ ...editingQuestion, evidencias_requeridas: !!c })}
                                                />
                                                <Label htmlFor="req_evidence" className="cursor-pointer">Exigir Evidência (Upload/Link)</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Multiple Choice Options Editor */}
                                    {editingQuestion.tipo_resposta === 'multipla_escolha' && (
                                        <div className="border rounded-md p-4 bg-muted/30 space-y-3">
                                            <Label className="text-blue-700">Opções de Resposta</Label>
                                            <div className="space-y-2">
                                                {(editingQuestion.opcoes_resposta as any[] || []).map((opt, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <Input
                                                            value={opt.text}
                                                            onChange={e => {
                                                                const newOpts = [...(editingQuestion.opcoes_resposta as any[] || [])];
                                                                newOpts[idx] = { ...newOpts[idx], text: e.target.value, value: e.target.value.toLowerCase().replace(/\s/g, '_') };
                                                                setEditingQuestion({ ...editingQuestion, opcoes_resposta: newOpts });
                                                            }}
                                                            placeholder={`Opção ${idx + 1}`}
                                                        />
                                                        <Button size="icon" variant="ghost" onClick={() => {
                                                            const newOpts = [...(editingQuestion.opcoes_resposta as any[] || [])];
                                                            newOpts.splice(idx, 1);
                                                            setEditingQuestion({ ...editingQuestion, opcoes_resposta: newOpts });
                                                        }}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                ))}
                                                <Button size="sm" variant="outline" onClick={() => {
                                                    const newOpts = [...(editingQuestion.opcoes_resposta as any[] || [])];
                                                    newOpts.push({ text: '', value: '' });
                                                    setEditingQuestion({ ...editingQuestion, opcoes_resposta: newOpts });
                                                }}><Plus className="h-3 w-3 mr-2" /> Adicionar Opção</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setEditingQuestion(null)}>Cancelar</Button>
                                    <Button onClick={handleSaveQuestion}><Save className="h-4 w-4 mr-2" /> Salvar Alterações</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                    <GripVertical className="h-8 w-8 opacity-20" />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">Editor de Questões</h3>
                                <p className="max-w-sm mt-2">
                                    Selecione uma questão na árvore à esquerda para editar seus detalhes, ou clique em "Nova Questão" sob um controle para criar uma.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
                <DialogFooter className="px-6 py-4 border-t bg-muted/20">
                    <Button onClick={onClose}>Fechar Editor</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
