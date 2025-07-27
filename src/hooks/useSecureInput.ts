import { useState, useCallback } from 'react';

// Export validation rules for compatibility
export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    required: true
  },
  password: {
    minLength: 8,
    required: true
  },
  name: {
    minLength: 2,
    required: true
  },
  required: {
    required: true
  }
};

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

// Função simplificada de sanitização
const sanitizeInput = (input: string): string => {
  // Remove caracteres perigosos básicos
  return input.replace(/[<>]/g, '');
};

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

    // Length validation
    if (rules.minLength && inputValue.length < rules.minLength) {
      return `Mínimo de ${rules.minLength} caracteres`;
    }

    if (rules.maxLength && inputValue.length > rules.maxLength) {
      return `Máximo de ${rules.maxLength} caracteres`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(inputValue)) {
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
    const processedValue = sanitize ? sanitizeInput(newValue) : newValue;
    setValue(processedValue);
    setIsDirty(true);

    const validationError = validate(processedValue);
    setError(validationError);

    // Log suspicious activity se necessário (temporariamente desabilitado)
    if (processedValue !== newValue) {
      console.warn('Input sanitizado:', { original: newValue, sanitized: processedValue });
    }
  }, [sanitize, validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError('');
    setIsDirty(false);
  }, [initialValue]);

  const isValid = !error && isDirty;

  return {
    value,
    error,
    isDirty,
    isValid,
    setValue: handleChange,
    onChange: handleChange, // Alias para compatibilidade
    reset,
    validate: () => validate(value)
  };
};