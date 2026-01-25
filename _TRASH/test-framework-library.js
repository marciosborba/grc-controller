#!/usr/bin/env node

/**
 * TESTE DA BIBLIOTECA DE FRAMEWORKS
 * 
 * Script para testar se a biblioteca de frameworks está carregando corretamente
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (ajuste conforme necessário)
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

console.log('🔍 TESTE DA BIBLIOTECA DE FRAMEWORKS');
console.log('====================================\n');

async function testFrameworkLibrary() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('📊 Testando conexão com Supabase...');
    
    // Teste 1: Verificar se a tabela framework_library existe
    console.log('\n1. Verificando tabela framework_library...');
    const { data: frameworks, error: frameworkError } = await supabase
      .from('framework_library')
      .select('id, name, category, is_global')
      .limit(5);
    
    if (frameworkError) {
      console.error('❌ Erro ao acessar framework_library:', frameworkError.message);
      return;
    }
    
    console.log(`✅ Tabela framework_library acessível`);
    console.log(`📈 Frameworks encontrados: ${frameworks?.length || 0}`);
    
    if (frameworks && frameworks.length > 0) {
      console.log('\n📋 Primeiros frameworks encontrados:');
      frameworks.forEach((fw, idx) => {
        console.log(`   ${idx + 1}. ${fw.name} (${fw.category}) - Global: ${fw.is_global}`);
      });
    }
    
    // Teste 2: Contar total de frameworks
    console.log('\n2. Contando total de frameworks...');
    const { count, error: countError } = await supabase
      .from('framework_library')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar frameworks:', countError.message);
    } else {
      console.log(`✅ Total de frameworks na biblioteca: ${count}`);
    }
    
    // Teste 3: Verificar frameworks específicos
    console.log('\n3. Verificando frameworks específicos...');
    const expectedFrameworks = [
      'ISO/IEC 27001:2022',
      'NIST Cybersecurity Framework 2.0',
      'SOC 2 Type II',
      'PCI DSS 4.0',
      'GDPR - General Data Protection Regulation',
      'LGPD - Lei Geral de Proteção de Dados'
    ];
    
    for (const expectedName of expectedFrameworks) {
      const { data: found, error } = await supabase
        .from('framework_library')
        .select('id, name')
        .ilike('name', `%${expectedName}%`)
        .limit(1);
      
      if (error) {
        console.log(`❌ Erro ao buscar ${expectedName}: ${error.message}`);
      } else if (found && found.length > 0) {
        console.log(`✅ ${expectedName} - Encontrado`);
      } else {
        console.log(`⚠️  ${expectedName} - Não encontrado`);
      }
    }
    
    // Teste 4: Verificar estrutura dos dados
    console.log('\n4. Verificando estrutura dos dados...');
    const { data: sampleFramework, error: sampleError } = await supabase
      .from('framework_library')
      .select('*')
      .limit(1)
      .single();
    
    if (sampleError) {
      console.error('❌ Erro ao obter amostra:', sampleError.message);
    } else if (sampleFramework) {
      console.log('✅ Estrutura dos dados:');
      console.log(`   - ID: ${sampleFramework.id}`);
      console.log(`   - Nome: ${sampleFramework.name}`);
      console.log(`   - Categoria: ${sampleFramework.category}`);
      console.log(`   - Versão: ${sampleFramework.version}`);
      console.log(`   - Controles: ${sampleFramework.controls_definition?.length || 0} definidos`);
      console.log(`   - Domínios: ${Object.keys(sampleFramework.domains_structure || {}).length} domínios`);
      console.log(`   - Indústrias: ${sampleFramework.industry_focus?.length || 0} focos`);
      console.log(`   - Global: ${sampleFramework.is_global}`);
    }
    
    console.log('\n🎯 RESULTADO DO TESTE');
    console.log('=====================');
    
    if (count && count > 0) {
      console.log('✅ SUCESSO: Biblioteca de frameworks está funcionando!');
      console.log(`📊 ${count} frameworks disponíveis`);
      console.log('🚀 O componente AlexFrameworkLibraryEnhanced deve carregar normalmente');
    } else {
      console.log('❌ PROBLEMA: Biblioteca de frameworks está vazia');
      console.log('💡 Verifique se as migrações foram executadas corretamente');
      console.log('🔧 Execute: supabase db reset ou supabase migration up');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.log('\n💡 Possíveis soluções:');
    console.log('1. Verifique se o Supabase está rodando');
    console.log('2. Confirme as variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY');
    console.log('3. Execute as migrações: supabase migration up');
  }
}

// Executar teste
testFrameworkLibrary().catch(console.error);