
const { spawn } = require('child_process');

function runSql(sql) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', ['database-manager.cjs', 'execute-sql', sql], {
            stdio: ['ignore', 'pipe', 'pipe']
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', d => stdout += d.toString());
        child.stderr.on('data', d => stderr += d.toString());
        child.on('close', code => {
            if (code === 0) resolve(stdout);
            else reject(new Error(`SQL failed: ${stderr}\nOutput: ${stdout}`));
        });
    });
}

async function main() {
    console.log('🔄 Synchronizing AI Provider Stats...');

    // SQL to update providers based on actual logs
    // We update tokens_used_today based on logs from today.
    // We update total_requests based on ALL logs (historical).

    // Note: This assumes total_requests should match count(total logs). 
    // If we want to preserve historical checks that were deleted, we shouldn't do this. 
    // BUT for the "Gemini Global" which is new, this is correct.

    // Let's do a targeted fix for tokens_used_today first, which is the visible discrepancy.

    const sql = `
    WITH stats AS (
        SELECT 
            provider_id,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as real_req_today,
            SUM(COALESCE(tokens_input, 0) + COALESCE(tokens_output, 0)) FILTER (WHERE created_at >= CURRENT_DATE) as real_tokens_today,
            COUNT(*) as real_total_req
        FROM ai_usage_logs
        GROUP BY provider_id
    )
    UPDATE ai_grc_providers p
    SET 
        tokens_used_today = COALESCE(s.real_tokens_today, 0),
        -- We can optionally sync total_requests too if we think it's off.
        -- Given the ghost log issue, we should probably sync it for 'Gemini Global' at least.
        -- Let's sync total_requests only if it's currently > 0 to avoid resetting legitimate historical counters if logs were archived (unlikely here but good practice).
        total_requests = CASE 
            WHEN p.name = 'Gemini Global' THEN COALESCE(s.real_total_req, 0)
            ELSE p.total_requests -- Preserve others for now unless we are sure
        END
    FROM stats s
    WHERE p.id = s.provider_id;
    
    -- Also handle providers with NO logs today (set tokens_used_today to 0)
    UPDATE ai_grc_providers
    SET tokens_used_today = 0
    WHERE id NOT IN (SELECT DISTINCT provider_id FROM ai_usage_logs WHERE created_at >= CURRENT_DATE);
    `;

    try {
        const result = await runSql(sql);
        console.log('✅ Stats Synchronized:\n', result);
    } catch (e) {
        console.error('❌ Sync failed:', e.message);
    }
}

main();
