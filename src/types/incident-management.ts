// ============================================================================
// TIPOS PARA GESTÃO DE INCIDENTES DE SEGURANÇA
// ============================================================================
// Tipos melhorados para gestão de incidentes com base em boas práticas de ITIL/ISO 27001

export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed' | 'cancelled' | 'escalated';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

export type IncidentType = 
  | 'security_breach'
  | 'malware'
  | 'phishing'
  | 'data_breach'
  | 'unauthorized_access'
  | 'ddos_attack'
  | 'social_engineering'
  | 'system_failure'
  | 'network_incident'
  | 'compliance_violation'
  | 'physical_security'
  | 'other';

export type IncidentCategory = 
  | 'Segurança da Informação'
  | 'Infraestrutura'
  | 'Aplicações'
  | 'Dados e Privacidade'
  | 'Compliance'
  | 'Segurança Física'
  | 'Recursos Humanos'
  | 'Terceiros'
  | 'Processo'
  | 'Ambiental';

export type ImpactLevel = 'minimal' | 'minor' | 'moderate' | 'major' | 'severe';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// INTERFACE PRINCIPAL - INCIDENT
// ============================================================================
export interface Incident {
  id: string;
  
  // Informações Básicas
  title: string;
  description?: string;
  incident_number?: string;
  type: IncidentType;
  category: IncidentCategory;
  
  // Classificação
  severity: IncidentSeverity;
  priority: IncidentPriority;
  impact_level?: ImpactLevel;
  urgency_level?: UrgencyLevel;
  
  // Status e Datas
  status: IncidentStatus;
  detection_date: Date;
  response_start_date?: Date;
  containment_date?: Date;
  resolution_date?: Date;
  closure_date?: Date;
  
  // Sistemas e Ativos Afetados
  affected_systems?: string[];
  affected_users_count?: number;
  business_impact?: string;
  financial_impact?: number;
  
  // Responsabilidade
  reported_by?: string;
  assigned_to?: string;
  incident_manager?: string;
  response_team?: string[];
  
  // Localização e Contexto
  location?: string;
  source_ip?: string;
  source_country?: string;
  attack_vector?: string;
  
  // Comunicação
  public_communication?: boolean;
  stakeholder_notification?: boolean;
  media_attention?: boolean;
  
  // Conformidade e Regulamentação
  regulatory_notification_required?: boolean;
  data_protection_authority_notified?: boolean;
  law_enforcement_notified?: boolean;
  
  // Evidências e Documentação
  evidence_collected?: string[];
  forensic_analysis_required?: boolean;
  
  // Recuperação e Lições Aprendidas
  recovery_actions?: string;
  lessons_learned?: string;
  preventive_measures?: string;
  
  // Controle de auditoria
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
  
  // Metadados adicionais
  tags?: string[];
  external_reference?: string;
  vendor_ticket_number?: string;
  
  // Métricas calculadas
  time_to_detection?: number; // minutos
  time_to_response?: number; // minutos
  time_to_containment?: number; // minutos
  time_to_resolution?: number; // minutos
}

// ============================================================================
// RESPOSTA E GESTÃO DO INCIDENTE
// ============================================================================
export interface IncidentResponse {
  id: string;
  incident_id: string;
  responder_id: string;
  response_date: Date;
  response_type: 'initial' | 'update' | 'escalation' | 'closure';
  
  // Ação realizada
  action_taken: string;
  next_steps?: string;
  estimated_resolution_time?: Date;
  
  // Status
  status_before: IncidentStatus;
  status_after: IncidentStatus;
  
  // Tempo gasto
  time_spent_minutes?: number;
  
  // Comunicação
  internal_notes?: string;
  external_communication?: string;
  
  created_at: Date;
}

export interface IncidentAssignment {
  id: string;
  incident_id: string;
  assigned_to: string;
  assigned_by: string;
  assignment_date: Date;
  role: 'incident_manager' | 'responder' | 'investigator' | 'communicator' | 'technical_lead';
  
  is_primary: boolean;
  is_active: boolean;
  
  skills_required?: string[];
  availability_hours?: string;
  
  accepted_date?: Date;
  completion_date?: Date;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// COMUNICAÇÃO E NOTIFICAÇÕES
// ============================================================================
export interface IncidentCommunication {
  id: string;
  incident_id: string;
  communication_type: 'internal' | 'external' | 'regulatory' | 'public' | 'stakeholder';
  
  // Destinatário
  recipient_type: 'team' | 'management' | 'customer' | 'regulator' | 'public' | 'vendor';
  recipients: string[];
  
  // Conteúdo
  subject: string;
  message: string;
  channel: 'email' | 'sms' | 'phone' | 'portal' | 'social_media' | 'press_release';
  
  // Status
  sent_date?: Date;
  delivery_status?: 'pending' | 'sent' | 'delivered' | 'failed';
  
  // Configuração
  is_automated: boolean;
  template_used?: string;
  
  sent_by: string;
  created_at: Date;
}

// ============================================================================
// EVIDÊNCIAS E FORENSE
// ============================================================================
export interface IncidentEvidence {
  id: string;
  incident_id: string;
  
  // Evidência
  evidence_type: 'log_file' | 'screenshot' | 'network_capture' | 'disk_image' | 'memory_dump' | 'document' | 'witness_statement';
  evidence_name: string;
  description?: string;
  
  // Arquivo
  file_path?: string;
  file_hash?: string;
  file_size?: number;
  
  // Chain of Custody
  collected_by: string;
  collection_date: Date;
  custody_chain: string[];
  
  // Classificação
  confidentiality_level: 'public' | 'internal' | 'confidential' | 'restricted';
  legal_hold: boolean;
  
  // Análise
  analysis_status: 'pending' | 'in_progress' | 'completed' | 'inconclusive';
  analysis_results?: string;
  analyzed_by?: string;
  analysis_date?: Date;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// ANÁLISE DE CAUSA RAIZ
// ============================================================================
export interface RootCauseAnalysis {
  id: string;
  incident_id: string;
  
  // Análise
  analysis_method: '5_whys' | 'fishbone' | 'fault_tree' | 'timeline' | 'other';
  root_cause: string;
  contributing_factors?: string[];
  
  // Timeline
  timeline_events?: {
    timestamp: Date;
    event: string;
    source: string;
  }[];
  
  // Impacto
  business_impact_analysis: string;
  technical_impact_analysis: string;
  
  // Recomendações
  corrective_actions: string[];
  preventive_actions: string[];
  process_improvements?: string[];
  
  // Responsabilidade
  conducted_by: string;
  reviewed_by?: string;
  approved_by?: string;
  
  // Datas
  analysis_start_date: Date;
  analysis_completion_date?: Date;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// RELATÓRIOS E MÉTRICAS
// ============================================================================
export interface IncidentMetrics {
  total_incidents: number;
  incidents_by_status: Record<IncidentStatus, number>;
  incidents_by_severity: Record<IncidentSeverity, number>;
  incidents_by_type: Record<IncidentType, number>;
  incidents_by_category: Record<IncidentCategory, number>;
  
  // Métricas de Tempo
  average_detection_time: number;
  average_response_time: number;
  average_containment_time: number;
  average_resolution_time: number;
  
  // Métricas de Performance
  sla_compliance_rate: number;
  escalated_incidents: number;
  reopened_incidents: number;
  
  // Tendências
  incidents_trend_7_days: number;
  incidents_trend_30_days: number;
  critical_incidents_month: number;
  
  // Impacto
  total_affected_users: number;
  total_financial_impact: number;
  business_downtime_hours: number;
}

// ============================================================================
// REQUESTS E FILTERS
// ============================================================================
export interface CreateIncidentRequest {
  title: string;
  description?: string;
  type: IncidentType;
  category: IncidentCategory;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  detection_date: Date;
  affected_systems?: string[];
  reported_by?: string;
  assigned_to?: string;
  business_impact?: string;
  urgency_level?: UrgencyLevel;
  impact_level?: ImpactLevel;
}

export interface UpdateIncidentRequest extends Partial<CreateIncidentRequest> {
  status?: IncidentStatus;
  response_start_date?: Date;
  containment_date?: Date;
  resolution_date?: Date;
  closure_date?: Date;
  recovery_actions?: string;
  lessons_learned?: string;
  preventive_measures?: string;
}

export interface IncidentFilters {
  search_term?: string;
  statuses?: IncidentStatus[];
  severities?: IncidentSeverity[];
  priorities?: IncidentPriority[];
  types?: IncidentType[];
  categories?: IncidentCategory[];
  assigned_users?: string[];
  detection_date_from?: Date;
  detection_date_to?: Date;
  show_resolved?: boolean;
  show_critical_only?: boolean;
  show_overdue?: boolean;
}

// ============================================================================
// CONSTANTES E CONFIGURAÇÕES
// ============================================================================
export const INCIDENT_TYPES: Record<IncidentType, string> = {
  'security_breach': 'Violação de Segurança - Acesso não autorizado a sistemas',
  'malware': 'Malware - Detecção de software malicioso',
  'phishing': 'Phishing - Tentativa de engenharia social',
  'data_breach': 'Vazamento de Dados - Exposição não autorizada de informações',
  'unauthorized_access': 'Acesso Não Autorizado - Tentativa de acesso indevido',
  'ddos_attack': 'Ataque DDoS - Negação de serviço distribuída',
  'social_engineering': 'Engenharia Social - Manipulação psicológica',
  'system_failure': 'Falha de Sistema - Interrupção não planejada',
  'network_incident': 'Incidente de Rede - Problemas de conectividade',
  'compliance_violation': 'Violação de Compliance - Não conformidade regulatória',
  'physical_security': 'Segurança Física - Incidentes físicos',
  'other': 'Outro - Tipo não especificado'
};

export const INCIDENT_CATEGORIES: Record<IncidentCategory, string> = {
  'Segurança da Informação': 'Incidentes relacionados à proteção de dados e sistemas',
  'Infraestrutura': 'Incidentes de infraestrutura de TI e redes',
  'Aplicações': 'Incidentes em aplicações e sistemas de software',
  'Dados e Privacidade': 'Incidentes envolvendo dados pessoais e privacidade',
  'Compliance': 'Incidentes de não conformidade regulatória',
  'Segurança Física': 'Incidentes de segurança patrimonial e física',
  'Recursos Humanos': 'Incidentes relacionados a pessoal e colaboradores',
  'Terceiros': 'Incidentes envolvendo fornecedores e parceiros',
  'Processo': 'Incidentes relacionados a processos de negócio',
  'Ambiental': 'Incidentes ambientais e de sustentabilidade'
};

export const INCIDENT_STATUSES: Record<IncidentStatus, string> = {
  'open': 'Aberto - Incidente reportado e aguardando análise',
  'investigating': 'Investigando - Em processo de análise e investigação',
  'contained': 'Contido - Ameaça contida, aguardando resolução completa',
  'resolved': 'Resolvido - Incidente solucionado tecnicamente',
  'closed': 'Fechado - Incidente totalmente finalizado',
  'cancelled': 'Cancelado - Incidente cancelado ou falso positivo',
  'escalated': 'Escalado - Escalado para nível superior'
};

export const INCIDENT_SEVERITIES: Record<IncidentSeverity, string> = {
  'low': 'Baixa - Impacto mínimo nas operações',
  'medium': 'Média - Impacto moderado nas operações',
  'high': 'Alta - Impacto significativo nas operações',
  'critical': 'Crítica - Impacto severo, requer ação imediata'
};

export const INCIDENT_PRIORITIES: Record<IncidentPriority, string> = {
  'low': 'Baixa - Pode ser tratado em horário normal',
  'medium': 'Média - Deve ser tratado em prazo razoável',
  'high': 'Alta - Requer atenção prioritária',
  'critical': 'Crítica - Requer ação imediata 24/7'
};

export const IMPACT_LEVELS: Record<ImpactLevel, string> = {
  'minimal': 'Mínimo - Poucos usuários afetados',
  'minor': 'Menor - Alguns usuários ou serviços afetados',
  'moderate': 'Moderado - Muitos usuários ou serviços importantes afetados',
  'major': 'Maior - Maioria dos usuários ou serviços críticos afetados',
  'severe': 'Severo - Todos os usuários ou negócio completamente impactado'
};

export const URGENCY_LEVELS: Record<UrgencyLevel, string> = {
  'low': 'Baixa - Pode aguardar próximo ciclo de trabalho',
  'medium': 'Média - Deve ser resolvido dentro de prazos normais',
  'high': 'Alta - Deve ser resolvido rapidamente',
  'critical': 'Crítica - Deve ser resolvido imediatamente'
};