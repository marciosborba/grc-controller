import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  Filter,
  RefreshCw,
  Calendar,
  Mail,
  Shield
} from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  job_title?: string;
  tenant_name?: string;
  roles: string[];
  is_active: boolean;
  last_sign_in_at?: string;
  created_at: string;
  session_count: number;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  loggedInToday: number;
  newThisWeek: number;
  platformAdmins: number;
}

export const SystemUsersSection = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    loggedInToday: 0,
    newThisWeek: 0,
    platformAdmins: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Carregar usuários com informações básicas
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          *,
          tenants(name),
          user_roles(role)
        `)
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Carregar estatísticas de sessões ativas
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      // Processar dados dos usuários
      const processedUsers: UserData[] = usersData?.map(user => {
        const authUser = authUsers.users.find(au => au.id === user.user_id);
        const roles = user.user_roles?.map((ur: { role: string }) => ur.role) || [];
        
        return {
          id: user.user_id,
          email: authUser?.email || '',
          full_name: user.full_name || 'N/A',
          job_title: user.job_title,
          tenant_name: user.tenants?.name,
          roles: roles,
          is_active: !authUser?.banned_until,
          last_sign_in_at: authUser?.last_sign_in_at,
          created_at: user.created_at,
          session_count: 0 // TODO: Implementar contagem de sessões
        };
      }) || [];

      setUsers(processedUsers);

      // Calcular estatísticas baseadas nos dados reais
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: UserStats = {
        total: processedUsers.length,
        active: processedUsers.filter(u => u.is_active).length,
        inactive: processedUsers.filter(u => !u.is_active).length,
        loggedInToday: processedUsers.filter(u => 
          u.last_sign_in_at && new Date(u.last_sign_in_at) >= today
        ).length,
        newThisWeek: processedUsers.filter(u => 
          new Date(u.created_at) >= weekAgo
        ).length,
        platformAdmins: processedUsers.filter(u => 
          u.roles.includes('admin') || u.roles.includes('platform_admin')
        ).length
      };

      setUserStats(stats);

    } catch (error) {
      console.error('Erro ao carregar dados de usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && user.is_active) ||
                          (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatLastSignIn = (lastSignIn?: string) => {
    if (!lastSignIn) return 'Nunca';
    
    const date = new Date(lastSignIn);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Há poucos minutos';
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffHours < 168) return `Há ${Math.floor(diffHours / 24)}d`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'ciso': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'risk_manager': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'compliance_officer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'auditor': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
            <p className="text-xs text-muted-foreground">usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.active}</div>
            <p className="text-xs text-muted-foreground">contas ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{userStats.inactive}</div>
            <p className="text-xs text-muted-foreground">contas bloqueadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Login Hoje</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.loggedInToday}</div>
            <p className="text-xs text-muted-foreground">acessos hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{userStats.newThisWeek}</div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{userStats.platformAdmins}</div>
            <p className="text-xs text-muted-foreground">administradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Usuários do Sistema</span>
              </CardTitle>
              <CardDescription>
                Lista completa de usuários cadastrados na plataforma
              </CardDescription>
            </div>
            <Button onClick={loadUserData} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou organização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os papéis</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="ciso">CISO</SelectItem>
                <SelectItem value="risk_manager">Gestor de Riscos</SelectItem>
                <SelectItem value="compliance_officer">Compliance</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Organização</TableHead>
                  <TableHead>Papéis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Carregando usuários...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.full_name}</span>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </span>
                          {user.job_title && (
                            <span className="text-xs text-muted-foreground">{user.job_title}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.tenant_name || 'N/A'}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={`text-xs ${getRoleBadgeColor(role)}`}
                            >
                              {role}
                            </Badge>
                          ))}
                          {user.roles.length === 0 && (
                            <Badge variant="outline" className="text-xs">
                              user
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.is_active ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatLastSignIn(user.last_sign_in_at)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Exibindo {filteredUsers.length} de {users.length} usuários
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};