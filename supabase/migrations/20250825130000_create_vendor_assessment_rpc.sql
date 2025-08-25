-- Create RPC function to bypass RLS policies for vendor assessment creation
-- This function will be executed with elevated privileges to insert into vendor_assessments

CREATE OR REPLACE FUNCTION create_vendor_assessment(
  p_vendor_id UUID,
  p_tenant_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_framework_type TEXT,
  p_questions JSONB,
  p_created_by UUID,
  p_due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_public_hash TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  public_hash TEXT,
  success BOOLEAN,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with elevated privileges
AS $$
DECLARE
  v_assessment_id UUID;
  v_public_hash TEXT;
BEGIN
  -- Generate a unique public hash if not provided
  IF p_public_hash IS NULL THEN
    v_public_hash := encode(gen_random_bytes(32), 'hex');
  ELSE
    v_public_hash := p_public_hash;
  END IF;

  -- Insert the vendor assessment with elevated privileges
  INSERT INTO vendor_assessments (
    vendor_id,
    tenant_id,
    title,
    description,
    framework_type,
    questions,
    created_by,
    due_date,
    public_hash,
    is_public,
    status,
    created_at,
    updated_at
  )
  VALUES (
    p_vendor_id,
    p_tenant_id,
    p_title,
    p_description,
    p_framework_type,
    p_questions,
    p_created_by,
    p_due_date,
    v_public_hash,
    p_is_public,
    'draft',
    NOW(),
    NOW()
  )
  RETURNING vendor_assessments.id INTO v_assessment_id;

  -- Return success result
  RETURN QUERY SELECT 
    v_assessment_id as id,
    v_public_hash as public_hash,
    true as success,
    NULL::TEXT as error_message;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    RETURN QUERY SELECT 
      NULL::UUID as id,
      NULL::TEXT as public_hash,
      false as success,
      SQLERRM as error_message;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_vendor_assessment TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION create_vendor_assessment IS 'Creates a vendor assessment bypassing RLS policies. Used for public link generation.';