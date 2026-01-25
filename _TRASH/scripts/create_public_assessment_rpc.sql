-- Function to get public assessment data bypassing RLS
-- This is necessary because the public user needs access to joined tables (vendor_registry, frameworks)
-- which might not have public RLS policies.

DROP FUNCTION IF EXISTS get_public_assessment_data(text);

CREATE OR REPLACE FUNCTION get_public_assessment_data(p_link text)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (bypass RLS)
SET search_path = public -- Security best practice
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(a) || 
    jsonb_build_object(
      'vendor_registry', (
        SELECT jsonb_build_object(
          'name', v.name, 
          'primary_contact_name', v.primary_contact_name
        )
        FROM vendor_registry v
        WHERE v.id = a.vendor_id
      ),
      'vendor_assessment_frameworks', (
        SELECT jsonb_build_object(
          'name', f.nome,
          'framework_type', f.tipo_framework,
          'questions', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', q.id,
                'category', c.categoria,
                'question', q.texto,
                'type', CASE 
                  WHEN q.tipo_pergunta = 'sim_nao' THEN 'yes_no'
                  WHEN q.tipo_pergunta = 'multipla_escolha' THEN 'multiple_choice'
                  WHEN q.tipo_pergunta = 'escala' THEN 'scale'
                  ELSE q.tipo_pergunta 
                END,
                'options', q.opcoes_resposta,
                'required', q.obrigatoria,
                'weight', q.peso,
                'help_text', q.texto_ajuda,
                'scale_min', q.valor_minimo,
                'scale_max', q.valor_maximo
              ) ORDER BY c.ordem, q.ordem
            )
            FROM assessment_controls c
            JOIN assessment_questions q ON q.control_id = c.id
            WHERE c.framework_id = f.id
          )
        )
        FROM assessment_frameworks f
        WHERE f.id = a.framework_id
      )
    )
  FROM vendor_assessments a
  WHERE a.public_link = p_link
  AND a.public_link_expires_at > now()
  AND a.status = ANY (ARRAY['draft', 'sent', 'in_progress', 'completed']);
END;
$$;

-- Grant access to public (anonymous) users
GRANT EXECUTE ON FUNCTION get_public_assessment_data(text) TO public;
