// =====================================================
// NESSUS PARSER
// =====================================================
// Parser para arquivos .nessus (XML format)

import { ParsedVulnerability } from '../types/import';

export interface NessusReport {
  name: string;
  hosts: NessusHost[];
  scan_info: {
    scanner_name: string;
    scanner_version: string;
    policy_used: string;
    num_hosts: number;
    num_scanned: number;
    start_time: Date;
    end_time: Date;
  };
}

export interface NessusHost {
  name: string;
  ip: string;
  fqdn?: string;
  operating_system?: string;
  mac_address?: string;
  vulnerabilities: NessusVulnerability[];
  host_properties: Record<string, string>;
}

export interface NessusVulnerability {
  plugin_id: string;
  plugin_name: string;
  plugin_family: string;
  severity: number;
  port: string;
  protocol: string;
  service: string;
  description: string;
  solution: string;
  synopsis: string;
  plugin_output?: string;
  cvss_base_score?: string;
  cvss_temporal_score?: string;
  cvss_vector?: string;
  cve?: string[];
  bid?: string[];
  xref?: string[];
  see_also?: string[];
  plugin_publication_date?: string;
  plugin_modification_date?: string;
  vuln_publication_date?: string;
  patch_publication_date?: string;
  risk_factor: string;
  exploit_available?: boolean;
  exploitability_ease?: string;
  exploit_framework_core?: boolean;
  exploit_framework_metasploit?: boolean;
  exploit_framework_canvas?: boolean;
  metasploit_name?: string;
  canvas_package?: string;
}

export class NessusParser {
  /**
   * Parse completo de arquivo .nessus
   */
  static parseNessusFile(xmlContent: string): NessusReport {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Verificar se é um arquivo Nessus válido
    const nessusClientData = doc.querySelector('NessusClientData_v2');
    if (!nessusClientData) {
      throw new Error('Arquivo não é um relatório Nessus válido');
    }

    const report = nessusClientData.querySelector('Report');
    if (!report) {
      throw new Error('Relatório não encontrado no arquivo Nessus');
    }

    const reportName = report.getAttribute('name') || 'Relatório Nessus';
    
    // Parse das informações do scan
    const scanInfo = this.parseScanInfo(doc);
    
    // Parse dos hosts
    const hosts = this.parseHosts(doc);

    return {
      name: reportName,
      hosts,
      scan_info: scanInfo
    };
  }

  /**
   * Parse das informações do scan
   */
  private static parseScanInfo(doc: Document): any {
    const preferences = doc.querySelectorAll('preference');
    const scanInfo: any = {
      scanner_name: 'Nessus',
      scanner_version: '',
      policy_used: '',
      num_hosts: 0,
      num_scanned: 0,
      start_time: new Date(),
      end_time: new Date()
    };

    preferences.forEach(pref => {
      const name = pref.querySelector('name')?.textContent;
      const value = pref.querySelector('value')?.textContent;
      
      if (name && value) {
        switch (name) {
          case 'scanner_version':
            scanInfo.scanner_version = value;
            break;
          case 'policy_used':
            scanInfo.policy_used = value;
            break;
          case 'HOST_START':
            scanInfo.start_time = new Date(value);
            break;
          case 'HOST_END':
            scanInfo.end_time = new Date(value);
            break;
        }
      }
    });

    // Contar hosts
    const reportHosts = doc.querySelectorAll('ReportHost');
    scanInfo.num_hosts = reportHosts.length;
    scanInfo.num_scanned = reportHosts.length;

    return scanInfo;
  }

  /**
   * Parse dos hosts e suas vulnerabilidades
   */
  private static parseHosts(doc: Document): NessusHost[] {
    const hosts: NessusHost[] = [];
    const reportHosts = doc.querySelectorAll('ReportHost');

    reportHosts.forEach(reportHost => {
      const hostName = reportHost.getAttribute('name') || '';
      
      // Parse das propriedades do host
      const hostProperties: Record<string, string> = {};
      const hostTags = reportHost.querySelectorAll('HostProperties tag');
      
      hostTags.forEach(tag => {
        const name = tag.getAttribute('name');
        const value = tag.textContent;
        if (name && value) {
          hostProperties[name] = value;
        }
      });

      // Extrair informações principais do host
      const host: NessusHost = {
        name: hostName,
        ip: hostProperties['host-ip'] || hostName,
        fqdn: hostProperties['host-fqdn'],
        operating_system: hostProperties['operating-system'],
        mac_address: hostProperties['mac-address'],
        vulnerabilities: [],
        host_properties: hostProperties
      };

      // Parse das vulnerabilidades
      const reportItems = reportHost.querySelectorAll('ReportItem');
      reportItems.forEach(item => {
        const vulnerability = this.parseReportItem(item, host);
        if (vulnerability) {
          host.vulnerabilities.push(vulnerability);
        }
      });

      hosts.push(host);
    });

    return hosts;
  }

  /**
   * Parse de um ReportItem (vulnerabilidade)
   */
  private static parseReportItem(item: Element, host: NessusHost): NessusVulnerability | null {
    const pluginId = item.getAttribute('pluginID');
    const pluginName = item.getAttribute('pluginName');
    const pluginFamily = item.getAttribute('pluginFamily');
    const severity = parseInt(item.getAttribute('severity') || '0');
    const port = item.getAttribute('port') || '0';
    const protocol = item.getAttribute('protocol') || '';
    const service = item.getAttribute('svc_name') || '';

    if (!pluginId || !pluginName) {
      return null;
    }

    const vulnerability: NessusVulnerability = {
      plugin_id: pluginId,
      plugin_name: pluginName,
      plugin_family: pluginFamily || '',
      severity,
      port,
      protocol,
      service,
      description: '',
      solution: '',
      synopsis: '',
      risk_factor: this.mapSeverityToRisk(severity)
    };

    // Parse dos elementos filhos
    const children = item.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const tagName = child.tagName;
      const textContent = child.textContent || '';

      switch (tagName) {
        case 'description':
          vulnerability.description = textContent;
          break;
        case 'solution':
          vulnerability.solution = textContent;
          break;
        case 'synopsis':
          vulnerability.synopsis = textContent;
          break;
        case 'plugin_output':
          vulnerability.plugin_output = textContent;
          break;
        case 'cvss_base_score':
          vulnerability.cvss_base_score = textContent;
          break;
        case 'cvss_temporal_score':
          vulnerability.cvss_temporal_score = textContent;
          break;
        case 'cvss_vector':
          vulnerability.cvss_vector = textContent;
          break;
        case 'cve':
          if (!vulnerability.cve) vulnerability.cve = [];
          vulnerability.cve.push(textContent);
          break;
        case 'bid':
          if (!vulnerability.bid) vulnerability.bid = [];
          vulnerability.bid.push(textContent);
          break;
        case 'xref':
          if (!vulnerability.xref) vulnerability.xref = [];
          vulnerability.xref.push(textContent);
          break;
        case 'see_also':
          if (!vulnerability.see_also) vulnerability.see_also = [];
          vulnerability.see_also.push(textContent);
          break;
        case 'plugin_publication_date':
          vulnerability.plugin_publication_date = textContent;
          break;
        case 'plugin_modification_date':
          vulnerability.plugin_modification_date = textContent;
          break;
        case 'vuln_publication_date':
          vulnerability.vuln_publication_date = textContent;
          break;
        case 'patch_publication_date':
          vulnerability.patch_publication_date = textContent;
          break;
        case 'exploit_available':
          vulnerability.exploit_available = textContent.toLowerCase() === 'true';
          break;
        case 'exploitability_ease':
          vulnerability.exploitability_ease = textContent;
          break;
        case 'exploit_framework_core':
          vulnerability.exploit_framework_core = textContent.toLowerCase() === 'true';
          break;
        case 'exploit_framework_metasploit':
          vulnerability.exploit_framework_metasploit = textContent.toLowerCase() === 'true';
          break;
        case 'exploit_framework_canvas':
          vulnerability.exploit_framework_canvas = textContent.toLowerCase() === 'true';
          break;
        case 'metasploit_name':
          vulnerability.metasploit_name = textContent;
          break;
        case 'canvas_package':
          vulnerability.canvas_package = textContent;
          break;
      }
    }

    return vulnerability;
  }

  /**
   * Converte vulnerabilidades Nessus para formato padrão
   */
  static convertToStandardFormat(nessusReport: NessusReport): ParsedVulnerability[] {
    const vulnerabilities: ParsedVulnerability[] = [];

    nessusReport.hosts.forEach(host => {
      host.vulnerabilities.forEach(vuln => {
        const standardVuln: ParsedVulnerability = {
          raw_data: vuln,
          title: vuln.plugin_name,
          description: vuln.description || vuln.synopsis,
          severity: this.mapNessusSeverity(vuln.severity),
          cvss_score: vuln.cvss_base_score ? parseFloat(vuln.cvss_base_score) : undefined,
          cve_id: vuln.cve?.join(', '),
          asset_name: host.fqdn || host.name,
          asset_ip: host.ip,
          port: vuln.port !== '0' ? parseInt(vuln.port) : undefined,
          protocol: vuln.protocol || undefined,
          source_tool: 'Nessus',
          plugin_id: vuln.plugin_id,
          solution: vuln.solution,
          references: vuln.see_also,
          is_valid: this.validateNessusVulnerability(vuln),
          validation_errors: this.getValidationErrors(vuln),
          validation_warnings: this.getValidationWarnings(vuln)
        };

        vulnerabilities.push(standardVuln);
      });
    });

    return vulnerabilities;
  }

  /**
   * Mapeia severidade numérica do Nessus para string
   */
  private static mapNessusSeverity(severity: number): string {
    switch (severity) {
      case 4: return 'Critical';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      case 0: return 'Info';
      default: return 'Info';
    }
  }

  /**
   * Mapeia severidade para fator de risco
   */
  private static mapSeverityToRisk(severity: number): string {
    switch (severity) {
      case 4: return 'Critical';
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      case 0: return 'None';
      default: return 'None';
    }
  }

  /**
   * Valida vulnerabilidade Nessus
   */
  private static validateNessusVulnerability(vuln: NessusVulnerability): boolean {
    return !!(vuln.plugin_id && vuln.plugin_name && vuln.severity !== undefined);
  }

  /**
   * Obtém erros de validação
   */
  private static getValidationErrors(vuln: NessusVulnerability): string[] {
    const errors: string[] = [];
    
    if (!vuln.plugin_id) {
      errors.push('Plugin ID não encontrado');
    }
    
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
  private static getValidationWarnings(vuln: NessusVulnerability): string[] {
    const warnings: string[] = [];
    
    if (!vuln.description && !vuln.synopsis) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!vuln.solution) {
      warnings.push('Solução não encontrada');
    }
    
    if (!vuln.cvss_base_score) {
      warnings.push('CVSS Score não encontrado');
    }
    
    if (!vuln.cve || vuln.cve.length === 0) {
      warnings.push('CVE não encontrado');
    }
    
    return warnings;
  }

  /**
   * Extrai estatísticas do relatório
   */
  static extractStatistics(nessusReport: NessusReport): {
    total_vulnerabilities: number;
    by_severity: Record<string, number>;
    by_host: Record<string, number>;
    by_family: Record<string, number>;
    unique_cves: number;
    exploitable_vulns: number;
  } {
    const stats = {
      total_vulnerabilities: 0,
      by_severity: { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 },
      by_host: {} as Record<string, number>,
      by_family: {} as Record<string, number>,
      unique_cves: 0,
      exploitable_vulns: 0
    };

    const uniqueCves = new Set<string>();

    nessusReport.hosts.forEach(host => {
      stats.by_host[host.name] = host.vulnerabilities.length;
      
      host.vulnerabilities.forEach(vuln => {
        stats.total_vulnerabilities++;
        
        // Contar por severidade
        const severity = this.mapNessusSeverity(vuln.severity);
        stats.by_severity[severity]++;
        
        // Contar por família
        if (!stats.by_family[vuln.plugin_family]) {
          stats.by_family[vuln.plugin_family] = 0;
        }
        stats.by_family[vuln.plugin_family]++;
        
        // Contar CVEs únicos
        if (vuln.cve) {
          vuln.cve.forEach(cve => uniqueCves.add(cve));
        }
        
        // Contar vulnerabilidades exploráveis
        if (vuln.exploit_available) {
          stats.exploitable_vulns++;
        }
      });
    });

    stats.unique_cves = uniqueCves.size;

    return stats;
  }
}

/**
 * Função utilitária para parse de arquivo Nessus
 */
export const parseNessusFile = (xmlContent: string): ParsedVulnerability[] => {
  const report = NessusParser.parseNessusFile(xmlContent);
  return NessusParser.convertToStandardFormat(report);
};

/**
 * Função utilitária para validar arquivo Nessus
 */
export const validateNessusFile = (xmlContent: string): { isValid: boolean; error?: string } => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Verificar erros de parsing
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return { isValid: false, error: 'Arquivo XML inválido' };
    }
    
    // Verificar se é um arquivo Nessus
    const nessusClientData = doc.querySelector('NessusClientData_v2');
    if (!nessusClientData) {
      return { isValid: false, error: 'Não é um arquivo Nessus válido' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};