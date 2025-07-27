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

// Temporariamente desabilitado até que as tabelas de segurança sejam criadas
export const logAuthEvent = async (
  event: string,
  details: Record<string, any> = {}
): Promise<void> => {
  console.warn('Security logger ainda não implementado - tabelas não existem');
};

export const logSuspiciousActivity = async (
  activity: string,
  details: Record<string, any> = {}
): Promise<void> => {
  console.warn('Security logger ainda não implementado - tabelas não existem');
};

export const logActivity = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  details: Record<string, any> = {}
): Promise<void> => {
  console.warn('Security logger ainda não implementado - tabelas não existem');
};

export const logSecurityFailure = async (
  event: string,
  error: string,
  details: Record<string, any> = {}
): Promise<void> => {
  console.warn('Security logger ainda não implementado - tabelas não existem');
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