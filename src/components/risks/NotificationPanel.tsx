import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Bell,
  BellRing,
  Settings,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  Calendar,
  User,
  Target
} from 'lucide-react';
import { useActionPlanNotifications } from '@/hooks/useActionPlanNotifications';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface NotificationPanelProps {
  className?: string;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ className }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    settings,
    markAsRead,
    markAllAsRead,
    updateSettings,
    requestBrowserPermission,
    getNotificationsByType,
    getNotificationStats
  } = useActionPlanNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'overdue' | 'due_soon' | 'unread'>('all');

  const stats = getNotificationStats();

  const filteredNotifications = notifications.filter(notification => {
    switch (selectedFilter) {
      case 'overdue':
        return notification.type === 'overdue';
      case 'due_soon':
        return notification.type === 'due_soon';
      case 'unread':
        return !notification.read;
      default:
        return true;
    }
  });

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    navigate(`/action-plans?highlight=${notification.riskId}`);
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'due_soon':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'high':
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'border-green-500 bg-green-50 dark:bg-green-950/20';
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded">
                <div className="text-lg font-bold text-red-600">{stats.overdue}</div>
                <div className="text-xs text-red-600">Vencidas</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                <div className="text-lg font-bold text-yellow-600">{stats.dueSoon}</div>
                <div className="text-xs text-yellow-600">Próximas</div>
              </div>
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                <div className="text-lg font-bold text-blue-600">{stats.unread}</div>
                <div className="text-xs text-blue-600">Não lidas</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'Todas', count: stats.total },
                { key: 'overdue', label: 'Vencidas', count: stats.overdue },
                { key: 'due_soon', label: 'Próximas', count: stats.dueSoon },
                { key: 'unread', label: 'Não lidas', count: stats.unread }
              ].map(filter => (
                <Button
                  key={filter.key}
                  variant={selectedFilter === filter.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.key as any)}
                  className="text-xs"
                >
                  {filter.label} {filter.count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 text-xs">
                      {filter.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b bg-muted/50">
              <h4 className="font-medium mb-3">Configurações de Notificação</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-notifications" className="text-sm">
                    Notificações do navegador
                  </Label>
                  <Switch
                    id="browser-notifications"
                    checked={settings.browserEnabled}
                    onCheckedChange={(checked) => {
                      if (checked && 'Notification' in window && Notification.permission === 'default') {
                        requestBrowserPermission();
                      }
                      updateSettings({ browserEnabled: checked });
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="text-sm">
                    Notificações por email
                  </Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ emailEnabled: checked })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="overdue-reminders" className="text-sm">
                    Lembretes de vencidas
                  </Label>
                  <Switch
                    id="overdue-reminders"
                    checked={settings.overdueReminders}
                    onCheckedChange={(checked) => 
                      updateSettings({ overdueReminders: checked })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="due-soon-days" className="text-sm">
                    Alertar quantos dias antes do vencimento
                  </Label>
                  <Input
                    id="due-soon-days"
                    type="number"
                    min={1}
                    max={14}
                    value={settings.dueSoonDays}
                    onChange={(e) => 
                      updateSettings({ dueSoonDays: parseInt(e.target.value) || 3 })
                    }
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="font-medium text-muted-foreground mb-2">
                  Nenhuma notificação
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedFilter === 'all' 
                    ? 'Não há notificações para exibir.'
                    : `Não há notificações do tipo "${selectedFilter}".`
                  }
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-muted/50 border-l-4 ${
                      getPriorityColor(notification.priority)
                    } ${
                      notification.read ? 'opacity-60' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm truncate">
                            {notification.title}
                          </h5>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">
                              {notification.riskTitle}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{notification.responsible}</span>
                          </div>
                          
                          {notification.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(notification.dueDate).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                            {notification.daysOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                {notification.daysOverdue}d atraso
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  navigate('/action-plans');
                  setIsOpen(false);
                }}
              >
                Ver Todos os Planos de Ação
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};