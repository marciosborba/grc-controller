const DatabaseManager = require('../database-manager.cjs');

async function main() {
    const db = new DatabaseManager();
    const publicLink = 'NDk3YWFkZjQtMDE1_mj0o2p2d';

    try {
        console.log('Connecting to database...');
        const connected = await db.connect();
        if (!connected) {
            console.error('Failed to connect to database');
            process.exit(1);
        }

        console.log('Switching to anon role...');
        await db.executeSQL("SET ROLE anon;", "Set Role Anon");

        console.log(`Testing RPC function get_public_assessment_data('${publicLink}') as anon...`);

        // We need to use a transaction or just run the query because SET ROLE applies to the session
        const rpcSql = `SELECT get_public_assessment_data('${publicLink}');`;

        try {
            const result = await db.executeSQL(rpcSql, 'Execute RPC as Anon');

            if (result.rows.length > 0 && result.rows[0].get_public_assessment_data) {
                console.log('✅ RPC Success! Data returned:');
                console.log(JSON.stringify(result.rows[0].get_public_assessment_data, null, 2).substring(0, 200) + '...');
            } else {
                console.log('❌ RPC returned NULL or empty result.');
            }
        } catch (e) {
            console.error('❌ RPC Execution Failed:', e.message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.disconnect();
    }
}

main();
