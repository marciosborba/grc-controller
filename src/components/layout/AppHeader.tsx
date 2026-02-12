import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, Search, LogOut, User, Settings, HelpCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContextOptimized';
import { getUserInitials, getUserDisplayName } from '@/utils/userHelpers';
import { useNotifications } from '@/hooks/useNotifications';
import { TenantSelector } from '@/components/ui/tenant-selector';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  // Generate breadcrumbs from location
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;

    // Format segment name (simple capitalization and hyphens removal)
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { name, url, isLast };
  });

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center px-6 gap-4">

        {/* Left Side: Mobile Trigger, Breadcrumbs & Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="h-4 w-[1px] bg-border mx-2 hidden md:block" />

            {/* Breadcrumbs */}
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">
                      <Home className="h-4 w-4" />
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.length > 0 && <BreadcrumbSeparator />}

                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.url}>
                    <BreadcrumbItem>
                      {item.isLast ? (
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={item.url}>{item.name}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!item.isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex-1 max-w-xl px-4 hidden lg:flex">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Buscar (Cmd+K)..."
                className="pl-9 pr-12 h-9 bg-background/50 border-input focus:bg-background transition-all duration-200 w-full"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Tenant Selector (Admin Only) */}
          <div className="hidden xl:block">
            <TenantSelector />
          </div>

          <div className="flex items-center gap-1 md:gap-2 border-r border-border/50 pr-2 md:pr-4 mr-1">
            <div className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 hidden sm:flex"
              title="Ajuda e Suporte"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={handleNotificationsClick}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-background rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto pl-2 pr-3 py-1.5 gap-3 hover:bg-accent rounded-full md:rounded-md transition-colors">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || 'Avatar'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-primary">
                        {user?.name ? getUserInitials(user.name) : 'U'}
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                </div>

                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    {getUserDisplayName(user?.name, user?.email)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {user?.jobTitle || 'Membro da Equipe'}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" forceMount>
              {/* Mobile Only Section */}
              <div className="lg:hidden p-2">
                <TenantSelector />
                <DropdownMenuSeparator className="my-2" />
              </div>

              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer sm:hidden">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Ajuda</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair da Conta</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};