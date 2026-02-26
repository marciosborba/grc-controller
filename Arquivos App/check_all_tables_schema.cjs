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

        const tables = [
            'auth_lockouts',
            'consents',
            'data_inventory',
            'data_subject_requests',
            'ethics_communication_templates',
            'ethics_corrective_actions',
            'ethics_evidence',
            'ethics_interviews',
            'ethics_investigation_plans',
            'ethics_metrics',
            'ethics_regulatory_notifications',
            'ethics_witnesses',
            'legal_bases',
            'privacy_incidents',
            'processing_activities',
            'remediation_tasks',
            'risk_registrations',
            'vendor_risk_messages',
            'vulnerability_attachments'
        ];

        console.log("Checking for tenant_id column in tables:");
        for (const t of tables) {
            const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            AND column_name = 'tenant_id'
        `, [t]);

            const hasTenantId = res.rows.length > 0;
            console.log(`${t}: ${hasTenantId ? 'YES' : 'NO'}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
