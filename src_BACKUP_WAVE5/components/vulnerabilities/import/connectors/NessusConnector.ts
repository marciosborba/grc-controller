// =====================================================
// NESSUS CONNECTOR
// =====================================================
// Integração com Tenable Nessus API
// Documentação: https://docs.tenable.com/nessus/Content/NessusRESTAPI.htm

import { ConnectionConfig, APIResponse, ParsedVulnerability, NessusVulnerability } from '../types/import';

export class NessusConnector {
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;
  private sessionToken?: string;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || '';
    this.apiKey = config.api_key || '';
    this.secretKey = config.password || ''; // Secret key stored in password field
    
    if (!this.baseUrl || !this.apiKey || !this.secretKey) {
      throw new Error('Configuração incompleta: URL, API Key e Secret Key são obrigatórios');
    }
  }

  /**
   * Autentica na API do Nessus e obtém token de sessão
   */
  async authenticate(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ApiKeys': `accessKey=${this.apiKey}; secretKey=${this.secretKey}`
      },
      body: JSON.stringify({
        username: this.apiKey,
        password: this.secretKey
      })
    });

    if (!response.ok) {
      throw new Error(`Erro de autenticação: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    this.sessionToken = data.token;
  }

  /**
   * Testa a conectividade com a API
   */
  async testConnection(): Promise<APIResponse> {
    try {
      await this.authenticate();
      
      // Testar acesso básico
      const response = await this.makeRequest('/server/status');
      
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
   * Lista todos os scans disponíveis
   */
  async getScans(): Promise<APIResponse> {
    try {
      const response = await this.makeRequest('/scans');
      return {
        success: true,
        data: response.scans || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter scans'
      };
    }
  }

  /**
   * Obtém detalhes de um scan específico
   */
  async getScanDetails(scanId: string): Promise<APIResponse> {
    try {
      const response = await this.makeRequest(`/scans/${scanId}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detalhes do scan'
      };
    }
  }

  /**
   * Exporta vulnerabilidades de um scan
   */
  async exportScanVulnerabilities(scanId: string, format: 'nessus' | 'csv' | 'pdf' = 'nessus'): Promise<APIResponse> {
    try {
      // Iniciar exportação
      const exportResponse = await this.makeRequest(`/scans/${scanId}/export`, {
        method: 'POST',
        body: JSON.stringify({
          format: format,
          chapters: 'vuln_hosts_summary;vuln_by_host;compliance_exec;remediations;vuln_by_plugin;compliance'
        })
      });

      const fileId = exportResponse.file;
      
      // Aguardar conclusão da exportação
      let exportStatus = 'loading';
      while (exportStatus === 'loading') {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2 segundos
        
        const statusResponse = await this.makeRequest(`/scans/${scanId}/export/${fileId}/status`);
        exportStatus = statusResponse.status;
      }

      if (exportStatus !== 'ready') {
        throw new Error('Falha na exportação do scan');
      }

      // Baixar arquivo exportado
      const downloadResponse = await this.makeRequest(`/scans/${scanId}/export/${fileId}/download`, {
        responseType: 'blob'
      });

      return {
        success: true,
        data: {
          fileId,
          content: downloadResponse
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao exportar vulnerabilidades'
      };
    }
  }

  /**
   * Obtém vulnerabilidades de um scan via API (sem exportação)
   */
  async getScanVulnerabilities(scanId: string): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const response = await this.makeRequest(`/scans/${scanId}`);
      const vulnerabilities: ParsedVulnerability[] = [];

      if (response.vulnerabilities) {
        for (const vuln of response.vulnerabilities) {
          const parsedVuln = this.parseNessusVulnerability(vuln);
          vulnerabilities.push(parsedVuln);
        }
      }

      return {
        success: true,
        data: vulnerabilities
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter vulnerabilidades'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades de todos os scans
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const scansResponse = await this.getScans();
      if (!scansResponse.success || !scansResponse.data) {
        throw new Error('Erro ao obter lista de scans');
      }

      const allVulnerabilities: ParsedVulnerability[] = [];

      for (const scan of scansResponse.data) {
        if (scan.status === 'completed') {
          const vulnResponse = await this.getScanVulnerabilities(scan.id);
          if (vulnResponse.success && vulnResponse.data) {
            allVulnerabilities.push(...vulnResponse.data);
          }
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
   * Converte vulnerabilidade do Nessus para formato padrão
   */
  private parseNessusVulnerability(nessusVuln: any): ParsedVulnerability {
    const severity = this.mapNessusSeverity(nessusVuln.severity);
    
    return {
      raw_data: nessusVuln,
      title: nessusVuln.plugin_name || 'Vulnerabilidade sem título',
      description: nessusVuln.description || '',
      severity,
      cvss_score: parseFloat(nessusVuln.cvss_base_score) || undefined,
      cve_id: nessusVuln.cve?.join(', ') || undefined,
      cwe_id: nessusVuln.cwe?.join(', ') || undefined,
      asset_name: nessusVuln.hostname || nessusVuln.host_ip || '',
      asset_ip: nessusVuln.host_ip || undefined,
      port: nessusVuln.port || undefined,
      protocol: nessusVuln.protocol || undefined,
      source_tool: 'Nessus',
      plugin_id: nessusVuln.plugin_id?.toString() || undefined,
      solution: nessusVuln.solution || undefined,
      references: nessusVuln.see_also || [],
      first_found: nessusVuln.first_found ? new Date(nessusVuln.first_found) : undefined,
      last_found: nessusVuln.last_found ? new Date(nessusVuln.last_found) : undefined,
      is_valid: this.validateNessusVulnerability(nessusVuln),
      validation_errors: this.getValidationErrors(nessusVuln),
      validation_warnings: this.getValidationWarnings(nessusVuln)
    };
  }

  /**
   * Mapeia severidade do Nessus para formato padrão
   */
  private mapNessusSeverity(severity: number | string): string {
    const severityNum = typeof severity === 'string' ? parseInt(severity) : severity;
    
    switch (severityNum) {
      case 4: return 'Critical';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      case 0: return 'Info';
      default: return 'Info';
    }
  }

  /**
   * Valida se a vulnerabilidade do Nessus está completa
   */
  private validateNessusVulnerability(vuln: any): boolean {
    return !!(vuln.plugin_name && vuln.severity !== undefined);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(vuln: any): string[] {
    const errors: string[] = [];
    
    if (!vuln.plugin_name) {
      errors.push('Nome do plugin não encontrado');
    }
    
    if (vuln.severity === undefined) {
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
    
    if (!vuln.solution) {
      warnings.push('Solução não encontrada');
    }
    
    if (!vuln.cvss_base_score) {
      warnings.push('CVSS Score não encontrado');
    }
    
    return warnings;
  }

  /**
   * Faz requisição autenticada para a API
   */
  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    if (!this.sessionToken && endpoint !== '/session') {
      await this.authenticate();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.sessionToken) {
      headers['X-Cookie'] = `token=${this.sessionToken}`;
    } else if (endpoint !== '/session') {
      headers['X-ApiKeys'] = `accessKey=${this.apiKey}; secretKey=${this.secretKey}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    if (options.responseType === 'blob') {
      return await response.blob();
    }

    return await response.json();
  }

  /**
   * Encerra a sessão
   */
  async logout(): Promise<void> {
    if (this.sessionToken) {
      try {
        await this.makeRequest('/session', { method: 'DELETE' });
      } catch (error) {
        // Ignorar erros de logout
      } finally {
        this.sessionToken = undefined;
      }
    }
  }
}

/**
 * Função utilitária para criar instância do conector Nessus
 */
export const createNessusConnector = (config: ConnectionConfig): NessusConnector => {
  return new NessusConnector(config);
};

/**
 * Função para testar conexão com Nessus
 */
export const testNessusConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createNessusConnector(config);
  try {
    return await connector.testConnection();
  } finally {
    await connector.logout();
  }
};