import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react';
import type { RiskMetrics } from '@/types/risk-management';

interface QuickMetricsProps {
  metrics?: RiskMetrics;
  isLoading?: boolean;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({ metrics, isLoading }) => {
  console.log('🔍 QuickMetrics Debug DETALHADO:', {
    isLoading,
    hasMetrics: !!metrics,
    metricsData: metrics,
    metricsKeys: metrics ? Object.keys(metrics) : [],
    totalRisks: metrics?.totalRisks,
    risksByLevel: metrics?.risksByLevel,
    risksByStatus: metrics?.risksByStatus
  });

  // Se não tiver métricas, criar métricas padrão
  const defaultMetrics: RiskMetrics = {
    totalRisks: 0,
    risksByLevel: {
      'Muito Alto': 0,
      'Alto': 0,
      'Médio': 0,
      'Baixo': 0,
      'Muito Baixo': 0
    },
    risksByCategory: {} as any,
    risksByStatus: {
      'Identificado': 0,
      'Avaliado': 0,
      'Em Tratamento': 0,
      'Monitorado': 0,
      'Fechado': 0,
      'Reaberto': 0
    },
    overdueActivities: 0,
    riskTrend: 'Estável',
    averageResolutionTime: 0
  };

  const currentMetrics = metrics || defaultMetrics;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950 dark:bg-opacity-50';
      case 'Alto': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950 dark:bg-opacity-50';
      case 'Médio': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950 dark:bg-opacity-50';
      case 'Baixo': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950 dark:bg-opacity-50';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-950 dark:bg-opacity-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Aumentando': return <TrendingUp className="h-4 w-4 text-red-500 dark:text-red-400" />;
      case 'Diminuindo': return <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400 transform rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  const metricsData = [
    {
      id: 'total',
      title: 'Total de Riscos',
      value: currentMetrics.totalRisks,
      icon: Shield,
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950 dark:bg-opacity-50',
      description: 'Riscos identificados'
    },
    {
      id: 'muito-alto',
      title: 'Muito Alto',
      value: currentMetrics.risksByLevel['Muito Alto'] || 0,
      icon: XCircle,
      color: getRiskLevelColor('Muito Alto'),
      description: 'Atenção imediata'
    },
    {
      id: 'alto',
      title: 'Alto',
      value: currentMetrics.risksByLevel['Alto'] || 0,
      icon: AlertTriangle,
      color: getRiskLevelColor('Alto'),
      description: 'Prioridade alta'
    },
    {
      id: 'em-tratamento',
      title: 'Em Tratamento',
      value: currentMetrics.risksByStatus['Em Tratamento'] || 0,
      icon: Activity,
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950 dark:bg-opacity-50',
      description: 'Ações em progresso'
    },
    {
      id: 'atrasados',
      title: 'Atrasados',
      value: currentMetrics.overdueActivities,
      icon: Clock,
      color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950 dark:bg-opacity-50',
      description: 'Ações vencidas'
    },
    {
      id: 'tendencia',
      title: 'Tendência',
      value: currentMetrics.riskTrend,
      icon: () => getTrendIcon(currentMetrics.riskTrend),
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950 dark:bg-opacity-50',
      description: 'Evolução geral',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Risk Trend Storytelling */}
      <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
        <div className={`absolute top-0 right-0 p-3 opacity-10`}>
          <Activity className="h-24 w-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg font-bold flex items-center gap-2 ${currentMetrics.totalRisks > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            Panorama de Riscos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-foreground">{currentMetrics.totalRisks}</span>
            <span className="text-sm text-muted-foreground">riscos mapeados</span>
          </div>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            {currentMetrics.risksByLevel['Muito Alto'] > 0
              ? `${currentMetrics.risksByLevel['Muito Alto']} riscos críticos requerem atenção imediata.`
              : 'Nenhum risco crítico identificado no momento. O ambiente está estável.'}
          </p>
          <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentMetrics.risksByLevel['Muito Alto'] > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {currentMetrics.risksByLevel['Muito Alto'] > 0 ? 'Ação Necessária' : 'Sob Controle'}
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Highest Risk Level (Critical Data) */}
      <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-500/50">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <AlertTriangle className="h-24 w-24 text-red-500" />
        </div>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Riscos Críticos</p>
            <h3 className="text-3xl font-bold text-red-600 dark:text-red-500">
              {currentMetrics.risksByLevel['Muito Alto'] || 0}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              + {currentMetrics.risksByLevel['Alto'] || 0} de nível Alto
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: In Treatment (Operational Status) */}
      <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingUp className="h-24 w-24 text-blue-500" />
        </div>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
            <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Em Tratamento</p>
            <h3 className="text-3xl font-bold text-foreground">
              {currentMetrics.risksByStatus['Em Tratamento'] || 0}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Planos de ação ativos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Overdue Activities (Alert) */}
      <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group">
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="h-24 w-24 text-orange-500" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-foreground">
            Status de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${currentMetrics.overdueActivities > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {currentMetrics.overdueActivities}
            </span>
            <span className="text-sm text-muted-foreground">atrasadas</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {currentMetrics.overdueActivities > 0 ? 'Existem atividades fora do prazo.' : 'Todas as atividades em dia.'}
          </p>
          <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${currentMetrics.overdueActivities > 0 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: currentMetrics.overdueActivities > 0 ? '70%' : '100%' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};