-- Allow public (anonymous) users to UPDATE vendor_assessments if they have a valid public link
-- This is required for saving progress (auto-save) and submitting the assessment

CREATE POLICY "Public assessment update" ON "public"."vendor_assessments"
FOR UPDATE
TO public
USING (
  -- Can only update if the link exists, is not expired, and assessment is not yet completed/cancelled
  (public_link IS NOT NULL) AND 
  (public_link_expires_at > now()) AND 
  (status = ANY (ARRAY['sent'::text, 'in_progress'::text]))
)
WITH CHECK (
  -- The new state must still have a valid link
  -- We don't restrict status here to allow transitioning to 'completed'
  (public_link IS NOT NULL) AND 
  (public_link_expires_at > now())
);
