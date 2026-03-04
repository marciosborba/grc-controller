import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        await pool.query(`
CREATE OR REPLACE FUNCTION public.update_vendor_assessment_public(p_id uuid, p_responses jsonb, p_progress integer, p_status text, p_submission_summary text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_assessment vendor_assessments%ROWTYPE;
BEGIN
  -- 1. Verify the assessment exists and is accessible via public link
  SELECT * INTO v_assessment
  FROM vendor_assessments
  WHERE id = p_id
    AND public_link IS NOT NULL
    AND (public_link_expires_at IS NULL OR public_link_expires_at > now())
    AND status IN ('sent', 'in_progress', 'completed', 'pending_validation');

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
    vendor_submitted_at = CASE WHEN p_status IN ('completed', 'pending_validation') THEN COALESCE(vendor_submitted_at, now()) ELSE vendor_submitted_at END,
    updated_at = now()
  WHERE id = p_id;

  RETURN true;
END;
$function$;
        `);
        console.log('✅ RPC public_link_expires_at updated to IS NULL OR > now(). Allowed status updated.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
