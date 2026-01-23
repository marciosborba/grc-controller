import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import {
    Brain,
    Settings,
    Cpu,
    MessageSquare,
    Workflow,
    BarChart3,
    Plus,
    Zap,
    Shield,
    Activity,
    ArrowUpRight,
    BookOpen,
    Bot,
    Lock,
    TrendingUp,
    CheckCircle,
    Info,
    ChevronRight,
    RefreshCw,
    Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AIPromptsTab } from './tabs/AIPromptsTab';
import { AIWorkflowsTab } from './tabs/AIWorkflowsTab';
import { AIFunctionMappingTab } from './tabs/AIFunctionMappingTab';


import { AIUsageTab } from './tabs/AIUsageTab';
import { AISettingsTabContent } from './tabs/AISettingsTabContent';
import { AIPromptTemplate, AIWorkflow, aiConfigService } from '@/services/aiConfigService';
import { AIProviderModal } from './modals/AIProviderModal';
import { Pencil, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AIProvider {
    id: string;
    name: string;
    provider_type: string;
    model_name: string;
    is_active: boolean;
    is_primary: boolean;
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    tokens_used_today: number;
    cost_usd_today: number;
}

interface AIUsageLog {
    id: string;
    created_at: string;
    tokens_input: number;
    tokens_output: number;
    cost_usd: number;
}

interface AIManagerCoreProps {
    tenantId: string;
    mode: 'platform' | 'tenant';
    readonly?: boolean;
}

const AIManagerCore: React.FC<AIManagerCoreProps> = ({ tenantId, mode, readonly = false }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);
    const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
    const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Modals State ---
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

    // --- Delete State ---
    const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

    // --- Data Loading ---
    const loadAIData = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            console.log(`🔄 [AI MANAGER CORE] Carregando dados para tenant: ${tenantId} (Modo: ${mode})`);

            // 1. Providers Logic (Local + Global Fallback)
            let finalProviders: any[] = [];

            if (mode === 'platform') {
                // Platform Admin: Sees only Global Providers
                const { data } = await supabase
                    .from('ai_grc_providers')
                    .select('*')
                    .is('tenant_id', null)
                    .order('created_at', { ascending: false });
                finalProviders = data || [];
            } else {
                // Tenant: Sees Local Providers + Global Providers (Read-only)
                const { data: localData } = await supabase
                    .from('ai_grc_providers')
                    .select('*')
                    .eq('tenant_id', tenantId)
                    .order('created_at', { ascending: false });

                const { data: globalData } = await supabase
                    .from('ai_grc_providers')
                    .select('*')
                    .is('tenant_id', null)
                    .eq('is_active', true); // Tenant only sees ACTIVE global providers

                finalProviders = [
                    ...(localData || []),
                    ...(globalData || [])
                ];
            }

            const provData = finalProviders;

            setProviders((provData || []).map(p => ({
                ...p,
                total_requests: p.total_requests || 0,
                successful_requests: p.successful_requests || 0,
                failed_requests: p.failed_requests || 0,
                tokens_used_today: p.tokens_used_today || 0,
                cost_usd_today: 0
            })));

            // 2. Prompts
            const { data: promptData } = await supabase
                .from('ai_grc_prompt_templates')
                .select('*')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false });
            setPrompts(promptData || []);

            // 3. Workflows
            const { data: wfData } = await supabase
                .from('ai_workflows')
                .select('id, name, is_active, status, tenant_id')
                .eq('tenant_id', tenantId)
                .order('created_at', { ascending: false });
            setWorkflows(wfData || []);

            // 4. Usage Logs (Today)
            const today = new Date().toISOString().split('T')[0];
            const { data: usageData } = await supabase
                .from('ai_usage_logs')
                .select('id, created_at, tokens_input, tokens_output, cost_usd')
                .eq('tenant_id', tenantId)
                .gte('created_at', today);
            setUsageLogs(usageData || []);

        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            toast.error('Erro ao carregar dados do módulo IA');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProvider = async () => {
        if (!providerToDelete) return;
        try {
            await aiConfigService.deleteProvider(providerToDelete);
            toast.success('Provedor removido com sucesso');
            setProviderToDelete(null);
            loadAIData();
        } catch (err) {
            toast.error('Erro ao remover provedor');
        }
    };

    useEffect(() => {
        loadAIData();
    }, [tenantId]);

    // --- Stats Calculation ---
    const activeProviders = providers.filter(p => p.is_active);
    const activePrompts = prompts.filter(p => p.is_active);
    const activeWorkflows = workflows.filter(w => w.is_active);
    const totalRequests = usageLogs.length;
    const totalTokens = usageLogs.reduce((acc, log) => acc + (log.tokens_input || 0) + (log.tokens_output || 0), 0);
    const totalCost = usageLogs.reduce((acc, log) => acc + (log.cost_usd || 0), 0);

    const getProviderNames = () => {
        if (activeProviders.length === 0) return 'Nenhum ativo';
        if (activeProviders.length <= 3) {
            return activeProviders.map(p => {
                const type = p.provider_type?.toLowerCase() || '';
                if (type.includes('glm')) return 'GLM';
                if (type.includes('claude')) return 'Claude';
                if (type.includes('openai')) return 'OpenAI';
                if (type.includes('azure')) return 'Azure';
                return p.name || type;
            }).join(', ');
        }
        return `${activeProviders.length} provedores`;
    };

    // Calculate Score
    const calculateComplianceScore = () => {
        let score = 0;
        if (activeProviders.length > 0) score += 30;
        if (activePrompts.length > 0) score += 20;
        if (activeWorkflows.length > 0) score += 20;
        if (totalRequests > 0) score += 15;
        if (usageLogs.length > 0) score += 15;
        return score;
    };
    const complianceScore = calculateComplianceScore();

    // Quick Actions
    const quickActions = [
        {
            title: 'Configurar Provedores',
            description: 'Gerenciar Claude, OpenAI e outros provedores',
            icon: Cpu,
            color: 'blue',
            action: () => { setActiveTab('providers'); setShowProviderModal(true); },
            count: providers.length
        },
        {
            title: 'Templates de Prompts',
            description: 'Criar prompts especializados para GRC',
            icon: MessageSquare,
            color: 'purple',
            action: () => { setActiveTab('prompts'); },
            count: prompts.length
        },
        {
            title: 'Workflows de Automação',
            description: 'Automatizar análises e relatórios',
            icon: Workflow,
            color: 'green',
            action: () => setActiveTab('workflows'),
            count: workflows.length
        },
        {
            title: 'Estatísticas de Uso',
            description: 'Monitorar custos e performance',
            icon: BarChart3,
            color: 'orange',
            action: () => setActiveTab('usage'),
            count: totalRequests
        },
        {
            title: 'Mapeamento de Funções',
            description: 'Definir prompts por função (Auditoria, Risco, etc)',
            icon: Brain,
            color: 'pink',
            action: () => setActiveTab('mappings'),
            count: 0
        },
        {
            title: 'Configurações IA',
            description: 'Configurações gerais do sistema',
            icon: Settings,
            color: 'gray',
            action: () => setActiveTab('settings'),
            count: 0
        },
        {
            title: 'Auditoria e Logs',
            description: 'Histórico de atividades da IA',
            icon: Shield,
            color: 'red',
            action: () => setActiveTab('usage'), // Mapping Audit to Usage or separate tab if exists
            count: usageLogs.length
        }
    ];

    if (loading && providers.length === 0) {
        return (
            <div className="container mx-auto py-6">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Carregando módulo de IA...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans selection:bg-primary/30 space-y-8">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg border bg-card border-border shadow-sm">
                            <Brain className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Gestão de IA
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                {mode === 'platform'
                                    ? 'Configuração e gerenciamento de assistentes IA da plataforma (Global)'
                                    : 'Configuração e gerenciamento de assistentes IA para esta organização'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    {mode === 'platform' && (
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1">
                            <Shield className="w-3 h-3 mr-1" />
                            Platform Admin
                        </Badge>
                    )}
                    {mode === 'tenant' && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1">
                            <Globe className="w-3 h-3 mr-1" />
                            Tenant
                        </Badge>
                    )}
                    <Badge variant="secondary" className="px-3 py-1 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" />
                        Score: {complianceScore}%
                    </Badge>
                    <Button size="sm" variant="outline" onClick={loadAIData} disabled={loading} className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* --- ALERT INFO --- */}
            <Alert className="border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle>Centro de Gestão de IA</AlertTitle>
                <AlertDescription>
                    Configure e monitore todos os assistentes IA da plataforma GRC. Gerencie provedores, prompts personalizados e workflows automatizados.
                </AlertDescription>
            </Alert>

            {/* --- TABS --- */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <div className="border-b border-border pb-4 w-full">
                    <TabsList className="w-full justify-start overflow-x-auto h-auto rounded-lg bg-muted/50 p-1">
                        {[
                            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                            { id: 'providers', label: 'Provedores', icon: Cpu },
                            { id: 'prompts', label: 'Prompts', icon: MessageSquare },
                            { id: 'workflows', label: 'Workflows', icon: Workflow },
                            { id: 'mappings', label: 'Mapeamento', icon: Brain },
                            { id: 'usage', label: 'Uso', icon: Zap },
                            { id: 'settings', label: 'Configurações', icon: Settings },
                        ].map(tab => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="flex gap-2 px-4 py-2"
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* --- CONTENT: OVERVIEW --- */}
                <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Metrics Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="p-4 h-full">
                                <div className="flex flex-col h-full min-h-[100px] sm:min-h-[120px] text-center">
                                    <div className="flex justify-center mb-1 sm:mb-2">
                                        <Cpu className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Provedores Ativos</p>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="text-2xl font-bold text-foreground mb-1">{activeProviders.length}</p>
                                        <p className="text-xs text-muted-foreground">{getProviderNames()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 h-full">
                                <div className="flex flex-col h-full min-h-[100px] sm:min-h-[120px] text-center">
                                    <div className="flex justify-center mb-1 sm:mb-2">
                                        <MessageSquare className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Prompts Ativos</p>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="text-2xl font-bold text-foreground mb-1">{activePrompts.length}</p>
                                        <p className="text-xs text-muted-foreground">{prompts.length} total configurados</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 h-full">
                                <div className="flex flex-col h-full min-h-[100px] sm:min-h-[120px] text-center">
                                    <div className="flex justify-center mb-1 sm:mb-2">
                                        <Workflow className="h-5 w-5 text-green-500" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Workflows Ativos</p>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="text-2xl font-bold text-foreground mb-1">{activeWorkflows.length}</p>
                                        <p className="text-xs text-muted-foreground">{workflows.length} total | {activeWorkflows.length} executando</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 h-full">
                                <div className="flex flex-col h-full min-h-[100px] sm:min-h-[120px] text-center">
                                    <div className="flex justify-center mb-1 sm:mb-2">
                                        <BarChart3 className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Requisições Hoje</p>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="text-2xl font-bold text-foreground mb-1">{totalRequests}</p>
                                        <p className="text-xs text-muted-foreground">{totalTokens.toLocaleString()} tokens | ${totalCost.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions Grid */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-foreground">Funcionalidades</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quickActions.map((action, index) => (
                                <Card key={index} className="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group relative overflow-hidden" onClick={action.action}>
                                    <CardHeader className="p-4 md:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className={`p-2 rounded-lg bg-${action.color}-500/10`}>
                                                <action.icon className={`w-5 h-5 text-${action.color}-500`} />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {action.count > 0 && (
                                                    <Badge variant="secondary" className="text-xs px-2 py-0.5">{action.count}</Badge>
                                                )}
                                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </div>
                                        </div>
                                        <CardTitle className="text-base mt-3 mb-1 group-hover:text-primary transition-colors">{action.title}</CardTitle>
                                        <CardDescription className="text-xs">{action.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Score & System Status */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Score de Configuração IA
                                </CardTitle>
                                <CardDescription>
                                    Avaliação do estado de configuração dos sistemas de IA
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Configuração Geral</span>
                                        <span>{complianceScore}%</span>
                                    </div>
                                    <Progress value={complianceScore} className="h-2" />
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Provedores Configurados</span>
                                        </div>
                                        <Badge variant="outline">{providers.length}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-4 h-4 text-purple-500" />
                                            <span>Templates de Prompts</span>
                                        </div>
                                        <Badge variant="outline">{prompts.length}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Workflow className="w-4 h-4 text-green-500" />
                                            <span>Workflows Ativos</span>
                                        </div>
                                        <Badge variant="outline">{activeWorkflows.length}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Status do Sistema
                                </CardTitle>
                                <CardDescription>
                                    Verificações de segurança e integridade
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium">Criptografia de Chaves</span>
                                        <p className="text-xs text-muted-foreground">API keys protegidas</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">Ativo</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium">Isolamento por Tenant</span>
                                        <p className="text-xs text-muted-foreground">RLS ativo</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-200">Ativo</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium">Monitoramento</span>
                                        <p className="text-xs text-muted-foreground">Métricas em tempo real</p>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-200">Disponível</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </TabsContent>

                {/* --- CONTENT: PROVIDERS --- */}
                <TabsContent value="providers" className="space-y-6">
                    <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border">
                        <div>
                            <h3 className="text-xl font-bold">Provedores de IA</h3>
                            <p className="text-muted-foreground text-sm">Gerencie as conexões com LLMs para este tenant.</p>
                        </div>
                        {!readonly && (
                            <Button onClick={() => { setModalMode('create'); setShowProviderModal(true); }}>
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Provedor
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {providers.map(provider => (
                            <Card key={provider.id} className="hover:shadow-md transition-all">
                                <CardHeader className="flex flex-row items-start justify-between pb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                            {provider.provider_type === 'openai' ? <Bot className="h-6 w-6" /> : <Cpu className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{provider.name}</CardTitle>
                                            <CardDescription className="text-xs">{provider.model_name}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={provider.is_active ? "default" : "secondary"}>
                                        {provider.is_active ? "Ativo" : "Inativo"}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 text-sm mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Origem:</span>
                                            {provider.tenant_id ? (
                                                <Badge variant="outline" className="text-xs">Local</Badge>
                                            ) : (
                                                <Badge className="bg-purple-500/10 text-purple-600 border-purple-200 text-xs hover:bg-purple-500/20">Global (Fallback)</Badge>
                                            )}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tipo:</span>
                                            <span className="uppercase font-mono text-xs bg-muted px-2 py-0.5 rounded">{provider.provider_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Requisições:</span>
                                            <span>{provider.total_requests}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tokens Hoje:</span>
                                            <span>{provider.tokens_used_today}</span>
                                        </div>
                                    </div>
                                    {!readonly && (
                                        <div className="mt-4 pt-4 border-t flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => toast.info('Teste de conexão simulado')}>Testar</Button>

                                            {/* Only show Edit/Delete if it's a Local provider OR if we are in Platform mode */}
                                            {(provider.tenant_id || mode === 'platform') && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setSelectedProvider(provider); setShowProviderModal(true); }}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => setProviderToDelete(provider.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}

                                            {/* Read-only info for Global providers in Tenant mode */}
                                            {!provider.tenant_id && mode !== 'platform' && (
                                                <div className="ml-auto">
                                                    <Lock className="h-4 w-4 text-muted-foreground opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {providers.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-dashed rounded-xl bg-muted/20">
                                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Plus className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium">Nenhum provedor configurado</h3>
                                <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                                    {mode === 'tenant'
                                        ? 'Atualmente utilizando os provedores globais da plataforma (Fallback).'
                                        : 'Nenhum provedor mestre configurado. O fallback não funcionará para os tenants.'}
                                </p>
                                {!readonly && (
                                    <Button className="mt-4" variant="outline" onClick={() => { setSelectedProvider(null); setShowProviderModal(true); }}>
                                        {mode === 'tenant' ? 'Configurar Provedor Próprio (Override)' : 'Configurar Provedor Global'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="prompts">
                    <AIPromptsTab tenantId={tenantId} readonly={readonly} />
                </TabsContent>

                <TabsContent value="workflows">
                    <AIWorkflowsTab tenantId={tenantId} readonly={readonly} />
                </TabsContent>

                <TabsContent value="mappings">
                    <AIFunctionMappingTab tenantId={tenantId} readonly={readonly} />
                </TabsContent>

                <TabsContent value="usage">
                    <AIUsageTab tenantId={tenantId} readonly={readonly} />
                </TabsContent>

                <TabsContent value="settings">
                    <AISettingsTabContent tenantId={tenantId} readonly={readonly} mode={mode} />
                </TabsContent>

            </Tabs>

            {/* --- MODALS --- */}
            <AIProviderModal
                open={showProviderModal}
                onOpenChange={setShowProviderModal}
                tenantId={tenantId}
                existingProvider={selectedProvider}
                onSave={loadAIData}
            />

            <AlertDialog open={!!providerToDelete} onOpenChange={(open) => !open && setProviderToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O provedor será removido permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteProvider}>
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AIManagerCore;
