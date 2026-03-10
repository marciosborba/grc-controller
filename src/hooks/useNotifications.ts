// ============================================================================
// HOOK DE GERENCIAMENTO DE NOTIFICAÇÕES
// ============================================================================
// Hook completo para gerenciar notificações, integração com API e estado local

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import {
  Notification as AppNotification,
  NotificationFilters,
  NotificationStats,
  NotificationPreferences,
  CreateNotificationPayload,
  UpdateNotificationPayload,
  NotificationListResponse,
  NotificationStatus,
  NotificationPriority,
  NotificationModule,
  NotificationType
} from '@/types/notifications';

// Mock data para desenvolvimento
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    type: 'assessment_due',
    module: 'assessments',
    title: 'Assessment ISO 27001 Vencendo',
    message: 'O assessment de controles ISO 27001 vence em 2 dias. É necessário completar a avaliação dos controles pendentes.',
    shortMessage: 'Assessment vence em 2 dias',
    status: 'unread',
    priority: 'high',
    userId: 'current-user',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    metadata: {
      assessmentId: 'assess_123',
      dueDate: new Date(Date.now() + 172800000).toISOString(),
      workflowStage: 'evaluation'
    },
    actions: [
      {
        id: 'view_assessment',
        label: 'Ver Assessment',
        type: 'primary',
        url: '/assessments/assess_123'
      },
      {
        id: 'request_extension',
        label: 'Solicitar Prorrogação',
        type: 'secondary',
        action: 'escalate'
      }
    ],
    emailSettings: {
      enabled: true,
      template: 'assessment_due_reminder',
      priority: 'high',
      delay: 30
    }
  },
  {
    id: '2',
    type: 'risk_escalated',
    module: 'risks',
    title: 'Risco Crítico Identificado',
    message: 'Um novo risco crítico foi identificado no sistema de pagamentos. Requer ação imediata para avaliação e tratamento.',
    shortMessage: 'Risco crítico no sistema de pagamentos',
    status: 'unread',
    priority: 'critical',
    userId: 'current-user',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    metadata: {
      riskId: 'risk_456',
      severity: 'critical',
      category: 'cybersecurity',
      escalationLevel: 1
    },
    actions: [
      {
        id: 'review_risk',
        label: 'Revisar Risco',
        type: 'danger',
        url: '/risks/risk_456'
      },
      {
        id: 'assign_team',
        label: 'Atribuir Equipe',
        type: 'primary',
        action: 'escalate'
      }
    ]
  },
  {
    id: '3',
    type: 'privacy_request_received',
    module: 'privacy',
    title: 'Solicitação LGPD Recebida',
    message: 'Nova solicitação de exclusão de dados pessoais recebida. Prazo legal de 15 dias para resposta.',
    shortMessage: 'Nova solicitação LGPD',
    status: 'read',
    priority: 'medium',
    userId: 'current-user',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    readAt: new Date(Date.now() - 3600000).toISOString(),
    metadata: {
      entityId: 'privacy_req_789',
      dueDate: new Date(Date.now() + 1296000000).toISOString(),
      category: 'data_deletion'
    },
    actions: [
      {
        id: 'process_request',
        label: 'Processar Solicitação',
        type: 'primary',
        url: '/privacy/requests/privacy_req_789'
      }
    ]
  },
  {
    id: '4',
    type: 'policy_review_due',
    module: 'policies',
    title: 'Revisão de Política Pendente',
    message: 'A Política de Segurança da Informação está programada para revisão anual.',
    shortMessage: 'Revisão de política pendente',
    status: 'unread',
    priority: 'low',
    userId: 'current-user',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    metadata: {
      policyId: 'policy_101',
      dueDate: new Date(Date.now() + 604800000).toISOString(),
      workflowStage: 'review_scheduled'
    },
    actions: [
      {
        id: 'start_review',
        label: 'Iniciar Revisão',
        type: 'primary',
        url: '/policies/policy_101/review'
      },
      {
        id: 'postpone',
        label: 'Adiar',
        type: 'secondary',
        action: 'dismiss'
      }
    ]
  },
  {
    id: '5',
    type: 'system_alert',
    module: 'system',
    title: 'Backup Concluído com Avisos',
    message: 'O backup diário foi concluído, mas alguns arquivos apresentaram avisos durante o processo.',
    shortMessage: 'Backup com avisos',
    status: 'unread',
    priority: 'medium',
    userId: 'current-user',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    metadata: {
      category: 'backup',
      customFields: {
        backupId: 'backup_20240816',
        warningCount: 3,
        totalFiles: 15420
      }
    },
    actions: [
      {
        id: 'view_backup_log',
        label: 'Ver Log',
        type: 'secondary',
        url: '/settings/general?tab=backup'
      },
      {
        id: 'acknowledge',
        label: 'Confirmar',
        type: 'primary',
        action: 'acknowledge'
      }
    ]
  }
];

interface UseNotificationsReturn {
  // Estado das notificações
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;

  // Estatísticas
  stats: NotificationStats;
  unreadCount: number;

  // Ações CRUD
  createNotification: (payload: CreateNotificationPayload) => Promise<void>;
  updateNotification: (id: string, payload: UpdateNotificationPayload) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Ações de estado
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;

  // Busca e filtros
  searchNotifications: (query: string) => void;
  filterNotifications: (filters: NotificationFilters) => void;
  clearFilters: () => void;

  // Preferências
  preferences: NotificationPreferences | null;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;

  // Utilitários
  refreshNotifications: () => Promise<void>;
  getNotificationById: (id: string) => AppNotification | undefined;
  executeAction: (notificationId: string, actionId: string) => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  // Estatísticas calculadas
  const stats = useMemo((): NotificationStats => {
    const total = notifications.length;
    const unread = notifications.filter(n => n.status === 'unread').length;

    const byPriority = notifications.reduce((acc, notification) => {
      acc[notification.priority] = (acc[notification.priority] || 0) + 1;
      return acc;
    }, {} as Record<NotificationPriority, number>);

    const byModule = notifications.reduce((acc, notification) => {
      acc[notification.module] = (acc[notification.module] || 0) + 1;
      return acc;
    }, {} as Record<NotificationModule, number>);

    const byStatus = notifications.reduce((acc, notification) => {
      acc[notification.status] = (acc[notification.status] || 0) + 1;
      return acc;
    }, {} as Record<NotificationStatus, number>);

    const now = Date.now();
    const overdue = notifications.filter(n => {
      const dueDate = n.metadata.dueDate;
      return dueDate && new Date(dueDate).getTime() < now;
    }).length;

    const actionRequired = notifications.filter(n =>
      n.status === 'unread' && n.actions && n.actions.length > 0
    ).length;

    return {
      total,
      unread,
      byPriority,
      byModule,
      byStatus,
      overdue,
      actionRequired
    };
  }, [notifications]);

  const unreadCount = stats.unread;

  // Carregar notificações reais do Supabase
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters.module?.length) {
        query = query.in('module', filters.module);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let userNotifications = (data as any[])?.map(n => ({
        ...n,
        priority: n.priority as NotificationPriority,
        module: n.module as NotificationModule,
        status: n.status as NotificationStatus,
        createdAt: n.created_at,
        updatedAt: n.created_at, // Map if you have updated_at
      })) as AppNotification[] || [];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        userNotifications = userNotifications.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
        );
      }

      setNotifications(userNotifications);
    } catch (err) {
      setError('Erro ao carregar notificações');
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters, searchQuery]);

  // Carregar preferências do usuário do Supabase
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      const defaultPreferences: NotificationPreferences = {
        userId: user.id,
        moduleSettings: {
          assessments: { enabled: true, emailEnabled: true, pushEnabled: true, digestMode: 'immediate' },
          risks: { enabled: true, emailEnabled: true, pushEnabled: true, digestMode: 'immediate' },
          compliance: { enabled: true, emailEnabled: true, pushEnabled: true, digestMode: 'daily' },
          policies: { enabled: true, emailEnabled: true, pushEnabled: false, digestMode: 'weekly' },
          privacy: { enabled: true, emailEnabled: true, pushEnabled: true, digestMode: 'immediate' },
          audit: { enabled: true, emailEnabled: true, pushEnabled: true, digestMode: 'daily' },
          users: { enabled: true, emailEnabled: false, pushEnabled: true, digestMode: 'immediate' },
          system: { enabled: true, emailEnabled: false, pushEnabled: true, digestMode: 'hourly' },
          'general-settings': { enabled: true, emailEnabled: false, pushEnabled: false, digestMode: 'daily' },
          frameworks: { enabled: true, emailEnabled: true, pushEnabled: true, digestMode: 'immediate' },
          incidents: { enabled: true, emailEnabled: true, pushEnabled: true, digestMode: 'immediate' }
        },
        granularEvents: {
          actionPlanDue: { enabled: true, emailEnabled: true, pushEnabled: true },
          criticalRisk: { enabled: true, emailEnabled: true, pushEnabled: true },
          policyApproval: { enabled: true, emailEnabled: true, pushEnabled: true },
          riskLetterPending: { enabled: true, emailEnabled: true, pushEnabled: true }
        },
        typeSettings: {} as any,
        globalSettings: {
          maxNotificationsPerPage: 50,
          autoMarkAsRead: false,
          autoMarkAsReadAfterSeconds: 30,
          groupSimilarNotifications: true,
          enableSounds: true,
          enableDesktopNotifications: true
        }
      };

      const loadedPrefs: NotificationPreferences = data?.notification_preferences
        ? { ...defaultPreferences, ...(data.notification_preferences as any) }
        : defaultPreferences;

      setPreferences(loadedPrefs);
    } catch (err) {
      console.error('Erro ao carregar preferências:', err);
    }
  }, [user?.id]);

  // Ações CRUD
  const createNotification = useCallback(async (payload: CreateNotificationPayload): Promise<void> => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: payload.userId || user.id,
          type: payload.type,
          module: payload.module,
          title: payload.title,
          message: payload.message,
          priority: payload.priority,
          status: 'unread',
          metadata: payload.metadata as any
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newNotification: AppNotification = {
          ...data,
          priority: data.priority as NotificationPriority,
          module: data.module as NotificationModule,
          status: data.status as NotificationStatus,
          createdAt: data.created_at,
          updatedAt: data.created_at
        } as AppNotification;
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (err) {
      setError('Erro ao criar notificação');
      throw err;
    }
  }, [user?.id]);

  const updateNotification = useCallback(async (id: string, payload: UpdateNotificationPayload): Promise<void> => {
    try {
      console.log('📝 Atualizando notificação:', id, payload);

      // Map frontend fields to DB fields
      const dbPayload: any = {};
      if (payload.status) dbPayload.status = payload.status;
      if (payload.priority) dbPayload.priority = payload.priority;
      if (payload.metadata) {
        const currentNotif = notifications.find(n => n.id === id);
        dbPayload.metadata = { ...(currentNotif?.metadata || {}), ...payload.metadata };
      }

      const { error } = await supabase
        .from('notifications')
        .update(dbPayload)
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.map(notification =>
        notification.id === id
          ? {
            ...notification,
            ...payload,
            metadata: payload.metadata ? { ...notification.metadata, ...payload.metadata } : notification.metadata,
            updatedAt: new Date().toISOString()
          }
          : notification
      ));
      console.log('✅ Notificação atualizada com sucesso');
    } catch (err) {
      console.error('❌ Erro ao atualizar notificação:', err);
      setError('Erro ao atualizar notificação');
      throw err;
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err) {
      setError('Erro ao excluir notificação');
      throw err;
    }
  }, []);

  // Ações de estado
  const markAsRead = useCallback(async (id: string): Promise<void> => {
    console.log('🔵 Marcando notificação como lida:', id);
    await updateNotification(id, {
      status: 'read'
    });
  }, [updateNotification]);

  const markAsUnread = useCallback(async (id: string): Promise<void> => {
    await updateNotification(id, { status: 'unread' });
  }, [updateNotification]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    const unreadNotifications = notifications.filter(n => n.status === 'unread');
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
  }, [notifications, markAsRead]);

  const archiveNotification = useCallback(async (id: string): Promise<void> => {
    await updateNotification(id, { status: 'archived' });
  }, [updateNotification]);

  const dismissNotification = useCallback(async (id: string): Promise<void> => {
    await updateNotification(id, { status: 'dismissed' });
  }, [updateNotification]);

  // Busca e filtros
  const searchNotifications = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filterNotifications = useCallback((newFilters: NotificationFilters) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  // Preferências
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>): Promise<void> => {
    if (!user?.id) return;
    try {
      const updatedPrefs = { ...preferences, ...newPreferences };

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: updatedPrefs as any })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences(updatedPrefs as NotificationPreferences);

      // Request Push Notification permission if Push is enabled
      const needsPush = Object.values(updatedPrefs.moduleSettings || {}).some(s => s.pushEnabled) ||
        Object.values(updatedPrefs.granularEvents || {}).some(g => g.pushEnabled);

      if (needsPush && 'Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }

    } catch (err) {
      setError('Erro ao atualizar preferências');
      throw err;
    }
  }, [preferences, user?.id]);

  // Utilitários
  const refreshNotifications = useCallback(async (): Promise<void> => {
    await loadNotifications();
  }, [loadNotifications]);

  const getNotificationById = useCallback((id: string): AppNotification | undefined => {
    return notifications.find(notification => notification.id === id);
  }, [notifications]);

  const executeAction = useCallback(async (notificationId: string, actionId: string): Promise<void> => {
    try {
      const notification = getNotificationById(notificationId);
      if (!notification) throw new Error('Notificação não encontrada');

      const action = notification.actions?.find(a => a.id === actionId);
      if (!action) throw new Error('Ação não encontrada');

      // Executar ação baseada no tipo
      switch (action.action) {
        case 'acknowledge':
          await markAsRead(notificationId);
          break;
        case 'dismiss':
          await dismissNotification(notificationId);
          break;
        case 'approve':
        case 'reject':
        case 'escalate':
          // Em produção, enviar para API específica da ação
          await markAsRead(notificationId);
          break;
        default:
          if (action.url) {
            // Navegar para URL será tratado no componente
            await markAsRead(notificationId);
          }
      }
    } catch (err) {
      setError('Erro ao executar ação');
      throw err;
    }
  }, [getNotificationById, markAsRead, dismissNotification]);

  // Carregar dados iniciais
  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    loadNotifications();
  }, [filters, searchQuery, loadNotifications]);

  return {
    notifications,
    loading,
    error,
    stats,
    unreadCount,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    archiveNotification,
    dismissNotification,
    searchNotifications,
    filterNotifications,
    clearFilters,
    preferences,
    updatePreferences,
    refreshNotifications,
    getNotificationById,
    executeAction
  };
};