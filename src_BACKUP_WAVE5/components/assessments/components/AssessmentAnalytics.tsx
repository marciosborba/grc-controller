import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Assessment, AssessmentMetrics } from '@/types/assessment';
import { BarChart3, TrendingUp, Target, Award, PieChart, LineChart } from 'lucide-react';

interface AssessmentAnalyticsProps {
  assessments: Assessment[];
  metrics: AssessmentMetrics | null;
}

export function AssessmentAnalytics({ assessments, metrics }: AssessmentAnalyticsProps) {
  // Análise por framework
  const getFrameworkAnalysis = () => {
    const frameworkGroups: { [key: string]: Assessment[] } = {};
    
    assessments.forEach(assessment => {
      const frameworkName = assessment.framework?.nome || 'Não definido';
      if (!frameworkGroups[frameworkName]) {
        frameworkGroups[frameworkName] = [];
      }
      frameworkGroups[frameworkName].push(assessment);
    });
    
    return Object.entries(frameworkGroups).map(([framework, frameworkAssessments]) => ({
      framework,
      count: frameworkAssessments.length,
      avgMaturity: frameworkAssessments.reduce((sum, a) => sum + (a.percentual_maturidade || 0), 0) / frameworkAssessments.length,
      completed: frameworkAssessments.filter(a => a.status === 'concluido').length,
      totalGaps: frameworkAssessments.reduce((sum, a) => sum + (a.gaps_identificados || 0), 0)
    }));
  };

  // Análise de status
  const getStatusAnalysis = () => {
    const statusGroups: { [key: string]: number } = {};
    
    assessments.forEach(assessment => {
      statusGroups[assessment.status] = (statusGroups[assessment.status] || 0) + 1;
    });
    
    return Object.entries(statusGroups).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
      percentage: (count / assessments.length) * 100
    }));
  };

  // Análise de maturidade
  const getMaturityDistribution = () => {
    const levels = [
      { name: 'Inicial (1)', min: 0, max: 20, count: 0 },
      { name: 'Básico (2)', min: 20, max: 40, count: 0 },
      { name: 'Intermediário (3)', min: 40, max: 60, count: 0 },
      { name: 'Avançado (4)', min: 60, max: 80, count: 0 },
      { name: 'Otimizado (5)', min: 80, max: 100, count: 0 }
    ];
    
    assessments.forEach(assessment => {
      if (assessment.percentual_maturidade) {
        const level = levels.find(l => 
          assessment.percentual_maturidade >= l.min && assessment.percentual_maturidade < l.max
        ) || levels[levels.length - 1];
        level.count++;
      }
    });
    
    return levels;
  };

  // Tendência temporal
  const getTemporalTrend = () => {
    const monthlyData: { [key: string]: { completed: number; started: number } } = {};
    
    assessments.forEach(assessment => {
      if (assessment.created_at) {
        const date = new Date(assessment.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { completed: 0, started: 0 };
        }
        
        monthlyData[monthKey].started++;
        
        if (assessment.status === 'concluido') {
          monthlyData[monthKey].completed++;
        }
      }
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Últimos 6 meses
  };

  const frameworkAnalysis = getFrameworkAnalysis();
  const statusAnalysis = getStatusAnalysis();
  const maturityDistribution = getMaturityDistribution();
  const temporalTrend = getTemporalTrend();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Analytics e Insights</h2>
      </div>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">
                  {metrics ? Math.round((metrics.completed_assessments / metrics.total_assessments) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Maturidade Média</p>
                <p className="text-2xl font-bold">
                  {metrics ? Math.round(metrics.average_maturity) : 0}%
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gaps Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics?.critical_gaps || 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frameworks Ativos</p>
                <p className="text-2xl font-bold">
                  {metrics?.frameworks_count || 0}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise por Framework */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Análise por Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {frameworkAnalysis.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.framework}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.count} assessments • {item.completed} concluídos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">
                      {Math.round(item.avgMaturity)}%
                    </p>
                    <p className="text-xs text-muted-foreground">maturidade</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusAnalysis.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="capitalize">{item.status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Maturidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Níveis de Maturidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {maturityDistribution.map((level, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{level.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${assessments.length > 0 ? (level.count / assessments.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {level.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendência Temporal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Tendência dos Últimos Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {temporalTrend.map(([month, data], index) => {
                const [year, monthNum] = month.split('-');
                const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{monthName}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{data.started}</p>
                        <p className="text-xs text-muted-foreground">iniciados</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">{data.completed}</p>
                        <p className="text-xs text-muted-foreground">concluídos</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle>Insights e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <h4 className="font-semibold text-blue-700">Performance Geral</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics && metrics.average_maturity > 70 
                  ? 'Organização com alta maturidade' 
                  : metrics && metrics.average_maturity > 50
                  ? 'Maturidade em desenvolvimento'
                  : 'Oportunidades de melhoria significativas'}
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-blue-700">Foco Prioritário</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {metrics && metrics.critical_gaps > 5
                  ? 'Resolução de gaps críticos'
                  : metrics && metrics.active_assessments > metrics.completed_assessments
                  ? 'Conclusão de assessments pendentes'
                  : 'Manutenção e meloria contínua'}
              </p>
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-blue-700">Próximos Passos</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {assessments.length === 0
                  ? 'Iniciar primeiros assessments'
                  : frameworkAnalysis.length === 1
                  ? 'Expandir para novos frameworks'
                  : 'Implementar planos de ação'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}