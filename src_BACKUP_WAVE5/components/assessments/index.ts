// =====================================================
// ASSESSMENT MODULE EXPORTS - LAZY LOADED
// =====================================================

import { lazy } from 'react';

// Main components com lazy loading
export const AssessmentHub = lazy(() => import('./AssessmentHub'));
export const AssessmentExecutionWizard = lazy(() => import('./AssessmentExecutionWizard'));

// Legacy components (deprecated - mantidos para compatibilidade)
export const AssessmentsDashboard = lazy(() => import('./AssessmentsDashboard'));
export const AssessmentExecution = lazy(() => import('./AssessmentExecution'));
export const AssessmentsList = lazy(() => import('./AssessmentsList'));
export const FrameworksAssessment = lazy(() => import('./FrameworksAssessment'));
export const ActionPlansManagementProfessional = lazy(() => import('./ActionPlansManagementProfessional'));

// New optimized components
export const FrameworkBuilder = lazy(() => import('./FrameworkBuilder'));
export const AssessmentAnalytics = lazy(() => import('./components/AssessmentAnalytics'));
export const AssessmentReports = lazy(() => import('./components/AssessmentReports'));

// Views
export const AssessmentsDashboardSimple = lazy(() => import('./views/AssessmentsDashboardSimple'));
export const FrameworksManagement = lazy(() => import('./views/FrameworksManagement'));

// Types re-export
export type { AssessmentHubProps } from './AssessmentHub';

// Default export for main hub
export default AssessmentHub;