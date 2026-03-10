import { ApplicationBaseIntegration, ApplicationCredentials, ApplicationData, ApplicationImportResult } from './ApplicationBaseIntegration';

export interface ServiceNowApplicationCredentials extends ApplicationCredentials {
  server: string; // https://instance.service-now.com
  username: string;
  password: string;
  table?: string; // cmdb_ci_appl, cmdb_ci_service, etc.
  filter?: string; // sysparm_query filter
}

export class ServiceNowApplicationIntegration extends ApplicationBaseIntegration {
  private credentials: ServiceNowApplicationCredentials;

  constructor(credentials: ServiceNowApplicationCredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      const table = this.credentials.table || 'cmdb_ci_appl';
      const url = `${this.credentials.server}/api/now/table/${table}?sysparm_limit=1`;
      const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');

      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      return response && response.result !== undefined;
    } catch (error) {
      console.error('ServiceNow Application connection test failed:', error);
      return false;
    }
  }

  async importApplications(filters?: {
    table?: string;
    filter?: string;
    maxResults?: number;
  }): Promise<ApplicationImportResult> {
    const result: ApplicationImportResult = {
      success: false,
      total_found: 0,
      imported: 0,
      skipped: 0,
      errors: [],
      applications: []
    };

    try {
      const table = filters?.table || this.credentials.table || 'cmdb_ci_appl';
      const applications = await this.getApplications(table, filters);
      
      result.total_found = applications.length;
      result.applications = applications;
      result.success = true;
      result.imported = applications.length;

      return result;
    } catch (error) {
      console.error('ServiceNow Application import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async getApplications(table: string, filters?: any): Promise<ApplicationData[]> {
    try {
      let url = `${this.credentials.server}/api/now/table/${table}`;\n      \n      // Build query parameters\n      const params = new URLSearchParams({\n        sysparm_display_value: 'true',\n        sysparm_exclude_reference_link: 'true',\n        sysparm_fields: 'sys_id,name,short_description,version,install_status,operational_status,category,subcategory,owned_by,managed_by,business_service,environment,criticality,data_classification,url,technology_stack,programming_language,framework,repository_url,documentation_url,last_deployment_date,created'\n      });\n\n      // Apply filters\n      if (filters?.filter || this.credentials.filter) {\n        params.append('sysparm_query', filters?.filter || this.credentials.filter!);\n      }\n\n      if (filters?.maxResults) {\n        params.append('sysparm_limit', filters.maxResults.toString());\n      }\n\n      url += '?' + params.toString();\n\n      const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');\n\n      const response = await this.makeHttpRequest(url, {\n        method: 'GET',\n        headers: {\n          'Authorization': `Basic ${auth}`,\n          'Content-Type': 'application/json'\n        }\n      });\n\n      if (!response.result) {\n        throw new Error('No results returned from ServiceNow');\n      }\n\n      return this.parseServiceNowApplications(response.result);\n    } catch (error) {\n      console.error('Failed to get ServiceNow Applications:', error);\n      throw error;\n    }\n  }\n\n  private parseServiceNowApplications(appData: any[]): ApplicationData[] {\n    const applications: ApplicationData[] = [];\n\n    appData.forEach(app => {\n      const application: ApplicationData = {\n        id: app.sys_id || `snow-app-${Date.now()}-${Math.random()}`,\n        name: app.name || 'Unknown Application',\n        type: this.mapServiceNowCategory(app.category || app.subcategory),\n        status: this.mapServiceNowStatus(app.install_status, app.operational_status),\n        url: app.url,\n        technology: app.technology_stack?.display_value || app.technology_stack || 'Unknown',\n        framework: app.framework?.display_value || app.framework,\n        language: app.programming_language?.display_value || app.programming_language,\n        version: app.version,\n        owner: app.owned_by?.display_value || app.managed_by?.display_value || 'Unknown Owner',\n        department: app.business_service?.display_value || app.business_service,\n        description: app.short_description,\n        repository_url: app.repository_url,\n        documentation_url: app.documentation_url,\n        environment: this.normalizeEnvironment(app.environment?.display_value || app.environment || 'Production'),\n        criticality: this.normalizeCriticality(app.criticality?.display_value || app.criticality || 'Medium'),\n        data_classification: this.normalizeDataClassification(app.data_classification?.display_value || app.data_classification || 'Internal'),\n        last_deployment: app.last_deployment_date ? new Date(app.last_deployment_date) : undefined,\n        created_date: app.created ? new Date(app.created) : undefined,\n        source_tool: 'ServiceNow',\n        source_type: 'ServiceNow',\n        raw_data: {\n          sys_id: app.sys_id,\n          table: app.sys_class_name,\n          install_status: app.install_status,\n          operational_status: app.operational_status,\n          category: app.category,\n          subcategory: app.subcategory,\n          business_service: app.business_service,\n          owned_by: app.owned_by,\n          managed_by: app.managed_by\n        }\n      };\n\n      applications.push(application);\n    });\n\n    return applications;\n  }\n\n  private mapServiceNowCategory(category: string): 'Web Application' | 'Mobile App' | 'API' | 'Database' | 'Cloud Service' | 'Desktop App' | 'Microservice' {\n    const categoryStr = category?.toString().toLowerCase() || '';\n    \n    if (categoryStr.includes('web') || categoryStr.includes('portal') || categoryStr.includes('website')) return 'Web Application';\n    if (categoryStr.includes('mobile') || categoryStr.includes('app')) return 'Mobile App';\n    if (categoryStr.includes('api') || categoryStr.includes('service') || categoryStr.includes('rest')) return 'API';\n    if (categoryStr.includes('database') || categoryStr.includes('db')) return 'Database';\n    if (categoryStr.includes('cloud') || categoryStr.includes('saas')) return 'Cloud Service';\n    if (categoryStr.includes('desktop') || categoryStr.includes('client')) return 'Desktop App';\n    if (categoryStr.includes('microservice')) return 'Microservice';\n    \n    return 'Web Application';\n  }\n\n  private mapServiceNowStatus(installStatus: any, operationalStatus: any): 'Ativo' | 'Desenvolvimento' | 'Teste' | 'Descontinuado' | 'Manutenção' {\n    const install = installStatus?.display_value?.toLowerCase() || installStatus?.toString().toLowerCase() || '';\n    const operational = operationalStatus?.display_value?.toLowerCase() || operationalStatus?.toString().toLowerCase() || '';\n    \n    // Check install status first\n    if (install.includes('retired') || install.includes('disposed')) return 'Descontinuado';\n    if (install.includes('maintenance')) return 'Manutenção';\n    if (install.includes('installed') || install === '1') {\n      // Check operational status\n      if (operational.includes('operational') || operational === '1') return 'Ativo';\n      if (operational.includes('maintenance')) return 'Manutenção';\n      if (operational.includes('development') || operational.includes('dev')) return 'Desenvolvimento';\n      if (operational.includes('test') || operational.includes('staging')) return 'Teste';\n    }\n    \n    return 'Ativo';\n  }\n}"