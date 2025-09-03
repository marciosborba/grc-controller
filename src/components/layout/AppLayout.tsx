import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebarFixed as AppSidebar } from './AppSidebarFixed';
import { AppHeader } from './AppHeader';
import ErrorBoundary from '@/components/ErrorBoundary';

const AppLayoutContent = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';
  
  // Debug: Log route changes
  useEffect(() => {
    console.log('🗺️ [NAVIGATION] Route changed to:', location.pathname);
  }, [location.pathname]);
  
  return (
    <div className="relative min-h-screen w-full bg-background">
      <AppSidebar />
      <div className={`absolute inset-y-0 right-0 flex flex-col transition-all duration-300 ${isCollapsed ? 'left-[2.0625rem]' : 'left-[15.0625rem]'}`}>
        <AppHeader />
        <main className="flex-1 pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-8 overflow-auto bg-background">
          <ErrorBoundary>
            <React.Suspense fallback={
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
              </div>
            }>
              <Outlet />
            </React.Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

const AppLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppLayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;