import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { Assessment } from '@/hooks/useAssessments';

interface AssessmentStatsProps {
  assessments: Assessment[];
}

export const AssessmentStats: React.FC<AssessmentStatsProps> = ({ assessments }) => {
  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter(a => a.status === 'Concluído').length;
  const inProgressAssessments = assessments.filter(a => a.status === 'Em Andamento').length;
  const overdueAssessments = assessments.filter(a => {
    if (!a.due_date) return false;
    return new Date(a.due_date) < new Date() && a.status !== 'Concluído';
  }).length;

  const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
  const averageProgress = totalAssessments > 0 
    ? assessments.reduce((sum, a) => sum + (a.progress || 0), 0) / totalAssessments 
    : 0;

  const getFrameworkStats = () => {
    const frameworkMap: Record<string, number> = {};
    assessments.forEach(assessment => {
      const framework = assessment.framework?.short_name || 'Não definido';
      frameworkMap[framework] = (frameworkMap[framework] || 0) + 1;
    });
    return Object.entries(frameworkMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  };

  const topFrameworks = getFrameworkStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">
            {completedAssessments} de {totalAssessments} concluídos
          </div>
          <Progress value={completionRate} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageProgress.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">
            Todos os assessments
          </div>
          <Progress value={averageProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inProgressAssessments}</div>
          <div className="text-xs text-muted-foreground">
            Ativos no momento
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{overdueAssessments}</div>
          <div className="text-xs text-muted-foreground">
            Requerem atenção
          </div>
        </CardContent>
      </Card>

      {/* Framework Usage Stats */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-base">Frameworks Mais Utilizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topFrameworks.map(([framework, count], index) => (
              <div key={framework} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' : 
                    index === 1 ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm font-medium">{framework}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{count} assessments</span>
                  <div className="w-20">
                    <Progress 
                      value={(count / totalAssessments) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};