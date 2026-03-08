import React from 'react';
import { Outlet, Navigate, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
    LayoutDashboard, ShieldAlert, Target, LogOut, ChevronRight, Bell, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    SidebarProvider, Sidebar, SidebarContent, SidebarGroup,
    SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
    SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar
} from '@/components/ui/sidebar';

const navItems = [
    { name: 'Dashboard', path: '/risk-portal', icon: LayoutDashboard, exact: true },
    { name: 'Meus Riscos', path: '/risk-portal/my-risks', icon: ShieldAlert },
    { name: 'Planos de Ação', path: '/risk-portal/action-plans', icon: Target },
];

const RiskPortalSidebar = () => {
    const { state, setOpenMobile, isMobile } = useSidebar();
    const location = useLocation();
    const collapsed = state === 'collapsed';

    const isActive = (item: typeof navItems[0]) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <Sidebar className="border-r border-border" collapsible="icon">
            <div className={`${collapsed ? 'h-14 px-2' : 'h-14 sm:h-16 px-3 sm:px-4'} flex items-center justify-between border-b border-border transition-all duration-300`}>
                {!collapsed && (
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-600/10 flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-sm sm:text-base font-bold text-foreground truncate">Portal de Riscos</h1>
                        </div>
                    </div>
                )}
                <SidebarTrigger className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-1.5 sm:p-2 rounded-md" />
            </div>

            <SidebarContent className={`${collapsed ? 'px-1 py-2' : 'px-1 sm:px-2 py-2 sm:py-3'} transition-all duration-300`}>
                <SidebarGroup className="mb-4 sm:mb-6">
                    {!collapsed && (
                        <SidebarGroupLabel className="mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-1 sm:px-0 text-muted-foreground">
                            Menu Principal
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const active = isActive(item);
                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild isActive={active} tooltip={item.name}>
                                            <NavLink
                                                to={item.path}
                                                className={cn(
                                                    'flex items-center w-full px-2 sm:px-3 py-4 sm:py-5 rounded-lg transition-all duration-200 group mb-1',
                                                    active
                                                        ? 'text-red-600 font-medium bg-red-500/10'
                                                        : 'hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-accent-foreground'
                                                )}
                                                onClick={() => { if (isMobile) setOpenMobile(false); }}
                                            >
                                                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                {!collapsed && (
                                                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs sm:text-sm font-medium truncate">{item.name}</span>
                                                            <ChevronRight className="h-2 w-2 sm:h-3 sm:w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                        </div>
                                                    </div>
                                                )}
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

const RiskPortalHeader = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const currentPage = navItems.find(i => {
        if (i.exact) return location.pathname === i.path;
        return location.pathname.startsWith(i.path);
    })?.name || 'Portal de Riscos';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
        toast({ title: 'Sessão encerrada', description: 'Você saiu do Portal de Riscos.' });
    };

    return (
        <header className="sticky top-0 z-30 w-full border-b border-border bg-card shadow-sm">
            <div className="flex h-14 sm:h-16 items-center px-3 sm:px-6 gap-2 sm:gap-4 justify-between">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />
                    <h2 className="text-sm font-semibold text-foreground md:hidden">{currentPage}</h2>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-1 md:gap-2 border-r border-border/50 pr-2 md:pr-4 mr-1">
                        <ThemeToggle />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-auto pl-2 pr-3 py-1.5 gap-3 hover:bg-accent rounded-full md:rounded-md transition-colors">
                                <div className="relative">
                                    <div className="h-8 w-8 rounded-full bg-red-600/10 flex items-center justify-center overflow-hidden border border-border">
                                        <span className="text-xs font-semibold text-red-600">
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-semibold leading-none text-foreground truncate max-w-[120px]">
                                        {user?.email?.split('@')[0]}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">Parte Interessada</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none border-b pb-2 mb-1 border-border text-foreground">Portal de Riscos</p>
                                    <p className="text-xs leading-none text-muted-foreground truncate pt-1">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sair do sistema</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

const RiskPortalLayoutContent = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
    }

    return (
        <div className="relative min-h-screen w-full bg-background flex flex-col md:flex-row">
            <RiskPortalSidebar />
            <div className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 w-full md:w-auto">
                <RiskPortalHeader />
                <main className="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto bg-background">
                    <div className="max-w-[1400px] mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
                <footer className="bg-card border-t border-border py-4 px-6 mt-auto">
                    <div className="max-w-[1400px] text-center mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
                        <p>© {new Date().getFullYear()} GRC Controller — Portal de Gestão de Riscos</p>
                        <div className="flex space-x-4">
                            <span className="hover:text-foreground cursor-pointer transition-colors">Privacidade</span>
                            <span className="hover:text-foreground cursor-pointer transition-colors">Suporte</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export const RiskPortalLayout = () => (
    <SidebarProvider defaultOpen={true}>
        <RiskPortalLayoutContent />
    </SidebarProvider>
);

export default RiskPortalLayout;
