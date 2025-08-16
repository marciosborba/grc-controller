// ============================================================================
// CONTEXTO DE NOTIFICAÇÕES EM TEMPO REAL
// ============================================================================
// Sistema completo de notificações em tempo real usando Server-Sent Events (SSE)

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Notification as AppNotification,
  CreateNotificationPayload,
  NotificationType,
  NotificationModule,
  NotificationPriority 
} from '@/types/notifications';
import { toast } from 'sonner';

// Interface do contexto
interface NotificationsRealtimeContextType {
  // Estado de conexão
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError: string | null;
  
  // Controle de conexão
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Estatísticas
  messagesReceived: number;
  connectionTime: Date | null;
  
  // Configurações
  enableDesktopNotifications: boolean;
  enableSounds: boolean;
  autoReconnect: boolean;
  setNotificationSettings: (settings: {
    enableDesktopNotifications?: boolean;
    enableSounds?: boolean;
    autoReconnect?: boolean;
  }) => void;
}

// Criar contexto
const NotificationsRealtimeContext = createContext<NotificationsRealtimeContextType | undefined>(undefined);

// Provider de notificações em tempo real
interface NotificationsRealtimeProviderProps {
  children: React.ReactNode;
  baseUrl?: string;
}

export const NotificationsRealtimeProvider: React.FC<NotificationsRealtimeProviderProps> = ({ 
  children, 
  baseUrl = '' 
}) => {
  const { user } = useAuth();
  
  // Estado da conexão
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const [messagesReceived, setMessagesReceived] = useState(0);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  
  // Configurações
  const [enableDesktopNotifications, setEnableDesktopNotifications] = useState(true);
  const [enableSounds, setEnableSounds] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(true);
  
  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  
  // Audio para notificações
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notifications-realtime-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setEnableDesktopNotifications(settings.enableDesktopNotifications ?? true);
        setEnableSounds(settings.enableSounds ?? true);
        setAutoReconnect(settings.autoReconnect ?? true);
      } catch (error) {
        console.error('Erro ao carregar configurações de notificações:', error);
      }
    }
  }, []);

  // Salvar configurações no localStorage
  const saveSettings = useCallback(() => {
    const settings = {
      enableDesktopNotifications,
      enableSounds,
      autoReconnect
    };
    localStorage.setItem('notifications-realtime-settings', JSON.stringify(settings));
  }, [enableDesktopNotifications, enableSounds, autoReconnect]);

  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

  // Inicializar áudio de notificação
  useEffect(() => {
    // Criar um som simples usando Web Audio API
    if (enableSounds && !notificationSoundRef.current) {
      try {
        // Som de notificação simples usando data URL
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAUBjuR1/K');
        notificationSoundRef.current = audio;
      } catch (error) {
        console.warn('Erro ao criar áudio de notificação:', error);
      }
    }
  }, [enableSounds]);

  // Função para tocar som de notificação
  const playNotificationSound = useCallback(() => {
    if (enableSounds && notificationSoundRef.current) {
      try {
        notificationSoundRef.current.currentTime = 0;
        notificationSoundRef.current.play().catch(error => {
          console.warn('Erro ao tocar som de notificação:', error);
        });
      } catch (error) {
        console.warn('Erro ao tocar som de notificação:', error);
      }
    }
  }, [enableSounds]);

  // Função para mostrar notificação desktop
  const showDesktopNotification = useCallback((notification: AppNotification) => {
    if (!enableDesktopNotifications) return;

    // Verificar permissão
    if (Notification.permission === 'granted') {
      try {
        const desktopNotification = new Notification(notification.title, {
          body: notification.shortMessage || notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification.id,
          requireInteraction: notification.priority === 'critical',
          silent: !enableSounds
        });

        // Fechar automaticamente após 5 segundos (exceto críticas)
        if (notification.priority !== 'critical') {
          setTimeout(() => {
            desktopNotification.close();
          }, 5000);
        }

        // Ação ao clicar
        desktopNotification.onclick = () => {
          window.focus();
          // Navegar para a página de notificações ou URL específica
          if (notification.actions?.[0]?.url) {
            window.location.href = notification.actions[0].url;
          } else {
            window.location.href = '/notifications';
          }
          desktopNotification.close();
        };
      } catch (error) {
        console.warn('Erro ao mostrar notificação desktop:', error);
      }
    } else if (Notification.permission === 'default') {
      // Solicitar permissão
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showDesktopNotification(notification);
        }
      });
    }
  }, [enableDesktopNotifications, enableSounds]);

  // Função para processar notificação recebida
  const processReceivedNotification = useCallback((notification: AppNotification) => {
    setMessagesReceived(prev => prev + 1);
    
    // Som de notificação
    playNotificationSound();
    
    // Notificação desktop
    showDesktopNotification(notification);
    
    // Toast no sistema (apenas para altas prioridades)
    if (notification.priority === 'critical' || notification.priority === 'high') {
      const toastOptions = {
        description: notification.shortMessage || notification.message,
        duration: notification.priority === 'critical' ? 10000 : 5000
      };

      if (notification.priority === 'critical') {
        toast.error(notification.title, toastOptions);
      } else {
        toast.warning(notification.title, toastOptions);
      }
    }
    
    // Disparar evento customizado para outros componentes
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
  }, [playNotificationSound, showDesktopNotification]);

  // Função para conectar SSE
  const connect = useCallback(() => {
    if (!user?.id) {
      console.warn('Usuário não autenticado, não é possível conectar às notificações');
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus('connecting');
    setLastError(null);

    try {
      // URL do SSE - em produção seria um endpoint real
      const sseUrl = `${baseUrl}/api/notifications/stream?userId=${user.id}`;
      const eventSource = new EventSource(sseUrl);
      
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        setConnectionTime(new Date());
        setLastError(null);
        reconnectAttemptsRef.current = 0;
        
        console.log('✅ Conectado ao sistema de notificações em tempo real');
        
        // Toast de sucesso apenas na primeira conexão
        if (messagesReceived === 0) {
          toast.success('Sistema de notificações conectado', {
            description: 'Você receberá notificações em tempo real'
          });
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            processReceivedNotification(data.notification);
          } else if (data.type === 'ping') {
            // Heartbeat - apenas registrar
            console.debug('📡 Heartbeat recebido');
          }
        } catch (error) {
          console.error('Erro ao processar mensagem SSE:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('❌ Erro na conexão SSE:', error);
        setIsConnected(false);
        setConnectionStatus('error');
        setLastError('Erro na conexão com o servidor');
        
        // Tentar reconectar automaticamente
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current += 1;
          
          console.log(`🔄 Tentativa de reconexão ${reconnectAttemptsRef.current}/${maxReconnectAttempts} em ${delay}ms`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          toast.error('Conexão de notificações perdida', {
            description: 'Clique para tentar reconectar'
          });
        }
      };

      // Eventos customizados do SSE
      eventSource.addEventListener('notification', (event: any) => {
        try {
          const notification = JSON.parse(event.data);
          processReceivedNotification(notification);
        } catch (error) {
          console.error('Erro ao processar notificação customizada:', error);
        }
      });

    } catch (error) {
      console.error('Erro ao inicializar SSE:', error);
      setConnectionStatus('error');
      setLastError('Erro ao inicializar conexão');
    }
  }, [user?.id, baseUrl, autoReconnect, messagesReceived, processReceivedNotification]);

  // Função para desconectar
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setConnectionTime(null);
    reconnectAttemptsRef.current = 0;
    
    console.log('🔌 Desconectado do sistema de notificações');
  }, []);

  // Função para reconectar manualmente
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Função para atualizar configurações
  const setNotificationSettings = useCallback((settings: {
    enableDesktopNotifications?: boolean;
    enableSounds?: boolean;
    autoReconnect?: boolean;
  }) => {
    if (settings.enableDesktopNotifications !== undefined) {
      setEnableDesktopNotifications(settings.enableDesktopNotifications);
    }
    if (settings.enableSounds !== undefined) {
      setEnableSounds(settings.enableSounds);
    }
    if (settings.autoReconnect !== undefined) {
      setAutoReconnect(settings.autoReconnect);
    }
  }, []);

  // Conectar automaticamente quando o usuário estiver logado
  useEffect(() => {
    if (user?.id) {
      const timer = setTimeout(() => {
        connect();
      }, 1000); // Delay para evitar corrida de condições

      return () => clearTimeout(timer);
    } else {
      disconnect();
    }
  }, [user?.id, connect, disconnect]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Lidar com perda de foco/visibilidade da página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && user?.id) {
        // Reconectar quando a página voltar ao foco
        setTimeout(() => {
          connect();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, user?.id, connect]);

  // Valor do contexto
  const contextValue: NotificationsRealtimeContextType = {
    isConnected,
    connectionStatus,
    lastError,
    connect,
    disconnect,
    reconnect,
    messagesReceived,
    connectionTime,
    enableDesktopNotifications,
    enableSounds,
    autoReconnect,
    setNotificationSettings
  };

  return (
    <NotificationsRealtimeContext.Provider value={contextValue}>
      {children}
    </NotificationsRealtimeContext.Provider>
  );
};

// Hook para usar o contexto
export const useNotificationsRealtime = (): NotificationsRealtimeContextType => {
  const context = useContext(NotificationsRealtimeContext);
  if (context === undefined) {
    throw new Error('useNotificationsRealtime deve ser usado dentro de NotificationsRealtimeProvider');
  }
  return context;
};

export default NotificationsRealtimeContext;