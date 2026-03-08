const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Digite a senha do banco Supabase (postgres): ', async (password) => {
    rl.close();

    const client = new Client({
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: password.trim(),
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('\n🔗 Conectando ao banco...');
        await client.connect();
        console.log('✅ Conectado!\n');

        const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '20260308_rbac_tables.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Dividir em statements individuais para melhor relatório
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`📋 Executando ${statements.length} comandos SQL...\n`);

        let ok = 0, skipped = 0, failed = 0;

        for (const stmt of statements) {
            const preview = stmt.replace(/\s+/g, ' ').substring(0, 80);
            try {
                await client.query(stmt);
                console.log(`  ✅ ${preview}...`);
                ok++;
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                    console.log(`  ⏭️  JÁ EXISTE: ${preview}...`);
                    skipped++;
                } else {
                    console.log(`  ❌ ERRO: ${err.message}`);
                    console.log(`     SQL: ${preview}...`);
                    failed++;
                }
            }
        }

        console.log(`\n🎉 Migration concluída: ${ok} OK | ${skipped} já existiam | ${failed} com erro`);

    } catch (err) {
        console.error('❌ Erro de conexão:', err.message);
        console.log('\n💡 Dica: Verifique se a senha do PostgreSQL está correta.');
        console.log('   Você pode encontrá-la em: Supabase Dashboard → Settings → Database → Connection string');
    } finally {
        await client.end();
    }
});
