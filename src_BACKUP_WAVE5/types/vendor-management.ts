// ============================================================================
// TIPOS PARA GESTÃO DE FORNECEDORES (VENDOR RISK MANAGEMENT)
// ============================================================================
// Tipos robustos para gestão de riscos de fornecedores baseados em melhores práticas de GRC

export type VendorStatus = 
  | 'Active' | 'Inactive' | 'Suspended' | 'Under Review' | 'Approved' 
  | 'Rejected' | 'Pending Approval' | 'Terminated' | 'Blacklisted';

export type VendorRiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Minimal';

export type VendorCategory = 
  | 'Critical Vendor' | 'Strategic Partner' | 'Preferred Vendor' | 'Standard Vendor'
  | 'Sole Source' | 'Temporary Vendor' | 'Emergency Vendor';

export type VendorType = 
  | 'Technology Provider' | 'Professional Services' | 'Manufacturing' | 'Logistics'
  | 'Financial Services' | 'Healthcare Provider' | 'Outsourcing Provider'
  | 'Cloud Service Provider' | 'Data Processor' | 'Consultant' | 'Contractor';

export type AssessmentStatus = 
  | 'Not Started' | 'In Progress' | 'Completed' | 'Under Review' | 'Approved'
  | 'Requires Remediation' | 'Failed' | 'Expired' | 'Overdue';

export type RiskCategory = 
  | 'Operational Risk' | 'Financial Risk' | 'Security Risk' | 'Compliance Risk'
  | 'Reputation Risk' | 'Strategic Risk' | 'Legal Risk' | 'Privacy Risk'
  | 'Business Continuity Risk' | 'Performance Risk' | 'Concentration Risk';

export type AssessmentType = 
  | 'Initial Due Diligence' | 'Periodic Review' | 'Risk Assessment' | 'Security Assessment'
  | 'Compliance Assessment' | 'Financial Assessment' | 'Performance Review'
  | 'Business Continuity Assessment' | 'Privacy Assessment' | 'Incident Review';

export type ContractStatus = 
  | 'Draft' | 'Under Negotiation' | 'Pending Approval' | 'Active' | 'Expired'
  | 'Terminated' | 'Suspended' | 'Renewed' | 'Under Review';

export type MonitoringFrequency = 
  | 'Continuous' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Ad-hoc';

export type IssueStatus = 
  | 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Escalated' | 'Overdue' | 'Accepted Risk';

export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type PerformanceRating = 'Excellent' | 'Good' | 'Satisfactory' | 'Needs Improvement' | 'Unsatisfactory';

// ============================================================================
// INTERFACE PRINCIPAL - VENDOR
// ============================================================================
export interface Vendor {
  id: string;
  
  // Informações Básicas
  name: string;
  legal_name: string;
  duns_number?: string;
  tax_id: string;
  registration_number?: string;
  
  // Classificação
  vendor_type: VendorType;
  vendor_category: VendorCategory;
  status: VendorStatus;
  
  // Avaliação de Risco
  overall_risk_level: VendorRiskLevel;
  risk_score?: number; // 0-100
  last_risk_assessment_date?: Date;
  next_risk_assessment_due?: Date;
  
  // Informações de Contato
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone?: string;
  secondary_contact_name?: string;
  secondary_contact_email?: string;
  
  // Endereço
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  
  // Informações Financeiras
  annual_revenue?: number;
  employee_count?: number;
  years_in_business?: number;
  credit_rating?: string;
  financial_health_score?: number; // 1-10
  
  // Relacionamento
  relationship_manager: string;
  onboarding_date: Date;
  contract_start_date?: Date;
  contract_end_date?: Date;
  contract_value?: number;
  annual_spend?: number;
  
  // Criticidade
  business_criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  data_access_level: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  service_level_requirements: string[];
  
  // Compliance e Certificações
  certifications: VendorCertification[];
  compliance_requirements: string[];
  regulatory_requirements: string[];
  
  // Assessments e Monitoramento
  assessments?: VendorAssessment[];
  monitoring_frequency: MonitoringFrequency;
  last_performance_review?: Date;
  performance_rating?: PerformanceRating;
  
  // Documentação
  contracts?: VendorContract[];
  policies_acknowledged?: string[];
  insurance_coverage?: InsuranceCoverage[];
  
  // Questões e Riscos
  open_issues?: VendorIssue[];
  identified_risks?: VendorRisk[];
  
  // Contingência
  backup_vendors?: string[];
  exit_strategy?: string;
  termination_notice_period?: number; // days
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
  version: string;
  
  // Status de Aprovação
  approved_by?: string;
  approved_at?: Date;
  approval_notes?: string;
  
  // Configurações
  auto_renewal: boolean;
  renewal_notice_period?: number; // days
  escalation_contacts?: string[];
  
  // KPIs e Métricas
  sla_compliance?: number; // percentage
  incident_count?: number;
  availability_percentage?: number;
  response_time_avg?: number; // hours
  
  // Tags e Categorização
  tags?: string[];
  business_units?: string[];
  geographic_regions?: string[];
  
  // Informações Adicionais
  website?: string;
  industry_sector?: string;
  parent_company?: string;
  subsidiaries?: string[];
  notes?: string;
}

// ============================================================================
// AVALIAÇÕES DE FORNECEDORES
// ============================================================================
export interface VendorAssessment {
  id: string;
  vendor_id: string;
  
  // Informações Básicas
  title: string;
  description?: string;
  assessment_type: AssessmentType;
  
  // Status e Cronograma
  status: AssessmentStatus;
  planned_start_date: Date;
  planned_completion_date: Date;
  actual_start_date?: Date;
  actual_completion_date?: Date;
  
  // Equipe
  lead_assessor: string;
  assessors: string[];
  vendor_contacts: string[];
  
  // Escopo
  scope_description: string;
  assessment_areas: string[];
  excluded_areas?: string[];
  
  // Metodologia
  assessment_framework?: string;
  assessment_criteria: string[];
  scoring_methodology?: string;
  
  // Resultados
  overall_score?: number; // 0-100
  risk_level?: VendorRiskLevel;
  findings?: AssessmentFinding[];
  recommendations?: string[];
  
  // Aprovação
  reviewed_by?: string;
  reviewed_at?: Date;
  approved_by?: string;
  approved_at?: Date;
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: Date;
  follow_up_responsible?: string;
  
  // Relatório
  executive_summary?: string;
  detailed_findings?: string;
  risk_mitigation_plan?: string;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
  
  // Questionnaires e Checklists
  questionnaire_responses?: QuestionnaireResponse[];
  checklist_items?: ChecklistItem[];
  
  // Documentos
  supporting_documents?: string[];
  assessment_report?: string;
  
  // Validade
  valid_until?: Date;
  next_assessment_due?: Date;
}

// ============================================================================
// ACHADOS DE ASSESSMENT
// ============================================================================
export interface AssessmentFinding {
  id: string;
  assessment_id: string;
  vendor_id: string;
  
  // Informações do Achado
  title: string;
  description: string;
  finding_category: RiskCategory;
  severity: IssueSeverity;
  
  // Detalhes
  current_state: string;
  expected_state: string;
  gap_analysis: string;
  business_impact: string;
  
  // Evidência
  evidence: string[];
  supporting_documents?: string[];
  screenshots?: string[];
  
  // Remediação
  remediation_plan?: string;
  remediation_owner?: string;
  remediation_due_date?: Date;
  estimated_remediation_cost?: number;
  
  // Status
  status: IssueStatus;
  
  // Rastreamento
  identified_by: string;
  identified_at: Date;
  last_updated_by: string;
  last_updated_at: Date;
  
  // Fechamento
  closure_evidence?: string;
  verified_by?: string;
  verified_at?: Date;
}

// ============================================================================
// RISCOS DE FORNECEDORES
// ============================================================================
export interface VendorRisk {
  id: string;
  vendor_id: string;
  
  // Informações do Risco
  title: string;
  description: string;
  risk_category: RiskCategory;
  
  // Avaliação
  likelihood: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
  impact: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
  risk_level: VendorRiskLevel;
  risk_score: number; // calculated from likelihood x impact
  
  // Contexto
  risk_source: string;
  risk_triggers: string[];
  potential_consequences: string[];
  
  // Controles
  existing_controls: string[];
  control_effectiveness: 'Effective' | 'Partially Effective' | 'Ineffective' | 'Not Assessed';
  residual_risk_level: VendorRiskLevel;
  
  // Tratamento
  risk_treatment_strategy: 'Accept' | 'Mitigate' | 'Transfer' | 'Avoid';
  mitigation_actions?: VendorRiskAction[];
  target_risk_level?: VendorRiskLevel;
  
  // Status
  status: 'Open' | 'In Treatment' | 'Monitored' | 'Closed' | 'Accepted';
  
  // Responsabilidade
  risk_owner: string;
  action_owner?: string;
  
  // Datas
  identified_date: Date;
  last_review_date?: Date;
  next_review_date?: Date;
  target_closure_date?: Date;
  
  // Monitoramento
  key_risk_indicators?: KeyRiskIndicator[];
  monitoring_frequency: MonitoringFrequency;
  escalation_threshold?: number;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
  
  // Relacionamentos
  related_incidents?: string[];
  related_assessments?: string[];
  related_contracts?: string[];
}

// ============================================================================
// AÇÕES DE MITIGAÇÃO DE RISCOS
// ============================================================================
export interface VendorRiskAction {
  id: string;
  risk_id: string;
  
  // Informações da Ação
  title: string;
  description: string;
  action_type: 'Preventive' | 'Detective' | 'Corrective' | 'Compensating';
  
  // Implementação
  responsible_party: string;
  target_completion_date: Date;
  actual_completion_date?: Date;
  estimated_cost?: number;
  actual_cost?: number;
  
  // Status
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  progress_percentage: number;
  
  // Eficácia
  effectiveness_rating?: 'High' | 'Medium' | 'Low' | 'Not Assessed';
  validation_method?: string;
  validation_date?: Date;
  validated_by?: string;
  
  // Acompanhamento
  progress_notes?: string;
  milestones?: ActionMilestone[];
  dependencies?: string[];
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
}

// ============================================================================
// MARCOS DE AÇÃO
// ============================================================================
export interface ActionMilestone {
  id: string;
  action_id: string;
  
  title: string;
  description?: string;
  target_date: Date;
  actual_date?: Date;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  completion_criteria: string;
  responsible_party: string;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// INDICADORES CHAVE DE RISCO
// ============================================================================
export interface KeyRiskIndicator {
  id: string;
  risk_id: string;
  
  name: string;
  description: string;
  measurement_unit: string;
  data_source: string;
  
  // Thresholds
  green_threshold: number;
  yellow_threshold: number;
  red_threshold: number;
  
  // Valores Atuais
  current_value?: number;
  previous_value?: number;
  trend: 'Improving' | 'Stable' | 'Deteriorating' | 'Unknown';
  
  // Configurações
  measurement_frequency: MonitoringFrequency;
  responsible_party: string;
  
  // Histórico
  last_measured_date?: Date;
  next_measurement_date?: Date;
  measurement_history?: KRIMeasurement[];
  
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
}

// ============================================================================
// MEDIÇÕES DE KRI
// ============================================================================
export interface KRIMeasurement {
  id: string;
  kri_id: string;
  
  measurement_date: Date;
  value: number;
  status: 'Green' | 'Yellow' | 'Red';
  notes?: string;
  data_source_reference?: string;
  
  measured_by: string;
  created_at: Date;
}

// ============================================================================
// QUESTÕES DE FORNECEDORES
// ============================================================================
export interface VendorIssue {
  id: string;
  vendor_id: string;
  
  // Informações da Questão
  title: string;
  description: string;
  issue_category: RiskCategory;
  severity: IssueSeverity;
  
  // Classificação
  issue_type: 'Performance' | 'Compliance' | 'Security' | 'Financial' | 'Legal' | 'Operational' | 'Other';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  
  // Status e Prazos
  status: IssueStatus;
  reported_date: Date;
  acknowledged_date?: Date;
  target_resolution_date?: Date;
  actual_resolution_date?: Date;
  
  // Responsabilidades
  reported_by: string;
  assigned_to: string;
  vendor_contact?: string;
  
  // Detalhes
  root_cause_analysis?: string;
  business_impact_description: string;
  financial_impact?: number;
  
  // Resolução
  resolution_plan?: string;
  resolution_actions: IssueAction[];
  lessons_learned?: string;
  
  // Comunicação
  escalated: boolean;
  escalation_date?: Date;
  escalated_to?: string;
  
  // SLA
  response_time_hours?: number;
  resolution_time_hours?: number;
  sla_met: boolean;
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: Date;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
  
  // Anexos
  attachments?: string[];
  related_incidents?: string[];
  related_assessments?: string[];
}

// ============================================================================
// AÇÕES DE QUESTÕES
// ============================================================================
export interface IssueAction {
  id: string;
  issue_id: string;
  
  description: string;
  responsible_party: string;
  due_date: Date;
  completion_date?: Date;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// CONTRATOS DE FORNECEDORES
// ============================================================================
export interface VendorContract {
  id: string;
  vendor_id: string;
  
  // Informações Básicas
  contract_name: string;
  contract_number: string;
  contract_type: 'Master Service Agreement' | 'Statement of Work' | 'Purchase Order' | 'Framework Agreement' | 'Other';
  
  // Status e Datas
  status: ContractStatus;
  effective_date: Date;
  expiration_date?: Date;
  termination_date?: Date;
  
  // Valores
  contract_value: number;
  currency: string;
  payment_terms: string;
  billing_frequency: 'One-time' | 'Monthly' | 'Quarterly' | 'Annually' | 'Other';
  
  // Partes
  client_signatory: string;
  vendor_signatory: string;
  
  // Términos Chave
  service_level_agreements: ServiceLevelAgreement[];
  key_performance_indicators: ContractKPI[];
  termination_clauses: string[];
  liability_limits?: number;
  
  // Renovação
  auto_renewal: boolean;
  renewal_terms?: string;
  renewal_notice_period?: number; // days
  
  // Compliance
  regulatory_requirements: string[];
  data_protection_clauses: string[];
  audit_rights: string[];
  
  // Documentos
  contract_document_url?: string;
  amendments?: ContractAmendment[];
  related_documents?: string[];
  
  // Monitoramento
  next_review_date?: Date;
  renewal_reminder_date?: Date;
  
  // Metadados
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
}

// ============================================================================
// SLA DE CONTRATOS
// ============================================================================
export interface ServiceLevelAgreement {
  id: string;
  contract_id: string;
  
  service_name: string;
  description: string;
  
  // Métricas
  metric_name: string;
  target_value: number;
  measurement_unit: string;
  measurement_method: string;
  
  // Penalidades
  penalty_threshold?: number;
  penalty_amount?: number;
  penalty_cap?: number;
  
  // Monitoramento
  monitoring_frequency: MonitoringFrequency;
  reporting_requirements: string;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// KPIs DE CONTRATOS
// ============================================================================
export interface ContractKPI {
  id: string;
  contract_id: string;
  
  kpi_name: string;
  description: string;
  target_value: number;
  current_value?: number;
  
  measurement_frequency: MonitoringFrequency;
  data_source: string;
  responsible_party: string;
  
  last_measured_date?: Date;
  next_measurement_date?: Date;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// ALTERAÇÕES DE CONTRATOS
// ============================================================================
export interface ContractAmendment {
  id: string;
  contract_id: string;
  
  amendment_number: string;
  description: string;
  effective_date: Date;
  
  changes_description: string;
  financial_impact?: number;
  
  approved_by: string;
  approved_at: Date;
  
  document_url?: string;
  
  created_by: string;
  created_at: Date;
}

// ============================================================================
// CERTIFICAÇÕES DE FORNECEDORES
// ============================================================================
export interface VendorCertification {
  id: string;
  vendor_id: string;
  
  certification_name: string;
  certification_body: string;
  certificate_number?: string;
  
  issued_date: Date;
  expiration_date?: Date;
  
  scope: string;
  status: 'Valid' | 'Expired' | 'Suspended' | 'Under Review';
  
  document_url?: string;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// COBERTURA DE SEGURO
// ============================================================================
export interface InsuranceCoverage {
  id: string;
  vendor_id: string;
  
  insurance_type: 'General Liability' | 'Professional Liability' | 'Cyber Liability' | 'Errors & Omissions' | 'Other';
  coverage_amount: number;
  currency: string;
  
  policy_number: string;
  insurance_carrier: string;
  
  effective_date: Date;
  expiration_date: Date;
  
  certificate_url?: string;
  
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// RESPOSTAS DE QUESTIONÁRIOS
// ============================================================================
export interface QuestionnaireResponse {
  id: string;
  assessment_id: string;
  
  question_id: string;
  question_text: string;
  question_category: string;
  
  response_type: 'Multiple Choice' | 'Yes/No' | 'Text' | 'Numeric' | 'File Upload';
  response_value: string;
  score?: number;
  weight?: number;
  
  evidence_provided?: string[];
  comments?: string;
  
  responded_by: string;
  responded_at: Date;
}

// ============================================================================
// ITENS DE CHECKLIST
// ============================================================================
export interface ChecklistItem {
  id: string;
  assessment_id: string;
  
  item_text: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  
  status: 'Not Started' | 'In Progress' | 'Compliant' | 'Non-Compliant' | 'Not Applicable';
  evidence_required: boolean;
  evidence_provided?: string[];
  
  comments?: string;
  assessed_by: string;
  assessed_at?: Date;
}

// ============================================================================
// MÉTRICAS E KPIs
// ============================================================================
export interface VendorMetrics {
  total_vendors: number;
  vendors_by_status: Record<VendorStatus, number>;
  vendors_by_risk_level: Record<VendorRiskLevel, number>;
  vendors_by_category: Record<VendorCategory, number>;
  
  // Assessments
  assessments_completed: number;
  assessments_overdue: number;
  average_assessment_score: number;
  
  // Issues
  open_issues: number;
  critical_issues: number;
  overdue_issues: number;
  average_resolution_time: number; // hours
  
  // Performance
  sla_compliance_rate: number;
  contract_renewal_rate: number;
  vendor_satisfaction_score: number;
  
  // Financial
  total_vendor_spend: number;
  cost_savings_achieved: number;
  
  // Risk
  high_risk_vendors: number;
  risks_mitigated: number;
  average_risk_score: number;
  
  // Compliance
  certification_expiry_alerts: number;
  compliance_violations: number;
  audit_findings_open: number;
  
  // Trends
  vendor_count_trend: 'Increasing' | 'Decreasing' | 'Stable';
  risk_trend: 'Improving' | 'Deteriorating' | 'Stable';
  performance_trend: 'Improving' | 'Deteriorating' | 'Stable';
}

// ============================================================================
// COMUNICAÇÃO DE FORNECEDORES
// ============================================================================
export interface VendorCommunication {
  id: string;
  vendor_id: string;
  
  // Tipo de Comunicação
  type: 'Onboarding' | 'Assessment Request' | 'Issue Notification' | 'Performance Review' 
    | 'Contract Renewal' | 'Termination Notice' | 'General Communication' | 'Escalation';
  
  // Destinatários
  recipients: Array<{
    name: string;
    email: string;
    role: string;
    organization: 'Internal' | 'Vendor';
  }>;
  
  // Conteúdo
  subject: string;
  message: string;
  attachments?: string[];
  
  // Status
  status: 'Draft' | 'Sent' | 'Delivered' | 'Read' | 'Responded';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  
  // Datas
  scheduled_date?: Date;
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
  response_received_at?: Date;
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_date?: Date;
  follow_up_notes?: string;
  
  // Metadados
  created_by: string;
  created_at: Date;
  template_used?: string;
  
  // Relacionamentos
  related_assessment?: string;
  related_issue?: string;
  related_contract?: string;
  related_risk?: string;
}

// ============================================================================
// REQUESTS PARA APIs
// ============================================================================
export interface CreateVendorRequest {
  name: string;
  legal_name: string;
  tax_id: string;
  vendor_type: VendorType;
  vendor_category: VendorCategory;
  primary_contact_name: string;
  primary_contact_email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  relationship_manager: string;
  business_criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  data_access_level: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  monitoring_frequency: MonitoringFrequency;
  onboarding_date: Date;
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {
  status?: VendorStatus;
  overall_risk_level?: VendorRiskLevel;
  risk_score?: number;
  performance_rating?: PerformanceRating;
  contract_start_date?: Date;
  contract_end_date?: Date;
  contract_value?: number;
}

export interface CreateAssessmentRequest {
  vendor_id: string;
  title: string;
  assessment_type: AssessmentType;
  planned_start_date: Date;
  planned_completion_date: Date;
  lead_assessor: string;
  assessors: string[];
  scope_description: string;
  assessment_areas: string[];
}

export interface CreateRiskRequest {
  vendor_id: string;
  title: string;
  description: string;
  risk_category: RiskCategory;
  likelihood: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
  impact: 'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low';
  risk_owner: string;
  risk_treatment_strategy: 'Accept' | 'Mitigate' | 'Transfer' | 'Avoid';
  monitoring_frequency: MonitoringFrequency;
}

export interface CreateIssueRequest {
  vendor_id: string;
  title: string;
  description: string;
  issue_category: RiskCategory;
  severity: IssueSeverity;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  assigned_to: string;
  target_resolution_date?: Date;
}

// ============================================================================
// FILTROS E PESQUISA
// ============================================================================
export interface VendorFilters {
  searchTerm?: string;
  vendor_types?: VendorType[];
  statuses?: VendorStatus[];
  risk_levels?: VendorRiskLevel[];
  categories?: VendorCategory[];
  business_criticalities?: ('Critical' | 'High' | 'Medium' | 'Low')[];
  relationship_managers?: string[];
  contract_start_from?: Date;
  contract_start_to?: Date;
  contract_end_from?: Date;
  contract_end_to?: Date;
  show_contracts_expiring_soon?: boolean;
  show_high_risk_only?: boolean;
  show_overdue_assessments?: boolean;
  tags?: string[];
  business_units?: string[];
}

export interface AssessmentFilters {
  searchTerm?: string;
  vendor_ids?: string[];
  assessment_types?: AssessmentType[];
  statuses?: AssessmentStatus[];
  risk_levels?: VendorRiskLevel[];
  lead_assessors?: string[];
  planned_date_from?: Date;
  planned_date_to?: Date;
  show_overdue?: boolean;
  show_expiring_soon?: boolean;
}

// ============================================================================
// CONSTANTES E ENUMS
// ============================================================================
export const VENDOR_STATUSES: VendorStatus[] = [
  'Active', 'Inactive', 'Suspended', 'Under Review', 'Approved',
  'Rejected', 'Pending Approval', 'Terminated', 'Blacklisted'
];

export const VENDOR_RISK_LEVELS: VendorRiskLevel[] = [
  'Critical', 'High', 'Medium', 'Low', 'Minimal'
];

export const VENDOR_CATEGORIES: VendorCategory[] = [
  'Critical Vendor', 'Strategic Partner', 'Preferred Vendor', 'Standard Vendor',
  'Sole Source', 'Temporary Vendor', 'Emergency Vendor'
];

export const VENDOR_TYPES: VendorType[] = [
  'Technology Provider', 'Professional Services', 'Manufacturing', 'Logistics',
  'Financial Services', 'Healthcare Provider', 'Outsourcing Provider',
  'Cloud Service Provider', 'Data Processor', 'Consultant', 'Contractor'
];

export const RISK_CATEGORIES: RiskCategory[] = [
  'Operational Risk', 'Financial Risk', 'Security Risk', 'Compliance Risk',
  'Reputation Risk', 'Strategic Risk', 'Legal Risk', 'Privacy Risk',
  'Business Continuity Risk', 'Performance Risk', 'Concentration Risk'
];

export const ASSESSMENT_TYPES: AssessmentType[] = [
  'Initial Due Diligence', 'Periodic Review', 'Risk Assessment', 'Security Assessment',
  'Compliance Assessment', 'Financial Assessment', 'Performance Review',
  'Business Continuity Assessment', 'Privacy Assessment', 'Incident Review'
];

export const ISSUE_SEVERITIES: IssueSeverity[] = [
  'Critical', 'High', 'Medium', 'Low', 'Informational'
];

export const MONITORING_FREQUENCIES: MonitoringFrequency[] = [
  'Continuous', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'Ad-hoc'
];

// ============================================================================
// HELPERS E UTILITIES
// ============================================================================
export const getVendorStatusColor = (status: VendorStatus): string => {
  const colorMap: Record<VendorStatus, string> = {
    'Active': 'bg-green-100 text-green-800 border-green-200',
    'Inactive': 'bg-gray-100 text-gray-800 border-gray-200',
    'Suspended': 'bg-red-100 text-red-800 border-red-200',
    'Under Review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Approved': 'bg-blue-100 text-blue-800 border-blue-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Pending Approval': 'bg-orange-100 text-orange-800 border-orange-200',
    'Terminated': 'bg-gray-100 text-gray-800 border-gray-200',
    'Blacklisted': 'bg-black text-white border-black'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getRiskLevelColor = (riskLevel: VendorRiskLevel): string => {
  const colorMap: Record<VendorRiskLevel, string> = {
    'Critical': 'text-red-600',
    'High': 'text-orange-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-blue-600',
    'Minimal': 'text-green-600'
  };
  return colorMap[riskLevel] || 'text-gray-600';
};

export const getIssueSeverityColor = (severity: IssueSeverity): string => {
  const colorMap: Record<IssueSeverity, string> = {
    'Critical': 'text-red-600',
    'High': 'text-orange-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-blue-600',
    'Informational': 'text-gray-600'
  };
  return colorMap[severity] || 'text-gray-600';
};

export const calculateRiskScore = (likelihood: string, impact: string): number => {
  const likelihoods: Record<string, number> = {
    'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5
  };
  const impacts: Record<string, number> = {
    'Very Low': 1, 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5
  };
  
  return (likelihoods[likelihood] || 3) * (impacts[impact] || 3);
};

export const getRiskLevelFromScore = (score: number): VendorRiskLevel => {
  if (score >= 20) return 'Critical';
  if (score >= 15) return 'High';
  if (score >= 9) return 'Medium';
  if (score >= 4) return 'Low';
  return 'Minimal';
};

export const isContractExpiringSoon = (contract: VendorContract, daysThreshold = 90): boolean => {
  if (!contract.expiration_date) return false;
  const today = new Date();
  const expirationDate = new Date(contract.expiration_date);
  const daysDiff = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff <= daysThreshold && daysDiff > 0;
};

export const calculateVendorPerformanceScore = (vendor: Vendor): number => {
  let score = 100;
  
  // Deduct points for issues
  if (vendor.open_issues && vendor.open_issues.length > 0) {
    score -= vendor.open_issues.length * 5;
  }
  
  // Deduct points for overdue assessments
  if (vendor.next_risk_assessment_due && new Date(vendor.next_risk_assessment_due) < new Date()) {
    score -= 10;
  }
  
  // Add points for good SLA compliance
  if (vendor.sla_compliance && vendor.sla_compliance > 95) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
};

export const getNextAssessmentDue = (vendor: Vendor): Date | null => {
  if (vendor.next_risk_assessment_due) {
    return new Date(vendor.next_risk_assessment_due);
  }
  
  if (vendor.last_risk_assessment_date) {
    const lastAssessment = new Date(vendor.last_risk_assessment_date);
    const monthsToAdd = vendor.monitoring_frequency === 'Monthly' ? 1 :
                      vendor.monitoring_frequency === 'Quarterly' ? 3 :
                      vendor.monitoring_frequency === 'Semi-Annual' ? 6 : 12;
    
    lastAssessment.setMonth(lastAssessment.getMonth() + monthsToAdd);
    return lastAssessment;
  }
  
  return null;
};

export const getVendorCriticalityWeight = (criticality: string): number => {
  const weights: Record<string, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };
  return weights[criticality] || 2;
};