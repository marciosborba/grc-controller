const DatabaseManager = require('./database-manager.cjs');

async function checkFrameworkStructure() {
    const db = new DatabaseManager();

    try {
        const connected = await db.connect();
        if (!connected) return;

        // List all standard frameworks and their counts of children
        const sql = `
      SELECT 
        f.codigo, 
        f.nome,
        (SELECT COUNT(*) FROM assessment_domains d WHERE d.framework_id = f.id) as domains_count,
        (SELECT COUNT(*) FROM assessment_controls c WHERE c.framework_id = f.id) as controls_count,
        (SELECT COUNT(*) FROM assessment_questions q 
         JOIN assessment_controls c ON q.control_id = c.id 
         WHERE c.framework_id = f.id) as questions_count
      FROM assessment_frameworks f
      WHERE f.is_standard = true;
    `;

        await db.executeSQL(sql, 'Check Standard Frameworks Structure');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await db.disconnect();
    }
}

checkFrameworkStructure();
