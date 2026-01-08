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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    FormDescription,
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
import { Separator } from "@/components/ui/separator";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    FileText,
    HelpCircle,
    LayoutDashboard,
    ScrollText,
    ShieldCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

const processSchema = z.object({
    nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    macro_processo: z.string().optional(),
    descricao: z.string().optional(),
    objetivo: z.string().optional(),
    entradas: z.string().optional(),
    saidas: z.string().optional(),
    frequencia: z.enum(['Diária', 'Semanal', 'Mensal', 'Trimestral', 'Anual', 'Sob Demanda']).optional(),
    responsavel: z.string().optional(), // User ID
    aprovador: z.string().optional(), // User ID
    departamento: z.string().optional(),
    criticidade: z.enum(['Baixa', 'Média', 'Alta', 'Crítica']).optional(),
    tipo: z.enum(['Operacional', 'Gerencial', 'Suporte', 'Estratégico']).optional(),
    status: z.enum(['Ativo', 'Em Revisão', 'Descontinuado']).optional(),
    documentacao_referencia: z.string().optional(),
});

type Process = {
    id: string;
    nome: string;
    macro_processo?: string | null;
    descricao: string | null;
    objetivo?: string | null;
    entradas?: string | null;
    saidas?: string | null;
    frequencia?: 'Diária' | 'Semanal' | 'Mensal' | 'Trimestral' | 'Anual' | 'Sob Demanda' | null;
    responsavel: string | null;
    aprovador?: string | null;
    departamento?: string | null;
    criticidade?: 'Baixa' | 'Média' | 'Alta' | 'Crítica' | null;
    tipo?: 'Operacional' | 'Gerencial' | 'Suporte' | 'Estratégico' | null;
    status?: 'Ativo' | 'Em Revisão' | 'Descontinuado' | null;
    documentacao_referencia?: string | null;
    created_at: string;
    monitors_count?: number;
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
            macro_processo: '',
            descricao: '',
            objetivo: '',
            entradas: '',
            saidas: '',
            frequencia: 'Mensal',
            responsavel: '',
            aprovador: '',
            departamento: '',
            criticidade: 'Média',
            tipo: 'Operacional',
            status: 'Ativo',
            documentacao_referencia: '',
        },
    });


    const loadProcesses = React.useCallback(async () => {
        try {
            // Fetch processes
            const { data: processesData, error: processesError } = await supabase
                .from('processos')
                .select('*')
                .eq('tenant_id', effectiveTenantId)
                .order('nome');

            if (processesError) throw processesError;

            // Fetch monitoring items for processes
            const { data: monitorsData, error: monitorsError } = await supabase
                .from('monitoramento_conformidade')
                .select('objeto_id')
                .eq('tenant_id', effectiveTenantId)
                .eq('tipo_objeto', 'processo');

            if (monitorsError) console.error('Error fetching monitors:', monitorsError);

            // Calculate counts
            const counts = (monitorsData || []).reduce((acc: { [key: string]: number }, item) => {
                if (item.objeto_id) {
                    acc[item.objeto_id] = (acc[item.objeto_id] || 0) + 1;
                }
                return acc;
            }, {});

            const processedData = (processesData || []).map(p => ({
                ...p,
                monitors_count: counts[p.id] || 0
            }));

            setProcesses(processedData);
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
                macro_processo: editingProcess.macro_processo || '',
                descricao: editingProcess.descricao || '',
                objetivo: editingProcess.objetivo || '',
                entradas: editingProcess.entradas || '',
                saidas: editingProcess.saidas || '',
                frequencia: editingProcess.frequencia || 'Mensal',
                responsavel: editingProcess.responsavel || '',
                aprovador: editingProcess.aprovador || '',
                departamento: editingProcess.departamento || '',
                criticidade: editingProcess.criticidade || 'Média',
                tipo: editingProcess.tipo || 'Operacional',
                status: editingProcess.status || 'Ativo',
                documentacao_referencia: editingProcess.documentacao_referencia || '',
            });
        } else {
            form.reset({
                nome: '',
                macro_processo: '',
                descricao: '',
                objetivo: '',
                entradas: '',
                saidas: '',
                frequencia: 'Mensal',
                responsavel: '',
                aprovador: '',
                departamento: '',
                criticidade: 'Média',
                tipo: 'Operacional',
                status: 'Ativo',
                documentacao_referencia: '',
            });
        }
    }, [editingProcess, form]);

    const onSubmit = async (values: z.infer<typeof processSchema>) => {
        try {
            const processData = {
                nome: values.nome,
                macro_processo: values.macro_processo,
                descricao: values.descricao,
                objetivo: values.objetivo,
                entradas: values.entradas,
                saidas: values.saidas,
                frequencia: values.frequencia,
                responsavel: values.responsavel || null,
                aprovador: values.aprovador || null,
                departamento: values.departamento || null,
                criticidade: values.criticidade,
                tipo: values.tipo,
                status: values.status,
                documentacao_referencia: values.documentacao_referencia,
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
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                        <HelpCircle className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Para que serve a Gestão de Processos?</DialogTitle>
                                        <DialogDescription className="space-y-4 pt-4 text-left">
                                            <p>
                                                <strong>Objetivo:</strong> Mapear <em>o que</em> sua empresa faz (os processos de negócio) para que você possa identificar onde estão os riscos.
                                            </p>

                                            <div className="bg-muted p-4 rounded-lg">
                                                <p className="font-semibold mb-2">Exemplo Prático:</p>
                                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                                    <li>
                                                        <strong>Cenário:</strong> Sua empresa contrata um novo funcionário.
                                                    </li>
                                                    <li>
                                                        <strong>Nesta Aba (Processos):</strong> Você cadastra o processo <em>"Admissão de Funcionários"</em>.
                                                    </li>
                                                    <li>
                                                        <strong>Na Aba Monitoramento:</strong> Você cria um controle para verificar se <em>"Todos os novos funcionários assinaram o NDA"</em> e o vincula a este processo.
                                                    </li>
                                                </ul>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                <strong>Benefício:</strong> Se o monitoramento falhar, você sabe exatamente qual área do negócio está em risco (a Admissão), facilitando a correção.
                                            </p>
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </CardTitle>
                        <CardDescription>
                            Mapeamento e cadastro de processos de negócio
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => {
                            setEditingProcess(null);
                            setIsDialogOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Processo
                        </Button>
                    </div>
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
                                    <TableHead>Depto / Tipo</TableHead>
                                    <TableHead>Responsável</TableHead>
                                    <TableHead>Criticidade</TableHead>
                                    <TableHead>Monitoramento</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProcesses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum processo encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProcesses.map((process) => (
                                        <TableRow key={process.id}>
                                            <TableCell className="font-medium">
                                                <div>{process.nome}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={process.descricao || ''}>{process.descricao}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-medium">{process.departamento || '-'}</span>
                                                    <span className="text-xs text-muted-foreground">{process.tipo || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {users.find(u => u.id === process.responsavel)?.full_name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {process.criticidade && (
                                                    <Badge variant={
                                                        process.criticidade === 'Crítica' ? 'destructive' :
                                                            process.criticidade === 'Alta' ? 'default' :
                                                                process.criticidade === 'Média' ? 'secondary' : 'outline'
                                                    }>
                                                        {process.criticidade}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {process.monitors_count && process.monitors_count > 0 ? (
                                                    <div className="flex items-center text-blue-600 font-medium">
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        {process.monitors_count} controles
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Nenhum controle</span>
                                                )}
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
                    <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProcess ? 'Editar Processo' : 'Novo Processo'}</DialogTitle>
                            <DialogDescription>
                                Preencha os dados do processo de negócio.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <Tabs defaultValue="geral" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="geral" className="flex items-center gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Visão Geral
                                        </TabsTrigger>
                                        <TabsTrigger value="detalhes" className="flex items-center gap-2">
                                            <ScrollText className="h-4 w-4" />
                                            Detalhes e Fluxo
                                        </TabsTrigger>
                                        <TabsTrigger value="governanca" className="flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" />
                                            Governança
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="geral" className="space-y-6 py-4">
                                        <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-1 bg-primary rounded-full" />
                                                <h3 className="font-semibold text-lg">Identificação do Processo</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="nome"
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-2">
                                                            <FormLabel>Nome do Processo *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: Gestão de Acessos e Identidades" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="macro_processo"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Macro Processo</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: Segurança da Informação" {...field} />
                                                            </FormControl>
                                                            <FormDescription className="text-xs">Processo pai ou categoria maior</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="departamento"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Departamento</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: TI / Segurança" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="tipo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tipo de Processo</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione o tipo" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Operacional">Operacional</SelectItem>
                                                                <SelectItem value="Gerencial">Gerencial</SelectItem>
                                                                <SelectItem value="Suporte">Suporte</SelectItem>
                                                                <SelectItem value="Estratégico">Estratégico</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Status</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione o status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Ativo">Ativo</SelectItem>
                                                                <SelectItem value="Em Revisão">Em Revisão</SelectItem>
                                                                <SelectItem value="Descontinuado">Descontinuado</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="detalhes" className="space-y-6 py-4">
                                        <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-1 bg-blue-500 rounded-full" />
                                                <h3 className="font-semibold text-lg">Definição do Escopo</h3>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="objetivo"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Objetivo do Processo</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Qual o propósito principal deste processo? Que resultado ele busca atingir?"
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
                                                name="descricao"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Descrição Detalhada</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Descreva o passo a passo, principais atividades e regras de negócio..."
                                                                className="resize-none min-h-[100px]"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-sm text-foreground/80 flex items-center gap-2">
                                                    Entradas (Inputs)
                                                </h4>
                                                <FormField
                                                    control={form.control}
                                                    name="entradas"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="O que inicia este processo? (Ex: Solicitação de serviço, e-mail do cliente)"
                                                                    className="resize-none h-32 bg-slate-50/50"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-semibold text-sm text-foreground/80 flex items-center gap-2">
                                                    Saídas (Outputs)
                                                </h4>
                                                <FormField
                                                    control={form.control}
                                                    name="saidas"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="O que é entregue ao final? (Ex: Relatório, aprovação no sistema, pagamento)"
                                                                    className="resize-none h-32 bg-slate-50/50"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <FormField
                                            control={form.control}
                                            name="documentacao_referencia"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Links ou Referências (Documentação)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input className="pl-9" placeholder="URL do SharePoint, Drive, Notion ou código do documento normativo" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>Link para fluxogramas detalhados ou políticas relacionadas.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="governanca" className="space-y-6 py-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Coluna 1: Classificação */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 border-b pb-2">
                                                    <div className="h-6 w-1 bg-amber-500 rounded-full" />
                                                    <h3 className="font-semibold text-md">Classificação de Risco</h3>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="criticidade"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Criticidade para o Negócio</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione a criticidade" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Baixa">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="h-2 w-2 rounded-full bg-slate-400" />
                                                                            Baixa
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="Média">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                                            Média
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="Alta">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                                            Alta
                                                                        </div>
                                                                    </SelectItem>
                                                                    <SelectItem value="Crítica">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="h-2 w-2 rounded-full bg-red-600" />
                                                                            Crítica
                                                                        </div>
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription>Impacto no negócio em caso de falha.</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="frequencia"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Frequência de Execução</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione a frequência" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Diária">Diária</SelectItem>
                                                                    <SelectItem value="Semanal">Semanal</SelectItem>
                                                                    <SelectItem value="Mensal">Mensal</SelectItem>
                                                                    <SelectItem value="Trimestral">Trimestral</SelectItem>
                                                                    <SelectItem value="Anual">Anual</SelectItem>
                                                                    <SelectItem value="Sob Demanda">Sob Demanda</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Coluna 2: Responsabilidades */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2 border-b pb-2">
                                                    <div className="h-6 w-1 bg-green-500 rounded-full" />
                                                    <h3 className="font-semibold text-md">Responsabilidades</h3>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="responsavel"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Proprietário do Processo (Owner)</FormLabel>
                                                            <div className="flex gap-2">
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                    value={field.value || undefined}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger className="w-full">
                                                                            <SelectValue placeholder="Selecione o owner" />
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
                                                                <Button type="button" variant="outline" size="icon" title="Adicionar novo usuário (placeholder)">
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <FormDescription>Responsável pela manutenção e execução.</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="aprovador"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Aprovador / Gerente</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                value={field.value || undefined}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione o aprovador" />
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
                                                            <FormDescription>Responsável por validar mudanças.</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

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
        </Card >
    );
}
