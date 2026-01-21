import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Database,
  Lock,
  Globe,
  Shield as ShieldIcon,
  X,
  Save,
  Edit,
  RefreshCw,
  Sparkles,
  Bot,
  Activity,
  Terminal,
  Play
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interfaces ---

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

interface AIPromptTemplate {
  id: string;
  name: string;
  is_active: boolean;
  category: string;
  description?: string;
  template_content?: string;
  use_case?: string;
}

interface AIWorkflow {
  id: string;
  name: string;
  is_active: boolean;
  status: string;
}

interface AIUsageLog {
  id: string;
  created_at: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
}

// --- Icons wrapper for consistent sizing ---
const Icon = ({ icon: IconComponent, className }: { icon: any, className?: string }) => (
  <IconComponent className={`h-4 w-4 ${className}`} />
);

const AIManagementPage: React.FC = () => {
  // --- Auth & Tenant Logic ---
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();

  // Logic: User Tenant > Selected Tenant (if Super/Platform Admin)
  const isPlatformAdmin = user?.isPlatformAdmin || user?.roles?.includes('platform_admin');
  const effectiveTenantId = isPlatformAdmin && selectedTenantId ? selectedTenantId : user?.tenantId;

  const [activeTab, setActiveTab] = useState('overview');
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [prompts, setPrompts] = useState<AIPromptTemplate[]>([]);
  const [workflows, setWorkflows] = useState<AIWorkflow[]>([]);
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Premium UI States ---
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // --- Configuration State ---
  const [aiConfig, setAiConfig] = useState({
    defaultProvider: 'claude',
    defaultModel: 'claude-3-5-sonnet',
    temperature: 0.7,
    maxTokens: 4000
    // ... other config fields can be added here
  });

  // --- Modals State ---
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // --- Data Loading ---
  const loadAIData = async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    try {
      console.log('🔄 [AI MANAGER] Carregando dados para tenant:', effectiveTenantId);

      // 1. Providers
      const { data: provData } = await supabase
        .from('ai_grc_providers')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      // Adaptar se necessário
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
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });
      setPrompts(promptData || []);

      // 3. Workflows
      const { data: wfData } = await supabase
        .from('ai_workflows')
        .select('id, name, is_active, status')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });
      setWorkflows(wfData || []);

      // 4. Usage Logs (Today)
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData } = await supabase
        .from('ai_usage_logs')
        .select('id, created_at, tokens_input, tokens_output, cost_usd')
        .eq('tenant_id', effectiveTenantId)
        .gte('created_at', today);
      setUsageLogs(usageData || []);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do módulo IA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAIData();
  }, [effectiveTenantId]);

  // --- Stats Calculation ---
  const activeProviders = providers.filter(p => p.is_active);
  const activePrompts = prompts.filter(p => p.is_active);
  const activeWorkflows = workflows.filter(w => w.is_active);
  const totalRequests = usageLogs.length;

  // --- Access Control ---
  // Allow Platform Admins AND Tenant Admins
  const hasAccess = isPlatformAdmin || user?.roles?.includes('admin') || user?.roles?.includes('tenant_admin');

  if (!user) return null;
  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  // --- Render Helpers ---

  const QuickActionCard = ({ title, desc, icon: Icon, onClick }: any) => (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -5 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all hover:bg-white/10 hover:shadow-primary/20 hover:border-primary/50">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-all" />

        <div className="flex items-start justify-between">
          <div className="p-3 rounded-lg bg-gradient-to-br from-gray-800 to-black border border-white/10 shadow-inner group-hover:from-primary/20 group-hover:to-primary/5 transition-all">
            <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
          </div>
          <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
        </div>

        <h3 className="mt-4 font-semibold text-lg text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      </div>
    </motion.div>
  );

  const StatCard = ({ title, value, sub, icon: Icon, color, index }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-gray-900/50 to-black/50 p-6 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
          <Icon className={`h-6 w-6 text-${color}-500`} />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-foreground p-6 space-y-8 font-sans selection:bg-primary/30">

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 border border-primary/30 backdrop-blur-md">
              <Brain className="h-8 w-8 text-primary animate-pulse-slow" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Gestão de IA
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                Configuração e gerenciamento de assistentes IA especializados em GRC
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {effectiveTenantId && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 backdrop-blur-md px-3 py-1">
                <ShieldIcon className="w-3 h-3 mr-1" />
                Tenant Ativo: {selectedTenantId || user?.tenantId}
              </Badge>
            )}
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
              <Activity className="w-3 h-3 mr-1" /> Sistema Ativo
            </Badge>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md">
            <BookOpen className="mr-2 h-4 w-4" /> Documentação
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Novo Recurso
          </Button>
        </div>
      </div>

      {/* --- TABS --- */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6">
          <TabsList className="bg-white/5 border border-white/10 p-1 w-full justify-start overflow-x-auto h-auto rounded-lg">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'providers', label: 'Provedores', icon: Cpu },
              { id: 'prompts', label: 'Prompts', icon: MessageSquare },
              { id: 'workflows', label: 'Workflows', icon: Workflow },
              { id: 'usage', label: 'Uso', icon: Zap },
              { id: 'settings', label: 'Configurações', icon: Settings },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg flex gap-2 px-6 py-2.5 transition-all"
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Provedores Ativos"
              value={activeProviders.length}
              sub={providers.length > 0 ? providers[0].provider_type.toUpperCase() : 'N/A'}
              icon={Cpu}
              color="blue"
              index={0}
            />
            <StatCard
              title="Prompts Personalizados"
              value={activePrompts.length}
              sub={`${prompts.length} total`}
              icon={MessageSquare}
              color="purple"
              index={1}
            />
            <StatCard
              title="Workflows Ativos"
              value={activeWorkflows.length}
              sub={`${activeWorkflows.filter(w => w.status === 'running').length} em execução`}
              icon={Workflow}
              color="emerald"
              index={2}
            />
            <StatCard
              title="Requisições Hoje"
              value={totalRequests}
              sub="0 logs | Tokens: 0 | Custo: 0.00"
              icon={BarChart3}
              color="orange"
              index={3}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" /> Ações Rápidas
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <QuickActionCard
                title="Configurar Novo Provedor"
                desc="Adicionar Claude, OpenAI, ou provedor customizado"
                icon={Plus}
                onClick={() => { setActiveTab('providers'); setShowProviderModal(true); }}
              />
              <QuickActionCard
                title="Criar Template de Prompt"
                desc="Criar prompt especializado para módulos GRC"
                icon={MessageSquare}
                onClick={() => { setActiveTab('prompts'); setShowPromptModal(true); }}
              />
              <QuickActionCard
                title="Configurar Workflow"
                desc="Automatizar análises e relatórios com IA"
                icon={Workflow}
                onClick={() => setActiveTab('workflows')}
              />
              <QuickActionCard
                title="Ver Estatísticas"
                desc="Monitorar uso, custos e performance"
                icon={BarChart3}
                onClick={() => setActiveTab('usage')}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Status Section */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5 text-blue-400" /> Status dos Provedores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum provedor configurado.</p>
                  ) : (
                    providers.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium text-sm">{p.name || p.model_name}</p>
                            <p className="text-xs text-muted-foreground">{p.provider_type}</p>
                          </div>
                        </div>
                        {p.is_active && <Badge className="bg-green-500/20 text-green-400 border-none">Ativo</Badge>}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Section */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-emerald-400" /> Segurança e Conformidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <div>
                    <p className="text-sm font-medium">Criptografia de API Keys</p>
                    <p className="text-xs text-muted-foreground">Chaves armazenadas com criptografia</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Ativa</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <div>
                    <p className="text-sm font-medium">Isolamento por Tenant</p>
                    <p className="text-xs text-muted-foreground">RLS ativo para separação de dados</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400">Ativa</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- CONTENT: PROVIDERS --- */}
        <TabsContent value="providers" className="space-y-6">
          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
            <div>
              <h3 className="text-xl font-bold">Provedores de IA</h3>
              <p className="text-muted-foreground text-sm">Gerencie as conexões com LLMs para este tenant.</p>
            </div>
            <Button onClick={() => { setModalMode('create'); setShowProviderModal(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Provedor
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {providers.map(provider => (
              <Card key={provider.id} className="border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/[0.07] transition-all">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      {provider.provider_type === 'openai' ? <Bot className="h-6 w-6" /> : <Cpu className="h-6 w-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                      <CardDescription className="text-xs">{provider.model_name}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={provider.is_active ? "default" : "secondary"} className={provider.is_active ? "bg-green-600" : ""}>
                    {provider.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm mt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="uppercase font-mono text-xs bg-white/10 px-2 py-0.5 rounded">{provider.provider_type}</span>
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
                  <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => toast.info('Teste de conexão simulado')}>Testar</Button>
                    <Button variant="default" size="sm" className="flex-1 text-xs">Editar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {providers.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-white/20 rounded-xl bg-white/5">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Nenhum provedor configurado</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
                  Adicione um provedor de IA (OpenAI, Claude, etc) para habilitar funcionalidades inteligentes.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => { setModalMode('create'); setShowProviderModal(true); }}>
                  Configurar Primeiro Provedor
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* --- OTHER TABS PLACEHOLDERS (To be implemented fully) --- */}
        <TabsContent value="prompts">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold">Biblioteca de Prompts</h3>
            <p className="text-muted-foreground mt-2">Gerencie templates de prompts para uso nos módulos de GRC.</p>
            <Button className="mt-6">Criar Novo Template</Button>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
            <Workflow className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold">Automação & Workflows</h3>
            <p className="text-muted-foreground mt-2">Configure fluxos automatizados de análise e geração de conteúdo.</p>
          </div>
        </TabsContent>

        <TabsContent value="usage">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold">Relatórios de Uso</h3>
            <p className="text-muted-foreground mt-2">Visualize consumo de tokens, custos e métricas detalhadas.</p>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold">Configurações Globais</h3>
            <p className="text-muted-foreground mt-2">Defina políticas de segurança, limites de rate e padrões.</p>
          </div>
        </TabsContent>

      </Tabs>

      {/* Helper Icon component specifically for this file to avoid import issues */}
      <div className="hidden">
        <ArrowUpRight className="h-0 w-0" />
        <BookOpen className="h-0 w-0" />
      </div>
    </div>
  );
};

// Simple Icons to avoid import errors if not available in lucide-react (fallback)
const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10" /><path d="M7 17 17 7" /></svg>
);

const BookOpen = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);

export default AIManagementPage;
