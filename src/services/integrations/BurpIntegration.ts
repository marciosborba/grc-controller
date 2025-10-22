import { BaseIntegration, IntegrationCredentials, VulnerabilityData, ImportResult } from './BaseIntegration';

export interface BurpCredentials extends IntegrationCredentials {
  server: string; // https://burp.company.com
  apiKey: string;
  siteId?: string;
  scanId?: string;
}

export class BurpIntegration extends BaseIntegration {
  private credentials: BurpCredentials;

  constructor(credentials: BurpCredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.credentials.server}/api/v1/sites`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return Array.isArray(response) || response.sites;
    } catch (error) {
      console.error('Burp connection test failed:', error);
      return false;
    }
  }

  async importVulnerabilities(filters?: {
    severityFilter?: string;
    siteId?: string;
    scanId?: string;
    maxResults?: number;
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
      // Step 1: Get sites if no specific site ID provided
      let siteId = filters?.siteId || this.credentials.siteId;
      if (!siteId) {
        const sites = await this.getSites();
        if (sites.length === 0) {
          throw new Error('No sites found');
        }
        siteId = sites[0].id;
      }

      // Step 2: Get scans for the site
      let scanId = filters?.scanId || this.credentials.scanId;
      if (!scanId) {
        const scans = await this.getScans(siteId);
        if (scans.length === 0) {
          throw new Error('No scans found for site');
        }
        // Use the most recent completed scan
        scanId = scans.find(scan => scan.status === 'succeeded')?.id || scans[0].id;
      }

      // Step 3: Get issues from scan
      const vulnerabilities = await this.getScanIssues(scanId, filters);
      
      result.total_found = vulnerabilities.length;
      result.vulnerabilities = vulnerabilities;
      result.success = true;
      result.imported = vulnerabilities.length;

      return result;
    } catch (error) {
      console.error('Burp import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async getSites(): Promise<any[]> {
    try {
      const url = `${this.credentials.server}/api/v1/sites`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.sites || response || [];
    } catch (error) {
      console.error('Failed to get Burp sites:', error);
      throw error;
    }
  }

  private async getScans(siteId: string): Promise<any[]> {
    try {
      const url = `${this.credentials.server}/api/v1/sites/${siteId}/scans`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.scans || response || [];
    } catch (error) {
      console.error('Failed to get Burp scans:', error);
      throw error;
    }
  }

  private async getScanIssues(scanId: string, filters?: any): Promise<VulnerabilityData[]> {
    try {
      const url = `${this.credentials.server}/api/v1/scans/${scanId}/issues`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const issues = response.issues || response || [];
      const vulnerabilities: VulnerabilityData[] = [];

      for (const issue of issues) {
        // Apply severity filter
        if (filters?.severityFilter && filters.severityFilter !== 'all') {
          const severity = this.mapBurpSeverity(issue.severity);
          if (filters.severityFilter === 'critical' && severity !== 'Critical') continue;
          if (filters.severityFilter === 'high-critical' && !['Critical', 'High'].includes(severity)) continue;
        }

        const vulnerability: VulnerabilityData = {
          id: `burp-${issue.issue_type?.type_index || issue.id}-${Date.now()}`,
          title: issue.issue_type?.name || issue.name || 'Burp Suite Issue',
          description: issue.issue_detail || issue.description || '',
          severity: this.mapBurpSeverity(issue.severity),
          asset_name: this.extractHostFromUrl(issue.origin),
          asset_ip: issue.host || undefined,
          source_tool: 'Burp Suite Enterprise',
          source_type: 'Burp',
          status: 'Open',
          port: this.extractPortFromUrl(issue.origin),
          protocol: this.extractProtocolFromUrl(issue.origin),
          solution: issue.remediation_detail || undefined,
          references: issue.references ? [issue.references] : undefined,
          raw_data: {
            issue_type: issue.issue_type,
            confidence: issue.confidence,
            origin: issue.origin,
            path: issue.path,
            location: issue.location,
            evidence: issue.evidence,
            request: issue.request,
            response: issue.response,
            collaborator_event: issue.collaborator_event,
            scan_type: issue.scan_type,
            scanner_confidence: issue.scanner_confidence,
            false_positive: issue.false_positive,
            internal_data: issue.internal_data,
            serial_number: issue.serial_number,
            caption: issue.caption
          }
        };

        vulnerabilities.push(vulnerability);
      }

      return vulnerabilities;
    } catch (error) {
      console.error('Failed to get Burp issues:', error);
      throw error;
    }
  }

  private mapBurpSeverity(burpSeverity: string): 'Critical' | 'High' | 'Medium' | 'Low' | 'Info' {
    const severity = burpSeverity?.toLowerCase() || '';
    
    if (severity.includes('critical')) return 'Critical';
    if (severity.includes('high')) return 'High';
    if (severity.includes('medium')) return 'Medium';
    if (severity.includes('low')) return 'Low';
    
    return 'Info';
  }

  private extractHostFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url || 'Unknown Host';
    }
  }

  private extractPortFromUrl(url: string): number | undefined {
    try {
      const urlObj = new URL(url);
      return urlObj.port ? parseInt(urlObj.port) : undefined;
    } catch {
      return undefined;
    }
  }

  private extractProtocolFromUrl(url: string): string | undefined {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol.replace(':', '');
    } catch {
      return undefined;
    }
  }
}