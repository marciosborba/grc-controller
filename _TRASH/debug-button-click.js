// 🔍 DEBUG ESPECÍFICO PARA CLIQUE DO BOTÃO "ATUALIZAR INCIDENTE"
// 
// Este script vai monitorar exatamente o que acontece quando o botão é clicado

console.log('🔍 DEBUG ESPECÍFICO PARA BOTÃO "ATUALIZAR INCIDENTE"');

// Interceptar TODAS as requisições
const originalFetch = window.fetch;
let allRequests = [];

window.fetch = function(...args) {
    const [url, options] = args;
    const requestInfo = {
        id: Date.now(),
        url: typeof url === 'string' ? url : url.toString(),
        method: options?.method || 'GET',
        timestamp: new Date().toISOString(),
        body: null,
        headers: options?.headers || {}
    };
    
    if (options?.body) {
        try {
            requestInfo.body = JSON.parse(options.body);
        } catch (e) {
            requestInfo.body = options.body.toString();
        }
    }
    
    allRequests.push(requestInfo);
    
    console.log(`🌐 REQUISIÇÃO #${requestInfo.id}:`, {
        method: requestInfo.method,
        url: requestInfo.url.split('?')[0],
        hasBody: !!requestInfo.body,
        timestamp: requestInfo.timestamp
    });
    
    if (requestInfo.body) {
        console.log(`📤 DADOS #${requestInfo.id}:`, requestInfo.body);
    }
    
    return originalFetch.apply(this, args).then(response => {
        console.log(`📥 RESPOSTA #${requestInfo.id}:`, {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        if (!response.ok) {
            response.clone().text().then(errorText => {
                console.error(`❌ ERRO #${requestInfo.id}:`, errorText);
            }).catch(() => {});
        }
        
        return response;
    }).catch(error => {
        console.error(`❌ ERRO REQUISIÇÃO #${requestInfo.id}:`, error);
        throw error;
    });
};

// Interceptar eventos de submit
document.addEventListener('submit', function(event) {
    console.log('📝 EVENTO SUBMIT DETECTADO:', {
        target: event.target,
        timestamp: new Date().toISOString(),
        preventDefault: event.defaultPrevented
    });
}, true);

// Interceptar cliques em botões
document.addEventListener('click', function(event) {
    const target = event.target;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        const buttonText = button.textContent?.trim();
        
        if (buttonText && (buttonText.includes('Atualizar') || buttonText.includes('Salvar') || buttonText.includes('Criar'))) {
            console.log('🖱️ CLIQUE EM BOTÃO DETECTADO:', {
                text: buttonText,
                type: button.type,
                disabled: button.disabled,
                form: button.form,
                timestamp: new Date().toISOString()
            });
            
            // Verificar se está dentro de um modal
            const modal = button.closest('[role="dialog"]');
            if (modal) {
                console.log('📱 Botão está dentro do modal:', modal);
                
                // Verificar dados do formulário
                const form = button.closest('form') || modal.querySelector('form');
                if (form) {
                    console.log('📋 Formulário encontrado:', form);
                    
                    const formData = new FormData(form);
                    const formObject = {};
                    for (let [key, value] of formData.entries()) {
                        formObject[key] = value;
                    }
                    console.log('📝 Dados do formulário (FormData):', formObject);
                    
                    // Verificar inputs específicos
                    const titleInput = form.querySelector('#title');
                    const descriptionInput = form.querySelector('#description');
                    
                    if (titleInput) {
                        console.log('📝 Título atual:', titleInput.value);
                    }
                    if (descriptionInput) {
                        console.log('📝 Descrição atual:', descriptionInput.value);
                    }
                }
            }
        }
    }
}, true);

// Função para debug completo do estado atual
function debugEstadoCompleto() {
    console.log('\n🔍 DEBUG COMPLETO DO ESTADO ATUAL...');
    
    // Verificar modal
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ Nenhum modal encontrado!');
        return;
    }
    
    console.log('✅ Modal encontrado');
    
    // Verificar título do modal
    const modalTitle = modal.querySelector('h2, [role="heading"]');
    console.log('📱 Título do modal:', modalTitle?.textContent || 'N/A');
    
    // Verificar formulário
    const form = modal.querySelector('form');
    if (!form) {
        console.error('❌ Formulário não encontrado no modal!');
        return;
    }
    
    console.log('✅ Formulário encontrado');
    
    // Verificar elementos do formulário
    const elements = {
        titleInput: form.querySelector('#title'),
        descriptionInput: form.querySelector('#description'),
        categorySelect: form.querySelector('[name="category"], #category'),
        prioritySelect: form.querySelector('[name="priority"], #priority'),
        statusSelect: form.querySelector('[name="status"], #status'),
        submitButton: form.querySelector('button[type="submit"]'),
        allButtons: form.querySelectorAll('button')
    };
    
    console.log('📋 Elementos do formulário:');
    Object.entries(elements).forEach(([key, element]) => {
        if (key === 'allButtons') {
            console.log(`- ${key}:`, Array.from(element).map(btn => ({
                text: btn.textContent?.trim(),
                type: btn.type,
                disabled: btn.disabled
            })));
        } else {
            console.log(`- ${key}:`, element ? {
                value: element.value || element.textContent?.trim(),
                disabled: element.disabled
            } : 'NÃO ENCONTRADO');
        }
    });
    
    // Verificar event listeners React
    const hasReactProps = elements.titleInput && Object.keys(elements.titleInput).some(key => key.startsWith('__react'));
    console.log('⚛️ React props detectadas:', hasReactProps);
    
    // Verificar se há erros visíveis
    const errors = modal.querySelectorAll('.text-red-500, [class*="error"], .error');
    if (errors.length > 0) {
        console.log('❌ Erros visíveis no modal:');
        errors.forEach((error, i) => {
            console.log(`  ${i + 1}. ${error.textContent?.trim()}`);
        });
    } else {
        console.log('✅ Nenhum erro visível no modal');
    }
    
    // Limpar log de requisições para novo teste
    allRequests = [];
    console.log('🧹 Log de requisições limpo para novo teste');
}

// Função para simular clique no botão
function simularCliqueAtualizar() {
    console.log('\n🖱️ SIMULANDO CLIQUE NO BOTÃO ATUALIZAR...');
    
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
    
    console.log('✅ Botão encontrado:', {
        text: submitButton.textContent?.trim(),
        disabled: submitButton.disabled,
        type: submitButton.type
    });
    
    if (submitButton.disabled) {
        console.error('❌ Botão está desabilitado!');
        return;
    }
    
    // Limpar log antes do teste
    allRequests = [];
    
    console.log('🖱️ Clicando no botão...');
    submitButton.click();
    
    // Verificar resultado após 5 segundos
    setTimeout(() => {
        console.log('\n📊 RESULTADO APÓS 5 SEGUNDOS:');
        console.log('- Total de requisições:', allRequests.length);
        
        if (allRequests.length === 0) {
            console.error('❌ NENHUMA REQUISIÇÃO FOI ENVIADA!');
            console.log('💡 Possíveis problemas:');
            console.log('  1. Event handler não está conectado');
            console.log('  2. Validação está bloqueando o submit');
            console.log('  3. Erro JavaScript está impedindo a execução');
            console.log('  4. React não está processando o evento');
        } else {
            console.log('✅ Requisições enviadas:');
            allRequests.forEach((req, i) => {
                console.log(`  ${i + 1}. ${req.method} ${req.url.split('?')[0]}`);
                if (req.body) {
                    console.log(`     Body:`, req.body);
                }
            });
        }
        
        // Verificar se modal ainda está aberto
        const modalStillOpen = document.querySelector('[role="dialog"]');
        if (!modalStillOpen) {
            console.log('✅ SUCESSO! Modal fechou');
        } else {
            console.log('⚠️ Modal ainda está aberto');
        }
        
    }, 5000);
}

// Disponibilizar funções
window.debugEstadoCompleto = debugEstadoCompleto;
window.simularCliqueAtualizar = simularCliqueAtualizar;

console.log('\n🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- debugEstadoCompleto() - Analisa estado completo do modal');
console.log('- simularCliqueAtualizar() - Simula clique no botão e monitora resultado');
console.log('\n💡 INSTRUÇÕES:');
console.log('1. Abra um modal de EDIÇÃO de incidente');
console.log('2. Execute: debugEstadoCompleto()');
console.log('3. Execute: simularCliqueAtualizar()');
console.log('4. Aguarde 5 segundos para ver o resultado');
console.log('\n🔍 Monitoramento de cliques e requisições ativo!');