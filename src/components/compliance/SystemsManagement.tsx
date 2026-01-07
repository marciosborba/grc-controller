import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search, Server } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

const systemSchema = z.object({
    nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    descricao: z.string().optional(),
    fornecedor: z.string().optional(),
    versao: z.string().optional(),
});

type System = {
    id: string;
    nome: string;
    descricao: string | null;
    fornecedor: string | null;
    versao: string | null;
    created_at: string;
};

export default function SystemsManagement() {
    const { user } = useAuth();
    const selectedTenantId = useCurrentTenantId();
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    const [systems, setSystems] = useState<System[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSystem, setEditingSystem] = useState<System | null>(null);

    const form = useForm<z.infer<typeof systemSchema>>({
        resolver: zodResolver(systemSchema),
        defaultValues: {
            nome: '',
            descricao: '',
            fornecedor: '',
            versao: '',
        },
    });


    const loadSystems = React.useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('sistemas')
                .select('*')
                .eq('tenant_id', effectiveTenantId)
                .order('nome');

            if (error) throw error;
            setSystems(data || []);
        } catch (error) {
            console.error('Error loading systems:', error);
            toast.error('Erro ao carregar sistemas');
        } finally {
            setLoading(false);
        }
    }, [effectiveTenantId]);

    useEffect(() => {
        if (effectiveTenantId) {
            loadSystems();
        }
    }, [effectiveTenantId, loadSystems]);

    useEffect(() => {
        if (editingSystem) {
            form.reset({
                nome: editingSystem.nome,
                descricao: editingSystem.descricao || '',
                fornecedor: editingSystem.fornecedor || '',
                versao: editingSystem.versao || '',
            });
        } else {
            form.reset({
                nome: '',
                descricao: '',
                fornecedor: '',
                versao: '',
            });
        }
    }, [editingSystem, form]);

    const onSubmit = async (values: z.infer<typeof systemSchema>) => {
        try {
            const systemData = {
                nome: values.nome,
                descricao: values.descricao,
                fornecedor: values.fornecedor,
                versao: values.versao,
                tenant_id: effectiveTenantId,
            };

            if (editingSystem) {
                const { error } = await supabase
                    .from('sistemas')
                    .update(systemData)
                    .eq('id', editingSystem.id);

                if (error) throw error;
                toast.success('Sistema atualizado com sucesso');
            } else {
                const { error } = await supabase
                    .from('sistemas')
                    .insert(systemData);

                if (error) throw error;
                toast.success('Sistema criado com sucesso');
            }

            setIsDialogOpen(false);
            setEditingSystem(null);
            loadSystems();
        } catch (error) {
            console.error('Error saving system:', error);
            toast.error('Erro ao salvar sistema');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este sistema?')) return;

        try {
            const { error } = await supabase
                .from('sistemas')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Sistema excluído com sucesso');
            loadSystems();
        } catch (error) {
            console.error('Error deleting system:', error);
            toast.error('Erro ao excluir sistema');
        }
    };

    const filteredSystems = systems.filter(system =>
        system.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (system.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Server className="h-5 w-5 text-indigo-600" />
                            Inventário de Sistemas
                        </CardTitle>
                        <CardDescription>
                            Cadastro de sistemas e aplicações
                        </CardDescription>
                    </div>
                    <Button onClick={() => {
                        setEditingSystem(null);
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Sistema
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar sistemas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Fornecedor</TableHead>
                                    <TableHead>Versão</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSystems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum sistema encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSystems.map((system) => (
                                        <TableRow key={system.id}>
                                            <TableCell className="font-medium">{system.nome}</TableCell>
                                            <TableCell>{system.fornecedor || '-'}</TableCell>
                                            <TableCell>{system.versao || '-'}</TableCell>
                                            <TableCell className="max-w-[300px] truncate" title={system.descricao || ''}>
                                                {system.descricao || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingSystem(system);
                                                            setIsDialogOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(system.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingSystem ? 'Editar Sistema' : 'Novo Sistema'}</DialogTitle>
                            <DialogDescription>
                                Registre as informações do sistema ou aplicação.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Sistema *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: SAP ERP, Salesforce" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fornecedor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fornecedor</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: SAP, Microsoft" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="versao"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Versão</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: v14.2" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="descricao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Detalhes sobre o uso e criticidade..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        {editingSystem ? 'Salvar Alterações' : 'Criar Sistema'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
