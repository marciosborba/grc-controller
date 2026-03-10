// =====================================================
// ORCA SECURITY CONNECTOR
// =====================================================
// Integração com Orca Security Cloud Security Platform API
// Documentação: https://docs.orcasecurity.io/docs/api-reference

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface OrcaAlert {
  alert_id: string;
  alert_type: string;
  state: string;
  severity: string;
  score: number;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  asset_unique_id: string;
  asset_name: string;
  asset_type: string;
  asset_cloud_provider: string;
  asset_cloud_account_id: string;
  asset_region: string;
  asset_tags: Record<string, string>;
  compliance_frameworks: string[];
  cve_id?: string;
  cvss_score?: number;
  cvss_vector?: string;
  first_seen: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
  source: string;
  rule_id: string;
  rule_name: string;
  evidence?: any;
  context?: any;
}

export interface OrcaAsset {
  unique_id: string;
  name: string;
  type: string;
  cloud_provider: string;
  cloud_account_id: string;
  region: string;
  tags: Record<string, string>;
  ip_addresses: string[];
  dns_names: string[];
  operating_system?: string;
  created_at: string;
  updated_at: string;
  last_seen: string;
}

export class OrcaSecurityConnector {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || 'https://api.orcasecurity.io';
    this.apiKey = config.api_key || '';
    
    if (!this.apiKey) {
      throw new Error('API Key é obrigatória para conectar com Orca Security');
    }

    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'GRC-Controller-Import/1.0'
    };
  }

  /**
   * Testa a conectividade com a API do Orca Security
   */
  async testConnection(): Promise<APIResponse> {
    try {
      // Testar com endpoint de informações da organização
      const response = await this.makeRequest('/api/organization');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          organization: response.name,
          api_version: 'v1',
          endpoints: ['/api/alerts', '/api/assets', '/api/compliance']
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
   * Obtém alertas de segurança (vulnerabilidades)
   */
  async getAlerts(options: {
    state?: string[];
    severity?: string[];
    category?: string[];
    asset_type?: string[];
    cloud_provider?: string[];
    limit?: number;
    offset?: number;
    from_date?: string;
    to_date?: string;
  } = {}): Promise<APIResponse<OrcaAlert[]>> {
    try {
      const params = new URLSearchParams();
      
      // Configurar parâmetros da consulta
      if (options.state?.length) {
        params.append('state', options.state.join(','));
      }
      
      if (options.severity?.length) {
        params.append('severity', options.severity.join(','));
      }
      
      if (options.category?.length) {
        params.append('category', options.category.join(','));
      }
      
      if (options.asset_type?.length) {
        params.append('asset_type', options.asset_type.join(','));
      }
      
      if (options.cloud_provider?.length) {
        params.append('cloud_provider', options.cloud_provider.join(','));
      }
      
      if (options.from_date) {
        params.append('from_date', options.from_date);\n      }\n      \n      if (options.to_date) {\n        params.append('to_date', options.to_date);\n      }\n      \n      params.append('limit', (options.limit || 1000).toString());\n      params.append('offset', (options.offset || 0).toString());\n\n      const response = await this.makeRequest(`/api/alerts?${params.toString()}`);\n      \n      return {\n        success: true,\n        data: response.data || [],\n        pagination: {\n          total: response.total || 0,\n          limit: response.limit || 1000,\n          offset: response.offset || 0,\n          has_more: response.has_more || false\n        }\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'Erro ao obter alertas'\n      };\n    }\n  }\n\n  /**\n   * Obtém detalhes de um alerta específico\n   */\n  async getAlertDetails(alertId: string): Promise<APIResponse<OrcaAlert>> {\n    try {\n      const response = await this.makeRequest(`/api/alerts/${alertId}`);\n      \n      return {\n        success: true,\n        data: response\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'Erro ao obter detalhes do alerta'\n      };\n    }\n  }\n\n  /**\n   * Obtém informações de ativos\n   */\n  async getAssets(options: {\n    asset_type?: string[];\n    cloud_provider?: string[];\n    region?: string[];\n    limit?: number;\n    offset?: number;\n  } = {}): Promise<APIResponse<OrcaAsset[]>> {\n    try {\n      const params = new URLSearchParams();\n      \n      if (options.asset_type?.length) {\n        params.append('asset_type', options.asset_type.join(','));\n      }\n      \n      if (options.cloud_provider?.length) {\n        params.append('cloud_provider', options.cloud_provider.join(','));\n      }\n      \n      if (options.region?.length) {\n        params.append('region', options.region.join(','));\n      }\n      \n      params.append('limit', (options.limit || 1000).toString());\n      params.append('offset', (options.offset || 0).toString());\n\n      const response = await this.makeRequest(`/api/assets?${params.toString()}`);\n      \n      return {\n        success: true,\n        data: response.data || []\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'Erro ao obter ativos'\n      };\n    }\n  }\n\n  /**\n   * Obtém todas as vulnerabilidades com paginação automática\n   */\n  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {\n    try {\n      const allAlerts: OrcaAlert[] = [];\n      let offset = 0;\n      const limit = 1000;\n      let hasMore = true;\n\n      // Buscar apenas alertas de segurança ativos\n      while (hasMore) {\n        const response = await this.getAlerts({\n          state: ['open', 'in_progress'],\n          category: ['security', 'vulnerability', 'malware', 'data_risk'],\n          limit,\n          offset\n        });\n\n        if (!response.success || !response.data) {\n          throw new Error(response.error || 'Erro ao obter alertas');\n        }\n\n        allAlerts.push(...response.data);\n        \n        hasMore = response.pagination?.has_more || false;\n        offset += limit;\n\n        // Limite de segurança para evitar loops infinitos\n        if (offset > 50000) {\n          console.warn('Limite de alertas atingido (50.000). Interrompendo busca.');\n          break;\n        }\n      }\n\n      // Converter alertas para formato padrão\n      const vulnerabilities = allAlerts.map(alert => this.parseOrcaAlert(alert));\n\n      return {\n        success: true,\n        data: vulnerabilities\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'Erro ao obter todas as vulnerabilidades'\n      };\n    }\n  }\n\n  /**\n   * Converte alerta do Orca para formato padrão\n   */\n  private parseOrcaAlert(orcaAlert: OrcaAlert): ParsedVulnerability {\n    const severity = this.mapOrcaSeverity(orcaAlert.severity);\n    \n    return {\n      raw_data: orcaAlert,\n      title: orcaAlert.title || orcaAlert.rule_name,\n      description: orcaAlert.description || '',\n      severity,\n      cvss_score: orcaAlert.cvss_score || (orcaAlert.score ? orcaAlert.score / 10 : undefined),\n      cve_id: orcaAlert.cve_id,\n      asset_name: orcaAlert.asset_name || orcaAlert.asset_unique_id,\n      asset_ip: this.extractAssetIP(orcaAlert),\n      source_tool: 'Orca Security',\n      plugin_id: orcaAlert.rule_id,\n      solution: orcaAlert.recommendation,\n      first_found: orcaAlert.first_seen ? new Date(orcaAlert.first_seen) : undefined,\n      last_found: orcaAlert.last_seen ? new Date(orcaAlert.last_seen) : undefined,\n      is_valid: this.validateOrcaAlert(orcaAlert),\n      validation_errors: this.getValidationErrors(orcaAlert),\n      validation_warnings: this.getValidationWarnings(orcaAlert)\n    };\n  }\n\n  /**\n   * Mapeia severidade do Orca para formato padrão\n   */\n  private mapOrcaSeverity(severity: string): string {\n    const severityStr = severity.toLowerCase();\n    \n    switch (severityStr) {\n      case 'critical':\n      case 'very_high':\n        return 'Critical';\n      case 'high':\n        return 'High';\n      case 'medium':\n      case 'moderate':\n        return 'Medium';\n      case 'low':\n        return 'Low';\n      case 'informational':\n      case 'info':\n        return 'Info';\n      default:\n        return 'Info';\n    }\n  }\n\n  /**\n   * Extrai IP do ativo do alerta\n   */\n  private extractAssetIP(alert: OrcaAlert): string | undefined {\n    // Tentar extrair IP do contexto ou evidência\n    if (alert.context?.ip_address) {\n      return alert.context.ip_address;\n    }\n    \n    if (alert.evidence?.ip_addresses?.length > 0) {\n      return alert.evidence.ip_addresses[0];\n    }\n    \n    return undefined;\n  }\n\n  /**\n   * Valida se o alerta do Orca está completo\n   */\n  private validateOrcaAlert(alert: OrcaAlert): boolean {\n    return !!(alert.alert_id && alert.title && alert.severity && alert.asset_name);\n  }\n\n  /**\n   * Obtém erros de validação\n   */\n  private getValidationErrors(alert: OrcaAlert): string[] {\n    const errors: string[] = [];\n    \n    if (!alert.alert_id) {\n      errors.push('ID do alerta não encontrado');\n    }\n    \n    if (!alert.title) {\n      errors.push('Título do alerta não encontrado');\n    }\n    \n    if (!alert.severity) {\n      errors.push('Severidade não encontrada');\n    }\n    \n    if (!alert.asset_name) {\n      errors.push('Nome do ativo não encontrado');\n    }\n    \n    return errors;\n  }\n\n  /**\n   * Obtém avisos de validação\n   */\n  private getValidationWarnings(alert: OrcaAlert): string[] {\n    const warnings: string[] = [];\n    \n    if (!alert.description) {\n      warnings.push('Descrição não encontrada');\n    }\n    \n    if (!alert.recommendation) {\n      warnings.push('Recomendação não encontrada');\n    }\n    \n    if (!alert.cvss_score && !alert.score) {\n      warnings.push('Score de risco não encontrado');\n    }\n    \n    if (!alert.cve_id) {\n      warnings.push('CVE não encontrado');\n    }\n    \n    return warnings;\n  }\n\n  /**\n   * Faz requisição autenticada para a API\n   */\n  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {\n    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;\n    \n    const response = await fetch(url, {\n      method: options.method || 'GET',\n      headers: {\n        ...this.headers,\n        ...options.headers\n      },\n      body: options.body,\n      ...options\n    });\n\n    if (!response.ok) {\n      let errorMessage = `API Error: ${response.status} ${response.statusText}`;\n      \n      try {\n        const errorData = await response.json();\n        if (errorData.message) {\n          errorMessage = errorData.message;\n        } else if (errorData.error) {\n          errorMessage = errorData.error;\n        }\n      } catch {\n        // Usar mensagem padrão se não conseguir parsear JSON\n      }\n      \n      throw new Error(errorMessage);\n    }\n\n    const contentType = response.headers.get('content-type');\n    if (contentType?.includes('application/json')) {\n      return await response.json();\n    }\n    \n    return await response.text();\n  }\n\n  /**\n   * Obtém estatísticas de alertas\n   */\n  async getAlertStatistics(): Promise<APIResponse<any>> {\n    try {\n      const response = await this.makeRequest('/api/alerts/statistics');\n      \n      return {\n        success: true,\n        data: response\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'Erro ao obter estatísticas'\n      };\n    }\n  }\n\n  /**\n   * Obtém informações de compliance\n   */\n  async getComplianceFindings(framework?: string): Promise<APIResponse<any>> {\n    try {\n      const params = framework ? `?framework=${framework}` : '';\n      const response = await this.makeRequest(`/api/compliance/findings${params}`);\n      \n      return {\n        success: true,\n        data: response\n      };\n    } catch (error) {\n      return {\n        success: false,\n        error: error instanceof Error ? error.message : 'Erro ao obter findings de compliance'\n      };\n    }\n  }\n}\n\n/**\n * Função utilitária para criar instância do conector Orca Security\n */\nexport const createOrcaSecurityConnector = (config: ConnectionConfig): OrcaSecurityConnector => {\n  return new OrcaSecurityConnector(config);\n};\n\n/**\n * Função para testar conexão com Orca Security\n */\nexport const testOrcaSecurityConnection = async (config: ConnectionConfig): Promise<APIResponse> => {\n  const connector = createOrcaSecurityConnector(config);\n  return await connector.testConnection();\n};