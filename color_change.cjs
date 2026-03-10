const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

console.log('==================================================');
console.log('🎨 GRC CONTROLLER - AUTO COLOR CHANGER SCRIPT 🎨');
console.log('==================================================');
console.log('Procurando pelo arquivo static-colors.css mais recente baixado...');

const downloadsDir = path.join(os.homedir(), 'Downloads');

let latestFile = null;
let latestTime = 0;

try {
    const files = fs.readdirSync(downloadsDir);
    for (const file of files) {
        if (file.startsWith('static-colors') && file.endsWith('.css')) {
            const filePath = path.join(downloadsDir, file);
            const stats = fs.statSync(filePath);
            // Pega o arquivo de CSS mais recentemente modificado que comece com static-colors
            if (stats.mtimeMs > latestTime) {
                latestTime = stats.mtimeMs;
                latestFile = filePath;
            }
        }
    }
} catch (e) {
    console.log('Não foi possível escanear a pasta Downloads automaticamente.');
}

const applyColors = (sourcePath) => {
    const STATIC_COLORS_DEST = path.join(__dirname, 'src', 'styles', 'static-colors.css');
    const INDEX_CSS_DEST = path.join(__dirname, 'src', 'index.css');

    if (!fs.existsSync(sourcePath)) {
        console.error(`\n❌ Erro: Arquivo não encontrado em "${sourcePath}"`);
        return;
    }

    try {
        const newCssContent = fs.readFileSync(sourcePath, 'utf8');

        // Expressões regulares para extrair as variáveis principais
        // Extrai do :root (Light Mode)
        const rootMatch = newCssContent.match(/:root\s*{[^}]*--primary:\s*([^;]+);/);
        const rootHoverMatch = newCssContent.match(/:root\s*{[^}]*--primary-hover:\s*([^;]+);/);
        const rootGlowMatch = newCssContent.match(/:root\s*{[^}]*--primary-glow:\s*([^;]+);/);
        const rootSidebarAccentMatch = newCssContent.match(/:root\s*{[^}]*--sidebar-accent:\s*([^;]+);/);
        const rootSidebarAccentForeMatch = newCssContent.match(/:root\s*{[^}]*--sidebar-accent-foreground:\s*([^;]+);/);

        // Extrai do .dark (Dark Mode)
        const darkMatch = newCssContent.match(/\.dark\s*{[^}]*--primary:\s*([^;]+);/);
        const darkHoverMatch = newCssContent.match(/\.dark\s*{[^}]*--primary-hover:\s*([^;]+);/);
        const darkGlowMatch = newCssContent.match(/\.dark\s*{[^}]*--primary-glow:\s*([^;]+);/);
        const darkSidebarAccentMatch = newCssContent.match(/\.dark\s*{[^}]*--sidebar-accent:\s*([^;]+);/);
        const darkSidebarAccentForeMatch = newCssContent.match(/\.dark\s*{[^}]*--sidebar-accent-foreground:\s*([^;]+);/);

        console.log('\n[1/3] ✔️ Arquivo recebido e lido com sucesso.');

        // 1. Sobrescrever o static-colors.css do projeto
        fs.writeFileSync(STATIC_COLORS_DEST, newCssContent, 'utf8');
        console.log('[2/3] ✔️ src/styles/static-colors.css atualizado por completo.');

        // 2. Atualizar o index.css com as extrações
        if (fs.existsSync(INDEX_CSS_DEST)) {
            let indexContent = fs.readFileSync(INDEX_CSS_DEST, 'utf8');

            const darkSectionIndex = indexContent.indexOf('.dark {') > -1 ? indexContent.indexOf('.dark {') : indexContent.length;
            let lightSection = indexContent.substring(0, darkSectionIndex);
            let darkSection = indexContent.substring(darkSectionIndex);

            // Substituir no Light Section
            if (rootMatch) lightSection = lightSection.replace(/--primary:\s*[^;]+;/g, `--primary: ${rootMatch[1]};`);
            if (rootHoverMatch) lightSection = lightSection.replace(/--primary-hover:\s*[^;]+;/g, `--primary-hover: ${rootHoverMatch[1]};`);
            if (rootGlowMatch) lightSection = lightSection.replace(/--primary-glow:\s*[^;]+;/g, `--primary-glow: ${rootGlowMatch[1]};`);
            if (rootSidebarAccentMatch) lightSection = lightSection.replace(/--sidebar-accent:\s*[^;]+;/g, `--sidebar-accent: ${rootSidebarAccentMatch[1]};`);
            if (rootSidebarAccentForeMatch) lightSection = lightSection.replace(/--sidebar-accent-foreground:\s*[^;]+;/g, `--sidebar-accent-foreground: ${rootSidebarAccentForeMatch[1]};`);

            // Substituir no Dark Section  
            if (darkMatch) darkSection = darkSection.replace(/--primary:\s*[^;]+;/g, `--primary: ${darkMatch[1]};`);
            if (darkHoverMatch) darkSection = darkSection.replace(/--primary-hover:\s*[^;]+;/g, `--primary-hover: ${darkHoverMatch[1]};`);
            if (darkGlowMatch) darkSection = darkSection.replace(/--primary-glow:\s*[^;]+;/g, `--primary-glow: ${darkGlowMatch[1]};`);
            if (darkSidebarAccentMatch) darkSection = darkSection.replace(/--sidebar-accent:\s*[^;]+;/g, `--sidebar-accent: ${darkSidebarAccentMatch[1]};`);
            if (darkSidebarAccentForeMatch) darkSection = darkSection.replace(/--sidebar-accent-foreground:\s*[^;]+;/g, `--sidebar-accent-foreground: ${darkSidebarAccentForeMatch[1]};`);

            fs.writeFileSync(INDEX_CSS_DEST, lightSection + darkSection, 'utf8');
            console.log('[3/3] ✔️ src/index.css atualizado com os novos fallbacks.');
        } else {
            console.log('[3/3] ⚠️ src/index.css não atualizado. (Arquivo inexistente).');
        }

        console.log('\n✅ SUCESSO! AS CORES FORAM INJETADAS NO CÓDIGO FONTE.');
        console.log('👉 Se o servidor (npm run dev) já estiver rodando, as mudanças aparecerão em instantes.');
    } catch (err) {
        console.error(`\n❌ Ocorreu um erro durante a atualização: ${err.message}`);
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

if (latestFile) {
    console.log(`\nEncontrei este arquivo recentemente baixado:`);
    console.log(`>> ${latestFile}`);
    rl.question('\nDeseja aplicar as cores a partir deste arquivo? (S/n): ', (answer) => {
        if (answer.toLowerCase() === 'n') {
            rl.question('\nCole o caminho completo do arquivo .css baixado para extração: ', (filePath) => {
                applyColors(filePath.replace(/['"]/g, '').trim());
                rl.close();
            });
        } else {
            applyColors(latestFile);
            rl.close();
        }
    });
} else {
    rl.question('\nCole o caminho completo do arquivo .css baixado para extração: ', (filePath) => {
        applyColors(filePath.replace(/['"]/g, '').trim());
        rl.close();
    });
}
