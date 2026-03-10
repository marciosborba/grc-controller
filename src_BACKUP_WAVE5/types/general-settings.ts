// ============================================================================
// TYPES: MÓDULO CONFIGURAÇÕES GERAIS
// ============================================================================
// Tipos TypeScript para as tabelas do módulo de configurações gerais

// Enum para status de integrações
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';

// Enum para tipos de integração
export type IntegrationType = 'api' | 'mcp' | 'email' | 'sso' | 'webhook' | 'backup';

// Enum para tipos de API
export type ApiType = 'rest' | 'graphql' | 'soap';

// Enum para tipos de autenticação
export type AuthType = 'none' | 'api-key' | 'bearer' | 'basic' | 'oauth2';

// Enum para provedores MCP
export type MCPProviderType = 'claude' | 'openai' | 'custom';

// Enum para provedores de email
export type EmailProviderType = 'smtp' | 'sendgrid' | 'ses' | 'mailgun' | 'graph' | 'custom';

// Enum para provedores SSO
export type SSOProviderType = 'azure-ad' | 'google' | 'okta' | 'auth0' | 'saml' | 'oidc';

// Enum para tipos de backup
export type BackupType = 'local' | 'aws-s3' | 'google-drive' | 'onedrive' | 'ftp' | 'sftp';

// Enum para tipos de agendamento
export type ScheduleType = 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly';

// Enum para tipos de sincronização
export type SyncType = 'one-way' | 'two-way';

// Enum para resolução de conflitos
export type ConflictResolution = 'local-wins' | 'remote-wins' | 'create-duplicate' | 'manual';

// Enum para tipos de log
export type LogType = 'request' | 'response' | 'error' | 'sync' | 'webhook' | 'backup';

// Enum para níveis de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

// Interface base para integrações
export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  tenant_id: string | null;
  last_sync: string | null;
  last_error: string | null;
  error_count: number;
  uptime_percentage: number;
  config_hash: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para conexões de API
export interface ApiConnection {
  id: string;
  integration_id: string;
  name: string;
  api_type: ApiType;
  base_url: string;
  auth_type: AuthType;
  
  // Credenciais (criptografadas no banco)
  api_key?: string;
  bearer_token?: string;
  username?: string;
  password?: string;
  oauth2_config?: {
    client_id: string;
    client_secret: string;
    scope?: string;
    authorization_url?: string;
    token_url?: string;
  };
  
  // Configurações
  headers?: Record<string, string>;
  rate_limit_per_minute: number;
  timeout_seconds: number;
  retry_attempts: number;
  retry_delay_seconds: number;
  
  // Monitoramento
  last_request_at: string | null;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  
  tenant_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para provedores MCP
export interface MCPProvider {
  id: string;
  integration_id: string;
  name: string;
  provider_type: MCPProviderType;
  endpoint: string | null;
  model: string | null;
  
  // Credenciais
  api_key: string;
  organization_id: string | null;
  
  // Configurações do modelo
  context_window: number;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  
  // Perfis de contexto
  context_profiles: ContextProfile[] | null;
  
  // Monitoramento
  tokens_used_today: number;
  tokens_limit_per_day: number;
  last_request_at: string | null;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  
  tenant_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para perfis de contexto
export interface ContextProfile {
  name: string;
  description: string;
  system_prompt: string;
  tags?: string[];
}

// Interface para provedores de email
export interface EmailProvider {
  id: string;
  integration_id: string;
  name: string;
  provider_type: EmailProviderType;
  
  // SMTP Configuration
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure: boolean;
  smtp_username?: string;
  smtp_password?: string;
  
  // API Configuration
  api_key?: string;
  api_endpoint?: string;
  region?: string;
  
  // Microsoft Graph
  tenant_id_graph?: string;
  client_id?: string;
  client_secret?: string;
  
  // Configurações gerais
  from_email: string;
  from_name: string;
  reply_to?: string;
  
  // Templates
  templates: EmailTemplate[] | null;
  
  // Rate limiting
  rate_limit_per_hour: number;
  
  // Monitoramento
  emails_sent_today: number;
  emails_delivered: number;
  emails_bounced: number;
  emails_opened: number;
  emails_clicked: number;
  last_sent_at: string | null;
  
  tenant_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para templates de email
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables?: string[];
}

// Interface para provedores SSO
export interface SSOProvider {
  id: string;
  integration_id: string;
  name: string;
  provider_type: SSOProviderType;
  
  // URLs e endpoints
  authorization_url?: string;
  token_url?: string;
  userinfo_url?: string;
  jwks_url?: string;
  metadata_url?: string;
  
  // Credenciais
  client_id: string;
  client_secret: string;
  tenant_id_provider?: string;
  
  // SAML Configuration
  saml_entity_id?: string;
  saml_sso_url?: string;
  saml_certificate?: string;
  
  // Configurações
  scopes: string[] | null;
  attribute_mapping: Record<string, string> | null;
  auto_provisioning: boolean;
  default_roles: string[] | null;
  
  // Configurações de segurança
  require_2fa: boolean;
  session_timeout_minutes: number;
  
  // Monitoramento
  logins_today: number;
  successful_logins: number;
  failed_logins: number;
  last_login_at: string | null;
  
  tenant_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para webhooks
export interface WebhookEndpoint {
  id: string;
  integration_id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  
  // Eventos
  events: string[];
  
  // Segurança
  hmac_secret?: string;
  custom_headers?: Record<string, string>;
  
  // Configurações de retry
  retry_attempts: number;
  retry_delay_seconds: number;
  timeout_seconds: number;
  
  // Status
  is_active: boolean;
  
  // Monitoramento
  deliveries_today: number;
  successful_deliveries: number;
  failed_deliveries: number;
  last_delivery_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_failure_reason: string | null;
  avg_response_time_ms: number;
  
  tenant_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para configurações de backup
export interface BackupConfiguration {
  id: string;
  integration_id: string;
  name: string;
  backup_type: BackupType;
  
  // Configurações de destino
  destination_config?: Record<string, any>;
  
  // AWS S3
  s3_bucket?: string;
  s3_region?: string;
  s3_access_key?: string;
  s3_secret_key?: string;
  s3_prefix?: string;
  
  // Google Drive
  gdrive_folder_id?: string;
  gdrive_service_account?: string;
  
  // FTP/SFTP
  ftp_host?: string;
  ftp_port?: number;
  ftp_username?: string;
  ftp_password?: string;
  ftp_path?: string;
  
  // Agendamento
  schedule_type: ScheduleType;
  schedule_time?: string;
  schedule_day_of_week?: number;
  schedule_day_of_month?: number;
  
  // Tipos de dados
  include_database: boolean;
  include_uploads: boolean;
  include_logs: boolean;
  include_configurations: boolean;
  include_reports: boolean;
  
  // Configurações avançadas
  compression_enabled: boolean;
  encryption_enabled: boolean;
  encryption_key?: string;
  
  // Política de retenção
  retention_days: number;
  max_backups: number;
  
  // Sincronização
  sync_type: SyncType;
  conflict_resolution: ConflictResolution;
  
  // Status e monitoramento
  is_active: boolean;
  last_backup_at: string | null;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_failure_reason: string | null;
  total_backups: number;
  successful_backups: number;
  failed_backups: number;
  backup_size_bytes: number;
  
  tenant_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para logs de integração
export interface IntegrationLog {
  id: string;
  integration_id: string;
  log_type: LogType;
  level: LogLevel;
  message: string;
  details?: Record<string, any>;
  request_url?: string;
  response_status?: number;
  response_time_ms?: number;
  tenant_id: string | null;
  created_at: string;
}

// ============================================================================
// INTERFACES PARA FORMULÁRIOS E UI
// ============================================================================

// Form data para criação/edição de API Connection
export interface ApiConnectionFormData {
  name: string;
  api_type: ApiType;
  base_url: string;
  auth_type: AuthType;
  api_key?: string;
  bearer_token?: string;
  username?: string;
  password?: string;
  oauth2_config?: {
    client_id: string;
    client_secret: string;
    scope?: string;
  };
  headers?: Record<string, string>;
  rate_limit_per_minute: number;
  timeout_seconds: number;
  retry_attempts: number;
  retry_delay_seconds: number;
}

// Form data para MCP Provider
export interface MCPProviderFormData {
  name: string;
  provider_type: MCPProviderType;
  endpoint?: string;
  model?: string;
  api_key: string;
  organization_id?: string;
  context_window: number;
  temperature: number;
  max_tokens: number;
  context_profiles?: ContextProfile[];
  tokens_limit_per_day: number;
}

// Form data para Email Provider
export interface EmailProviderFormData {
  name: string;
  provider_type: EmailProviderType;
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure: boolean;
  smtp_username?: string;
  smtp_password?: string;
  api_key?: string;
  api_endpoint?: string;
  region?: string;
  from_email: string;
  from_name: string;
  reply_to?: string;
  templates?: EmailTemplate[];
  rate_limit_per_hour: number;
}

// Form data para SSO Provider
export interface SSOProviderFormData {
  name: string;
  provider_type: SSOProviderType;
  client_id: string;
  client_secret: string;
  tenant_id_provider?: string;
  authorization_url?: string;
  token_url?: string;
  userinfo_url?: string;
  scopes?: string[];
  attribute_mapping?: Record<string, string>;
  auto_provisioning: boolean;
  default_roles?: string[];
  require_2fa: boolean;
  session_timeout_minutes: number;
}

// Form data para Webhook
export interface WebhookFormData {
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: string[];
  hmac_secret?: string;
  custom_headers?: Record<string, string>;
  retry_attempts: number;
  retry_delay_seconds: number;
  timeout_seconds: number;
  is_active: boolean;
}

// Form data para Backup Configuration
export interface BackupConfigFormData {
  name: string;
  backup_type: BackupType;
  s3_bucket?: string;
  s3_region?: string;
  s3_access_key?: string;
  s3_secret_key?: string;
  s3_prefix?: string;
  gdrive_folder_id?: string;
  gdrive_service_account?: string;
  ftp_host?: string;
  ftp_port?: number;
  ftp_username?: string;
  ftp_password?: string;
  ftp_path?: string;
  schedule_type: ScheduleType;
  schedule_time?: string;
  schedule_day_of_week?: number;
  schedule_day_of_month?: number;
  include_database: boolean;
  include_uploads: boolean;
  include_logs: boolean;
  include_configurations: boolean;
  include_reports: boolean;
  compression_enabled: boolean;
  encryption_enabled: boolean;
  encryption_key?: string;
  retention_days: number;
  max_backups: number;
  sync_type: SyncType;
  conflict_resolution: ConflictResolution;
  is_active: boolean;
}

// ============================================================================
// INTERFACES PARA ESTATÍSTICAS E DASHBOARDS
// ============================================================================

// Interface para estatísticas de integração
export interface IntegrationStats {
  total_integrations: number;
  connected: number;
  disconnected: number;
  error: number;
  pending: number;
  avg_uptime: number;
  by_type: Record<IntegrationType, number>;
}

// Interface para métricas de API
export interface ApiMetrics {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
  avg_response_time: number;
  requests_today: number;
}

// Interface para métricas de MCP
export interface MCPMetrics {
  tokens_used_today: number;
  tokens_limit_per_day: number;
  usage_percentage: number;
  total_requests: number;
  successful_requests: number;
  avg_response_time: number;
}

// Interface para métricas de email
export interface EmailMetrics {
  emails_sent_today: number;
  delivery_rate: number;
  bounce_rate: number;
  open_rate: number;
  click_rate: number;
}

// Interface para métricas de webhook
export interface WebhookMetrics {
  deliveries_today: number;
  success_rate: number;
  failed_deliveries: number;
  avg_response_time: number;
}

// Interface para métricas de backup
export interface BackupMetrics {
  total_backups: number;
  successful_backups: number;
  success_rate: number;
  last_backup_size: number;
  avg_backup_size: number;
}

// ============================================================================
// TIPOS PARA TESTE DE CONECTIVIDADE
// ============================================================================

export interface ConnectionTestResult {
  success: boolean;
  response_time_ms?: number;
  status_code?: number;
  error_message?: string;
  details?: Record<string, any>;
}

// ============================================================================
// TIPOS PARA EVENTOS DE WEBHOOK
// ============================================================================

export interface WebhookEvent {
  event: string;
  timestamp: string;
  data: Record<string, any>;
  tenant_id: string;
}

// Eventos disponíveis
export type AvailableWebhookEvents = 
  | 'risk.created'
  | 'risk.updated' 
  | 'risk.deleted'
  | 'incident.created'
  | 'incident.resolved'
  | 'assessment.started'
  | 'assessment.completed'
  | 'compliance.updated'
  | 'user.created'
  | 'policy.published'
  | 'security_incident.created'
  | 'compliance.violation';

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  Integration,
  ApiConnection,
  MCPProvider,
  EmailProvider,
  SSOProvider,
  WebhookEndpoint,
  BackupConfiguration,
  IntegrationLog,
  IntegrationStatus,
  IntegrationType,
  ApiType,
  AuthType,
  MCPProviderType,
  EmailProviderType,
  SSOProviderType,
  BackupType,
  ScheduleType,
  SyncType,
  ConflictResolution,
  LogType,
  LogLevel,
  ContextProfile,
  EmailTemplate,
  ApiConnectionFormData,
  MCPProviderFormData,
  EmailProviderFormData,
  SSOProviderFormData,
  WebhookFormData,
  BackupConfigFormData,
  IntegrationStats,
  ApiMetrics,
  MCPMetrics,
  EmailMetrics,
  WebhookMetrics,
  BackupMetrics,
  ConnectionTestResult,
  WebhookEvent,
  AvailableWebhookEvents
};