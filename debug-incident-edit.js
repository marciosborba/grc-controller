// 🔍 DEBUG ESPECÍFICO PARA EDIÇÃO DE INCIDENTES
// 
// Este script vai diagnosticar exatamente onde está o problema

console.log('🔍 INICIANDO DEBUG ESPECÍFICO PARA EDIÇÃO...');

// Interceptar todas as requisições
const originalFetch = window.fetch;
let requestCount = 0;

window.fetch = function(...args) {
    const [url, options] = args;
    requestCount++;
    const requestId = requestCount;
    
    console.log(`🌐 REQUISIÇÃO #${requestId}:`, {
        url: typeof url === 'string' ? url.split('?')[0] : url,
        method: options?.method || 'GET',
        timestamp: new Date().toISOString(),
        hasBody: !!options?.body
    });
    
    if (options?.body) {
        try {
            const bodyData = JSON.parse(options.body);
            console.log(`📤 DADOS #${requestId}:`, bodyData);
        } catch (e) {
            console.log(`📤 BODY #${requestId}:`, options.body);
        }
    }
    
    return originalFetch.apply(this, args).then(response => {
        console.log(`📥 RESPOSTA #${requestId}:`, {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
        });
        
        // Clonar resposta para ler o body
        const responseClone = response.clone();
        responseClone.text().then(text => {
            if (text && text.length < 1000) {
                try {
                    const jsonData = JSON.parse(text);
                    console.log(`📋 RESPOSTA BODY #${requestId}:`, jsonData);
                } catch (e) {
                    console.log(`📋 RESPOSTA TEXT #${requestId}:`, text.substring(0, 200));
                }
            }
        }).catch(() => {});
        
        return response;
    }).catch(error => {
        console.error(`❌ ERRO #${requestId}:`, error);
        throw error;
    });
};

// Função para debug completo do modal
function debugModalCompleto() {
    console.log('\n🔍 INICIANDO DEBUG COMPLETO DO MODAL...');
    
    // 1. Verificar se modal está aberto
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ MODAL NÃO ENCONTRADO!');
        console.log('💡 Abra um modal de edição de incidente primeiro');
        return;
    }
    
    console.log('✅ Modal encontrado:', modal);
    
    // 2. Verificar elementos do formulário
    const form = modal.querySelector('form');
    const titleInput = modal.querySelector('#title');
    const descriptionInput = modal.querySelector('#description');
    const submitButton = modal.querySelector('button[type="submit"]');
    
    console.log('📋 Elementos do formulário:');
    console.log('- Form:', !!form);
    console.log('- Title input:', !!titleInput);
    console.log('- Description input:', !!descriptionInput);
    console.log('- Submit button:', !!submitButton);
    
    if (!form || !titleInput || !submitButton) {
        console.error('❌ ELEMENTOS ESSENCIAIS NÃO ENCONTRADOS!');
        return;
    }
    
    // 3. Verificar valores atuais
    console.log('📝 Valores atuais:');
    console.log('- Título:', titleInput.value);
    console.log('- Descrição:', descriptionInput?.value || 'N/A');
    console.log('- Submit habilitado:', !submitButton.disabled);
    
    // 4. Verificar event listeners
    const hasReactProps = Object.keys(form).some(key => key.startsWith('__react'));
    console.log('⚛️ React props detectadas:', hasReactProps);
    
    // 5. Alterar dados para teste
    const originalTitle = titleInput.value;
    const testTitle = originalTitle + ' [EDITADO - ' + new Date().toLocaleTimeString() + ']';
    
    console.log('🔄 Alterando título para teste...');
    console.log('- De:', originalTitle);
    console.log('- Para:', testTitle);
    
    // Simular input do usuário
    titleInput.focus();
    titleInput.value = testTitle;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Alterar descrição também
    if (descriptionInput) {
        const originalDesc = descriptionInput.value;
        const testDesc = originalDesc + ' [EDITADO EM ' + new Date().toLocaleTimeString() + ']';
        descriptionInput.value = testDesc;
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
        descriptionInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('🔄 Descrição alterada de:', originalDesc);
        console.log('🔄 Para:', testDesc);
    }
    
    console.log('✅ Dados alterados! Aguardando 3 segundos para submeter...');
    
    // 6. Submeter após delay
    setTimeout(() => {
        console.log('🚀 SUBMETENDO FORMULÁRIO...');
        
        // Verificar se ainda está habilitado
        if (submitButton.disabled) {
            console.error('❌ Botão submit está desabilitado!');
            return;
        }
        
        // Clicar no botão
        submitButton.click();
        
        // Verificar resultado após 10 segundos
        setTimeout(() => {
            const modalStillOpen = document.querySelector('[role="dialog"]');
            if (!modalStillOpen) {
                console.log('✅ SUCESSO! Modal fechou - edição foi salva!');
            } else {
                console.log('⚠️ Modal ainda está aberto - pode ter havido erro');
                
                // Verificar se há mensagens de erro
                const errorMessages = modal.querySelectorAll('.text-red-500, [class*="error"]');
                if (errorMessages.length > 0) {
                    console.log('❌ Erros encontrados no formulário:');
                    errorMessages.forEach((error, index) => {
                        console.log(`- Erro ${index + 1}:`, error.textContent);
                    });
                }
            }
        }, 10000);
        
    }, 3000);
}

// Função para verificar permissões
function verificarPermissoes() {
    console.log('\n🔐 VERIFICANDO PERMISSÕES...');
    
    // Verificar se usuário está logado
    const userInfo = window.localStorage.getItem('supabase.auth.token') || 
                    window.sessionStorage.getItem('supabase.auth.token');
    
    console.log('👤 Token de autenticação:', userInfo ? 'Presente' : 'Ausente');
    
    // Verificar tenant
    const tenantInfo = window.localStorage.getItem('currentTenant') ||
                      window.sessionStorage.getItem('currentTenant');
    
    console.log('🏢 Tenant atual:', tenantInfo ? 'Configurado' : 'Não configurado');
    
    if (tenantInfo) {
        try {
            const tenant = JSON.parse(tenantInfo);
            console.log('🏢 Tenant ID:', tenant.id || tenant.tenant_id || 'N/A');
        } catch (e) {
            console.log('🏢 Tenant (raw):', tenantInfo);
        }
    }
}

// Função para testar conexão Supabase
async function testarConexaoSupabase() {
    console.log('\n🔌 TESTANDO CONEXÃO SUPABASE...');
    
    try {
        // Tentar uma query simples
        const response = await fetch('/rest/v1/', {
            method: 'GET',
            headers: {
                'apikey': 'sua-api-key-aqui', // Será substituída automaticamente
                'Authorization': 'Bearer ' + (window.localStorage.getItem('supabase.auth.token') || ''),
                'Content-Type': 'application/json'
            }
        });
        
        console.log('🔌 Conexão Supabase:', response.ok ? 'OK' : 'ERRO');
        console.log('🔌 Status:', response.status);
        
    } catch (error) {
        console.error('🔌 Erro de conexão:', error);
    }
}

// Executar verificações
verificarPermissoes();
testarConexaoSupabase();

// Disponibilizar função principal
window.debugModalCompleto = debugModalCompleto;

console.log('\n🎯 FUNÇÕES DISPONÍVEIS:');
console.log('- debugModalCompleto() - Debug completo do modal');
console.log('\n💡 INSTRUÇÕES:');
console.log('1. Abra um modal de EDIÇÃO de incidente');
console.log('2. Execute: debugModalCompleto()');
console.log('3. Aguarde o teste automático');
console.log('\n🔍 Monitoramento de requisições ativo!');