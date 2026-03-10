import { lazy } from 'react';

// Lazy load dos componentes pesados de riscos para melhor performance
export const RiskManagementPage = lazy(() => import('./RiskManagementPage'));
export const RiskMatrix = lazy(() => import('./RiskMatrix'));
export const AdvancedRiskAnalysis = lazy(() => import('./AdvancedRiskAnalysis'));
export const RiskIntelligentAnalysis = lazy(() => import('./RiskIntelligentAnalysis'));
export const IntegratedRiskManagement = lazy(() => import('./IntegratedRiskManagement'));
export const RiskManagementCenter = lazy(() => import('./RiskManagementCenter'));
export const RiskAcceptanceLetter = lazy(() => import('./RiskAcceptanceLetter'));
export const RiskReports = lazy(() => import('./RiskReports'));
export const ActionPlansManagementPage = lazy(() => import('./ActionPlansManagementPage'));

// Componentes das views também podem ser lazy loaded
export const RiskMatrixView = lazy(() => import('./views/RiskMatrixView'));
export const TableView = lazy(() => import('./views/TableView'));
export const KanbanView = lazy(() => import('./views/KanbanView'));
export const DashboardView = lazy(() => import('./views/DashboardView'));

// Loading component otimizado
export const RiskComponentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm text-muted-foreground">Carregando módulo de riscos...</p>
    </div>
  </div>
);