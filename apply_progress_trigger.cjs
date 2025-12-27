const DatabaseManager = require('./database-manager.cjs');

const sql = `
CREATE OR REPLACE FUNCTION update_assessment_progress_trigger()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_assessment_id UUID;
    v_total_questions INTEGER;
    v_answered_questions INTEGER;
    v_framework_id UUID;
    v_current_status TEXT;
BEGIN
    v_assessment_id := COALESCE(NEW.assessment_id, OLD.assessment_id);

    -- Get Framework ID and Current Status
    SELECT framework_id, status INTO v_framework_id, v_current_status
    FROM assessments
    WHERE id = v_assessment_id;

    -- Count Total Questions for this Framework
    SELECT COUNT(q.id) INTO v_total_questions
    FROM assessment_questions q
    JOIN assessment_controls c ON c.id = q.control_id
    WHERE c.framework_id = v_framework_id
    AND q.ativa = true;

    -- Count Answered Questions for this Assessment
    SELECT COUNT(DISTINCT question_id) INTO v_answered_questions
    FROM assessment_responses
    WHERE assessment_id = v_assessment_id;

    -- Avoid Division by Zero
    IF v_total_questions IS NULL OR v_total_questions = 0 THEN
        v_total_questions := 1;
    END IF;

    -- Update Assessment
    UPDATE assessments
    SET
        percentual_conclusao = ROUND((v_answered_questions::NUMERIC / v_total_questions::NUMERIC) * 100),
        status = CASE
            WHEN status = 'planejado' AND v_answered_questions > 0 THEN 'em_andamento'
            ELSE status
        END,
        updated_at = NOW()
    WHERE id = v_assessment_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_assessment_progress ON assessment_responses;

CREATE TRIGGER trg_update_assessment_progress
AFTER INSERT OR UPDATE OR DELETE ON assessment_responses
FOR EACH ROW
EXECUTE FUNCTION update_assessment_progress_trigger();
`;

async function main() {
    const db = new DatabaseManager();
    await db.connect();
    try {
        await db.executeSQL(sql, 'Applying Progress and Status Auto-Update Trigger');
    } finally {
        await db.disconnect();
    }
}

main().catch(console.error);
