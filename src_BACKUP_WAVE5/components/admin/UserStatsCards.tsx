import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Lock, 
  Activity,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import type { UserManagementStats } from '@/types/user-management';

interface UserStatsCardsProps {
  stats?: UserManagementStats;
  isLoading: boolean;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const activePercentage = stats.total_users > 0 
    ? Math.round((stats.active_users / stats.total_users) * 100) 
    : 0;

  const mfaPercentage = stats.total_users > 0 
    ? Math.round((stats.mfa_enabled_users / stats.total_users) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Usuários */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_users}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {stats.active_users} ativos
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              {stats.inactive_users} inativos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuários Ativos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.active_users}</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {activePercentage}% do total
            </Badge>
            {stats.locked_users > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <Lock className="w-3 h-3" />
                {stats.locked_users} bloqueados
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MFA Habilitado */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MFA Habilitado</CardTitle>
          <Shield className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.mfa_enabled_users}</div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={mfaPercentage >= 80 ? "default" : mfaPercentage >= 50 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {mfaPercentage}% do total
            </Badge>
            {mfaPercentage < 50 && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                Baixa adoção
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usuários Logados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários Logados</CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.recent_logins}</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Últimas 24 horas
            </Badge>
            {stats.failed_login_attempts > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="w-3 h-3" />
                {stats.failed_login_attempts} tentativas falhadas
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Roles */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Distribuição por Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.users_by_role).map(([role, count]) => {
              const roleNames = {
                admin: 'Administradores',
                ciso: 'CISOs',
                risk_manager: 'Gerentes de Risco',
                compliance_officer: 'Oficiais de Compliance',
                auditor: 'Auditores',
                user: 'Usuários'
              };

              const roleColors = {
                admin: 'bg-red-100 text-red-800',
                ciso: 'bg-purple-100 text-purple-800',
                risk_manager: 'bg-orange-100 text-orange-800',
                compliance_officer: 'bg-blue-100 text-blue-800',
                auditor: 'bg-green-100 text-green-800',
                user: 'bg-gray-100 text-gray-800'
              };

              return (
                <div key={role} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${roleColors[role as keyof typeof roleColors]}`}
                  >
                    {roleNames[role as keyof typeof roleNames]}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};