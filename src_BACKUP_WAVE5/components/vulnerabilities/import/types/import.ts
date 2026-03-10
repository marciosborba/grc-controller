// =====================================================
// VULNERABILITY IMPORT TYPES
// =====================================================

export type ImportSourceType = 
  | 'nessus_file' 
  | 'nessus_api'
  | 'qualys_file' 
  | 'qualys_api'
  | 'openvas_file'
  | 'openvas_api'
  | 'rapid7_api'
  | 'burp_file'
  | 'burp_enterprise_api'
  | 'owasp_zap_file'
  | 'owasp_zap_api'
  | 'sonarqube_api'
  | 'checkmarx_api'
  | 'veracode_api'
  | 'aws_inspector_api'
  | 'azure_defender_api'
  | 'gcp_security_api'
  | 'orca_security_api'
  | 'csv_file'
  | 'json_file'
  | 'xml_file'
  | 'generic_api';

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface ImportSource {
  id: string;
  type: ImportSourceType;
  name: string;
  description: string;
  icon: string;
  category: 'vulnerability_scanner' | 'sast' | 'dast' | 'cloud' | 'file' | 'api';
  supportedFormats: string[];
  requiresAuth: boolean;
  authType?: 'api_key' | 'basic_auth' | 'oauth' | 'token';
  documentationUrl?: string;
}

export interface ImportConfiguration {
  id: string;
  tenant_id: string;
  source_type: ImportSourceType;
  name: string;
  description?: string;
  connection_config: ConnectionConfig;
  field_mapping: FieldMapping;
  import_settings: ImportSettings;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface ConnectionConfig {
  // API Configuration
  api_url?: string;
  api_key?: string;
  username?: string;
  password?: string;
  token?: string;
  additional_headers?: Record<string, string>;
  
  // File Configuration
  file_path?: string;
  file_format?: string;
  encoding?: string;
  
  // Tool-specific settings
  tool_specific?: Record<string, any>;
}

export interface FieldMapping {
  // Core vulnerability fields
  title: string;
  description: string;
  severity: string;
  cvss_score?: string;
  cve_id?: string;
  cwe_id?: string;
  
  // Asset information
  asset_name: string;
  asset_ip?: string;
  asset_url?: string;
  port?: string;
  protocol?: string;
  
  // Source information
  source_tool: string;
  source_scan_id?: string;
  plugin_id?: string;
  
  // Additional fields
  solution?: string;
  references?: string;
  first_found?: string;
  last_found?: string;
  
  // Custom fields
  custom_fields?: Record<string, string>;
}

export interface ImportSettings {
  // Import behavior
  deduplicate: boolean;
  deduplication_fields: string[];
  update_existing: boolean;
  skip_resolved: boolean;
  
  // Filtering
  severity_filter?: string[];
  status_filter?: string[];
  date_filter?: {
    start_date?: Date;
    end_date?: Date;
  };
  
  // Processing
  batch_size: number;
  max_records?: number;
  validate_data: boolean;
  
  // Notifications
  notify_on_completion: boolean;
  notification_emails?: string[];
}

export interface ImportJob {
  id: string;
  tenant_id: string;
  configuration_id: string;
  source_type: ImportSourceType;
  status: ImportStatus;
  
  // Progress tracking
  total_records: number;
  processed_records: number;
  successful_imports: number;
  failed_imports: number;
  skipped_records: number;
  
  // Timing
  started_at: Date;
  completed_at?: Date;
  estimated_completion?: Date;
  
  // Results
  import_summary: ImportSummary;
  errors: ImportError[];
  warnings: ImportWarning[];
  
  // Metadata
  file_name?: string;
  file_size?: number;
  source_info?: Record<string, any>;
  created_by: string;
}

export interface ImportSummary {
  total_vulnerabilities: number;
  new_vulnerabilities: number;
  updated_vulnerabilities: number;
  duplicate_vulnerabilities: number;
  invalid_records: number;
  
  severity_breakdown: Record<string, number>;
  asset_breakdown: Record<string, number>;
  source_breakdown: Record<string, number>;
  
  processing_time: number; // in seconds
  throughput: number; // records per second
}

export interface ImportError {
  id: string;
  record_index: number;
  field?: string;
  error_type: 'validation' | 'parsing' | 'database' | 'network' | 'authentication';
  error_code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ImportWarning {
  id: string;
  record_index: number;
  field?: string;
  warning_type: 'data_quality' | 'mapping' | 'duplicate' | 'format';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ImportPreview {
  source_type: ImportSourceType;
  total_records: number;
  sample_records: any[];
  detected_fields: string[];
  field_mapping_suggestions: Partial<FieldMapping>;
  validation_results: {
    valid_records: number;
    invalid_records: number;
    warnings: ImportWarning[];
    errors: ImportError[];
  };
  estimated_import_time: number;
}

export interface ParsedVulnerability {
  // Raw data from source
  raw_data: Record<string, any>;
  
  // Mapped fields
  title?: string;
  description?: string;
  severity?: string;
  cvss_score?: number;
  cve_id?: string;
  cwe_id?: string;
  
  asset_name?: string;
  asset_ip?: string;
  asset_url?: string;
  port?: number;
  protocol?: string;
  
  source_tool?: string;
  source_scan_id?: string;
  plugin_id?: string;
  
  solution?: string;
  references?: string[];
  first_found?: Date;
  last_found?: Date;
  
  // Validation status
  is_valid: boolean;
  validation_errors: string[];
  validation_warnings: string[];
}

// Tool-specific interfaces
export interface NessusVulnerability {
  pluginID: string;
  pluginName: string;
  severity: string;
  host: string;
  port: string;
  protocol: string;
  description: string;
  solution: string;
  cvss_base_score?: string;
  cve?: string[];
  cwe?: string[];
  first_found?: string;
  last_found?: string;
}

export interface QualysVulnerability {
  QID: string;
  TITLE: string;
  SEVERITY: string;
  IP: string;
  PORT?: string;
  PROTOCOL?: string;
  DIAGNOSIS: string;
  CONSEQUENCE: string;
  SOLUTION: string;
  CVSS_BASE?: string;
  CVE_ID?: string;
  FIRST_FOUND_DATETIME?: string;
  LAST_FOUND_DATETIME?: string;
}

export interface OpenVASVulnerability {
  name: string;
  severity: string;
  host: string;
  port: string;
  description: string;
  nvt_oid: string;
  cve?: string[];
  cvss_base?: string;
  solution?: string;
  creation_time?: string;
  modification_time?: string;
}

// API Response interfaces
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    response_time: number;
    api_version?: string;
    available_endpoints?: string[];
    rate_limits?: Record<string, any>;
  };
  error?: string;
}