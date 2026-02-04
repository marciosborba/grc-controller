-- Insert bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('vulnerability-attachments', 'vulnerability-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated uploads to this bucket
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'vulnerability-attachments' 
    AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to read from this bucket
CREATE POLICY "Authenticated users can read"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'vulnerability-attachments' 
    AND auth.role() = 'authenticated'
);

-- Policy to allow owners to delete
CREATE POLICY "Users can delete own uploads"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'vulnerability-attachments' 
    AND owner = auth.uid()
);
