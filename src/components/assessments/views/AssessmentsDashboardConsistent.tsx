import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield,
  CheckCircle,
  Clock,
  Target,
  AlertTriangle,
  TrendingUp,
  Activity,
  FileText,
  Settings,
  BarChart3,
  Users,
  Calendar,
  ChevronRight,
  Plus,
  Filter,
  Search,
  BookOpen,
  Award,
  Zap,
  Eye,
  Play,
  AlertCircle
} from 'lucide-react';

interface AssessmentMetrics {
  totalAssessments: number;
  activeAssessments: number;
  completedAssessments: number;
  averageMaturity: number;
  totalFrameworks: number;
  pendingActionPlans: number;
  overdueAssessments: number;
  upcomingAssessments: number;
  monthlyTrend: number;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
  count?: number;
}

export default function AssessmentsDashboardConsistent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AssessmentMetrics>({
    totalAssessments: 0,
    activeAssessments: 0,
    completedAssessments: 0,
    averageMaturity: 0,
    totalFrameworks: 4, // Templates disponíveis
    pendingActionPlans: 0,
    overdueAssessments: 0,
    upcomingAssessments: 0,
    monthlyTrend: 0
  });

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const quickActions: QuickAction[] = [
    {
      title: 'Novo Assessment',
      description: 'Iniciar avaliação de maturidade',
      icon: Plus,
      color: 'blue',
      action: () => navigate('/assessments/list'),
      count: 0
    },
    {
      title: 'Frameworks',
      description: 'Gerenciar frameworks de compliance',
      icon: BookOpen,
      color: 'green',
      action: () => navigate('/assessments/frameworks'),
      count: metrics.totalFrameworks
    },
    {
      title: 'Execução de Assessments',
      description: 'Continuar assessments em andamento',
      icon: Play,
      color: 'purple',
      action: () => navigate('/assessments/list'),
      count: metrics.activeAssessments
    },
    {
      title: 'Planos de Ação',
      description: 'Gestão de gaps e melhorias',
      icon: Target,
      color: 'orange',
      action: () => navigate('/assessments/action-plans'),
      count: metrics.pendingActionPlans
    },
    {
      title: 'Biblioteca de Questões',
      description: 'Catálogo de questões por framework',
      icon: FileText,
      color: 'teal',
      action: () => navigate('/assessments/questions'),
      count: 0
    },
    {
      title: 'Relatórios',
      description: 'Dashboards e relatórios executivos',
      icon: BarChart3,
      color: 'indigo',
      action: () => navigate('/assessments/reports'),
      count: metrics.completedAssessments
    },
    {
      title: 'Configurações',
      description: 'Configurar metodologias e pesos',
      icon: Settings,
      color: 'slate',
      action: () => navigate('/assessments/settings'),
      count: 0
    }
  ];

  const getMaturityLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'Otimizado', color: 'text-green-600' };
    if (percentage >= 60) return { level: 'Gerenciado', color: 'text-blue-600' };
    if (percentage >= 40) return { level: 'Definido', color: 'text-yellow-600' };
    if (percentage >= 20) return { level: 'Inicial', color: 'text-orange-600' };
    return { level: 'Inexistente', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando dashboard de assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Seguindo padrão dos outros módulos */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Assessments</h1>
          <p className="text-muted-foreground">Central de Avaliação de Maturidade e Compliance</p>
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Assessment
          </Button>
        </div>
      </div>

      {/* Métricas Principais - Seguindo padrão do Compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maturidade Média</p>
                <p className="text-2xl font-bold text-green-600">{metrics.averageMaturity}%</p>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {metrics.monthlyTrend >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1 text-red-600 rotate-180" />
                  )}
                  {Math.abs(metrics.monthlyTrend).toFixed(1)}% vs mês anterior
                </p>
              </div>
              <Shield className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-2xl font-bold">{metrics.totalAssessments}</p>
              </div>
              <Activity className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assessments Ativos</p>
                <p className="text-2xl font-bold">{metrics.activeAssessments}</p>
              </div>
              <Play className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{metrics.completedAssessments}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks</p>
                <p className="text-2xl font-bold text-indigo-600">{metrics.totalFrameworks}</p>
              </div>
              <BookOpen className="h-10 w-10 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planos de Ação</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.pendingActionPlans}</p>
              </div>
              <Target className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">{metrics.overdueAssessments}</p>
              </div>
              <Clock className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximos</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.upcomingAssessments}</p>
              </div>
              <Calendar className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Módulos de Assessment - Seguindo padrão do Compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => navigate('/assessments/frameworks')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Frameworks</h3>
            <p className="text-muted-foreground text-sm">Gestão de frameworks de compliance e maturidade</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => navigate('/assessments/list')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Play className="h-8 w-8 text-green-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Execução</h3>
            <p className="text-muted-foreground text-sm">Executar e acompanhar assessments</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => navigate('/assessments/action-plans')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-orange-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Planos de Ação</h3>
            <p className="text-muted-foreground text-sm">Gestão de gaps e planos de melhoria</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden" 
              onClick={() => navigate('/assessments/reports')}>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Relatórios</h3>
            <p className="text-muted-foreground text-sm">Dashboards e relatórios executivos</p>
          </CardContent>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
               style={{ background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)' }}></div>
        </Card>
      </div>

      {/* Quick Actions Grid - Seguindo padrão do Privacy */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Funcionalidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/30 group relative overflow-hidden" onClick={action.action}>
              <CardHeader className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-${action.color}-100 dark:bg-${action.color}-900/20`}>
                    <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    {action.count !== undefined && action.count > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{action.count}</Badge>
                    )}
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
                <CardTitle className="text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">{action.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm leading-tight">{action.description}</CardDescription>
              </CardHeader>
              
              {/* Efeito de hover - gradiente dinâmico */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(to right, hsl(var(--primary) / 0.15), transparent)'
              }} />
            </Card>
          ))}
        </div>
      </div>

      {/* Assessment Overview - Seguindo padrão do Privacy */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Maturidade Organizacional
            </CardTitle>
            <CardDescription>
              Avaliação do nível de maturidade por framework
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Maturidade Geral</span>
                <span>{metrics.averageMaturity}%</span>
              </div>
              <Progress value={metrics.averageMaturity} className="h-2" />
              <p className={`text-sm font-medium ${getMaturityLevel(metrics.averageMaturity).color}`}>
                Nível: {getMaturityLevel(metrics.averageMaturity).level}
              </p>
            </div>
            
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  <span>Frameworks Ativos</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">{metrics.totalFrameworks}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                  <span>Assessments Pendentes</span>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{metrics.activeAssessments}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                  <span>Planos de Ação</span>
                </div>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">{metrics.pendingActionPlans}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Ações Prioritárias
            </CardTitle>
            <CardDescription>
              Próximas tarefas para manter compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Assessments em atraso */}
              {metrics.overdueAssessments > 0 ? (
                <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-200">Assessments em Atraso</p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {metrics.overdueAssessments} assessments ultrapassaram o prazo
                    </p>
                    <Button size="sm" className="mt-2" onClick={() => navigate('/assessments/execution')}>
                      Ver Assessments
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800 dark:text-green-200">Nenhum Assessment em Atraso</p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Todos os assessments estão dentro do prazo
                    </p>
                  </div>
                </div>
              )}

              {/* Planos de ação pendentes */}
              {metrics.pendingActionPlans > 0 ? (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
                  <Target className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-800 dark:text-orange-200">Planos de Ação Pendentes</p>
                    <p className="text-sm text-orange-600 dark:text-orange-300">
                      {metrics.pendingActionPlans} planos aguardam implementação
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/assessments/action-plans')}>
                      Ver Planos
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Próximos assessments */}
              {metrics.upcomingAssessments > 0 ? (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800 dark:text-blue-200">Assessments Programados</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {metrics.upcomingAssessments} assessments programados para os próximos 30 dias
                    </p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate('/assessments/execution')}>
                      Ver Cronograma
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Estado de sucesso */}
              {metrics.overdueAssessments === 0 && metrics.pendingActionPlans === 0 && metrics.upcomingAssessments === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-medium text-green-800 mb-2">Excelente Gestão!</h3>
                  <p className="text-sm text-green-600">
                    Todos os assessments estão em dia. Continue monitorando regularmente.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Frameworks Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Frameworks Disponíveis</CardTitle>
          <CardDescription>
            Templates de frameworks prontos para uso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'ISO 27001:2022', type: 'ISO27001', color: 'bg-blue-100 text-blue-800', domains: 14, controls: 93 },
              { name: 'SOX', type: 'SOX', color: 'bg-green-100 text-green-800', domains: 5, controls: 15 },
              { name: 'NIST CSF', type: 'NIST', color: 'bg-purple-100 text-purple-800', domains: 5, controls: 23 },
              { name: 'LGPD', type: 'LGPD', color: 'bg-red-100 text-red-800', domains: 5, controls: 12 }
            ].map((framework) => (
              <div key={framework.type} className="flex flex-col gap-3 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/assessments/frameworks')}>
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-gray-100 rounded">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <Badge className={framework.color} variant="secondary">
                    {framework.type}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-sm">{framework.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {framework.domains} domínios • {framework.controls} controles
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}