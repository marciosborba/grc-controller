const { Client } = require('pg');
require('dotenv').config();

const config = {
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
};

const client = new Client(config);

async function run() {
    try {
        await client.connect();
        console.log("Connected to database.");

        const sql = `
      -- 1. assessment_domains
      DROP POLICY IF EXISTS "allow_read_standard_domains" ON public.assessment_domains;
      
      -- 2. assessment_questions
      DROP POLICY IF EXISTS "allow_read_standard_questions" ON public.assessment_questions;

      -- 3. assessment_responses
      -- Drop legacy/broad policies in favor of strict tenant policy
      DROP POLICY IF EXISTS "Users can view their tenant responses" ON public.assessment_responses;
      DROP POLICY IF EXISTS "Users can update their tenant responses" ON public.assessment_responses;
    `;

        console.log("Executing SQL...");
        await client.query(sql);
        console.log("Successfully dropped redundant policies (V2).");

    } catch (err) {
        console.error("Error executing SQL:", err);
    } finally {
        await client.end();
    }
}

run();
