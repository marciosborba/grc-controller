import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileEdit,
  Eye,
  CheckCircle,
  BookOpen,
  BarChart3,
  Calendar,
  Search,
  Filter,
  Plus,
  Brain,
  Sparkles,
  Target,
  AlertTriangle,
  Activity,
  TrendingUp,
  Shield,
  Clock,
  FileText
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Importar views
import PolicyDashboard from './views/PolicyDashboard';
import PolicyElaboration from './views/PolicyElaboration';
import PolicyReview from './views/PolicyReview';
import PolicyApproval from './views/PolicyApproval';
import PolicyPublication from './views/PolicyPublication';
import PolicyLifecycle from './views/PolicyLifecycle';
import PolicyAnalytics from './views/PolicyAnalytics';
import PolicyTemplates from './views/PolicyTemplates';

interface Policy {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  document_type?: string;
  version: string;
  workflow_stage?: string;
  priority?: string;
  effective_date?: string;
  review_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  content?: any;
  metadata?: any;
  document_url?: string;
}

const PolicyManagementHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principais
  const [activeView, setActiveView] = useState('dashboard');
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Estados para Alex Policy
  const [alexConfig] = useState({
    enabled: true,
    model: 'gpt-4',
    features: ['suggestions', 'compliance_check', 'structure_analysis']
  });

  // Função para mudar view e salvar no localStorage
  const changeActiveView = (view: string) => {
    setActiveView(view);
    localStorage.setItem('policy-management-active-view', view);
  };

  // Carregar view salva do localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('policy-management-active-view');
    if (savedView) {
      setActiveView(savedView);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    const tenantId = user?.tenant?.id || user?.tenantId;

    if (tenantId) {
      loadPolicies();
    }
  }, [user?.tenant?.id, user?.tenantId, user]);

  const loadPolicies = async () => {
    // Tentar usar tenantId como fallback
    const tenantId = user?.tenant?.id || user?.tenantId;

    if (!tenantId) {
      console.log('❌ PolicyManagement: Sem tenant_id disponível');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('id, title, description, status, category, document_type, version, created_at, updated_at, effective_date, review_date, expiry_date, created_by, approved_by, approved_at, owner_id, document_url, metadata, priority, tenant_id')
        .eq('tenant_id', tenantId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ PolicyManagement: Erro ao carregar políticas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar políticas",
          variant: "destructive",
        });
        return;
      }

      console.log(`✅ PolicyManagement: ${data?.length || 0} políticas carregadas`);
      setPolicies(data || []);
    } catch (error) {
      console.error('Erro ao carregar políticas:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o banco de dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estatísticas para os cards de topo
  const stats = React.useMemo(() => {
    const total = policies.length;
    const draft = policies.filter(p => p.status === 'draft').length;
    const review = policies.filter(p => p.status === 'under_review' || p.workflow_stage === 'review').length;
    const approved = policies.filter(p => p.status === 'approved').length;
    const published = policies.filter(p => p.status === 'published').length;

    // Políticas criadas recentemente (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentPolicies = policies.filter(p =>
      new Date(p.created_at) >= sevenDaysAgo
    );

    // Políticas que precisam de atenção (expirando ou vencidas)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const needsAttention = policies.filter(p => {
      if (p.expiry_date) {
        const expiryDate = new Date(p.expiry_date);
        if (expiryDate <= thirtyDaysFromNow) return true;
      }
      if (p.review_date) { // Check review date too
        const reviewDate = new Date(p.review_date);
        if (reviewDate <= today) return true; // Overdue review
      }
      return false;
    });

    return {
      total,
      draft,
      review,
      approved,
      published,
      recentCount: recentPolicies.length,
      needsAttentionCount: needsAttention.length
    };
  }, [policies]);

  // Filtrar políticas
  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = !searchTerm ||
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || policy.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Obter categorias únicas
  const categories = [...new Set(policies.map(p => p.category))];
  const statuses = [...new Set(policies.map(p => p.status))];

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      component: PolicyDashboard,
      description: 'Visão geral e métricas'
    },
    {
      id: 'elaboration',
      label: 'Elaboração',
      icon: FileEdit,
      component: PolicyElaboration,
      description: 'Criar e editar políticas'
    },
    {
      id: 'review',
      label: 'Revisão',
      icon: Eye,
      component: PolicyReview,
      description: 'Revisar e comentar'
    },
    {
      id: 'approval',
      label: 'Aprovação',
      icon: CheckCircle,
      component: PolicyApproval,
      description: 'Aprovar políticas'
    },
    {
      id: 'publication',
      label: 'Publicação',
      icon: BookOpen,
      component: PolicyPublication,
      description: 'Publicar e distribuir'
    },
    {
      id: 'lifecycle',
      label: 'Ciclo de Vida',
      icon: Calendar,
      component: PolicyLifecycle,
      description: 'Gestão de validade'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: PolicyAnalytics,
      description: 'Métricas e relatórios'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileEdit,
      component: PolicyTemplates,
      description: 'Biblioteca de modelos'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeView)?.component || PolicyDashboard;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando políticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header principal */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold truncate">
            Gestão de Políticas e Normas
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Ciclo completo de gestão de políticas com assistência de IA
          </p>
        </div>

        <div className="flex items-center space-x-3">



        </div>
      </div>



      {/* Métricas Cards - Premium Storytelling (Movidos para o topo) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Panorama Geral */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <FileText className="h-16 w-16 sm:h-24 sm:w-24" />
          </div>
          <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-lg font-bold flex items-center gap-1 sm:gap-2 text-primary leading-tight">
              Panorama Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2 mb-1 sm:mb-2">
              <span className="text-xl sm:text-3xl font-bold text-foreground">{stats.total}</span>
              <span className="text-[10px] sm:text-sm text-muted-foreground leading-tight">políticas totais</span>
            </div>
            <p className="text-muted-foreground font-medium text-[10px] sm:text-sm leading-tight sm:leading-relaxed mb-2 sm:mb-4">
              <span className="text-green-600 font-bold flex items-center gap-1">
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> +{stats.recentCount}
              </span>
              <span className="block mt-0.5 sm:mt-1">novas (7 dias)</span>
            </p>
            <Progress value={stats.total > 0 ? (stats.published / stats.total) * 100 : 0} className="h-1.5 sm:h-2 opacity-50" />
          </CardContent>
        </Card>

        {/* Card 2: Em Elaboração/Revisão */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <FileEdit className="h-16 w-16 sm:h-24 sm:w-24 text-blue-500" />
          </div>
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-2xl shrink-0">
              <FileEdit className="h-4 w-4 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-tight sm:leading-normal">Em Processo</p>
              <h3 className="text-xl sm:text-3xl font-bold text-foreground">
                {stats.draft + stats.review}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 flex items-center leading-tight sm:leading-normal">
                <span className="font-medium text-blue-600 mr-1">{stats.review}</span> em revisão
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Atenção Necessária */}
        <Card className={`relative overflow-hidden shadow-sm hover:shadow-md transition-all group ${stats.needsAttentionCount > 0 ? 'border-l-4 border-l-orange-500/50' : ''}`}>
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="h-16 w-16 sm:h-24 sm:w-24 text-orange-500" />
          </div>
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-2xl shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-tight sm:leading-normal">Revisões Pendentes</p>
              <h3 className={`text-xl sm:text-3xl font-bold ${stats.needsAttentionCount > 0 ? 'text-orange-600 dark:text-orange-500' : 'text-foreground'}`}>
                {stats.needsAttentionCount}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight sm:leading-normal">
                expirando ou vencidas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Vigentes */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="h-16 w-16 sm:h-24 sm:w-24 text-green-500" />
          </div>
          <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-lg font-bold text-foreground leading-tight">
              Vigentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2 mb-1 sm:mb-2">
              <span className="text-xl sm:text-3xl font-bold text-green-600">
                {stats.published}
              </span>
              <span className="text-[10px] sm:text-sm text-muted-foreground leading-tight">publicadas</span>
            </div>
            <p className="text-[9px] sm:text-sm text-muted-foreground mt-1 sm:mt-2 leading-tight">
              <span className="font-medium text-foreground">{stats.approved}</span> aprovadas agr.
            </p>
            <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-green-500" style={{ width: `${stats.total > 0 ? (stats.published / stats.total) * 100 : 0}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros globais */}
      <Card className="border-none shadow-sm bg-gray-50/50 dark:bg-gray-900/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar políticas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 h-10 text-sm"
              />
            </div>

            <div className="flex flex-wrap flex-row gap-2 w-full lg:w-auto items-center overflow-x-auto pb-1 lg:pb-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md text-xs sm:text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-primary w-[140px] sm:w-[160px]"
              >
                <option value="all">Todos os Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'draft' ? 'Rascunho' :
                      status === 'review' ? 'Em Revisão' :
                        status === 'approved' ? 'Aprovado' :
                          status === 'published' ? 'Publicado' : status}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-md text-xs sm:text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-primary w-[140px] sm:w-[160px]"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <Button variant="outline" size="sm" className="h-10">
                <Filter className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={activeView} onValueChange={changeActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-0.5 p-0.5 h-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="!flex !flex-col !items-center !justify-center !p-1 !px-0.5 !py-1 !min-w-0 !h-10 !text-xs"
                title={tab.description}
              >
                <Icon className="h-3 w-3 mb-0.5" />
                <span className="hidden sm:block truncate leading-none text-xs">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Conteúdo das tabs */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <tab.component
              policies={filteredPolicies}
              allPolicies={policies}
              onPolicyUpdate={loadPolicies}
              alexConfig={alexConfig}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              isLoading={isLoading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default PolicyManagementHub;