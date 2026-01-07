import React, { useState, useEffect, useCallback } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

const processSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    descricao: z.string().optional(),
    responsavel: z.string().optional(), // User ID
});

type Process = {
    id: string;
    nome: string;
    descricao: string | null;
    responsavel: string | null;
    created_at: string;
};

type UserProfile = {
    id: string;
    full_name: string | null;
    email: string | null;
};

export default function ProcessesManagement() {
    const { user } = useAuth();
    const selectedTenantId = useCurrentTenantId();
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    const [processes, setProcesses] = useState<Process[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<Process | null>(null);

    const form = useForm<z.infer<typeof processSchema>>({
        resolver: zodResolver(processSchema),
        defaultValues: {
            nome: '',
            descricao: '',
            responsavel: '',
        },
    });


    const loadProcesses = React.useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('processos')
                .select('*')
                .eq('tenant_id', effectiveTenantId)
                .order('nome');

            if (error) throw error;
            setProcesses(data || []);
        } catch (error) {
            console.error('Error loading processes:', error);
            toast.error('Erro ao carregar processos');
        }
    }, [effectiveTenantId]);

    const loadUsers = useCallback(async () => {
        try {
            // Fetch profiles that belong to the tenant (via user_roles or direct profile link if simplified)
            // Assuming profiles are global or linked via roles/tenant_id checks. 
            // For simplicity in this context, we often fetch profiles linked to the tenant.
            // Adjusting query to fetch profiles. 
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }, []);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        await Promise.all([loadProcesses(), loadUsers()]);
        setLoading(false);
    }, [loadProcesses, loadUsers]);

    useEffect(() => {
        if (effectiveTenantId) {
            loadData();
        }
    }, [effectiveTenantId, loadData]);

    useEffect(() => {
        if (editingProcess) {
            form.reset({
                nome: editingProcess.nome,
                descricao: editingProcess.descricao || '',
                responsavel: editingProcess.responsavel || '',
            });
        } else {
            form.reset({
                nome: '',
                descricao: '',
                responsavel: '',
            });
        }
    }, [editingProcess, form]);

    const onSubmit = async (values: z.infer<typeof processSchema>) => {
        try {
            const processData = {
                nome: values.nome,
                descricao: values.descricao,
                responsavel: values.responsavel || null,
                tenant_id: effectiveTenantId,
            };

            if (editingProcess) {
                const { error } = await supabase
                    .from('processos')
                    .update(processData)
                    .eq('id', editingProcess.id);

                if (error) throw error;
                toast.success('Processo atualizado com sucesso');
            } else {
                const { error } = await supabase
                    .from('processos')
                    .insert(processData);

                if (error) throw error;
                toast.success('Processo criado com sucesso');
            }

            setIsDialogOpen(false);
            setEditingProcess(null);
            loadProcesses();
        } catch (error) {
            console.error('Error saving process:', error);
            toast.error('Erro ao salvar processo');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este processo?')) return;

        try {
            const { error } = await supabase
                .from('processos')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Processo excluído com sucesso');
            loadProcesses();
        } catch (error) {
            console.error('Error deleting process:', error);
            toast.error('Erro ao excluir processo');
        }
    };

    const filteredProcesses = processes.filter(process =>
        process.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Gestão de Processos
                        </CardTitle>
                        <CardDescription>
                            Mapeamento e cadastro de processos de negócio
                        </CardDescription>
                    </div>
                    <Button onClick={() => {
                        setEditingProcess(null);
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Processo
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 mb-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar processos..."
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
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Responsável</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProcesses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Nenhum processo encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProcesses.map((process) => (
                                        <TableRow key={process.id}>
                                            <TableCell className="font-medium">{process.nome}</TableCell>
                                            <TableCell className="max-w-[300px] truncate" title={process.descricao || ''}>
                                                {process.descricao || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {users.find(u => u.id === process.responsavel)?.full_name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingProcess(process);
                                                            setIsDialogOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(process.id)}
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
                            <DialogTitle>{editingProcess ? 'Editar Processo' : 'Novo Processo'}</DialogTitle>
                            <DialogDescription>
                                Preencha os dados do processo de negócio.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="nome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Processo *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Gestão de Acessos" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="descricao"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Descreva o objetivo e escopo deste processo..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="responsavel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Responsável</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione um responsável" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.full_name || user.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        {editingProcess ? 'Salvar Alterações' : 'Criar Processo'}
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
