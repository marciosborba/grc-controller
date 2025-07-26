// =====================================================
// UTILITÁRIOS DE LIMPEZA E SEGURANÇA DE AUTENTICAÇÃO
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js';

// Função para limpar estado de autenticação
export const cleanupAuthState = (): void => {
  try {
    // Limpar localStorage
    const keysToRemove = [
      'supabase.auth.token',
      'sb-auth-token',
      'user-session',
      'auth-state'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpar sessionStorage
    sessionStorage.clear();
  } catch (error) {
    console.warn('Erro ao limpar estado de autenticação:', error);
  }
};

// Função para logout seguro
export const performSecureSignOut = async (supabase: SupabaseClient): Promise<boolean> => {
  try {
    // Fazer logout no Supabase
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Erro no logout do Supabase:', error);
    }

    // Limpar estado local
    cleanupAuthState();

    return true;
  } catch (error) {
    console.error('Erro no logout seguro:', error);
    return false;
  }
};

// Validação de formato de email
export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de senha
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Sanitização de input
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove caracteres perigosos
    .substring(0, 255); // Limita tamanho
};

// Log de eventos de autenticação
export const logAuthEvent = async (
  event: string, 
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    // Em produção, enviar para serviço de logging
    console.log(`Auth Event: ${event}`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  } catch (error) {
    console.error('Erro ao registrar evento de auth:', error);
  }
};

// Log de atividade suspeita
export const logSuspiciousActivity = async (
  activity: string,
  details: Record<string, any> = {}
): Promise<void> => {
  try {
    console.warn(`Suspicious Activity: ${activity}`, {
      timestamp: new Date().toISOString(),
      severity: 'warning',
      ...details
    });
    
    // Em produção, alertar equipe de segurança
  } catch (error) {
    console.error('Erro ao registrar atividade suspeita:', error);
  }
};