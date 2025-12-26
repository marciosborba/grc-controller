const DatabaseManager = require('./database-manager.cjs');
const dbManager = new DatabaseManager();

async function diagnose() {
    try {
        await dbManager.connect();
        const client = dbManager.client;
        console.log('🔗 Helper Diagnóstico Conectado');

        // 1. Check Policies
        console.log('\n--- RLS Policies ---');
        const { rows: policies } = await client.query(`
            SELECT tablename, policyname, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename IN ('assessment_frameworks', 'assessment_domains', 'assessment_controls', 'assessment_questions')
            ORDER BY tablename, policyname;
        `);
        policies.forEach(p => console.log(`[${p.tablename}] ${p.policyname} (${p.cmd})`));

        // 2. Check Constraints on Questions
        console.log('\n--- Constraints on assessment_questions ---');
        const { rows: constraints } = await client.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c 
            JOIN pg_class t ON c.conrelid = t.oid 
            WHERE t.relname = 'assessment_questions';
        `);
        constraints.forEach(c => console.log(`[${c.conname}] ${c.pg_get_constraintdef}`));

        // 3. Check for any questions at all
        const { rows: qCount } = await client.query('SELECT count(*) FROM assessment_questions');
        console.log(`\nTotal Questions in DB: ${qCount[0].count}`);

    } catch (err) {
        console.error('Erro:', err);
    } finally {
        await dbManager.disconnect();
    }
}

diagnose();
