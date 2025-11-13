#!/usr/bin/env node

/**
 * Script para verificar se há problemas no componente FindingsPhase
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando componente FindingsPhase...\n');

try {
  // 1. Verificar se o arquivo existe
  const findingsPath = path.join(__dirname, 'src/components/auditorias/phases/FindingsPhase.tsx');
  
  if (!fs.existsSync(findingsPath)) {
    console.log('❌ Arquivo FindingsPhase.tsx não encontrado!');
    console.log('   Caminho esperado:', findingsPath);
    return;
  }
  
  console.log('✅ Arquivo FindingsPhase.tsx encontrado');
  
  // 2. Verificar se há erros de sintaxe óbvios
  const content = fs.readFileSync(findingsPath, 'utf8');
  
  // Verificações básicas
  const checks = [
    {
      name: 'Export default',
      test: content.includes('export function FindingsPhase'),
      fix: 'Verificar se a função está sendo exportada corretamente'
    },
    {
      name: 'Imports necessários',
      test: content.includes('import React') && content.includes('useAuth'),
      fix: 'Verificar se todos os imports estão presentes'
    },
    {
      name: 'Interface props',
      test: content.includes('FindingsPhaseProps'),
      fix: 'Verificar se a interface de props está definida'
    },
    {
      name: 'Supabase client',
      test: content.includes('supabase'),
      fix: 'Verificar se o cliente Supabase está sendo importado'
    },
    {
      name: 'Função loadFindings',
      test: content.includes('loadFindings'),
      fix: 'Verificar se a função de carregamento existe'
    },
    {
      name: 'useEffect',
      test: content.includes('useEffect') && content.includes('loadFindings'),
      fix: 'Verificar se o useEffect está chamando loadFindings'
    },
    {
      name: 'Tabela apontamentos_auditoria',
      test: content.includes('apontamentos_auditoria'),
      fix: 'Verificar se está usando a tabela correta'
    },
    {
      name: 'Tratamento de erro',
      test: content.includes('catch') && content.includes('toast.error'),
      fix: 'Verificar se há tratamento de erro adequado'
    }
  ];
  
  console.log('2. Verificando estrutura do componente...');
  let allPassed = true;
  
  checks.forEach(check => {
    if (check.test) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name} - ${check.fix}`);
      allPassed = false;
    }
  });
  
  // 3. Verificar se há problemas específicos conhecidos
  console.log('\n3. Verificando problemas específicos...');
  
  const specificChecks = [
    {
      name: 'Campo trabalho_origem como UUID',
      test: !content.includes("trabalho_origem: 'Auditoria Geral'"),
      issue: 'Campo trabalho_origem deve ser UUID, não string',
      fix: 'Alterar para NULL ou UUID válido'
    },
    {
      name: 'Campos obrigatórios',
      test: content.includes('tenant_id') && content.includes('projeto_id'),
      issue: 'Campos tenant_id e projeto_id são obrigatórios',
      fix: 'Verificar se estão sendo passados corretamente'
    }
  ];
  
  specificChecks.forEach(check => {
    if (check.test) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ⚠️  ${check.name} - ${check.issue}`);
      console.log(`      Correção: ${check.fix}`);
    }
  });
  
  // 4. Verificar se há problema no campo trabalho_origem
  if (content.includes("trabalho_origem: 'Auditoria Geral'")) {
    console.log('\n❌ PROBLEMA ENCONTRADO: Campo trabalho_origem');
    console.log('   O campo trabalho_origem é do tipo UUID na tabela, mas está sendo definido como string');
    console.log('   Isso pode causar erro ao tentar inserir achados');
    
    // Criar correção
    const fixedContent = content.replace(
      "trabalho_origem: 'Auditoria Geral'",
      "trabalho_origem: null"
    );
    
    // Salvar correção
    fs.writeFileSync(findingsPath, fixedContent);
    console.log('   ✅ Correção aplicada: trabalho_origem alterado para null');
  }
  
  if (allPassed) {
    console.log('\n✅ Componente FindingsPhase parece estar correto');
  } else {
    console.log('\n⚠️  Alguns problemas foram encontrados no componente');
  }
  
  console.log('\n📋 PRÓXIMOS PASSOS PARA DEBUG:');
  console.log('1. Abra o navegador em http://localhost:8080/auditorias');
  console.log('2. Abra o console do navegador (F12)');
  console.log('3. Encontre o card AUD-2025-003 e expanda');
  console.log('4. Clique no botão "Achados"');
  console.log('5. Observe os logs no console:');
  console.log('   - "Botão clicado: achados"');
  console.log('   - "Iniciando navegação para fase: achados"');
  console.log('   - "Navegação concluída com sucesso para: Achados"');
  console.log('6. Se não aparecer nada, verifique:');
  console.log('   - Erros de JavaScript no console');
  console.log('   - Problemas de rede na aba Network');
  console.log('   - Estado do componente no React DevTools');
  
} catch (error) {
  console.error('❌ Erro durante verificação:', error.message);
}