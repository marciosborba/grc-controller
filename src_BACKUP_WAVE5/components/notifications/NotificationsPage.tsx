// ============================================================================
// PÁGINA COMPLETA DE NOTIFICAÇÕES
// ============================================================================
// Sistema abrangente de gestão de notificações para workflow de processos GRC

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bell,
  Filter,
  Search,
  CheckCheck,
  Archive,
  Trash2,
  Settings,
  RefreshCw,
  Plus,
  MoreVertical,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Tag,
  Mail,
  Phone,
  Smartphone
} from 'lucide-react';

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
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationsRealtime } from '@/contexts/NotificationsRealtimeContext';
import {
  Notification,
  NotificationFilters,
  NotificationPriority,
  NotificationStatus,
  NotificationModule
} from '@/types/notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NotificationPreferences } from './NotificationPreferences';
import ExpandableNotificationCard from './ExpandableNotificationCard';
import { QuickMetrics } from './shared/QuickMetrics';

// Componente principal da página
export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    notifications,
    loading,
    error,
    stats,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    dismissNotification,
    searchNotifications,
    filterNotifications,
    clearFilters,
    refreshNotifications,
    executeAction
  } = useNotifications();

  const {
    isConnected,
    connectionStatus,
    lastError,
    reconnect,
    messagesReceived,
    connectionTime
  } = useNotificationsRealtime();

  // Estados locais
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtros
  const [currentFilters, setCurrentFilters] = useState<NotificationFilters>({});

  // Mapeamento de prioridades para cores e ícones
  const priorityConfig = {
    low: { color: 'bg-green-100 text-green-800 border-green-200', icon: ArrowDown },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ArrowUp },
    high: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle },
    critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle }
  };

  // Mapeamento de status para cores
  const statusConfig = {
    unread: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Bell },
    read: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle },
    archived: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Archive },
    dismissed: { color: 'bg-gray-100 text-gray-600 border-gray-200', icon: XCircle }
  };

  // Mapeamento de módulos para cores
  const moduleConfig: Record<NotificationModule, { color: string; label: string }> = {
    assessments: { color: 'bg-blue-100 text-blue-800', label: 'Assessments' },
    risks: { color: 'bg-red-100 text-red-800', label: 'Riscos' },
    compliance: { color: 'bg-green-100 text-green-800', label: 'Compliance' },
    policies: { color: 'bg-purple-100 text-purple-800', label: 'Políticas' },
    privacy: { color: 'bg-indigo-100 text-indigo-800', label: 'Privacidade' },
    audit: { color: 'bg-yellow-100 text-yellow-800', label: 'Auditoria' },
    users: { color: 'bg-teal-100 text-teal-800', label: 'Usuários' },
    system: { color: 'bg-gray-100 text-gray-800', label: 'Sistema' },
    'general-settings': { color: 'bg-slate-100 text-slate-800', label: 'Configurações' },
    frameworks: { color: 'bg-orange-100 text-orange-800', label: 'Frameworks' },
    incidents: { color: 'bg-pink-100 text-pink-800', label: 'Incidentes' }
  };

  // Aplicar filtros da URL
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const moduleParam = searchParams.get('module');
    const searchParam = searchParams.get('search');

    const urlFilters: NotificationFilters = {};

    if (statusParam) urlFilters.status = [statusParam as NotificationStatus];
    if (priorityParam) urlFilters.priority = [priorityParam as NotificationPriority];
    if (moduleParam) urlFilters.module = [moduleParam as NotificationModule];

    setCurrentFilters(urlFilters);
    filterNotifications(urlFilters);

    if (searchParam) {
      setSearchQuery(searchParam);
      searchNotifications(searchParam);
    }
  }, [searchParams, filterNotifications, searchNotifications]);

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchNotifications(query);

    if (query) {
      searchParams.set('search', query);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleFilterChange = (newFilters: NotificationFilters) => {
    setCurrentFilters(newFilters);
    filterNotifications(newFilters);

    // Atualizar URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0) {
        searchParams.set(key, value[0]);
      } else {
        searchParams.delete(key);
      }
    });
    setSearchParams(searchParams);
  };

  const handleSelectNotification = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedNotifications(prev => [...prev, id]);
    } else {
      setSelectedNotifications(prev => prev.filter(nId => nId !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const handleBulkAction = async (action: 'read' | 'unread' | 'archive' | 'delete') => {
    try {
      const promises = selectedNotifications.map(id => {
        switch (action) {
          case 'read':
            return markAsRead(id);
          case 'unread':
            return markAsUnread(id);
          case 'archive':
            return archiveNotification(id);
          case 'delete':
            return dismissNotification(id);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setSelectedNotifications([]);
      toast.success(`${selectedNotifications.length} notificações processadas`);
    } catch (error) {
      toast.error('Erro ao processar notificações');
    }
  };



  const handleActionClick = async (notification: Notification, actionId: string) => {
    try {
      const action = notification.actions?.find(a => a.id === actionId);
      if (!action) return;

      if (action.url) {
        navigate(action.url);
      } else {
        await executeAction(notification.id, actionId);
        toast.success('Ação executada com sucesso');
      }
    } catch (error) {
      toast.error('Erro ao executar ação');
    }
  };

  // Filtrar notificações por aba
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => n.status === 'unread');
      case 'important':
        return notifications.filter(n => n.priority === 'high' || n.priority === 'critical');
      case 'archived':
        return notifications.filter(n => n.status === 'archived');
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">Notificações</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie notificações e workflow dos processos
            </p>
            {/* Indicador de conexão em tempo real */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" :
                  connectionStatus === 'connecting' ? "bg-yellow-500 animate-pulse" :
                    "bg-red-500"
              )} />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {isConnected ? 'Tempo real ativo' :
                  connectionStatus === 'connecting' ? 'Conectando...' :
                    'Desconectado'}
              </span>
              {!isConnected && connectionStatus === 'error' && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={reconnect}
                  className="text-xs h-auto p-0 text-primary"
                >
                  Reconectar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNotifications}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="hidden sm:inline ml-1">Atualizar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Filtros</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Configurações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">

              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={clearFilters}>
                <XCircle className="h-4 w-4 mr-2" />
                Limpar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards - Premium Style */}
      <QuickMetrics
        metrics={{
          totalNotifications: stats.total,
          unreadCount: stats.unread,
          criticalCount: stats.byPriority.critical || 0,
          overdueCount: stats.overdue || 0,
          byPriority: stats.byPriority,
          byModule: stats.byModule,
          byStatus: stats.byStatus,
          responseRate: 0, // Não disponível no hook padrão
          avgResponseTime: 0 // Não disponível no hook padrão
        }}
        isLoading={loading}
      />

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={currentFilters.status?.[0] || ''}
                  onValueChange={(value) =>
                    handleFilterChange({
                      ...currentFilters,
                      status: value ? [value as NotificationStatus] : undefined
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="unread">Não lidas</SelectItem>
                    <SelectItem value="read">Lidas</SelectItem>
                    <SelectItem value="archived">Arquivadas</SelectItem>
                    <SelectItem value="dismissed">Descartadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridade</label>
                <Select
                  value={currentFilters.priority?.[0] || ''}
                  onValueChange={(value) =>
                    handleFilterChange({
                      ...currentFilters,
                      priority: value ? [value as NotificationPriority] : undefined
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Módulo</label>
                <Select
                  value={currentFilters.module?.[0] || ''}
                  onValueChange={(value) =>
                    handleFilterChange({
                      ...currentFilters,
                      module: value ? [value as NotificationModule] : undefined
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os módulos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os módulos</SelectItem>
                    {Object.entries(moduleConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pesquisar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar notificações..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações em lote */}
      {selectedNotifications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedNotifications.length} notificação(ões) selecionada(s)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('read')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Marcar como lida
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Arquivar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Todas ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Não lidas ({stats.unread})
            </TabsTrigger>
            <TabsTrigger value="important" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Importantes ({(stats.byPriority.high || 0) + (stats.byPriority.critical || 0)})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Arquivadas ({stats.byStatus.archived || 0})
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {activeTab === 'preferences' ? (
              <NotificationPreferences />
            ) : loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Nenhuma notificação encontrada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'all'
                      ? 'Você não tem notificações no momento.'
                      : `Nenhuma notificação ${activeTab === 'unread' ? 'não lida' : activeTab} encontrada.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ExpandableNotificationsList
                notifications={filteredNotifications}
                selectedNotifications={selectedNotifications}
                onSelectNotification={handleSelectNotification}
                onSelectAll={handleSelectAll}
                onMarkAsRead={markAsRead}
                onMarkAsUnread={markAsUnread}
                onArchive={archiveNotification}
                onDelete={dismissNotification}
                onActionClick={handleActionClick}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Componente de lista de notificações expansivas
interface ExpandableNotificationsListProps {
  notifications: Notification[];
  selectedNotifications: string[];
  onSelectNotification: (id: string, selected: boolean) => void;
  onSelectAll: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onActionClick: (notification: Notification, actionId: string) => void;
}

const ExpandableNotificationsList: React.FC<ExpandableNotificationsListProps> = ({
  notifications,
  selectedNotifications,
  onSelectNotification,
  onSelectAll,
  onMarkAsRead,
  onMarkAsUnread,
  onArchive,
  onDelete,
  onActionClick
}) => {
  const allSelected = notifications.length > 0 && selectedNotifications.length === notifications.length;
  const someSelected = selectedNotifications.length > 0 && selectedNotifications.length < notifications.length;

  return (
    <div className="space-y-4">
      {/* Header da lista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={someSelected ? 'indeterminate' : allSelected}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Selecionar todas
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          {notifications.length} notificação(ões)
        </span>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <ExpandableNotificationCard
            key={notification.id}
            notification={notification}
            isSelected={selectedNotifications.includes(notification.id)}
            onSelect={(selected) => onSelectNotification(notification.id, selected)}
            onMarkAsRead={onMarkAsRead}
            onMarkAsUnread={onMarkAsUnread}
            onArchive={onArchive}
            onDelete={onDelete}
            onActionClick={onActionClick}
          />
        ))}
      </div>
    </div>
  );
};





export default NotificationsPage;