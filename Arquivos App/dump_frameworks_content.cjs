const fs = require('fs');
const DatabaseManager = require('./database-manager.cjs');

async function main() {
    const db = new DatabaseManager();
    await db.connect();

    const frameworks = {
        'COBIT': '65ab7d32-58a3-4fea-b168-7bd0156ad864',
        'NIST': '66b9a622-7ff1-48ea-bed4-ba50b8c1dea5',
        'GDPR': '3771789b-b8b4-411b-b8b6-c1a38f0cbe92'
    };

    const dump = {};

    for (const [name, id] of Object.entries(frameworks)) {
        console.log(`Fetching ${name}...`);

        // Fetch Controls
        const controls = await db.client.query(
            `SELECT id, titulo FROM assessment_controls WHERE framework_id = $1`,
            [id]
        );

        // Fetch Questions
        const questions = await db.client.query(
            `SELECT q.id, q.texto, q.control_id 
             FROM assessment_questions q 
             JOIN assessment_controls c ON c.id = q.control_id 
             WHERE c.framework_id = $1`,
            [id]
        );

        dump[name] = {
            id,
            controls: controls.rows,
            questions: questions.rows
        };
    }

    fs.writeFileSync('framework_dump.json', JSON.stringify(dump, null, 2));
    console.log('Dump complete: framework_dump.json');
    await db.disconnect();
}

main().catch(console.error);
