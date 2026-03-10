require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";
const SQL_FILE = 'c:/Users/marci/.gemini/antigravity/brain/8b97270b-b1ad-4e4d-86b2-38535a43fac6/fix_logs_tenant_id.sql';

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔗 Conectado ao PostgreSQL do Supabase');

        const sql = fs.readFileSync(SQL_FILE, 'utf8');
        console.log('🚀 Fixing Tenant IDs in Logs...');

        await client.query(sql);
        console.log('✅ Logs Tenant IDs fixed successfully!');

    } catch (err) {
        console.error('❌ Erro ao aplicar fix:', err);
    } finally {
        await client.end();
        console.log('🔌 Desconectado do PostgreSQL');
    }
})();
