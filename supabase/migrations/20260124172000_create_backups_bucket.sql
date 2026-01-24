-- Create backups bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO NOTHING;

-- Grant access to authenticated users to list/read backups
CREATE POLICY "Authenticated users can list backups"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'backups' );

CREATE POLICY "Authenticated users can upload backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'backups' );
