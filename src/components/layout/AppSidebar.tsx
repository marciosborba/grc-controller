import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, AlertTriangle, FileCheck, Users, ClipboardList, BarChart3, Settings, HelpCircle, ChevronRight, Brain, Eye, Zap, Building2, Activity, KeyRound, Database, Plug, Bell, TestTube, Crown, User } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth} from '@/contexts/AuthContextOptimized';
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
      description: 'Gestão de Assessments',
      submenu: [
        {
          title: 'Alex Assessment Engine',
          url: '/assessments',
          icon: Brain,
          description: 'Sistema inteligente com IA integrada'
        },
        {
          title: 'Assessments Legacy',
          url: '/assessments/legacy',
          icon: ClipboardList,
          description: 'Sistema tradicional de assessments'
        },
        {
          title: 'Frameworks',
          url: '/assessments/frameworks',
          icon: FileCheck,
          description: 'Gerenciamento de frameworks'
        }
      ]
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
// SINCRONIZADO com MOCK_ROLES do GlobalRulesSection
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

export function AppSidebar() {
  console.log('🚀 [SIDEBAR] AppSidebar carregado - Menu atualizado para "Gestão de Políticas"');
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();

  // Estado para teste de roles - iniciar com Super Admin (role original do usuário)
  const [currentTestRole, setCurrentTestRole] = useState(TEST_ROLES.find(r => r.id === '1') || TEST_ROLES[0]); // Super Admin por padrão
  const [isTestingRole, setIsTestingRole] = useState(false); // Sempre começar sem testar
  const [databaseRoles, setDatabaseRoles] = useState<DatabaseRole[]>([]);
  const [availableTestRoles, setAvailableTestRoles] = useState<TestRole[]>(TEST_ROLES);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const collapsed = state === "collapsed";
  const currentPath = location.pathname;
  
  // Carregar roles do banco de dados
  useEffect(() => {
    if (user?.isPlatformAdmin || user?.roles?.includes('super_admin')) {
      loadDatabaseRoles();
    }
  }, [user]);

  // Listener para atualizações de roles
  useEffect(() => {
    const handleRolesUpdated = () => {
      console.log('🔄 [ROLES] Evento de atualização recebido, recarregando roles...');
      if (user?.isPlatformAdmin || user?.roles?.includes('super_admin')) {
        loadDatabaseRoles();
      }
    };

    window.addEventListener('rolesUpdated', handleRolesUpdated);
    return () => window.removeEventListener('rolesUpdated', handleRolesUpdated);
  }, [user]);

  
  const loadDatabaseRoles = async () => {
    try {
      setLoadingRoles(true);
      console.log('💾 [ROLES] Carregando roles do banco de dados...');
      
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
        // Usar apenas Super Admin em caso de erro (role real do usuário)
        const superAdminOnly = TEST_ROLES.filter(r => r.id === '1' || r.name === 'super_admin');
        setAvailableTestRoles(superAdminOnly);
        return;
      }

      console.log(`✅ [SIDEBAR] ${roles?.length || 0} roles carregadas do banco`);
      setDatabaseRoles(roles || []);
      
      // Se não há roles no banco, usar apenas Super Admin
      if (!roles || roles.length === 0) {
        console.log('📝 [SIDEBAR] Nenhuma role encontrada no banco, usando apenas Super Admin');
        const superAdminOnly = TEST_ROLES.filter(r => r.id === '1' || r.name === 'super_admin');
        setAvailableTestRoles(superAdminOnly);
        return;
      }
      
      // Converter roles do banco para formato de teste
      const convertedRoles = convertDatabaseRolesToTestRoles(roles);
      
      // Sempre incluir Super Admin (role real do usuário) + roles do banco
      const superAdmin = TEST_ROLES.find(r => r.id === '1' || r.name === 'super_admin');
      const allRoles = superAdmin ? [superAdmin, ...convertedRoles] : convertedRoles;
      
      setAvailableTestRoles(allRoles);
      console.log(`🧪 [SIDEBAR] ${allRoles.length} roles disponíveis para teste (1 sistema + ${convertedRoles.length} banco)`);
      
      // Garantir que a role atual seja válida
      const updatedSuperAdmin = allRoles.find(r => r.id === '1' || r.name === 'super_admin');
      if (updatedSuperAdmin && !isTestingRole) {
        setCurrentTestRole(updatedSuperAdmin);
      }
      
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar roles:', error);
      // Em caso de erro, usar apenas Super Admin (role real do usuário)
      const superAdminOnly = TEST_ROLES.filter(r => r.id === '1' || r.name === 'super_admin');
      setAvailableTestRoles(superAdminOnly);
      // Não mostrar toast de erro para não incomodar o usuário
      console.warn('⚠️ Usando apenas Super Admin devido ao erro');
    } finally {
      setLoadingRoles(false);
    }
  };

  const convertDatabaseRolesToTestRoles = (dbRoles: DatabaseRole[]): TestRole[] => {
    return dbRoles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.display_name,
      permissions: role.permissions || [],
      description: role.description || 'Role personalizada',
      icon: getIconForRole(role.icon || role.name)
    }));
  };

  const getIconForRole = (iconName: string): any => {
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
  };
  
  // Funções para teste de roles
  const handleRoleChange = (roleId: string) => {
    if (!user?.isPlatformAdmin && !user?.roles?.includes('super_admin')) return;
    
    const role = availableTestRoles.find(r => r.id === roleId);
    if (!role) return;
    
    const wasTestingBefore = isTestingRole;
    // Mostrar como teste quando seleciona qualquer role diferente da role original do usuário
    // Apenas Super Admin (ID '1') é a role original, todas as outras são teste
    const isOriginalRole = roleId === '1'; // '1' é o ID do Super Admin (role original)
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
    
      // Debug específico para role Auditor
      if (role.name === 'auditor' || role.name === 'Auditor') {
        console.log('👁️ [AUDITOR SELECTED] Role Auditor selecionada:', {
          roleId: role.id,
          roleName: role.name,
          displayName: role.displayName,
          permissions: role.permissions,
          isTestingNow,
          expectedModules: ['Gestão de Auditoria', 'Assessments', 'Relatórios', 'Conformidade'],
          permissionAnalysis: {
            'audit.read': role.permissions.includes('audit.read'),
            'assessment.read': role.permissions.includes('assessment.read'),
            'report.read': role.permissions.includes('report.read'),
            'compliance.read': role.permissions.includes('compliance.read'),
            'all': role.permissions.includes('all'),
            '*': role.permissions.includes('*')
          }
        });
      }
    
    // Forçar re-render do sidebar
    setTimeout(() => {
      console.log(`🔄 [ROLE TESTING] State updated:`, {
        currentTestRole: role.displayName,
        isTestingRole: isTestingNow,
        permissions: role.permissions
      });
      
      // Teste direto de permissões para role Auditor
      if ((role.name === 'auditor' || role.name === 'Auditor') && isTestingNow) {
        console.log('🧪 [AUDITOR TEST] Testando permissões diretamente:');
        
        const moduleTests = [
          { name: 'Gestão de Auditoria', permissions: ['audit.read', 'all'] },
          { name: 'Assessments', permissions: ['assessment.read', 'all'] },
          { name: 'Relatórios', permissions: ['report.read', 'all'] },
          { name: 'Conformidade', permissions: ['compliance.read', 'all'] }
        ];
        
        moduleTests.forEach(test => {
          const hasAccess = test.permissions.some(p => 
            role.permissions.includes(p) || 
            role.permissions.includes('*') || 
            role.permissions.includes('all')
          );
          console.log(`- ${test.name}:`, { 
            required: test.permissions, 
            hasAccess,
            matchingPermissions: test.permissions.filter(p => role.permissions.includes(p))
          });
        });
      }
    }, 100);
    
    // Mostrar toast informativo
    if (roleId === '1') { // Super Admin - role original
      toast.success('👑 Usando sua role original: Super Administrador');
    } else {
      toast.info(`🧪 Testando role: ${role.displayName}`, {
        description: `Permissões: ${role.permissions.length} configuradas`
      });
    }
  };

  const hasPermission = (permissions: string[]) => {
    if (!user) {
      console.log('❌ [PERMISSION] No user found');
      return false;
    }
    
    // Identificar o módulo para debug
    const moduleTitle = permissions.includes('audit.read') ? 'Gestão de Auditoria' :
                       permissions.includes('assessment.read') ? 'Assessments' :
                       permissions.includes('report.read') ? 'Relatórios' :
                       permissions.includes('compliance.read') ? 'Conformidade' :
                       permissions.includes('risk.read') ? 'Gestão de Riscos' :
                       permissions.includes('incident.read') ? 'Incidentes' :
                       permissions.includes('privacy.read') ? 'Privacidade' :
                       permissions.includes('vendor.read') ? 'Vendor Risk' :
                       permissions.includes('platform_admin') ? 'Platform Admin' :
                       permissions.includes('all') ? 'Módulo Público' : 'Desconhecido';
    
    // MODO DE TESTE DE ROLE
    if (isTestingRole && currentTestRole) {
      console.log(`🧪 [ROLE TEST] Verificando ${moduleTitle} para role de teste:`, {
        testRole: currentTestRole.name,
        testRoleDisplayName: currentTestRole.displayName,
        requiredPermissions: permissions,
        testRolePermissions: currentTestRole.permissions
      });
      
      // Permitir acesso ao dropdown de teste mesmo em modo de teste
      if (permissions.includes('platform_admin')) {
        const hasAccess = user.isPlatformAdmin;
        console.log(`🔧 [PLATFORM ADMIN] Acesso ao dropdown de teste: ${hasAccess}`);
        return hasAccess;
      }
      
      // Verificar permissões da role de teste
      const hasTestPermission = permissions.some(permission => {
        // Verificar permissão específica
        const hasSpecific = currentTestRole.permissions.includes(permission);
        
        // Verificar se role tem permissão '*' (acesso total - apenas para super admins)
        const hasSuperAccess = currentTestRole.permissions.includes('*');
        
        return hasSpecific || hasSuperAccess;
      });
      
      // Debug detalhado para role Auditor
      if (currentTestRole.name === 'auditor' || currentTestRole.name === 'Auditor') {
        console.log(`👁️ [AUDITOR DEBUG] Verificação detalhada para ${moduleTitle}:`, {
          rolePermissions: currentTestRole.permissions,
          requiredPermissions: permissions,
          individualChecks: permissions.map(p => ({
            permission: p,
            hasPermission: currentTestRole.permissions.includes(p),
            hasAllAccess: currentTestRole.permissions.includes('*') || currentTestRole.permissions.includes('all')
          })),
          finalResult: hasTestPermission
        });
      }
      
      console.log(`🧪 [${hasTestPermission ? '✅' : '❌'}] ${moduleTitle} - Role: ${currentTestRole.displayName}`, {
        hasAccess: hasTestPermission,
        matchingPermissions: permissions.filter(p => 
          currentTestRole.permissions.includes(p) || 
          currentTestRole.permissions.includes('*') || 
          currentTestRole.permissions.includes('all')
        )
      });
      
      return hasTestPermission;
    }
    
    // MODO NORMAL (sem teste de role)
    
    // Platform Admin sempre tem acesso (exceto quando testando)
    if (user.isPlatformAdmin) {
      console.log(`👑 [PLATFORM ADMIN] Acesso total para ${moduleTitle}`);
      return true;
    }
    
    // Verificar permissão 'all' (acesso público)
    if (permissions.includes('all')) {
      console.log(`🌐 [PUBLIC ACCESS] Módulo público: ${moduleTitle}`);
      return true;
    }
    
    // Verificar permissões específicas do usuário
    const userPermissions = user.permissions || [];
    const hasDirectPermission = permissions.some(permission => {
      // Verificar permissão específica
      const hasSpecific = userPermissions.includes(permission);
      
      // Verificar se usuário tem permissão 'all' ou '*'
      const hasAllAccess = userPermissions.includes('all') || userPermissions.includes('*');
      
      return hasSpecific || hasAllAccess;
    });
    
    // Debug para usuários normais
    console.log(`👤 [USER PERMISSION] ${moduleTitle} - Usuário: ${user.name}`, {
      hasAccess: hasDirectPermission,
      userPermissions,
      requiredPermissions: permissions,
      userRoles: user.roles,
      matchingPermissions: permissions.filter(p => 
        userPermissions.includes(p) || 
        userPermissions.includes('all') || 
        userPermissions.includes('*')
      )
    });
    
    return hasDirectPermission;
  };
  const isActive = (path: string) => {
    // Verificação exata para evitar conflitos entre /settings e /settings/general
    if (path === '/settings') {
      return currentPath === '/settings';
    }
    if (path === '/settings/general') {
      return currentPath === '/settings/general' || currentPath.startsWith('/settings/general/');
    }
    // Para outras rotas, mantém a lógica original
    return currentPath === path || currentPath.startsWith(path + '/');
  };
  const getNavCls = (isActiveItem: boolean) => isActiveItem ? "text-primary font-medium" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const handleProfileClick = () => {
    navigate('/profile');
  };
  return <Sidebar className="border-r border-border" collapsible="icon">
      {/* Header - Responsivo */}
      <div className={`${collapsed ? "h-14 px-2" : "h-14 sm:h-16 px-3 sm:px-4"} flex items-center justify-between border-b border-border transition-all duration-300`}>
        {!collapsed && <div className="flex items-center space-x-2 min-w-0 flex-1">
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
          </div>}
        <SidebarTrigger className="hover:bg-muted/50 p-1.5 sm:p-2 rounded-md" />
      </div>



      <SidebarContent className={`${collapsed ? "px-1 py-2" : "px-1 sm:px-2 py-2 sm:py-3"} transition-all duration-300`}>
        {navigationItems.map((group, groupIndex) => {
          const filteredItems = group.items.filter(item => {
    const hasAccess = hasPermission(item.permissions);
    // DEBUG: Log das permissões para cada item
    console.log(`🔐 [PERMISSION DEBUG] ${item.title}:`, {
      requiredPermissions: item.permissions,
      hasAccess,
      userIsPlatformAdmin: user?.isPlatformAdmin,
      userPermissions: user?.permissions || [],
      userRoles: user?.roles || []
    });
    return hasAccess;
  });
          
          // Debug: mostrar itens filtrados
          if (isTestingRole && currentTestRole) {
            console.log(`📊 [FILTERED ITEMS] Grupo "${group.label}":`, {
              totalItems: group.items.length,
              filteredItems: filteredItems.length,
              visibleModules: filteredItems.map(item => item.title),
              testRole: currentTestRole.name
            });
          }
          
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
                      {/* Se o item tem submenu, renderizar diferente */}
                      {item.submenu ? (
                        <div className="space-y-1">
                          {/* Item principal - navega para o primeiro item do submenu */}
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.submenu[0].url} // Navega para o primeiro item do submenu (Alex Assessment Engine)
                              className={`${getNavCls(isActive(item.url) || item.submenu.some(sub => isActive(sub.url)))} flex items-center w-full px-2 sm:px-3 py-3 sm:py-4 rounded-lg transition-all duration-200 group mb-1`}
                              title={item.title}
                              onClick={() => {
                                console.log(`🔗 [SIDEBAR DEBUG] Clicando em ${item.title}, navegando para:`, item.submenu[0].url);
                                console.log(`🔐 [PERMISSION CHECK] Permissões do usuário:`, {
                                  isPlatformAdmin: user?.isPlatformAdmin,
                                  permissions: user?.permissions,
                                  roles: user?.roles,
                                  requiredForAssessment: ['assessment.read']
                                });
                              }}
                            >
                              <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                              {!collapsed && (
                                <div className="ml-2 sm:ml-3 flex-1 min-w-0 py-[1px] sm:py-[2px]">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                                    <ChevronRight className="h-3 w-3 transition-transform group-hover:rotate-90 flex-shrink-0" />
                                  </div>
                                  <p className="text-[10px] sm:text-xs opacity-75 mt-0 sm:mt-0.5 truncate leading-tight">
                                    {item.description}
                                  </p>
                                </div>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                          
                          {/* Submenu items - sempre visível para Assessment */}
                          {!collapsed && item.submenu.map(subItem => (
                            <SidebarMenuButton asChild key={subItem.title}>
                              <NavLink
                                to={subItem.url}
                                className={`${getNavCls(isActive(subItem.url))} flex items-center w-full px-4 sm:px-6 py-2 sm:py-3 ml-2 rounded-lg transition-all duration-200 group text-sm`}
                                title={subItem.title}
                              >
                                <subItem.icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <div className="ml-2 flex-1 min-w-0">
                                  <span className="text-xs sm:text-sm font-medium truncate">{subItem.title}</span>
                                  {subItem.title === 'Alex Assessment Engine' && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                                        IA
                                      </Badge>
                                      <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                                        NOVO
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </NavLink>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      ) : (
                        /* Item normal sem submenu */
                        <SidebarMenuButton asChild>
                          <NavLink 
                            to={item.url} 
                            className={`${getNavCls(isActive(item.url))} flex items-center w-full px-2 sm:px-3 py-4 sm:py-6 rounded-lg transition-all duration-200 group mb-1 sm:mb-2`} 
                            title={collapsed ? item.title : ''}
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
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
        
        {/* Role Testing Dropdown - No final do sidebar */}
        {(user?.isPlatformAdmin || user?.roles?.includes('super_admin')) && (
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


    </Sidebar>;
}