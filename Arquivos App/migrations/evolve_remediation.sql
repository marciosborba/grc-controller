-- Create comments table for vulnerabilities
CREATE TABLE IF NOT EXISTS vulnerability_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create action items (sub-tasks) table
CREATE TABLE IF NOT EXISTS vulnerability_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    assigned_to UUID REFERENCES auth.users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Root Cause Analysis columns to vulnerabilities
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS root_cause_category VARCHAR(100);
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS root_cause_details TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vulnerability_comments_vuln_id ON vulnerability_comments(vulnerability_id);
CREATE INDEX IF NOT EXISTS idx_vulnerability_action_items_vuln_id ON vulnerability_action_items(vulnerability_id);

-- Enable RLS
ALTER TABLE vulnerability_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerability_action_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments (inherit access from vulnerability)
CREATE POLICY "Users can view comments of vulnerabilities they access"
ON vulnerability_comments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = vulnerability_comments.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);

CREATE POLICY "Users can insert comments to vulnerabilities they access"
ON vulnerability_comments
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = vulnerability_comments.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);

-- RLS Policies for action items
CREATE POLICY "Users can view action items of vulnerabilities they access"
ON vulnerability_action_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = vulnerability_action_items.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);

CREATE POLICY "Users can manage action items of vulnerabilities they access"
ON vulnerability_action_items
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = vulnerability_action_items.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);
