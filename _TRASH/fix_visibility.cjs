const DatabaseManager = require('./database-manager.cjs');

async function fixVisibility() {
    const db = new DatabaseManager();

    try {
        const connected = await db.connect();
        if (!connected) process.exit(1);

        console.log('🔧 Fixing visibility issues...');

        // 1. Ensure RLS is enabled (sanity check)
        await db.executeSQL("ALTER TABLE assessment_frameworks ENABLE ROW LEVEL SECURITY;", "Enable RLS");

        // 2. Drop potential conflicting policies (optional, but cleaner to add new specific one)
        // Actually, let's ADD a new permissive policy for standards. 
        // Postgres RLS is OR-based (permissive).

        const policySql = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'assessment_frameworks' 
          AND policyname = 'allow_read_standard_frameworks'
        ) THEN
          CREATE POLICY "allow_read_standard_frameworks" 
          ON assessment_frameworks 
          FOR SELECT 
          USING (is_standard = true);
        END IF;
      END $$;
    `;

        await db.executeSQL(policySql, "Add allow_read_standard_frameworks policy");

        console.log('✅ Visibility fix applied. Standard frameworks should be visible.');

    } catch (error) {
        console.error('❌ Fix failed:', error);
    } finally {
        await db.disconnect();
    }
}

fixVisibility();
