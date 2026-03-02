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
import useVendorRiskManagement from '@/hooks/useVendorRiskManagement';
import { VendorAssessmentFramework } from '@/hooks/useVendorRiskManagement';

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
        const newQuestion = {
            id: crypto.randomUUID(),
            text: '',
            category: 'Geral',
            type: 'yes_no_na',
            weight: 1,
            requires_evidence: false
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
                <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
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

                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                                {formState.questions && formState.questions.length > 0 ? (
                                    formState.questions.map((q: any, index: number) => (
                                        <div key={q.id || index} className="flex flex-col sm:flex-row gap-3 bg-muted/30 p-4 rounded-lg border">
                                            <div className="flex justify-between items-center sm:hidden mb-1">
                                                <div className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider">Questão {index + 1}</div>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive h-8 w-8 hover:bg-destructive/10"
                                                    onClick={() => handleRemoveQuestion(q.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="hidden sm:block mt-2 text-muted-foreground cursor-grab">
                                                <GripVertical className="h-5 w-5" />
                                            </div>
                                            <div className="grid gap-3 flex-1">
                                                <div className="grid gap-1">
                                                    <Textarea
                                                        value={q.text}
                                                        onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)}
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
                                                        </SelectContent>
                                                    </Select>
                                                    <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-1/3 h-8 sm:h-10 border rounded-md px-2 bg-background">
                                                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Peso:</span>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            value={q.weight || 1}
                                                            onChange={(e) => handleUpdateQuestion(q.id, 'weight', e.target.value)}
                                                            className="h-6 sm:h-8 w-16 px-1 py-0 text-xs sm:text-sm border-none focus-visible:ring-0 shadow-none text-right sm:text-left"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mt-1">
                                                    {q.type === 'multiple_choice' ? (
                                                        <div className="flex-1 w-full">
                                                            <Input
                                                                value={q.options || ''}
                                                                onChange={(e) => handleUpdateQuestion(q.id, 'options', e.target.value)}
                                                                placeholder="Opções separadas por vírgula (Ex: Alta, Média, Baixa)"
                                                                className="h-8 sm:h-10 text-xs sm:text-sm w-full"
                                                            />
                                                        </div>
                                                    ) : <div className="flex-1 hidden sm:block" />}
                                                    <div className="flex items-center justify-between sm:justify-start gap-2 shrink-0 border sm:border-none p-2 sm:p-0 rounded-md sm:rounded-none bg-background/50 sm:bg-transparent">
                                                        <Label className="text-xs sm:text-sm cursor-pointer" htmlFor={`req-ev-${q.id}`}>Exigir Evidência</Label>
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
