// =====================================================
// VULNERABILITY MANAGEMENT MODULE EXPORTS
// =====================================================

// Main Components
export { default as VulnerabilityDashboard } from './VulnerabilityDashboard';
export { default as VulnerabilityManagement } from './VulnerabilityManagement';
export { default as VulnerabilityImport } from './VulnerabilityImport';
export { default as VulnerabilityClassification } from './VulnerabilityClassification';
export { default as VulnerabilityReports } from './VulnerabilityReports';
export { default as VulnerabilityForm } from './VulnerabilityForm';

// Hooks
export { useVulnerabilities } from './hooks/useVulnerabilities';

// Types
export type {
  Vulnerability,
  VulnerabilitySeverity,
  VulnerabilityStatus,
  VulnerabilitySource,
  VulnerabilityFilter,
  VulnerabilityMetrics,
  VulnerabilityEvidence,
  RemediationEffort,
  BusinessImpact,
  AssetType
} from './types/vulnerability';

// Re-export for convenience
export * from './types/vulnerability';