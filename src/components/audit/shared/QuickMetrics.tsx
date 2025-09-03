import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle,
  Brain,
  Clock,
  Target
} from 'lucide-react';
import type { AuditMetrics } from '@/hooks/useAuditManagement';

interface QuickMetricsProps {
  metrics?: AuditMetrics;
  isLoading?: boolean;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({ metrics, isLoading }) => {
  // Métricas padrão se não tiver dados
  const defaultMetrics: AuditMetrics = {
    totalAudits: 0,
    auditsByStatus: {
      'Planning': 0,
      'Fieldwork': 0,
      'Review': 0,
      'Reporting': 0,
      'Closed': 0
    },
    auditsByType: {},
    auditsByPriority: {
      'Critical': 0,
      'High': 0,
      'Medium': 0,
      'Low': 0
    },
    overdue: 0,
    averageProgress: 0,
    averageRiskScore: 0
  };
  
  const currentMetrics = metrics || defaultMetrics;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950 dark:bg-opacity-50';
      case 'High': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950 dark:bg-opacity-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950 dark:bg-opacity-50';
      default: return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950 dark:bg-opacity-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 dark:text-red-400 transform rotate-180" />;
      default: return <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
    }
  };

  const metricsData = [
    {
      id: 'total',
      title: 'Total de Auditorias',
      value: currentMetrics.totalAudits,
      icon: Target,
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950 dark:bg-opacity-50',
      description: 'Auditorias ativas'
    },
    {
      id: 'critical',
      title: 'Críticas',
      value: currentMetrics.auditsByPriority['Critical'] || 0,
      icon: AlertTriangle,
      color: getStatusColor('Critical'),
      description: 'Prioridade crítica'
    },
    {
      id: 'high',
      title: 'Alta Prioridade',
      value: currentMetrics.auditsByPriority['High'] || 0,
      icon: AlertTriangle,
      color: getStatusColor('High'),
      description: 'Prioridade alta'
    },
    {
      id: 'fieldwork',
      title: 'Em Execução',
      value: currentMetrics.auditsByStatus['Fieldwork'] || 0,
      icon: Activity,
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950 dark:bg-opacity-50',
      description: 'Trabalho de campo'
    },
    {
      id: 'overdue',
      title: 'Atrasadas',
      value: currentMetrics.overdue,
      icon: Clock,
      color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950 dark:bg-opacity-50',
      description: 'Prazo vencido'
    },
    {
      id: 'progress',
      title: 'Progresso Médio',
      value: `${currentMetrics.averageProgress}%`,
      icon: CheckCircle,
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950 dark:bg-opacity-50',
      description: 'Conclusão média',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        const showSkeleton = isLoading && !metrics && (metric.id === 'overdue');
        
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
              
              {!showSkeleton && (metric.id === 'critical' || metric.id === 'overdue') && metric.value > 0 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:bg-opacity-50 dark:text-red-400">
                    Atenção Necessária
                  </Badge>
                </div>
              )}
              
              {!showSkeleton && metric.id === 'fieldwork' && metric.value > 0 && (
                <div className="mt-2">
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:bg-opacity-50 dark:text-green-400">
                    Em Andamento
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