import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase local
const supabaseUrl = 'http://localhost:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupPlatformAdmin() {
  console.log('🔍 Verificando usuário adm@grc-controller.com...');
  
  try {
    // Verificar se o usuário existe
    const { data: users, error: userError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'adm@grc-controller.com');
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ Usuário adm@grc-controller.com não encontrado');
      console.log('💡 Execute primeiro o script de criação do usuário admin');
      return;
    }
    
    const adminUser = users[0];
    console.log('✅ Usuário encontrado:', adminUser.id);
    
    // Verificar se já é platform admin
    const { data: platformAdmin, error: platformAdminError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', adminUser.id);
    
    if (platformAdminError) {
      console.error('❌ Erro ao verificar platform admin:', platformAdminError.message);
      return;
    }
    
    if (platformAdmin && platformAdmin.length > 0) {
      console.log('✅ Usuário já é platform admin');
      console.log('Platform admin data:', platformAdmin[0]);
      return;
    }
    
    // Criar platform admin
    console.log('🔧 Criando registro de platform admin...');
    const { data: newPlatformAdmin, error: createError } = await supabase
      .from('platform_admins')
      .insert({
        user_id: adminUser.id,
        role: 'platform_admin',
        permissions: ['platform_admin', 'tenants.manage', 'users.manage'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (createError) {
      console.error('❌ Erro ao criar platform admin:', createError.message);
      return;
    }
    
    console.log('✅ Platform admin criado com sucesso!');
    console.log('Dados:', newPlatformAdmin[0]);
    
    // Verificar novamente
    const { data: verification, error: verifyError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', adminUser.id);
    
    if (verifyError) {
      console.error('❌ Erro na verificação:', verifyError.message);
      return;
    }
    
    console.log('🎉 Verificação final - Platform admin configurado:');
    console.log(verification[0]);
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

setupPlatformAdmin();