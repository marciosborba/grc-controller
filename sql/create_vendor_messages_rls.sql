-- Policy file for vendor_risk_messages
ALTER TABLE public.vendor_risk_messages ENABLE ROW LEVEL SECURITY;

-- Allow vendors to read their own messages
CREATE POLICY "Vendors can view their own messages"
    ON public.vendor_risk_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.vendor_users 
            WHERE auth_user_id = auth.uid() 
            AND vendor_id = vendor_risk_messages.vendor_id
        )
    );

-- Allow vendors to insert their own messages
CREATE POLICY "Vendors can insert their own messages"
    ON public.vendor_risk_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.vendor_users 
            WHERE auth_user_id = auth.uid() 
            AND vendor_id = vendor_risk_messages.vendor_id
        )
        AND sender_type = 'vendor'
    );

-- Allow admins/internal users to read all messages
CREATE POLICY "Admins can view all vendor messages"
    ON public.vendor_risk_messages
    FOR SELECT
    TO authenticated
    USING (
        NOT EXISTS (
            SELECT 1 FROM public.vendor_users WHERE auth_user_id = auth.uid()
        )
    );

-- Allow admins/internal users to insert messages
CREATE POLICY "Admins can insert vendor messages"
    ON public.vendor_risk_messages
    FOR INSERT
    TO authenticated
    WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM public.vendor_users WHERE auth_user_id = auth.uid()
        )
        AND sender_type = 'internal'
    );
