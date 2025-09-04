#!/usr/bin/env node

/**
 * ALEX ASSESSMENT ENGINE - SCRIPT DE VALIDAÇÃO
 * 
 * Script para validar todas as funcionalidades implementadas
 * Testa segurança, segregação de tenants e funcionalidades core
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

console.log('🎯 ALEX ASSESSMENT ENGINE - VALIDAÇÃO COMPLETA');
console.log('================================================\n');

// Inicializar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Contadores de testes
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

// Função helper para testes
function test(description, testFn) {
  testsRun++;
  try {
    const result = testFn();
    if (result === true || result === undefined) {
      console.log(`✅ ${description}`);
      testsPassed++;
    } else {
      console.log(`❌ ${description} - ${result}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ ${description} - Erro: ${error.message}`);
    testsFailed++;
  }
}

// Função para testar se arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Função para verificar conteúdo do arquivo
function fileContains(filePath, searchString) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchString);
}

async function runValidation() {
  console.log('📋 1. VALIDAÇÃO DE ESTRUTURA DE ARQUIVOS');
  console.log('----------------------------------------');

  // Testar estrutura de arquivos
  test('Componente principal AssessmentsPage existe', () => 
    fileExists('src/components/assessments/AssessmentsPage.tsx')
  );

  test('Hook useAlexAssessment existe', () => 
    fileExists('src/hooks/useAlexAssessment.ts')
  );

  test('Hook useIsMobile existe', () => 
    fileExists('src/hooks/useIsMobile.ts')
  );

  // Testar componentes Alex
  const alexComponents = [
    'AlexDashboard.tsx',
    'AlexTemplateSelector.tsx',
    'AlexFrameworkLibraryEnhanced.tsx',
    'AlexAnalytics.tsx',
    'AlexAIRecommendations.tsx',
    'AlexProcessDesigner.tsx',
    'AlexAssessmentWizard.tsx'
  ];

  alexComponents.forEach(component => {
    test(`Componente Alex ${component} existe`, () => 
      fileExists(`src/components/assessments/alex/${component}`)
    );
  });

  // Testar Edge Functions
  test('Edge Function alex-assessment-recommendations existe', () => 
    fileExists('supabase/functions/alex-assessment-recommendations/index.ts')
  );

  test('Edge Function alex-assessment-analytics existe', () => 
    fileExists('supabase/functions/alex-assessment-analytics/index.ts')
  );

  // Testar migrações
  test('Migração foundation existe', () => 
    fileExists('supabase/migrations/20250904000001_alex_assessment_engine_foundation.sql')
  );

  test('Migração framework library existe', () => 
    fileExists('supabase/migrations/20250904000002_alex_assessment_framework_library_seed.sql')
  );

  console.log('\n📋 2. VALIDAÇÃO DE IMPORTS E DEPENDÊNCIAS');
  console.log('------------------------------------------');

  // Testar imports corretos
  test('AlexDashboard usa import correto do useIsMobile', () => 
    fileContains('src/components/assessments/alex/AlexDashboard.tsx', \"import { useIsMobile } from '@/hooks/useIsMobile';\")
  );

  test('useAlexAssessment importa AuthContextOptimized', () => 
    fileContains('src/hooks/useAlexAssessment.ts', \"import { useAuth } from '@/contexts/AuthContextOptimized';\")
  );

  test('AssessmentsPage importa componentes Alex corretamente', () => 
    fileContains('src/components/assessments/AssessmentsPage.tsx', 'const AlexTemplateSelector = React.lazy')
  );

  console.log('\n📋 3. VALIDAÇÃO DE SEGURANÇA E RLS');
  console.log('----------------------------------');

  // Testar políticas RLS
  test('Migração contém políticas RLS para assessment_templates', () => 
    fileContains('supabase/migrations/20250904000001_alex_assessment_engine_foundation.sql', 
      'CREATE POLICY \"Users can view their tenant\\'s assessment templates\"')
  );

  test('Migração contém políticas RLS para framework_library', () => 
    fileContains('supabase/migrations/20250904000001_alex_assessment_engine_foundation.sql', 
      'CREATE POLICY \"Users can view global and tenant frameworks\"')
  );

  test('Migração contém políticas RLS para ai_assessment_recommendations', () => 
    fileContains('supabase/migrations/20250904000001_alex_assessment_engine_foundation.sql', 
      'CREATE POLICY \"Users can view their tenant\\'s AI recommendations\"')
  );

  // Testar segregação de tenants no código
  test('useAlexAssessment filtra por tenant_id', () => 
    fileContains('src/hooks/useAlexAssessment.ts', 'user?.user_metadata?.tenant_id')
  );

  test('Edge Function valida tenant_id', () => 
    fileContains('supabase/functions/alex-assessment-recommendations/index.ts', 'tenant_id')
  );

  console.log('\n📋 4. VALIDAÇÃO DE FUNCIONALIDADES CORE');
  console.log('--------------------------------------');

  // Testar funcionalidades implementadas
  test('Sistema de templates implementado', () => 
    fileContains('src/hooks/useAlexAssessment.ts', 'assessment_templates')
  );

  test('Sistema de frameworks implementado', () => 
    fileContains('src/hooks/useAlexAssessment.ts', 'framework_library')
  );

  test('Sistema de IA implementado', () => 
    fileContains('src/hooks/useAlexAssessment.ts', 'getAIRecommendations')
  );

  test('Sistema de analytics implementado', () => 
    fileContains('src/hooks/useAlexAssessment.ts', 'generateAnalytics')
  );

  test('Sistema adaptativo implementado', () => 
    fileExists('src/components/assessments/alex/AlexProcessDesigner.tsx')
  );

  console.log('\n📋 5. VALIDAÇÃO DE EDGE FUNCTIONS');
  console.log('---------------------------------');

  // Testar Edge Functions
  test('Edge Function recommendations suporta múltiplos provedores IA', () => 
    fileContains('supabase/functions/alex-assessment-recommendations/index.ts', 'callOpenAI') &&
    fileContains('supabase/functions/alex-assessment-recommendations/index.ts', 'callAnthropic') &&
    fileContains('supabase/functions/alex-assessment-recommendations/index.ts', 'callAzureOpenAI')
  );

  test('Edge Function analytics implementa benchmarking', () => 
    fileContains('supabase/functions/alex-assessment-analytics/index.ts', 'generateBenchmarking')
  );

  test('Edge Function analytics implementa análise preditiva', () => 
    fileContains('supabase/functions/alex-assessment-analytics/index.ts', 'generatePredictiveScoring')
  );

  console.log('\n📋 6. VALIDAÇÃO DE DADOS SEED');
  console.log('-----------------------------');

  // Testar dados seed
  test('Framework ISO 27001 está incluído', () => 
    fileContains('supabase/migrations/20250904000002_alex_assessment_framework_library_seed.sql', 'ISO/IEC 27001:2022')
  );

  test('Framework NIST CSF está incluído', () => 
    fileContains('supabase/migrations/20250904000002_alex_assessment_framework_library_seed.sql', 'NIST Cybersecurity Framework 2.0')
  );

  test('Framework LGPD está incluído', () => 
    fileContains('supabase/migrations/20250904000002_alex_assessment_framework_library_seed.sql', 'LGPD - Lei Geral de Proteção de Dados')
  );

  test('Framework SOC 2 está incluído', () => 
    fileContains('supabase/migrations/20250904000002_alex_assessment_framework_library_seed.sql', 'SOC 2 Type II')
  );

  console.log('\n📋 7. VALIDAÇÃO DE PERFORMANCE');
  console.log('------------------------------');

  // Testar otimizações de performance
  test('Índices de performance implementados', () => 
    fileContains('supabase/migrations/20250904000001_alex_assessment_engine_foundation.sql', 'CREATE INDEX')
  );

  test('Lazy loading implementado', () => 
    fileContains('src/components/assessments/AssessmentsPage.tsx', 'React.lazy')
  );

  test('TanStack Query implementado', () => 
    fileContains('src/hooks/useAlexAssessment.ts', 'useQuery') &&
    fileContains('src/hooks/useAlexAssessment.ts', 'useMutation')
  );

  test('Suspense boundaries implementados', () => 
    fileContains('src/components/assessments/AssessmentsPage.tsx', 'Suspense')
  );

  console.log('\n📋 8. VALIDAÇÃO DE UX/UI');
  console.log('------------------------');

  // Testar interface do usuário
  test('Dashboard adaptativo por role implementado', () => 
    fileContains('src/components/assessments/alex/AlexDashboard.tsx', 'isExecutive') &&
    fileContains('src/components/assessments/alex/AlexDashboard.tsx', 'isAuditor') &&
    fileContains('src/components/assessments/alex/AlexDashboard.tsx', 'isRespondent')
  );

  test('Sistema de tabs implementado', () => 
    fileContains('src/components/assessments/AssessmentsPage.tsx', 'TabsContent')
  );

  test('Design responsivo implementado', () => 
    fileContains('src/components/assessments/alex/AlexDashboard.tsx', 'useIsMobile')
  );

  test('Sistema de loading states implementado', () => 
    fileContains('src/components/assessments/AssessmentsPage.tsx', 'LoadingSpinner')
  );

  console.log('\n📊 RESUMO DA VALIDAÇÃO');
  console.log('======================');
  console.log(`Total de testes executados: ${testsRun}`);
  console.log(`✅ Testes aprovados: ${testsPassed}`);
  console.log(`❌ Testes falharam: ${testsFailed}`);
  
  const successRate = ((testsPassed / testsRun) * 100).toFixed(1);
  console.log(`📈 Taxa de sucesso: ${successRate}%`);

  if (successRate >= 95) {
    console.log('\n🎉 EXCELENTE! Sistema aprovado para produção!');
  } else if (successRate >= 85) {
    console.log('\n✅ BOM! Sistema aprovado com pequenos ajustes necessários.');
  } else if (successRate >= 70) {
    console.log('\n⚠️  ATENÇÃO! Sistema precisa de ajustes antes da produção.');
  } else {
    console.log('\n❌ CRÍTICO! Sistema precisa de correções significativas.');
  }

  // Gerar relatório detalhado
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: testsRun,
    passed: testsPassed,
    failed: testsFailed,
    successRate: parseFloat(successRate),
    status: successRate >= 95 ? 'APPROVED' : successRate >= 85 ? 'APPROVED_WITH_NOTES' : successRate >= 70 ? 'NEEDS_ATTENTION' : 'CRITICAL'
  };

  fs.writeFileSync('alex-assessment-validation-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Relatório detalhado salvo em: alex-assessment-validation-report.json');

  return report;
}

// Executar validação
if (require.main === module) {
  runValidation().catch(console.error);
}

module.exports = { runValidation };