import { createClient } from '@supabase/supabase-js';

export interface IntegrationCredentials {
  server?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  token?: string;
  additionalParams?: Record<string, any>;
}

export interface VulnerabilityData {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  cvss_score?: number;
  cve_id?: string;
  asset_name: string;
  asset_ip?: string;
  source_tool: string;
  source_type: string;
  status: 'Open' | 'In_Progress' | 'Testing' | 'Resolved' | 'Accepted' | 'False_Positive';
  first_found?: Date;
  last_found?: Date;
  port?: number;
  protocol?: string;
  solution?: string;
  references?: string[];
  raw_data?: any;
}

export interface ImportResult {
  success: boolean;
  total_found: number;
  imported: number;
  skipped: number;
  errors: string[];
  vulnerabilities: VulnerabilityData[];
}

export abstract class BaseIntegration {
  protected credentials: IntegrationCredentials;
  protected supabase: any;

  constructor(credentials: IntegrationCredentials) {
    this.credentials = credentials;
    
    // Initialize Supabase client with service role for backend operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  abstract testConnection(): Promise<boolean>;
  abstract importVulnerabilities(filters?: any): Promise<ImportResult>;
  
  protected async saveVulnerabilities(vulnerabilities: VulnerabilityData[], tenantId: string): Promise<number> {
    try {
      const vulnerabilitiesToInsert = vulnerabilities.map(vuln => ({
        tenant_id: tenantId,
        title: vuln.title,
        description: vuln.description,
        severity: vuln.severity,
        cvss_score: vuln.cvss_score,
        cve_id: vuln.cve_id,
        asset_name: vuln.asset_name,
        asset_ip: vuln.asset_ip,
        source_tool: vuln.source_tool,
        source_type: vuln.source_type,
        status: vuln.status,
        first_found_date: vuln.first_found,
        last_found_date: vuln.last_found,
        port: vuln.port,
        protocol: vuln.protocol,
        solution: vuln.solution,
        references: vuln.references,
        raw_data: vuln.raw_data,
        created_at: new Date(),
        updated_at: new Date()
      }));

      const { data, error } = await this.supabase
        .from('vulnerabilities')
        .insert(vulnerabilitiesToInsert)
        .select();

      if (error) {
        console.error('Error saving vulnerabilities:', error);
        throw new Error(`Failed to save vulnerabilities: ${error.message}`);
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in saveVulnerabilities:', error);
      throw error;
    }
  }

  protected normalizeVulnerability(rawData: any, sourceType: string): VulnerabilityData {
    // Base normalization - to be overridden by specific integrations
    return {
      id: rawData.id || `${sourceType}-${Date.now()}-${Math.random()}`,
      title: rawData.title || rawData.name || 'Unknown Vulnerability',
      description: rawData.description || rawData.summary || '',
      severity: this.normalizeSeverity(rawData.severity || rawData.risk),
      asset_name: rawData.asset_name || rawData.host || rawData.target || 'Unknown Asset',
      source_tool: sourceType,
      source_type: sourceType,
      status: 'Open',
      raw_data: rawData
    };
  }

  protected normalizeSeverity(severity: string | number): 'Critical' | 'High' | 'Medium' | 'Low' | 'Info' {
    if (typeof severity === 'number') {
      if (severity >= 9) return 'Critical';
      if (severity >= 7) return 'High';
      if (severity >= 4) return 'Medium';
      if (severity >= 1) return 'Low';
      return 'Info';
    }

    const severityStr = severity?.toString().toLowerCase() || '';
    
    if (severityStr.includes('critical') || severityStr.includes('5')) return 'Critical';
    if (severityStr.includes('high') || severityStr.includes('4')) return 'High';
    if (severityStr.includes('medium') || severityStr.includes('3')) return 'Medium';
    if (severityStr.includes('low') || severityStr.includes('2')) return 'Low';
    
    return 'Info';
  }

  protected async makeHttpRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        timeout: 30000, // 30 seconds timeout
        ...options,
        headers: {
          'User-Agent': 'GRC-Controller/1.0',
          'Accept': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else if (contentType?.includes('application/xml') || contentType?.includes('text/xml')) {
        return await response.text();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }
}