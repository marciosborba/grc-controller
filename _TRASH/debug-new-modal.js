// 🔧 DEBUG SCRIPT PARA O NOVO MODAL DE INCIDENTES
// 
// Este script testa o novo modal IncidentEditModal que foi reescrito
// para garantir conexão direta com o banco de dados Supabase.
//
// COMO USAR:
// 1. Abra o modal de edição de um incidente
// 2. Cole este código no console do navegador
// 3. Execute as funções de teste

console.log('🔧 DEBUG SCRIPT PARA NOVO MODAL CARREGADO!');

// Interceptar requisições do Supabase
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const [url, options] = args;
    
    // Detectar requisições do Supabase
    if (typeof url === 'string' && (url.includes('supabase') || url.includes('incidents'))) {
        console.log('🌐 REQUISIÇÃO SUPABASE:', {
            url: url,
            method: options?.method || 'GET',
            hasBody: !!options?.body,
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
        if (typeof url === 'string' && (url.includes('supabase') || url.includes('incidents'))) {
            console.log('📥 RESPOSTA SUPABASE:', {
                url: url,
                status: response.status,
                ok: response.ok,
                statusText: response.statusText,
                timestamp: new Date().toISOString()
            });
        }
        return response;
    }).catch(error => {
        if (typeof url === 'string' && (url.includes('supabase') || url.includes('incidents'))) {
            console.error('❌ ERRO SUPABASE:', {
                url: url,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
        throw error;
    });
};

// Função para testar o novo modal
function testarNovoModal() {
    console.log('\n🧪 TESTANDO NOVO MODAL...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return;
    }
    
    console.log('✅ Modal encontrado:', modal);
    
    // Verificar se é o novo modal
    const titleInput = modal.querySelector('#title');
    const submitButton = modal.querySelector('button[type="submit"]');
    const form = modal.querySelector('form');
    
    if (!titleInput || !submitButton || !form) {
        console.error('❌ Elementos do formulário não encontrados!');
        return;
    }
    
    console.log('✅ Elementos do formulário encontrados:');
    console.log('- Input título:', titleInput);
    console.log('- Botão submit:', submitButton);
    console.log('- Formulário:', form);
    
    // Verificar se há event listeners React
    const hasReactProps = Object.keys(titleInput).some(key => key.startsWith('__react'));
    console.log('- React props detectadas:', hasReactProps);
    
    // Alterar título para teste
    const originalTitle = titleInput.value;
    const testTitle = originalTitle + ' [TESTE NOVO MODAL]';
    
    console.log('📝 Alterando título de:', originalTitle);
    console.log('📝 Para:', testTitle);
    
    // Simular input do usuário
    titleInput.focus();
    titleInput.value = testTitle;
    
    // Disparar eventos React
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    console.log('✅ Título alterado, aguardando 2 segundos...');
    
    setTimeout(() => {
        console.log('🖱️ Clicando no botão submit...');
        submitButton.click();
        
        // Restaurar título após 10 segundos
        setTimeout(() => {
            if (titleInput.value === testTitle) {
                titleInput.value = originalTitle;
                titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                console.log('🔄 Título restaurado para:', originalTitle);
            }
        }, 10000);
    }, 2000);
}

// Função para verificar estado do modal
function verificarEstadoModal() {
    console.log('\n🔍 VERIFICANDO ESTADO DO MODAL...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.log('❌ Nenhum modal aberto');
        return;
    }
    
    const form = modal.querySelector('form');
    const inputs = modal.querySelectorAll('input, textarea, select');
    const buttons = modal.querySelectorAll('button');
    
    console.log('📋 Estado do modal:');
    console.log('- Modal ID:', modal.id);
    console.log('- Formulário presente:', !!form);
    console.log('- Número de inputs:', inputs.length);
    console.log('- Número de botões:', buttons.length);
    
    // Verificar valores dos campos principais
    const titleInput = modal.querySelector('#title');
    const descriptionInput = modal.querySelector('#description');
    
    if (titleInput) {
        console.log('- Título atual:', titleInput.value);
    }
    
    if (descriptionInput) {
        console.log('- Descrição atual:', descriptionInput.value);
    }
    
    // Verificar botões
    buttons.forEach((button, index) => {
        console.log(`- Botão ${index + 1}:`, {
            text: button.textContent?.trim(),
            type: button.type,
            disabled: button.disabled
        });
    });
}

// Função para simular preenchimento completo do formulário
function preencherFormularioCompleto() {
    console.log('\n📝 PREENCHENDO FORMULÁRIO COMPLETO...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return;
    }
    
    // Dados de teste
    const dadosTeste = {
        title: 'Incidente de Teste - ' + new Date().toLocaleTimeString(),
        description: 'Descrição detalhada do incidente de teste criado via debug script.',
        affected_systems: 'Sistema A, Sistema B, Sistema C',
        business_impact: 'Impacto moderado nas operações de teste.'
    };
    
    // Preencher campos de texto
    Object.entries(dadosTeste).forEach(([field, value]) => {
        const input = modal.querySelector(`#${field}`);
        if (input) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`✅ Campo ${field} preenchido:`, value);
        } else {
            console.log(`⚠️ Campo ${field} não encontrado`);
        }
    });
    
    console.log('✅ Formulário preenchido com dados de teste!');
    console.log('🎯 Agora você pode clicar em "Salvar" para testar a submissão.');
}

// Disponibilizar funções globalmente
window.testarNovoModal = testarNovoModal;
window.verificarEstadoModal = verificarEstadoModal;
window.preencherFormularioCompleto = preencherFormularioCompleto;

console.log('\n🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- testarNovoModal() - Testa alteração e submissão automática');
console.log('- verificarEstadoModal() - Mostra estado atual do modal');
console.log('- preencherFormularioCompleto() - Preenche formulário com dados de teste');
console.log('\n✅ Monitoramento de requisições Supabase ativo!');
console.log('📱 Abra um modal de incidente e execute as funções de teste.');