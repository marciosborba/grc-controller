const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    return client.query(`SELECT id FROM tenants WHERE name = 'GRC-Controller' LIMIT 1`);
}).then((res) => {
    if (res.rows.length > 0) {
        console.log("GRC-Controller Tenant ID:", res.rows[0].id);
        const tenantId = res.rows[0].id;

        // Vamos pegar o Admin da GRC-Controller para usar de assignee/reporter
        return client.query(`SELECT id FROM profiles WHERE tenant_id = $1 LIMIT 1`, [tenantId]).then(userRes => {
            return { tenantId, userId: userRes.rows.length > 0 ? userRes.rows[0].id : null };
        });
    } else {
        throw new Error("Tenant GRC-Controller not found!");
    }
}).then(({ tenantId, userId }) => {
    console.log("User ID for incidents:", userId);

    const checkExisting = client.query(`SELECT count(*) FROM incidents WHERE tenant_id = $1`, [tenantId]);
    return checkExisting.then(res => {
        if (res.rows[0].count > 0) {
            console.log(`Already found ${res.rows[0].count} incidents for GRC-Controller. Adding more anyway...`);
        }

        const insertQuery = `
        INSERT INTO incidents (title, description, category, priority, status, reporter_id, assignee_id, tenant_id, type, severity, detection_date, business_impact)
        VALUES 
        ('Vazamento de dados na API', 'Detectamos um endpoint exposto vazando PII sem autenticação.', 'Segurança', 'critical', 'open', $1, $1, $2, 'data_breach', 'critical', NOW() - INTERVAL '1 day', 'Alto risco regulatório e multa LGPD.'),
        
        ('DDoS no Portal de Clientes', 'Pico anormal de tráfego derrubou a aplicação principal.', 'Disponibilidade', 'high', 'investigating', $1, $1, $2, 'service_disruption', 'high', NOW() - INTERVAL '2 days', 'Clientes não conseguem emitir boletos.'),
        
        ('Ransomware na Filial SP', 'Computadores bloqueados com extensão .crypto.', 'Segurança', 'critical', 'investigating', $1, $1, $2, 'malware', 'critical', NOW() - INTERVAL '5 hours', 'Operação da filial parada totalmente.'),
        
        ('Phishing Reportado - RH', 'E-mail suspeito enviado para toda a lista de funcionários se passando pelo CEO.', 'Segurança', 'medium', 'resolved', $1, $1, $2, 'social_engineering', 'medium', NOW() - INTERVAL '4 days', 'Baixo, foi detectado rapidamente.'),
        
        ('Falha no Backup DRP', 'Os backups do banco main falharam por falta de espaço no storage.', 'Conformidade', 'high', 'open', $1, $1, $2, 'system_failure', 'high', NOW(), 'Risco de perda de dados permanente se houver desastre.');
        `;

        return client.query(insertQuery, [userId, tenantId]);
    });
}).then(() => {
    console.log("Successfully inserted 5 QA incidents for GRC-Controller!");
    client.end();
}).catch(err => {
    console.error("Erro ao inserir incidentes:", err.message);
    client.end();
});
