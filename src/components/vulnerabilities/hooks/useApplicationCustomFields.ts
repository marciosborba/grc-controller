import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { toast } from 'sonner';

export interface ApplicationCustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea' | 'email' | 'url' | 'phone';
  required: boolean;
  visible: boolean;
  order: number;
  tab: 'basic' | 'technical' | 'business' | 'security' | 'custom';
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
    csv?: string;
    api?: string;
    custom?: string;
  };
  created_at: Date;
  updated_at: Date;
  created_by: string;
  tenant_id: string;
}

interface UseApplicationCustomFieldsOptions {
  includeHidden?: boolean;
  tab?: ApplicationCustomField['tab'];
}

export function useApplicationCustomFields(options: UseApplicationCustomFieldsOptions = {}) {
  const { user } = useAuth();
  const [customFields, setCustomFields] = useState<ApplicationCustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    includeHidden = false,
    tab
  } = options;

  const effectiveTenantId = user?.tenant_id || user?.id;

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

  const loadCustomFields = useCallback(async () => {
    if (!effectiveTenantId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const storedFields = localStorage.getItem(`application_custom_fields_${effectiveTenantId}`);
      let fields: ApplicationCustomField[] = [];

      if (storedFields) {
        fields = JSON.parse(storedFields).map((field: any) => ({
          ...field,
          created_at: new Date(field.created_at),
          updated_at: new Date(field.updated_at)
        }));
      } else {
        fields = [
          {
            id: '1',
            name: 'business_owner',
            label: 'Business Owner',
            type: 'text',
            required: false,
            visible: true,
            order: 1,
            tab: 'business',
            description: 'Business responsible for the application',
            importMapping: { csv: 'business_owner' },
            created_at: new Date('2024-01-10'),
            updated_at: new Date('2024-01-10'),
            created_by: user?.id || 'system',
            tenant_id: effectiveTenantId
          },
          {
            id: '2',
            name: 'criticality_level',
            label: 'Criticality Level',
            type: 'select',
            required: false,
            visible: true,
            order: 2,
            tab: 'business',
            options: ['Critical', 'High', 'Medium', 'Low'],
            description: 'Application criticality level for business',
            importMapping: { csv: 'criticality' },
            created_at: new Date('2024-01-10'),
            updated_at: new Date('2024-01-10'),
            created_by: user?.id || 'system',
            tenant_id: effectiveTenantId
          }
        ];
      }

      let filteredFields = fields;
      
      if (!includeHidden) {
        filteredFields = filteredFields.filter(field => field.visible);
      }
      
      if (tab) {
        filteredFields = filteredFields.filter(field => field.tab === tab);
      }

      filteredFields.sort((a, b) => a.order - b.order);

      setCustomFields(filteredFields);
    } catch (err) {
      console.error('Error loading application custom fields:', err);
      setError(err instanceof Error ? err.message : 'Failed to load custom fields');
      toast.error('Error loading custom application fields');
    } finally {
      setLoading(false);
    }
  }, [effectiveTenantId, includeHidden, tab, user?.id]);

  const createCustomField = useCallback(async (fieldData: Omit<ApplicationCustomField, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'tenant_id'>) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('No permission to create custom fields');
      return null;
    }

    try {
      const newField: ApplicationCustomField = {
        ...fieldData,
        id: Date.now().toString(),
        created_at: new Date(),
        updated_at: new Date(),
        created_by: user.id,
        tenant_id: effectiveTenantId
      };

      const storedFields = localStorage.getItem(`application_custom_fields_${effectiveTenantId}`);
      const existingFields: ApplicationCustomField[] = storedFields ? JSON.parse(storedFields) : [];

      const updatedFields = [...existingFields, newField];
      localStorage.setItem(`application_custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      toast.success('Application custom field created successfully');
      await loadCustomFields();
      
      return newField;
    } catch (err) {
      console.error('Error creating application custom field:', err);
      toast.error('Error creating application custom field');
      return null;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  const updateCustomField = useCallback(async (fieldId: string, fieldData: Partial<Omit<ApplicationCustomField, 'id' | 'created_at' | 'created_by' | 'tenant_id'>>) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('No permission to update custom fields');
      return null;
    }

    try {
      const storedFields = localStorage.getItem(`application_custom_fields_${effectiveTenantId}`);
      const existingFields: ApplicationCustomField[] = storedFields ? JSON.parse(storedFields) : [];

      const updatedFields = existingFields.map(field => 
        field.id === fieldId 
          ? { ...field, ...fieldData, updated_at: new Date() }
          : field
      );

      localStorage.setItem(`application_custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      toast.success('Application custom field updated successfully');
      await loadCustomFields();
      
      return updatedFields.find(f => f.id === fieldId) || null;
    } catch (err) {
      console.error('Error updating application custom field:', err);
      toast.error('Error updating application custom field');
      return null;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  const deleteCustomField = useCallback(async (fieldId: string) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('No permission to delete custom fields');
      return false;
    }

    try {
      const storedFields = localStorage.getItem(`application_custom_fields_${effectiveTenantId}`);
      const existingFields: ApplicationCustomField[] = storedFields ? JSON.parse(storedFields) : [];

      const updatedFields = existingFields.filter(field => field.id !== fieldId);
      localStorage.setItem(`application_custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      toast.success('Application custom field deleted successfully');
      await loadCustomFields();
      
      return true;
    } catch (err) {
      console.error('Error deleting application custom field:', err);
      toast.error('Error deleting application custom field');
      return false;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  const reorderFields = useCallback(async (fieldIds: string[]) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('No permission to reorder custom fields');
      return false;
    }

    try {
      const storedFields = localStorage.getItem(`application_custom_fields_${effectiveTenantId}`);
      const existingFields: ApplicationCustomField[] = storedFields ? JSON.parse(storedFields) : [];

      const updatedFields = existingFields.map(field => {
        const newOrder = fieldIds.indexOf(field.id);
        return newOrder !== -1 ? { ...field, order: newOrder + 1, updated_at: new Date() } : field;
      });

      localStorage.setItem(`application_custom_fields_${effectiveTenantId}`, JSON.stringify(updatedFields));

      await loadCustomFields();
      return true;
    } catch (err) {
      console.error('Error reordering application custom fields:', err);
      toast.error('Error reordering application custom fields');
      return false;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  useEffect(() => {
    loadCustomFields();
  }, [loadCustomFields]);

  return {
    customFields,
    loading,
    error,
    canManageFields,
    createCustomField,
    updateCustomField,
    deleteCustomField,
    reorderFields,
    loadCustomFields
  };
}