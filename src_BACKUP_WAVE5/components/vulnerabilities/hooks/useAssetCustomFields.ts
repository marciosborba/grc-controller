import { useCallback, useMemo } from 'react';
import { useCustomFields, CustomField } from './useCustomFields';

export interface AssetCustomField extends Omit<CustomField, 'entity_type' | 'metadata'> {
  sectionTitle?: string;
  sectionSubtitle?: string;
  tab: 'basic' | 'network' | 'location' | 'management' | 'security';
}

export interface AssetCustomFieldValue {
  field_id: string;
  asset_id: string;
  value: any;
  created_at: Date;
  updated_at: Date;
}

interface UseAssetCustomFieldsOptions {
  includeHidden?: boolean;
  tab?: AssetCustomField['tab'];
}

export const useAssetCustomFields = (options: UseAssetCustomFieldsOptions = {}) => {
  const {
    customFields: rawFields,
    createCustomField: rawCreate,
    updateCustomField: rawUpdate,
    ...rest
  } = useCustomFields({
    ...options,
    entityType: 'asset'
  });

  // Map generic CustomField to AssetCustomField
  const customFields: AssetCustomField[] = useMemo(() => {
    return rawFields.map(field => ({
      ...field,
      sectionTitle: field.metadata?.sectionTitle,
      sectionSubtitle: field.metadata?.sectionSubtitle,
      tab: field.tab as AssetCustomField['tab']
    }));
  }, [rawFields]);

  // Wrapper for create
  const createCustomField = useCallback(async (fieldData: Omit<AssetCustomField, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'tenant_id'>) => {
    const { sectionTitle, sectionSubtitle, ...restData } = fieldData;

    const result = await rawCreate({
      ...restData,
      metadata: {
        sectionTitle,
        sectionSubtitle
      }
    });

    if (!result) return null;

    return {
      ...result,
      sectionTitle: result.metadata?.sectionTitle,
      sectionSubtitle: result.metadata?.sectionSubtitle,
      tab: result.tab as AssetCustomField['tab']
    };
  }, [rawCreate]);

  // Wrapper for update
  const updateCustomField = useCallback(async (id: string, updates: Partial<AssetCustomField>) => {
    const { sectionTitle, sectionSubtitle, ...restUpdates } = updates;

    const updateData: any = { ...restUpdates };

    if (sectionTitle !== undefined || sectionSubtitle !== undefined) {
      updateData.metadata = {
        sectionTitle,
        sectionSubtitle
      };
    }

    return await rawUpdate(id, updateData);
  }, [rawUpdate]);

  return {
    customFields,
    createCustomField,
    updateCustomField,
    ...rest
  };
};