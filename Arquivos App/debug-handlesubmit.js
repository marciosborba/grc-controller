// 🔍 DEBUG ESPECÍFICO PARA handleSubmit
// Este script vai verificar por que handleSubmit não está sendo chamado

console.log('🔍 DEBUG ESPECÍFICO PARA handleSubmit');

// Verificar se o modal está usando o componente correto
function verificarComponenteModal() {
    console.log('\n🔍 VERIFICANDO COMPONENTE DO MODAL...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ Modal não encontrado!');
        return;
    }
    
    // Verificar se é o IncidentEditModal
    const form = modal.querySelector('form');
    if (!form) {
        console.error('❌ Formulário não encontrado!');
        return;
    }
    
    // Verificar se há React props no formulário
    const reactProps = Object.keys(form).filter(key => key.startsWith('__react'));
    console.log('⚛️ React props no form:', reactProps.length > 0);
    
    if (reactProps.length > 0) {
        const reactInternalInstance = form[reactProps[0]];
        console.log('⚛️ React instance encontrada:', !!reactInternalInstance);
        
        // Tentar encontrar o componente
        let currentFiber = reactInternalInstance;
        let componentName = 'Desconhecido';
        
        // Navegar pela árvore React para encontrar o componente
        while (currentFiber) {
            if (currentFiber.type && typeof currentFiber.type === 'function') {
                componentName = currentFiber.type.name || currentFiber.type.displayName || 'Componente Anônimo';
                break;
            }
            currentFiber = currentFiber.return;
        }
        
        console.log('📱 Componente detectado:', componentName);
        
        // Verificar se há onSubmit
        const hasOnSubmit = form.onsubmit || form.getAttribute('onsubmit');
        console.log('📝 Form tem onSubmit:', !!hasOnSubmit);
        
        // Verificar event listeners
        const listeners = getEventListeners ? getEventListeners(form) : 'Função não disponível';
        console.log('👂 Event listeners:', listeners);
        
    } else {
        console.warn('⚠️ Nenhuma React prop encontrada no formulário!');
        console.log('💡 Isso pode indicar que o componente não está renderizado corretamente');
    }
    
    // Verificar se o botão submit está dentro do form
    const submitButton = modal.querySelector('button[type="submit"]');
    const buttonInForm = form.contains(submitButton);
    console.log('🔗 Botão submit está dentro do form:', buttonInForm);
    
    // Verificar se há outros forms
    const allForms = modal.querySelectorAll('form');
    console.log('📋 Total de forms no modal:', allForms.length);
    
    return { form, submitButton, buttonInForm };
}

// Função para interceptar e debugar o submit
function interceptarSubmit() {
    console.log('\n🎯 INTERCEPTANDO EVENTOS DE SUBMIT...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) return;
    
    const form = modal.querySelector('form');
    if (!form) return;
    
    // Adicionar listener direto no form
    form.addEventListener('submit', function(event) {
        console.log('📝 SUBMIT INTERCEPTADO DIRETAMENTE:', {
            event: event,
            target: event.target,
            currentTarget: event.currentTarget,
            defaultPrevented: event.defaultPrevented,
            timestamp: new Date().toISOString()
        });
        
        // NÃO prevenir o evento, apenas logar
    }, true);
    
    console.log('✅ Listener de submit adicionado diretamente ao form');
}

// Função para simular submit programaticamente
function simularSubmitProgramatico() {
    console.log('\n🤖 SIMULANDO SUBMIT PROGRAMÁTICO...');
    
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) return;
    
    const form = modal.querySelector('form');
    if (!form) return;
    
    // Tentar diferentes métodos de submit
    console.log('1️⃣ Tentando form.submit()...');
    try {
        form.submit();
        console.log('✅ form.submit() executado');
    } catch (error) {
        console.error('❌ Erro em form.submit():', error);
    }
    
    setTimeout(() => {
        console.log('2️⃣ Tentando dispatchEvent submit...');
        try {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            form.dispatchEvent(submitEvent);
            console.log('✅ dispatchEvent submit executado');
        } catch (error) {
            console.error('❌ Erro em dispatchEvent:', error);
        }
    }, 2000);
    
    setTimeout(() => {
        console.log('3️⃣ Tentando HTMLFormElement.prototype.submit...');
        try {
            HTMLFormElement.prototype.submit.call(form);
            console.log('✅ HTMLFormElement.prototype.submit executado');
        } catch (error) {
            console.error('❌ Erro em HTMLFormElement.prototype.submit:', error);
        }
    }, 4000);
}

// Função para verificar se há erros JavaScript
function verificarErrosJavaScript() {
    console.log('\n🐛 VERIFICANDO ERROS JAVASCRIPT...');
    
    // Interceptar erros
    const originalError = window.onerror;
    const originalUnhandledRejection = window.onunhandledrejection;
    
    window.onerror = function(message, source, lineno, colno, error) {
        console.error('🐛 ERRO JAVASCRIPT DETECTADO:', {
            message,
            source,
            lineno,
            colno,
            error
        });
        
        if (originalError) {
            return originalError.apply(this, arguments);
        }
    };
    
    window.onunhandledrejection = function(event) {
        console.error('🐛 PROMISE REJECTION DETECTADA:', event.reason);
        
        if (originalUnhandledRejection) {
            return originalUnhandledRejection.apply(this, arguments);
        }
    };
    
    console.log('✅ Interceptação de erros ativada');
}

// Executar todas as verificações
verificarErrosJavaScript();
const modalInfo = verificarComponenteModal();
interceptarSubmit();

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Clique no botão "Atualizar Incidente" manualmente');
console.log('2. Observe os logs de submit interceptado');
console.log('3. Execute simularSubmitProgramatico() se necessário');

// Disponibilizar função
window.simularSubmitProgramatico = simularSubmitProgramatico;

console.log('\n📱 MONITORAMENTO ATIVO - Clique no botão agora!');