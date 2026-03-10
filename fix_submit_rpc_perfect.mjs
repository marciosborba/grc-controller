import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log('\nFixing RPC with hardcoded correct columns (titulo, descricao, prioridade, data_limite, status)...');

        await pool.query(`
CREATE OR REPLACE FUNCTION public.submit_vendor_assessment_secure(p_id uuid, p_responses jsonb, p_progress integer, p_submission_summary text, p_generated_plans jsonb DEFAULT '[]'::jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_assessment vendor_assessments%ROWTYPE;
    v_category_id uuid;
    v_plan jsonb;
BEGIN
    -- Verify assessment
    SELECT * INTO v_assessment
    FROM vendor_assessments
    WHERE id = p_id
      AND public_link IS NOT NULL
      AND (public_link_expires_at IS NULL OR public_link_expires_at > now())
      AND status IN ('sent', 'in_progress', 'pending_validation');

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Update assessment
    UPDATE vendor_assessments
    SET 
        responses = p_responses,
        progress_percentage = p_progress,
        status = 'pending_validation',
        submission_summary = COALESCE(p_submission_summary, submission_summary),
        vendor_submitted_at = now(),
        updated_at = now()
    WHERE id = p_id;

    -- Process action plans if any
    IF jsonb_array_length(p_generated_plans) > 0 THEN
        -- Get or create category
        SELECT id INTO v_category_id
        FROM action_plan_categories
        WHERE tenant_id = v_assessment.tenant_id
        LIMIT 1;

        IF v_category_id IS NULL THEN
            INSERT INTO action_plan_categories (
                tenant_id, name, description, color, active
            ) VALUES (
                v_assessment.tenant_id, 'Planos de Ação de Fornecedores', 'Gerados automaticamente por assessments de terceiros', '#FF5733', true
            ) RETURNING id INTO v_category_id;
        END IF;

        -- Insert plans with CORRECT column names
        FOR v_plan IN SELECT * FROM jsonb_array_elements(p_generated_plans) LOOP
            INSERT INTO action_plans (
                tenant_id, 
                category_id, 
                titulo, 
                descricao, 
                codigo,
                modulo_origem,
                prioridade, 
                data_fim_planejada, 
                status,
                entidade_origem_tipo,
                entidade_origem_id
            ) VALUES (
                v_assessment.tenant_id,
                v_category_id,
                v_plan->>'title',
                v_plan->>'description',
                'ACT-' || upper(substr(md5(random()::text), 1, 6)),
                'vendor_risk',
                CASE (v_plan->>'priority')
                    WHEN 'critical' THEN 'urgente'
                    WHEN 'high' THEN 'alta'
                    WHEN 'medium' THEN 'media'
                    WHEN 'low' THEN 'baixa'
                    ELSE COALESCE(v_plan->>'priority', 'media')
                END,
                (v_plan->>'dueDate')::timestamp,
                'aprovacao_pendente',
                'vendor_assessment',
                v_assessment.id
            );
        END LOOP;
    END IF;

    RETURN true;
END;
$function$;
        `);
        console.log('✅ RPC submit_vendor_assessment_secure updated with guaranteed column names.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
