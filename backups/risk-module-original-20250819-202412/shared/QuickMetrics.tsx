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
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="w-8 h-5 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Muito Alto': return 'text-red-600 bg-red-100';
      case 'Alto': return 'text-orange-600 bg-orange-100';
      case 'Médio': return 'text-yellow-600 bg-yellow-100';
      case 'Baixo': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Aumentando': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'Diminuindo': return <TrendingUp className="h-4 w-4 text-green-500 transform rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const metricsData = [
    {
      id: 'total',
      title: 'Total de Riscos',
      value: metrics.totalRisks,
      icon: Shield,
      color: 'text-blue-600 bg-blue-100',
      description: 'Riscos identificados'
    },
    {
      id: 'muito-alto',
      title: 'Muito Alto',
      value: metrics.risksByLevel['Muito Alto'] || 0,
      icon: XCircle,
      color: getRiskLevelColor('Muito Alto'),
      description: 'Atenção imediata'
    },
    {
      id: 'alto',
      title: 'Alto',
      value: metrics.risksByLevel['Alto'] || 0,
      icon: AlertTriangle,
      color: getRiskLevelColor('Alto'),
      description: 'Prioridade alta'
    },
    {
      id: 'em-tratamento',
      title: 'Em Tratamento',
      value: metrics.risksByStatus['Em Tratamento'] || 0,
      icon: Activity,
      color: 'text-blue-600 bg-blue-100',
      description: 'Ações em progresso'
    },
    {
      id: 'atrasados',
      title: 'Atrasados',
      value: metrics.overdueActivities,
      icon: Clock,
      color: 'text-red-600 bg-red-100',
      description: 'Ações vencidas'
    },
    {
      id: 'tendencia',
      title: 'Tendência',
      value: metrics.riskTrend,
      icon: () => getTrendIcon(metrics.riskTrend),
      color: 'text-purple-600 bg-purple-100',
      description: 'Evolução geral',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        
        return (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {metric.title}
                  </p>
                  <p className="text-lg font-bold truncate">
                    {metric.isText ? metric.value : metric.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {metric.description}
                  </p>
                </div>
              </div>
              
              {/* Indicador de prioridade para riscos críticos */}
              {(metric.id === 'muito-alto' || metric.id === 'atrasados') && metric.value > 0 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs">
                    Requer Atenção
                  </Badge>
                </div>
              )}
              
              {/* Indicador positivo para riscos em tratamento */}
              {metric.id === 'em-tratamento' && metric.value > 0 && (
                <div className="mt-2">
                  <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
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