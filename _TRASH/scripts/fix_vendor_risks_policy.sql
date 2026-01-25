-- Fix bad RLS policy on vendor_risks that tries to query auth.users directly
-- Accessing auth.users directly is not allowed for authenticated users and causes "Permission denied for table users"

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can access vendor_risks for their tenant" ON "public"."vendor_risks";

-- Create a corrected policy that uses public.profiles instead
-- Assuming public.profiles has tenant_id and is accessible by the user (own profile)
CREATE POLICY "Users can access vendor_risks for their tenant" ON "public"."vendor_risks"
FOR ALL
TO authenticated
USING (
  tenant_id IN (
    SELECT tenant_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);

-- Note: This assumes the user can read their own tenant_id from profiles.
-- The existing RLS on profiles allows (auth.uid() = user_id), so this subquery works.
