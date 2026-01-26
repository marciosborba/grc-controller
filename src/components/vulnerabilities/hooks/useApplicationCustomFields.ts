import { useCallback, useMemo } from 'react';
import { useCustomFields, CustomField } from './useCustomFields';

export interface ApplicationCustomField extends Omit<CustomField, 'entity_type' | 'metadata'> {
  tab: 'basic' | 'technical' | 'business' | 'security' | 'custom';
}

interface UseApplicationCustomFieldsOptions {
  includeHidden?: boolean;
  tab?: ApplicationCustomField['tab'];
}

export function useApplicationCustomFields(options: UseApplicationCustomFieldsOptions = {}) {
  const {
    customFields: rawFields,
    createCustomField: rawCreate,
    ...rest
  } = useCustomFields({
    ...options,
    entityType: 'application'
  });

  // Map generic CustomField to ApplicationCustomField
  const customFields: ApplicationCustomField[] = useMemo(() => {
    return rawFields.map(field => ({
      ...field,
      tab: field.tab as ApplicationCustomField['tab']
    }));
  }, [rawFields]);

  // Wrapper for create (to ensure type compatibility if needed, though mostly compatible)
  const createCustomField = useCallback(async (fieldData: Omit<ApplicationCustomField, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'tenant_id'>) => {
    // Just pass through
    return await rawCreate(fieldData);
  }, [rawCreate]);

  return {
    customFields,
    createCustomField,
    ...rest
  };
}