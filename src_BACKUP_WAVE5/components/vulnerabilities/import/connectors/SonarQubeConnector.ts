// =====================================================
// SONARQUBE CONNECTOR
// =====================================================
// Integração com SonarQube Web API
// Documentação: https://docs.sonarqube.org/latest/extend/web-api/

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface SonarQubeIssue {
  key: string;
  rule: string;
  severity: string;
  component: string;
  project: string;
  line?: number;
  hash: string;
  textRange?: {
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
  };
  flows: any[];
  status: string;
  message: string;
  effort?: string;
  debt?: string;
  author?: string;
  tags: string[];
  creationDate: string;
  updateDate: string;
  type: string;
  scope: string;
  quickFixAvailable: boolean;
  messageFormattings: any[];
}

export interface SonarQubeRule {
  key: string;
  name: string;
  status: string;
  lang: string;
  langName: string;
  htmlDesc: string;
  mdDesc: string;
  severity: string;
  type: string;
  tags: string[];
  sysTags: string[];
  params: any[];
  defaultDebtRemFnType: string;
  defaultDebtRemFnGapMultiplier: string;
  gapDescription: string;
  htmlNote: string;
  mdNote: string;
  noteLogin: string;
  remediation: {
    func: string;
    constantCost: string;
    linearDesc: string;
    linearOffset: string;
    linearFactor: string;
  };
}

export class SonarQubeConnector {
  private baseUrl: string;
  private token: string;
  private headers: Record<string, string>;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || '';
    this.token = config.token || config.api_key || '';
    
    if (!this.baseUrl || !this.token) {
      throw new Error('URL da API e Token são obrigatórios para SonarQube');
    }

    // Remover trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');

    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  /**
   * Testa a conectividade com a API do SonarQube
   */
  async testConnection(): Promise<APIResponse> {
    try {
      // Testar com endpoint de sistema
      const response = await this.makeRequest('/api/system/status');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          status: response.status,
          version: response.version,
          api_version: 'Web API'
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
  async getProjects(): Promise<APIResponse> {
    try {
      const response = await this.makeRequest('/api/projects/search?ps=500');
      
      return {
        success: true,
        data: response.components || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter projetos'
      };
    }
  }

  /**
   * Obtém issues (vulnerabilidades) de segurança
   */
  async getSecurityIssues(options: {
    projects?: string[];
    severities?: string[];
    types?: string[];
    statuses?: string[];
    tags?: string[];
    createdAfter?: string;
    createdBefore?: string;
    p?: number;
    ps?: number;
  } = {}): Promise<APIResponse<SonarQubeIssue[]>> {
    try {
      const params = new URLSearchParams();
      
      // Filtrar apenas issues de segurança
      params.append('types', 'VULNERABILITY,SECURITY_HOTSPOT');
      
      if (options.projects?.length) {
        params.append('projects', options.projects.join(','));
      }
      
      if (options.severities?.length) {
        params.append('severities', options.severities.join(','));
      }
      
      if (options.statuses?.length) {
        params.append('statuses', options.statuses.join(','));
      } else {
        // Apenas issues abertas por padrão
        params.append('statuses', 'OPEN,CONFIRMED,REOPENED');
      }
      
      if (options.tags?.length) {
        params.append('tags', options.tags.join(','));
      }
      
      if (options.createdAfter) {
        params.append('createdAfter', options.createdAfter);
      }
      
      if (options.createdBefore) {
        params.append('createdBefore', options.createdBefore);
      }
      
      params.append('p', (options.p || 1).toString());
      params.append('ps', (options.ps || 500).toString());
      
      // Incluir informações adicionais
      params.append('additionalFields', 'rules');

      const response = await this.makeRequest(`/api/issues/search?${params.toString()}`);
      
      return {
        success: true,
        data: response.issues || [],
        pagination: {
          page: response.paging?.pageIndex || 1,
          pageSize: response.paging?.pageSize || 500,
          total: response.paging?.total || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter issues de segurança'
      };
    }
  }

  /**
   * Obtém detalhes de uma regra específica
   */
  async getRuleDetails(ruleKey: string): Promise<APIResponse<SonarQubeRule>> {
    try {
      const response = await this.makeRequest(`/api/rules/show?key=${encodeURIComponent(ruleKey)}`);
      
      return {
        success: true,
        data: response.rule
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detalhes da regra'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades de segurança
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allIssues: SonarQubeIssue[] = [];
      let page = 1;
      const pageSize = 500;
      let hasMore = true;

      // Buscar todas as páginas
      while (hasMore) {
        const response = await this.getSecurityIssues({
          p: page,
          ps: pageSize
        });

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Erro ao obter issues');
        }

        allIssues.push(...response.data);
        
        hasMore = response.data.length === pageSize;
        page++;

        // Limite de segurança
        if (page > 100) {
          console.warn('Limite de páginas atingido (100). Interrompendo busca.');
          break;
        }
      }

      // Converter para formato padrão
      const vulnerabilities = allIssues.map(issue => this.parseSonarQubeIssue(issue));

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
   * Converte issue do SonarQube para formato padrão
   */
  private parseSonarQubeIssue(issue: SonarQubeIssue): ParsedVulnerability {
    const severity = this.mapSonarQubeSeverity(issue.severity);
    
    return {
      raw_data: issue,
      title: issue.message || `${issue.rule} - ${issue.component}`,
      description: issue.message || '',
      severity,
      asset_name: issue.component || issue.project,
      source_tool: 'SonarQube',
      plugin_id: issue.rule,
      port: issue.line,
      references: [`https://rules.sonarsource.com/${issue.rule}`],
      first_found: new Date(issue.creationDate),
      last_found: new Date(issue.updateDate),
      is_valid: this.validateSonarQubeIssue(issue),
      validation_errors: this.getValidationErrors(issue),
      validation_warnings: this.getValidationWarnings(issue)
    };
  }

  /**
   * Mapeia severidade do SonarQube para formato padrão
   */
  private mapSonarQubeSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'BLOCKER': 'Critical',
      'CRITICAL': 'Critical',
      'MAJOR': 'High',
      'MINOR': 'Medium',
      'INFO': 'Low'
    };
    
    return severityMap[severity] || 'Info';
  }

  /**
   * Valida issue do SonarQube
   */
  private validateSonarQubeIssue(issue: SonarQubeIssue): boolean {
    return !!(issue.key && issue.rule && issue.message && issue.severity);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(issue: SonarQubeIssue): string[] {
    const errors: string[] = [];
    
    if (!issue.key) {
      errors.push('Chave do issue não encontrada');
    }
    
    if (!issue.rule) {
      errors.push('Regra não encontrada');
    }
    
    if (!issue.message) {
      errors.push('Mensagem não encontrada');
    }
    
    if (!issue.severity) {
      errors.push('Severidade não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(issue: SonarQubeIssue): string[] {
    const warnings: string[] = [];
    
    if (!issue.component) {
      warnings.push('Componente não encontrado');
    }
    
    if (!issue.line) {
      warnings.push('Linha não encontrada');
    }
    
    if (!issue.author) {
      warnings.push('Autor não encontrado');
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
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage = errorData.errors[0].msg || errorMessage;
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
   * Obtém métricas de segurança do projeto
   */
  async getSecurityMetrics(projectKey: string): Promise<APIResponse<any>> {
    try {
      const metrics = [
        'vulnerabilities',
        'security_hotspots',
        'security_rating',
        'security_review_rating'
      ].join(',');

      const response = await this.makeRequest(
        `/api/measures/component?component=${encodeURIComponent(projectKey)}&metricKeys=${metrics}`
      );
      
      return {
        success: true,
        data: response.component?.measures || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter métricas de segurança'
      };
    }
  }
}

/**
 * Função utilitária para criar instância do conector SonarQube
 */
export const createSonarQubeConnector = (config: ConnectionConfig): SonarQubeConnector => {
  return new SonarQubeConnector(config);
};

/**
 * Função para testar conexão com SonarQube
 */
export const testSonarQubeConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createSonarQubeConnector(config);
  return await connector.testConnection();
};