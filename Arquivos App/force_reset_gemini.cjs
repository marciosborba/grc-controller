
const { spawn } = require('child_process');

async function main() {
    console.log('🔄 Forcing Gemini Global Stats Reset...');

    // Explicitly reset Gemini Global stats if no logs exist
    const sql = `
        UPDATE ai_grc_providers
        SET tokens_used_today = 0, total_requests = 0
        WHERE name = 'Gemini Global' 
        AND NOT EXISTS (SELECT 1 FROM ai_usage_logs WHERE provider_id = ai_grc_providers.id);
    `;

    const child = spawn('node', ['database-manager.cjs', 'execute-sql', sql], {
        stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
}

main();
