import { 
  ComplianceProcessTemplate, 
  ProcessSubmissionData, 
  CustomFieldDefinition,
  ValidationRule
} from '@/types/compliance-process-templates';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  errorCount: number;
  warnings: Record<string, string[]>;
  warningCount: number;
}

interface FieldValidationResult {
  fieldId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ProcessValidationEngine {
  /**
   * Validate complete process submission
   */
  static validateSubmission(
    template: ComplianceProcessTemplate, 
    submission: ProcessSubmissionData
  ): ValidationResult {
    const results: ValidationResult = {
      isValid: true,
      errors: {},
      errorCount: 0,
      warnings: {},
      warningCount: 0
    };

    // Validate each field
    template.field_definitions.fields.forEach(field => {
      const fieldResult = this.validateField(field, submission.field_values[field.id]);
      
      if (!fieldResult.isValid) {
        results.isValid = false;
        results.errors[field.id] = fieldResult.errors;
        results.errorCount += fieldResult.errors.length;
      }

      if (fieldResult.warnings.length > 0) {
        results.warnings[field.id] = fieldResult.warnings;
        results.warningCount += fieldResult.warnings.length;
      }
    });

    // Validate workflow state
    const workflowValidation = this.validateWorkflowState(template, submission);
    if (!workflowValidation.isValid) {
      results.isValid = false;
      results.errors['workflow'] = workflowValidation.errors;
      results.errorCount += workflowValidation.errors.length;
    }

    // Validate security requirements
    const securityValidation = this.validateSecurityRequirements(template, submission);
    if (!securityValidation.isValid) {
      results.isValid = false;
      results.errors['security'] = securityValidation.errors;
      results.errorCount += securityValidation.errors.length;
    }

    return results;
  }

  /**
   * Validate individual field
   */
  static validateField(field: CustomFieldDefinition, value: any): FieldValidationResult {
    const result: FieldValidationResult = {
      fieldId: field.id,
      isValid: true,
      errors: [],
      warnings: []
    };

    // Required field validation
    if (field.required) {
      if (this.isEmpty(value)) {
        result.isValid = false;
        result.errors.push(`${field.label} é obrigatório`);
      }
    }

    // Skip other validations if field is empty and not required
    if (this.isEmpty(value) && !field.required) {
      return result;
    }

    // Type-specific validation
    const typeValidation = this.validateFieldType(field, value);
    if (!typeValidation.isValid) {
      result.isValid = false;
      result.errors.push(...typeValidation.errors);
    }
    result.warnings.push(...typeValidation.warnings);

    // Custom validations
    if (field.validations) {
      field.validations.forEach(validation => {
        const validationResult = this.validateRule(validation, value, field);
        if (!validationResult.isValid) {
          result.isValid = false;
          result.errors.push(...validationResult.errors);
        }
        result.warnings.push(...validationResult.warnings);
      });
    }

    // Security validation for sensitive fields
    if (field.sensitive) {
      const securityValidation = this.validateSensitiveField(field, value);
      if (!securityValidation.isValid) {
        result.isValid = false;
        result.errors.push(...securityValidation.errors);
      }
      result.warnings.push(...securityValidation.warnings);
    }

    return result;
  }

  /**
   * Validate field type constraints
   */
  private static validateFieldType(field: CustomFieldDefinition, value: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = { isValid: true, errors: [], warnings: [] };

    switch (field.type) {
      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          result.isValid = false;
          result.errors.push('Valor deve ser texto');
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          result.isValid = false;
          result.errors.push('Valor deve ser numérico');
        }
        break;

      case 'email':
        if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          result.isValid = false;
          result.errors.push('Email inválido');
        }
        break;

      case 'url':
        if (typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            result.isValid = false;
            result.errors.push('URL inválida');
          }
        }
        break;

      case 'date':
      case 'datetime':
        if (typeof value === 'string' && isNaN(Date.parse(value))) {
          result.isValid = false;
          result.errors.push('Data inválida');
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          result.isValid = false;
          result.errors.push('Valor deve ser verdadeiro ou falso');
        }
        break;

      case 'select':
        if (field.options?.choices) {
          const validValues = field.options.choices.map(choice => choice.value);
          if (!validValues.includes(value)) {
            result.isValid = false;
            result.errors.push('Valor selecionado não é válido');
          }
        }
        break;

      case 'multiselect':
        if (!Array.isArray(value)) {
          result.isValid = false;
          result.errors.push('Deve ser uma lista de valores');
        } else if (field.options?.choices) {
          const validValues = field.options.choices.map(choice => choice.value);
          const invalidValues = value.filter(v => !validValues.includes(v));
          if (invalidValues.length > 0) {
            result.isValid = false;
            result.errors.push(`Valores inválidos: ${invalidValues.join(', ')}`);
          }
        }
        break;

      case 'maturity_rating':
        if (typeof value !== 'number' || value < 1 || value > 5 || !Number.isInteger(value)) {
          result.isValid = false;
          result.errors.push('Nível de maturidade deve ser um número inteiro entre 1 e 5');
        }
        break;

      case 'risk_rating':
        const validRiskLevels = ['low', 'medium', 'high', 'critical'];
        if (!validRiskLevels.includes(value)) {
          result.isValid = false;
          result.errors.push('Nível de risco inválido');
        }
        break;

      case 'file':
      case 'evidence_upload':
        if (value && typeof value === 'object') {
          if (!value.name || !value.size) {
            result.isValid = false;
            result.errors.push('Arquivo inválido');
          } else if (value.size > 10 * 1024 * 1024) { // 10MB limit
            result.isValid = false;
            result.errors.push('Arquivo muito grande (máximo 10MB)');
          }
        }
        break;
    }

    return result;
  }

  /**
   * Validate custom validation rule
   */
  private static validateRule(rule: ValidationRule, value: any, field: CustomFieldDefinition): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = { isValid: true, errors: [], warnings: [] };

    switch (rule.type) {
      case 'min_length':
        if (typeof value === 'string' && value.length < rule.value) {
          result.isValid = false;
          result.errors.push(`${field.label} deve ter pelo menos ${rule.value} caracteres`);
        }
        break;

      case 'max_length':
        if (typeof value === 'string' && value.length > rule.value) {
          result.isValid = false;
          result.errors.push(`${field.label} deve ter no máximo ${rule.value} caracteres`);
        }
        break;

      case 'min_value':
        if (typeof value === 'number' && value < rule.value) {
          result.isValid = false;
          result.errors.push(`${field.label} deve ser pelo menos ${rule.value}`);
        }
        break;

      case 'max_value':
        if (typeof value === 'number' && value > rule.value) {
          result.isValid = false;
          result.errors.push(`${field.label} deve ser no máximo ${rule.value}`);
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
          result.isValid = false;
          result.errors.push(rule.message || `${field.label} não atende ao formato exigido`);
        }
        break;

      case 'email':
        if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          result.isValid = false;
          result.errors.push('Email inválido');
        }
        break;

      case 'url':
        if (typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            result.isValid = false;
            result.errors.push('URL inválida');
          }
        }
        break;

      case 'custom':
        // Custom validation logic would be implemented here
        // For now, we'll just log a warning
        result.warnings.push('Validação customizada não implementada');
        break;
    }

    return result;
  }

  /**
   * Validate workflow state
   */
  private static validateWorkflowState(
    template: ComplianceProcessTemplate, 
    submission: ProcessSubmissionData
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if current state exists
    const currentState = template.workflow_definition.states.find(
      s => s.id === submission.workflow_state
    );

    if (!currentState) {
      errors.push('Estado do workflow inválido');
    } else {
      // Check if all required fields for current state are filled
      if (currentState.required_fields) {
        const missingFields = currentState.required_fields.filter(
          fieldId => this.isEmpty(submission.field_values[fieldId])
        );

        if (missingFields.length > 0) {
          const fieldNames = missingFields.map(fieldId => {
            const field = template.field_definitions.fields.find(f => f.id === fieldId);
            return field?.label || fieldId;
          }).join(', ');
          errors.push(`Campos obrigatórios não preenchidos para este estado: ${fieldNames}`);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate security requirements
   */
  private static validateSecurityRequirements(
    template: ComplianceProcessTemplate, 
    submission: ProcessSubmissionData
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const securityConfig = template.security_config;

    // Check sensitive data handling
    if (securityConfig.encryption_required) {
      const sensitiveFields = template.field_definitions.fields.filter(f => f.sensitive);
      sensitiveFields.forEach(field => {
        const value = submission.field_values[field.id];
        if (!this.isEmpty(value)) {
          // In a real implementation, you would check if the data is properly encrypted
          // For now, we'll just ensure sensitive fields are marked appropriately
          if (field.type === 'password' || field.type === 'text') {
            // Add warning for sensitive data
          }
        }
      });
    }

    // Check access level requirements
    if (securityConfig.access_level === 'restricted' || securityConfig.access_level === 'top_secret') {
      // Additional security validations for high-security templates
      if (!submission.metadata.created_at) {
        errors.push('Metadados de auditoria obrigatórios para este nível de segurança');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate sensitive field data
   */
  private static validateSensitiveField(field: CustomFieldDefinition, value: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = { isValid: true, errors: [], warnings: [] };

    if (!this.isEmpty(value)) {
      // Check for potential PII patterns
      if (typeof value === 'string') {
        // CPF pattern (Brazilian)
        if (/\d{3}\.\d{3}\.\d{3}-\d{2}/.test(value)) {
          result.warnings.push('Possível CPF detectado - verifique se a criptografia está habilitada');
        }

        // Credit card pattern
        if (/\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/.test(value)) {
          result.warnings.push('Possível cartão de crédito detectado - verifique se a criptografia está habilitada');
        }

        // Phone pattern
        if (/\(\d{2}\)\s?\d{4,5}-?\d{4}/.test(value)) {
          result.warnings.push('Possível telefone detectado - dados pessoais devem ser protegidos');
        }
      }
    }

    return result;
  }

  /**
   * Check if value is empty
   */
  private static isEmpty(value: any): boolean {
    return value === undefined || 
           value === null || 
           value === '' || 
           (Array.isArray(value) && value.length === 0) ||
           (typeof value === 'object' && Object.keys(value).length === 0);
  }

  /**
   * Get field validation summary
   */
  static getValidationSummary(template: ComplianceProcessTemplate, submission: ProcessSubmissionData): {
    totalFields: number;
    validatedFields: number;
    requiredFields: number;
    completedRequiredFields: number;
    errorFields: number;
    warningFields: number;
  } {
    const validation = this.validateSubmission(template, submission);
    
    return {
      totalFields: template.field_definitions.fields.length,
      validatedFields: template.field_definitions.fields.filter(f => !this.isEmpty(submission.field_values[f.id])).length,
      requiredFields: template.field_definitions.fields.filter(f => f.required).length,
      completedRequiredFields: template.field_definitions.fields.filter(f => f.required && !this.isEmpty(submission.field_values[f.id])).length,
      errorFields: Object.keys(validation.errors).length,
      warningFields: Object.keys(validation.warnings).length
    };
  }
}

export default ProcessValidationEngine;