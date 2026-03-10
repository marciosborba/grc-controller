import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

interface NewAuditProjectDialogProps {
    onProjectCreated: () => void;
    trigger?: React.ReactNode;
}

export function NewAuditProjectDialog({ onProjectCreated, trigger }: NewAuditProjectDialogProps) {
    const effectiveTenantId = useCurrentTenantId();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        titulo: '',
        codigo: '',
        descricao: '',
        area_auditada: '',
        prioridade: 'media',
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim_prevista: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const generateCode = () => {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 900) + 100;
        setFormData(prev => ({ ...prev, codigo: `AUD-${year}-${randomNum}` }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!effectiveTenantId) {
            toast.error('Erro de contexto', { description: 'Tenant não selecionado.' });
            return;
        }

        if (!formData.titulo || !formData.codigo) {
            toast.error('Campos obrigatórios', { description: 'Por favor, preencha o título e o código do projeto.' });
            return;
        }

        try {
            setLoading(true);

            const newProject = {
                tenant_id: effectiveTenantId,
                titulo: formData.titulo,
                codigo: formData.codigo,
                descricao: formData.descricao,
                area_auditada: formData.area_auditada,
                prioridade: formData.prioridade,
                data_inicio: formData.data_inicio,
                data_fim_prevista: formData.data_fim_prevista,
                status: 'planejamento',
                progresso_geral: 0,
                fase_atual: 'planejamento',
            };

            const { error } = await supabase
                .from('projetos_auditoria')
                .insert(newProject);

            if (error) throw error;

            toast.success('Projeto criado com sucesso!');
            setOpen(false);

            // Reset form
            setFormData({
                titulo: '',
                codigo: '',
                descricao: '',
                area_auditada: '',
                prioridade: 'media',
                data_inicio: new Date().toISOString().split('T')[0],
                data_fim_prevista: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            });

            onProjectCreated();

        } catch (error: any) {
            console.error('Erro ao criar projeto:', error);
            toast.error('Erro ao criar projeto', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Projeto
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] w-[95vw] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl">Novo Projeto de Auditoria</DialogTitle>
                    <DialogDescription className="text-sm">
                        Crie um novo projeto preenchendo as informações básicas abaixo.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="titulo">Título do Projeto *</Label>
                            <Input
                                id="titulo"
                                name="titulo"
                                placeholder="Ex: Auditoria Contábil 2026"
                                value={formData.titulo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="codigo">Código do Projeto *</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="codigo"
                                    name="codigo"
                                    placeholder="Ex: AUD-2026-001"
                                    value={formData.codigo}
                                    onChange={handleChange}
                                    required
                                />
                                <Button type="button" variant="outline" size="icon" onClick={generateCode} title="Gerar Código" className="shrink-0">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="prioridade">Prioridade</Label>
                            <Select value={formData.prioridade} onValueChange={(v) => handleSelectChange('prioridade', v)}>
                                <SelectTrigger id="prioridade">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="baixa">Baixa</SelectItem>
                                    <SelectItem value="media">Média</SelectItem>
                                    <SelectItem value="alta">Alta</SelectItem>
                                    <SelectItem value="critica">Crítica</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="area_auditada">Área Auditada</Label>
                            <Input
                                id="area_auditada"
                                name="area_auditada"
                                placeholder="Ex: Financeiro, TI, RH"
                                value={formData.area_auditada}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Status Inicial</Label>
                            <Input value="Planejamento" disabled className="bg-muted opacity-50" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="data_inicio">Data de Início Prevista</Label>
                            <Input
                                id="data_inicio"
                                name="data_inicio"
                                type="date"
                                value={formData.data_inicio}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="data_fim_prevista">Data de Fim Prevista</Label>
                            <Input
                                id="data_fim_prevista"
                                name="data_fim_prevista"
                                type="date"
                                value={formData.data_fim_prevista}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="descricao">Descrição / Escopo Inicial</Label>
                            <Textarea
                                id="descricao"
                                name="descricao"
                                placeholder="Detalhe o escopo e o propósito desta auditoria..."
                                value={formData.descricao}
                                onChange={handleChange}
                                className="h-20 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="w-full sm:w-auto">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Criando...' : 'Criar Projeto'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
