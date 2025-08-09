import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://myxvxponlmulnjstbjwd.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxNDM1MywiZXhwIjoyMDY4NTkwMzUzfQ.la81rxT7XKPEfv0DNxylMM6A-Wq9ANXsByLjH84pB10';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔗 Testando conexão com Supabase de produção...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Teste 1: Verificar tabelas
    console.log('\n1️⃣ Verificando tabelas existentes...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);
    
    if (tablesError) {
      console.error('❌ Erro ao listar tabelas:', tablesError);
    } else {
      console.log('✅ Tabelas encontradas:', tables.map(t => t.table_name));
    }

    // Teste 2: Verificar usuário admin
    console.log('\n2️⃣ Verificando usuário admin...');
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'adm@grc-controller.com');
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuário:', usersError);
    } else {
      console.log('✅ Usuário admin encontrado:', users);
    }

    // Teste 3: Verificar tabela platform_admins
    console.log('\n3️⃣ Verificando tabela platform_admins...');
    const { data: platformAdmins, error: platformError } = await supabase
      .from('platform_admins')
      .select('*');
    
    if (platformError) {
      console.error('❌ Erro ao acessar platform_admins:', platformError);
    } else {
      console.log('✅ Platform admins encontrados:', platformAdmins);
    }

    // Teste 4: Verificar tabela tenants
    console.log('\n4️⃣ Verificando tabela tenants...');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, name, slug')
      .limit(5);
    
    if (tenantsError) {
      console.error('❌ Erro ao acessar tenants:', tenantsError);
    } else {
      console.log('✅ Tenants encontrados:', tenants);
    }

  } catch (error) {
    console.error('❌ Erro geral de conexão:', error);
  }
}

testConnection();