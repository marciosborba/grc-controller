import { createClient } from '@supabase/supabase-js';
import { EncryptionService } from './EncryptionService';

export interface StoredCredentials {
  id: string;
  tenant_id: string;
  integration_type: string;
  name: string;
  encrypted_credentials: string;
  is_active: boolean;
  last_used: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class IntegrationCredentialsService {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async saveCredentials(
    tenantId: string,
    integrationType: string,
    name: string,
    credentials: any
  ): Promise<string> {
    try {
      // Encrypt sensitive data
      const encryptedCredentials = EncryptionService.encrypt(JSON.stringify(credentials));

      const { data, error } = await this.supabase
        .from('integration_credentials')
        .insert({
          tenant_id: tenantId,
          integration_type: integrationType,
          name,
          encrypted_credentials: encryptedCredentials,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save credentials: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Error saving credentials:', error);
      throw error;
    }
  }

  async getCredentials(credentialsId: string, tenantId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('integration_credentials')
        .select('*')
        .eq('id', credentialsId)
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw new Error(`Failed to get credentials: ${error.message}`);
      }

      if (!data) {
        throw new Error('Credentials not found');
      }

      // Decrypt credentials
      const decryptedCredentials = EncryptionService.decrypt(data.encrypted_credentials);
      return JSON.parse(decryptedCredentials);
    } catch (error) {
      console.error('Error getting credentials:', error);
      throw error;
    }
  }

  async listCredentials(tenantId: string, integrationType?: string): Promise<StoredCredentials[]> {
    try {
      let query = this.supabase
        .from('integration_credentials')
        .select('id, tenant_id, integration_type, name, is_active, last_used, created_at, updated_at')
        .eq('tenant_id', tenantId)
        .eq('is_active', true);

      if (integrationType) {
        query = query.eq('integration_type', integrationType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to list credentials: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error listing credentials:', error);
      throw error;
    }
  }

  async updateLastUsed(credentialsId: string, tenantId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('integration_credentials')
        .update({
          last_used: new Date(),
          updated_at: new Date()
        })
        .eq('id', credentialsId)
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(`Failed to update last used: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating last used:', error);
      throw error;
    }
  }

  async deleteCredentials(credentialsId: string, tenantId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('integration_credentials')
        .update({
          is_active: false,
          updated_at: new Date()
        })
        .eq('id', credentialsId)
        .eq('tenant_id', tenantId);

      if (error) {
        throw new Error(`Failed to delete credentials: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting credentials:', error);
      throw error;
    }
  }
}