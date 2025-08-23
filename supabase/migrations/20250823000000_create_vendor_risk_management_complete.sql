-- ================================================
-- VENDOR RISK MANAGEMENT SYSTEM - COMPLETE SCHEMA
-- Created by: ALEX VENDOR AI
-- Date: 2025-08-23
-- Description: Complete database structure for comprehensive vendor risk management
-- ================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ================================================
-- 1. VENDOR REGISTRY
-- ================================================
create table public.vendor_registry (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    name text not null,
    legal_name text,
    tax_id text,
    registration_number text,
    website text,
    description text,
    business_category text not null,
    vendor_type text not null check (vendor_type in ('strategic', 'operational', 'transactional', 'critical')),
    criticality_level text not null check (criticality_level in ('low', 'medium', 'high', 'critical')) default 'medium',
    annual_spend numeric(15,2) default 0,
    contract_value numeric(15,2) default 0,
    contract_start_date date,
    contract_end_date date,
    contract_status text check (contract_status in ('active', 'expired', 'terminated', 'draft', 'under_review')) default 'draft',
    primary_contact_name text,
    primary_contact_email text,
    primary_contact_phone text,
    address jsonb,
    status text check (status in ('active', 'inactive', 'suspended', 'onboarding', 'offboarding')) default 'onboarding',
    onboarding_status text check (onboarding_status in ('not_started', 'in_progress', 'completed', 'on_hold')) default 'not_started',
    onboarding_progress integer default 0 check (onboarding_progress >= 0 and onboarding_progress <= 100),
    risk_score numeric(3,2) check (risk_score >= 0 and risk_score <= 5),
    last_assessment_date timestamp with time zone,
    next_assessment_due timestamp with time zone,
    alex_analysis jsonb,
    metadata jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    updated_by uuid
);

-- ================================================
-- 2. VENDOR CONTACTS
-- ================================================
create table public.vendor_contacts (
    id uuid default gen_random_uuid() primary key,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    name text not null,
    email text not null,
    phone text,
    role text,
    department text,
    is_primary boolean default false,
    is_security_contact boolean default false,
    is_compliance_contact boolean default false,
    is_technical_contact boolean default false,
    is_active boolean default true,
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- ================================================
-- 3. ASSESSMENT FRAMEWORKS
-- ================================================
create table public.vendor_assessment_frameworks (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    name text not null,
    description text,
    framework_type text not null check (framework_type in ('iso27001', 'soc2', 'nist', 'pci_dss', 'lgpd', 'gdpr', 'custom')),
    industry text,
    version text,
    is_active boolean default true,
    questions jsonb not null default '[]',
    scoring_model jsonb not null default '{}',
    alex_recommendations jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    updated_by uuid,
    unique(tenant_id, name)
);

-- ================================================
-- 4. VENDOR ASSESSMENTS
-- ================================================
create table public.vendor_assessments (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    framework_id uuid not null references public.vendor_assessment_frameworks(id) on delete restrict,
    assessment_name text not null,
    assessment_type text check (assessment_type in ('initial', 'annual', 'reassessment', 'incident_triggered', 'ad_hoc')) default 'initial',
    status text check (status in ('draft', 'sent', 'in_progress', 'completed', 'approved', 'rejected', 'expired')) default 'draft',
    priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
    due_date timestamp with time zone,
    start_date timestamp with time zone default now(),
    completion_date timestamp with time zone,
    progress_percentage integer default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
    responses jsonb default '{}',
    overall_score numeric(3,2) check (overall_score >= 0 and overall_score <= 5),
    risk_level text check (risk_level in ('low', 'medium', 'high', 'critical')),
    public_link text unique,
    public_link_expires_at timestamp with time zone,
    vendor_submitted_at timestamp with time zone,
    internal_review_status text check (internal_review_status in ('pending', 'in_review', 'approved', 'rejected', 'requires_clarification')) default 'pending',
    reviewer_notes text,
    alex_analysis jsonb default '{}',
    alex_recommendations jsonb default '{}',
    evidence_attachments jsonb default '[]',
    metadata jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    updated_by uuid,
    reviewed_by uuid,
    reviewed_at timestamp with time zone
);

-- ================================================
-- 5. VENDOR RISKS
-- ================================================
create table public.vendor_risks (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    assessment_id uuid references public.vendor_assessments(id) on delete cascade,
    title text not null,
    description text not null,
    risk_category text not null check (risk_category in ('operational', 'financial', 'compliance', 'security', 'strategic', 'reputational', 'technology', 'data_privacy')),
    risk_type text not null check (risk_type in ('inherent', 'residual')),
    impact_score integer not null check (impact_score >= 1 and impact_score <= 5),
    likelihood_score integer not null check (likelihood_score >= 1 and likelihood_score <= 5),
    overall_score numeric(3,2) not null,
    risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
    status text check (status in ('identified', 'assessed', 'treatment_planned', 'in_treatment', 'monitored', 'closed', 'accepted')) default 'identified',
    treatment_strategy text check (treatment_strategy in ('avoid', 'mitigate', 'transfer', 'accept')),
    owner_user_id uuid,
    identified_date timestamp with time zone default now(),
    last_review_date timestamp with time zone,
    next_review_date timestamp with time zone,
    alex_analysis jsonb default '{}',
    alex_recommendations jsonb default '{}',
    metadata jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    updated_by uuid
);

-- ================================================
-- 6. RISK ACTION PLANS
-- ================================================
create table public.vendor_risk_action_plans (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    risk_id uuid not null references public.vendor_risks(id) on delete cascade,
    title text not null,
    description text not null,
    action_type text check (action_type in ('preventive', 'corrective', 'detective', 'compensating')) default 'corrective',
    priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
    status text check (status in ('planned', 'in_progress', 'completed', 'on_hold', 'cancelled', 'overdue')) default 'planned',
    progress_percentage integer default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
    assigned_to uuid,
    due_date timestamp with time zone not null,
    start_date timestamp with time zone,
    completion_date timestamp with time zone,
    estimated_cost numeric(15,2),
    actual_cost numeric(15,2),
    effectiveness_rating integer check (effectiveness_rating >= 1 and effectiveness_rating <= 5),
    verification_method text,
    verification_evidence text,
    alex_insights jsonb default '{}',
    dependencies text[],
    milestones jsonb default '[]',
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    updated_by uuid
);

-- ================================================
-- 7. VENDOR INCIDENTS
-- ================================================
create table public.vendor_incidents (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    title text not null,
    description text not null,
    incident_type text not null check (incident_type in ('security_breach', 'data_loss', 'service_disruption', 'compliance_violation', 'financial_issue', 'operational_failure', 'contract_breach', 'other')),
    severity text not null check (severity in ('low', 'medium', 'high', 'critical')) default 'medium',
    status text check (status in ('reported', 'investigating', 'in_progress', 'resolved', 'closed', 'escalated')) default 'reported',
    impact_assessment text,
    root_cause text,
    resolution_summary text,
    occurred_at timestamp with time zone not null,
    detected_at timestamp with time zone default now(),
    resolved_at timestamp with time zone,
    reported_by uuid,
    assigned_to uuid,
    escalated_to uuid,
    external_reference text,
    regulatory_notification_required boolean default false,
    regulatory_notification_sent boolean default false,
    client_notification_required boolean default false,
    client_notification_sent boolean default false,
    alex_analysis jsonb default '{}',
    alex_recommendations jsonb default '{}',
    lessons_learned text,
    attachments jsonb default '[]',
    metadata jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    updated_by uuid
);

-- ================================================
-- 8. VENDOR COMMUNICATIONS
-- ================================================
create table public.vendor_communications (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    assessment_id uuid references public.vendor_assessments(id) on delete cascade,
    incident_id uuid references public.vendor_incidents(id) on delete cascade,
    communication_type text not null check (communication_type in ('email', 'phone', 'meeting', 'document', 'assessment_request', 'follow_up', 'escalation', 'notification')),
    subject text not null,
    content text not null,
    direction text not null check (direction in ('inbound', 'outbound')),
    status text check (status in ('sent', 'delivered', 'read', 'responded', 'failed', 'pending')) default 'sent',
    priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
    sender_name text,
    sender_email text,
    recipient_name text,
    recipient_email text,
    sent_at timestamp with time zone default now(),
    read_at timestamp with time zone,
    responded_at timestamp with time zone,
    attachments jsonb default '[]',
    alex_sentiment_analysis jsonb default '{}',
    alex_suggested_actions jsonb default '{}',
    metadata jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid
);

-- ================================================
-- 9. VENDOR PERFORMANCE METRICS
-- ================================================
create table public.vendor_performance_metrics (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    metric_name text not null,
    metric_category text not null check (metric_category in ('financial', 'operational', 'quality', 'security', 'compliance', 'sustainability')),
    metric_value numeric(15,4) not null,
    target_value numeric(15,4),
    unit text,
    measurement_period text check (measurement_period in ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'one_time')),
    measurement_date date not null,
    benchmark_value numeric(15,4),
    trend text check (trend in ('improving', 'stable', 'declining', 'volatile')),
    status text check (status in ('on_target', 'below_target', 'above_target', 'critical')) default 'on_target',
    alex_analysis jsonb default '{}',
    notes text,
    data_source text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    unique(vendor_id, metric_name, measurement_date)
);

-- ================================================
-- 10. VENDOR CONTRACTS
-- ================================================
create table public.vendor_contracts (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    contract_name text not null,
    contract_type text not null check (contract_type in ('service_agreement', 'master_agreement', 'sow', 'nda', 'dpa', 'amendment', 'renewal')),
    contract_number text,
    status text check (status in ('draft', 'under_review', 'approved', 'active', 'expired', 'terminated', 'renewed')) default 'draft',
    start_date date not null,
    end_date date not null,
    auto_renewal boolean default false,
    renewal_notice_days integer default 30,
    contract_value numeric(15,2),
    currency text default 'BRL',
    payment_terms text,
    sla_requirements jsonb default '{}',
    security_requirements jsonb default '{}',
    compliance_requirements jsonb default '{}',
    key_clauses jsonb default '{}',
    termination_clauses text,
    liability_limits numeric(15,2),
    insurance_requirements text,
    alex_risk_analysis jsonb default '{}',
    alex_recommendations jsonb default '{}',
    attachments jsonb default '[]',
    review_date date,
    next_review_date date,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    updated_by uuid
);

-- ================================================
-- 11. VENDOR CERTIFICATIONS
-- ================================================
create table public.vendor_certifications (
    id uuid default gen_random_uuid() primary key,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    certification_name text not null,
    certification_type text not null check (certification_type in ('iso27001', 'iso9001', 'soc2_type1', 'soc2_type2', 'pci_dss', 'fips', 'common_criteria', 'other')),
    issuing_authority text not null,
    certificate_number text,
    issue_date date not null,
    expiry_date date not null,
    status text check (status in ('active', 'expired', 'suspended', 'revoked', 'pending_renewal')) default 'active',
    scope text,
    certificate_url text,
    verification_status text check (verification_status in ('verified', 'pending', 'failed', 'not_verified')) default 'not_verified',
    verified_at timestamp with time zone,
    verified_by uuid,
    alex_validation jsonb default '{}',
    attachments jsonb default '[]',
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid,
    updated_by uuid
);

-- ================================================
-- 12. VENDOR AUDIT LOGS
-- ================================================
create table public.vendor_audit_logs (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid references public.vendor_registry(id) on delete cascade,
    assessment_id uuid references public.vendor_assessments(id) on delete cascade,
    risk_id uuid references public.vendor_risks(id) on delete cascade,
    action_type text not null check (action_type in ('create', 'read', 'update', 'delete', 'approve', 'reject', 'send', 'submit', 'escalate', 'close')),
    entity_type text not null check (entity_type in ('vendor', 'assessment', 'risk', 'action_plan', 'incident', 'contract', 'communication', 'certification')),
    entity_id uuid not null,
    old_values jsonb,
    new_values jsonb,
    changed_fields text[],
    user_id uuid not null,
    user_email text,
    ip_address inet,
    user_agent text,
    session_id text,
    alex_context jsonb default '{}',
    notes text,
    created_at timestamp with time zone default now()
);

-- ================================================
-- 13. VENDOR NOTIFICATIONS
-- ================================================
create table public.vendor_notifications (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null,
    vendor_id uuid not null references public.vendor_registry(id) on delete cascade,
    assessment_id uuid references public.vendor_assessments(id) on delete cascade,
    risk_id uuid references public.vendor_risks(id) on delete cascade,
    incident_id uuid references public.vendor_incidents(id) on delete cascade,
    notification_type text not null check (notification_type in ('assessment_due', 'assessment_overdue', 'risk_threshold_exceeded', 'contract_expiring', 'certification_expiring', 'incident_reported', 'action_plan_overdue', 'review_due')),
    title text not null,
    message text not null,
    priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
    status text check (status in ('pending', 'sent', 'delivered', 'read', 'failed')) default 'pending',
    delivery_method text check (delivery_method in ('email', 'in_app', 'sms', 'webhook')) default 'email',
    recipient_type text check (recipient_type in ('internal_user', 'vendor_contact', 'both')) default 'internal_user',
    recipient_user_id uuid,
    recipient_email text,
    sent_at timestamp with time zone,
    delivered_at timestamp with time zone,
    read_at timestamp with time zone,
    alex_personalization jsonb default '{}',
    metadata jsonb default '{}',
    scheduled_for timestamp with time zone,
    retry_count integer default 0,
    max_retries integer default 3,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Vendor Registry indexes
create index idx_vendor_registry_tenant_id on public.vendor_registry(tenant_id);
create index idx_vendor_registry_status on public.vendor_registry(status);
create index idx_vendor_registry_criticality on public.vendor_registry(criticality_level);
create index idx_vendor_registry_risk_score on public.vendor_registry(risk_score);
create index idx_vendor_registry_next_assessment on public.vendor_registry(next_assessment_due);

-- Vendor Contacts indexes
create index idx_vendor_contacts_vendor_id on public.vendor_contacts(vendor_id);
create index idx_vendor_contacts_email on public.vendor_contacts(email);
create index idx_vendor_contacts_primary on public.vendor_contacts(is_primary) where is_primary = true;

-- Assessment Frameworks indexes
create index idx_vendor_assessment_frameworks_tenant_id on public.vendor_assessment_frameworks(tenant_id);
create index idx_vendor_assessment_frameworks_type on public.vendor_assessment_frameworks(framework_type);

-- Vendor Assessments indexes
create index idx_vendor_assessments_tenant_id on public.vendor_assessments(tenant_id);
create index idx_vendor_assessments_vendor_id on public.vendor_assessments(vendor_id);
create index idx_vendor_assessments_status on public.vendor_assessments(status);
create index idx_vendor_assessments_due_date on public.vendor_assessments(due_date);
create index idx_vendor_assessments_public_link on public.vendor_assessments(public_link) where public_link is not null;

-- Vendor Risks indexes
create index idx_vendor_risks_tenant_id on public.vendor_risks(tenant_id);
create index idx_vendor_risks_vendor_id on public.vendor_risks(vendor_id);
create index idx_vendor_risks_status on public.vendor_risks(status);
create index idx_vendor_risks_level on public.vendor_risks(risk_level);
create index idx_vendor_risks_category on public.vendor_risks(risk_category);
create index idx_vendor_risks_owner on public.vendor_risks(owner_user_id);

-- Action Plans indexes
create index idx_vendor_action_plans_tenant_id on public.vendor_risk_action_plans(tenant_id);
create index idx_vendor_action_plans_vendor_id on public.vendor_risk_action_plans(vendor_id);
create index idx_vendor_action_plans_risk_id on public.vendor_risk_action_plans(risk_id);
create index idx_vendor_action_plans_status on public.vendor_risk_action_plans(status);
create index idx_vendor_action_plans_due_date on public.vendor_risk_action_plans(due_date);
create index idx_vendor_action_plans_assigned_to on public.vendor_risk_action_plans(assigned_to);

-- Incidents indexes
create index idx_vendor_incidents_tenant_id on public.vendor_incidents(tenant_id);
create index idx_vendor_incidents_vendor_id on public.vendor_incidents(vendor_id);
create index idx_vendor_incidents_status on public.vendor_incidents(status);
create index idx_vendor_incidents_severity on public.vendor_incidents(severity);
create index idx_vendor_incidents_type on public.vendor_incidents(incident_type);
create index idx_vendor_incidents_occurred_at on public.vendor_incidents(occurred_at);

-- Performance Metrics indexes
create index idx_vendor_metrics_vendor_id on public.vendor_performance_metrics(vendor_id);
create index idx_vendor_metrics_category on public.vendor_performance_metrics(metric_category);
create index idx_vendor_metrics_date on public.vendor_performance_metrics(measurement_date);

-- Contracts indexes
create index idx_vendor_contracts_tenant_id on public.vendor_contracts(tenant_id);
create index idx_vendor_contracts_vendor_id on public.vendor_contracts(vendor_id);
create index idx_vendor_contracts_status on public.vendor_contracts(status);
create index idx_vendor_contracts_end_date on public.vendor_contracts(end_date);

-- Certifications indexes
create index idx_vendor_certifications_vendor_id on public.vendor_certifications(vendor_id);
create index idx_vendor_certifications_type on public.vendor_certifications(certification_type);
create index idx_vendor_certifications_expiry on public.vendor_certifications(expiry_date);
create index idx_vendor_certifications_status on public.vendor_certifications(status);

-- Audit Logs indexes
create index idx_vendor_audit_logs_tenant_id on public.vendor_audit_logs(tenant_id);
create index idx_vendor_audit_logs_vendor_id on public.vendor_audit_logs(vendor_id);
create index idx_vendor_audit_logs_user_id on public.vendor_audit_logs(user_id);
create index idx_vendor_audit_logs_created_at on public.vendor_audit_logs(created_at);
create index idx_vendor_audit_logs_entity on public.vendor_audit_logs(entity_type, entity_id);

-- Notifications indexes
create index idx_vendor_notifications_tenant_id on public.vendor_notifications(tenant_id);
create index idx_vendor_notifications_vendor_id on public.vendor_notifications(vendor_id);
create index idx_vendor_notifications_status on public.vendor_notifications(status);
create index idx_vendor_notifications_type on public.vendor_notifications(notification_type);
create index idx_vendor_notifications_scheduled on public.vendor_notifications(scheduled_for) where scheduled_for is not null;

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
alter table public.vendor_registry enable row level security;
alter table public.vendor_contacts enable row level security;
alter table public.vendor_assessment_frameworks enable row level security;
alter table public.vendor_assessments enable row level security;
alter table public.vendor_risks enable row level security;
alter table public.vendor_risk_action_plans enable row level security;
alter table public.vendor_incidents enable row level security;
alter table public.vendor_communications enable row level security;
alter table public.vendor_performance_metrics enable row level security;
alter table public.vendor_contracts enable row level security;
alter table public.vendor_certifications enable row level security;
alter table public.vendor_audit_logs enable row level security;
alter table public.vendor_notifications enable row level security;

-- Create tenant-based policies for all tables
create policy "Users can access vendor_registry for their tenant" on public.vendor_registry
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_contacts for their tenant" on public.vendor_contacts
    for all using (exists (
        select 1 from public.vendor_registry vr 
        where vr.id = vendor_contacts.vendor_id 
        and vr.tenant_id = (select tenant_id from auth.users where id = auth.uid())
    ));

create policy "Users can access vendor_assessment_frameworks for their tenant" on public.vendor_assessment_frameworks
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_assessments for their tenant" on public.vendor_assessments
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_risks for their tenant" on public.vendor_risks
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_risk_action_plans for their tenant" on public.vendor_risk_action_plans
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_incidents for their tenant" on public.vendor_incidents
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_communications for their tenant" on public.vendor_communications
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_performance_metrics for their tenant" on public.vendor_performance_metrics
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_contracts for their tenant" on public.vendor_contracts
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_certifications for their tenant" on public.vendor_certifications
    for all using (exists (
        select 1 from public.vendor_registry vr 
        where vr.id = vendor_certifications.vendor_id 
        and vr.tenant_id = (select tenant_id from auth.users where id = auth.uid())
    ));

create policy "Users can access vendor_audit_logs for their tenant" on public.vendor_audit_logs
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

create policy "Users can access vendor_notifications for their tenant" on public.vendor_notifications
    for all using (tenant_id = (select tenant_id from auth.users where id = auth.uid()));

-- Special policies for public assessment access
create policy "Public assessment access" on public.vendor_assessments
    for select using (
        public_link is not null 
        and public_link_expires_at > now()
        and status in ('sent', 'in_progress')
    );

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all relevant tables
create trigger update_vendor_registry_updated_at before update on public.vendor_registry for each row execute function update_updated_at_column();
create trigger update_vendor_contacts_updated_at before update on public.vendor_contacts for each row execute function update_updated_at_column();
create trigger update_vendor_assessment_frameworks_updated_at before update on public.vendor_assessment_frameworks for each row execute function update_updated_at_column();
create trigger update_vendor_assessments_updated_at before update on public.vendor_assessments for each row execute function update_updated_at_column();
create trigger update_vendor_risks_updated_at before update on public.vendor_risks for each row execute function update_updated_at_column();
create trigger update_vendor_risk_action_plans_updated_at before update on public.vendor_risk_action_plans for each row execute function update_updated_at_column();
create trigger update_vendor_incidents_updated_at before update on public.vendor_incidents for each row execute function update_updated_at_column();
create trigger update_vendor_communications_updated_at before update on public.vendor_communications for each row execute function update_updated_at_column();
create trigger update_vendor_performance_metrics_updated_at before update on public.vendor_performance_metrics for each row execute function update_updated_at_column();
create trigger update_vendor_contracts_updated_at before update on public.vendor_contracts for each row execute function update_updated_at_column();
create trigger update_vendor_certifications_updated_at before update on public.vendor_certifications for each row execute function update_updated_at_column();
create trigger update_vendor_notifications_updated_at before update on public.vendor_notifications for each row execute function update_updated_at_column();

-- Function to calculate vendor risk score
create or replace function calculate_vendor_risk_score(vendor_id uuid)
returns numeric as $$
declare
    avg_risk_score numeric;
    assessment_score numeric;
    incident_impact numeric;
    final_score numeric;
begin
    -- Get average risk score from vendor_risks
    select coalesce(avg(overall_score), 0) into avg_risk_score
    from public.vendor_risks vr
    where vr.vendor_id = calculate_vendor_risk_score.vendor_id
    and vr.status not in ('closed', 'accepted');
    
    -- Get latest assessment score
    select coalesce(overall_score, 0) into assessment_score
    from public.vendor_assessments va
    where va.vendor_id = calculate_vendor_risk_score.vendor_id
    and va.status = 'completed'
    order by va.completion_date desc
    limit 1;
    
    -- Calculate incident impact (recent incidents increase risk)
    select count(*) * 0.5 into incident_impact
    from public.vendor_incidents vi
    where vi.vendor_id = calculate_vendor_risk_score.vendor_id
    and vi.occurred_at > now() - interval '6 months'
    and vi.severity in ('high', 'critical');
    
    -- Calculate final score (weighted average with incident impact)
    final_score := least(5.0, greatest(0.0, 
        (avg_risk_score * 0.4) + 
        (assessment_score * 0.5) + 
        (incident_impact * 0.1)
    ));
    
    return final_score;
end;
$$ language plpgsql;

-- Function to update vendor risk score automatically
create or replace function update_vendor_risk_score()
returns trigger as $$
declare
    vendor_uuid uuid;
    new_risk_score numeric;
begin
    -- Get vendor_id based on trigger table
    if tg_table_name = 'vendor_risks' then
        vendor_uuid := coalesce(new.vendor_id, old.vendor_id);
    elsif tg_table_name = 'vendor_assessments' then
        vendor_uuid := coalesce(new.vendor_id, old.vendor_id);
    elsif tg_table_name = 'vendor_incidents' then
        vendor_uuid := coalesce(new.vendor_id, old.vendor_id);
    end if;
    
    -- Calculate and update risk score
    if vendor_uuid is not null then
        new_risk_score := calculate_vendor_risk_score(vendor_uuid);
        
        update public.vendor_registry
        set risk_score = new_risk_score,
            updated_at = now()
        where id = vendor_uuid;
    end if;
    
    return coalesce(new, old);
end;
$$ language plpgsql;

-- Apply risk score update triggers
create trigger update_vendor_risk_score_on_risk_change
    after insert or update or delete on public.vendor_risks
    for each row execute function update_vendor_risk_score();

create trigger update_vendor_risk_score_on_assessment_change
    after insert or update or delete on public.vendor_assessments
    for each row execute function update_vendor_risk_score();

create trigger update_vendor_risk_score_on_incident_change
    after insert or update or delete on public.vendor_incidents
    for each row execute function update_vendor_risk_score();

-- Function to generate public assessment links
create or replace function generate_public_assessment_link()
returns trigger as $$
begin
    if new.status = 'sent' and new.public_link is null then
        new.public_link := encode(gen_random_bytes(32), 'hex');
        new.public_link_expires_at := now() + interval '30 days';
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Apply public link generation trigger
create trigger generate_public_assessment_link_trigger
    before insert or update on public.vendor_assessments
    for each row execute function generate_public_assessment_link();

-- Function to log vendor activities
create or replace function log_vendor_activity()
returns trigger as $$
declare
    current_user_id uuid;
    current_user_email text;
begin
    -- Get current user info
    select auth.uid() into current_user_id;
    select email into current_user_email from auth.users where id = current_user_id;
    
    -- Insert audit log
    insert into public.vendor_audit_logs (
        tenant_id,
        vendor_id,
        assessment_id,
        risk_id,
        action_type,
        entity_type,
        entity_id,
        old_values,
        new_values,
        user_id,
        user_email
    ) values (
        coalesce(new.tenant_id, old.tenant_id),
        case 
            when tg_table_name = 'vendor_registry' then coalesce(new.id, old.id)
            else coalesce(new.vendor_id, old.vendor_id)
        end,
        case when tg_table_name = 'vendor_assessments' then coalesce(new.id, old.id) else null end,
        case when tg_table_name = 'vendor_risks' then coalesce(new.id, old.id) else null end,
        case 
            when tg_op = 'INSERT' then 'create'
            when tg_op = 'UPDATE' then 'update'
            when tg_op = 'DELETE' then 'delete'
        end,
        case tg_table_name
            when 'vendor_registry' then 'vendor'
            when 'vendor_assessments' then 'assessment'
            when 'vendor_risks' then 'risk'
            when 'vendor_risk_action_plans' then 'action_plan'
            when 'vendor_incidents' then 'incident'
            when 'vendor_contracts' then 'contract'
            when 'vendor_communications' then 'communication'
            when 'vendor_certifications' then 'certification'
        end,
        coalesce(new.id, old.id),
        case when tg_op != 'INSERT' then to_jsonb(old) else null end,
        case when tg_op != 'DELETE' then to_jsonb(new) else null end,
        current_user_id,
        current_user_email
    );
    
    return coalesce(new, old);
end;
$$ language plpgsql;

-- Apply audit logging triggers
create trigger log_vendor_registry_activity after insert or update or delete on public.vendor_registry for each row execute function log_vendor_activity();
create trigger log_vendor_assessments_activity after insert or update or delete on public.vendor_assessments for each row execute function log_vendor_activity();
create trigger log_vendor_risks_activity after insert or update or delete on public.vendor_risks for each row execute function log_vendor_activity();
create trigger log_vendor_action_plans_activity after insert or update or delete on public.vendor_risk_action_plans for each row execute function log_vendor_activity();
create trigger log_vendor_incidents_activity after insert or update or delete on public.vendor_incidents for each row execute function log_vendor_activity();
create trigger log_vendor_contracts_activity after insert or update or delete on public.vendor_contracts for each row execute function log_vendor_activity();
create trigger log_vendor_communications_activity after insert or update or delete on public.vendor_communications for each row execute function log_vendor_activity();
create trigger log_vendor_certifications_activity after insert or update or delete on public.vendor_certifications for each row execute function log_vendor_activity();

-- ================================================
-- RPC FUNCTIONS FOR APPLICATION USE
-- ================================================

-- Function to get vendor dashboard metrics
create or replace function get_vendor_dashboard_metrics(tenant_uuid uuid)
returns json as $$
declare
    result json;
begin
    select json_build_object(
        'total_vendors', (
            select count(*) from public.vendor_registry 
            where tenant_id = tenant_uuid and status = 'active'
        ),
        'critical_vendors', (
            select count(*) from public.vendor_registry 
            where tenant_id = tenant_uuid and criticality_level = 'critical'
        ),
        'pending_assessments', (
            select count(*) from public.vendor_assessments 
            where tenant_id = tenant_uuid and status in ('sent', 'in_progress')
        ),
        'overdue_assessments', (
            select count(*) from public.vendor_assessments 
            where tenant_id = tenant_uuid and due_date < now() and status not in ('completed', 'approved')
        ),
        'high_risk_vendors', (
            select count(*) from public.vendor_registry 
            where tenant_id = tenant_uuid and risk_score >= 4.0
        ),
        'active_incidents', (
            select count(*) from public.vendor_incidents vi
            join public.vendor_registry vr on vi.vendor_id = vr.id
            where vr.tenant_id = tenant_uuid and vi.status not in ('resolved', 'closed')
        ),
        'expiring_contracts', (
            select count(*) from public.vendor_contracts vc
            join public.vendor_registry vr on vc.vendor_id = vr.id
            where vr.tenant_id = tenant_uuid 
            and vc.end_date between now() and now() + interval '90 days'
            and vc.status = 'active'
        ),
        'expiring_certifications', (
            select count(*) from public.vendor_certifications cert
            join public.vendor_registry vr on cert.vendor_id = vr.id
            where vr.tenant_id = tenant_uuid 
            and cert.expiry_date between now() and now() + interval '90 days'
            and cert.status = 'active'
        )
    ) into result;
    
    return result;
end;
$$ language plpgsql security definer;

-- Function to get vendor risk distribution
create or replace function get_vendor_risk_distribution(tenant_uuid uuid)
returns json as $$
declare
    result json;
begin
    select json_build_object(
        'low', (
            select count(*) from public.vendor_registry 
            where tenant_id = tenant_uuid and risk_score < 2.0
        ),
        'medium', (
            select count(*) from public.vendor_registry 
            where tenant_id = tenant_uuid and risk_score >= 2.0 and risk_score < 3.5
        ),
        'high', (
            select count(*) from public.vendor_registry 
            where tenant_id = tenant_uuid and risk_score >= 3.5 and risk_score < 4.5
        ),
        'critical', (
            select count(*) from public.vendor_registry 
            where tenant_id = tenant_uuid and risk_score >= 4.5
        )
    ) into result;
    
    return result;
end;
$$ language plpgsql security definer;

-- ================================================
-- INITIAL DATA POPULATION
-- ================================================

-- Insert default assessment frameworks
insert into public.vendor_assessment_frameworks (tenant_id, name, description, framework_type, questions, scoring_model) values
(
    '00000000-0000-0000-0000-000000000000', -- Default tenant for system-wide frameworks
    'ISO 27001 Vendor Assessment',
    'Comprehensive security assessment based on ISO 27001 standards for vendor evaluation',
    'iso27001',
    '[
        {"id": "info_security_policy", "category": "A.5 Information Security Policies", "question": "Does the vendor have a documented information security policy that is approved by management?", "weight": 5, "required": true},
        {"id": "organization_info_security", "category": "A.6 Organization of Information Security", "question": "Is there a clear organizational structure for information security management?", "weight": 4, "required": true},
        {"id": "human_resource_security", "category": "A.7 Human Resource Security", "question": "Are background checks performed on employees with access to sensitive information?", "weight": 3, "required": false},
        {"id": "asset_management", "category": "A.8 Asset Management", "question": "Is there an asset inventory and classification system in place?", "weight": 4, "required": true},
        {"id": "access_control", "category": "A.9 Access Control", "question": "Are access controls implemented based on business requirements and security policies?", "weight": 5, "required": true},
        {"id": "cryptography", "category": "A.10 Cryptography", "question": "Is cryptography used to protect sensitive information during transmission and storage?", "weight": 4, "required": true},
        {"id": "physical_security", "category": "A.11 Physical and Environmental Security", "question": "Are adequate physical security controls implemented to protect facilities and equipment?", "weight": 3, "required": false},
        {"id": "operations_security", "category": "A.12 Operations Security", "question": "Are operational procedures documented and security controls implemented for IT operations?", "weight": 4, "required": true},
        {"id": "communications_security", "category": "A.13 Communications Security", "question": "Are network security controls and secure communication protocols implemented?", "weight": 4, "required": true},
        {"id": "system_acquisition", "category": "A.14 System Acquisition, Development and Maintenance", "question": "Are security requirements integrated into the system development lifecycle?", "weight": 3, "required": false},
        {"id": "supplier_relationships", "category": "A.15 Supplier Relationships", "question": "Are information security requirements addressed in supplier agreements?", "weight": 5, "required": true},
        {"id": "incident_management", "category": "A.16 Information Security Incident Management", "question": "Is there a formal incident response plan and procedure in place?", "weight": 5, "required": true},
        {"id": "business_continuity", "category": "A.17 Information Security Aspects of Business Continuity Management", "question": "Are business continuity plans tested and maintained regularly?", "weight": 4, "required": true},
        {"id": "compliance", "category": "A.18 Compliance", "question": "Are regular compliance reviews and audits conducted to ensure adherence to policies and regulations?", "weight": 5, "required": true}
    ]',
    '{
        "scoring_method": "weighted_average",
        "max_score": 5,
        "thresholds": {
            "excellent": 4.5,
            "good": 3.5,
            "adequate": 2.5,
            "needs_improvement": 1.5,
            "inadequate": 0
        },
        "risk_mapping": {
            "excellent": "low",
            "good": "low",
            "adequate": "medium", 
            "needs_improvement": "high",
            "inadequate": "critical"
        }
    }'
),
(
    '00000000-0000-0000-0000-000000000000',
    'SOC 2 Type II Assessment',
    'Service Organization Control 2 Type II evaluation framework focusing on security, availability, processing integrity, confidentiality, and privacy',
    'soc2',
    '[
        {"id": "security_controls", "category": "Security", "question": "Are security controls designed and operating effectively to protect against unauthorized access?", "weight": 5, "required": true},
        {"id": "availability_controls", "category": "Availability", "question": "Are system availability controls designed and operating effectively to ensure agreed-upon availability?", "weight": 4, "required": true},
        {"id": "processing_integrity", "category": "Processing Integrity", "question": "Are processing integrity controls designed and operating effectively to ensure complete, valid, accurate, and authorized processing?", "weight": 4, "required": true},
        {"id": "confidentiality_controls", "category": "Confidentiality", "question": "Are confidentiality controls designed and operating effectively to protect confidential information?", "weight": 5, "required": false},
        {"id": "privacy_controls", "category": "Privacy", "question": "Are privacy controls designed and operating effectively to protect personal information?", "weight": 5, "required": false},
        {"id": "control_environment", "category": "Control Environment", "question": "Is there an effective control environment with appropriate governance and oversight?", "weight": 4, "required": true},
        {"id": "logical_access", "category": "Logical and Physical Access", "question": "Are logical and physical access controls properly implemented and monitored?", "weight": 5, "required": true},
        {"id": "system_operations", "category": "System Operations", "question": "Are system operations managed effectively with appropriate monitoring and incident response?", "weight": 4, "required": true},
        {"id": "change_management", "category": "Change Management", "question": "Is there an effective change management process for system changes?", "weight": 3, "required": true},
        {"id": "risk_mitigation", "category": "Risk Mitigation", "question": "Are risks identified, assessed, and mitigated appropriately?", "weight": 4, "required": true}
    ]',
    '{
        "scoring_method": "weighted_average",
        "max_score": 5,
        "thresholds": {
            "excellent": 4.5,
            "good": 3.5,
            "adequate": 2.5,
            "needs_improvement": 1.5,
            "inadequate": 0
        },
        "risk_mapping": {
            "excellent": "low",
            "good": "low", 
            "adequate": "medium",
            "needs_improvement": "high",
            "inadequate": "critical"
        }
    }'
);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all privileges on all tables in schema public to authenticated;
grant all privileges on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- ================================================
-- SUMMARY
-- ================================================
-- This migration creates a comprehensive vendor risk management system with:
-- 
-- 1. 13 core tables covering all aspects of vendor lifecycle management
-- 2. Complete audit trail and activity logging
-- 3. Advanced risk scoring with automatic calculation
-- 4. Public assessment links for external vendor access
-- 5. Performance optimized with proper indexing
-- 6. Multi-tenant security with RLS policies
-- 7. Automated triggers for data consistency
-- 8. Built-in notification system
-- 9. Comprehensive metrics and reporting functions
-- 10. Default assessment frameworks (ISO 27001 and SOC 2)
--
-- The system supports the full vendor risk management lifecycle:
-- Registration → Assessment → Risk Evaluation → Treatment → Monitoring → Reporting
--
-- Created by ALEX VENDOR - AI Specialist in Vendor Risk Management
-- ================================================