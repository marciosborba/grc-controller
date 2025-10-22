import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextSimple';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea' | 'email' | 'url' | 'phone';
  required: boolean;
  visible: boolean;
  order: number;
  tab: 'basic' | 'technical' | 'remediation' | 'classification' | 'custom';
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  importMapping?: {
    qualys?: string;
    nessus?: string;
    openvas?: string;
    burp?: string;
    custom?: string;
  };
  created_at: Date;
  updated_at: Date;
  created_by: string;
  tenant_id: string;
}

export interface CustomFieldValue {
  field_id: string;
  vulnerability_id: string;
  value: string | number | boolean | null;
  created_at: Date;
  updated_at: Date;
}

interface UseCustomFieldsOptions {
  includeHidden?: boolean;
  tab?: CustomField['tab'];
}

export const useCustomFields = (options: UseCustomFieldsOptions = {}) => {
  const { user } = useAuth();
  const effectiveTenantId = useCurrentTenantId();
  
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
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
      const storedFields = localStorage.getItem(`custom_fields_${effectiveTenantId}`);
      let fields: CustomField[] = [];

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
            name: 'business_unit',
            label: 'Unidade de Negócio',
            type: 'select',
            required: false,
            visible: true,
            order: 1,
            tab: 'classification',
            options: ['TI', 'Financeiro', 'RH', 'Vendas', 'Marketing'],
            created_at: new Date('2024-01-10'),
            updated_at: new Date('2024-01-10'),
            created_by: user?.id || 'system',
            tenant_id: effectiveTenantId
          },
          {
            id: '2',
            name: 'compliance_framework',
            label: 'Framework de Compliance',
            type: 'select',
            required: false,
            visible: true,
            order: 2,
            tab: 'classification',
            options: ['SOX', 'PCI-DSS', 'LGPD', 'ISO 27001', 'NIST'],
            created_at: new Date('2024-01-10'),
            updated_at: new Date('2024-01-10'),
            created_by: user?.id || 'system',
            tenant_id: effectiveTenantId
          }
        ];
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
      console.error('Error loading custom fields:', err);
      setError(err instanceof Error ? err.message : 'Failed to load custom fields');
      toast.error('Erro ao carregar campos customizados');
    } finally {
      setLoading(false);
    }
  }, [effectiveTenantId, includeHidden, tab, user?.id]);

  // Create custom field
  const createCustomField = useCallback(async (fieldData: Omit<CustomField, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'tenant_id'>) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('Sem permissão para criar campos customizados');
      return null;
    }

    try {
      const newField: CustomField = {
        ...fieldData,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: user.id,
        tenant_id: effectiveTenantId
      };

      // Get existing fields
      const storedFields = localStorage.getItem(`custom_fields_${effectiveTenantId}`);
      const existingFields: CustomField[] = storedFields ? JSON.parse(storedFields) : [];

      // Add new field
      const updatedFields = [...existingFields, newField];
      localStorage.setItem(`custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      toast.success('Campo customizado criado com sucesso');
      await loadCustomFields();
      
      return newField;
    } catch (err) {
      console.error('Error creating custom field:', err);
      toast.error('Erro ao criar campo customizado');
      return null;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  // Update custom field
  const updateCustomField = useCallback(async (id: string, updates: Partial<CustomField>) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('Sem permissão para atualizar campos customizados');
      return false;
    }

    try {
      // Get existing fields
      const storedFields = localStorage.getItem(`custom_fields_${effectiveTenantId}`);
      const existingFields: CustomField[] = storedFields ? JSON.parse(storedFields) : [];

      // Update field
      const updatedFields = existingFields.map(field => 
        field.id === id 
          ? { ...field, ...updates, updated_at: new Date() }
          : field
      );

      localStorage.setItem(`custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      toast.success('Campo customizado atualizado com sucesso');
      await loadCustomFields();
      
      return true;
    } catch (err) {
      console.error('Error updating custom field:', err);
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
      const storedFields = localStorage.getItem(`custom_fields_${effectiveTenantId}`);
      const existingFields: CustomField[] = storedFields ? JSON.parse(storedFields) : [];

      // Remove field
      const updatedFields = existingFields.filter(field => field.id !== id);
      localStorage.setItem(`custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      // Also remove any field values for this field
      // In a real implementation, this would be handled by database constraints
      
      toast.success('Campo customizado removido com sucesso');
      await loadCustomFields();
      
      return true;
    } catch (err) {
      console.error('Error deleting custom field:', err);
      toast.error('Erro ao remover campo customizado');
      return false;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  // Reorder fields
  const reorderFields = useCallback(async (fieldIds: string[]) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('Sem permissão para reordenar campos');
      return false;
    }

    try {
      // Get existing fields
      const storedFields = localStorage.getItem(`custom_fields_${effectiveTenantId}`);
      const existingFields: CustomField[] = storedFields ? JSON.parse(storedFields) : [];

      // Update order
      const updatedFields = existingFields.map(field => {
        const newOrder = fieldIds.indexOf(field.id);
        return newOrder >= 0 
          ? { ...field, order: newOrder + 1, updated_at: new Date() }
          : field;
      });

      localStorage.setItem(`custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      await loadCustomFields();
      return true;
    } catch (err) {
      console.error('Error reordering fields:', err);
      toast.error('Erro ao reordenar campos');
      return false;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  // Get field values for a vulnerability
  const getFieldValues = useCallback(async (vulnerabilityId: string): Promise<Record<string, any>> => {
    if (!effectiveTenantId) return {};

    try {
      // In a real implementation, this would fetch from Supabase
      const storedValues = localStorage.getItem(`field_values_${effectiveTenantId}_${vulnerabilityId}`);
      return storedValues ? JSON.parse(storedValues) : {};
    } catch (err) {
      console.error('Error loading field values:', err);
      return {};
    }
  }, [effectiveTenantId]);

  // Save field values for a vulnerability
  const saveFieldValues = useCallback(async (vulnerabilityId: string, values: Record<string, any>) => {
    if (!effectiveTenantId) return false;

    try {
      localStorage.setItem(`field_values_${effectiveTenantId}_${vulnerabilityId}`, JSON.stringify(values));
      return true;
    } catch (err) {
      console.error('Error saving field values:', err);
      toast.error('Erro ao salvar valores dos campos');
      return false;
    }
  }, [effectiveTenantId]);

  // Get import mapping for a tool
  const getImportMapping = useCallback((tool: 'qualys' | 'nessus' | 'openvas' | 'burp' | 'custom') => {
    return customFields.reduce((mapping, field) => {
      const toolMapping = field.importMapping?.[tool];
      if (toolMapping) {
        mapping[toolMapping] = field.name;
      }
      return mapping;
    }, {} as Record<string, string>);
  }, [customFields]);

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
    reorderFields,
    getFieldValues,
    saveFieldValues,
    getImportMapping,
    refetch: loadCustomFields,
  };
};