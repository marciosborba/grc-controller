import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useTenantSecurity } from '@/utils/tenantSecurity';
import { 
  Notification, 
  NotificationFilters, 
  NotificationStats, 
  NotificationPreferences,
  CreateNotificationPayload,
  UpdateNotificationPayload,
  NotificationStatus,
  NotificationPriority,
  NotificationModule
} from '@/types/notifications';

// ============================================================================
// TIPOS E INTERFACES OTIMIZADAS
// ============================================================================

export interface NotificationMetrics {
  totalNotifications: number;
  unreadCount: number;
  criticalCount: number;
  overdueCount: number;
  byPriority: Record<NotificationPriority, number>;
  byModule: Record<NotificationModule, number>;
  byStatus: Record<NotificationStatus, number>;
  responseRate: number;
  avgResponseTime: number;
}

export interface NotificationAnalytics {
  trendsData: Array<{
    date: string;
    total: number;
    unread: number;
    critical: number;
  }>;
  channelPerformance: Array<{
    channel: string;
    sent: number;
    delivered: number;
    openRate: number;
    clickRate: number;
  }>;
  userEngagement: Array<{
    userId: string;
    userName: string;
    engagementScore: number;
  }>;
}

// Mock data otimizado para demonstração
const MOCK_NOTIFICATIONS_OPTIMIZED = [
  {
    id: '1',
    type: 'assessment_due',
    module: 'assessments' as NotificationModule,
    title: 'Assessment ISO 27001 Vencendo',
    status: 'unread' as NotificationStatus,
    priority: 'high' as NotificationPriority,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    due_date: new Date(Date.now() + 172800000).toISOString(),
    metadata: { assessmentId: 'assess_123' }
  },
  {
    id: '2',
    type: 'risk_escalated',
    module: 'risks' as NotificationModule,
    title: 'Risco Crítico Identificado',
    status: 'unread' as NotificationStatus,
    priority: 'critical' as NotificationPriority,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    due_date: null,
    metadata: { riskId: 'risk_456', severity: 'critical' }
  },
  {
    id: '3',
    type: 'privacy_request_received',
    module: 'privacy' as NotificationModule,
    title: 'Solicitação LGPD Recebida',
    status: 'read' as NotificationStatus,
    priority: 'medium' as NotificationPriority,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    due_date: new Date(Date.now() + 1296000000).toISOString(),
    metadata: { requestId: 'privacy_req_789' }
  }
];

// ============================================================================
// HOOK OTIMIZADO PARA NOTIFICAÇÕES
// ============================================================================

export const useNotificationsOptimized = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    userTenantId, 
    validateAccess, 
    enforceFilter, 
    logActivity,
    isValidTenant 
  } = useTenantSecurity();

  // Query otimizada para métricas críticas de notificações - apenas dados essenciais
  const {
    data: metrics,
    isLoading: isLoadingMetrics
  } = useQuery({
    queryKey: ['notification-metrics-fast', userTenantId],
    queryFn: async (): Promise<NotificationMetrics> => {
      if (!userTenantId) {
        throw new Error('Acesso negado: tenant não identificado');
      }

      // Query otimizada seria:
      // const { data: notificationData, error } = await supabase
      //   .from('notifications')
      //   .select('id, status, priority, module, created_at, due_date')
      //   .eq('tenant_id', userTenantId);

      // Mock data otimizado para demonstração
      const now = new Date();
      const mockNotifications = MOCK_NOTIFICATIONS_OPTIMIZED;

      // Cálculo otimizado das métricas sem transformação completa
      const byPriority: Record<NotificationPriority, number> = {
        'critical': 0,
        'high': 0,
        'medium': 0,
        'low': 0
      };

      const byModule: Record<NotificationModule, number> = {
        'assessments': 0,
        'risks': 0,
        'compliance': 0,
        'policies': 0,
        'privacy': 0,
        'audit': 0,
        'users': 0,
        'system': 0,
        'general-settings': 0,
        'frameworks': 0,
        'incidents': 0
      };

      const byStatus: Record<NotificationStatus, number> = {
        'unread': 0,
        'read': 0,
        'archived': 0,
        'dismissed': 0
      };

      let unreadCount = 0;
      let criticalCount = 0;
      let overdueCount = 0;
      let totalResponseTime = 0;
      let respondedCount = 0;

      mockNotifications.forEach(notification => {
        // Contadores por prioridade
        byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
        
        // Contadores por módulo
        byModule[notification.module] = (byModule[notification.module] || 0) + 1;
        
        // Contadores por status
        byStatus[notification.status] = (byStatus[notification.status] || 0) + 1;
        
        // Contadores específicos
        if (notification.status === 'unread') unreadCount++;
        if (notification.priority === 'critical') criticalCount++;
        
        // Notificações atrasadas
        if (notification.due_date && new Date(notification.due_date) < now && notification.status !== 'read') {
          overdueCount++;
        }
        
        // Tempo de resposta (simulado)
        if (notification.status === 'read') {
          totalResponseTime += Math.random() * 24; // Horas simuladas
          respondedCount++;
        }
      });

      const responseRate = mockNotifications.length > 0 ? (respondedCount / mockNotifications.length) * 100 : 0;
      const avgResponseTime = respondedCount > 0 ? totalResponseTime / respondedCount : 0;

      return {
        totalNotifications: mockNotifications.length,
        unreadCount,
        criticalCount,
        overdueCount,
        byPriority,
        byModule,
        byStatus,
        responseRate: Math.round(responseRate * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10
      };
    },
    enabled: !!user && !!userTenantId,
    staleTime: 30 * 1000,    // 30 segundos para métricas críticas (notificações mudam rapidamente)
    gcTime: 2 * 60 * 1000,   // 2 minutos na memória
    refetchOnMount: false,
    refetchOnWindowFocus: true, // Refresh ao voltar à aba (importante para notificações)
    refetchInterval: 60 * 1000  // Refresh automático a cada minuto
  });

  // Query para dados completos de notificações (mais lenta)
  const {
    data: notifications = [],
    isLoading: isLoadingNotifications,
    error: notificationsError
  } = useQuery({
    queryKey: ['notifications', userTenantId],
    queryFn: async (): Promise<Notification[]> => {
      if (!userTenantId) {
        throw new Error('Acesso negado: tenant não identificado');
      }

      // Simular delay da query (em produção seria query real no Supabase)
      await new Promise(resolve => setTimeout(resolve, 150));

      // Mock data completo com transformação
      return MOCK_NOTIFICATIONS_OPTIMIZED.map(notification => ({
        id: notification.id,
        type: notification.type as any,
        module: notification.module,
        title: notification.title,
        message: `Mensagem detalhada para ${notification.title}`,
        shortMessage: notification.title,
        status: notification.status,
        priority: notification.priority,
        userId: user?.id || 'current-user',
        createdAt: notification.created_at,
        updatedAt: notification.created_at,
        metadata: notification.metadata,
        actions: [
          {
            id: 'view_item',
            label: 'Visualizar',
            type: 'primary' as const,
            url: `/${notification.module}/item`
          }
        ]
      }));
    },
    enabled: !!user && !!userTenantId,
    staleTime: 2 * 60 * 1000,    // 2 minutos de cache
    gcTime: 5 * 60 * 1000,       // 5 minutos na memória
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000 // Refresh a cada 2 minutos
  });

  // Query para analytics (dados não-críticos)
  const {
    data: analytics,
    isLoading: isLoadingAnalytics
  } = useQuery({
    queryKey: ['notification-analytics', userTenantId],
    queryFn: async (): Promise<NotificationAnalytics> => {
      // Query mais pesada para analytics
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        trendsData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          total: Math.floor(Math.random() * 50) + 20,
          unread: Math.floor(Math.random() * 15) + 2,
          critical: Math.floor(Math.random() * 5)
        })),
        channelPerformance: [
          { 
            channel: 'Push', 
            sent: 1247, 
            delivered: 1198, 
            openRate: 74.5,
            clickRate: 26.2
          },
          { 
            channel: 'Email', 
            sent: 856, 
            delivered: 834, 
            openRate: 68.0,
            clickRate: 21.7
          },
          { 
            channel: 'SMS', 
            sent: 45, 
            delivered: 44, 
            openRate: 95.5,
            clickRate: 42.9
          }
        ],
        userEngagement: [
          { userId: '1', userName: 'João Silva', engagementScore: 92.1 },
          { userId: '2', userName: 'Maria Santos', engagementScore: 93.4 },
          { userId: '3', userName: 'Pedro Costa', engagementScore: 73.1 },
          { userId: '4', userName: 'Ana Oliveira', engagementScore: 97.0 }
        ]
      };
    },
    enabled: !!metrics, // Só carrega depois das métricas
    staleTime: 5 * 60 * 1000,    // 5 minutos de cache para analytics
    gcTime: 10 * 60 * 1000,      // 10 minutos na memória
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Mutations para ações
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      // Em produção seria API call
      await new Promise(resolve => setTimeout(resolve, 100));
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-metrics-fast', userTenantId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', userTenantId] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      // Em produção seria API call para marcar todas como lidas
      await new Promise(resolve => setTimeout(resolve, 200));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-metrics-fast', userTenantId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', userTenantId] });
    }
  });

  return {
    // Dados
    notifications,
    metrics,
    analytics,
    
    // Estados de loading
    isLoadingNotifications,
    isLoadingMetrics,
    isLoadingAnalytics,
    
    // Estados de loading combinado (para skeleton inteligente)
    isLoadingCritical: isLoadingMetrics,
    isLoadingAll: isLoadingNotifications && notifications.length === 0,
    
    // Errors
    notificationsError,
    
    // Mutations
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    
    // Utilitários
    filterNotifications: (searchTerm: string, filters: NotificationFilters) => {
      return notifications.filter(notification => {
        const matchesSearch = !searchTerm || 
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !filters.status?.length || filters.status.includes(notification.status);
        const matchesPriority = !filters.priority?.length || filters.priority.includes(notification.priority);
        const matchesModule = !filters.module?.length || filters.module.includes(notification.module);
        
        return matchesSearch && matchesStatus && matchesPriority && matchesModule;
      });
    },
    
    refreshNotifications: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-metrics-fast', userTenantId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', userTenantId] });
    }
  };
};