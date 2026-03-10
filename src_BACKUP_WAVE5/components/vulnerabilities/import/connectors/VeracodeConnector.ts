// =====================================================
// VERACODE CONNECTOR
// =====================================================
// Integração com Veracode REST API
// Documentação: https://docs.veracode.com/r/c_rest_api

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface VeracodeFinding {
  issue_id: number;
  scan_type: string;
  description: string;
  count: number;
  context_type: string;
  context_guid: string;
  violates_policy: boolean;
  finding_status: {
    first_found_date: string;
    status: string;
    resolution: string;
    mitigation_review_status: string;
    new: boolean;
    resolution_status: string;
  };
  finding_details: {
    severity: number;
    cwe: {
      id: string;
      name: string;
      href: string;
    };
    file_path: string;
    file_name: string;
    file_line_number: number;
    module: string;
    relative_location: number;
    finding_category: {
      id: string;
      name: string;
      href: string;
    };
  };
  build_id: number;
}

export interface VeracodeApplication {
  guid: string;
  id: number;
  account_id: number;
  name: string;
  description: string;
  business_criticality: string;
  policy: {
    guid: string;
    name: string;
    href: string;
  };
  teams: any[];
  tags: string;
  custom_fields: any[];
  archer_app_name: string;
  profile: {
    name: string;
    description: string;
    policies: any[];
  };
}

export interface VeracodeScan {
  scan_id: string;
  account_id: number;
  app_id: number;
  platform: string;
  scan_type: string;
  analysis_type: string;
  status: string;
  submitter: string;
  submitted_date: string;
  published_date: string;
  version: string;
  auto_scan: boolean;
  scan_exit_status_id: number;
  scan_exit_status_desc: string;
  grace_period_expired: boolean;
  legacy_scan_engine: boolean;
}

export class VeracodeConnector {
  private baseUrl: string;
  private apiId: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || 'https://api.veracode.com';
    this.apiId = config.api_id || config.username || '';
    this.apiKey = config.api_key || config.password || '';
    
    if (!this.apiId || !this.apiKey) {
      throw new Error('API ID e API Key são obrigatórios para Veracode');
    }

    // Remover trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');

    this.headers = {
      'Authorization': this.generateAuthHeader(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Gera header de autenticação HMAC para Veracode
   */
  private generateAuthHeader(): string {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    // Simplificação: Em produção, usar biblioteca oficial para HMAC-SHA256
    const signature = `${this.apiId}:${timestamp}:${nonce}`;
    
    return `VERACODE-HMAC-SHA-256 id=${this.apiId},ts=${timestamp},nonce=${nonce},sig=${signature}`;
  }

  /**
   * Testa a conectividade com a API do Veracode
   */
  async testConnection(): Promise<APIResponse> {
    try {
      // Testar com endpoint de aplicações
      const response = await this.makeRequest('/appsec/v1/applications?size=1');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          total_applications: response.page?.total_elements || 0,
          api_version: 'REST API v1'
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
   * Lista aplicações disponíveis
   */
  async getApplications(options: {
    name?: string;
    policy?: string;
    business_criticality?: string;
    page?: number;
    size?: number;
  } = {}): Promise<APIResponse<VeracodeApplication[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.name) {
        params.append('name', options.name);
      }
      
      if (options.policy) {
        params.append('policy', options.policy);
      }
      
      if (options.business_criticality) {
        params.append('business_criticality', options.business_criticality);
      }
      
      params.append('page', (options.page || 0).toString());
      params.append('size', (options.size || 100).toString());

      const response = await this.makeRequest(`/appsec/v1/applications?${params.toString()}`);
      
      return {
        success: true,
        data: response._embedded?.applications || [],
        pagination: {
          page: response.page?.number || 0,
          size: response.page?.size || 100,
          total: response.page?.total_elements || 0,
          total_pages: response.page?.total_pages || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter aplicações'
      };
    }
  }

  /**
   * Obtém scans de uma aplicação
   */
  async getApplicationScans(appGuid: string): Promise<APIResponse<VeracodeScan[]>> {
    try {
      const response = await this.makeRequest(`/appsec/v1/applications/${appGuid}/scans`);
      
      return {
        success: true,
        data: response._embedded?.scans || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter scans da aplicação'
      };
    }
  }

  /**
   * Obtém findings (vulnerabilidades) de uma aplicação
   */
  async getApplicationFindings(appGuid: string, options: {
    scan_type?: string[];
    finding_status?: string[];
    severity?: number[];
    cwe_id?: string[];
    page?: number;
    size?: number;
  } = {}): Promise<APIResponse<VeracodeFinding[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.scan_type?.length) {
        options.scan_type.forEach(type => params.append('scan_type', type));
      }
      
      if (options.finding_status?.length) {
        options.finding_status.forEach(status => params.append('finding_status', status));
      }
      
      if (options.severity?.length) {
        options.severity.forEach(sev => params.append('severity', sev.toString()));
      }
      
      if (options.cwe_id?.length) {
        options.cwe_id.forEach(cwe => params.append('cwe_id', cwe));
      }
      
      params.append('page', (options.page || 0).toString());
      params.append('size', (options.size || 100).toString());

      const response = await this.makeRequest(
        `/appsec/v1/applications/${appGuid}/findings?${params.toString()}`
      );
      
      return {
        success: true,
        data: response._embedded?.findings || [],
        pagination: {
          page: response.page?.number || 0,
          size: response.page?.size || 100,
          total: response.page?.total_elements || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter findings da aplicação'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades de todas as aplicações
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allFindings: VeracodeFinding[] = [];
      
      // Obter todas as aplicações
      const appsResponse = await this.getApplications({ size: 500 });
      if (!appsResponse.success || !appsResponse.data) {
        throw new Error('Erro ao obter aplicações');
      }

      // Para cada aplicação, obter findings
      for (const app of appsResponse.data) {
        let page = 0;
        let hasMore = true;

        while (hasMore) {
          const findingsResponse = await this.getApplicationFindings(app.guid, {
            finding_status: ['OPEN', 'NEW'],
            page,
            size: 100
          });

          if (!findingsResponse.success || !findingsResponse.data) {
            console.warn(`Erro ao obter findings da aplicação ${app.name}`);
            break;
          }

          // Adicionar informações da aplicação aos findings
          const enrichedFindings = findingsResponse.data.map(finding => ({
            ...finding,
            application: app
          }));

          allFindings.push(...enrichedFindings);

          hasMore = findingsResponse.data.length === 100;
          page++;

          // Limite de segurança por aplicação
          if (page > 50) {
            console.warn(`Limite de páginas atingido para aplicação ${app.name}`);
            break;
          }
        }

        // Limite total de findings
        if (allFindings.length > 10000) {
          console.warn('Limite total de findings atingido (10.000)');
          break;
        }
      }

      // Converter para formato padrão
      const vulnerabilities = allFindings.map(finding => this.parseVeracodeFinding(finding));

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
   * Converte finding do Veracode para formato padrão
   */
  private parseVeracodeFinding(finding: VeracodeFinding & { application?: VeracodeApplication }): ParsedVulnerability {
    const severity = this.mapVeracodeSeverity(finding.finding_details.severity);
    
    return {
      raw_data: finding,
      title: `${finding.finding_details.cwe.name} - ${finding.finding_details.file_name}`,
      description: finding.description,
      severity,
      cwe_id: finding.finding_details.cwe.id,
      asset_name: finding.application?.name || `Build ${finding.build_id}`,
      source_tool: 'Veracode',
      plugin_id: finding.issue_id.toString(),
      port: finding.finding_details.file_line_number,
      references: [finding.finding_details.cwe.href],
      first_found: new Date(finding.finding_status.first_found_date),
      is_valid: this.validateVeracodeFinding(finding),
      validation_errors: this.getValidationErrors(finding),
      validation_warnings: this.getValidationWarnings(finding)
    };
  }

  /**
   * Mapeia severidade do Veracode para formato padrão
   */
  private mapVeracodeSeverity(severity: number): string {
    switch (severity) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      case 1: return 'Info';
      case 0: return 'Info';
      default: return 'Info';
    }
  }

  /**
   * Valida finding do Veracode
   */
  private validateVeracodeFinding(finding: VeracodeFinding): boolean {
    return !!(
      finding.issue_id && 
      finding.description && 
      finding.finding_details?.severity !== undefined &&
      finding.finding_details?.cwe?.id
    );
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(finding: VeracodeFinding): string[] {
    const errors: string[] = [];
    
    if (!finding.issue_id) {
      errors.push('ID do issue não encontrado');
    }
    
    if (!finding.description) {
      errors.push('Descrição não encontrada');
    }
    
    if (finding.finding_details?.severity === undefined) {
      errors.push('Severidade não encontrada');
    }
    
    if (!finding.finding_details?.cwe?.id) {
      errors.push('CWE ID não encontrado');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(finding: VeracodeFinding): string[] {
    const warnings: string[] = [];
    
    if (!finding.finding_details?.file_name) {
      warnings.push('Nome do arquivo não encontrado');
    }
    
    if (!finding.finding_details?.file_line_number) {
      warnings.push('Número da linha não encontrado');
    }
    
    if (!finding.finding_details?.module) {
      warnings.push('Módulo não encontrado');
    }
    
    return warnings;
  }

  /**
   * Faz requisição autenticada para a API
   */
  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    // Regenerar header de autenticação para cada requisição
    const headers = {
      ...this.headers,
      'Authorization': this.generateAuthHeader(),
      ...options.headers
    };
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      ...options
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error_description) {
          errorMessage = errorData.error_description;
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
   * Obtém estatísticas de segurança
   */
  async getSecurityStatistics(appGuid: string): Promise<APIResponse<any>> {
    try {
      const response = await this.makeRequest(`/appsec/v1/applications/${appGuid}/summary_report`);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter estatísticas de segurança'
      };
    }
  }
}

/**
 * Função utilitária para criar instância do conector Veracode
 */
export const createVeracodeConnector = (config: ConnectionConfig): VeracodeConnector => {
  return new VeracodeConnector(config);
};

/**
 * Função para testar conexão com Veracode
 */
export const testVeracodeConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createVeracodeConnector(config);
  return await connector.testConnection();
};