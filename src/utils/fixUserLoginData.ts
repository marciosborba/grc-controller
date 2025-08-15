import { supabase } from '@/integrations/supabase/client';

/**
 * Função para corrigir dados de login de usuários específicos
 */
export const fixUserLoginData = async (email: string, loginCount?: number) => {
  try {
    console.log(`🔧 Corrigindo dados de login para: ${email}`);
    
    // Buscar o usuário pelo email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, login_count, last_login_at, full_name')
      .eq('email', email)
      .single();
    
    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      return false;
    }
    
    if (!profile) {
      console.error('Perfil não encontrado para:', email);
      return false;
    }
    
    console.log('📊 Dados atuais do perfil:', {
      user_id: profile.user_id,
      full_name: profile.full_name,
      current_login_count: profile.login_count,
      last_login_at: profile.last_login_at
    });
    
    // Definir valores corretos
    const newLoginCount = loginCount || Math.max(1, profile.login_count || 0);
    const newLastLogin = new Date().toISOString();
    
    // Atualizar os dados
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        login_count: newLoginCount,
        last_login_at: newLastLogin,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);
    
    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
      return false;
    }
    
    console.log('✅ Dados corrigidos com sucesso:', {
      user_id: profile.user_id,
      email: email,
      new_login_count: newLoginCount,
      new_last_login: newLastLogin
    });
    
    return true;
  } catch (error) {
    console.error('Erro na correção dos dados:', error);
    return false;
  }
};

/**
 * Função para corrigir dados do usuário atual logado
 */
export const fixCurrentUserLoginData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Nenhum usuário logado');
      return false;
    }
    
    console.log(`🔧 Corrigindo dados do usuário atual: ${user.email}`);
    
    // Buscar dados atuais
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('login_count, last_login_at, full_name')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('Erro ao buscar perfil atual:', profileError);
      return false;
    }
    
    console.log('📊 Dados atuais do usuário logado:', {
      user_id: user.id,
      email: user.email,
      full_name: profile?.full_name,
      current_login_count: profile?.login_count,
      last_login_at: profile?.last_login_at
    });
    
    // Se login_count é 0 ou null, definir como pelo menos 1 (já que está logado)
    const currentCount = profile?.login_count || 0;
    const newLoginCount = Math.max(1, currentCount);
    
    // Atualizar os dados
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        login_count: newLoginCount,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (updateError) {
      console.error('Erro ao atualizar perfil atual:', updateError);
      return false;
    }
    
    console.log('✅ Dados do usuário atual corrigidos:', {
      user_id: user.id,
      email: user.email,
      old_login_count: currentCount,
      new_login_count: newLoginCount,
      last_login_at: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Erro na correção dos dados do usuário atual:', error);
    return false;
  }
};