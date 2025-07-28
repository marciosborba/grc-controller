// =====================================================
// UTILITÁRIOS DE LOGGING DE SEGURANÇA (TEMPORARIAMENTE DESABILITADO)
// =====================================================

// Tipos para logs de segurança
export interface SecurityLogData {
  user_id?: string;
  tenant_id?: string;
  event_type: string;
  severity?: 'info' | 'warning' | 'error' | 'critical';
  ip_address?: string;
  user_agent?: string;
  geo_location?: Record<string, any>;
  details?: Record<string, any>;
}

export interface ActivityLogData {
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

// Implementação real do sistema de logging de segurança
import { supabase } from '@/integrations/supabase/client';

export const logAuthEvent = async (
  event: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: details.user_id || null,
        action: event,
        resource_type: 'auth',
        resource_id: details.user_id || null,
        details: details,
        ip_address: details.ip_address || null,
        user_agent: details.user_agent || null
      });
    
    if (error) {
      console.error('Erro ao registrar evento de autenticação:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar evento de autenticação:', error);
  }
};

export const logSuspiciousActivity = async (
  activity: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: details.user_id || null,
        action: activity,
        resource_type: 'security',
        resource_id: details.resource_id || null,
        details: { ...details, severity: 'warning' },
        ip_address: details.ip_address || null,
        user_agent: details.user_agent || null
      });
    
    if (error) {
      console.error('Erro ao registrar atividade suspeita:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar atividade suspeita:', error);
  }
};

export const logActivity = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: details.user_id || null,
        action: action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        details: details,
        ip_address: details.ip_address || null,
        user_agent: details.user_agent || null
      });
    
    if (error) {
      console.error('Erro ao registrar atividade:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
  }
};

export const logSecurityFailure = async (
  event: string,
  error: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    const { error: dbError } = await supabase
      .from('activity_logs')
      .insert({
        user_id: details.user_id || null,
        action: event,
        resource_type: 'security',
        resource_id: details.resource_id || null,
        details: { ...details, error_message: error, severity: 'error' },
        ip_address: details.ip_address || null,
        user_agent: details.user_agent || null
      });
    
    if (dbError) {
      console.error('Erro ao registrar falha de segurança:', dbError);
    }
  } catch (dbError) {
    console.error('Erro ao registrar falha de segurança:', dbError);
  }
};

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

export const getUserIP = async (): Promise<string | null> => {
  try {
    return null; // Temporariamente desabilitado
  } catch (error) {
    console.error('Erro ao obter IP do usuário:', error);
    return null;
  }
};