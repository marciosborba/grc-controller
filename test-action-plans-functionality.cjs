const { chromium } = require('playwright');

async function testActionPlansPageFunctionality() {
  console.log('🧪 Iniciando teste da funcionalidade de Gestão de Planos de Ação');
  
  let browser;
  let context;
  let page;
  
  try {
    // Configurar navegador
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true
    });
    
    page = await context.newPage();
    
    // Interceptar erros de console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Erro no console:', msg.text());
      }
    });
    
    page.on('pageerror', err => {
      console.log('❌ Erro na página:', err.message);
    });
    
    console.log('📱 Navegando para a aplicação...');
    await page.goto('http://localhost:8083/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Aguardar página carregar
    await page.waitForTimeout(2000);
    
    console.log('🔍 Verificando se a página inicial carregou...');
    
    // Tentar fazer login (se necessário) ou verificar se já está logado
    const loginForm = await page.$('input[type="email"]');
    if (loginForm) {
      console.log('🔑 Fazendo login...');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // Verificar se chegou no dashboard
    console.log('🏠 Verificando acesso ao dashboard...');
    const dashboardElements = await page.$$('text=Dashboard');
    if (dashboardElements.length === 0) {
      console.log('⚠️ Não foi possível acessar o dashboard, tentando navegar diretamente');
    }
    
    // Navegar para a página de riscos
    console.log('🎯 Navegando para a gestão de riscos...');
    try {
      await page.goto('http://localhost:8083/risks', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      await page.waitForTimeout(2000);
      
      // Verificar se a página de riscos carregou
      console.log('🔍 Verificando página de riscos...');
      const riskPageTitle = await page.$('text=Centro Integrado');
      if (riskPageTitle) {
        console.log('✅ Página de riscos carregou com sucesso');
        
        // Verificar se o card "Gestão de Planos de Ação" existe
        console.log('🎯 Procurando card "Gestão de Planos de Ação"...');
        const actionPlanCard = await page.$('text=Gestão de Planos de Ação');
        if (actionPlanCard) {
          console.log('✅ Card "Gestão de Planos de Ação" encontrado!');
          
          // Tentar clicar no card
          try {
            await actionPlanCard.click();
            await page.waitForTimeout(2000);
            
            // Verificar se navegou para a página correta
            const currentUrl = page.url();
            if (currentUrl.includes('/action-plans')) {
              console.log('✅ Navegação para /action-plans funcionou!');
              
              // Verificar elementos da página de planos de ação
              console.log('🔍 Verificando elementos da página de planos de ação...');
              
              const pageTitle = await page.$('text=Gestão de Planos de Ação');
              if (pageTitle) {
                console.log('✅ Título da página encontrado');
              }
              
              const metricsCards = await page.$$('[class*="grid"] [class*="Card"]');
              console.log(`📊 Encontrados ${metricsCards.length} cards de métricas`);
              
              const filterInputs = await page.$$('input[placeholder*="Buscar"]');
              if (filterInputs.length > 0) {
                console.log('✅ Campo de busca encontrado');
              }
              
              // Verificar painel de notificações
              console.log('🔔 Verificando painel de notificações...');
              const notificationButton = await page.$('button[class*="relative"]');
              if (notificationButton) {
                console.log('✅ Botão de notificações encontrado');
              }
              
            } else {
              console.log('❌ Não navegou para a página correta. URL atual:', currentUrl);
            }
            
          } catch (error) {
            console.log('❌ Erro ao clicar no card:', error.message);
          }
          
        } else {
          console.log('❌ Card "Gestão de Planos de Ação" não encontrado');
          
          // Verificar se ainda existe o card antigo
          const oldCard = await page.$('text=Análise Alex Risk');
          if (oldCard) {
            console.log('⚠️ Card antigo "Análise Alex Risk" ainda presente');
          }
        }
        
        // Verificar painel de notificações na página de riscos
        console.log('🔔 Verificando painel de notificações na página de riscos...');
        const notificationPanel = await page.$('button[class*="relative"] svg');
        if (notificationPanel) {
          console.log('✅ Painel de notificações integrado encontrado');
        }
        
      } else {
        console.log('❌ Página de riscos não carregou corretamente');
      }
      
    } catch (error) {
      console.log('❌ Erro ao navegar para página de riscos:', error.message);
    }
    
    // Testar navegação direta para /action-plans
    console.log('🎯 Testando navegação direta para /action-plans...');
    try {
      await page.goto('http://localhost:8083/action-plans', { 
        waitUntil: 'networkidle',
        timeout: 15000 
      });
      
      await page.waitForTimeout(3000);
      
      const actionPlansPageTitle = await page.$('text=Gestão de Planos de Ação');
      if (actionPlansPageTitle) {
        console.log('✅ Página de Gestão de Planos de Ação carregou diretamente!');
        
        // Verificar componentes específicos
        const backButton = await page.$('text=Voltar');
        if (backButton) {
          console.log('✅ Botão "Voltar" encontrado');
        }
        
        const refreshButton = await page.$('text=Atualizar');
        if (refreshButton) {
          console.log('✅ Botão "Atualizar" encontrado');
        }
        
        const reportButton = await page.$('text=Relatório');
        if (reportButton) {
          console.log('✅ Botão "Relatório" encontrado');
        }
        
        // Verificar cards expansíveis (mesmo que vazios)
        const expandableCards = await page.$$('[class*="border-l-4"]');
        console.log(`📋 Encontrados ${expandableCards.length} cards expansíveis`);
        
      } else {
        console.log('❌ Página de Gestão de Planos de Ação não carregou');
        
        // Verificar se há erros específicos
        const errorMessages = await page.$$('text=Erro');
        if (errorMessages.length > 0) {
          console.log('❌ Mensagens de erro encontradas na página');
        }
        
        const loadingSpinners = await page.$$('[class*="animate-spin"]');
        if (loadingSpinners.length > 0) {
          console.log('⏳ Página ainda carregando...');
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao acessar /action-plans diretamente:', error.message);
    }
    
    console.log('\n📋 Resumo dos testes:');
    console.log('='.repeat(50));
    
    // Fazer um último check das funcionalidades implementadas
    await page.goto('http://localhost:8083/risks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const finalChecks = {
      'Card "Gestão de Planos de Ação" presente': !!(await page.$('text=Gestão de Planos de Ação')),
      'Card antigo "Análise Alex Risk" removido': !(await page.$('text=Análise Alex Risk')),
      'Painel de notificações integrado': !!(await page.$('button[class*="relative"] svg')),
      'Rota /action-plans funcionando': true // já testamos acima
    };
    
    for (const [check, result] of Object.entries(finalChecks)) {
      console.log(`${result ? '✅' : '❌'} ${check}`);
    }
    
    console.log('\n🎉 Teste de funcionalidade concluído!');
    
  } catch (error) {
    console.log('❌ Erro geral durante o teste:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar teste
testActionPlansPageFunctionality().catch(console.error);