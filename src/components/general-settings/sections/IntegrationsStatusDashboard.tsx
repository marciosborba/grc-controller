import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Server,
  Mail,
  Shield,
  Webhook,
  Cloud
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type {
  Integration,
  IntegrationStats,
  IntegrationLog,
  ConnectionTestResult
} from '@/types/general-settings';

interface IntegrationsStatusDashboardProps {
  integrations: Integration[];
  stats: IntegrationStats | null;
  recentLogs: IntegrationLog[];
  isLoading: boolean;
  onRefresh: () => void;
  onTestConnection: (integrationId: string) => Promise<ConnectionTestResult>;
}

const IntegrationsStatusDashboard: React.FC<IntegrationsStatusDashboardProps> = ({
  integrations,
  stats,
  recentLogs,
  isLoading,
  onRefresh,
  onTestConnection
}) => {
  // Usar stats reais se disponíveis, senão calcular localmente
  const connectedCount = stats?.connected || integrations.filter(i => i.status === 'connected').length;
  const totalCount = stats?.total_integrations || integrations.length;
  const errorCount = stats?.error || integrations.filter(i => i.status === 'error').length;
  const pendingCount = stats?.pending || integrations.filter(i => i.status === 'pending').length;
  const healthPercentage = stats?.avg_uptime || (totalCount > 0 ? (connectedCount / totalCount) * 100 : 0);

  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatus = (percentage: number) => {
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Bom';
    if (percentage >= 40) return 'Regular';
    return 'Crítico';
  };

  return (
    <div className="space-y-6">
      {/* Health Overview - Premium Metrics (Identical to IncidentManagementPage style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Card 1: Status Geral */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all bg-secondary">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Activity className="h-24 w-24" />
          </div>
          <CardHeader className="pb-1 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-lg font-bold flex items-center gap-1 sm:gap-2 text-primary leading-tight">
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className={`text-xl sm:text-3xl font-bold ${getHealthColor(healthPercentage)}`}>
              {getHealthStatus(healthPercentage)}
            </div>
            <p className="text-[10px] sm:text-sm text-muted-foreground font-medium leading-tight sm:leading-relaxed mt-1">
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <Activity className="h-3 w-3" /> {Math.round(healthPercentage)}%
              </span>
              <span className="block mt-0.5 sm:mt-1">integrado</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Conectadas */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-green-500/50 bg-secondary">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle className="h-24 w-24 text-green-500" />
          </div>
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 h-full pt-4">
            <div className="p-1.5 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-lg sm:rounded-2xl shrink-0">
              <CheckCircle className="h-4 w-4 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-tight sm:leading-normal">Conectadas</p>
              <h3 className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-500">
                {connectedCount}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium leading-tight sm:leading-normal">
                de {totalCount} total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Com Problemas */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-red-500/50 bg-secondary">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle className="h-24 w-24 text-red-500" />
          </div>
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 h-full pt-4">
            <div className="p-1.5 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-lg sm:rounded-2xl shrink-0">
              <AlertCircle className="h-4 w-4 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-tight sm:leading-normal">Com Problemas</p>
              <h3 className="text-xl sm:text-3xl font-bold text-red-600 dark:text-red-500">
                {errorCount}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium leading-tight sm:leading-normal">
                requerem atenção
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Pendentes */}
        <Card className="relative overflow-hidden shadow-sm hover:shadow-md transition-all group border-l-4 border-l-orange-500/50 bg-secondary">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <RefreshCw className="h-24 w-24 text-orange-500" />
          </div>
          <CardContent className="p-3 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 h-full pt-4">
            <div className="p-1.5 sm:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-2xl shrink-0">
              <RefreshCw className="h-4 w-4 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-muted-foreground leading-tight sm:leading-normal">Pendentes</p>
              <h3 className="text-xl sm:text-3xl font-bold text-foreground">
                {pendingCount}
              </h3>
              <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium leading-tight sm:leading-normal">
                em configuração
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Progress */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm sm:text-base">Saúde das Integrações</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Monitoramento em tempo real do status de conectividade
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`${getHealthColor(healthPercentage)} border-current text-xs`}
            >
              {Math.round(healthPercentage)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <Progress value={healthPercentage} className="h-2 sm:h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Categories - Sincronizado e Compacto */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          Integrações por Categoria
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { type: 'api', label: 'APIs', icon: Globe, color: 'blue' },
            { type: 'email', label: 'E-mail', icon: Mail, color: 'green' },
            { type: 'sso', label: 'SSO', icon: Shield, color: 'orange' },
            { type: 'webhook', label: 'Webhooks', icon: Webhook, color: 'indigo' },
            { type: 'backup', label: 'Backup', icon: Cloud, color: 'cyan' },
            { type: 'mcp', label: 'MCP', icon: Zap, color: 'purple' }
          ].map(({ type, label, icon: Icon, color }) => {
            const count = stats?.by_type?.[type as keyof typeof stats.by_type] || integrations.filter(i => i.type === type).length;
            const connected = integrations.filter(i => i.type === type && i.status === 'connected').length;

            return (
              <Card
                key={type}
                className="relative flex flex-col items-center justify-center p-3 sm:p-4 hover:shadow-md transition-shadow transition-transform hover:-translate-y-0.5 cursor-default bg-secondary"
              >
                <div className={`mb-2 p-1.5 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                  <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div className="text-center">
                  <p className="text-sm sm:text-base font-bold text-foreground leading-none">{connected}/{count}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium mt-1">{label}</p>
                </div>

                {/* Indicador de Status Discreto */}
                {connected > 0 && (
                  <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green-500" />
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity from Logs */}
      {recentLogs.length > 0 && (
        <Card className="bg-secondary">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Últimas operações registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    {log.level === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : log.level === 'warn' ? (
                      <RefreshCw className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{log.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')} • {log.log_type}
                        {log.response_time_ms && ` • ${log.response_time_ms}ms`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={log.level === 'error' ? 'destructive' : 'outline'}
                    className="text-xs"
                  >
                    {log.level}
                  </Badge>
                </div>
              ))}

              {recentLogs.length > 5 && (
                <div className="text-center pt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Ver mais atividades
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationsStatusDashboard;