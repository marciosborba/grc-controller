import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        // Update RPC to TRIM both sides on comparison + trim existing records
        await pool.query(`
CREATE OR REPLACE FUNCTION public.get_public_assessment_data(p_link text)
 RETURNS SETOF jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  WHERE TRIM(a.public_link) = TRIM(p_link)
  AND (a.public_link_expires_at IS NULL OR a.public_link_expires_at > now())
  AND a.status = ANY (ARRAY['draft', 'sent', 'in_progress', 'completed', 'pending_validation']);
END;
$function$;
        `);
        console.log('✅ RPC updated with TRIM() for both sides.');

        // Also trim all existing public_link values in the DB
        const { rowCount } = await pool.query(`
            UPDATE vendor_assessments 
            SET public_link = TRIM(public_link) 
            WHERE public_link != TRIM(public_link);
        `);
        console.log(`✅ Trimmed ${rowCount} existing public_link values.`);

        // Test
        const testLink = 'YjcxZTRmYzItNTgw_mmc548g3';
        const { rows } = await pool.query(`SELECT * FROM get_public_assessment_data($1)`, [testLink]);
        console.log(`\nTest result: ${rows.length} rows returned.`);
        if (rows.length > 0) {
            const d = rows[0];
            const key = Object.keys(d)[0];
            console.log('Assessment:', d[key]?.assessment_name || JSON.stringify(d).substring(0, 100));
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
