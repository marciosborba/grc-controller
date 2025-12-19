-- 1. Add attachments column to vendor_risk_messages
ALTER TABLE public.vendor_risk_messages 
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- 2. Create Storage Bucket for Chat Attachments
-- We'll try to insert into storage.buckets if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (simplified for "anon" usage on public page)
-- Allow anyone (anon) to READ files in this bucket
CREATE POLICY "Public Access Get"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat-attachments' );

-- Allow anyone (anon) to UPLOAD files
CREATE POLICY "Public Access Insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'chat-attachments' );

-- 4. Update RPC to support attachments
CREATE OR REPLACE FUNCTION public.send_public_assessment_message(
    p_link TEXT,
    p_content TEXT,
    p_attachments JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_assessment_id UUID;
    v_vendor_id UUID;
BEGIN
    -- 1. Resolve Assessment ID from Public Link
    SELECT id, vendor_id INTO v_assessment_id, v_vendor_id
    FROM vendor_assessments
    WHERE public_link = p_link;

    IF v_assessment_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid link');
    END IF;

    -- 2. Insert Message
    INSERT INTO vendor_risk_messages (
        vendor_id,
        assessment_id,
        sender_type,
        content,
        attachments
    ) VALUES (
        v_vendor_id,
        v_assessment_id,
        'vendor',
        p_content,
        p_attachments
    );

    RETURN jsonb_build_object('success', true);
END;
$$;
