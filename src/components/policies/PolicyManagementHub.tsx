import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  FileText,
  Plus,
  Search,
  Filter,
  BarChart3,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  MessageSquare,
  Zap,
  Shield,
  TrendingUp,
  Calendar,
  Eye,
  Edit,
  MoreHorizontal,
  BookOpen,
  Target,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Views
import { PolicyDashboard } from './views/PolicyDashboard';
import { PolicyElaboration } from './views/PolicyElaboration';
import { PolicyReview } from './views/PolicyReview';
import { PolicyApproval } from './views/PolicyApproval';
import { PolicyPublication } from './views/PolicyPublication';
import { PolicyLifecycle } from './views/PolicyLifecycle';
import { PolicyTemplates } from './views/PolicyTemplates';
import { PolicyAnalytics } from './views/PolicyAnalytics';

// Shared Components
import { AlexPolicyChat } from './shared/AlexPolicyChat';
import { PolicyNotificationCenter } from './shared/PolicyNotificationCenter';

// Types
import type { 
  Policy, 
  PolicyDashboardData, 
  PolicyFilters,
  AlexPolicyConfig 
} from '@/types/policy-management';

interface PolicyManagementHubProps {
  className?: string;
}

export const PolicyManagementHub: React.FC<PolicyManagementHubProps> = ({ 
  className = '' 
}) => {
  const { user, tenant } = useAuth();
  const { toast } = useToast();

  // Estado principal
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('policy-management-active-view') || 'dashboard';
  });
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [dashboardData, setDashboardData] = useState<PolicyDashboardData | null>(null);
  const [filters, setFilters] = useState<PolicyFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do Alex Policy
  const [alexActive, setAlexActive] = useState(false);
  const [alexConfig, setAlexConfig] = useState<AlexPolicyConfig>({
    enabled: true,
    auto_suggestions: true,
    auto_analysis: true,
    confidence_threshold: 0.8,
    preferred_language: 'pt-BR',
    specialized_domains: ['governance', 'compliance', 'operational']
  });

  // Estado das notificações
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Função para mudar view e salvar no localStorage
  const changeActiveView = (view: string) => {
    setActiveView(view);
    localStorage.setItem('policy-management-active-view', view);
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.tenant?.id) {
      console.log('Iniciando carregamento de dados para tenant:', user.tenant.id);
      loadInitialData();
    }
  }, [user?.tenant?.id]);

  const loadInitialData = async () => {
    if (!user?.tenant?.id) return;

    try {
      setLoading(true);
      await loadPolicies();
      await loadDashboardData();
      await loadNotificationCount();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do módulo de políticas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPolicies = async () => {
    try {
      console.log('Carregando políticas para tenant:', user?.tenant?.id);
      
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('tenant_id', user?.tenant?.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro na query de políticas:', error);
        throw error;
      }
      
      console.log('Políticas carregadas:', data?.length || 0);
      setPolicies(data || []);
    } catch (error) {
      console.error('Erro ao carregar políticas:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar políticas do banco de dados',
        variant: 'destructive'
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      // Carregar dados reais do dashboard baseado nas políticas
      const currentPolicies = policies.length > 0 ? policies : await loadPoliciesForDashboard();
      
      const dashboardData: PolicyDashboardData = {
        summary: {
          total_policies: currentPolicies.length,
          active_policies: currentPolicies.filter(p => p.is_active).length,
          draft_policies: currentPolicies.filter(p => p.status === 'draft').length,
          pending_approval: currentPolicies.filter(p => p.status === 'review').length,
          expiring_soon: currentPolicies.filter(p => {
            if (!p.expiry_date) return false;
            const expiryDate = new Date(p.expiry_date);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            return expiryDate <= thirtyDaysFromNow;
          }).length,
          compliance_rate: 85.5,
          average_read_rate: 78.2
        },
        metrics: [],
        recent_activities: [],
        pending_actions: [],
        expiring_policies: [],
        alex_insights: []
      };

      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const loadPoliciesForDashboard = async () => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .eq('tenant_id', user?.tenant?.id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar políticas para dashboard:', error);
      return [];
    }
  };

  const loadNotificationCount = async () => {
    try {
      const { count, error } = await supabase
        .from('policy_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', user?.tenant?.id)
        .eq('recipient_id', user?.id)
        .in('status', ['pending', 'sent', 'delivered']);

      if (error) throw error;
      setNotificationCount(count || 0);
    } catch (error) {
      console.error('Erro ao carregar contagem de notificações:', error);
    }
  };

  // Renderizar loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-lg text-muted-foreground">Carregando módulo de políticas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Principal */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <span>Gestão de Políticas e Normas</span>
          </h1>
          <p className="text-muted-foreground">
            Ciclo completo de gestão com assistência Alex Policy IA
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Alex Policy Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${alexActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-muted-foreground">
              Alex Policy {alexActive ? 'ativo' : 'standby'}
            </span>
          </div>

          {/* Notificações */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Notificações
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* Alex Policy Chat */}
          <AlexPolicyChat
            isActive={alexActive}
            onToggle={setAlexActive}
            config={alexConfig}
            context={{
              module: 'policies',
              tenant_id: user?.tenant?.id,
              current_view: activeView
            }}
          />
        </div>
      </div>

      {/* Alert Informativo */}
      <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-100">
        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle>Centro de Gestão de Políticas Corporativas</AlertTitle>
        <AlertDescription>
          Gerencie todo o ciclo de vida das políticas organizacionais com assistência inteligente do Alex Policy. 
          Desde a elaboração até a gestão de validade, garantindo conformidade e efetividade.
        </AlertDescription>
      </Alert>

      {/* Busca e Filtros Globais */}
      <Card className="grc-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar políticas, procedimentos, diretrizes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação Principal */}
      <Tabs value={activeView} onValueChange={changeActiveView}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          
          <TabsTrigger value="elaboration" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Elaboração</span>
          </TabsTrigger>
          
          <TabsTrigger value="review" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Revisão</span>
          </TabsTrigger>
          
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Aprovação</span>
          </TabsTrigger>
          
          <TabsTrigger value="publication" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Publicação</span>
          </TabsTrigger>
          
          <TabsTrigger value="lifecycle" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Validade</span>
          </TabsTrigger>
          
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <PolicyDashboard
            data={dashboardData}
            policies={policies}
            onRefresh={loadDashboardData}
            alexConfig={alexConfig}
          />
        </TabsContent>

        {/* Elaboração */}
        <TabsContent value="elaboration" className="space-y-6">
          <PolicyElaboration
            policies={policies.filter(p => ['draft', 'review'].includes(p.status))}
            onPolicyUpdate={loadPolicies}
            alexConfig={alexConfig}
            searchTerm={searchTerm}
            filters={filters}
          />
        </TabsContent>

        {/* Revisão */}
        <TabsContent value="review" className="space-y-6">
          <PolicyReview
            policies={policies.filter(p => p.status === 'review')}
            onPolicyUpdate={loadPolicies}
            alexConfig={alexConfig}
            searchTerm={searchTerm}
            filters={filters}
          />
        </TabsContent>

        {/* Aprovação */}
        <TabsContent value="approval" className="space-y-6">
          <PolicyApproval
            policies={policies.filter(p => ['review', 'approved'].includes(p.status))}
            onPolicyUpdate={loadPolicies}
            alexConfig={alexConfig}
            searchTerm={searchTerm}
            filters={filters}
          />
        </TabsContent>

        {/* Publicação */}
        <TabsContent value="publication" className="space-y-6">
          <PolicyPublication
            policies={policies.filter(p => ['approved', 'published'].includes(p.status))}
            onPolicyUpdate={loadPolicies}
            alexConfig={alexConfig}
            searchTerm={searchTerm}
            filters={filters}
          />
        </TabsContent>

        {/* Gestão de Validade */}
        <TabsContent value="lifecycle" className="space-y-6">
          <PolicyLifecycle
            policies={policies.filter(p => p.status === 'published')}
            onPolicyUpdate={loadPolicies}
            alexConfig={alexConfig}
            searchTerm={searchTerm}
            filters={filters}
          />
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <PolicyTemplates
            onTemplateSelect={(template) => {
              // Navegar para elaboração com template selecionado
              changeActiveView('elaboration');
              // TODO: Passar template selecionado para elaboração
            }}
            alexConfig={alexConfig}
            searchTerm={searchTerm}
          />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <PolicyAnalytics
            policies={policies}
            dashboardData={dashboardData}
            alexConfig={alexConfig}
            filters={filters}
          />
        </TabsContent>
      </Tabs>

      {/* Centro de Notificações */}
      {showNotifications && (
        <PolicyNotificationCenter
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onNotificationUpdate={loadNotificationCount}
        />
      )}
    </div>
  );
};

export default PolicyManagementHub;