#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the static colors file
const COLORS_FILE_PATH = path.join(__dirname, '..', 'src', 'styles', 'static-colors.css');

// Function to generate CSS content from palette data
function generateCSSContent(paletteData) {
  const { light, dark } = paletteData;
  
  const lightColors = Object.entries(light)
    .map(([key, value]) => `    --${key}: ${value.hsl};`)
    .join('\n');
    
  const darkColors = Object.entries(dark)
    .map(([key, value]) => `    --${key}: ${value.hsl};`)
    .join('\n');

  return `/* ============================================================================ */
/* SISTEMA DE CORES ESTÁTICO - GRC CONTROLLER */
/* ============================================================================ */
/* Arquivo atualizado automaticamente pelo Static Color Controller */
/* Última atualização: ${new Date().toLocaleString('pt-BR')} */

@layer base {
  /* ========================================================================== */
  /* LIGHT MODE - CORES PRINCIPAIS */
  /* ========================================================================== */
  :root {
${lightColors}
  }

  /* ========================================================================== */
  /* DARK MODE - CORES PRINCIPAIS */  
  /* ========================================================================== */
  .dark {
${darkColors}
  }

  /* ========================================================================== */
  /* APLICAÇÃO DAS CORES NOS COMPONENTES */
  /* ========================================================================== */
  
  /* Base styles - aplicados globalmente */
  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  /* Cards e containers */
  .card {
    background-color: hsl(var(--card));
    color: hsl(var(--card-foreground));
    border: 1px solid hsl(var(--border));
  }

  /* Botões primários */
  .btn-primary, 
  .bg-primary {
    background-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .btn-primary:hover, 
  .bg-primary:hover {
    background-color: hsl(var(--primary-hover));
  }

  /* Sidebar específico */
  [data-sidebar="main"] {
    background-color: hsl(var(--sidebar-background));
    color: hsl(var(--sidebar-foreground));
    border-right: 1px solid hsl(var(--border));
  }

  /* Estados de risco GRC */
  .risk-critical, [data-risk="critical"] {
    background-color: hsl(var(--risk-critical));
    color: hsl(var(--danger-foreground));
  }

  .risk-high, [data-risk="high"] {
    background-color: hsl(var(--risk-high));
    color: hsl(var(--warning-foreground));
  }

  .risk-medium, [data-risk="medium"] {
    background-color: hsl(var(--risk-medium));
    color: hsl(var(--warning-foreground));
  }

  .risk-low, [data-risk="low"] {
    background-color: hsl(var(--risk-low));
    color: hsl(var(--success-foreground));
  }

  /* Estados funcionais */
  .status-success, [data-status="success"] {
    background-color: hsl(var(--success));
    color: hsl(var(--success-foreground));
  }

  .status-warning, [data-status="warning"] {
    background-color: hsl(var(--warning));
    color: hsl(var(--warning-foreground));
  }

  .status-danger, [data-status="danger"] {
    background-color: hsl(var(--danger));
    color: hsl(var(--danger-foreground));
  }

  /* Inputs e form controls */
  input, textarea, select {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
  }

  input:focus, textarea:focus, select:focus {
    border-color: hsl(var(--primary));
    box-shadow: 0 0 0 2px hsl(var(--primary-glow) / 0.2);
  }

  /* Muted backgrounds */
  .bg-muted {
    background-color: hsl(var(--muted));
    color: hsl(var(--muted-foreground));
  }

  /* Secondary colors */
  .bg-secondary {
    background-color: hsl(var(--secondary));
    color: hsl(var(--secondary-foreground));
  }

  /* Popover and dropdowns */
  .popover, [data-radix-popper-content-wrapper] {
    background-color: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    border: 1px solid hsl(var(--border));
  }
}

/* ========================================================================== */
/* RESPONSIVE ADJUSTMENTS */
/* ========================================================================== */
@media (max-width: 768px) {
  /* Mobile specific color adjustments if needed */
}

/* ========================================================================== */
/* HIGH CONTRAST MODE SUPPORT */
/* ========================================================================== */
@media (prefers-contrast: high) {
  :root {
    --border: 0 0% 20%;
  }
  
  .dark {
    --border: 0 0% 80%;
  }
}`;
}

// Main function to update colors
function updateColors(paletteJson) {
  try {
    let paletteData;
    
    // Parse palette data
    if (typeof paletteJson === 'string') {
      paletteData = JSON.parse(paletteJson);
    } else {
      paletteData = paletteJson;
    }
    
    // Generate CSS content
    const cssContent = generateCSSContent(paletteData);
    
    // Create backup of current file
    const backupPath = COLORS_FILE_PATH + '.backup.' + Date.now();
    if (fs.existsSync(COLORS_FILE_PATH)) {
      fs.copyFileSync(COLORS_FILE_PATH, backupPath);
      console.log('📦 Backup criado:', backupPath);
    }
    
    // Write new CSS content
    fs.writeFileSync(COLORS_FILE_PATH, cssContent, 'utf8');
    
    console.log('🎨 Cores atualizadas com sucesso!');
    console.log('📁 Arquivo:', COLORS_FILE_PATH);
    console.log('⏰ Timestamp:', new Date().toLocaleString('pt-BR'));
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar cores:', error.message);
    return false;
  }
}

// Command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('❌ Uso: node update-colors.js <palette-json>');
    console.log('📖 Exemplo: node update-colors.js \'{"light":{...},"dark":{...}}\'');
    process.exit(1);
  }
  
  const paletteJson = args[0];
  const success = updateColors(paletteJson);
  process.exit(success ? 0 : 1);
}

export { updateColors, generateCSSContent };