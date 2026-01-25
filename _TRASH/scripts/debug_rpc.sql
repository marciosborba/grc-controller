SET LOCAL ROLE anon;

-- Note: We need a valid ID. I'll use a placeholder or try to find one dynamically if possible.
-- But since I can't easily pass dynamic ID in this static SQL script without PL/pgSQL block...
-- I'll use a DO block.

DO $$
DECLARE
  v_id uuid;
  v_success boolean;
BEGIN
  -- Find a valid assessment
  SELECT id INTO v_id
  FROM vendor_assessments
  WHERE public_link IS NOT NULL
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    -- Call the RPC function
    v_success := update_vendor_assessment_public(
      v_id,
      '{"debug": "true"}'::jsonb,
      50,
      'in_progress',
      'Debug update via RPC'
    );
    
    IF v_success THEN
      RAISE NOTICE 'RPC call successful for ID %', v_id;
    ELSE
      RAISE NOTICE 'RPC call returned false for ID %', v_id;
    END IF;
  ELSE
    RAISE NOTICE 'No valid assessment found to test';
  END IF;
END $$;
