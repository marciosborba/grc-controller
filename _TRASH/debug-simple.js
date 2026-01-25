// 🔧 DEBUG SCRIPT SIMPLIFICADO PARA MODAL DE INCIDENTES
// 
// Este script testa o modal reescrito com a estrutura correta da tabela incidents
//
// COMO USAR:
// 1. Abra o modal de edição de um incidente
// 2. Cole este código no console do navegador
// 3. Execute as funções de teste

console.log('🔧 DEBUG SCRIPT SIMPLIFICADO CARREGADO!');

// Interceptar requisições do Supabase
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const [url, options] = args;
    
    // Detectar requisições do Supabase
    if (typeof url === 'string' && url.includes('supabase')) {
        console.log('🌐 REQUISIÇÃO SUPABASE:', {
            url: url,
            method: options?.method || 'GET',
            timestamp: new Date().toISOString()
        });
        
        if (options?.body) {
            try {
                const bodyData = JSON.parse(options.body);
                console.log('📤 DADOS ENVIADOS:', bodyData);
            } catch (e) {
                console.log('📤 BODY (raw):', options.body);
            }
        }
    }
    
    return originalFetch.apply(this, args).then(response => {
        if (typeof url === 'string' && url.includes('supabase')) {
            console.log('📥 RESPOSTA SUPABASE:', {
                url: url,
                status: response.status,
                ok: response.ok,
                timestamp: new Date().toISOString()
            });
        }
        return response;
    });
};

// Função para testar o modal
function testarModal() {
    console.log('\n🧪 TESTANDO MODAL...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return;
    }
    
    console.log('✅ Modal encontrado');
    
    // Verificar campos principais
    const titleInput = modal.querySelector('#title');
    const descriptionInput = modal.querySelector('#description');
    const submitButton = modal.querySelector('button[type="submit"]');
    
    if (!titleInput || !submitButton) {
        console.error('❌ Elementos do formulário não encontrados!');
        return;
    }
    
    console.log('✅ Elementos do formulário encontrados');
    
    // Preencher dados de teste
    const testTitle = 'Teste Modal Simplificado - ' + new Date().toLocaleTimeString();
    
    titleInput.value = testTitle;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    if (descriptionInput) {
        descriptionInput.value = 'Descrição de teste para verificar se o modal está funcionando corretamente.';
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
        descriptionInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    console.log('✅ Dados preenchidos');
    console.log('🎯 Clique em "Salvar" para testar a submissão');
}

// Função para verificar estado do modal
function verificarModal() {
    console.log('\n🔍 VERIFICANDO ESTADO DO MODAL...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.log('❌ Nenhum modal aberto');
        return;
    }
    
    const titleInput = modal.querySelector('#title');
    const descriptionInput = modal.querySelector('#description');
    const categorySelect = modal.querySelector('select, [role="combobox"]');
    const submitButton = modal.querySelector('button[type="submit"]');
    
    console.log('📋 Estado do modal:');
    console.log('- Título:', titleInput?.value || 'vazio');
    console.log('- Descrição:', descriptionInput?.value || 'vazio');
    console.log('- Categoria:', categorySelect?.textContent?.trim() || 'não selecionada');
    console.log('- Botão submit:', submitButton?.textContent?.trim() || 'não encontrado');
    console.log('- Botão habilitado:', !submitButton?.disabled);
}

// Função para submeter automaticamente
function submeterAutomatico() {
    console.log('\n🚀 SUBMETENDO AUTOMATICAMENTE...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return;
    }
    
    const submitButton = modal.querySelector('button[type="submit"]');
    if (!submitButton) {
        console.error('❌ Botão submit não encontrado!');
        return;
    }
    
    if (submitButton.disabled) {
        console.error('❌ Botão submit está desabilitado!');
        return;
    }
    
    console.log('🖱️ Clicando no botão submit...');
    submitButton.click();
}

// Disponibilizar funções globalmente
window.testarModal = testarModal;
window.verificarModal = verificarModal;
window.submeterAutomatico = submeterAutomatico;

console.log('\n🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- testarModal() - Preenche formulário com dados de teste');
console.log('- verificarModal() - Mostra estado atual do modal');
console.log('- submeterAutomatico() - Submete o formulário automaticamente');
console.log('\n✅ Monitoramento de requisições Supabase ativo!');
console.log('📱 Abra um modal de incidente e execute as funções de teste.');