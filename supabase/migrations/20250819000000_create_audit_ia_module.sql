-- ============================================================================
-- AUDIT IA MODULE - COMPREHENSIVE DATABASE SCHEMA
-- ============================================================================
-- Advanced AI-powered audit management system with Big Four methodologies
-- Includes Alex Audit AI integration and intelligent automation features

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY AND EXTENSIONS
-- ============================================================================
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- MAIN AUDIT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT,
    audit_number TEXT UNIQUE NOT NULL, -- Auto-generated audit number
    audit_type TEXT NOT NULL CHECK (audit_type IN (
        'Internal Audit', 'External Audit', 'Regulatory Audit', 'Certification Audit',
        'Vendor Audit', 'Process Audit', 'IT Audit', 'Financial Audit',
        'Compliance Audit', 'Follow-up Audit', 'Special Investigation',
        'ESG Audit', 'AI/ML Audit', 'Cybersecurity Audit'
    )),
    audit_scope TEXT NOT NULL CHECK (audit_scope IN (
        'Organization-wide', 'Department Specific', 'Process Specific',
        'System Specific', 'Location Specific', 'Project Specific', 'Custom'
    )),
    scope_description TEXT,
    
    -- Status and Priority
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN (
        'Planning', 'Fieldwork', 'Review', 'Reporting', 'Follow-up',
        'Closed', 'Cancelled', 'On Hold', 'Draft'
    )),
    priority TEXT NOT NULL CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
    current_phase TEXT NOT NULL DEFAULT 'Planning' CHECK (current_phase IN (
        'Planning', 'Risk Assessment', 'Control Testing', 'Substantive Testing',
        'Reporting', 'Follow-up', 'Closure'
    )),
    
    -- Frequency and Planning
    frequency TEXT CHECK (frequency IN (
        'Ad-hoc', 'Annual', 'Semi-annual', 'Quarterly', 'Monthly', 'Continuous'
    )),
    is_recurring BOOLEAN DEFAULT false,
    parent_audit_id UUID REFERENCES audits(id), -- For follow-up audits
    
    -- Team Information
    lead_auditor UUID NOT NULL REFERENCES profiles(id),
    auditors UUID[] DEFAULT '{}',
    auditee_contacts UUID[] DEFAULT '{}',
    
    -- Dates
    planned_start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_start_date DATE,
    actual_end_date DATE,
    fieldwork_start_date DATE,
    fieldwork_end_date DATE,
    report_due_date DATE,
    report_issued_date DATE,
    
    -- Objectives and Criteria
    objectives TEXT[] DEFAULT '{}',
    audit_criteria TEXT[] DEFAULT '{}',
    applicable_regulations TEXT[] DEFAULT '{}',
    applicable_standards TEXT[] DEFAULT '{}',
    
    -- Budget and Resources
    budgeted_hours DECIMAL(10,2),
    actual_hours DECIMAL(10,2),
    estimated_cost DECIMAL(15,2),
    actual_cost DECIMAL(15,2),
    
    -- Results
    overall_opinion TEXT CHECK (overall_opinion IN (
        'Satisfactory', 'Needs Improvement', 'Unsatisfactory', 'Adequate', 'Inadequate'
    )),
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    executive_summary TEXT,
    key_findings_summary TEXT,
    
    -- Relationships
    related_audits UUID[] DEFAULT '{}',
    related_risks UUID[] DEFAULT '{}',
    related_compliance_requirements UUID[] DEFAULT '{}',
    
    -- Approvals
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    -- AI Integration
    ai_assistant_enabled BOOLEAN DEFAULT true,
    ai_risk_score DECIMAL(5,2),
    ai_recommendations JSONB DEFAULT '{}',
    automation_level TEXT DEFAULT 'Medium' CHECK (automation_level IN ('Low', 'Medium', 'High', 'Full')),
    
    -- Configuration
    confidentiality_level TEXT NOT NULL DEFAULT 'Internal' CHECK (confidentiality_level IN (
        'Public', 'Internal', 'Confidential', 'Restricted'
    )),
    retention_period INTEGER DEFAULT 7, -- years
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_responsible UUID REFERENCES profiles(id),
    
    -- Quality Assurance
    qa_reviewed BOOLEAN DEFAULT false,
    qa_reviewer UUID REFERENCES profiles(id),
    qa_review_date DATE,
    qa_notes TEXT,
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version TEXT DEFAULT '1.0'
);

-- ============================================================================
-- AUDIT PROGRAMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT,
    audit_area TEXT NOT NULL,
    
    -- Risks and Controls
    key_risks TEXT[] DEFAULT '{}',
    controls_to_test TEXT[] DEFAULT '{}',
    
    -- Resources
    estimated_hours DECIMAL(10,2) NOT NULL,
    assigned_auditor UUID NOT NULL REFERENCES profiles(id),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN (
        'Draft', 'Approved', 'In Progress', 'Completed', 'Cancelled'
    )),
    
    -- Dates
    start_date DATE,
    completion_date DATE,
    
    -- Approval
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    
    -- AI Enhancement
    ai_generated BOOLEAN DEFAULT false,
    ai_complexity_score DECIMAL(5,2),
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT PROCEDURES
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES audit_programs(id) ON DELETE CASCADE,
    
    -- Basic Information
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Type of Procedure
    procedure_type TEXT NOT NULL CHECK (procedure_type IN (
        'Walk-through', 'Inquiry', 'Observation', 'Inspection', 'Re-performance',
        'Analytical Review', 'Sampling', 'System Testing', 'Data Analysis'
    )),
    
    -- Objective
    objective TEXT NOT NULL,
    control_being_tested TEXT,
    
    -- Execution
    instructions TEXT NOT NULL,
    sample_selection_method TEXT,
    sample_size INTEGER,
    
    -- Documentation
    working_paper_reference TEXT,
    evidence_requirements TEXT[] DEFAULT '{}',
    
    -- Status
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN (
        'Not Started', 'In Progress', 'Completed', 'Not Applicable'
    )),
    
    -- Results
    results TEXT,
    exceptions TEXT,
    conclusion TEXT,
    
    -- Responsibility
    assigned_to UUID NOT NULL REFERENCES profiles(id),
    estimated_hours DECIMAL(10,2) NOT NULL,
    actual_hours DECIMAL(10,2),
    
    -- Dates
    planned_completion DATE NOT NULL,
    actual_completion DATE,
    
    -- Review
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    
    -- AI Assistance
    ai_suggested BOOLEAN DEFAULT false,
    ai_automation_possible BOOLEAN DEFAULT false,
    ai_generated_instructions TEXT,
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT FINDINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    finding_number TEXT NOT NULL, -- Sequential numbering per audit
    finding_type TEXT NOT NULL CHECK (finding_type IN (
        'Control Deficiency', 'Policy Violation', 'Process Gap', 'System Weakness',
        'Compliance Issue', 'Best Practice', 'Observation', 'Risk Exposure'
    )),
    severity TEXT NOT NULL CHECK (severity IN (
        'Critical', 'High', 'Medium', 'Low', 'Observation'
    )),
    
    -- Status and Tracking
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN (
        'Open', 'In Progress', 'Resolved', 'Verified', 'Closed', 'Overdue', 'Accepted Risk'
    )),
    
    -- Finding Details (4C Framework)
    condition TEXT NOT NULL, -- What was found
    criteria TEXT NOT NULL, -- What should be
    cause TEXT NOT NULL, -- Why it happened
    effect TEXT NOT NULL, -- Impact/consequences
    
    -- Context
    audit_area TEXT NOT NULL,
    control_reference TEXT,
    regulation_reference TEXT,
    
    -- Risk Classification
    likelihood TEXT NOT NULL CHECK (likelihood IN ('High', 'Medium', 'Low')),
    impact TEXT NOT NULL CHECK (impact IN ('High', 'Medium', 'Low')),
    risk_rating TEXT NOT NULL CHECK (risk_rating IN ('Critical', 'High', 'Medium', 'Low')),
    
    -- Working Paper Reference
    working_paper_reference TEXT,
    
    -- Auditee Response
    management_response TEXT,
    management_response_date DATE,
    agreed_action TEXT,
    target_resolution_date DATE,
    responsible_person UUID REFERENCES profiles(id),
    
    -- Resolution
    resolution_description TEXT,
    resolution_date DATE,
    resolved_by UUID REFERENCES profiles(id),
    verification_method TEXT,
    verification_date DATE,
    verified_by UUID REFERENCES profiles(id),
    
    -- Follow-up
    follow_up_audit_id UUID REFERENCES audits(id),
    is_repeat_finding BOOLEAN DEFAULT false,
    previous_finding_id UUID REFERENCES audit_findings(id),
    
    -- Communication
    communicated_to UUID[] DEFAULT '{}',
    escalated BOOLEAN DEFAULT false,
    escalation_date DATE,
    escalated_to UUID REFERENCES profiles(id),
    
    -- AI Enhancement
    ai_detected BOOLEAN DEFAULT false,
    ai_confidence_score DECIMAL(5,2),
    ai_root_cause_analysis JSONB,
    ai_suggested_remediation TEXT,
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    identified_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    identified_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT RECOMMENDATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES audit_findings(id) ON DELETE CASCADE,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    
    -- Category
    category TEXT NOT NULL CHECK (category IN (
        'Control Enhancement', 'Process Improvement', 'Policy Update',
        'Training', 'System Enhancement', 'Organizational', 'Other'
    )),
    
    -- Implementation
    implementation_effort TEXT NOT NULL CHECK (implementation_effort IN ('Low', 'Medium', 'High')),
    estimated_cost DECIMAL(15,2),
    estimated_time_to_implement INTEGER, -- days
    
    -- Responsibility
    responsible_person UUID REFERENCES profiles(id),
    target_implementation_date DATE,
    actual_implementation_date DATE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN (
        'Open', 'In Progress', 'Implemented', 'Verified', 'Closed', 'Rejected'
    )),
    
    -- Follow-up
    management_response TEXT,
    implementation_plan TEXT,
    progress_notes TEXT,
    
    -- Verification
    verification_method TEXT,
    verification_date DATE,
    verified_by UUID REFERENCES profiles(id),
    verification_evidence TEXT,
    
    -- Expected Benefits
    expected_benefits TEXT,
    risk_mitigation TEXT,
    compliance_improvement TEXT,
    
    -- AI Enhancement
    ai_generated BOOLEAN DEFAULT false,
    ai_priority_score DECIMAL(5,2),
    ai_implementation_guidance TEXT,
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT EVIDENCE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES audit_findings(id),
    working_paper_id UUID REFERENCES audit_working_papers(id),
    
    -- Evidence Information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'Document', 'Interview Notes', 'Screenshots', 'System Reports',
        'Photographs', 'Video Recording', 'Audio Recording', 'Database Query',
        'Log Files', 'Configuration Files', 'Email Correspondence', 'Third-party Confirmation'
    )),
    
    -- File Information
    file_name TEXT,
    file_url TEXT,
    file_size BIGINT,
    file_type TEXT,
    file_hash TEXT, -- For integrity verification
    
    -- Collection Metadata
    collected_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    collection_method TEXT NOT NULL,
    
    -- Quality Assessment
    reliability TEXT NOT NULL CHECK (reliability IN ('High', 'Medium', 'Low')),
    relevance TEXT NOT NULL CHECK (relevance IN ('High', 'Medium', 'Low')),
    sufficiency TEXT NOT NULL CHECK (sufficiency IN ('Sufficient', 'Insufficient')),
    
    -- Source Information
    evidence_source TEXT NOT NULL,
    source_contact UUID REFERENCES profiles(id),
    
    -- Chain of Custody
    chain_of_custody JSONB DEFAULT '[]',
    
    -- Analysis
    analysis_performed TEXT,
    conclusions TEXT,
    
    -- Retention
    retention_required BOOLEAN DEFAULT true,
    retention_period INTEGER DEFAULT 7, -- years
    destruction_date DATE,
    
    -- Confidentiality
    confidentiality_level TEXT NOT NULL DEFAULT 'Internal' CHECK (confidentiality_level IN (
        'Public', 'Internal', 'Confidential', 'Restricted'
    )),
    access_restrictions UUID[] DEFAULT '{}',
    
    -- AI Enhancement
    ai_analyzed BOOLEAN DEFAULT false,
    ai_extracted_metadata JSONB,
    ai_content_summary TEXT,
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT WORKING PAPERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_working_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    
    -- Basic Information
    title TEXT NOT NULL,
    description TEXT,
    paper_type TEXT NOT NULL CHECK (paper_type IN (
        'Test Plan', 'Test Results', 'Analysis', 'Summary', 'Checklist',
        'Interview Notes', 'Observation Log', 'Control Matrix', 'Risk Assessment', 'Other'
    )),
    
    -- Reference
    reference_number TEXT NOT NULL,
    section TEXT NOT NULL,
    
    -- Content
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    
    -- Test/Procedure Information
    audit_procedure TEXT,
    testing_method TEXT CHECK (testing_method IN (
        'Walk-through', 'Inquiry', 'Observation', 'Inspection', 'Re-performance',
        'Analytical Review', 'Sampling', 'System Testing', 'Data Analysis'
    )),
    sample_size INTEGER,
    population_size INTEGER,
    
    -- Results
    test_results TEXT,
    exceptions_noted TEXT,
    conclusions TEXT,
    
    -- Review Information
    prepared_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    prepared_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN (
        'Draft', 'Under Review', 'Approved', 'Finalized'
    )),
    
    -- Indexing
    index_references TEXT[] DEFAULT '{}',
    cross_references TEXT[] DEFAULT '{}',
    
    -- AI Features
    ai_auto_populated BOOLEAN DEFAULT false,
    ai_completion_percentage DECIMAL(5,2) DEFAULT 0,
    ai_suggestions JSONB DEFAULT '{}',
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    version INTEGER DEFAULT 1,
    updated_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT COMMUNICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    
    -- Communication Type
    type TEXT NOT NULL CHECK (type IN (
        'Opening Meeting', 'Status Update', 'Interim Report', 'Draft Report',
        'Final Report', 'Management Response', 'Follow-up', 'Closure'
    )),
    
    -- Recipients
    recipients JSONB NOT NULL DEFAULT '[]',
    
    -- Content
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    
    -- Channel
    communication_method TEXT NOT NULL CHECK (communication_method IN (
        'Email', 'Meeting', 'Document', 'Presentation', 'Portal'
    )),
    
    -- Status
    status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN (
        'Draft', 'Sent', 'Delivered', 'Acknowledged', 'Responded'
    )),
    
    -- Dates
    scheduled_date TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    response_received_at TIMESTAMPTZ,
    
    -- Template
    template_used TEXT,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- AI Enhancement
    ai_generated BOOLEAN DEFAULT false,
    ai_tone_analysis JSONB,
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT METRICS AND KPIs
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_metrics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Period Information
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Audit Volume Metrics
    total_audits INTEGER NOT NULL DEFAULT 0,
    audits_by_status JSONB DEFAULT '{}',
    audits_by_type JSONB DEFAULT '{}',
    audits_by_priority JSONB DEFAULT '{}',
    
    -- Finding Metrics
    total_findings INTEGER NOT NULL DEFAULT 0,
    findings_by_severity JSONB DEFAULT '{}',
    findings_by_status JSONB DEFAULT '{}',
    open_findings INTEGER NOT NULL DEFAULT 0,
    overdue_findings INTEGER NOT NULL DEFAULT 0,
    
    -- Performance Metrics
    average_audit_duration DECIMAL(10,2), -- days
    budget_variance_percentage DECIMAL(5,2),
    on_time_completion_rate DECIMAL(5,2),
    
    -- Quality Metrics
    findings_resolved_within_target INTEGER DEFAULT 0,
    repeat_findings_rate DECIMAL(5,2),
    client_satisfaction_score DECIMAL(5,2),
    
    -- Productivity Metrics
    audits_completed_per_auditor DECIMAL(10,2),
    hours_per_audit DECIMAL(10,2),
    findings_per_audit DECIMAL(10,2),
    
    -- Trend Analysis
    audit_volume_trend TEXT CHECK (audit_volume_trend IN ('Increasing', 'Decreasing', 'Stable')),
    finding_severity_trend TEXT CHECK (finding_severity_trend IN ('Improving', 'Deteriorating', 'Stable')),
    
    -- Coverage Metrics
    audit_coverage_by_area JSONB DEFAULT '{}',
    risk_coverage_percentage DECIMAL(5,2),
    
    -- AI Integration Metrics
    ai_automation_rate DECIMAL(5,2),
    ai_suggestion_accuracy DECIMAL(5,2),
    ai_time_savings_hours DECIMAL(10,2),
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ALEX AUDIT AI INTEGRATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS alex_audit_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
    
    -- Session Information
    session_type TEXT NOT NULL CHECK (session_type IN (
        'Planning', 'Risk Assessment', 'Procedure Generation', 'Finding Analysis',
        'Report Writing', 'Quality Review', 'General Consultation'
    )),
    
    -- AI Interaction
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    confidence_score DECIMAL(5,2),
    processing_time_ms INTEGER,
    
    -- Context
    context_data JSONB DEFAULT '{}',
    methodology_used TEXT,
    
    -- Feedback
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT TEMPLATES AND METHODOLOGIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template Information
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL CHECK (template_type IN (
        'Audit Program', 'Working Paper', 'Checklist', 'Report', 'Communication'
    )),
    audit_type TEXT CHECK (audit_type IN (
        'Internal Audit', 'External Audit', 'IT Audit', 'Financial Audit',
        'Compliance Audit', 'ESG Audit', 'AI/ML Audit'
    )),
    
    -- Template Content
    content JSONB NOT NULL,
    variables JSONB DEFAULT '{}',
    
    -- Methodology
    methodology TEXT CHECK (methodology IN (
        'Big Four Standard', 'IIA Standards', 'COSO Framework', 'Custom'
    )),
    industry_specific TEXT,
    
    -- Usage
    usage_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT false,
    
    -- AI Enhancement
    ai_generated BOOLEAN DEFAULT false,
    ai_optimization_level TEXT CHECK (ai_optimization_level IN ('Basic', 'Advanced', 'Expert')),
    
    -- Multi-tenant support
    tenant_id UUID NOT NULL DEFAULT auth.jwt() ->> 'tenant_id',
    
    -- Metadata
    created_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID NOT NULL DEFAULT auth.uid() REFERENCES profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version TEXT DEFAULT '1.0'
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Audits indexes
CREATE INDEX IF NOT EXISTS idx_audits_tenant_id ON audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_audits_audit_type ON audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_audits_lead_auditor ON audits(lead_auditor);
CREATE INDEX IF NOT EXISTS idx_audits_planned_dates ON audits(planned_start_date, planned_end_date);
CREATE INDEX IF NOT EXISTS idx_audits_search ON audits USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Audit findings indexes
CREATE INDEX IF NOT EXISTS idx_audit_findings_tenant_id ON audit_findings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_audit_id ON audit_findings(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_findings_status ON audit_findings(status);
CREATE INDEX IF NOT EXISTS idx_audit_findings_severity ON audit_findings(severity);
CREATE INDEX IF NOT EXISTS idx_audit_findings_responsible ON audit_findings(responsible_person);

-- Working papers indexes
CREATE INDEX IF NOT EXISTS idx_working_papers_tenant_id ON audit_working_papers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_working_papers_audit_id ON audit_working_papers(audit_id);
CREATE INDEX IF NOT EXISTS idx_working_papers_reference ON audit_working_papers(reference_number);

-- Evidence indexes
CREATE INDEX IF NOT EXISTS idx_audit_evidence_tenant_id ON audit_evidence(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_evidence_audit_id ON audit_evidence(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_evidence_finding_id ON audit_evidence(finding_id);

-- AI sessions indexes
CREATE INDEX IF NOT EXISTS idx_alex_audit_sessions_tenant_id ON alex_audit_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alex_audit_sessions_audit_id ON alex_audit_sessions(audit_id);
CREATE INDEX IF NOT EXISTS idx_alex_audit_sessions_type ON alex_audit_sessions(session_type);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_working_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE alex_audit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_templates ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY "Users can access audits in their tenant" ON audits
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access audit programs in their tenant" ON audit_programs
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access audit procedures in their tenant" ON audit_procedures
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access audit findings in their tenant" ON audit_findings
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access audit recommendations in their tenant" ON audit_recommendations
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access audit evidence in their tenant" ON audit_evidence
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access working papers in their tenant" ON audit_working_papers
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access audit communications in their tenant" ON audit_communications
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access audit metrics in their tenant" ON audit_metrics_snapshots
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access Alex Audit sessions in their tenant" ON alex_audit_sessions
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text));

CREATE POLICY "Users can access audit templates in their tenant" ON audit_templates
    FOR ALL USING (tenant_id::text = (auth.jwt() ->> 'tenant_id'::text) OR is_public = true);

-- ============================================================================
-- TRIGGERS FOR AUTOMATED FUNCTIONALITY
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_programs_updated_at BEFORE UPDATE ON audit_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_procedures_updated_at BEFORE UPDATE ON audit_procedures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_findings_updated_at BEFORE UPDATE ON audit_findings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_recommendations_updated_at BEFORE UPDATE ON audit_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_working_papers_updated_at BEFORE UPDATE ON audit_working_papers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_templates_updated_at BEFORE UPDATE ON audit_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate audit numbers
CREATE OR REPLACE FUNCTION generate_audit_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    sequence_num INTEGER;
    new_audit_number TEXT;
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SPLIT_PART(audit_number, '-', 3) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM audits
    WHERE audit_number LIKE 'AUD-' || current_year || '-%'
    AND tenant_id = NEW.tenant_id;
    
    -- Generate new audit number: AUD-YYYY-NNNN
    new_audit_number := 'AUD-' || current_year || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    NEW.audit_number := new_audit_number;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply audit number generation trigger
CREATE TRIGGER generate_audit_number_trigger BEFORE INSERT ON audits
    FOR EACH ROW EXECUTE FUNCTION generate_audit_number();

-- Function to generate finding numbers
CREATE OR REPLACE FUNCTION generate_finding_number()
RETURNS TRIGGER AS $$
DECLARE
    sequence_num INTEGER;
    audit_num TEXT;
BEGIN
    -- Get audit number
    SELECT audit_number INTO audit_num FROM audits WHERE id = NEW.audit_id;
    
    -- Get next sequence number for this audit
    SELECT COALESCE(MAX(CAST(SPLIT_PART(finding_number, '-', 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM audit_findings
    WHERE audit_id = NEW.audit_id;
    
    -- Generate finding number: AUD-YYYY-NNNN-FNN
    NEW.finding_number := audit_num || '-F' || LPAD(sequence_num::TEXT, 2, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply finding number generation trigger
CREATE TRIGGER generate_finding_number_trigger BEFORE INSERT ON audit_findings
    FOR EACH ROW EXECUTE FUNCTION generate_finding_number();

-- ============================================================================
-- STORED PROCEDURES FOR AUDIT OPERATIONS
-- ============================================================================

-- Calculate audit progress based on procedures completion
CREATE OR REPLACE FUNCTION calculate_audit_progress(audit_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_procedures INTEGER;
    completed_procedures INTEGER;
    progress_percentage DECIMAL;
BEGIN
    -- Count total procedures
    SELECT COUNT(*) INTO total_procedures
    FROM audit_procedures ap
    JOIN audit_programs aprog ON ap.program_id = aprog.id
    WHERE aprog.audit_id = audit_uuid;
    
    -- Count completed procedures
    SELECT COUNT(*) INTO completed_procedures
    FROM audit_procedures ap
    JOIN audit_programs aprog ON ap.program_id = aprog.id
    WHERE aprog.audit_id = audit_uuid
    AND ap.status = 'Completed';
    
    -- Calculate percentage
    IF total_procedures > 0 THEN
        progress_percentage := (completed_procedures::DECIMAL / total_procedures::DECIMAL) * 100;
    ELSE
        progress_percentage := 0;
    END IF;
    
    RETURN ROUND(progress_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Calculate audit risk score based on findings
CREATE OR REPLACE FUNCTION calculate_audit_risk_score(audit_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    risk_score DECIMAL := 0;
    finding_record RECORD;
BEGIN
    FOR finding_record IN 
        SELECT severity FROM audit_findings 
        WHERE audit_id = audit_uuid AND status != 'Closed'
    LOOP
        CASE finding_record.severity
            WHEN 'Critical' THEN risk_score := risk_score + 10;
            WHEN 'High' THEN risk_score := risk_score + 5;
            WHEN 'Medium' THEN risk_score := risk_score + 2;
            WHEN 'Low' THEN risk_score := risk_score + 1;
            ELSE risk_score := risk_score + 0;
        END CASE;
    END LOOP;
    
    RETURN risk_score;
END;
$$ LANGUAGE plpgsql;

-- Generate audit metrics snapshot
CREATE OR REPLACE FUNCTION generate_audit_metrics_snapshot(start_date DATE, end_date DATE)
RETURNS UUID AS $$
DECLARE
    snapshot_id UUID;
    tenant_uuid UUID;
BEGIN
    tenant_uuid := (auth.jwt() ->> 'tenant_id')::UUID;
    
    INSERT INTO audit_metrics_snapshots (
        period_start,
        period_end,
        total_audits,
        audits_by_status,
        audits_by_type,
        audits_by_priority,
        total_findings,
        findings_by_severity,
        findings_by_status,
        open_findings,
        overdue_findings,
        tenant_id
    )
    SELECT 
        start_date,
        end_date,
        COUNT(*) as total_audits,
        jsonb_object_agg(status, status_count) as audits_by_status,
        jsonb_object_agg(audit_type, type_count) as audits_by_type,
        jsonb_object_agg(priority, priority_count) as audits_by_priority,
        COALESCE(findings_stats.total_findings, 0),
        COALESCE(findings_stats.findings_by_severity, '{}'::jsonb),
        COALESCE(findings_stats.findings_by_status, '{}'::jsonb),
        COALESCE(findings_stats.open_findings, 0),
        COALESCE(findings_stats.overdue_findings, 0),
        tenant_uuid
    FROM (
        SELECT 
            status,
            COUNT(*) as status_count,
            audit_type,
            COUNT(*) as type_count,
            priority,
            COUNT(*) as priority_count
        FROM audits 
        WHERE created_at BETWEEN start_date AND end_date
        AND tenant_id = tenant_uuid
        GROUP BY status, audit_type, priority
    ) audit_stats
    CROSS JOIN (
        SELECT 
            COUNT(*) as total_findings,
            jsonb_object_agg(severity, severity_count) as findings_by_severity,
            jsonb_object_agg(status, status_count) as findings_by_status,
            COUNT(*) FILTER (WHERE status = 'Open') as open_findings,
            COUNT(*) FILTER (WHERE status = 'Overdue') as overdue_findings
        FROM audit_findings af
        JOIN audits a ON af.audit_id = a.id
        WHERE af.identified_at BETWEEN start_date AND end_date
        AND af.tenant_id = tenant_uuid
        GROUP BY severity, status
    ) findings_stats
    RETURNING id INTO snapshot_id;
    
    RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA SEEDING
-- ============================================================================

-- Insert default audit templates
INSERT INTO audit_templates (name, description, template_type, audit_type, content, methodology, is_public, tenant_id) VALUES
(
    'Standard Internal Audit Program',
    'Comprehensive internal audit program template based on IIA standards',
    'Audit Program',
    'Internal Audit',
    '{
        "sections": [
            {"name": "Planning", "procedures": ["Risk Assessment", "Scope Definition", "Resource Allocation"]},
            {"name": "Fieldwork", "procedures": ["Control Testing", "Substantive Testing", "Evidence Collection"]},
            {"name": "Reporting", "procedures": ["Finding Development", "Report Writing", "Management Response"]}
        ]
    }',
    'IIA Standards',
    true,
    '00000000-0000-0000-0000-000000000000'
),
(
    'IT Audit Checklist',
    'Comprehensive IT audit checklist covering ITGC and application controls',
    'Checklist',
    'IT Audit',
    '{
        "categories": [
            {"name": "Access Management", "items": ["User provisioning", "Privileged access", "Access reviews"]},
            {"name": "Change Management", "items": ["Change approvals", "Testing procedures", "Emergency changes"]},
            {"name": "Operations", "items": ["Backup procedures", "Monitoring", "Incident management"]}
        ]
    }',
    'Big Four Standard',
    true,
    '00000000-0000-0000-0000-000000000000'
);

-- ============================================================================
-- COMMENTS AND DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE audits IS 'Main audit table containing all audit engagements with AI integration';
COMMENT ON TABLE audit_programs IS 'Audit programs defining the approach and procedures for each audit area';
COMMENT ON TABLE audit_procedures IS 'Individual audit procedures with AI-suggested automation capabilities';
COMMENT ON TABLE audit_findings IS 'Audit findings with 4C framework and AI-powered root cause analysis';
COMMENT ON TABLE audit_recommendations IS 'Audit recommendations with AI-generated implementation guidance';
COMMENT ON TABLE audit_evidence IS 'Audit evidence with AI content analysis and metadata extraction';
COMMENT ON TABLE audit_working_papers IS 'AI-enhanced working papers with auto-population capabilities';
COMMENT ON TABLE audit_communications IS 'Audit communications with AI tone analysis and template generation';
COMMENT ON TABLE audit_metrics_snapshots IS 'Periodic snapshots of audit metrics and KPIs for trend analysis';
COMMENT ON TABLE alex_audit_sessions IS 'AI assistant interaction sessions for audit support';
COMMENT ON TABLE audit_templates IS 'Reusable audit templates and methodologies with AI optimization';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Audit IA Module database schema created successfully!';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '- Comprehensive audit lifecycle management';
    RAISE NOTICE '- AI-powered working papers and evidence analysis';
    RAISE NOTICE '- Alex Audit AI integration';
    RAISE NOTICE '- Big Four methodology support';
    RAISE NOTICE '- Advanced metrics and analytics';
    RAISE NOTICE '- Multi-tenant security';
    RAISE NOTICE '- Automated audit numbering and tracking';
END;
$$;