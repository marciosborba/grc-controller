// =====================================================
// OPENVAS GMP CONNECTOR
// =====================================================
// Integração com OpenVAS/Greenbone Management Protocol (GMP)
// Documentação: https://docs.greenbone.net/API/GMP/gmp.html

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface OpenVASResult {
  id: string;
  name: string;
  comment: string;
  creation_time: string;
  modification_time: string;
  host: {
    ip: string;
    hostname: string;
    asset_id: string;
  };
  port: string;
  nvt: {
    id: string;
    name: string;
    type: string;
    family: string;
    cvss_base: string;
    cve: string[];
    bid: string[];
    xref: string[];
    tags: string;
    category: string;
    summary: string;
    insight: string;
    affected: string;
    impact: string;
    solution: {
      type: string;
      description: string;
    };
    vuldetect: string;
    qod: {
      value: string;
      type: string;
    };
    refs: {
      type: string;
      id: string;
    }[];
  };
  threat: string;
  severity: string;
  qod: {
    value: string;
    type: string;
  };
  description: string;
  original_threat: string;
  original_severity: string;
  task: {
    id: string;
    name: string;
  };
  report: {
    id: string;
    timestamp: string;
  };
  notes: {
    note: {
      id: string;
      text: string;
      creation_time: string;
      modification_time: string;
    }[];
  };
  overrides: {
    override: {
      id: string;
      text: string;
      threat: string;
      new_threat: string;
      creation_time: string;
      modification_time: string;
    }[];
  };
}

export interface OpenVASTask {
  id: string;
  name: string;
  comment: string;
  status: string;
  progress: string;
  creation_time: string;
  modification_time: string;
  config: {
    id: string;
    name: string;
    type: string;
  };
  target: {
    id: string;
    name: string;
    hosts: string[];
    exclude_hosts: string[];
    max_hosts: string;
    port_list: {
      id: string;
      name: string;
    };
  };
  scanner: {
    id: string;
    name: string;
    type: string;
  };
  schedule: {
    id: string;
    name: string;
    next_time: string;
  };
  reports: {
    report: {
      id: string;
      timestamp: string;
      scan_run_status: string;
      result_count: {
        total: number;
        high: number;
        medium: number;
        low: number;
        log: number;
        false_positive: number;
      };
    }[];
  };
}

export interface OpenVASReport {
  id: string;
  format_id: string;
  content_type: string;
  extension: string;
  summary: string;
  creation_time: string;
  modification_time: string;
  task: {
    id: string;
    name: string;
  };
  timestamp: string;
  scan_run_status: string;
  result_count: {
    total: number;
    high: number;
    medium: number;
    low: number;
    log: number;
    false_positive: number;
  };
  severity: {
    full: number;
    filtered: number;
  };
  results: OpenVASResult[];
}

export class OpenVASConnector {
  private baseUrl: string;
  private username: string;
  private password: string;
  private sessionId?: string;

  constructor(config: ConnectionConfig) {
    this.baseUrl = config.api_url || '';
    this.username = config.username || '';
    this.password = config.password || '';
    
    if (!this.baseUrl || !this.username || !this.password) {
      throw new Error('URL da API, usuário e senha são obrigatórios para OpenVAS');
    }

    // Remover trailing slash
    this.baseUrl = this.baseUrl.replace(/\/$/, '');
  }

  /**
   * Autentica na API do OpenVAS usando GMP
   */
  async authenticate(): Promise<void> {
    if (this.sessionId) {
      return; // Já autenticado
    }

    const authCommand = `<authenticate><credentials><username>${this.username}</username><password>${this.password}</password></credentials></authenticate>`;
    
    const response = await fetch(`${this.baseUrl}/gmp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml'
      },
      body: authCommand
    });

    if (!response.ok) {
      throw new Error(`Erro de autenticação: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const statusElement = xmlDoc.querySelector('authenticate_response');
    const status = statusElement?.getAttribute('status');
    
    if (status !== '200') {
      throw new Error('Falha na autenticação OpenVAS');
    }

    // Extrair session ID se fornecido
    const sessionElement = xmlDoc.querySelector('session');
    if (sessionElement) {
      this.sessionId = sessionElement.textContent || undefined;
    }
  }

  /**
   * Testa a conectividade com a API do OpenVAS
   */
  async testConnection(): Promise<APIResponse> {
    try {
      await this.authenticate();
      
      // Testar com comando get_version
      const response = await this.makeGMPRequest('<get_version/>');
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          version: this.extractTextFromXML(response, 'version'),
          api_version: 'GMP (Greenbone Management Protocol)'
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
   * Obtém lista de tarefas
   */
  async getTasks(): Promise<APIResponse<OpenVASTask[]>> {
    try {
      const response = await this.makeGMPRequest('<get_tasks/>');
      const tasks = this.parseTasksFromXML(response);
      
      return {
        success: true,
        data: tasks
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter tarefas'
      };
    }
  }

  /**
   * Obtém relatórios
   */
  async getReports(): Promise<APIResponse<OpenVASReport[]>> {
    try {
      const response = await this.makeGMPRequest('<get_reports/>');
      const reports = this.parseReportsFromXML(response);
      
      return {
        success: true,
        data: reports
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter relatórios'
      };
    }
  }

  /**
   * Obtém resultados de um relatório específico
   */
  async getReportResults(reportId: string): Promise<APIResponse<OpenVASResult[]>> {
    try {
      const response = await this.makeGMPRequest(`<get_results report_id="${reportId}"/>`);
      const results = this.parseResultsFromXML(response);
      
      return {
        success: true,
        data: results
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter resultados do relatório'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades de todos os relatórios
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allResults: OpenVASResult[] = [];
      
      // Obter todos os relatórios
      const reportsResponse = await this.getReports();
      if (!reportsResponse.success || !reportsResponse.data) {
        throw new Error('Erro ao obter relatórios');
      }

      // Para cada relatório, obter resultados
      for (const report of reportsResponse.data) {
        const resultsResponse = await this.getReportResults(report.id);
        
        if (resultsResponse.success && resultsResponse.data) {
          // Filtrar apenas vulnerabilidades (não logs)
          const vulnerabilities = resultsResponse.data.filter(result => 
            result.threat && result.threat !== 'Log' && result.threat !== 'Debug'
          );
          
          allResults.push(...vulnerabilities);
        }

        // Limite de segurança
        if (allResults.length > 10000) {
          console.warn('Limite de resultados atingido (10.000)');
          break;
        }
      }

      // Converter para formato padrão
      const vulnerabilities = allResults.map(result => this.parseOpenVASResult(result));

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
   * Converte resultado do OpenVAS para formato padrão
   */
  private parseOpenVASResult(result: OpenVASResult): ParsedVulnerability {
    const severity = this.mapOpenVASThreat(result.threat);
    
    return {
      raw_data: result,
      title: result.name || result.nvt?.name || 'OpenVAS Finding',
      description: result.description || result.nvt?.summary || '',
      severity,
      cvss_score: parseFloat(result.nvt?.cvss_base || result.severity || '0'),
      cve_id: result.nvt?.cve?.join(', '),
      asset_name: result.host?.hostname || result.host?.ip || '',
      asset_ip: result.host?.ip,
      port: result.port ? parseInt(result.port.split('/')[0]) : undefined,
      protocol: result.port ? result.port.split('/')[1] : undefined,
      source_tool: 'OpenVAS',
      plugin_id: result.nvt?.id || result.id,
      solution: result.nvt?.solution?.description,
      references: result.nvt?.refs?.map(ref => `${ref.type}:${ref.id}`) || [],
      first_found: new Date(result.creation_time),
      last_found: new Date(result.modification_time),
      is_valid: this.validateOpenVASResult(result),
      validation_errors: this.getValidationErrors(result),
      validation_warnings: this.getValidationWarnings(result)
    };
  }

  /**
   * Mapeia threat do OpenVAS para severidade padrão
   */
  private mapOpenVASThreat(threat: string): string {
    const threatMap: Record<string, string> = {
      'High': 'High',
      'Medium': 'Medium',
      'Low': 'Low',
      'Log': 'Info',
      'Debug': 'Info',
      'Error': 'Info'
    };
    
    return threatMap[threat] || 'Info';
  }

  /**
   * Valida resultado do OpenVAS
   */
  private validateOpenVASResult(result: OpenVASResult): boolean {
    return !!(result.id && result.name && result.threat && result.host?.ip);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(result: OpenVASResult): string[] {
    const errors: string[] = [];
    
    if (!result.id) {
      errors.push('ID do resultado não encontrado');
    }
    
    if (!result.name) {
      errors.push('Nome não encontrado');
    }
    
    if (!result.threat) {
      errors.push('Nível de ameaça não encontrado');
    }
    
    if (!result.host?.ip) {
      errors.push('IP do host não encontrado');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(result: OpenVASResult): string[] {
    const warnings: string[] = [];
    
    if (!result.description && !result.nvt?.summary) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!result.nvt?.solution?.description) {
      warnings.push('Solução não encontrada');
    }
    
    if (!result.nvt?.cvss_base && !result.severity) {
      warnings.push('Score CVSS não encontrado');
    }
    
    return warnings;
  }

  /**
   * Faz requisição GMP autenticada
   */
  private async makeGMPRequest(command: string): Promise<string> {
    await this.authenticate();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/xml',
      'Accept': 'application/xml'
    };

    if (this.sessionId) {
      headers['X-Session-Id'] = this.sessionId;
    }

    const response = await fetch(`${this.baseUrl}/gmp`, {
      method: 'POST',
      headers,
      body: command
    });

    if (!response.ok) {
      throw new Error(`GMP Error: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * Extrai texto de elemento XML
   */
  private extractTextFromXML(xmlString: string, elementName: string): string {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const element = xmlDoc.querySelector(elementName);
    return element?.textContent || '';
  }

  /**
   * Parse de tarefas do XML
   */
  private parseTasksFromXML(xmlString: string): OpenVASTask[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const taskElements = xmlDoc.querySelectorAll('task');
    
    const tasks: OpenVASTask[] = [];
    
    taskElements.forEach(taskEl => {
      const task: OpenVASTask = {
        id: taskEl.getAttribute('id') || '',
        name: taskEl.querySelector('name')?.textContent || '',
        comment: taskEl.querySelector('comment')?.textContent || '',
        status: taskEl.querySelector('status')?.textContent || '',
        progress: taskEl.querySelector('progress')?.textContent || '',
        creation_time: taskEl.querySelector('creation_time')?.textContent || '',
        modification_time: taskEl.querySelector('modification_time')?.textContent || '',
        config: {
          id: taskEl.querySelector('config')?.getAttribute('id') || '',
          name: taskEl.querySelector('config name')?.textContent || '',
          type: taskEl.querySelector('config type')?.textContent || ''
        },
        target: {
          id: taskEl.querySelector('target')?.getAttribute('id') || '',
          name: taskEl.querySelector('target name')?.textContent || '',
          hosts: [],
          exclude_hosts: [],
          max_hosts: '',
          port_list: {
            id: '',
            name: ''
          }
        },
        scanner: {
          id: taskEl.querySelector('scanner')?.getAttribute('id') || '',
          name: taskEl.querySelector('scanner name')?.textContent || '',
          type: taskEl.querySelector('scanner type')?.textContent || ''
        },
        schedule: {
          id: '',
          name: '',
          next_time: ''
        },
        reports: {
          report: []
        }
      };
      
      tasks.push(task);
    });
    
    return tasks;
  }

  /**
   * Parse de relatórios do XML
   */
  private parseReportsFromXML(xmlString: string): OpenVASReport[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const reportElements = xmlDoc.querySelectorAll('report');
    
    const reports: OpenVASReport[] = [];
    
    reportElements.forEach(reportEl => {
      const report: OpenVASReport = {
        id: reportEl.getAttribute('id') || '',
        format_id: reportEl.getAttribute('format_id') || '',
        content_type: reportEl.getAttribute('content_type') || '',
        extension: reportEl.getAttribute('extension') || '',
        summary: reportEl.querySelector('summary')?.textContent || '',
        creation_time: reportEl.querySelector('creation_time')?.textContent || '',
        modification_time: reportEl.querySelector('modification_time')?.textContent || '',
        task: {
          id: reportEl.querySelector('task')?.getAttribute('id') || '',
          name: reportEl.querySelector('task name')?.textContent || ''
        },
        timestamp: reportEl.querySelector('timestamp')?.textContent || '',
        scan_run_status: reportEl.querySelector('scan_run_status')?.textContent || '',
        result_count: {
          total: parseInt(reportEl.querySelector('result_count total')?.textContent || '0'),
          high: parseInt(reportEl.querySelector('result_count high')?.textContent || '0'),
          medium: parseInt(reportEl.querySelector('result_count medium')?.textContent || '0'),
          low: parseInt(reportEl.querySelector('result_count low')?.textContent || '0'),
          log: parseInt(reportEl.querySelector('result_count log')?.textContent || '0'),
          false_positive: parseInt(reportEl.querySelector('result_count false_positive')?.textContent || '0')
        },
        severity: {
          full: parseFloat(reportEl.querySelector('severity full')?.textContent || '0'),
          filtered: parseFloat(reportEl.querySelector('severity filtered')?.textContent || '0')
        },
        results: []
      };
      
      reports.push(report);
    });
    
    return reports;
  }

  /**
   * Parse de resultados do XML
   */
  private parseResultsFromXML(xmlString: string): OpenVASResult[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const resultElements = xmlDoc.querySelectorAll('result');
    
    const results: OpenVASResult[] = [];
    
    resultElements.forEach(resultEl => {
      const result: OpenVASResult = {
        id: resultEl.getAttribute('id') || '',
        name: resultEl.querySelector('name')?.textContent || '',
        comment: resultEl.querySelector('comment')?.textContent || '',
        creation_time: resultEl.querySelector('creation_time')?.textContent || '',
        modification_time: resultEl.querySelector('modification_time')?.textContent || '',
        host: {
          ip: resultEl.querySelector('host')?.textContent || '',
          hostname: resultEl.querySelector('host hostname')?.textContent || '',
          asset_id: resultEl.querySelector('host asset')?.getAttribute('asset_id') || ''
        },
        port: resultEl.querySelector('port')?.textContent || '',
        nvt: {
          id: resultEl.querySelector('nvt')?.getAttribute('oid') || '',
          name: resultEl.querySelector('nvt name')?.textContent || '',
          type: resultEl.querySelector('nvt type')?.textContent || '',
          family: resultEl.querySelector('nvt family')?.textContent || '',
          cvss_base: resultEl.querySelector('nvt cvss_base')?.textContent || '',
          cve: Array.from(resultEl.querySelectorAll('nvt cve')).map(el => el.textContent || ''),
          bid: Array.from(resultEl.querySelectorAll('nvt bid')).map(el => el.textContent || ''),
          xref: Array.from(resultEl.querySelectorAll('nvt xref')).map(el => el.textContent || ''),
          tags: resultEl.querySelector('nvt tags')?.textContent || '',
          category: resultEl.querySelector('nvt category')?.textContent || '',
          summary: resultEl.querySelector('nvt summary')?.textContent || '',
          insight: resultEl.querySelector('nvt insight')?.textContent || '',
          affected: resultEl.querySelector('nvt affected')?.textContent || '',
          impact: resultEl.querySelector('nvt impact')?.textContent || '',
          solution: {
            type: resultEl.querySelector('nvt solution')?.getAttribute('type') || '',
            description: resultEl.querySelector('nvt solution')?.textContent || ''
          },
          vuldetect: resultEl.querySelector('nvt vuldetect')?.textContent || '',
          qod: {
            value: resultEl.querySelector('nvt qod value')?.textContent || '',
            type: resultEl.querySelector('nvt qod type')?.textContent || ''
          },
          refs: Array.from(resultEl.querySelectorAll('nvt refs ref')).map(refEl => ({
            type: refEl.getAttribute('type') || '',
            id: refEl.getAttribute('id') || ''
          }))
        },
        threat: resultEl.querySelector('threat')?.textContent || '',
        severity: resultEl.querySelector('severity')?.textContent || '',
        qod: {
          value: resultEl.querySelector('qod value')?.textContent || '',
          type: resultEl.querySelector('qod type')?.textContent || ''
        },
        description: resultEl.querySelector('description')?.textContent || '',
        original_threat: resultEl.querySelector('original_threat')?.textContent || '',
        original_severity: resultEl.querySelector('original_severity')?.textContent || '',
        task: {
          id: resultEl.querySelector('task')?.getAttribute('id') || '',
          name: resultEl.querySelector('task name')?.textContent || ''
        },
        report: {
          id: resultEl.querySelector('report')?.getAttribute('id') || '',
          timestamp: resultEl.querySelector('report timestamp')?.textContent || ''
        },
        notes: {
          note: []
        },
        overrides: {
          override: []
        }
      };
      
      results.push(result);
    });
    
    return results;
  }

  /**
   * Obtém estatísticas de vulnerabilidades
   */
  async getVulnerabilityStatistics(): Promise<APIResponse<any>> {
    try {
      const reportsResponse = await this.getReports();
      
      if (!reportsResponse.success || !reportsResponse.data) {
        throw new Error('Erro ao obter relatórios para estatísticas');
      }

      const stats = reportsResponse.data.reduce((acc, report) => {
        acc.total += report.result_count.total;
        acc.high += report.result_count.high;
        acc.medium += report.result_count.medium;
        acc.low += report.result_count.low;
        return acc;
      }, { total: 0, high: 0, medium: 0, low: 0 });
      
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
 * Função utilitária para criar instância do conector OpenVAS
 */
export const createOpenVASConnector = (config: ConnectionConfig): OpenVASConnector => {
  return new OpenVASConnector(config);
};

/**
 * Função para testar conexão com OpenVAS
 */
export const testOpenVASConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createOpenVASConnector(config);
  return await connector.testConnection();
};