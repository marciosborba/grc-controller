import { CMDBBaseIntegration, CMDBCredentials, AssetData, CMDBImportResult } from './CMDBBaseIntegration';

export interface LansweeperCredentials extends CMDBCredentials {
  server: string; // lansweeper.company.com
  database: string; // lansweeperdb
  username: string;
  password: string;
  customQuery?: string;
}

export class LansweeperIntegration extends CMDBBaseIntegration {
  private credentials: LansweeperCredentials;

  constructor(credentials: LansweeperCredentials) {
    super(credentials);
    this.credentials = credentials;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test connection with a simple query
      const testQuery = 'SELECT TOP 1 AssetName FROM tblAssets';
      const result = await this.executeQuery(testQuery);
      return result && result.length >= 0;
    } catch (error) {
      console.error('Lansweeper connection test failed:', error);
      return false;
    }
  }

  async importAssets(filters?: {
    customQuery?: string;
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
      const assets = await this.getAssets(filters);
      
      result.total_found = assets.length;
      result.assets = assets;
      result.success = true;
      result.imported = assets.length;

      return result;
    } catch (error) {
      console.error('Lansweeper import failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      return result;
    }
  }

  private async getAssets(filters?: any): Promise<AssetData[]> {
    try {
      let query = filters?.customQuery || this.credentials.customQuery || this.getDefaultQuery();
      
      if (filters?.maxResults && !query.toLowerCase().includes('top ')) {
        query = query.replace(/^SELECT/i, `SELECT TOP ${filters.maxResults}`);
      }

      const results = await this.executeQuery(query);
      return this.parseLansweeperAssets(results);
    } catch (error) {
      console.error('Failed to get Lansweeper assets:', error);
      throw error;
    }
  }

  private getDefaultQuery(): string {
    return `
      SELECT 
        a.AssetID,
        a.AssetName,
        a.AssetType,
        a.IPAddress,
        a.MACAddress,
        a.Domain,
        a.Username,
        a.Lastseen,
        a.Firstseen,
        os.OSname,
        os.Version as OSVersion,
        m.Manufacturer,
        m.Model,
        a.SerialNumber,
        a.AssetTag,
        s.Sitename as Location,
        a.State
      FROM tblAssets a
      LEFT JOIN tblOperatingsystem os ON a.AssetID = os.AssetID
      LEFT JOIN tblAssetCustom ac ON a.AssetID = ac.AssetID
      LEFT JOIN tblManufacturer m ON a.AssetID = m.AssetID
      LEFT JOIN tblSites s ON a.SiteID = s.SiteID
      WHERE a.AssetType IN ('Computer', 'Server', 'Network Device', 'Mobile Device')
      ORDER BY a.Lastseen DESC
    `;
  }

  private async executeQuery(query: string): Promise<any[]> {
    try {
      // In a real implementation, this would connect to SQL Server
      // For now, we'll simulate the API call structure
      const connectionString = `Server=${this.credentials.server};Database=${this.credentials.database};User Id=${this.credentials.username};Password=${this.credentials.password};`;
      
      // This would use a SQL Server client library like mssql
      // const pool = await sql.connect(connectionString);
      // const result = await pool.request().query(query);
      // return result.recordset;
      
      // For demonstration, we'll simulate the response structure
      throw new Error('SQL Server connection not implemented. Use REST API or configure database access.');
    } catch (error) {
      console.error('Failed to execute Lansweeper query:', error);
      throw error;
    }
  }

  private parseLansweeperAssets(assetData: any[]): AssetData[] {
    const assets: AssetData[] = [];

    assetData.forEach(asset => {
      const assetObj: AssetData = {
        id: asset.AssetID?.toString() || `lansweeper-${Date.now()}-${Math.random()}`,
        name: asset.AssetName || 'Unknown Asset',
        type: this.mapLansweeperType(asset.AssetType),
        status: this.mapLansweeperState(asset.State),
        ip_address: asset.IPAddress,
        mac_address: asset.MACAddress,
        location: asset.Location || asset.Sitename || 'Unknown Location',
        os: asset.OSname,
        os_version: asset.OSVersion,
        owner: asset.Username || 'Unknown User',
        department: asset.Domain,
        model: asset.Model,
        manufacturer: asset.Manufacturer,
        serial_number: asset.SerialNumber,
        asset_tag: asset.AssetTag,
        last_scan: asset.Lastseen ? new Date(asset.Lastseen) : undefined,
        source_tool: 'Lansweeper',
        source_type: 'Lansweeper',
        raw_data: {
          assetId: asset.AssetID,
          assetType: asset.AssetType,
          domain: asset.Domain,
          firstSeen: asset.Firstseen,
          lastSeen: asset.Lastseen,
          state: asset.State,
          siteId: asset.SiteID
        }
      };

      assets.push(assetObj);
    });

    return assets;
  }

  private mapLansweeperType(assetType: string): 'Server' | 'Workstation' | 'Network Device' | 'Mobile Device' | 'Storage' | 'Infrastructure' {
    const typeStr = assetType?.toString().toLowerCase() || '';
    
    if (typeStr.includes('server')) return 'Server';
    if (typeStr.includes('computer') || typeStr.includes('desktop') || typeStr.includes('laptop')) return 'Workstation';
    if (typeStr.includes('network') || typeStr.includes('switch') || typeStr.includes('router')) return 'Network Device';
    if (typeStr.includes('mobile') || typeStr.includes('phone') || typeStr.includes('tablet')) return 'Mobile Device';
    if (typeStr.includes('storage')) return 'Storage';
    
    return 'Infrastructure';
  }

  private mapLansweeperState(state: string | number): 'Ativo' | 'Inativo' | 'Manutenção' | 'Descomissionado' {
    const stateStr = state?.toString().toLowerCase() || '';
    
    if (stateStr.includes('active') || stateStr === '1') return 'Ativo';
    if (stateStr.includes('maintenance')) return 'Manutenção';
    if (stateStr.includes('retired') || stateStr.includes('disposed')) return 'Descomissionado';
    
    return 'Inativo';
  }
}