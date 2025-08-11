import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Users,
  Calendar,
  Target,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAssessments } from '@/hooks/useAssessments';
import { useIsMobile } from '@/hooks/use-mobile';

interface MaturityDistribution {
  level: number;
  count: number;
  percentage: number;
  label: string;
}

interface FrameworkStats {
  name: string;
  totalAssessments: number;
  avgMaturity: number;
  completedAssessments: number;
}

export const AssessmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { assessments, isLoading } = useAssessments();
  const isMobile = useIsMobile();
  const [maturityDistribution, setMaturityDistribution] = useState<MaturityDistribution[]>([]);
  const [frameworkStats, setFrameworkStats] = useState<FrameworkStats[]>([]);

  useEffect(() => {
    if (assessments) {
      calculateMaturityDistribution();
      calculateFrameworkStats();
    }
  }, [assessments]);

  const calculateMaturityDistribution = () => {
    const levels = [1, 2, 3, 4, 5];
    const labels = ['Inicial', 'Repetível', 'Definido', 'Gerenciado', 'Otimizado'];
    const distribution = levels.map((level, index) => ({
      level,
      count: 0,
      percentage: 0,
      label: labels[index]
    }));

    // Aqui você implementaria o cálculo baseado nos dados reais
    // Por enquanto, usando dados mockados
    distribution[0] = { level: 1, count: 5, percentage: 20, label: 'Inicial' };
    distribution[1] = { level: 2, count: 8, percentage: 32, label: 'Repetível' };
    distribution[2] = { level: 3, count: 7, percentage: 28, label: 'Definido' };
    distribution[3] = { level: 4, count: 3, percentage: 12, label: 'Gerenciado' };
    distribution[4] = { level: 5, count: 2, percentage: 8, label: 'Otimizado' };

    setMaturityDistribution(distribution);
  };

  const calculateFrameworkStats = () => {
    if (!assessments) return;

    const frameworkMap = new Map<string, FrameworkStats>();

    assessments.forEach(assessment => {
      const frameworkName = assessment.framework?.name || 'Desconhecido';
      
      if (!frameworkMap.has(frameworkName)) {
        frameworkMap.set(frameworkName, {
          name: frameworkName,
          totalAssessments: 0,
          avgMaturity: 0,
          completedAssessments: 0
        });
      }

      const stats = frameworkMap.get(frameworkName)!;
      stats.totalAssessments++;
      
      if (assessment.status === 'Concluído') {
        stats.completedAssessments++;
      }
    });

    setFrameworkStats(Array.from(frameworkMap.values()));
  };

  const getOverallStats = () => {
    if (!assessments) return { total: 0, completed: 0, inProgress: 0, overdue: 0 };

    const today = new Date();
    return {
      total: assessments.length,
      completed: assessments.filter(a => a.status === 'Concluído').length,
      inProgress: assessments.filter(a => a.status === 'Em Andamento').length,
      overdue: assessments.filter(a => a.due_date && new Date(a.due_date) < today && a.status !== 'Concluído').length
    };
  };

  const stats = getOverallStats();
  const avgProgress = assessments ? 
    Math.round(assessments.reduce((acc, a) => acc + (a.progress || 0), 0) / assessments.length) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight`}>
            Dashboard de Assessments
          </h1>
          <p className="text-muted-foreground">
            Visão geral do estado dos seus assessments de conformidade
          </p>
        </div>
        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'gap-2'}`}>
          <Button
            variant="outline"
            onClick={() => navigate('/assessments/manage')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Gerenciar Assessments
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Assessments ativos
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Maturity Distribution */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição de Maturidade CMMI
            </CardTitle>
            <CardDescription>
              Níveis de maturidade dos controles avaliados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {maturityDistribution.map((item) => (
              <div key={item.level} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-12 justify-center">
                      {item.level}
                    </Badge>
                    <span>{item.label}</span>
                  </div>
                  <span className="font-medium">{item.count} ({item.percentage}%)</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Framework Statistics */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Estatísticas por Framework
            </CardTitle>
            <CardDescription>
              Performance dos diferentes frameworks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {frameworkStats.slice(0, 5).map((framework, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{framework.name}</span>
                  <Badge variant="secondary">
                    {framework.completedAssessments}/{framework.totalAssessments}
                  </Badge>
                </div>
                <Progress 
                  value={framework.totalAssessments > 0 
                    ? (framework.completedAssessments / framework.totalAssessments) * 100 
                    : 0
                  } 
                  className="h-2" 
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assessments Recentes
          </CardTitle>
          <CardDescription>
            Últimos assessments criados ou modificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments?.slice(0, 5).map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{assessment.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Framework: {assessment.framework?.short_name || 'N/A'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{assessment.status}</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/assessments/${assessment.id}`)}
                  >
                    Abrir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};