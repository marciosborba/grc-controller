// =====================================================
// OWASP ZAP CONNECTOR
// =====================================================
// Integração com OWASP ZAP REST API
// Documentação: https://www.zaproxy.org/docs/api/

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface ZAPAlert {
  sourceid: string;
  other: string;
  method: string;
  evidence: string;
  pluginId: string;
  cweid: string;
  confidence: string;
  wascid: string;
  description: string;
  messageId: string;
  inputVector: string;
  url: string;
  tags: Record<string, string>;
  reference: string;
  solution: string;
  alert: string;
  param: string;
  attack: string;
  name: string;
  risk: string;
  id: string;
  alertRef: string;
}

export interface ZAPScan {
  id: string;
  progress: string;
  state: string;
  reqCount: string;
  newAlerts: string;
}

export interface ZAPContext {
  id: string;
  name: string;
  description: string;
  inScope: boolean;
  excludeRegexs: string[];
  includeRegexs: string[];
  technology: {
    include: string[];
    exclude: string[];
  };
  urlParameterParsers: {
    class: string;
    config: Record<string, string>;
  }[];
  postParameterParsers: {
    class: string;
    config: Record<string, string>;
  }[];
  dataStores: {
    name: string;
    value: string;
  }[];
}

export interface ZAPSession {
  session: string;
  sessionId: string;
}

export class OWASPZAPConnector {
  private baseUrl: string;
  private apiKey: string;
  private headers: Record<string, string>;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || 'http://localhost:8080';
    this.apiKey = config.api_key || '';
    
    if (!this.baseUrl) {
      throw new Error('URL da API é obrigatória para OWASP ZAP');
    }

    // Remover trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');

    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Adicionar API key se fornecida
    if (this.apiKey) {
      this.headers['X-ZAP-API-Key'] = this.apiKey;
    }
  }

  /**
   * Testa a conectividade com a API do OWASP ZAP
   */
  async testConnection(): Promise<APIResponse> {
    try {
      // Testar com endpoint de versão
      const response = await this.makeRequest('/JSON/core/view/version/');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          version: response.version,
          api_version: 'ZAP API'
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
   * Obtém informações da sessão atual
   */
  async getSessionInfo(): Promise<APIResponse<ZAPSession>> {
    try {
      const response = await this.makeRequest('/JSON/core/view/sessionLocation/');
      
      return {
        success: true,
        data: {
          session: response.sessionLocation || '',
          sessionId: response.sessionId || ''
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter informações da sessão'
      };
    }
  }

  /**
   * Lista contextos disponíveis
   */
  async getContexts(): Promise<APIResponse<ZAPContext[]>> {
    try {
      const response = await this.makeRequest('/JSON/context/view/contextList/');
      
      return {
        success: true,
        data: response.contextList || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter contextos'
      };
    }
  }

  /**
   * Obtém alertas de segurança
   */
  async getAlerts(options: {
    baseurl?: string;
    start?: number;
    count?: number;
    riskId?: string;
  } = {}): Promise<APIResponse<ZAPAlert[]>> {
    try {
      const params = new URLSearchParams();
      
      if (options.baseurl) {
        params.append('baseurl', options.baseurl);
      }
      
      if (options.start !== undefined) {
        params.append('start', options.start.toString());
      }
      
      if (options.count) {
        params.append('count', options.count.toString());
      }
      
      if (options.riskId) {
        params.append('riskId', options.riskId);
      }

      const endpoint = `/JSON/core/view/alerts/?${params.toString()}`;
      const response = await this.makeRequest(endpoint);
      
      return {
        success: true,
        data: response.alerts || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter alertas'
      };
    }
  }

  /**
   * Obtém alertas por risco
   */
  async getAlertsByRisk(risk: 'High' | 'Medium' | 'Low' | 'Informational'): Promise<APIResponse<ZAPAlert[]>> {
    try {
      const riskMap = {
        'High': '3',
        'Medium': '2', 
        'Low': '1',
        'Informational': '0'
      };

      const response = await this.makeRequest(`/JSON/core/view/alertsByRisk/?riskId=${riskMap[risk]}`);
      
      return {
        success: true,
        data: response.alertsByRisk || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter alertas por risco'
      };
    }
  }

  /**
   * Obtém detalhes de um alerta específico
   */
  async getAlertDetails(alertId: string): Promise<APIResponse<ZAPAlert>> {
    try {
      const response = await this.makeRequest(`/JSON/core/view/alert/?id=${alertId}`);
      
      return {
        success: true,
        data: response.alert
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detalhes do alerta'
      };
    }
  }

  /**
   * Obtém status dos scans ativos
   */
  async getActiveScans(): Promise<APIResponse<ZAPScan[]>> {
    try {
      const response = await this.makeRequest('/JSON/ascan/view/scans/');
      
      return {
        success: true,
        data: response.scans || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter scans ativos'
      };
    }
  }

  /**
   * Obtém URLs no escopo
   */
  async getUrlsInScope(): Promise<APIResponse<string[]>> {
    try {
      const response = await this.makeRequest('/JSON/core/view/urls/');
      
      return {
        success: true,
        data: response.urls || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter URLs no escopo'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allAlerts: ZAPAlert[] = [];
      
      // Obter alertas de todos os níveis de risco
      const risks: Array<'High' | 'Medium' | 'Low' | 'Informational'> = ['High', 'Medium', 'Low', 'Informational'];
      
      for (const risk of risks) {
        const alertsResponse = await this.getAlertsByRisk(risk);
        
        if (alertsResponse.success && alertsResponse.data) {
          allAlerts.push(...alertsResponse.data);
        }
      }

      // Também obter alertas gerais para garantir que não perdemos nenhum
      const generalAlertsResponse = await this.getAlerts({ count: 1000 });
      if (generalAlertsResponse.success && generalAlertsResponse.data) {
        // Filtrar duplicatas baseado no ID
        const existingIds = new Set(allAlerts.map(alert => alert.id));
        const newAlerts = generalAlertsResponse.data.filter(alert => !existingIds.has(alert.id));
        allAlerts.push(...newAlerts);
      }

      // Converter para formato padrão
      const vulnerabilities = allAlerts.map(alert => this.parseZAPAlert(alert));

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
   * Converte alerta do ZAP para formato padrão
   */
  private parseZAPAlert(alert: ZAPAlert): ParsedVulnerability {
    const severity = this.mapZAPRisk(alert.risk);
    const url = new URL(alert.url);
    
    return {
      raw_data: alert,
      title: alert.name || alert.alert,
      description: alert.description,
      severity,
      cwe_id: alert.cweid,
      asset_name: url.hostname,
      asset_ip: url.hostname,
      port: url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80),
      protocol: url.protocol.replace(':', ''),
      source_tool: 'OWASP ZAP',
      plugin_id: alert.pluginId,
      solution: alert.solution,
      references: alert.reference ? alert.reference.split('\n').filter(ref => ref.trim()) : [],
      is_valid: this.validateZAPAlert(alert),
      validation_errors: this.getValidationErrors(alert),
      validation_warnings: this.getValidationWarnings(alert)
    };
  }

  /**
   * Mapeia risco do ZAP para severidade padrão
   */
  private mapZAPRisk(risk: string): string {
    const riskMap: Record<string, string> = {
      'High': 'High',
      'Medium': 'Medium',
      'Low': 'Low',
      'Informational': 'Info'
    };
    
    return riskMap[risk] || 'Info';
  }

  /**
   * Valida alerta do ZAP
   */
  private validateZAPAlert(alert: ZAPAlert): boolean {
    return !!(alert.id && alert.name && alert.risk && alert.url);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(alert: ZAPAlert): string[] {
    const errors: string[] = [];
    
    if (!alert.id) {
      errors.push('ID do alerta não encontrado');
    }
    
    if (!alert.name) {
      errors.push('Nome do alerta não encontrado');
    }
    
    if (!alert.risk) {
      errors.push('Nível de risco não encontrado');
    }
    
    if (!alert.url) {
      errors.push('URL não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(alert: ZAPAlert): string[] {
    const warnings: string[] = [];
    
    if (!alert.description) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!alert.solution) {
      warnings.push('Solução não encontrada');
    }
    
    if (!alert.cweid) {
      warnings.push('CWE ID não encontrado');
    }
    
    if (!alert.confidence) {
      warnings.push('Nível de confiança não encontrado');
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
   * Inicia um scan ativo (opcional)
   */
  async startActiveScan(url: string, options: {
    recurse?: boolean;
    inScopeOnly?: boolean;
    scanPolicyName?: string;
    method?: string;
    postData?: string;
    contextId?: string;
  } = {}): Promise<APIResponse<{ scanId: string }>> {
    try {
      const params = new URLSearchParams();
      params.append('url', url);
      
      if (options.recurse !== undefined) {
        params.append('recurse', options.recurse.toString());
      }
      
      if (options.inScopeOnly !== undefined) {
        params.append('inScopeOnly', options.inScopeOnly.toString());
      }
      
      if (options.scanPolicyName) {
        params.append('scanPolicyName', options.scanPolicyName);
      }
      
      if (options.method) {
        params.append('method', options.method);
      }
      
      if (options.postData) {
        params.append('postData', options.postData);
      }
      
      if (options.contextId) {
        params.append('contextId', options.contextId);
      }

      const response = await this.makeRequest(`/JSON/ascan/action/scan/?${params.toString()}`, {
        method: 'POST'
      });
      
      return {
        success: true,
        data: { scanId: response.scan }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao iniciar scan ativo'
      };
    }
  }

  /**
   * Obtém estatísticas de alertas
   */
  async getAlertStatistics(): Promise<APIResponse<any>> {
    try {
      const [highAlerts, mediumAlerts, lowAlerts, infoAlerts] = await Promise.all([
        this.getAlertsByRisk('High'),
        this.getAlertsByRisk('Medium'),
        this.getAlertsByRisk('Low'),
        this.getAlertsByRisk('Informational')
      ]);

      const stats = {
        high: highAlerts.data?.length || 0,
        medium: mediumAlerts.data?.length || 0,
        low: lowAlerts.data?.length || 0,
        informational: infoAlerts.data?.length || 0,
        total: (highAlerts.data?.length || 0) + 
               (mediumAlerts.data?.length || 0) + 
               (lowAlerts.data?.length || 0) + 
               (infoAlerts.data?.length || 0)
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
 * Função utilitária para criar instância do conector OWASP ZAP
 */
export const createOWASPZAPConnector = (config: ConnectionConfig): OWASPZAPConnector => {
  return new OWASPZAPConnector(config);
};

/**
 * Função para testar conexão com OWASP ZAP
 */
export const testOWASPZAPConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createOWASPZAPConnector(config);
  return await connector.testConnection();
};