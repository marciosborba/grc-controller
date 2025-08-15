import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { getUserFirstName, getUserInitials, getUserDisplayName } from '@/utils/userHelpers';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="h-full px-3 sm:px-4 md:px-6 flex items-center justify-between">
        {/* Left side - Mobile menu and search */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <SidebarTrigger className="p-1.5 sm:p-2" />
          </div>
          
          {/* Search - Hidden on mobile */}
          <div className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar riscos, políticas, assessments..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 text-sm"
              />
            </div>
          </div>

          {/* Mobile search button */}
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right side - Responsivo */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <Badge className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs bg-danger">
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 sm:h-10 px-1 sm:px-3 space-x-1 sm:space-x-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-primary">
                    {user?.name ? getUserInitials(user.name) : 'U'}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {getUserDisplayName(user?.name, user?.email)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.jobTitle}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              {/* Mobile: mostrar tema toggle no menu */}
              <div className="sm:hidden">
                <DropdownMenuItem className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm">Tema</span>
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </div>
              
              <DropdownMenuItem 
                onClick={handleProfileClick}
                className="flex items-center space-x-2 cursor-pointer px-3 py-2"
              >
                <User className="h-4 w-4" />
                <span className="text-sm">Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-2 cursor-pointer px-3 py-2"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Gestão de Usuários</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="flex items-center space-x-2 text-danger focus:text-danger cursor-pointer px-3 py-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};