// =====================================================
// AWS INSPECTOR V2 CONNECTOR
// =====================================================
// Integração com AWS Inspector v2 API
// Documentação: https://docs.aws.amazon.com/inspector/v2/APIReference/

import { ConnectionConfig, APIResponse, ParsedVulnerability } from '../types/import';

export interface AWSInspectorFinding {
  findingArn: string;
  awsAccountId: string;
  type: string;
  description: string;
  title: string;
  severity: string;
  firstObservedAt: string;
  lastObservedAt: string;
  updatedAt: string;
  status: string;
  remediation: {
    recommendation: {
      text: string;
      url?: string;
    };
  };
  packageVulnerabilityDetails?: {
    cvss?: {
      baseScore: number;
      scoringVector: string;
      version: string;
    }[];
    referenceUrls: string[];
    relatedVulnerabilities: string[];
    source: string;
    sourceUrl: string;
    vendorCreatedAt: string;
    vendorSeverity: string;
    vulnerabilityId: string;
    vulnerablePackages: {
      arch: string;
      epoch: number;
      name: string;
      packageManager: string;
      version: string;
      release: string;
    }[];
  };
  networkReachabilityDetails?: {
    networkPath: {
      steps: any[];
    };
    openPortRange: {
      begin: number;
      end: number;
    };
    protocol: string;
  };
  resources: {
    details: {
      awsEc2Instance?: {
        iamInstanceProfileArn: string;
        imageId: string;
        ipV4Addresses: string[];
        ipV6Addresses: string[];
        keyName: string;
        launchedAt: string;
        platform: string;
        subnetId: string;
        type: string;
        vpcId: string;
      };
      awsEcrContainerImage?: {
        architecture: string;
        author: string;
        imageHash: string;
        imageId: string;
        imageTags: string[];
        platform: string;
        pushedAt: string;
        registry: string;
        repositoryName: string;
      };
    };
    id: string;
    partition: string;
    region: string;
    tags: Record<string, string>;
    type: string;
  }[];
  inspectorScore?: number;
  inspectorScoreDetails?: {
    adjustedCvss: {
      adjustments: any[];
      cvssSource: string;
      score: number;
      scoreSource: string;
      scoringVector: string;
      version: string;
    };
  };
}

export class AWSInspectorConnector {
  private region: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private sessionToken?: string;
  private baseUrl: string;

  constructor(config: ConnectionConfig) {
    this.region = config.region || 'us-east-1';
    this.accessKeyId = config.access_key_id || config.api_key || '';
    this.secretAccessKey = config.secret_access_key || config.password || '';
    this.sessionToken = config.session_token;
    
    if (!this.accessKeyId || !this.secretAccessKey) {
      throw new Error('AWS Access Key ID e Secret Access Key são obrigatórios');
    }

    this.baseUrl = `https://inspector2.${this.region}.amazonaws.com`;
  }

  /**
   * Testa a conectividade com a API do AWS Inspector v2
   */
  async testConnection(): Promise<APIResponse> {
    try {
      // Testar com endpoint de status
      const response = await this.makeRequest('DescribeOrganizationConfiguration', {});
      
      return {
        success: true,
        message: 'Conexão estabelecida com sucesso',
        data: {
          region: this.region,
          service: 'AWS Inspector v2'
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
   * Lista findings (vulnerabilidades)
   */
  async getFindings(options: {
    filterCriteria?: {
      findingStatus?: string[];
      severity?: string[];
      findingType?: string[];
      resourceType?: string[];
      resourceId?: string[];
      firstObservedAt?: {
        startInclusive?: Date;
        endInclusive?: Date;
      };
      lastObservedAt?: {
        startInclusive?: Date;
        endInclusive?: Date;
      };
    };
    maxResults?: number;
    nextToken?: string;
    sortCriteria?: {
      field: string;
      sortOrder: 'ASC' | 'DESC';
    };
  } = {}): Promise<APIResponse<AWSInspectorFinding[]>> {
    try {
      const payload: any = {};
      
      if (options.filterCriteria) {
        payload.filterCriteria = this.buildFilterCriteria(options.filterCriteria);
      }
      
      if (options.maxResults) {
        payload.maxResults = Math.min(options.maxResults, 100); // AWS limit
      }
      
      if (options.nextToken) {
        payload.nextToken = options.nextToken;
      }
      
      if (options.sortCriteria) {
        payload.sortCriteria = options.sortCriteria;
      }

      const response = await this.makeRequest('ListFindings', payload);
      
      return {
        success: true,
        data: response.findings || [],
        pagination: {
          nextToken: response.nextToken,
          hasMore: !!response.nextToken
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
   * Obtém detalhes de findings específicos
   */
  async getFindingDetails(findingArns: string[]): Promise<APIResponse<AWSInspectorFinding[]>> {
    try {
      const response = await this.makeRequest('BatchGetFindingDetails', {
        findingArns: findingArns.slice(0, 100) // AWS limit
      });
      
      return {
        success: true,
        data: response.findingDetails || []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao obter detalhes dos findings'
      };
    }
  }

  /**
   * Obtém todas as vulnerabilidades
   */
  async getAllVulnerabilities(): Promise<APIResponse<ParsedVulnerability[]>> {
    try {
      const allFindings: AWSInspectorFinding[] = [];
      let nextToken: string | undefined;

      do {
        const response = await this.getFindings({
          filterCriteria: {
            findingStatus: ['ACTIVE'],
            findingType: ['PACKAGE_VULNERABILITY', 'NETWORK_REACHABILITY']
          },
          maxResults: 100,
          nextToken,
          sortCriteria: {
            field: 'SEVERITY',
            sortOrder: 'DESC'
          }
        });

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Erro ao obter findings');
        }

        allFindings.push(...response.data);
        nextToken = response.pagination?.nextToken;

        // Limite de segurança
        if (allFindings.length > 10000) {
          console.warn('Limite de findings atingido (10.000). Interrompendo busca.');
          break;
        }
      } while (nextToken);

      // Converter para formato padrão
      const vulnerabilities = allFindings.map(finding => this.parseAWSInspectorFinding(finding));

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
   * Constrói critérios de filtro para a API
   */
  private buildFilterCriteria(criteria: any): any {
    const filterCriteria: any = {};

    if (criteria.findingStatus?.length) {
      filterCriteria.findingStatus = criteria.findingStatus.map((status: string) => ({ 
        comparison: 'EQUALS', 
        value: status 
      }));
    }

    if (criteria.severity?.length) {
      filterCriteria.severity = criteria.severity.map((severity: string) => ({ 
        comparison: 'EQUALS', 
        value: severity 
      }));
    }

    if (criteria.findingType?.length) {
      filterCriteria.findingType = criteria.findingType.map((type: string) => ({ 
        comparison: 'EQUALS', 
        value: type 
      }));
    }

    if (criteria.resourceType?.length) {
      filterCriteria.resourceType = criteria.resourceType.map((type: string) => ({ 
        comparison: 'EQUALS', 
        value: type 
      }));
    }

    if (criteria.firstObservedAt) {
      filterCriteria.firstObservedAt = [{
        startInclusive: criteria.firstObservedAt.startInclusive?.getTime(),
        endInclusive: criteria.firstObservedAt.endInclusive?.getTime()
      }];
    }

    return filterCriteria;
  }

  /**
   * Converte finding do AWS Inspector para formato padrão
   */
  private parseAWSInspectorFinding(finding: AWSInspectorFinding): ParsedVulnerability {
    const severity = this.mapAWSSeverity(finding.severity);
    const resource = finding.resources[0];
    
    return {
      raw_data: finding,
      title: finding.title,
      description: finding.description,
      severity,
      cvss_score: finding.packageVulnerabilityDetails?.cvss?.[0]?.baseScore || 
                  finding.inspectorScore,
      cve_id: finding.packageVulnerabilityDetails?.vulnerabilityId,
      asset_name: resource?.id || finding.awsAccountId,
      asset_ip: resource?.details?.awsEc2Instance?.ipV4Addresses?.[0],
      port: finding.networkReachabilityDetails?.openPortRange?.begin,
      protocol: finding.networkReachabilityDetails?.protocol,
      source_tool: 'AWS Inspector v2',
      plugin_id: finding.findingArn,
      solution: finding.remediation?.recommendation?.text,
      references: finding.packageVulnerabilityDetails?.referenceUrls || 
                 (finding.remediation?.recommendation?.url ? [finding.remediation.recommendation.url] : []),
      first_found: new Date(finding.firstObservedAt),
      last_found: new Date(finding.lastObservedAt),
      is_valid: this.validateAWSFinding(finding),
      validation_errors: this.getValidationErrors(finding),
      validation_warnings: this.getValidationWarnings(finding)
    };
  }

  /**
   * Mapeia severidade do AWS Inspector para formato padrão
   */
  private mapAWSSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'CRITICAL': 'Critical',
      'HIGH': 'High',
      'MEDIUM': 'Medium',
      'LOW': 'Low',
      'INFORMATIONAL': 'Info'
    };
    
    return severityMap[severity] || 'Info';
  }

  /**
   * Valida finding do AWS Inspector
   */
  private validateAWSFinding(finding: AWSInspectorFinding): boolean {
    return !!(finding.findingArn && finding.title && finding.severity && finding.resources?.length);
  }

  /**
   * Obtém erros de validação
   */
  private getValidationErrors(finding: AWSInspectorFinding): string[] {
    const errors: string[] = [];
    
    if (!finding.findingArn) {
      errors.push('ARN do finding não encontrado');
    }
    
    if (!finding.title) {
      errors.push('Título não encontrado');
    }
    
    if (!finding.severity) {
      errors.push('Severidade não encontrada');
    }
    
    if (!finding.resources?.length) {
      errors.push('Recursos não encontrados');
    }
    
    return errors;
  }

  /**
   * Obtém avisos de validação
   */
  private getValidationWarnings(finding: AWSInspectorFinding): string[] {
    const warnings: string[] = [];
    
    if (!finding.description) {
      warnings.push('Descrição não encontrada');
    }
    
    if (!finding.remediation?.recommendation?.text) {
      warnings.push('Recomendação de remediação não encontrada');
    }
    
    if (!finding.packageVulnerabilityDetails?.cvss?.[0]?.baseScore && !finding.inspectorScore) {
      warnings.push('Score CVSS não encontrado');
    }
    
    return warnings;
  }

  /**
   * Faz requisição autenticada para a API usando AWS Signature v4
   */
  private async makeRequest(action: string, payload: any): Promise<any> {
    const headers = await this.getSignedHeaders(action, payload);
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `AWS API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.__type) {
          errorMessage = `${errorData.__type}: ${errorData.message || 'Unknown error'}`;
        }
      } catch {
        // Usar mensagem padrão se não conseguir parsear JSON
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  /**
   * Gera headers assinados para AWS Signature v4
   */
  private async getSignedHeaders(action: string, payload: any): Promise<Record<string, string>> {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substr(0, 8);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `Inspector2_20201201.${action}`,
      'X-Amz-Date': amzDate,
      'Host': `inspector2.${this.region}.amazonaws.com`
    };

    if (this.sessionToken) {
      headers['X-Amz-Security-Token'] = this.sessionToken;
    }

    // Simplificação: Em produção, usar biblioteca AWS SDK para assinatura completa
    headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${dateStamp}/${this.region}/inspector2/aws4_request, SignedHeaders=content-type;host;x-amz-date;x-amz-target, Signature=placeholder`;

    return headers;
  }

  /**
   * Obtém estatísticas de findings
   */
  async getFindingStatistics(): Promise<APIResponse<any>> {
    try {
      const response = await this.makeRequest('GetFindingsReportStatus', {});
      
      return {
        success: true,
        data: response
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
 * Função utilitária para criar instância do conector AWS Inspector
 */
export const createAWSInspectorConnector = (config: ConnectionConfig): AWSInspectorConnector => {
  return new AWSInspectorConnector(config);
};

/**
 * Função para testar conexão com AWS Inspector
 */
export const testAWSInspectorConnection = async (config: ConnectionConfig): Promise<APIResponse> => {
  const connector = createAWSInspectorConnector(config);
  return await connector.testConnection();
};