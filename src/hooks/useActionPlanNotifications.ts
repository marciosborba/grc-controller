import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSecurity } from '@/utils/tenantSecurity';
import { toast } from 'sonner';

interface NotificationData {
  id: string;
  type: 'overdue' | 'due_soon' | 'completed' | 'new_activity';
  title: string;
  message: string;
  riskId: string;
  riskTitle: string;
  activityId?: string;
  activityName?: string;
  responsible: string;
  dueDate?: string;
  daysOverdue?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  read: boolean;
}

interface NotificationSettings {
  emailEnabled: boolean;
  browserEnabled: boolean;
  dueSoonDays: number; // Quantos dias antes do vencimento notificar
  overdueReminders: boolean;
}

export const useActionPlanNotifications = () => {
  const { user } = useAuth();
  const { userTenantId } = useTenantSecurity();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    browserEnabled: true,
    dueSoonDays: 3,
    overdueReminders: true
  });

  // Função para gerar notificações baseadas nas atividades
  const generateNotifications = useCallback(async () => {
    if (!userTenantId) return;

    try {
      // Buscar todas as atividades dos planos de ação
      const { data: riskData, error: riskError } = await supabase
        .from('risk_registrations')
        .select(`
          id,
          risk_title,
          risk_level
        `)
        .eq('tenant_id', userTenantId);

      if (riskError) throw riskError;

      const newNotifications: NotificationData[] = [];
      const now = new Date();

      for (const risk of riskData || []) {
        const { data: activities, error: activitiesError } = await supabase
          .from('risk_registration_action_plans')
          .select('id, activity_name, activity_description, responsible_name, due_date, priority, status')
          .eq('risk_registration_id', risk.id)
          .neq('status', 'completed')
          .neq('status', 'cancelled');

        if (activitiesError) continue;

        for (const activity of activities || []) {
          const dueDate = new Date(activity.due_date);
          const timeDiff = dueDate.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // Atividades vencidas
          if (daysDiff < 0 && settings.overdueReminders) {
            newNotifications.push({
              id: `overdue-${activity.id}`,
              type: 'overdue',
              title: '🚨 Atividade Vencida',
              message: `A atividade "${activity.activity_name}" está ${Math.abs(daysDiff)} dias em atraso`,
              riskId: risk.id,
              riskTitle: risk.risk_title,
              activityId: activity.id,
              activityName: activity.activity_name,
              responsible: activity.responsible_name,
              dueDate: activity.due_date,
              daysOverdue: Math.abs(daysDiff),
              priority: activity.priority || 'medium',
              createdAt: now,
              read: false
            });
          }
          // Atividades que vencem em breve
          else if (daysDiff >= 0 && daysDiff <= settings.dueSoonDays) {
            newNotifications.push({
              id: `due-soon-${activity.id}`,
              type: 'due_soon',
              title: daysDiff === 0 ? '⏰ Atividade Vence Hoje' : `⏳ Atividade Vence em ${daysDiff} dias`,
              message: `A atividade "${activity.activity_name}" precisa de atenção`,
              riskId: risk.id,
              riskTitle: risk.risk_title,
              activityId: activity.id,
              activityName: activity.activity_name,
              responsible: activity.responsible_name,
              dueDate: activity.due_date,
              priority: activity.priority || 'medium',
              createdAt: now,
              read: false
            });
          }
        }
      }

      // Ordenar por prioridade e data
      const sortedNotifications = newNotifications.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Se mesma prioridade, ordenar por data de vencimento
        if (a.type === 'overdue' && b.type === 'overdue') {
          return (b.daysOverdue || 0) - (a.daysOverdue || 0);
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.read).length);

      // Mostrar toast para notificações críticas
      const criticalNotifications = sortedNotifications.filter(
        n => n.priority === 'critical' || (n.type === 'overdue' && (n.daysOverdue || 0) > 7)
      );

      if (criticalNotifications.length > 0 && settings.browserEnabled) {
        const notification = criticalNotifications[0];
        toast.error(notification.title, {
          description: notification.message,
          duration: 10000,
          action: {
            label: 'Ver Detalhes',
            onClick: () => window.location.href = `/risks?highlight=${notification.riskId}`
          }
        });
      }

    } catch (error) {
      console.error('Erro ao gerar notificações:', error);
    }
  }, [userTenantId, settings]);

  // Marcar notificação como lida
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Limpar notificações antigas
  const clearOldNotifications = useCallback(() => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    setNotifications(prev =>
      prev.filter(notification =>
        notification.createdAt > oneDayAgo || !notification.read
      )
    );
  }, []);

  // Atualizar configurações
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Solicitar permissão para notificações do navegador
  const requestBrowserPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notificações do navegador ativadas!');
      } else {
        toast.error('Permissão para notificações negada');
      }
    }
  }, []);

  // Mostrar notificação do navegador
  const showBrowserNotification = useCallback((notification: NotificationData) => {
    if (!settings.browserEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'critical',
      data: {
        riskId: notification.riskId,
        activityId: notification.activityId
      }
    });

    browserNotification.onclick = () => {
      window.focus();
      window.location.href = `/risks?highlight=${notification.riskId}`;
      browserNotification.close();
    };

    // Auto fechar após 10 segundos para notificações não críticas
    if (notification.priority !== 'critical') {
      setTimeout(() => browserNotification.close(), 10000);
    }
  }, [settings.browserEnabled]);

  // Executar verificação periodicamente
  useEffect(() => {
    if (!user || !userTenantId) return;

    // Verificação inicial
    generateNotifications();

    // Verificar a cada 5 minutos
    const notificationInterval = setInterval(generateNotifications, 5 * 60 * 1000);

    // Limpar notificações antigas a cada hora
    const cleanupInterval = setInterval(clearOldNotifications, 60 * 60 * 1000);

    return () => {
      clearInterval(notificationInterval);
      clearInterval(cleanupInterval);
    };
  }, [user, userTenantId, generateNotifications, clearOldNotifications]);

  // Filtrar notificações por tipo
  const getNotificationsByType = useCallback((type: NotificationData['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Obter estatísticas das notificações
  const getNotificationStats = useCallback(() => {
    return {
      total: notifications.length,
      unread: unreadCount,
      overdue: notifications.filter(n => n.type === 'overdue').length,
      dueSoon: notifications.filter(n => n.type === 'due_soon').length,
      critical: notifications.filter(n => n.priority === 'critical').length
    };
  }, [notifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    settings,
    generateNotifications,
    markAsRead,
    markAllAsRead,
    clearOldNotifications,
    updateSettings,
    requestBrowserPermission,
    showBrowserNotification,
    getNotificationsByType,
    getNotificationStats
  };
};