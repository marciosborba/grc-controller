const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
    console.log('Verificando contagem da tabela incidents...');
    return client.query('SELECT COUNT(*) FROM incidents');
}).then((res) => {
    console.log("Total de incidentes na tabela:", res.rows[0].count);
    return client.query('SELECT * FROM incidents LIMIT 1');
}).then((res) => {
    if (res.rows.length > 0) {
        console.log("Exemplo de incidente:", res.rows[0]);
    } else {
        console.log("A tabela de incidentes está completamente vazia no banco.");
    }
    client.end();
}).catch(err => {
    console.error("Erro ao conectar ou consultar:", err.message);
    client.end();
});
