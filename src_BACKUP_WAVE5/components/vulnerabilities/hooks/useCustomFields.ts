import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { useCurrentTenantId } from '@/contexts/TenantSelectorContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'textarea' | 'email' | 'url' | 'phone';
  required: boolean;
  visible: boolean;
  order: number;
  tab: string;
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
  importMapping?: Record<string, string>;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  tenant_id: string;
  entity_type: string;
  metadata?: {
    sectionTitle?: string;
    sectionSubtitle?: string;
    [key: string]: any;
  };
}

export interface CustomFieldValue {
  field_id: string;
  vulnerability_id: string;
  value: any;
  created_at: Date;
  updated_at: Date;
}

interface UseCustomFieldsOptions {
  includeHidden?: boolean;
  tab?: string;
  entityType?: string; // Default to 'vulnerability' if not specified
}

export const useCustomFields = (options: UseCustomFieldsOptions = {}) => {
  const { user } = useAuth();
  const effectiveTenantId = useCurrentTenantId();

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    includeHidden = false,
    tab,
    entityType = 'vulnerability'
  } = options;

  // Check if user can manage custom fields (admin only)
  const canManageFields = useCallback(() => {
    if (!user) {
      return false;
    }

    // Platform admins or Tenant admins
    const hasPermission = user.isPlatformAdmin ||
      user.roles?.includes('admin') ||
      user.roles?.includes('tenant_admin') ||
      user.roles?.includes('super_admin') ||
      user.roles?.includes('platform_admin');

    return hasPermission;
  }, [user]);

  // Load custom fields from Supabase
  const loadCustomFields = useCallback(async () => {
    if (!effectiveTenantId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('custom_fields')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .eq('entity_type', entityType);

      if (!includeHidden) {
        query = query.eq('visible', true);
      }

      if (tab) {
        query = query.eq('tab', tab);
      }

      const { data, error } = await query.order('order_index', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const mappedFields: CustomField[] = data.map((field: any) => ({
          id: field.id,
          name: field.name,
          label: field.label,
          type: field.type,
          required: field.required || false,
          visible: field.visible !== false,
          order: field.order_index || 0,
          tab: field.tab || 'custom',
          description: field.description,
          placeholder: field.placeholder,
          defaultValue: field.default_value,
          options: field.options as string[],
          validation: field.validation,
          importMapping: field.import_mapping,
          metadata: field.metadata,
          created_at: new Date(field.created_at),
          updated_at: new Date(field.updated_at),
          created_by: field.created_by,
          tenant_id: field.tenant_id,
          entity_type: field.entity_type
        }));

        setCustomFields(mappedFields);
      } else {
        setCustomFields([]);
      }

    } catch (err: any) {
      console.error('Error loading custom fields:', err);
      setError(err.message || 'Failed to load custom fields');
      // Do NOT show toast on load to avoid spamming, only show if critical context
    } finally {
      setLoading(false);
    }
  }, [effectiveTenantId, includeHidden, tab, entityType]);

  // Create custom field
  const createCustomField = useCallback(async (fieldData: Omit<CustomField, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'tenant_id' | 'entity_type'>) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('Sem permissão para criar campos customizados');
      return null;
    }

    try {
      const dbField = {
        tenant_id: effectiveTenantId,
        entity_type: entityType,
        name: fieldData.name,
        label: fieldData.label,
        type: fieldData.type,
        options: fieldData.options,
        required: fieldData.required,
        visible: fieldData.visible,
        order_index: fieldData.order,
        tab: fieldData.tab,
        description: fieldData.description,
        placeholder: fieldData.placeholder,
        validation: fieldData.validation,
        import_mapping: fieldData.importMapping,
        metadata: fieldData.metadata,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('custom_fields')
        .insert([dbField])
        .select()
        .single();

      if (error) throw error;

      toast.success('Campo customizado criado com sucesso');
      await loadCustomFields();

      // Map back to frontend model
      return {
        ...fieldData,
        id: data.id,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        created_by: data.created_by,
        tenant_id: data.tenant_id,
        entity_type: data.entity_type
      } as CustomField;

    } catch (err: any) {
      console.error('Error creating custom field:', err);
      toast.error(`Erro ao criar campo: ${err.message}`);
      return null;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields, entityType]);

  // Update custom field
  const updateCustomField = useCallback(async (id: string, updates: Partial<CustomField>) => {
    if (!effectiveTenantId || !user || !canManageFields()) {
      toast.error('Sem permissão para atualizar campos customizados');
      return false;
    }

    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.label) dbUpdates.label = updates.label;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.options !== undefined) dbUpdates.options = updates.options;
      if (updates.required !== undefined) dbUpdates.required = updates.required;
      if (updates.visible !== undefined) dbUpdates.visible = updates.visible;
      if (updates.order !== undefined) dbUpdates.order_index = updates.order;
      if (updates.tab) dbUpdates.tab = updates.tab;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.placeholder !== undefined) dbUpdates.placeholder = updates.placeholder;
      if (updates.validation) dbUpdates.validation = updates.validation;
      if (updates.importMapping) dbUpdates.import_mapping = updates.importMapping;
      if (updates.metadata) dbUpdates.metadata = updates.metadata;

      const { error } = await supabase
        .from('custom_fields')
        .update(dbUpdates)
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId); // Security check

      if (error) throw error;

      toast.success('Campo customizado atualizado com sucesso');
      await loadCustomFields();

      return true;
    } catch (err: any) {
      console.error('Error updating custom field:', err);
      toast.error(`Erro ao atualizar campo: ${err.message}`);
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
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      toast.success('Campo customizado removido com sucesso');
      await loadCustomFields();

      return true;
    } catch (err: any) {
      console.error('Error deleting custom field:', err);
      toast.error(`Erro ao remover campo: ${err.message}`);
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
      // In a real app we'd want to do this in a transaction or batch update
      // For now, we'll update them one by one or rely on the frontend optimistic update
      // A better approach is sending the whole order list to an RPC function

      const updates = fieldIds.map((id, index) =>
        supabase
          .from('custom_fields')
          .update({ order_index: index + 1 })
          .eq('id', id)
          .eq('tenant_id', effectiveTenantId)
      );

      await Promise.all(updates);

      // No toast for reorder to be less intrusive
      await loadCustomFields();
      return true;
    } catch (err) {
      console.error('Error reordering fields:', err);
      toast.error('Erro ao reordenar campos');
      return false;
    }
  }, [effectiveTenantId, user, canManageFields, loadCustomFields]);

  // Get field values for a vulnerability (or other entity)
  const getFieldValues = useCallback(async (entityId: string): Promise<Record<string, any>> => {
    if (!effectiveTenantId) return {};

    try {
      const { data, error } = await supabase
        .from('custom_field_values')
        .select('field_id, value')
        .eq('entity_id', entityId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;

      if (!data) return {};

      // Transform to record format { [fieldId]: value }
      const values: Record<string, any> = {};
      data.forEach((item: any) => {
        values[item.field_id] = item.value;
      });

      return values;
    } catch (err) {
      console.error('Error loading field values:', err);
      return {};
    }
  }, [effectiveTenantId]);

  // Save field values for a vulnerability (or other entity)
  const saveFieldValues = useCallback(async (entityId: string, values: Record<string, any>) => {
    if (!effectiveTenantId) return false;

    try {
      // Prepare upsert operations
      const upserts = Object.entries(values).map(([fieldId, value]) => ({
        tenant_id: effectiveTenantId,
        field_id: fieldId,
        entity_id: entityId,
        value: value,
        updated_at: new Date().toISOString()
      }));

      if (upserts.length === 0) return true;

      const { error } = await supabase
        .from('custom_field_values')
        .upsert(upserts, { onConflict: 'field_id, entity_id' });

      if (error) throw error;

      return true;
    } catch (err: any) {
      console.error('Error saving field values:', err);
      toast.error(`Erro ao salvar valores: ${err.message}`);
      return false;
    }
  }, [effectiveTenantId]);

  // Get import mapping for a tool
  const getImportMapping = useCallback((tool: string) => {
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