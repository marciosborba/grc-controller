// =====================================================
// GENERIC API CONNECTOR
// =====================================================
// Conector genérico para APIs REST personalizadas

import { ConnectionConfig, APIResponse, ParsedVulnerability, FieldMapping } from '../types/import';

export interface GenericAPIConfig extends ConnectionConfig {
  endpoints?: {
    vulnerabilities?: string;
    test?: string;
    assets?: string;
  };
  pagination?: {
    type: 'offset' | 'page' | 'cursor';
    limit_param: string;
    offset_param?: string;
    page_param?: string;
    cursor_param?: string;
    default_limit: number;
  };
  response_format?: {
    data_path?: string; // JSONPath para os dados (ex: "data.vulnerabilities")
    total_path?: string; // JSONPath para total de registros
    next_page_path?: string; // JSONPath para próxima página
  };
}

export class GenericAPIConnector {
  private config: GenericAPIConfig;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: GenericAPIConfig) {
    this.config = config;
    this.baseUrl = config.api_url || '';
    
    if (!this.baseUrl) {
      throw new Error('URL da API é obrigatória');
    }

    // Configurar headers de autenticação
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.additional_headers
    };

    this.setupAuthentication();
  }

  /**
   * Configura autenticação baseada no tipo
   */
  private setupAuthentication(): void {
    if (this.config.api_key) {
      // API Key pode ser enviada como header ou query param
      this.headers['Authorization'] = `Bearer ${this.config.api_key}`;
      // Ou como header customizado
      this.headers['X-API-Key'] = this.config.api_key;
    }

    if (this.config.username && this.config.password) {
      // Basic Authentication
      const credentials = btoa(`${this.config.username}:${this.config.password}`);
      this.headers['Authorization'] = `Basic ${credentials}`;
    }

    if (this.config.token) {
      // Token Authentication
      this.headers['Authorization'] = `Token ${this.config.token}`;
    }
  }

  /**
   * Testa a conectividade com a API
   */
  async testConnection(): Promise<APIResponse> {
    try {
      const testEndpoint = this.config.endpoints?.test || '/health';
      const response = await this.makeRequest(testEndpoint);
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém vulnerabilidades da API
   */
  async getVulnerabilities(options: {
    limit?: number;
    offset?: number;
    page?: number;
    filters?: Record<string, any>;
  } = {}): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const endpoint = this.config.endpoints?.vulnerabilities || '/vulnerabilities';
      const params = this.buildQueryParams(options);
      
      const response = await this.makeRequest(`${endpoint}?${params.toString()}`);
      const vulnerabilities = this.extractVulnerabilities(response);
      
      return {
        success: true,
        data: vulnerabilities,
        pagination: this.extractPagination(response)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter vulnerabilidades'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades com paginação automática
   */
  async getAllVulnerabilities(fieldMapping?: FieldMapping): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allVulnerabilities: ParsedVulnerability[] = [];
      let hasMore = true;
      let page = 1;
      let offset = 0;

      while (hasMore) {
        const options = this.config.pagination?.type === 'page' 
          ? { page, limit: this.config.pagination.default_limit }
          : { offset, limit: this.config.pagination?.default_limit || 100 };

        const response = await this.getVulnerabilities(options);
        
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Erro ao obter vulnerabilidades');
        }

        allVulnerabilities.push(...response.data);

        // Verificar se há mais páginas
        if (response.pagination) {
          hasMore = response.pagination.page < response.pagination.total_pages;
          page++;
          offset += this.config.pagination?.default_limit || 100;
        } else {
          hasMore = response.data.length === (this.config.pagination?.default_limit || 100);
          page++;
          offset += response.data.length;
        }

        // Limite de segurança para evitar loops infinitos
        if (page > 1000) {
          console.warn('Limite de páginas atingido (1000). Interrompendo busca.');
          break;
        }
      }

      return {
        success: true,
        data: allVulnerabilities
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter todas as vulnerabilidades'
      };
    }
  }

  /**
   * Obtém ativos da API (se disponível)
   */
  async getAssets(): Promise<APIResponse> {
    try {
      const endpoint = this.config.endpoints?.assets || '/assets';
      const response = await this.makeRequest(endpoint);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter ativos'
      };
    }
  }

  /**
   * Constrói parâmetros de query para paginação e filtros
   */
  private buildQueryParams(options: {
    limit?: number;
    offset?: number;
    page?: number;
    filters?: Record<string, any>;
  }): URLSearchParams {
    const params = new URLSearchParams();
    
    // Paginação
    if (this.config.pagination) {
      const { type, limit_param, offset_param, page_param, default_limit } = this.config.pagination;
      
      params.append(limit_param, (options.limit || default_limit).toString());
      
      if (type === 'offset' && offset_param) {
        params.append(offset_param, (options.offset || 0).toString());
      } else if (type === 'page' && page_param) {
        params.append(page_param, (options.page || 1).toString());
      }
    }

    // Filtros
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return params;
  }

  /**
   * Extrai vulnerabilidades da resposta da API
   */
  private extractVulnerabilities(response: any): ParsedVulnerability[] {
    let data = response;
    
    // Navegar até os dados usando o caminho configurado
    if (this.config.response_format?.data_path) {
      data = this.getNestedValue(response, this.config.response_format.data_path);
    }

    // Se não é array, tentar encontrar array de vulnerabilidades
    if (!Array.isArray(data)) {
      // Tentar campos comuns
      const commonFields = ['vulnerabilities', 'data', 'results', 'items', 'findings'];
      for (const field of commonFields) {
        if (data[field] && Array.isArray(data[field])) {
          data = data[field];
          break;
        }
      }
    }

    if (!Array.isArray(data)) {
      throw new Error('Resposta da API não contém array de vulnerabilidades');
    }

    return data.map(item => this.parseGenericVulnerability(item));
  }

  /**
   * Extrai informações de paginação da resposta
   */
  private extractPagination(response: any): any {
    if (!this.config.response_format) return undefined;

    const pagination: any = {};

    if (this.config.response_format.total_path) {
      pagination.total = this.getNestedValue(response, this.config.response_format.total_path);
    }

    if (this.config.response_format.next_page_path) {
      pagination.next_page = this.getNestedValue(response, this.config.response_format.next_page_path);
    }

    // Tentar extrair informações comuns de paginação
    const commonPaginationFields = ['page', 'per_page', 'total', 'total_pages', 'has_more'];
    commonPaginationFields.forEach(field => {
      if (response[field] !== undefined) {
        pagination[field] = response[field];
      }
    });

    return Object.keys(pagination).length > 0 ? pagination : undefined;
  }

  /**
   * Obtém valor aninhado usando notação de ponto
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Converte item genérico para formato padrão de vulnerabilidade
   */
  private parseGenericVulnerability(item: any): ParsedVulnerability {
    // Mapeamento automático baseado em campos comuns
    const fieldMappings: Record<string, string[]> = {
      title: ['title', 'name', 'summary', 'vulnerability_name', 'finding_name'],
      description: ['description', 'details', 'summary', 'finding_details'],
      severity: ['severity', 'risk', 'level', 'priority', 'criticality'],
      cvss_score: ['cvss_score', 'cvss', 'score', 'cvss_base_score'],
      cve_id: ['cve_id', 'cve', 'cve_number'],
      cwe_id: ['cwe_id', 'cwe', 'cwe_number'],
      asset_name: ['asset_name', 'host', 'hostname', 'target', 'asset'],
      asset_ip: ['asset_ip', 'ip', 'host_ip', 'target_ip'],
      port: ['port', 'service_port', 'target_port'],
      protocol: ['protocol', 'service', 'scheme'],
      source_tool: ['source_tool', 'tool', 'scanner', 'source'],
      plugin_id: ['plugin_id', 'rule_id', 'check_id', 'id'],
      solution: ['solution', 'fix', 'remediation', 'recommendation']
    };

    const mapped: any = { raw_data: item };

    // Mapear campos automaticamente
    Object.entries(fieldMappings).forEach(([targetField, possibleFields]) => {
      for (const field of possibleFields) {
        if (item[field] !== undefined && item[field] !== null) {
          mapped[targetField] = item[field];
          break;
        }
      }
    });

    // Normalizar severidade
    if (mapped.severity) {
      mapped.severity = this.normalizeSeverity(mapped.severity);
    }

    // Converter CVSS score para número
    if (mapped.cvss_score && typeof mapped.cvss_score === 'string') {
      mapped.cvss_score = parseFloat(mapped.cvss_score);
    }

    // Converter porta para número
    if (mapped.port && typeof mapped.port === 'string') {
      mapped.port = parseInt(mapped.port);
    }

    return {
      ...mapped,
      is_valid: this.validateGenericVulnerability(mapped),
      validation_errors: this.getValidationErrors(mapped),
      validation_warnings: this.getValidationWarnings(mapped)
    };
  }

  /**
   * Normaliza severidade para formato padrão
   */
  private normalizeSeverity(severity: any): string {
    const severityStr = severity.toString().toLowerCase();
    
    if (severityStr.includes('critical') || severityStr === '5' || severityStr === 'very high') {
      return 'Critical';
    } else if (severityStr.includes('high') || severityStr === '4') {
      return 'High';
    } else if (severityStr.includes('medium') || severityStr === '3' || severityStr.includes('moderate')) {
      return 'Medium';
    } else if (severityStr.includes('low') || severityStr === '2') {
      return 'Low';
    } else if (severityStr.includes('info') || severityStr === '1' || severityStr.includes('informational')) {
      return 'Info';
    }
    
    return 'Info'; // Default
  }

  /**
   * Valida vulnerabilidade genérica
   */
  private validateGenericVulnerability(vuln: any): boolean {
    return !!(vuln.title && vuln.severity);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(vuln: any): string[] {
    const errors: string[] = [];
    
    if (!vuln.title) {
      errors.push('Título não encontrado');
    }
    
    if (!vuln.severity) {
      errors.push('Severidade não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(vuln: any): string[] {
    const warnings: string[] = [];
    
    if (!vuln.description) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!vuln.asset_name) {
      warnings.push('Nome do ativo não encontrado');
    }
    
    if (!vuln.cvss_score) {
      warnings.push('CVSS Score não encontrado');
    }
    
    return warnings;
  }

  /**
   * Faz requisição para a API
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/')) {
      return await response.text();
    }

    return await response.blob();
  }
}

/**
 * Função utilitária para criar instância do conector genérico
 */
export const createGenericAPIConnector = (config: GenericAPIConfig): GenericAPIConnector => {
  return new GenericAPIConnector(config);
};

/**
 * Função para testar conexão com API genérica
 */
export const testGenericAPIConnection = async (config: GenericAPIConfig): Promise<APIResponse> => {
  const connector = createGenericAPIConnector(config);
  return await connector.testConnection();
};