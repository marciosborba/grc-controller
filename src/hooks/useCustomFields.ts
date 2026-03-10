import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveTenant } from '@/hooks/useEffectiveTenant';

export interface CustomFieldDefinition {
    id: string;
    tenant_id: string;
    field_name: string;
    field_key: string;
    field_type: 'text' | 'textarea' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'file';
    options: string[] | null;
    required: boolean;
    position: number;
    is_active: boolean;
    show_on_card: boolean;
    show_in_interior?: boolean;
    show_in_filters?: boolean;
    target_module: string;
    editable: boolean;
    created_at: string;
}

interface UseCustomFieldsReturn {
    fields: CustomFieldDefinition[];
    loading: boolean;
    fieldValues: Record<string, any>;
    setFieldValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    refetch: () => void;
}

/**
 * Reusable hook to fetch custom field definitions for a specific module.
 * 
 * @param targetModule - The module identifier (e.g., 'vendor_registration', 'risk_assessment')
 * @param initialValues - Optional initial values (e.g., from editing an existing record)
 * 
 * Usage:
 * ```tsx
 * const { fields, fieldValues, setFieldValues } = useCustomFields('vendor_registration', vendor.metadata?.custom_fields);
 * ```
 */
export function useCustomFields(targetModule: string, initialValues?: Record<string, any>): UseCustomFieldsReturn {
    const { effectiveTenantId } = useEffectiveTenant();
    const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [fieldValues, setFieldValues] = useState<Record<string, any>>(initialValues || {});

    const fetchFields = useCallback(async () => {
        if (!effectiveTenantId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('custom_field_definitions')
                .select('*')
                .eq('tenant_id', effectiveTenantId)
                .eq('target_module', targetModule)
                .order('position', { ascending: true });
            if (error) {
                console.error('Error fetching custom fields:', error);
                return;
            }
            setFields((data as any[] as CustomFieldDefinition[]) || []);
        } catch (e) {
            console.error('Error fetching custom fields:', e);
        } finally {
            setLoading(false);
        }
    }, [effectiveTenantId, targetModule]);

    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    // Update fieldValues when initialValues change (e.g., editing a different record)
    useEffect(() => {
        if (initialValues) {
            setFieldValues(initialValues);
        }
    }, [initialValues]);

    return { fields, loading, fieldValues, setFieldValues, refetch: fetchFields };
}
