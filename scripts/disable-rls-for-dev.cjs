const https = require('https');

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

async function disableRLSForDev() {
  console.log('🔧 Desabilitando RLS para desenvolvimento...\n');

  const tables = [
    'legal_bases',
    'consents',
    'data_inventory',
    'data_subject_requests',
    'privacy_incidents',
    'processing_activities'
  ];

  for (const table of tables) {
    try {
      console.log(`Processando ${table}...`);
      
      // SQL para desabilitar RLS
      const sql = `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`;
      
      const result = await executeSQLQuery(sql);
      
      if (result.success) {
        console.log(`✅ ${table}: RLS desabilitado`);
      } else {
        console.error(`❌ ${table}: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar ${table}:`, error.message);
    }
  }
  
  console.log('\n🧪 Testando acesso após desabilitar RLS...\n');
  await testAccessAfterRLSDisable();
}

async function executeSQLQuery(sql) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      query: sql
    });

    const options = {
      hostname: 'myxvxponlmulnjstbjwd.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve({ success: true, data: JSON.parse(data) });
          } else {
            resolve({ success: false, error: `HTTP ${res.statusCode}: ${data}` });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

async function testAccessAfterRLSDisable() {
  const { createClient } = require('@supabase/supabase-js');
  
  // Testar com anon key
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';
  const anonClient = createClient(supabaseUrl, anonKey);
  
  const tables = ['legal_bases', 'consents', 'data_inventory', 'data_subject_requests', 'privacy_incidents', 'processing_activities'];
  
  console.log('Testando acesso com ANON KEY após correção:');
  
  for (const table of tables) {
    try {
      const { data, error } = await anonClient
        .from(table)
        .select('*')
        .limit(3);
      
      if (error) {
        console.error(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${data?.length || 0} registros acessíveis`);
        if (data && data.length > 0) {
          console.log(`   → Exemplo: ${data[0].name || data[0].id}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ ${table}: ${error.message}`);
    }
  }
}

// Executar
disableRLSForDev().catch(console.error);