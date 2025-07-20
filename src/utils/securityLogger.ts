
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get client IP and user agent (if available)
    const userAgent = navigator.userAgent;
    
    await supabase.rpc('log_activity', {
      p_user_id: user?.id || null,
      p_action: event.action,
      p_resource_type: event.resource_type,
      p_resource_id: event.resource_id || null,
      p_details: {
        ...event.details,
        severity: event.severity || 'medium',
        timestamp: new Date().toISOString(),
        url: window.location.href
      },
      p_user_agent: userAgent
    });
    
    console.log(`Security event logged: ${event.action}`);
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - logging failures shouldn't break the app
  }
};

export const logAuthEvent = async (action: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'signup_attempt' | 'signup_success' | 'signup_failure', details?: any) => {
  await logSecurityEvent({
    action,
    resource_type: 'authentication',
    details,
    severity: action.includes('failure') ? 'high' : 'medium'
  });
};

export const logDataAccess = async (resourceType: string, resourceId?: string, action: 'read' | 'create' | 'update' | 'delete' = 'read') => {
  await logSecurityEvent({
    action: `data_${action}`,
    resource_type: resourceType,
    resource_id: resourceId,
    severity: action === 'delete' ? 'high' : 'low'
  });
};

export const logSuspiciousActivity = async (activity: string, details?: any) => {
  await logSecurityEvent({
    action: 'suspicious_activity',
    resource_type: 'security',
    details: { activity, ...details },
    severity: 'critical'
  });
};
