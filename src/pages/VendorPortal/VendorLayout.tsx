import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Bell, User, LogOut, Activity, ShieldCheck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
    SidebarProvider,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar
} from '@/components/ui/sidebar';

const VendorSidebar = () => {
    const { state, setOpenMobile, isMobile } = useSidebar();
    const location = useLocation();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = React.useState(0);

    const collapsed = state === "collapsed";

    const navItems = [
        { name: 'Dashboard', path: '/vendor-portal', icon: LayoutDashboard },
        { name: 'Avaliações', path: '/vendor-portal/assessments', icon: CheckSquare },
        { name: 'Planos de Ação', path: '/vendor-portal/action-plans', icon: Activity },
        { name: 'Mensagens', path: '/vendor-portal/messages', icon: Bell },
    ];

    // Fetch unread message count
    React.useEffect(() => {
        const fetchUnread = async () => {
            if (!user) return;
            try {
                let vid = null;
                const { data: vUser } = await supabase.from('vendor_users').select('vendor_id').eq('auth_user_id', user.id).limit(1).maybeSingle();
                if (vUser?.vendor_id) vid = vUser.vendor_id;
                else {
                    const { data: pUser } = await supabase.from('vendor_portal_users').select('vendor_id').eq('email', user.email?.trim().toLowerCase()).limit(1).maybeSingle();
                    if (pUser?.vendor_id) vid = pUser.vendor_id;
                }
                if (vid) {
                    const { count } = await supabase
                        .from('vendor_risk_messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('vendor_id', vid)
                        .eq('sender_type', 'internal')
                        .eq('read', false);
                    setUnreadCount(count || 0);
                }
            } catch { }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const isActiveRoute = (path: string) => {
        if (path === '/vendor-portal') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <Sidebar className="border-r border-border" collapsible="icon">
            <div className={`${collapsed ? "h-14 px-2" : "h-14 sm:h-16 px-3 sm:px-4"} flex items-center justify-between border-b border-border transition-all duration-300`}>
                {!collapsed && (
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <img src="/logo.png?v=2" alt="GEPRIV Logo" className="h-6 w-6 sm:h-8 sm:w-8 object-contain flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                            <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">Gepriv Vendor</h1>
                        </div>
                    </div>
                )}
                <SidebarTrigger className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground p-1.5 sm:p-2 rounded-md" />
            </div>

            <SidebarContent className={`${collapsed ? "px-1 py-2" : "px-1 sm:px-2 py-2 sm:py-3"} transition-all duration-300`}>
                <SidebarGroup className="mb-4 sm:mb-6">
                    {!collapsed && (
                        <SidebarGroupLabel className="mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-1 sm:px-0 text-muted-foreground">
                            Menu Principal
                        </SidebarGroupLabel>
                    )}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive = isActiveRoute(item.path);

                                return (
                                    <SidebarMenuItem key={item.name}>
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                                            <NavLink
                                                to={item.path}
                                                className={cn(
                                                    "flex items-center w-full px-2 sm:px-3 py-4 sm:py-6 rounded-lg transition-all duration-200 group mb-1 sm:mb-2",
                                                    isActive ? "text-primary font-medium bg-sidebar-accent" : "hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-accent-foreground"
                                                )}
                                                onClick={() => {
                                                    if (isMobile) setOpenMobile(false);
                                                }}
                                            >
                                                <div className="relative">
                                                    <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                                    {item.name === 'Mensagens' && unreadCount > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-sidebar">
                                                            {unreadCount > 9 ? '9+' : unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                {!collapsed && (
                                                    <div className="ml-2 sm:ml-3 flex-1 min-w-0 py-[1px] sm:py-[2px]">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs sm:text-sm font-medium truncate">{item.name}</span>
                                                            {item.name === 'Mensagens' && unreadCount > 0 ? (
                                                                <span className="ml-auto mr-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                                    {unreadCount}
                                                                </span>
                                                            ) : (
                                                                <ChevronRight className="h-2 w-2 sm:h-3 sm:w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                                            )}
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

const VendorHeader = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const location = useLocation();
    const [hasNewMessages, setHasNewMessages] = React.useState(false);

    React.useEffect(() => {
        const checkMessages = async () => {
            if (!user) return;
            try {
                // Find vendor ID
                let vid = null;
                const { data: vUser } = await supabase.from('vendor_users').select('vendor_id').eq('auth_user_id', user.id).limit(1).maybeSingle();
                if (vUser?.vendor_id) vid = vUser.vendor_id;
                else {
                    const { data: pUser } = await supabase.from('vendor_portal_users').select('vendor_id').eq('email', user.email?.trim().toLowerCase()).limit(1).maybeSingle();
                    if (pUser?.vendor_id) vid = pUser.vendor_id;
                }

                if (vid) {
                    // Just a simple check if there are recent messages from admin
                    const { count } = await supabase
                        .from('vendor_risk_messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('vendor_id', vid)
                        .neq('sender_type', 'vendor');

                    if (count && count > 0) {
                        setHasNewMessages(true);
                    }
                }
            } catch (e) {
                console.error("Error checking messages", e);
            }
        };

        checkMessages();
    }, [user]);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/vendor-portal/login');
            toast({
                title: "Sessão encerrada",
                description: "Você saiu do portal do fornecedor.",
            });
        } catch (error) {
            console.error(error);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/vendor-portal' },
        { name: 'Avaliações', path: '/vendor-portal/assessments' },
        { name: 'Planos de Ação', path: '/vendor-portal/action-plans' },
        { name: 'Mensagens', path: '/vendor-portal/messages' },
    ];

    const currentRouteName = navItems.find(i => {
        if (i.path === '/vendor-portal') return location.pathname === i.path;
        return location.pathname.startsWith(i.path);
    })?.name || 'Portal';

    return (
        <header className="sticky top-0 z-30 w-full border-b border-border bg-card shadow-sm">
            <div className="flex h-14 sm:h-16 items-center px-3 sm:px-6 gap-2 sm:gap-4 justify-between">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />
                    <h2 className="text-sm font-semibold text-foreground md:hidden">
                        {currentRouteName}
                    </h2>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="flex items-center gap-1 md:gap-2 border-r border-border/50 pr-2 md:pr-4 mr-1">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 hidden md:flex"
                            onClick={() => navigate('/vendor-portal/messages')}
                        >
                            <Bell className="h-4 w-4" />
                            {hasNewMessages && (
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background"></span>
                            )}
                        </Button>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-auto pl-2 pr-3 py-1.5 gap-3 hover:bg-accent rounded-full md:rounded-md transition-colors">
                                <div className="relative">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                                        <span className="text-xs font-semibold text-primary">
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                                </div>
                                <div className="text-left hidden md:block">
                                    <p className="text-sm font-semibold leading-none text-foreground truncate max-w-[120px]">
                                        {user?.email?.split('@')[0]}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                                        Fornecedor
                                    </p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none border-b pb-2 mb-1 border-border text-foreground">Perfil Fornecedor</p>
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

const VendorLayoutContent = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>;
    }

    if (!user && location.pathname !== '/vendor-portal/login') {
        return <Navigate to="/vendor-portal/login" state={{ from: location }} replace />;
    }

    if (location.pathname === '/vendor-portal/login') {
        return <Outlet />;
    }

    return (
        <div className="relative min-h-screen w-full bg-background flex flex-col md:flex-row">
            <VendorSidebar />
            <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 w-full md:w-auto`}>
                <VendorHeader />
                <main className="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto bg-background">
                    <div className="max-w-[1400px] mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
                <footer className="bg-card border-t border-border py-4 px-6 mt-auto">
                    <div className="max-w-[1400px] text-center mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
                        <p>© {new Date().getFullYear()} Gepriv. Ambiente Seguro.</p>
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

export const VendorLayout = () => {
    return (
        <SidebarProvider defaultOpen={true}>
            <VendorLayoutContent />
        </SidebarProvider>
    );
};

export default VendorLayout;
