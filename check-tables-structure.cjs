const { Client } = require('pg');
require('dotenv').config();

async function checkTablesStructure() {
  const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL');

    // 1. Verificar estrutura da tabela profiles
    console.log('\n📋 ESTRUTURA DA TABELA PROFILES:');
    const profilesStructure = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    console.table(profilesStructure.rows);

    // 2. Verificar constraints da tabela profiles
    console.log('\n🔗 CONSTRAINTS DA TABELA PROFILES:');
    const profilesConstraints = await client.query(`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'profiles'::regclass
    `);
    console.table(profilesConstraints.rows);

    // 3. Verificar se existem campos que estamos tentando usar
    console.log('\n🔍 VERIFICANDO CAMPOS ESPECÍFICOS EM PROFILES:');
    const fieldsToCheck = [
      'invitation_token', 'invitation_sent_at', 'invitation_expires_at', 'status'
    ];
    
    for (const field of fieldsToCheck) {
      const fieldExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND column_name = $1
          AND table_schema = 'public'
        )
      `, [field]);
      
      console.log(`Campo '${field}': ${fieldExists.rows[0].exists ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
    }

    // 4. Testar inserção com dados mínimos válidos
    console.log('\n🧪 TESTANDO INSERÇÃO COM DADOS MÍNIMOS:');
    const { randomUUID } = require('crypto');
    const testUserId = randomUUID();
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Dados mínimos baseados na estrutura real
    const minimalData = {
      user_id: testUserId,
      full_name: 'Teste Usuario',
      email: testEmail,
      tenant_id: '46b1c048-85a1-423b-96fc-776007c8de1f', // Tenant conhecido
      is_active: true
    };
    
    console.log('📝 Dados para teste:', minimalData);
    
    try {
      const result = await client.query(`
        INSERT INTO profiles (user_id, full_name, email, tenant_id, is_active)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [minimalData.user_id, minimalData.full_name, minimalData.email, minimalData.tenant_id, minimalData.is_active]);
      
      console.log('✅ INSERÇÃO FUNCIONOU:', result.rows[0]);
      
      // Limpar teste
      await client.query('DELETE FROM profiles WHERE user_id = $1', [testUserId]);
      console.log('🧹 Registro de teste removido');
      
    } catch (insertError) {
      console.error('❌ ERRO NA INSERÇÃO:', insertError.message);
      console.error('📋 Código do erro:', insertError.code);
      console.error('📋 Detalhes:', insertError.detail);
    }

    // 5. Verificar se precisamos adicionar campos
    console.log('\n💡 RECOMENDAÇÕES:');
    const missingFields = [];
    for (const field of fieldsToCheck) {
      const fieldExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND column_name = $1
          AND table_schema = 'public'
        )
      `, [field]);
      
      if (!fieldExists.rows[0].exists) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      console.log('⚠️  Campos faltando na tabela profiles:');
      missingFields.forEach(field => {
        console.log(`   - ${field}`);
      });
      
      console.log('\n📝 SQL para adicionar campos:');
      console.log('ALTER TABLE profiles ADD COLUMN invitation_token UUID;');
      console.log('ALTER TABLE profiles ADD COLUMN invitation_sent_at TIMESTAMP WITH TIME ZONE;');
      console.log('ALTER TABLE profiles ADD COLUMN invitation_expires_at TIMESTAMP WITH TIME ZONE;');
      console.log('ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT \'active\';');
    } else {
      console.log('✅ Todos os campos necessários existem');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

checkTablesStructure();