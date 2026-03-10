// ============================================================================
// TIPOS PARA COMPLIANCE PROCESS TEMPLATES CUSTOMIZÁVEIS
// ============================================================================
// Tipos robustos para sistema de templates personalizáveis por tenant
// com máxima segurança e flexibilidade

import { ComplianceFramework, CompliancePriority, ComplianceStatus } from './compliance-management';

// ============================================================================
// TIPOS BASE PARA CAMPOS CUSTOMIZADOS
// ============================================================================

export type CustomFieldType = 
  // Tipos básicos
  | 'text' | 'textarea' | 'number' | 'boolean' | 'date' | 'datetime' | 'email' | 'password' | 'url'
  // Tipos de seleção
  | 'select' | 'multiselect' | 'radio' | 'checkbox'
  // Tipos específicos para compliance
  | 'compliance_status' | 'maturity_rating' | 'evidence_upload' | 'risk_rating'
  | 'control_test' | 'risk_matrix' | 'framework_mapping'
  // Tipos avançados
  | 'file' | 'signature' | 'approval_workflow' | 'audit_trail'
  // Tipos de interface
  | 'section_header' | 'divider' | 'info_display' | 'calculated_field';

export type ValidationRuleType = 
  | 'required' | 'min_length' | 'max_length' | 'min_value' | 'max_value' | 'pattern' | 'range' 
  | 'email' | 'url' | 'custom' | 'unique' | 'conditional';

export interface ValidationRule {
  type: ValidationRuleType;
  value: any;
  message?: string;
}

export type FieldVisibilityCondition = {
  depends_on: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
  logic?: 'AND' | 'OR'; // Para múltiplas condições
};

// ============================================================================
// INTERFACE PARA DEFINIÇÃO DE CAMPO CUSTOMIZADO
// ============================================================================

export interface CustomFieldDefinition {
  // Identificação
  id: string;
  name: string; // Nome técnico (snake_case, sem espaços)
  label: string; // Label amigável para o usuário
  description?: string;
  
  // Tipo e comportamento
  type: CustomFieldType;
  required: boolean;
  readonly?: boolean;
  sensitive?: boolean; // Para campos que devem ser criptografados
  
  // Validações
  validations?: ValidationRule[];
  
  // Opções (para selects, radios, etc.)
  options?: FieldOption[];
  
  // Configurações específicas por tipo
  config?: FieldTypeConfig;
  
  // Layout e apresentação
  ui?: FieldUIConfig;
  
  // Visibilidade condicional
  visibility_conditions?: FieldVisibilityCondition[];
  
  // Automação
  auto_populate?: AutoPopulateConfig;
  
  // Auditoria e compliance
  audit_trail: boolean;
  compliance_mapping?: ComplianceMapping[];
  
  // Metadados
  help_text?: string;
  placeholder?: string;
  default_value?: any;
  weight?: number; // Para scoring
  order?: number; // Para ordenação na UI
}

export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
  custom_function?: string; // Para validações customizadas
}

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

export interface FieldTypeConfig {
  // Text/Textarea
  min_length?: number;
  max_length?: number;
  multiline?: boolean;
  
  // Number
  min_value?: number;
  max_value?: number;
  decimal_places?: number;
  step?: number;
  
  // File Upload
  accepted_types?: string[];
  max_file_size?: number;
  max_files?: number;
  
  // Compliance Status
  status_options?: ComplianceStatus[];
  
  // Maturity Rating
  scale_min?: number;
  scale_max?: number;
  scale_labels?: Record<number, string>;
  
  // Risk Matrix
  impact_levels?: string[];
  probability_levels?: string[];
  
  // Evidence Upload
  evidence_types?: string[];
  auto_validation?: boolean;
  
  // Framework Mapping
  source_framework?: ComplianceFramework;
  target_frameworks?: ComplianceFramework[];
  
  // Approval Workflow
  approval_steps?: ApprovalStep[];
  
  // Calculated Field
  calculation_formula?: string;
  depends_on_fields?: string[];
}

export interface FieldUIConfig {
  // Layout
  width?: 'full' | 'half' | 'third' | 'quarter' | 'auto';
  column_span?: number;
  
  // Styling
  variant?: 'default' | 'bordered' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  
  // Comportamento
  collapsible?: boolean;
  expanded_by_default?: boolean;
  show_character_count?: boolean;
  
  // Tooltip e ajuda
  tooltip?: string;
  help_position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface AutoPopulateConfig {
  source: 'api' | 'database' | 'calculation' | 'user_profile' | 'current_date' | 'previous_assessment';
  source_config: Record<string, any>;
  trigger: 'on_create' | 'on_field_change' | 'on_save' | 'manual';
  cache_duration?: number; // em minutos
}

export interface ComplianceMapping {
  framework: ComplianceFramework;
  control_id: string;
  requirement_text: string;
  evidence_type?: string;
  weight?: number;
}

export interface ApprovalStep {
  id: string;
  name: string;
  approver_role: string;
  approver_users?: string[];
  required: boolean;
  order: number;
  conditions?: Record<string, any>;
}

// ============================================================================
// WORKFLOW CUSTOMIZÁVEL
// ============================================================================

export type WorkflowStateType = 
  | 'start' | 'task' | 'decision' | 'approval' | 'review' | 'end' 
  | 'parallel' | 'merge' | 'timer' | 'condition' | 'subprocess';

export interface WorkflowState {
  id: string;
  name: string;
  type: WorkflowStateType;
  description?: string;
  
  // Configurações do estado
  assignee_role?: string;
  assignee_users?: string[];
  estimated_duration?: number; // em horas
  due_date_offset?: number; // dias a partir da data de início
  
  // Condições e validações
  entry_conditions?: WorkflowCondition[];
  exit_conditions?: WorkflowCondition[];
  required_fields?: string[];
  
  // Automação
  auto_assign?: boolean;
  auto_transition?: boolean;
  notifications?: NotificationConfig[];
  
  // UI
  color?: string;
  icon?: string;
  position?: { x: number; y: number };
}

export interface WorkflowTransition {
  id: string;
  name: string;
  from_state: string;
  to_state: string;
  
  // Condições para transição
  conditions?: WorkflowCondition[];
  trigger: 'manual' | 'automatic' | 'timer' | 'event';
  
  // Configurações
  require_approval?: boolean;
  approver_role?: string;
  require_comment?: boolean;
  
  // Automação
  actions?: WorkflowAction[];
  notifications?: NotificationConfig[];
  
  // UI
  label?: string;
  color?: string;
}

export interface WorkflowCondition {
  type: 'field_value' | 'user_role' | 'date' | 'approval' | 'script' | 'api_call';
  config: Record<string, any>;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value?: any;
}

export interface WorkflowAction {
  type: 'update_field' | 'send_email' | 'create_task' | 'api_call' | 'script' | 'notification';
  config: Record<string, any>;
  delay?: number; // em minutos
  retry_config?: {
    max_attempts: number;
    delay_between_attempts: number;
  };
}

export interface NotificationConfig {
  type: 'email' | 'in_app' | 'webhook' | 'slack' | 'teams';
  recipients: string[]; // roles ou user IDs
  template: string;
  trigger: 'state_entry' | 'state_exit' | 'transition' | 'overdue' | 'custom';
  delay?: number; // em minutos
}

// ============================================================================
// CONFIGURAÇÃO DE UI
// ============================================================================

export interface UIConfiguration {
  // Layout geral
  layout: 'single_column' | 'two_columns' | 'three_columns' | 'tabs' | 'accordion' | 'wizard';
  theme: 'default' | 'compact' | 'modern' | 'classic' | 'custom';
  
  // Seções da interface
  sections: UISection[];
  
  // Configurações globais
  show_progress_bar: boolean;
  allow_draft_save: boolean;
  auto_save_interval?: number; // em segundos
  
  // Navegação
  navigation: {
    show_section_navigation: boolean;
    enable_jump_to_section: boolean;
    show_completion_percentage: boolean;
  };
  
  // Validação
  validation: {
    validate_on_change: boolean;
    validate_on_save: boolean;
    show_inline_errors: boolean;
    highlight_required_fields: boolean;
  };
  
  // Responsividade
  responsive: {
    mobile_layout: 'stacked' | 'collapsed' | 'tabbed';
    tablet_columns: number;
    desktop_columns: number;
  };
  
  // Customização visual
  custom_css?: string;
  custom_colors?: Record<string, string>;
}

export interface UISection {
  id: string;
  title: string;
  description?: string;
  fields: string[]; // IDs dos campos
  
  // Layout da seção
  layout: 'grid' | 'list' | 'columns';
  columns?: number;
  collapsible: boolean;
  expanded_by_default: boolean;
  
  // Condições de visibilidade
  visibility_conditions?: FieldVisibilityCondition[];
  
  // Ordem
  order: number;
  
  // Estilo
  color?: string;
  icon?: string;
  border?: boolean;
}

// ============================================================================
// TEMPLATE PRINCIPAL
// ============================================================================

export interface ComplianceProcessTemplate {
  // Identificação
  id: string;
  tenant_id: string;
  
  // Informações básicas
  name: string;
  description?: string;
  framework: ComplianceFramework;
  version: string;
  
  // Definições customizáveis
  field_definitions: {
    fields: CustomFieldDefinition[];
  };
  
  workflow_definition: {
    states: WorkflowState[];
    transitions: WorkflowTransition[];
    initial_state: string;
  };
  
  ui_configuration: UIConfiguration;
  
  // Configurações de segurança
  security_config: {
    encryption_required: boolean;
    access_level: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
    audit_trail: boolean;
    data_retention_days: number;
    pii_handling: 'none' | 'anonymize' | 'encrypt' | 'delete';
    compliance_tags?: string[];
  };
  
  // Configurações de automação
  automation_config: {
    notifications_enabled: boolean;
    auto_assignment: boolean;
    webhook_triggers: string[];
    ai_assistance: boolean;
    integration_hooks?: IntegrationHook[];
  };
  
  // Status e controle
  is_active: boolean;
  is_default_for_framework: boolean;
  usage_count: number;
  
  // Auditoria
  created_by: string;
  created_at: Date;
  updated_by?: string;
  updated_at?: Date;
}

export interface IntegrationHook {
  id: string;
  name: string;
  event: 'field_change' | 'state_transition' | 'form_submit' | 'approval' | 'custom';
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body_template?: string;
  auth_config?: {
    type: 'none' | 'bearer' | 'basic' | 'api_key';
    credentials?: Record<string, string>;
  };
}

// ============================================================================
// HISTÓRICO E VERSIONAMENTO
// ============================================================================

export interface ComplianceProcessTemplateHistory {
  id: string;
  template_id: string;
  version_number: number;
  template_snapshot: ComplianceProcessTemplate;
  change_type: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted';
  change_description?: string;
  changed_by: string;
  changed_at: Date;
}

// ============================================================================
// REQUESTS PARA APIs
// ============================================================================

export interface CreateProcessTemplateRequest {
  name: string;
  description?: string;
  framework: ComplianceFramework;
  field_definitions: { fields: CustomFieldDefinition[] };
  workflow_definition: { states: WorkflowState[]; transitions: WorkflowTransition[] };
  ui_configuration: UIConfiguration;
  security_config?: Partial<ComplianceProcessTemplate['security_config']>;
  automation_config?: Partial<ComplianceProcessTemplate['automation_config']>;
}

export interface UpdateProcessTemplateRequest extends Partial<CreateProcessTemplateRequest> {
  version?: string;
}

export interface CloneProcessTemplateRequest {
  source_template_id: string;
  new_name: string;
  new_description?: string;
  modify_framework?: ComplianceFramework;
}

// ============================================================================
// VALIDAÇÃO E UTILIDADES
// ============================================================================

export interface TemplateValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  type: 'required' | 'invalid' | 'duplicate' | 'security' | 'logic';
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const CUSTOM_FIELD_TYPES: CustomFieldType[] = [
  'text', 'textarea', 'number', 'boolean', 'date', 'datetime',
  'select', 'multiselect', 'radio', 'checkbox',
  'compliance_status', 'maturity_rating', 'evidence_upload',
  'control_test', 'risk_matrix', 'framework_mapping',
  'file_upload', 'signature', 'approval_workflow', 'audit_trail',
  'section_header', 'divider', 'info_display', 'calculated_field'
];

export const WORKFLOW_STATE_TYPES: WorkflowStateType[] = [
  'start', 'task', 'decision', 'approval', 'review', 'end',
  'parallel', 'merge', 'timer', 'condition', 'subprocess'
];

export const UI_LAYOUTS = [
  'single_column', 'two_columns', 'three_columns', 'tabs', 'accordion', 'wizard'
] as const;

export const SECURITY_ACCESS_LEVELS = [
  'public', 'internal', 'confidential', 'restricted', 'top_secret'
] as const;

// ============================================================================
// HELPERS E UTILIDADES
// ============================================================================

export const validateFieldName = (name: string): boolean => {
  return /^[a-zA-Z][a-zA-Z0-9_]{0,49}$/.test(name);
};

export const sanitizeFieldName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^[0-9]/, 'field_$&')
    .substring(0, 50);
};

export const getFieldTypeIcon = (type: CustomFieldType): string => {
  const iconMap: Record<CustomFieldType, string> = {
    text: 'Type',
    textarea: 'FileText',
    number: 'Hash',
    boolean: 'ToggleLeft',
    date: 'Calendar',
    datetime: 'Clock',
    select: 'ChevronDown',
    multiselect: 'CheckSquare',
    radio: 'Circle',
    checkbox: 'Square',
    compliance_status: 'Shield',
    maturity_rating: 'Star',
    evidence_upload: 'Upload',
    control_test: 'CheckCircle',
    risk_matrix: 'Grid',
    framework_mapping: 'Link',
    file_upload: 'Paperclip',
    signature: 'Edit3',
    approval_workflow: 'GitBranch',
    audit_trail: 'Eye',
    section_header: 'Heading',
    divider: 'Minus',
    info_display: 'Info',
    calculated_field: 'Calculator'
  };
  return iconMap[type] || 'HelpCircle';
};

export const validateTemplate = (template: Partial<ComplianceProcessTemplate>): TemplateValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Validações básicas
  if (!template.name) {
    errors.push({
      field: 'name',
      type: 'required',
      message: 'Nome do template é obrigatório',
      severity: 'error'
    });
  }
  
  if (!template.framework) {
    errors.push({
      field: 'framework',
      type: 'required', 
      message: 'Framework é obrigatório',
      severity: 'error'
    });
  }
  
  // Validar campos customizados
  if (template.field_definitions?.fields) {
    template.field_definitions.fields.forEach((field, index) => {
      if (!validateFieldName(field.name)) {
        errors.push({
          field: `field_definitions.fields[${index}].name`,
          type: 'invalid',
          message: `Nome de campo inválido: ${field.name}`,
          severity: 'error'
        });
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ============================================================================
// RUNTIME INTERFACES FOR PROCESS EXECUTION
// ============================================================================

export interface ProcessInstance {
  id: string;
  template_id: string;
  tenant_id: string;
  
  // Instance data
  instance_name?: string;
  current_state: string;
  field_values: Record<string, any>;
  completion_percentage: number;
  
  // Workflow tracking
  workflow_history: WorkflowHistoryEntry[];
  current_assignees: string[];
  
  // Status and metadata
  status: 'draft' | 'active' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: Date;
  
  // Audit information
  created_by: string;
  created_at: Date;
  updated_by?: string;
  updated_at?: Date;
  completed_at?: Date;
}

export interface ProcessSubmissionData {
  template_id: string;
  instance_id: string;
  field_values: Record<string, any>;
  workflow_state: string;
  completion_percentage: number;
  validation_results: Record<string, any>;
  metadata: {
    created_at: string;
    last_updated: string;
    version: string;
    user_agent?: string;
    ip_address?: string;
  };
}

export interface WorkflowHistoryEntry {
  id: string;
  instance_id: string;
  from_state: string;
  to_state: string;
  transition_id: string;
  
  // Action details
  action_type: 'manual' | 'automatic' | 'approval' | 'rejection' | 'timeout';
  performed_by?: string;
  comment?: string;
  
  // Timing
  performed_at: Date;
  duration_in_state?: number; // seconds
  
  // Additional data
  field_changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
}

// ============================================================================
// SUBMISSION AND VALIDATION INTERFACES
// ============================================================================

export interface ProcessSubmissionRequest {
  instance_id?: string;
  field_values: Record<string, any>;
  workflow_action?: {
    transition_id: string;
    comment?: string;
  };
  save_as_draft?: boolean;
}

export interface ProcessSubmissionResponse {
  success: boolean;
  instance_id: string;
  validation_results?: {
    isValid: boolean;
    errors: Record<string, string[]>;
    warnings: Record<string, string[]>;
  };
  next_state?: string;
  available_transitions?: WorkflowTransition[];
  message?: string;
}

export interface ProcessExecutionContext {
  template: ComplianceProcessTemplate;
  instance: ProcessInstance;
  user_id: string;
  user_role: string;
  tenant_id: string;
  permissions: string[];
}