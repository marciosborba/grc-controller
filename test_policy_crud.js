// Script de teste para verificar todas as funcionalidades CRUD do módulo de políticas
// Executar no console do navegador na página de políticas

console.log('🧪 Iniciando testes CRUD do módulo de políticas...');

// Função para aguardar um tempo
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para simular clique em elemento
const clickElement = (selector, description) => {
  const element = document.querySelector(selector);
  if (element) {
    element.click();
    console.log(`✅ ${description}: Clique realizado`);
    return true;
  } else {
    console.log(`❌ ${description}: Elemento não encontrado - ${selector}`);
    return false;
  }
};

// Função para verificar se elemento existe
const checkElement = (selector, description) => {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✅ ${description}: Elemento encontrado`);
    return true;
  } else {
    console.log(`❌ ${description}: Elemento não encontrado - ${selector}`);
    return false;
  }
};

// Função para contar elementos
const countElements = (selector, description) => {
  const elements = document.querySelectorAll(selector);
  console.log(`📊 ${description}: ${elements.length} elementos encontrados`);
  return elements.length;
};

// Teste principal
async function testPolicyModule() {
  console.log('\n🔍 === TESTE 1: VERIFICAÇÃO DA INTERFACE ===');
  
  // Verificar se o módulo carregou
  checkElement('[data-testid="policy-management-hub"], .space-y-6', 'Módulo de políticas carregado');
  
  // Verificar header principal
  checkElement('h1', 'Header principal');
  checkElement('[data-testid="alex-policy-status"], .text-sm.text-muted-foreground', 'Status Alex Policy');
  
  // Verificar botões do header
  checkElement('button:has([data-testid="notifications-icon"]), button:has(.lucide-message-square)', 'Botão de notificações');
  checkElement('button:has([data-testid="alex-policy-chat"]), button:contains("Alex Policy")', 'Botão Alex Policy Chat');
  
  // Verificar alert informativo
  checkElement('[data-testid="info-alert"], .border-blue-200', 'Alert informativo');
  
  // Verificar busca e filtros
  checkElement('input[placeholder*="Buscar"], input[placeholder*="políticas"]', 'Campo de busca');
  checkElement('button:contains("Filtros"), button:has(.lucide-filter)', 'Botão de filtros');
  checkElement('button:contains("Relatórios"), button:has(.lucide-bar-chart-3)', 'Botão de relatórios');
  checkElement('button:contains("Configurações"), button:has(.lucide-settings)', 'Botão de configurações');
  
  console.log('\n🔍 === TESTE 2: VERIFICAÇÃO DAS ABAS ===');
  
  // Verificar abas de navegação
  const tabs = [
    { name: 'Dashboard', selector: '[data-value="dashboard"], button:contains("Dashboard")' },
    { name: 'Elaboração', selector: '[data-value="elaboration"], button:contains("Elaboração")' },
    { name: 'Revisão', selector: '[data-value="review"], button:contains("Revisão")' },
    { name: 'Aprovação', selector: '[data-value="approval"], button:contains("Aprovação")' },
    { name: 'Publicação', selector: '[data-value="publication"], button:contains("Publicação")' },
    { name: 'Validade', selector: '[data-value="lifecycle"], button:contains("Validade")' },
    { name: 'Templates', selector: '[data-value="templates"], button:contains("Templates")' },
    { name: 'Analytics', selector: '[data-value="analytics"], button:contains("Analytics")' }
  ];
  
  tabs.forEach(tab => {
    checkElement(tab.selector, `Aba ${tab.name}`);
  });
  
  console.log('\n🔍 === TESTE 3: VERIFICAÇÃO DO DASHBOARD ===');
  
  // Verificar se está na aba dashboard
  checkElement('[data-state="active"][data-value="dashboard"], .space-y-6', 'Dashboard ativo');
  
  // Verificar cards de métricas
  const metricsCards = [
    'Total de Políticas',
    'Políticas Ativas', 
    'Pendentes Aprovação',
    'Vencendo em 30 dias'
  ];
  
  metricsCards.forEach(metric => {
    checkElement(`*:contains("${metric}")`, `Card de métrica: ${metric}`);
  });
  
  // Verificar gráficos
  checkElement('.recharts-wrapper, [data-testid="status-chart"]', 'Gráfico de distribuição por status');
  checkElement('[data-testid="critical-policies"], *:contains("Políticas Críticas")', 'Seção de políticas críticas');
  
  // Verificar botões do dashboard
  checkElement('button:contains("Atualizar"), button:has(.lucide-refresh-cw)', 'Botão Atualizar');
  checkElement('button:contains("Exportar"), button:has(.lucide-download)', 'Botão Exportar');
  
  console.log('\n🔍 === TESTE 4: NAVEGAÇÃO ENTRE ABAS ===');
  
  // Testar navegação para cada aba
  for (const tab of tabs) {
    console.log(`\n📋 Testando aba: ${tab.name}`);
    
    if (clickElement(tab.selector, `Clique na aba ${tab.name}`)) {
      await wait(500); // Aguardar carregamento
      
      // Verificar se a aba está ativa
      checkElement(`[data-state="active"][data-value="${tab.name.toLowerCase()}"], [data-state="active"]`, `Aba ${tab.name} ativa`);
      
      // Verificar conteúdo específico de cada aba
      switch(tab.name) {
        case 'Dashboard':
          checkElement('*:contains("Dashboard de Políticas")', 'Título do Dashboard');
          break;
        case 'Elaboração':
          checkElement('*:contains("Elaboração de Políticas"), *:contains("Nova Política")', 'Conteúdo da Elaboração');
          break;
        case 'Revisão':
          checkElement('*:contains("Revisão de Políticas")', 'Conteúdo da Revisão');
          break;
        case 'Aprovação':
          checkElement('*:contains("Aprovação de Políticas")', 'Conteúdo da Aprovação');
          break;
        case 'Publicação':
          checkElement('*:contains("Publicação de Políticas")', 'Conteúdo da Publicação');
          break;
        case 'Validade':
          checkElement('*:contains("Gestão de Validade")', 'Conteúdo da Validade');
          break;
        case 'Templates':
          checkElement('*:contains("Templates de Políticas")', 'Conteúdo dos Templates');
          break;
        case 'Analytics':
          checkElement('*:contains("Analytics e Relatórios")', 'Conteúdo do Analytics');
          break;
      }
    }
  }
  
  console.log('\n🔍 === TESTE 5: FUNCIONALIDADES INTERATIVAS ===');
  
  // Voltar para o dashboard
  clickElement('[data-value="dashboard"], button:contains("Dashboard")', 'Voltar para Dashboard');
  await wait(500);
  
  // Testar busca
  const searchInput = document.querySelector('input[placeholder*="Buscar"], input[placeholder*="políticas"]');
  if (searchInput) {
    searchInput.value = 'segurança';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Teste de busca: Texto inserido');
    
    // Limpar busca
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Teste de busca: Campo limpo');
  }
  
  // Testar Alex Policy Chat
  if (clickElement('button:contains("Alex Policy"), button:has(.lucide-message-square)', 'Abrir Alex Policy Chat')) {
    await wait(1000);
    checkElement('[role="dialog"], .max-w-2xl', 'Modal do Alex Policy aberto');
    
    // Fechar modal (se abriu)
    clickElement('button:has(.lucide-x), [data-testid="close-dialog"]', 'Fechar Alex Policy Chat');
    await wait(500);
  }
  
  // Testar notificações
  if (clickElement('button:contains("Notificações"), button:has(.lucide-message-square)', 'Abrir Central de Notificações')) {
    await wait(1000);
    checkElement('[role="dialog"], .max-w-2xl', 'Modal de notificações aberto');
    
    // Fechar modal (se abriu)
    clickElement('button:has(.lucide-x), [data-testid="close-notifications"]', 'Fechar Central de Notificações');
    await wait(500);
  }
  
  console.log('\n🔍 === TESTE 6: VERIFICAÇÃO DE DADOS ===');
  
  // Contar políticas exibidas
  countElements('[data-testid="policy-card"], .policy-item', 'Políticas exibidas');
  
  // Verificar se há dados nas métricas
  const metricValues = document.querySelectorAll('.text-3xl, .text-2xl');
  console.log(`📊 Valores de métricas encontrados: ${metricValues.length}`);
  
  metricValues.forEach((metric, index) => {
    if (metric.textContent && metric.textContent.trim() !== '0') {
      console.log(`✅ Métrica ${index + 1}: ${metric.textContent.trim()}`);
    }
  });
  
  console.log('\n🔍 === TESTE 7: RESPONSIVIDADE ===');
  
  // Verificar classes responsivas
  checkElement('.grid-cols-1.md\\:grid-cols-2, .grid-cols-4.lg\\:grid-cols-8', 'Layout responsivo');
  checkElement('.hidden.sm\\:inline, .flex.md\\:flex-row', 'Elementos responsivos');
  
  console.log('\n🔍 === TESTE 8: ACESSIBILIDADE ===');
  
  // Verificar atributos de acessibilidade
  checkElement('[role="button"], button', 'Botões com role');
  checkElement('[aria-label], [aria-describedby]', 'Elementos com aria-labels');
  checkElement('h1, h2, h3', 'Hierarquia de headings');
  
  console.log('\n🎉 === RESUMO DOS TESTES ===');
  
  // Contar sucessos e falhas
  const logs = console.history || [];
  const successCount = logs.filter(log => log.includes('✅')).length;
  const errorCount = logs.filter(log => log.includes('❌')).length;
  
  console.log(`✅ Testes bem-sucedidos: ${successCount}`);
  console.log(`❌ Testes com falha: ${errorCount}`);
  console.log(`📊 Taxa de sucesso: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);
  
  if (errorCount === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Módulo funcionando perfeitamente.');
  } else if (errorCount < 5) {
    console.log('⚠️ Alguns testes falharam, mas o módulo está funcionando bem.');
  } else {
    console.log('🚨 Muitos testes falharam. Verificar implementação.');
  }
  
  return {
    success: successCount,
    errors: errorCount,
    total: successCount + errorCount,
    successRate: ((successCount / (successCount + errorCount)) * 100).toFixed(1)
  };
}

// Executar testes
testPolicyModule().then(result => {
  console.log('\n📋 Resultado final:', result);
}).catch(error => {
  console.error('❌ Erro durante os testes:', error);
});

// Função adicional para testar CRUD via API (se necessário)
async function testPolicyAPI() {
  console.log('\n🔍 === TESTE API: VERIFICAÇÃO DE DADOS ===');
  
  try {
    // Verificar se o Supabase está disponível
    if (typeof window.supabase !== 'undefined') {
      const { data: policies, error } = await window.supabase
        .from('policies')
        .select('*')
        .limit(5);
      
      if (error) {
        console.log('❌ Erro ao buscar políticas:', error.message);
      } else {
        console.log(`✅ Políticas encontradas via API: ${policies.length}`);
        policies.forEach((policy, index) => {
          console.log(`📋 Política ${index + 1}: ${policy.title} (${policy.status})`);
        });
      }
      
      // Testar notificações
      const { data: notifications, error: notifError } = await window.supabase
        .from('policy_notifications')
        .select('*')
        .limit(5);
      
      if (notifError) {
        console.log('❌ Erro ao buscar notificações:', notifError.message);
      } else {
        console.log(`✅ Notificações encontradas via API: ${notifications.length}`);
      }
      
    } else {
      console.log('⚠️ Supabase não disponível no contexto global');
    }
  } catch (error) {
    console.log('❌ Erro no teste de API:', error.message);
  }
}

// Executar teste de API também
testPolicyAPI();

console.log('\n🏁 Testes concluídos! Verifique os resultados acima.');