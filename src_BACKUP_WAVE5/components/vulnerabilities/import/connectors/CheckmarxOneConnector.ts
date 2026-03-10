// =====================================================
// CHECKMARX ONE CONNECTOR
// =====================================================
// Integração com Checkmarx One API
// Documentação: https://checkmarx.com/resource/documents/en/34965-68702-checkmarx-one-api-guide.html

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface CheckmarxResult {
  id: string;
  similarityId: string;
  status: string;
  state: string;
  severity: string;
  created: string;
  firstFoundAt: string;
  foundAt: string;
  firstScanId: string;
  description: string;
  data: {
    queryId: number;
    queryName: string;
    group: string;
    resultHash: string;
    languageName: string;
    nodes: {
      id: string;
      line: number;
      name: string;
      column: number;
      length: number;
      method: string;
      nodeID: number;
      domType: string;
      fileName: string;
      fullName: string;
      typeName: string;
      methodLine: number;
      definitions: string;
    }[];
  };
  type: string;
  comments: any[];
  vulnerabilityDetails: {
    cweId: number;
    cweDescription: string;
    compliances: string[];
  };
}

export interface CheckmarxProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  groups: string[];
  tags: Record<string, string>;
  repoUrl: string;
  mainBranch: string;
  origin: string;
  criticality: number;
  privatePackage: boolean;
  scannerTypes: string[];
}

export interface CheckmarxScan {
  id: string;
  status: string;
  statusDetails: {
    name: string;
    details: string;
  }[];
  branch: string;
  createdAt: string;
  updatedAt: string;
  runId: string;
  projectId: string;
  projectName: string;
  userAgent: string;
  initiator: string;
  tags: Record<string, string>;
  metadata: {
    type: string;
    configs: any[];
  };
  engines: string[];
  sourceType: string;
  sourceOrigin: string;
}

export class CheckmarxOneConnector {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || 'https://ast.checkmarx.net';
    this.clientId = config.client_id || config.username || '';
    this.clientSecret = config.client_secret || config.password || '';
    
    if (!this.baseUrl || !this.clientId || !this.clientSecret) {
      throw new Error('URL da API, Client ID e Client Secret são obrigatórios para Checkmarx One');
    }

    // Remover trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  /**
   * Autentica na API do Checkmarx One usando OAuth 2.0
   */
  async authenticate(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return; // Token ainda válido
    }

    const response = await fetch(`${this.baseUrl}/auth/identity/connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'ast-api'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro de autenticação: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    
    // Definir expiração com margem de segurança (5 minutos antes)
    const expiresIn = (data.expires_in || 3600) - 300;
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
  }

  /**
   * Testa a conectividade com a API do Checkmarx One
   */
  async testConnection(): Promise<APIResponse> {
    try {
      await this.authenticate();
      
      // Testar com endpoint de projetos
      const response = await this.makeRequest('/api/projects?limit=1');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          total_projects: response.totalCount || 0,
          api_version: 'Checkmarx One API'
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
   * Lista projetos disponíveis
   */
  async getProjects(options: {
    name?: string;
    tags?: Record<string, string>;
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<CheckmarxProject[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.name) {
        params.append('name', options.name);
      }
      
      if (options.tags) {
        Object.entries(options.tags).forEach(([key, value]) => {
          params.append(`tags[${key}]`, value);
        });
      }
      
      params.append('limit', (options.limit || 100).toString());
      params.append('offset', (options.offset || 0).toString());

      const response = await this.makeRequest(`/api/projects?${params.toString()}`);
      
      return {
        success: true,
        data: response.projects || [],
        pagination: {
          total: response.totalCount || 0,
          limit: options.limit || 100,
          offset: options.offset || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter projetos'
      };
    }
  }

  /**
   * Obtém scans de um projeto
   */
  async getProjectScans(projectId: string, options: {
    status?: string[];
    branch?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<CheckmarxScan[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.status?.length) {
        options.status.forEach(status => params.append('statuses', status));
      }
      
      if (options.branch) {
        params.append('branch', options.branch);
      }
      
      params.append('limit', (options.limit || 100).toString());
      params.append('offset', (options.offset || 0).toString());

      const response = await this.makeRequest(
        `/api/scans?project-id=${projectId}&${params.toString()}`
      );
      
      return {
        success: true,
        data: response.scans || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter scans do projeto'
      };
    }
  }

  /**
   * Obtém resultados (vulnerabilidades) de um scan
   */
  async getScanResults(scanId: string, options: {
    state?: string[];
    severity?: string[];
    status?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<APIResponse<CheckmarxResult[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.state?.length) {
        options.state.forEach(state => params.append('state', state));
      }
      
      if (options.severity?.length) {
        options.severity.forEach(sev => params.append('severity', sev));
      }
      
      if (options.status?.length) {
        options.status.forEach(status => params.append('status', status));
      }
      
      params.append('limit', (options.limit || 100).toString());
      params.append('offset', (options.offset || 0).toString());

      const response = await this.makeRequest(
        `/api/results?scan-id=${scanId}&${params.toString()}`
      );
      
      return {
        success: true,
        data: response.results || [],
        pagination: {
          total: response.totalCount || 0,
          limit: options.limit || 100,
          offset: options.offset || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter resultados do scan'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades de todos os projetos
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allResults: CheckmarxResult[] = [];
      
      // Obter todos os projetos
      const projectsResponse = await this.getProjects({ limit: 500 });
      if (!projectsResponse.success || !projectsResponse.data) {
        throw new Error('Erro ao obter projetos');
      }

      // Para cada projeto, obter scans e resultados
      for (const project of projectsResponse.data) {
        const scansResponse = await this.getProjectScans(project.id, {
          status: ['Completed'],
          limit: 10 // Últimos 10 scans por projeto
        });

        if (!scansResponse.success || !scansResponse.data) {
          console.warn(`Erro ao obter scans do projeto ${project.name}`);
          continue;
        }

        // Para cada scan, obter resultados
        for (const scan of scansResponse.data) {
          let offset = 0;
          let hasMore = true;

          while (hasMore) {
            const resultsResponse = await this.getScanResults(scan.id, {
              state: ['TO_VERIFY', 'CONFIRMED'],
              offset,
              limit: 100
            });

            if (!resultsResponse.success || !resultsResponse.data) {
              console.warn(`Erro ao obter resultados do scan ${scan.id}`);
              break;
            }

            // Adicionar informações do projeto e scan aos resultados
            const enrichedResults = resultsResponse.data.map(result => ({
              ...result,
              project,
              scan
            }));

            allResults.push(...enrichedResults);

            hasMore = resultsResponse.data.length === 100;
            offset += 100;

            // Limite de segurança por scan
            if (offset > 1000) {
              console.warn(`Limite de resultados atingido para scan ${scan.id}`);
              break;
            }
          }

          // Limite total de resultados
          if (allResults.length > 10000) {
            console.warn('Limite total de resultados atingido (10.000)');
            break;
          }
        }

        if (allResults.length > 10000) break;
      }

      // Converter para formato padrão
      const vulnerabilities = allResults.map(result => this.parseCheckmarxResult(result));

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
   * Converte resultado do Checkmarx One para formato padrão
   */
  private parseCheckmarxResult(result: CheckmarxResult & { 
    project?: CheckmarxProject; 
    scan?: CheckmarxScan; 
  }): ParsedVulnerability {
    const severity = this.mapCheckmarxSeverity(result.severity);
    const firstNode = result.data?.nodes?.[0];
    
    return {
      raw_data: result,
      title: `${result.data?.queryName || 'Security Issue'} - ${firstNode?.fileName || 'Unknown File'}`,
      description: result.description || result.data?.queryName || '',
      severity,
      cwe_id: result.vulnerabilityDetails?.cweId?.toString(),
      asset_name: result.project?.name || `Scan ${result.firstScanId}`,
      source_tool: 'Checkmarx One',
      plugin_id: result.data?.queryId?.toString() || result.id,
      port: firstNode?.line,
      references: result.vulnerabilityDetails?.compliances || [],
      first_found: new Date(result.firstFoundAt),
      last_found: new Date(result.foundAt),
      is_valid: this.validateCheckmarxResult(result),
      validation_errors: this.getValidationErrors(result),
      validation_warnings: this.getValidationWarnings(result)
    };
  }

  /**
   * Mapeia severidade do Checkmarx One para formato padrão
   */
  private mapCheckmarxSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'CRITICAL': 'Critical',
      'HIGH': 'High',
      'MEDIUM': 'Medium',
      'LOW': 'Low',
      'INFO': 'Info'
    };
    
    return severityMap[severity.toUpperCase()] || 'Info';
  }

  /**
   * Valida resultado do Checkmarx One
   */
  private validateCheckmarxResult(result: CheckmarxResult): boolean {
    return !!(result.id && result.severity && result.data?.queryName);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(result: CheckmarxResult): string[] {
    const errors: string[] = [];
    
    if (!result.id) {
      errors.push('ID do resultado não encontrado');
    }
    
    if (!result.severity) {
      errors.push('Severidade não encontrada');
    }
    
    if (!result.data?.queryName) {
      errors.push('Nome da query não encontrado');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(result: CheckmarxResult): string[] {
    const warnings: string[] = [];
    
    if (!result.description) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!result.data?.nodes?.length) {
      warnings.push('Nós de código não encontrados');
    }
    
    if (!result.vulnerabilityDetails?.cweId) {
      warnings.push('CWE ID não encontrado');
    }
    
    return warnings;
  }

  /**
   * Faz requisição autenticada para a API
   */
  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    await this.authenticate();
    
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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
   * Obtém estatísticas de segurança de um projeto
   */
  async getProjectStatistics(projectId: string): Promise<APIResponse<any>> {
    try {
      const response = await this.makeRequest(`/api/reports/sastScan?project-id=${projectId}`);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter estatísticas do projeto'
      };
    }
  }
}

/**
 * Função utilitária para criar instância do conector Checkmarx One
 */
export const createCheckmarxOneConnector = (config: ConnectionConfig): CheckmarxOneConnector => {
  return new CheckmarxOneConnector(config);
};

/**
 * Função para testar conexão com Checkmarx One
 */
export const testCheckmarxOneConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createCheckmarxOneConnector(config);
  return await connector.testConnection();
};