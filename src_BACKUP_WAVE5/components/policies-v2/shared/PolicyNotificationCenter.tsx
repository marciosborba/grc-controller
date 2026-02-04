import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  Eye,
  Send,
  X,
  Settings,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PolicyNotification {
  id: string;
  type: 'approval' | 'review' | 'expiry' | 'publication' | 'acknowledgment' | 'update';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  policy_id?: string;
  policy_title?: string;
  created_at: string;
  read: boolean;
  action_required: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
}

interface PolicyNotificationCenterProps {
  pendingApprovals: number;
  upcomingReviews: number;
  expiringPolicies: number;
  onNotificationClick: (type: string) => void;
}

const PolicyNotificationCenter: React.FC<PolicyNotificationCenterProps> = ({
  pendingApprovals,
  upcomingReviews,
  expiringPolicies,
  onNotificationClick
}) => {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<PolicyNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'action_required'>('all');

  useEffect(() => {
    generateNotifications();
  }, [pendingApprovals, upcomingReviews, expiringPolicies]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const generateNotifications = () => {
    const newNotifications: PolicyNotification[] = [];

    // Notificações de aprovação pendente
    if (pendingApprovals > 0) {
      newNotifications.push({
        id: 'approval-pending',
        type: 'approval',
        title: 'Aprovações Pendentes',
        description: `${pendingApprovals} política${pendingApprovals > 1 ? 's' : ''} aguardando sua aprovação`,
        priority: 'high',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        read: false,
        action_required: true,
        metadata: { count: pendingApprovals }
      });
    }

    // Notificações de revisão próxima
    if (upcomingReviews > 0) {
      newNotifications.push({
        id: 'review-upcoming',
        type: 'review',
        title: 'Revisões Próximas',
        description: `${upcomingReviews} política${upcomingReviews > 1 ? 's' : ''} precisam de revisão nos próximos 30 dias`,
        priority: 'medium',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 horas atrás
        read: false,
        action_required: true,
        metadata: { count: upcomingReviews }
      });
    }

    // Notificações de políticas expirando
    if (expiringPolicies > 0) {
      newNotifications.push({
        id: 'expiry-warning',
        type: 'expiry',
        title: 'Políticas Expirando',
        description: `${expiringPolicies} política${expiringPolicies > 1 ? 's' : ''} expira${expiringPolicies > 1 ? 'm' : ''} em breve`,
        priority: 'urgent',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
        read: false,
        action_required: true,
        metadata: { count: expiringPolicies }
      });
    }

    // Notificações de exemplo adicionais
    newNotifications.push(
      {
        id: 'policy-published',
        type: 'publication',
        title: 'Política Publicada',
        description: 'Política de Segurança da Informação foi publicada com sucesso',
        priority: 'low',
        policy_id: 'pol-001',
        policy_title: 'Política de Segurança da Informação',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 horas atrás
        read: true,
        action_required: false
      },
      {
        id: 'acknowledgment-reminder',
        type: 'acknowledgment',
        title: 'Reconhecimento Pendente',
        description: 'Você ainda não reconheceu a Política de Trabalho Remoto',
        priority: 'medium',
        policy_id: 'pol-002',
        policy_title: 'Política de Trabalho Remoto',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 horas atrás
        read: false,
        action_required: true
      },
      {
        id: 'policy-updated',
        type: 'update',
        title: 'Política Atualizada',
        description: 'Código de Ética foi atualizado - versão 2.1 disponível',
        priority: 'medium',
        policy_id: 'pol-003',
        policy_title: 'Código de Ética e Conduta',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
        read: true,
        action_required: false
      }
    );

    setNotifications(newNotifications);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval': return CheckCircle;
      case 'review': return Eye;
      case 'expiry': return AlertTriangle;
      case 'publication': return Send;
      case 'acknowledgment': return Users;
      case 'update': return FileText;
      default: return Bell;
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Badge variant=\"destructive\" className=\"text-xs\">Urgente</Badge>;
      case 'high': return <Badge variant=\"secondary\" className=\"text-xs bg-orange-100 text-orange-800\">Alta</Badge>;
      case 'medium': return <Badge variant=\"secondary\" className=\"text-xs\">Média</Badge>;
      case 'low': return <Badge variant=\"outline\" className=\"text-xs\">Baixa</Badge>;
      default: return null;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    
    toast({
      title: '✅ Notificações Marcadas',
      description: 'Todas as notificações foram marcadas como lidas',
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    
    toast({
      title: '🗑️ Notificação Removida',
      description: 'Notificação removida com sucesso',
    });
  };

  const handleNotificationClick = (notification: PolicyNotification) => {
    markAsRead(notification.id);
    
    if (notification.action_required) {
      switch (notification.type) {
        case 'approval':
          onNotificationClick('approval');
          break;
        case 'review':
          onNotificationClick('review');
          break;
        case 'expiry':
          onNotificationClick('expiry');
          break;
        default:
          break;
      }
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'action_required':
        return notification.action_required;
      default:
        return true;
    }
  });

  // Se não há notificações, não mostrar o componente
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className=\"fixed top-4 right-4 z-40\">
      {/* Notification Bell */}
      <div className=\"relative\">
        <Button
          variant=\"outline\"
          size=\"sm\"
          onClick={() => setShowNotifications(!showNotifications)}
          className=\"relative\"
        >
          <Bell className=\"h-4 w-4\" />
          {unreadCount > 0 && (
            <Badge 
              variant=\"destructive\" 
              className=\"absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs\"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Panel */}
        {showNotifications && (
          <Card className=\"absolute top-12 right-0 w-96 max-h-96 shadow-lg border z-50\">
            <CardHeader className=\"pb-3\">
              <div className=\"flex items-center justify-between\">
                <CardTitle className=\"text-sm flex items-center space-x-2\">
                  <Bell className=\"h-4 w-4\" />
                  <span>Notificações de Políticas</span>
                </CardTitle>
                <div className=\"flex items-center space-x-2\">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant=\"ghost\" size=\"sm\" className=\"h-6 w-6 p-0\">
                        <Filter className=\"h-3 w-3\" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align=\"end\">
                      <DropdownMenuItem onClick={() => setFilter('all')}>
                        Todas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter('unread')}>
                        Não lidas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter('action_required')}>
                        Requer ação
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant=\"ghost\"
                    size=\"sm\"
                    onClick={() => setShowNotifications(false)}
                    className=\"h-6 w-6 p-0\"
                  >
                    <X className=\"h-3 w-3\" />
                  </Button>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <div className=\"flex items-center justify-between\">
                  <span className=\"text-xs text-muted-foreground\">
                    {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                  </span>
                  <Button
                    variant=\"ghost\"
                    size=\"sm\"
                    onClick={markAllAsRead}
                    className=\"text-xs h-6\"
                  >
                    Marcar todas como lidas
                  </Button>
                </div>
              )}
            </CardHeader>
            
            <CardContent className=\"p-0 max-h-80 overflow-y-auto\">
              {filteredNotifications.length > 0 ? (
                <div className=\"space-y-1\">
                  {filteredNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-3 border-l-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        } ${getNotificationColor(notification.priority)}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className=\"flex items-start space-x-3\">
                          <IconComponent className=\"h-4 w-4 mt-0.5 flex-shrink-0\" />
                          
                          <div className=\"flex-1 min-w-0\">
                            <div className=\"flex items-center justify-between mb-1\">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              <div className=\"flex items-center space-x-2\">
                                {getPriorityBadge(notification.priority)}
                                {!notification.read && (
                                  <div className=\"w-2 h-2 bg-blue-600 rounded-full\"></div>
                                )}
                              </div>
                            </div>
                            
                            <p className=\"text-xs text-muted-foreground mb-2\">
                              {notification.description}
                            </p>
                            
                            {notification.policy_title && (
                              <p className=\"text-xs font-medium text-blue-600 mb-1\">
                                📋 {notification.policy_title}
                              </p>
                            )}
                            
                            <div className=\"flex items-center justify-between\">
                              <span className=\"text-xs text-muted-foreground\">
                                <Clock className=\"h-3 w-3 inline mr-1\" />
                                {formatDistanceToNow(new Date(notification.created_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant=\"ghost\" 
                                    size=\"sm\" 
                                    className=\"h-6 w-6 p-0\"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className=\"h-3 w-3\" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align=\"end\">
                                  {!notification.read && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      Marcar como lida
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => deleteNotification(notification.id)}
                                    className=\"text-red-600\"
                                  >
                                    Remover
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className=\"p-6 text-center\">
                  <Bell className=\"h-8 w-8 text-muted-foreground mx-auto mb-2\" />
                  <p className=\"text-sm text-muted-foreground\">
                    {filter === 'all' 
                      ? 'Nenhuma notificação' 
                      : filter === 'unread'
                        ? 'Nenhuma notificação não lida'
                        : 'Nenhuma ação pendente'
                    }
                  </p>
                </div>
              )}
            </CardContent>
            
            {filteredNotifications.length > 0 && (
              <div className=\"p-3 border-t bg-muted/30\">
                <Button 
                  variant=\"outline\" 
                  size=\"sm\" 
                  className=\"w-full text-xs\"
                  onClick={() => {
                    setShowNotifications(false);
                    // Navegar para centro de notificações completo
                  }}
                >
                  <Settings className=\"h-3 w-3 mr-2\" />
                  Ver todas as notificações
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default PolicyNotificationCenter;