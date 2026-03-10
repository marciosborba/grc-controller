import { CMDBBaseIntegration, CMDBCredentials } from './CMDBBaseIntegration';
import { ServiceNowIntegration, ServiceNowCredentials } from './ServiceNowIntegration';
import { LansweeperIntegration, LansweeperCredentials } from './LansweeperIntegration';
import { AWSConfigIntegration, AWSCredentials } from './AWSConfigIntegration';
import { GenericCMDBIntegration, GenericCMDBCredentials } from './GenericCMDBIntegration';

export type SupportedCMDBIntegration = 'servicenow' | 'lansweeper' | 'sccm' | 'aws' | 'azure' | 'csv' | 'api';

export interface CMDBIntegrationConfig {
  type: SupportedCMDBIntegration;
  credentials: CMDBCredentials;
  tenantId: string;
}

export class CMDBIntegrationFactory {
  static createIntegration(config: CMDBIntegrationConfig): CMDBBaseIntegration {
    switch (config.type) {
      case 'servicenow':
        return new ServiceNowIntegration(config.credentials as ServiceNowCredentials);
      
      case 'lansweeper':
        return new LansweeperIntegration(config.credentials as LansweeperCredentials);
      
      case 'aws':
        return new AWSConfigIntegration(config.credentials as AWSCredentials);
      
      case 'sccm':
        // TODO: Implement SCCM integration
        throw new Error('SCCM integration not yet implemented');
      
      case 'azure':
        // TODO: Implement Azure Resource Graph integration
        throw new Error('Azure integration not yet implemented');
      
      case 'csv':
        // TODO: Implement CSV file integration
        throw new Error('CSV integration not yet implemented');
      
      case 'api':
        return new GenericCMDBIntegration(config.credentials as GenericCMDBCredentials);
      
      default:
        throw new Error(`Unsupported CMDB integration type: ${config.type}`);
    }
  }

  static getSupportedIntegrations(): { id: SupportedCMDBIntegration; name: string; status: 'implemented' | 'planned' }[] {
    return [
      { id: 'servicenow', name: 'ServiceNow CMDB', status: 'implemented' },
      { id: 'lansweeper', name: 'Lansweeper', status: 'implemented' },
      { id: 'aws', name: 'AWS Config', status: 'implemented' },
      { id: 'sccm', name: 'Microsoft SCCM', status: 'planned' },
      { id: 'azure', name: 'Azure Resource Graph', status: 'planned' },
      { id: 'csv', name: 'CSV File Import', status: 'planned' },
      { id: 'api', name: 'Generic API', status: 'implemented' }
    ];
  }

  static validateCredentials(type: SupportedCMDBIntegration, credentials: CMDBCredentials): string[] {
    const errors: string[] = [];

    switch (type) {
      case 'servicenow':
        if (!credentials.server) errors.push('ServiceNow instance URL is required');
        if (!credentials.username) errors.push('Username is required');
        if (!credentials.password) errors.push('Password is required');
        break;

      case 'lansweeper':
        if (!credentials.server) errors.push('Lansweeper server is required');
        if (!credentials.database) errors.push('Database name is required');
        if (!credentials.username) errors.push('SQL username is required');
        if (!credentials.password) errors.push('SQL password is required');
        break;

      case 'aws':
        if (!credentials.region) errors.push('AWS region is required');
        if (!credentials.username) errors.push('Access Key ID is required'); // Using username field for access key
        if (!credentials.password) errors.push('Secret Access Key is required'); // Using password field for secret
        break;

      case 'azure':
        if (!credentials.tenantId) errors.push('Azure Tenant ID is required');
        if (!credentials.subscriptionId) errors.push('Subscription ID is required');
        if (!credentials.clientId) errors.push('Client ID is required');
        if (!credentials.clientSecret) errors.push('Client Secret is required');
        break;

      case 'sccm':
        if (!credentials.server) errors.push('SCCM server is required');
        if (!credentials.username) errors.push('Username is required');
        if (!credentials.password) errors.push('Password is required');
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