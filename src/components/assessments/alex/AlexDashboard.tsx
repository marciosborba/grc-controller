/**
 * ALEX DASHBOARD - Dashboard adaptativo por role
 * 
 * Dashboard inteligente que se adapta ao perfil do usuário
 * Executivos veem métricas estratégicas, auditores veem workload operacional
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Award,
  Activity,
  Calendar,
  FileText,
  Brain,
  Zap,
  Shield,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { useAlexAssessment } from '@/hooks/useAlexAssessment';
import { useIsMobile } from '@/hooks/use-mobile';

interface AlexDashboardProps {
  searchTerm: string;
  selectedCategory: string;
  userRole: string;
}

const AlexDashboard: React.FC<AlexDashboardProps> = ({
  searchTerm,
  selectedCategory,
  userRole
}) => {
  const isMobile = useIsMobile();
  const { generateAnalytics, isGeneratingAnalytics } = useAlexAssessment();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('overview');

  // User role detection
  const isExecutive = ['ceo', 'ciso', 'cro', 'admin'].includes(userRole);
  const isAuditor = ['auditor', 'risk_manager'].includes(userRole);
  const isRespondent = ['user', 'respondent'].includes(userRole);

  // Mock data for demonstration (would come from analytics function)
  const mockMetrics = {
    total_assessments: 24,
    completed_assessments: 18,
    in_progress_assessments: 4,
    overdue_assessments: 2,
    avg_completion_rate: 78.5,
    avg_maturity_score: 3.2,
    compliance_trend: 'improving',
    risk_score: 68,
    upcoming_deadlines: 6,
    ai_recommendations: 12,
    team_performance: 85,
    benchmark_position: 'top_quartile'
  };

  useEffect(() => {
    // Load dashboard data on mount
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await generateAnalytics({
        analysis_type: 'assessment_progress',
        time_range: {
          start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        }
      });
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Executive Dashboard Components
  const ExecutiveMetrics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Score</p>
              <p className="text-3xl font-bold text-blue-600">{mockMetrics.avg_completion_rate}%</p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5.2% vs mês anterior
              </div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Score</p>
              <p className="text-3xl font-bold text-green-600">{mockMetrics.risk_score}</p>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <TrendingDown className="h-4 w-4 mr-1" />
                -12% risk reduction
              </div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Performance</p>
              <p className="text-3xl font-bold text-purple-600">{mockMetrics.team_performance}%</p>
              <div className="flex items-center text-sm text-purple-600 mt-1">
                <Star className="h-4 w-4 mr-1" />
                Top quartile industry
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">IA Insights</p>
              <p className="text-3xl font-bold text-orange-600">{mockMetrics.ai_recommendations}</p>
              <div className="flex items-center text-sm text-orange-600 mt-1">
                <Brain className="h-4 w-4 mr-1" />
                Recomendações ativas
              </div>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Sparkles className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Auditor Dashboard Components
  const AuditorWorkload = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Minha Workload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <div>
              <p className="font-medium">Pendentes de Revisão</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aguardando sua análise</p>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              8 itens
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div>
              <p className="font-medium">Em Andamento</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Auditorias ativas</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              3 assessments
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div>
              <p className="font-medium">Concluídos (30d)</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Auditorias finalizadas</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              15 assessments
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximos Prazos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">ISO 27001 Review</p>
              <p className="text-sm text-gray-600">Vence em 2 dias</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">SOC 2 Audit</p>
              <p className="text-sm text-gray-600">Vence em 5 dias</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">LGPD Assessment</p>
              <p className="text-sm text-gray-600">Vence em 1 semana</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Respondent Dashboard Components  
  const RespondentTasks = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Minhas Tarefas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950 rounded-r">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-red-700 dark:text-red-300">Urgente</h4>
              <Badge variant="destructive">2 dias restantes</Badge>
            </div>
            <p className="text-sm mb-3">Controle A.8.1 - Gerenciamento de Acesso</p>
            <div className="flex items-center gap-2">
              <Progress value={60} className="flex-1" />
              <span className="text-sm text-gray-600">60%</span>
            </div>
          </div>
          
          <div className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950 rounded-r">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Em Andamento</h4>
              <Badge variant="secondary">5 dias restantes</Badge>
            </div>
            <p className="text-sm mb-3">Controle A.12.1 - Desenvolvimento Seguro</p>
            <div className="flex items-center gap-2">
              <Progress value={30} className="flex-1" />
              <span className="text-sm text-gray-600">30%</span>
            </div>
          </div>
          
          <div className="p-4 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950 rounded-r">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-700 dark:text-green-300">Concluído</h4>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completo
              </Badge>
            </div>
            <p className="text-sm mb-3">Controle A.5.1 - Políticas de Segurança</p>
            <div className="flex items-center gap-2">
              <Progress value={100} className="flex-1" />
              <span className="text-sm text-gray-600">100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            IA Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Sugestão IA</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Para o controle A.8.1, considere implementar MFA para contas privilegiadas.
            </p>
            <Button size="sm" className="mt-2 w-full">Ver Detalhes</Button>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Benchmarking</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sua performance está 15% acima da média do setor.
            </p>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              Ver Comparação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Common components
  const RecentActivity = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Assessment ISO 27001 concluído</p>
            <p className="text-xs text-gray-500">há 2 horas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
            <Brain className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">IA gerou 3 novas recomendações</p>
            <p className="text-xs text-gray-500">há 4 horas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded">
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Novo usuário adicionado ao assessment</p>
            <p className="text-xs text-gray-500">ontem</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Role-based dashboard content */}
      {isExecutive && (
        <div className="space-y-6">
          <ExecutiveMetrics />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Compliance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  [Gráfico de Tendência de Compliance]
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Benchmarking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">vs. Média do Setor</span>
                    <span className="font-semibold text-green-600">+15%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">vs. Top 25%</span>
                    <span className="font-semibold text-blue-600">+5%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <RecentActivity />
        </div>
      )}

      {isAuditor && (
        <div className="space-y-6">
          <AuditorWorkload />
          <RecentActivity />
        </div>
      )}

      {isRespondent && (
        <div className="space-y-6">
          <RespondentTasks />
          <RecentActivity />
        </div>
      )}

      {/* Default dashboard for other roles */}
      {!isExecutive && !isAuditor && !isRespondent && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Assessments</p>
                    <p className="text-2xl font-bold">{mockMetrics.total_assessments}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Concluídos</p>
                    <p className="text-2xl font-bold">{mockMetrics.completed_assessments}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Andamento</p>
                    <p className="text-2xl font-bold">{mockMetrics.in_progress_assessments}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Atrasados</p>
                    <p className="text-2xl font-bold">{mockMetrics.overdue_assessments}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <RecentActivity />
        </div>
      )}
    </div>
  );
};

export default AlexDashboard;