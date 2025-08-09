#!/usr/bin/env node

/**
 * Script para criar usuário administrador da plataforma
 * 
 * Executa:
 * node scripts/create-platform-admin.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  console.log('Verifique se o arquivo .env.local está configurado corretamente')
  process.exit(1)
}

// Criar cliente Supabase com service role key para operações administrativas
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const adminCredentials = {
  email: 'adm@grc-controller.com',
  password: 'Teste123!@#',
  full_name: 'Administrador da Plataforma',
  job_title: 'Platform Administrator'
}

async function createPlatformAdmin() {
  try {
    console.log('🚀 Criando usuário administrador da plataforma...')
    console.log(`📧 Email: ${adminCredentials.email}`)

    // 1. Verificar se o usuário já existe
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const userExists = existingUser?.users?.find(u => u.email === adminCredentials.email)
    
    let userId
    
    if (userExists) {
      console.log('⚠️  Usuário já existe, usando usuário existente')
      userId = userExists.id
    } else {
      // 2. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminCredentials.email,
        password: adminCredentials.password,
        email_confirm: true,
        user_metadata: {
          full_name: adminCredentials.full_name,
          job_title: adminCredentials.job_title
        }
      })

      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError.message)
        process.exit(1)
      }

      userId = authData.user.id
      console.log('✅ Usuário criado no Supabase Auth')
    }

    // 3. Verificar se tenant padrão existe
    const { data: defaultTenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'principal')
      .maybeSingle()

    let tenantId
    if (!defaultTenant) {
      // Criar tenant padrão
      const { data: newTenant, error: createTenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'Organização Principal',
          slug: 'principal',
          contact_email: adminCredentials.email,
          max_users: 1000,
          subscription_plan: 'enterprise'
        })
        .select('id')
        .single()

      if (createTenantError) {
        console.error('❌ Erro ao criar tenant padrão:', createTenantError.message)
        process.exit(1)
      }
      
      tenantId = newTenant.id
      console.log('✅ Tenant padrão criado')
    } else {
      tenantId = defaultTenant.id
      console.log('✅ Usando tenant padrão existente')
    }

    // 4. Criar/atualizar perfil do usuário
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        full_name: adminCredentials.full_name,
        job_title: adminCredentials.job_title,
        tenant_id: tenantId,
        is_active: true,
        permissions: [],
        email: adminCredentials.email
      })

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Perfil criado/atualizado')

    // 5. Adicionar role de admin do sistema
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'admin'
      })

    if (roleError) {
      console.error('❌ Erro ao criar role admin:', roleError.message)
      process.exit(1)
    }

    console.log('✅ Role admin atribuída')

    // 6. Criar entrada como administrador da plataforma
    const { error: platformAdminError } = await supabase
      .from('platform_admins')
      .upsert({
        user_id: userId,
        role: 'platform_admin',
        permissions: JSON.stringify([
          'tenants.manage', 
          'users.global', 
          'platform.admin',
          'read',
          'write', 
          'delete', 
          'admin'
        ])
      })

    if (platformAdminError) {
      console.error('❌ Erro ao criar administrador da plataforma:', platformAdminError.message)
      process.exit(1)
    }

    console.log('✅ Administrador da plataforma configurado')

    // 7. Verificar criação
    const { data: verification } = await supabase
      .from('platform_admins')
      .select(`
        *,
        profiles:user_id (full_name, email)
      `)
      .eq('user_id', userId)
      .single()

    if (verification) {
      console.log('\n🎉 SUCESSO! Administrador da plataforma criado com sucesso!')
      console.log('📋 Detalhes:')
      console.log(`   Email: ${adminCredentials.email}`)
      console.log(`   Senha: ${adminCredentials.password}`)
      console.log(`   Nome: ${adminCredentials.full_name}`)
      console.log(`   ID: ${userId}`)
      console.log(`   Tenant: ${tenantId}`)
      console.log('\n🔑 Agora você pode fazer login com essas credenciais!')
      console.log('📱 Acesse /admin/tenants para gerenciar organizações')
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message)
    process.exit(1)
  }
}

// Executar script
createPlatformAdmin()
  .then(() => {
    console.log('\n✨ Script concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Falha na execução:', error)
    process.exit(1)
  })