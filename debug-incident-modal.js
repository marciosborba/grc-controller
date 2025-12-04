/**
 * 🔍 DEBUG COMPLETO - MODAL EDITAR INCIDENTE
 * 
 * Este script monitora todas as operações do modal de edição de incidentes
 * para identificar por que as edições não estão sendo salvas no banco de dados.
 */

(function() {
    'use strict';
    
    console.log('🚀 INICIANDO DEBUG DO MODAL EDITAR INCIDENTE');
    console.log('📋 Monitorando todas as operações relacionadas...\n');
    
    // ============================================================================
    // UTILITÁRIOS DE LOG
    // ============================================================================
    
    function logSection(title) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔍 ${title}`);
        console.log(`${'='.repeat(60)}`);
    }
    
    function logStep(step, data = null) {
        console.log(`📌 ${step}`);
        if (data) {
            console.log('   Dados:', data);
        }
    }
    
    function logError(error, context = '') {
        console.error(`❌ ERRO ${context}:`, error);
    }
    
    function logSuccess(message, data = null) {
        console.log(`✅ ${message}`);
        if (data) {
            console.log('   Dados:', data);
        }
    }
    
    function logWarning(message, data = null) {
        console.warn(`⚠️  ${message}`);
        if (data) {
            console.warn('   Dados:', data);
        }
    }
    
    // ============================================================================
    // MONITORAMENTO DE ELEMENTOS DOM
    // ============================================================================
    
    function findModalElements() {
        logSection('BUSCANDO ELEMENTOS DO MODAL');
        
        const elements = {
            modal: document.querySelector('[role="dialog"][id^="radix-"]'),
            form: document.querySelector('[role="dialog"] form'),
            titleInput: document.querySelector('#title'),
            descriptionTextarea: document.querySelector('#description'),
            submitButton: document.querySelector('button[type="submit"]'),
            saveButton: null
        };
        
        // Buscar botão de salvar por texto
        const buttons = document.querySelectorAll('button');
        elements.saveButton = Array.from(buttons).find(btn => 
            btn.textContent.includes('Atualizar') || 
            btn.textContent.includes('Salvar') ||
            btn.textContent.includes('Registrar')
        );
        
        logStep('Modal encontrado:', !!elements.modal);
        logStep('Formulário encontrado:', !!elements.form);
        logStep('Campo título encontrado:', !!elements.titleInput);
        logStep('Campo descrição encontrado:', !!elements.descriptionTextarea);
        logStep('Botão submit encontrado:', !!elements.submitButton);
        logStep('Botão salvar encontrado:', !!elements.saveButton);
        
        return elements;
    }
    
    // ============================================================================
    // MONITORAMENTO DE FORMULÁRIO
    // ============================================================================
    
    function monitorFormData() {
        logSection('MONITORANDO DADOS DO FORMULÁRIO');
        
        const elements = findModalElements();
        
        if (!elements.form) {
            logError('Formulário não encontrado!');
            return;
        }
        
        // Capturar dados atuais do formulário
        function captureFormData() {
            const data = {};
            
            // Capturar campos de input
            const inputs = elements.form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (input.id || input.name) {
                    const key = input.id || input.name;
                    data[key] = input.value;
                }
            });
            
            // Capturar campos de select customizados (Radix UI)
            const selectTriggers = elements.form.querySelectorAll('[role="combobox"]');
            selectTriggers.forEach(trigger => {
                const span = trigger.querySelector('span');
                if (span && span.textContent) {
                    const label = trigger.closest('div').querySelector('label');
                    if (label) {
                        data[label.getAttribute('for') || 'select'] = span.textContent;
                    }
                }
            });
            
            return data;
        }
        
        // Log inicial dos dados
        const initialData = captureFormData();
        logStep('Dados iniciais do formulário:', initialData);
        
        // Monitorar mudanças nos campos
        const inputs = elements.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            ['input', 'change', 'blur'].forEach(eventType => {
                input.addEventListener(eventType, function(e) {
                    logStep(`Campo alterado (${eventType}):`, {
                        campo: e.target.id || e.target.name || 'sem-id',
                        valor: e.target.value,
                        tipo: e.target.type
                    });
                });
            });
        });
        
        return { captureFormData, initialData };
    }
    
    // ============================================================================
    // MONITORAMENTO DE EVENTOS DE SUBMIT
    // ============================================================================
    
    function monitorSubmitEvents() {
        logSection('MONITORANDO EVENTOS DE SUBMIT');
        
        const elements = findModalElements();
        
        // Interceptar submit do formulário
        if (elements.form) {
            elements.form.addEventListener('submit', function(e) {
                logStep('🚀 EVENTO SUBMIT DISPARADO');
                logStep('Evento preventDefault chamado:', e.defaultPrevented);
                
                // Capturar dados do formulário no momento do submit
                const formData = new FormData(e.target);
                const submitData = {};
                for (let [key, value] of formData.entries()) {
                    submitData[key] = value;
                }
                
                logStep('Dados enviados via FormData:', submitData);
            }, true);
        }
        
        // Monitorar cliques no botão de salvar
        if (elements.saveButton) {
            elements.saveButton.addEventListener('click', function(e) {
                logStep('🖱️  CLIQUE NO BOTÃO SALVAR');
                logStep('Botão desabilitado:', e.target.disabled);
                logStep('Texto do botão:', e.target.textContent);
            }, true);
        }
        
        // Monitorar todos os botões do modal
        const allButtons = elements.modal?.querySelectorAll('button') || [];
        allButtons.forEach((button, index) => {
            button.addEventListener('click', function(e) {
                logStep(`🖱️  CLIQUE EM BOTÃO ${index + 1}:`, {
                    texto: e.target.textContent,
                    tipo: e.target.type,
                    desabilitado: e.target.disabled,
                    classes: e.target.className
                });
            }, true);
        });
    }
    
    // ============================================================================
    // MONITORAMENTO DE REQUISIÇÕES DE REDE
    // ============================================================================
    
    function monitorNetworkRequests() {
        logSection('MONITORANDO REQUISIÇÕES DE REDE');
        
        // Interceptar fetch
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const [url, options] = args;
            
            logStep('🌐 REQUISIÇÃO FETCH:', {
                url: url,
                method: options?.method || 'GET',
                headers: options?.headers,
                body: options?.body
            });
            
            return originalFetch.apply(this, args)
                .then(response => {
                    logStep('📥 RESPOSTA FETCH:', {
                        url: url,
                        status: response.status,
                        statusText: response.statusText,
                        ok: response.ok
                    });
                    
                    // Clonar resposta para ler o body
                    const clonedResponse = response.clone();
                    clonedResponse.text().then(text => {
                        try {
                            const json = JSON.parse(text);
                            logStep('📄 BODY DA RESPOSTA (JSON):', json);
                        } catch {
                            if (text.length < 500) {
                                logStep('📄 BODY DA RESPOSTA (TEXT):', text);
                            } else {
                                logStep('📄 BODY DA RESPOSTA:', 'Muito grande para exibir');
                            }
                        }
                    }).catch(err => {
                        logError('Erro ao ler body da resposta:', err);
                    });
                    
                    return response;
                })
                .catch(error => {
                    logError('ERRO NA REQUISIÇÃO FETCH:', error);
                    throw error;
                });
        };
    }
    
    // ============================================================================
    // MONITORAMENTO DE ERROS
    // ============================================================================
    
    function monitorErrors() {
        logSection('MONITORANDO ERROS');
        
        // Interceptar erros JavaScript
        window.addEventListener('error', function(e) {
            logError('ERRO JAVASCRIPT:', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error
            });
        });
        
        // Interceptar promises rejeitadas
        window.addEventListener('unhandledrejection', function(e) {
            logError('PROMISE REJEITADA:', {
                reason: e.reason,
                promise: e.promise
            });
        });
    }
    
    // ============================================================================
    // FUNÇÃO PRINCIPAL DE ANÁLISE
    // ============================================================================
    
    function analyzeIncidentModal() {
        logSection('ANÁLISE COMPLETA DO MODAL');
        
        const elements = findModalElements();
        
        if (!elements.modal) {
            logWarning('Modal não encontrado! Certifique-se de que o modal está aberto.');
            return;
        }
        
        // Verificar se é realmente um modal de edição
        const modalTitle = elements.modal.querySelector('h2, [role="heading"]');
        const isEditModal = modalTitle && modalTitle.textContent.includes('Editar');
        
        logStep('É modal de edição:', isEditModal);
        logStep('Título do modal:', modalTitle?.textContent);
        
        // Verificar estrutura do formulário
        if (elements.form) {
            const formElements = {
                inputs: elements.form.querySelectorAll('input').length,
                textareas: elements.form.querySelectorAll('textarea').length,
                selects: elements.form.querySelectorAll('select').length,
                buttons: elements.form.querySelectorAll('button').length,
                customSelects: elements.form.querySelectorAll('[role="combobox"]').length
            };
            
            logStep('Elementos do formulário:', formElements);
        }
        
        // Verificar se há dados pré-preenchidos
        const prefilledData = {};
        if (elements.titleInput) prefilledData.title = elements.titleInput.value;
        if (elements.descriptionTextarea) prefilledData.description = elements.descriptionTextarea.value;
        
        logStep('Dados pré-preenchidos:', prefilledData);
    }
    
    // ============================================================================
    // INICIALIZAÇÃO
    // ============================================================================
    
    function init() {
        logSection('INICIALIZANDO DEBUG');
        
        setTimeout(() => {
            monitorErrors();
            monitorNetworkRequests();
            
            // Verificar se o modal já está aberto
            const modal = document.querySelector('[role="dialog"]');
            if (modal) {
                logStep('Modal já está aberto, iniciando monitoramento...');
                analyzeIncidentModal();
                monitorFormData();
                monitorSubmitEvents();
            } else {
                logStep('Modal não encontrado, aguardando abertura...');
                
                // Observer para detectar quando o modal for aberto
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && 
                                (node.matches('[role="dialog"]') || 
                                 node.querySelector('[role="dialog"]'))) {
                                logStep('Modal detectado! Iniciando análise...');
                                setTimeout(() => {
                                    analyzeIncidentModal();
                                    monitorFormData();
                                    monitorSubmitEvents();
                                }, 500);
                            }
                        });
                    });
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
            
            logSuccess('Debug inicializado com sucesso!');
            
        }, 1000);
    }
    
    // ============================================================================
    // INTERFACE PÚBLICA
    // ============================================================================
    
    window.incidentModalDebug = {
        analyze: analyzeIncidentModal,
        findElements: findModalElements
    };
    
    // Inicializar automaticamente
    init();
    
    // Instruções para o usuário
    console.log(`
📋 COMANDOS DISPONÍVEIS:
• incidentModalDebug.analyze() - Analisar modal atual
• incidentModalDebug.findElements() - Encontrar elementos do modal

🎯 COMO USAR ESTE DEBUG:

1. ✅ Script carregado - aguardando modal ser aberto
2. 🖱️  Abra o modal "Editar Incidente" 
3. ✏️  Faça alterações nos campos
4. 💾 Clique em "Atualizar Incidente"
5. 👀 Observe os logs detalhados abaixo

🔍 O que será monitorado:
• Eventos de formulário (submit, change, input)
• Requisições de rede (fetch, XHR)
• Erros JavaScript
• Cliques em botões

⚠️  Se não aparecerem logs, verifique:
• Modal está realmente aberto?
• Console não foi limpo?
• Não há erros bloqueando o script?
`);
    
})();