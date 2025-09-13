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
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionsInfo } from './PermissionsInfo';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin' | 'tenant_admin';
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
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  tenantId,
  onUserChange = () => {},
  onSettingsChange = () => {},
  onMetricsUpdate = () => {}
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'user' as User['role'],
    department: '',
    phone: '',
    send_invitation: true
  });
  
  // Hook de permissões
  const permissions = usePermissions();

  useEffect(() => {
    loadUsers();
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
        
        // Buscar roles do usuário
        const userRoles = userRolesData.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role);
        
        // Determinar role principal
        let role: User['role'] = 'user';
        if (userRoles.includes('tenant_admin')) role = 'tenant_admin';
        else if (userRoles.includes('admin')) role = 'admin';
        else if (userRoles.includes('super_admin')) role = 'admin';
        
        // Determinar status baseado no user_id e is_active
        let status: User['status'] = 'active';
        try {
          if (!profile.user_id) {
            // Se não tem user_id, é um convite pendente
            status = 'pending';
          } else if (profile.is_active === false) {
            // Se tem user_id mas is_active é false, usuário foi inativado
            status = 'inactive';
          } else {
            // Se tem user_id e is_active é true, usuário está ativo
            status = 'active';
          }
        } catch (error) {
          status = 'active';
        }
        
        const processedUser = {
          id: profile.id || `unknown_${index}`,
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
      
      // Validações básicas
      if (!formData.email || formData.email.trim() === '') {
        toast.error('Email é obrigatório');
        setIsCreating(false);
        return;
      }
      
      if (!formData.full_name || formData.full_name.trim() === '') {
        toast.error('Nome é obrigatório');
        setIsCreating(false);
        return;
      }
      
      if (!tenantId) {
        toast.error('Erro: Tenant ID não encontrado');
        setIsCreating(false);
        return;
      }
      
      // Verificar se email já existe
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email);
        
      if (checkError) {
        toast.error('Erro ao verificar email existente');
        setIsCreating(false);
        return;
      } else if (existingUsers && existingUsers.length > 0) {
        toast.error('Este email já está cadastrado');
        setIsCreating(false);
        return;
      }
      
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Email inválido');
        setIsCreating(false);
        return;
      }
      
      // Verificar permissões usando o hook
      if (permissions.isLoading) {
        toast.error('Verificando permissões...');
        setIsCreating(false);
        return;
      }
      
      if (!permissions.canAccessTenant(tenantId)) {
        toast.error('Você não tem permissão para criar usuários nesta organização');
        setIsCreating(false);
        return;
      }
      
      
      // Verificar tenant
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('id', tenantId)
        .single();
        
      if (tenantError || !tenantData) {
        toast.error('Erro: Organização não encontrada');
        setIsCreating(false);
        return;
      }
      
      // PASSO 1: Criar profile sem user_id (convite)
      const profileData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        tenant_id: tenantId,
        is_active: false, // Inativo até completar registro
        department: formData.department?.trim() || null,
        phone: formData.phone?.trim() || null
        // user_id não enviado (será null) - usuário se vincula quando fazer login
      };
      
      
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select('*')
        .single();
      
      if (insertError) {
        toast.error(`Erro Profile: ${insertError.message}`);
        setIsCreating(false);
        return;
      }
      
      
      // Nota: Role será criada quando o usuário se registrar com um user_id válido
      
      // Finalizar
      setIsCreateDialogOpen(false);
      resetForm();
      await loadUsers();
      onUserChange();
      onSettingsChange();
      
      toast.success('Convite criado! O usuário deve se registrar para ativar a conta.');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro inesperado: ${errorMessage}`);
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
        const updateData = {
          email: formData.email,
          full_name: formData.full_name,
          department: formData.department || null,
          phone: formData.phone || null,
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
        
        // Atualizar role se necessário (tabela user_roles)
        if (formData.role !== selectedUser.role) {
          // Buscar user_id do profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('id', selectedUser.id)
            .single();
            
          if (profileData?.user_id) {
            // Remover roles antigas
            await supabase
              .from('user_roles')
              .delete()
              .eq('user_id', profileData.user_id);
              
            // Adicionar nova role
            await supabase
              .from('user_roles')
              .insert({
                user_id: profileData.user_id,
                role: formData.role,
                tenant_id: tenantId,
                created_at: new Date().toISOString()
              });
          }
        }
        
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
        // Excluir permanentemente da tabela profiles (é apenas um convite)
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
          
        if (deleteError) {
          toast.error('Erro ao excluir convite: ' + deleteError.message);
          return;
        }
        
        toast.success('Convite excluído com sucesso!');
      } catch (error) {
        toast.error('Erro inesperado ao excluir convite');
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
      role: 'user',
      department: '',
      phone: '',
      send_invitation: true
    });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    
    const newFormData = {
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department || '',
      phone: user.phone || '',
      send_invitation: false
    };
    
    setFormData(newFormData);
    setIsEditDialogOpen(true);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tenant_admin': return 'Admin da Organização';
      case 'admin': return 'Administrador';
      case 'user': return 'Usuário';
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
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                  <DialogDescription>
                    Adicione um novo usuário à sua organização.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="role">Função</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="tenant_admin">Admin da Organização</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="send_invitation"
                      checked={formData.send_invitation}
                      onCheckedChange={(checked) => setFormData({ ...formData, send_invitation: checked })}
                    />
                    <Label htmlFor="send_invitation">Enviar convite por email</Label>
                  </div>
                </div>

                <DialogFooter>
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
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Usuários */}
          <div className="rounded-md border">
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
                          // Para usuários ativos/inativos: toggle status + inativar
                          <>
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
            <div className="text-center py-8 text-muted-foreground">
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
        <DialogContent className="sm:max-w-[500px]">
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
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="tenant_admin">Admin da Organização</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
            }}>
              Cancelar
            </Button>
            <Button 
              type="button"
              onClick={handleEditUser}
              disabled={isProcessing}
            >
              {isProcessing ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};