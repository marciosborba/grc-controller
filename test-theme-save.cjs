#!/usr/bin/env node

/**
 * Script para testar e corrigir o problema de salvamento de temas
 * Conecta ao banco Supabase e verifica a funcionalidade de temas
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase (baseadas no db.md)
const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';
// Você precisa fornecer a chave service role real aqui
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sua_service_role_key_aqui';

// Criar cliente Supabase com service role para bypass RLS
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  console.log('🔄 Testando conexão com o banco de dados...');
  
  try {
    // Testar conexão básica
    const { data, error } = await supabase
      .from('global_ui_themes')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão com banco estabelecida com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar:', err.message);
    return false;
  }
}

async function checkThemeTable() {
  console.log('🔍 Verificando estrutura da tabela global_ui_themes...');
  
  try {
    // Verificar se a tabela existe e tem dados
    const { data: themes, error } = await supabase
      .from('global_ui_themes')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela global_ui_themes:', error);
      return false;
    }
    
    console.log('✅ Tabela global_ui_themes acessível');
    console.log(`📊 Encontrados ${themes?.length || 0} temas na tabela`);
    
    if (themes && themes.length > 0) {
      console.log('🎨 Temas existentes:');
      themes.forEach(theme => {
        console.log(`  - ${theme.display_name || theme.name} (ID: ${theme.id})`);
        console.log(`    Ativo: ${theme.is_active}, Nativo: ${theme.is_native_theme}`);
      });
    }
    
    return true;
  } catch (err) {
    console.error('❌ Erro ao verificar tabela:', err.message);
    return false;
  }
}

async function testThemeUpdate() {
  console.log('🧪 Testando atualização de tema...');
  
  try {
    // Buscar o tema UI Nativa
    const { data: nativeTheme, error: findError } = await supabase
      .from('global_ui_themes')
      .select('*')
      .eq('is_native_theme', true)
      .single();
    
    if (findError) {
      console.error('❌ Erro ao buscar tema nativo:', findError);
      return false;
    }
    
    if (!nativeTheme) {
      console.log('⚠️ Tema nativo não encontrado, criando...');
      return await createNativeTheme();
    }
    
    console.log('✅ Tema nativo encontrado:', nativeTheme.display_name);
    
    // Testar atualização do tema
    const updateData = {
      description: `Tema nativo atualizado em ${new Date().toISOString()}`,
      updated_at: new Date().toISOString()
    };
    
    const { data: updateResult, error: updateError } = await supabase
      .from('global_ui_themes')
      .update(updateData)
      .eq('id', nativeTheme.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao atualizar tema:', updateError);
      return false;
    }
    
    console.log('✅ Tema atualizado com sucesso!');
    console.log('📝 Resultado:', updateResult);
    
    return true;
  } catch (err) {
    console.error('❌ Erro no teste de atualização:', err.message);
    return false;
  }
}

async function createNativeTheme() {
  console.log('🎨 Criando tema nativo...');
  
  try {
    const nativeThemeData = {
      name: 'ui_nativa',
      display_name: 'UI Nativa',
      description: 'Tema padrão baseado no estado atual da interface do sistema',
      is_native_theme: true,
      is_system_theme: true,
      is_active: true,
      is_dark_mode: false,
      
      // Cores principais
      primary_color: '219 78% 26%',
      primary_foreground: '210 40% 98%',
      primary_hover: '219 78% 22%',
      primary_glow: '219 95% 68%',
      
      secondary_color: '210 20% 96%',
      secondary_foreground: '225 71% 12%',
      
      accent_color: '142 76% 36%',
      accent_foreground: '210 40% 98%',
      
      background_color: '0 0% 100%',
      foreground_color: '225 71% 12%',
      
      card_color: '0 0% 100%',
      card_foreground: '225 71% 12%',
      
      border_color: '214 32% 91%',
      input_color: '214 32% 91%',
      ring_color: '219 78% 26%',
      
      muted_color: '210 20% 96%',
      muted_foreground: '215 16% 47%',
      
      popover_color: '0 0% 100%',
      popover_foreground: '225 71% 12%',
      
      success_color: '142 76% 36%',
      success_foreground: '210 40% 98%',
      success_light: '142 76% 94%',
      
      warning_color: '38 92% 50%',
      warning_foreground: '225 71% 12%',
      warning_light: '38 92% 94%',
      
      danger_color: '0 84% 60%',
      danger_foreground: '210 40% 98%',
      danger_light: '0 84% 94%',
      
      destructive_color: '0 84% 60%',
      destructive_foreground: '210 40% 98%',
      
      risk_critical: '0 84% 60%',
      risk_high: '24 95% 53%',
      risk_medium: '38 92% 50%',
      risk_low: '142 76% 36%',
      
      sidebar_background: '0 0% 98%',
      sidebar_foreground: '240 5.3% 26.1%',
      sidebar_primary: '240 5.9% 10%',
      sidebar_primary_foreground: '0 0% 98%',
      sidebar_accent: '240 4.8% 95.9%',
      sidebar_accent_foreground: '240 5.9% 10%',
      sidebar_border: '220 13% 91%',
      sidebar_ring: '217.2 91.2% 59.8%',
      
      font_family: 'Inter',
      font_size_base: 14,
      border_radius: 8,
      shadow_intensity: 0.1,
      
      version: '1.0'
    };
    
    const { data: createResult, error: createError } = await supabase
      .from('global_ui_themes')
      .insert(nativeThemeData)
      .select();
    
    if (createError) {
      console.error('❌ Erro ao criar tema nativo:', createError);
      return false;
    }
    
    console.log('✅ Tema nativo criado com sucesso!');
    console.log('📝 Resultado:', createResult);
    
    return true;
  } catch (err) {
    console.error('❌ Erro ao criar tema nativo:', err.message);
    return false;
  }
}

async function checkPermissions() {
  console.log('🔐 Verificando permissões...');
  
  try {
    // Testar permissões de leitura
    const { data: readTest, error: readError } = await supabase
      .from('global_ui_themes')
      .select('id, name')
      .limit(1);
    
    if (readError) {
      console.error('❌ Erro de permissão de leitura:', readError);
      return false;
    }
    
    console.log('✅ Permissão de leitura OK');
    
    // Testar permissões de escrita (tentativa de update em tema existente)
    if (readTest && readTest.length > 0) {
      const { error: writeError } = await supabase
        .from('global_ui_themes')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', readTest[0].id);
      
      if (writeError) {
        console.error('❌ Erro de permissão de escrita:', writeError);
        return false;
      }
      
      console.log('✅ Permissão de escrita OK');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Erro ao verificar permissões:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando diagnóstico do problema de salvamento de temas...\n');
  
  // Verificar se a chave foi fornecida
  if (SUPABASE_SERVICE_ROLE_KEY === 'sua_service_role_key_aqui') {
    console.log('❌ Por favor, configure a SUPABASE_SERVICE_ROLE_KEY no arquivo ou como variável de ambiente.');
    console.log('💡 Você pode encontrar a chave no Supabase Dashboard > Settings > API > service_role key');
    process.exit(1);
  }
  
  // Teste 1: Conexão
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Falha na conexão. Verifique as credenciais do Supabase.');
    process.exit(1);
  }
  
  console.log('');
  
  // Teste 2: Estrutura da tabela
  const tableOk = await checkThemeTable();
  if (!tableOk) {
    console.log('\n❌ Problema com a tabela global_ui_themes.');
    process.exit(1);
  }
  
  console.log('');
  
  // Teste 3: Permissões
  const permissionsOk = await checkPermissions();
  if (!permissionsOk) {
    console.log('\n❌ Problema de permissões. Verifique RLS e políticas.');
    process.exit(1);
  }
  
  console.log('');
  
  // Teste 4: Atualização de tema
  const updateOk = await testThemeUpdate();
  if (!updateOk) {
    console.log('\n❌ Problema ao atualizar tema.');
    process.exit(1);
  }
  
  console.log('\n✅ Todos os testes passaram! O problema pode estar na interface.');
  console.log('💡 Sugestões:');
  console.log('   1. Verifique o console do navegador para erros JavaScript');
  console.log('   2. Verifique se o usuário logado tem permissões adequadas');
  console.log('   3. Verifique se os dados do formulário estão sendo enviados corretamente');
  console.log('   4. Execute este script novamente se o problema persistir');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testConnection,
  checkThemeTable,
  testThemeUpdate,
  createNativeTheme,
  checkPermissions
};