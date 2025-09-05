import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Upload, 
  Star, 
  Shield, 
  AlertCircle, 
  Info,
  Eye,
  EyeOff,
  FileText,
  Link,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';

import { 
  CustomFieldDefinition, 
  ValidationRule,
  ComplianceProcessTemplate
} from '@/types/compliance-process-templates';

interface DynamicFieldRendererProps {
  field: CustomFieldDefinition;
  value: any;
  onChange: (value: any) => void;
  onValidate?: (errors: string[]) => void;
  errors?: string[];
  readonly?: boolean;
  securityConfig?: ComplianceProcessTemplate['security_config'];
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  onValidate,
  errors = [],
  readonly = false,
  securityConfig
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>(errors);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Update external errors
  useEffect(() => {
    setValidationErrors(errors);
  }, [errors]);

  // Validate field value
  const validateField = (fieldValue: any): string[] => {
    const errors: string[] = [];

    // Required field validation
    if (field.required && (fieldValue === undefined || fieldValue === null || fieldValue === '')) {
      errors.push('Este campo é obrigatório');
    }

    // Run custom validations
    if (field.validations && fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
      field.validations.forEach(rule => {
        const error = validateRule(rule, fieldValue, field);
        if (error) {
          errors.push(error);
        }
      });
    }

    return errors;
  };

  // Validate individual rule
  const validateRule = (rule: ValidationRule, value: any, field: CustomFieldDefinition): string | null => {
    switch (rule.type) {
      case 'min_length':
        if (typeof value === 'string' && value.length < rule.value) {
          return `Mínimo de ${rule.value} caracteres`;
        }
        break;

      case 'max_length':
        if (typeof value === 'string' && value.length > rule.value) {
          return `Máximo de ${rule.value} caracteres`;
        }
        break;

      case 'min_value':
        if (typeof value === 'number' && value < rule.value) {
          return `Valor mínimo: ${rule.value}`;
        }
        break;

      case 'max_value':
        if (typeof value === 'number' && value > rule.value) {
          return `Valor máximo: ${rule.value}`;
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          return rule.message || 'Formato inválido';
        }
        break;

      case 'email':
        if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email inválido';
        }
        break;

      case 'url':
        if (typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            return 'URL inválida';
          }
        }
        break;

      case 'custom':
        // Custom validation logic would go here
        break;
    }

    return null;
  };

  // Handle value change
  const handleChange = (newValue: any) => {
    setInternalValue(newValue);
    onChange(newValue);

    // Validate on change
    const errors = validateField(newValue);
    setValidationErrors(errors);
    onValidate?.(errors);
  };

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (example: 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    // For demo purposes, we'll store file info
    // In production, you'd upload to storage and store URL/reference
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };

    handleChange(fileInfo);
    toast.success('Arquivo anexado com sucesso');
  };

  // Render maturity rating
  const renderMaturityRating = () => {
    const levels = [
      { value: 1, label: 'Inexistente', color: 'bg-red-100 text-red-700' },
      { value: 2, label: 'Inicial', color: 'bg-orange-100 text-orange-700' },
      { value: 3, label: 'Repetível', color: 'bg-yellow-100 text-yellow-700' },
      { value: 4, label: 'Definido', color: 'bg-blue-100 text-blue-700' },
      { value: 5, label: 'Gerenciado', color: 'bg-green-100 text-green-700' }
    ];

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {levels.map(level => (
            <button
              key={level.value}
              type="button"
              onClick={() => !readonly && handleChange(level.value)}
              disabled={readonly}
              className={`p-3 text-center rounded-lg border transition-all ${
                internalValue === level.value
                  ? `${level.color} border-current`
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              } ${readonly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            >
              <div className="font-semibold">{level.value}</div>
              <div className="text-xs mt-1">{level.label}</div>
            </button>
          ))}
        </div>
        <div className="flex justify-center space-x-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star 
              key={star} 
              className={`h-5 w-5 ${
                star <= (internalValue || 0) 
                  ? 'text-yellow-500 fill-current' 
                  : 'text-gray-300'
              }`} 
            />
          ))}
        </div>
      </div>
    );
  };

  // Render field based on type
  const renderFieldInput = () => {
    const commonProps = {
      disabled: readonly,
      className: validationErrors.length > 0 ? 'border-red-300' : undefined
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={internalValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={internalValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.options?.rows || 4}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={internalValue || ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={field.placeholder}
            min={field.options?.min}
            max={field.options?.max}
            step={field.options?.step}
            {...commonProps}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={internalValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            {...commonProps}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              type={showSensitiveData ? 'text' : 'password'}
              value={internalValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              {...commonProps}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
            >
              {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        );

      case 'url':
        return (
          <div className="flex">
            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
              <Link className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              type="url"
              value={internalValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder || 'https://'}
              className="rounded-l-none"
              {...commonProps}
            />
          </div>
        );

      case 'date':
        return (
          <div className="flex">
            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              type="date"
              value={internalValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="rounded-l-none"
              {...commonProps}
            />
          </div>
        );

      case 'datetime':
        return (
          <div className="flex">
            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
            <Input
              type="datetime-local"
              value={internalValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              className="rounded-l-none"
              {...commonProps}
            />
          </div>
        );

      case 'select':
        return (
          <Select 
            value={internalValue || ''} 
            onValueChange={handleChange}
            disabled={readonly}
          >
            <SelectTrigger className={validationErrors.length > 0 ? 'border-red-300' : undefined}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.choices?.map(choice => (
                <SelectItem key={choice.value} value={choice.value}>
                  {choice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(internalValue) ? internalValue : [];
        return (
          <div className="space-y-2">
            {field.options?.choices?.map(choice => (
              <div key={choice.value} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedValues.includes(choice.value)}
                  onCheckedChange={(checked) => {
                    if (readonly) return;
                    const newValues = checked
                      ? [...selectedValues, choice.value]
                      : selectedValues.filter(v => v !== choice.value);
                    handleChange(newValues);
                  }}
                  disabled={readonly}
                />
                <Label className="text-sm">{choice.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={internalValue || ''}
            onValueChange={handleChange}
            disabled={readonly}
          >
            {field.options?.choices?.map(choice => (
              <div key={choice.value} className="flex items-center space-x-2">
                <RadioGroupItem value={choice.value} disabled={readonly} />
                <Label className="text-sm">{choice.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={internalValue || false}
              onCheckedChange={handleChange}
              disabled={readonly}
            />
            <Label className="text-sm">{field.options?.label || 'Sim/Não'}</Label>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <Input
              type="file"
              onChange={handleFileUpload}
              accept={field.options?.accept}
              disabled={readonly}
              {...commonProps}
            />
            {internalValue && typeof internalValue === 'object' && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{internalValue.name}</span>
                <Badge variant="outline" className="text-xs">
                  {(internalValue.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
            )}
          </div>
        );

      case 'maturity_rating':
        return renderMaturityRating();

      case 'evidence_upload':
        return (
          <div className="space-y-3">
            <Input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              disabled={readonly}
              multiple
              {...commonProps}
            />
            <div className="text-xs text-muted-foreground">
              Formatos aceitos: PDF, DOC, DOCX, JPG, PNG • Máximo 10MB por arquivo
            </div>
          </div>
        );

      case 'risk_rating':
        const riskLevels = [
          { value: 'low', label: 'Baixo', color: 'bg-green-100 text-green-700' },
          { value: 'medium', label: 'Médio', color: 'bg-yellow-100 text-yellow-700' },
          { value: 'high', label: 'Alto', color: 'bg-orange-100 text-orange-700' },
          { value: 'critical', label: 'Crítico', color: 'bg-red-100 text-red-700' }
        ];

        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {riskLevels.map(level => (
              <button
                key={level.value}
                type="button"
                onClick={() => !readonly && handleChange(level.value)}
                disabled={readonly}
                className={`p-3 text-center rounded-lg border transition-all ${
                  internalValue === level.value
                    ? `${level.color} border-current`
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                } ${readonly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <div className="font-semibold text-sm">{level.label}</div>
              </button>
            ))}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 rounded text-center text-muted-foreground">
            Tipo de campo não suportado: {field.type}
          </div>
        );
    }
  };

  const showFieldDescription = field.description && field.description.length > 0;
  const showFieldHelp = field.help_text && field.help_text.length > 0;
  const isSensitiveField = field.sensitive && securityConfig?.encryption_required;

  return (
    <Card className={`${validationErrors.length > 0 ? 'border-red-200' : ''}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Field Label */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label className="text-base font-medium">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {isSensitiveField && (
                <Badge variant="outline" className="text-xs bg-yellow-50">
                  <Shield className="h-3 w-3 mr-1" />
                  Sensível
                </Badge>
              )}
            </div>
            {field.options?.id && (
              <Badge variant="outline" className="text-xs">
                <Hash className="h-3 w-3 mr-1" />
                {field.id}
              </Badge>
            )}
          </div>

          {/* Field Description */}
          {showFieldDescription && (
            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">{field.description}</p>
            </div>
          )}

          {/* Field Input */}
          <div>
            {renderFieldInput()}
          </div>

          {/* Field Help */}
          {showFieldHelp && (
            <p className="text-xs text-muted-foreground">{field.help_text}</p>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};