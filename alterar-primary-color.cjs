const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const STATIC_COLORS_PATH = path.join(__dirname, 'src', 'styles', 'static-colors.css');
const INDEX_CSS_PATH = path.join(__dirname, 'src', 'index.css');

// Utilitário para converter HSL em um formato seguro (remover múltiplos espaços)
const normalizeColor = (hslString) => {
    return hslString.replace(/\s+/g, ' ').trim();
};

const updateFile = (filePath, lightColor, darkColor) => {
    if (!fs.existsSync(filePath)) {
        console.warn(`[AVISO] Arquivo não encontrado: ${filePath}`);
        return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Separar o conteúdo entre a classe .dark e o :root para não misturar as substituições
    const darkIndex = content.indexOf('.dark {') > -1 ? content.indexOf('.dark {') : content.length;

    // 1. Atualizar LIGHT MODE (antes de .dark)
    let lightSection = content.substring(0, darkIndex);
    lightSection = lightSection.replace(/--primary:\s*[^;]+;/g, `--primary: ${lightColor};`);

    // 2. Atualizar DARK MODE (depois de .dark)
    let darkSection = content.substring(darkIndex);
    darkSection = darkSection.replace(/--primary:\s*[^;]+;/g, `--primary: ${darkColor};`);

    const newContent = lightSection + darkSection;

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`[SUCESSO] ${path.basename(filePath)} atualizado!`);
        return true;
    } else {
        console.log(`[INFO] Nenhuma alteração necessária em ${path.basename(filePath)}.`);
        return false;
    }
};

console.log('=============================================');
console.log('🎨 GRC CONTROLLER - COLOR CHANGER SCRIPT 🎨');
console.log('=============================================');

console.log('\nPor favor, forneça as novas cores no formato HSL (ex: 173 88% 58%)');

rl.question('Qual a nova Cor Primária para o LIGHT MODE? ', (lightModeColor) => {
    if (!lightModeColor.trim()) {
        console.log('Operação cancelada. A cor não pode ser vazia.');
        rl.close();
        return;
    }

    rl.question('Qual a nova Cor Primária para o DARK MODE? ', (darkModeColor) => {
        if (!darkModeColor.trim()) {
            console.log('Operação cancelada. A cor não pode ser vazia.');
            rl.close();
            return;
        }

        const normLight = normalizeColor(lightModeColor);
        const normDark = normalizeColor(darkModeColor);

        console.log(`\nAplicando Light: [${normLight}] e Dark: [${normDark}]...`);

        const updatedStatic = updateFile(STATIC_COLORS_PATH, normLight, normDark);
        const updatedIndex = updateFile(INDEX_CSS_PATH, normLight, normDark);

        if (updatedStatic || updatedIndex) {
            console.log('\n✅ Cores alteradas com sucesso!');
            console.log('👉 Se o servidor já estiver rodando, aperte F5 no seu navegador.');
        }

        rl.close();
    });
});
