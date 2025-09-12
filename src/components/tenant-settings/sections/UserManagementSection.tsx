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
}

export const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  tenantId,
  onUserChange = () => {},
  onSettingsChange = () => {}
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    loadUsers();
  }, [tenantId]);

    const loadUsers = async () => {
    try {
      setIsLoading(true);
      console.log('👥 [USER MANAGEMENT] Carregando usuários para tenant:', tenantId);
      
      if (!tenantId) {
        console.warn('⚠️ [USER MANAGEMENT] Tenant ID não fornecido');
        setUsers([]);
        return;
      }
      
      // Carregar usuários reais do banco de dados
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          full_name,
          phone,
          department,
          job_title,
          created_at,
          is_active,
          last_login_at
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
        
      if (profilesError) {
        console.error('❌ [USER MANAGEMENT] Erro ao carregar profiles:', profilesError);
        toast.error('Erro ao carregar usuários');
        return;
      }
      
      if (!profilesData || profilesData.length === 0) {
        console.log('📋 [USER MANAGEMENT] Nenhum usuário encontrado para este tenant');
        setUsers([]);
        return;
      }
      
      // Buscar roles dos usuários da tabela user_roles
      const userIds = profilesData.map(p => p.user_id).filter(Boolean);
      let userRolesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);
          
        if (!rolesError) {
          userRolesData = rolesData || [];
        }
      }
      
      // Buscar últimos logins dos usuários
      let lastLoginsData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: loginsData, error: loginsError } = await supabase
          .from('activity_logs')
          .select('user_id, created_at')
          .eq('tenant_id', tenantId)
          .eq('action', 'login')
          .in('user_id', userIds)
          .order('created_at', { ascending: false });
          
        if (!loginsError) {
          lastLoginsData = loginsData || [];
        }
      }
      
      // Processar dados dos usuários
      const realUsers: User[] = profilesData.map(profile => {
        // Encontrar último login do usuário
        const lastLogin = lastLoginsData.find(log => log.user_id === profile.user_id);
        
        // Buscar roles do usuário
        const userRoles = userRolesData.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role);
        
        // Determinar role principal
        let role: User['role'] = 'user';
        if (userRoles.includes('tenant_admin')) role = 'tenant_admin';
        else if (userRoles.includes('admin')) role = 'admin';
        else if (userRoles.includes('super_admin')) role = 'admin';
        
        // Determinar status
        let status: User['status'] = 'active';
        if (!profile.is_active) status = 'inactive';
        else if (!lastLogin && !profile.last_login_at) status = 'pending'; // Nunca fez login
        
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || 'Usuário sem nome',
          role,
          status,
          last_login: profile.last_login_at || lastLogin?.created_at || null,
          created_at: profile.created_at,
          department: profile.department || undefined,
          phone: profile.phone || undefined,
          mfa_enabled: false // TODO: Implementar quando houver campo MFA
        };
      });
      
      console.log(`✅ [USER MANAGEMENT] Carregados ${realUsers.length} usuários reais`);
      console.log('📊 [USER MANAGEMENT] Usuários carregados:', realUsers);
      
      setUsers(realUsers);
    } catch (error) {
      console.error('❌ [USER MANAGEMENT] Erro inesperado ao carregar usuários:', error);
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
      console.log('➕ [USER MANAGEMENT] Criando usuário:', formData.email);
      
      // Validações básicas
      if (!formData.email || !formData.full_name) {
        toast.error('Email e nome são obrigatórios');
        return;
      }
      
      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .single();
        
      if (existingUser) {
        toast.error('Este email já está cadastrado');
        return;
      }
      
      // TODO: Implementar criação real de usuário via Supabase Auth
      // Por enquanto, simular criação local
      const newUser: User = {
        id: `temp_${Date.now()}`,
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        status: 'pending',
        last_login: null,
        created_at: new Date().toISOString(),
        department: formData.department,
        phone: formData.phone,
        mfa_enabled: false
      };
      
      setUsers(prev => [...prev, newUser]);
      setIsCreateDialogOpen(false);
      resetForm();
      onUserChange();
      onSettingsChange();
      
      console.log('✅ [USER MANAGEMENT] Usuário criado (simulado):', newUser.email);
      toast.success(
        formData.send_invitation 
          ? 'Usuário criado e convite enviado por email (simulado)'
          : 'Usuário criado com sucesso (simulado)'
      );
    } catch (error) {
      console.error('❌ [USER MANAGEMENT] Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      console.log('✏️ [USER MANAGEMENT] Editando usuário:', selectedUser.email);
      
      // TODO: Implementar edição real no banco de dados
      // Por enquanto, atualizar localmente
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              full_name: formData.full_name,
              role: formData.role,
              department: formData.department,
              phone: formData.phone
            }
          : user
      ));
      
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      onUserChange();
      onSettingsChange();
      
      console.log('✅ [USER MANAGEMENT] Usuário atualizado (simulado):', selectedUser.email);
      toast.success('Usuário atualizado com sucesso (simulado)');
    } catch (error) {
      console.error('❌ [USER MANAGEMENT] Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`Tem certeza que deseja excluir o usuário ${user.full_name}?`)) return;
    
    try {
      console.log('🗑️ [USER MANAGEMENT] Excluindo usuário:', user.email);
      
      // TODO: Implementar exclusão real no banco de dados
      // Por enquanto, remover localmente
      setUsers(prev => prev.filter(user => user.id !== userId));
      onUserChange();
      onSettingsChange();
      
      console.log('✅ [USER MANAGEMENT] Usuário excluído (simulado):', user.email);
      toast.success('Usuário excluído com sucesso (simulado)');
    } catch (error) {
      console.error('❌ [USER MANAGEMENT] Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    try {
      console.log('🔄 [USER MANAGEMENT] Alterando status do usuário:', user.email);
      
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      // TODO: Implementar alteração real no banco de dados
      // Por enquanto, atualizar localmente
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, status: newStatus }
          : u
      ));
      
      onUserChange();
      onSettingsChange();
      
      console.log(`✅ [USER MANAGEMENT] Status alterado para ${newStatus} (simulado) para usuário:`, user.email);
      toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso (simulado)`);
    } catch (error) {
      console.error('❌ [USER MANAGEMENT] Erro ao atualizar status:', error);
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
    setFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department || '',
      phone: user.phone || '',
      send_invitation: false
    });
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
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
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
                  <Button onClick={handleCreateUser}>
                    Criar Usuário
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
                        <Badge className="bg-green-100 text-green-800">
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
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.status === 'active' ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};