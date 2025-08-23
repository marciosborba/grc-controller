// Utilitário temporário para corrigir a função apply_theme
import { supabase } from '@/integrations/supabase/client';

export const fixApplyThemeFunction = async () => {
  try {
    console.log('🔧 Executando correção da função apply_theme...');
    
    const sqlFunction = `
      CREATE OR REPLACE FUNCTION apply_theme(theme_uuid UUID, tenant_uuid UUID DEFAULT NULL)
      RETURNS BOOLEAN AS $$
      DECLARE
          theme_record global_ui_themes%ROWTYPE;
          previous_theme_id UUID;
      BEGIN
          -- Buscar o tema
          SELECT * INTO theme_record 
          FROM global_ui_themes 
          WHERE id = theme_uuid;
          
          IF NOT FOUND THEN
              RAISE EXCEPTION 'Tema não encontrado: %', theme_uuid;
          END IF;
          
          -- Buscar tema anterior para histórico
          SELECT active_theme_id INTO previous_theme_id
          FROM global_ui_settings 
          WHERE tenant_id = tenant_uuid OR (tenant_uuid IS NULL AND tenant_id IS NULL)
          LIMIT 1;
          
          -- 1. DESATIVAR TODOS OS TEMAS (importante para evitar conflitos)
          UPDATE global_ui_themes 
          SET is_active = false 
          WHERE (tenant_id = tenant_uuid OR (tenant_uuid IS NULL AND tenant_id IS NULL));
          
          -- 2. ATIVAR O TEMA SELECIONADO
          UPDATE global_ui_themes 
          SET is_active = true 
          WHERE id = theme_uuid;
          
          -- 3. ATUALIZAR/CRIAR CONFIGURAÇÕES DO TENANT
          INSERT INTO global_ui_settings (tenant_id, active_theme_id, created_by, updated_at)
          VALUES (tenant_uuid, theme_uuid, auth.uid(), NOW())
          ON CONFLICT (tenant_id) DO UPDATE SET
              active_theme_id = theme_uuid,
              updated_at = NOW();
          
          -- 4. REGISTRAR NO HISTÓRICO
          INSERT INTO theme_change_history (
              tenant_id,
              previous_theme_id,
              new_theme_id,
              changed_by,
              change_reason,
              previous_config,
              new_config
          ) VALUES (
              tenant_uuid,
              previous_theme_id,
              theme_uuid,
              auth.uid(),
              'Tema aplicado via interface administrativa',
              CASE 
                  WHEN previous_theme_id IS NOT NULL THEN 
                      (SELECT row_to_json(t.*) FROM global_ui_themes t WHERE t.id = previous_theme_id)
                  ELSE NULL 
              END,
              row_to_json(theme_record)
          );
          
          RETURN true;
      END;
      $$ LANGUAGE plpgsql;
    `;

    // Executar a função SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlFunction });
    
    if (error) {
      console.error('❌ Erro ao executar correção:', error);
      return false;
    }
    
    console.log('✅ Função apply_theme corrigida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro na correção:', error);
    return false;
  }
};

// Função alternativa usando SQL direto
export const manualFixApplyTheme = async () => {
  try {
    console.log('🔧 Aplicando correção manual...');
    
    // Primeiro, vamos verificar o estado atual
    const { data: currentThemes, error: queryError } = await supabase
      .from('global_ui_themes')
      .select('id, name, display_name, is_active')
      .order('created_at');
    
    if (queryError) {
      console.error('❌ Erro ao consultar temas:', queryError);
      return false;
    }
    
    console.log('📊 Temas atuais:', currentThemes);
    
    // Desativar todos os temas primeiro
    const { error: deactivateError } = await supabase
      .from('global_ui_themes')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deactivateError) {
      console.error('❌ Erro ao desativar temas:', deactivateError);
      return false;
    }
    
    console.log('✅ Todos os temas desativados');
    
    // Encontrar o tema UI Nativa
    const nativeTheme = currentThemes?.find(t => t.name === 'ui_nativa' || t.display_name?.includes('UI Nativa'));
    
    if (nativeTheme) {
      // Ativar o tema UI Nativa
      const { error: activateError } = await supabase
        .from('global_ui_themes')
        .update({ is_active: true })
        .eq('id', nativeTheme.id);
      
      if (activateError) {
        console.error('❌ Erro ao ativar tema nativo:', activateError);
        return false;
      }
      
      // Atualizar global_ui_settings
      const { error: settingsError } = await supabase
        .from('global_ui_settings')
        .upsert({
          tenant_id: null,
          active_theme_id: nativeTheme.id,
          updated_at: new Date().toISOString()
        });
      
      if (settingsError) {
        console.error('❌ Erro ao atualizar configurações:', settingsError);
        return false;
      }
      
      console.log('✅ Tema UI Nativa ativado:', nativeTheme.display_name);
      return true;
    } else {
      console.log('⚠️ Tema UI Nativa não encontrado');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro na correção manual:', error);
    return false;
  }
};