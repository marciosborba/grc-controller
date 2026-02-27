import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash, MessageSquare, Save, Copy, Variable } from 'lucide-react';
import { toast } from 'sonner';
import { aiConfigService, AIPromptTemplate } from '@/services/aiConfigService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface AIPromptsTabProps {
    tenantId: string;
    readonly?: boolean;
}

export const AIPromptsTab: React.FC<AIPromptsTabProps> = ({ tenantId, readonly = false }) => {
    const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Partial<AIPromptTemplate>>({});

    // --- Loading ---
    const loadPrompts = async () => {
        setLoading(true);
        try {
            const data = await aiConfigService.getPrompts(tenantId);
            setPrompts(data);
        } catch (error) {
            console.error('Error loading prompts:', error);
            toast.error('Erro ao carregar prompts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenantId) loadPrompts();
    }, [tenantId]);

    // --- Actions ---
    const handleSave = async () => {
        try {
            if (!editingPrompt.name || !editingPrompt.template_content) {
                toast.error('Nome e Conteúdo são obrigatórios');
                return;
            }

            const payload: Partial<AIPromptTemplate> = {
                ...editingPrompt,
                // Explicitly set title and use_case for DB constraints
                title: editingPrompt.name,
                classification: editingPrompt.category, // Just in case mapping needed, but we use strict category now
                description: editingPrompt.description || editingPrompt.name, // Fallback for description
                use_case: editingPrompt.description || 'Geral',
                tenant_id: tenantId,
                is_active: editingPrompt.is_active ?? true, // Default to true
            };

            console.log('Saving prompt payload:', payload); // Debug log

            await aiConfigService.upsertPrompt(payload);
            toast.success('Prompt salvo com sucesso');
            setIsSheetOpen(false);
            loadPrompts();
        } catch (error: any) {
            console.error('Error saving prompt:', error);
            // Show more detailed error if available
            const errorMsg = error.message || 'Erro desconhecido ao salvar prompt';
            toast.error(`Erro ao salvar: ${errorMsg}`);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o prompt "${name}"?`)) return;
        try {
            await aiConfigService.deletePrompt(id);
            toast.success('Prompt removido');
            loadPrompts();
        } catch (error) {
            console.error('Error deleting prompt:', error);
            toast.error('Erro ao excluir prompt');
        }
    };

    const openNewDialog = () => {
        setEditingPrompt({ category: 'risk-assessment', is_active: true });
        setIsSheetOpen(true);
    };

    const openEditDialog = (prompt: AIPromptTemplate) => {
        setEditingPrompt(prompt);
        setIsSheetOpen(true);
    };

    const insertVariable = (variable: string) => {
        const content = editingPrompt.template_content || '';
        setEditingPrompt({ ...editingPrompt, template_content: content + variable });
        toast.info('Variável inserida', { position: 'bottom-right' });
    };

    // --- Filtering ---
    const filteredPrompts = prompts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableVariables = [
        { name: '{{context}}', desc: 'Contexto geral da requisição' },
        { name: '{{risk_data}}', desc: 'Dados da avaliação de risco' },
        { name: '{{compliance_rules}}', desc: 'Regras de compliance aplicáveis' },
        { name: '{{user_input}}', desc: 'Entada do usuário' },
        { name: '{{history}}', desc: 'Histórico da conversa' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                <div>
                    <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                        Biblioteca de Prompts
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">Gerencie templates de prompts para uso nos módulos de GRC.</p>
                </div>
                {!readonly && (
                    <Button onClick={openNewDialog} className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Novo Template
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar prompts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-black/20 border-white/10 w-full"
                    />
                </div>
            </div>

            {/* List */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardContent className="p-0">
                    {/* ── MOBILE: cards ── */}
                    <div className="sm:hidden divide-y divide-white/5">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">Carregando...</div>
                        ) : filteredPrompts.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground text-sm">Nenhum prompt encontrado.</div>
                        ) : filteredPrompts.map((prompt) => (
                            <div key={prompt.id} className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="font-medium text-white text-sm truncate">{prompt.name}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-2">{prompt.description}</div>
                                    </div>
                                    {!readonly && (
                                        <div className="flex gap-1 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={() => openEditDialog(prompt)}>
                                                <Edit className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(prompt.id, prompt.name)}>
                                                <Trash className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="outline" className="capitalize bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">
                                        {prompt.category}
                                    </Badge>
                                    <Badge variant={prompt.is_active ? "default" : "secondary"} className={`text-xs ${prompt.is_active ? "bg-green-600/20 text-green-400" : ""}`}>
                                        {prompt.is_active ? "Ativo" : "Inativo"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── DESKTOP: tabela ── */}
                    <div className="hidden sm:block">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="border-white/5 hover:bg-transparent">
                                    <TableHead className="text-white">Nome</TableHead>
                                    <TableHead className="text-white">Categoria</TableHead>
                                    <TableHead className="text-white">Status</TableHead>
                                    <TableHead className="text-white text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                                    </TableRow>
                                ) : filteredPrompts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                            Nenhum prompt encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPrompts.map((prompt) => (
                                        <TableRow key={prompt.id} className="border-white/5 hover:bg-white/5">
                                            <TableCell>
                                                <div className="font-medium text-white">{prompt.name}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[300px]">{prompt.description}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize bg-purple-500/10 text-purple-400 border-purple-500/20">
                                                    {prompt.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={prompt.is_active ? "default" : "secondary"} className={prompt.is_active ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" : ""}>
                                                    {prompt.is_active ? "Ativo" : "Inativo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!readonly && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => openEditDialog(prompt)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(prompt.id, prompt.name)}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Sheet / Modal */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-4xl w-full bg-slate-950 border-white/10 text-white flex flex-col p-0 overflow-y-auto">
                    <SheetHeader className="p-4 sm:p-6 border-b border-white/10 shrink-0">
                        <SheetTitle className="text-lg sm:text-2xl">{editingPrompt.id ? 'Editar Prompt' : 'Novo Prompt'}</SheetTitle>
                        <SheetDescription className="text-xs sm:text-sm">
                            Configure o template de prompt, suas variáveis e metadados.
                        </SheetDescription>
                    </SheetHeader>

                    {/* ── MOBILE: scroll vertical simples ── */}
                    <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
                        {/* LEFT: Metadata */}
                        <div className="w-full md:w-1/3 p-4 sm:p-6 md:border-r border-white/10 space-y-4 md:overflow-y-auto bg-black/20 border-b md:border-b-0 border-white/10">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs sm:text-sm">Nome do Prompt</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Análise de Risco Preliminar"
                                    value={editingPrompt.name || ''}
                                    onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                                    className="bg-white/5 border-white/10 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-xs sm:text-sm">Categoria</Label>
                                <Select
                                    value={editingPrompt.category}
                                    onValueChange={(val) => setEditingPrompt({ ...editingPrompt, category: val })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-sm">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-white/10">
                                        <SelectItem value="risk-assessment">Análise de Risco</SelectItem>
                                        <SelectItem value="compliance-check">Verificação de Compliance</SelectItem>
                                        <SelectItem value="incident-analysis">Análise de Incidentes</SelectItem>
                                        <SelectItem value="policy-review">Revisão de Políticas</SelectItem>
                                        <SelectItem value="audit-planning">Planejamento de Auditoria</SelectItem>
                                        <SelectItem value="control-testing">Teste de Controles</SelectItem>
                                        <SelectItem value="vendor-evaluation">Avaliação de Fornecedores</SelectItem>
                                        <SelectItem value="privacy-impact">Impacto de Privacidade</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="desc" className="text-xs sm:text-sm">Descrição</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Finalidade deste prompt..."
                                    value={editingPrompt.description || ''}
                                    onChange={(e) => setEditingPrompt({ ...editingPrompt, description: e.target.value })}
                                    className="bg-white/5 border-white/10 resize-none h-20 sm:h-24 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs sm:text-sm">Status</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant={editingPrompt.is_active ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setEditingPrompt({ ...editingPrompt, is_active: true })}
                                        className={editingPrompt.is_active ? "bg-green-600 hover:bg-green-700 flex-1 text-xs" : "flex-1 border-white/10 bg-white/5 text-xs"}
                                    >
                                        Ativo
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={!editingPrompt.is_active ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setEditingPrompt({ ...editingPrompt, is_active: false })}
                                        className={!editingPrompt.is_active ? "bg-red-600 hover:bg-red-700 flex-1 text-xs" : "flex-1 border-white/10 bg-white/5 text-xs"}
                                    >
                                        Inativo
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Content & Variables */}
                        <div className="w-full md:w-2/3 flex flex-col bg-slate-950/50">
                            <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between bg-black/40 shrink-0">
                                <Label className="flex items-center gap-2 text-xs sm:text-sm">
                                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-400" />
                                    Conteúdo do Prompt
                                </Label>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">Use variáveis para conteúdo dinâmico</span>
                            </div>

                            {/* Variáveis — chips clicáveis no mobile, sidebar no desktop */}
                            <div className="p-3 sm:hidden border-b border-white/10 bg-black/20">
                                <p className="text-[10px] text-muted-foreground mb-2">Inserir variável:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableVariables.map((v) => (
                                        <button
                                            key={v.name}
                                            onClick={() => insertVariable(v.name)}
                                            className="font-mono text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/20 rounded px-2 py-1 hover:bg-purple-500/20"
                                        >
                                            {v.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                <div className="flex-1 p-3 sm:p-4 flex flex-col">
                                    <Textarea
                                        value={editingPrompt.template_content || ''}
                                        onChange={(e) => setEditingPrompt({ ...editingPrompt, template_content: e.target.value })}
                                        className="flex-1 resize-none font-mono text-xs sm:text-sm leading-relaxed bg-black/40 border-white/10 p-3 sm:p-4 focus:ring-purple-500/50 min-h-[150px] sm:min-h-0"
                                        placeholder="Digite seu prompt aqui. Use {{var}} para variáveis..."
                                    />
                                </div>

                                {/* Variables Sidebar — apenas no desktop */}
                                <div className="hidden sm:flex w-48 border-l border-white/10 bg-black/20 flex-col">
                                    <div className="p-3 border-b border-white/10 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                        <Variable className="h-3 w-3" />
                                        Variáveis
                                    </div>
                                    <ScrollArea className="flex-1">
                                        <div className="p-2 space-y-1">
                                            {availableVariables.map((v) => (
                                                <button
                                                    key={v.name}
                                                    onClick={() => insertVariable(v.name)}
                                                    className="w-full text-left p-2 rounded-md hover:bg-white/10 group transition-colors"
                                                >
                                                    <div className="font-mono text-xs text-purple-300 group-hover:text-purple-200">{v.name}</div>
                                                    <div className="text-[10px] text-muted-foreground truncate">{v.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="p-4 sm:p-6 border-t border-white/10 bg-black/40 backdrop-blur-sm shrink-0 flex-col-reverse sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="w-full sm:w-auto border-white/10 hover:bg-white/10">Cancelar</Button>
                        <Button onClick={handleSave} className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 min-w-[120px]">
                            <Save className="mr-2 h-4 w-4" /> Salvar
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
};
