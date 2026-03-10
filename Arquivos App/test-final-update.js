// 🎯 TESTE FINAL PARA BOTÃO "ATUALIZAR INCIDENTE"
// 
// Este script vai testar especificamente o botão de atualização

console.log('🎯 TESTE FINAL PARA BOTÃO "ATUALIZAR INCIDENTE"');
console.log('📅 Timestamp:', new Date().toISOString());

// Interceptar TODAS as requisições
const originalFetch = window.fetch;
let requestLog = [];

window.fetch = function(...args) {
    const [url, options] = args;
    const requestInfo = {
        id: Date.now() + Math.random(),
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
    
    requestLog.push(requestInfo);
    
    console.log(`🌐 REQUISIÇÃO #${requestInfo.id}:`, {
        method: requestInfo.method,
        url: requestInfo.url.split('?')[0],
        timestamp: requestInfo.timestamp
    });
    
    if (requestInfo.body && typeof requestInfo.body === 'object') {
        console.log(`📤 DADOS #${requestInfo.id}:`, requestInfo.body);
    }
    
    return originalFetch.apply(this, args).then(response => {
        console.log(`📥 RESPOSTA #${requestInfo.id}:`, {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });
        
        // Ler resposta para debug
        if (!response.ok) {
            response.clone().text().then(errorText => {
                console.error(`❌ ERRO RESPOSTA #${requestInfo.id}:`, errorText);
            }).catch(() => {});
        } else {
            response.clone().json().then(jsonData => {
                console.log(`✅ DADOS RESPOSTA #${requestInfo.id}:`, jsonData);
            }).catch(() => {
                response.clone().text().then(textData => {
                    if (textData && textData.length < 500) {
                        console.log(`✅ TEXTO RESPOSTA #${requestInfo.id}:`, textData);
                    }
                }).catch(() => {});
            });
        }
        
        return response;
    }).catch(error => {
        console.error(`❌ ERRO REQUISIÇÃO #${requestInfo.id}:`, error);
        throw error;
    });
};

// Função principal de teste
function testarBotaoAtualizar() {
    console.log('\n🧪 INICIANDO TESTE DO BOTÃO ATUALIZAR...');
    
    // 1. Verificar se modal está aberto
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        console.error('❌ MODAL NÃO ENCONTRADO!');
        console.log('💡 Instruções:');
        console.log('  1. Vá para a página /incidents');
        console.log('  2. Clique em "Editar" em um incidente existente');
        console.log('  3. Execute este script novamente');
        return false;
    }
    
    console.log('✅ Modal encontrado');
    
    // 2. Verificar se é modal de edição
    const modalTitle = modal.querySelector('h2, [role="heading"]');
    const isEditModal = modalTitle && modalTitle.textContent.includes('Editar');
    
    if (!isEditModal) {
        console.warn('⚠️ Este não é um modal de EDIÇÃO!');
        console.log('💡 Certifique-se de clicar em "Editar" em um incidente existente');
        return false;
    }
    
    console.log('✅ Modal de edição confirmado');
    
    // 3. Encontrar elementos do formulário
    const form = modal.querySelector('form');
    const titleInput = modal.querySelector('#title');
    const descriptionInput = modal.querySelector('#description');
    const submitButton = modal.querySelector('button[type="submit"]');
    
    console.log('📋 Elementos encontrados:');
    console.log('- Form:', !!form);
    console.log('- Title input:', !!titleInput);
    console.log('- Description input:', !!descriptionInput);
    console.log('- Submit button:', !!submitButton);
    
    if (!form || !titleInput || !submitButton) {
        console.error('❌ ELEMENTOS ESSENCIAIS NÃO ENCONTRADOS!');
        return false;
    }
    
    // 4. Verificar estado atual
    const currentData = {
        title: titleInput.value,
        description: descriptionInput?.value || '',
        buttonText: submitButton.textContent?.trim(),
        buttonDisabled: submitButton.disabled
    };
    
    console.log('📝 Estado atual:', currentData);
    
    if (currentData.buttonDisabled) {
        console.error('❌ BOTÃO ESTÁ DESABILITADO!');
        return false;
    }
    
    // 5. Modificar dados para teste
    const timestamp = new Date().toLocaleTimeString();
    const newTitle = currentData.title + ` [TESTE ${timestamp}]`;
    const newDescription = currentData.description + ` [EDITADO EM ${timestamp}]`;
    
    console.log('🔄 Modificando dados para teste...');
    console.log('- Título original:', currentData.title);
    console.log('- Título novo:', newTitle);
    
    // Limpar log de requisições
    requestLog = [];
    
    // Alterar título
    titleInput.focus();
    titleInput.value = newTitle;
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    titleInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Alterar descrição se existir
    if (descriptionInput) {
        descriptionInput.value = newDescription;
        descriptionInput.dispatchEvent(new Event('input', { bubbles: true }));
        descriptionInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    console.log('✅ Dados modificados');
    
    // 6. Aguardar um pouco e clicar no botão
    console.log('⏳ Aguardando 2 segundos antes de clicar...');
    
    setTimeout(() => {
        console.log('🖱️ CLICANDO NO BOTÃO ATUALIZAR...');
        
        // Verificar se ainda está habilitado
        if (submitButton.disabled) {
            console.error('❌ Botão foi desabilitado!');
            return;
        }
        
        // Clicar no botão
        submitButton.click();
        
        // Aguardar resultado
        setTimeout(() => {
            console.log('\n📊 RESULTADO FINAL:');
            console.log('- Requisições enviadas:', requestLog.length);
            
            if (requestLog.length === 0) {
                console.error('❌ NENHUMA REQUISIÇÃO FOI ENVIADA!');
                console.log('🔍 Possíveis problemas:');
                console.log('  1. handleSubmit não foi chamado');
                console.log('  2. Validação bloqueou o submit');
                console.log('  3. Erro JavaScript impediu execução');
                console.log('  4. Event listener não está conectado');
                
                // Verificar erros no console
                console.log('💡 Verifique o console para logs do handleSubmit');
                
            } else {
                console.log('✅ REQUISIÇÕES ENVIADAS:');
                requestLog.forEach((req, i) => {
                    console.log(`  ${i + 1}. ${req.method} ${req.url.split('?')[0]}`);
                    if (req.body && typeof req.body === 'object') {
                        console.log(`     Dados:`, req.body);
                    }
                });
                
                // Verificar se houve UPDATE
                const updateRequest = requestLog.find(req => 
                    req.method === 'PATCH' && req.url.includes('incidents')
                );
                
                if (updateRequest) {
                    console.log('✅ REQUISIÇÃO UPDATE ENCONTRADA!');
                    console.log('📤 Dados enviados:', updateRequest.body);
                } else {
                    console.warn('⚠️ Nenhuma requisição UPDATE encontrada');
                }
            }
            
            // Verificar se modal fechou
            const modalStillOpen = document.querySelector('[role="dialog"]');
            if (!modalStillOpen) {
                console.log('✅ SUCESSO TOTAL! Modal fechou - edição foi salva!');
            } else {
                console.log('⚠️ Modal ainda está aberto');
                
                // Verificar se há erros visíveis
                const errors = modal.querySelectorAll('.text-red-500, [class*="error"]');
                if (errors.length > 0) {
                    console.log('❌ Erros visíveis no modal:');
                    errors.forEach((error, i) => {
                        console.log(`  ${i + 1}. ${error.textContent?.trim()}`);
                    });
                }
                
                // Verificar se botão ainda está em loading
                const buttonText = submitButton.textContent?.trim();
                if (buttonText && buttonText.includes('Salvando')) {
                    console.log('⏳ Botão ainda está em estado de loading');
                }
            }
            
        }, 10000); // Aguardar 10 segundos para resultado
        
    }, 2000); // Aguardar 2 segundos antes de clicar
    
    return true;
}

// Executar teste automaticamente
const testResult = testarBotaoAtualizar();

if (testResult) {
    console.log('\n🎯 TESTE INICIADO COM SUCESSO!');
    console.log('⏳ Aguarde até 12 segundos para o resultado completo...');
    console.log('🔍 Monitore os logs do console para ver o progresso');
} else {
    console.log('\n❌ TESTE NÃO PÔDE SER EXECUTADO');
    console.log('💡 Siga as instruções acima para preparar o ambiente');
}

console.log('\n📱 MONITORAMENTO ATIVO - Todas as requisições serão logadas');