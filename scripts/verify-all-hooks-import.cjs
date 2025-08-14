const fs = require('fs');
const path = require('path');

// Lista dos hooks para verificar
const hooksToCheck = [
  'useLegalBases.ts',
  'useConsents.ts',
  'useDPIA.ts',
  'useDataInventory.ts',
  'useDataSubjectRequests.ts',
  'usePrivacyIncidents.ts',
  'useProcessingActivities.ts'
];

function checkHookImports() {
  console.log('🔍 VERIFICANDO IMPORTS DE useAuth EM TODOS OS HOOKS...\n');
  
  const hooksDir = '/home/marciosb/grc/grc-controller/src/hooks';
  let allCorrect = true;
  
  hooksToCheck.forEach(hookFile => {
    const filePath = path.join(hooksDir, hookFile);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ ${hookFile}: Arquivo não encontrado`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar se tem o import do useAuth
    const hasImport = content.includes("import { useAuth } from '@/contexts/AuthContext'");
    
    // Verificar se tem a declaração const { user } = useAuth()
    const hasDeclaration = content.includes("const { user } = useAuth()");
    
    // Verificar se tem created_by/updated_by em inserts
    const hasCreatedBy = content.includes("created_by: user?.id") || content.includes("created_by: user?.id,");
    const hasUpdatedBy = content.includes("updated_by: user?.id") || content.includes("updated_by: user?.id,");
    
    console.log(`📄 ${hookFile}:`);
    console.log(`   ✅ Import useAuth: ${hasImport ? '✓' : '❌'}`);
    console.log(`   ✅ Declaração hook: ${hasDeclaration ? '✓' : '❌'}`);
    console.log(`   ✅ created_by: ${hasCreatedBy ? '✓' : '❌'}`);
    console.log(`   ✅ updated_by: ${hasUpdatedBy ? '✓' : '❌'}`);
    
    if (!hasImport || !hasDeclaration) {
      allCorrect = false;
      console.log(`   🚨 ${hookFile} precisa de correção!`);
    } else {
      console.log(`   🎉 ${hookFile} está correto!`);
    }
    
    console.log('');
  });
  
  if (allCorrect) {
    console.log('🎉 TODOS OS HOOKS ESTÃO CORRETOS!');
    console.log('Se ainda há erro no navegador, é um problema de cache.');
    console.log('');
    console.log('💡 SOLUÇÕES PARA CACHE:');
    console.log('1. Pressione Ctrl+Shift+R no navegador (hard refresh)');
    console.log('2. Abra o DevTools e mantenha Shift pressionado ao recarregar');
    console.log('3. Ou feche completamente o navegador e reabra');
  } else {
    console.log('❌ Alguns hooks ainda precisam de correção.');
  }
}

checkHookImports();