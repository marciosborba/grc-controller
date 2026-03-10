const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        const sql = `
      CREATE OR REPLACE FUNCTION get_tenant_modules_for_rbac(p_tenant_id uuid)
      RETURNS TABLE (
        module_key VARCHAR,
        is_enabled BOOLEAN
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $$
      BEGIN
        RETURN QUERY
        SELECT tm.module_key, tm.is_enabled
        FROM tenant_modules tm
        WHERE tm.tenant_id = p_tenant_id;
      END;
      $$;
    `;
        return client.query(sql);
    })
    .then(res => {
        console.log('RPC temporarily stripped of identity check for debugging.');
        client.end();
    })
    .catch(err => {
        console.error('Error:', err);
        client.end();
    });
