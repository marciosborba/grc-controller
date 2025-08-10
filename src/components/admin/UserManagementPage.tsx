import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  RefreshCw,
  AlertTriangle,
  Download
} from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useAuth } from '@/contexts/AuthContext';
import { UserStatsCards } from './UserStatsCards';
import { CreateUserDialog } from './CreateUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { UserDetailsDialog } from './UserDetailsDialog';
import { BulkActionsDialog } from './BulkActionsDialog';
import { UserFilters } from './UserFilters';
import SortableUserCard from './SortableUserCard';
import type { ExtendedUser, UserManagementFilters, AppRole } from '@/types/user-management';
import { USER_ROLES, USER_STATUS } from '@/types/user-management';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';

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
  const [orderedUsers, setOrderedUsers] = useState<ExtendedUser[]>([]);

  // Configure drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update ordered users when users data changes
  useEffect(() => {
    if (users.length > 0) {
      setOrderedUsers(users);
    }
  }, [users]);

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedUsers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save order to localStorage
        localStorage.setItem('userCardsOrder', JSON.stringify(newOrder.map(u => u.id)));
        
        return newOrder;
      });
    }
  };

  // Load saved order from localStorage
  useEffect(() => {
    const savedOrder = localStorage.getItem('userCardsOrder');
    if (savedOrder && users.length > 0) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const reorderedUsers = orderIds
          .map((id: string) => users.find(user => user.id === id))
          .filter(Boolean)
          .concat(users.filter(user => !orderIds.includes(user.id)));
        setOrderedUsers(reorderedUsers);
      } catch (error) {
        console.warn('Failed to load saved user order:', error);
        setOrderedUsers(users);
      }
    }
  }, [users]);

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
      setSelectedUsers(orderedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  // Funções para o UserCard
  const handleUserUpdate = (userId: string, userData: unknown) => {
    updateUser({
      userId,
      userData
    });
  };

  const handleUserDelete = (userId: string) => {
    deleteUser(userId);
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
    <div className="space-y-6 max-w-full overflow-x-hidden">
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
              Usuários ({orderedUsers.length})
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
          {/* Grid de Cards de usuários */}
          {isLoadingUsers ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin mr-3" />
                <span className="text-lg">Carregando usuários...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                <p className="text-sm">Tente ajustar os filtros ou criar um novo usuário.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Seleção em massa */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={selectedUsers.length === orderedUsers.length && orderedUsers.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  {selectedUsers.length > 0 
                    ? `${selectedUsers.length} usuário(s) selecionado(s)`
                    : `Selecionar todos os ${orderedUsers.length} usuários`
                  }
                </span>
              </div>

              {/* Grid de Cards with Drag & Drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext
                  items={orderedUsers.map(user => user.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 max-w-full overflow-hidden">
                    {orderedUsers.map((user) => (
                      <SortableUserCard
                        key={user.id}
                        user={user}
                        onUpdate={handleUserUpdate}
                        onDelete={handleUserDelete}
                        isUpdating={isUpdatingUser}
                        isDeleting={isDeletingUser}
                        canEdit={hasPermission('users.update') || currentUser?.id === user.id}
                        canDelete={hasPermission('users.delete') && currentUser?.id !== user.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
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