// Script para testar acesso ao AI Manager via browser
// Execute este script no console do navegador (F12)

console.log('🔍 Testando acesso ao AI Manager...');

// 1. Verificar se estamos na página correta
console.log('📍 URL atual:', window.location.href);
console.log('📍 Pathname:', window.location.pathname);

// 2. Verificar se o React Router está funcionando
const checkReactRouter = () => {
  const root = document.getElementById('root');
  if (root && root.innerHTML.trim() !== '') {
    console.log('✅ React app carregado');
    return true;
  } else {
    console.log('❌ React app não carregado');
    return false;
  }
};

// 3. Verificar contexto de autenticação
const checkAuthContext = () => {
  try {
    // Tentar acessar o contexto de auth através do React DevTools
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools disponível');
    }
    
    // Verificar localStorage para dados de auth
    const authData = localStorage.getItem('supabase.auth.token');
    if (authData) {
      console.log('✅ Token de auth encontrado no localStorage');
      try {
        const parsed = JSON.parse(authData);
        console.log('📊 Auth data:', {
          hasAccessToken: !!parsed.access_token,
          hasRefreshToken: !!parsed.refresh_token,
          expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000) : null
        });
      } catch (e) {
        console.log('⚠️ Erro ao parsear auth data');
      }
    } else {
      console.log('❌ Nenhum token de auth encontrado');
    }
  } catch (error) {
    console.log('❌ Erro ao verificar auth:', error);
  }
};

// 4. Verificar se há erros no console
const checkConsoleErrors = () => {
  console.log('🔍 Verificando erros no console...');
  // Esta função será executada no contexto do browser
};

// 5. Tentar navegar programaticamente
const testNavigation = () => {
  console.log('🧪 Testando navegação programática...');
  
  // Verificar se o React Router está disponível
  if (window.history && window.history.pushState) {
    console.log('✅ History API disponível');
    
    // Tentar navegar
    try {
      window.history.pushState({}, '', '/admin/ai-management');
      console.log('✅ Navegação programática executada');
      
      // Disparar evento de mudança de rota
      window.dispatchEvent(new PopStateEvent('popstate'));
      console.log('✅ Evento popstate disparado');
      
    } catch (error) {
      console.log('❌ Erro na navegação:', error);
    }
  } else {
    console.log('❌ History API não disponível');
  }
};

// 6. Verificar elementos específicos do AI Manager
const checkAIManagerElements = () => {
  setTimeout(() => {
    console.log('🔍 Verificando elementos do AI Manager...');
    
    // Procurar por elementos específicos
    const aiManagerTitle = document.querySelector('h1');
    if (aiManagerTitle && aiManagerTitle.textContent.includes('Gestão de IA')) {
      console.log('✅ Título do AI Manager encontrado');
    } else {
      console.log('❌ Título do AI Manager não encontrado');
    }
    
    // Procurar por tabs
    const tabs = document.querySelectorAll('[role="tab"]');
    console.log(`📊 Tabs encontradas: ${tabs.length}`);
    
    // Procurar por badges de Platform Admin
    const adminBadges = document.querySelectorAll('[class*="Platform Admin"]');
    console.log(`🔐 Badges de admin encontradas: ${adminBadges.length}`);
    
    // Verificar se há mensagem de erro ou redirecionamento
    const errorMessages = document.querySelectorAll('[class*="error"], [class*="404"]');
    console.log(`❌ Mensagens de erro encontradas: ${errorMessages.length}`);
    
  }, 2000); // Aguardar 2 segundos para o componente carregar
};

// Executar todos os testes
const runAllTests = () => {
  console.log('🚀 Iniciando testes de acesso ao AI Manager...\n');
  
  checkReactRouter();
  checkAuthContext();
  checkConsoleErrors();
  testNavigation();
  checkAIManagerElements();
  
  console.log('\n📋 Instruções:');
  console.log('1. Execute este script no console do navegador (F12)');
  console.log('2. Navegue para http://localhost:8080/admin/ai-management');
  console.log('3. Verifique os resultados acima');
  console.log('4. Se houver erros, verifique se você está logado como Platform Admin');
};

// Auto-executar se estiver no browser
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('📝 Este script deve ser executado no console do navegador');
}

// Exportar funções para uso manual
window.testAIManager = {
  runAllTests,
  checkReactRouter,
  checkAuthContext,
  testNavigation,
  checkAIManagerElements
};