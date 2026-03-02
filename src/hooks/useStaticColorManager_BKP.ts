// Hook para gerenciar cores estáticas com persistência
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { ColorPalette } from '@/types/colors';
import {
  writeStaticColorsFile,
  loadPendingColors,
  injectCSS,
  removeInjectedCSS,
  hasPendingColors,
  clearPendingColors,
  downloadWithInstructions,
  generateCompleteStaticCSS
} from '@/utils/colorFileManager';

// Função para atualizar o arquivo static-colors.css diretamente
const updateStaticColorsFile = async (cssContent: string) => {
  try {
    console.log('💾 Tentando atualizar arquivo static-colors.css...');
    
    // Em desenvolvimento, usar File System Access API se disponível
    if ('showSaveFilePicker' in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: 'static-colors.css',
          types: [{
            description: 'CSS files',
            accept: { 'text/css': ['.css'] }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(cssContent);
        await writable.close();
        
        console.log('✅ Arquivo atualizado com sucesso!');
        
        // Forçar reload do CSS
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return true;
      } catch (error) {
        console.log('⚠️ File System Access não funcionou:', error);
      }
    }
    
    // Fallback: usar o sistema existente
    const success = await writeStaticColorsFile({ light: {}, dark: {} } as any);
    if (success) {
      console.log('✅ Arquivo salvo via sistema de backup');
    }
    
    // Mostrar instruções para o usuário
    console.log('📝 INSTRUÇÕES PARA PERSISTÊNCIA:');
    console.log('1. O arquivo CSS foi gerado');
    console.log('2. Execute: downloadCSS() para baixar');
    console.log('3. Substitua src/styles/static-colors.css');
    console.log('4. Recarregue a página (F5)');
    
    return false;
    
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo:', error);
    return false;
  }
};
import { 
  applyColorsDirectly,
  loadUserColorsOnStartup,
  clearUserColors,
  hasUserColorsApplied,
  getCurrentUserPalette
} from '@/utils/directColorApplicator';


export const useStaticColorManager = (defaultPalette: ColorPalette) => {
  const [palette, setPalette] = useState<ColorPalette>(defaultPalette);
  const [hasChanges, setHasChanges] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [pendingColorsDetected, setPendingColorsDetected] = useState(false);
  const [showCSSModal, setShowCSSModal] = useState(false);
  const [generatedCSS, setGeneratedCSS] = useState('');
  const [staticColorsCode, setStaticColorsCode] = useState('');
  const [indexCSSCode, setIndexCSSCode] = useState('');
  const [activeTab, setActiveTab] = useState('static-colors');

  // SISTEMA DE LIMPEZA AUTOMÁTICA - Garantir cores padrão ao entrar na página
  useEffect(() => {
    console.log('🧹 LIMPEZA AUTOMÁTICA: Garantindo cores padrão ao entrar na página');
    
    // Limpar qualquer interferência de localStorage
    const colorKeys = [
      'grc-user-colors',
      'grc-pending-colors', 
      'grc-applied-colors',
      'grc-color-backup',
      'tenant-theme-applied',
      'lastThemeChangeTime',
      'grc-temp-colors'
    ];
    
    let removedKeys = 0;
    colorKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        removedKeys++;
        console.log(`🗑️ Removido localStorage: ${key}`);
      }
    });
    
    // Limpar estilos dinâmicos que podem estar interferindo
    const interferingStyles = document.querySelectorAll(
      '#grc-user-colors, #grc-temp-colors, #dynamic-colors, #preview-colors, #grc-dynamic-preview, #grc-force-fallback, #EXTREME-FORCE-COLORS, style[data-theme], style[id*="color"]'
    );
    
    let removedStyles = 0;
    interferingStyles.forEach(el => {
      console.log(`🗑️ Removendo estilo interferente: ${el.id || el.className || 'unnamed'}`);
      el.remove();
      removedStyles++;
    });
    
    // Limpar variáveis CSS inline que podem estar forçadas
    const cssVars = [
      'primary', 'primary-hover', 'primary-glow', 'primary-foreground', 'primary-text',
      'background', 'foreground', 'card', 'card-foreground', 'border', 
      'muted', 'muted-foreground', 'secondary', 'secondary-foreground'
    ];
    
    let removedVars = 0;
    cssVars.forEach(varName => {
      if (document.documentElement.style.getPropertyValue(`--${varName}`)) {
        document.documentElement.style.removeProperty(`--${varName}`);
        removedVars++;
        console.log(`🗑️ Removida variável CSS inline: --${varName}`);
      }
    });
    
    // Resetar paleta para padrão
    setPalette(defaultPalette);
    setHasChanges(false);
    setPendingColorsDetected(false);
    setPreviewMode(false);
    
    console.log(`✅ LIMPEZA CONCLUÍDA: ${removedKeys} localStorage + ${removedStyles} estilos + ${removedVars} variáveis CSS removidos`);
    console.log('🎨 Cores padrão restauradas - Primary:', defaultPalette.light.primary.hex);
    
    // Forçar re-render para garantir que as cores padrão sejam aplicadas
    setTimeout(() => {
      document.documentElement.offsetHeight;
      window.dispatchEvent(new Event('resize'));
    }, 100);
    
  }, [defaultPalette]);

  // SISTEMA DE APLICAÇÃO AUTOMÁTICA DESABILITADO
  // useEffect(() => {
  //   // Sistema de aplicação automática de cores removido
  //   // Agora as cores só são aplicadas quando o usuário clicar explicitamente
  //   console.log('ℹ️ Sistema de aplicação automática de cores desabilitado');
  // }, [defaultPalette]);
  
  // SISTEMA DE DETECÇÃO AUTOMÁTICA DESABILITADO
  // useEffect(() => {
  //   // Sistema removido para evitar aplicação automática de cores
  //   console.log('ℹ️ Sistema de detecção automática de cores desabilitado');
  // }, [defaultPalette]);

  // Force extreme colors for testing
  const forceExtremeColors = useCallback(() => {
    console.log('🚀 FORÇANDO CORES EXTREMAMENTE DIFERENTES!');
    
    const extremePalette = {
      ...palette,
      light: {
        ...palette.light,
        primary: { ...palette.light.primary, hsl: '0 100% 50%', hex: '#ff0000' }, // VERMELHO PURO
        background: { ...palette.light.background, hsl: '240 100% 90%', hex: '#ccccff' }, // AZUL CLARO
        card: { ...palette.light.card, hsl: '120 100% 80%', hex: '#66ff66' }, // VERDE CLARO
        foreground: { ...palette.light.foreground, hsl: '300 100% 25%', hex: '#800080' }, // ROXO
        'primary-text': { ...palette.light['primary-text'] || { name: 'Primary Text', description: 'Primary text color', category: 'core' }, hsl: '45 100% 50%', hex: '#ffcc00' }, // AMARELO DOURADO
      },
      dark: {
        ...palette.dark,
        primary: { ...palette.dark.primary, hsl: '0 100% 50%', hex: '#ff0000' }, // VERMELHO PURO
        background: { ...palette.dark.background, hsl: '240 100% 90%', hex: '#ccccff' }, // AZUL CLARO
        card: { ...palette.dark.card, hsl: '120 100% 80%', hex: '#66ff66' }, // VERDE CLARO
        foreground: { ...palette.dark.foreground, hsl: '300 100% 25%', hex: '#800080' }, // ROXO
        'primary-text': { ...palette.dark['primary-text'] || { name: 'Primary Text', description: 'Primary text color', category: 'core' }, hsl: '45 100% 50%', hex: '#ffcc00' }, // AMARELO DOURADO
      }
    };
    
    setPalette(extremePalette);
    setHasChanges(true);
    
    toast.success('🎨 Cores EXTREMAS definidas! Agora clique "Aplicar Cores"!', {
      description: 'Primary=VERMELHO, Background=AZUL, Cards=VERDE, Texto=ROXO, Primary-Text=AMARELO',
      duration: 8000
    });
    
    console.log('🎨 Paleta atualizada para cores extremas:', extremePalette.dark);
  }, [palette, setPalette]);

  // Update color in palette
  const updateColor = useCallback((colorKey: string, newHex: string, mode: 'light' | 'dark') => {
    console.log('🎨 === UPDATE COLOR DEBUG ===');
    console.log('Color Key:', colorKey);
    console.log('New Hex:', newHex);
    console.log('Mode:', mode);
    
    // TESTE IMEDIATO: Aplicar cor diretamente para verificar
    console.log('💪 TESTE IMEDIATO: Aplicando cor diretamente...');
    document.documentElement.style.setProperty(`--${colorKey}`, newHex, 'important');
    
    // Aplicar também em elementos específicos
    if (colorKey === 'primary') {
      const elements = document.querySelectorAll('.bg-primary, [class*="bg-primary"]');
      elements.forEach(el => {
        el.style.setProperty('background-color', newHex, 'important');
      });
      console.log(`🎨 Aplicado ${newHex} em ${elements.length} elementos`);
    }
    
    const hexToHsl = (hex: string): string => {
      // Ensure hex starts with #
      if (!hex.startsWith('#')) {
        hex = '#' + hex;
      }
      
      // Ensure hex is 6 characters (not 3)
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    const newHsl = hexToHsl(newHex);
    console.log('Converted HSL:', newHsl);
    
    setPalette(prev => {
      const newColor = {
        ...prev[mode][colorKey],
        hex: newHex,
        hsl: newHsl
      };
      
      // CORREÇÃO: Aplicar APENAS a cor selecionada em ambos os modos
      // Manter as outras cores específicas de cada modo
      const newPalette = {
        ...prev,
        light: {
          ...prev.light,
          [colorKey]: {
            ...prev.light[colorKey],
            hex: newHex,
            hsl: newHsl
          }
        },
        dark: {
          ...prev.dark,
          [colorKey]: {
            ...prev.dark[colorKey],
            hex: newHex,
            hsl: newHsl
          }
        }
      };
      
      console.log('🔧 APLICANDO APENAS', colorKey, 'em ambos os modos');
      console.log('🌅 Light mode mantém suas cores:', Object.keys(newPalette.light).length, 'cores');
      console.log('🌙 Dark mode mantém suas cores:', Object.keys(newPalette.dark).length, 'cores');
      
      console.log('Updated palette for', colorKey, 'em AMBOS os modos:', newColor);
      console.log('Light mode:', newPalette.light[colorKey]);
      console.log('Dark mode:', newPalette.dark[colorKey]);
      return newPalette;
    });
    
    setHasChanges(true);
    
    // Apply preview in real time if enabled
    if (previewMode) {
      const newPalette = {
        ...palette,
        [mode]: {
          ...palette[mode],
          [colorKey]: {
            ...palette[mode][colorKey],
            hex: newHex,
            hsl: newHsl
          }
        }
      };
      
      // Apply CSS variables directly for immediate effect
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Apply the color variable for the current mode with !important
      if ((mode === 'light' && !isDarkMode) || (mode === 'dark' && isDarkMode)) {
        document.documentElement.style.setProperty(`--${colorKey}`, newHsl, 'important');
        console.log(`🎨 Preview: Applied --${colorKey}: ${newHsl} for ${mode} mode (with !important)`);
      }
      
      // Also inject complete CSS for better coverage
      const cssContent = generateCompleteStaticCSS(newPalette);
      injectCSS(cssContent, 'preview-colors');
      
    }
  }, [palette, previewMode]);

  // Apply colors - SISTEMA HÍBRIDO: Aplicação dinâmica + Geração de CSS
  const applyColors = useCallback(async () => {
    console.log('🔥 BOTÃO APLICAR CORES CLICADO!');
    console.log('🎨 ========== SISTEMA HÍBRIDO: DINÂMICO + PERMANENTE ==========');
    console.log('1. Aplicar cores dinamicamente (feedback imediato)');
    console.log('2. Gerar CSS para aplicação permanente');
    
    setIsApplying(true);
    
    // Limpar interferências antigas
    console.log('🧹 Limpando interferências antigas...');
    
    // Remover localStorage antigo
    const colorKeys = [
      'grc-user-colors',
      'grc-pending-colors', 
      'grc-applied-colors',
      'grc-color-backup',
      'tenant-theme-applied',
      'lastThemeChangeTime'
    ];
    
    colorKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removido localStorage: ${key}`);
      }
    });
    
    // Remover estilos dinâmicos antigos
    const oldStyles = document.querySelectorAll('#grc-user-colors, #grc-temp-colors, #dynamic-colors, #preview-colors, style[data-theme]');
    oldStyles.forEach(el => {
      console.log(`🗑️ Removendo estilo antigo: ${el.id || 'unnamed'}`);
      el.remove();
    });
    
    toast.loading('🎨 Aplicando cores dinamicamente...', { id: 'applying-colors' });
    
    try {
      // Generate the complete CSS code with current colors
      const { staticColorsCSS, indexCSSFallbacks } = generateCompleteStaticCSS(palette);
      const cssContent = staticColorsCSS; // Para compatibilidade
      
      console.log('🎨 PROCESSO CONFORME ui.md: Gerar CSS para substituição manual');
      console.log('⚠️ IMPORTANTE: Sistema dinâmico foi removido conforme documentação');
      console.log('📝 CSS deve ser aplicado manualmente no arquivo static-colors.css');

      // PASSO 1: PREVIEW DINÂMICO TEMPORÁRIO (apenas para feedback imediato)
      console.log('🎨 PASSO 1: Aplicando preview dinâmico temporário...');
      console.log('👁️ Preview: Cores visíveis AGORA (temporário)');
      console.log('📝 Persistência: Apenas após atualizar static-colors.css');
      
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // CORREÇÃO: Usar a paleta ATUAL (com modificações) em vez da padrão
      const currentPalette = isDarkMode ? palette.dark : palette.light;
      
      console.log('Modo detectado:', isDarkMode ? 'dark' : 'light');
      console.log('🔍 PALETA ATUAL (com modificações):', currentPalette);
      console.log('🎨 Cor primária SELECIONADA a aplicar:', currentPalette.primary?.hsl);
      console.log('🎨 Cor primária HEX:', currentPalette.primary?.hex);
      
      // Verificar se a cor foi realmente modificada
      if (currentPalette.primary?.hsl === '173 88% 58%') {
        console.log('⚠️ PROBLEMA: Ainda usando cor padrão verde teal!');
        console.log('🔧 Paleta completa:', palette);
      } else {
        console.log('✅ Cor modificada detectada corretamente!');
      }
      
      // Criar estilo dinâmico com máxima prioridade
      const dynamicStyle = document.createElement('style');
      dynamicStyle.id = 'grc-dynamic-preview';
      
      // CORREÇÃO: Aplicar cores mantendo especificidade de cada modo
      // NÃO misturar cores de light e dark
      const lightVars = Object.entries(palette.light)
        .map(([key, value]) => `    --${key}: ${value.hsl} !important;`)
        .join('\n');
        
      const darkVars = Object.entries(palette.dark)
        .map(([key, value]) => `    --${key}: ${value.hsl} !important;`)
        .join('\n');
      
      console.log('🎨 Aplicando cores LIGHT (preservando especificidade):', palette.light.primary);
      console.log('🎨 Aplicando cores DARK (preservando especificidade):', palette.dark.primary);
      console.log('🔍 Verificando se light mode tem cores corretas...');
      console.log('Light background:', palette.light.background?.hsl);
      console.log('Light foreground:', palette.light.foreground?.hsl);
      console.log('Dark background:', palette.dark.background?.hsl);
      console.log('Dark foreground:', palette.dark.foreground?.hsl);
      
      dynamicStyle.textContent = `
        /* APLICAÇÃO DINÂMICA - AMBOS OS MODOS */
        
        /* LIGHT MODE */
        html:root,
        :root {
${lightVars}
        }
        
        /* DARK MODE */
        html.dark:root,
        html:root.dark,
        .dark {
${darkVars}
        }
        
        /* FORÇA APLICAÇÃO EM ELEMENTOS ESPECÍFICOS - MÁXIMA ESPECIFICIDADE */
        html body .bg-primary,
        html body button[class*="bg-primary"],
        html body [class*="bg-primary"],
        .bg-primary,
        button[class*="bg-primary"],
        [class*="bg-primary"] {
          background-color: hsl(${currentPalette.primary?.hsl}) !important;
          background: hsl(${currentPalette.primary?.hsl}) !important;
        }
        
        html body .text-primary,
        html body [class*="text-primary"],
        .text-primary,
        [class*="text-primary"] {
          color: hsl(${currentPalette.primary?.hsl}) !important;
        }
        
        html body .border-primary,
        html body [class*="border-primary"],
        .border-primary,
        [class*="border-primary"] {
          border-color: hsl(${currentPalette.primary?.hsl}) !important;
        }
        
        /* HOVER STATES */
        html body .bg-primary:hover,
        html body button[class*="bg-primary"]:hover,
        .bg-primary:hover,
        button[class*="bg-primary"]:hover {
          background-color: hsl(${currentPalette['primary-hover']?.hsl || currentPalette.primary?.hsl}) !important;
          background: hsl(${currentPalette['primary-hover']?.hsl || currentPalette.primary?.hsl}) !important;
        }
        
        /* FORÇA SIDEBAR */
        html body [data-sidebar="sidebar"] [class*="text-primary"],
        html body [data-sidebar="sidebar"] .text-primary,
        [data-sidebar="sidebar"] [class*="text-primary"],
        [data-sidebar="sidebar"] .text-primary {
          color: hsl(${currentPalette.primary?.hsl}) !important;
        }
      `;
      
      document.head.insertBefore(dynamicStyle, document.head.firstChild);
      
      console.log('CSS dinâmico criado:', dynamicStyle.textContent.substring(0, 200) + '...');
      
      // Aplicar diretamente nas variáveis CSS - AMBOS OS MODOS
      console.log('🔧 Aplicando variáveis CSS diretamente...');
      
      // Aplicar paleta do modo atual
      Object.entries(currentPalette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value.hsl, 'important');
        console.log(`Aplicando --${key}: ${value.hsl}`);
      });
      
      // Forçar aplicação da cor primária especificamente
      const selectedPrimary = currentPalette.primary;
      if (selectedPrimary) {
        document.documentElement.style.setProperty('--primary', selectedPrimary.hsl, 'important');
        console.log(`🎨 FORÇANDO cor primária: ${selectedPrimary.hsl} (${selectedPrimary.hex})`);
      }
      
      // Forçar re-render mais agressivo
      document.documentElement.offsetHeight;
      document.body.offsetHeight;
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('focus'));
      
      // Verificar se foi aplicada
      setTimeout(() => {
        const appliedPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        console.log('Cor primária após aplicação:', appliedPrimary);
        
        if (appliedPrimary === currentPalette.primary?.hsl) {
          console.log('✅ Aplicação dinâmica SUCESSO!');
        } else {
          console.log('❌ Aplicação dinâmica FALHOU!');
          console.log('Esperado:', currentPalette.primary?.hsl);
          console.log('Obtido:', appliedPrimary);
          
          // Tentar força bruta como fallback
          console.log('💪 Tentando força bruta como fallback...');
          const forceStyle = document.createElement('style');
          forceStyle.id = 'grc-force-fallback';
          forceStyle.textContent = `
            html, body, * {
              --primary: ${currentPalette.primary?.hsl} !important;
            }
            .bg-primary, [class*="bg-primary"] {
              background-color: hsl(${currentPalette.primary?.hsl}) !important;
            }
            .text-primary, [class*="text-primary"] {
              color: hsl(${currentPalette.primary?.hsl}) !important;
            }
          `;
          document.head.insertBefore(forceStyle, document.head.firstChild);
        }
      }, 500);
      
      console.log(`✅ Cores aplicadas dinamicamente! Primary: ${currentPalette.primary?.hsl}`);
      
      // PASSO 2: Gerar CSS para cópia manual (AMBOS OS ARQUIVOS)
      console.log('📝 PASSO 2: Gerando CSS para AMBOS os arquivos...');
      
      // Combinar ambos os códigos CSS com instruções detalhadas
      const combinedCSS = `# 🎨 GUIA COMPLETO: ALTERAR COR PRIMÁRIA

⚠️ **IMPORTANTE:** É necessário atualizar AMBOS os arquivos para garantir persistência!

## 📝 PASSO 1: Substitua src/styles/static-colors.css

**Arquivo:** \`src/styles/static-colors.css\`
**Ação:** Substitua TODO o conteúdo pelo código abaixo

\`\`\`css
${staticColorsCSS}
\`\`\`

---

## 📝 PASSO 2: Atualize fallbacks em src/index.css

**Arquivo:** \`src/index.css\`
**Ação:** Procure pelas seções de fallbacks e substitua APENAS as cores primárias:

\`\`\`css
${indexCSSFallbacks}
\`\`\`

**🔍 Como encontrar:** Procure por "FALLBACKS" no arquivo e substitua apenas as linhas:
- \`--primary:\`
- \`--primary-hover:\`
- \`--primary-glow:\`

## ✅ PASSO 3: Recarregar aplicação

Após salvar **AMBOS** os arquivos:
1. Pressione **Ctrl+Shift+R** (ou **Cmd+Shift+R** no Mac)
2. A cor primária deve mudar e persistir!
3. Teste alternando entre light/dark mode

---

## 🔧 Troubleshooting

**Se a cor não mudar:**
1. Verifique se AMBOS os arquivos foram salvos
2. Confirme que as cores são idênticas nos dois arquivos
3. Faça hard refresh: Ctrl+Shift+R
4. Limpe o cache do navegador se necessário

**Se a cor voltar ao padrão:**
- Verifique se o arquivo \`src/index.css\` tem as mesmas cores
- Os fallbacks podem estar sobrescrevendo as cores principais

---

📝 **Instruções detalhadas:** Consulte o arquivo \`ui.md\` na raiz do projeto
🌐 **Suporte:** Se precisar de ajuda, verifique o console do navegador`;
      
      setGeneratedCSS(combinedCSS);
      setStaticColorsCode(staticColorsCSS);
      setIndexCSSCode(indexCSSFallbacks);
      setShowCSSModal(true);
      setPendingColorsDetected(true);
      setHasChanges(false);
      
      // Função de download opcional
      const downloadCSS = () => {
        const blob = new Blob([cssContent], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'static-colors.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('📁 Arquivo CSS baixado!');
      };
      
      // Disponibilizar função globalmente
      (window as any).downloadCSS = downloadCSS;
      
      // Feedback para o usuário - PREVIEW TEMPORÁRIO
      toast.success('🎨 Preview aplicado!', {
        id: 'applying-colors',
        description: 'Cores visíveis AGORA (temporário). Para persistir, copie o CSS do modal.',
        duration: 6000
      });
      
      // Instruções no console
      console.log('%c🎨 PREVIEW TEMPORÁRIO + CSS ESTÁTICO:', 'font-size: 16px; font-weight: bold; color: #22c55e;');
      console.log('✅ Preview TEMPORÁRIO aplicado (visível agora)');
      console.log('✅ CSS gerado para aplicação PERMANENTE');
      console.log('');
      console.log('%cStatus atual:', 'font-weight: bold; color: #3b82f6;');
      console.log('👁️ Preview: Cores visíveis na interface (TEMPORÁRIO)');
      console.log('📝 Persistência: CSS disponível no modal para cópia');
      console.log('⚠️ IMPORTANTE: Preview desaparece no reload - use o CSS para persistir');
      console.log('');
      console.log('%cPara tornar PERMANENTE:', 'font-weight: bold; color: #f59e0b;');
      console.log('1. Copie o código CSS do modal que abriu');
      console.log('2. Abra o arquivo src/styles/static-colors.css');
      console.log('3. Substitua TODO o conteúdo pelo código copiado');
      console.log('4. Salve o arquivo');
      console.log('5. Recarregue a página (F5)');
      console.log('');
      console.log('%c📁 Download opcional:', 'color: #8b5cf6;');
      console.log('Execute no console: downloadCSS() (se preferir baixar o arquivo)');
      
    } catch (error) {
      console.error('❌ ERRO ao gerar CSS:', error);
      toast.error('❌ Erro ao gerar CSS', {
        description: 'Tente novamente.'
      });
    } finally {
      setIsApplying(false);
      console.log('🎨 GERAÇÃO DE CSS FINALIZADA');
    }
  }, [palette]);

  // Toggle preview mode
  const togglePreview = useCallback((enabled: boolean) => {
    setPreviewMode(enabled);
    
    if (enabled) {
      // Apply current palette as preview
      const cssContent = generateCompleteStaticCSS(palette);
      injectCSS(cssContent, 'preview-colors');
      
      // Determine current mode
      const isDarkMode = document.documentElement.classList.contains('dark');
      const currentPalette = isDarkMode ? palette.dark : palette.light;
      
      // Apply CSS variables for the current mode with !important
      Object.entries(currentPalette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value.hsl, 'important');
      });
      
      console.log(`🎨 Preview enabled for ${isDarkMode ? 'dark' : 'light'} mode with ${Object.keys(currentPalette).length} variables`);
      
      toast.info('👁️ Preview ativado - Mudanças visíveis em tempo real');
    } else {
      // Remove preview styles
      removeInjectedCSS('preview-colors');
      
      if (!pendingColorsDetected) {
        // Remove CSS variables only if no colors are permanently applied
        const colorVars = [
          'primary', 'primary-hover', 'primary-glow', 'primary-foreground', 'primary-text',
          'background', 'foreground', 'card', 'card-foreground', 'border', 
          'muted', 'muted-foreground', 'secondary', 'secondary-foreground',
          'popover', 'popover-foreground', 'success', 'success-foreground',
          'warning', 'warning-foreground', 'danger', 'danger-foreground',
          'risk-critical', 'risk-high', 'risk-medium', 'risk-low',
          'sidebar-background', 'sidebar-foreground'
        ];
        
        colorVars.forEach(varName => {
          document.documentElement.style.removeProperty(`--${varName}`);
        });
      }
      
      toast.info('👁️ Preview desativado');
    }
  }, [palette, pendingColorsDetected]);

  // Reset to default
  const resetToDefault = useCallback(() => {
    setPalette(defaultPalette);
    setHasChanges(true);
    
    // Apply default colors if preview is active
    if (previewMode) {
      const cssContent = generateCompleteStaticCSS(defaultPalette);
      injectCSS(cssContent, 'preview-colors');
      
      // Apply default CSS variables with !important
      const isDarkMode = document.documentElement.classList.contains('dark');
      const currentPalette = isDarkMode ? defaultPalette.dark : defaultPalette.light;
      
      Object.entries(currentPalette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value.hsl, 'important');
      });
    }
    
    toast.success('🔄 Cores resetadas para o padrão');
  }, [defaultPalette, previewMode]);

  // Clear all applied changes
  const clearPendingChanges = useCallback(() => {
    clearUserColors();
    setPendingColorsDetected(false);
    setPalette(defaultPalette);
    setHasChanges(false);
    toast.success('🧹 Cores revertidas para o padrão');
  }, [defaultPalette]);

  // Export palette as JSON
  const exportPalette = useCallback(() => {
    const data = JSON.stringify(palette, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grc-color-palette-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('📥 Paleta exportada com sucesso!');
  }, [palette]);

  // Import palette from JSON
  const importPalette = useCallback((importedPalette: ColorPalette) => {
    setPalette(importedPalette);
    setHasChanges(true);
    
    if (previewMode) {
      const cssContent = generateCompleteStaticCSS(importedPalette);
      injectCSS(cssContent, 'preview-colors');
      
      // Apply imported CSS variables with !important
      const isDarkMode = document.documentElement.classList.contains('dark');
      const currentPalette = isDarkMode ? importedPalette.dark : importedPalette.light;
      
      Object.entries(currentPalette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value.hsl, 'important');
      });
    }
    
    toast.success('📤 Paleta importada com sucesso!');
  }, [previewMode]);


  // Função de teste EXTREMA - força aplicação direta
  const testColorApplication = useCallback(() => {
    console.log('🧪 TESTE EXTREMO - FORÇANDO APLICAÇÃO DIRETA');
    
    // Remove ALL existing color styles
    const existingStyles = document.querySelectorAll('[id*="color"], [id*="theme"], [id*="grc"], style[data-vite-dev-id]');
    existingStyles.forEach(style => {
      console.log('🗑️ Removendo style:', style.id || 'unnamed');
      style.remove();
    });
    
    // Force nuclear CSS injection
    const style = document.createElement('style');
    style.id = 'EXTREME-FORCE-COLORS';
    
    style.textContent = `
      /* FORCE ALL ELEMENTS WITH MAXIMUM PRIORITY */
      * {
        --primary: 0 100% 50% !important;
        --background: 240 100% 95% !important;
        --card: 120 100% 80% !important;
        --foreground: 300 100% 25% !important;
      }
      
      html, body, #root {
        background-color: rgb(173, 216, 255) !important;
        color: rgb(128, 0, 128) !important;
      }
      
      button, .bg-primary {
        background-color: rgb(255, 0, 0) !important;
        color: white !important;
      }
      
      .card, [class*="card"] {
        background-color: rgb(144, 238, 144) !important;
        color: rgb(128, 0, 128) !important;
      }
      
      /* Force sidebar */
      [data-sidebar="main"] {
        background-color: rgb(255, 182, 193) !important;
      }
    `;
    
    document.head.appendChild(style);
    document.body.style.setProperty('background-color', 'rgb(173, 216, 255)', 'important');
    document.documentElement.style.setProperty('background-color', 'rgb(173, 216, 255)', 'important');
    
    // Force re-render
    document.documentElement.offsetHeight;
    
    console.log('💥 FORÇA BRUTA APLICADA!');
    console.log('🔵 Body deve estar AZUL CLARO');
    console.log('🔴 Botões devem estar VERMELHOS');
    console.log('🟢 Cards devem estar VERDES');
    console.log('🟣 Texto deve estar ROXO');
    console.log('🌸 Sidebar deve estar ROSA');
    console.log('');
    console.log('CSS aplicado:', style.textContent);
    
    // Make it globally available
    (window as any).testColors = testColorApplication;
    
    // Auto-remove after 10 seconds for safety
    setTimeout(() => {
      console.log('🧹 Removendo cores extremas...');
      style.remove();
      document.body.style.removeProperty('background-color');
      document.documentElement.style.removeProperty('background-color');
    }, 10000);
    
  }, []);

  return {
    // State
    palette,
    hasChanges,
    isApplying,
    previewMode,
    pendingColorsDetected,
    showCSSModal,
    generatedCSS,
    staticColorsCode,
    indexCSSCode,
    activeTab,
    setActiveTab,
    
    // Actions
    updateColor,
    applyColors,
    togglePreview,
    resetToDefault,
    clearPendingChanges,
    exportPalette,
    importPalette,
    setShowCSSModal,
    testColorApplication,
    forceExtremeColors,
    
    // Utilities
    hasPendingColors: hasPendingColors(),
    hasAppliedColors: hasUserColorsApplied()
  };
};