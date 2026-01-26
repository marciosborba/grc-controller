-- Enable RLS
ALTER TABLE public.vulnerability_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies (idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'vulnerability_attachments' 
        AND policyname = 'Enable access for authenticated users'
    ) THEN
        CREATE POLICY "Enable access for authenticated users" ON public.vulnerability_attachments
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
