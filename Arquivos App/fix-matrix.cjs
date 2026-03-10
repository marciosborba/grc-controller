const { Client } = require('pg');

const client = new Client({
    connectionString: `postgresql://postgres:Vo1agPUE4QGwlwqS@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    const sql = `
    UPDATE tenants 
    SET settings = jsonb_set(
      COALESCE(settings, '{}'::jsonb), 
      '{risk_matrix}', 
      '{"type": "3x3", "impact_labels": ["Baixo", "Médio", "Alto"], "likelihood_labels": ["Baixo", "Médio", "Alto"], "risk_levels": {"low": [1, 2], "medium": [3, 4, 6], "high": [9]}}'::jsonb
    ) 
    WHERE name = 'GRC-Controller';
    `;
    console.log('Running SQL file...');
    return client.query(sql);
}).then((res) => {
    console.log("Successfully applied matrix fix. Rows affected: ", res.rowCount);
    client.end();
}).catch(err => {
    console.error("Error executing SQL:", err.message);
    client.end();
});
