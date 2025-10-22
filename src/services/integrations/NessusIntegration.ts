import { BaseIntegration, IntegrationCredentials, VulnerabilityData, ImportResult } from './BaseIntegration';

export interface NessusCredentials extends IntegrationCredentials {
  server: string; // https://nessus.company.com:8834
  username: string;
  password: string;
  scanId?: string;
}

export class NessusIntegration extends BaseIntegration {
  private credentials: NessusCredentials;
  private token?: string;

  constructor(credentials: NessusCredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      const token = await this.authenticate();
      if (token) {
        await this.logout();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Nessus connection test failed:', error);
      return false;
    }
  }

  async importVulnerabilities(filters?: {
    severityFilter?: string;
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
      // Step 1: Authenticate
      this.token = await this.authenticate();
      if (!this.token) {
        throw new Error('Failed to authenticate with Nessus');
      }

      // Step 2: Get scans list if no specific scan ID provided
      let scanId = filters?.scanId || this.credentials.scanId;
      if (!scanId) {
        const scans = await this.getScans();
        if (scans.length === 0) {
          throw new Error('No scans found');
        }
        // Use the most recent completed scan
        scanId = scans.find(scan => scan.status === 'completed')?.id || scans[0].id;
      }

      // Step 3: Get vulnerabilities from scan
      const vulnerabilities = await this.getScanVulnerabilities(scanId, filters);
      
      result.total_found = vulnerabilities.length;
      result.vulnerabilities = vulnerabilities;

      // Step 4: Logout
      await this.logout();

      result.success = true;
      result.imported = vulnerabilities.length;

      return result;
    } catch (error) {
      console.error('Nessus import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async authenticate(): Promise<string | null> {
    try {
      const url = `${this.credentials.server}/session`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.credentials.username,
          password: this.credentials.password
        })
      });

      return response.token || null;
    } catch (error) {
      console.error('Nessus authentication failed:', error);
      return null;
    }
  }

  private async logout(): Promise<void> {
    if (!this.token) return;

    try {
      const url = `${this.credentials.server}/session`;
      
      await this.makeHttpRequest(url, {
        method: 'DELETE',
        headers: {
          'X-Cookie': `token=${this.token}`
        }
      });
    } catch (error) {
      console.error('Nessus logout failed:', error);
    }
  }

  private async getScans(): Promise<any[]> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      const url = `${this.credentials.server}/scans`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'X-Cookie': `token=${this.token}`
        }
      });

      return response.scans || [];
    } catch (error) {
      console.error('Failed to get Nessus scans:', error);
      throw error;
    }
  }

  private async getScanVulnerabilities(scanId: string, filters?: any): Promise<VulnerabilityData[]> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      // Get scan details
      const scanUrl = `${this.credentials.server}/scans/${scanId}`;
      const scanResponse = await this.makeHttpRequest(scanUrl, {
        method: 'GET',
        headers: {
          'X-Cookie': `token=${this.token}`
        }
      });

      const vulnerabilities: VulnerabilityData[] = [];
      const hosts = scanResponse.hosts || [];

      // Process each host
      for (const host of hosts) {
        const hostVulns = await this.getHostVulnerabilities(scanId, host.host_id, filters);
        vulnerabilities.push(...hostVulns);
      }

      return vulnerabilities;
    } catch (error) {
      console.error('Failed to get Nessus vulnerabilities:', error);
      throw error;
    }
  }

  private async getHostVulnerabilities(scanId: string, hostId: string, filters?: any): Promise<VulnerabilityData[]> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      const url = `${this.credentials.server}/scans/${scanId}/hosts/${hostId}`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'X-Cookie': `token=${this.token}`
        }
      });

      const vulnerabilities: VulnerabilityData[] = [];
      const hostInfo = response.info || {};
      const vulnList = response.vulnerabilities || [];

      for (const vuln of vulnList) {
        // Apply severity filter
        if (filters?.severityFilter && filters.severityFilter !== 'all') {
          if (filters.severityFilter === 'critical' && vuln.severity !== 4) continue;
          if (filters.severityFilter === 'high-critical' && vuln.severity < 3) continue;
        }

        // Get detailed vulnerability information
        const vulnDetails = await this.getVulnerabilityDetails(scanId, hostId, vuln.plugin_id);

        const vulnerability: VulnerabilityData = {
          id: `nessus-${vuln.plugin_id}-${hostId}-${Date.now()}`,
          title: vuln.plugin_name || `Nessus Plugin ${vuln.plugin_id}`,
          description: vulnDetails?.description || vuln.plugin_family || '',
          severity: this.mapNessusSeverity(vuln.severity),
          cvss_score: vulnDetails?.cvss_base_score ? parseFloat(vulnDetails.cvss_base_score) : undefined,
          cve_id: vulnDetails?.cve?.join(', ') || undefined,
          asset_name: hostInfo.host_fqdn || hostInfo.host_ip || 'Unknown Host',
          asset_ip: hostInfo.host_ip,
          source_tool: 'Nessus',
          source_type: 'Nessus',
          status: 'Open',
          port: vuln.port || undefined,
          protocol: vuln.protocol || undefined,
          solution: vulnDetails?.solution || undefined,
          references: vulnDetails?.see_also || undefined,
          raw_data: {
            plugin_id: vuln.plugin_id,
            plugin_name: vuln.plugin_name,
            plugin_family: vuln.plugin_family,
            count: vuln.count,
            vuln_index: vuln.vuln_index,
            severity_index: vuln.severity_index,
            details: vulnDetails
          }
        };

        vulnerabilities.push(vulnerability);
      }

      return vulnerabilities;
    } catch (error) {
      console.error('Failed to get host vulnerabilities:', error);
      return [];
    }
  }

  private async getVulnerabilityDetails(scanId: string, hostId: string, pluginId: string): Promise<any> {
    if (!this.token) return null;

    try {
      const url = `${this.credentials.server}/scans/${scanId}/hosts/${hostId}/plugins/${pluginId}`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'X-Cookie': `token=${this.token}`
        }
      });

      return response.info || null;
    } catch (error) {
      console.error('Failed to get vulnerability details:', error);
      return null;
    }
  }

  private mapNessusSeverity(nessusSeverity: number): 'Critical' | 'High' | 'Medium' | 'Low' | 'Info' {
    switch (nessusSeverity) {
      case 4: return 'Critical';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      case 0: return 'Info';
      default: return 'Info';
    }
  }
}