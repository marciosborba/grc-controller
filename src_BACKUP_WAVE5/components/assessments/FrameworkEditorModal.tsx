
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
import { Plus, Trash2, Save, FileText, ChevronRight, GripVertical, CheckCircle2, Edit } from 'lucide-react';
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
    const [editingControl, setEditingControl] = useState<AssessmentControl | null>(null); // [NEW] Control Editing State

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
                        // Map DB columns to Frontend Interface
                        const mappedQ = {
                            ...q,
                            pergunta: q.texto, // Map DB 'texto' to 'pergunta'
                            tipo_resposta: q.tipo_pergunta // Map DB 'tipo_pergunta' to 'tipo_resposta'
                        };

                        if (!qMap[q.control_id]) qMap[q.control_id] = [];
                        qMap[q.control_id].push(mappedQ);
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

    const handleSaveControl = async () => {
        if (!editingControl) return;
        // Save Control Title
        try {
            const { error } = await supabase.from('assessment_controls').update({
                titulo: editingControl.titulo,
                descricao: editingControl.descricao
            }).eq('id', editingControl.id);
            if (error) throw error;

            toast.success('Controle atualizado');
            setEditingControl(null);
            loadStructure();
        } catch (e: any) { toast.error('Erro ao salvar controle: ' + e.message); }
    };

    const handleSaveDefaultQuestion = async (qData: Partial<AssessmentQuestion>) => {
        // Find existing question for this control or create new
        const existingQs = questions[editingControl!.id] || [];
        const mainQ = existingQs[0];

        try {
            const dbPayload = {
                texto: qData.pergunta, // Map back
                tipo_pergunta: qData.tipo_resposta, // Map back
                evidencias_requeridas: qData.evidencias_requeridas,
                opcoes_resposta: qData.opcoes_resposta
            };

            if (mainQ) {
                const { error } = await supabase.from('assessment_questions').update(dbPayload).eq('id', mainQ.id);
                if (error) throw error;
                toast.success('Configurações de avaliação atualizadas');
            } else {
                const { error } = await supabase.from('assessment_questions').insert({
                    ...dbPayload,
                    control_id: editingControl!.id,
                    tenant_id: framework?.tenant_id,
                    codigo: `${editingControl!.codigo}-Q1`,
                    ordem: 1,
                    peso: 1
                });
                if (error) throw error;
                toast.success('Configurações de avaliação criadas');
            }
            loadStructure(); // Refresh to see changes
        } catch (e: any) { toast.error('Erro ao salvar avaliação: ' + e.message); }
    };

    const handleSaveQuestion = async () => {
        if (!editingQuestion || !editingQuestion.pergunta) return toast.error('Pergunta é obrigatória');

        try {
            const dbPayload = {
                texto: editingQuestion.pergunta,
                tipo_pergunta: editingQuestion.tipo_resposta,
                evidencias_requeridas: editingQuestion.evidencias_requeridas,
                opcoes_resposta: editingQuestion.opcoes_resposta
            };

            if (editingQuestion.id) {
                // Update
                const { error } = await supabase.from('assessment_questions').update(dbPayload).eq('id', editingQuestion.id);
                if (error) throw error;
                toast.success('Questão atualizada');
            } else {
                // Create
                const { error } = await supabase.from('assessment_questions').insert({
                    ...dbPayload,
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

    // ... (handleDeleteQuestion, openNewQuestion remain same)

    const openEditControl = (ctrl: AssessmentControl) => {
        setEditingControl(ctrl);
        setEditingQuestion(null); // Clear question editor
    };

    const handleCreateDomain = async () => {
        const nome = prompt('Nome do novo domínio:');
        if (!nome) return;
        const codigo = prompt('Código do domínio (ex: DOM-01):', `DOM-${domains.length + 1}`);
        if (!codigo) return;

        try {
            const { error } = await supabase.from('assessment_domains').insert({
                framework_id: framework?.id,
                tenant_id: framework?.tenant_id,
                nome,
                codigo,
                ordem: domains.length + 1,
                ativo: true
            });
            if (error) throw error;
            toast.success('Domínio criado');
            loadStructure();
        } catch (e: any) { toast.error('Erro ao criar domínio: ' + e.message); }
    };

    const handleCreateControl = async (domId: string) => {
        const titulo = prompt('Título do novo controle (será a pergunta):');
        if (!titulo) return;

        // Auto-generate code based on domain + count
        const domainControls = controls[domId] || [];
        const domainObj = domains.find(d => d.id === domId);
        const nextNum = domainControls.length + 1;
        const autoCode = domainObj ? `${domainObj.codigo}.${nextNum}` : `CTRL-${nextNum}`;
        const codigo = prompt('Código do controle:', autoCode);
        if (!codigo) return;


        try {
            const { data: newCtrl, error: ctrlError } = await supabase.from('assessment_controls').insert({
                domain_id: domId,
                framework_id: framework?.id,
                tenant_id: framework?.tenant_id,
                codigo,
                titulo, // Title IS the question text conceptually for list view
                descricao: titulo,
                ordem: nextNum,
                ativo: true,
                tipo_controle: 'preventivo', // Defaults
                criticidade: 'media',
                peso: 1
            }).select().single();

            if (ctrlError) throw ctrlError;

            // Auto-create the Question associated with this control
            const { error: qError } = await supabase.from('assessment_questions').insert({
                control_id: newCtrl.id,
                tenant_id: framework?.tenant_id,
                codigo: `${codigo}-Q1`,
                texto: titulo, // Match title
                tipo_pergunta: 'sim_nao', // Default
                ordem: 1,
                peso: 1,
                ativa: true
            });
            if (qError) throw qError;

            toast.success('Controle criado');
            loadStructure();
        } catch (e: any) { toast.error('Erro ao criar controle: ' + e.message); }
    };

    // --- RENDER HELPERS ---

    // Helper to get default question data for control editor
    const getDefaultQuestion = (ctrlId: string): Partial<AssessmentQuestion> => {
        const qs = questions[ctrlId] || [];
        if (qs.length > 0) return qs[0];
        return {
            pergunta: '', // Default to control objective or blank?
            tipo_resposta: 'sim_nao',
            evidencias_requeridas: false,
            opcoes_resposta: []
        };
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[98vw] h-[95vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>{framework?.nome}</DialogTitle>
                    <DialogDescription>Gerenciamento completo da estrutura e questões</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden grid grid-cols-12 min-h-[500px]">

                    {/* LEFT: Structure Tree */}
                    <div className="col-span-12 md:col-span-5 border-r bg-muted/10 overflow-hidden flex flex-col">
                        <div className="p-3 border-b font-medium text-sm flex justify-between items-center bg-muted/20">
                            <span>Estrutura (Domínios e Controles)</span>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                            {/* ... (Loading/Empty states same) */}
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
                                                {(controls[dom.id] || []).map(ctrl => {
                                                    const hasQuestions = questions[ctrl.id] && questions[ctrl.id].length > 0;
                                                    return (
                                                        <div key={ctrl.id} className="group flex flex-col gap-1">
                                                            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted text-sm cursor-pointer border border-transparent hover:border-border"
                                                                onClick={(e) => { e.stopPropagation(); openEditControl(ctrl); }}>
                                                                <div className="font-medium flex items-center gap-2 flex-1">
                                                                    {/* Check Icon Left of Control */}
                                                                    {hasQuestions ? (
                                                                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                                                    ) : (
                                                                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                                                                    )}

                                                                    <span className="text-xs bg-muted px-1 rounded">{ctrl.codigo}</span>
                                                                    <span className="truncate" title={ctrl.titulo}>{ctrl.titulo}</span>
                                                                </div>
                                                                <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary" title="Editar Controle e Avaliação" onClick={(e) => { e.stopPropagation(); openEditControl(ctrl); }}>
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {(!controls[dom.id] || controls[dom.id].length === 0) && <span className="text-xs text-muted-foreground italic p-2">Sem controles</span>}
                                                <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground h-8 mt-2 border border-dashed border-muted hover:border-primary/50" onClick={(e) => { e.stopPropagation(); handleCreateControl(dom.id); }}>
                                                    <Plus className="h-3 w-3 mr-1" /> Novo Controle
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </ScrollArea>
                        <div className="p-3 border-t bg-muted/10">
                            <Button variant="outline" className="w-full border-dashed" onClick={handleCreateDomain}>
                                <Plus className="h-4 w-4 mr-2" /> Novo Domínio
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT: Editor Panel */}
                    <div className="col-span-12 md:col-span-7 p-6 flex flex-col overflow-y-auto bg-background/50">
                        {editingQuestion ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
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
                                            placeholder="Digite a pergunta..."
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
                                            <div className="flex items-center gap-2 border p-2 rounded-md h-10 bg-card">
                                                <Checkbox
                                                    id="req_evidence_q"
                                                    checked={editingQuestion.evidencias_requeridas}
                                                    onCheckedChange={(c) => setEditingQuestion({ ...editingQuestion, evidencias_requeridas: !!c })}
                                                />
                                                <Label htmlFor="req_evidence_q" className="cursor-pointer text-foreground">Exigir Evidência</Label>
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
                                    <Button onClick={handleSaveQuestion}><Save className="h-4 w-4 mr-2" /> Salvar Questão</Button>
                                </div>
                            </div>
                        ) : editingControl ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Edit className="h-5 w-5 text-primary" />
                                        Editar Controle: {editingControl.codigo}
                                    </h3>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingControl(null)}>Fechar Editor</Button>
                                </div>

                                <div className="space-y-6">
                                    {/* 1. Control Details */}
                                    <div className="space-y-4 p-4 border rounded-md bg-white">
                                        <h4 className="font-medium text-sm text-foreground/80 border-b pb-2 mb-2">Detalhes do Controle</h4>
                                        <div className="space-y-2">
                                            <Label>Título do Controle (Ação de Mitigação)</Label>
                                            <Input
                                                value={editingControl.titulo}
                                                onChange={e => setEditingControl({ ...editingControl, titulo: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Descrição / Objetivo</Label>
                                            <Textarea
                                                value={editingControl.descricao || ''}
                                                onChange={e => setEditingControl({ ...editingControl, descricao: e.target.value })}
                                                className="h-20"
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <Button size="sm" variant="outline" onClick={handleSaveControl}>Salvar Detalhes do Controle</Button>
                                        </div>
                                    </div>

                                    {/* 2. Assessment Criteria (The Default Question) */}
                                    <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                                        <h4 className="font-medium text-sm text-foreground border-b pb-2 mb-2">Critérios de Avaliação (Questão Padrão)</h4>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Defina como este controle será avaliado. Esta configuração edita a pergunta principal associada a este controle.
                                        </p>

                                        {(() => {
                                            // Local state logic or render immediate logic for the form
                                            const defaultQ = getDefaultQuestion(editingControl.id);
                                            // We need state to edit these values before saving.
                                            // Ideally we should have put 'questionForm' in state, but to keep it simple let's use a sub-component pattern or just uncontrolled inputs with ref?
                                            // No, let's just cheat and reuse 'editingQuestion' state? No that switches view.
                                            // Let's assume the user edits the question via the Question Editor usually, but here we want a Quick Form.
                                            // We will implement an inline form that calls 'handleSaveDefaultQuestion' on blur or save.
                                            return (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Tipo de Resposta</Label>
                                                            <Select defaultValue={defaultQ.tipo_resposta} onValueChange={(v) => handleSaveDefaultQuestion({ ...defaultQ, tipo_resposta: v as any })}>
                                                                <SelectTrigger><SelectValue>{defaultQ.tipo_resposta === 'escala_1_5' ? 'Escala de Maturidade (1-5)' : defaultQ.tipo_resposta === 'sim_nao' ? 'Conformidade (Sim/Não)' : defaultQ.tipo_resposta}</SelectValue></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="sim_nao">Conformidade (Sim/Não)</SelectItem>
                                                                    <SelectItem value="escala_1_5">Escala de Maturidade (1-5)</SelectItem>
                                                                    <SelectItem value="texto_livre">Texto Livre</SelectItem>
                                                                    <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Evidência</Label>
                                                            <div className="flex items-center space-x-2 border p-2 rounded h-10 bg-transparent">
                                                                <Checkbox
                                                                    id="ev_check"
                                                                    checked={defaultQ.evidencias_requeridas}
                                                                    onCheckedChange={(c) => handleSaveDefaultQuestion({ ...defaultQ, evidencias_requeridas: !!c })}
                                                                />
                                                                <Label htmlFor="ev_check" className="cursor-pointer text-foreground font-medium">Exigir Evidência</Label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Multiple Choice Options for Control Editor */}
                                                    {defaultQ.tipo_resposta === 'multipla_escolha' && (
                                                        <div className="border rounded-md p-4 bg-muted/30 space-y-3">
                                                            <Label className="text-blue-700">Opções de Resposta</Label>
                                                            <div className="space-y-2">
                                                                {(defaultQ.opcoes_resposta as any[] || []).map((opt, idx) => (
                                                                    <div key={idx} className="flex gap-2">
                                                                        <Input
                                                                            value={opt.text}
                                                                            onChange={e => {
                                                                                const newOpts = [...(defaultQ.opcoes_resposta as any[] || [])];
                                                                                newOpts[idx] = { ...newOpts[idx], text: e.target.value, value: e.target.value.toLowerCase().replace(/\s/g, '_') };
                                                                                handleSaveDefaultQuestion({ ...defaultQ, opcoes_resposta: newOpts });
                                                                            }}
                                                                            placeholder={`Opção ${idx + 1}`}
                                                                        />
                                                                        <Button size="icon" variant="ghost" onClick={() => {
                                                                            const newOpts = [...(defaultQ.opcoes_resposta as any[] || [])];
                                                                            newOpts.splice(idx, 1);
                                                                            handleSaveDefaultQuestion({ ...defaultQ, opcoes_resposta: newOpts });
                                                                        }}><Trash2 className="h-4 w-4" /></Button>
                                                                    </div>
                                                                ))}
                                                                <Button size="sm" variant="outline" onClick={() => {
                                                                    const newOpts = [...(defaultQ.opcoes_resposta as any[] || [])];
                                                                    newOpts.push({ text: '', value: '' });
                                                                    handleSaveDefaultQuestion({ ...defaultQ, opcoes_resposta: newOpts });
                                                                }}><Plus className="h-3 w-3 mr-2" /> Adicionar Opção</Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <Label>Pergunta de Verificação</Label>
                                                        <div className="flex gap-2">
                                                            <Input
                                                                defaultValue={defaultQ.pergunta}
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== defaultQ.pergunta)
                                                                        handleSaveDefaultQuestion({ ...defaultQ, pergunta: e.target.value })
                                                                }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">Saia do campo para salvar automaticamente.</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
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
