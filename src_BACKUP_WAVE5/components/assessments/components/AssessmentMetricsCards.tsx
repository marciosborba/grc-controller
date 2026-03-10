import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Award,
  BarChart3,
  Users,
  BookOpen
} from 'lucide-react';
import { AssessmentMetrics } from '@/types/assessment';

interface AssessmentMetricsCardsProps {
  metrics: AssessmentMetrics | null;
  loading: boolean;
}

export function AssessmentMetricsCards({ metrics, loading }: AssessmentMetricsCardsProps) {
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total de Assessments',
      value: metrics.total_assessments,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Avaliações cadastradas',
      trend: metrics.total_assessments > 0 ? '+12%' : null
    },
    {
      title: 'Assessments Ativos',
      value: metrics.active_assessments,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Em andamento',
      progress: metrics.total_assessments > 0 ? (metrics.active_assessments / metrics.total_assessments) * 100 : 0
    },
    {
      title: 'Assessments Concluídos',
      value: metrics.completed_assessments,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Finalizados',
      progress: metrics.total_assessments > 0 ? (metrics.completed_assessments / metrics.total_assessments) * 100 : 0
    },
    {
      title: 'Maturidade Média',
      value: `${Math.round(metrics.average_maturity)}%`,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Nível organizacional',
      progress: metrics.average_maturity,
      isPercentage: true
    }
  ];

  const secondaryMetrics = [
    {
      title: 'Frameworks Ativos',
      value: metrics.frameworks_count,
      icon: BookOpen,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Frameworks disponíveis'
    },
    {
      title: 'Gaps Identificados',
      value: metrics.total_gaps,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Oportunidades de melhoria',
      badge: metrics.critical_gaps > 0 ? `${metrics.critical_gaps} críticos` : null
    },
    {
      title: 'Planos de Ação',
      value: metrics.action_plans_count,
      icon: Target,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      description: 'Ações planejadas',
      progress: metrics.action_plans_count > 0 ? (metrics.completed_actions / metrics.action_plans_count) * 100 : 0
    },
    {
      title: 'Taxa de Execução',
      value: metrics.total_assessments > 0 ? `${Math.round((metrics.completed_assessments / metrics.total_assessments) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'Conclusão de assessments',
      isPercentage: true
    }
  ];

  const renderMetricCard = (metric: any, index: number) => (
    <Card key={index} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-full ${metric.bgColor}`}>
            <metric.icon className={`h-6 w-6 ${metric.color}`} />
          </div>
          {metric.trend && (
            <Badge variant="outline" className="text-green-600">
              {metric.trend}
            </Badge>
          )}
          {metric.badge && (
            <Badge variant="outline" className="text-orange-600">
              {metric.badge}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {metric.title}
          </p>
          <p className="text-2xl font-bold">
            {metric.value}
          </p>
          <p className="text-xs text-muted-foreground">
            {metric.description}
          </p>
          
          {metric.progress !== undefined && (
            <div className="pt-2">
              <Progress 
                value={metric.progress} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(metric.progress)}% {metric.isPercentage ? 'da meta' : 'completo'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Métricas Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map(renderMetricCard)}
        </div>
      </div>

      {/* Métricas Secundárias */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Indicadores Avançados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryMetrics.map(renderMetricCard)}
        </div>
      </div>

      {/* Insights */}
      {metrics.total_assessments > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Insights do Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-semibold text-blue-700">Performance</p>
                <p className="text-muted-foreground">
                  {metrics.average_maturity > 75 ? 'Excelente' : 
                   metrics.average_maturity > 50 ? 'Boa' : 
                   metrics.average_maturity > 25 ? 'Regular' : 'Precisa Atenção'}
                </p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-blue-700">Foco</p>
                <p className="text-muted-foreground">
                  {metrics.critical_gaps > 5 ? 'Gaps Críticos' :
                   metrics.active_assessments > metrics.completed_assessments ? 'Execução' :
                   'Manutenção'}
                </p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-blue-700">Próximos Passos</p>
                <p className="text-muted-foreground">
                  {metrics.active_assessments === 0 ? 'Iniciar Assessments' :
                   metrics.total_gaps > 10 ? 'Implementar Ações' :
                   'Monitorar Progresso'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}