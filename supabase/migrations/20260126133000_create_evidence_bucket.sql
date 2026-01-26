-- Create vulnerability-evidence bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vulnerability-evidence', 'vulnerability-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
-- READ
CREATE POLICY "Authenticated users can read vulnerability evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'vulnerability-evidence');

-- INSERT
CREATE POLICY "Authenticated users can upload vulnerability evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vulnerability-evidence');

-- DELETE
CREATE POLICY "Authenticated users can delete vulnerability evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vulnerability-evidence');
