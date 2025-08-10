/**
 * Utilitários para manipulação de dados de usuário
 */

export interface UserDisplayInfo {
  firstName: string;
  fullName: string;
  initials: string;
}

/**
 * Extrai o primeiro nome de um nome completo
 */
export const getUserFirstName = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }
  
  return fullName.trim().split(' ')[0] || '';
};

/**
 * Gera as iniciais do usuário (máximo 2 caracteres)
 */
export const getUserInitials = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') {
    return 'U';
  }

  // Se é um email, usa a parte antes do @
  if (fullName.includes('@')) {
    const emailPart = fullName.split('@')[0];
    return emailPart.charAt(0).toUpperCase();
  }

  const names = fullName.trim().split(' ').filter(name => name.length > 0);
  
  if (names.length === 0) {
    return 'U';
  }
  
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Obtém informações de exibição completas do usuário
 */
export const getUserDisplayInfo = (fullName: string): UserDisplayInfo => {
  const firstName = getUserFirstName(fullName);
  const initials = getUserInitials(fullName);

  return {
    firstName,
    fullName: fullName?.trim() || '',
    initials
  };
};

/**
 * Valida se um nome completo é válido
 */
export const isValidFullName = (fullName: string): boolean => {
  if (!fullName || typeof fullName !== 'string') {
    return false;
  }

  const trimmed = fullName.trim();
  return trimmed.length >= 2 && /^[a-zA-ZÀ-ÿ\u0100-\u017F\s'.-]+$/.test(trimmed);
};

/**
 * Formata um nome para exibição (capitaliza primeira letra de cada palavra)
 */
export const formatDisplayName = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }

  return fullName
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Gera um nome de usuário sugerido baseado no nome completo
 */
export const generateSuggestedUsername = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }

  const names = fullName.trim().toLowerCase().split(' ').filter(name => name.length > 0);
  
  if (names.length === 1) {
    return names[0];
  }
  
  // Primeiro nome + primeira letra do último sobrenome
  return names[0] + names[names.length - 1].charAt(0);
};

/**
 * Obtém o nome de exibição do usuário (primeiro nome ou parte do email se for email)
 */
export const getUserDisplayName = (name?: string, email?: string): string => {
  if (!name) {
    return email?.split('@')[0] || 'Usuário';
  }
  
  // Se name contém @, é provavelmente um email usado como fallback
  if (name.includes('@')) {
    return email?.split('@')[0] || name.split('@')[0];
  }
  
  // Se é um nome real, retorna o primeiro nome
  return getUserFirstName(name);
};