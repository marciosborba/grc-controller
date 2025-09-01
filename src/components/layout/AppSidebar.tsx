import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, AlertTriangle, FileCheck, Users, ClipboardList, BarChart3, Settings, HelpCircle, ChevronRight, Brain, Eye, Zap, Building2, Activity, KeyRound, Database, Plug, Bell } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { getUserFirstName, getUserInitials, getUserDisplayName } from '@/utils/userHelpers';
import { getTenantDisplayName } from '@/utils/tenantHelpers';
const navigationItems = [{
  label: 'Módulos',
  items: [
    {
      title: 'Assessments',
      url: '/assessments',
      icon: ClipboardList,
      permissions: ['assessment.read', 'all'],
      description: 'Questionários e avaliações'
    },
    {
      title: 'Gestão de Auditoria',
      url: '/audit',
      icon: Eye,
      permissions: ['audit.read', 'all'],
      description: 'Auditoria completa com IA - Alex Audit'
    },
    {
      title: 'Canal de Ética',
      url: '/ethics',
      icon: Shield,
      permissions: ['all'],
      description: 'Denúncias e questões éticas'
    },
    {
      title: 'Gestão de Usuários',
      url: '/settings',
      icon: Settings,
      permissions: ['admin', 'users.read'],
      description: 'Gerenciamento de usuários e sistema'
    },
    {
      title: 'Configurações Gerais',
      url: '/settings/general',
      icon: Plug,
      permissions: ['admin', 'all'],
      description: 'Integrações e configurações avançadas'
    },
    {
      title: 'Conformidade',
      url: '/compliance',
      icon: FileCheck,
      permissions: ['compliance.read', 'all'],
      description: 'Controles de conformidade'
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
      title: 'Gestão de Riscos',
      url: '/risks',
      icon: AlertTriangle,
      permissions: ['risk.read', 'all'],
      description: 'Gestão completa de riscos corporativos com ALEX RISK'
    },

    {
      title: 'Incidentes',
      url: '/incidents',
      icon: Zap,
      permissions: ['incident.read', 'all'],
      description: 'Gestão de incidentes de segurança'
    },
    {
      title: 'Gestão de Políticas',
      url: '/policy-management',
      icon: FileCheck,
      permissions: ['compliance.read', 'all'],
      description: 'Ciclo completo de gestão de políticas com Alex Policy IA - NOVO'
    },
    {
      title: 'Privacidade e LGPD',
      url: '/privacy',
      icon: KeyRound,
      permissions: ['privacy.read', 'all'],
      description: 'Gestão de privacidade e proteção de dados'
    },
    {
      title: 'Vendor Risk',
      url: '/vendors',
      icon: Users,
      permissions: ['vendor.read', 'all'],
      description: 'Gestão de riscos de terceiros'
    },
    {
      title: 'Relatórios',
      url: '/reports',
      icon: BarChart3,
      permissions: ['report.read', 'all'],
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
  label: 'Administração da Plataforma',
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
    description: 'Gestão de organizações e limites'
  }, {
    title: 'Gestão de IA',
    url: '/admin/ai-management',
    icon: Brain,
    permissions: ['platform_admin'],
    description: 'Configuração e gestão de assistentes de IA'
  }]
}];
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
  const collapsed = state === "collapsed";
  const currentPath = location.pathname;
  const hasPermission = (permissions: string[]) => {
    if (!user) return false;
    if (permissions.includes('all')) return true;
    
    // Verificar permissão especial para platform_admin
    if (permissions.includes('platform_admin')) {
      console.log(`[Sidebar] Checking platform_admin permission: isPlatformAdmin=${user.isPlatformAdmin}`);
      return user.isPlatformAdmin;
    }
    
    const hasDirectPermission = permissions.some(permission => user.permissions?.includes(permission) || user.permissions?.includes('all'));
    console.log(`[Sidebar] Checking permissions ${JSON.stringify(permissions)}: hasDirectPermission=${hasDirectPermission}, userPermissions=${JSON.stringify(user.permissions)}`);
    
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
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{getTenantDisplayName(user?.tenant)}</p>
            </div>
          </div>}
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
                  group.label === 'Administração da Plataforma' 
                    ? 'text-orange-600 dark:text-orange-400 border-b border-orange-200 dark:border-orange-800 pb-1 sm:pb-2' 
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
      </SidebarContent>


    </Sidebar>;
}