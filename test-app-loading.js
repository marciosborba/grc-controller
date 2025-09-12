#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testAppLoading() {
  console.log('🧪 Testando carregamento da aplicação...');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Capturar erros do console
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
    });
    
    // Capturar erros de rede
    page.on('requestfailed', request => {
      console.log(`❌ [NETWORK ERROR] ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Navegar para a aplicação
    console.log('🌐 Navegando para http://localhost:8080...');
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Aguardar um pouco para o React carregar
    await page.waitForTimeout(3000);
    
    // Verificar se o React carregou
    const reactLoaded = await page.evaluate(() => {
      return window.React !== undefined;
    });
    
    // Verificar o conteúdo da página
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        bodyText: document.body.innerText,
        hasRoot: !!document.getElementById('root'),
        rootContent: document.getElementById('root')?.innerHTML || '',
        hasPreloader: !!document.getElementById('app-preloader')
      };
    });
    
    console.log('📊 Resultado do teste:');
    console.log('- React carregado:', reactLoaded);
    console.log('- Título da página:', pageContent.title);
    console.log('- Tem elemento root:', pageContent.hasRoot);
    console.log('- Tem preloader:', pageContent.hasPreloader);
    console.log('- Conteúdo do body:', pageContent.bodyText.substring(0, 200) + '...');
    
    if (pageContent.rootContent) {
      console.log('- Conteúdo do root:', pageContent.rootContent.substring(0, 300) + '...');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testAppLoading();