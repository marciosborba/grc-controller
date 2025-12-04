// 🎯 TESTE ESPECÍFICO PARA EDIÇÃO DE INCIDENTES
// 
// Este script testa especificamente a funcionalidade de edição

console.log('🎯 TESTE ESPECÍFICO PARA EDIÇÃO DE INCIDENTES');

// Interceptar requisições
const originalFetch = window.fetch;
let requestLog = [];

window.fetch = function(...args) {
    const [url, options] = args;
    const requestInfo = {
        url: typeof url === 'string' ? url.split('?')[0] : url,
        method: options?.method || 'GET',
        timestamp: new Date().toISOString(),
        body: null
    };
    
    if (options?.body) {
        try {
            requestInfo.body = JSON.parse(options.body);
        } catch (e) {
            requestInfo.body = options.body;
        }
    }
    
    requestLog.push(requestInfo);
    
    console.log('🌐 REQUISIÇÃO:', requestInfo);
    
    return originalFetch.apply(this, args).then(response => {
        console.log('📥 RESPOSTA:', {
            url: requestInfo.url,
            status: response.status,
            ok: response.ok,
            timestamp: new Date().toISOString()
        });
        
        if (!response.ok) {
            response.clone().text().then(text => {
                console.error('❌ ERRO NA RESPOSTA:', text);
            });
        }
        
        return response;
    });
};

// Função para testar edição específica
function testarEdicaoEspecifica() {
    console.log('\n🧪 TESTANDO EDIÇÃO ESPECÍFICA...');
    
    // Verificar se modal está aberto
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ Modal não encontrado! Abra um modal de EDIÇÃO primeiro.');
        console.log('💡 Dica: Clique no botão "Editar" de um incidente existente');
        return;
    }
    
    // Verificar se é modal de edição (deve ter "Editar" no título)
    const title = modal.querySelector('h2, [role="heading"]');
    const isEditModal = title && title.textContent.includes('Editar');
    
    if (!isEditModal) {
        console.warn('⚠️ Este parece ser um modal de CRIAÇÃO, não EDIÇÃO');
        console.log('💡 Para testar edição, clique em "Editar" em um incidente existente');
    }
    
    console.log('✅ Modal encontrado:', isEditModal ? 'EDIÇÃO' : 'CRIAÇÃO');
    
    // Encontrar elementos
    const titleInput = modal.querySelector('#title');
    const descriptionInput = modal.querySelector('#description');
    const submitButton = modal.querySelector('button[type="submit"]');
    
    if (!titleInput || !submitButton) {
        console.error('❌ Elementos não encontrados!');
        return;
    }
    
    // Capturar valores originais
    const originalData = {
        title: titleInput.value,
        description: descriptionInput?.value || ''
    };
    
    console.log('📋 Dados originais:', originalData);
    
    // Criar dados de teste
    const timestamp = new Date().toLocaleTimeString();
    const testData = {
        title: originalData.title + ` [EDITADO ${timestamp}]`,
        description: originalData.description + ` [EDITADO EM ${timestamp}]`
    };
    
    console.log('📝 Dados de teste:', testData);
    
    // Limpar log de requisições
    requestLog = [];\n    
    // Alterar dados
    titleInput.value = testData.title;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    if (descriptionInput) {
        descriptionInput.value = testData.description;
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
        descriptionInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    console.log('✅ Dados alterados no formulário');
    console.log('⏳ Aguardando 2 segundos para submeter...');
    
    // Submeter após delay
    setTimeout(() => {
        console.log('🚀 SUBMETENDO EDIÇÃO...');
        
        if (submitButton.disabled) {
            console.error('❌ Botão submit está desabilitado!');
            return;
        }
        
        submitButton.click();
        
        // Verificar resultado
        setTimeout(() => {
            console.log('\n📊 RESULTADO DO TESTE:');
            console.log('- Requisições enviadas:', requestLog.length);
            
            if (requestLog.length === 0) {
                console.error('❌ NENHUMA REQUISIÇÃO FOI ENVIADA!');
                console.log('💡 Possíveis problemas:');
                console.log('  - Formulário não está conectado ao React');
                console.log('  - Event handlers não estão funcionando');
                console.log('  - Validação está bloqueando o submit');
            } else {
                console.log('✅ Requisições enviadas:');
                requestLog.forEach((req, index) => {
                    console.log(`  ${index + 1}. ${req.method} ${req.url}`);
                    if (req.body) {
                        console.log('     Dados:', req.body);
                    }
                });
            }
            
            // Verificar se modal fechou
            const modalStillOpen = document.querySelector('[role="dialog"]');
            if (!modalStillOpen) {
                console.log('✅ SUCESSO! Modal fechou - edição foi salva!');
            } else {
                console.log('⚠️ Modal ainda está aberto');
                
                // Verificar erros
                const errors = modal.querySelectorAll('.text-red-500, [class*="error"]');
                if (errors.length > 0) {
                    console.log('❌ Erros encontrados:');
                    errors.forEach((error, i) => {
                        console.log(`  ${i + 1}. ${error.textContent}`);
                    });
                }
            }
            
        }, 8000);
        
    }, 2000);
}

// Função para verificar estado atual
function verificarEstadoAtual() {
    console.log('\n🔍 VERIFICANDO ESTADO ATUAL...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.log('❌ Nenhum modal aberto');
        return;
    }
    
    const title = modal.querySelector('h2, [role="heading"]');
    const titleInput = modal.querySelector('#title');
    const submitButton = modal.querySelector('button[type="submit"]');
    
    console.log('📋 Estado atual:');
    console.log('- Título do modal:', title?.textContent || 'N/A');
    console.log('- Título do incidente:', titleInput?.value || 'N/A');
    console.log('- Botão submit:', submitButton?.textContent || 'N/A');
    console.log('- Botão habilitado:', !submitButton?.disabled);
    
    // Verificar se há dados React
    const hasReactProps = titleInput && Object.keys(titleInput).some(key => key.startsWith('__react'));
    console.log('- React conectado:', hasReactProps);
}

// Disponibilizar funções
window.testarEdicaoEspecifica = testarEdicaoEspecifica;
window.verificarEstadoAtual = verificarEstadoAtual;

console.log('\n🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- testarEdicaoEspecifica() - Testa edição completa');
console.log('- verificarEstadoAtual() - Verifica estado do modal');
console.log('\n💡 INSTRUÇÕES:');
console.log('1. Abra um modal de EDIÇÃO (clique em "Editar" em um incidente)');
console.log('2. Execute: testarEdicaoEspecifica()');
console.log('3. Aguarde o teste automático');
console.log('\n🔍 Monitoramento ativo!');