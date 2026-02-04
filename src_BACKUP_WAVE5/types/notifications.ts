// ============================================================================
// TIPOS E INTERFACES PARA SISTEMA DE NOTIFICAÇÕES
// ============================================================================
// Sistema completo de notificações para gestão de workflow dos módulos GRC

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'dismissed';

// Módulos e submódulos que podem gerar notificações
export type NotificationModule = 
  | 'assessments'
  | 'risks' 
  | 'compliance'
  | 'policies'
  | 'privacy'
  | 'audit'
  | 'users'
  | 'system'
  | 'general-settings'
  | 'frameworks'
  | 'incidents';

// Tipos específicos de notificação por módulo
export type NotificationType = 
  // Assessments
  | 'assessment_due'
  | 'assessment_completed'
  | 'assessment_reviewed'
  | 'assessment_rejected'
  | 'assessment_approved'
  | 'assessment_overdue'
  | 'assessment_assigned'
  | 'assessment_evidence_required'
  
  // Risks
  | 'risk_identified'
  | 'risk_updated'
  | 'risk_escalated'
  | 'risk_mitigated'
  | 'risk_review_due'
  | 'risk_treatment_overdue'
  | 'risk_threshold_exceeded'
  
  // Compliance
  | 'compliance_deadline'
  | 'compliance_violation'
  | 'compliance_report_ready'
  | 'compliance_audit_scheduled'
  | 'compliance_gap_identified'
  
  // Policies
  | 'policy_review_due'
  | 'policy_updated'
  | 'policy_approval_pending'
  | 'policy_acknowledged'
  | 'policy_expired'
  
  // Privacy/LGPD
  | 'data_breach_detected'
  | 'privacy_request_received'
  | 'dpia_required'
  | 'consent_expired'
  | 'data_retention_alert'
  
  // System
  | 'system_maintenance'
  | 'system_alert'
  | 'backup_completed'
  | 'backup_failed'
  | 'integration_error'
  | 'security_alert'
  
  // Users
  | 'user_access_request'
  | 'user_role_changed'
  | 'user_login_anomaly'
  | 'user_password_expiry'
  | 'user_mfa_required'
  
  // General
  | 'workflow_step_completed'
  | 'approval_requested'
  | 'document_signed'
  | 'deadline_reminder'
  | 'task_assigned'
  | 'task_completed';

// Ações que podem ser executadas nas notificações
export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  url?: string;
  action?: 'approve' | 'reject' | 'review' | 'acknowledge' | 'dismiss' | 'escalate';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// Configurações de e-mail para integração futura
export interface EmailSettings {
  enabled: boolean;
  template?: string;
  subject?: string;
  priority?: 'normal' | 'high';
  delay?: number; // minutos antes de enviar
  aggregation?: boolean; // agrupar múltiplas notificações
  digestMode?: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

// Metadados específicos por tipo de notificação
export interface NotificationMetadata {
  // IDs relacionados
  entityId?: string;
  parentEntityId?: string;
  userId?: string;
  tenantId?: string;
  
  // Dados do workflow
  workflowStage?: string;
  approvalLevel?: number;
  escalationLevel?: number;
  
  // Dados específicos do domínio
  assessmentId?: string;
  riskId?: string;
  policyId?: string;
  frameworkId?: string;
  controlId?: string;
  
  // Prazos e datas
  dueDate?: string;
  deadline?: string;
  reminderDate?: string;
  
  // Dados adicionais
  severity?: NotificationPriority;
  category?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

// Interface principal de notificação
export interface Notification {
  id: string;
  type: NotificationType;
  module: NotificationModule;
  
  // Conteúdo
  title: string;
  message: string;
  shortMessage?: string; // para preview/badges
  
  // Status e classificação
  status: NotificationStatus;
  priority: NotificationPriority;
  isSticky?: boolean; // não pode ser descartada automaticamente
  
  // Destinatários
  userId: string;
  assignedTo?: string[];
  roleBasedAccess?: string[]; // roles que podem ver a notificação
  
  // Temporização
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  expiresAt?: string;
  scheduledFor?: string; // notificações agendadas
  
  // Ações disponíveis
  actions?: NotificationAction[];
  
  // Metadados e contexto
  metadata: NotificationMetadata;
  
  // Configurações de e-mail
  emailSettings?: EmailSettings;
  
  // Rastreamento
  source?: string; // qual processo/função gerou a notificação
  correlationId?: string; // para agrupar notificações relacionadas
  parentNotificationId?: string; // para notificações em cadeia
}

// Filtros para busca e listagem
export interface NotificationFilters {
  status?: NotificationStatus[];
  priority?: NotificationPriority[];
  module?: NotificationModule[];
  type?: NotificationType[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  assignedToMe?: boolean;
  tags?: string[];
}

// Configurações de preferências do usuário
export interface NotificationPreferences {
  userId: string;
  
  // Preferências por módulo
  moduleSettings: Record<NotificationModule, {
    enabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    digestMode: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'disabled';
    quietHours?: {
      start: string; // HH:mm
      end: string;   // HH:mm
      timezone: string;
    };
  }>;
  
  // Preferências por tipo
  typeSettings: Record<NotificationType, {
    enabled: boolean;
    priority: NotificationPriority;
    autoArchive?: boolean;
    autoArchiveAfterDays?: number;
  }>;
  
  // Configurações gerais
  globalSettings: {
    maxNotificationsPerPage: number;
    autoMarkAsRead: boolean;
    autoMarkAsReadAfterSeconds: number;
    groupSimilarNotifications: boolean;
    enableSounds: boolean;
    enableDesktopNotifications: boolean;
  };
}

// Estatísticas e métricas
export interface NotificationStats {
  total: number;
  unread: number;
  byPriority: Record<NotificationPriority, number>;
  byModule: Record<NotificationModule, number>;
  byStatus: Record<NotificationStatus, number>;
  overdue: number;
  actionRequired: number;
}

// Payload para criação de notificação
export interface CreateNotificationPayload {
  type: NotificationType;
  module: NotificationModule;
  title: string;
  message: string;
  shortMessage?: string;
  priority: NotificationPriority;
  userId: string;
  assignedTo?: string[];
  metadata: NotificationMetadata;
  actions?: Omit<NotificationAction, 'id'>[];
  emailSettings?: EmailSettings;
  expiresAt?: string;
  scheduledFor?: string;
  isSticky?: boolean;
}

// Payload para atualização de notificação
export interface UpdateNotificationPayload {
  status?: NotificationStatus;
  priority?: NotificationPriority;
  assignedTo?: string[];
  metadata?: Partial<NotificationMetadata>;
  actions?: NotificationAction[];
  expiresAt?: string;
}

// Response das APIs
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  stats: NotificationStats;
}

// Configuração de templates para diferentes tipos
export interface NotificationTemplate {
  type: NotificationType;
  module: NotificationModule;
  defaultTitle: string;
  defaultMessage: string;
  defaultPriority: NotificationPriority;
  defaultActions: Omit<NotificationAction, 'id'>[];
  emailTemplate?: string;
  variables: string[]; // variáveis que podem ser substituídas
  isSystemTemplate: boolean;
}

// Regras de escalação automática
export interface EscalationRule {
  id: string;
  name: string;
  description: string;
  module: NotificationModule;
  type: NotificationType;
  
  // Condições para ativar escalação
  conditions: {
    priority?: NotificationPriority[];
    statusDuration?: number; // minutos sem mudança de status
    noActionTaken?: boolean;
    overdueDays?: number;
  };
  
  // Ações de escalação
  escalationActions: {
    increasePriority?: boolean;
    newPriority?: NotificationPriority;
    assignToRoles?: string[];
    assignToUsers?: string[];
    createNewNotification?: boolean;
    sendEmail?: boolean;
    sendSms?: boolean;
  };
  
  // Configurações
  isActive: boolean;
  maxEscalations?: number;
  escalationIntervalMinutes: number;
  
  // Auditoria
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Log de auditoria das notificações
export interface NotificationAuditLog {
  id: string;
  notificationId: string;
  userId: string;
  action: 'created' | 'read' | 'updated' | 'deleted' | 'action_executed' | 'escalated';
  details: {
    previousValues?: Partial<Notification>;
    newValues?: Partial<Notification>;
    actionExecuted?: string;
    escalationRuleId?: string;
  };
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
}

export default Notification;