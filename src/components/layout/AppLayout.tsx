import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebarFixed as AppSidebar } from './AppSidebarFixed';
import { AppHeader } from './AppHeader';

const AppLayoutContent = () => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  return (
    <div className="relative min-h-screen w-full bg-background">
      <AppSidebar />
      <div className={`absolute inset-y-0 right-0 flex flex-col transition-all duration-300 ${isCollapsed ? 'left-[2.0625rem]' : 'left-[15.0625rem]'}`}>
        <AppHeader />
        <main className="flex-1 pl-6 sm:pl-8 lg:pl-10 pr-4 sm:pr-6 lg:pr-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6 lg:pb-8 overflow-auto bg-background">
          <Outlet />
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