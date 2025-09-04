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
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache super otimizado para startup rápido
const authCache = new Map<string, { user: AuthUser, timestamp: number }>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos para auth
const STARTUP_TIMEOUT = 10000; // 10 segundos timeout para startup
const AUTH_TIMEOUT = 15000; // 15 segundos timeout para auth
const USER_DATA_TIMEOUT = 12000; // 12 segundos timeout para user data

// Funções utilitárias minimalistas
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.trim().substring(0, 255);
};

const validateEmailFormat = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Debounce function para evitar múltiplas chamadas
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
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

  // Função simplificada para carregar dados do usuário
  const loadUserData = useCallback(async (supabaseUser: User): Promise<AuthUser | null> => {
    console.log('👤 [AUTH] Loading user data for:', supabaseUser.id);
    
    try {
      // Verificar cache primeiro
      const cachedUser = getCachedUser(supabaseUser.id);
      if (cachedUser) {
        console.log('💾 [AUTH] Using cached user data');
        return cachedUser;
      }

      // Criar usuário básico primeiro para evitar travamento
      const basicUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'Usuário',
        tenantId: 'default',
        roles: ['user'],
        permissions: [],
        isPlatformAdmin: false
      };

      // Tentar carregar dados adicionais de forma assíncrona
      try {
        console.log('📊 [AUTH] Fetching profile and roles...');
        
        const [profileResult, rolesResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', supabaseUser.id).maybeSingle(),
          supabase.from('user_roles').select('role').eq('user_id', supabaseUser.id)
        ]);

        const profile = profileResult?.data;
        const roles = rolesResult?.data || [];
        
        console.log('📊 [AUTH] Profile and roles loaded:', { 
          hasProfile: !!profile, 
          rolesCount: roles.length 
        });

        // Atualizar com dados completos
        const userData: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
          jobTitle: profile?.job_title,
          tenantId: profile?.tenant_id || 'default',
          roles: roles.length > 0 ? roles.map((r: any) => r.role) : ['user'],
          permissions: [],
          isPlatformAdmin: roles.some((r: any) => ['admin', 'super_admin', 'platform_admin'].includes(r.role))
        };

        // Cache o resultado
        setCachedUser(supabaseUser.id, userData);
        return userData;
        
      } catch (dbError) {
        console.warn('⚠️ [AUTH] Erro ao carregar dados do banco, usando dados básicos:', dbError);
        return basicUser;
      }

    } catch (error) {
      console.error('❌ [AUTH] Erro inesperado ao carregar dados do usuário:', error);
      
      // Retornar usuário básico em caso de erro
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'Usuário',
        tenantId: 'default',
        roles: ['user'],
        permissions: [],
        isPlatformAdmin: false
      };
    }
  }, [getCachedUser, setCachedUser]);

  // Handler otimizado para mudanças de auth
  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    console.log('🔄 [AUTH] Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id });
    
    setSession(session);

    if (event === 'SIGNED_OUT' || !session) {
      console.log('🚪 [AUTH] User signed out');
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      console.log('✅ [AUTH] User signed in, loading user data...');
      try {
        setIsLoading(true);
        
        // Timeout para carregamento de dados do usuário
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao carregar dados do usuário')), USER_DATA_TIMEOUT);
        });
        
        const userDataPromise = loadUserData(session.user);
        const userData = await Promise.race([userDataPromise, timeoutPromise]);
        
        console.log('👤 [AUTH] User data loaded:', { id: userData?.id, name: userData?.name });
        setUser(userData);
      } catch (error) {
        console.error('❌ [AUTH] Erro ao carregar dados do usuário:', error);
        // Em caso de erro, criar usuário básico para não travar
        const basicUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || 'Usuário',
          tenantId: 'default',
          roles: ['user'],
          permissions: [],
          isPlatformAdmin: false
        };
        setUser(basicUser);
      } finally {
        setIsLoading(false);
      }
    }
  }, [loadUserData]);

  // Setup inicial simplificado
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // Verificar sessão existente
    const initializeAuth = async () => {
      try {
        console.log('🚀 [AUTH] Inicializando autenticação...');
        
        // Timeout para inicialização
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ [AUTH] Timeout na inicialização, continuando sem sessão');
            setIsLoading(false);
          }
        }, STARTUP_TIMEOUT);
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session: currentSession }, error } = await Promise.race([
          sessionPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), STARTUP_TIMEOUT - 1000)
          )
        ]);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        if (!mounted) return;
        
        if (error) {
          console.warn('⚠️ [AUTH] Erro ao recuperar sessão:', error);
          setIsLoading(false);
          return;
        }

        if (currentSession) {
          console.log('✅ [AUTH] Sessão encontrada, carregando dados...');
          await handleAuthChange('SIGNED_IN', currentSession);
        } else {
          console.log('🚪 [AUTH] Nenhuma sessão encontrada');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ [AUTH] Erro na inicialização do auth:', error);
        if (timeoutId) clearTimeout(timeoutId);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de auth com debounce
    const debouncedHandleAuthChange = debounce(handleAuthChange, 300);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(debouncedHandleAuthChange);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  // Heartbeat para verificar sessão periodicamente
  useEffect(() => {
    if (!user) return;
    
    const heartbeatInterval = setInterval(async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ [AUTH HEARTBEAT] Erro ao verificar sessão:', error.message);
          return;
        }
        
        if (!currentSession && user) {
          console.warn('⚠️ [AUTH HEARTBEAT] Sessão perdida, fazendo logout limpo');
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.warn('⚠️ [AUTH HEARTBEAT] Erro inesperado:', error);
      }
    }, 60000); // A cada minuto
    
    return () => clearInterval(heartbeatInterval);
  }, [user]);

  // Login otimizado
  const login = useCallback(async (email: string, password: string) => {
    console.log('🔐 [AUTH] Iniciando login para:', email);
    
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    if (!validateEmailFormat(cleanEmail)) {
      console.error('❌ [AUTH] Formato de email inválido:', cleanEmail);
      throw new Error('Formato de email inválido');
    }

    if (cleanPassword.length < 6) {
      console.error('❌ [AUTH] Senha muito curta');
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    try {
      console.log('🔐 [AUTH] Chamando supabase.auth.signInWithPassword...');
      
      // Timeout para autenticação
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na autenticação. Verifique sua conexão.')), AUTH_TIMEOUT);
      });
      
      const loginPromise = supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });
      
      const result = await Promise.race([loginPromise, timeoutPromise]);
      const { data, error } = result;
      
      console.log('🔐 [AUTH] Resposta do Supabase:', { data: !!data, error: error?.message });

      if (error) {
        console.error('❌ [AUTH] Erro do Supabase:', error);
        throw new Error(error.message);
      }
      
      console.log('✅ [AUTH] Login bem-sucedido!');
    } catch (error: any) {
      console.error('❌ [AUTH] Erro inesperado no login:', error);
      throw error;
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

  // Função para recarregar dados do usuário
  const refreshUserData = useCallback(async () => {
    if (!session?.user) {
      return;
    }
    
    try {
      // Limpar cache para forçar recarregamento
      authCache.delete(session.user.id);
      
      // Recarregar dados
      const userData = await loadUserData(session.user);
      setUser(userData);
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
    }
  }, [session, loadUserData]);

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    signup,
    refreshUserData,
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