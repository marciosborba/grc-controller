import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { 
  X, Eye, FileText, Send, RotateCcw, 
  Star, Upload, Calendar, Clock, Mail, Phone,
  Hash, Link, CheckSquare, Circle, Palette,
  Tag, Users, Zap, Gauge, MessageSquare, Timer,
  CalendarDays, PenTool, AlertCircle, CheckCircle,
  Info, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

// Interfaces
interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  rowId: string;
  rowIndex: number;
  column: number;
  width: number;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    regex?: string;
    customMessage?: string;
  };
}

interface FormRow {
  id: string;
  columns: number;
  height: string;
  columnWidths: string[];
}

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formFields: FormField[];
  formRows: FormRow[];
  processName: string;
  processDescription?: string;
}

const FormPreviewModal: React.FC<FormPreviewModalProps> = ({
  isOpen,
  onClose,
  formFields,
  formRows,
  processName,
  processDescription
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para atualizar dados do formulário
  const updateFormData = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Limpar erro se existir
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  }, [errors]);

  // Função para validar campo
  const validateField = useCallback((field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '' || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} é obrigatório`;
    }

    if (field.validation && value) {
      const { minLength, maxLength, min, max, regex } = field.validation;

      if (minLength && value.toString().length < minLength) {
        return `${field.label} deve ter pelo menos ${minLength} caracteres`;
      }

      if (maxLength && value.toString().length > maxLength) {
        return `${field.label} deve ter no máximo ${maxLength} caracteres`;
      }

      if (min !== undefined && Number(value) < min) {
        return `${field.label} deve ser maior ou igual a ${min}`;
      }

      if (max !== undefined && Number(value) > max) {
        return `${field.label} deve ser menor ou igual a ${max}`;
      }

      if (regex && !new RegExp(regex).test(value.toString())) {
        return field.validation.customMessage || `${field.label} tem formato inválido`;
      }
    }

    return null;
  }, []);

  // Função para validar todo o formulário
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    formFields.forEach(field => {
      const value = formData[field.id];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formFields, formData, validateField]);

  // Função para submeter o formulário (simulação)
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros antes de enviar');
      return;
    }

    setIsSubmitting(true);
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Formulário enviado com sucesso! (Simulação)');
    setIsSubmitting(false);
  }, [validateForm]);

  // Função para limpar formulário
  const handleReset = useCallback(() => {
    setFormData({});
    setErrors({});
    toast.info('Formulário limpo');
  }, []);

  // Função para renderizar campo baseado no tipo
  const renderField = useCallback((field: FormField) => {
    const value = formData[field.id];
    const error = errors[field.id];
    const hasError = !!error;

    const commonProps = {
      id: field.id,
      className: hasError ? 'border-red-500' : '',
    };

    const fieldContent = (() => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'url':
        case 'phone':
          return (
            <Input
              {...commonProps}
              type={field.type}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
            />
          );

        case 'number':
          return (
            <Input
              {...commonProps}
              type="number"
              placeholder={field.placeholder}
              value={value || ''}
              min={field.validation?.min}
              max={field.validation?.max}
              onChange={(e) => updateFormData(field.id, e.target.value)}
            />
          );

        case 'textarea':
          return (
            <Textarea
              {...commonProps}
              placeholder={field.placeholder}
              value={value || ''}
              rows={4}
              onChange={(e) => updateFormData(field.id, e.target.value)}
            />
          );

        case 'select':
        case 'dropdown':
          return (
            <Select value={value || ''} onValueChange={(val) => updateFormData(field.id, val)}>
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || 'Selecione uma opção'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, idx) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'radio':
          return (
            <RadioGroup 
              value={value || ''} 
              onValueChange={(val) => updateFormData(field.id, val)}
              className={hasError ? 'border border-red-500 rounded p-2' : ''}
            >
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}_${idx}`} />
                  <Label htmlFor={`${field.id}_${idx}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          );

        case 'checkbox':
          return (
            <div className={`space-y-2 ${hasError ? 'border border-red-500 rounded p-2' : ''}`}>
              {field.options?.map((option, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}_${idx}`}
                    checked={(value || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      if (checked) {
                        updateFormData(field.id, [...currentValues, option]);
                      } else {
                        updateFormData(field.id, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}_${idx}`}>{option}</Label>
                </div>
              ))}
            </div>
          );

        case 'switch':
          return (
            <div className="flex items-center space-x-2">
              <Switch
                id={field.id}
                checked={value || false}
                onCheckedChange={(checked) => updateFormData(field.id, checked)}
              />
              <Label htmlFor={field.id}>
                {value ? 'Ativado' : 'Desativado'}
              </Label>
            </div>
          );

        case 'date':
          return (
            <Input
              {...commonProps}
              type="date"
              value={value || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
            />
          );

        case 'time':
          return (
            <Input
              {...commonProps}
              type="time"
              value={value || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
            />
          );

        case 'datetime':
          return (
            <Input
              {...commonProps}
              type="datetime-local"
              value={value || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
            />
          );

        case 'file':
        case 'image':
          return (
            <div className="space-y-2">
              <Input
                {...commonProps}
                type="file"
                accept={field.type === 'image' ? 'image/*' : undefined}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    updateFormData(field.id, file.name);
                  }
                }}
              />
              {value && (
                <div className="text-sm text-gray-600">
                  Arquivo selecionado: {value}
                </div>
              )}
            </div>
          );

        case 'rating':
          return (
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 cursor-pointer transition-colors ${
                    star <= (value || 0) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                  onClick={() => updateFormData(field.id, star)}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {value ? `${value}/5` : 'Não avaliado'}
              </span>
            </div>
          );

        case 'slider':
          return (
            <div className="space-y-2">
              <Slider
                value={[value || field.validation?.min || 0]}
                onValueChange={(vals) => updateFormData(field.id, vals[0])}
                min={field.validation?.min || 0}
                max={field.validation?.max || 100}
                step={1}
                className={hasError ? 'border-red-500' : ''}
              />
              <div className="text-sm text-gray-600 text-center">
                Valor: {value || field.validation?.min || 0}
              </div>
            </div>
          );

        case 'color':
          return (
            <div className="flex items-center space-x-2">
              <Input
                {...commonProps}
                type="color"
                value={value || '#000000'}
                onChange={(e) => updateFormData(field.id, e.target.value)}
                className="w-16 h-10"
              />
              <span className="text-sm text-gray-600">
                {value || '#000000'}
              </span>
            </div>
          );

        case 'tags':
          return (
            <div className="space-y-2">
              <Input
                placeholder="Digite e pressione Enter para adicionar tags"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    const newTag = e.currentTarget.value.trim();
                    const currentTags = value || [];
                    if (!currentTags.includes(newTag)) {
                      updateFormData(field.id, [...currentTags, newTag]);
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
              {value && value.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {value.map((tag: string, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => {
                        const newTags = value.filter((_: string, i: number) => i !== idx);
                        updateFormData(field.id, newTags);
                      }}
                    >
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );

        default:
          return (
            <div className="p-4 border border-dashed border-gray-300 rounded text-center text-gray-500">
              Campo tipo "{field.type}" não implementado no preview
            </div>
          );
      }
    })();

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        {fieldContent}
        {error && (
          <div className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    );
  }, [formData, errors, updateFormData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-[95vw] h-[95vh] max-w-6xl flex flex-col">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-gradient-to-br from-green-500 via-blue-600 to-purple-700 rounded-xl shadow-lg">
              <Eye className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Preview do Formulário
              </h1>
              <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {processName}
              </h2>
              {processDescription && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {processDescription}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
              Preview Interativo
            </Badge>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {formFields.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Nenhum campo para visualizar</h3>
                <p className="text-gray-600">
                  Adicione campos no Form Builder para ver o preview do formulário
                </p>
              </div>
            </div>
          ) : (
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  {processName}
                </CardTitle>
                {processDescription && (
                  <p className="text-gray-600">{processDescription}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formFields.length} campo{formFields.length !== 1 ? 's' : ''}</span>
                  <span>{formRows.length} linha{formRows.length !== 1 ? 's' : ''}</span>
                  <span>{formFields.filter(f => f.required).length} obrigatório{formFields.filter(f => f.required).length !== 1 ? 's' : ''}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Renderizar formulário baseado nas linhas */}
                {formRows.map((row, rowIndex) => {
                  const rowFields = formFields
                    .filter(field => field.rowId === row.id)
                    .sort((a, b) => a.column - b.column);

                  if (rowFields.length === 0) return null;

                  return (
                    <div key={row.id} className="space-y-4">
                      <div 
                        className={`grid gap-4 ${
                          row.height === 'small' ? 'min-h-12' :
                          row.height === 'medium' ? 'min-h-20' :
                          row.height === 'large' ? 'min-h-32' :
                          row.height === 'xl' ? 'min-h-48' :
                          'min-h-16'
                        }`}
                        style={{ gridTemplateColumns: row.columnWidths.join(' ') }}
                      >
                        {Array.from({ length: row.columns }, (_, columnIndex) => {
                          const columnFields = rowFields.filter(field => field.column === columnIndex);
                          
                          return (
                            <div key={`${row.id}-${columnIndex}`} className="space-y-4">
                              {columnFields.map(field => renderField(field))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer com ações */}
        {formFields.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{Object.keys(formData).length} campo{Object.keys(formData).length !== 1 ? 's' : ''} preenchido{Object.keys(formData).length !== 1 ? 's' : ''}</span>
              </div>
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{Object.keys(errors).length} erro{Object.keys(errors).length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                disabled={Object.keys(formData).length === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
              
              <Button 
                size="sm" 
                onClick={handleSubmit}
                disabled={isSubmitting || formFields.filter(f => f.required).some(f => !formData[f.id])}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Testar Envio
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPreviewModal;