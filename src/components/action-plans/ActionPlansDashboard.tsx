import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Calendar, 
  DollarSign,
  BarChart3,
  Activity,
  ArrowRight,
  Plus,
  Filter,
  Search,
  FileText,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSelector } from '@/contexts/TenantSelectorContext';
import { supabase } from '@/integrations/supabase/client';

interface ActionPlanStats {
  total: number;
  planejados: number;
  em_andamento: number;
  concluidos: number;
  atrasados: number;
  percentual_conclusao_media: number;
  orcamento_total: number;
  orcamento_utilizado: number;
}

interface ActionPlan {
  id: string;
  codigo: string;
  titulo: string;
  descricao?: string;
  status: string;
  prioridade: string;
  percentual_conclusao: number;
  data_inicio_planejada?: string;
  data_fim_planejada?: string;
  orcamento_estimado?: number;
  responsavel_profile?: {
    full_name: string;
  };
  assessment?: {
    titulo: string;
    codigo: string;
  };
  items_count?: number;
  items_completed?: number;
  created_at: string;
}

interface RecentActivity {
  id: string;
  type: 'plan_created' | 'plan_completed' | 'item_completed' | 'plan_overdue';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export default function ActionPlansDashboard() {
  const { user } = useAuth();
  const { selectedTenantId } = useTenantSelector();
  const navigate = useNavigate();
  
  const effectiveTenantId = user?.isPlatformAdmin ? selectedTenantId : user?.tenantId;
  
  const [stats, setStats] = useState<ActionPlanStats>({
    total: 0,
    planejados: 0,
    em_andamento: 0,
    concluidos: 0,
    atrasados: 0,
    percentual_conclusao_media: 0,
    orcamento_total: 0,
    orcamento_utilizado: 0
  });
  
  const [recentPlans, setRecentPlans] = useState<ActionPlan[]>([]);
  const [urgentPlans, setUrgentPlans] = useState<ActionPlan[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (effectiveTenantId) {
      loadDashboardData();
    }
  }, [effectiveTenantId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadRecentPlans(),
        loadUrgentPlans(),
        loadRecentActivity()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      console.log('🔍 Carregando estatísticas para tenant:', effectiveTenantId);
      
      const { data, error } = await supabase
        .from('assessment_action_plans')
        .select('status, percentual_conclusao, orcamento_estimado, data_fim_planejada')
        .eq('tenant_id', effectiveTenantId);

      console.log('📊 Resultado stats:', { data, error });
      
      if (error) {
        console.error('❌ Erro na query de stats:', error);
        throw error;
      }

      const plans = data || [];
      const now = new Date();
      
      const statsData: ActionPlanStats = {
        total: plans.length,
        planejados: plans.filter(p => p.status === 'planejado').length,
        em_andamento: plans.filter(p => ['iniciado', 'em_andamento'].includes(p.status)).length,
        concluidos: plans.filter(p => p.status === 'concluido').length,
        atrasados: plans.filter(p => 
          p.data_fim_planejada && 
          new Date(p.data_fim_planejada) < now && 
          p.status !== 'concluido'
        ).length,
        percentual_conclusao_media: plans.length > 0 
          ? Math.round(plans.reduce((sum, p) => sum + (p.percentual_conclusao || 0), 0) / plans.length)
          : 0,
        orcamento_total: plans.reduce((sum, p) => sum + (p.orcamento_estimado || 0), 0),
        orcamento_utilizado: plans
          .filter(p => p.status === 'concluido')
          .reduce((sum, p) => sum + (p.orcamento_estimado || 0), 0)
      };

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadRecentPlans = async () => {
    try {
      console.log('🔍 Carregando planos recentes para tenant:', effectiveTenantId);
      
      // Query simples primeiro
      const { data, error } = await supabase
        .from('assessment_action_plans')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('📊 Resultado planos recentes:', { data, error });
      
      if (error) {
        console.error('❌ Erro na query de planos recentes:', error);
        throw error;
      }

      setRecentPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos recentes:', error);
    }
  };

  const loadUrgentPlans = async () => {
    try {
      console.log('🔍 Carregando planos urgentes para tenant:', effectiveTenantId);
      
      // Query simples primeiro
      const { data, error } = await supabase
        .from('assessment_action_plans')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .in('prioridade', ['alta', 'critica'])
        .neq('status', 'concluido')
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('📊 Resultado planos urgentes:', { data, error });
      
      if (error) {
        console.error('❌ Erro na query de planos urgentes:', error);
        throw error;
      }

      setUrgentPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos urgentes:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      // Simular atividades recentes (em uma implementação real, isso viria de uma tabela de auditoria)
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'plan_created',
          title: 'Novo plano criado',
          description: 'Plano de Melhoria da Segurança da Informação foi criado',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'João Silva'
        },
        {
          id: '2',
          type: 'item_completed',
          title: 'Item concluído',
          description: 'Implementação de backup automático foi concluída',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'Maria Santos'
        },
        {
          id: '3',
          type: 'plan_overdue',
          title: 'Plano em atraso',
          description: 'Plano de Conformidade LGPD está atrasado',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        }
      ];

      setRecentActivity(activities);
    } catch (error) {
      console.error('Erro ao carregar atividades recentes:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'planejado': { label: 'Planejado', color: 'bg-blue-100 text-blue-800' },
      'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      'iniciado': { label: 'Iniciado', color: 'bg-yellow-100 text-yellow-800' },
      'em_andamento': { label: 'Em Andamento', color: 'bg-orange-100 text-orange-800' },
      'suspenso': { label: 'Suspenso', color: 'bg-gray-100 text-gray-800' },
      'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-800' },
      'cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
      'atrasado': { label: 'Atrasado', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planejado;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'baixa': { label: 'Baixa', color: 'bg-blue-100 text-blue-800' },
      'media': { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
      'alta': { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
      'critica': { label: 'Crítica', color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.media;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'plan_created':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'plan_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'item_completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'plan_overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4">Carregando dashboard...</p>
        <div className="ml-4 text-sm text-muted-foreground">
          {effectiveTenantId ? `Tenant: ${effectiveTenantId}` : 'Aguardando tenant...'}
        </div>
      </div>
    );
  }

  // Debug info
  console.log('🎯 Dashboard renderizando:', {
    effectiveTenantId,
    stats,
    recentPlans: recentPlans.length,
    urgentPlans: urgentPlans.length,
    user: {
      id: user?.id,
      isPlatformAdmin: user?.isPlatformAdmin,
      tenantId: user?.tenantId
    },
    selectedTenantId
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planos de Ação</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore planos de ação baseados em gaps identificados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/assessments/action-plans')}>
            <FileText className="h-4 w-4 mr-2" />
            Gerenciar Planos
          </Button>
          <Button onClick={() => navigate('/assessments/action-plans')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Planos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.em_andamento} em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.percentual_conclusao_media}%</div>
            <Progress value={stats.percentual_conclusao_media} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.concluidos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.concluidos / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atrasados}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="recent">Planos Recentes</TabsTrigger>
          <TabsTrigger value="urgent">Planos Urgentes</TabsTrigger>
          <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>
                  Status atual dos planos de ação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Planejados</span>
                    <span className="text-sm font-medium">{stats.planejados}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.planejados / stats.total) * 100 : 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Em Andamento</span>
                    <span className="text-sm font-medium">{stats.em_andamento}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.em_andamento / stats.total) * 100 : 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Concluídos</span>
                    <span className="text-sm font-medium">{stats.concluidos}</span>
                  </div>
                  <Progress value={stats.total > 0 ? (stats.concluidos / stats.total) * 100 : 0} />
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Orçamento</CardTitle>
                <CardDescription>
                  Visão geral do orçamento dos planos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Orçamento Total</span>
                  <span className="text-lg font-bold">
                    R$ {stats.orcamento_total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Utilizado</span>
                  <span className="text-sm font-medium">
                    R$ {stats.orcamento_utilizado.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={stats.orcamento_total > 0 ? (stats.orcamento_utilizado / stats.orcamento_total) * 100 : 0} 
                />
                <p className="text-xs text-muted-foreground">
                  {stats.orcamento_total > 0 
                    ? Math.round((stats.orcamento_utilizado / stats.orcamento_total) * 100)
                    : 0
                  }% do orçamento utilizado
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planos Recentes</CardTitle>
              <CardDescription>
                Últimos planos de ação criados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentPlans.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Nenhum plano encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Comece criando seu primeiro plano de ação
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{plan.titulo}</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.codigo} • {plan.assessment?.titulo}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(plan.status)}
                          {getPriorityBadge(plan.prioridade)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{plan.percentual_conclusao}%</div>
                        <Progress value={plan.percentual_conclusao} className="w-20 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planos Urgentes</CardTitle>
              <CardDescription>
                Planos de alta prioridade que requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {urgentPlans.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Nenhum plano urgente</h3>
                  <p className="text-sm text-muted-foreground">
                    Todos os planos de alta prioridade estão sob controle
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {urgentPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg border-orange-200 bg-orange-50">
                      <div className="space-y-1">
                        <h4 className="font-medium">{plan.titulo}</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.codigo} • {plan.assessment?.titulo}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(plan.status)}
                          {getPriorityBadge(plan.prioridade)}
                        </div>
                        {plan.data_fim_planejada && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Prazo: {new Date(plan.data_fim_planejada).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button size="sm" onClick={() => navigate('/assessments/action-plans')}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimas atividades nos planos de ação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                        {activity.user && ` • ${activity.user}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/assessments/action-plans')}
            >
              <Target className="h-6 w-6" />
              <span>Gerenciar Planos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/assessments/reports')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => navigate('/assessments')}
            >
              <Zap className="h-6 w-6" />
              <span>Assessments</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}