// =====================================================
// GCP SECURITY COMMAND CENTER CONNECTOR
// =====================================================
// Integração com Google Cloud Security Command Center API
// Documentação: https://cloud.google.com/security-command-center/docs/reference/rest

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface GCPFinding {
  name: string;
  parent: string;
  resourceName: string;
  state: string;
  category: string;
  externalUri: string;
  sourceProperties: Record<string, any>;
  securityMarks: {
    name: string;
    marks: Record<string, string>;
  };
  eventTime: string;
  createTime: string;
  severity: string;
  canonicalName: string;
  mute: string;
  findingClass: string;
  indicator: {
    ipAddresses: string[];
    domains: string[];
    uris: {
      uri: string;
      httpMethod: string;
    }[];
  };
  vulnerability: {
    cve: {
      id: string;
      references: {
        source: string;
        uri: string;
      }[];
      cvssv3: {
        baseScore: number;
        exploitabilityScore: number;
        impactScore: number;
        attackVector: string;
        attackComplexity: string;
        privilegesRequired: string;
        userInteraction: string;
        scope: string;
        confidentialityImpact: string;
        integrityImpact: string;
        availabilityImpact: string;
      };
    };
    fixedPackage: {
      packageType: string;
      packageName: string;
      fixedVersion: string;
    };
    securityBulletin: {
      bulletinId: string;
      submissionTime: string;
      suggestedUpgradeVersion: string;
    };
  };
  muteUpdateTime: string;
  externalSystemsMap: Record<string, any>;
  mitreAttack: {
    primaryTactic: string;
    primaryTechniques: string[];
    additionalTactics: string[];
    additionalTechniques: string[];
    version: string;
  };
  access: {
    principalEmail: string;
    callerIp: string;
    callerIpGeo: {
      regionCode: string;
    };
    userAgentFamily: string;
    serviceAccountKeyName: string;
    serviceAccountDelegationInfo: {
      principalEmail: string;
      principalSubject: string;
    }[];
  };
  connections: {
    destinationIp: string;
    destinationPort: number;
    sourceIp: string;
    sourcePort: number;
    protocol: string;
  }[];
  description: string;
}

export interface GCPAsset {
  name: string;
  assetType: string;
  resource: {
    version: string;
    discoveryDocumentUri: string;
    discoveryName: string;
    resourceUrl: string;
    parent: string;
    data: Record<string, any>;
    location: string;
  };
  iamPolicy: {
    version: number;
    bindings: {
      role: string;
      members: string[];
      condition: {
        title: string;
        description: string;
        expression: string;
      };
    }[];
    auditConfigs: any[];
    etag: string;
  };
  orgPolicy: any[];
  accessPolicy: {
    name: string;
    parent: string;
    title: string;
    createTime: string;
    updateTime: string;
    etag: string;
  };
  osInventory: {
    name: string;
    osInfo: {
      hostname: string;
      longName: string;
      shortName: string;
      version: string;
      architecture: string;
      kernelVersion: string;
      kernelRelease: string;
      osconfigAgentVersion: string;
    };
    items: Record<string, any>;
    updateTime: string;
  };
  updateTime: string;
  ancestors: string[];
}

export class GCPSecurityConnector {
  private baseUrl: string;
  private projectId: string;
  private organizationId: string;
  private accessToken?: string;
  private tokenExpiry?: Date;
  private serviceAccountKey: any;

  constructor(config: ConnectionConfig) {
    this.baseUrl = 'https://securitycenter.googleapis.com';
    this.projectId = config.project_id || '';
    this.organizationId = config.organization_id || '';
    
    try {
      this.serviceAccountKey = JSON.parse(config.service_account_key || config.api_key || '{}');
    } catch {
      throw new Error('Service Account Key deve ser um JSON válido');
    }
    
    if (!this.organizationId && !this.projectId) {
      throw new Error('Organization ID ou Project ID é obrigatório para GCP Security Command Center');
    }

    if (!this.serviceAccountKey.private_key || !this.serviceAccountKey.client_email) {
      throw new Error('Service Account Key deve conter private_key e client_email');
    }
  }

  /**
   * Autentica na API do GCP usando Service Account
   */
  async authenticate(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return; // Token ainda válido
    }

    // Criar JWT para autenticação
    const jwt = await this.createJWT();
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
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
   * Cria JWT para autenticação do Service Account
   */
  private async createJWT(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.serviceAccountKey.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    };

    // Simplificação: Em produção, usar biblioteca para JWT
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const payloadEncoded = btoa(JSON.stringify(payload));
    const signature = 'placeholder_signature'; // Em produção, assinar com private_key
    
    return `${header}.${payloadEncoded}.${signature}`;
  }

  /**
   * Testa a conectividade com a API do GCP Security Command Center
   */
  async testConnection(): Promise<APIResponse> {
    try {
      await this.authenticate();
      
      const parent = this.organizationId ? 
        `organizations/${this.organizationId}` : 
        `projects/${this.projectId}`;
      
      // Testar com endpoint de sources
      const response = await this.makeRequest(`/v1/${parent}/sources?pageSize=1`);
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          organization_id: this.organizationId,
          project_id: this.projectId,
          api_version: 'Security Command Center v1'
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
   * Lista sources de segurança
   */
  async getSources(): Promise<APIResponse> {
    try {
      const parent = this.organizationId ? 
        `organizations/${this.organizationId}` : 
        `projects/${this.projectId}`;
      
      const response = await this.makeRequest(`/v1/${parent}/sources`);
      
      return {
        success: true,
        data: response.sources || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter sources'
      };
    }
  }

  /**
   * Obtém findings de segurança
   */
  async getFindings(options: {
    filter?: string;
    orderBy?: string;
    pageSize?: number;
    pageToken?: string;
    fieldMask?: string;
    compareDuration?: string;
  } = {}): Promise<APIResponse<GCPFinding[]>> {
    try {
      const parent = this.organizationId ? 
        `organizations/${this.organizationId}` : 
        `projects/${this.projectId}`;
      
      const params = new URLSearchParams();
      
      if (options.filter) {
        params.append('filter', options.filter);
      }
      
      if (options.orderBy) {
        params.append('orderBy', options.orderBy);
      }
      
      if (options.pageSize) {
        params.append('pageSize', options.pageSize.toString());
      }
      
      if (options.pageToken) {
        params.append('pageToken', options.pageToken);
      }
      
      if (options.fieldMask) {
        params.append('fieldMask', options.fieldMask);
      }
      
      if (options.compareDuration) {
        params.append('compareDuration', options.compareDuration);
      }

      const response = await this.makeRequest(`/v1/${parent}/sources/-/findings?${params.toString()}`);
      
      return {
        success: true,
        data: response.listFindingsResults?.map((result: any) => result.finding) || [],
        pagination: {
          nextPageToken: response.nextPageToken,
          totalSize: response.totalSize
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter findings'
      };
    }
  }

  /**
   * Obtém assets
   */
  async getAssets(options: {
    filter?: string;
    orderBy?: string;
    pageSize?: number;
    pageToken?: string;
    fieldMask?: string;
  } = {}): Promise<APIResponse<GCPAsset[]>> {
    try {
      const parent = this.organizationId ? 
        `organizations/${this.organizationId}` : 
        `projects/${this.projectId}`;
      
      const params = new URLSearchParams();
      
      if (options.filter) {
        params.append('filter', options.filter);
      }
      
      if (options.orderBy) {
        params.append('orderBy', options.orderBy);
      }
      
      if (options.pageSize) {
        params.append('pageSize', options.pageSize.toString());
      }
      
      if (options.pageToken) {
        params.append('pageToken', options.pageToken);
      }
      
      if (options.fieldMask) {
        params.append('fieldMask', options.fieldMask);
      }

      const response = await this.makeRequest(`/v1/${parent}/assets?${params.toString()}`);
      
      return {
        success: true,
        data: response.listAssetsResults?.map((result: any) => result.asset) || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter assets'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allFindings: GCPFinding[] = [];
      let pageToken: string | undefined;

      do {
        const findingsResponse = await this.getFindings({
          filter: 'state="ACTIVE" AND (severity="HIGH" OR severity="CRITICAL" OR severity="MEDIUM")',
          orderBy: 'event_time desc',
          pageSize: 100,
          pageToken
        });

        if (!findingsResponse.success || !findingsResponse.data) {
          throw new Error(findingsResponse.error || 'Erro ao obter findings');
        }

        allFindings.push(...findingsResponse.data);
        pageToken = findingsResponse.pagination?.nextPageToken;

        // Limite de segurança
        if (allFindings.length > 10000) {
          console.warn('Limite de findings atingido (10.000)');
          break;
        }
      } while (pageToken);

      // Converter para formato padrão
      const vulnerabilities = allFindings.map(finding => this.parseGCPFinding(finding));

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
   * Converte finding do GCP para formato padrão
   */
  private parseGCPFinding(finding: GCPFinding): ParsedVulnerability {
    const severity = this.mapGCPSeverity(finding.severity);
    const connection = finding.connections?.[0];
    
    return {
      raw_data: finding,
      title: finding.category || 'GCP Security Finding',
      description: finding.description || finding.category || '',
      severity,
      cvss_score: finding.vulnerability?.cve?.cvssv3?.baseScore,
      cve_id: finding.vulnerability?.cve?.id,
      asset_name: this.extractAssetName(finding.resourceName),
      asset_ip: finding.indicator?.ipAddresses?.[0] || connection?.destinationIp,
      port: connection?.destinationPort,
      protocol: connection?.protocol,
      source_tool: 'GCP Security Command Center',
      plugin_id: finding.name,
      references: finding.vulnerability?.cve?.references?.map(ref => ref.uri) || 
                 (finding.externalUri ? [finding.externalUri] : []),
      first_found: new Date(finding.createTime),
      last_found: new Date(finding.eventTime),
      is_valid: this.validateGCPFinding(finding),
      validation_errors: this.getValidationErrors(finding),
      validation_warnings: this.getValidationWarnings(finding)
    };
  }

  /**
   * Extrai nome do asset do resource name
   */
  private extractAssetName(resourceName: string): string {
    if (!resourceName) return 'Unknown Asset';
    
    // Extrair nome do recurso do path completo
    const parts = resourceName.split('/');
    return parts[parts.length - 1] || resourceName;
  }

  /**
   * Mapeia severidade do GCP para formato padrão
   */
  private mapGCPSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'CRITICAL': 'Critical',
      'HIGH': 'High',
      'MEDIUM': 'Medium',
      'LOW': 'Low',
      'MINIMAL': 'Info'
    };
    
    return severityMap[severity] || 'Info';
  }

  /**
   * Valida finding do GCP
   */
  private validateGCPFinding(finding: GCPFinding): boolean {
    return !!(finding.name && finding.category && finding.severity);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(finding: GCPFinding): string[] {
    const errors: string[] = [];
    
    if (!finding.name) {
      errors.push('Nome do finding não encontrado');
    }
    
    if (!finding.category) {
      errors.push('Categoria não encontrada');
    }
    
    if (!finding.severity) {
      errors.push('Severidade não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(finding: GCPFinding): string[] {
    const warnings: string[] = [];
    
    if (!finding.description) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!finding.resourceName) {
      warnings.push('Nome do recurso não encontrado');
    }
    
    if (!finding.vulnerability?.cve?.id) {
      warnings.push('CVE ID não encontrado');
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
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
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
  async getSecurityStatistics(): Promise<APIResponse<any>> {
    try {
      const findingsResponse = await this.getFindings({
        filter: 'state="ACTIVE"',
        pageSize: 1
      });

      const stats = {
        total_findings: findingsResponse.pagination?.totalSize || 0,
        organization_id: this.organizationId,
        project_id: this.projectId
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
 * Função utilitária para criar instância do conector GCP Security
 */
export const createGCPSecurityConnector = (config: ConnectionConfig): GCPSecurityConnector => {
  return new GCPSecurityConnector(config);
};

/**
 * Função para testar conexão com GCP Security Command Center
 */
export const testGCPSecurityConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createGCPSecurityConnector(config);
  return await connector.testConnection();
};