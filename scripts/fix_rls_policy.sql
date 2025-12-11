
-- Drop existing policy
DROP POLICY IF EXISTS "Users can access vendor_assessments for their tenant" ON public.vendor_assessments;

-- Create new policy using public.profiles
CREATE POLICY "Users can access vendor_assessments for their tenant" ON public.vendor_assessments
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- Ensure public access policy is correct
DROP POLICY IF EXISTS "Public assessment access" ON public.vendor_assessments;
CREATE POLICY "Public assessment access" ON public.vendor_assessments
    FOR SELECT USING (
        public_link IS NOT NULL 
        AND public_link_expires_at > now()
        AND status IN ('sent', 'in_progress')
    );

-- Verify grants
GRANT ALL ON public.vendor_assessments TO authenticated;
GRANT SELECT ON public.vendor_assessments TO anon;
