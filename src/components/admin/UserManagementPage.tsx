import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  Activity,
  Download,
  Upload,
  Settings,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatsCards } from './UserStatsCards';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { UserDetailsDialog } from './UserDetailsDialog';
import { BulkActionsDialog } from './BulkActionsDialog';
import { UserFilters } from './UserFilters';
import type { ExtendedUser, UserManagementFilters, AppRole } from '@/types/user-management';
import { USER_ROLES, USER_STATUS } from '@/types/user-management';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    stats,
    filters,
    isLoadingUsers,
    isLoadingStats,
    setFilters,
    createUser,
    updateUser,
    deleteUser,
    bulkAction,
    hasPermission,
    isCreatingUser,
    isUpdatingUser,
    isDeletingUser,
    isBulkActionLoading
  } = useUserManagement();

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);

  // Aplicar filtros
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value });
  };

  const handleFilterChange = (newFilters: Partial<UserManagementFilters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Seleção de usuários
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Ações individuais
  const handleViewUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setShowDetailsDialog(true);
  };

  const handleEditUser = (user: ExtendedUser) => {
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUser(userId);
    }
  };

  const handleToggleUserStatus = (user: ExtendedUser) => {
    updateUser({
      userId: user.id,
      userData: { is_active: !user.profile.is_active }
    });
  };

  const handleUnlockUser = (userId: string) => {
    updateUser({
      userId,
      userData: { locked_until: null, failed_login_attempts: 0 }
    });
  };

  // Status do usuário
  const getUserStatus = (user: ExtendedUser) => {
    if (user.profile.locked_until && new Date(user.profile.locked_until) > new Date()) {
      return 'locked';
    }
    return user.profile.is_active ? 'active' : 'inactive';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'locked':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getMFABadge = (enabled: boolean) => {
    return enabled ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800">
        <ShieldCheck className="w-3 h-3 mr-1" />
        MFA
      </Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500">
        <ShieldX className="w-3 h-3 mr-1" />
        Sem MFA
      </Badge>
    );
  };

  if (!hasPermission('users.read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para visualizar usuários.</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug - isPlatformAdmin: {currentUser?.isPlatformAdmin ? 'Sim' : 'Não'}</p>
            <p>Roles: {JSON.stringify(currentUser?.roles)}</p>
            <p>Permissions: {JSON.stringify(currentUser?.permissions)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administração de Usuários</h1>
          <p className="text-gray-600">
            Gerencie usuários, permissões e configurações de segurança
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Platform Admin: {currentUser?.isPlatformAdmin ? 'Sim' : 'Não'} | 
            Roles: {currentUser?.roles?.join(', ') || 'Nenhuma'} |
            Can Create: {hasPermission('users.create') ? 'Sim' : 'Não'}
          </div>
        </div>
        <div className="flex gap-2">
          {hasPermission('users.create') && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          )}
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <UserStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários ({users.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              {selectedUsers.length > 0 && hasPermission('users.update') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkDialog(true)}
                >
                  Ações em Lote ({selectedUsers.length})
                </Button>
              )}
            </div>
          </div>
          
          {/* Barra de busca */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <UserFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
            />
          )}
        </CardHeader>

        <CardContent>
          {/* Tabela de usuários */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Cargo/Departamento</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Carregando usuários...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum usuário encontrado</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => 
                              handleSelectUser(user.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {user.profile.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.profile.full_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.profile.job_title || '-'}</div>
                            <div className="text-sm text-gray-500">
                              {user.profile.department || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {USER_ROLES[role]}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(status)}
                        </TableCell>
                        <TableCell>
                          {getMFABadge(user.profile.two_factor_enabled)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.profile.last_login_at ? (
                              <>
                                <div>
                                  {new Date(user.profile.last_login_at).toLocaleDateString()}
                                </div>
                                <div className="text-gray-500">
                                  {new Date(user.profile.last_login_at).toLocaleTimeString()}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-500">Nunca</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              
                              {hasPermission('users.update') && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem 
                                    onClick={() => handleToggleUserStatus(user)}
                                  >
                                    {user.profile.is_active ? (
                                      <>
                                        <Lock className="w-4 h-4 mr-2" />
                                        Desativar
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-4 h-4 mr-2" />
                                        Ativar
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  
                                  {status === 'locked' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleUnlockUser(user.id)}
                                    >
                                      <Unlock className="w-4 h-4 mr-2" />
                                      Desbloquear
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              
                              {hasPermission('users.delete') && user.id !== currentUser?.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showCreateDialog && (
        <CreateUserDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateUser={createUser}
          isLoading={isCreatingUser}
        />
      )}

      {showEditDialog && selectedUser && (
        <EditUserDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          user={selectedUser}
          onUpdateUser={(userData) => updateUser({ userId: selectedUser.id, userData })}
          isLoading={isUpdatingUser}
        />
      )}

      {showDetailsDialog && selectedUser && (
        <UserDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          user={selectedUser}
        />
      )}

      {showBulkDialog && (
        <BulkActionsDialog
          open={showBulkDialog}
          onOpenChange={setShowBulkDialog}
          selectedUserIds={selectedUsers}
          onBulkAction={bulkAction}
          isLoading={isBulkActionLoading}
          onComplete={() => {
            setSelectedUsers([]);
            setShowBulkDialog(false);
          }}
        />
      )}
    </div>
  );
};