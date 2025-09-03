import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    risksByCategory: {},
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        const showSkeleton = isLoading && !metrics && (metric.id === 'atrasados');
        
        return (
          <Card key={metric.id} className="hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-gray-900/20 transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <Icon className="h-5 w-5 text-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {metric.title}
                  </p>
                  {showSkeleton ? (
                    <div className="w-8 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  ) : (
                    <p className="text-lg font-bold truncate text-foreground">
                      {metric.isText ? metric.value : metric.value.toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {metric.description}
                  </p>
                </div>
              </div>
              
              {!showSkeleton && (metric.id === 'muito-alto' || metric.id === 'atrasados') && metric.value > 0 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:bg-opacity-50 dark:text-red-400">
                    Requer Atenção
                  </Badge>
                </div>
              )}
              
              {!showSkeleton && metric.id === 'em-tratamento' && metric.value > 0 && (
                <div className="mt-2">
                  <Badge variant="default" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:bg-opacity-50 dark:text-blue-400">
                    Progresso Ativo
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};