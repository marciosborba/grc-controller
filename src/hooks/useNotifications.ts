// ============================================================================
// HOOK DE GERENCIAMENTO DE NOTIFICAÇÕES
// ============================================================================
// Hook completo para gerenciar notificações, integração com API e estado local

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Notification, 
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

// Mock data para desenvolvimento - substituir por API real
const MOCK_NOTIFICATIONS: Notification[] = [
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
      source: 'backup_service',
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
  notifications: Notification[];
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
  getNotificationById: (id: string) => Notification | undefined;
  executeAction: (notificationId: string, actionId: string) => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  // Carregar notificações (mock)
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filtrar por usuário atual
      let userNotifications = MOCK_NOTIFICATIONS.filter(n => n.userId === 'current-user');
      
      // Aplicar filtros
      if (filters.status?.length) {
        userNotifications = userNotifications.filter(n => filters.status!.includes(n.status));
      }
      
      if (filters.priority?.length) {
        userNotifications = userNotifications.filter(n => filters.priority!.includes(n.priority));
      }
      
      if (filters.module?.length) {
        userNotifications = userNotifications.filter(n => filters.module!.includes(n.module));
      }
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        userNotifications = userNotifications.filter(n => 
          n.title.toLowerCase().includes(query) || 
          n.message.toLowerCase().includes(query)
        );
      }
      
      // Ordenar por data de criação (mais recentes primeiro)
      userNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(userNotifications);
    } catch (err) {
      setError('Erro ao carregar notificações');
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // Carregar preferências do usuário
  const loadPreferences = useCallback(async () => {
    try {
      // Mock de preferências - em produção seria carregado da API
      const mockPreferences: NotificationPreferences = {
        userId: user?.id || 'current-user',
        moduleSettings: {
          assessments: { enabled: true, emailEnabled: true, pushEnabled: true, smsEnabled: false, digestMode: 'immediate' },
          risks: { enabled: true, emailEnabled: true, pushEnabled: true, smsEnabled: true, digestMode: 'immediate' },
          compliance: { enabled: true, emailEnabled: true, pushEnabled: true, smsEnabled: false, digestMode: 'daily' },
          policies: { enabled: true, emailEnabled: true, pushEnabled: false, smsEnabled: false, digestMode: 'weekly' },
          privacy: { enabled: true, emailEnabled: true, pushEnabled: true, smsEnabled: true, digestMode: 'immediate' },
          audit: { enabled: true, emailEnabled: true, pushEnabled: true, smsEnabled: false, digestMode: 'daily' },
          users: { enabled: true, emailEnabled: false, pushEnabled: true, smsEnabled: false, digestMode: 'immediate' },
          system: { enabled: true, emailEnabled: false, pushEnabled: true, smsEnabled: false, digestMode: 'hourly' },
          'general-settings': { enabled: true, emailEnabled: false, pushEnabled: false, smsEnabled: false, digestMode: 'daily' },
          frameworks: { enabled: true, emailEnabled: true, pushEnabled: true, smsEnabled: false, digestMode: 'immediate' },
          incidents: { enabled: true, emailEnabled: true, pushEnabled: true, smsEnabled: true, digestMode: 'immediate' }
        },
        typeSettings: {} as any, // Seria preenchido com configurações específicas por tipo
        globalSettings: {
          maxNotificationsPerPage: 50,
          autoMarkAsRead: false,
          autoMarkAsReadAfterSeconds: 30,
          groupSimilarNotifications: true,
          enableSounds: true,
          enableDesktopNotifications: true
        }
      };
      
      setPreferences(mockPreferences);
    } catch (err) {
      console.error('Erro ao carregar preferências:', err);
    }
  }, [user?.id]);

  // Ações CRUD
  const createNotification = useCallback(async (payload: CreateNotificationPayload): Promise<void> => {
    try {
      // Em produção, fazer POST para API
      const newNotification: Notification = {
        id: `notif_${Date.now()}`,
        ...payload,
        status: 'unread',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    } catch (err) {
      setError('Erro ao criar notificação');
      throw err;
    }
  }, []);

  const updateNotification = useCallback(async (id: string, payload: UpdateNotificationPayload): Promise<void> => {
    try {
      console.log('📝 Atualizando notificação:', id, payload);
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
  }, []);

  const deleteNotification = useCallback(async (id: string): Promise<void> => {
    try {
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
      status: 'read',
      readAt: new Date().toISOString() // Diretamente na notificação, não em metadata
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
    try {
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
      // Em produção, fazer PUT para API
    } catch (err) {
      setError('Erro ao atualizar preferências');
      throw err;
    }
  }, []);

  // Utilitários
  const refreshNotifications = useCallback(async (): Promise<void> => {
    await loadNotifications();
  }, [loadNotifications]);

  const getNotificationById = useCallback((id: string): Notification | undefined => {
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