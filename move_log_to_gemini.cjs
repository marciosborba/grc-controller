
const { spawn } = require('child_process');

async function main() {
    console.log('🔄 Reassigning Log to Gemini Global...');

    // 1. Move the specific log from GLM 4.5 to Gemini Global
    const sqlMove = `
        UPDATE ai_usage_logs
        SET provider_id = 'a4e48b66-28d2-4de3-9fc3-576e9cd23f38' -- Gemini Global
        WHERE id = '35c92862-0830-429b-961a-2543aec7b59c'; -- The GLM 4.5 Log
    `;

    // 2. We can rely on the Previously created sync script to fix the counters?
    // The previously created sync_ai_stats.cjs calculates tokens_used_today from logs.
    // So if we move the log, then run sync, Gemini will get the 84 tokens.

    // We need to run sqlMove first.
    function runSql(sql) {
        return new Promise((resolve, reject) => {
            const child = spawn('node', ['database-manager.cjs', 'execute-sql', sql], {
                stdio: ['ignore', 'pipe', 'pipe']
            });
            let stdout = '';
            // child.stdout.pipe(process.stdout);
            child.stdout.on('data', d => stdout += d.toString());
            child.on('close', code => {
                if (code === 0) resolve(stdout);
                else reject(new Error('SQL Failed'));
            });
        });
    }

    try {
        await runSql(sqlMove);
        console.log('✅ Log moved.');
    } catch (e) {
        console.error('❌ Move failed', e);
        return;
    }
}

main();
