const fs = require('fs');
const path = require('path');

// Lista dos hooks a serem corrigidos
const hooksToFix = [
  'useDPIA.ts',
  'useDataInventory.ts', 
  'useDataSubjectRequests.ts',
  'usePrivacyIncidents.ts',
  'useProcessingActivities.ts'
];

function addAuthImportAndHook(filePath) {
  console.log(`🔧 Corrigindo ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Adicionar import do useAuth se não existir
  if (!content.includes("import { useAuth }")) {
    content = content.replace(
      "import { logSecurityEvent } from '@/utils/securityLogger';",
      "import { logSecurityEvent } from '@/utils/securityLogger';\nimport { useAuth } from '@/contexts/AuthContext';"
    );
    console.log('   ✅ Import do useAuth adicionado');
  }
  
  // 2. Adicionar const { user } = useAuth() na função principal
  const hookFunctionRegex = /export function use\w+\(\) \{/;
  if (hookFunctionRegex.test(content) && !content.includes("const { user } = useAuth()")) {
    content = content.replace(
      hookFunctionRegex,
      (match) => `${match}\n  const { user } = useAuth();`
    );
    console.log('   ✅ Hook de autenticação adicionado');
  }
  
  // 3. Adicionar created_by e updated_by em operações de insert
  const insertRegex = /\.insert\(\[([^}]+)\]\)/gs;
  content = content.replace(insertRegex, (match, insertData) => {
    if (!insertData.includes('created_by') && !insertData.includes('updated_by')) {
      // Adicionar created_by e updated_by antes do fechamento do objeto
      const modifiedData = insertData.replace(/(\s*}\s*)$/, ',\n        created_by: user?.id,\n        updated_by: user?.id$1');
      console.log('   ✅ Campos de auditoria adicionados em insert');
      return `.insert([${modifiedData}])`;
    }
    return match;
  });
  
  // 4. Adicionar updated_by em operações de update
  const updateRegex = /\.update\(\s*\{([^}]+)\}\s*\)/gs;
  content = content.replace(updateRegex, (match, updateData) => {
    if (!updateData.includes('updated_by')) {
      // Adicionar updated_by antes do updated_at se existir, senão no final
      let modifiedData;
      if (updateData.includes('updated_at')) {
        modifiedData = updateData.replace(
          /updated_at:\s*[^,}]+/,
          'updated_by: user?.id,\n          updated_at: new Date().toISOString()'
        );
      } else {
        modifiedData = updateData + ',\n        updated_by: user?.id';
      }
      console.log('   ✅ Campo updated_by adicionado em update');
      return `.update({\n${modifiedData}\n      })`;
    }
    return match;
  });
  
  // 5. Salvar o arquivo corrigido
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`   🎉 ${path.basename(filePath)} corrigido!\n`);
}

function fixAllHooks() {
  console.log('🚀 Iniciando correção de hooks com autenticação...\n');
  
  const hooksDir = '/home/marciosb/grc/grc-controller/src/hooks';
  
  hooksToFix.forEach(hookFile => {
    const filePath = path.join(hooksDir, hookFile);
    
    if (fs.existsSync(filePath)) {
      try {
        addAuthImportAndHook(filePath);
      } catch (error) {
        console.error(`❌ Erro ao corrigir ${hookFile}:`, error.message);
      }
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${hookFile}`);
    }
  });
  
  console.log('✅ Correção de todos os hooks concluída!');
}

fixAllHooks();