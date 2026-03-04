import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envConfig = dotenv.parse(fs.readFileSync('.env'));
const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase
        .from('vendor_assessments')
        .select('id, assessment_name, responses, metadata, vendor_assessment_frameworks(questions)')
        .eq('status', 'pending_validation')
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        const assessment = data[0];
        const questions = assessment.metadata?.questions
            || assessment.vendor_assessment_frameworks?.questions
            || [];

        console.log(JSON.stringify({
            id: assessment.id,
            name: assessment.assessment_name,
            responses: assessment.responses,
            questionsInfo: questions.map(q => ({ id: q.id, type: q.type, category: q.category, text: q.text || q.question }))
        }, null, 2));
    } else {
        console.log("No assessments found pending validation");
    }
}

run();
