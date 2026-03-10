// 🚀 TESTE IMEDIATO DO MODAL DE INCIDENTES
// 
// Execute este script no console para testar o modal agora mesmo

console.log('🚀 INICIANDO TESTE IMEDIATO DO MODAL...');

// Interceptar requisições
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const [url, options] = args;
    
    if (typeof url === 'string' && url.includes('supabase')) {
        console.log('🌐 REQUISIÇÃO:', {
            url: url.split('?')[0],
            method: options?.method || 'GET',
            timestamp: new Date().toLocaleTimeString()
        });
        
        if (options?.body) {
            try {
                const bodyData = JSON.parse(options.body);
                console.log('📤 DADOS:', bodyData);
            } catch (e) {
                console.log('📤 BODY:', options.body);
            }
        }
    }
    
    return originalFetch.apply(this, args).then(response => {
        if (typeof url === 'string' && url.includes('supabase')) {
            console.log('📥 RESPOSTA:', {
                status: response.status,
                ok: response.ok,
                timestamp: new Date().toLocaleTimeString()
            });
        }
        return response;
    });
};

// Função para testar agora
function testarAgora() {
    console.log('\n🧪 TESTANDO MODAL AGORA...');
    
    // Procurar modal
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.log('❌ Modal não está aberto. Abra um modal primeiro!');
        console.log('💡 Dica: Clique em "Novo Incidente" ou "Editar" em um incidente');
        return;
    }
    
    console.log('✅ Modal encontrado!');
    
    // Procurar elementos
    const titleInput = modal.querySelector('#title');
    const descriptionInput = modal.querySelector('#description');
    const submitButton = modal.querySelector('button[type="submit"]');
    
    if (!titleInput || !submitButton) {
        console.log('❌ Elementos não encontrados no modal');
        return;
    }
    
    console.log('✅ Elementos encontrados!');
    
    // Preencher dados
    const testData = {
        title: 'TESTE MODAL - ' + new Date().toLocaleTimeString(),
        description: 'Teste automático do modal reescrito'
    };
    
    console.log('📝 Preenchendo dados:', testData);
    
    // Preencher título
    titleInput.value = testData.title;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Preencher descrição
    if (descriptionInput) {
        descriptionInput.value = testData.description;
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
        descriptionInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    console.log('✅ Dados preenchidos!');
    console.log('🎯 Aguarde 2 segundos e o formulário será submetido...');
    
    // Submeter após 2 segundos
    setTimeout(() => {
        console.log('🖱️ Clicando em submit...');
        submitButton.click();
        
        // Verificar se funcionou após 5 segundos
        setTimeout(() => {
            const modalStillOpen = document.querySelector('[role="dialog"]');
            if (!modalStillOpen) {
                console.log('✅ SUCESSO! Modal fechou - dados foram salvos!');
            } else {
                console.log('⚠️ Modal ainda está aberto - verifique se houve erro');
            }
        }, 5000);
    }, 2000);
}

// Executar automaticamente
testarAgora();

console.log('\n📱 Se o modal não estiver aberto, abra um e execute testarAgora() novamente');
console.log('🔍 Monitore o console para ver as requisições Supabase');