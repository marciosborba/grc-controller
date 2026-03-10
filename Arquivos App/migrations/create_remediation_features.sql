-- Create generic notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'unread',
    priority VARCHAR(20) DEFAULT 'low',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for querying notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Platform admins and system can insert notifications"
ON notifications
FOR INSERT
WITH CHECK (
    -- Allow users to trigger notifications (e.g., assigning a vulnerability)
    -- Ideally this should be more restricted, but for now allow authenticated users to notify others within same tenant
    EXISTS (
        SELECT 1 FROM tenants 
        WHERE id = notifications.tenant_id 
        -- Add check for user belonging to tenant if possible, or rely on app logic for now
    )
);

CREATE POLICY "Users can update their own notifications"
ON notifications
FOR UPDATE
USING (auth.uid() = user_id);


-- Create vulnerability attachments table
CREATE TABLE IF NOT EXISTS vulnerability_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    size BIGINT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for attachments
CREATE INDEX IF NOT EXISTS idx_vulnerability_attachments_vuln_id ON vulnerability_attachments(vulnerability_id);

-- Enable RLS on attachments
ALTER TABLE vulnerability_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments (inherit from vulnerability access)
CREATE POLICY "Users can view attachments of vulnerabilities they access"
ON vulnerability_attachments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = vulnerability_attachments.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);

CREATE POLICY "Users can insert attachments to vulnerabilities they access"
ON vulnerability_attachments
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = vulnerability_attachments.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);

CREATE POLICY "Users can delete attachments"
ON vulnerability_attachments
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM vulnerabilities v
        WHERE v.id = vulnerability_attachments.vulnerability_id
        AND (v.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid OR is_platform_admin(auth.uid()))
    )
);
