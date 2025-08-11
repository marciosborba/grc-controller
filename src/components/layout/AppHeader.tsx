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
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left side - Mobile menu and search */}
        <div className="flex items-center space-x-2">
          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          
          {/* Search - Hidden on mobile */}
          <div className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar riscos, políticas, assessments..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Mobile search button */}
          <div className="sm:hidden">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-danger">
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-3 space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {user?.name ? getUserInitials(user.name) : 'U'}
                  </span>
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">
                    {getUserDisplayName(user?.name, user?.email)}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.jobTitle}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem 
                onClick={handleProfileClick}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleProfileClick}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="flex items-center space-x-2 text-danger focus:text-danger cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};