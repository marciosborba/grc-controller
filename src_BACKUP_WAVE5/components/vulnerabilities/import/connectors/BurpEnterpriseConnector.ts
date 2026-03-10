// =====================================================
// BURP SUITE ENTERPRISE CONNECTOR
// =====================================================
// Integração com Burp Suite Enterprise API
// Documentação: https://portswigger.net/burp/documentation/enterprise/api-documentation

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface BurpIssue {
  issue_id: string;
  issue_type_id: string;
  issue_type: {
    name: string;
    description_html: string;
    remediation_html: string;
    references_html: string;
    vulnerability_classifications_html: string;
    type_index: number;
  };
  confidence: string;
  severity: string;
  caption: string;
  description_html: string;
  remediation_html: string;
  vulnerability_classifications_html: string;
  request_response: {
    url: string;
    method: string;
    edited: boolean;
    request: string;
    response: string;
    was_redirect_followed: boolean;
  };
  proof_of_concept: string;
  background: string;
  remediation_background: string;
  references: string;
  vulnerability_classifications: string;
  display_confidence: string;
  internal_data: string;
  serial_number: string;
  origin: string;
  generated_by_extension: boolean;
  path: string;
  location: string;
  host: string;
  protocol: string;
  evidence: {
    request_response: {
      url: string;
      method: string;
      edited: boolean;
      request: string;
      response: string;
      was_redirect_followed: boolean;
    };
    inference_type: string;
    name: string;
    value: string;
  }[];
}

export interface BurpScan {
  id: string;
  site_id: string;
  name: string;
  status: string;
  scan_configurations: {
    id: string;
    name: string;
    type: string;
  }[];
  schedule: {
    initial_run_time: string;
    rrule: string;
  };
  scope: {
    included_urls: string[];
    excluded_urls: string[];
    protocol_options: string;
    max_crawl_requests: number;
    max_audit_requests: number;
    max_crawl_depth: number;
  };
  application_logins: {
    id: string;
    label: string;
    username: string;
    password: string;
    type: string;
  }[];
  scan_report_url: string;
  issue_counts: {
    total: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  start_time: string;
  end_time: string;
  duration_in_seconds: number;
  generated_by: string;
}

export interface BurpSite {
  id: string;
  name: string;
  scope: {
    included_urls: string[];
    excluded_urls: string[];
    protocol_options: string;
  };
  application_logins: {
    id: string;
    label: string;
    username: string;
    password: string;
    type: string;
  }[];
  scan_configurations: {
    id: string;
    name: string;
    type: string;
  }[];
  extensions: {
    id: string;
    name: string;
    type: string;
  }[];
  parent_id: string;
  created_by: string;
  created_time: string;
}

export class BurpEnterpriseConnector {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || '';
    this.apiKey = config.api_key || config.password || '';
    
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('URL da API e API Key são obrigatórios para Burp Suite Enterprise');
    }

    // Remover trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');

    this.headers = {
      'Authorization': `ApiKey ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Testa a conectividade com a API do Burp Suite Enterprise
   */
  async testConnection(): Promise<APIResponse> {
    try {
      // Testar com endpoint de sites
      const response = await this.makeRequest('/api/v1/sites?limit=1');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          total_sites: response.total || 0,
          api_version: 'Burp Suite Enterprise API v1'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista sites disponíveis
   */
  async getSites(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<BurpSite[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      
      if (options.offset) {
        params.append('offset', options.offset.toString());
      }

      const response = await this.makeRequest(`/api/v1/sites?${params.toString()}`);
      
      return {
        success: true,
        data: response.sites || [],
        pagination: {
          total: response.total || 0,
          limit: options.limit || 100,
          offset: options.offset || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter sites'
      };
    }
  }

  /**
   * Obtém scans de um site
   */
  async getSiteScans(siteId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<BurpScan[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      
      if (options.offset) {
        params.append('offset', options.offset.toString());
      }

      const response = await this.makeRequest(`/api/v1/sites/${siteId}/scans?${params.toString()}`);
      
      return {
        success: true,
        data: response.scans || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter scans do site'
      };
    }
  }

  /**
   * Obtém issues de um scan
   */
  async getScanIssues(scanId: string, options: {
    severity?: string[];
    confidence?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<BurpIssue[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.severity?.length) {
        options.severity.forEach(sev => params.append('severity', sev));
      }
      
      if (options.confidence?.length) {
        options.confidence.forEach(conf => params.append('confidence', conf));
      }
      
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }
      
      if (options.offset) {
        params.append('offset', options.offset.toString());
      }

      const response = await this.makeRequest(`/api/v1/scans/${scanId}/issues?${params.toString()}`);
      
      return {
        success: true,
        data: response.issues || [],
        pagination: {
          total: response.total || 0,
          limit: options.limit || 100,
          offset: options.offset || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter issues do scan'
      };
    }
  }

  /**
   * Obtém detalhes de um issue específico
   */
  async getIssueDetails(issueId: string): Promise<APIResponse<BurpIssue>> {
    try {
      const response = await this.makeRequest(`/api/v1/issues/${issueId}`);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detalhes do issue'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades de todos os sites
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allIssues: BurpIssue[] = [];
      
      // Obter todos os sites
      const sitesResponse = await this.getSites({ limit: 100 });
      if (!sitesResponse.success || !sitesResponse.data) {
        throw new Error('Erro ao obter sites');
      }

      // Para cada site, obter scans e issues
      for (const site of sitesResponse.data) {
        const scansResponse = await this.getSiteScans(site.id, { limit: 50 });
        
        if (!scansResponse.success || !scansResponse.data) {
          console.warn(`Erro ao obter scans do site ${site.name}`);
          continue;
        }

        // Para cada scan, obter issues
        for (const scan of scansResponse.data) {
          if (scan.status !== 'succeeded') {
            continue; // Apenas scans concluídos
          }

          let offset = 0;
          let hasMore = true;
          const pageSize = 100;

          while (hasMore) {
            const issuesResponse = await this.getScanIssues(scan.id, {
              severity: ['high', 'medium'], // Apenas severidades relevantes
              offset,
              limit: pageSize
            });

            if (!issuesResponse.success || !issuesResponse.data) {
              console.warn(`Erro ao obter issues do scan ${scan.id}`);
              break;
            }

            // Adicionar informações do site e scan aos issues
            const enrichedIssues = issuesResponse.data.map(issue => ({
              ...issue,
              site,
              scan
            }));

            allIssues.push(...enrichedIssues);

            hasMore = issuesResponse.data.length === pageSize;
            offset += pageSize;

            // Limite de segurança por scan
            if (offset > 1000) {
              console.warn(`Limite de issues atingido para scan ${scan.id}`);
              break;
            }
          }

          // Limite total de issues
          if (allIssues.length > 10000) {
            console.warn('Limite total de issues atingido (10.000)');
            break;
          }
        }

        if (allIssues.length > 10000) break;
      }

      // Converter para formato padrão
      const vulnerabilities = allIssues.map(issue => this.parseBurpIssue(issue));

      return {
        success: true,
        data: vulnerabilities
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter todas as vulnerabilidades'
      };
    }
  }

  /**
   * Converte issue do Burp para formato padrão
   */
  private parseBurpIssue(issue: BurpIssue & { site?: BurpSite; scan?: BurpScan }): ParsedVulnerability {
    const severity = this.mapBurpSeverity(issue.severity);
    const url = new URL(issue.request_response?.url || 'http://unknown');
    
    return {
      raw_data: issue,
      title: `${issue.issue_type?.name || 'Security Issue'} - ${issue.caption}`,
      description: this.stripHtml(issue.description_html || issue.issue_type?.description_html || ''),
      severity,
      asset_name: url.hostname,
      asset_ip: url.hostname,
      port: url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80),
      protocol: url.protocol.replace(':', ''),
      source_tool: 'Burp Suite Enterprise',
      plugin_id: issue.issue_type_id,
      solution: this.stripHtml(issue.remediation_html || issue.issue_type?.remediation_html || ''),
      references: issue.references ? [issue.references] : [],
      first_found: issue.scan?.start_time ? new Date(issue.scan.start_time) : undefined,
      last_found: issue.scan?.end_time ? new Date(issue.scan.end_time) : undefined,
      is_valid: this.validateBurpIssue(issue),
      validation_errors: this.getValidationErrors(issue),
      validation_warnings: this.getValidationWarnings(issue)
    };
  }

  /**
   * Remove tags HTML de uma string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Mapeia severidade do Burp para formato padrão
   */
  private mapBurpSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'info': 'Info'
    };
    
    return severityMap[severity.toLowerCase()] || 'Info';
  }

  /**
   * Valida issue do Burp
   */
  private validateBurpIssue(issue: BurpIssue): boolean {
    return !!(issue.issue_id && issue.issue_type?.name && issue.severity);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(issue: BurpIssue): string[] {
    const errors: string[] = [];
    
    if (!issue.issue_id) {
      errors.push('ID do issue não encontrado');
    }
    
    if (!issue.issue_type?.name) {
      errors.push('Tipo do issue não encontrado');
    }
    
    if (!issue.severity) {
      errors.push('Severidade não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(issue: BurpIssue): string[] {
    const warnings: string[] = [];
    
    if (!issue.description_html && !issue.issue_type?.description_html) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!issue.remediation_html && !issue.issue_type?.remediation_html) {
      warnings.push('Remediação não encontrada');
    }
    
    if (!issue.request_response?.url) {
      warnings.push('URL não encontrada');
    }
    
    return warnings;
  }

  /**
   * Faz requisição autenticada para a API
   */
  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        ...this.headers,
        ...options.headers
      },
      body: options.body,
      ...options
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Usar mensagem padrão se não conseguir parsear JSON
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  /**
   * Obtém estatísticas de scans
   */
  async getScanStatistics(): Promise<APIResponse<any>> {
    try {
      const sitesResponse = await this.getSites({ limit: 1 });
      
      const stats = {
        total_sites: sitesResponse.pagination?.total || 0
      };
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter estatísticas'
      };
    }
  }
}

/**
 * Função utilitária para criar instância do conector Burp Enterprise
 */
export const createBurpEnterpriseConnector = (config: ConnectionConfig): BurpEnterpriseConnector => {
  return new BurpEnterpriseConnector(config);
};

/**
 * Função para testar conexão com Burp Suite Enterprise
 */
export const testBurpEnterpriseConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createBurpEnterpriseConnector(config);
  return await connector.testConnection();
};