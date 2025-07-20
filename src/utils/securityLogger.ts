
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

// Interface para métricas de segurança
interface SecurityMetrics {
  login_attempts: number;
  failed_logins: number;
  suspicious_activities: number;
  last_activity: string;
}

class SecurityLogger {
  private static instance: SecurityLogger;
  private metricsCache: Map<string, SecurityMetrics> = new Map();
  
  private constructor() {}
  
  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  // Log de evento de segurança principal
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userAgent = navigator.userAgent;
      
      // Sanitizar dados sensíveis
      const sanitizedDetails = this.sanitizeLogData(event.details);
      
      await supabase.rpc('log_activity', {
        p_user_id: user?.id || null,
        p_action: event.action,
        p_resource_type: event.resource_type,
        p_resource_id: event.resource_id || null,
        p_details: {
          ...sanitizedDetails,
          severity: event.severity || 'medium',
          timestamp: new Date().toISOString(),
          url: window.location.href
        },
        p_user_agent: userAgent
      });
      
      console.log(`Security event logged: ${event.action}`);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Log específico para autenticação com métricas
  async logAuthEvent(
    action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'signup_attempt' | 'signup_success' | 'signup_failure', 
    details?: any
  ): Promise<void> {
    const success = action.includes('success');
    const email = details?.email;
    
    await this.logSecurityEvent({
      action,
      resource_type: 'authentication',
      details: this.sanitizeAuthDetails(details),
      severity: action.includes('failure') ? 'high' : 'medium'
    });

    // Atualizar métricas de segurança
    if (email) {
      await this.updateSecurityMetrics(email, success);
    }
  }

  // Log para acesso a dados
  async logDataAccess(
    resourceType: string, 
    resourceId?: string, 
    action: 'read' | 'create' | 'update' | 'delete' = 'read',
    oldData?: Record<string, any>,
    newData?: Record<string, any>
  ): Promise<void> {
    const details: Record<string, any> = {
      timestamp: new Date().toISOString()
    };

    // Hash dos dados para auditoria sem expor conteúdo
    if (oldData) {
      details.old_data_hash = await this.hashData(oldData);
    }
    
    if (newData) {
      details.new_data_hash = await this.hashData(newData);
    }

    await this.logSecurityEvent({
      action: `data_${action}`,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      severity: action === 'delete' ? 'high' : 'low'
    });
  }

  // Log para atividades suspeitas
  async logSuspiciousActivity(activity: string, details?: any): Promise<void> {
    await this.logSecurityEvent({
      action: 'suspicious_activity',
      resource_type: 'security',
      details: { activity, ...details },
      severity: 'critical'
    });

    // Alertar sobre atividades críticas
    console.warn('Atividade suspeita detectada:', activity, details);
  }

  // Atualizar métricas de segurança
  private async updateSecurityMetrics(email: string, loginSuccess: boolean): Promise<void> {
    try {
      const hashedEmail = await this.hashEmail(email);
      let metrics = this.metricsCache.get(hashedEmail) || {
        login_attempts: 0,
        failed_logins: 0,
        suspicious_activities: 0,
        last_activity: new Date().toISOString()
      };

      metrics.login_attempts++;
      if (!loginSuccess) {
        metrics.failed_logins++;
      }
      metrics.last_activity = new Date().toISOString();

      this.metricsCache.set(hashedEmail, metrics);

      // Detectar atividade suspeita
      if (metrics.failed_logins >= 5) {
        await this.logSuspiciousActivity(
          'MULTIPLE_FAILED_LOGINS',
          { failed_attempts: metrics.failed_logins, email_hash: hashedEmail }
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    }
  }

  // Sanitizar dados de autenticação
  private sanitizeAuthDetails(details?: any): any {
    if (!details) return details;
    
    const sanitized = { ...details };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    
    if (sanitized.email) {
      sanitized.email = '[REDACTED]';
    }
    
    return sanitized;
  }

  // Sanitizar dados gerais de log
  private sanitizeLogData(data?: Record<string, any>): Record<string, any> | null {
    if (!data) return null;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Hash de email para logs
  private async hashEmail(email: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(email.toLowerCase());
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Erro ao fazer hash do email:', error);
      return 'hash_error';
    }
  }

  // Hash de dados para logs
  private async hashData(data: Record<string, any>): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(data);
      const dataEncoded = encoder.encode(dataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataEncoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.error('Erro ao fazer hash dos dados:', error);
      return 'hash_error';
    }
  }

  // Obter métricas de segurança
  getSecurityMetrics(emailHash: string): SecurityMetrics | null {
    return this.metricsCache.get(emailHash) || null;
  }

  // Limpar cache de métricas antigas
  cleanupMetrics(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [key, metrics] of this.metricsCache.entries()) {
      if (new Date(metrics.last_activity) < oneHourAgo) {
        this.metricsCache.delete(key);
      }
    }
  }
}

// Instância singleton
const securityLogger = SecurityLogger.getInstance();

// Cleanup automático a cada hora
if (typeof window !== 'undefined') {
  setInterval(() => {
    securityLogger.cleanupMetrics();
  }, 60 * 60 * 1000);
}

// Funções de conveniência para compatibilidade
export const logSecurityEvent = (event: SecurityEvent) => {
  return securityLogger.logSecurityEvent(event);
};

export const logAuthEvent = (
  action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'signup_attempt' | 'signup_success' | 'signup_failure', 
  details?: any
) => {
  return securityLogger.logAuthEvent(action, details);
};

export const logDataAccess = (
  resourceType: string, 
  resourceId?: string, 
  action: 'read' | 'create' | 'update' | 'delete' = 'read',
  oldData?: Record<string, any>,
  newData?: Record<string, any>
) => {
  return securityLogger.logDataAccess(resourceType, resourceId, action, oldData, newData);
};

export const logSuspiciousActivity = (activity: string, details?: any) => {
  return securityLogger.logSuspiciousActivity(activity, details);
};

export { securityLogger };
