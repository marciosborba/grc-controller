import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, AlertTriangle, FileCheck, Users, ClipboardList, BarChart3, Settings, HelpCircle, ChevronRight, Brain, Eye, Zap, Building2, Activity, KeyRound, Database, Plug, Bell, TestTube, Crown, User } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { getUserFirstName, getUserInitials, getUserDisplayName } from '@/utils/userHelpers';
import { getTenantDisplayName } from '@/utils/tenantHelpers';

// Interface para roles do banco de dados
interface DatabaseRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: string[] | null;
  color: string;
  icon: string | null;
  is_active: boolean | null;
  is_system: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// Interface para roles de teste (compatibilidade)
interface TestRole {
  id: string;
  name: string;
  displayName: string;
  permissions: string[];
  description: string;
  icon: any;
}

const navigationItems = [{
  label: 'Módulos',
  items: [
    {
      title: 'Assessment',
      url: '/assessments',
      icon: ClipboardList,
      permissions: ['assessment.read'],
      description: 'Gestão de Assessments (apenas para roles específicas)'
    },
    {
      title: 'Auditoria',
      url: '/audit',
      icon: Eye,
      permissions: ['audit.read'],
      description: 'Gestão de Auditoria'
    },
    {
      title: 'Ética',
      url: '/ethics',
      icon: Shield,
      permissions: ['all'],
      description: 'Denúncias e questões éticas'
    },
    {
      title: 'Usuários',
      url: '/settings',
      icon: Settings,
      permissions: ['admin', 'users.read'],
      description: 'Gestão de usuários'
    },
    {
      title: 'Conformidade',
      url: '/compliance',
      icon: FileCheck,
      permissions: ['compliance.read'],
      description: 'Gestão de Conformidade'
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      permissions: ['all'],
      description: 'Visão geral e métricas principais'
    },
    {
      title: 'Notificações',
      url: '/notifications',
      icon: Bell,
      permissions: ['all'],
      description: 'Central de notificações e alertas'
    },
    {
      title: 'Riscos',
      url: '/risks',
      icon: AlertTriangle,
      permissions: ['risk.read'],
      description: 'Gestão de Riscos'
    },
    {
      title: 'Incidentes',
      url: '/incidents',
      icon: Zap,
      permissions: ['incident.read'],
      description: 'Gestão de incidentes de segurança'
    },
    {
      title: 'Políticas',
      url: '/policy-management',
      icon: FileCheck,
      permissions: ['compliance.read'],
      description: 'Gestão de Políticas e Normas'
    },
    {
      title: 'Privacidade',
      url: '/privacy',
      icon: KeyRound,
      permissions: ['privacy.read'],
      description: 'Gestão de LGPD'
    },
    {
      title: 'TPRM',
      url: '/vendors',
      icon: Users,
      permissions: ['vendor.read'],
      description: 'Gestão de Riscos de Terceiros'
    },
    {
      title: 'Relatórios',
      url: '/reports',
      icon: BarChart3,
      permissions: ['report.read'],
      description: 'Relatórios e dashboards personalizados'
    },
    {
      title: 'Ajuda',
      url: '/help',
      icon: HelpCircle,
      permissions: ['all'],
      description: 'Centro de ajuda e documentação'
    }
  ]
}, {
  label: 'Área Administrativa',
  items: [{
    title: 'System Diagnostic',
    url: '/admin/system-diagnostic',
    icon: Activity,
    permissions: ['platform_admin'],
    description: 'Diagnóstico e monitoramento da plataforma'
  }, {
    title: 'Tenants',
    url: '/admin/tenants',
    icon: Building2,
    permissions: ['platform_admin'],
    description: 'Gestão de organizações'
  }, {
    title: 'IA Mananger',
    url: '/admin/ai-management',
    icon: Brain,
    permissions: ['platform_admin'],
    description: 'Configuração e gestão de assistentes de IA'
  }, {
    title: 'Global Settings ',
    url: '/settings/general',
    icon: Plug,
    permissions: ['platform_admin'],
    description: 'Integrações e configurações avançadas'
  }]
}];

// Roles de teste baseadas nas roles reais do sistema (Regras Globais)
const TEST_ROLES = [
  {
    id: 'platform_admin',
    name: 'platform_admin',
    displayName: 'Platform Admin',
    permissions: ['platform_admin', 'all', '*', 'read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage'],
    description: 'Administrador da plataforma com acesso total e capacidade de gerenciar múltiplos tenants',
    icon: Crown
  },
  {
    id: '1',
    name: 'super_admin',
    displayName: 'Super Administrador',
    permissions: ['*', 'all'], // Todas as permissões
    description: 'Acesso total à plataforma com poderes de configuração global',
    icon: Crown
  },
  {
    id: '2',
    name: 'compliance_manager',
    displayName: 'Gerente de Compliance',
    permissions: ['compliance.read', 'compliance.write', 'audit.read', 'audit.write', 'report.read', 'report.export', 'assessment.read'],
    description: 'Gerencia políticas de compliance, auditoria e assessments',
    icon: Shield
  },
  {
    id: '3',
    name: 'security_analyst',
    displayName: 'Analista de Segurança',
    permissions: ['security.read', 'incident.read', 'incident.write', 'vulnerabilities.read', 'risk.read'],
    description: 'Monitora e analisa incidentes de segurança',
    icon: Zap
  },
  {
    id: '4',
    name: 'auditor',
    displayName: 'Auditor',
    permissions: ['audit.read', 'audit.write', 'logs.read', 'report.read', 'compliance.read', 'all'],
    description: 'Acesso a módulos de auditoria, relatórios, conformidade e módulos públicos (sem assessments)',
    icon: Eye
  },
  {
    id: '5',
    name: 'user',
    displayName: 'Usuário Básico',
    permissions: ['all'], // Usuário básico tem acesso aos módulos públicos
    description: 'Acesso limitado apenas a módulos públicos (Dashboard, Ética, Notificações, Ajuda)',
    icon: User
  }
];

export function AppSidebarFixed() {
  // AppSidebarFixed carregado - Versão otimizada
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estado para teste de roles - iniciar com Super Admin (role original do usuário)
  const [currentTestRole, setCurrentTestRole] = useState(TEST_ROLES.find(r => r.id === '1') || TEST_ROLES[0]);
  const [isTestingRole, setIsTestingRole] = useState(false);
  const [databaseRoles, setDatabaseRoles] = useState<DatabaseRole[]>([]);
  const [availableTestRoles, setAvailableTestRoles] = useState<TestRole[]>(TEST_ROLES);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false); // NOVO: controle de carregamento

  const collapsed = state === "collapsed";
  const currentPath = location.pathname;
  
  // CORRIGIDO: Memoizar valores para evitar re-renders
  const userIsPlatformAdmin = useMemo(() => 
    user?.isPlatformAdmin || user?.roles?.includes('super_admin'), 
    [user?.isPlatformAdmin, user?.roles]
  );

  // CORRIGIDO: useCallback para loadDatabaseRoles
  const loadDatabaseRoles = useCallback(async () => {
    if (!userIsPlatformAdmin || rolesLoaded) return; // NOVO: evitar carregamento duplo
    
    try {
      setLoadingRoles(true);
      // Carregando roles do banco de dados
      
      // Timeout para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar roles')), 5000)
      );
      
      const queryPromise = supabase
        .from('custom_roles')
        .select('*')
        .eq('is_active', true)
        .order('is_system', { ascending: false })
        .order('created_at', { ascending: true });

      const { data: roles, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.warn('⚠️ Erro ao carregar roles do banco:', error.message);
        const superAdminOnly = TEST_ROLES.filter(r => r.id === '1' || r.name === 'super_admin');
        setAvailableTestRoles(superAdminOnly);
        setRolesLoaded(true); // NOVO: marcar como carregado mesmo com erro
        return;
      }

      // Roles carregadas do banco: ${roles?.length || 0}
      setDatabaseRoles(roles || []);
      
      if (!roles || roles.length === 0) {
        // Nenhuma role encontrada no banco, usando apenas Super Admin
        const superAdminOnly = TEST_ROLES.filter(r => r.id === '1' || r.name === 'super_admin');
        setAvailableTestRoles(superAdminOnly);
        setRolesLoaded(true); // NOVO: marcar como carregado
        return;
      }
      
      // Converter roles do banco para formato de teste
      const convertedRoles = convertDatabaseRolesToTestRoles(roles);
      
      // Sempre incluir Super Admin (role real do usuário) + roles do banco
      const superAdmin = TEST_ROLES.find(r => r.id === '1' || r.name === 'super_admin');
      const allRoles = superAdmin ? [superAdmin, ...convertedRoles] : convertedRoles;
      
      setAvailableTestRoles(allRoles);
      // Roles disponíveis para teste: ${allRoles.length} (1 sistema + ${convertedRoles.length} banco)
      
      // Garantir que a role atual seja válida
      const updatedSuperAdmin = allRoles.find(r => r.id === '1' || r.name === 'super_admin');
      if (updatedSuperAdmin && !isTestingRole) {
        setCurrentTestRole(updatedSuperAdmin);
      }
      
      setRolesLoaded(true); // NOVO: marcar como carregado com sucesso
      
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar roles:', error);
      const superAdminOnly = TEST_ROLES.filter(r => r.id === '1' || r.name === 'super_admin');
      setAvailableTestRoles(superAdminOnly);
      setRolesLoaded(true); // NOVO: marcar como carregado mesmo com erro
      console.warn('⚠️ Usando apenas Super Admin devido ao erro');
    } finally {
      setLoadingRoles(false);
    }
  }, [userIsPlatformAdmin, rolesLoaded]); // CORRIGIDO: dependências corretas

  // CORRIGIDO: useEffect com dependências corretas
  useEffect(() => {
    let isMounted = true;
    
    if (userIsPlatformAdmin && !rolesLoaded && isMounted) {
      loadDatabaseRoles();
    }
    
    return () => {
      isMounted = false;
    };
  }, [userIsPlatformAdmin, rolesLoaded, loadDatabaseRoles]);

  // CORRIGIDO: Listener para atualizações de roles com controle
  useEffect(() => {
    let isMounted = true;
    
    const handleRolesUpdated = () => {
      if (isMounted && userIsPlatformAdmin) {
        console.log('🔄 [ROLES] Evento de atualização recebido, recarregando roles...');
        setRolesLoaded(false); // NOVO: resetar flag para permitir novo carregamento
        loadDatabaseRoles();
      }
    };

    window.addEventListener('rolesUpdated', handleRolesUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('rolesUpdated', handleRolesUpdated);
    };
  }, [userIsPlatformAdmin, loadDatabaseRoles]);

  const convertDatabaseRolesToTestRoles = useCallback((dbRoles: DatabaseRole[]): TestRole[] => {
    return dbRoles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.display_name,
      permissions: role.permissions || [],
      description: role.description || 'Role personalizada',
      icon: getIconForRole(role.icon || role.name)
    }));
  }, []);

  const getIconForRole = useCallback((iconName: string): any => {
    const iconMap: { [key: string]: any } = {
      'Crown': Crown,
      'Shield': Shield,
      'Users': Users,
      'Eye': Eye,
      'Zap': Zap,
      'FileCheck': FileCheck,
      'AlertTriangle': AlertTriangle,
      'User': User,
      'super_admin': Crown,
      'compliance_manager': Shield,
      'security_analyst': Zap,
      'admin': Shield,
      'user': User,
      'Auditor': Eye,
      'auditor': Eye
    };
    return iconMap[iconName] || Users;
  }, []);
  
  // Funções para teste de roles
  const handleRoleChange = useCallback((roleId: string) => {
    if (!userIsPlatformAdmin) return;
    
    const role = availableTestRoles.find(r => r.id === roleId);
    if (!role) return;
    
    const wasTestingBefore = isTestingRole;
    const isOriginalRole = roleId === '1';
    const isTestingNow = !isOriginalRole;
    
    setCurrentTestRole(role);
    setIsTestingRole(isTestingNow);
    
    console.log(`🧪 [ROLE TESTING] Role changed:`, {
      from: currentTestRole?.displayName,
      to: role.displayName,
      wasTestingBefore,
      isTestingNow,
      isOriginalRole,
      roleId,
      permissions: role.permissions
    });
    
    // Mostrar toast informativo
    if (roleId === '1') {
      toast.success('👑 Usando sua role original: Super Administrador');
    } else {
      toast.info(`🧪 Testando role: ${role.displayName}`, {
        description: `Permissões: ${role.permissions.length} configuradas`
      });
    }
  }, [userIsPlatformAdmin, availableTestRoles, isTestingRole, currentTestRole]);

  const hasPermission = useCallback((permissions: string[]) => {
    if (!user) {
      return false;
    }
    
    // MODO DE TESTE DE ROLE (apenas quando explicitamente ativado)
    if (isTestingRole && currentTestRole && currentTestRole.id !== '1') {
      // Permitir acesso ao dropdown de teste mesmo em modo de teste
      if (permissions.includes('platform_admin')) {
        return user.isPlatformAdmin;
      }
      
      // Verificar permissões da role de teste
      const hasTestPermission = permissions.some(permission => {
        const hasSpecific = currentTestRole.permissions.includes(permission);
        const hasSuperAccess = currentTestRole.permissions.includes('*') || currentTestRole.permissions.includes('all');
        return hasSpecific || hasSuperAccess;
      });
      
      return hasTestPermission;
    }
    
    // MODO NORMAL (role original do usuário)
    
    // Platform Admin sempre tem acesso total
    if (user.isPlatformAdmin) {
      return true;
    }
    
    // Verificar permissão 'all' (acesso público)
    if (permissions.includes('all')) {
      return true;
    }
    
    // Verificar permissões específicas do usuário
    const userPermissions = user.permissions || [];
    const hasDirectPermission = permissions.some(permission => {
      const hasSpecific = userPermissions.includes(permission);
      const hasAllAccess = userPermissions.includes('all') || userPermissions.includes('*');
      return hasSpecific || hasAllAccess;
    });
    
    return hasDirectPermission;
  }, [user, isTestingRole, currentTestRole]);

  const isActive = useCallback((path: string) => {
    if (path === '/settings') {
      return currentPath === '/settings';
    }
    if (path === '/settings/general') {
      return currentPath === '/settings/general' || currentPath.startsWith('/settings/general/');
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  }, [currentPath]);

  const getNavCls = useCallback((isActiveItem: boolean) => 
    isActiveItem ? "text-primary font-medium" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
  , []);

  const handleProfileClick = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  return (
    <Sidebar className="border-r border-border" collapsible="icon">
      {/* Header - Responsivo */}
      <div className={`${collapsed ? "h-14 px-2" : "h-14 sm:h-16 px-3 sm:px-4"} flex items-center justify-between border-b border-border transition-all duration-300`}>
        {!collapsed && (
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">GRC Controller</h1>
              <div className="flex items-center gap-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{getTenantDisplayName(user?.tenant)}</p>
                {isTestingRole && currentTestRole && (
                  <span className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 px-1 py-0.5 rounded text-nowrap">
                    TESTE: {currentTestRole.name.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <SidebarTrigger className="hover:bg-muted/50 p-1.5 sm:p-2 rounded-md" />
      </div>

      <SidebarContent className={`${collapsed ? "px-1 py-2" : "px-1 sm:px-2 py-2 sm:py-3"} transition-all duration-300`}>
        {navigationItems.map((group, groupIndex) => {
          const filteredItems = group.items.filter(item => hasPermission(item.permissions));
          
          // Não exibe o grupo se não há itens visíveis
          if (filteredItems.length === 0) return null;
          
          return (
            <SidebarGroup key={groupIndex} className="mb-4 sm:mb-6">
              {!collapsed && group.label !== 'Módulos' && (
                <SidebarGroupLabel className={`mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-1 sm:px-0 ${
                  group.label === 'Plataform Adm' 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : 'text-muted-foreground'
                }`}>
                  {group.label}
                </SidebarGroupLabel>
              )}
              
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map(item => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={`${getNavCls(isActive(item.url))} flex items-center w-full px-2 sm:px-3 py-4 sm:py-6 rounded-lg transition-all duration-200 group mb-1 sm:mb-2`} 
                          title={collapsed ? item.title : ''}
                          onClick={() => {
                            console.log('🔗 [SIDEBAR] Navigating to:', item.url);
                          }}
                        >
                          <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                          {!collapsed && (
                            <div className="ml-2 sm:ml-3 flex-1 min-w-0 py-[1px] sm:py-[2px]">
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                                <ChevronRight className="h-2 w-2 sm:h-3 sm:w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </div>
                              <p className="text-[10px] sm:text-xs opacity-75 mt-0 sm:mt-0.5 truncate leading-tight">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
        
        {/* Role Testing Dropdown - No final do sidebar */}
        {userIsPlatformAdmin && (
          <div className="mt-auto p-3 border-t border-border">
            {!collapsed && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <TestTube className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                    Teste de Roles
                  </span>
                </div>
                {isTestingRole && (
                  <div className="flex items-center gap-1 mb-2">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <span className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Modo de teste ativo
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <Select value={currentTestRole.id} onValueChange={handleRoleChange}>
              <SelectTrigger 
                className={`${
                  collapsed 
                    ? 'w-10 h-10 p-0 justify-center' 
                    : 'w-full h-auto py-2 px-3'
                } border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors`}
                title={collapsed ? currentTestRole.displayName : ''}
              >
                {collapsed ? (
                  <currentTestRole.icon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                ) : (
                  <SelectValue>
                    <div className="flex items-center gap-2 min-w-0">
                      <currentTestRole.icon className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-orange-800 dark:text-orange-200 truncate">
                          {currentTestRole.displayName}
                        </span>
                        {isTestingRole && (
                          <Badge 
                            variant="outline" 
                            className="text-[9px] px-1 py-0 h-4 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
                          >
                            TESTE
                          </Badge>
                        )}
                      </div>
                    </div>
                  </SelectValue>
                )}
              </SelectTrigger>
              
              <SelectContent className="w-64">
                {loadingRoles ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                    <span className="text-sm text-muted-foreground">Carregando roles...</span>
                  </div>
                ) : (
                  availableTestRoles.map((role) => {
                    const isCurrentRole = role.id === currentTestRole.id;
                    const isDatabaseRole = databaseRoles.some(dbRole => dbRole.id === role.id);
                    
                    return (
                      <SelectItem 
                        key={role.id} 
                        value={role.id}
                        className="cursor-pointer py-2 px-3"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <role.icon className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm">
                              {role.displayName}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}