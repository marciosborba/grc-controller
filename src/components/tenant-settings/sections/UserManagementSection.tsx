import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupManagementSection } from './GroupManagementSection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  Clock,
  Search,
  UserCheck,
  UserX,
  MoreHorizontal,
  UserCog
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionsInfo } from './PermissionsInfo';
import { useAuth } from '@/contexts/AuthContextOptimized';

interface User {
  id: string;
  user_id: string; // auth.users UUID — necessário para impersonação
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'tenant_admin' | 'guest' | 'vendor';
  status: 'active' | 'inactive' | 'pending';
  last_login: string | null;
  created_at: string;
  department?: string;
  phone?: string;
  mfa_enabled: boolean;
}

interface UserManagementSectionProps {
  tenantId: string;
  onUserChange?: () => void;
  onSettingsChange?: () => void;
  onMetricsUpdate?: (metrics: { totalUsers: number; activeUsers: number }) => void;
  defaultRoleFilter?: 'all' | 'user' | 'admin' | 'tenant_admin' | 'guest' | 'vendor';
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  tenantId,
  onUserChange = () => { },
  onSettingsChange = () => { },
  onMetricsUpdate = () => { },
  defaultRoleFilter = 'all'
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(defaultRoleFilter);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    system_role: 'user' as 'user' | 'admin' | 'tenant_admin' | 'guest',
    tenant_role_id: '',
    department: '',
    phone: '',
    job_title: '',
    send_invitation: true,
    permissions: [] as string[],
  });
  const [tenantRoles, setTenantRoles] = useState<{ id: string; name: string; color: string; display_name?: string }[]>([]);

  // Hook de permissões
  const permissions = usePermissions();
  const { user: currentUser } = useAuth();

  // Fetch custom tenant roles for the role picker
  const loadTenantRoles = async () => {
    if (!tenantId) return;

    // As funções RBAC do GRC são salvas em tenant_roles (configuradas na aba de Permissões)
    const { data: legacyRoles, error } = await supabase
      .from('tenant_roles')
      .select('id, name, color')
      .eq('tenant_id', tenantId)
      .order('name');

    if (error) {
      console.error('Error loading tenant roles:', error);
      return;
    }

    const roles = (legacyRoles || []).map(r => ({
      id: r.id,
      name: r.name,
      display_name: r.name,
      color: r.color || '#64748b'
    }));

    setTenantRoles(roles);
  };

  // Verificar se é Super Admin Global diretamente no banco (evita problema de cache de auth)
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  useEffect(() => {
    const checkPlatformAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('platform_admins')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      setIsPlatformAdmin(!!data);
    };
    checkPlatformAdmin();
  }, []);

  // Estado de impersonação
  const [isImpersonating, setIsImpersonating] = useState<string | null>(null);

  const handleImpersonateUser = async (targetUser: User) => {
    if (!isPlatformAdmin) {
      toast.error('Apenas Super Admins podem impersonar usuários');
      return;
    }
    if (!targetUser.user_id || !targetUser.email) {
      toast.error('Usuário não possui email ou ID de autenticação configurado.');
      return;
    }

    try {
      setIsImpersonating(targetUser.id);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Sessão inválida');

      // Montar redirect URL com params para o banner detectar a sessão
      const redirectUrl = new URL(window.location.origin);
      redirectUrl.searchParams.set('impersonated', 'true');
      redirectUrl.searchParams.set('impersonated_by', currentUser?.email || '');
      redirectUrl.searchParams.set('impersonated_user', targetUser.email);

      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: {
          target_user_id: targetUser.user_id,
          reason: 'Teste via painel Super Admin',
          redirect_url: redirectUrl.toString()
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Falha ao gerar link de impersonação');

      // Abrir em nova aba
      window.open(data.impersonation_url, '_blank', 'noopener,noreferrer');
      toast.success(`🎭 Sessão de impersonação aberta para ${targetUser.email}`);
    } catch (err: any) {
      toast.error(`Erro ao impersonar usuário: ${err.message}`);
    } finally {
      setIsImpersonating(null);
    }
  };

  useEffect(() => {
    loadUsers();
    loadTenantRoles();
  }, [tenantId]);

  const loadUsers = async () => {
    setIsLoading(true);

    try {
      if (!tenantId) {
        setUsers([]);
        onMetricsUpdate({ totalUsers: 0, activeUsers: 0 });
        return;
      }

      // Carregar usuários reais do banco de dados
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (profilesError) {
        toast.error(`Erro ao carregar usuários: ${profilesError.message}`);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        onMetricsUpdate({ totalUsers: 0, activeUsers: 0 });
        return;
      }

      // Buscar roles dos usuários da tabela user_roles
      const userIds = profilesData.map(p => p.user_id).filter(Boolean);
      let userRolesData: any[] = [];

      if (userIds.length > 0) {
        try {
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('user_id, role')
            .in('user_id', userIds);

          if (rolesError) {
            userRolesData = [];
          } else {
            userRolesData = rolesData || [];
          }
        } catch (error) {
          userRolesData = [];
        }
      }

      // Buscar últimos logins dos usuários
      let lastLoginsData: any[] = [];

      if (userIds.length > 0) {
        try {
          const { data: loginsData, error: loginsError } = await supabase
            .from('activity_logs')
            .select('user_id, created_at')
            .eq('tenant_id', tenantId)
            .eq('action', 'login')
            .in('user_id', userIds)
            .order('created_at', { ascending: false });

          if (loginsError) {
            lastLoginsData = [];
          } else {
            lastLoginsData = loginsData || [];
          }
        } catch (error) {
          lastLoginsData = [];
        }
      }

      // Processar dados dos usuários
      const realUsers: User[] = profilesData.map((profile, index) => {
        // Encontrar último login do usuário
        const lastLogin = lastLoginsData.find(log => log.user_id === profile.user_id);

        // Buscar roles do usuário (vindo do user_roles)
        const userRoles = userRolesData.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role);

        // Determinar role principal
        let role: User['role'] = 'user';

        // Verifica primeiro os roles privilegiados
        if (userRoles.includes('tenant_admin')) role = 'tenant_admin';
        else if (userRoles.includes('admin') || userRoles.includes('super_admin')) role = 'admin';
        // Se sistema marcou explicitamente como convidado ou vendor na tabela profiles
        else if (profile.system_role === 'guest') role = 'guest';
        else if (profile.system_role === 'vendor' || userRoles.includes('vendor')) role = 'vendor';
        // Ou se na tabela role estiver explicito
        else if (userRoles.includes('guest')) role = 'guest';

        // Determinar status baseado no user_id e is_active
        let status: User['status'] = 'active';
        try {
          if (!profile.user_id) {
            // Se não tem user_id, é um convite pendente sem conta criada
            status = 'pending';
          } else if (profile.is_active === false) {
            // Guests/convidados com convite enviado mas não confirmado ainda
            // aparecem como 'pending' para diferenciar de usuários inativados
            if (profile.system_role === 'guest' || profile.must_change_password === true) {
              status = 'pending';
            } else {
              status = 'inactive';
            }
          } else {
            status = 'active';
          }
        } catch (error) {
          status = 'active';
        }


        const processedUser = {
          id: profile.id || `unknown_${index}`,
          user_id: profile.user_id || '', // auth.users UUID para impersonação
          email: profile.email || '',
          full_name: profile.full_name || 'Usuário sem nome',
          role,
          status,
          last_login: profile.last_login_at || lastLogin?.created_at || null,
          created_at: profile.created_at || new Date().toISOString(),
          department: profile.department || undefined,
          phone: profile.phone || undefined,
          mfa_enabled: false // TODO: Implementar quando houver campo MFA
        };

        return processedUser;
      });


      setUsers(realUsers);

      // Atualizar métricas para sincronizar com o card
      // Contar apenas usuários ativos e pendentes (excluir inativos)
      const activeAndPendingUsers = realUsers.filter(u => u.status !== 'inactive');
      const totalUsers = activeAndPendingUsers.length;
      const activeUsers = realUsers.filter(u => u.status === 'active').length;

      // Métricas calculadas: total de usuários ativos/pendentes e usuários com status ativo
      onMetricsUpdate({ totalUsers, activeUsers });
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      setUsers([]); // Fallback para lista vazia
    } finally {
      setIsLoading(false);
    }
  };


  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'all' || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async () => {
    try {
      setIsCreating(true);

      if (!formData.email?.trim()) { toast.error('Email é obrigatório'); return; }
      if (!formData.full_name?.trim()) { toast.error('Nome é obrigatório'); return; }
      if (!tenantId) { toast.error('Tenant ID não encontrado'); return; }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) { toast.error('Email inválido'); return; }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) { toast.error('Sessão inválida'); return; }

      const payload = {
        email: formData.email.trim().toLowerCase(),
        full_name: formData.full_name.trim(),
        job_title: formData.job_title?.trim() || undefined,
        department: formData.department?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        tenant_id: tenantId,
        system_role: formData.system_role,
        roles: [formData.system_role],
        tenant_role_id: formData.tenant_role_id || undefined,
        permissions: formData.permissions.length ? formData.permissions : undefined,
        send_invitation: formData.send_invitation,
        must_change_password: true,
      };

      const response = await supabase.functions.invoke('create-user-admin', {
        body: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      const { data, error } = response;

      // Supabase edge functions often pack the real error message inside the `error` object or its context
      if (error) {
        let errorMsg = error.message;
        try {
          // Attempt to parse if it's a context object containing JSON
          if (error.context?.json) {
            const body = await error.context.json();
            if (body.error) errorMsg = body.error;
          } else if (typeof error.context === 'string') {
            const body = JSON.parse(error.context);
            if (body.error) errorMsg = body.error;
          }
        } catch (e) { /* ignore parse errors */ }
        throw new Error(errorMsg);
      }

      if (!data?.success) throw new Error(data?.error || 'Erro ao criar usuário');

      setIsCreateDialogOpen(false);
      resetForm();
      await loadUsers();
      onUserChange?.();

      if (formData.send_invitation) {
        toast.success(`✅ Convite enviado para ${formData.email}! O usuário receberá um e-mail para definir sua senha.`);
      } else {
        toast.success('Usuário criado com sucesso!');
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) {
      toast.error('Nenhum usuário selecionado');
      return;
    }

    try {
      setIsProcessing(true);

      // Validações básicas
      if (!formData.full_name || formData.full_name.trim() === '') {
        toast.error('Nome é obrigatório');
        setIsProcessing(false);
        return;
      }

      if (!formData.email || formData.email.trim() === '') {
        toast.error('Email é obrigatório');
        setIsProcessing(false);
        return;
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Email inválido');
        setIsProcessing(false);
        return;
      }

      // Verificar se email já existe para outro usuário
      if (formData.email !== selectedUser.email) {
        const { data: existingUsers, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', formData.email)
          .neq('id', selectedUser.id);

        if (checkError) {
          toast.error('Erro ao verificar email existente');
          setIsProcessing(false);
          return;
        } else if (existingUsers && existingUsers.length > 0) {
          toast.error('Este email já está sendo usado por outro usuário');
          setIsProcessing(false);
          return;
        }
      }

      // Atualizar no banco de dados se for usuário real (não temporário)
      if (!selectedUser.id.startsWith('temp_')) {
        // Atualizar perfil na tabela profiles
        const updateData = {
          email: formData.email,
          full_name: formData.full_name,
          department: formData.department || null,
          phone: formData.phone || null,
          custom_role_id: formData.tenant_role_id || null, // Salva o perfil RBAC customizado
          updated_at: new Date().toISOString()
        };

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', selectedUser.id);

        if (updateError) {
          toast.error('Erro ao atualizar usuário no banco de dados');
          setIsProcessing(false);
          return;
        }

        // Atualizar role do sistema se necessário (tabela user_roles)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('id', selectedUser.id)
          .single();

        if (profileData?.user_id) {
          // Deleta as roles atuais para este tenant
          await supabase.from('user_roles').delete().eq('user_id', profileData.user_id).eq('tenant_id', tenantId);

          // Insere a nova configuração
          await supabase.from('user_roles').insert({
            user_id: profileData.user_id,
            role: formData.system_role,
            tenant_id: tenantId,
          });
        }

        // Fechar diálogo e resetar estado
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        resetForm();

        // Recarregar dados do banco para garantir sincronização
        await loadUsers();

        onUserChange();
        onSettingsChange();

        toast.success('Usuário atualizado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Verificar se é usuário pendente (convite) ou usuário ativo/inativo
    if (user.status === 'pending') {
      if (!confirm(`Tem certeza que deseja excluir o convite para ${user.full_name}?\n\nEsta ação não pode ser desfeita.`)) return;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) { toast.error('Sessão inválida'); return; }

        // Chamar edge function para deletar completamente (profiles + user_roles + auth.users)
        const { data, error } = await supabase.functions.invoke('delete-user-admin', {
          body: { profile_id: userId, user_id: user.user_id || null },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (error) throw new Error(error.message);
        if (!data?.success) throw new Error(data?.error || 'Erro ao excluir convite');

        toast.success('Convite excluído com sucesso!');
      } catch (error: any) {
        toast.error('Erro ao excluir convite: ' + error.message);
      }
    } else {
      // Para usuários ativos/inativos, apenas inativar
      if (!confirm(`Tem certeza que deseja inativar o usuário ${user.full_name}?\n\nO usuário ficará inativo mas poderá ser reativado posteriormente.`)) return;

      try {
        // Marcar usuário como inativo (soft delete)
        const { error: deactivateError } = await supabase
          .from('profiles')
          .update({
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (deactivateError) {
          toast.error('Erro ao desativar usuário no banco de dados');
          return;
        }

        toast.success('Usuário inativado com sucesso!');
      } catch (error) {
        toast.error('Erro inesperado ao inativar usuário');
      }
    }

    // Recarregar dados do banco para garantir sincronização
    await loadUsers();

    onUserChange();
    onSettingsChange();
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Não permitir toggle para usuários pendentes (convites)
    if (user.status === 'pending') {
      toast.error('Não é possível ativar/desativar convites pendentes. Use excluir para remover o convite.');
      return;
    }

    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const isActive = newStatus === 'active';

      // Atualizar no banco de dados se for usuário real (não temporário)
      if (!user.id.startsWith('temp_')) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          toast.error('Erro ao atualizar status no banco de dados');
          return;
        }

      }

      // Recarregar dados do banco para garantir sincronização
      await loadUsers();

      onUserChange();
      onSettingsChange();

      toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      toast.error('Erro ao atualizar status do usuário');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      system_role: 'user',
      tenant_role_id: '',
      department: '',
      phone: '',
      job_title: '',
      send_invitation: true,
      permissions: [],
    });
  };

  const openEditDialog = async (user: User) => {
    setSelectedUser(user);

    // Buscar o custom_role_id atual do perfil
    let currentTenantRoleId = '';
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('custom_role_id')
        .eq('id', user.id)
        .single();

      if (profileData?.custom_role_id) {
        currentTenantRoleId = profileData.custom_role_id;
      }
    } catch (e) {
      console.warn("Could not fetch custom_role_id for user", e);
    }

    setFormData({
      email: user.email,
      full_name: user.full_name,
      system_role: user.role === 'tenant_admin' ? 'tenant_admin'
        : user.role === 'admin' ? 'admin'
          : user.role === 'guest' ? 'guest' : 'user',
      department: user.department || '',
      phone: user.phone || '',
      send_invitation: false,
      permissions: [],
      job_title: '',
      tenant_role_id: currentTenantRoleId,
    });
    setIsEditDialogOpen(true);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tenant_admin': return 'Admin da Organização';
      case 'admin': return 'Administrador';
      case 'user': return 'Usuário Interno';
      case 'guest': return 'Convidado (Risco)';
      case 'vendor': return 'Fornecedor';
      default: return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600 text-white">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 text-white">Inativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando usuários...</div>
        </CardContent>
      </Card>
    );
  }

  // Se não tem permissão, mostrar informações sobre permissões
  if (!permissions.isLoading && !permissions.canAccessTenant(tenantId)) {
    return (
      <div className="space-y-6">
        <PermissionsInfo />
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
              <p className="text-muted-foreground mb-4">
                Você não tem permissão para gerenciar usuários nesta organização.
              </p>
              <p className="text-sm text-muted-foreground">
                Para obter acesso, solicite ao administrador da plataforma que atribua
                a role de 'admin' ou 'tenant_admin' ao seu usuário.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5" />
            <span>Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Users className="h-3.5 w-3.5" />
            <span>Grupos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gerenciamento de Usuários
                  </CardTitle>
                  <CardDescription>
                    Gerencie usuários da sua organização
                  </CardDescription>
                </div>

                {permissions.canAccessTenant(tenantId) && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-[540px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Convidar Novo Usuário</DialogTitle>
                        <DialogDescription>
                          Preencha os dados e defina as permissões. Um e-mail de convite será enviado para o usuário definir sua senha.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-2">
                        {/* ── Dados básicos ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="grid gap-1.5">
                            <Label htmlFor="email">E-mail *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="usuario@empresa.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label htmlFor="full_name">Nome Completo *</Label>
                            <Input
                              id="full_name"
                              placeholder="João Silva"
                              value={formData.full_name}
                              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="grid gap-1.5">
                            <Label htmlFor="job_title">Cargo</Label>
                            <Input
                              id="job_title"
                              placeholder="Ex: Analista de Riscos"
                              value={formData.job_title}
                              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-1.5">
                            <Label htmlFor="department">Departamento</Label>
                            <Input
                              id="department"
                              placeholder="Ex: TI / Compliance"
                              value={formData.department}
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* ── Função & Perfil ── */}
                        <div className="border rounded-lg p-3 bg-muted/30 space-y-3">
                          <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Função e Permissões</p>

                          <div className="grid gap-1.5">
                            <Label htmlFor="system_role">Função do Sistema *</Label>
                            <Select
                              value={formData.system_role}
                              onValueChange={(value) => setFormData({ ...formData, system_role: value as typeof formData.system_role })}
                            >
                              <SelectTrigger id="system_role">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">👤 Usuário Interno — acesso padrão</SelectItem>
                                <SelectItem value="admin">🔑 Administrador — gerencia usuários e config.</SelectItem>
                                <SelectItem value="tenant_admin">👑 Admin da Organização — acesso total</SelectItem>
                                <SelectItem value="guest">🔗 Convidado — somente Portal de Riscos</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              {formData.system_role === 'user' && 'Acesso aos módulos configurados pela política RBAC da organização.'}
                              {formData.system_role === 'admin' && 'Pode gerenciar usuários, grupos e configurações da organização.'}
                              {formData.system_role === 'tenant_admin' && 'Controle total sobre configurações, usuários e dados da organização.'}
                              {formData.system_role === 'guest' && 'Acesso restrito ao Portal de Riscos onde for parte interessada.'}
                            </p>
                          </div>

                          {tenantRoles.length > 0 && (
                            <div className="grid gap-1.5">
                              <Label htmlFor="tenant_role_id">Perfil Customizado (opcional)</Label>
                              <Select
                                value={formData.tenant_role_id || 'none'}
                                onValueChange={(v) => setFormData({ ...formData, tenant_role_id: v === 'none' ? '' : v })}
                              >
                                <SelectTrigger id="tenant_role_id">
                                  <SelectValue placeholder="Nenhum perfil adicional" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Nenhum</SelectItem>
                                  {tenantRoles.map(r => (
                                    <SelectItem key={r.id} value={r.id}>
                                      <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color || '#6b7280' }} />
                                        {r.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">Perfis customizados são criados em Permissões › Funções.</p>
                            </div>
                          )}
                        </div>

                        {/* ── Envio do convite ── */}
                        <div className="flex items-start gap-3 rounded-lg border p-3 bg-blue-500/5 border-blue-500/20">
                          <Switch
                            id="send_invitation"
                            checked={formData.send_invitation}
                            onCheckedChange={(checked) => setFormData({ ...formData, send_invitation: checked })}
                            className="mt-0.5"
                          />
                          <div>
                            <Label htmlFor="send_invitation" className="cursor-pointer font-medium">
                              Enviar convite por e-mail
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formData.send_invitation
                                ? '✅ Um e-mail será enviado com o link para o usuário definir sua própria senha.'
                                : 'O usuário será criado sem envio de convite. Você poderá enviar o acesso depois.'}
                            </p>
                          </div>
                        </div>
                      </div>


                      <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateUser} disabled={isCreating}>
                          {isCreating ? 'Criando...' : 'Criar Usuário'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {!permissions.canAccessTenant(tenantId) && !permissions.isLoading && (
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    🔒 Apenas administradores podem gerenciar usuários
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome, email ou departamento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filtrar por função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as funções</SelectItem>
                    <SelectItem value="tenant_admin">Admin da Organização</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="user">Usuário Interno</SelectItem>
                    <SelectItem value="guest">Convidado (Risco)</SelectItem>
                    <SelectItem value="vendor">Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ── MOBILE: cards ── */}
              <div className="sm:hidden space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {searchTerm || selectedRole !== 'all'
                      ? 'Nenhum usuário encontrado com os filtros aplicados.'
                      : 'Nenhum usuário cadastrado.'}
                  </div>
                ) : filteredUsers.map((user) => (
                  <div key={user.id} className="rounded-lg border p-3 bg-card space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{user.full_name}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                        {user.department && (
                          <div className="text-xs text-muted-foreground truncate">{user.department}</div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditDialog(user); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        {user.status === 'pending' ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <>
                            {isPlatformAdmin && user.email && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-orange-500" onClick={(e) => { e.stopPropagation(); handleImpersonateUser(user); }} disabled={isImpersonating === user.id}>
                                {isImpersonating === user.id ? <span className="text-xs animate-pulse">...</span> : <UserCog className="h-3.5 w-3.5" />}
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleToggleUserStatus(user.id); }}>
                              {user.status === 'active' ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <Badge variant="outline" className="text-xs">{getRoleLabel(user.role)}</Badge>
                      {getStatusBadge(user.status)}
                      {user.mfa_enabled ? (
                        <Badge className="bg-green-600 text-white text-xs"><Shield className="h-3 w-3 mr-0.5" />MFA</Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600 text-xs">Sem MFA</Badge>
                      )}
                      {user.last_login && (
                        <span className="text-xs text-muted-foreground">Login: {new Date(user.last_login).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── DESKTOP: tabela ── */}
              <div className="hidden sm:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Login</TableHead>
                      <TableHead>MFA</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.department && (
                              <div className="text-xs text-muted-foreground">{user.department}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.status)}
                        </TableCell>
                        <TableCell>
                          {user.last_login ? (
                            <div className="text-sm">
                              {new Date(user.last_login).toLocaleDateString('pt-BR')}
                              <div className="text-xs text-muted-foreground">
                                {new Date(user.last_login).toLocaleTimeString('pt-BR')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.mfa_enabled ? (
                            <Badge className="bg-green-600 text-white">
                              <Shield className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(user);
                              }}
                              title="Editar usuário"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            {user.status === 'pending' ? (
                              // Para convites pendentes: apenas excluir
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user.id);
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir convite"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              // Para usuários ativos/inativos: toggle status + botão impersonar
                              <>
                                {/* 🎭 Botão Assumir - apenas Super Admin Global */}
                                {isPlatformAdmin && user.email && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleImpersonateUser(user);
                                    }}
                                    disabled={isImpersonating === user.id}
                                    title="Assumir identidade deste usuário para testes (Super Admin)"
                                    className="text-orange-500 hover:text-orange-600"
                                  >
                                    {isImpersonating === user.id ? (
                                      <span className="text-xs animate-pulse">...</span>
                                    ) : (
                                      <UserCog className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleUserStatus(user.id);
                                  }}
                                  title={user.status === 'active' ? 'Desativar usuário' : 'Reativar usuário'}
                                >
                                  {user.status === 'active' ? (
                                    <UserX className="h-4 w-4" />
                                  ) : (
                                    <UserCheck className="h-4 w-4" />
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="hidden sm:block text-center py-8 text-muted-foreground">
                  {searchTerm || selectedRole !== 'all'
                    ? 'Nenhum usuário encontrado com os filtros aplicados.'
                    : 'Nenhum usuário cadastrado.'
                  }
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dialog de Edição */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="w-[95vw] max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Atualize as informações do usuário.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_email">Email</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit_full_name">Nome Completo</Label>
                  <Input
                    id="edit_full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit_role">Função</Label>
                  <Select
                    value={formData.system_role}
                    onValueChange={(value) => setFormData({ ...formData, system_role: value as typeof formData.system_role })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário Interno</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="tenant_admin">Admin da Organização</SelectItem>
                      <SelectItem value="guest">Convidado (Risco)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tenantRoles.length > 0 && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit_tenant_role">Perfil Customizado (opcional)</Label>
                    <Select
                      value={formData.tenant_role_id || 'none'}
                      onValueChange={(v) => setFormData({ ...formData, tenant_role_id: v === 'none' ? '' : v })}
                    >
                      <SelectTrigger id="edit_tenant_role">
                        <SelectValue placeholder="Nenhum perfil adicional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {tenantRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: role.color }}
                              />
                              <span className="truncate">{role.display_name || role.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="edit_department">Departamento</Label>
                  <Input
                    id="edit_department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit_phone">Telefone</Label>
                  <Input
                    id="edit_phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditUser}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="groups">
          <GroupManagementSection tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};