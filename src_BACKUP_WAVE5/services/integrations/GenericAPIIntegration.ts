import { BaseIntegration, IntegrationCredentials, VulnerabilityData, ImportResult } from './BaseIntegration';

export interface GenericAPICredentials extends IntegrationCredentials {
  server: string; // https://api.example.com
  apiKey?: string;
  token?: string;
  username?: string;
  password?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  authType?: 'none' | 'bearer' | 'basic' | 'apikey' | 'custom';
  dataPath?: string; // JSONPath to extract data from response
  fieldMapping?: Record<string, string>; // Map API fields to internal fields
}

export class GenericAPIIntegration extends BaseIntegration {
  private credentials: GenericAPICredentials;

  constructor(credentials: GenericAPICredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest();
      return response !== null && response !== undefined;
    } catch (error) {
      console.error('Generic API connection test failed:', error);
      return false;
    }
  }

  async importVulnerabilities(filters?: {
    maxResults?: number;
    additionalParams?: Record<string, any>;
  }): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      total_found: 0,
      imported: 0,
      skipped: 0,
      errors: [],
      vulnerabilities: []
    };

    try {
      const response = await this.makeAPIRequest(filters?.additionalParams);
      const vulnerabilities = this.parseAPIResponse(response);
      
      result.total_found = vulnerabilities.length;
      result.vulnerabilities = vulnerabilities;
      result.success = true;
      result.imported = vulnerabilities.length;

      return result;
    } catch (error) {
      console.error('Generic API import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async makeAPIRequest(additionalParams?: Record<string, any>): Promise<any> {
    try {
      const url = this.buildURL(additionalParams);
      const headers = this.buildHeaders();
      const method = this.credentials.method || 'GET';
      const body = this.buildBody(additionalParams);

      const options: RequestInit = {
        method,
        headers,
        ...(body && method !== 'GET' && { body: JSON.stringify(body) })
      };

      const response = await this.makeHttpRequest(url, options);
      return response;
    } catch (error) {
      console.error('Failed to make Generic API request:', error);
      throw error;
    }
  }

  private buildURL(additionalParams?: Record<string, any>): string {
    let url = this.credentials.server;
    
    // Add query parameters for GET requests
    if (this.credentials.method === 'GET' && additionalParams) {
      const params = new URLSearchParams();
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }
    }
    
    return url;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'GRC-Controller/1.0',
      ...this.credentials.headers
    };

    // Add authentication headers based on type
    switch (this.credentials.authType) {
      case 'bearer':
        if (this.credentials.token || this.credentials.apiKey) {
          headers['Authorization'] = `Bearer ${this.credentials.token || this.credentials.apiKey}`;
        }
        break;
        
      case 'basic':
        if (this.credentials.username && this.credentials.password) {
          const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
          headers['Authorization'] = `Basic ${auth}`;
        }
        break;
        
      case 'apikey':
        if (this.credentials.apiKey) {
          // Common API key header patterns
          headers['X-API-Key'] = this.credentials.apiKey;
          headers['API-Key'] = this.credentials.apiKey;
          headers['Authorization'] = `ApiKey ${this.credentials.apiKey}`;
        }
        break;
        
      case 'custom':
        // Custom headers are already included from this.credentials.headers
        break;
        
      case 'none':
      default:
        // No authentication
        break;
    }

    return headers;
  }

  private buildBody(additionalParams?: Record<string, any>): any {
    if (this.credentials.method === 'GET') {
      return undefined;
    }

    let body = this.credentials.body || {};
    
    // Merge additional parameters into body for non-GET requests
    if (additionalParams) {
      body = { ...body, ...additionalParams };
    }

    return Object.keys(body).length > 0 ? body : undefined;
  }

  private parseAPIResponse(response: any): VulnerabilityData[] {
    try {
      let data = response;
      
      // Extract data using JSONPath if specified
      if (this.credentials.dataPath) {
        data = this.extractDataByPath(response, this.credentials.dataPath);
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        if (data && typeof data === 'object') {
          // Try common array property names
          const arrayProps = ['data', 'results', 'items', 'vulnerabilities', 'issues', 'findings'];
          for (const prop of arrayProps) {
            if (Array.isArray(data[prop])) {
              data = data[prop];
              break;
            }
          }
        }
        
        // If still not an array, wrap in array
        if (!Array.isArray(data)) {
          data = data ? [data] : [];
        }
      }

      return data.map((item: any) => this.mapAPIDataToVulnerability(item));
    } catch (error) {
      console.error('Failed to parse Generic API response:', error);
      throw new Error('Failed to parse API response');
    }
  }

  private extractDataByPath(obj: any, path: string): any {
    // Simple JSONPath implementation for basic paths like "data.results" or "response.vulnerabilities"
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        throw new Error(`Path "${path}" not found in response`);
      }
    }
    
    return current;
  }

  private mapAPIDataToVulnerability(item: any): VulnerabilityData {
    const mapping = this.credentials.fieldMapping || {};
    
    // Default field mapping with fallbacks
    const defaultMapping = {
      id: 'id',
      title: 'title',
      description: 'description',
      severity: 'severity',
      cvss_score: 'cvss_score',
      cve_id: 'cve_id',
      asset_name: 'asset_name',
      asset_ip: 'asset_ip',
      port: 'port',
      protocol: 'protocol',
      solution: 'solution',
      references: 'references'
    };

    const finalMapping = { ...defaultMapping, ...mapping };

    return {
      id: this.getFieldValue(item, finalMapping.id) || `generic-${Date.now()}-${Math.random()}`,
      title: this.getFieldValue(item, finalMapping.title) || 'Generic API Vulnerability',
      description: this.getFieldValue(item, finalMapping.description) || '',
      severity: this.normalizeSeverity(this.getFieldValue(item, finalMapping.severity)),
      cvss_score: this.parseFloat(this.getFieldValue(item, finalMapping.cvss_score)),
      cve_id: this.getFieldValue(item, finalMapping.cve_id),
      asset_name: this.getFieldValue(item, finalMapping.asset_name) || 'Unknown Asset',
      asset_ip: this.getFieldValue(item, finalMapping.asset_ip),
      port: this.parseInt(this.getFieldValue(item, finalMapping.port)),
      protocol: this.getFieldValue(item, finalMapping.protocol),
      solution: this.getFieldValue(item, finalMapping.solution),
      references: this.parseReferences(this.getFieldValue(item, finalMapping.references)),
      source_tool: 'Generic API',
      source_type: 'API',
      status: 'Open',
      raw_data: item
    };
  }

  private getFieldValue(obj: any, fieldPath: string): any {
    if (!fieldPath || !obj) return undefined;
    
    // Support nested field paths like "vulnerability.details.title"
    const parts = fieldPath.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  private parseFloat(value: any): number | undefined {
    if (value === null || value === undefined) return undefined;
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? undefined : parsed;
  }

  private parseInt(value: any): number | undefined {
    if (value === null || value === undefined) return undefined;
    const parsed = parseInt(value.toString());
    return isNaN(parsed) ? undefined : parsed;
  }

  private parseReferences(value: any): string[] | undefined {
    if (!value) return undefined;
    
    if (Array.isArray(value)) {
      return value.map(v => v.toString());
    }
    
    if (typeof value === 'string') {
      // Try to split by common delimiters
      return value.split(/[,;|\n]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    
    return [value.toString()];
  }
}