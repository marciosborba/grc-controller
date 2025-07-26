// =====================================================
// CONFIGURAÇÕES DO SISTEMA DE ADMINISTRAÇÃO DE USUÁRIOS
// =====================================================

export const USER_MANAGEMENT_CONFIG = {
  // Configurações de paginação
  pagination: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    maxPageSize: 100
  },

  // Configurações de segurança
  security: {
    maxFailedAttempts: 5,
    lockoutDuration: 24 * 60 * 60 * 1000, // 24 horas em ms
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    mfaBackupCodesCount: 10,
    mfaSecretLength: 32
  },

  // Configurações de MFA
  mfa: {
    issuer: 'GRC System',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    window: 1
  },

  // Configurações de logs
  logging: {
    retentionDays: 90,
    maxLogSize: 1000000, // 1MB
    logLevels: ['info', 'warning', 'error', 'critical'],
    sensitiveFields: ['password', 'secret_key', 'backup_codes']
  },

  // Configurações de notificações
  notifications: {
    defaultPreferences: {
      email: true,
      push: true,
      sms: false
    },
    emailTemplates: {
      userCreated: 'user-created',
      passwordReset: 'password-reset',
      accountLocked: 'account-locked',
      mfaEnabled: 'mfa-enabled'
    }
  },

  // Configurações de tenant
  tenant: {
    defaultMaxUsers: 10,
    subscriptionPlans: {
      basic: { maxUsers: 10, features: ['basic_reports'] },
      premium: { maxUsers: 50, features: ['advanced_reports', 'api_access'] },
      enterprise: { maxUsers: 500, features: ['custom_integrations', 'sso', 'advanced_security'] }
    }
  },

  // Configurações de interface
  ui: {
    defaultTheme: 'light',
    defaultLanguage: 'pt-BR',
    defaultTimezone: 'America/Sao_Paulo',
    refreshInterval: 30000, // 30 segundos
    autoSaveInterval: 5000, // 5 segundos
    searchDebounceMs: 300
  },

  // Configurações de validação
  validation: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 255
    },
    name: {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ÿ\s]+$/
    },
    phone: {
      pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      placeholder: '(11) 99999-9999'
    }
  },

  // Configurações de exportação
  export: {
    formats: ['csv', 'xlsx', 'pdf'],
    maxRecords: 10000,
    defaultFormat: 'xlsx',
    includeHeaders: true
  },

  // Configurações de cache
  cache: {
    userDataTTL: 5 * 60 * 1000, // 5 minutos
    permissionsTTL: 10 * 60 * 1000, // 10 minutos
    statsTTL: 2 * 60 * 1000, // 2 minutos
    sessionTTL: 30 * 60 * 1000 // 30 minutos
  }
};

// Tipos para configuração
export type UserManagementConfig = typeof USER_MANAGEMENT_CONFIG;

// Função para obter configuração específica
export const getConfig = <T extends keyof UserManagementConfig>(
  section: T
): UserManagementConfig[T] => {
  return USER_MANAGEMENT_CONFIG[section];
};

// Função para validar configuração
export const validateConfig = (): boolean => {
  try {
    // Validar configurações críticas
    const security = getConfig('security');
    if (security.maxFailedAttempts < 1 || security.maxFailedAttempts > 10) {
      throw new Error('maxFailedAttempts deve estar entre 1 e 10');
    }

    if (security.passwordMinLength < 6 || security.passwordMinLength > 20) {
      throw new Error('passwordMinLength deve estar entre 6 e 20');
    }

    const mfa = getConfig('mfa');
    if (mfa.digits !== 6 && mfa.digits !== 8) {
      throw new Error('MFA digits deve ser 6 ou 8');
    }

    const pagination = getConfig('pagination');
    if (pagination.defaultPageSize > pagination.maxPageSize) {
      throw new Error('defaultPageSize não pode ser maior que maxPageSize');
    }

    return true;
  } catch (error) {
    console.error('Erro na validação da configuração:', error);
    return false;
  }
};

// Configurações específicas por ambiente
export const getEnvironmentConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  return {
    isDevelopment,
    isProduction,
    apiUrl: import.meta.env.VITE_SUPABASE_URL,
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    enableDebugLogs: isDevelopment,
    enableMockData: isDevelopment,
    strictValidation: isProduction,
    enableAnalytics: isProduction
  };
};

// Constantes para roles e permissões
export const ROLES = {
  ADMIN: 'admin',
  CISO: 'ciso',
  RISK_MANAGER: 'risk_manager',
  COMPLIANCE_OFFICER: 'compliance_officer',
  AUDITOR: 'auditor',
  USER: 'user'
} as const;

export const PERMISSIONS = {
  // Usuários
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_ROLES: 'users.manage_roles',
  USERS_RESET_PASSWORD: 'users.reset_password',
  USERS_UNLOCK: 'users.unlock',

  // Tenant
  TENANT_READ: 'tenant.read',
  TENANT_UPDATE: 'tenant.update',
  TENANT_MANAGE: 'tenant.manage',

  // Logs
  LOGS_READ: 'logs.read',
  LOGS_EXPORT: 'logs.export',
  SECURITY_LOGS_READ: 'security_logs.read',

  // Relatórios
  REPORTS_GENERATE: 'reports.generate',
  REPORTS_EXPORT: 'reports.export',

  // Sistema
  SYSTEM_ADMIN: 'system.admin'
} as const;

export const SECURITY_EVENTS = {
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  MFA_ENABLED: 'mfa_enabled',
  MFA_DISABLED: 'mfa_disabled',
  MFA_CHALLENGE: 'mfa_challenge',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked',
  PERMISSION_DENIED: 'permission_denied',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity'
} as const;

export const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
} as const;

// Validar configuração na inicialização
if (!validateConfig()) {
  console.warn('Configuração do sistema de usuários contém erros');
}