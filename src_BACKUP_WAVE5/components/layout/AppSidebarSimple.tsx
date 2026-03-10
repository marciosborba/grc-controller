import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Shield, AlertTriangle, FileCheck, Users, BarChart3, Settings, HelpCircle, KeyRound, Zap, Bell } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContextOptimized';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral e métricas principais'
  },
  {
    title: 'Riscos',
    url: '/risks',
    icon: AlertTriangle,
    description: 'Gestão de Riscos'
  },
  {
    title: 'Privacidade',
    url: '/privacy',
    icon: KeyRound,
    description: 'Gestão de LGPD'
  },
  {
    title: 'Políticas',
    url: '/policy-management',
    icon: FileCheck,
    description: 'Gestão de Políticas e Normas'
  },
  {
    title: 'TPRM',
    url: '/vendors',
    icon: Users,
    description: 'Gestão de Riscos de Terceiros'
  },
  {
    title: 'Incidentes',
    url: '/incidents',
    icon: Zap,
    description: 'Gestão de incidentes de segurança'
  },
  {
    title: 'Ética',
    url: '/ethics',
    icon: Shield,
    description: 'Denúncias e questões éticas'
  },
  {
    title: 'Relatórios',
    url: '/reports',
    icon: BarChart3,
    description: 'Relatórios e dashboards personalizados'
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
    description: 'Configurações do sistema'
  },
  {
    title: 'Ajuda',
    url: '/help',
    icon: HelpCircle,
    description: 'Centro de ajuda e documentação'
  }
];

export function AppSidebarSimple() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

  const collapsed = state === "collapsed";
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };
  
  const getNavCls = (isActiveItem: boolean) => 
    isActiveItem ? "text-primary font-medium bg-muted" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar className="border-r border-border" collapsible="icon">
      {/* Header */}
      <div className={`${collapsed ? "h-14 px-2" : "h-14 sm:h-16 px-3 sm:px-4"} flex items-center justify-between border-b border-border transition-all duration-300`}>
        {!collapsed && (
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">GRC Controller</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {user?.name || 'Usuário'}
              </p>
            </div>
          </div>
        )}
        <SidebarTrigger className="hover:bg-muted/50 p-1.5 sm:p-2 rounded-md" />
      </div>

      <SidebarContent className={`${collapsed ? "px-1 py-2" : "px-1 sm:px-2 py-2 sm:py-3"} transition-all duration-300`}>
        <SidebarGroup className="mb-4 sm:mb-6">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => (
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
                          <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
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
      </SidebarContent>
    </Sidebar>
  );
}