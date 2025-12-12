-- Check for restrictive policies
SELECT polname, polpermissive 
FROM pg_policy 
WHERE polrelid = 'vendor_assessments'::regclass;

-- Drop previous policy
DROP POLICY IF EXISTS "Public assessment update" ON "vendor_assessments";

-- Create a simpler policy for debugging (and potential fix)
-- We remove the status check for now to see if that's the blocker
-- And we explicitly use TO anon, authenticated (though public should work)
-- Drop all public policies to start fresh
DROP POLICY IF EXISTS "Public assessment update" ON "vendor_assessments";
DROP POLICY IF EXISTS "Debug Public Select" ON "vendor_assessments";
DROP POLICY IF EXISTS "Public assessment access" ON "vendor_assessments";

-- Create a single comprehensive policy for public access
CREATE POLICY "Public assessment access" ON "vendor_assessments"
FOR ALL
TO public
USING (
  public_link IS NOT NULL AND 
  public_link_expires_at > now() AND
  status IN ('sent', 'in_progress')
)
WITH CHECK (
  public_link IS NOT NULL AND 
  public_link_expires_at > now()
);
