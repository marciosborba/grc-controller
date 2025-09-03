import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  job_title?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  tenant_id?: string;
}

interface UserRole {
  role: 'admin' | 'ciso' | 'risk_manager' | 'compliance_officer' | 'auditor' | 'user';
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  max_users: number;
  current_users_count: number;
  subscription_plan: string;
  is_active: boolean;
  settings?: Record<string, any>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  jobTitle?: string;
  tenantId: string;
  tenant?: Tenant;
  roles: string[];
  permissions: string[];
  isPlatformAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, jobTitle?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache super otimizado para startup rápido
const authCache = new Map<string, { user: AuthUser, timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos para auth
const STARTUP_TIMEOUT = 1000; // 1 segundo timeout para startup

// Funções utilitárias minimalistas
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.trim().substring(0, 255);
};

const validateEmailFormat = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const AuthProviderOptimized: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cache otimizado para startup
  const getCachedUser = useCallback((userId: string) => {
    const cached = authCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.user;
    }
    return null;
  }, []);

  const setCachedUser = useCallback((userId: string, userData: AuthUser) => {
    authCache.set(userId, { user: userData, timestamp: Date.now() });
  }, []);

  // Função otimizada para carregar dados do usuário (com timeout)
  const loadUserData = useCallback(async (supabaseUser: User): Promise<AuthUser | null> => {
    try {
      // Verificar cache primeiro
      const cachedUser = getCachedUser(supabaseUser.id);
      if (cachedUser) {
        return cachedUser;
      }

      // Promise com timeout para evitar travamento
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), STARTUP_TIMEOUT);
      });

      const dataPromise = Promise.all([
        supabase.from('profiles').select('*').eq('user_id', supabaseUser.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', supabaseUser.id)
      ]);

      const [profileResult, rolesResult] = await Promise.race([dataPromise, timeoutPromise]);

      const profile = profileResult?.data;
      const roles = rolesResult?.data || [];

      // Criar usuário com dados mínimos se timeout ou erro
      const userData: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
        jobTitle: profile?.job_title,
        tenantId: profile?.tenant_id || 'default',
        roles: roles.length > 0 ? roles.map((r: any) => r.role) : ['user'],
        permissions: [], // Carregado assincronamente depois
        isPlatformAdmin: roles.some((r: any) => r.role === 'admin')
      };

      // Cache o resultado
      setCachedUser(supabaseUser.id, userData);
      return userData;

    } catch (error) {
      console.warn('Auth loading timeout, usando dados básicos:', error);
      
      // Fallback para dados básicos em caso de timeout
      const basicUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'Usuário',
        tenantId: 'default',
        roles: ['user'],
        permissions: [],
        isPlatformAdmin: false
      };

      return basicUser;
    }
  }, [getCachedUser, setCachedUser]);

  // Handler otimizado para mudanças de auth
  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    console.log('🔐 Auth event:', event);
    
    setSession(session);

    if (event === 'SIGNED_OUT' || !session) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      try {
        setIsLoading(true);
        const userData = await loadUserData(session.user);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
  }, [loadUserData]);

  // Setup inicial otimizado
  useEffect(() => {
    let mounted = true;
    
    // Verificar sessão existente
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.warn('Erro ao recuperar sessão:', error);
          setIsLoading(false);
          return;
        }

        if (currentSession) {
          await handleAuthChange('SIGNED_IN', currentSession);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro na inicialização do auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  // Login otimizado
  const login = useCallback(async (email: string, password: string) => {
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    if (!validateEmailFormat(cleanEmail)) {
      throw new Error('Formato de email inválido');
    }

    if (cleanPassword.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  // Logout otimizado
  const logout = useCallback(async () => {
    // Limpar cache
    authCache.clear();
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro no logout:', error);
      throw new Error('Erro ao fazer logout');
    }
  }, []);

  // Signup otimizado
  const signup = useCallback(async (email: string, password: string, fullName: string, jobTitle?: string) => {
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);
    const cleanFullName = sanitizeInput(fullName);
    const cleanJobTitle = jobTitle ? sanitizeInput(jobTitle) : undefined;

    if (!validateEmailFormat(cleanEmail)) {
      throw new Error('Formato de email inválido');
    }

    if (cleanPassword.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    if (!cleanFullName) {
      throw new Error('Nome completo é obrigatório');
    }

    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          full_name: cleanFullName,
          job_title: cleanJobTitle,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};