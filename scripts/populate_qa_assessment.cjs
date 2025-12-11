const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

async function populateQAAssessment() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // 1. Get Vendor (GePriv)
        console.log('Fetching vendor "GePriv"...');
        const vendorRes = await client.query("SELECT id, name FROM public.vendor_registry WHERE name ILIKE '%GePriv%' LIMIT 1");
        if (vendorRes.rows.length === 0) {
            console.error('Vendor "GePriv" not found. Please create it first.');
            return;
        }
        const vendor = vendorRes.rows[0];
        console.log(`Using Vendor: ${vendor.name} (${vendor.id})`);

        // 2. Get Framework
        console.log('Fetching a framework...');
        const frameworkRes = await client.query("SELECT id, nome as name FROM public.assessment_frameworks LIMIT 1");
        if (frameworkRes.rows.length === 0) {
            console.error('No assessment frameworks found.');
            return;
        }
        const framework = frameworkRes.rows[0];
        console.log(`Using Framework: ${framework.name} (${framework.id})`);

        // 3. Get Questions via Controls
        console.log('Fetching questions...');
        const questionsQuery = `
      SELECT q.id, q.tipo_pergunta as type
      FROM public.assessment_questions q
      JOIN public.assessment_controls c ON q.control_id = c.id
      WHERE c.framework_id = $1
    `;
        const questionsRes = await client.query(questionsQuery, [framework.id]);
        const questions = questionsRes.rows;
        console.log(`Found ${questions.length} questions.`);

        // 4. Prepare Dummy Responses
        const responses = {};
        questions.forEach((q, index) => {
            if (index % 2 === 0) { // Answer half of them
                if (q.type === 'yes_no') responses[q.id] = 'yes';
                else if (q.type === 'text') responses[q.id] = 'QA Test Response';
                else if (q.type === 'rating') responses[q.id] = '5';
                else responses[q.id] = 'Test';
            }
        });

        // 4. Create Assessment
        const assessmentId = crypto.randomUUID();
        const publicLink = crypto.randomBytes(16).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

        console.log('Creating QA Assessment...');
        const insertQuery = `
      INSERT INTO public.vendor_assessments (
        id,
        vendor_id,
        framework_id,
        assessment_name,
        status,
        progress_percentage,
        responses,
        public_link,
        public_link_expires_at,
        created_at,
        updated_at,
        tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), (SELECT tenant_id FROM public.profiles LIMIT 1))
      RETURNING id;
    `;

        const values = [
            assessmentId,
            vendor.id,
            framework.id,
            'QA Test Assessment - CRUD Example',
            'in_progress',
            50,
            JSON.stringify(responses),
            publicLink,
            expiresAt.toISOString()
        ];

        const res = await client.query(insertQuery, values);
        console.log(`✅ Assessment Created Successfully!`);
        console.log(`- ID: ${res.rows[0].id}`);
        console.log(`- Public Link: ${publicLink}`);
        console.log(`- URL: ${process.env.VITE_APP_URL || 'http://localhost:5173'}/vendor-assessment/${publicLink}`);

    } catch (err) {
        console.error('Error creating assessment:', err);
    } finally {
        await client.end();
    }
}

populateQAAssessment();
