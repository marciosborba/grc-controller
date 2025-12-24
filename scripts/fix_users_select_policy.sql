-- Allow authenticated users to view basic user information
-- This is required for UI components that display "Created By" or "Owner" fields in the Vendors module and others

-- First drop the policy if it exists to allow re-running this script
DROP POLICY IF EXISTS "Authenticated users can select all users" ON "public"."users";

-- Create the policy
CREATE POLICY "Authenticated users can select all users" ON "public"."users"
FOR SELECT
TO authenticated
USING (true);

-- Also ensure RLS is enabled on the table (usually is, but good to be sure)
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
