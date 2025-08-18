#!/usr/bin/env node

/**
 * Script simples para testar a atualização do tema UI Nativa
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSimpleUpdate() {
  console.log('🧪 Testando atualização simples do tema...');
  
  try {
    // Buscar tema nativo
    const { data: theme, error: findError } = await supabase
      .from('global_ui_themes')
      .select('*')
      .eq('is_native_theme', true)
      .single();
    
    if (findError) {
      console.error('❌ Erro ao buscar tema:', findError);
      return false;
    }
    
    console.log('✅ Tema encontrado:', theme.display_name);
    
    // Tentar atualização simples
    const { data: result, error: updateError } = await supabase
      .from('global_ui_themes')
      .update({
        description: 'Teste de atualização - ' + new Date().toISOString()
      })
      .eq('id', theme.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erro na atualização:', updateError);
      return false;
    }
    
    console.log('✅ Atualização bem-sucedida!');
    console.log('📊 Resultado:', result);
    
    return true;
  } catch (err) {
    console.error('❌ Erro:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando teste simples...\n');
  
  const success = await testSimpleUpdate();
  
  if (success) {
    console.log('\n✅ Teste passou! O banco está funcionando.');
    console.log('💡 O problema pode estar na interface ou nas permissões do usuário.');
  } else {
    console.log('\n❌ Teste falhou. Há um problema com o banco ou permissões.');
  }
}

main().catch(console.error);