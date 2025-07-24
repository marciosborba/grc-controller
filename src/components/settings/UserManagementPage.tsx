import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Mail,
  Shield,
  Key,
  Moon,
  Sun,
  Search,
  Activity,
  Save
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  permissions: string[];
  isActive: boolean;
  theme: 'light' | 'dark';
  lastLogin?: string;
}

const availableModules = [
  { value: 'dashboard', label: 'Dashboard', description: 'Acesso à visão geral e métricas' },
  { value: 'risks', label: 'Gestão de Riscos', description: 'Gerenciar riscos e avaliações' },
  { value: 'compliance', label: 'Conformidade', description: 'Acompanhar e gerenciar conformidade' },
  { value: 'incidents', label: 'Incidentes', description: 'Registrar e gerenciar incidentes de segurança' },
  { value: 'audit', label: 'Auditoria', description: 'Acessar relatórios e processos de auditoria' },
  { value: 'policies', label: 'Políticas', description: 'Visualizar e gerenciar políticas' },
  { value: 'vendors', label: 'Fornecedores', description: 'Gerenciar riscos de terceiros' },
  { value: 'assessments', label: 'Assessments', description: 'Criar e gerenciar assessments' },
  { value: 'ethics', label: 'Canal de Ética', description: 'Acessar o canal de denúncias éticas' },
  { value: 'reports', label: 'Relatórios', description: 'Gerar e visualizar relatórios' },
  { value: 'settings', label: 'Configurações', description: 'Acessar configurações do sistema' },
  { value: 'admin', label: 'Administração Completa', description: 'Acesso total a todas as funcionalidades e configurações' },
];

export const UserManagementPage = () => {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    jobTitle: '',
    permissions: [] as string[],
    isActive: true,
    theme: 'light' as 'light' | 'dark',
    password: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } else {
      setUsers(data as User[]);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.jobTitle && user.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getModuleLabel = (moduleValue: string) => {
    return availableModules.find(module => module.value === moduleValue)?.label || moduleValue;
  };

  const handleCreateUser = async () => {
    const { email, password, name, jobTitle, permissions, isActive, theme } = newUser;

    if (!email || !password || !name) {
      toast({
        title: "Erro",
        description: "Email, senha e nome são obrigatórios para criar um novo usuário.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          job_title: jobTitle,
          permissions: permissions,
          is_active: isActive,
          theme: theme,
        },
      },
    });

    if (error) {
      console.error('Erro ao criar usuário:', error); // Log do erro completo para depuração
      let errorMessage = "Não foi possível criar o usuário.";

      if (error.message.includes('User already registered') || error.message.includes('Email already registered')) {
        errorMessage = "E-mail já cadastrado.";
      } else if (error.message.includes('Invalid email')) {
        errorMessage = "Formato de e-mail inválido. Por favor, verifique o e-mail digitado.";
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } else if (data.user) {
      // Supabase automatically creates a profile via trigger, so just refetch users
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso! Um email de confirmação foi enviado.",
      });
      setIsNewUserOpen(false);
      setNewUser({
        name: '',
        email: '',
        jobTitle: '',
        permissions: [],
        isActive: true,
        theme: 'light',
        password: '',
      });
      fetchUsers(); // Refresh the user list
    } else {
      toast({
        title: "Atenção",
        description: "Usuário criado, mas sem retorno de dados. Verifique o console.",
        variant: "warning",
      });
      setIsNewUserOpen(false);
      setNewUser({
        name: '',
        email: '',
        jobTitle: '',
        permissions: [],
        isActive: true,
        theme: 'light',
        password: '',
      });
      fetchUsers(); // Refresh the user list
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    const { id, ...updates } = editingUser;
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select();
    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    } else {
      setUsers(users.map(user => (user.id === id ? data[0] as User : user)));
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      setIsEditUserOpen(false);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    } else {
      setUsers(users.filter(user => user.id !== userId));
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });
    }
  };

  const handleToggleActive = async (user: User) => {
    const { data, error } = await supabase.from('profiles').update({ isActive: !user.isActive }).eq('id', user.id).select();
    if (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do usuário.",
        variant: "destructive",
      });
    } else {
      setUsers(users.map(u => (u.id === user.id ? data[0] as User : u)));
      toast({
        title: "Sucesso",
        description: `Usuário ${data[0].isActive ? 'ativado' : 'desativado'} com sucesso!`, 
      });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <div className="ml-4">
          <p className="text-lg font-medium">Carregando configurações...</p>
          <p className="text-sm text-muted-foreground">Aguarde enquanto carregamos seus dados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Administração de usuários, papéis e permissões
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/settings/activity-logs'}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Logs de Atividade</span>
          </Button>
          <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
            <DialogTrigger asChild>
              <Button className="grc-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Nome Completo</label>
                  <Input
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Senha</label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Senha do usuário"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cargo</label>
                  <Input
                    value={newUser.jobTitle}
                    onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                    placeholder="Cargo do usuário"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tema</label>
                  <Select 
                    value={newUser.theme} 
                    onValueChange={(value: 'light' | 'dark') => setNewUser({ ...newUser, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Permissões de Módulo</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                    {availableModules.map((module) => (
                      <div key={module.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`new-user-${module.value}`}
                          checked={newUser.permissions.includes(module.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUser({ ...newUser, permissions: [...newUser.permissions, module.value] });
                            } else {
                              setNewUser({ ...newUser, permissions: newUser.permissions.filter(p => p !== module.value) });
                            }
                          }}
                          className="rounded border-border"
                        />
                        <label htmlFor={`new-user-${module.value}`} className="text-sm">
                          <div className="font-medium">{module.label}</div>
                          <div className="text-xs text-muted-foreground">{module.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateUser} className="w-full grc-button-primary">
                  Criar Usuário
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="grc-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {filteredUsers.length} usuários
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="grc-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="cursor-pointer" onClick={() => {
                    setEditingUser(user);
                    setIsEditUserOpen(true);
                  }}>
                    <h3 className="font-semibold text-foreground hover:underline">{user.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{user.jobTitle}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Permissions */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground mb-1">Permissões</p>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {user.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {getModuleLabel(permission)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-1">Status</p>
                    <Switch checked={user.isActive} onCheckedChange={() => handleToggleActive(user)} />
                    <span className="text-xs text-muted-foreground block mt-1">
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Theme */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground mb-1">Tema</p>
                    <div className="flex items-center justify-center">
                      {user.theme === 'dark' ? (
                        <Moon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Sun className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Last Login (mocked for now) */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground mb-1">Último Login</p>
                    <p className="text-xs text-muted-foreground">{user.lastLogin || 'N/A'}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingUser(user);
                      setIsEditUserOpen(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} className="text-danger hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome Completo</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="email@empresa.com"
                  disabled // Email should not be editable for existing users
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cargo</label>
                <Input
                  value={editingUser.jobTitle || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, jobTitle: e.target.value })}
                  placeholder="Cargo do usuário"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tema</label>
                <Select 
                  value={editingUser.theme} 
                  onValueChange={(value: 'light' | 'dark') => setEditingUser({ ...editingUser, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Permissões de Módulo</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                  {availableModules.map((module) => (
                    <div key={module.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-user-${module.value}`}
                        checked={editingUser.permissions.includes(module.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingUser({ ...editingUser, permissions: [...editingUser.permissions, module.value] });
                          } else {
                            setEditingUser({ ...editingUser, permissions: editingUser.permissions.filter(p => p !== module.value) });
                          }
                        }}
                        className="rounded border-border"
                      />
                      <label htmlFor={`edit-user-${module.value}`} className="text-sm">
                        <div className="font-medium">{module.label}</div>
                        <div className="text-xs text-muted-foreground">{module.description}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancelar</Button>
              <Button onClick={handleUpdateUser} className="grc-button-primary">
                <Save className="h-4 w-4 mr-2" /> Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Current User Panel */}
      {currentUser && (
        <Card className="grc-card border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Seu Perfil</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{currentUser?.name || 'Usuário'}</h3>
                  <p className="text-sm text-muted-foreground flex items-center space-x-2">
                    <Mail className="h-3 w-3" />
                    <span>{currentUser?.email || 'Carregando...'}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{currentUser?.jobTitle || 'Cargo não informado'}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {currentUser?.permissions?.map((permission) => (
                      <Badge key={permission} className="bg-primary/10 text-primary border-primary/30 text-xs">
                        {getModuleLabel(permission)}
                      </Badge>
                    )) || (
                      <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                        Carregando...
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={currentUser?.toggleTheme}
                  className="flex items-center space-x-2"
                >
                  {currentUser?.theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      <span>Modo Escuro</span>
                    </>
                  )}
                </Button>
                <div className="text-xs text-muted-foreground">
                  Tema atual: {currentUser?.theme === 'dark' ? 'Escuro' : 'Claro'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!currentUser && !isAuthLoading && (
        <Card className="grc-card border-orange-300 bg-orange-50">
          <CardContent className="p-6 text-center">
            <p className="text-orange-800">Dados do usuário não foram carregados. Tente recarregar a página.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};