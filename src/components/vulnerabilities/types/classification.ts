// =====================================================
// VULNERABILITY CLASSIFICATION TEMPLATES TYPES
// =====================================================

import { VulnerabilitySeverity, BusinessImpact, AssetType } from './vulnerability';

export type VulnerabilityClass = 
  | 'Infrastructure'
  | 'Web_Application'
  | 'Database'
  | 'Network'
  | 'Operating_System'
  | 'Mobile_Application'
  | 'Cloud_Service'
  | 'API'
  | 'IoT_Device'
  | 'Third_Party';

export type CVSSVersion = '3.1' | '4.0';
export type CriticalitySource = 'CVSS' | 'Tool_Classification' | 'Manual_Assessment' | 'Industry_Standard';
export type AssetStatus = 'EOL' | 'Supported' | 'Legacy' | 'Current';
export type AssetExposure = 'Internet_Facing' | 'Internal' | 'DMZ' | 'Isolated';
export type SecurityControl = 'EDR' | 'WAF' | 'IPS' | 'Firewall' | 'Antivirus' | 'SIEM' | 'None';
export type BusinessCriticality = 'Critical' | 'High' | 'Medium' | 'Low';
export type ComplianceFramework = 'LGPD' | 'SOX' | 'PCI_DSS' | 'HIPAA' | 'ISO27001' | 'NIST' | 'CIS';
export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export interface CriticalityCriteria {
  cvss_version?: CVSSVersion;
  cvss_score_range?: {
    min: number;
    max: number;
  };
  severity_levels?: VulnerabilitySeverity[];
  source_classification?: CriticalitySource;
  exploit_available?: boolean;
  patch_available?: boolean;
  age_days?: number;
  public_disclosure?: boolean;
}

export interface AssetCriteria {
  asset_status?: AssetStatus[];
  exposure_level?: AssetExposure[];
  security_controls?: SecurityControl[];
  asset_types?: AssetType[];
  network_segment?: string[];
  operating_system?: string[];
  patch_level?: 'Current' | 'Outdated' | 'Critical';
  backup_status?: 'Protected' | 'Partial' | 'None';
}

export interface ApplicationCriteria {
  business_criticality?: BusinessCriticality[];
  compliance_frameworks?: ComplianceFramework[];
  data_classification?: DataClassification[];
  user_base_size?: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  revenue_impact?: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  customer_facing?: boolean;
  processes_pii?: boolean;
  processes_financial_data?: boolean;
  regulatory_requirements?: string[];
}

export interface ClassificationTemplate {
  id: string;
  name: string;
  description: string;
  vulnerability_class: VulnerabilityClass;
  enabled: boolean;
  priority: number;
  
  // Three main criteria
  criticality_criteria: CriticalityCriteria;
  asset_criteria: AssetCriteria;
  application_criteria: ApplicationCriteria;
  
  // Actions to take when criteria are met
  actions: {
    set_priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    set_sla_hours?: number;
    assign_to_team?: string;
    add_tags?: string[];
    set_business_impact?: BusinessImpact;
    require_approval?: boolean;
    escalate_to?: string;
    notification_channels?: string[];
  };
  
  // Analysis and recommendations
  analysis_template?: string;
  recommendation_template?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  created_by: string;
  last_executed?: Date;
  execution_count: number;
  success_rate: number;
}

export interface ClassificationMetrics {
  total_templates: number;
  active_templates: number;
  templates_by_class: Record<VulnerabilityClass, number>;
  total_executions: number;
  success_rate: number;
  avg_execution_time: number;
  most_triggered_template: string;
  recent_executions: {
    template_id: string;
    template_name: string;
    vulnerability_count: number;
    timestamp: Date;
    success: boolean;
  }[];
}

// Template presets for different vulnerability classes
export const VULNERABILITY_CLASS_LABELS: Record<VulnerabilityClass, string> = {
  Infrastructure: 'Infraestrutura',
  Web_Application: 'Aplicação Web',
  Database: 'Banco de Dados',
  Network: 'Rede',
  Operating_System: 'Sistema Operacional',
  Mobile_Application: 'Aplicação Mobile',
  Cloud_Service: 'Serviço em Nuvem',
  API: 'API',
  IoT_Device: 'Dispositivo IoT',
  Third_Party: 'Terceiros'
};

export const CVSS_VERSION_LABELS: Record<CVSSVersion, string> = {
  '3.1': 'CVSS 3.1',
  '4.0': 'CVSS 4.0'
};

export const CRITICALITY_SOURCE_LABELS: Record<CriticalitySource, string> = {
  CVSS: 'CVSS Score',
  Tool_Classification: 'Classificação da Ferramenta',
  Manual_Assessment: 'Avaliação Manual',
  Industry_Standard: 'Padrão da Indústria'
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  EOL: 'End of Life',
  Supported: 'Suportado',
  Legacy: 'Legado',
  Current: 'Atual'
};

export const ASSET_EXPOSURE_LABELS: Record<AssetExposure, string> = {
  Internet_Facing: 'Exposto à Internet',
  Internal: 'Interno',
  DMZ: 'DMZ',
  Isolated: 'Isolado'
};

export const SECURITY_CONTROL_LABELS: Record<SecurityControl, string> = {
  EDR: 'EDR',
  WAF: 'WAF',
  IPS: 'IPS',
  Firewall: 'Firewall',
  Antivirus: 'Antivírus',
  SIEM: 'SIEM',
  None: 'Nenhum'
};

export const BUSINESS_CRITICALITY_LABELS: Record<BusinessCriticality, string> = {
  Critical: 'Crítico',
  High: 'Alto',
  Medium: 'Médio',
  Low: 'Baixo'
};

export const COMPLIANCE_FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  LGPD: 'LGPD',
  SOX: 'SOX',
  PCI_DSS: 'PCI DSS',
  HIPAA: 'HIPAA',
  ISO27001: 'ISO 27001',
  NIST: 'NIST',
  CIS: 'CIS'
};

export const DATA_CLASSIFICATION_LABELS: Record<DataClassification, string> = {
  Public: 'Público',
  Internal: 'Interno',
  Confidential: 'Confidencial',
  Restricted: 'Restrito'
};