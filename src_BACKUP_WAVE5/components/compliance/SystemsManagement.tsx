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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormDescription } from "@/components/ui/form";
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Server,
    HelpCircle,
    Shield,
    Users,
    Globe,
    Lock,
    FileCode,
    Monitor,
    LayoutDashboard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

const systemSchema = z.object({
    nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    descricao: z.string().optional(),
    fornecedor: z.string().optional(),
    versao: z.string().optional(),
    tipo: z.enum(['SaaS', 'On-Premise', 'PaaS', 'IaaS', 'Legacy', 'Outro']).optional(),
    status: z.enum(['Ativo', 'Em Implementação', 'Descontinuado']).optional(),
    criticidade: z.enum(['Baixa', 'Média', 'Alta', 'Crítica']).optional(),
    responsavel_tecnico: z.string().optional(),
    responsavel_negocio: z.string().optional(),
    dados_sensiveis: z.boolean().default(false),
    autenticacao_sso: z.boolean().default(false),
    internet_facing: z.boolean().default(false),
    documentacao_link: z.string().optional(),
});

type System = {
    id: string;
    nome: string;
    descricao: string | null;
    fornecedor: string | null;
    versao: string | null;
    tipo?: 'SaaS' | 'On-Premise' | 'PaaS' | 'IaaS' | 'Legacy' | 'Outro' | null;
    status?: 'Ativo' | 'Em Implementação' | 'Descontinuado' | null;
    criticidade?: 'Baixa' | 'Média' | 'Alta' | 'Crítica' | null;
    responsavel_tecnico?: string | null;
    responsavel_negocio?: string | null;
    dados_sensiveis?: boolean;
    autenticacao_sso?: boolean;
    internet_facing?: boolean;
    documentacao_link?: string | null;
    created_at: string;
};

type UserProfile = {
    id: string;
    full_name: string | null;
    email: string | null;
};

export default function SystemsManagement() {
    const { user } = useAuth();
    const selectedTenantId = useCurrentTenantId();
    const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;

    const [systems, setSystems] = useState<System[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
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
            tipo: 'SaaS',
            status: 'Ativo',
            criticidade: 'Média',
            responsavel_tecnico: '',
            responsavel_negocio: '',
            dados_sensiveis: false,
            autenticacao_sso: false,
            internet_facing: false,
            documentacao_link: '',
        },
    });


    const loadUsers = React.useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email');

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }, []);

    const loadSystems = React.useCallback(async () => {
        try {
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
        }
    }, [effectiveTenantId]);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        await Promise.all([loadSystems(), loadUsers()]);
        setLoading(false);
    }, [loadSystems, loadUsers]);

    useEffect(() => {
        if (effectiveTenantId) {
            loadData();
        }
    }, [effectiveTenantId, loadData]);

    useEffect(() => {
        if (editingSystem) {
            form.reset({
                nome: editingSystem.nome,
                descricao: editingSystem.descricao || '',
                fornecedor: editingSystem.fornecedor || '',
                versao: editingSystem.versao || '',
                tipo: editingSystem.tipo || 'SaaS',
                status: editingSystem.status || 'Ativo',
                criticidade: editingSystem.criticidade || 'Média',
                responsavel_tecnico: editingSystem.responsavel_tecnico || '',
                responsavel_negocio: editingSystem.responsavel_negocio || '',
                dados_sensiveis: editingSystem.dados_sensiveis || false,
                autenticacao_sso: editingSystem.autenticacao_sso || false,
                internet_facing: editingSystem.internet_facing || false,
                documentacao_link: editingSystem.documentacao_link || '',
            });
        } else {
            form.reset({
                nome: '',
                descricao: '',
                fornecedor: '',
                versao: '',
                tipo: 'SaaS',
                status: 'Ativo',
                criticidade: 'Média',
                responsavel_tecnico: '',
                responsavel_negocio: '',
                dados_sensiveis: false,
                autenticacao_sso: false,
                internet_facing: false,
                documentacao_link: '',
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
                tipo: values.tipo,
                status: values.status,
                criticidade: values.criticidade,
                responsavel_tecnico: values.responsavel_tecnico || null,
                responsavel_negocio: values.responsavel_negocio || null,
                dados_sensiveis: values.dados_sensiveis,
                autenticacao_sso: values.autenticacao_sso,
                internet_facing: values.internet_facing,
                documentacao_link: values.documentacao_link,
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
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                        <HelpCircle className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Por que manter um Inventário de Sistemas?</DialogTitle>
                                        <DialogDescription className="space-y-4 pt-4 text-left">
                                            <p>
                                                <strong>Objetivo:</strong> Registrar todos os ativos de software (ERP, CRM, Banco de Dados) que suportam seu negócio para garantir que estão seguros e em conformidade.
                                            </p>

                                            <div className="bg-muted p-4 rounded-lg">
                                                <p className="font-semibold mb-2">Exemplo Prático:</p>
                                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                                    <li>
                                                        <strong>Cenário:</strong> Uma vulnerabilidade crítica é descoberta no "Windows Server 2019".
                                                    </li>
                                                    <li>
                                                        <strong>Nesta Aba (Sistemas):</strong> Você consulta rapidamente quais sistemas rodam nessa versão.
                                                    </li>
                                                    <li>
                                                        <strong>Na Aba Monitoramento:</strong> Você cria um controle "Patching Mensal" vinculado a estes sistemas.
                                                    </li>
                                                </ul>
                                            </div>

                                            <p className="text-sm text-muted-foreground">
                                                <strong>Benefício:</strong> Você não pode proteger o que você não sabe que existe. O inventário é o primeiro passo da Segurança da Informação.
                                            </p>
                                        </DialogDescription>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
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
                                    <TableHead>Tipo / Fornecedor</TableHead>
                                    <TableHead>Versão</TableHead>
                                    <TableHead>Responsável (Téc.)</TableHead>
                                    <TableHead>Status / Risco</TableHead>
                                    <TableHead className="w-[100px]">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSystems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum sistema encontrado
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSystems.map((system) => (
                                        <TableRow key={system.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                                    {system.nome}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{system.tipo || 'SaaS'}</span>
                                                    <span className="text-xs text-muted-foreground">{system.fornecedor || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{system.versao || '-'}</TableCell>
                                            <TableCell>
                                                {users.find(u => u.id === system.responsavel_tecnico)?.full_name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 items-start">
                                                    <Badge variant="outline" className={
                                                        system.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                                            system.status === 'Em Implementação' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                                                system.status === 'Descontinuado' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                    }>
                                                        {system.status || 'Ativo'}
                                                    </Badge>
                                                    {system.criticidade && (
                                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${system.criticidade === 'Crítica' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                            system.criticidade === 'Alta' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                                system.criticidade === 'Média' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                            }`}>
                                                            {system.criticidade}
                                                        </span>
                                                    )}
                                                </div>
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
                    <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingSystem ? 'Editar Sistema' : 'Novo Sistema'}</DialogTitle>
                            <DialogDescription>
                                Inventário de ativos de software e aplicações.
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
                                            <Shield className="h-4 w-4" />
                                            Detalhes e Segurança
                                        </TabsTrigger>
                                        <TabsTrigger value="responsaveis" className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Responsáveis
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="geral" className="space-y-6 py-4">
                                        <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                                                <h3 className="font-semibold text-lg">Identificação</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="nome"
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-2">
                                                            <FormLabel>Nome do Sistema *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: SAP ERP, Salesforce, AWS" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

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
                                                            <FormLabel>Versão Atual</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Ex: v14.2, 2024.1" {...field} />
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
                                                        <FormLabel>Tipo de Deployment</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione o tipo" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="SaaS">SaaS (Cloud)</SelectItem>
                                                                <SelectItem value="On-Premise">On-Premise (Local)</SelectItem>
                                                                <SelectItem value="PaaS">PaaS</SelectItem>
                                                                <SelectItem value="IaaS">IaaS</SelectItem>
                                                                <SelectItem value="Legacy">Legado</SelectItem>
                                                                <SelectItem value="Outro">Outro</SelectItem>
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
                                                        <FormLabel>Status Operacional</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Selecione o status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Ativo">Ativo</SelectItem>
                                                                <SelectItem value="Em Implementação">Em Implementação</SelectItem>
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
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="dados_sensiveis"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-base flex items-center gap-2">
                                                                <Lock className="h-4 w-4" />
                                                                Dados Sensíveis
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Armazena PII/LGPD?
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="internet_facing"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-base flex items-center gap-2">
                                                                <Globe className="h-4 w-4" />
                                                                Internet Facing
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Acessível publicamente?
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="autenticacao_sso"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                        <div className="space-y-0.5">
                                                            <FormLabel className="text-base flex items-center gap-2">
                                                                <Users className="h-4 w-4" />
                                                                SSO Integrado
                                                            </FormLabel>
                                                            <FormDescription>
                                                                Login único corporativo?
                                                            </FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="descricao"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Descrição Técnica / Funcional</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Detalhes sobre arquitetura, módulos principais e finalidade do sistema..."
                                                            className="resize-none min-h-[100px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="documentacao_link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Link para Documentação / Arquitetura</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <FileCode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input className="pl-9" placeholder="https://confluence.empresa.com/display/SIS/Architecture" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="responsaveis" className="space-y-6 py-4">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-5 w-5 text-amber-600" />
                                                    <h3 className="font-semibold text-lg text-amber-900">Criticidade e Impacto</h3>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="criticidade"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Nível de Criticidade</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione a criticidade" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="Baixa">Baixa (Ferramentas  auxiliares)</SelectItem>
                                                                    <SelectItem value="Média">Média (Impacto departamental)</SelectItem>
                                                                    <SelectItem value="Alta">Alta (Impacto financeiro/regulatório)</SelectItem>
                                                                    <SelectItem value="Crítica">Crítica (Core Business - Parada total)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormDescription>
                                                                Define o RTO/RPO e prioridade de recuperação.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="responsavel_tecnico"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Responsável Técnico (Tech Owner)</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                value={field.value || undefined}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione o owner técnico" />
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
                                                            <FormDescription>Quem responde por bugs, updates e infra?</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="responsavel_negocio"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Responsável de Negócio (Biz Owner)</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                value={field.value || undefined}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Selecione o owner de negócio" />
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
                                                            <FormDescription>Quem define requisitos e aprova mudanças?</FormDescription>
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
