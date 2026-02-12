import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { logAuthEvent } from '@/utils/securityLogger';

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
  avatar_url?: string; // Added field
  tenantId: string;
  tenant?: Tenant;
  roles: string[];
  permissions: string[];
  isPlatformAdmin: boolean;
  enabledModules: string[]; // List of enabled module keys
  settings?: {
    enable_global_ai?: boolean;
    [key: string]: any;
  };
}

// ... (existing code)



interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, fullName: string, jobTitle?: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkModuleAccess: (moduleKey: string) => boolean;
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

// Função para obter permissões baseadas nas roles
const getPermissionsForRoles = (roles: string[], isPlatformAdmin: boolean = false): string[] => {
  // Platform admins têm todas as permissões
  if (isPlatformAdmin) {
    return ['read', 'write', 'delete', 'admin', 'platform_admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage', 'assessment.read', 'all'];
  }

  // Mapeamento básico de permissões para roles do sistema
  const permissionMap: Record<string, string[]> = {
    admin: ['read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'assessment.read', 'all'],
    ciso: ['read', 'write', 'admin', 'users.read', 'users.update', 'security.read', 'incidents.read', 'vulnerabilities.read', 'assessment.read'],
    risk_manager: ['read', 'write', 'risk.read', 'risk.write', 'vendor.read', 'assessment.read'],
    compliance_officer: ['read', 'write', 'compliance.read', 'compliance.write', 'privacy.read', 'audit.read', 'assessment.read'],
    auditor: ['read', 'audit.read', 'audit.write', 'logs.read', 'assessment.read', 'report.read', 'compliance.read'],
    user: ['read', 'all']
  };

  const allPermissions = new Set<string>();

  // Adicionar permissões das roles básicas
  roles.forEach(role => {
    const rolePermissions = permissionMap[role] || ['read'];
    rolePermissions.forEach(permission => allPermissions.add(permission));
  });

  return Array.from(allPermissions);
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

    // Criar usuário básico primeiro para evitar travamento (Escopo global da função)
    const basicUser: AuthUser = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.email?.split('@')[0] || 'Usuário',
      tenantId: 'default',
      roles: ['user'],
      permissions: getPermissionsForRoles(['user'], false),
      isPlatformAdmin: false,
      enabledModules: []
    };

    try {
      // Verificar cache primeiro
      const cachedUser = getCachedUser(supabaseUser.id);
      if (cachedUser) {
        console.log('💾 [AUTH] Using cached user data');
        return cachedUser;
      }

      // Tentar carregar via RPC
      try {
        console.log('📊 [AUTH] Fetching profile via Secure RPC...');

        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_user_complete_profile');

        if (rpcError) {
          console.error('❌ [AUTH] RPC Error:', rpcError);
          throw rpcError;
        }

        const fullProfile = rpcData as any;
        console.log('✅ [AUTH] RPC Data received:', JSON.stringify(fullProfile, null, 2));

        if (!fullProfile || !fullProfile.profile) {
          console.warn('⚠️ [AUTH] Perfil não retornado pelo RPC');
          throw new Error('Perfil não encontrado');
        }

        const profile = fullProfile.profile;
        const tenantData = fullProfile.tenant;
        const tenantSettings = tenantData?.settings || {};
        const modulesList = fullProfile.modules || [];
        const rolesList = fullProfile.roles || [];
        const platformAdminData = fullProfile.platform_admin;

        // Fetch Tenant Modules from RPC result
        let enabledModules: string[] = modulesList.map((m: any) => m.module_key);
        console.log('📦 [AUTH] Enabled Modules for Tenant:', enabledModules);

        console.log('📊 [AUTH] Profile loaded via RPC:', {
          hasProfile: !!profile,
          rolesCount: rolesList.length,
          isPlatformAdminTable: !!platformAdminData
        });

        // 🔒 SEGURANÇA: Usar APENAS tabela platform_admins como fonte autoritativa
        let isPlatformAdmin = false;
        let adminSource = 'none';

        if (platformAdminData) {
          isPlatformAdmin = true;
          adminSource = 'platform_admins_table';
        } else {
          // Fallback para roles apenas se platform_admins não existir (compatibilidade)
          const hasAdminRole = rolesList.some((r: any) => ['admin', 'super_admin', 'platform_admin'].includes(r.role));
          if (hasAdminRole) {
            isPlatformAdmin = true;
            adminSource = 'user_roles_fallback';
          }
        }

        console.log('🔐 [AUTH] Platform Admin verification (SECURE):', {
          isPlatformAdmin,
          adminSource
        });

        // Atualizar com dados completos
        const userRoles = rolesList.length > 0 ? rolesList.map((r: any) => r.role) : ['user'];
        const userPermissions = getPermissionsForRoles(userRoles, isPlatformAdmin);

        const userData: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: profile?.full_name || supabaseUser.email?.split('@')[0] || 'Usuário',
          jobTitle: profile?.job_title,
          avatar_url: profile?.avatar_url,
          tenantId: profile?.tenant_id || 'default',
          roles: userRoles,
          permissions: userPermissions,
          isPlatformAdmin,
          enabledModules,
          settings: tenantSettings,
          tenant: tenantData ? {
            id: profile?.tenant_id, // Add ID to satisfy Tenant interface if mostly compatible, or expect errors? AuthUser tenant is Tenant interface.
            name: tenantData.name,
            slug: tenantData.slug,
            // MOCK missing required fields to avoid typescript errors since we only need name/settings mostly
            contact_email: '',
            max_users: 0,
            current_users_count: 0,
            subscription_plan: 'free',
            is_active: true
          } : undefined
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
      return basicUser;
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
          permissions: getPermissionsForRoles(['user'], false),
          isPlatformAdmin: false,
          enabledModules: []
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
      await logAuthEvent('login_failed', {
        email: cleanEmail,
        error: 'Invalid email format',
        severity: 'warning'
      });
      throw new Error('Formato de email inválido');
    }

    if (cleanPassword.length < 6) {
      console.error('❌ [AUTH] Senha muito curta');
      await logAuthEvent('login_failed', {
        email: cleanEmail,
        error: 'Password too short',
        severity: 'warning'
      });
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
      const { data, error } = result as any;

      console.log('🔐 [AUTH] Resposta do Supabase:', { data: !!data, error: error?.message });

      if (error) {
        console.error('❌ [AUTH] Erro do Supabase:', error);
        // O log será feito no bloco catch quando o erro for lançado para evitar duplicidade
        throw new Error(error.message);
      }

      console.log('✅ [AUTH] Login bem-sucedido!');

      // Log sucesso de login
      if (data.user) {
        await logAuthEvent('login_success', {
          user_id: data.user.id,
          email: cleanEmail,
          severity: 'info'
        });
      }

    } catch (error: any) {
      console.error('❌ [AUTH] Erro inesperado no login:', error);

      if (!error.message?.includes('Invalid email') && !error.message?.includes('Password too short')) {
        await logAuthEvent('login_failed', {
          email: cleanEmail,
          error: error.message || 'Unknown error',
          severity: 'error'
        });
      }

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

  // Alias para compatibilidade
  const refreshUser = refreshUserData;

  // Check module access
  const checkModuleAccess = useCallback((moduleKey: string) => {
    if (!user) return false;
    // Platform Admin has all permissions, but should still respect ENABLED MODULES for the tenant
    // if (user.isPlatformAdmin) return true; 

    // AI Modules Check - Enforce Global AI Setting
    // Exceção: Platform Admin sempre pode acessar o AI Manager (configuração do sistema)
    if (['ai_manager'].includes(moduleKey) && user.isPlatformAdmin) {
      return true;
    }

    if (['ai_manager', 'policy_auditor'].includes(moduleKey)) {
      if (!user.settings?.enable_global_ai) return false;
    }

    // Public modules or basic ones
    if (['dashboard', 'help', 'notifications', 'settings', 'admin'].includes(moduleKey)) return true; // Ensure 'admin' module is always accessible for admins

    return user.enabledModules?.includes(moduleKey) || false;
  }, [user]);

  // Listen for security events (Kick User) - REALTIME KILL SWITCH
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('security_broadcast')
      .on('broadcast', { event: 'force_logout' }, (payload) => {
        if (payload.payload?.user_id === user.id) {
          console.warn('🚨 [AUTH] Sessão encerrada remotamente pelo administrador');
          logout().then(() => {
            window.location.reload();
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, logout]);

  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    login,
    logout,
    signup,
    refreshUserData,
    refreshUser,
    checkModuleAccess
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