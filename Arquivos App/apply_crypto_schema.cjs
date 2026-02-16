require('dotenv').config({ path: './.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Extract DB URL from client.ts or use env
// Using the known Supabase URL for direct connection
const DB_URL = "postgres://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres";

(async () => {
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🔗 Conectado ao PostgreSQL do Supabase');

        // Path relative to where script is executed (Arquivos App)
        // Artifact is in .gemini/antigravity/brain...
        // Let's try absolute path or simpler relative path
        const schemaPath = "C:\\Users\\marci\\.gemini\\antigravity\\brain\\8b97270b-b1ad-4e4d-86b2-38535a43fac6\\crypto_schema.sql";
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Applying Crypto Schema...');
        await client.query(schemaSql);

        console.log('✅ Crypto Schema applied successfully!');

    } catch (err) {
        console.error('❌ Error applying schema:', err);
    } finally {
        await client.end();
        console.log('🔌 Desconectado do PostgreSQL');
    }
})();
