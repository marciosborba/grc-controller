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

  // Debug: Log route changes com mais detalhes
  useEffect(() => {
    console.log('🗺️ [NAVIGATION] Route changed:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      timestamp: new Date().toISOString()
    });

    // Debug específico para AI Management
    if (location.pathname.includes('ai-management')) {
      console.log('🤖 [AI MANAGEMENT ROUTE] Detectada navegação para AI Management!');
      console.log('👤 [AI MANAGEMENT ROUTE] Rota detectada:', location.pathname);
    }

    // Debug específico para IA Manager
    if (location.pathname === '/ai-management') {
      console.log('🤖 [NAVIGATION] === NAVEGAÇÃO PARA IA MANAGER DETECTADA ===');
      console.log('🗺️ [NAVIGATION] Rota de destino: /ai-management');
      console.log('🕰️ [NAVIGATION] Timestamp:', new Date().toISOString());
      console.log('🎯 [NAVIGATION] A rota /ai-management foi alcançada com sucesso!');
      console.log('🤖 [NAVIGATION] === FIM DEBUG NAVEGAÇÃO ===');
    }

    // Debug para qualquer 404 ou erro
    if (location.pathname === '/404' || location.pathname.includes('not-found')) {
      console.log('❌ [NAVIGATION] 404 DETECTADO!');
      console.log('🗺️ [NAVIGATION] Rota que causou 404:', location.pathname);
      console.log('📊 [NAVIGATION] State:', location.state);
    }

    // Debug para redirecionamentos inesperados
    if (location.pathname !== '/ai-management' && location.state?.from === '/ai-management') {
      console.log('⚠️ [NAVIGATION] REDIRECIONAMENTO DETECTADO!');
      console.log('🗺️ [NAVIGATION] De: /ai-management');
      console.log('🗺️ [NAVIGATION] Para:', location.pathname);
      console.log('📊 [NAVIGATION] State:', location.state);
    }
  }, [location]);

  return (
    <div className="relative min-h-screen w-full bg-background">
      <AppSidebar />
      <div className={`absolute inset-y-0 right-0 flex flex-col transition-all duration-300 ${isCollapsed ? 'left-[3rem]' : 'left-[16rem]'}`}>
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