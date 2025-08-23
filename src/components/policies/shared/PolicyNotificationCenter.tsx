import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Eye,
  MoreHorizontal,
  Filter,
  MarkAsUnread
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { PolicyNotification } from '@/types/policy-management';

interface PolicyNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationUpdate: () => void;
}

export const PolicyNotificationCenter: React.FC<PolicyNotificationCenterProps> = ({
  isOpen,
  onClose,
  onNotificationUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<PolicyNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, user?.tenant?.id]);

  const loadNotifications = async () => {
    if (!user?.tenant?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('policy_notifications')
        .select(`
          *,
          policy:policies(title, category)
        `)
        .eq('tenant_id', user.tenant.id)
        .or(`recipient_id.eq.${user.id},recipient_role.eq.${user.role}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar notificações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('policy_notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read', read_at: new Date().toISOString() }
            : notif
        )
      );
      
      onNotificationUpdate();
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => n.status !== 'read')
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('policy_notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          unreadIds.includes(notif.id)
            ? { ...notif, status: 'read', read_at: new Date().toISOString() }
            : notif
        )
      );
      
      onNotificationUpdate();
      
      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram marcadas como lidas'
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_policy': return CheckCircle;
      case 'policy_update': return Info;
      case 'review_required': return Eye;
      case 'approval_needed': return CheckCircle;
      case 'expiry_warning': return AlertTriangle;
      case 'training_required': return Clock;
      default: return Bell;
    }
  };

  const getNotificationColor = (priority: string, status: string) => {
    if (status === 'read') {
      return 'text-muted-foreground';
    }
    
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-400';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-400';
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInHours = (now.getTime() - notifDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Agora há pouco';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return notifDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return notification.status !== 'read';
      case 'urgent': return notification.priority === 'urgent';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Central de Notificações</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar Todas
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex items-center space-x-2 mt-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Não Lidas ({unreadCount})
            </Button>
            <Button
              variant={filter === 'urgent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('urgent')}
            >
              Urgentes ({notifications.filter(n => n.priority === 'urgent').length})
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(notification.notification_type);
                const isUnread = notification.status !== 'read';
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors ${
                      isUnread ? 'border-primary/50 bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isUnread ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <NotificationIcon className={`h-4 w-4 ${
                            getNotificationColor(notification.priority, notification.status)
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-medium text-sm ${
                              isUnread ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={getPriorityBadge(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              {isUnread && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className={`text-sm mb-2 ${
                            isUnread ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatDate(notification.created_at)}</span>
                            
                            {notification.action_required && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Ação Necessária
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {filter === 'all' ? 'Nenhuma notificação' : 
                 filter === 'unread' ? 'Nenhuma notificação não lida' :
                 'Nenhuma notificação urgente'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Você está em dia com todas as notificações' :
                 filter === 'unread' ? 'Todas as notificações foram lidas' :
                 'Não há notificações urgentes no momento'}
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PolicyNotificationCenter;