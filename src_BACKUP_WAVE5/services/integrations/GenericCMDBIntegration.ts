import { CMDBBaseIntegration, CMDBCredentials, AssetData, CMDBImportResult } from './CMDBBaseIntegration';

export interface GenericCMDBCredentials extends CMDBCredentials {
  server: string; // https://api.example.com
  apiKey?: string;
  token?: string;
  username?: string;
  password?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  authType?: 'none' | 'bearer' | 'basic' | 'apikey' | 'custom';
  dataPath?: string; // JSONPath to extract data from response
  fieldMapping?: Record<string, string>; // Map API fields to internal fields
}

export class GenericCMDBIntegration extends CMDBBaseIntegration {
  private credentials: GenericCMDBCredentials;

  constructor(credentials: GenericCMDBCredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeAPIRequest();
      return response !== null && response !== undefined;
    } catch (error) {
      console.error('Generic CMDB API connection test failed:', error);
      return false;
    }
  }

  async importAssets(filters?: {
    maxResults?: number;
    additionalParams?: Record<string, any>;
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
      const response = await this.makeAPIRequest(filters?.additionalParams);
      const assets = this.parseAPIResponse(response);
      
      result.total_found = assets.length;
      result.assets = assets;
      result.success = true;
      result.imported = assets.length;

      return result;
    } catch (error) {
      console.error('Generic CMDB API import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async makeAPIRequest(additionalParams?: Record<string, any>): Promise<any> {
    try {
      const url = this.buildURL(additionalParams);
      const headers = this.buildHeaders();
      const method = this.credentials.method || 'GET';
      const body = this.buildBody(additionalParams);

      const options: RequestInit = {
        method,
        headers,
        ...(body && method !== 'GET' && { body: JSON.stringify(body) })
      };

      const response = await this.makeHttpRequest(url, options);
      return response;
    } catch (error) {
      console.error('Failed to make Generic CMDB API request:', error);
      throw error;
    }
  }

  private buildURL(additionalParams?: Record<string, any>): string {
    let url = this.credentials.server;
    
    // Add query parameters for GET requests
    if (this.credentials.method === 'GET' && additionalParams) {
      const params = new URLSearchParams();
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
      
      if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }
    }
    
    return url;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'GRC-Controller/1.0',
      ...this.credentials.headers
    };

    // Add authentication headers based on type
    switch (this.credentials.authType) {
      case 'bearer':
        if (this.credentials.token || this.credentials.apiKey) {
          headers['Authorization'] = `Bearer ${this.credentials.token || this.credentials.apiKey}`;
        }
        break;
        
      case 'basic':
        if (this.credentials.username && this.credentials.password) {
          const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
          headers['Authorization'] = `Basic ${auth}`;
        }
        break;
        
      case 'apikey':
        if (this.credentials.apiKey) {
          headers['X-API-Key'] = this.credentials.apiKey;
          headers['API-Key'] = this.credentials.apiKey;
        }
        break;
        
      case 'custom':
        // Custom headers are already included from this.credentials.headers
        break;
        
      case 'none':
      default:
        // No authentication
        break;
    }

    return headers;
  }

  private buildBody(additionalParams?: Record<string, any>): any {
    if (this.credentials.method === 'GET') {
      return undefined;
    }

    let body = this.credentials.body || {};
    
    // Merge additional parameters into body for non-GET requests
    if (additionalParams) {
      body = { ...body, ...additionalParams };
    }

    return Object.keys(body).length > 0 ? body : undefined;
  }

  private parseAPIResponse(response: any): AssetData[] {
    try {
      let data = response;
      
      // Extract data using JSONPath if specified
      if (this.credentials.dataPath) {
        data = this.extractDataByPath(response, this.credentials.dataPath);
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        if (data && typeof data === 'object') {
          // Try common array property names
          const arrayProps = ['data', 'results', 'items', 'assets', 'devices', 'hosts', 'computers'];
          for (const prop of arrayProps) {
            if (Array.isArray(data[prop])) {
              data = data[prop];
              break;
            }
          }
        }
        
        // If still not an array, wrap in array
        if (!Array.isArray(data)) {
          data = data ? [data] : [];
        }
      }

      return data.map((item: any) => this.mapAPIDataToAsset(item));
    } catch (error) {
      console.error('Failed to parse Generic CMDB API response:', error);
      throw new Error('Failed to parse API response');
    }
  }

  private extractDataByPath(obj: any, path: string): any {
    // Simple JSONPath implementation for basic paths like "data.results" or "response.assets"
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        throw new Error(`Path "${path}" not found in response`);
      }
    }
    
    return current;
  }

  private mapAPIDataToAsset(item: any): AssetData {
    const mapping = this.credentials.fieldMapping || {};
    
    // Default field mapping with fallbacks
    const defaultMapping = {
      id: 'id',
      name: 'name',
      type: 'type',
      status: 'status',
      ip_address: 'ip_address',
      mac_address: 'mac_address',
      location: 'location',
      os: 'os',
      os_version: 'os_version',
      owner: 'owner',
      department: 'department',
      model: 'model',
      manufacturer: 'manufacturer',
      serial_number: 'serial_number',
      asset_tag: 'asset_tag'
    };

    const finalMapping = { ...defaultMapping, ...mapping };

    return {
      id: this.getFieldValue(item, finalMapping.id) || `generic-${Date.now()}-${Math.random()}`,
      name: this.getFieldValue(item, finalMapping.name) || 'Generic API Asset',
      type: this.normalizeAssetType(this.getFieldValue(item, finalMapping.type)),
      status: this.normalizeAssetStatus(this.getFieldValue(item, finalMapping.status)),
      ip_address: this.getFieldValue(item, finalMapping.ip_address),
      mac_address: this.getFieldValue(item, finalMapping.mac_address),
      location: this.getFieldValue(item, finalMapping.location) || 'Unknown Location',
      os: this.getFieldValue(item, finalMapping.os),
      os_version: this.getFieldValue(item, finalMapping.os_version),
      owner: this.getFieldValue(item, finalMapping.owner) || 'Unknown Owner',
      department: this.getFieldValue(item, finalMapping.department),
      model: this.getFieldValue(item, finalMapping.model),
      manufacturer: this.getFieldValue(item, finalMapping.manufacturer),
      serial_number: this.getFieldValue(item, finalMapping.serial_number),
      asset_tag: this.getFieldValue(item, finalMapping.asset_tag),
      source_tool: 'Generic API',
      source_type: 'API',
      raw_data: item
    };
  }

  private getFieldValue(obj: any, fieldPath: string): any {
    if (!fieldPath || !obj) return undefined;
    
    // Support nested field paths like "asset.details.name"
    const parts = fieldPath.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }
}