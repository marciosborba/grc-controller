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
    .then(() => client.query(`
    -- Add stakeholder evidence + analyst validation fields to risk action plans
    ALTER TABLE risk_registration_action_plans
      ADD COLUMN IF NOT EXISTS stakeholder_notes TEXT,
      ADD COLUMN IF NOT EXISTS evidence_url TEXT,
      ADD COLUMN IF NOT EXISTS evidence_name TEXT,
      ADD COLUMN IF NOT EXISTS analyst_validation_status VARCHAR(20) DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS analyst_notes TEXT,
      ADD COLUMN IF NOT EXISTS metadados JSONB DEFAULT '{}';
  `))
    .then(() => {
        console.log('Schema migration complete.');
        client.end();
    })
    .catch(err => { console.error('Migration error:', err.message); client.end(); });
