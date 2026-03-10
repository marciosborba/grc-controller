const fs = require('fs');
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

const sql = `
CREATE OR REPLACE FUNCTION get_auth_tenant_id() 
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER AS $$ 
DECLARE 
  v_tenant_id UUID; 
BEGIN 
  SELECT tenant_id INTO v_tenant_id FROM profiles WHERE user_id = auth.uid() LIMIT 1; 
  RETURN v_tenant_id; 
END; 
$$;`;

client.connect()
    .then(() => client.query(sql))
    .then(() => {
        console.log('Fixed get_auth_tenant_id');
        client.end();
    })
    .catch(err => {
        console.error(err);
        client.end();
    });
