#!/usr/bin/env node

/**
 * Script para testar especificamente a atualização do tema UI Nativa
 * Simula exatamente o que a interface está fazendo
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NDcxOTQsImV4cCI6MjA1MDEyMzE5NH0.Vo1agPUE4QGwlwqS';

// Criar cliente Supabase com anon key (como na interface)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testThemeUpdateLikeInterface() {
  console.log('🧪 Testando atualização de tema como na interface...');
  
  try {
    // 1. Buscar o tema UI Nativa (como a interface faz)
    console.log('🔍 Buscando tema UI Nativa...');
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
      console.error('❌ Tema nativo não encontrado');
      return false;
    }
    
    console.log('✅ Tema nativo encontrado:', nativeTheme.display_name);
    console.log('📋 ID do tema:', nativeTheme.id);
    
    // 2. Preparar dados de atualização (exatamente como no código da interface)\n    const themeData = {\n      name: nativeTheme.name,\n      display_name: 'UI Nativa (Atualizada)',\n      description: 'Tema nativo atualizado via teste - ' + new Date().toISOString(),\n      is_dark_mode: nativeTheme.is_dark_mode || false,\n      \n      // Cores principais\n      primary_color: nativeTheme.primary_color,\n      primary_foreground: nativeTheme.primary_foreground,\n      primary_hover: nativeTheme.primary_hover,\n      primary_glow: nativeTheme.primary_glow,\n      secondary_color: nativeTheme.secondary_color,\n      secondary_foreground: nativeTheme.secondary_foreground,\n      accent_color: nativeTheme.accent_color,\n      accent_foreground: nativeTheme.accent_foreground,\n      \n      // Backgrounds e superfícies\n      background_color: nativeTheme.background_color,\n      foreground_color: nativeTheme.foreground_color,\n      card_color: nativeTheme.card_color,\n      card_foreground: nativeTheme.card_foreground,\n      border_color: nativeTheme.border_color,\n      input_color: nativeTheme.input_color,\n      ring_color: nativeTheme.ring_color,\n      muted_color: nativeTheme.muted_color,\n      muted_foreground: nativeTheme.muted_foreground,\n      popover_color: nativeTheme.popover_color,\n      popover_foreground: nativeTheme.popover_foreground,\n      \n      // Cores de estado\n      success_color: nativeTheme.success_color,\n      success_foreground: nativeTheme.success_foreground,\n      success_light: nativeTheme.success_light,\n      warning_color: nativeTheme.warning_color,\n      warning_foreground: nativeTheme.warning_foreground,\n      warning_light: nativeTheme.warning_light,\n      danger_color: nativeTheme.danger_color,\n      danger_foreground: nativeTheme.danger_foreground,\n      danger_light: nativeTheme.danger_light,\n      destructive_color: nativeTheme.destructive_color,\n      destructive_foreground: nativeTheme.destructive_foreground,\n      \n      // Cores de risco GRC\n      risk_critical: nativeTheme.risk_critical,\n      risk_high: nativeTheme.risk_high,\n      risk_medium: nativeTheme.risk_medium,\n      risk_low: nativeTheme.risk_low,\n      \n      // Cores do sidebar\n      sidebar_background: nativeTheme.sidebar_background,\n      sidebar_foreground: nativeTheme.sidebar_foreground,\n      sidebar_primary: nativeTheme.sidebar_primary,\n      sidebar_primary_foreground: nativeTheme.sidebar_primary_foreground,\n      sidebar_accent: nativeTheme.sidebar_accent,\n      sidebar_accent_foreground: nativeTheme.sidebar_accent_foreground,\n      sidebar_border: nativeTheme.sidebar_border,\n      sidebar_ring: nativeTheme.sidebar_ring,\n      \n      // Tipografia e layout\n      font_family: nativeTheme.font_family,\n      font_size_base: nativeTheme.font_size_base,\n      border_radius: nativeTheme.border_radius,\n      shadow_intensity: nativeTheme.shadow_intensity,\n      \n      // Metadados\n      version: nativeTheme.version || '1.0',\n      updated_at: new Date().toISOString()\n    };\n    \n    console.log('📝 Dados preparados para atualização');\n    console.log('🔄 Executando atualização...');\n    \n    // 3. Executar atualização (exatamente como na interface)\n    const { data: updateResult, error: updateError } = await supabase\n      .from('global_ui_themes')\n      .update(themeData)\n      .eq('id', nativeTheme.id)\n      .select();\n    \n    if (updateError) {\n      console.error('❌ Erro na atualização:', updateError);\n      console.error('📋 Detalhes do erro:', JSON.stringify(updateError, null, 2));\n      return false;\n    }\n    \n    console.log('✅ Tema atualizado com sucesso!');\n    console.log('📊 Resultado:', updateResult);\n    \n    return true;\n  } catch (err) {\n    console.error('❌ Erro geral:', err.message);\n    console.error('📋 Stack trace:', err.stack);\n    return false;\n  }\n}\n\nasync function testWithAuth() {\n  console.log('🔐 Testando com autenticação...');\n  \n  // Simular login (você pode precisar ajustar isso)\n  try {\n    // Para teste, vamos tentar sem autenticação primeiro\n    const result = await testThemeUpdateLikeInterface();\n    \n    if (!result) {\n      console.log('\\n⚠️ Teste falhou. Possíveis causas:');\n      console.log('   1. Problema de permissões RLS');\n      console.log('   2. Usuário não autenticado');\n      console.log('   3. Campos inválidos sendo enviados');\n      console.log('   4. Problema de validação no banco');\n    }\n    \n    return result;\n  } catch (err) {\n    console.error('❌ Erro no teste com auth:', err.message);\n    return false;\n  }\n}\n\nasync function main() {\n  console.log('🚀 Iniciando teste específico de atualização de tema...\\n');\n  \n  const success = await testWithAuth();\n  \n  if (success) {\n    console.log('\\n🎉 Teste concluído com sucesso!');\n    console.log('💡 Se o problema persiste na interface, verifique:');\n    console.log('   1. Console do navegador para erros JavaScript');\n    console.log('   2. Autenticação do usuário');\n    console.log('   3. Permissões do usuário logado');\n  } else {\n    console.log('\\n❌ Teste falhou. Investigando possíveis soluções...');\n  }\n}\n\n// Executar script\nif (require.main === module) {\n  main().catch(console.error);\n}\n\nmodule.exports = {\n  testThemeUpdateLikeInterface,\n  testWithAuth\n};