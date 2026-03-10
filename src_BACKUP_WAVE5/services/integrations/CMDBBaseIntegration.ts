import { createClient } from '@supabase/supabase-js';

export interface CMDBCredentials {
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

export interface AssetData {
  id: string;
  name: string;
  type: 'Server' | 'Workstation' | 'Network Device' | 'Mobile Device' | 'Storage' | 'Infrastructure';
  status: 'Ativo' | 'Inativo' | 'Manutenção' | 'Descomissionado';
  ip_address?: string;
  mac_address?: string;
  location: string;
  os?: string;
  os_version?: string;
  owner: string;
  department?: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  asset_tag?: string;
  purchase_date?: Date;
  warranty_expiry?: Date;
  last_scan?: Date;
  source_tool: string;
  source_type: string;
  raw_data?: any;
}

export interface CMDBImportResult {
  success: boolean;
  total_found: number;
  imported: number;
  skipped: number;
  errors: string[];
  assets: AssetData[];
}

export abstract class CMDBBaseIntegration {
  protected credentials: CMDBCredentials;
  protected supabase: any;

  constructor(credentials: CMDBCredentials) {
    this.credentials = credentials;
    
    // Initialize Supabase client with service role for backend operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  abstract testConnection(): Promise<boolean>;
  abstract importAssets(filters?: any): Promise<CMDBImportResult>;
  
  protected async saveAssets(assets: AssetData[], tenantId: string): Promise<number> {
    try {
      const assetsToInsert = assets.map(asset => ({
        tenant_id: tenantId,
        asset_id: asset.id,
        name: asset.name,
        type: asset.type,
        status: asset.status,
        ip_address: asset.ip_address,
        mac_address: asset.mac_address,
        location: asset.location,
        os: asset.os,
        os_version: asset.os_version,
        owner: asset.owner,
        department: asset.department,
        model: asset.model,
        manufacturer: asset.manufacturer,
        serial_number: asset.serial_number,
        asset_tag: asset.asset_tag,
        purchase_date: asset.purchase_date,
        warranty_expiry: asset.warranty_expiry,
        last_scan: asset.last_scan,
        source_tool: asset.source_tool,
        source_type: asset.source_type,
        raw_data: asset.raw_data,
        created_at: new Date(),
        updated_at: new Date()
      }));

      const { data, error } = await this.supabase
        .from('cmdb_assets')
        .insert(assetsToInsert)
        .select();

      if (error) {
        console.error('Error saving assets:', error);
        throw new Error(`Failed to save assets: ${error.message}`);
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error in saveAssets:', error);
      throw error;
    }
  }

  protected normalizeAsset(rawData: any, sourceType: string): AssetData {
    // Base normalization - to be overridden by specific integrations
    return {
      id: rawData.id || rawData.sys_id || `${sourceType}-${Date.now()}-${Math.random()}`,
      name: rawData.name || rawData.display_name || rawData.hostname || 'Unknown Asset',
      type: this.normalizeAssetType(rawData.type || rawData.category || rawData.class),
      status: this.normalizeAssetStatus(rawData.status || rawData.state),
      ip_address: rawData.ip_address || rawData.ip || rawData.ipAddress,
      location: rawData.location || rawData.site || 'Unknown Location',
      os: rawData.os || rawData.operating_system || rawData.platform,
      owner: rawData.owner || rawData.assigned_to || rawData.responsible || 'Unknown Owner',
      source_tool: sourceType,
      source_type: sourceType,
      raw_data: rawData
    };
  }

  protected normalizeAssetType(type: string): 'Server' | 'Workstation' | 'Network Device' | 'Mobile Device' | 'Storage' | 'Infrastructure' {
    const typeStr = type?.toString().toLowerCase() || '';
    
    if (typeStr.includes('server') || typeStr.includes('srv')) return 'Server';
    if (typeStr.includes('workstation') || typeStr.includes('desktop') || typeStr.includes('laptop')) return 'Workstation';
    if (typeStr.includes('network') || typeStr.includes('switch') || typeStr.includes('router') || typeStr.includes('firewall')) return 'Network Device';
    if (typeStr.includes('mobile') || typeStr.includes('phone') || typeStr.includes('tablet')) return 'Mobile Device';
    if (typeStr.includes('storage') || typeStr.includes('san') || typeStr.includes('nas')) return 'Storage';
    
    return 'Infrastructure';
  }

  protected normalizeAssetStatus(status: string): 'Ativo' | 'Inativo' | 'Manutenção' | 'Descomissionado' {
    const statusStr = status?.toString().toLowerCase() || '';
    
    if (statusStr.includes('active') || statusStr.includes('operational') || statusStr.includes('running') || statusStr.includes('1')) return 'Ativo';
    if (statusStr.includes('maintenance') || statusStr.includes('maint')) return 'Manutenção';
    if (statusStr.includes('retired') || statusStr.includes('decommission') || statusStr.includes('disposed')) return 'Descomissionado';
    
    return 'Inativo';
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