// =============================================================================
// TIPOS TYPESCRIPT PARA MÓDULO DE ÉTICA E CANAL DE DENÚNCIAS
// =============================================================================
// Interfaces tipadas para todas as funcionalidades do módulo de ética

import { Database } from '@/integrations/supabase/types';

// Tipos base do banco de dados
type EthicsReport = Database['public']['Tables']['ethics_reports']['Row'];
type EthicsReportInsert = Database['public']['Tables']['ethics_reports']['Insert'];
type EthicsReportUpdate = Database['public']['Tables']['ethics_reports']['Update'];

type EthicsCategory = Database['public']['Tables']['ethics_categories']['Row'];
type EthicsCategoryInsert = Database['public']['Tables']['ethics_categories']['Insert'];

type EthicsActivity = Database['public']['Tables']['ethics_activities']['Row'];
type EthicsActivityInsert = Database['public']['Tables']['ethics_activities']['Insert'];

type EthicsCommunication = Database['public']['Tables']['ethics_communications']['Row'];
type EthicsCommunicationInsert = Database['public']['Tables']['ethics_communications']['Insert'];

type EthicsAttachment = Database['public']['Tables']['ethics_attachments']['Row'];
type EthicsAttachmentInsert = Database['public']['Tables']['ethics_attachments']['Insert'];

type EthicsSettings = Database['public']['Tables']['ethics_settings']['Row'];
type EthicsSettingsUpdate = Database['public']['Tables']['ethics_settings']['Update'];

type EthicsNotificationTemplate = Database['public']['Tables']['ethics_notification_templates']['Row'];

// =============================================================================
// INTERFACES ESPECÍFICAS PARA O MÓDULO
// =============================================================================

// Status possíveis de uma denúncia
export type EthicsReportStatus = 
  | 'open'           // Aberto - denúncia recém-criada
  | 'triaging'       // Triagem - análise inicial
  | 'investigating'  // Investigando - em processo de investigação
  | 'in_review'      // Em análise - aguardando decisão
  | 'resolved'       // Resolvido - caso concluído com resolução
  | 'closed'         // Fechado - caso encerrado
  | 'escalated'      // Escalado - enviado para instância superior
  | 'suspended';     // Suspenso - temporariamente pausado

// Severidade da denúncia
export type EthicsReportSeverity = 
  | 'low'      // Baixa
  | 'medium'   // Média  
  | 'high'     // Alta
  | 'critical'; // Crítica

// Prioridade do caso
export type EthicsReportPriority = 
  | 'low'      // Baixa
  | 'medium'   // Média
  | 'high'     // Alta
  | 'critical'; // Crítica

// Tipos de atividade no workflow
export type EthicsActivityType = 
  | 'created'                  // Caso criado
  | 'updated'                  // Informações atualizadas
  | 'status_changed'           // Status alterado
  | 'assigned'                 // Atribuído a investigador
  | 'unassigned'               // Desatribuído
  | 'priority_changed'         // Prioridade alterada
  | 'severity_changed'         // Severidade alterada
  | 'category_changed'         // Categoria alterada
  | 'message_sent'             // Mensagem enviada
  | 'message_received'         // Mensagem recebida
  | 'evidence_uploaded'        // Evidência anexada
  | 'investigation_started'    // Investigação iniciada
  | 'investigation_completed'  // Investigação concluída
  | 'resolved'                 // Caso resolvido
  | 'closed'                   // Caso fechado
  | 'reopened'                 // Caso reaberto
  | 'escalated'                // Caso escalado
  | 'due_date_changed'         // Prazo alterado
  | 'sla_breach'               // SLA violado
  | 'comment_added';           // Comentário adicionado

// Tipos de comunicação
export type EthicsMessageType = 
  | 'update'      // Atualização de status
  | 'question'    // Pergunta para o denunciante
  | 'response'    // Resposta do denunciante
  | 'resolution'  // Comunicação de resolução
  | 'closure';    // Comunicação de fechamento

// Tipo de remetente da comunicação
export type EthicsSenderType = 
  | 'system'       // Sistema automático
  | 'investigator' // Investigador/responsável
  | 'reporter'     // Denunciante
  | 'admin';       // Administrador

// Tipos de template de notificação
export type EthicsTemplateType = 
  | 'report_received'           // Denúncia recebida
  | 'acknowledgment'            // Confirmação
  | 'status_update'             // Atualização de status
  | 'assignment'                // Atribuição de caso
  | 'escalation'                // Escalação
  | 'investigation_started'     // Investigação iniciada
  | 'additional_info_requested' // Informações adicionais solicitadas
  | 'resolution_proposed'       // Resolução proposta
  | 'case_closed'              // Caso fechado
  | 'sla_warning'              // Alerta de SLA
  | 'sla_breach';              // Violação de SLA

// =============================================================================
// INTERFACES EXTENDIDAS COM DADOS RELACIONADOS
// =============================================================================

// Relatório de ética com dados relacionados
export interface EthicsReportWithDetails extends EthicsReport {
  category_details?: EthicsCategory;
  assigned_user?: {
    id: string;
    name: string;
    email: string;
  };
  communications_count?: number;
  activities_count?: number;
  attachments_count?: number;
  days_since_created?: number;
  days_until_due?: number;
  is_sla_breach?: boolean;
  last_communication_date?: string;
}

// Categoria com estatísticas
export interface EthicsCategoryWithStats extends EthicsCategory {
  reports_count?: number;
  open_reports_count?: number;
  avg_resolution_days?: number;
  sla_compliance_rate?: number;
}

// Comunicação com dados do remetente
export interface EthicsCommunicationWithSender extends EthicsCommunication {
  sender_details?: {
    id: string;
    name: string;
    email: string;
  };
  report_details?: {
    protocol_number: string;
    title: string;
    is_anonymous: boolean;
  };
}

// Atividade com dados do usuário
export interface EthicsActivityWithUser extends EthicsActivity {
  user_details?: {
    id: string;
    name: string;
    email: string;
  };
}

// =============================================================================
// INTERFACES PARA FORMULÁRIOS E UI
// =============================================================================

// Formulário de nova denúncia
export interface EthicsReportFormData {
  title: string;
  description: string;
  category: string;
  severity: EthicsReportSeverity;
  priority?: EthicsReportPriority;
  is_anonymous: boolean;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  evidence_files?: File[];
  source?: string;
  reporter_type?: 'internal' | 'external' | 'customer' | 'supplier';
  tags?: string[];
}

// Formulário de atualização de caso
export interface EthicsReportUpdateFormData {
  status?: EthicsReportStatus;
  priority?: EthicsReportPriority;
  severity?: EthicsReportSeverity;
  assigned_to?: string;
  due_date?: string;
  investigation_summary?: string;
  resolution?: string;
  closure_reason?: string;
  tags?: string[];
}

// Formulário de comunicação
export interface EthicsCommunicationFormData {
  message_type: EthicsMessageType;
  subject: string;
  message: string;
  is_internal: boolean;
  attachments?: File[];
}

// Dados para busca pública por protocolo
export interface EthicsPublicLookupData {
  protocol_number: string;
  verification_code?: string; // Para casos anônimos
}

// =============================================================================
// INTERFACES PARA FILTROS E PESQUISA
// =============================================================================

// Filtros para relatórios de ética
export interface EthicsReportFilters {
  search_term?: string;
  statuses?: EthicsReportStatus[];
  categories?: string[];
  severities?: EthicsReportSeverity[];
  priorities?: EthicsReportPriority[];
  assigned_to?: string[];
  date_from?: string;
  date_to?: string;
  due_date_from?: string;
  due_date_to?: string;
  is_anonymous?: boolean;
  has_sla_breach?: boolean;
  tags?: string[];
  sort_by?: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'severity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Filtros para atividades
export interface EthicsActivityFilters {
  report_id?: string;
  activity_types?: EthicsActivityType[];
  performed_by?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: 'created_at' | 'activity_type';
  sort_order?: 'asc' | 'desc';
}

// =============================================================================
// INTERFACES PARA DASHBOARD E RELATÓRIOS
// =============================================================================

// Métricas do dashboard
export interface EthicsDashboardMetrics {
  total_reports: number;
  open_reports: number;
  investigating_reports: number;
  resolved_reports: number;
  closed_reports: number;
  anonymous_reports: number;
  critical_reports: number;
  sla_breach_reports: number;
  avg_resolution_days: number;
  reports_by_category: Record<string, number>;
  reports_by_severity: Record<string, number>;
  reports_by_month: Array<{
    month: string;
    count: number;
    resolved: number;
  }>;
  resolution_rate: number;
  sla_compliance_rate: number;
}

// KPIs por período
export interface EthicsKPIs {
  period: 'week' | 'month' | 'quarter' | 'year';
  new_reports: number;
  resolved_reports: number;
  avg_response_time_hours: number;
  avg_resolution_time_days: number;
  satisfaction_rate?: number;
  escalation_rate: number;
  repeat_reporters: number;
  category_trends: Array<{
    category: string;
    count: number;
    change_percent: number;
  }>;
}

// =============================================================================
// INTERFACES PARA CONFIGURAÇÕES E ADMINISTRAÇÃO
// =============================================================================

// Configurações do módulo
export interface EthicsModuleSettings {
  module_enabled: boolean;
  public_submissions_enabled: boolean;
  anonymous_submissions_enabled: boolean;
  require_evidence: boolean;
  auto_acknowledge: boolean;
  default_sla_days: number;
  escalation_days: number;
  closure_approval_required: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  default_investigator_id?: string;
  ethics_committee_emails: string[];
  escalation_emails: string[];
  protocol_prefix: string;
  protocol_format: string;
  welcome_message: string;
  closure_message: string;
  disclaimer_text: string;
}

// Configuração de categoria
export interface EthicsCategoryConfig {
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  is_active: boolean;
  default_severity: EthicsReportSeverity;
  default_priority: EthicsReportPriority;
  sla_days: number;
  requires_investigation: boolean;
  auto_assign_to?: string;
  notification_template?: string;
}

// =============================================================================
// INTERFACES PARA INTEGRAÇÃO E API
// =============================================================================

// Resposta da API para listagem
export interface EthicsReportsApiResponse {
  data: EthicsReportWithDetails[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

// Resposta para consulta pública
export interface EthicsPublicStatusResponse {
  protocol_number: string;
  status: EthicsReportStatus;
  status_display: string;
  created_date: string;
  last_update: string;
  category_display: string;
  expected_resolution?: string;
  can_communicate: boolean;
  satisfaction_survey_url?: string;
}

// Dados para notificação
export interface EthicsNotificationData {
  template_type: EthicsTemplateType;
  recipient_email?: string;
  recipient_phone?: string;
  variables: Record<string, string>;
  report: EthicsReportWithDetails;
  send_immediately?: boolean;
}

// =============================================================================
// EXPORTS PRINCIPAIS
// =============================================================================

export type {
  // Tipos base
  EthicsReport,
  EthicsReportInsert,
  EthicsReportUpdate,
  EthicsCategory,
  EthicsCategoryInsert,
  EthicsActivity,
  EthicsActivityInsert,
  EthicsCommunication,
  EthicsCommunicationInsert,
  EthicsAttachment,
  EthicsAttachmentInsert,
  EthicsSettings,
  EthicsSettingsUpdate,
  EthicsNotificationTemplate,
  
  // Enums
  EthicsReportStatus,
  EthicsReportSeverity,
  EthicsReportPriority,
  EthicsActivityType,
  EthicsMessageType,
  EthicsSenderType,
  EthicsTemplateType,
};

// Constantes úteis
export const ETHICS_STATUS_LABELS: Record<EthicsReportStatus, string> = {
  open: 'Aberto',
  triaging: 'Triagem',
  investigating: 'Investigando',
  in_review: 'Em Análise',
  resolved: 'Resolvido',
  closed: 'Fechado',
  escalated: 'Escalado',
  suspended: 'Suspenso'
};

export const ETHICS_SEVERITY_LABELS: Record<EthicsReportSeverity, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
};

export const ETHICS_PRIORITY_LABELS: Record<EthicsReportPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica'
};

export const ETHICS_STATUS_COLORS: Record<EthicsReportStatus, string> = {
  open: '#3b82f6',      // Azul
  triaging: '#f59e0b',  // Âmbar
  investigating: '#8b5cf6', // Roxo
  in_review: '#06b6d4', // Ciano
  resolved: '#10b981',  // Verde
  closed: '#6b7280',    // Cinza
  escalated: '#ef4444', // Vermelho
  suspended: '#f97316'  // Laranja
};

export const ETHICS_SEVERITY_COLORS: Record<EthicsReportSeverity, string> = {
  low: '#10b981',      // Verde
  medium: '#f59e0b',   // Âmbar
  high: '#f97316',     // Laranja
  critical: '#ef4444'  // Vermelho
};