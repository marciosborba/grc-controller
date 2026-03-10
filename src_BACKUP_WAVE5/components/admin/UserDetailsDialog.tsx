import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Clock, 
  Activity, 
  MapPin, 
  Monitor,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Smartphone
} from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import type { ExtendedUser, UserActivitySummary } from '@/types/user-management';
import { USER_ROLES } from '@/types/user-management';

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ExtendedUser;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  open,
  onOpenChange,
  user
}) => {
  const { getUserActivity } = useUserManagement();
  const [activity, setActivity] = useState<UserActivitySummary | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  useEffect(() => {
    if (open && user.id) {
      setIsLoadingActivity(true);
      getUserActivity(user.id)
        .then(setActivity)
        .catch(console.error)
        .finally(() => setIsLoadingActivity(false));
    }
  }, [open, user.id, getUserActivity]);

  const getUserStatus = () => {
    if (user.profile.locked_until && new Date(user.profile.locked_until) > new Date()) {
      return { status: 'locked', label: 'Bloqueado', color: 'destructive' };
    }
    if (!user.profile.is_active) {
      return { status: 'inactive', label: 'Inativo', color: 'secondary' };
    }
    return { status: 'active', label: 'Ativo', color: 'default' };
  };

  const status = getUserStatus();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Há menos de 1 hora';
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `Há ${diffInDays} dias`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `Há ${diffInMonths} meses`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-medium">
                {user.profile.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-xl">{user.profile.full_name}</div>
              <div className="text-sm text-gray-500 font-normal">{user.email}</div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas e atividade do usuário
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="sessions">Sessões</TabsTrigger>
          </TabsList>

          {/* Aba Perfil */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  
                  {user.profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.profile.phone}</span>
                    </div>
                  )}
                  
                  {user.profile.job_title && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.profile.job_title}</span>
                    </div>
                  )}
                  
                  {user.profile.department && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user.profile.department}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{user.profile.timezone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm">Idioma: {user.profile.language}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Status e Configurações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Status e Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={status.color as any}>{status.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">MFA:</span>
                    {user.profile.two_factor_enabled ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Habilitado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <ShieldX className="w-3 h-3 mr-1" />
                        Desabilitado
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Verificado:</span>
                    {user.profile.email_verified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Deve alterar senha:</span>
                    {user.profile.must_change_password ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tema:</span>
                    <Badge variant="outline">{user.profile.theme}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Roles e Permissões */}
            <Card>
              <CardHeader>
                <CardTitle>Roles e Permissões</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Roles:</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {USER_ROLES[role]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {user.permissions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Permissões Específicas:</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email:</span>
                    {user.profile.notification_preferences.email ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push:</span>
                    {user.profile.notification_preferences.push ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS:</span>
                    {user.profile.notification_preferences.sms ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informações de Login */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Informações de Login
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Último login:</span>
                    <span className="text-sm font-medium">
                      {formatRelativeTime(user.profile.last_login_at)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Total de logins:</span>
                    <span className="text-sm font-medium">{user.profile.login_count}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Tentativas falhadas:</span>
                    <span className={`text-sm font-medium ${
                      user.profile.failed_login_attempts > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {user.profile.failed_login_attempts}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Senha alterada em:</span>
                    <span className="text-sm font-medium">
                      {formatRelativeTime(user.profile.password_changed_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* MFA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Autenticação Multifator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    {user.profile.two_factor_enabled ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Habilitado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        <ShieldX className="w-3 h-3 mr-1" />
                        Desabilitado
                      </Badge>
                    )}
                  </div>

                  {user.mfa && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">Último uso:</span>
                        <span className="text-sm font-medium">
                          {formatRelativeTime(user.mfa.last_used_at)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm">Códigos de backup:</span>
                        <span className="text-sm font-medium">
                          {user.mfa.backup_codes?.length || 0} disponíveis
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Datas Importantes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Datas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Conta criada:</span>
                    <div className="font-medium">{formatDate(user.profile.created_at)}</div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Última atualização:</span>
                    <div className="font-medium">{formatDate(user.profile.updated_at)}</div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Último login:</span>
                    <div className="font-medium">{formatDate(user.profile.last_login_at)}</div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Senha alterada:</span>
                    <div className="font-medium">{formatDate(user.profile.password_changed_at)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Atividade */}
          <TabsContent value="activity" className="space-y-4">
            {isLoadingActivity ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando atividade...</p>
              </div>
            ) : activity ? (
              <div className="space-y-4">
                {/* Resumo da Atividade */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{activity.total_logins}</div>
                      <div className="text-sm text-gray-500">Total de Logins</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{activity.failed_attempts}</div>
                      <div className="text-sm text-gray-500">Tentativas Falhadas</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{activity.active_sessions}</div>
                      <div className="text-sm text-gray-500">Sessões Ativas</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium">Último Login</div>
                      <div className="text-sm text-gray-500">
                        {formatRelativeTime(activity.last_login)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Atividades Recentes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Atividades Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activity.recent_activities.map((act, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <div>
                            <div className="font-medium text-sm">{act.action}</div>
                            <div className="text-xs text-gray-500">
                              {formatDate(act.timestamp)}
                            </div>
                          </div>
                          {act.ip_address && (
                            <div className="text-xs text-gray-500">
                              IP: {act.ip_address}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {activity.recent_activities.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          Nenhuma atividade recente
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Erro ao carregar atividade do usuário
              </div>
            )}
          </TabsContent>

          {/* Aba Sessões */}
          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Sessões Ativas
                </CardTitle>
                <CardDescription>
                  Dispositivos e locais onde o usuário está conectado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user.sessions.length > 0 ? (
                  <div className="space-y-3">
                    {user.sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Monitor className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {session.user_agent || 'Dispositivo desconhecido'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {session.location || session.ip_address || 'Local desconhecido'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            Última atividade: {formatRelativeTime(session.last_activity)}
                          </div>
                          <Badge variant={session.is_active ? "default" : "secondary"}>
                            {session.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma sessão ativa encontrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};