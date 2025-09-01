// Script de diagnóstico completo do sistema de cores
console.log('🔍 === DIAGNÓSTICO COMPLETO DO SISTEMA DE CORES ===');

// 1. VERIFICAR ESTADO ATUAL
console.log('\n📊 1. ESTADO ATUAL:');
const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
console.log('Cor primária atual:', currentPrimary);

const isDark = document.documentElement.classList.contains('dark');
console.log('Modo atual:', isDark ? 'dark' : 'light');

// 2. VERIFICAR ESTILOS EXISTENTES
console.log('\n🎨 2. ESTILOS DINÂMICOS EXISTENTES:');
const dynamicStyles = document.querySelectorAll('style[id]');
dynamicStyles.forEach(style => {
  console.log(`- ${style.id}: ${style.textContent.length} caracteres`);
});

// 3. TESTE DE APLICAÇÃO DIRETA
console.log('\n🧪 3. TESTE DE APLICAÇÃO DIRETA:');
console.log('Tentando aplicar vermelho puro...');

// Remover estilos conflitantes
const conflictingStyles = document.querySelectorAll('#grc-dynamic-preview, #grc-user-colors, #preview-colors, #dynamic-colors');
conflictingStyles.forEach(style => {
  console.log(`Removendo estilo conflitante: ${style.id}`);
  style.remove();
});

// Aplicar cor diretamente
document.documentElement.style.setProperty('--primary', '0 100% 50%', 'important');

// Verificar se foi aplicada
setTimeout(() => {
  const newPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
  console.log('Cor após aplicação direta:', newPrimary);
  
  if (newPrimary.includes('0 100% 50%') || newPrimary.includes('255, 0, 0')) {
    console.log('✅ Aplicação direta FUNCIONOU');
  } else {
    console.log('❌ Aplicação direta FALHOU');
    
    // 4. DIAGNÓSTICO AVANÇADO
    console.log('\n🔬 4. DIAGNÓSTICO AVANÇADO:');
    
    // Verificar se há CSS com !important sobrescrevendo
    const allStyles = Array.from(document.styleSheets);
    console.log(`Verificando ${allStyles.length} folhas de estilo...`);
    
    allStyles.forEach((sheet, index) => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        rules.forEach(rule => {
          if (rule.style && rule.style.getPropertyValue('--primary')) {
            console.log(`Regra encontrada na folha ${index}:`, rule.cssText);
          }
        });
      } catch (e) {
        console.log(`Não foi possível acessar folha de estilo ${index}:`, e.message);
      }
    });
    
    // 5. FORÇA BRUTA MÁXIMA
    console.log('\n💥 5. APLICAÇÃO COM FORÇA BRUTA:');
    
    const forceStyle = document.createElement('style');
    forceStyle.id = 'FORCE-DIAGNOSTIC-RED';
    forceStyle.textContent = `
      /* FORÇA MÁXIMA - DIAGNÓSTICO */
      html:root,
      html.dark:root,
      :root,
      .dark,
      * {
        --primary: 0 100% 50% !important;
      }
      
      /* FORÇA ELEMENTOS ESPECÍFICOS */
      .bg-primary,
      button[class*="bg-primary"],
      [class*="bg-primary"],
      .text-primary,
      [class*="text-primary"] {
        background-color: rgb(255, 0, 0) !important;
        color: rgb(255, 0, 0) !important;
        border-color: rgb(255, 0, 0) !important;
      }
      
      /* FORÇA SIDEBAR */
      [data-sidebar="sidebar"] [class*="text-primary"],
      [data-sidebar="sidebar"] .text-primary {
        color: rgb(255, 0, 0) !important;
      }
    `;
    
    document.head.insertBefore(forceStyle, document.head.firstChild);
    
    // Verificar novamente após força bruta
    setTimeout(() => {
      const finalPrimary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      console.log('Cor após força bruta:', finalPrimary);
      
      // Verificar elementos específicos
      const primaryElements = document.querySelectorAll('.bg-primary, .text-primary, [class*="bg-primary"], [class*="text-primary"]');
      console.log(`Encontrados ${primaryElements.length} elementos primários`);
      
      primaryElements.forEach((el, index) => {
        const computedStyle = getComputedStyle(el);
        const bgColor = computedStyle.backgroundColor;
        const textColor = computedStyle.color;
        console.log(`Elemento ${index}: bg=${bgColor}, color=${textColor}`);
      });
      
      if (finalPrimary.includes('0 100% 50%') || primaryElements.length > 0) {
        console.log('✅ FORÇA BRUTA FUNCIONOU - Sistema pode aplicar cores');
        console.log('🔧 PROBLEMA: Especificidade ou conflito de CSS');
        console.log('💡 SOLUÇÃO: Aumentar especificidade no sistema híbrido');
      } else {
        console.log('❌ FORÇA BRUTA FALHOU - Problema mais profundo');
        console.log('🔧 PROBLEMA: Sistema CSS fundamentalmente bloqueado');
        console.log('💡 SOLUÇÃO: Verificar se há CSS externo ou sistema bloqueando');
      }
      
      // Limpar após teste
      setTimeout(() => {
        forceStyle.remove();
        document.documentElement.style.removeProperty('--primary');
        console.log('🧹 Limpeza do diagnóstico concluída');
      }, 5000);
      
    }, 1000);
  }
}, 500);

// 6. VERIFICAR SISTEMA DE APLICAÇÃO
console.log('\n⚙️ 6. VERIFICANDO SISTEMA DE APLICAÇÃO:');
console.log('Hook useStaticColorManager disponível:', typeof window.useStaticColorManager);
console.log('Função applyColors disponível:', typeof window.applyColors);

// 7. VERIFICAR CONFLITOS CONHECIDOS
console.log('\n⚠️ 7. VERIFICANDO CONFLITOS CONHECIDOS:');
const knownConflicts = [
  'grc-user-colors',
  'grc-temp-colors', 
  'dynamic-colors',
  'preview-colors',
  'EXTREME-FORCE-COLORS',
  'FORCE-GREEN-TEAL'
];

knownConflicts.forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    console.log(`⚠️ Conflito encontrado: ${id}`);
  }
});

// 8. RELATÓRIO FINAL
console.log('\n📋 8. RELATÓRIO FINAL:');
console.log('- Execute este script no console do navegador');
console.log('- Observe os resultados de cada teste');
console.log('- Se força bruta funcionar, problema é de especificidade');
console.log('- Se força bruta falhar, problema é mais fundamental');
console.log('');
console.log('🔧 Para corrigir, baseie-se no resultado do diagnóstico');

// Disponibilizar globalmente
window.diagnoseColors = () => {
  console.clear();
  eval(document.querySelector('script[src*="diagnose"]')?.textContent || 'console.log("Script não encontrado")');
};