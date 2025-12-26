const DatabaseManager = require('./database-manager.cjs');

async function fixChildrenVisibility() {
    const db = new DatabaseManager();

    try {
        const connected = await db.connect();
        if (!connected) process.exit(1);

        console.log('🔧 Fixing visibility for domains, controls, and questions...');

        // Policy for Domains: Allow reading if framework is standard
        const domainPolicy = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_read_standard_domains') THEN
          CREATE POLICY "allow_read_standard_domains" ON assessment_domains
          FOR SELECT USING (
            framework_id IN (SELECT id FROM assessment_frameworks WHERE is_standard = true)
          );
        END IF;
      END $$;
    `;
        await db.executeSQL(domainPolicy, "Add domain visibility policy");

        // Policy for Controls: Allow reading if framework is standard
        // Note: Controls link to framework_id directly in this schema? 
        // Let's verify schema. Assuming they do based on seeder code: 
        // 'domain_id', 'framework_id' both present in seeder Insert for controls.
        const controlPolicy = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_read_standard_controls') THEN
          CREATE POLICY "allow_read_standard_controls" ON assessment_controls
          FOR SELECT USING (
            framework_id IN (SELECT id FROM assessment_frameworks WHERE is_standard = true)
          );
        END IF;
      END $$;
    `;
        await db.executeSQL(controlPolicy, "Add control visibility policy");

        // Policy for Questions: Allow reading if linked control is in standard framework
        // Questions typically link to control_id. 
        // This JOIN is deeper.
        const questionPolicy = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_read_standard_questions') THEN
          CREATE POLICY "allow_read_standard_questions" ON assessment_questions
          FOR SELECT USING (
            control_id IN (
              SELECT id FROM assessment_controls 
              WHERE framework_id IN (SELECT id FROM assessment_frameworks WHERE is_standard = true)
            )
          );
        END IF;
      END $$;
    `;
        await db.executeSQL(questionPolicy, "Add question visibility policy");

        console.log('✅ Children visibility fixed. Cloning should now work fully.');

    } catch (error) {
        console.error('❌ Fix failed:', error);
    } finally {
        await db.disconnect();
    }
}

fixChildrenVisibility();
