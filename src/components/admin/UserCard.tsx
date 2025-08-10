import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronDown,
  ChevronRight,
  User, 
  Mail, 
  Phone, 
  Building,
  MapPin,
  Edit,
  Save,
  X,
  Shield,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock,
  Activity,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  UserCog,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDisplayInfo } from '@/utils/userHelpers';
import { supabase } from '@/integrations/supabase/client';
import type { ExtendedUser, AppRole } from '@/types/user-management';
import { USER_ROLES } from '@/types/user-management';

interface UserCardProps {
  user: ExtendedUser;
  onUpdate: (userId: string, userData: unknown) => void;
  onDelete: (userId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onUpdate, 
  onDelete, 
  isUpdating, 
  isDeleting,
  canEdit,
  canDelete 
}) => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTenants, setAvailableTenants] = useState<Array<{id: string; name: string}>>([]);

  const displayInfo = getUserDisplayInfo(user.profile.full_name);
  const isCurrentUser = currentUser?.id === user.id;
  const canManageRoles = canEdit && !isCurrentUser && currentUser?.isPlatformAdmin;

  // Estados para edição de perfil
  const [profileData, setProfileData] = useState({
    full_name: user.profile.full_name,
    email: user.email,
    job_title: user.profile.job_title || '',
    department: user.profile.department || '',
    phone: user.profile.phone || '',
    tenant_id: user.profile.tenant_id || ''
  });

  // Estados para edição de roles
  const [rolesData, setRolesData] = useState({
    roles: [...user.roles],
    is_active: user.profile.is_active
  });

  // Estados para configurações de segurança
  const [securityData, setSecurityData] = useState({
    two_factor_enabled: user.profile.two_factor_enabled,
    must_change_password: user.profile.must_change_password,
    email_verified: user.profile.email_verified
  });

  const getUserStatus = () => {
    if (user.profile.locked_until && new Date(user.profile.locked_until) > new Date()) {
      return 'locked';
    }
    return user.profile.is_active ? 'active' : 'inactive';
  };

  const getStatusBadge = () => {
    const status = getUserStatus();
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-2 py-0">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="text-xs px-2 py-0">Inativo</Badge>;
      case 'locked':
        return <Badge variant="destructive" className="text-xs px-2 py-0">Bloqueado</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-2 py-0">Desconhecido</Badge>;
    }
  };

  const getMFABadge = () => {
    return user.profile.two_factor_enabled ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs px-2 py-0">
        <ShieldCheck className="w-2 h-2 mr-1" />
        MFA
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500 text-xs px-2 py-0">
        <ShieldX className="w-2 h-2 mr-1" />
        Sem MFA
      </Badge>
    );
  };

  const getRoleBadges = () => {
    return user.roles.map((role) => (
      <Badge key={role} variant="outline" className="text-xs px-2 py-0">
        {USER_ROLES[role] || role}
      </Badge>
    ));
  };

  const saveProfileData = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        full_name: profileData.full_name,
        job_title: profileData.job_title,
        department: profileData.department,
        phone: profileData.phone,
        ...(currentUser?.isPlatformAdmin && profileData.tenant_id && { tenant_id: profileData.tenant_id })
      };
      
      await onUpdate(user.id, updateData);
      
      toast.success('Perfil atualizado com sucesso');
      setIsEditingProfile(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveRolesData = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        roles: rolesData.roles,
        is_active: rolesData.is_active
      };
      
      await onUpdate(user.id, updateData);
      
      toast.success('Permissões atualizadas com sucesso');
      setIsEditingRoles(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveSecurityData = async () => {
    setIsSaving(true);
    try {
      await onUpdate(user.id, {
        security_settings: securityData
      });
      
      toast.success('Configurações de segurança atualizadas');
      setIsEditingSecurity(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const resetMFA = async () => {
    setIsSaving(true);
    try {
      await onUpdate(user.id, {
        reset_mfa: true
      });
      toast.success('MFA resetado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao resetar MFA: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const unlockUser = async () => {
    setIsSaving(true);
    try {
      await onUpdate(user.id, {
        unlock_user: true
      });
      toast.success('Usuário desbloqueado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao desbloquear: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Buscar tenants disponíveis para platform admins
  React.useEffect(() => {
    if (currentUser?.isPlatformAdmin && isEditingProfile) {
      const fetchTenants = async () => {
        try {
          const { data, error } = await supabase
            .from('tenants')
            .select('id, name')
            .eq('is_active', true)
            .order('name');
          
          if (error) throw error;
          setAvailableTenants(data || []);
        } catch (error) {
          console.error('Erro ao buscar tenants:', error);
        }
      };
      
      fetchTenants();
    }
  }, [currentUser?.isPlatformAdmin, isEditingProfile]);

  return (
    <Card className={`w-full max-w-4xl mx-auto transition-all duration-300 ${isExpanded ? 'bg-gray-200 dark:bg-gray-700 shadow-xl ring-2 ring-gray-400 dark:ring-gray-500 border-gray-400 dark:border-gray-500' : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer transition-colors py-3 px-4 ${isExpanded ? 'bg-gray-300 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            <div className="flex items-center justify-between gap-4">
              {/* Left Section */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {displayInfo.initials}
                  </span>
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-semibold truncate">{displayInfo.fullName}</CardTitle>
                    <div className="flex gap-1">
                      {getStatusBadge()}
                      {getMFABadge()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{user.email}</span>
                    {user.profile.job_title && (
                      <>
                        <span>•</span>
                        <span className="truncate">{user.profile.job_title}</span>
                      </>
                    )}
                    {user.tenant?.name && (
                      <>
                        <span>•</span>
                        <span className="truncate font-medium">{user.tenant.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Center Section - Roles */}
              <div className="flex flex-wrap gap-1 max-w-xs">
                {getRoleBadges()}
              </div>
              
              {/* Right Section */}
              <div className="text-right flex-shrink-0">
                {user.profile.last_login_at && (
                  <div className="text-xs text-muted-foreground">
                    <div>Último login:</div>
                    <div className="font-medium">
                      {new Date(user.profile.last_login_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">INFORMAÇÕES BÁSICAS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email: {user.email}</span>
                  </div>
                  {user.profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Telefone: {user.profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>Departamento: {user.profile.department || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Cargo: {user.profile.job_title || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Logins: {user.profile.login_count}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Criado em: {new Date(user.profile.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Edição de Perfil */}
              {(canEdit || isCurrentUser) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      DADOS PESSOAIS
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nome completo:</span> {user.profile.full_name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                    <div>
                      <span className="font-medium">Cargo:</span> {user.profile.job_title || 'Não informado'}
                    </div>
                    <div>
                      <span className="font-medium">Departamento:</span> {user.profile.department || 'Não informado'}
                    </div>
                    {user.profile.phone && (
                      <div>
                        <span className="font-medium">Telefone:</span> {user.profile.phone}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Timezone:</span> {user.profile.timezone}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Gerenciamento de Roles */}
              {canManageRoles && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        PERMISSÕES E ROLES
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingRoles(true)}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Gerenciar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Roles ativas:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {getRoleBadges()}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Status:</span>
                        <div className="mt-1">
                          {getStatusBadge()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Configurações de Segurança */}
              {(canEdit || isCurrentUser) && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        SEGURANÇA
                      </h4>
                      <div className="flex gap-2">
                        {getUserStatus() === 'locked' && canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={unlockUser}
                            disabled={isSaving}
                          >
                            <Unlock className="h-4 w-4 mr-2" />
                            Desbloquear
                          </Button>
                        )}
                        {user.profile.two_factor_enabled && canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetMFA}
                            disabled={isSaving}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Reset MFA
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingSecurity(true)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">MFA:</span> {getMFABadge()}
                      </div>
                      <div>
                        <span className="font-medium">Email verificado:</span>
                        <Badge variant={user.profile.email_verified ? "default" : "outline"} className="ml-2">
                          {user.profile.email_verified ? 'Verificado' : 'Não verificado'}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Tentativas de login falhadas:</span> {user.profile.failed_login_attempts}
                      </div>
                      <div>
                        <span className="font-medium">Deve alterar senha:</span>
                        <Badge variant={user.profile.must_change_password ? "destructive" : "outline"} className="ml-2">
                          {user.profile.must_change_password ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Logs de Atividades */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    LOGS DE ATIVIDADES
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/settings/activity-logs?user_id=${user.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Logs
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Último login:</span>
                    <div className="text-muted-foreground mt-1">
                      {user.profile.last_login_at ? (
                        <>
                          <div>{new Date(user.profile.last_login_at).toLocaleDateString('pt-BR')}</div>
                          <div>{new Date(user.profile.last_login_at).toLocaleTimeString('pt-BR')}</div>
                        </>
                      ) : (
                        'Nunca fez login'
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Total de logins:</span>
                    <div className="text-muted-foreground mt-1">{user.profile.login_count}</div>
                  </div>
                  <div>
                    <span className="font-medium">Membro desde:</span>
                    <div className="text-muted-foreground mt-1">
                      {new Date(user.profile.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Status da conta:</span>
                    <div className="mt-1">{getStatusBadge()}</div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ações */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/settings/activity-logs?user_id=${user.id}`, '_blank')}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Logs Completos
                  </Button>
                </div>
                {canDelete && !isCurrentUser && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isDeleting}
                        className="text-destructive hover:text-destructive border-destructive/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Usuário
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o usuário "{user.profile.full_name}"? 
                          Esta ação não pode ser desfeita e removerá todos os dados associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(user.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Dialog para Editar Perfil */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Dados Pessoais</DialogTitle>
            <DialogDescription>
              Atualize as informações pessoais do usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_title">Cargo</Label>
                <Input
                  id="job_title"
                  value={profileData.job_title}
                  onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                  placeholder="Cargo"
                />
              </div>

              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  placeholder="Departamento"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+55 11 99999-9999"
              />
            </div>

            {/* Seleção de tenant - apenas para platform admins */}
            {currentUser?.isPlatformAdmin && (
              <div>
                <Label htmlFor="tenant">Organização</Label>
                <Select
                  value={profileData.tenant_id}
                  onValueChange={(value) => setProfileData({ ...profileData, tenant_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma organização" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={saveProfileData} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Roles */}
      {canManageRoles && (
        <Dialog open={isEditingRoles} onOpenChange={setIsEditingRoles}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Gerenciar Permissões</DialogTitle>
              <DialogDescription>
                Configure as roles e status do usuário.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={rolesData.is_active}
                  onCheckedChange={(checked) => setRolesData({ ...rolesData, is_active: checked })}
                />
                <Label htmlFor="is_active">Usuário ativo</Label>
              </div>

              <div>
                <Label>Roles do sistema</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {(Object.keys(USER_ROLES) as AppRole[]).map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={role}
                        checked={rolesData.roles.includes(role)}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...rolesData.roles, role]
                            : rolesData.roles.filter(r => r !== role);
                          setRolesData({ ...rolesData, roles: newRoles });
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={role} className="text-sm">
                        {USER_ROLES[role]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingRoles(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={saveRolesData} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para Configurações de Segurança */}
      <Dialog open={isEditingSecurity} onOpenChange={setIsEditingSecurity}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurações de Segurança</DialogTitle>
            <DialogDescription>
              Configure as opções de segurança do usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de dois fatores (MFA)</Label>
                <p className="text-sm text-muted-foreground">
                  Habilita ou desabilita MFA para este usuário
                </p>
              </div>
              <Switch
                checked={securityData.two_factor_enabled}
                onCheckedChange={(checked) => 
                  setSecurityData({ ...securityData, two_factor_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Deve alterar senha</Label>
                <p className="text-sm text-muted-foreground">
                  Força alteração de senha no próximo login
                </p>
              </div>
              <Switch
                checked={securityData.must_change_password}
                onCheckedChange={(checked) => 
                  setSecurityData({ ...securityData, must_change_password: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email verificado</Label>
                <p className="text-sm text-muted-foreground">
                  Status de verificação do email do usuário
                </p>
              </div>
              <Switch
                checked={securityData.email_verified}
                onCheckedChange={(checked) => 
                  setSecurityData({ ...securityData, email_verified: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditingSecurity(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={saveSecurityData} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserCard;