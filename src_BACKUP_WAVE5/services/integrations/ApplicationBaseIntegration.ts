import { createClient } from '@supabase/supabase-js';

export interface ApplicationCredentials {
  server?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  token?: string;
  database?: string;
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  subscriptionId?: string;
  region?: string;
  additionalParams?: Record<string, any>;
}

export interface ApplicationData {
  id: string;
  name: string;
  type: 'Web Application' | 'Mobile App' | 'API' | 'Database' | 'Cloud Service' | 'Desktop App' | 'Microservice';
  status: 'Ativo' | 'Desenvolvimento' | 'Teste' | 'Descontinuado' | 'Manutenção';
  url?: string;
  technology: string;
  framework?: string;
  language?: string;
  version?: string;
  owner: string;
  department?: string;
  description?: string;
  repository_url?: string;
  documentation_url?: string;
  environment: 'Production' | 'Staging' | 'Development' | 'Testing';
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  data_classification: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  compliance_requirements?: string[];
  last_deployment?: Date;
  created_date?: Date;
  source_tool: string;
  source_type: string;
  raw_data?: any;
}

export interface ApplicationImportResult {
  success: boolean;
  total_found: number;
  imported: number;
  skipped: number;
  errors: string[];
  applications: ApplicationData[];
}

export abstract class ApplicationBaseIntegration {
  protected credentials: ApplicationCredentials;
  protected supabase: any;

  constructor(credentials: ApplicationCredentials) {
    this.credentials = credentials;
    
    // Initialize Supabase client with service role for backend operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  abstract testConnection(): Promise<boolean>;
  abstract importApplications(filters?: any): Promise<ApplicationImportResult>;
  
  protected async saveApplications(applications: ApplicationData[], tenantId: string): Promise<number> {
    try {
      const applicationsToInsert = applications.map(app => ({
        tenant_id: tenantId,
        app_id: app.id,
        name: app.name,
        type: app.type,
        status: app.status,
        url: app.url,
        technology: app.technology,
        framework: app.framework,
        language: app.language,
        version: app.version,
        owner: app.owner,
        department: app.department,
        description: app.description,
        repository_url: app.repository_url,
        documentation_url: app.documentation_url,
        environment: app.environment,
        criticality: app.criticality,
        data_classification: app.data_classification,
        compliance_requirements: app.compliance_requirements,
        last_deployment: app.last_deployment,
        created_date: app.created_date,
        source_tool: app.source_tool,
        source_type: app.source_type,
        raw_data: app.raw_data,
        created_at: new Date(),
        updated_at: new Date()
      }));

      const { data, error } = await this.supabase
        .from('applications')
        .insert(applicationsToInsert)
        .select();

      if (error) {
        console.error('Error saving applications:', error);
        throw new Error(`Failed to save applications: ${error.message}`);
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in saveApplications:', error);
      throw error;
    }
  }

  protected normalizeApplication(rawData: any, sourceType: string): ApplicationData {
    // Base normalization - to be overridden by specific integrations
    return {
      id: rawData.id || rawData.app_id || rawData.application_id || `${sourceType}-${Date.now()}-${Math.random()}`,
      name: rawData.name || rawData.application_name || rawData.app_name || 'Unknown Application',
      type: this.normalizeApplicationType(rawData.type || rawData.app_type || rawData.category),
      status: this.normalizeApplicationStatus(rawData.status || rawData.state),
      url: rawData.url || rawData.endpoint || rawData.base_url,
      technology: rawData.technology || rawData.tech_stack || rawData.platform || 'Unknown',
      framework: rawData.framework,
      language: rawData.language || rawData.programming_language,
      version: rawData.version || rawData.app_version,
      owner: rawData.owner || rawData.responsible || rawData.team || 'Unknown Owner',
      department: rawData.department || rawData.business_unit,
      description: rawData.description || rawData.summary,
      repository_url: rawData.repository_url || rawData.repo_url || rawData.git_url,
      documentation_url: rawData.documentation_url || rawData.docs_url,
      environment: this.normalizeEnvironment(rawData.environment || rawData.env),
      criticality: this.normalizeCriticality(rawData.criticality || rawData.business_criticality),
      data_classification: this.normalizeDataClassification(rawData.data_classification || rawData.sensitivity),
      compliance_requirements: this.parseComplianceRequirements(rawData.compliance || rawData.regulations),
      last_deployment: rawData.last_deployment ? new Date(rawData.last_deployment) : undefined,
      created_date: rawData.created_date || rawData.creation_date ? new Date(rawData.created_date || rawData.creation_date) : undefined,
      source_tool: sourceType,
      source_type: sourceType,
      raw_data: rawData
    };
  }

  protected normalizeApplicationType(type: string): 'Web Application' | 'Mobile App' | 'API' | 'Database' | 'Cloud Service' | 'Desktop App' | 'Microservice' {
    const typeStr = type?.toString().toLowerCase() || '';
    
    if (typeStr.includes('web') || typeStr.includes('website') || typeStr.includes('portal')) return 'Web Application';
    if (typeStr.includes('mobile') || typeStr.includes('android') || typeStr.includes('ios')) return 'Mobile App';
    if (typeStr.includes('api') || typeStr.includes('rest') || typeStr.includes('graphql') || typeStr.includes('service')) return 'API';
    if (typeStr.includes('database') || typeStr.includes('db') || typeStr.includes('sql')) return 'Database';
    if (typeStr.includes('cloud') || typeStr.includes('saas') || typeStr.includes('aws') || typeStr.includes('azure')) return 'Cloud Service';
    if (typeStr.includes('desktop') || typeStr.includes('client')) return 'Desktop App';
    if (typeStr.includes('microservice') || typeStr.includes('micro-service')) return 'Microservice';
    
    return 'Web Application';
  }

  protected normalizeApplicationStatus(status: string): 'Ativo' | 'Desenvolvimento' | 'Teste' | 'Descontinuado' | 'Manutenção' {
    const statusStr = status?.toString().toLowerCase() || '';
    
    if (statusStr.includes('active') || statusStr.includes('production') || statusStr.includes('live') || statusStr.includes('running')) return 'Ativo';
    if (statusStr.includes('development') || statusStr.includes('dev') || statusStr.includes('building')) return 'Desenvolvimento';
    if (statusStr.includes('test') || statusStr.includes('staging') || statusStr.includes('qa')) return 'Teste';
    if (statusStr.includes('maintenance') || statusStr.includes('maint')) return 'Manutenção';
    if (statusStr.includes('retired') || statusStr.includes('deprecated') || statusStr.includes('discontinued')) return 'Descontinuado';
    
    return 'Ativo';
  }

  protected normalizeEnvironment(environment: string): 'Production' | 'Staging' | 'Development' | 'Testing' {
    const envStr = environment?.toString().toLowerCase() || '';
    
    if (envStr.includes('prod') || envStr.includes('production')) return 'Production';
    if (envStr.includes('staging') || envStr.includes('stage')) return 'Staging';
    if (envStr.includes('dev') || envStr.includes('development')) return 'Development';
    if (envStr.includes('test') || envStr.includes('qa') || envStr.includes('testing')) return 'Testing';
    
    return 'Production';
  }

  protected normalizeCriticality(criticality: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    const critStr = criticality?.toString().toLowerCase() || '';
    
    if (critStr.includes('critical') || critStr.includes('mission-critical')) return 'Critical';
    if (critStr.includes('high') || critStr.includes('important')) return 'High';
    if (critStr.includes('medium') || critStr.includes('moderate')) return 'Medium';
    if (critStr.includes('low') || critStr.includes('minor')) return 'Low';
    
    return 'Medium';
  }

  protected normalizeDataClassification(classification: string): 'Public' | 'Internal' | 'Confidential' | 'Restricted' {
    const classStr = classification?.toString().toLowerCase() || '';
    
    if (classStr.includes('public')) return 'Public';
    if (classStr.includes('internal')) return 'Internal';
    if (classStr.includes('confidential') || classStr.includes('sensitive')) return 'Confidential';
    if (classStr.includes('restricted') || classStr.includes('secret')) return 'Restricted';
    
    return 'Internal';
  }

  protected parseComplianceRequirements(compliance: any): string[] | undefined {
    if (!compliance) return undefined;
    
    if (Array.isArray(compliance)) {
      return compliance.map(c => c.toString());
    }
    
    if (typeof compliance === 'string') {
      return compliance.split(/[,;|\n]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    
    return [compliance.toString()];
  }

  protected async makeHttpRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        timeout: 30000, // 30 seconds timeout
        ...options,
        headers: {
          'User-Agent': 'GRC-Controller/1.0',
          'Accept': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else if (contentType?.includes('application/xml') || contentType?.includes('text/xml')) {
        return await response.text();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }
}