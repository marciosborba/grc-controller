-- Create remediation tasks (Sub-tickets)
CREATE TABLE IF NOT EXISTS remediation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(255), -- Flexible assignment (email or name for now, can be UUID later if strict)
    assigned_team VARCHAR(255),
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, done
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Link Action Items to Tasks
ALTER TABLE vulnerability_action_items ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES remediation_tasks(id) ON DELETE CASCADE;

-- Link Attachments to Tasks
ALTER TABLE vulnerability_attachments ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES remediation_tasks(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_vuln_id ON remediation_tasks(vulnerability_id);
CREATE INDEX IF NOT EXISTS idx_action_items_task_id ON vulnerability_action_items(task_id);
CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON vulnerability_attachments(task_id);

-- Enable RLS
ALTER TABLE remediation_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view tasks of vulnerabilities they access"
ON remediation_tasks
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = remediation_tasks.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);

CREATE POLICY "Users can manage tasks of vulnerabilities they access"
ON remediation_tasks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = remediation_tasks.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);
