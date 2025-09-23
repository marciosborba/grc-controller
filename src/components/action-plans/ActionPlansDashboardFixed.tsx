import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  BarChart3,
  Calendar,
  Filter,
  Plus,
  Search,
  Settings,
  ArrowRight,
  Shield,
  FileText,
  Clipboard,
  Eye,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';
import { EnhancedActionPlanCard } from './EnhancedActionPlanCard';

interface DashboardMetrics {
  total_planos: number;
  planos_em_execucao: number;
  planos_concluidos: number;
  planos_pendentes: number;
  planos_vencidos: number;
  planos_criticos: number;
  planos_alta_prioridade: number;
  planos_risk: number;
  planos_compliance: number;
  planos_assessments: number;
  planos_privacy: number;
  media_progresso: number;
  orcamento_total_planejado: number;
  orcamento_total_realizado: number;
  monthly_trend: number;
}

interface ActionPlan {
  id: string;
  codigo: string;
  titulo: string;
  modulo_origem: string;
  prioridade: string;
  status: string;
  percentual_conclusao: number;
  data_fim_planejada: string;
  dias_para_vencimento: number;
  gut_score: number;
}

export const ActionPlansDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_planos: 0,
    planos_em_execucao: 0,
    planos_concluidos: 0,
    planos_pendentes: 0,
    planos_vencidos: 0,
    planos_criticos: 0,
    planos_alta_prioridade: 0,
    planos_risk: 0,
    planos_compliance: 0,
    planos_assessments: 0,
    planos_privacy: 0,
    media_progresso: 0,
    orcamento_total_planejado: 0,
    orcamento_total_realizado: 0,
    monthly_trend: 0
  });
  
  const [recentPlans, setRecentPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    if (user?.tenant_id) {
      loadDashboardData();
    }
  }, [user?.tenant_id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento simples sem banco de dados
      setTimeout(() => {
        setMetrics({
          total_planos: 3,
          planos_em_execucao: 1,
          planos_concluidos: 1,
          planos_pendentes: 1,
          planos_vencidos: 0,
          planos_criticos: 0,
          planos_alta_prioridade: 1,
          planos_risk: 1,
          planos_compliance: 1,
          planos_assessments: 1,
          planos_privacy: 0,
          media_progresso: 65,
          orcamento_total_planejado: 50000,
          orcamento_total_realizado: 32500,
          monthly_trend: 2.1
        });
        
        setRecentPlans([
          {
            id: '1',
            codigo: 'PA-001',
            titulo: 'Implementar controles de segurança',
            modulo_origem: 'risk_management',
            prioridade: 'alta',
            status: 'em_execucao',
            percentual_conclusao: 75,
            data_fim_planejada: '2025-10-15',
            dias_para_vencimento: 26,
            gut_score: 8
          }
        ]);
        
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Erro ao carregar dados de planos de ação:', error);
      toast.error('Erro ao carregar dados de planos de ação');
      setLoading(false);
    }
  };


  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejado': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'em_execucao': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'concluido': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'pausado': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelado': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Planos de Ação</h1>
          <p className="text-muted-foreground">Central de Gestão e Acompanhamento de Planos de Ação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={() => navigate('/action-plans/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-green-600">{metrics.media_progresso}%</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {metrics.monthly_trend >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  )}
                  {Math.abs(metrics.monthly_trend).toFixed(1)}% vs mês anterior
                </p>
              </div>
              <Target className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Planos</p>
                <p className="text-2xl font-bold">{metrics.total_planos}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold">{metrics.planos_em_execucao}</p>
              </div>
              <Activity className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-red-600">{metrics.planos_vencidos}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{metrics.planos_criticos}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.planos_pendentes}</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-emerald-600">{metrics.planos_concluidos}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold text-indigo-600">{metrics.planos_alta_prioridade}</p>
              </div>
              <Users className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulos de Origem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('risk')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Shield className="h-8 w-8 text-red-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Gestão de Riscos</h3>
            <p className="text-muted-foreground text-sm">Planos de ação de riscos e controles</p>
            <div className="mt-3">
              <span className="text-xl font-bold">{metrics.planos_risk}</span>
              <span className="text-sm text-muted-foreground ml-1">planos</span>
            </div>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('compliance')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Conformidade</h3>
            <p className="text-muted-foreground text-sm">Não conformidades e adequações</p>
            <div className="mt-3">
              <span className="text-xl font-bold">{metrics.planos_compliance}</span>
              <span className="text-sm text-muted-foreground ml-1">planos</span>
            </div>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('assessments')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Clipboard className="h-8 w-8 text-green-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Avaliações</h3>
            <p className="text-muted-foreground text-sm">Melhorias de assessments</p>
            <div className="mt-3">
              <span className="text-xl font-bold">{metrics.planos_assessments}</span>
              <span className="text-sm text-muted-foreground ml-1">planos</span>
            </div>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => setSelectedTab('privacy')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Eye className="h-8 w-8 text-purple-600" />
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Privacidade</h3>
            <p className="text-muted-foreground text-sm">LGPD e proteção de dados</p>
            <div className="mt-3">
              <span className="text-xl font-bold">{metrics.planos_privacy}</span>
              <span className="text-sm text-muted-foreground ml-1">planos</span>
            </div>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="management">Gerenciamento</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Planos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Planos de Ação Recentes
                </CardTitle>
                <CardDescription>
                  Últimos planos criados ou atualizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPlans.slice(0, 5).map(plan => {
                    const enhancedPlan = {
                      ...plan,
                      categoria: 'Geral',
                      tenant_id: user?.tenant_id || '',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      created_by: user?.id || '',
                      responsavel: {
                        id: user?.id || '',
                        nome: user?.nome || user?.email || 'Usuário',
                        email: user?.email || ''
                      }
                    };
                    
                    return (
                      <EnhancedActionPlanCard
                        key={plan.id}
                        actionPlan={enhancedPlan}
                        isExpandedByDefault={false}
                        showModuleLink={true}
                        onUpdate={(updatedPlan) => {
                          const updatedPlans = recentPlans.map(p => 
                            p.id === updatedPlan.id ? { ...p, ...updatedPlan } : p
                          );
                          setRecentPlans(updatedPlans);
                        }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="sm"
                        onClick={() => navigate('/action-plans/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Plano de Ação
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm"
                        onClick={() => navigate('/action-plans/management')}>
                  <Target className="h-4 w-4 mr-2" />
                  Gerenciar Planos
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm"
                        onClick={() => navigate('/action-plans/reports')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios Executivos
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{metrics.total_planos}</p>
                    <p className="text-xs text-muted-foreground">Planos Ativos</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-green-600">{metrics.planos_em_execucao}</p>
                    <p className="text-xs text-muted-foreground">Em Execução</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-red-600">{metrics.planos_vencidos}</p>
                    <p className="text-xs text-muted-foreground">Vencidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Planos</CardTitle>
              <CardDescription>
                Navegue para a página de gerenciamento completo
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gerenciamento Avançado</h3>
              <p className="text-muted-foreground mb-6">
                Acesse todas as funcionalidades de gestão de planos de ação
              </p>
              <Button onClick={() => navigate('/action-plans/management')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Ir para Gerenciamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Analytics</CardTitle>
              <CardDescription>
                Relatórios executivos e dashboards analíticos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Relatórios Executivos</h3>
              <p className="text-muted-foreground mb-6">
                Visualize métricas e indicadores de performance
              </p>
              <Button onClick={() => navigate('/action-plans/reports')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avançado</CardTitle>
              <CardDescription>
                Análises detalhadas e insights de performance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Activity className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics em Desenvolvimento</h3>
              <p className="text-muted-foreground mb-6">
                Funcionalidade de analytics será disponibilizada em breve
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Módulo</CardTitle>
              <CardDescription>
                Configurações e preferências do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configurações Avançadas</h3>
              <p className="text-muted-foreground mb-6">
                Configure categorias, templates e integrações
              </p>
              <Button onClick={() => navigate('/action-plans/settings')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Abrir Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};