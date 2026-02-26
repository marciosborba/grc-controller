const { Client } = require('pg');

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`
    DO $$
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view profiles from their tenant'
        ) THEN
            DROP POLICY "Users can view profiles from their tenant" ON profiles;
        END IF;
    END
    $$;

    CREATE POLICY "Users can view profiles from their tenant" ON profiles
    FOR SELECT
    TO public
    USING (
      tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
      OR 
      auth.uid() = user_id
      OR
      (SELECT is_platform_admin FROM profiles WHERE user_id = auth.uid() LIMIT 1) = true
    );
  `);
}).then(res => {
    console.log("Successfully updated SELECT policy for profiles to use simple tenant_id match");
    client.end();
}).catch(err => {
    console.error("Error creating policy:", err.message);
    client.end();
});
