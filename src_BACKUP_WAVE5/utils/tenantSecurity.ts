// ============================================================================
// TENANT SECURITY UTILITIES
// ============================================================================
// Utilitários para validação e segurança multi-tenant

import { supabase } from '@/integrations/supabase/client';
import { useAuth} from '@/contexts/AuthContextOptimized';

export interface TenantValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
}

export interface TenantSecurityOptions {
  strictMode?: boolean; // Modo estrito com logs de segurança
  allowAdmin?: boolean; // Permitir acesso de admin sistema
  logAttempts?: boolean; // Log tentativas de acesso
}

// ============================================================================
// VALIDAÇÕES DE TENANT
// ============================================================================

/**
 * Valida se o usuário atual tem acesso ao tenant especificado
 */
export const validateTenantAccess = (
  userTenantId: string | null | undefined, 
  targetTenantId: string | null | undefined,
  options: TenantSecurityOptions = {}
): TenantValidationResult => {
  const { strictMode = true, logAttempts = true } = options;

  // Verificar se os parâmetros são válidos
  if (!userTenantId) {
    if (logAttempts) {
      console.warn('[TENANT-SECURITY] User without valid tenant_id attempted access');
    }
    return {
      isValid: false,
      error: 'Usuário não possui tenant válido',
      code: 'NO_TENANT'
    };
  }

  if (!targetTenantId) {
    if (logAttempts) {
      console.warn('[TENANT-SECURITY] Access attempted to resource without tenant_id');
    }
    return {
      isValid: false,
      error: 'Recurso não possui tenant válido',
      code: 'RESOURCE_NO_TENANT'
    };
  }

  // Verificar se os tenants coincidem
  if (userTenantId !== targetTenantId) {
    if (logAttempts) {
      console.error('[TENANT-SECURITY] Cross-tenant access attempted:', {
        userTenant: userTenantId,
        targetTenant: targetTenantId,
        timestamp: new Date().toISOString()
      });
    }

    // Em modo estrito, sempre bloquear
    if (strictMode) {
      return {
        isValid: false,
        error: 'Acesso negado: usuário não pertence ao tenant do recurso',
        code: 'CROSS_TENANT_ACCESS'
      };
    }
  }

  return { isValid: true };
};

/**
 * Valida se uma integração pertence ao tenant do usuário
 */
export const validateIntegrationAccess = async (
  integrationId: string,
  userTenantId: string | null | undefined,
  options: TenantSecurityOptions = {}
): Promise<TenantValidationResult> => {
  const { logAttempts = true } = options;

  try {
    // Verificar tenant do usuário
    if (!userTenantId) {
      return {
        isValid: false,
        error: 'Usuário não possui tenant válido',
        code: 'NO_TENANT'
      };
    }

    // Buscar a integração
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('id, name, tenant_id')
      .eq('id', integrationId)
      .single();

    if (error) {
      if (logAttempts) {
        console.error('[TENANT-SECURITY] Error fetching integration:', error);
      }
      return {
        isValid: false,
        error: 'Erro ao verificar acesso à integração',
        code: 'DATABASE_ERROR'
      };
    }

    if (!integration) {
      if (logAttempts) {
        console.warn('[TENANT-SECURITY] Integration not found:', integrationId);
      }
      return {
        isValid: false,
        error: 'Integração não encontrada',
        code: 'NOT_FOUND'
      };
    }

    // Validar acesso ao tenant
    return validateTenantAccess(userTenantId, integration.tenant_id, options);

  } catch (err: any) {
    if (logAttempts) {
      console.error('[TENANT-SECURITY] Exception in validateIntegrationAccess:', err);
    }
    return {
      isValid: false,
      error: 'Erro interno de validação',
      code: 'INTERNAL_ERROR'
    };
  }
};

/**
 * Garante que uma query Supabase inclui filtro por tenant
 */
export const enforceTenantFilter = (
  query: any,
  userTenantId: string | null | undefined,
  tenantField: string = 'tenant_id'
): any => {
  if (!userTenantId) {
    throw new Error('[TENANT-SECURITY] Cannot enforce tenant filter: no tenant ID');
  }

  // Adicionar filtro por tenant se não existir
  return query.eq(tenantField, userTenantId);
};

/**
 * Log de atividade suspeita de segurança multi-tenant
 */
export const logSecurityActivity = async (
  activity: 'cross_tenant_attempt' | 'invalid_access' | 'security_violation',
  details: Record<string, any>,
  userTenantId?: string | null
) => {
  try {
    const logEntry = {
      activity_type: 'security',
      level: 'warning',
      message: `Tenant security activity: ${activity}`,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      tenant_id: userTenantId || null,
      created_at: new Date().toISOString()
    };

    console.warn('[TENANT-SECURITY]', logEntry);

    // Tentar salvar no banco se possível
    await supabase
      .from('integration_logs')
      .insert({
        integration_id: null,
        log_type: 'error',
        level: 'warn',
        message: `Security: ${activity}`,
        details: logEntry.details,
        tenant_id: userTenantId
      })
      .catch(err => console.warn('Could not log security activity:', err));

  } catch (error) {
    console.error('[TENANT-SECURITY] Error logging security activity:', error);
  }
};

// ============================================================================
// HOOKS DE SEGURANÇA
// ============================================================================

/**
 * Hook para validações de segurança multi-tenant
 */
export const useTenantSecurity = () => {
  const { user } = useAuth();

  const validateAccess = (targetTenantId: string | null | undefined, options?: TenantSecurityOptions) => {
    return validateTenantAccess(user?.tenantId, targetTenantId, options);
  };

  const validateIntegration = (integrationId: string, options?: TenantSecurityOptions) => {
    return validateIntegrationAccess(integrationId, user?.tenantId, options);
  };

  const enforceFilter = (query: any, tenantField?: string) => {
    return enforceTenantFilter(query, user?.tenantId, tenantField);
  };

  const logActivity = (activity: Parameters<typeof logSecurityActivity>[0], details: Record<string, any>) => {
    return logSecurityActivity(activity, details, user?.tenantId);
  };

  return {
    userTenantId: user?.tenantId,
    validateAccess,
    validateIntegration,
    enforceFilter,
    logActivity,
    isValidTenant: !!user?.tenantId
  };
};

// ============================================================================
// MIDDLEWARE DE VALIDAÇÃO
// ============================================================================

/**
 * Middleware para validar acesso a recursos multi-tenant
 */
export const tenantAccessMiddleware = async <T>(
  operation: () => Promise<T>,
  resourceTenantId: string | null | undefined,
  userTenantId: string | null | undefined,
  options: TenantSecurityOptions = {}
): Promise<T> => {
  // Validar acesso antes de executar a operação
  const validation = validateTenantAccess(userTenantId, resourceTenantId, options);
  
  if (!validation.isValid) {
    // Log da tentativa de acesso inválido
    await logSecurityActivity('invalid_access', {
      error: validation.error,
      code: validation.code,
      userTenant: userTenantId,
      targetTenant: resourceTenantId
    }, userTenantId);

    throw new Error(validation.error || 'Acesso negado');
  }

  // Executar a operação se a validação passou
  return await operation();
};

// ============================================================================
// CONSTANTES DE SEGURANÇA
// ============================================================================

export const TENANT_SECURITY_CONFIG = {
  STRICT_MODE: true,
  LOG_ALL_ATTEMPTS: true,
  ALLOW_ADMIN_OVERRIDE: false,
  SESSION_TIMEOUT_MINUTES: 480, // 8 horas
  MAX_FAILED_ATTEMPTS: 5
} as const;

export const TENANT_ERROR_CODES = {
  NO_TENANT: 'NO_TENANT',
  RESOURCE_NO_TENANT: 'RESOURCE_NO_TENANT',
  CROSS_TENANT_ACCESS: 'CROSS_TENANT_ACCESS',
  NOT_FOUND: 'NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;