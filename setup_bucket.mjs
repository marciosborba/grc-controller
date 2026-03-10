import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL in .env');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('Connected to database. Setting up Storage bucket...');

        // 1. Create bucket if not exists
        await client.query(`
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ('custom_fields_attachments', 'custom_fields_attachments', true, 10485760, null)
      ON CONFLICT (id) DO NOTHING;
    `);
        console.log('Bucket "custom_fields_attachments" setup complete.');

        // 2. Setup standard public policies (everyone can read/upload for now, or based on tenant_id later)
        // For now we'll allow authenticated users to upload and anyone to read
        await client.query(`
      -- Drop existing policies if they exist to recreate them
      DROP POLICY IF EXISTS "Public Access" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;

      CREATE POLICY "Public Access" 
      ON storage.objects FOR SELECT 
      USING ( bucket_id = 'custom_fields_attachments' );

      CREATE POLICY "Authenticated Uploads" 
      ON storage.objects FOR INSERT 
      WITH CHECK ( bucket_id = 'custom_fields_attachments' AND auth.uid() IS NOT NULL );
      
      CREATE POLICY "Authenticated Deletes" 
      ON storage.objects FOR DELETE 
      USING ( bucket_id = 'custom_fields_attachments' AND auth.uid() IS NOT NULL );
    `);
        console.log('Storage policies for "custom_fields_attachments" updated.');

    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
