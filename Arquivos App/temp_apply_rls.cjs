const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`
    -- Add a safe SELECT policy to the profiles table
    
    -- First, try to drop it if it already exists with this name to avoid errors
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view profiles from their tenant'
        ) THEN
            DROP POLICY "Users can view profiles from their tenant" ON profiles;
        END IF;
    END
    $$;

    -- Create the policy
    CREATE POLICY "Users can view profiles from their tenant" ON profiles
    FOR SELECT
    TO public
    USING (
      tenant_id IN (SELECT tenant_id FROM user_roles WHERE user_id = auth.uid())
      OR 
      has_role(auth.uid(), 'platform_admin')
      OR
      has_role(auth.uid(), 'admin')
      OR 
      auth.uid() = user_id
    );
  `);
}).then(res => {
    console.log("Successfully created SELECT policy for profiles");
    client.end();
}).catch(err => {
    console.error("Error creating policy:", err.message);
    client.end();
});
