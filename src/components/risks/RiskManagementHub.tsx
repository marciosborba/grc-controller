import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Brain, 
  Library, 
  FileText, 
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Globe,
  Settings,
  Plus,
  Eye,
  Download,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ImprovedAIChatDialog } from '@/components/ai/ImprovedAIChatDialog';
import { RiskLibrary } from './RiskLibrary';
import { RiskIntelligentAnalysis } from './RiskIntelligentAnalysis';
import { RiskReports } from './RiskReports';
import { AdvancedRiskAnalysis } from './AdvancedRiskAnalysisFixed';
import { RiskAcceptanceLetter } from './RiskAcceptanceLetter';
import { RiskProcessGuide } from './RiskProcessGuide';
import { IntegratedRiskManagement } from './IntegratedRiskManagement';
import RiskManagementPage from './RiskManagementPage';
import { AlexRiskGuidedProcess } from './AlexRiskGuidedProcess';
import { AlexRiskGuidedProcessSimple } from './AlexRiskGuidedProcessSimple';
import { AlexRiskTest } from './AlexRiskTest';

interface DashboardMetrics {
  total_risks: number;
  high_priority_risks: number;
  overdue_actions: number;
  compliance_score: number;
  recent_activities: any[];
  risk_trends: {
    period: string;
    new_risks: number;
    closed_risks: number;
    mitigation_rate: number;
  }[];
  top_categories: {
    category: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  upcoming_deadlines: any[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  count?: number;
}

export const RiskManagementHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [showAlexRiskProcess, setShowAlexRiskProcess] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    setupQuickActions();
  }, []);

  useEffect(() => {
    console.log('showAlexRiskProcess state changed:', showAlexRiskProcess);
  }, [showAlexRiskProcess]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar riscos
      const { data: risks, error: risksError } = await supabase
        .from('risk_assessments')
        .select('*');

      if (risksError) throw risksError;

      // Buscar ações
      const { data: actions, error: actionsError } = await supabase
        .from('risk_action_activities')
        .select('*');

      if (actionsError) throw actionsError;

      // Calcular métricas
      const totalRisks = risks?.length || 0;
      const highPriorityRisks = risks?.filter(r => 
        r.risk_level === 'Alto' || r.risk_level === 'Muito Alto'
      ).length || 0;
      
      const overdueActions = actions?.filter(a => 
        new Date(a.deadline) < new Date() && a.status !== 'Concluída'
      ).length || 0;

      // Simular score de compliance
      const complianceScore = 85;

      // Atividades recentes (últimos 7 dias)
      const recentActivities = risks?.filter(r => 
        new Date(r.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).slice(0, 5) || [];

      // Categorias principais
      const categoryCount = risks?.reduce((acc: Record<string, number>, risk) => {
        acc[risk.risk_category] = (acc[risk.risk_category] || 0) + 1;
        return acc;
      }, {}) || {};

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({
          category,
          count: count as number,
          trend: 'stable' as const // Implementar cálculo real de tendência
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Próximos prazos
      const upcomingDeadlines = actions?.filter(a => {
        const deadline = new Date(a.deadline);
        const now = new Date();
        const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > 0 && diffDays <= 7 && a.status !== 'Concluída';
      }).slice(0, 5) || [];

      setMetrics({
        total_risks: totalRisks,
        high_priority_risks: highPriorityRisks,
        overdue_actions: overdueActions,
        compliance_score: complianceScore,
        recent_activities: recentActivities,
        risk_trends: [], // Implementar cálculo de tendências
        top_categories: topCategories,
        upcoming_deadlines: upcomingDeadlines
      });
    } catch (error: any) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupQuickActions = () => {
    const actions: QuickAction[] = [
      {
        id: 'integrated_view',
        title: 'Visão Integrada',
        description: 'Gestão completa e integrada',
        icon: Activity,
        color: 'bg-blue-100 text-blue-800',
        action: () => setActiveTab('integrated')
      },
      {
        id: 'process_guide',
        title: 'Processo Guiado',
        description: 'Seguir processo passo-a-passo',
        icon: Target,
        color: 'bg-indigo-100 text-indigo-800',
        action: () => setActiveTab('process')
      },
      {
        id: 'new_risk',
        title: 'Novo Risco',
        description: 'Identificar e registrar novo risco',
        icon: Plus,
        color: 'bg-green-100 text-green-800',
        action: () => setActiveTab('management')
      },
      {
        id: 'alex_risk_process',
        title: 'Análise Alex Risk',
        description: 'Processo guiado por IA completo',
        icon: Brain,
        color: 'bg-purple-100 text-purple-800',
        action: () => {
          console.log('Alex Risk card clicked');
          setShowAlexRiskProcess(true);
        }
      },
      {
        id: 'ai_analysis',
        title: 'Análise IA',
        description: 'Executar análise inteligente',
        icon: Brain,
        color: 'bg-purple-100 text-purple-800',
        action: () => setActiveTab('analysis')
      },
      {
        id: 'advanced_analysis',
        title: 'Análise Avançada',
        description: 'Monte Carlo, FMEA, Bow-Tie',
        icon: Zap,
        color: 'bg-violet-100 text-violet-800',
        action: () => setActiveTab('advanced')
      },
      {
        id: 'risk_acceptance',
        title: 'Carta de Risco',
        description: 'Processo de aceitação de risco',
        icon: Shield,
        color: 'bg-emerald-100 text-emerald-800',
        action: () => setActiveTab('acceptance')
      },
      {
        id: 'library',
        title: 'Biblioteca',
        description: 'Acessar templates de riscos',
        icon: Library,
        color: 'bg-green-100 text-green-800',
        action: () => setActiveTab('library')
      },
      {
        id: 'reports',
        title: 'Relatórios',
        description: 'Gerar relatórios executivos',
        icon: FileText,
        color: 'bg-orange-100 text-orange-800',
        action: () => setActiveTab('reports')
      },
      {
        id: 'alex_chat',
        title: 'Consultar ALEX',
        description: 'Chat com especialista IA',
        icon: Brain,
        color: 'bg-indigo-100 text-indigo-800',
        action: () => {
          // Implementar abertura do chat
          toast({
            title: 'ALEX RISK',
            description: 'Olá! Como posso ajudar com a gestão de riscos hoje?',
          });
        }
      },
      {
        id: 'compliance',
        title: 'Compliance',
        description: 'Verificar conformidade',
        icon: CheckCircle,
        color: 'bg-teal-100 text-teal-800',
        action: () => {
          // Implementar verificação de compliance
          toast({
            title: 'Compliance Check',
            description: 'Iniciando verificação de conformidade...',
          });
        }
      }
    ];

    setQuickActions(actions);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>Centro de Gestão de Riscos</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Plataforma completa para identificação, análise, tratamento e monitoramento de riscos corporativos
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <ImprovedAIChatDialog 
            type="risk"
            context={{ 
              totalRisks: metrics?.total_risks || 0,
              highRisks: metrics?.high_priority_risks || 0,
              overdueActions: metrics?.overdue_actions || 0,
              complianceScore: metrics?.compliance_score || 0
            }}
            trigger={
              <Button variant="outline" className="flex items-center space-x-2 hover:bg-red-50 transition-colors">
                <div className="p-1 rounded-full bg-red-500">
                  <Brain className="h-3 w-3 text-white" />
                </div>
                <span>Consultar ALEX RISK</span>
                <Badge variant="secondary" className="text-xs">
                  IA
                </Badge>
              </Button>
            }
          />
          
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="integrated" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Integrado</span>
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Processo</span>
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Gestão</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Análise IA</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Avançada</span>
          </TabsTrigger>
          <TabsTrigger value="acceptance" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Carta Risco</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center space-x-2">
            <Library className="h-4 w-4" />
            <span>Biblioteca</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Relatórios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Riscos</p>
                      <p className="text-2xl font-bold">{metrics.total_risks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alta Prioridade</p>
                      <p className="text-2xl font-bold">{metrics.high_priority_risks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ações Atrasadas</p>
                      <p className="text-2xl font-bold">{metrics.overdue_actions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Compliance</p>
                      <p className="text-2xl font-bold">{formatPercentage(metrics.compliance_score)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                      onClick={action.action}
                    >
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                        {action.count && (
                          <Badge variant="secondary" className="text-xs">
                            {action.count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Atividades Recentes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.recent_activities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.risk_category} • {formatDate(activity.created_at)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.risk_level}
                      </Badge>
                    </div>
                  ))}
                  
                  {(!metrics?.recent_activities || metrics.recent_activities.length === 0) && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Risk Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Principais Categorias</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.top_categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">{category.count}</span>
                        <TrendingUp className={`h-4 w-4 ${
                          category.trend === 'up' ? 'text-red-500' :
                          category.trend === 'down' ? 'text-green-500' :
                          'text-gray-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                  
                  {(!metrics?.top_categories || metrics.top_categories.length === 0) && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Nenhuma categoria encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          {metrics?.upcoming_deadlines && metrics.upcoming_deadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Próximos Prazos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.upcoming_deadlines.map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium text-sm">{deadline.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Responsável: {deadline.responsible_person}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(deadline.deadline)}</p>
                        <Badge variant="outline" className="text-xs">
                          {deadline.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="integrated">
          <IntegratedRiskManagement />
        </TabsContent>

        <TabsContent value="process">
          <RiskProcessGuide onRiskCreated={(riskId) => {
            // Atualizar dashboard quando um risco é criado
            fetchDashboardData();
            toast({
              title: '🎯 Processo Atualizado',
              description: 'Risco integrado ao processo de gestão!',
            });
          }} />
        </TabsContent>

        <TabsContent value="management">
          <RiskManagementPage />
        </TabsContent>

        <TabsContent value="analysis">
          <RiskIntelligentAnalysis />
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedRiskAnalysis />
        </TabsContent>

        <TabsContent value="acceptance">
          <RiskAcceptanceLetter />
        </TabsContent>

        <TabsContent value="library">
          <RiskLibrary />
        </TabsContent>

        <TabsContent value="reports">
          <RiskReports />
        </TabsContent>
      </Tabs>
      
      {/* Modal Alex Risk Guided Process */}
      {showAlexRiskProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <AlexRiskTest
              onComplete={(riskData) => {
                setShowAlexRiskProcess(false);
                fetchDashboardData(); // Atualizar dashboard
                toast({
                  title: '🎉 Alex Risk Processo Concluído',
                  description: `Risco "${riskData.risk_title}" registrado com sucesso!`,
                });
              }}
              onCancel={() => setShowAlexRiskProcess(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};