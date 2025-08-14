import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, AlertTriangle, FileCheck, Users, ClipboardList, BarChart3, Settings, HelpCircle, ChevronRight, Brain, Eye, Zap, Building2, Activity, KeyRound, Database } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { getUserFirstName, getUserInitials, getUserDisplayName } from '@/utils/userHelpers';
import { getTenantDisplayName } from '@/utils/tenantHelpers';
const navigationItems = [{
  label: 'Principal',
  items: [{
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    permissions: ['all'],
    description: 'Visão geral e métricas principais'
  }, {
    title: 'Gestão de Riscos',
    url: '/risks',
    icon: AlertTriangle,
    permissions: ['risk.read', 'all'],
    description: 'Identificação e mitigação de riscos'
  }, {
    title: 'Assessments',
    url: '/assessments',
    icon: ClipboardList,
    permissions: ['assessment.read', 'all'],
    description: 'Questionários e avaliações'
  }]
}, {
  label: 'Compliance',
  items: [{
    title: 'Políticas',
    url: '/policies',
    icon: FileCheck,
    permissions: ['compliance.read', 'all'],
    description: 'Gestão de políticas corporativas'
  }, {
    title: 'Incidentes',
    url: '/incidents',
    icon: Zap,
    permissions: ['incident.read', 'all'],
    description: 'Gestão de incidentes de segurança'
  }, {
    title: 'Canal de Ética',
    url: '/ethics',
    icon: Shield,
    permissions: ['all'],
    description: 'Denúncias e questões éticas'
  }, {
    title: 'Conformidade',
    url: '/compliance',
    icon: FileCheck,
    permissions: ['compliance.read', 'all'],
    description: 'Controles de conformidade'
  }, {
    title: 'Privacidade e LGPD',
    url: '/privacy',
    icon: KeyRound,
    permissions: ['privacy.read', 'all'],
    description: 'Gestão de privacidade e proteção de dados'
  }]
}, {
  label: 'Gestão',
  items: [{
    title: 'Auditoria',
    url: '/audit',
    icon: Eye,
    permissions: ['audit.read', 'all'],
    description: 'Planejamento e execução de auditorias'
  }, {
    title: 'Vendor Risk',
    url: '/vendors',
    icon: Users,
    permissions: ['vendor.read', 'all'],
    description: 'Gestão de riscos de terceiros'
  }, {
    title: 'Relatórios',
    url: '/reports',
    icon: BarChart3,
    permissions: ['report.read', 'all'],
    description: 'Relatórios e dashboards personalizados'
  }]
}, {
  label: 'Sistema',
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
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
    permissions: ['admin', 'all'],
    description: 'Configurações da plataforma'
  }, {
    title: 'Ajuda',
    url: '/help',
    icon: HelpCircle,
    permissions: ['all'],
    description: 'Centro de ajuda e documentação'
  }]
}];
export function AppSidebar() {
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
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
  const getNavCls = (isActiveItem: boolean) => isActiveItem ? "bg-primary/10 text-primary font-medium border border-primary/20" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  const handleProfileClick = () => {
    navigate('/profile');
  };
  return <Sidebar className={`${collapsed ? "w-16" : "w-72"} transition-all duration-300 border-r border-border`} collapsible="icon">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground">GRC Controller
          </h1>
              <p className="text-xs text-muted-foreground">{getTenantDisplayName(user?.tenant)}</p>
            </div>
          </div>}
        <SidebarTrigger className="hover:bg-muted/50 p-2 rounded-md" />
      </div>

      {/* AI Assistant Banner */}
      {!collapsed && <div className="m-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Assistente IA</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pronto para ajudar com análises e insights sobre seus dados de GRC
          </p>
        </div>}

      <SidebarContent className="px-2 py-4">
        {navigationItems.map((group, groupIndex) => <SidebarGroup key={groupIndex} className="mb-6">
            {!collapsed && <SidebarGroupLabel className="mb-3">{group.label}</SidebarGroupLabel>}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.filter(item => hasPermission(item.permissions)).map(item => <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} className={`${getNavCls(isActive(item.url))} flex items-center w-full px-3 py-6 rounded-lg transition-all duration-200 group mb-2`} title={collapsed ? item.title : ''}>
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && <div className="ml-3 flex-1 min-w-0 py-[2px]">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{item.title}</span>
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs opacity-75 mt-0.5 truncate">
                                {item.description}
                              </p>
                            </div>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>)}
      </SidebarContent>

      {/* User Info */}
      {!collapsed && user && <div className="mt-auto p-4 border-t border-border">
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 transition-colors"
            onClick={handleProfileClick}
            title="Ir para configurações de perfil"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.name ? getUserInitials(user.name) : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {getUserDisplayName(user.name, user.email)}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.jobTitle}</p>
            </div>
          </div>
        </div>}
    </Sidebar>;
}