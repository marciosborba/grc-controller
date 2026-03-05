import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, File as FileIcon } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { CustomFieldDefinition } from '@/hooks/useCustomFields';

interface CustomFieldInputsProps {
    /** Custom field definitions (from useCustomFields hook) */
    fields: CustomFieldDefinition[];
    /** Current values keyed by field_key */
    values: Record<string, any>;
    /** Callback when values change */
    onChange: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    /** Optional: compact mode for smaller forms */
    compact?: boolean;
}

/**
 * Shared component that renders custom field inputs as normal form fields.
 */
export const CustomFieldInputs: React.FC<CustomFieldInputsProps> = ({
    fields,
    values,
    onChange,
    compact = false,
}) => {
    const { toast } = useToast();
    const [uploading, setUploading] = useState<Record<string, boolean>>({});

    if (fields.length === 0) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [fieldKey]: true }));
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fieldKey}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('custom_fields_attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('custom_fields_attachments').getPublicUrl(filePath);

            onChange(prev => ({
                ...prev,
                [fieldKey]: {
                    url: data.publicUrl,
                    path: filePath,
                    name: file.name,
                    size: file.size,
                    type: file.type
                }
            }));
            toast({ title: 'Arquivo anexado com sucesso' });
        } catch (error: any) {
            console.error('Error uploading file:', error);
            toast({ title: 'Erro ao fazer upload', description: error.message, variant: 'destructive' });
        } finally {
            setUploading(prev => ({ ...prev, [fieldKey]: false }));
        }
    };

    const handleRemoveFile = async (fieldKey: string, filePath: string) => {
        setUploading(prev => ({ ...prev, [fieldKey]: true }));
        try {
            await supabase.storage.from('custom_fields_attachments').remove([filePath]);
            onChange(prev => {
                const newValues = { ...prev };
                delete newValues[fieldKey];
                return newValues;
            });
        } catch (error: any) {
            console.error('Error removing file:', error);
        } finally {
            setUploading(prev => ({ ...prev, [fieldKey]: false }));
        }
    };

    const inputClass = compact ? 'h-7 text-xs mt-0.5' : 'mt-0.5';
    const labelClass = compact
        ? 'text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1'
        : 'text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium';

    return (
        <>
            {fields.map((field) => (
                <div key={field.id}>
                    <label className={labelClass}>
                        {field.field_name}
                        {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {
                        field.field_type === 'text' && (
                            <Input
                                value={values[field.field_key] || ''}
                                onChange={e => onChange(prev => ({ ...prev, [field.field_key]: e.target.value }))}
                                placeholder={field.field_name}
                                className={inputClass}
                            />
                        )
                    }

                    {
                        field.field_type === 'number' && (
                            <Input
                                type="number"
                                value={values[field.field_key] ?? ''}
                                onChange={e => onChange(prev => ({ ...prev, [field.field_key]: e.target.value ? Number(e.target.value) : '' }))}
                                placeholder="0"
                                className={inputClass}
                            />
                        )
                    }

                    {
                        field.field_type === 'date' && (
                            <Input
                                type="date"
                                value={values[field.field_key] || ''}
                                onChange={e => onChange(prev => ({ ...prev, [field.field_key]: e.target.value }))}
                                className={inputClass}
                            />
                        )
                    }

                    {
                        field.field_type === 'boolean' && (
                            <div className={`flex items-center gap-2 ${compact ? 'mt-0.5' : 'mt-1'}`}>
                                <Checkbox
                                    checked={!!values[field.field_key]}
                                    onCheckedChange={(checked) => onChange(prev => ({ ...prev, [field.field_key]: !!checked }))}
                                />
                                <span className={compact ? 'text-xs' : 'text-sm'}>
                                    {values[field.field_key] ? 'Sim' : 'Não'}
                                </span>
                            </div>
                        )
                    }

                    {
                        field.field_type === 'select' && (
                            <Select
                                value={values[field.field_key] || ''}
                                onValueChange={v => onChange(prev => ({ ...prev, [field.field_key]: v }))}
                            >
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {(field.options || []).map((opt) => (
                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )
                    }

                    {
                        field.field_type === 'textarea' && (
                            <Textarea
                                value={values[field.field_key] || ''}
                                onChange={e => onChange(prev => ({ ...prev, [field.field_key]: e.target.value }))}
                                placeholder={field.field_name}
                                className={`${inputClass} min-h-[80px]`}
                            />
                        )
                    }

                    {
                        field.field_type === 'multiselect' && (
                            <div className="flex flex-col gap-2 p-2 border rounded-md bg-transparent mt-0.5">
                                {(field.options || []).map((opt: string) => {
                                    const isChecked = Array.isArray(values[field.field_key]) && values[field.field_key].includes(opt);
                                    return (
                                        <div key={opt} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`${field.field_key}-${opt}`}
                                                checked={isChecked}
                                                onCheckedChange={(checked) => {
                                                    const currentOptions = Array.isArray(values[field.field_key]) ? values[field.field_key] : [];
                                                    const newOptions = checked
                                                        ? [...currentOptions, opt]
                                                        : currentOptions.filter((o: string) => o !== opt);
                                                    onChange(prev => ({ ...prev, [field.field_key]: newOptions }));
                                                }}
                                            />
                                            <label htmlFor={`${field.field_key}-${opt}`} className={compact ? "text-[10px] cursor-pointer" : "text-xs cursor-pointer"}>
                                                {opt}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    }

                    {
                        field.field_type === 'file' && (
                            <div className="mt-0.5">
                                {values[field.field_key] ? (
                                    <div className="flex items-center justify-between p-2 border rounded-md bg-transparent">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileIcon className="h-4 w-4 text-violet-500 shrink-0" />
                                            <a
                                                href={values[field.field_key].url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline truncate max-w-[150px] sm:max-w-[200px]"
                                                title={values[field.field_key].name}
                                            >
                                                {values[field.field_key].name || 'Documento anexado'}
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFile(field.field_key, values[field.field_key].path)}
                                            className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted"
                                            disabled={uploading[field.field_key]}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Input
                                            type="file"
                                            className={`${inputClass} pt-1.5 pb-0 file:mr-2 file:py-0 file:px-2 file:rounded-sm file:border-0 file:text-[10px] file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 dark:file:bg-violet-900/30 dark:file:text-violet-300`}
                                            onChange={(e) => handleFileUpload(e, field.field_key)}
                                            disabled={uploading[field.field_key]}
                                        />
                                        {uploading[field.field_key] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
                                                <span className="text-[10px] font-medium animate-pulse">Enviando...</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    }
                </div >
            ))}
        </>
    );
};

export default CustomFieldInputs;
