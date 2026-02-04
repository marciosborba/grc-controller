import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Search, Edit, Trash, Workflow, Save, Play, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { aiConfigService, AIWorkflow } from '@/services/aiConfigService';
import { Separator } from '@/components/ui/separator';

interface AIWorkflowsTabProps {
    tenantId: string;
    readonly?: boolean;
}

export const AIWorkflowsTab: React.FC<AIWorkflowsTabProps> = ({ tenantId, readonly = false }) => {
    const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<Partial<AIWorkflow>>({});

    // --- Loading ---
    const loadWorkflows = async () => {
        setLoading(true);
        try {
            const data = await aiConfigService.getWorkflows(tenantId);
            setWorkflows(data);
        } catch (error) {
            console.error('Error loading workflows:', error);
            toast.error('Erro ao carregar workflows');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenantId) loadWorkflows();
    }, [tenantId]);

    // --- Actions ---
    const handleSave = async () => {
        try {
            if (!editingWorkflow.name) {
                toast.error('Nome é obrigatório');
                return;
            }

            const payload: Partial<AIWorkflow> = {
                ...editingWorkflow,
                tenant_id: tenantId,
                is_active: editingWorkflow.is_active ?? true,
                status: editingWorkflow.status || 'draft',
            };

            await aiConfigService.upsertWorkflow(payload);
            toast.success('Workflow salvo com sucesso');
            setIsSheetOpen(false);
            loadWorkflows();
        } catch (error) {
            console.error('Error saving workflow:', error);
            toast.error('Erro ao salvar workflow');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o workflow "${name}"?`)) return;
        try {
            await aiConfigService.deleteWorkflow(id);
            toast.success('Workflow removido');
            loadWorkflows();
        } catch (error) {
            console.error('Error deleting workflow:', error);
            toast.error('Erro ao excluir workflow');
        }
    };

    const openNewDialog = () => {
        setEditingWorkflow({ status: 'draft', is_active: true });
        setIsSheetOpen(true);
    };

    const openEditDialog = (wf: AIWorkflow) => {
        setEditingWorkflow(wf);
        setIsSheetOpen(true);
    };

    const filteredWorkflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Workflow className="h-5 w-5 text-emerald-400" />
                        Automação & Workflows
                    </h3>
                    <p className="text-muted-foreground text-sm">Configure fluxos automatizados de análise e geração de conteúdo para GRC.</p>
                </div>
                {!readonly && (
                    <Button onClick={openNewDialog} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" /> Novo Workflow
                    </Button>
                )}
            </div>

            {/* List */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-white">Nome</TableHead>
                                <TableHead className="text-white">Status</TableHead>
                                <TableHead className="text-white">Ativo</TableHead>
                                <TableHead className="text-white text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Carregando...</TableCell>
                                </TableRow>
                            ) : filteredWorkflows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                        Nenhum workflow encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredWorkflows.map((wf) => (
                                    <TableRow key={wf.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell>
                                            <div className="font-medium text-white">{wf.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`capitalize ${wf.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-white/5'}`}>
                                                {wf.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={wf.is_active ? "default" : "secondary"} className={wf.is_active ? "bg-green-600/20 text-green-400" : ""}>
                                                {wf.is_active ? "Sim" : "Não"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!readonly && (
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-400" title="Simular Execução">
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => openEditDialog(wf)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400" onClick={() => handleDelete(wf.id, wf.name)}>
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
                </CardContent>
            </Card>

            {/* Sheet / Modal */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-2xl bg-black/95 border-white/10 text-white flex flex-col p-6">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl flex items-center gap-2">
                            <Workflow className="h-6 w-6 text-emerald-400" />
                            {editingWorkflow.id ? 'Editar Workflow' : 'Novo Workflow'}
                        </SheetTitle>
                        <SheetDescription>
                            Configure a lógica de automação e gatilhos.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                        {/* 1. Basic Info */}
                        <div className="space-y-4 rounded-xl bg-white/5 p-4 border border-white/10">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-white">
                                <Zap className="h-4 w-4 text-yellow-400" /> Informações Básicas
                            </h4>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome do Workflow</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Análise Automática de Vulnerabilidades"
                                        value={editingWorkflow.name || ''}
                                        onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                                        className="bg-black/20 border-white/10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Status & Trigger (Simulated for visuals) */}
                        <div className="space-y-4 rounded-xl bg-white/5 p-4 border border-white/10">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-white">
                                <Clock className="h-4 w-4 text-blue-400" /> Gatilho e Estado
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Estado Atual</Label>
                                    <Select
                                        value={editingWorkflow.status}
                                        onValueChange={(val) => setEditingWorkflow({ ...editingWorkflow, status: val })}
                                    >
                                        <SelectTrigger className="bg-black/20 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10">
                                            <SelectItem value="draft">Rascunho</SelectItem>
                                            <SelectItem value="active">Ativo</SelectItem>
                                            <SelectItem value="paused">Pausado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Gatilho (Trigger)</Label>
                                    <Select defaultValue="manual">
                                        <SelectTrigger className="bg-black/20 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-900 border-white/10">
                                            <SelectItem value="manual">Manual (Sob Demanda)</SelectItem>
                                            <SelectItem value="schedule">Agendado (Cron)</SelectItem>
                                            <SelectItem value="event">Evento (Webhook)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Label className="mb-2 block">Status Global</Label>
                                <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg border border-white/10">
                                    <div className={`p-2 rounded-full ${editingWorkflow.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{editingWorkflow.is_active ? 'Habilitado' : 'Desabilitado'}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {editingWorkflow.is_active ? 'O workflow será executado normalmente.' : 'O workflow está completamente parado.'}
                                        </div>
                                    </div>
                                    <Button
                                        variant={editingWorkflow.is_active ? "destructive" : "default"}
                                        size="sm"
                                        onClick={() => setEditingWorkflow({ ...editingWorkflow, is_active: !editingWorkflow.is_active })}
                                    >
                                        {editingWorkflow.is_active ? 'Desabilitar' : 'Habilitar'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Steps Visualization (Placeholder) */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-white">
                                <Workflow className="h-4 w-4 text-emerald-400" /> Passos do Workflow
                            </h4>
                            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
                                <p className="text-muted-foreground text-sm">Visualização do fluxo em desenvolvimento.</p>
                                <div className="mt-4 flex justify-center gap-2">
                                    <Badge variant="outline" className="bg-black/40">Gatilho</Badge>
                                    <Separator orientation="horizontal" className="w-8 self-center" />
                                    <Badge variant="outline" className="bg-black/40">Processamento IA</Badge>
                                    <Separator orientation="horizontal" className="w-8 self-center" />
                                    <Badge variant="outline" className="bg-black/40">Ação Final</Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <SheetFooter className="pt-6 border-t border-white/10">
                        <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="mr-2 border-white/10 hover:bg-white/10">Cancelar</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                            <Save className="mr-2 h-4 w-4" /> Salvar
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
};
