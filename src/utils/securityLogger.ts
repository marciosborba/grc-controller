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

export const logSecurityEvent = async (eventData: {
  event: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}): Promise<void> => {
  try {
    const { error: dbError } = await supabase
      .from('activity_logs')
      .insert({
        action: eventData.event,
        resource_type: 'security',
        details: { 
          description: eventData.description,
          severity: eventData.severity || 'low',
          ...eventData.metadata 
        }
      });
    
    if (dbError) {
      console.error('Erro ao registrar evento de segurança:', dbError);
    }
  } catch (dbError) {
    console.error('Erro ao registrar evento de segurança:', dbError);
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

// Função para obter IP real do usuário
export const getUserIP = async (): Promise<string | null> => {
  try {
    // Tentar múltiplos serviços para obter IP
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ipinfo.io/json'
    ];
    
    for (const service of ipServices) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          timeout: 5000 // 5 segundos timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Diferentes serviços retornam IP em campos diferentes
          const ip = data.ip || data.query || data.ipAddress;
          
          if (ip && isValidIP(ip)) {
            console.log(`IP obtido via ${service}: ${ip}`);
            return ip;
          }
        }
      } catch (serviceError) {
        console.warn(`Falha ao obter IP via ${service}:`, serviceError);
        continue; // Tentar próximo serviço
      }
    }
    
    // Se todos os serviços falharem, tentar WebRTC (funciona em alguns casos)
    return await getIPViaWebRTC();
    
  } catch (error) {
    console.error('Erro ao obter IP do usuário:', error);
    return null;
  }
};

// Função para validar formato de IP
const isValidIP = (ip: string): boolean => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

// Função para tentar obter IP via WebRTC (funciona em alguns navegadores)
const getIPViaWebRTC = (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const RTCPeerConnection = window.RTCPeerConnection || 
                               (window as any).webkitRTCPeerConnection || 
                               (window as any).mozRTCPeerConnection;
      
      if (!RTCPeerConnection) {
        resolve(null);
        return;
      }
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          
          if (ipMatch && ipMatch[1] && !ipMatch[1].startsWith('192.168.') && !ipMatch[1].startsWith('10.')) {
            pc.close();
            resolve(ipMatch[1]);
            return;
          }
        }
      };
      
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      // Timeout após 3 segundos
      setTimeout(() => {
        pc.close();
        resolve(null);
      }, 3000);
      
    } catch (error) {
      console.warn('WebRTC IP detection failed:', error);
      resolve(null);
    }
  });
};

// Função para obter localização baseada no IP
export const getLocationFromIP = async (ip: string): Promise<Record<string, any> | null> => {
  try {
    if (!ip || !isValidIP(ip)) {
      return null;
    }
    
    // Usar serviço gratuito para geolocalização
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      
      return {
        city: data.city,
        region: data.region,
        country: data.country_name,
        country_code: data.country_code,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        isp: data.org
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter localização por IP:', error);
    return null;
  }
};

// Função para capturar informações completas de sessão
export const captureSessionInfo = async (): Promise<Record<string, any>> => {
  try {
    const [ip, browserInfo] = await Promise.all([
      getUserIP(),
      Promise.resolve(getBrowserInfo())
    ]);
    
    let locationInfo = null;
    if (ip) {
      locationInfo = await getLocationFromIP(ip);
    }
    
    return {
      ip_address: ip,
      user_agent: browserInfo.user_agent,
      browser_info: browserInfo,
      location: locationInfo,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao capturar informações de sessão:', error);
    return {
      ip_address: null,
      user_agent: navigator.userAgent,
      browser_info: getBrowserInfo(),
      location: null,
      timestamp: new Date().toISOString()
    };
  }
};