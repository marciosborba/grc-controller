const puppeteer = require('puppeteer');

(async () => {
    console.log('Starting puppeteer login test...');
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
        page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

        console.log('Navigating to http://localhost:3002/vendor-portal/login');
        await page.goto('http://localhost:3002/vendor-portal/login', { waitUntil: 'networkidle0', timeout: 15000 });

        console.log('Typing credentials...');
        await page.type('input[type="email"]', 'teste5@mail.com');
        await page.type('input[type="password"]', 'teste123');

        console.log('Clicking login...');
        const [response] = await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log('Navigation timeout/expected if SPA routing')),
            page.click('button[type="submit"]')
        ]);

        console.log('Waiting 5 seconds to observe console/network post-login...');
        await new Promise(r => setTimeout(r, 5000));

        console.log('Done observing login flow.');
    } catch (e) {
        console.error('PUPPETEER EXCEPTION:', e.message);
    } finally {
        if (browser) await browser.close();
    }
})();
