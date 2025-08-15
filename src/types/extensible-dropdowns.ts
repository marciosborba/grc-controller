// ============================================================================
// TIPOS PARA DROPDOWNS EXTENSÍVEIS
// ============================================================================

export interface DropdownOption {
  id: string;
  label: string;
  description?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  createdBy?: string;
}

export interface Department extends DropdownOption {
  type: 'department';
  parentId?: string;
  employeeCount?: number;
}

export interface JobTitle extends DropdownOption {
  type: 'job_title';
  departmentId?: string;
  level?: 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
  salaryRange?: {
    min: number;
    max: number;
  };
}

export interface ComplianceFramework extends DropdownOption {
  type: 'compliance_framework';
  version: string;
  category: 'security' | 'privacy' | 'financial' | 'operational' | 'regulatory';
  standards?: string[];
}

export interface RiskCategory extends DropdownOption {
  type: 'risk_category';
  color: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  parentId?: string;
}

export interface IncidentType extends DropdownOption {
  type: 'incident_type';
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
  category: 'security' | 'operational' | 'compliance' | 'technical' | 'human';
  responseTime?: number; // em horas
}

export type ExtensibleDropdownItem = 
  | Department 
  | JobTitle 
  | ComplianceFramework 
  | RiskCategory 
  | IncidentType;

export interface DropdownStore {
  departments: Department[];
  jobTitles: JobTitle[];
  complianceFrameworks: ComplianceFramework[];
  riskCategories: RiskCategory[];
  incidentTypes: IncidentType[];
}

export interface AddItemRequest {
  label: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface DropdownConfig {
  type: keyof DropdownStore;
  label: string;
  description: string;
  icon: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  validation: {
    minLength: number;
    maxLength: number;
    required: boolean;
    pattern?: RegExp;
  };
}

export interface ExtensibleSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  type: keyof DropdownStore;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  showDescription?: boolean;
  maxItems?: number;
  
  // Configurações de "Adicionar Novo"
  canAddNew?: boolean;
  onAddNew?: (item: AddItemRequest) => Promise<void>;
  
  // Validação
  validateNewItem?: (label: string) => string | null;
  
  // Permissões
  hasAddPermission?: boolean;
  hasEditPermission?: boolean;
  
  // Callbacks
  onItemAdded?: (item: ExtensibleDropdownItem) => void;
  onItemUpdated?: (item: ExtensibleDropdownItem) => void;
  onItemDeleted?: (itemId: string) => void;
}