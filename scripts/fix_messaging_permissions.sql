-- Ensure table exists
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

-- Drop existing policies to be clean
DROP POLICY IF EXISTS "Internal users full access messages" ON public.vendor_risk_messages;
DROP POLICY IF EXISTS "Vendor insert messages" ON public.vendor_risk_messages; -- In case we want to add one later

-- 1. Policy for Internal Users (Authenticated) - FULL ACCESS
CREATE POLICY "Internal users full access messages"
ON public.vendor_risk_messages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Policy for Anon/Public - Only if we wanted them to interact directly, but we use RPC.
-- However, sometimes supabase client tries to do things directly.
-- Let's stick to RPC for public.

-- GRANT PERMISSIONS
GRANT ALL ON public.vendor_risk_messages TO postgres;
GRANT ALL ON public.vendor_risk_messages TO service_role;
GRANT ALL ON public.vendor_risk_messages TO authenticated;
-- We do NOT grant ALL to anon/public. They must use RPC.

-- Debug: Create one test message if none exist
INSERT INTO public.vendor_risk_messages (vendor_id, sender_type, content)
SELECT id, 'vendor', 'Mensagem de Teste do Sistema'
FROM public.vendor_registry
WHERE NOT EXISTS (SELECT 1 FROM public.vendor_risk_messages)
LIMIT 1;
