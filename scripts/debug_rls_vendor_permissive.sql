-- Drop existing policy
DROP POLICY IF EXISTS "Users can access vendor_registry for their tenant" ON public.vendor_registry;

-- Create a more permissive policy for debugging (allows access if user is authenticated)
CREATE POLICY "Debug: Allow all authenticated users"
ON public.vendor_registry
FOR ALL
TO authenticated
USING (true);
