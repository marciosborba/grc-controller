import { CMDBBaseIntegration, CMDBCredentials, AssetData, CMDBImportResult } from './CMDBBaseIntegration';

export interface ServiceNowCredentials extends CMDBCredentials {
  server: string; // https://instance.service-now.com
  username: string;
  password: string;
  table?: string; // cmdb_ci, cmdb_ci_computer, etc.
  filter?: string; // sysparm_query filter
}

export class ServiceNowIntegration extends CMDBBaseIntegration {
  private credentials: ServiceNowCredentials;

  constructor(credentials: ServiceNowCredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      const table = this.credentials.table || 'cmdb_ci';
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
      console.error('ServiceNow connection test failed:', error);
      return false;
    }
  }

  async importAssets(filters?: {
    table?: string;
    filter?: string;
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
      const table = filters?.table || this.credentials.table || 'cmdb_ci';
      const assets = await this.getConfigurationItems(table, filters);
      
      result.total_found = assets.length;
      result.assets = assets;
      result.success = true;
      result.imported = assets.length;

      return result;
    } catch (error) {
      console.error('ServiceNow import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async getConfigurationItems(table: string, filters?: any): Promise<AssetData[]> {
    try {
      let url = `${this.credentials.server}/api/now/table/${table}`;
      
      // Build query parameters
      const params = new URLSearchParams({
        sysparm_display_value: 'true',
        sysparm_exclude_reference_link: 'true',
        sysparm_fields: 'sys_id,name,display_name,ip_address,mac_address,location,os,os_version,assigned_to,department,model_id,manufacturer,serial_number,asset_tag,purchase_date,warranty_expiry,last_discovered,install_status,operational_status,category,subcategory'
      });

      // Apply filters
      if (filters?.filter || this.credentials.filter) {
        params.append('sysparm_query', filters?.filter || this.credentials.filter!);
      }

      if (filters?.maxResults) {
        params.append('sysparm_limit', filters.maxResults.toString());
      }

      url += '?' + params.toString();

      const auth = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');

      const response = await this.makeHttpRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.result) {
        throw new Error('No results returned from ServiceNow');
      }

      return this.parseServiceNowAssets(response.result);
    } catch (error) {
      console.error('Failed to get ServiceNow CIs:', error);
      throw error;
    }
  }

  private parseServiceNowAssets(ciData: any[]): AssetData[] {
    const assets: AssetData[] = [];

    ciData.forEach(ci => {
      const asset: AssetData = {
        id: ci.sys_id || `snow-${Date.now()}-${Math.random()}`,
        name: ci.name || ci.display_name || 'Unknown Asset',
        type: this.mapServiceNowCategory(ci.category || ci.subcategory),
        status: this.mapServiceNowStatus(ci.install_status, ci.operational_status),
        ip_address: ci.ip_address,
        mac_address: ci.mac_address,
        location: ci.location?.display_value || ci.location || 'Unknown Location',
        os: ci.os?.display_value || ci.os,
        os_version: ci.os_version,
        owner: ci.assigned_to?.display_value || ci.assigned_to || 'Unassigned',
        department: ci.department?.display_value || ci.department,
        model: ci.model_id?.display_value || ci.model_id,
        manufacturer: ci.manufacturer?.display_value || ci.manufacturer,
        serial_number: ci.serial_number,
        asset_tag: ci.asset_tag,
        purchase_date: ci.purchase_date ? new Date(ci.purchase_date) : undefined,
        warranty_expiry: ci.warranty_expiry ? new Date(ci.warranty_expiry) : undefined,
        last_scan: ci.last_discovered ? new Date(ci.last_discovered) : undefined,
        source_tool: 'ServiceNow',
        source_type: 'ServiceNow',
        raw_data: {
          sys_id: ci.sys_id,
          table: ci.sys_class_name,
          install_status: ci.install_status,
          operational_status: ci.operational_status,
          category: ci.category,
          subcategory: ci.subcategory,
          discovery_source: ci.discovery_source,
          last_discovered: ci.last_discovered,
          correlation_id: ci.correlation_id
        }
      };

      assets.push(asset);
    });

    return assets;
  }

  private mapServiceNowCategory(category: string): 'Server' | 'Workstation' | 'Network Device' | 'Mobile Device' | 'Storage' | 'Infrastructure' {
    const categoryStr = category?.toString().toLowerCase() || '';
    
    if (categoryStr.includes('server') || categoryStr.includes('computer')) return 'Server';
    if (categoryStr.includes('desktop') || categoryStr.includes('laptop') || categoryStr.includes('workstation')) return 'Workstation';
    if (categoryStr.includes('network') || categoryStr.includes('switch') || categoryStr.includes('router') || categoryStr.includes('firewall')) return 'Network Device';
    if (categoryStr.includes('mobile') || categoryStr.includes('phone') || categoryStr.includes('tablet')) return 'Mobile Device';
    if (categoryStr.includes('storage') || categoryStr.includes('disk') || categoryStr.includes('san')) return 'Storage';
    
    return 'Infrastructure';
  }

  private mapServiceNowStatus(installStatus: any, operationalStatus: any): 'Ativo' | 'Inativo' | 'Manutenção' | 'Descomissionado' {
    const install = installStatus?.display_value?.toLowerCase() || installStatus?.toString().toLowerCase() || '';
    const operational = operationalStatus?.display_value?.toLowerCase() || operationalStatus?.toString().toLowerCase() || '';
    
    // Check install status first
    if (install.includes('retired') || install.includes('disposed')) return 'Descomissionado';
    if (install.includes('maintenance')) return 'Manutenção';
    if (install.includes('installed') || install === '1') {
      // Check operational status
      if (operational.includes('operational') || operational === '1') return 'Ativo';
      if (operational.includes('maintenance')) return 'Manutenção';
      if (operational.includes('non-operational') || operational.includes('broken')) return 'Inativo';
    }
    
    return 'Inativo';
  }
}