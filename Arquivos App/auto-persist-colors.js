// Sistema automático de persistência de cores
console.log('💾 === SISTEMA AUTOMÁTICO DE PERSISTÊNCIA ===');

// Função para capturar cor aplicada e gerar CSS
function captureAndPersist() {
  console.log('📸 Capturando cor atual...');
  
  // Capturar cor primária atual
  const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('Cor primária capturada:', currentPrimary);
  
  if (!currentPrimary || currentPrimary === '') {
    console.log('❌ Nenhuma cor encontrada para persistir');
    return;
  }
  
  // Converter HSL para HEX se necessário
  function hslToHex(hsl) {
    const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!match) return '#000000';
    
    const [, h, s, l] = match.map(Number);
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
    const m = lNorm - c / 2;
    
    let r, g, b;
    if (hNorm < 1/6) [r, g, b] = [c, x, 0];
    else if (hNorm < 2/6) [r, g, b] = [x, c, 0];
    else if (hNorm < 3/6) [r, g, b] = [0, c, x];
    else if (hNorm < 4/6) [r, g, b] = [0, x, c];
    else if (hNorm < 5/6) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    
    const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
  
  const hexColor = hslToHex(currentPrimary);
  console.log('Cor convertida para HEX:', hexColor);
  
  // Calcular cores relacionadas
  const hslParts = currentPrimary.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (hslParts) {
    const [, h, s, l] = hslParts.map(Number);
    const hoverL = Math.max(0, l - 4);
    const glowL = Math.min(100, l + 20);
    const glowS = Math.min(100, s + 5);
    
    const primaryHover = `${h} ${s}% ${hoverL}%`;
    const primaryGlow = `${h} ${glowS}% ${glowL}%`;
    
    console.log('Cores calculadas:');
    console.log('- Primary:', currentPrimary);
    console.log('- Hover:', primaryHover);
    console.log('- Glow:', primaryGlow);
    
    // Gerar CSS completo
    generateAndDownloadCSS(currentPrimary, primaryHover, primaryGlow, hexColor);
  }
}

// Função para gerar e baixar CSS
function generateAndDownloadCSS(primary, hover, glow, hexColor) {
  console.log('📝 Gerando CSS atualizado...');
  
  const cssTemplate = `/* ============================================================================ */
/* SISTEMA DE CORES ESTÁTICO - GRC CONTROLLER */
/* ============================================================================ */
/* Arquivo gerado automaticamente pelo Static Color Controller */
/* Última atualização: ${new Date().toLocaleString('pt-BR')} */
/* Cor aplicada: ${hexColor} */

@layer utilities {
  /* ========================================================================== */
  /* LIGHT MODE - CORES PRINCIPAIS */
  /* ========================================================================== */
  :root {
    --primary: ${primary};
    --primary-hover: ${hover};
    --primary-glow: ${glow};
    --background: 0 0% 100%;
    --foreground: 225 71% 12%;
    --card: 0 0% 100%;
    --card-foreground: 225 71% 12%;
    --border: 214 32% 91%;
    --muted: 210 20% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --secondary: 210 40% 98%;
    --secondary-foreground: 222.2 84% 4.9%;
    --primary-foreground: 0 0% 100%;
    --primary-text: 225 71% 12%;
    --popover: 0 0% 100%;
    --popover-foreground: 225 71% 12%;
    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
    --danger: 0 84% 60%;
    --danger-foreground: 0 0% 100%;
    --risk-critical: 0 84% 60%;
    --risk-high: 24 95% 53%;
    --risk-medium: 38 92% 50%;
    --risk-low: 142 76% 36%;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    /* Additional system variables */
    --input: var(--border);
    --ring: var(--primary);
    --accent: var(--secondary);
    --destructive: var(--danger);
    --destructive-foreground: var(--danger-foreground);
    --success-light: var(--success);
    --warning-light: var(--warning);
    --danger-light: var(--danger);
    --sidebar-primary: var(--sidebar-foreground);
    --sidebar-primary-foreground: var(--sidebar-background);
    --sidebar-accent: var(--muted);
    --sidebar-accent-foreground: var(--sidebar-foreground);
    --sidebar-border: var(--border);
    --sidebar-ring: var(--primary);
  }

  /* ========================================================================== */
  /* DARK MODE - CORES PRINCIPAIS */  
  /* ========================================================================== */
  .dark {
    --primary: ${primary};
    --primary-hover: ${hover};
    --primary-glow: ${glow};
    --background: 222 18% 4%;
    --foreground: 0 0% 100%;
    --card: 215 8% 12%;
    --card-foreground: 0 0% 100%;
    --border: 215 10% 22%;
    --muted: 215 12% 16%;
    --muted-foreground: 215.4 16.3% 56.9%;
    --secondary: 215 8% 12%;
    --secondary-foreground: 0 0% 100%;
    --primary-foreground: 0 0% 0%;
    --primary-text: 0 0% 100%;
    --popover: 215 8% 12%;
    --popover-foreground: 0 0% 100%;
    --success: 142 76% 46%;
    --success-foreground: 0 0% 0%;
    --warning: 38 92% 60%;
    --warning-foreground: 0 0% 0%;
    --danger: 0 84% 70%;
    --danger-foreground: 0 0% 0%;
    --risk-critical: 0 84% 70%;
    --risk-high: 24 95% 63%;
    --risk-medium: 38 92% 60%;
    --risk-low: 142 76% 46%;
    --sidebar-background: 215 8% 12%;
    --sidebar-foreground: 0 0% 100%;
    /* Additional system variables */
    --input: var(--border);
    --ring: var(--primary);
    --accent: var(--secondary);
    --destructive: var(--danger);
    --destructive-foreground: var(--danger-foreground);
    --success-light: var(--success);
    --warning-light: var(--warning);
    --danger-light: var(--danger);
    --sidebar-primary: var(--sidebar-foreground);
    --sidebar-primary-foreground: var(--sidebar-background);
    --sidebar-accent: var(--muted);
    --sidebar-accent-foreground: var(--sidebar-foreground);
    --sidebar-border: var(--border);
    --sidebar-ring: var(--primary);
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

  /* ========================================================================== */
  /* TAILWIND UTILITY CLASSES */
  /* ========================================================================== */
  
  /* Background utilities */
  .bg-background { background-color: hsl(var(--background)) !important; }
  .bg-foreground { background-color: hsl(var(--foreground)) !important; }
  .bg-card { background-color: hsl(var(--card)) !important; }
  .bg-card-foreground { background-color: hsl(var(--card-foreground)) !important; }
  .bg-popover { background-color: hsl(var(--popover)) !important; }
  .bg-popover-foreground { background-color: hsl(var(--popover-foreground)) !important; }
  .bg-primary { background-color: hsl(var(--primary)) !important; }
  .bg-primary-foreground { background-color: hsl(var(--primary-foreground)) !important; }
  .bg-secondary { background-color: hsl(var(--secondary)) !important; }
  .bg-secondary-foreground { background-color: hsl(var(--secondary-foreground)) !important; }
  .bg-muted { background-color: hsl(var(--muted)) !important; }
  .bg-muted-foreground { background-color: hsl(var(--muted-foreground)) !important; }
  .bg-accent { background-color: hsl(var(--accent)) !important; }
  .bg-accent-foreground { background-color: hsl(var(--accent-foreground)) !important; }
  .bg-destructive { background-color: hsl(var(--destructive)) !important; }
  .bg-destructive-foreground { background-color: hsl(var(--destructive-foreground)) !important; }
  .bg-border { background-color: hsl(var(--border)) !important; }
  .bg-input { background-color: hsl(var(--input)) !important; }
  .bg-ring { background-color: hsl(var(--ring)) !important; }

  /* Text color utilities */
  .text-background { color: hsl(var(--background)) !important; }
  .text-foreground { color: hsl(var(--foreground)) !important; }
  .text-card { color: hsl(var(--card)) !important; }
  .text-card-foreground { color: hsl(var(--card-foreground)) !important; }
  .text-popover { color: hsl(var(--popover)) !important; }
  .text-popover-foreground { color: hsl(var(--popover-foreground)) !important; }
  .text-primary { color: hsl(var(--primary)) !important; }
  .text-primary-foreground { color: hsl(var(--primary-foreground)) !important; }
  .text-primary-text { color: hsl(var(--primary-text)) !important; }
  .text-secondary { color: hsl(var(--secondary)) !important; }
  .text-secondary-foreground { color: hsl(var(--secondary-foreground)) !important; }
  .text-muted { color: hsl(var(--muted)) !important; }
  .text-muted-foreground { color: hsl(var(--muted-foreground)) !important; }
  .text-accent { color: hsl(var(--accent)) !important; }
  .text-accent-foreground { color: hsl(var(--accent-foreground)) !important; }
  .text-destructive { color: hsl(var(--destructive)) !important; }
  .text-destructive-foreground { color: hsl(var(--destructive-foreground)) !important; }

  /* Border utilities */
  .border { border-color: hsl(var(--border)) !important; }
  .border-background { border-color: hsl(var(--background)) !important; }
  .border-foreground { border-color: hsl(var(--foreground)) !important; }
  .border-card { border-color: hsl(var(--card)) !important; }
  .border-card-foreground { border-color: hsl(var(--card-foreground)) !important; }
  .border-popover { border-color: hsl(var(--popover)) !important; }
  .border-popover-foreground { border-color: hsl(var(--popover-foreground)) !important; }
  .border-primary { border-color: hsl(var(--primary)) !important; }
  .border-primary-foreground { border-color: hsl(var(--primary-foreground)) !important; }
  .border-secondary { border-color: hsl(var(--secondary)) !important; }
  .border-secondary-foreground { border-color: hsl(var(--secondary-foreground)) !important; }
  .border-muted { border-color: hsl(var(--muted)) !important; }
  .border-muted-foreground { border-color: hsl(var(--muted-foreground)) !important; }
  .border-accent { border-color: hsl(var(--accent)) !important; }
  .border-accent-foreground { border-color: hsl(var(--accent-foreground)) !important; }
  .border-destructive { border-color: hsl(var(--destructive)) !important; }
  .border-destructive-foreground { border-color: hsl(var(--destructive-foreground)) !important; }
  .border-input { border-color: hsl(var(--input)) !important; }

  /* ========================================================================== */
  /* COMPONENT SPECIFIC STYLES */
  /* ========================================================================== */

  /* Cards e containers */
  .card {
    background-color: hsl(var(--card));
    color: hsl(var(--card-foreground));
    border: 1px solid hsl(var(--border));
  }

  /* Botões */
  button {
    border-color: hsl(var(--border));
  }

  /* Botões primários com hover */
  button[class*="bg-primary"]:hover,
  .bg-primary:hover {
    background-color: hsl(var(--primary-hover)) !important;
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

  // Baixar arquivo
  const blob = new Blob([cssTemplate], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'static-colors-updated.css';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('💾 Arquivo CSS baixado!');
  console.log('📁 Substitua src/styles/static-colors.css pelo arquivo baixado');
  
  // Também atualizar index.css
  updateIndexCSS(primary, hover, glow);
}

// Função para atualizar index.css
function updateIndexCSS(primary, hover, glow) {
  console.log('📝 Gerando index.css atualizado...');
  
  const indexCSSUpdate = `
/* ATUALIZE ESTAS LINHAS NO src/index.css */

/* No :root (linha ~21): */
--primary: ${primary};
--primary-hover: ${hover};
--primary-glow: ${glow};

/* No .dark (linha ~83): */
--primary: ${primary};
--primary-hover: ${hover};
--primary-glow: ${glow};

/* COPIE E SUBSTITUA AS LINHAS CORRESPONDENTES NO ARQUIVO src/index.css */
`;

  // Baixar instruções para index.css
  const blob = new Blob([indexCSSUpdate], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index-css-update.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('📝 Instruções para index.css baixadas!');
}

// Disponibilizar função globalmente
window.captureAndPersist = captureAndPersist;

console.log('\n💡 COMO USAR:');
console.log('1. Aplique uma cor usando os botões ou seletor');
console.log('2. Execute: captureAndPersist()');
console.log('3. Baixe os arquivos gerados');
console.log('4. Substitua os arquivos CSS');
console.log('5. Recarregue a página (F5)');
console.log('');
console.log('📋 ARQUIVOS GERADOS:');
console.log('- static-colors-updated.css → substitua src/styles/static-colors.css');
console.log('- index-css-update.txt → atualize as linhas em src/index.css');

// Auto-executar se houver cor aplicada
setTimeout(() => {
  const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  if (currentPrimary && !currentPrimary.includes('173 88% 58%') && !currentPrimary.includes('258 90% 66%')) {
    console.log('🎯 Cor personalizada detectada! Execute captureAndPersist() para salvar.');
  }
}, 1000);