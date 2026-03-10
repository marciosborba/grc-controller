import { ApplicationBaseIntegration, ApplicationCredentials } from './ApplicationBaseIntegration';
import { ServiceNowApplicationIntegration, ServiceNowApplicationCredentials } from './ServiceNowApplicationIntegration';
import { JiraApplicationIntegration, JiraApplicationCredentials } from './JiraApplicationIntegration';
import { GitHubApplicationIntegration, GitHubApplicationCredentials } from './GitHubApplicationIntegration';
import { GenericApplicationIntegration, GenericApplicationCredentials } from './GenericApplicationIntegration';

export type SupportedApplicationIntegration = 'servicenow' | 'jira' | 'github' | 'gitlab' | 'azure-devops' | 'sonarqube' | 'api' | 'csv';

export interface ApplicationIntegrationConfig {
  type: SupportedApplicationIntegration;
  credentials: ApplicationCredentials;
  tenantId: string;
}

export class ApplicationIntegrationFactory {
  static createIntegration(config: ApplicationIntegrationConfig): ApplicationBaseIntegration {
    switch (config.type) {
      case 'servicenow':
        return new ServiceNowApplicationIntegration(config.credentials as ServiceNowApplicationCredentials);
      
      case 'jira':
        return new JiraApplicationIntegration(config.credentials as JiraApplicationCredentials);
      
      case 'github':
        return new GitHubApplicationIntegration(config.credentials as GitHubApplicationCredentials);
      
      case 'api':
        return new GenericApplicationIntegration(config.credentials as GenericApplicationCredentials);
      
      case 'gitlab':
        // TODO: Implement GitLab integration
        throw new Error('GitLab integration not yet implemented');
      
      case 'azure-devops':
        // TODO: Implement Azure DevOps integration
        throw new Error('Azure DevOps integration not yet implemented');
      
      case 'sonarqube':
        // TODO: Implement SonarQube integration (for code quality metrics)
        throw new Error('SonarQube integration not yet implemented');
      
      case 'csv':
        // TODO: Implement CSV file integration
        throw new Error('CSV integration not yet implemented');
      
      default:
        throw new Error(`Unsupported application integration type: ${config.type}`);
    }
  }

  static getSupportedIntegrations(): { id: SupportedApplicationIntegration; name: string; status: 'implemented' | 'planned' }[] {
    return [
      { id: 'servicenow', name: 'ServiceNow CMDB', status: 'implemented' },
      { id: 'jira', name: 'Atlassian Jira', status: 'implemented' },
      { id: 'github', name: 'GitHub', status: 'implemented' },
      { id: 'api', name: 'Generic API', status: 'implemented' },
      { id: 'gitlab', name: 'GitLab', status: 'planned' },
      { id: 'azure-devops', name: 'Azure DevOps', status: 'planned' },
      { id: 'sonarqube', name: 'SonarQube', status: 'planned' },
      { id: 'csv', name: 'CSV File Import', status: 'planned' }
    ];
  }

  static validateCredentials(type: SupportedApplicationIntegration, credentials: ApplicationCredentials): string[] {
    const errors: string[] = [];

    switch (type) {
      case 'servicenow':
        if (!credentials.server) errors.push('ServiceNow instance URL is required');
        if (!credentials.username) errors.push('Username is required');
        if (!credentials.password) errors.push('Password is required');
        break;

      case 'jira':
        if (!credentials.server) errors.push('Jira instance URL is required');
        if (!credentials.username) errors.push('Email/Username is required');
        if (!credentials.apiKey) errors.push('API Token is required');
        break;

      case 'github':
        if (!credentials.token) errors.push('GitHub Token is required');
        break;

      case 'gitlab':
        if (!credentials.server) errors.push('GitLab instance URL is required');
        if (!credentials.token) errors.push('GitLab Token is required');
        break;

      case 'azure-devops':
        if (!credentials.server) errors.push('Azure DevOps organization URL is required');
        if (!credentials.token) errors.push('Personal Access Token is required');
        break;

      case 'sonarqube':
        if (!credentials.server) errors.push('SonarQube server URL is required');
        if (!credentials.token) errors.push('SonarQube token is required');
        break;

      case 'api':
        if (!credentials.server) errors.push('API URL is required');
        break;

      default:
        errors.push(`Validation not implemented for ${type}`);
    }

    return errors;
  }

  static getIntegrationDescription(type: SupportedApplicationIntegration): string {
    const descriptions = {
      'servicenow': 'Import applications from ServiceNow CMDB application records',
      'jira': 'Import projects from Atlassian Jira as applications',
      'github': 'Import repositories from GitHub as applications',
      'gitlab': 'Import repositories from GitLab as applications',
      'azure-devops': 'Import projects from Azure DevOps as applications',
      'sonarqube': 'Import projects from SonarQube with code quality metrics',
      'api': 'Connect with any REST API to import application data',
      'csv': 'Import applications from CSV file'
    };

    return descriptions[type] || 'No description available';
  }

  static getRequiredFields(type: SupportedApplicationIntegration): string[] {
    const fields = {
      'servicenow': ['sys_id', 'name', 'version', 'install_status', 'operational_status', 'owned_by'],
      'jira': ['id', 'key', 'name', 'projectTypeKey', 'lead', 'description'],
      'github': ['id', 'name', 'full_name', 'html_url', 'language', 'description', 'owner'],
      'gitlab': ['id', 'name', 'path_with_namespace', 'web_url', 'description'],
      'azure-devops': ['id', 'name', 'description', 'url', 'state'],
      'sonarqube': ['key', 'name', 'qualifier', 'visibility'],
      'api': ['customizable'],
      'csv': ['customizable']
    };

    return fields[type] || [];
  }
}