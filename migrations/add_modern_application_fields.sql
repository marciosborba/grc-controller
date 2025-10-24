-- Migration: Add modern application fields for 2024
-- Date: 2024-01-15
-- Description: Add cloud, containerization, DevOps, and compliance fields

-- Add cloud and containerization fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS container_platform VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cloud_provider VARCHAR(100);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS deployment_model VARCHAR(50) CHECK (deployment_model IN ('On-premise', 'Cloud', 'Hybrid', 'Edge', 'Multi-cloud'));

-- Add DevOps and CI/CD fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ci_cd_pipeline JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS deployment_frequency VARCHAR(20) CHECK (deployment_frequency IN ('On-demand', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'));
ALTER TABLE applications ADD COLUMN IF NOT EXISTS lead_time_days INTEGER;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS mttr_hours INTEGER; -- Mean Time To Recovery

-- Add modern compliance fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS gdpr_applicable BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS sox_compliance BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS pci_scope BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS hipaa_applicable BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS iso27001_scope BOOLEAN DEFAULT FALSE;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS data_residency_requirements TEXT;

-- Add security and monitoring fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS security_scan_results JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS dependencies JSONB; -- Array of dependencies
ALTER TABLE applications ADD COLUMN IF NOT EXISTS licenses JSONB; -- Array of software licenses
ALTER TABLE applications ADD COLUMN IF NOT EXISTS monitoring_tools TEXT[]; -- Array of monitoring tools
ALTER TABLE applications ADD COLUMN IF NOT EXISTS log_aggregation_tools TEXT[]; -- Array of logging tools

-- Add performance and SLA fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS availability_sla DECIMAL(5,2); -- Percentage (99.99)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS performance_metrics JSONB;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS backup_strategy TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS disaster_recovery_plan TEXT;

-- Add API and integration fields
ALTER TABLE applications ADD COLUMN IF NOT EXISTS api_endpoints JSONB; -- Array of API endpoints
ALTER TABLE applications ADD COLUMN IF NOT EXISTS integration_points JSONB; -- External integrations
ALTER TABLE applications ADD COLUMN IF NOT EXISTS microservices_architecture BOOLEAN DEFAULT FALSE;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_applications_container_platform ON applications(container_platform);
CREATE INDEX IF NOT EXISTS idx_applications_cloud_provider ON applications(cloud_provider);
CREATE INDEX IF NOT EXISTS idx_applications_deployment_model ON applications(deployment_model);
CREATE INDEX IF NOT EXISTS idx_applications_gdpr ON applications(gdpr_applicable);
CREATE INDEX IF NOT EXISTS idx_applications_sox ON applications(sox_compliance);
CREATE INDEX IF NOT EXISTS idx_applications_pci ON applications(pci_scope);
CREATE INDEX IF NOT EXISTS idx_applications_microservices ON applications(microservices_architecture);

-- Create GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_applications_ci_cd_pipeline ON applications USING GIN (ci_cd_pipeline);
CREATE INDEX IF NOT EXISTS idx_applications_security_scan_results ON applications USING GIN (security_scan_results);
CREATE INDEX IF NOT EXISTS idx_applications_dependencies ON applications USING GIN (dependencies);
CREATE INDEX IF NOT EXISTS idx_applications_licenses ON applications USING GIN (licenses);
CREATE INDEX IF NOT EXISTS idx_applications_performance_metrics ON applications USING GIN (performance_metrics);
CREATE INDEX IF NOT EXISTS idx_applications_api_endpoints ON applications USING GIN (api_endpoints);
CREATE INDEX IF NOT EXISTS idx_applications_integration_points ON applications USING GIN (integration_points);

-- Create GIN indexes for array fields
CREATE INDEX IF NOT EXISTS idx_applications_monitoring_tools ON applications USING GIN (monitoring_tools);
CREATE INDEX IF NOT EXISTS idx_applications_log_aggregation_tools ON applications USING GIN (log_aggregation_tools);

-- Add comments for new fields
COMMENT ON COLUMN applications.container_platform IS 'Container platform: Docker, Kubernetes, OpenShift, etc.';
COMMENT ON COLUMN applications.cloud_provider IS 'Cloud provider: AWS, Azure, GCP, Multi-cloud, etc.';
COMMENT ON COLUMN applications.deployment_model IS 'Deployment model: On-premise, Cloud, Hybrid, Edge, Multi-cloud';
COMMENT ON COLUMN applications.ci_cd_pipeline IS 'CI/CD pipeline information in JSON format';
COMMENT ON COLUMN applications.deployment_frequency IS 'How often the application is deployed';
COMMENT ON COLUMN applications.lead_time_days IS 'Lead time from commit to production in days';
COMMENT ON COLUMN applications.mttr_hours IS 'Mean Time To Recovery in hours';
COMMENT ON COLUMN applications.gdpr_applicable IS 'Whether GDPR regulations apply to this application';
COMMENT ON COLUMN applications.sox_compliance IS 'Whether SOX compliance is required';
COMMENT ON COLUMN applications.pci_scope IS 'Whether application is in PCI compliance scope';
COMMENT ON COLUMN applications.hipaa_applicable IS 'Whether HIPAA regulations apply';
COMMENT ON COLUMN applications.iso27001_scope IS 'Whether application is in ISO 27001 scope';
COMMENT ON COLUMN applications.data_residency_requirements IS 'Data residency and sovereignty requirements';
COMMENT ON COLUMN applications.security_scan_results IS 'Latest security scan results in JSON format';
COMMENT ON COLUMN applications.dependencies IS 'Application dependencies in JSON format';
COMMENT ON COLUMN applications.licenses IS 'Software licenses used by the application';
COMMENT ON COLUMN applications.monitoring_tools IS 'Array of monitoring tools used';
COMMENT ON COLUMN applications.log_aggregation_tools IS 'Array of log aggregation tools used';
COMMENT ON COLUMN applications.availability_sla IS 'Availability SLA percentage (e.g., 99.99)';
COMMENT ON COLUMN applications.performance_metrics IS 'Performance metrics and thresholds in JSON format';
COMMENT ON COLUMN applications.backup_strategy IS 'Backup strategy description';
COMMENT ON COLUMN applications.disaster_recovery_plan IS 'Disaster recovery plan description';
COMMENT ON COLUMN applications.api_endpoints IS 'API endpoints exposed by the application';
COMMENT ON COLUMN applications.integration_points IS 'External system integrations';
COMMENT ON COLUMN applications.microservices_architecture IS 'Whether application uses microservices architecture';

-- Update the application_stats view to include new metrics
CREATE OR REPLACE VIEW application_stats AS
SELECT 
    tenant_id,
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'Ativo') as active_applications,
    COUNT(*) FILTER (WHERE criticality = 'Critical') as critical_applications,
    COUNT(*) FILTER (WHERE environment = 'Production') as production_applications,
    COUNT(*) FILTER (WHERE type = 'Web Application') as web_applications,
    COUNT(*) FILTER (WHERE type = 'Mobile App') as mobile_applications,
    COUNT(*) FILTER (WHERE type = 'API') as api_applications,
    COUNT(*) FILTER (WHERE data_classification = 'Confidential' OR data_classification = 'Restricted') as sensitive_applications,
    -- New metrics
    COUNT(*) FILTER (WHERE cloud_provider IS NOT NULL) as cloud_applications,
    COUNT(*) FILTER (WHERE container_platform IS NOT NULL) as containerized_applications,
    COUNT(*) FILTER (WHERE microservices_architecture = TRUE) as microservices_applications,
    COUNT(*) FILTER (WHERE gdpr_applicable = TRUE) as gdpr_applications,
    COUNT(*) FILTER (WHERE sox_compliance = TRUE) as sox_applications,
    COUNT(*) FILTER (WHERE pci_scope = TRUE) as pci_applications,
    COUNT(*) FILTER (WHERE deployment_model = 'Cloud') as cloud_native_applications,
    COUNT(*) FILTER (WHERE deployment_model = 'Hybrid') as hybrid_applications,
    AVG(availability_sla) as average_availability_sla,
    AVG(lead_time_days) as average_lead_time_days,
    AVG(mttr_hours) as average_mttr_hours
FROM applications
GROUP BY tenant_id;

-- Grant permissions
GRANT SELECT ON application_stats TO authenticated;
GRANT SELECT ON application_stats TO service_role;

-- Create a view for compliance reporting
CREATE OR REPLACE VIEW application_compliance_report AS
SELECT 
    tenant_id,
    app_id,
    name,
    type,
    environment,
    criticality,
    data_classification,
    gdpr_applicable,
    sox_compliance,
    pci_scope,
    hipaa_applicable,
    iso27001_scope,
    data_residency_requirements,
    cloud_provider,
    deployment_model,
    created_at,
    updated_at
FROM applications
WHERE gdpr_applicable = TRUE 
   OR sox_compliance = TRUE 
   OR pci_scope = TRUE 
   OR hipaa_applicable = TRUE 
   OR iso27001_scope = TRUE;

-- Grant permissions to compliance view
GRANT SELECT ON application_compliance_report TO authenticated;
GRANT SELECT ON application_compliance_report TO service_role;

-- Create a view for DevOps metrics
CREATE OR REPLACE VIEW application_devops_metrics AS
SELECT 
    tenant_id,
    app_id,
    name,
    type,
    deployment_frequency,
    lead_time_days,
    mttr_hours,
    ci_cd_pipeline,
    container_platform,
    cloud_provider,
    microservices_architecture,
    last_deployment,
    created_at,
    updated_at
FROM applications
WHERE ci_cd_pipeline IS NOT NULL 
   OR deployment_frequency IS NOT NULL 
   OR lead_time_days IS NOT NULL 
   OR mttr_hours IS NOT NULL;

-- Grant permissions to DevOps metrics view
GRANT SELECT ON application_devops_metrics TO authenticated;
GRANT SELECT ON application_devops_metrics TO service_role;
"