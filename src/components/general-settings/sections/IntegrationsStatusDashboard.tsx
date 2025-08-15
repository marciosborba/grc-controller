import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  TrendingUp, 
  Activity,
  Zap,
  Globe,
  Server
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface IntegrationStatus {
  id: string;
  name: string;
  type: 'api' | 'email' | 'sso' | 'webhook' | 'backup' | 'mcp';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync?: string;
  errorMessage?: string;
}

interface IntegrationsStatusDashboardProps {
  integrations: IntegrationStatus[];
  isLoading: boolean;
  onRefresh: () => void;
}

const IntegrationsStatusDashboard: React.FC<IntegrationsStatusDashboardProps> = ({
  integrations,
  isLoading,
  onRefresh
}) => {
  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const totalCount = integrations.length;
  const healthPercentage = totalCount > 0 ? (connectedCount / totalCount) * 100 : 0;

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
      {/* Health Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Status Geral</CardTitle>
            <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className={`text-lg sm:text-2xl font-bold ${getHealthColor(healthPercentage)}`}>
              {getHealthStatus(healthPercentage)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {Math.round(healthPercentage)}% das integrações ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Conectadas</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">{connectedCount}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              de {totalCount} integrações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Com Problemas</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-red-600">
              {integrations.filter(i => i.status === 'error').length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Pendentes</CardTitle>
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-2xl font-bold text-yellow-600">
              {integrations.filter(i => i.status === 'pending').length}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              em configuração
            </p>
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

      {/* Integration Types Overview */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Server className="h-4 w-4 sm:h-5 sm:w-5" />
            Integrações por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { type: 'api', label: 'APIs', icon: Globe, color: 'blue' },
              { type: 'email', label: 'E-mail', icon: RefreshCw, color: 'green' },
              { type: 'sso', label: 'SSO', icon: CheckCircle, color: 'orange' },
              { type: 'webhook', label: 'Webhooks', icon: Zap, color: 'indigo' },
              { type: 'backup', label: 'Backup', icon: Server, color: 'cyan' },
              { type: 'mcp', label: 'MCP', icon: Activity, color: 'purple' }
            ].map(({ type, label, icon: Icon, color }) => {
              const count = integrations.filter(i => i.type === type).length;
              const connected = integrations.filter(i => i.type === type && i.status === 'connected').length;
              
              return (
                <div key={type} className="text-center space-y-2">
                  <div className={`p-2 sm:p-3 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg w-fit mx-auto`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium">{connected}/{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sync Activity */}
      {integrations.filter(i => i.lastSync).length > 0 && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Atividade de Sincronização
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Últimas sincronizações realizadas com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {integrations
                .filter(i => i.lastSync)
                .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())
                .slice(0, 5)
                .map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(integration.lastSync!).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Sincronizado
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationsStatusDashboard;