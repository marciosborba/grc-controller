-- Allow portal stakeholders to update their own response row
-- This is needed because guest users are NOT in user_tenant_access,
-- so the existing ALL policy blocks their UPDATEs silently.
-- This policy lets any authenticated user update a risk_stakeholders row
-- whose email matches their own auth email (self-service response).

CREATE POLICY "Stakeholders can update their own response"
  ON risk_stakeholders
  FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
