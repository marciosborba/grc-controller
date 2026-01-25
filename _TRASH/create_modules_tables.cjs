
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
    console.log('🏗️ Creating Modules Tables...');

    const sql = `
    -- Create modules table
    CREATE TABLE IF NOT EXISTS modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create tenant_modules table
    CREATE TABLE IF NOT EXISTS tenant_modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        module_key TEXT NOT NULL REFERENCES modules(key) ON DELETE CASCADE, -- Link by key for easier readability
        is_enabled BOOLEAN DEFAULT false,
        configuration JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(tenant_id, module_key)
    );
    
    -- Enable RLS
    ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE tenant_modules ENABLE ROW LEVEL SECURITY;

    -- Policies for modules (Public Read, Admin Write)
    DROP POLICY IF EXISTS "Public can view active modules" ON modules;
    CREATE POLICY "Public can view active modules" ON modules FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Admins can manage modules" ON modules;
    CREATE POLICY "Admins can manage modules" ON modules FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
    );

    -- Policies for tenant_modules 
    -- Platform Admins can do everything
    DROP POLICY IF EXISTS "Platform Admins can manage tenant modules" ON tenant_modules;
    CREATE POLICY "Platform Admins can manage tenant modules" ON tenant_modules FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_platform_admin = true)
    );
    
    -- Tenants can view their own modules
    DROP POLICY IF EXISTS "Tenants can view own modules" ON tenant_modules;
    CREATE POLICY "Tenants can view own modules" ON tenant_modules FOR SELECT USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    );

    -- Seed Modules
    INSERT INTO modules (key, name, description, category, is_active) VALUES
    ('ai_manager', 'Gestão de IA', 'Gerenciamento de provedores, prompts e logs de IA.', 'artificial_intelligence', true),
    ('policy_auditor', 'Auditor de Políticas', 'Análise de conformidade de políticas com IA.', 'artificial_intelligence', true),
    ('risk_management', 'Gestão de Riscos', 'Módulo completo de gestão de riscos (ISO 31000).', 'grc', true),
    ('compliance', 'Conformidade', 'Gestão de frameworks e requisitos.', 'grc', true),
    ('privacy', 'Privacidade & LGPD', 'Gestão de dados pessoais e impacto à privacidade.', 'privacy', true),
    ('ethics', 'Canal de Ética', 'Gestão de denúncias e comitê de ética.', 'ethics', true),
    ('vulnerabilities', 'Gestão de Vulnerabilidades', 'Monitoramento e correção de falhas de segurança.', 'security', true)
    ON CONFLICT (key) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active;

    `;

    try {
        const result = await runSql(sql);
        console.log('✅ Tables Created & Seeded:\n', result);
    } catch (e) {
        console.error('❌ Migration failed:', e.message);
    }
}

main();
