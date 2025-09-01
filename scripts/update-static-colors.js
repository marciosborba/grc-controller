#!/usr/bin/env node

/**
 * Script para atualizar o arquivo static-colors.css com cores personalizadas
 * Uso: node scripts/update-static-colors.js [cssContent]
 */

const fs = require('fs');
const path = require('path');

const STATIC_COLORS_PATH = path.join(__dirname, '..', 'src', 'styles', 'static-colors.css');

function updateStaticColors(cssContent) {
  try {
    // Backup do arquivo atual
    const backupPath = `${STATIC_COLORS_PATH}.backup.${Date.now()}`;
    if (fs.existsSync(STATIC_COLORS_PATH)) {
      fs.copyFileSync(STATIC_COLORS_PATH, backupPath);
      console.log('✅ Backup criado:', backupPath);
    }

    // Escrever novo conteúdo
    fs.writeFileSync(STATIC_COLORS_PATH, cssContent, 'utf8');
    console.log('🎨 Arquivo static-colors.css atualizado com sucesso!');
    console.log('📂 Arquivo:', STATIC_COLORS_PATH);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo:', error.message);
    return false;
  }
}

// Receber conteúdo CSS via argumento da linha de comando
const cssContent = process.argv[2];

if (!cssContent) {
  console.error('❌ Uso: node scripts/update-static-colors.js "[CSS_CONTENT]"');
  process.exit(1);
}

// Tentar decodificar se for JSON (caso venha do frontend)
let finalCssContent;
try {
  const parsed = JSON.parse(cssContent);
  finalCssContent = parsed.cssContent || cssContent;
} catch {
  finalCssContent = cssContent;
}

// Aplicar as cores
const success = updateStaticColors(finalCssContent);

if (success) {
  console.log('');
  console.log('🔄 Para ver as mudanças:');
  console.log('   1. Recarregue a página (F5)');
  console.log('   2. Ou reinicie o servidor (Ctrl+C e npm run dev)');
  process.exit(0);
} else {
  process.exit(1);
}