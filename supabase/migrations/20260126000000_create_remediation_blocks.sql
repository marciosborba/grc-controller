-- Create remediation_tasks table (The Blocks)
CREATE TABLE IF NOT EXISTS public.remediation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vulnerability_id UUID NOT NULL REFERENCES public.vulnerabilities(id) ON DELETE CASCADE,
    title UUID NULL, -- Deprecated/Reserved or can be used as Block Title if needed, focusing on description for now
    description TEXT, -- Free text context
    assigned_to TEXT, -- Email or Name
    assigned_team TEXT,
    status TEXT DEFAULT 'open', -- open, in_progress, done, approved
    proposed_vulnerability_status TEXT, -- mitigated, accepted, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add task_id to vulnerability_action_items
ALTER TABLE public.vulnerability_action_items 
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.remediation_tasks(id) ON DELETE CASCADE;

-- Add task_id to vulnerability_attachments
ALTER TABLE public.vulnerability_attachments 
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.remediation_tasks(id) ON DELETE CASCADE;

-- RLS Policies for remediation_tasks
ALTER TABLE public.remediation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON public.remediation_tasks
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.remediation_tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.remediation_tasks
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.remediation_tasks
    FOR DELETE
    TO authenticated
    USING (true);
