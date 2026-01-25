#!/usr/bin/env node
/**
 * Script para corrigir o logging de segurança em todos os hooks
 */

import fs from 'fs';
import path from 'path';

const hooksDir = './src/hooks';
const lgpdHooks = [
  'useConsents.ts',
  'useDPIA.ts', 
  'useDataInventory.ts',
  'useDataSubjectRequests.ts',
  'usePrivacyIncidents.ts',
  'useProcessingActivities.ts',
  'useLegalBases.ts'
];

function fixSecurityLogging(filePath) {
  console.log(`🔧 Corrigindo ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Padrão para encontrar chamadas diretas de logSecurityEvent
  const logPattern = /(\s*)(await logSecurityEvent\({[\s\S]*?\}\);)/g;
  
  let hasChanges = false;
  
  content = content.replace(logPattern, (match, indent, logCall) => {
    hasChanges = true;
    return `${indent}try {
${indent}  ${logCall}
${indent}} catch (logError) {
${indent}  console.warn('Warning: Could not log security event:', logError);
${indent}}`;
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath} corrigido`);
  } else {
    console.log(`ℹ️ ${filePath} não precisou de correção`);
  }
}

function main() {
  console.log('🚀 Iniciando correção de logging de segurança...\n');
  
  lgpdHooks.forEach(hookFile => {
    const fullPath = path.join(hooksDir, hookFile);
    
    if (fs.existsSync(fullPath)) {
      fixSecurityLogging(fullPath);
    } else {
      console.log(`⚠️ Arquivo não encontrado: ${fullPath}`);
    }
  });
  
  console.log('\n🎉 Correção concluída!');
  console.log('✅ Todos os hooks agora têm logging de segurança seguro');
}

main();