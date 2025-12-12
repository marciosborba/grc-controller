CREATE OR REPLACE FUNCTION update_vendor_assessment_public(
  p_id uuid,
  p_responses jsonb,
  p_progress integer,
  p_status text,
  p_submission_summary text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres)
SET search_path = public -- Secure search path
AS $$
DECLARE
  v_assessment vendor_assessments%ROWTYPE;
BEGIN
  -- 1. Verify the assessment exists and is accessible via public link
  SELECT * INTO v_assessment
  FROM vendor_assessments
  WHERE id = p_id
    AND public_link IS NOT NULL
    AND public_link_expires_at > now()
    AND status IN ('sent', 'in_progress');

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- 2. Update the assessment
  UPDATE vendor_assessments
  SET 
    responses = p_responses,
    progress_percentage = p_progress,
    status = p_status,
    submission_summary = COALESCE(p_submission_summary, submission_summary),
    vendor_submitted_at = CASE WHEN p_status = 'completed' THEN now() ELSE vendor_submitted_at END,
    updated_at = now()
  WHERE id = p_id;

  RETURN true;
END;
$$;

-- Grant execute permission to anon and public
GRANT EXECUTE ON FUNCTION update_vendor_assessment_public TO anon;
GRANT EXECUTE ON FUNCTION update_vendor_assessment_public TO public;
GRANT EXECUTE ON FUNCTION update_vendor_assessment_public TO service_role;
