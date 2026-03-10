import { z } from 'zod';

// Esquemas de validação para entradas do usuário
export const loginSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório')
    .max(255, 'Email muito longo'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/, 
      'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')
});

export const userProfileSchema = z.object({
  full_name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  job_title: z.string()
    .min(1, 'Cargo é obrigatório')
    .max(100, 'Cargo muito longo'),
  department: z.string()
    .max(100, 'Departamento muito longo')
    .optional(),
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional()
    .or(z.literal(''))
});

export const riskAssessmentSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título muito longo'),
  description: z.string()
    .max(1000, 'Descrição muito longa')
    .optional(),
  risk_category: z.enum([
    'Cybersecurity', 'Data Privacy', 'Operational', 'Financial', 
    'Regulatory', 'Technology', 'Human Resources', 'Ethics'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  probability: z.enum(['low', 'medium', 'high']),
  impact_score: z.number().min(1).max(5),
  likelihood_score: z.number().min(1).max(5),
  due_date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }, 'Data inválida')
});

export const policySchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título muito longo'),
  description: z.string()
    .max(1000, 'Descrição muito longa')
    .optional(),
  category: z.enum(['Security', 'Privacy', 'Ethics', 'IT', 'HR', 'Finance']),
  version: z.string()
    .regex(/^\d+\.\d+$/, 'Versão deve estar no formato X.Y'),
  effective_date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }, 'Data inválida'),
  review_date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }, 'Data inválida'),
  document_type: z.enum(['Policy', 'Procedure', 'Standard', 'Guideline', 'Code']).optional(),
  document_url: z.string().url('URL inválida').optional().or(z.literal(''))
});

export const securityIncidentSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título muito longo'),
  description: z.string()
    .max(2000, 'Descrição muito longa')
    .optional(),
  incident_type: z.enum([
    'phishing', 'malware', 'unauthorized_access', 'data_breach', 
    'ddos', 'social_engineering', 'insider_threat', 'physical_security'
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  affected_systems: z.string()
    .max(500, 'Sistemas afetados muito longo')
    .optional(),
  detection_date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }, 'Data de detecção inválida')
});

export const ethicsReportSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título muito longo'),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição muito longa'),
  category: z.enum([
    'harassment', 'discrimination', 'conflict_of_interest', 
    'fraud', 'corruption', 'insider_trading', 'safety_violation'
  ]),
  severity: z.enum(['low', 'medium', 'high']),
  is_anonymous: z.boolean(),
  reporter_name: z.string()
    .max(100, 'Nome muito longo')
    .optional(),
  reporter_email: z.string()
    .email('Email inválido')
    .optional(),
  reporter_phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (XX) XXXXX-XXXX')
    .optional()
});

// Função utilitária para validar dados
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
};

// Função de sanitização para prevenir XSS
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove caracteres HTML básicos
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000); // Limita tamanho
};

// Função para sanitizar objetos
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' ? sanitizeObject(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};