const { Client } = require('pg');
require('dotenv').config();

async function checkGepriv() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        console.log('Checking for vendor "Gepriv"...');
        const vendorRes = await client.query("SELECT * FROM public.vendor_registry WHERE name ILIKE '%Gepriv%'");

        if (vendorRes.rows.length === 0) {
            console.log('Vendor "Gepriv" NOT FOUND.');
        } else {
            console.log(`Found ${vendorRes.rows.length} vendor(s):`);
            vendorRes.rows.forEach(v => console.log(`- ID: ${v.id}, Name: ${v.name}`));

            const vendorIds = vendorRes.rows.map(v => v.id);
            console.log('\nChecking for assessments for these vendors...');

            const assessmentRes = await client.query("SELECT * FROM public.vendor_assessments WHERE vendor_id = ANY($1)", [vendorIds]);

            if (assessmentRes.rows.length === 0) {
                console.log('No assessments found for "Gepriv".');
            } else {
                console.log(`Found ${assessmentRes.rows.length} assessment(s):`);
                assessmentRes.rows.forEach(a => console.log(`- ID: ${a.id}, Name: ${a.assessment_name}, Status: ${a.status}, Public Link: ${a.public_link}`));
            }
        }

    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await client.end();
    }
}

checkGepriv();
