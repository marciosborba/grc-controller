// =====================================================
// TIPOS PARA SISTEMA DE ADMINISTRAÇÃO DE USUÁRIOS
// =====================================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  settings: Record<string, any>;
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  max_users: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMFA {
  id: string;
  user_id: string;
  is_enabled: boolean;
  secret_key?: string;
  backup_codes?: string[];
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  last_activity: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: AppRole;
  permission_id: string;
  tenant_id?: string;
  created_at: string;
  permission?: Permission;
}

export interface SecurityLog {
  id: string;
  user_id?: string;
  tenant_id?: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ip_address?: string;
  user_agent?: string;
  geo_location?: Record<string, any>;
  details?: Record<string, any>;
  created_at: string;
}

export interface ExtendedProfile {
  id: string;
  user_id: string;
  full_name: string;
  job_title?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  tenant_id?: string;
  permissions: string[];
  is_active: boolean;
  theme: 'light' | 'dark';
  last_login_at?: string;
  login_count: number;
  failed_login_attempts: number;
  locked_until?: string;
  password_changed_at: string;
  must_change_password: boolean;
  two_factor_enabled: boolean;
  email_verified: boolean;
  timezone: string;
  language: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ExtendedUser {
  id: string;
  email: string;
  profile: ExtendedProfile;
  roles: AppRole[];
  permissions: string[];
  mfa?: UserMFA;
  sessions: UserSession[];
  tenant: Tenant;
  last_activity?: string;
  is_online: boolean;
}

export type AppRole = 
  | 'admin' 
  | 'ciso' 
  | 'risk_manager' 
  | 'compliance_officer' 
  | 'auditor' 
  | 'user';

export interface UserManagementFilters {
  search?: string;
  role?: AppRole;
  status?: 'active' | 'inactive' | 'locked';
  department?: string;
  tenant_id?: string;
  mfa_enabled?: boolean;
  last_login_days?: number;
}

export interface UserManagementStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  locked_users: number;
  mfa_enabled_users: number;
  users_by_role: Record<AppRole, number>;
  recent_logins: number;
  failed_login_attempts: number;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  job_title?: string;
  department?: string;
  phone?: string;
  roles: AppRole[];
  tenant_id: string;
  send_invitation: boolean;
  must_change_password?: boolean;
  permissions?: string[];
}

export interface UpdateUserRequest {
  full_name?: string;
  job_title?: string;
  department?: string;
  phone?: string;
  roles?: AppRole[];
  is_active?: boolean;
  permissions?: string[];
  must_change_password?: boolean;
  timezone?: string;
  language?: string;
  locked_until?: string;
  failed_login_attempts?: number;
  notification_preferences?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

export interface MFASetupData {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export interface MFAVerificationRequest {
  token: string;
  backup_code?: string;
}

export interface PasswordResetRequest {
  user_id: string;
  new_password?: string;
  send_email: boolean;
  must_change_password: boolean;
}

export interface BulkUserAction {
  action: 'activate' | 'deactivate' | 'unlock' | 'delete' | 'reset_password' | 'assign_role';
  user_ids: string[];
  parameters?: Record<string, any>;
}

export interface UserActivitySummary {
  user_id: string;
  total_logins: number;
  last_login: string;
  failed_attempts: number;
  active_sessions: number;
  recent_activities: Array<{
    action: string;
    timestamp: string;
    ip_address?: string;
    details?: Record<string, any>;
  }>;
}

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  tenant_id?: string;
  session_id?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  geo_location?: Record<string, any>;
  device_info?: Record<string, any>;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  user_id?: string;
  tenant_id?: string;
  ip_address?: string;
  user_agent?: string;
  geo_location?: Record<string, any>;
  details?: Record<string, any>;
  created_at: string;
}

// Enums para facilitar o uso
export const USER_ROLES: Record<AppRole, string> = {
  admin: 'Administrador',
  ciso: 'CISO',
  risk_manager: 'Gerente de Riscos',
  compliance_officer: 'Oficial de Compliance',
  auditor: 'Auditor',
  user: 'Usuário'
};

export const USER_STATUS = {
  active: 'Ativo',
  inactive: 'Inativo',
  locked: 'Bloqueado'
} as const;

export const MFA_STATUS = {
  enabled: 'Habilitado',
  disabled: 'Desabilitado'
} as const;

export const SECURITY_EVENT_TYPES = {
  login_attempt: 'Tentativa de Login',
  login_success: 'Login Realizado',
  login_failure: 'Falha no Login',
  logout: 'Logout',
  password_change: 'Alteração de Senha',
  mfa_enabled: 'MFA Habilitado',
  mfa_disabled: 'MFA Desabilitado',
  mfa_challenge: 'Desafio MFA',
  account_locked: 'Conta Bloqueada',
  account_unlocked: 'Conta Desbloqueada',
  permission_denied: 'Permissão Negada',
  suspicious_activity: 'Atividade Suspeita'
} as const;

export const PERMISSION_RESOURCES = {
  users: 'Usuários',
  tenant: 'Organização',
  logs: 'Logs',
  security_logs: 'Logs de Segurança',
  reports: 'Relatórios',
  system: 'Sistema'
} as const;

export const PERMISSION_ACTIONS = {
  create: 'Criar',
  read: 'Visualizar',
  update: 'Editar',
  delete: 'Excluir',
  manage: 'Gerenciar',
  export: 'Exportar',
  admin: 'Administrar'
} as const;