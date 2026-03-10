// =====================================================
// RAPID7 INSIGHTVM CONNECTOR
// =====================================================
// Integração com Rapid7 InsightVM API v3
// Documentação: https://help.rapid7.com/insightvm/en-us/api/

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface Rapid7Vulnerability {
  id: string;
  title: string;
  description: {
    html: string;
    text: string;
  };
  cvss: {
    v2: {
      accessComplexity: string;
      accessVector: string;
      authentication: string;
      availabilityImpact: string;
      confidentialityImpact: string;
      exploitScore: number;
      impactScore: number;
      integrityImpact: string;
      score: number;
      vector: string;
    };
    v3: {
      attackComplexity: string;
      attackVector: string;
      availabilityImpact: string;
      confidentialityImpact: string;
      exploitabilityScore: number;
      impactScore: number;
      integrityImpact: string;
      privilegesRequired: string;
      scope: string;
      score: number;
      userInteraction: string;
      vector: string;
    };
  };
  cves: string[];
  exploits: number;
  malwareKits: number;
  published: string;
  riskScore: number;
  severity: string;
  severityScore: number;
  categories: string[];
  cwe: {
    id: string;
    name: string;
  };
  denialOfService: boolean;
  pci: {
    adjustedCVSSScore: number;
    adjustedSeverityScore: number;
    fail: boolean;
    status: string;
  };
  references: {
    id: string;
    source: string;
  }[];
  solution: {
    additionalInformation: {
      html: string;
      text: string;
    };
    fix: {
      html: string;
      text: string;
    };
    summary: {
      html: string;
      text: string;
    };
  };
  tags: {
    id: number;
    name: string;
    type: string;
  }[];
}

export interface Rapid7Asset {
  id: number;
  ip: string;
  mac: string;
  riskScore: number;
  criticalityTag: {
    id: number;
    name: string;
  };
  hostName: string;
  hostNames: {
    name: string;
    source: string;
  }[];
  os: string;
  osFingerprint: {
    architecture: string;
    configuration: {
      name: string;
      value: string;
    }[];
    description: string;
    family: string;
    id: number;
    product: string;
    systemName: string;
    type: string;
    vendor: string;
    version: string;
  };
  rawRiskScore: number;
  services: {
    configurations: any[];
    databases: any[];
    family: string;
    id: number;
    links: any[];
    name: string;
    port: number;
    product: string;
    protocol: string;
    userGroups: any[];
    users: any[];
    version: string;
    webApplications: any[];
  }[];
  software: {
    configurations: any[];
    description: string;
    family: string;
    id: number;
    product: string;
    type: string;
    vendor: string;
    version: string;
  }[];
  tags: {
    id: number;
    name: string;
    type: string;
  }[];
  type: string;
  userGroups: any[];
  users: any[];
  vulnerabilities: {
    critical: number;
    moderate: number;
    severe: number;
    total: number;
  };
}

export interface Rapid7VulnerabilityInstance {
  id: string;
  port: number;
  protocol: string;
  service: string;
  since: string;
  status: string;
  proof: string;
  key: string;
  results: {
    checkId: string;
    key: string;
    port: number;
    protocol: string;
    proof: string;
    service: string;
    since: string;
    status: string;
  }[];
}

export class Rapid7Connector {
  private baseUrl: string;
  private username: string;
  private password: string;
  private authHeader: string;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || '';
    this.username = config.username || '';
    this.password = config.password || '';
    
    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error('URL da API, usuário e senha são obrigatórios para Rapid7 InsightVM');
    }

    // Remover trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');

    // Criar header de autenticação Basic Auth
    this.authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
  }

  /**
   * Testa a conectividade com a API do Rapid7 InsightVM
   */
  async testConnection(): Promise<APIResponse> {
    try {
      // Testar com endpoint de informações da instância
      const response = await this.makeRequest('/api/3/administration/info');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          version: response.version,
          api_version: 'InsightVM API v3'
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
  async getSites(): Promise<APIResponse> {
    try {
      const response = await this.makeRequest('/api/3/sites');
      
      return {
        success: true,
        data: response.resources || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter sites'
      };
    }
  }

  /**
   * Obtém vulnerabilidades
   */
  async getVulnerabilities(options: {
    page?: number;
    size?: number;
    sort?: string[];
  } = {}): Promise<APIResponse<Rapid7Vulnerability[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.page !== undefined) {
        params.append('page', options.page.toString());
      }
      
      if (options.size) {
        params.append('size', options.size.toString());
      }
      
      if (options.sort?.length) {
        options.sort.forEach(s => params.append('sort', s));
      }

      const response = await this.makeRequest(`/api/3/vulnerabilities?${params.toString()}`);
      
      return {
        success: true,
        data: response.resources || [],
        pagination: {
          page: response.page?.number || 0,
          size: response.page?.size || 10,
          totalPages: response.page?.totalPages || 0,
          totalResources: response.page?.totalResources || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter vulnerabilidades'
      };
    }
  }

  /**
   * Obtém assets
   */
  async getAssets(options: {
    page?: number;
    size?: number;
    sort?: string[];
  } = {}): Promise<APIResponse<Rapid7Asset[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.page !== undefined) {
        params.append('page', options.page.toString());
      }
      
      if (options.size) {
        params.append('size', options.size.toString());
      }
      
      if (options.sort?.length) {
        options.sort.forEach(s => params.append('sort', s));
      }

      const response = await this.makeRequest(`/api/3/assets?${params.toString()}`);
      
      return {
        success: true,
        data: response.resources || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter assets'
      };
    }
  }

  /**
   * Obtém instâncias de vulnerabilidades de um asset
   */
  async getAssetVulnerabilities(assetId: number): Promise<APIResponse<Rapid7VulnerabilityInstance[]>> {
    try {
      const response = await this.makeRequest(`/api/3/assets/${assetId}/vulnerabilities`);
      
      return {
        success: true,
        data: response.resources || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter vulnerabilidades do asset'
      };
    }
  }

  /**
   * Obtém detalhes de uma vulnerabilidade específica
   */
  async getVulnerabilityDetails(vulnerabilityId: string): Promise<APIResponse<Rapid7Vulnerability>> {
    try {
      const response = await this.makeRequest(`/api/3/vulnerabilities/${vulnerabilityId}`);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detalhes da vulnerabilidade'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades com detalhes completos
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allVulnerabilities: ParsedVulnerability[] = [];
      
      // Obter assets primeiro
      const assetsResponse = await this.getAssets({ size: 500 });
      if (!assetsResponse.success || !assetsResponse.data) {
        throw new Error('Erro ao obter assets');
      }

      // Para cada asset, obter suas vulnerabilidades
      for (const asset of assetsResponse.data) {
        const assetVulnsResponse = await this.getAssetVulnerabilities(asset.id);
        
        if (!assetVulnsResponse.success || !assetVulnsResponse.data) {
          console.warn(`Erro ao obter vulnerabilidades do asset ${asset.id}`);
          continue;
        }

        // Para cada instância de vulnerabilidade, obter detalhes
        for (const vulnInstance of assetVulnsResponse.data) {
          // Extrair ID da vulnerabilidade da instância
          const vulnId = vulnInstance.id.split('-')[0]; // Assumindo formato "vulnId-instanceId"
          
          try {
            const vulnDetailsResponse = await this.getVulnerabilityDetails(vulnId);
            
            if (vulnDetailsResponse.success && vulnDetailsResponse.data) {
              const parsedVuln = this.parseRapid7Vulnerability(
                vulnDetailsResponse.data, 
                asset, 
                vulnInstance
              );
              allVulnerabilities.push(parsedVuln);
            }
          } catch (error) {
            console.warn(`Erro ao obter detalhes da vulnerabilidade ${vulnId}:`, error);
          }

          // Limite de segurança
          if (allVulnerabilities.length > 10000) {
            console.warn('Limite de vulnerabilidades atingido (10.000)');
            break;
          }
        }

        if (allVulnerabilities.length > 10000) break;
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
   * Converte vulnerabilidade do Rapid7 para formato padrão
   */
  private parseRapid7Vulnerability(
    vulnerability: Rapid7Vulnerability,
    asset: Rapid7Asset,
    instance: Rapid7VulnerabilityInstance
  ): ParsedVulnerability {
    const severity = this.mapRapid7Severity(vulnerability.severity);
    
    return {
      raw_data: { vulnerability, asset, instance },
      title: vulnerability.title,
      description: vulnerability.description?.text || vulnerability.description?.html || '',
      severity,
      cvss_score: vulnerability.cvss?.v3?.score || vulnerability.cvss?.v2?.score,
      cve_id: vulnerability.cves?.join(', '),
      cwe_id: vulnerability.cwe?.id,
      asset_name: asset.hostName || asset.ip,
      asset_ip: asset.ip,
      port: instance.port,
      protocol: instance.protocol,
      source_tool: 'Rapid7 InsightVM',
      plugin_id: vulnerability.id,
      solution: vulnerability.solution?.summary?.text || vulnerability.solution?.fix?.text,
      references: vulnerability.references?.map(ref => `${ref.source}: ${ref.id}`) || [],
      first_found: new Date(instance.since),
      is_valid: this.validateRapid7Vulnerability(vulnerability),
      validation_errors: this.getValidationErrors(vulnerability),
      validation_warnings: this.getValidationWarnings(vulnerability)
    };
  }

  /**
   * Mapeia severidade do Rapid7 para formato padrão
   */
  private mapRapid7Severity(severity: string): string {
    const severityMap: Record<string, string> = {
      'Critical': 'Critical',
      'Severe': 'High',
      'Moderate': 'Medium',
      'Malware': 'Critical'
    };
    
    return severityMap[severity] || 'Info';
  }

  /**
   * Valida vulnerabilidade do Rapid7
   */
  private validateRapid7Vulnerability(vulnerability: Rapid7Vulnerability): boolean {
    return !!(vulnerability.id && vulnerability.title && vulnerability.severity);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(vulnerability: Rapid7Vulnerability): string[] {
    const errors: string[] = [];
    
    if (!vulnerability.id) {
      errors.push('ID da vulnerabilidade não encontrado');
    }
    
    if (!vulnerability.title) {
      errors.push('Título não encontrado');
    }
    
    if (!vulnerability.severity) {
      errors.push('Severidade não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(vulnerability: Rapid7Vulnerability): string[] {
    const warnings: string[] = [];
    
    if (!vulnerability.description?.text && !vulnerability.description?.html) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!vulnerability.solution?.summary?.text && !vulnerability.solution?.fix?.text) {
      warnings.push('Solução não encontrada');
    }
    
    if (!vulnerability.cvss?.v3?.score && !vulnerability.cvss?.v2?.score) {
      warnings.push('Score CVSS não encontrado');
    }
    
    return warnings;
  }

  /**
   * Faz requisição autenticada para a API
   */
  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
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
   * Obtém estatísticas de vulnerabilidades
   */
  async getVulnerabilityStatistics(): Promise<APIResponse<any>> {
    try {
      const response = await this.makeRequest('/api/3/vulnerability_checks');
      
      return {
        success: true,
        data: {
          total_checks: response.page?.totalResources || 0,
          total_vulnerabilities: response.resources?.length || 0
        }
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
 * Função utilitária para criar instância do conector Rapid7
 */
export const createRapid7Connector = (config: ConnectionConfig): Rapid7Connector => {
  return new Rapid7Connector(config);
};

/**
 * Função para testar conexão com Rapid7 InsightVM
 */
export const testRapid7Connection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createRapid7Connector(config);
  return await connector.testConnection();
};