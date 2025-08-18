#!/usr/bin/env node

/**
 * Script para testar a atualização completa do tema com todos os campos
 */

const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const SUPABASE_URL = 'https://myxvxponlmulnjstbjwd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15eHZ4cG9ubG11bG5qc3RiandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTQzNTMsImV4cCI6MjA2ODU5MDM1M30.V9yqc2cgrRCLxlXF2HkISzPT9WQ7Hw14r_yE8UROgD4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFullThemeUpdate() {
  console.log('🧪 Testando atualização completa do tema...');
  
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
    
    // Preparar dados completos (como na interface, mas sem campos inexistentes)
    const themeData = {
      name: theme.name,
      display_name: 'UI Nativa (Teste Completo)',
      description: 'Teste completo de atualização - ' + new Date().toISOString(),
      is_dark_mode: theme.is_dark_mode || false,
      
      // Cores principais
      primary_color: theme.primary_color,
      primary_foreground: theme.primary_foreground,
      primary_hover: theme.primary_hover,
      primary_glow: theme.primary_glow,
      secondary_color: theme.secondary_color,
      secondary_foreground: theme.secondary_foreground,
      accent_color: theme.accent_color,
      accent_foreground: theme.accent_foreground,
      
      // Backgrounds e superfícies
      background_color: theme.background_color,
      foreground_color: theme.foreground_color,
      card_color: theme.card_color,
      card_foreground: theme.card_foreground,
      border_color: theme.border_color,
      input_color: theme.input_color,
      ring_color: theme.ring_color,
      muted_color: theme.muted_color,
      muted_foreground: theme.muted_foreground,
      popover_color: theme.popover_color,
      popover_foreground: theme.popover_foreground,
      
      // Cores de estado
      success_color: theme.success_color,
      success_foreground: theme.success_foreground,
      success_light: theme.success_light,
      warning_color: theme.warning_color,
      warning_foreground: theme.warning_foreground,
      warning_light: theme.warning_light,
      danger_color: theme.danger_color,
      danger_foreground: theme.danger_foreground,
      danger_light: theme.danger_light,
      destructive_color: theme.destructive_color,
      destructive_foreground: theme.destructive_foreground,
      
      // Cores de risco GRC
      risk_critical: theme.risk_critical,
      risk_high: theme.risk_high,
      risk_medium: theme.risk_medium,
      risk_low: theme.risk_low,
      
      // Cores do sidebar
      sidebar_background: theme.sidebar_background,
      sidebar_foreground: theme.sidebar_foreground,
      sidebar_primary: theme.sidebar_primary,
      sidebar_primary_foreground: theme.sidebar_primary_foreground,
      sidebar_accent: theme.sidebar_accent,
      sidebar_accent_foreground: theme.sidebar_accent_foreground,
      sidebar_border: theme.sidebar_border,
      sidebar_ring: theme.sidebar_ring,
      
      // Tipografia e layout
      font_family: theme.font_family,
      font_size_base: theme.font_size_base,
      border_radius: theme.border_radius,
      shadow_intensity: theme.shadow_intensity,
      
      // Metadados
      version: theme.version || '1.0',
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Dados preparados para atualização completa');
    console.log('🔄 Executando atualização...');
    
    // Executar atualização
    const { data: result, error: updateError } = await supabase
      .from('global_ui_themes')
      .update(themeData)
      .eq('id', theme.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erro na atualização:', updateError);
      console.error('📋 Detalhes:', JSON.stringify(updateError, null, 2));
      return false;
    }
    
    console.log('✅ Atualização completa bem-sucedida!');
    console.log('📊 Resultado:', result[0].display_name);
    
    return true;
  } catch (err) {
    console.error('❌ Erro:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando teste de atualização completa...\n');
  
  const success = await testFullThemeUpdate();
  
  if (success) {
    console.log('\n✅ Teste completo passou! O problema não está nos dados.');
    console.log('💡 Verifique:');
    console.log('   1. Autenticação do usuário na interface');
    console.log('   2. Permissões RLS para o usuário específico');
    console.log('   3. Console do navegador para erros JavaScript');
    console.log('   4. Se o formulário está sendo populado corretamente');
  } else {
    console.log('\n❌ Teste falhou. Há um problema específico.');
  }
}

main().catch(console.error);