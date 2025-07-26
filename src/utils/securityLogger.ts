// =====================================================
// UTILITÁRIOS DE LOGGING DE SEGURANÇA
// =====================================================

import { supabase } from '@/integrations/supabase/client';

// Tipos para logs de segurança
interface SecurityLogData {
  user_id?: string;
  tenant_id?: string;
  event_type: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  ip_address?: string;
  user_agent?: string;
  geo_location?: Record<string, any>;
  details?: Record<string, any>;
}

interface ActivityLogData {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  tenant_id?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  success?: boolean;
  error_message?: string;
}

// Função para registrar eventos de autenticação
export const logAuthEvent = async (
  event: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const logData: SecurityLogData = {
      event_type: event,
      severity: 'info',
      details: {
        timestamp: new Date().toISOString(),
        ...details
      }
    };

    // Tentar obter informações do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      logData.user_id = user.id;
    }

    // Registrar no banco de dados
    await supabase.from('security_logs').insert(logData);
  } catch (error) {
    console.error('Erro ao registrar evento de auth:', error);
  }
};

// Função para registrar atividade suspeita
export const logSuspiciousActivity = async (
  activity: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const logData: SecurityLogData = {
      event_type: 'suspicious_activity',
      severity: 'warning',
      details: {
        activity,
        timestamp: new Date().toISOString(),
        ...details
      }
    };

    // Tentar obter informações do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      logData.user_id = user.id;
    }

    // Registrar no banco de dados
    await supabase.from('security_logs').insert(logData);

    // Log no console para desenvolvimento
    console.warn(`Suspicious Activity: ${activity}`, details);
  } catch (error) {
    console.error('Erro ao registrar atividade suspeita:', error);
  }
};

// Função para registrar atividades gerais
export const logActivity = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const logData: ActivityLogData = {
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      risk_level: 'low',
      success: true
    };

    // Tentar obter informações do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      logData.user_id = user.id;
    }

    // Registrar no banco de dados
    await supabase.from('activity_logs').insert(logData);
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
};

// Função para registrar falhas de segurança
export const logSecurityFailure = async (
  event: string,
  error: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const logData: SecurityLogData = {
      event_type: event,
      severity: 'error',
      details: {
        error,
        timestamp: new Date().toISOString(),
        ...details
      }
    };

    // Tentar obter informações do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      logData.user_id = user.id;
    }

    // Registrar no banco de dados
    await supabase.from('security_logs').insert(logData);
  } catch (error) {
    console.error('Erro ao registrar falha de segurança:', error);
  }
};

// Função para obter informações do navegador
export const getBrowserInfo = (): Record<string, any> => {
  try {
    return {
      user_agent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookie_enabled: navigator.cookieEnabled,
      online: navigator.onLine,
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  } catch (error) {
    console.error('Erro ao obter informações do navegador:', error);
    return {};
  }
};

// Função para obter IP do usuário (simulada)
export const getUserIP = async (): Promise<string | null> => {
  try {
    // Em produção, usar um serviço real para obter IP
    // Por enquanto, retornar null
    return null;
  } catch (error) {
    console.error('Erro ao obter IP do usuário:', error);
    return null;
  }
};