// ============================================================================
// TIPOS PARA O MÓDULO DE PRIVACIDADE E LGPD
// ============================================================================
// Tipos TypeScript para todas as funcionalidades do módulo de privacidade

export type DataDiscoverySourceType = 
  | 'database'
  | 'file_system'
  | 'cloud_storage'
  | 'application'
  | 'api'
  | 'email_system'
  | 'crm'
  | 'erp'
  | 'hr_system'
  | 'other';

export type DataDiscoverySourceStatus = 
  | 'active'
  | 'inactive'
  | 'error'
  | 'scanning';

export type ScanFrequency = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'manual';

export interface DataDiscoverySource {
  id: string;
  name: string;
  description?: string;
  type: DataDiscoverySourceType;
  location: string;
  connection_string?: string;
  credentials_stored: boolean;
  last_scan_at?: string;
  status: DataDiscoverySourceStatus;
  scan_frequency: ScanFrequency;
  data_steward_id?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export type DataCategory = 
  | 'identificacao'
  | 'contato'
  | 'localizacao'
  | 'financeiro'
  | 'saude'
  | 'biometrico'
  | 'comportamental'
  | 'profissional'
  | 'educacional'
  | 'outros';

export type DataType = 
  | 'nome'
  | 'cpf'
  | 'rg'
  | 'email'
  | 'telefone'
  | 'endereco'
  | 'data_nascimento'
  | 'conta_bancaria'
  | 'cartao_credito'
  | 'biometria'
  | 'fotografia'
  | 'video'
  | 'historico_compras'
  | 'preferencias'
  | 'localizacao_gps'
  | 'outros';

export type SensitivityLevel = 'baixa' | 'media' | 'alta' | 'critica';

export type DiscoveryStatus = 'discovered' | 'validated' | 'classified' | 'ignored';

export interface DataDiscoveryResult {
  id: string;
  source_id: string;
  table_name?: string;
  field_name?: string;
  file_path?: string;
  data_category: DataCategory;
  data_type: DataType;
  sensitivity_level: SensitivityLevel;
  confidence_score: number;
  sample_data?: string;
  estimated_records: number;
  status: DiscoveryStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  discovered_at: string;
  created_at: string;
  updated_at: string;
}

export type DataOrigin = 
  | 'coleta_direta'
  | 'terceiros'
  | 'fontes_publicas'
  | 'cookies'
  | 'sistemas_internos'
  | 'parceiros'
  | 'fornecedores'
  | 'outros';

export type InventoryStatus = 'active' | 'archived' | 'deleted' | 'migrated';

export interface DataInventory {
  id: string;
  name: string;
  description: string;
  data_category: DataCategory;
  data_types: DataType[];
  system_name: string;
  database_name?: string;
  table_field_names?: string[];
  file_locations?: string[];
  estimated_volume: number;
  retention_period_months?: number;
  retention_justification?: string;
  sensitivity_level: SensitivityLevel;
  data_origin: DataOrigin;
  data_controller_id: string;
  data_processor_id?: string;
  data_steward_id: string;
  status: InventoryStatus;
  last_reviewed_at?: string;
  next_review_date?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export type LegalBasisType = 
  | 'consentimento'
  | 'contrato'
  | 'obrigacao_legal'
  | 'protecao_vida'
  | 'interesse_publico'
  | 'interesse_legitimo'
  | 'exercicio_direitos';

export type LegalBasisStatus = 'active' | 'suspended' | 'expired' | 'revoked';

export interface LegalBasis {
  id: string;
  name: string;
  description: string;
  legal_basis_type: LegalBasisType;
  legal_article: string;
  justification: string;
  applies_to_categories: string[];
  applies_to_processing: string[];
  valid_from: string;
  valid_until?: string;
  status: LegalBasisStatus;
  legal_responsible_id: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending';

export type CollectionMethod = 
  | 'website_form'
  | 'mobile_app'
  | 'phone_call'
  | 'email'
  | 'physical_form'
  | 'api'
  | 'import'
  | 'other';

export interface Consent {
  id: string;
  data_subject_email: string;
  data_subject_name?: string;
  data_subject_document?: string;
  purpose: string;
  data_categories: string[];
  legal_basis_id?: string;
  status: ConsentStatus;
  granted_at: string;
  revoked_at?: string;
  expired_at?: string;
  collection_method: CollectionMethod;
  collection_source?: string;
  evidence_url?: string;
  is_informed: boolean;
  is_specific: boolean;
  is_free: boolean;
  is_unambiguous: boolean;
  privacy_policy_version?: string;
  terms_of_service_version?: string;
  language: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export type ProcessingActivityStatus = 'active' | 'suspended' | 'terminated' | 'under_review';

export interface ProcessingActivity {
  id: string;
  name: string;
  description: string;
  purpose: string;
  data_categories: string[];
  data_types: string[];
  data_subjects_categories: string[];
  legal_basis_id: string;
  legal_basis_justification: string;
  data_controller_name: string;
  data_controller_contact: string;
  data_processor_name?: string;
  data_processor_contact?: string;
  data_sharing_third_parties?: string[];
  international_transfer: boolean;
  international_transfer_countries?: string[];
  international_transfer_safeguards?: string;
  retention_period_months: number;
  retention_criteria: string;
  deletion_procedure?: string;
  security_measures: string[];
  technical_measures?: string;
  organizational_measures?: string;
  data_protection_officer_id?: string;
  responsible_area: string;
  responsible_person_id: string;
  status: ProcessingActivityStatus;
  last_reviewed_at?: string;
  next_review_date: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export type DPIAStatus = 
  | 'draft'
  | 'in_progress'
  | 'pending_review'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'requires_anpd_consultation';

export type RiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high';

export interface DPIAAssessment {
  id: string;
  title: string;
  description: string;
  processing_activity_id?: string;
  involves_high_risk: boolean;
  involves_sensitive_data: boolean;
  involves_large_scale: boolean;
  involves_profiling: boolean;
  involves_automated_decisions: boolean;
  involves_vulnerable_individuals: boolean;
  involves_new_technology: boolean;
  dpia_required: boolean;
  dpia_justification: string;
  privacy_risks?: string[];
  risk_level?: RiskLevel;
  likelihood_assessment?: number;
  impact_assessment?: number;
  mitigation_measures?: string[];
  residual_risk_level?: RiskLevel;
  anpd_consultation_required: boolean;
  anpd_consultation_date?: string;
  anpd_response_date?: string;
  anpd_recommendation?: string;
  conducted_by: string;
  reviewed_by?: string;
  approved_by?: string;
  dpo_id?: string;
  status: DPIAStatus;
  started_at: string;
  completed_at?: string;
  approved_at?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export type DataSubjectRequestType = 
  | 'acesso'
  | 'correcao'
  | 'anonimizacao'
  | 'bloqueio'
  | 'eliminacao'
  | 'portabilidade'
  | 'informacao_uso_compartilhamento'
  | 'revogacao_consentimento'
  | 'oposicao'
  | 'revisao_decisoes_automatizadas';

export type DataSubjectRequestStatus = 
  | 'received'
  | 'under_verification'
  | 'verified'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'partially_completed'
  | 'escalated';

export type VerificationMethod = 
  | 'document_upload'
  | 'email_confirmation'
  | 'phone_verification'
  | 'video_call'
  | 'in_person'
  | 'digital_certificate';

export type ResponseMethod = 'email' | 'portal' | 'phone' | 'mail' | 'in_person';

export interface DataSubjectRequest {
  id: string;
  requester_name: string;
  requester_email: string;
  requester_document?: string;
  requester_phone?: string;
  request_type: DataSubjectRequestType;
  request_description?: string;
  specific_data_requested?: string;
  data_categories?: string[];
  identity_verified: boolean;
  verification_method?: VerificationMethod;
  verification_documents?: string[];
  verified_by?: string;
  verified_at?: string;
  status: DataSubjectRequestStatus;
  assigned_to?: string;
  due_date: string;
  response?: string;
  response_method?: ResponseMethod;
  response_attachments?: string[];
  responded_at?: string;
  responded_by?: string;
  internal_notes?: string;
  escalated: boolean;
  escalated_to?: string;
  escalated_at?: string;
  escalation_reason?: string;
  received_at: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export type PrivacyIncidentType = 
  | 'data_breach'
  | 'unauthorized_access'
  | 'data_loss'
  | 'data_theft'
  | 'system_compromise'
  | 'human_error'
  | 'malware'
  | 'phishing'
  | 'insider_threat'
  | 'third_party_breach'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';

export interface PrivacyIncident {
  id: string;
  title: string;
  description: string;
  incident_type: PrivacyIncidentType;
  severity_level: IncidentSeverity;
  affected_data_categories: string[];
  estimated_affected_individuals: number;
  discovered_at: string;
  discovered_by?: string;
  occurred_at?: string;
  contained_at?: string;
  root_cause?: string;
  incident_source?: string;
  impact_description?: string;
  financial_impact?: number;
  reputational_impact?: string;
  regulatory_impact_risk?: string;
  containment_measures?: string[];
  investigation_findings?: string;
  corrective_actions?: string[];
  internal_notification_sent: boolean;
  internal_notified_at?: string;
  anpd_notification_required: boolean;
  anpd_notified: boolean;
  anpd_notification_date?: string;
  anpd_response_received: boolean;
  anpd_response_date?: string;
  anpd_reference_number?: string;
  data_subjects_notification_required: boolean;
  data_subjects_notified: boolean;
  data_subjects_notification_date?: string;
  notification_method?: string;
  incident_manager_id: string;
  dpo_id?: string;
  legal_team_notified: boolean;
  status: IncidentStatus;
  closed_at?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// Interfaces para componentes UI
export interface PrivacyDashboardMetrics {
  data_inventory: {
    total_inventories: number;
    by_sensitivity: Record<SensitivityLevel, number>;
    needs_review: number;
  };
  consents: {
    total_active: number;
    total_revoked: number;
    expiring_soon: number;
  };
  data_subject_requests: {
    total_requests: number;
    pending_requests: number;
    overdue_requests: number;
    by_type: Record<DataSubjectRequestType, number>;
  };
  privacy_incidents: {
    total_incidents: number;
    open_incidents: number;
    anpd_notifications_required: number;
    by_severity: Record<IncidentSeverity, number>;
  };
  dpia_assessments: {
    total_dpias: number;
    pending_dpias: number;
    high_risk_dpias: number;
  };
  compliance_overview: {
    processing_activities: number;
    legal_bases: number;
    training_completion_rate: number;
  };
}

export interface PrivacyDashboardData {
  metrics: PrivacyDashboardMetrics;
  recent_incidents: Array<{
    id: string;
    title: string;
    severity_level: IncidentSeverity;
    status: IncidentStatus;
    discovered_at: string;
  }>;
  urgent_requests: Array<{
    id: string;
    requester_name: string;
    request_type: DataSubjectRequestType;
    status: DataSubjectRequestStatus;
    due_date: string;
    days_until_due: number;
  }>;
  expiring_consents: Array<{
    id: string;
    data_subject_email: string;
    purpose: string;
    expired_at?: string;
    days_until_expiry?: number;
  }>;
}

// Interfaces para forms e formulários
export interface DataDiscoverySourceForm {
  name: string;
  description: string;
  type: DataDiscoverySourceType;
  location: string;
  connection_string?: string;
  credentials_stored: boolean;
  scan_frequency: ScanFrequency;
  data_steward_id?: string;
}

export interface DataInventoryForm {
  name: string;
  description: string;
  data_category: DataCategory;
  data_types: DataType[];
  system_name: string;
  database_name?: string;
  table_field_names?: string[];
  file_locations?: string[];
  estimated_volume: number;
  retention_period_months?: number;
  retention_justification?: string;
  sensitivity_level: SensitivityLevel;
  data_origin: DataOrigin;
  data_controller_id: string;
  data_processor_id?: string;
  data_steward_id: string;
  next_review_date?: string;
}

export interface LegalBasisForm {
  name: string;
  description: string;
  legal_basis_type: LegalBasisType;
  legal_article: string;
  justification: string;
  applies_to_categories: string[];
  applies_to_processing: string[];
  valid_from: string;
  valid_until?: string;
  legal_responsible_id: string;
}

export interface ConsentForm {
  data_subject_email: string;
  data_subject_name?: string;
  data_subject_document?: string;
  purpose: string;
  data_categories: string[];
  legal_basis_id?: string;
  collection_method: CollectionMethod;
  collection_source?: string;
  evidence_url?: string;
  expired_at?: string;
  privacy_policy_version?: string;
  terms_of_service_version?: string;
}

export interface DataSubjectRequestForm {
  requester_name: string;
  requester_email: string;
  requester_document?: string;
  requester_phone?: string;
  request_type: DataSubjectRequestType;
  request_description?: string;
  specific_data_requested?: string;
  data_categories?: string[];
}

export interface PrivacyIncidentForm {
  title: string;
  description: string;
  incident_type: PrivacyIncidentType;
  severity_level: IncidentSeverity;
  affected_data_categories: string[];
  estimated_affected_individuals: number;
  discovered_at: string;
  occurred_at?: string;
  root_cause?: string;
  incident_source?: string;
  impact_description?: string;
  financial_impact?: number;
  incident_manager_id: string;
  dpo_id?: string;
}

export interface DPIAAssessmentForm {
  title: string;
  description: string;
  processing_activity_id?: string;
  involves_high_risk: boolean;
  involves_sensitive_data: boolean;
  involves_large_scale: boolean;
  involves_profiling: boolean;
  involves_automated_decisions: boolean;
  involves_vulnerable_individuals: boolean;
  involves_new_technology: boolean;
  dpia_justification: string;
  privacy_risks?: string[];
  likelihood_assessment?: number;
  impact_assessment?: number;
  mitigation_measures?: string[];
  conducted_by: string;
  reviewed_by?: string;
  dpo_id?: string;
}

// Tipos para filtros e ordenação
export interface PrivacyFilters {
  status?: string[];
  sensitivity_level?: SensitivityLevel[];
  data_category?: DataCategory[];
  assigned_to?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export type PrivacySortField = 
  | 'created_at'
  | 'updated_at'
  | 'name'
  | 'status'
  | 'sensitivity_level'
  | 'due_date'
  | 'discovered_at';

export type SortDirection = 'asc' | 'desc';

export interface PrivacySort {
  field: PrivacySortField;
  direction: SortDirection;
}

// Estados para componentes
export interface PrivacyComponentState {
  loading: boolean;
  error: string | null;
  filters: PrivacyFilters;
  sort: PrivacySort;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Enums para facilitar uso nos componentes
export const DATA_CATEGORIES: Record<DataCategory, string> = {
  identificacao: 'Identificação',
  contato: 'Contato',
  localizacao: 'Localização',
  financeiro: 'Financeiro',
  saude: 'Saúde',
  biometrico: 'Biométrico',
  comportamental: 'Comportamental',
  profissional: 'Profissional',
  educacional: 'Educacional',
  outros: 'Outros'
};

export const SENSITIVITY_LEVELS: Record<SensitivityLevel, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica'
};

export const REQUEST_TYPES: Record<DataSubjectRequestType, string> = {
  acesso: 'Acesso aos Dados',
  correcao: 'Correção de Dados',
  anonimizacao: 'Anonimização',
  bloqueio: 'Bloqueio',
  eliminacao: 'Eliminação',
  portabilidade: 'Portabilidade',
  informacao_uso_compartilhamento: 'Informação sobre Uso/Compartilhamento',
  revogacao_consentimento: 'Revogação de Consentimento',
  oposicao: 'Oposição',
  revisao_decisoes_automatizadas: 'Revisão de Decisões Automatizadas'
};

export const INCIDENT_TYPES: Record<PrivacyIncidentType, string> = {
  data_breach: 'Vazamento de Dados',
  unauthorized_access: 'Acesso Não Autorizado',
  data_loss: 'Perda de Dados',
  data_theft: 'Roubo de Dados',
  system_compromise: 'Comprometimento de Sistema',
  human_error: 'Erro Humano',
  malware: 'Malware',
  phishing: 'Phishing',
  insider_threat: 'Ameaça Interna',
  third_party_breach: 'Violação de Terceiros',
  other: 'Outro'
};

export const LEGAL_BASIS_TYPES: Record<LegalBasisType, string> = {
  consentimento: 'Consentimento',
  contrato: 'Execução de Contrato',
  obrigacao_legal: 'Obrigação Legal',
  protecao_vida: 'Proteção da Vida',
  interesse_publico: 'Interesse Público',
  interesse_legitimo: 'Interesse Legítimo',
  exercicio_direitos: 'Exercício de Direitos'
};