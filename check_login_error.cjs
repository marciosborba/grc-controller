const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting puppeteer...');
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
        page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
        page.on('response', response => {
            if (!response.url().includes('supabase')) return;
            console.log('RESPONSE:', response.status(), response.url());
        });

        console.log('Navigating to http://localhost:3002/login');
        await page.goto('http://localhost:3002/login', { waitUntil: 'domcontentloaded', timeout: 10000 });
        console.log('DOM loaded. Waiting 5 seconds to observe console/network...');

        await new Promise(r => setTimeout(r, 5000));

        console.log('Done observing.');
    } catch (e) {
        console.error('PUPPETEER ERROR:', e.message);
    } finally {
        if (browser) await browser.close();
    }
})();
