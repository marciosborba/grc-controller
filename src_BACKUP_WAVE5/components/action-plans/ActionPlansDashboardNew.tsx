import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock, 
  Target, Users, DollarSign, Calendar, Filter, Plus, Download,
  FileText, Activity, Shield, Clipboard, Eye, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';

interface DashboardMetrics {
  total_planos: number;
  planos_em_execucao: number;
  planos_concluidos: number;
  planos_pendentes: number;
  planos_vencidos: number;
  planos_risk: number;
  planos_compliance: number;
  planos_assessments: number;
  planos_privacy: number;
  planos_criticos: number;
  planos_alta_prioridade: number;
  planos_urgentes: number;
  media_progresso: number;
  media_gut_score: number;
  orcamento_total_planejado: number;
  orcamento_total_realizado: number;
}

interface ActionPlan {
  id: string;
  codigo: string;
  titulo: string;
  categoria_nome: string;
  cor_categoria: string;
  modulo_origem: string;
  prioridade: string;
  status: string;
  percentual_conclusao: number;
  responsavel_nome: string;
  data_fim_planejada: string;
  dias_para_vencimento: number;
  total_atividades: number;
  atividades_concluidas: number;
  atividades_vencidas: number;
  gut_score: number;
}

export const ActionPlansDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentPlans, setRecentPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.tenant_id) return;

    try {
      // Carregar dados básicos dos planos de ação
      const { data: plansData, error: plansError } = await supabase
        .from('action_plans')
        .select(`
          *,
          action_plan_categories(nome, cor_categoria),
          profiles!action_plans_responsavel_plano_fkey(full_name)
        `)
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (plansError) throw plansError;

      // Calcular métricas manualmente
      const totalPlanos = plansData?.length || 0;
      const planosEmExecucao = plansData?.filter(p => p.status === 'em_execucao').length || 0;
      const planosConcluidos = plansData?.filter(p => p.status === 'concluido').length || 0;
      const planosPendentes = plansData?.filter(p => p.status === 'planejado' || p.status === 'aprovacao_pendente').length || 0;
      const planosVencidos = plansData?.filter(p => 
        p.data_fim_planejada && new Date(p.data_fim_planejada) < new Date() && 
        !['concluido', 'cancelado'].includes(p.status)
      ).length || 0;

      const mockMetrics: DashboardMetrics = {
        total_planos: totalPlanos,
        planos_em_execucao: planosEmExecucao,
        planos_concluidos: planosConcluidos,
        planos_pendentes: planosPendentes,
        planos_vencidos: planosVencidos,
        planos_risk: plansData?.filter(p => p.modulo_origem === 'risk_management').length || 0,
        planos_compliance: plansData?.filter(p => p.modulo_origem === 'compliance').length || 0,
        planos_assessments: plansData?.filter(p => p.modulo_origem === 'assessments').length || 0,
        planos_privacy: plansData?.filter(p => p.modulo_origem === 'privacy').length || 0,
        planos_criticos: plansData?.filter(p => p.prioridade === 'critica').length || 0,
        planos_alta_prioridade: plansData?.filter(p => p.prioridade === 'alta').length || 0,
        planos_urgentes: plansData?.filter(p => p.prioridade === 'urgente').length || 0,
        media_progresso: plansData?.reduce((acc, p) => acc + (p.percentual_conclusao || 0), 0) / Math.max(totalPlanos, 1) || 0,
        media_gut_score: plansData?.reduce((acc, p) => acc + (p.gut_score || 0), 0) / Math.max(totalPlanos, 1) || 0,
        orcamento_total_planejado: plansData?.reduce((acc, p) => acc + (p.orcamento_planejado || 0), 0) || 0,
        orcamento_total_realizado: plansData?.reduce((acc, p) => acc + (p.orcamento_realizado || 0), 0) || 0
      };

      setMetrics(mockMetrics);

      // Transformar dados para interface
      const formattedPlans = plansData?.map(plan => ({
        id: plan.id,
        codigo: plan.codigo,
        titulo: plan.titulo,
        categoria_nome: plan.action_plan_categories?.nome || 'Sem categoria',
        cor_categoria: plan.action_plan_categories?.cor_categoria || '#3B82F6',
        modulo_origem: plan.modulo_origem,
        prioridade: plan.prioridade,
        status: plan.status,
        percentual_conclusao: plan.percentual_conclusao || 0,
        responsavel_nome: plan.profiles?.full_name || 'Não definido',
        data_fim_planejada: plan.data_fim_planejada,
        dias_para_vencimento: plan.data_fim_planejada ? 
          Math.ceil((new Date(plan.data_fim_planejada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
        total_atividades: 0, // Será calculado posteriormente
        atividades_concluidas: 0,
        atividades_vencidas: 0,
        gut_score: plan.gut_score || 0
      })) || [];

      setRecentPlans(formattedPlans);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-500';
      case 'urgente': return 'bg-red-600';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-100 text-green-800 border-green-200';
      case 'em_execucao': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pausado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vencido': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModuleIcon = (modulo: string) => {
    switch (modulo) {
      case 'risk_management': return <Shield className="h-4 w-4" />;
      case 'compliance': return <FileText className="h-4 w-4" />;
      case 'assessments': return <Clipboard className="h-4 w-4" />;
      case 'privacy': return <Eye className="h-4 w-4" />;
      case 'audit': return <Activity className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos de Ação</h1>
          <p className="text-gray-600">Gestão centralizada de todos os planos de ação da organização</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => navigate('/action-plans/create')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total de Planos</p>
                <div className="text-2xl font-bold">{metrics?.total_planos || 0}</div>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Em Execução</p>
                <div className="text-2xl font-bold">{metrics?.planos_em_execucao || 0}</div>
              </div>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Vencidos</p>
                <div className="text-2xl font-bold">{metrics?.planos_vencidos || 0}</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Concluídos</p>
                <div className="text-2xl font-bold">{metrics?.planos_concluidos || 0}</div>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Progresso Médio</p>
                <div className="text-xl font-bold">{Math.round(metrics?.media_progresso || 0)}%</div>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <Progress value={metrics?.media_progresso || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Score GUT Médio</p>
                <div className="text-xl font-bold">{Math.round(metrics?.media_gut_score || 0)}</div>
              </div>
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Orçamento Planejado</p>
                <div className="text-xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(metrics?.orcamento_total_planejado || 0)}
                </div>
              </div>
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Alta Prioridade</p>
                <div className="text-xl font-bold text-red-600">
                  {(metrics?.planos_criticos || 0) + (metrics?.planos_urgentes || 0) + (metrics?.planos_alta_prioridade || 0)}
                </div>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="by-module">Por Módulo</TabsTrigger>
          <TabsTrigger value="critical">Críticos</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Em Execução</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {metrics?.planos_em_execucao || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Planejados</span>
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                      {metrics?.planos_pendentes || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Concluídos</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {metrics?.planos_concluidos || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Vencidos</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {metrics?.planos_vencidos || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por Prioridade */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Distribuição por Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Crítica</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {metrics?.planos_criticos || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Urgente</span>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {metrics?.planos_urgentes || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Alta</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      {metrics?.planos_alta_prioridade || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="by-module" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Gestão de Riscos</p>
                    <div className="text-2xl font-bold">{metrics?.planos_risk || 0}</div>
                  </div>
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Compliance</p>
                    <div className="text-2xl font-bold">{metrics?.planos_compliance || 0}</div>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Assessments</p>
                    <div className="text-2xl font-bold">{metrics?.planos_assessments || 0}</div>
                  </div>
                  <Clipboard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Privacidade</p>
                    <div className="text-2xl font-bold">{metrics?.planos_privacy || 0}</div>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Planos de Ação Recentes</CardTitle>
              <CardDescription>
                Últimos planos de ação criados ou atualizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPlans.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum plano de ação encontrado</p>
                    <Button 
                      onClick={() => navigate('/action-plans/create')}
                      className="mt-4"
                    >
                      Criar Primeiro Plano
                    </Button>
                  </div>
                ) : (
                  recentPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                         onClick={() => navigate(`/action-plans/details/${plan.id}`)}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getModuleIcon(plan.modulo_origem)}
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: plan.cor_categoria }}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{plan.titulo}</p>
                          <p className="text-sm text-gray-600">{plan.codigo}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium">{plan.percentual_conclusao}%</p>
                          <Progress value={plan.percentual_conclusao} className="w-20" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50"
              onClick={() => navigate('/action-plans/management')}
            >
              <Target className="h-6 w-6" />
              <span>Gerenciar Planos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-green-50"
              onClick={() => navigate('/action-plans/reports')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-yellow-50"
            >
              <Users className="h-6 w-6" />
              <span>Equipes</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
              onClick={() => navigate('/action-plans/settings')}
            >
              <Settings className="h-6 w-6" />
              <span>Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};