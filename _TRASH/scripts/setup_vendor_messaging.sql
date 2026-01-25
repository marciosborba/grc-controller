-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vendor_risk_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendor_registry(id),
    assessment_id UUID REFERENCES public.vendor_assessments(id),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('vendor', 'internal')),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vendor_risk_messages ENABLE ROW LEVEL SECURITY;

-- Policy for internal users (authenticated) to access everything
-- Using DO block to avoid error if policy doesn't exist when dropping
DO $$
BEGIN
    DROP POLICY IF EXISTS "Internal users full access messages" ON public.vendor_risk_messages;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Internal users full access messages"
ON public.vendor_risk_messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- RPC to get messages for a public link
CREATE OR REPLACE FUNCTION get_public_assessment_messages(p_link text)
RETURNS SETOF public.vendor_risk_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_assessment_id UUID;
BEGIN
    -- Get assessment ID from link (check validity)
    SELECT id INTO v_assessment_id
    FROM vendor_assessments
    WHERE public_link = p_link
    -- We relax expiry check slightly for reading messages if needed, but for security keep it strict for now
    AND (public_link_expires_at IS NULL OR public_link_expires_at > now());

    IF v_assessment_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT *
    FROM vendor_risk_messages
    WHERE assessment_id = v_assessment_id
    ORDER BY created_at ASC;
END;
$$;

-- Grant execution to public/anon
GRANT EXECUTE ON FUNCTION get_public_assessment_messages(text) TO public;
GRANT EXECUTE ON FUNCTION get_public_assessment_messages(text) TO anon;
GRANT EXECUTE ON FUNCTION get_public_assessment_messages(text) TO authenticated;

-- RPC to send message from public link
CREATE OR REPLACE FUNCTION send_public_assessment_message(p_link text, p_content text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_assessment_id UUID;
    v_vendor_id UUID;
    v_msg_id UUID;
BEGIN
    -- Get IDs
    SELECT id, vendor_id INTO v_assessment_id, v_vendor_id
    FROM vendor_assessments
    WHERE public_link = p_link
    AND (public_link_expires_at IS NULL OR public_link_expires_at > now());

    IF v_assessment_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou expirado');
    END IF;

    -- Insert message
    INSERT INTO vendor_risk_messages (vendor_id, assessment_id, sender_type, content)
    VALUES (v_vendor_id, v_assessment_id, 'vendor', p_content)
    RETURNING id INTO v_msg_id;

    RETURN jsonb_build_object('success', true, 'id', v_msg_id);
END;
$$;

GRANT EXECUTE ON FUNCTION send_public_assessment_message(text, text) TO public;
GRANT EXECUTE ON FUNCTION send_public_assessment_message(text, text) TO anon;
GRANT EXECUTE ON FUNCTION send_public_assessment_message(text, text) TO authenticated;
