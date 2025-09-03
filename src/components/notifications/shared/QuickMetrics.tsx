import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  AlertTriangle,
  Eye,
  Clock,
  Target,
  Activity,
  TrendingUp
} from 'lucide-react';
import type { NotificationMetrics } from '@/hooks/useNotificationsOptimized';

interface QuickMetricsProps {
  metrics?: NotificationMetrics;
  isLoading?: boolean;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({ metrics, isLoading }) => {
  // Métricas padrão se não tiver dados
  const defaultMetrics: NotificationMetrics = {
    totalNotifications: 0,
    unreadCount: 0,
    criticalCount: 0,
    overdueCount: 0,
    byPriority: {
      'critical': 0,
      'high': 0,
      'medium': 0,
      'low': 0
    },
    byModule: {
      'assessments': 0,
      'risks': 0,
      'compliance': 0,
      'policies': 0,
      'privacy': 0,
      'audit': 0,
      'users': 0,
      'system': 0,
      'general-settings': 0,
      'frameworks': 0,
      'incidents': 0
    },
    byStatus: {
      'unread': 0,
      'read': 0,
      'archived': 0,
      'dismissed': 0
    },
    responseRate: 0,
    avgResponseTime: 0
  };
  
  const currentMetrics = metrics || defaultMetrics;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950 dark:bg-opacity-50';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950 dark:bg-opacity-50';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950 dark:bg-opacity-50';
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
      title: 'Total de Notificações',
      value: currentMetrics.totalNotifications,
      icon: Bell,
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950 dark:bg-opacity-50',
      description: 'Todas as notificações'
    },
    {
      id: 'unread',
      title: 'Não Lidas',
      value: currentMetrics.unreadCount,
      icon: Eye,
      color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950 dark:bg-opacity-50',
      description: 'Requer atenção'
    },
    {
      id: 'critical',
      title: 'Críticas',
      value: currentMetrics.criticalCount,
      icon: AlertTriangle,
      color: getPriorityColor('critical'),
      description: 'Prioridade crítica'
    },
    {
      id: 'overdue',
      title: 'Atrasadas',
      value: currentMetrics.overdueCount,
      icon: Clock,
      color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950 dark:bg-opacity-50',
      description: 'Prazo vencido'
    },
    {
      id: 'response-rate',
      title: 'Taxa de Resposta',
      value: `${currentMetrics.responseRate}%`,
      icon: Target,
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950 dark:bg-opacity-50',
      description: 'Engajamento',
      isText: true
    },
    {
      id: 'avg-time',
      title: 'Tempo Médio',
      value: `${currentMetrics.avgResponseTime}h`,
      icon: Clock,
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-950 dark:bg-opacity-50',
      description: 'Resposta média',
      isText: true
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        const showSkeleton = isLoading && !metrics && (metric.id === 'avg-time' || metric.id === 'response-rate');
        
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
                    <div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
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
              
              {!showSkeleton && (metric.id === 'critical' || metric.id === 'unread') && metric.value > 0 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:bg-opacity-50 dark:text-red-400">
                    {metric.id === 'critical' ? 'Ação Imediata' : 'Pendente'}
                  </Badge>
                </div>
              )}
              
              {!showSkeleton && metric.id === 'overdue' && metric.value > 0 && (
                <div className="mt-2">
                  <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 dark:bg-red-950 dark:bg-opacity-50 dark:text-red-400">
                    Atrasadas
                  </Badge>
                </div>
              )}
              
              {!showSkeleton && metric.id === 'response-rate' && typeof metric.value === 'string' && parseFloat(metric.value) > 85 && (
                <div className="mt-2">
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:bg-opacity-50 dark:text-green-400">
                    Excelente
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