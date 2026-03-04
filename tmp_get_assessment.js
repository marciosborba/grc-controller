const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('supabase/.env'));
const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('vendor_assessments')
        .select('*, vendor_assessment_frameworks(*)')
        .eq('status', 'pending_validation')
        .limit(1);

    if (error) {
        console.error("Error:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log(JSON.stringify({
            id: data[0].id,
            responses: data[0].responses,
            questions: data[0].vendor_assessment_frameworks?.questions?.map(q => ({ id: q.id, type: q.type, question: q.question }))
        }, null, 2));
    } else {
        console.log("No assessments found pending validation");
    }
}

run();
