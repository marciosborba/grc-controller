-- Allow public (anonymous) users to SELECT vendor_assessments if they have a valid public link
-- This is required for the public assessment page to load the assessment data

-- DROP POLICY IF EXISTS "Public assessment select" ON "public"."vendor_assessments";

CREATE POLICY "Public assessment select" ON "public"."vendor_assessments"
FOR SELECT
TO public
USING (
  -- Can only read if the link exists, is not expired
  (public_link IS NOT NULL) AND 
  (public_link_expires_at > now()) AND 
  -- Allow reading for draft, sent, in_progress and completed
  -- We include 'draft' so users can test the link before sending
  (status = ANY (ARRAY['draft'::text, 'sent'::text, 'in_progress'::text, 'completed'::text]))
);
