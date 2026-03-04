import dotenv from 'dotenv';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

if (fs.existsSync('supabase/.env')) dotenv.config({ path: 'supabase/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase credentials in env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPlans() {
    console.log("Fetching plans without assessment info...");
    const { data: plans, error: plansError } = await supabase
        .from('action_plans')
        .select('id, entidade_origem_id, metadados')
        .eq('modulo_origem', 'vendor_risk');

    if (plansError) {
        console.error("Error fetching plans:", plansError);
        return;
    }

    const plansToFix = plans.filter(p => !p.metadados || !p.metadados.assessment_id || !p.metadados.assessment_name);
    console.log(`Found ${plansToFix.length} plans to fix.`);

    for (const plan of plansToFix) {
        const vendorId = plan.entidade_origem_id;
        if (!vendorId) continue;

        console.log(`Finding latest assessment for vendor ${vendorId}`);
        const { data: assessments, error: asmError } = await supabase
            .from('vendor_assessments')
            .select('id, assessment_name')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (assessments && assessments.length > 0) {
            const asm = assessments[0];
            const newMeta = {
                ...(plan.metadados || {}),
                assessment_id: asm.id,
                assessment_name: asm.assessment_name,
                fixed_by_script: true
            };

            console.log(`Updating plan ${plan.id} to assessment ${asm.assessment_name}...`);
            const { error: updateError } = await supabase
                .from('action_plans')
                .update({ metadados: newMeta })
                .eq('id', plan.id);

            if (updateError) {
                console.error(`Failed to update plan ${plan.id}:`, updateError);
            } else {
                console.log(`Plan ${plan.id} updated successfully.`);
            }
        } else {
            console.log(`No assessments found for vendor ${vendorId}. Skipping.`);
        }
    }
}

fixPlans().then(() => console.log('Done')).catch(console.error);
