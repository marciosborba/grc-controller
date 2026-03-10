
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
    console.log('🔄 Syncing Modules List...');

    const sql = `
    -- 1. Remove incorrect/sub-modules
    DELETE FROM modules WHERE key IN ('policy_auditor', 'ai_manager'); 
    -- 'ai_manager' is Administrative, user requested exclusion from this list.
    -- 'policy_auditor' is a submodule of compliance.

    -- 2. Upsert correct modules based on Sidebar
    INSERT INTO modules (key, name, description, category, is_active) VALUES
    ('audit', 'Auditoria', 'Gestão de auditorias e controles internos.', 'grc', true),
    ('strategic_planning', 'Planejamento Estratégico', 'Gestão estratégica e acompanhamento organizacional.', 'strategic', true),
    ('assessments', 'Assessments', 'Avaliações de maturidade e compliance.', 'grc', true),
    ('compliance', 'Conformidade', 'Gestão de conformidade e frameworks regulatórios.', 'grc', true),
    ('ethics', 'Canal de Ética', 'Canal de denúncias e questões éticas.', 'ethics', true),
    ('risk_management', 'Gestão de Riscos', 'Gestão de Riscos.', 'grc', true),
    ('action_plans', 'Planos de Ação', 'Gestão centralizada de planos de ação.', 'strategic', true),
    ('incidents', 'Incidentes', 'Gestão de incidentes de segurança.', 'security', true),
    ('policy_management', 'Políticas', 'Gestão de Políticas e Normas.', 'grc', true),
    ('privacy', 'Privacidade & LGPD', 'Gestão de LGPD e Privacidade.', 'privacy', true),
    ('tprm', 'TPRM', 'Gestão de Riscos de Terceiros.', 'grc', true),
    ('reports', 'Relatórios', 'Relatórios e dashboards personalizados.', 'reporting', true),
    -- Keeping vulnerabilities if it exists in code, even if not in sidebar text (it was in App.tsx imports)
    ('vulnerabilities', 'Vulnerabilidades', 'Gestão de Vulnerabilidades.', 'security', true)
    
    ON CONFLICT (key) DO UPDATE SET 
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        is_active = EXCLUDED.is_active;
    `;

    try {
        const result = await runSql(sql);
        console.log('✅ Modules Updated:\n', result);
    } catch (e) {
        console.error('❌ Update failed:', e.message);
    }
}

main();
