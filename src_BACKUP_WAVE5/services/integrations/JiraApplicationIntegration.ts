import { ApplicationBaseIntegration, ApplicationCredentials, ApplicationData, ApplicationImportResult } from './ApplicationBaseIntegration';

export interface JiraApplicationCredentials extends ApplicationCredentials {
  server: string; // https://company.atlassian.net
  username: string; // email
  apiToken: string; // Jira API token
  projectKeys?: string[]; // Optional project keys to filter
}

export class JiraApplicationIntegration extends ApplicationBaseIntegration {
  private credentials: JiraApplicationCredentials;

  constructor(credentials: JiraApplicationCredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.credentials.server}/rest/api/3/myself`;
      const auth = Buffer.from(`${this.credentials.username}:${this.credentials.apiToken}`).toString('base64');

      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      return response && response.accountId;
    } catch (error) {
      console.error('Jira connection test failed:', error);
      return false;
    }
  }

  async importApplications(filters?: {
    projectKeys?: string[];
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
      const applications = await this.getJiraProjects(filters);
      
      result.total_found = applications.length;
      result.applications = applications;
      result.success = true;
      result.imported = applications.length;

      return result;
    } catch (error) {
      console.error('Jira import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async getJiraProjects(filters?: any): Promise<ApplicationData[]> {
    try {
      let url = `${this.credentials.server}/rest/api/3/project/search`;\n      \n      const params = new URLSearchParams({\n        expand: 'description,lead,url,projectKeys,projectTypeKey,simplified,style,favourite,properties'\n      });\n\n      if (filters?.maxResults) {\n        params.append('maxResults', filters.maxResults.toString());\n      }\n\n      // Filter by project keys if specified\n      if (filters?.projectKeys || this.credentials.projectKeys) {\n        const keys = filters?.projectKeys || this.credentials.projectKeys!;\n        params.append('keys', keys.join(','));\n      }\n\n      url += '?' + params.toString();\n\n      const auth = Buffer.from(`${this.credentials.username}:${this.credentials.apiToken}`).toString('base64');\n\n      const response = await this.makeHttpRequest(url, {\n        method: 'GET',\n        headers: {\n          'Authorization': `Basic ${auth}`,\n          'Content-Type': 'application/json'\n        }\n      });\n\n      if (!response.values) {\n        throw new Error('No projects returned from Jira');\n      }\n\n      return this.parseJiraProjects(response.values);\n    } catch (error) {\n      console.error('Failed to get Jira projects:', error);\n      throw error;\n    }\n  }\n\n  private parseJiraProjects(projects: any[]): ApplicationData[] {\n    const applications: ApplicationData[] = [];\n\n    projects.forEach(project => {\n      const application: ApplicationData = {\n        id: project.id || `jira-${project.key}`,\n        name: project.name || 'Unknown Project',\n        type: this.mapJiraProjectType(project.projectTypeKey),\n        status: this.mapJiraProjectStatus(project.simplified),\n        url: project.url || `${this.credentials.server}/browse/${project.key}`,\n        technology: this.inferTechnologyFromProject(project),\n        owner: project.lead?.displayName || project.lead?.name || 'Unknown Owner',\n        department: project.projectCategory?.name || 'Unknown Department',\n        description: project.description,\n        environment: 'Production', // Default for Jira projects\n        criticality: this.inferCriticalityFromProject(project),\n        data_classification: 'Internal', // Default for internal projects\n        created_date: project.created ? new Date(project.created) : undefined,\n        source_tool: 'Jira',\n        source_type: 'Jira',\n        raw_data: {\n          key: project.key,\n          projectTypeKey: project.projectTypeKey,\n          projectCategory: project.projectCategory,\n          lead: project.lead,\n          components: project.components,\n          versions: project.versions,\n          roles: project.roles,\n          avatarUrls: project.avatarUrls,\n          simplified: project.simplified,\n          style: project.style,\n          favourite: project.favourite,\n          properties: project.properties\n        }\n      };\n\n      applications.push(application);\n    });\n\n    return applications;\n  }\n\n  private mapJiraProjectType(projectTypeKey: string): 'Web Application' | 'Mobile App' | 'API' | 'Database' | 'Cloud Service' | 'Desktop App' | 'Microservice' {\n    const typeStr = projectTypeKey?.toLowerCase() || '';\n    \n    if (typeStr.includes('software') || typeStr.includes('web')) return 'Web Application';\n    if (typeStr.includes('mobile')) return 'Mobile App';\n    if (typeStr.includes('service')) return 'API';\n    if (typeStr.includes('business')) return 'Web Application';\n    \n    return 'Web Application'; // Default for most Jira projects\n  }\n\n  private mapJiraProjectStatus(simplified: boolean): 'Ativo' | 'Desenvolvimento' | 'Teste' | 'Descontinuado' | 'Manutenção' {\n    // Jira doesn't have explicit status, so we infer from project state\n    return 'Ativo'; // Most Jira projects are active\n  }\n\n  private inferTechnologyFromProject(project: any): string {\n    // Try to infer technology from project name, description, or components\n    const text = `${project.name} ${project.description || ''}`.toLowerCase();\n    \n    if (text.includes('react')) return 'React';\n    if (text.includes('angular')) return 'Angular';\n    if (text.includes('vue')) return 'Vue.js';\n    if (text.includes('java')) return 'Java';\n    if (text.includes('python')) return 'Python';\n    if (text.includes('node')) return 'Node.js';\n    if (text.includes('php')) return 'PHP';\n    if (text.includes('dotnet') || text.includes('.net')) return '.NET';\n    if (text.includes('mobile') || text.includes('android')) return 'Android';\n    if (text.includes('ios') || text.includes('swift')) return 'iOS';\n    \n    return 'Unknown';\n  }\n\n  private inferCriticalityFromProject(project: any): 'Critical' | 'High' | 'Medium' | 'Low' {\n    const text = `${project.name} ${project.description || ''}`.toLowerCase();\n    \n    if (text.includes('critical') || text.includes('production') || text.includes('core')) return 'Critical';\n    if (text.includes('important') || text.includes('main') || text.includes('primary')) return 'High';\n    if (text.includes('support') || text.includes('secondary')) return 'Medium';\n    if (text.includes('test') || text.includes('demo') || text.includes('poc')) return 'Low';\n    \n    return 'Medium'; // Default\n  }\n}"