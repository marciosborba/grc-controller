import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  FileCheck,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronRight,
  Brain,
  Eye,
  Zap
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

const navigationItems = [
  {
    label: 'Principal',
    items: [
      {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        permissions: ['all'],
        description: 'Visão geral e métricas principais'
      },
      {
        title: 'Gestão de Riscos',
        url: '/risks',
        icon: AlertTriangle,
        permissions: ['risk.read', 'all'],
        description: 'Identificação e mitigação de riscos'
      },
      {
        title: 'Assessments',
        url: '/assessments',
        icon: ClipboardList,
        permissions: ['assessment.read', 'all'],
        description: 'Questionários e avaliações'
      }
    ]
  },
  {
    label: 'Compliance',
    items: [
      {
        title: 'Políticas',
        url: '/policies',
        icon: FileCheck,
        permissions: ['compliance.read', 'all'],
        description: 'Gestão de políticas corporativas'
      },
      {
        title: 'Auditoria',
        url: '/audit',
        icon: Eye,
        permissions: ['audit.read', 'all'],
        description: 'Planejamento e execução de auditorias'
      },
      {
        title: 'Incidentes',
        url: '/incidents',
        icon: Zap,
        permissions: ['incident.read', 'all'],
        description: 'Canal de ética e gestão de incidentes'
      }
    ]
  },
  {
    label: 'Gestão',
    items: [
      {
        title: 'Fornecedores',
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
      }
    ]
  },
  {
    label: 'Sistema',
    items: [
      {
        title: 'Configurações',
        url: '/settings',
        icon: Settings,
        permissions: ['admin', 'all'],
        description: 'Configurações da plataforma'
      },
      {
        title: 'Ajuda',
        url: '/help',
        icon: HelpCircle,
        permissions: ['all'],
        description: 'Centro de ajuda e documentação'
      }
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  
  const collapsed = state === "collapsed";
  const currentPath = location.pathname;

  const hasPermission = (permissions: string[]) => {
    if (!user) return false;
    if (permissions.includes('all')) return true;
    return permissions.some(permission => 
      user.permissions.includes(permission) || user.permissions.includes('all')
    );
  };

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
  
  const getNavCls = (isActiveItem: boolean) =>
    isActiveItem 
      ? "bg-primary/10 text-primary font-medium border border-primary/20" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-72"} transition-all duration-300 border-r border-border`}
      collapsible="icon"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Controller GRC</h1>
              <p className="text-xs text-muted-foreground">Governança • Riscos • Compliance</p>
            </div>
          </div>
        )}
        <SidebarTrigger className="hover:bg-muted/50 p-2 rounded-md" />
      </div>

      {/* AI Assistant Banner */}
      {!collapsed && (
        <div className="m-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Assistente IA</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Pronto para ajudar com análises e insights sobre seus dados de GRC
          </p>
        </div>
      )}

      <SidebarContent className="px-2">
        {navigationItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items
                  .filter(item => hasPermission(item.permissions))
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={`${getNavCls(isActive(item.url))} flex items-center w-full p-3 rounded-lg transition-all duration-200 group`}
                          title={collapsed ? item.title : ''}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!collapsed && (
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{item.title}</span>
                                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-xs opacity-75 mt-0.5 truncate">
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
        ))}
      </SidebarContent>

      {/* User Info */}
      {!collapsed && user && (
        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.jobTitle}</p>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}