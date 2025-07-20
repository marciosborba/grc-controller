
import { useState, useCallback } from 'react';
import { sanitizeInput } from '@/utils/authCleanup';
import { logSuspiciousActivity } from '@/utils/securityLogger';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface UseSecureInputOptions {
  initialValue?: string;
  validation?: ValidationRule;
  sanitize?: boolean;
}

export const useSecureInput = (options: UseSecureInputOptions = {}) => {
  const { initialValue = '', validation = {}, sanitize = true } = options;
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);

  const validate = useCallback((inputValue: string): string => {
    const rules = validation;
    
    // Required validation
    if (rules.required && !inputValue.trim()) {
      return 'Este campo é obrigatório';
    }
    
    // Length validations
    if (rules.minLength && inputValue.length < rules.minLength) {
      return `Mínimo ${rules.minLength} caracteres`;
    }
    
    if (rules.maxLength && inputValue.length > rules.maxLength) {
      return `Máximo ${rules.maxLength} caracteres`;
    }
    
    // Pattern validation
    if (rules.pattern && inputValue && !rules.pattern.test(inputValue)) {
      return 'Formato inválido';
    }
    
    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(inputValue);
      if (customError) return customError;
    }
    
    return '';
  }, [validation]);

  const handleChange = useCallback((newValue: string) => {
    setIsDirty(true);
    
    // Sanitize input if enabled
    const processedValue = sanitize ? sanitizeInput(newValue, validation.maxLength) : newValue;
    
    // Check for suspicious patterns
    if (sanitize && newValue !== processedValue) {
      logSuspiciousActivity('input_sanitization', {
        original: newValue,
        sanitized: processedValue,
        field: 'secure_input'
      });
    }
    
    setValue(processedValue);
    
    // Validate
    const validationError = validate(processedValue);
    setError(validationError);
  }, [sanitize, validation.maxLength, validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setIsDirty(false);
  }, [initialValue]);

  const isValid = !error && (isDirty || initialValue);

  return {
    value,
    error,
    isDirty,
    isValid,
    onChange: handleChange,
    reset,
    validate: () => validate(value)
  };
};

// Predefined validation rules for common use cases
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 128,
    custom: (value: string) => {
      if (!/[A-Za-z]/.test(value)) return 'Deve conter pelo menos uma letra';
      if (!/[0-9]/.test(value)) return 'Deve conter pelo menos um número';
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/
  },
  phone: {
    pattern: /^[\d\s\(\)\-\+]+$/,
    minLength: 10,
    maxLength: 20
  }
};
