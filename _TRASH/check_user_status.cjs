/**
 * Script para verificar status do usuário no banco de dados
 * Executa: node check_user_status.cjs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas');
  console.error('Encontradas:', {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const USER_EMAIL = 'adm@grc-controller.com';
const USER_ID = '0c5c1433-2682-460c-992a-f4cce57c0d6d';

async function checkUserStatus() {
  console.log('🔍 Verificando status do usuário no banco de dados...');
  console.log(`📧 Email: ${USER_EMAIL}`);
  console.log(`🆔 ID: ${USER_ID}`);
  console.log('');
  
  try {
    // 1. Verificar perfil do usuário
    console.log('📊 1. VERIFICANDO PERFIL...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', USER_ID)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
    } else if (profile) {
      console.log('✅ Perfil encontrado:');
      console.log(`   - Nome: ${profile.full_name}`);
      console.log(`   - Email: ${profile.email || 'N/A'}`);
      console.log(`   - Tenant ID: ${profile.tenant_id}`);
      console.log(`   - Job Title: ${profile.job_title || 'N/A'}`);
      console.log(`   - Criado em: ${profile.created_at}`);
    } else {
      console.log('⚠️  Perfil não encontrado');
    }
    console.log('');
    
    // 2. Verificar roles do usuário
    console.log('📊 2. VERIFICANDO ROLES...');
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: true });
    
    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError.message);
    } else if (roles && roles.length > 0) {
      console.log(`✅ ${roles.length} role(s) encontrada(s):`);
      roles.forEach((role, index) => {
        console.log(`   ${index + 1}. ${role.role} (criado em: ${role.created_at})`);
      });
      
      // Verificar se tem roles de admin
      const adminRoles = roles.filter(r => ['admin', 'super_admin', 'platform_admin'].includes(r.role));
      if (adminRoles.length > 0) {
        console.log('');
        console.log('👑 ROLES DE ADMIN ENCONTRADAS:');
        adminRoles.forEach(role => {
          console.log(`   ✅ ${role.role}`);
        });
      } else {
        console.log('');
        console.log('❌ NENHUMA ROLE DE ADMIN ENCONTRADA');
      }
    } else {
      console.log('❌ Nenhuma role encontrada');
    }
    console.log('');
    
    // 3. Verificar se existe tabela de permissões
    console.log('📊 3. VERIFICANDO PERMISSÕES...');
    try {
      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', USER_ID);
      
      if (permissionsError) {
        if (permissionsError.code === '42P01') {
          console.log('ℹ️  Tabela user_permissions não existe');
        } else {
          console.error('❌ Erro ao buscar permissões:', permissionsError.message);
        }
      } else if (permissions && permissions.length > 0) {
        console.log(`✅ ${permissions.length} permissão(ões) encontrada(s):`);
        permissions.forEach((perm, index) => {
          console.log(`   ${index + 1}. ${perm.permission}`);
        });
      } else {
        console.log('❌ Nenhuma permissão específica encontrada');
      }
    } catch (error) {
      console.log('ℹ️  Tabela de permissões não disponível ou erro:', error.message);
    }
    console.log('');
    
    // 4. Verificar usuário na tabela auth.users
    console.log('📊 4. VERIFICANDO DADOS DE AUTENTICAÇÃO...');
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(USER_ID);
      
      if (authError) {
        console.error('❌ Erro ao buscar dados de auth:', authError.message);
      } else if (authUser.user) {
        console.log('✅ Usuário encontrado na tabela auth:');
        console.log(`   - Email: ${authUser.user.email}`);
        console.log(`   - Email confirmado: ${authUser.user.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log(`   - Último login: ${authUser.user.last_sign_in_at || 'N/A'}`);
        console.log(`   - Criado em: ${authUser.user.created_at}`);
      }
    } catch (error) {
      console.log('ℹ️  Não foi possível acessar dados de auth (pode precisar de service role key)');
    }
    console.log('');
    
    // 5. RESUMO FINAL
    console.log('📋 RESUMO FINAL:');
    console.log('================');
    
    const hasProfile = !!profile;
    const hasRoles = roles && roles.length > 0;
    const hasAdminRoles = roles && roles.some(r => ['admin', 'super_admin', 'platform_admin'].includes(r.role));
    
    console.log(`✅ Perfil no banco: ${hasProfile ? 'SIM' : 'NÃO'}`);
    console.log(`✅ Tem roles: ${hasRoles ? 'SIM' : 'NÃO'}`);
    console.log(`👑 É admin: ${hasAdminRoles ? 'SIM' : 'NÃO'}`);
    
    if (hasAdminRoles) {
      console.log('');
      console.log('🎉 VOCÊ É ADMINISTRADOR!');
      console.log('Suas roles de admin:', roles.filter(r => ['admin', 'super_admin', 'platform_admin'].includes(r.role)).map(r => r.role).join(', '));
    } else {
      console.log('');
      console.log('❌ VOCÊ NÃO É ADMINISTRADOR');
      console.log('Roles atuais:', roles && roles.length > 0 ? roles.map(r => r.role).join(', ') : 'nenhuma');
      console.log('');
      console.log('💡 Para se tornar admin, execute:');
      console.log('   node fix_user_simple.cjs');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar verificação
checkUserStatus();