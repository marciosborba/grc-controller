const DatabaseManager = require('./database-manager.cjs');
const dbManager = new DatabaseManager();

async function fixConstraint() {
    try {
        await dbManager.connect();

        console.log('🔧 Updating assessment_questions constraint...');

        // Drop old constraint
        await dbManager.executeSQL(
            "ALTER TABLE assessment_questions DROP CONSTRAINT IF EXISTS assessment_questions_tipo_pergunta_check;",
            "Dropping old constraint"
        );

        // Add new constraint with 'escala_1_5' included
        const newConstraint = `
            ALTER TABLE assessment_questions 
            ADD CONSTRAINT assessment_questions_tipo_pergunta_check 
            CHECK (tipo_pergunta IN ('sim_nao', 'escala', 'escala_1_5', 'multipla_escolha', 'texto_livre', 'numerica', 'data', 'arquivo'));
        `;

        await dbManager.executeSQL(newConstraint, "Adding new constraint with 'escala_1_5'");

        console.log('✅ Constraint fixed.');

    } catch (err) {
        console.error('❌ Error fixing constraint:', err);
    } finally {
        await dbManager.disconnect();
    }
}

fixConstraint();
