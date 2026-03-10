import { BaseIntegration, IntegrationCredentials } from './BaseIntegration';
import { QualysIntegration, QualysCredentials } from './QualysIntegration';
import { NessusIntegration, NessusCredentials } from './NessusIntegration';
import { BurpIntegration, BurpCredentials } from './BurpIntegration';
import { GenericAPIIntegration, GenericAPICredentials } from './GenericAPIIntegration';

export type SupportedIntegration = 'qualys' | 'nessus' | 'burp' | 'openvas' | 'rapid7' | 'sonarqube' | 'api';

export interface IntegrationConfig {
  type: SupportedIntegration;
  credentials: IntegrationCredentials;
  tenantId: string;
}

export class IntegrationFactory {
  static createIntegration(config: IntegrationConfig): BaseIntegration {
    switch (config.type) {
      case 'qualys':
        return new QualysIntegration(config.credentials as QualysCredentials);
      
      case 'nessus':
        return new NessusIntegration(config.credentials as NessusCredentials);
      
      case 'burp':
        return new BurpIntegration(config.credentials as BurpCredentials);
      
      case 'openvas':
        // TODO: Implement OpenVAS integration
        throw new Error('OpenVAS integration not yet implemented');
      
      case 'rapid7':
        // TODO: Implement Rapid7 integration
        throw new Error('Rapid7 integration not yet implemented');
      
      case 'sonarqube':
        // TODO: Implement SonarQube integration
        throw new Error('SonarQube integration not yet implemented');
      
      case 'api':
        return new GenericAPIIntegration(config.credentials as GenericAPICredentials);
      
      default:
        throw new Error(`Unsupported integration type: ${config.type}`);
    }
  }

  static getSupportedIntegrations(): { id: SupportedIntegration; name: string; status: 'implemented' | 'planned' }[] {
    return [
      { id: 'qualys', name: 'Qualys VMDR', status: 'implemented' },
      { id: 'nessus', name: 'Tenable Nessus', status: 'implemented' },
      { id: 'burp', name: 'Burp Suite Enterprise', status: 'implemented' },
      { id: 'openvas', name: 'OpenVAS', status: 'planned' },
      { id: 'rapid7', name: 'Rapid7 Nexpose', status: 'planned' },
      { id: 'sonarqube', name: 'SonarQube', status: 'planned' },
      { id: 'api', name: 'Generic API', status: 'implemented' }
    ];
  }

  static validateCredentials(type: SupportedIntegration, credentials: IntegrationCredentials): string[] {
    const errors: string[] = [];

    switch (type) {
      case 'qualys':
        if (!credentials.server) errors.push('Server URL is required');
        if (!credentials.username) errors.push('Username is required');
        if (!credentials.password) errors.push('Password is required');
        break;

      case 'nessus':
        if (!credentials.server) errors.push('Server URL is required');
        if (!credentials.username) errors.push('Username is required');
        if (!credentials.password) errors.push('Password is required');
        break;

      case 'burp':
        if (!credentials.server) errors.push('Server URL is required');
        if (!credentials.apiKey) errors.push('API Key is required');
        break;

      case 'api':
        if (!credentials.server) errors.push('API URL is required');
        break;

      default:
        errors.push(`Validation not implemented for ${type}`);
    }

    return errors;
  }
}