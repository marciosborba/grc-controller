import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  Zap,
  Mail,
  Activity
} from 'lucide-react';
import type { NotificationMetrics } from '@/hooks/useNotificationsOptimized';

interface QuickMetricsProps {
  metrics?: NotificationMetrics;
  isLoading?: boolean;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({ metrics, isLoading }) => {
  const navigate = useNavigate();

  // Métricas padrão se não tiver dados
  const defaultMetrics: NotificationMetrics = {
    totalNotifications: 0,
    unreadCount: 0,
    criticalCount: 0,
    overdueCount: 0,
    byPriority: { 'critical': 0, 'high': 0, 'medium': 0, 'low': 0 },
    byModule: {
      'assessments': 0, 'risks': 0, 'compliance': 0, 'policies': 0,
      'privacy': 0, 'audit': 0, 'users': 0, 'system': 0,
      'general-settings': 0, 'frameworks': 0, 'incidents': 0
    },
    byStatus: { 'unread': 0, 'read': 0, 'archived': 0, 'dismissed': 0 },
    responseRate: 0,
    avgResponseTime: 0
  };

  const currentMetrics = metrics || defaultMetrics;

  // Lógica Dinâmica para o Card de Status (Card 1)
  const getStatusNarrative = () => {
    if (isLoading) return { title: "Analisando...", desc: "Obtendo dados...", color: "text-muted-foreground", bg: "bg-muted", icon: Activity };

    if (currentMetrics.criticalCount > 0) return {
      title: "Risco Crítico Detectado",
      desc: `${currentMetrics.criticalCount} notificações críticas requerem atenção imediata.`,
      color: "text-red-500",
      bg: "bg-red-500/10",
      icon: AlertTriangle
    };

    if (currentMetrics.overdueCount > 0) return {
      title: "Atenção Necessária",
      desc: `${currentMetrics.overdueCount} notificações estão com prazo vencido.`,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      icon: Zap
    };

    return {
      title: "Tudo em Ordem",
      desc: "Nenhuma notificação crítica ou atrasada.",
      color: "text-green-500",
      bg: "bg-green-500/10",
      icon: CheckCircle
    };
  };

  const narrative = getStatusNarrative();
  const NarrativeIcon = narrative.icon;

  // Cálculos para barras de progresso
  const total = currentMetrics.totalNotifications || 1;
  const unreadPercentage = Math.min(100, Math.round((currentMetrics.unreadCount / total) * 100));
  const overduePercentage = Math.min(100, Math.round((currentMetrics.overdueCount / total) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* Card 1: Status Narrative (Dynamic) */}
      <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <NarrativeIcon className="h-24 w-24" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className={`text-lg font-bold flex items-center gap-2 ${narrative.color}`}>
            {narrative.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            {narrative.desc}
          </p>
          <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${narrative.bg} ${narrative.color}`}>
            Status Atual
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Impact Analysis (Blue - Unread) */}
      <Card
        className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer"
        onClick={() => navigate('/notifications?status=unread')}
      >
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Mail className="h-24 w-24 text-blue-500" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-foreground">
            Novas Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {isLoading ? '...' : currentMetrics.unreadCount}
            </span>
            <span className="text-sm text-muted-foreground">Pendentes</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {unreadPercentage}% das notificações ainda não foram lidas.
          </p>
          <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${unreadPercentage}%` }}></div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Asset Attack Surface (Purple/Orange - Overdue) */}
      <Card
        className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer"
        onClick={() => navigate('/notifications?status=overdue')}
      >
        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
          <Clock className="h-24 w-24 text-orange-500" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-foreground">
            Prazos Vencidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {isLoading ? '...' : currentMetrics.overdueCount}
            </span>
            <span className="text-sm text-muted-foreground">Atrasadas</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Requer ação imediata em {currentMetrics.overdueCount} itens.
          </p>
          <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${overduePercentage}%` }}></div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Remediation Focus (Action) */}
      <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            Engajamento <Target className="h-4 w-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-foreground">
            Taxa de Resposta: {currentMetrics.responseRate}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tempo médio de resposta: {currentMetrics.avgResponseTime}h
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-4 w-full text-xs h-7"
            onClick={() => navigate('/notifications?tab=analytics')}
          >
            Ver Detalhes <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};