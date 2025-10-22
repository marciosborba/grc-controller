import { ApplicationBaseIntegration, ApplicationCredentials, ApplicationData, ApplicationImportResult } from './ApplicationBaseIntegration';

export interface GitHubApplicationCredentials extends ApplicationCredentials {
  server?: string; // https://api.github.com (default) or GitHub Enterprise URL
  token: string; // GitHub Personal Access Token or App token
  organization?: string; // GitHub organization name
  repositories?: string[]; // Specific repositories to import
}

export class GitHubApplicationIntegration extends ApplicationBaseIntegration {
  private credentials: GitHubApplicationCredentials;

  constructor(credentials: GitHubApplicationCredentials) {
    super(credentials);
    this.credentials = credentials;
    // Default to GitHub.com API if no server specified
    if (!this.credentials.server) {
      this.credentials.server = 'https://api.github.com';
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.credentials.server}/user`;
      
      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.credentials.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GRC-Controller/1.0'
        }
      });

      return response && (response.login || response.id);
    } catch (error) {
      console.error('GitHub connection test failed:', error);
      return false;
    }
  }

  async importApplications(filters?: {
    organization?: string;
    repositories?: string[];
    maxResults?: number;
    includeArchived?: boolean;
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
      const applications = await this.getGitHubRepositories(filters);
      
      result.total_found = applications.length;
      result.applications = applications;
      result.success = true;
      result.imported = applications.length;

      return result;
    } catch (error) {
      console.error('GitHub import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async getGitHubRepositories(filters?: any): Promise<ApplicationData[]> {
    try {
      let repositories: any[] = [];
      
      if (filters?.repositories || this.credentials.repositories) {\n        // Import specific repositories\n        const repoList = filters?.repositories || this.credentials.repositories!;\n        for (const repo of repoList) {\n          const repoData = await this.getRepository(repo);\n          if (repoData) repositories.push(repoData);\n        }\n      } else if (filters?.organization || this.credentials.organization) {\n        // Import all repositories from organization\n        repositories = await this.getOrganizationRepositories(filters?.organization || this.credentials.organization!, filters);\n      } else {\n        // Import user repositories\n        repositories = await this.getUserRepositories(filters);\n      }\n\n      return this.parseGitHubRepositories(repositories);\n    } catch (error) {\n      console.error('Failed to get GitHub repositories:', error);\n      throw error;\n    }\n  }\n\n  private async getRepository(repoName: string): Promise<any> {\n    try {\n      const url = `${this.credentials.server}/repos/${repoName}`;\n      \n      const response = await this.makeHttpRequest(url, {\n        method: 'GET',\n        headers: {\n          'Authorization': `Bearer ${this.credentials.token}`,\n          'Accept': 'application/vnd.github.v3+json'\n        }\n      });\n\n      return response;\n    } catch (error) {\n      console.error(`Failed to get repository ${repoName}:`, error);\n      return null;\n    }\n  }\n\n  private async getOrganizationRepositories(org: string, filters?: any): Promise<any[]> {\n    try {\n      let url = `${this.credentials.server}/orgs/${org}/repos`;\n      \n      const params = new URLSearchParams({\n        type: 'all',\n        sort: 'updated',\n        direction: 'desc'\n      });\n\n      if (filters?.maxResults) {\n        params.append('per_page', Math.min(filters.maxResults, 100).toString());\n      }\n\n      url += '?' + params.toString();\n\n      const response = await this.makeHttpRequest(url, {\n        method: 'GET',\n        headers: {\n          'Authorization': `Bearer ${this.credentials.token}`,\n          'Accept': 'application/vnd.github.v3+json'\n        }\n      });\n\n      // Filter out archived repositories unless explicitly requested\n      if (!filters?.includeArchived) {\n        return response.filter((repo: any) => !repo.archived);\n      }\n\n      return response;\n    } catch (error) {\n      console.error(`Failed to get organization repositories for ${org}:`, error);\n      throw error;\n    }\n  }\n\n  private async getUserRepositories(filters?: any): Promise<any[]> {\n    try {\n      let url = `${this.credentials.server}/user/repos`;\n      \n      const params = new URLSearchParams({\n        type: 'all',\n        sort: 'updated',\n        direction: 'desc'\n      });\n\n      if (filters?.maxResults) {\n        params.append('per_page', Math.min(filters.maxResults, 100).toString());\n      }\n\n      url += '?' + params.toString();\n\n      const response = await this.makeHttpRequest(url, {\n        method: 'GET',\n        headers: {\n          'Authorization': `Bearer ${this.credentials.token}`,\n          'Accept': 'application/vnd.github.v3+json'\n        }\n      });\n\n      // Filter out archived repositories unless explicitly requested\n      if (!filters?.includeArchived) {\n        return response.filter((repo: any) => !repo.archived);\n      }\n\n      return response;\n    } catch (error) {\n      console.error('Failed to get user repositories:', error);\n      throw error;\n    }\n  }\n\n  private parseGitHubRepositories(repositories: any[]): ApplicationData[] {\n    const applications: ApplicationData[] = [];\n\n    repositories.forEach(repo => {\n      const application: ApplicationData = {\n        id: repo.id?.toString() || `github-${repo.name}`,\n        name: repo.name || 'Unknown Repository',\n        type: this.inferApplicationType(repo),\n        status: this.mapRepositoryStatus(repo),\n        url: repo.html_url,\n        technology: this.inferTechnology(repo),\n        language: repo.language,\n        owner: repo.owner?.login || 'Unknown Owner',\n        description: repo.description,\n        repository_url: repo.clone_url,\n        documentation_url: repo.has_wiki ? `${repo.html_url}/wiki` : undefined,\n        environment: repo.default_branch === 'main' || repo.default_branch === 'master' ? 'Production' : 'Development',\n        criticality: this.inferCriticality(repo),\n        data_classification: repo.private ? 'Internal' : 'Public',\n        created_date: repo.created_at ? new Date(repo.created_at) : undefined,\n        last_deployment: repo.pushed_at ? new Date(repo.pushed_at) : undefined,\n        source_tool: 'GitHub',\n        source_type: 'GitHub',\n        raw_data: {\n          id: repo.id,\n          node_id: repo.node_id,\n          full_name: repo.full_name,\n          private: repo.private,\n          fork: repo.fork,\n          archived: repo.archived,\n          disabled: repo.disabled,\n          default_branch: repo.default_branch,\n          language: repo.language,\n          languages_url: repo.languages_url,\n          topics: repo.topics,\n          visibility: repo.visibility,\n          forks_count: repo.forks_count,\n          stargazers_count: repo.stargazers_count,\n          watchers_count: repo.watchers_count,\n          size: repo.size,\n          open_issues_count: repo.open_issues_count,\n          has_issues: repo.has_issues,\n          has_projects: repo.has_projects,\n          has_wiki: repo.has_wiki,\n          has_pages: repo.has_pages,\n          license: repo.license,\n          updated_at: repo.updated_at,\n          pushed_at: repo.pushed_at\n        }\n      };\n\n      applications.push(application);\n    });\n\n    return applications;\n  }\n\n  private inferApplicationType(repo: any): 'Web Application' | 'Mobile App' | 'API' | 'Database' | 'Cloud Service' | 'Desktop App' | 'Microservice' {\n    const name = repo.name?.toLowerCase() || '';\n    const description = repo.description?.toLowerCase() || '';\n    const topics = repo.topics || [];\n    const language = repo.language?.toLowerCase() || '';\n    \n    const text = `${name} ${description} ${topics.join(' ')}`;\n    \n    if (text.includes('mobile') || text.includes('android') || text.includes('ios') || language.includes('swift') || language.includes('kotlin')) return 'Mobile App';\n    if (text.includes('api') || text.includes('service') || text.includes('microservice') || name.includes('api')) return 'API';\n    if (text.includes('database') || text.includes('db') || language.includes('sql')) return 'Database';\n    if (text.includes('desktop') || language.includes('c#') || language.includes('c++')) return 'Desktop App';\n    if (text.includes('microservice') || text.includes('micro-service')) return 'Microservice';\n    if (text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('gcp')) return 'Cloud Service';\n    \n    return 'Web Application'; // Default\n  }\n\n  private mapRepositoryStatus(repo: any): 'Ativo' | 'Desenvolvimento' | 'Teste' | 'Descontinuado' | 'Manutenção' {\n    if (repo.archived) return 'Descontinuado';\n    if (repo.disabled) return 'Manutenção';\n    \n    // Check last activity\n    const lastPush = repo.pushed_at ? new Date(repo.pushed_at) : null;\n    const now = new Date();\n    const daysSinceLastPush = lastPush ? Math.floor((now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24)) : 999;\n    \n    if (daysSinceLastPush > 365) return 'Manutenção'; // No activity for over a year\n    if (daysSinceLastPush > 90) return 'Teste'; // Limited activity\n    \n    return 'Ativo'; // Active development\n  }\n\n  private inferTechnology(repo: any): string {\n    if (repo.language) return repo.language;\n    \n    const topics = repo.topics || [];\n    const frameworks = ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'laravel'];\n    \n    for (const topic of topics) {\n      if (frameworks.includes(topic.toLowerCase())) {\n        return topic;\n      }\n    }\n    \n    return 'Unknown';\n  }\n\n  private inferCriticality(repo: any): 'Critical' | 'High' | 'Medium' | 'Low' {\n    const stars = repo.stargazers_count || 0;\n    const forks = repo.forks_count || 0;\n    const watchers = repo.watchers_count || 0;\n    \n    const popularity = stars + forks + watchers;\n    \n    if (popularity > 1000) return 'Critical';\n    if (popularity > 100) return 'High';\n    if (popularity > 10) return 'Medium';\n    \n    return 'Low';\n  }\n}"