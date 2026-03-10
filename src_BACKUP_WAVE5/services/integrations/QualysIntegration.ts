import { BaseIntegration, IntegrationCredentials, VulnerabilityData, ImportResult } from './BaseIntegration';
import { XMLParser } from 'fast-xml-parser';

export interface QualysCredentials extends IntegrationCredentials {
  server: string; // qualysapi.qualys.com, qualysapi.qualys.eu, etc.
  username: string;
  password: string;
  scanRef?: string; // scan reference ID
}

export class QualysIntegration extends BaseIntegration {
  private credentials: QualysCredentials;
  private xmlParser: XMLParser;

  constructor(credentials: QualysCredentials) {
    super(credentials);
    this.credentials = credentials;
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text'
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `https://${this.credentials.server}/api/2.0/fo/session/`;
      const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');

      const response = await this.makeHttpRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'action=login'
      });

      // Check if login was successful
      return response.includes('<RETURN status="SUCCESS"/>') || response.includes('session_id');
    } catch (error) {
      console.error('Qualys connection test failed:', error);
      return false;
    }
  }

  async importVulnerabilities(filters?: {
    severityFilter?: string;
    scanRef?: string;
    assetGroup?: string;
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
      // Step 1: Login to get session
      const sessionId = await this.login();
      if (!sessionId) {
        throw new Error('Failed to authenticate with Qualys');
      }

      // Step 2: Get vulnerability detections
      const vulnerabilities = await this.getVulnerabilityDetections(sessionId, filters);
      
      result.total_found = vulnerabilities.length;
      result.vulnerabilities = vulnerabilities;

      // Step 3: Logout
      await this.logout(sessionId);

      result.success = true;
      result.imported = vulnerabilities.length;

      return result;
    } catch (error) {
      console.error('Qualys import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async login(): Promise<string | null> {
    try {
      const url = `https://${this.credentials.server}/api/2.0/fo/session/`;
      const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');

      const response = await this.makeHttpRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'action=login'
      });

      // Parse XML response to extract session ID
      const parsed = this.xmlParser.parse(response);
      
      if (parsed.SIMPLE_RETURN?.RESPONSE?.RETURN?.['@_status'] === 'SUCCESS') {
        // Extract session ID from Set-Cookie header or response
        const sessionMatch = response.match(/QualysSession=([^;]+)/);
        return sessionMatch ? sessionMatch[1] : 'authenticated';
      }

      return null;
    } catch (error) {
      console.error('Qualys login failed:', error);
      return null;
    }
  }

  private async logout(sessionId: string): Promise<void> {
    try {
      const url = `https://${this.credentials.server}/api/2.0/fo/session/`;
      
      await this.makeHttpRequest(url, {
        method: 'POST',
        headers: {
          'Cookie': `QualysSession=${sessionId}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'action=logout'
      });
    } catch (error) {
      console.error('Qualys logout failed:', error);
    }
  }

  private async getVulnerabilityDetections(
    sessionId: string, 
    filters?: any
  ): Promise<VulnerabilityData[]> {
    try {
      let url = `https://${this.credentials.server}/api/2.0/fo/asset/host/vm/detection/`;
      
      // Build query parameters
      const params = new URLSearchParams({
        action: 'list',
        output_format: 'XML',
        show_results: '1',
        show_igs: '1'
      });

      // Apply filters
      if (filters?.severityFilter && filters.severityFilter !== 'all') {
        if (filters.severityFilter === 'critical') {
          params.append('severities', '5');
        } else if (filters.severityFilter === 'high-critical') {
          params.append('severities', '4,5');
        }
      }

      if (filters?.scanRef) {
        params.append('vm_scan_date_after', filters.scanRef);
      }

      if (filters?.maxResults) {
        params.append('truncation_limit', filters.maxResults.toString());
      }

      url += '?' + params.toString();

      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Cookie': `QualysSession=${sessionId}`
        }
      });

      return this.parseQualysXML(response);
    } catch (error) {
      console.error('Failed to get Qualys detections:', error);
      throw error;
    }
  }

  private parseQualysXML(xmlData: string): VulnerabilityData[] {
    try {
      const parsed = this.xmlParser.parse(xmlData);
      const vulnerabilities: VulnerabilityData[] = [];

      // Navigate through Qualys XML structure
      const hostList = parsed.HOST_LIST_VM_DETECTION_OUTPUT?.RESPONSE?.HOST_LIST?.HOST;
      
      if (!hostList) {
        return vulnerabilities;
      }

      const hosts = Array.isArray(hostList) ? hostList : [hostList];

      hosts.forEach(host => {
        const hostIp = host.IP || 'Unknown';
        const hostName = host.DNS || host.NETBIOS || hostIp;
        
        const detectionList = host.DETECTION_LIST?.DETECTION;
        if (!detectionList) return;

        const detections = Array.isArray(detectionList) ? detectionList : [detectionList];

        detections.forEach(detection => {
          const vulnerability: VulnerabilityData = {
            id: `qualys-${detection.QID}-${hostIp}-${Date.now()}`,
            title: detection.TITLE || `Qualys QID ${detection.QID}`,
            description: detection.DIAGNOSIS || detection.CONSEQUENCE || '',
            severity: this.mapQualysSeverity(detection.SEVERITY),
            cvss_score: detection.CVSS_BASE ? parseFloat(detection.CVSS_BASE) : undefined,
            cve_id: detection.CVE_ID || undefined,
            asset_name: hostName,
            asset_ip: hostIp,
            source_tool: 'Qualys VMDR',
            source_type: 'Qualys',
            status: 'Open',
            first_found: detection.FIRST_FOUND_DATETIME ? new Date(detection.FIRST_FOUND_DATETIME) : undefined,
            last_found: detection.LAST_FOUND_DATETIME ? new Date(detection.LAST_FOUND_DATETIME) : undefined,
            port: detection.PORT ? parseInt(detection.PORT) : undefined,
            protocol: detection.PROTOCOL || undefined,
            solution: detection.SOLUTION || undefined,
            references: detection.VENDOR_REFERENCE ? [detection.VENDOR_REFERENCE] : undefined,
            raw_data: {
              qid: detection.QID,
              type: detection.TYPE,
              severity: detection.SEVERITY,
              ssl: detection.SSL,
              results: detection.RESULTS,
              status: detection.STATUS,
              times_found: detection.TIMES_FOUND,
              last_test_datetime: detection.LAST_TEST_DATETIME,
              last_update_datetime: detection.LAST_UPDATE_DATETIME,
              is_ignored: detection.IS_IGNORED,
              is_disabled: detection.IS_DISABLED
            }
          };

          vulnerabilities.push(vulnerability);
        });
      });

      return vulnerabilities;
    } catch (error) {
      console.error('Failed to parse Qualys XML:', error);
      throw new Error('Failed to parse Qualys response');
    }
  }

  private mapQualysSeverity(qualysSeverity: string | number): 'Critical' | 'High' | 'Medium' | 'Low' | 'Info' {
    const severity = parseInt(qualysSeverity?.toString() || '0');
    
    switch (severity) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      case 1: return 'Info';
      default: return 'Info';
    }
  }
}