import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PlayCircle, Plus, Edit, Trash2, Save, FileText, CheckCircle2, GripVertical } from 'lucide-react';
import useVendorRiskManagement, { VendorAssessmentFramework, VendorAssessmentQuestion } from '@/hooks/useVendorRiskManagement';

export const VendorFrameworkManager: React.FC = () => {
    const { frameworks, createFramework, updateFramework, deleteFramework, loading } = useVendorRiskManagement();

    const [searchTerm, setSearchTerm] = useState('');
    const [showFrameworkDialog, setShowFrameworkDialog] = useState(false);
    const [editingFramework, setEditingFramework] = useState<VendorAssessmentFramework | null>(null);
    const [questionsJson, setQuestionsJson] = useState('[]');
    const [questionsError, setQuestionsError] = useState('');

    const [formState, setFormState] = useState<Partial<VendorAssessmentFramework>>({
        name: '',
        description: '',
        framework_type: 'custom',
        is_active: true,
        questions: []
    });

    const handleAddQuestion = () => {
        const newQuestion: VendorAssessmentQuestion = {
            id: crypto.randomUUID(),
            text: '',
            question: '', // added for backward compat
            category: 'Geral',
            type: 'yes_no_na',
            criticality: 'medio',
            requires_evidence: false,
            required: true // default to true
        };
        setFormState(prev => ({
            ...prev,
            questions: [...(prev.questions || []), newQuestion]
        }));
    };

    const handleUpdateQuestion = (id: string, field: string, value: string) => {
        setFormState(prev => ({
            ...prev,
            questions: (prev.questions || []).map((q: any) =>
                q.id === id ? { ...q, [field]: value } : q
            )
        }));
    };

    const handleRemoveQuestion = (id: string) => {
        setFormState(prev => ({
            ...prev,
            questions: (prev.questions || []).filter((q: any) => q.id !== id)
        }));
    };

    const filteredFrameworks = frameworks.filter(fw =>
        fw.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fw.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreateDialog = () => {
        setEditingFramework(null);
        setFormState({
            name: '',
            description: '',
            framework_type: 'custom',
            is_active: true,
            questions: []
        });
        setQuestionsJson('[]');
        setQuestionsError('');
        setShowFrameworkDialog(true);
    };

    const handleOpenEditDialog = (framework: VendorAssessmentFramework) => {
        setEditingFramework(framework);
        const qList = framework.questions || [];
        setFormState({
            name: framework.name,
            description: framework.description,
            framework_type: framework.framework_type,
            is_active: framework.is_active,
            questions: qList
        });
        setQuestionsJson(JSON.stringify(qList, null, 2));
        setQuestionsError('');
        setShowFrameworkDialog(true);
    };

    const handleSaveFramework = async () => {
        if (!formState.name) return;

        if (editingFramework) {
            await updateFramework(editingFramework.id, formState);
        } else {
            await createFramework(formState);
        }
        setShowFrameworkDialog(false);
    };

    const handleDeleteFramework = async (id: string) => {
        if (window.confirm("Certeza que deseja excluir este framework? Avaliações existentes manterão este framework, mas ele não poderá ser usado em novas.")) {
            await deleteFramework(id);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Gestão de Frameworks</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Configure e gerencie os questionários utilizados nos assessments
                    </p>
                </div>
                <Button className="w-full sm:w-auto" onClick={handleOpenCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Framework
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Frameworks e Questionários</CardTitle>
                            <CardDescription>
                                Seus formulários ativos disponíveis para novos assessments
                            </CardDescription>
                        </div>
                        <div className="w-full sm:w-72">
                            <Input
                                placeholder="Buscar framework..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredFrameworks.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <p>Nenhum framework encontrado</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredFrameworks.map(fw => (
                                    <Card key={fw.id} className="relative overflow-hidden group">
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge variant="outline" className="uppercase font-mono text-[10px]">
                                                    {fw.framework_type}
                                                </Badge>
                                                {fw.is_active ?
                                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-[10px]">Ativo</Badge> :
                                                    <Badge variant="secondary" className="bg-red-500/10 text-red-600 text-[10px]">Inativo</Badge>
                                                }
                                            </div>
                                            <h3 className="font-semibold text-lg line-clamp-1 mb-1">{fw.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-10 mb-4">
                                                {fw.description || "Sem descrição."}
                                            </p>

                                            <div className="flex items-center gap-2 pt-2 border-t mt-4">
                                                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleOpenEditDialog(fw)}>
                                                    <Edit className="h-3.5 w-3.5 mr-1" /> Editar
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-destructive h-8 w-8 hover:bg-destructive/10" onClick={() => handleDeleteFramework(fw.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create / Edit Dialog */}
            <Dialog open={showFrameworkDialog} onOpenChange={setShowFrameworkDialog}>
                <DialogContent className="max-w-[95vw] md:max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            {editingFramework ? 'Editar Framework' : 'Novo Framework'}
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Utilize este formulário para configurar as propriedades do seu questionário
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs sm:text-sm">Nome do Framework</Label>
                            <Input
                                id="name"
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                placeholder="Ex: Avaliação de Segurança Básica"
                                className="text-xs sm:text-sm h-8 sm:h-10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-xs sm:text-sm">Tipo</Label>
                            <Select
                                value={formState.framework_type}
                                onValueChange={(value: any) => setFormState({ ...formState, framework_type: value })}
                            >
                                <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-10">
                                    <SelectValue placeholder="Selecione tipo de framework" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="iso27001">ISO 27001</SelectItem>
                                    <SelectItem value="nist">NIST</SelectItem>
                                    <SelectItem value="lgpd">LGPD</SelectItem>
                                    <SelectItem value="custom">Customizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="desc" className="text-xs sm:text-sm">Descrição</Label>
                            <Textarea
                                id="desc"
                                value={formState.description}
                                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                placeholder="Breve descrição dos objetivos deste formulário"
                                rows={3}
                                className="text-xs sm:text-sm resize-y"
                            />
                        </div>

                        <div className="grid gap-4 mt-4 border-t pt-4">
                            <div className="flex justify-between items-center">
                                <Label className="text-sm sm:text-base font-semibold">Controles e Questões</Label>
                                <Button size="sm" variant="outline" onClick={handleAddQuestion}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Questão
                                </Button>
                            </div>

                            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                <span className="font-medium text-primary">{(formState.questions || []).length}</span> questão(ões) neste framework.
                                <span>• Use o campo <code className="bg-muted px-1 rounded text-[10px]">#</code> para identificar / reordenar questões visualmente.</span>
                            </div>
                            <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-2">
                                {formState.questions && formState.questions.length > 0 ? (
                                    formState.questions.map((q: any, index: number) => (
                                        <div key={q.id || index} className="flex flex-col sm:flex-row gap-3 bg-muted/30 p-4 rounded-lg border">
                                            <div className="flex justify-between items-center sm:hidden mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center justify-center bg-primary/10 rounded px-2 py-0.5">
                                                        <span className="text-xs font-bold text-primary">#{index + 1}</span>
                                                    </div>
                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">de {(formState.questions || []).length}</div>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive h-8 w-8 hover:bg-destructive/10"
                                                    onClick={() => handleRemoveQuestion(q.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="hidden sm:flex items-center gap-2 mt-2">
                                                <div className="flex items-center justify-center bg-muted rounded-md border w-8 h-8 shrink-0 cursor-grab" title="Arraste para reordenar">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] text-muted-foreground uppercase font-semibold leading-none mb-0.5">#</span>
                                                    <div className="h-8 w-14 flex items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-primary text-xs font-bold select-none">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid gap-3 flex-1">
                                                <div className="grid gap-1">
                                                    <Textarea
                                                        value={q.text || q.question || ''}
                                                        onChange={(e) => {
                                                            handleUpdateQuestion(q.id, 'text', e.target.value);
                                                            handleUpdateQuestion(q.id, 'question', e.target.value);
                                                        }}
                                                        placeholder="Digite a questão ou controle..."
                                                        className="text-xs sm:text-sm min-h-[60px] resize-y"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <Input
                                                        value={q.category || ''}
                                                        onChange={(e) => handleUpdateQuestion(q.id, 'category', e.target.value)}
                                                        placeholder="Categoria (ex: Segurança)"
                                                        className="w-full sm:w-1/3 h-8 sm:h-10 text-xs sm:text-sm"
                                                    />
                                                    <Select
                                                        value={q.type || 'yes_no'}
                                                        onValueChange={(value) => handleUpdateQuestion(q.id, 'type', value)}
                                                    >
                                                        <SelectTrigger className="w-full sm:w-1/3 h-8 sm:h-10 text-xs sm:text-sm">
                                                            <SelectValue placeholder="Tipo de resposta" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="yes_no">Sim / Não</SelectItem>
                                                            <SelectItem value="yes_no_na">Sim / Não / N/A</SelectItem>
                                                            <SelectItem value="text">Texto Livre</SelectItem>
                                                            <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                                                            <SelectItem value="checkbox">Checkbox</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-1/3 h-8 sm:h-10">
                                                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Criticidade:</span>
                                                        <Select
                                                            value={q.criticality || 'medio'}
                                                            onValueChange={(value) => handleUpdateQuestion(q.id, 'criticality', value)}
                                                        >
                                                            <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm flex-1 min-w-0">
                                                                <SelectValue placeholder="Criticidade" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="baixo">Baixo</SelectItem>
                                                                <SelectItem value="medio">Médio</SelectItem>
                                                                <SelectItem value="alto">Alto</SelectItem>
                                                                <SelectItem value="critico">Crítico</SelectItem>
                                                                <SelectItem value="info">Info (Risco)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {q.criticality === 'info' && (
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Peso Risco:</span>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                max={10}
                                                                step={0.5}
                                                                value={q.riskWeight ?? 5}
                                                                onChange={(e) => handleUpdateQuestion(q.id, 'riskWeight', e.target.value)}
                                                                className="h-8 sm:h-10 w-20 text-xs sm:text-sm text-center"
                                                                placeholder="0-10"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mt-1">
                                                    {(q.type === 'multiple_choice' || q.type === 'checkbox') ? (
                                                        <div className="flex-1 w-full space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-muted-foreground font-medium">Opções de resposta e seus pesos:</span>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 text-xs px-2"
                                                                    onClick={() => {
                                                                        const current = q.optionWeights || [];
                                                                        const updated = [...current, { label: '', weight: 0 }];
                                                                        handleUpdateQuestion(q.id, 'optionWeights', updated as any);
                                                                        // Keep options in sync
                                                                        handleUpdateQuestion(q.id, 'options', updated.map((o: any) => o.label).join(','));
                                                                    }}
                                                                >
                                                                    <Plus className="h-3 w-3 mr-1" /> Opção
                                                                </Button>
                                                            </div>
                                                            {(() => {
                                                                // Backward compat: convert old comma-separated to structured
                                                                let opts: Array<{ label: string; weight: number }> = q.optionWeights || [];
                                                                if (opts.length === 0 && q.options) {
                                                                    const labels = typeof q.options === 'string' ? q.options.split(',').map((s: string) => s.trim()) : q.options;
                                                                    if (Array.isArray(labels) && labels.length > 0) {
                                                                        opts = labels.map((l: string, i: number) => ({
                                                                            label: l,
                                                                            weight: Math.round((i / Math.max(labels.length - 1, 1)) * 2 * 10) / 10,
                                                                        }));
                                                                    }
                                                                }
                                                                if (opts.length === 0) {
                                                                    opts = [
                                                                        { label: 'Inexistente', weight: 0 },
                                                                        { label: 'Inicial', weight: 0.5 },
                                                                        { label: 'Básico', weight: 1 },
                                                                        { label: 'Gerenciado', weight: 1.5 },
                                                                        { label: 'Otimizado', weight: 2 },
                                                                    ];
                                                                    // Auto-set on first render
                                                                    setTimeout(() => {
                                                                        handleUpdateQuestion(q.id, 'optionWeights', opts as any);
                                                                        handleUpdateQuestion(q.id, 'options', opts.map(o => o.label).join(','));
                                                                    }, 0);
                                                                }
                                                                return opts.map((opt, optIdx) => (
                                                                    <div key={optIdx} className="flex items-center gap-2">
                                                                        <span className="text-[10px] text-muted-foreground w-4 shrink-0">{optIdx + 1}.</span>
                                                                        <Input
                                                                            value={opt.label}
                                                                            onChange={(e) => {
                                                                                const updated = [...opts];
                                                                                updated[optIdx] = { ...updated[optIdx], label: e.target.value };
                                                                                handleUpdateQuestion(q.id, 'optionWeights', updated as any);
                                                                                handleUpdateQuestion(q.id, 'options', updated.map(o => o.label).join(','));
                                                                            }}
                                                                            placeholder={`Opção ${optIdx + 1}`}
                                                                            className="h-7 text-xs flex-1 min-w-0"
                                                                        />
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            <span className="text-[10px] text-muted-foreground">Peso:</span>
                                                                            <Input
                                                                                type="number"
                                                                                step={0.1}
                                                                                min={0}
                                                                                max={10}
                                                                                value={opt.weight}
                                                                                onChange={(e) => {
                                                                                    const updated = [...opts];
                                                                                    updated[optIdx] = { ...updated[optIdx], weight: parseFloat(e.target.value) || 0 };
                                                                                    handleUpdateQuestion(q.id, 'optionWeights', updated as any);
                                                                                }}
                                                                                className="h-7 w-16 text-xs text-center"
                                                                            />
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                                                                            onClick={() => {
                                                                                const updated = opts.filter((_, i) => i !== optIdx);
                                                                                handleUpdateQuestion(q.id, 'optionWeights', updated as any);
                                                                                handleUpdateQuestion(q.id, 'options', updated.map(o => o.label).join(','));
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ));
                                                            })()}
                                                        </div>
                                                    ) : <div className="flex-1 hidden sm:block" />}
                                                    <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 border sm:border-none p-2 sm:p-0 rounded-md sm:rounded-none bg-background/50 sm:bg-transparent">
                                                        <Label className="text-xs sm:text-sm cursor-pointer" htmlFor={`req-${q.id}`}>Obrigatória</Label>
                                                        <Switch
                                                            id={`req-${q.id}`}
                                                            checked={q.required !== false}
                                                            onCheckedChange={(checked) => handleUpdateQuestion(q.id, 'required', checked as any)}
                                                            className="data-[state=checked]:!bg-primary mr-2"
                                                        />

                                                        <Label className="text-xs sm:text-sm cursor-pointer border-l pl-2" htmlFor={`req-ev-${q.id}`}>Exigir Evidência</Label>
                                                        <Switch
                                                            id={`req-ev-${q.id}`}
                                                            checked={!!q.requires_evidence}
                                                            onCheckedChange={(checked) => handleUpdateQuestion(q.id, 'requires_evidence', checked as any)}
                                                            className="data-[state=checked]:!bg-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="hidden sm:flex text-destructive h-8 w-8 shrink-0 hover:bg-destructive/10"
                                                onClick={() => handleRemoveQuestion(q.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 border border-dashed rounded-lg bg-muted/10">
                                        <p className="text-sm text-muted-foreground">Nenhuma questão adicionada ao framework ainda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFrameworkDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveFramework} disabled={loading || !formState.name || !!questionsError}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Salvando...' : 'Salvar Framework'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};
