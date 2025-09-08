import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Shield, 
  Activity, 
  Database, 
  Clock, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';

interface SettingsMetricsProps {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    pendingInvitations: number;
    securityScore: number;
    lastBackup: string;
    storageUsed: number;
    storageLimit: number;
    activeSessions: number;
    suspiciousActivities: number;
  };
}

export const SettingsMetrics: React.FC<SettingsMetricsProps> = ({ metrics }) => {
  const storagePercentage = (metrics.storageUsed / metrics.storageLimit) * 100;
  const lastBackupDate = new Date(metrics.lastBackup);
  const isBackupRecent = Date.now() - lastBackupDate.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 dias

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Usuários */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Usuários</p>
              <p className="text-2xl font-bold">{String(metrics.activeUsers)}/{String(metrics.totalUsers)}</p>
              {metrics.pendingInvitations > 0 && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {String(metrics.pendingInvitations)} convites pendentes
                </Badge>
              )}
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Score de Segurança</p>
              <p className="text-2xl font-bold">{String(metrics.securityScore)}%</p>
              <Progress value={Number(metrics.securityScore)} className="h-2 mt-2" />
              {metrics.suspiciousActivities > 0 && (
                <div className="flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                  <span className="text-xs text-orange-600">
                    {String(metrics.suspiciousActivities)} atividades suspeitas
                  </span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessões Ativas */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sessões Ativas</p>
              <p className="text-2xl font-bold">{String(metrics.activeSessions)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {String(Math.round((metrics.activeSessions / metrics.activeUsers) * 100))}% dos usuários ativos
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Armazenamento */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Armazenamento</p>
              <p className="text-2xl font-bold">{String(metrics.storageUsed)}GB</p>
              <Progress value={Number(storagePercentage)} className="h-2 mt-2" />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  {String(metrics.storageLimit)}GB total
                </span>
                <div className="flex items-center">
                  {isBackupRecent ? (
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 text-orange-500 mr-1" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    Backup: {lastBackupDate.toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Database className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};