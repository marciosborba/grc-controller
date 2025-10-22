// =====================================================
// MICROSOFT DEFENDER FOR CLOUD CONNECTOR
// =====================================================
// Integração com Microsoft Graph Security API
// Documentação: https://docs.microsoft.com/en-us/graph/api/resources/security-api-overview

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface DefenderAlert {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  detectionSource: string;
  serviceSource: string;
  assignedTo: string;
  classification: string;
  determination: string;
  evidence: {
    entityType: string;
    evidenceCreationDateTime: string;
    primaryAddress: string;
    remediationStatus: string;
    remediationStatusDetails: string;
    roles: string[];
    tags: string[];
    verdict: string;
  }[];
  incidentId: string;
  recommendedActions: string[];
  threatDisplayName: string;
  threatFamilyName: string;
  actorDisplayName: string;
  mitreTechniques: string[];
  systemTags: string[];
  userTags: string[];
  comments: {
    comment: string;
    createdByDisplayName: string;
    createdDateTime: string;
  }[];
}

export interface DefenderSecureScore {
  id: string;
  azureTenantId: string;
  createdDateTime: string;
  currentScore: number;
  maxScore: number;
  averageScore: number;
  vendorInformation: {
    provider: string;
    providerVersion: string;
    subProvider: string;
    vendor: string;
  };
  controlScores: {
    controlCategory: string;
    controlName: string;
    description: string;
    score: number;
    maxScore: number;
  }[];
}

export interface DefenderRecommendation {
  id: string;
  displayName: string;
  description: string;
  remediationDescription: string;
  category: string;
  severity: string;
  userImpact: string;
  implementationCost: string;
  rank: number;
  portalLink: string;
  state: string;
  subState: string;
  azureTenantId: string;
  lastModifiedDateTime: string;
  threatIntelligence: {
    badReputation: boolean;
    malwareFamily: string;
    threatType: string;
  };
  vendorInformation: {
    provider: string;
    providerVersion: string;
    subProvider: string;
    vendor: string;
  };
}

export class MicrosoftDefenderConnector {
  private baseUrl: string;
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: ConnectionConfig) {
    this.baseUrl = 'https://graph.microsoft.com';
    this.tenantId = config.tenant_id || '';
    this.clientId = config.client_id || config.username || '';
    this.clientSecret = config.client_secret || config.password || '';
    
    if (!this.tenantId || !this.clientId || !this.clientSecret) {
      throw new Error('Tenant ID, Client ID e Client Secret são obrigatórios para Microsoft Defender');
    }
  }

  /**
   * Autentica na API do Microsoft Graph usando OAuth 2.0
   */
  async authenticate(): Promise<void> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return; // Token ainda válido
    }

    const response = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'https://graph.microsoft.com/.default'
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
   * Testa a conectividade com a API do Microsoft Defender
   */
  async testConnection(): Promise<APIResponse> {
    try {
      await this.authenticate();
      
      // Testar com endpoint de alertas
      const response = await this.makeRequest('/v1.0/security/alerts?$top=1');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          tenant_id: this.tenantId,
          api_version: 'Microsoft Graph v1.0'
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
   * Obtém alertas de segurança
   */
  async getSecurityAlerts(options: {
    filter?: string;
    orderby?: string;
    top?: number;
    skip?: number;
    select?: string[];
  } = {}): Promise<APIResponse<DefenderAlert[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.filter) {
        params.append('$filter', options.filter);
      }
      
      if (options.orderby) {
        params.append('$orderby', options.orderby);
      }
      
      if (options.top) {
        params.append('$top', options.top.toString());
      }
      
      if (options.skip) {
        params.append('$skip', options.skip.toString());
      }
      
      if (options.select?.length) {
        params.append('$select', options.select.join(','));
      }

      const response = await this.makeRequest(`/v1.0/security/alerts?${params.toString()}`);
      
      return {
        success: true,
        data: response.value || [],
        pagination: {
          nextLink: response['@odata.nextLink'],
          count: response['@odata.count']
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter alertas de segurança'
      };
    }
  }

  /**
   * Obtém recomendações de segurança
   */
  async getSecurityRecommendations(options: {
    filter?: string;
    orderby?: string;
    top?: number;
    skip?: number;
  } = {}): Promise<APIResponse<DefenderRecommendation[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.filter) {
        params.append('$filter', options.filter);
      }
      
      if (options.orderby) {
        params.append('$orderby', options.orderby);
      }
      
      if (options.top) {
        params.append('$top', options.top.toString());
      }
      
      if (options.skip) {
        params.append('$skip', options.skip.toString());
      }

      const response = await this.makeRequest(`/v1.0/security/securityRecommendations?${params.toString()}`);
      
      return {
        success: true,
        data: response.value || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter recomendações de segurança'
      };
    }
  }

  /**
   * Obtém secure score
   */
  async getSecureScore(): Promise<APIResponse<DefenderSecureScore[]>> {
    try {
      const response = await this.makeRequest('/v1.0/security/secureScores?$top=1');
      
      return {
        success: true,
        data: response.value || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter secure score'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades (alertas + recomendações)
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allVulnerabilities: ParsedVulnerability[] = [];
      
      // Obter alertas de segurança ativos
      let skip = 0;
      let hasMore = true;
      const pageSize = 100;

      while (hasMore) {
        const alertsResponse = await this.getSecurityAlerts({
          filter: "status ne 'resolved' and severity ne 'informational'",
          orderby: 'createdDateTime desc',
          top: pageSize,
          skip
        });

        if (!alertsResponse.success || !alertsResponse.data) {
          console.warn('Erro ao obter alertas:', alertsResponse.error);
          break;
        }

        // Converter alertas para vulnerabilidades
        const alertVulns = alertsResponse.data.map(alert => this.parseDefenderAlert(alert));
        allVulnerabilities.push(...alertVulns);

        hasMore = alertsResponse.data.length === pageSize;
        skip += pageSize;

        // Limite de segurança
        if (skip > 1000) {
          console.warn('Limite de alertas atingido (1.000)');
          break;
        }
      }

      // Obter recomendações de segurança
      const recommendationsResponse = await this.getSecurityRecommendations({
        filter: "state eq 'active' and severity ne 'low'",
        orderby: 'rank asc',
        top: 500
      });

      if (recommendationsResponse.success && recommendationsResponse.data) {
        const recVulns = recommendationsResponse.data.map(rec => this.parseDefenderRecommendation(rec));
        allVulnerabilities.push(...recVulns);
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
   * Converte alerta do Defender para formato padrão
   */
  private parseDefenderAlert(alert: DefenderAlert): ParsedVulnerability {
    const severity = this.mapDefenderSeverity(alert.severity);
    const evidence = alert.evidence?.[0];
    
    return {
      raw_data: alert,
      title: alert.title,
      description: alert.description,
      severity,
      asset_name: evidence?.primaryAddress || alert.serviceSource,
      source_tool: 'Microsoft Defender for Cloud',
      plugin_id: alert.id,
      references: alert.recommendedActions,
      first_found: new Date(alert.createdDateTime),
      last_found: new Date(alert.lastModifiedDateTime),
      is_valid: this.validateDefenderAlert(alert),
      validation_errors: this.getAlertValidationErrors(alert),
      validation_warnings: this.getAlertValidationWarnings(alert)
    };
  }

  /**
   * Converte recomendação do Defender para formato padrão
   */
  private parseDefenderRecommendation(recommendation: DefenderRecommendation): ParsedVulnerability {
    const severity = this.mapDefenderSeverity(recommendation.severity);
    
    return {
      raw_data: recommendation,
      title: recommendation.displayName,
      description: recommendation.description,
      severity,
      asset_name: 'Azure Subscription',
      source_tool: 'Microsoft Defender for Cloud',
      plugin_id: recommendation.id,
      solution: recommendation.remediationDescription,
      references: recommendation.portalLink ? [recommendation.portalLink] : [],
      first_found: new Date(recommendation.lastModifiedDateTime),
      last_found: new Date(recommendation.lastModifiedDateTime),
      is_valid: this.validateDefenderRecommendation(recommendation),
      validation_errors: this.getRecommendationValidationErrors(recommendation),
      validation_warnings: this.getRecommendationValidationWarnings(recommendation)
    };
  }

  /**
   * Mapeia severidade do Defender para formato padrão
   */
  private mapDefenderSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'informational': 'Info',
      'unknown': 'Info'
    };
    
    return severityMap[severity.toLowerCase()] || 'Info';
  }

  /**
   * Valida alerta do Defender
   */
  private validateDefenderAlert(alert: DefenderAlert): boolean {
    return !!(alert.id && alert.title && alert.severity);
  }

  /**
   * Valida recomendação do Defender
   */
  private validateDefenderRecommendation(recommendation: DefenderRecommendation): boolean {
    return !!(recommendation.id && recommendation.displayName && recommendation.severity);
  }

  /**
   * Obtém erros de validação para alertas
   */
  private getAlertValidationErrors(alert: DefenderAlert): string[] {
    const errors: string[] = [];
    
    if (!alert.id) {
      errors.push('ID do alerta não encontrado');
    }
    
    if (!alert.title) {
      errors.push('Título do alerta não encontrado');
    }
    
    if (!alert.severity) {
      errors.push('Severidade não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém erros de validação para recomendações
   */
  private getRecommendationValidationErrors(recommendation: DefenderRecommendation): string[] {
    const errors: string[] = [];
    
    if (!recommendation.id) {
      errors.push('ID da recomendação não encontrado');
    }
    
    if (!recommendation.displayName) {
      errors.push('Nome da recomendação não encontrado');
    }
    
    if (!recommendation.severity) {
      errors.push('Severidade não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação para alertas
   */
  private getAlertValidationWarnings(alert: DefenderAlert): string[] {
    const warnings: string[] = [];
    
    if (!alert.description) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!alert.evidence?.length) {
      warnings.push('Evidências não encontradas');
    }
    
    if (!alert.recommendedActions?.length) {
      warnings.push('Ações recomendadas não encontradas');
    }
    
    return warnings;
  }

  /**
   * Obtém avisos de validação para recomendações
   */
  private getRecommendationValidationWarnings(recommendation: DefenderRecommendation): string[] {
    const warnings: string[] = [];
    
    if (!recommendation.description) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!recommendation.remediationDescription) {
      warnings.push('Descrição de remediação não encontrada');
    }
    
    if (!recommendation.portalLink) {
      warnings.push('Link do portal não encontrado');
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
  async getSecurityStatistics(): Promise<APIResponse<any>> {
    try {
      const [alertsResponse, scoreResponse] = await Promise.all([
        this.getSecurityAlerts({ top: 1 }),
        this.getSecureScore()
      ]);

      const stats = {
        alerts_count: alertsResponse.pagination?.count || 0,
        secure_score: scoreResponse.data?.[0]?.currentScore || 0,
        max_score: scoreResponse.data?.[0]?.maxScore || 0
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
 * Função utilitária para criar instância do conector Microsoft Defender
 */
export const createMicrosoftDefenderConnector = (config: ConnectionConfig): MicrosoftDefenderConnector => {
  return new MicrosoftDefenderConnector(config);
};

/**
 * Função para testar conexão com Microsoft Defender
 */
export const testMicrosoftDefenderConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createMicrosoftDefenderConnector(config);
  return await connector.testConnection();
};