import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Trash2,
    Save,
    CornerDownRight,
    FileText,
    Search,
    Loader2,
    Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';

interface Requirement {
    id: string;
    codigo: string;
    titulo: string;
    descricao: string;
    criterios_conformidade: string;
    status: string;
    requisito_pai: string | null;
    children?: Requirement[];
}

interface FrameworkRequirementsProps {
    frameworkId: string | null;
    frameworkName: string;
    open: boolean;
    onClose: () => void;
    isStandard?: boolean;
}

export function FrameworkRequirements({
    frameworkId,
    frameworkName,
    open,
    onClose,
    isStandard = false
}: FrameworkRequirementsProps) {
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [loading, setLoading] = useState(false);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [parentIdForCreation, setParentIdForCreation] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        codigo: '',
        titulo: '',
        descricao: '',
        criterios_conformidade: ''
    });

    const tenantId = useCurrentTenantId();
    const { user } = useAuth();

    useEffect(() => {
        if (open && frameworkId) {
            loadRequirements();
            setIsCreating(false);
            setEditingId(null);
            setParentIdForCreation(null);
            setSelectedReqId(null);
        }
    }, [open, frameworkId]);

    const buildTree = (items: Requirement[]): Requirement[] => {
        const map: { [key: string]: Requirement } = {};
        const roots: Requirement[] = [];

        items.forEach(item => {
            map[item.id] = { ...item, children: [] };
        });

        items.forEach(item => {
            if (item.requisito_pai && map[item.requisito_pai]) {
                map[item.requisito_pai].children?.push(map[item.id]);
            } else {
                roots.push(map[item.id]);
            }
        });

        const sortRecursive = (nodes: Requirement[]) => {
            // Sort by code naturally (1.1 before 1.2 before 1.10)
            nodes.sort((a, b) => a.codigo.localeCompare(b.codigo, undefined, { numeric: true }));
            nodes.forEach(node => {
                if (node.children) sortRecursive(node.children);
            });
        };

        sortRecursive(roots);
        return roots;
    };

    const loadRequirements = async () => {
        if (!frameworkId) return;

        setLoading(true);
        try {
            let query = supabase
                .from('requisitos_compliance')
                .select('*')
                .eq('framework_id', frameworkId)
                .order('codigo');

            if (!isStandard) {
                query = query.eq('tenant_id', tenantId);
            }

            const { data, error } = await query;

            if (error) throw error;

            const tree = buildTree(data || []);
            setRequirements(tree);
        } catch (error) {
            console.error('Error loading requirements:', error);
            toast.error('Erro ao carregar requisitos');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (req: Requirement) => {
        setSelectedReqId(req.id);
        setEditingId(req.id);
        setIsCreating(false);
        setParentIdForCreation(null);
        setFormData({
            codigo: req.codigo,
            titulo: req.titulo,
            descricao: req.descricao || '',
            criterios_conformidade: req.criterios_conformidade || ''
        });
    };

    const handleCreateNew = (parentId: string | null = null, parentCode: string = '') => {
        setSelectedReqId(null);
        setEditingId(null);
        setIsCreating(true);
        setParentIdForCreation(parentId);

        // Intelligent code suggestion
        let nextCode = '';
        if (parentCode) {
            nextCode = `${parentCode}.`;
        }

        setFormData({
            codigo: nextCode,
            titulo: '',
            descricao: '',
            criterios_conformidade: ''
        });
    };

    const handleSave = async () => {
        if (!frameworkId) return;
        if (!formData.codigo || !formData.titulo) {
            toast.error('Preencha Código e Título');
            return;
        }

        try {
            const payload: any = {
                ...formData,
                framework_id: frameworkId,
                tenant_id: isStandard ? null : tenantId,
                created_by: user?.id,
                updated_by: user?.id
            };

            if (parentIdForCreation) {
                payload.requisito_pai = parentIdForCreation;
            }

            if (editingId) {
                const { error } = await supabase
                    .from('requisitos_compliance')
                    .update(payload)
                    .eq('id', editingId);

                if (error) throw error;
                toast.success('Requisito atualizado');
            } else {
                const { error, data } = await supabase
                    .from('requisitos_compliance')
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                toast.success('Requisito criado');
                if (data) setSelectedReqId(data.id);
            }

            await loadRequirements();
            if (isCreating) {
                setIsCreating(false);
                // If we just created, the editingId logic implies we are done or should select it.
                // The reload will rebuild the tree. We might lose selection if we don't track the new ID.
                // For now, simplicity: clear selection or user re-selects.
            }
        } catch (error) {
            console.error('Error saving requirement:', error);
            toast.error('Erro ao salvar requisito');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este requisito? Isso não pode ser desfeito.')) return;

        try {
            const { error } = await supabase
                .from('requisitos_compliance')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Requisito excluído');

            if (selectedReqId === id) {
                setSelectedReqId(null);
                setEditingId(null);
                setIsCreating(false);
            }
            loadRequirements();
        } catch (error) {
            console.error('Error deleting requirement:', error);
            toast.error('Erro ao excluir requisito');
        }
    };

    const renderTreeItem = (req: Requirement, level: number = 0) => {
        const isSelected = selectedReqId === req.id;
        const isDomain = level === 0;

        // Simple search filter
        if (searchTerm) {
            const match = req.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.codigo.toLowerCase().includes(searchTerm.toLowerCase());
            if (!match && !req.children?.some(c => JSON.stringify(c).toLowerCase().includes(searchTerm.toLowerCase()))) {
                return null;
            }
        }

        return (
            <div key={req.id}>
                <div
                    className={`
                        flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm transition-colors mb-1
                        ${isSelected ? 'bg-primary/10 text-primary font-medium border border-primary/20' : 'hover:bg-muted border border-transparent'}
                    `}
                    style={{ marginLeft: `${level * 12}px` }}
                    onClick={() => handleSelect(req)}
                >
                    <div className={`flex-none ${isDomain ? 'text-blue-500' : 'text-orange-500'}`}>
                        {isDomain ? <FileText className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </div>
                    <div className="flex-none font-mono text-xs opacity-70 w-16 truncate">{req.codigo}</div>
                    <div className={`flex-1 truncate ${isDomain ? 'font-semibold' : ''}`} title={req.titulo}>{req.titulo}</div>

                    <div className="flex-none flex gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" title="Adicionar Filho" onClick={(e) => { e.stopPropagation(); handleCreateNew(req.id, req.codigo); }}>
                            <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" title="Excluir" onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
                {req.children && req.children.map(child => renderTreeItem(child, level + 1))}
            </div>
        );
    };

    const renderContent = () => {
        if (requirements.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                    <FileText className="h-12 w-12 mb-4 opacity-20" />
                    <p>Nenhum requisito encontrado.</p>
                    <Button variant="link" onClick={() => handleCreateNew()}>Criar o primeiro requisito</Button>
                </div>
            );
        }
        return (
            <div className="space-y-1">
                {requirements.map(r => renderTreeItem(r))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-muted/20">
                    <div>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            {frameworkName}
                            {isStandard && <Badge variant="secondary" className="ml-2">Padrão do Sistema</Badge>}
                        </DialogTitle>
                        <DialogDescription className="mt-1">
                            {isStandard
                                ? 'Visualização da estrutura do framework padrão. Para editar, clone este framework.'
                                : 'Editor de Estrutura e Requisitos'}
                        </DialogDescription>
                    </div>
                    <div className="flex gap-2">
                        {!isStandard && (
                            <Button variant="outline" onClick={() => handleCreateNew()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Novo Requisito Raiz
                            </Button>
                        )}
                    </div>
                </div>

                {isStandard && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900 px-6 py-2 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <Shield className="h-4 w-4" />
                        <span>
                            <strong>Modo Somente Leitura:</strong> Este é um framework oficial do sistema.
                            Você não pode alterar sua estrutura original para garantir a integridade das referências cruzadas.
                        </span>
                    </div>
                )}

                {/* Main Content: Two Columns */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left: Tree View (Searchable) */}
                    <div className="w-[450px] border-r flex flex-col bg-card/30">
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por código ou título..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 bg-background"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 group">
                            {renderContent()}
                        </div>
                    </div>

                    {/* Right: Editor Form */}
                    <div className="flex-1 flex flex-col overflow-y-auto bg-background/50">
                        {(editingId || isCreating) ? (
                            <div className="p-8 max-w-3xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex justify-between items-start border-b pb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-semibold">
                                                {isStandard ? 'Detalhes do Requisito' : (isCreating ? 'Novo Requisito' : 'Editar Requisito')}
                                            </h2>
                                            {(() => {
                                                const codeDots = formData.codigo.split('.').length - 1;
                                                const likelyDomain = codeDots === 0 && !formData.codigo.includes('.');
                                                const isRootCreation = isCreating && !parentIdForCreation;
                                                const showDomain = likelyDomain || isRootCreation;

                                                return (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${showDomain ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800' : 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800'}`}>
                                                        {showDomain ? 'Domínio / Seção' : 'Controle / Requisito'}
                                                    </span>
                                                );
                                            })()}
                                        </div>
                                        <p className="text-muted-foreground text-sm">
                                            {isStandard
                                                ? 'Visualizando detalhes e critérios de conformidade.'
                                                : (isCreating
                                                    ? parentIdForCreation ? 'Criando um sub-requisito vinculado.' : 'Criando um novo requisito raiz.'
                                                    : 'Editando detalhes e critérios de conformidade.')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-6">
                                    <div className="col-span-1 space-y-2">
                                        <Label>Código</Label>
                                        <Input
                                            value={formData.codigo}
                                            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                                            placeholder="1.0"
                                            className="font-mono bg-background"
                                            disabled={isStandard}
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-2">
                                        <Label>Título</Label>
                                        <Input
                                            value={formData.titulo}
                                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                            placeholder="Título do controle"
                                            className="bg-background"
                                            disabled={isStandard}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Textarea
                                        value={formData.descricao}
                                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                        placeholder="Descreva o objetivo deste controle..."
                                        className="h-24 resize-none bg-background"
                                        disabled={isStandard}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-primary font-medium flex items-center gap-2">
                                        <CornerDownRight className="h-4 w-4" />
                                        Critérios de Conformidade / Auditoria
                                    </Label>
                                    <div className="p-1 rounded-md border bg-background focus-within:ring-2 focus-within:ring-ring">
                                        <Textarea
                                            value={formData.criterios_conformidade}
                                            onChange={(e) => setFormData({ ...formData, criterios_conformidade: e.target.value })}
                                            placeholder="Liste aqui o que o auditor deve verificar em cada linha..."
                                            className="h-40 border-0 focus-visible:ring-0 p-4 resize-none text-base leading-relaxed"
                                            disabled={isStandard}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-1">
                                        Estes critérios serão usados para gerar os checklists de auditoria automática.
                                    </p>
                                </div>

                                {!isStandard && (
                                    <div className="pt-8 flex justify-end gap-3 border-t">
                                        {editingId && (
                                            <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto" onClick={() => handleDelete(editingId)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Excluir
                                            </Button>
                                        )}
                                        <Button variant="outline" onClick={() => { setIsCreating(false); setEditingId(null); }}>
                                            Cancelar
                                        </Button>
                                        <Button onClick={handleSave} className="min-w-[150px]">
                                            <Save className="h-4 w-4 mr-2" />
                                            Salvar Alterações
                                        </Button>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
                                <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                                    {isStandard ? <Shield className="h-10 w-10 opacity-40" /> : <CornerDownRight className="h-10 w-10 opacity-40" />}
                                </div>
                                <h3 className="text-xl font-medium text-foreground/80">Selecione um requisito</h3>
                                <p className="text-sm mt-2 max-w-xs text-center">
                                    {isStandard
                                        ? 'Navegue pela árvore à esquerda para visualizar os detalhes.'
                                        : 'Navegue pela árvore à esquerda para editar ou clique em "Novo" para adicionar.'}
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-muted/20 flex justify-between items-center text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${isStandard ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`}></div>
                        {isStandard ? 'Modo Visualização' : 'Editando em tempo real'}: {frameworkName}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            Fechar Editor
                        </Button>
                        <Button size="sm" onClick={onClose}>
                            Concluir Edição
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
