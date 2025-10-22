import { CMDBBaseIntegration, CMDBCredentials, AssetData, CMDBImportResult } from './CMDBBaseIntegration';

export interface AWSCredentials extends CMDBCredentials {
  region: string; // us-east-1, sa-east-1, etc.
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  resourceTypes?: string[]; // EC2::Instance, RDS::DBInstance, etc.
}

export class AWSConfigIntegration extends CMDBBaseIntegration {
  private credentials: AWSCredentials;

  constructor(credentials: AWSCredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test connection by listing configuration recorders
      const url = await this.buildAWSUrl('config', 'DescribeConfigurationRecorders', {});
      const response = await this.makeAWSRequest(url, 'GET');
      return response && response.ConfigurationRecorders !== undefined;
    } catch (error) {
      console.error('AWS Config connection test failed:', error);
      return false;
    }
  }

  async importAssets(filters?: {
    resourceTypes?: string[];
    maxResults?: number;
  }): Promise<CMDBImportResult> {
    const result: CMDBImportResult = {
      success: false,
      total_found: 0,
      imported: 0,
      skipped: 0,
      errors: [],
      assets: []
    };

    try {
      const assets = await this.getAWSResources(filters);
      
      result.total_found = assets.length;
      result.assets = assets;
      result.success = true;
      result.imported = assets.length;

      return result;
    } catch (error) {
      console.error('AWS Config import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async getAWSResources(filters?: any): Promise<AssetData[]> {
    try {
      const resourceTypes = filters?.resourceTypes || this.credentials.resourceTypes || [
        'AWS::EC2::Instance',
        'AWS::RDS::DBInstance',
        'AWS::S3::Bucket',
        'AWS::ELB::LoadBalancer',
        'AWS::Lambda::Function'
      ];

      const allAssets: AssetData[] = [];

      for (const resourceType of resourceTypes) {
        const resources = await this.getResourcesByType(resourceType, filters?.maxResults);
        allAssets.push(...resources);
      }

      return allAssets;
    } catch (error) {
      console.error('Failed to get AWS resources:', error);
      throw error;
    }
  }

  private async getResourcesByType(resourceType: string, maxResults?: number): Promise<AssetData[]> {
    try {
      const params = {
        resourceType,
        limit: maxResults?.toString() || '100'
      };

      const url = await this.buildAWSUrl('config', 'ListDiscoveredResources', params);
      const response = await this.makeAWSRequest(url, 'POST');

      if (!response.resourceIdentifiers) {
        return [];
      }

      const assets: AssetData[] = [];

      // Get detailed information for each resource
      for (const resource of response.resourceIdentifiers) {
        try {
          const detailUrl = await this.buildAWSUrl('config', 'GetResourceConfigHistory', {
            resourceType: resource.resourceType,
            resourceId: resource.resourceId
          });
          
          const detailResponse = await this.makeAWSRequest(detailUrl, 'POST');
          
          if (detailResponse.configurationItems && detailResponse.configurationItems.length > 0) {
            const configItem = detailResponse.configurationItems[0];
            const asset = this.parseAWSResource(configItem);
            assets.push(asset);
          }
        } catch (error) {
          console.warn(`Failed to get details for resource ${resource.resourceId}:`, error);
        }
      }

      return assets;
    } catch (error) {
      console.error(`Failed to get AWS resources of type ${resourceType}:`, error);
      throw error;
    }
  }

  private async buildAWSUrl(service: string, action: string, params: Record<string, string>): Promise<string> {
    const endpoint = `https://${service}.${this.credentials.region}.amazonaws.com/`;
    return endpoint; // In real implementation, this would build the proper AWS API URL with signing
  }

  private async makeAWSRequest(url: string, method: string): Promise<any> {
    try {
      // In a real implementation, this would use AWS SDK or implement AWS Signature V4
      // For now, we'll simulate the structure
      
      const headers = {
        'Authorization': `AWS4-HMAC-SHA256 Credential=${this.credentials.accessKeyId}/...`,
        'X-Amz-Date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'Content-Type': 'application/x-amz-json-1.1'
      };

      // This would make the actual AWS API call
      throw new Error('AWS SDK integration not implemented. Use AWS SDK for JavaScript.');
    } catch (error) {
      console.error('AWS API request failed:', error);
      throw error;
    }
  }

  private parseAWSResource(configItem: any): AssetData {
    const resourceType = configItem.resourceType || '';
    const configuration = configItem.configuration || {};
    
    return {
      id: configItem.resourceId || `aws-${Date.now()}-${Math.random()}`,
      name: configuration.Tags?.find((tag: any) => tag.Key === 'Name')?.Value || 
            configuration.DBInstanceIdentifier || 
            configuration.FunctionName || 
            configuration.LoadBalancerName ||
            configItem.resourceName ||
            configItem.resourceId,
      type: this.mapAWSResourceType(resourceType),
      status: this.mapAWSResourceStatus(configuration.State || configuration.DBInstanceStatus || 'unknown'),
      ip_address: configuration.PrivateIpAddress || configuration.PublicIpAddress,
      location: configItem.availabilityZone || this.credentials.region,
      os: configuration.Platform || configuration.Engine,
      owner: configuration.Tags?.find((tag: any) => tag.Key === 'Owner')?.Value || 'AWS',
      department: configuration.Tags?.find((tag: any) => tag.Key === 'Department')?.Value,
      model: configuration.InstanceType || configuration.DBInstanceClass,
      manufacturer: 'Amazon Web Services',
      source_tool: 'AWS Config',
      source_type: 'AWS',
      raw_data: {
        resourceType: configItem.resourceType,
        resourceId: configItem.resourceId,
        resourceName: configItem.resourceName,
        availabilityZone: configItem.availabilityZone,
        resourceCreationTime: configItem.resourceCreationTime,
        tags: configuration.Tags,
        configuration: configuration
      }
    };
  }

  private mapAWSResourceType(resourceType: string): 'Server' | 'Workstation' | 'Network Device' | 'Mobile Device' | 'Storage' | 'Infrastructure' {
    if (resourceType.includes('EC2::Instance')) return 'Server';
    if (resourceType.includes('RDS::')) return 'Server';
    if (resourceType.includes('ELB::') || resourceType.includes('VPC::')) return 'Network Device';
    if (resourceType.includes('S3::') || resourceType.includes('EBS::')) return 'Storage';
    
    return 'Infrastructure';
  }

  private mapAWSResourceStatus(state: string): 'Ativo' | 'Inativo' | 'Manutenção' | 'Descomissionado' {
    const stateStr = state?.toLowerCase() || '';
    
    if (stateStr.includes('running') || stateStr.includes('available') || stateStr.includes('active')) return 'Ativo';
    if (stateStr.includes('stopped') || stateStr.includes('stopping')) return 'Inativo';
    if (stateStr.includes('maintenance') || stateStr.includes('updating')) return 'Manutenção';
    if (stateStr.includes('terminated') || stateStr.includes('deleted')) return 'Descomissionado';
    
    return 'Inativo';
  }
}