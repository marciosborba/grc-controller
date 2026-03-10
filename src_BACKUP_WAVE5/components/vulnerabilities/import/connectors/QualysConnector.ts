// =====================================================
// QUALYS CONNECTOR
// =====================================================
// Integração com Qualys VMDR API
// Documentação: https://www.qualys.com/docs/qualys-api-vmpc-user-guide.pdf

import { ConnectionConfig, APIResponse, ParsedVulnerability, QualysVulnerability } from '../types/import';

export class QualysConnector {
  private baseUrl: string;
  private username: string;
  private password: string;
  private authHeader: string;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || '';
    this.username = config.username || '';
    this.password = config.password || '';
    
    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error('Configuração incompleta: URL, usuário e senha são obrigatórios');
    }

    // Criar header de autenticação Basic Auth
    this.authHeader = 'Basic ' + btoa(`${this.username}:${this.password}`);
  }

  /**
   * Testa a conectividade com a API
   */
  async testConnection(): Promise<APIResponse> {
    try {
      // Testar com endpoint de informações da conta
      const response = await this.makeRequest('/api/2.0/fo/subscription/');
      
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
   * Lista todos os hosts/ativos
   */
  async getHosts(): Promise<APIResponse> {
    try {
      const response = await this.makeRequest('/api/2.0/fo/asset/host/');
      return {
        success: true,
        data: this.parseXmlResponse(response, 'HOST')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter hosts'
      };
    }
  }

  /**
   * Obtém detecções de vulnerabilidades
   */
  async getVulnerabilityDetections(options: {
    hostIds?: string[];
    qids?: string[];
    severities?: string[];
    states?: string[];
    lastModifiedAfter?: Date;
    lastModifiedBefore?: Date;
  } = {}): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const params = new URLSearchParams();
      
      // Configurar parâmetros da consulta
      params.append('action', 'list');
      params.append('output_format', 'XML');
      
      if (options.hostIds?.length) {
        params.append('ids', options.hostIds.join(','));
      }
      
      if (options.qids?.length) {
        params.append('qids', options.qids.join(','));
      }
      
      if (options.severities?.length) {
        params.append('severities', options.severities.join(','));
      }
      
      if (options.states?.length) {
        params.append('states', options.states.join(','));
      }
      
      if (options.lastModifiedAfter) {
        params.append('vm_scan_date_after', this.formatQualysDate(options.lastModifiedAfter));
      }
      
      if (options.lastModifiedBefore) {
        params.append('vm_scan_date_before', this.formatQualysDate(options.lastModifiedBefore));
      }

      const response = await this.makeRequest(`/api/2.0/fo/asset/host/vm/detection/?${params.toString()}`);
      const detections = this.parseDetectionsXml(response);
      
      const vulnerabilities = detections.map(detection => this.parseQualysVulnerability(detection));

      return {
        success: true,
        data: vulnerabilities
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detecções de vulnerabilidades'
      };
    }
  }

  /**
   * Obtém informações da base de conhecimento de vulnerabilidades
   */
  async getKnowledgeBase(qids: string[]): Promise<APIResponse> {
    try {
      const params = new URLSearchParams();
      params.append('action', 'list');
      params.append('ids', qids.join(','));
      params.append('details', 'All');

      const response = await this.makeRequest(`/api/2.0/fo/knowledge_base/vuln/?${params.toString()}`);
      
      return {
        success: true,
        data: this.parseXmlResponse(response, 'VULN')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter base de conhecimento'
      };
    }
  }

  /**
   * Obtém relatórios de scan
   */
  async getScanReports(): Promise<APIResponse> {
    try {
      const response = await this.makeRequest('/api/2.0/fo/scan/');
      return {
        success: true,
        data: this.parseXmlResponse(response, 'SCAN')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter relatórios de scan'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades com detalhes completos
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      // Primeiro, obter todas as detecções
      const detectionsResponse = await this.getVulnerabilityDetections({
        states: ['Active', 'New', 'Reopened'] // Apenas vulnerabilidades ativas
      });

      if (!detectionsResponse.success || !detectionsResponse.data) {
        throw new Error('Erro ao obter detecções');
      }

      // Obter QIDs únicos para buscar detalhes na base de conhecimento
      const uniqueQids = [...new Set(
        detectionsResponse.data
          .map(vuln => vuln.plugin_id)
          .filter(Boolean) as string[]
      )];

      // Buscar detalhes na base de conhecimento em lotes
      const kbDetails: Record<string, any> = {};
      const batchSize = 100; // Qualys limita a 100 QIDs por requisição

      for (let i = 0; i < uniqueQids.length; i += batchSize) {
        const batch = uniqueQids.slice(i, i + batchSize);
        const kbResponse = await this.getKnowledgeBase(batch);
        
        if (kbResponse.success && kbResponse.data) {
          kbResponse.data.forEach((kb: any) => {
            kbDetails[kb.QID] = kb;
          });
        }
      }

      // Enriquecer vulnerabilidades com detalhes da base de conhecimento
      const enrichedVulnerabilities = detectionsResponse.data.map(vuln => {
        const kbDetail = kbDetails[vuln.plugin_id || ''];
        if (kbDetail) {
          return {
            ...vuln,
            description: kbDetail.DIAGNOSIS || vuln.description,
            solution: kbDetail.SOLUTION || vuln.solution,
            cve_id: kbDetail.CVE_ID || vuln.cve_id,
            cvss_score: parseFloat(kbDetail.CVSS_BASE) || vuln.cvss_score
          };
        }
        return vuln;
      });

      return {
        success: true,
        data: enrichedVulnerabilities
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter todas as vulnerabilidades'
      };
    }
  }

  /**
   * Converte detecção do Qualys para formato padrão
   */
  private parseQualysVulnerability(qualysDetection: any): ParsedVulnerability {
    const severity = this.mapQualysSeverity(qualysDetection.SEVERITY);
    
    return {
      raw_data: qualysDetection,
      title: qualysDetection.TITLE || `QID ${qualysDetection.QID}`,
      description: qualysDetection.DIAGNOSIS || '',
      severity,
      cvss_score: parseFloat(qualysDetection.CVSS_BASE) || undefined,
      cve_id: qualysDetection.CVE_ID || undefined,
      asset_name: qualysDetection.DNS || qualysDetection.IP || '',
      asset_ip: qualysDetection.IP || undefined,
      port: qualysDetection.PORT ? parseInt(qualysDetection.PORT) : undefined,
      protocol: qualysDetection.PROTOCOL || undefined,
      source_tool: 'Qualys',
      plugin_id: qualysDetection.QID?.toString() || undefined,
      solution: qualysDetection.SOLUTION || undefined,
      first_found: qualysDetection.FIRST_FOUND_DATETIME ? 
        new Date(qualysDetection.FIRST_FOUND_DATETIME) : undefined,
      last_found: qualysDetection.LAST_FOUND_DATETIME ? 
        new Date(qualysDetection.LAST_FOUND_DATETIME) : undefined,
      is_valid: this.validateQualysVulnerability(qualysDetection),
      validation_errors: this.getValidationErrors(qualysDetection),
      validation_warnings: this.getValidationWarnings(qualysDetection)
    };
  }

  /**
   * Mapeia severidade do Qualys para formato padrão
   */
  private mapQualysSeverity(severity: number | string): string {
    const severityNum = typeof severity === 'string' ? parseInt(severity) : severity;
    
    switch (severityNum) {
      case 5: return 'Critical';
      case 4: return 'High';
      case 3: return 'Medium';
      case 2: return 'Low';
      case 1: return 'Info';
      default: return 'Info';
    }
  }

  /**
   * Valida se a detecção do Qualys está completa
   */
  private validateQualysVulnerability(detection: any): boolean {
    return !!(detection.QID && detection.SEVERITY !== undefined);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(detection: any): string[] {
    const errors: string[] = [];
    
    if (!detection.QID) {
      errors.push('QID não encontrado');
    }
    
    if (detection.SEVERITY === undefined) {
      errors.push('Severidade não encontrada');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(detection: any): string[] {
    const warnings: string[] = [];
    
    if (!detection.TITLE) {
      warnings.push('Título não encontrado');
    }
    
    if (!detection.DIAGNOSIS) {
      warnings.push('Diagnóstico não encontrado');
    }
    
    if (!detection.SOLUTION) {
      warnings.push('Solução não encontrada');
    }
    
    return warnings;
  }

  /**
   * Faz requisição autenticada para a API
   */
  private async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    const headers: Record<string, string> = {
      'Authorization': this.authHeader,
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/xml') || contentType?.includes('text/xml')) {
      return await response.text();
    }

    return await response.json();
  }

  /**
   * Parse de resposta XML genérica
   */
  private parseXmlResponse(xmlString: string, elementName: string): any[] {
    const results: any[] = [];
    
    // Regex para encontrar elementos
    const elementRegex = new RegExp(`<${elementName}[^>]*>(.*?)</${elementName}>`, 'gs');
    let match;
    
    while ((match = elementRegex.exec(xmlString)) !== null) {
      const elementContent = match[1];
      const element: any = {};
      
      // Extrair atributos do elemento
      const elementTag = xmlString.substring(match.index, match.index + match[0].indexOf('>') + 1);
      const attributeRegex = /(\w+)="([^"]*)"/g;
      let attrMatch;
      
      while ((attrMatch = attributeRegex.exec(elementTag)) !== null) {
        element[attrMatch[1]] = attrMatch[2];
      }
      
      // Extrair sub-elementos
      const subElementRegex = /<(\w+)>(.*?)<\/\1>/g;
      let subMatch;
      
      while ((subMatch = subElementRegex.exec(elementContent)) !== null) {
        element[subMatch[1]] = subMatch[2];
      }
      
      results.push(element);
    }
    
    return results;
  }

  /**
   * Parse específico para detecções de vulnerabilidades
   */
  private parseDetectionsXml(xmlString: string): any[] {
    const detections: any[] = [];
    
    // Parse de hosts e suas detecções
    const hostRegex = /<HOST[^>]*>(.*?)<\/HOST>/gs;
    let hostMatch;
    
    while ((hostMatch = hostRegex.exec(xmlString)) !== null) {
      const hostContent = hostMatch[1];
      
      // Extrair informações do host
      const hostInfo: any = {};
      const hostTag = xmlString.substring(hostMatch.index, hostMatch.index + hostMatch[0].indexOf('>') + 1);
      const hostIdMatch = hostTag.match(/id="([^"]*)"/);
      if (hostIdMatch) hostInfo.HOST_ID = hostIdMatch[1];
      
      // Extrair IP e DNS
      const ipMatch = hostContent.match(/<IP>(.*?)<\/IP>/);
      if (ipMatch) hostInfo.IP = ipMatch[1];
      
      const dnsMatch = hostContent.match(/<DNS>(.*?)<\/DNS>/);
      if (dnsMatch) hostInfo.DNS = dnsMatch[1];
      
      // Extrair detecções
      const detectionRegex = /<DETECTION[^>]*>(.*?)<\/DETECTION>/gs;
      let detectionMatch;
      
      while ((detectionMatch = detectionRegex.exec(hostContent)) !== null) {
        const detectionContent = detectionMatch[1];
        const detection: any = { ...hostInfo };
        
        // Extrair campos da detecção
        const qidMatch = detectionContent.match(/<QID>(.*?)<\/QID>/);
        if (qidMatch) detection.QID = qidMatch[1];
        
        const typeMatch = detectionContent.match(/<TYPE>(.*?)<\/TYPE>/);
        if (typeMatch) detection.TYPE = typeMatch[1];
        
        const severityMatch = detectionContent.match(/<SEVERITY>(.*?)<\/SEVERITY>/);
        if (severityMatch) detection.SEVERITY = parseInt(severityMatch[1]);
        
        const portMatch = detectionContent.match(/<PORT>(.*?)<\/PORT>/);
        if (portMatch) detection.PORT = portMatch[1];
        
        const protocolMatch = detectionContent.match(/<PROTOCOL>(.*?)<\/PROTOCOL>/);
        if (protocolMatch) detection.PROTOCOL = protocolMatch[1];
        
        const statusMatch = detectionContent.match(/<STATUS>(.*?)<\/STATUS>/);
        if (statusMatch) detection.STATUS = statusMatch[1];
        
        const firstFoundMatch = detectionContent.match(/<FIRST_FOUND_DATETIME>(.*?)<\/FIRST_FOUND_DATETIME>/);
        if (firstFoundMatch) detection.FIRST_FOUND_DATETIME = firstFoundMatch[1];
        
        const lastFoundMatch = detectionContent.match(/<LAST_FOUND_DATETIME>(.*?)<\/LAST_FOUND_DATETIME>/);
        if (lastFoundMatch) detection.LAST_FOUND_DATETIME = lastFoundMatch[1];
        
        detections.push(detection);
      }
    }
    
    return detections;
  }

  /**
   * Formata data para formato aceito pelo Qualys
   */
  private formatQualysDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

/**
 * Função utilitária para criar instância do conector Qualys
 */
export const createQualysConnector = (config: ConnectionConfig): QualysConnector => {
  return new QualysConnector(config);
};

/**
 * Função para testar conexão com Qualys
 */
export const testQualysConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createQualysConnector(config);
  return await connector.testConnection();
};