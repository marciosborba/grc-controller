-- Criar função RPC para testar update direto no banco
CREATE OR REPLACE FUNCTION update_template_active(
  template_id UUID,
  new_active_status BOOLEAN
)
RETURNS TABLE(id UUID, name TEXT, is_active BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log para debug
  RAISE NOTICE 'Atualizando template % para is_active = %', template_id, new_active_status;
  
  -- Update direto
  UPDATE ai_grc_prompt_templates 
  SET 
    is_active = new_active_status,
    updated_at = NOW()
  WHERE ai_grc_prompt_templates.id = template_id;
  
  -- Retornar o resultado
  RETURN QUERY
  SELECT 
    ai_grc_prompt_templates.id,
    ai_grc_prompt_templates.name,
    ai_grc_prompt_templates.is_active
  FROM ai_grc_prompt_templates 
  WHERE ai_grc_prompt_templates.id = template_id;
END;
$$;