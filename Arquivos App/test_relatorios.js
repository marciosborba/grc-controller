// Script de teste para verificar se os relatórios estão funcionando
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRelatorios() {
  console.log('🔍 Testando sistema de relatórios...')
  
  try {
    // 1. Verificar se as tabelas existem
    console.log('\n1. Verificando tabelas...')
    const { data: relatorios, error: relatoriosError } = await supabase
      .from('relatorios_auditoria')
      .select('*')
      .limit(5)
    
    if (relatoriosError) {
      console.error('❌ Erro ao acessar relatorios_auditoria:', relatoriosError.message)
      return
    }
    
    console.log(`✅ Tabela relatorios_auditoria: ${relatorios.length} registros encontrados`)
    
    // 2. Verificar tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5)
    
    if (tenantsError) {
      console.error('❌ Erro ao acessar tenants:', tenantsError.message)
      return
    }
    
    console.log(`✅ Tabela tenants: ${tenants.length} registros encontrados`)
    
    if (tenants.length === 0) {
      console.log('⚠️  Nenhum tenant encontrado. Criando tenant de teste...')
      
      const { data: newTenant, error: createTenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'Teste Relatórios',
          slug: 'teste-relatorios',
          description: 'Tenant para teste do sistema de relatórios'
        })
        .select()
        .single()
      
      if (createTenantError) {
        console.error('❌ Erro ao criar tenant:', createTenantError.message)
        return
      }
      
      console.log('✅ Tenant criado:', newTenant.name)
    }
    
    // 3. Testar criação de relatório
    console.log('\n2. Testando criação de relatório...')
    
    const tenantId = tenants[0]?.id || (await supabase.from('tenants').select('id').limit(1).single()).data?.id
    
    if (!tenantId) {
      console.error('❌ Nenhum tenant disponível para teste')
      return
    }
    
    const novoRelatorio = {
      tenant_id: tenantId,
      codigo: `TEST-${Date.now()}`,
      titulo: `Relatório de Teste - ${new Date().toLocaleDateString('pt-BR')}`,
      tipo: 'executivo',
      categoria: 'interno',
      resumo_executivo: 'Relatório de teste gerado automaticamente para verificar funcionalidade.',
      status: 'rascunho',
      prioridade: 'media',
      total_apontamentos: 5,
      apontamentos_criticos: 1,
      compliance_score: 85
    }
    
    const { data: relatorio, error: relatorioError } = await supabase
      .from('relatorios_auditoria')
      .insert(novoRelatorio)
      .select()
      .single()
    
    if (relatorioError) {
      console.error('❌ Erro ao criar relatório:', relatorioError.message)
      return
    }
    
    console.log('✅ Relatório criado com sucesso:', relatorio.codigo)
    
    // 4. Testar criação de exportação
    console.log('\n3. Testando criação de exportação...')
    
    const exportData = {
      tenant_id: tenantId,
      relatorio_id: relatorio.id,
      relatorio_titulo: relatorio.titulo,
      formato: 'pdf',
      status: 'concluido',
      progresso: 100,
      configuracao: {
        formato: 'pdf',
        qualidade: 'alta'
      },
      tamanho_arquivo: 1500000,
      url_download: `/api/reports/download/${relatorio.id}`
    }
    
    const { data: exportacao, error: exportError } = await supabase
      .from('relatorios_exportacoes')
      .insert(exportData)
      .select()
      .single()
    
    if (exportError) {
      console.error('❌ Erro ao criar exportação:', exportError.message)
      return
    }
    
    console.log('✅ Exportação criada com sucesso:', exportacao.formato)
    
    // 5. Verificar dados finais
    console.log('\n4. Verificando dados finais...')
    
    const { data: finalRelatorios, error: finalError } = await supabase
      .from('relatorios_auditoria')
      .select('*')
      .eq('tenant_id', tenantId)
    
    if (finalError) {
      console.error('❌ Erro ao verificar dados finais:', finalError.message)
      return
    }
    
    console.log(`✅ Total de relatórios no tenant: ${finalRelatorios.length}`)
    
    // Calcular métricas
    const total = finalRelatorios.length
    const aprovados = finalRelatorios.filter(r => ['aprovado', 'publicado', 'distribuido'].includes(r.status)).length
    const criticos = finalRelatorios.reduce((sum, r) => sum + (r.apontamentos_criticos || 0), 0)
    const complianceScore = finalRelatorios.length > 0 
      ? Math.round(finalRelatorios.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / finalRelatorios.length)
      : 0
    
    console.log('\n📊 Métricas calculadas:')
    console.log(`   Total de relatórios: ${total}`)
    console.log(`   Relatórios aprovados: ${aprovados}`)
    console.log(`   Taxa de aprovação: ${total > 0 ? Math.round((aprovados / total) * 100) : 0}%`)
    console.log(`   Apontamentos críticos: ${criticos}`)
    console.log(`   Compliance Score médio: ${complianceScore}`)
    
    console.log('\n🎉 Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message)
  }
}

// Executar teste
testRelatorios()