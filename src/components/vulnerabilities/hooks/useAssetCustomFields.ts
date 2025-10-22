import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextSimple';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

export interface AssetCustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea' | 'email' | 'url' | 'phone';
  required: boolean;
  visible: boolean;
  order: number;
  tab: 'basic' | 'network' | 'location' | 'management' | 'security';
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  sectionTitle?: string;
  sectionSubtitle?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  importMapping?: {
    nmap?: string;
    lansweeper?: string;
    sccm?: string;
    custom?: string;
  };
  created_at: Date;
  updated_at: Date;
  created_by: string;
  tenant_id: string;
}

export interface AssetCustomFieldValue {
  field_id: string;
  asset_id: string;
  value: string | number | boolean | null;
  created_at: Date;
  updated_at: Date;
}

interface UseAssetCustomFieldsOptions {
  includeHidden?: boolean;
  tab?: AssetCustomField['tab'];
}

export const useAssetCustomFields = (options: UseAssetCustomFieldsOptions = {}) => {
  const { user } = useAuth();
  const effectiveTenantId = useCurrentTenantId();
  
  const [customFields, setCustomFields] = useState<AssetCustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    includeHidden = false,
    tab
  } = options;

  // Check if user can manage custom fields (admin only)
  const canManageFields = useCallback(() => {
    if (!user) {
      return false;
    }
    
    const hasPermission = user.isPlatformAdmin || 
                         user.roles?.includes('admin') || 
                         user.roles?.includes('tenant_admin') ||
                         user.roles?.includes('super_admin') ||
                         user.roles?.includes('platform_admin');
    
    return hasPermission;
  }, [user]);

  // Load custom fields
  const loadCustomFields = useCallback(async () => {
    if (!effectiveTenantId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use mock data stored in localStorage
      const storedFields = localStorage.getItem(`asset_custom_fields_${effectiveTenantId}`);
      let fields: AssetCustomField[] = [];

      if (storedFields) {
        fields = JSON.parse(storedFields).map((field: any) => ({
          ...field,
          created_at: new Date(field.created_at),
          updated_at: new Date(field.updated_at)
        }));
      } else {
        // Default fields for demo
        fields = [
          {
            id: '1',
            name: 'data_classification',
            label: 'Classificação de Dados',
            type: 'select' as const,
            required: false,
            visible: true,
            order: 1,
            tab: 'basic' as const,
            options: ['Público', 'Interno', 'Confidencial', 'Restrito'],
            sectionTitle: 'Campos Personalizados',
            sectionSubtitle: 'Campos customizados básicos configurados para sua organização',
            created_at: new Date('2024-01-10'),
            updated_at: new Date('2024-01-10'),
            created_by: user?.id || 'system',
            tenant_id: effectiveTenantId
          },
          {
            id: '2',
            name: 'maintenance_window',
            label: 'Janela de Manutenção',
            type: 'text' as const,
            required: false,
            visible: true,
            order: 2,
            tab: 'management' as const,
            placeholder: 'Ex: Sábados 02:00-06:00',
            created_at: new Date('2024-01-10'),
            updated_at: new Date('2024-01-10'),
            created_by: user?.id || 'system',
            tenant_id: effectiveTenantId
          }
        ];
        // Save default fields to localStorage
        localStorage.setItem(`asset_custom_fields_${effectiveTenantId}`, JSON.stringify(fields));
      }

      // Apply filters
      let filteredFields = fields;
      
      if (!includeHidden) {
        filteredFields = filteredFields.filter(field => field.visible);
      }
      
      if (tab) {
        filteredFields = filteredFields.filter(field => field.tab === tab);
      }

      // Sort by order
      filteredFields.sort((a, b) => a.order - b.order);

      setCustomFields(filteredFields);
    } catch (err) {
      console.error('Error loading asset custom fields:', err);
      setError(err instanceof Error ? err.message : 'Failed to load custom fields');
      toast.error('Erro ao carregar campos customizados de ativos');
    } finally {
      setLoading(false);
    }
  }, [effectiveTenantId, includeHidden, tab, user?.id]);

  // Create custom field
  const createCustomField = useCallback(async (fieldData: Omit<AssetCustomField, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'tenant_id'>) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('Sem permissão para criar campos customizados');
      return null;
    }

    try {
      const newField: AssetCustomField = {
        ...fieldData,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: user.id,
        tenant_id: effectiveTenantId
      };

      // Get existing fields
      const storedFields = localStorage.getItem(`asset_custom_fields_${effectiveTenantId}`);
      const existingFields: AssetCustomField[] = storedFields ? JSON.parse(storedFields) : [];

      // Add new field
      const updatedFields = [...existingFields, newField];
      localStorage.setItem(`asset_custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      toast.success('Campo customizado criado com sucesso');
      await loadCustomFields();
      
      return newField;
    } catch (err) {
      console.error('Error creating asset custom field:', err);
      toast.error('Erro ao criar campo customizado');
      return null;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  // Update custom field
  const updateCustomField = useCallback(async (id: string, updates: Partial<AssetCustomField>) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('Sem permissão para atualizar campos customizados');
      return false;
    }

    try {
      // Get existing fields
      const storedFields = localStorage.getItem(`asset_custom_fields_${effectiveTenantId}`);
      const existingFields: AssetCustomField[] = storedFields ? JSON.parse(storedFields) : [];

      // Update field
      const updatedFields = existingFields.map(field => 
        field.id === id 
          ? { ...field, ...updates, updated_at: new Date() }
          : field
      );

      localStorage.setItem(`asset_custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      toast.success('Campo customizado atualizado com sucesso');
      await loadCustomFields();
      
      return true;
    } catch (err) {
      console.error('Error updating asset custom field:', err);
      toast.error('Erro ao atualizar campo customizado');
      return false;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  // Delete custom field
  const deleteCustomField = useCallback(async (id: string) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('Sem permissão para excluir campos customizados');
      return false;
    }

    try {
      // Get existing fields
      const storedFields = localStorage.getItem(`asset_custom_fields_${effectiveTenantId}`);
      const existingFields: AssetCustomField[] = storedFields ? JSON.parse(storedFields) : [];

      // Remove field
      const updatedFields = existingFields.filter(field => field.id !== id);
      localStorage.setItem(`asset_custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      toast.success('Campo customizado removido com sucesso');
      await loadCustomFields();
      
      return true;
    } catch (err) {
      console.error('Error deleting asset custom field:', err);
      toast.error('Erro ao remover campo customizado');
      return false;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  // Get field values for an asset
  const getFieldValues = useCallback(async (assetId: string): Promise<Record<string, any>> => {
    if (!effectiveTenantId) return {};

    try {
      const storedValues = localStorage.getItem(`asset_field_values_${effectiveTenantId}_${assetId}`);
      return storedValues ? JSON.parse(storedValues) : {};
    } catch (err) {
      console.error('Error loading asset field values:', err);
      return {};
    }
  }, [effectiveTenantId]);

  // Save field values for an asset
  const saveFieldValues = useCallback(async (assetId: string, values: Record<string, any>) => {
    if (!effectiveTenantId) return false;

    try {
      localStorage.setItem(`asset_field_values_${effectiveTenantId}_${assetId}`, JSON.stringify(values));
      return true;
    } catch (err) {
      console.error('Error saving asset field values:', err);
      toast.error('Erro ao salvar valores dos campos');
      return false;
    }
  }, [effectiveTenantId]);

  useEffect(() => {
    loadCustomFields();
  }, [loadCustomFields]);

  return {
    customFields,
    loading,
    error,
    canManageFields: canManageFields(),
    createCustomField,
    updateCustomField,
    deleteCustomField,
    getFieldValues,
    saveFieldValues,
    refetch: loadCustomFields,
  };
};