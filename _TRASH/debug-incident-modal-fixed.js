/**
 * 🔍 DEBUG MODAL EDITAR INCIDENTE - VERSÃO CORRIGIDA
 * 
 * Cole este script no console do navegador para debugar o modal de edição
 */

console.log('🚀 INICIANDO DEBUG DO MODAL EDITAR INCIDENTE');
console.log('📋 Versão corrigida - sem dependências externas\n');

// ============================================================================
// UTILITÁRIOS DE LOG
// ============================================================================

function logSection(title) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 ${title}`);
    console.log(`${'='.repeat(60)}`);
}

function logStep(step, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`📌 [${timestamp}] ${step}`);
    if (data) {
        console.log('   📊 Dados:', data);
    }
}

function logError(error, context = '') {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`❌ [${timestamp}] ERRO ${context}:`, error);
}

function logSuccess(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`✅ [${timestamp}] ${message}`);
    if (data) {
        console.log('   📊 Dados:', data);
    }
}

function logWarning(message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    console.warn(`⚠️ [${timestamp}] ${message}`);
    if (data) {
        console.warn('   📊 Dados:', data);
    }
}

// ============================================================================
// ANÁLISE DO MODAL DE INCIDENTES
// ============================================================================

function analyzeIncidentModal() {
    logSection('ANÁLISE DO MODAL DE INCIDENTES');
    
    // Buscar o modal
    const modal = document.querySelector('[role="dialog"]');
    if (!modal) {
        logWarning('Modal não encontrado! Certifique-se de que está aberto.');
        return null;
    }
    
    // Verificar se é modal de edição
    const title = modal.querySelector('h2');
    const isEditModal = title && title.textContent.includes('Editar');
    
    logStep(`Modal encontrado: ${isEditModal ? 'EDIÇÃO' : 'CRIAÇÃO'}`);
    logStep(`Título: ${title?.textContent || 'Não encontrado'}`);
    
    // Analisar formulário
    const form = modal.querySelector('form');
    if (!form) {
        logError('Formulário não encontrado no modal!');
        return null;
    }
    
    // Analisar campos
    const fields = {
        title: form.querySelector('#title'),
        description: form.querySelector('#description'),
        selects: form.querySelectorAll('[role="combobox"]'),
        buttons: form.querySelectorAll('button')
    };
    
    logStep('Estrutura do formulário:', {
        hasTitle: !!fields.title,
        hasDescription: !!fields.description,
        selectsCount: fields.selects.length,
        buttonsCount: fields.buttons.length
    });
    
    // Verificar dados atuais
    const currentData = {
        title: fields.title?.value || '',
        description: fields.description?.value || ''
    };
    
    // Capturar valores dos selects customizados
    fields.selects.forEach((select, index) => {
        const span = select.querySelector('span');
        if (span && span.textContent) {
            currentData[`select_${index}`] = span.textContent;
        }
    });
    
    logStep('Dados atuais do formulário:', currentData);
    
    // Encontrar botão de salvar
    const saveButton = Array.from(fields.buttons).find(btn => 
        btn.textContent.includes('Atualizar') || 
        btn.textContent.includes('Salvar')
    );
    
    if (saveButton) {
        logStep('Botão salvar encontrado:', {
            text: saveButton.textContent,
            disabled: saveButton.disabled,
            type: saveButton.type
        });
    } else {
        logError('Botão de salvar não encontrado!');
    }
    
    return {
        modal,
        form,
        fields,
        saveButton,
        currentData,
        isEditModal
    };
}

// ============================================================================
// MONITORAMENTO DE EVENTOS
// ============================================================================

function setupEventMonitoring() {
    logSection('CONFIGURANDO MONITORAMENTO DE EVENTOS');
    
    // Interceptar fetch para requisições de incidentes
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [url, options] = args;
        
        if (typeof url === 'string' && url.includes('incidents')) {
            logStep('🌐 REQUISIÇÃO INCIDENTES:', {
                url: url,
                method: options?.method || 'GET',
                hasBody: !!options?.body
            });
            
            if (options?.body) {
                try {
                    const bodyData = JSON.parse(options.body);
                    logStep('📤 DADOS ENVIADOS:', bodyData);
                } catch (e) {
                    logStep('📤 BODY (não JSON):', options.body);
                }
            }
        }
        
        return originalFetch.apply(this, args)
            .then(response => {
                if (typeof url === 'string' && url.includes('incidents')) {
                    logStep('📥 RESPOSTA INCIDENTES:', {
                        status: response.status,
                        ok: response.ok,
                        statusText: response.statusText
                    });
                    
                    // Clonar para ler o body
                    const clonedResponse = response.clone();
                    clonedResponse.text().then(text => {
                        try {
                            const data = JSON.parse(text);
                            logStep('📄 DADOS DA RESPOSTA:', data);
                        } catch (e) {
                            if (text.length < 200) {
                                logStep('📄 RESPOSTA (texto):', text);
                            }
                        }
                    }).catch(() => {});
                }
                return response;
            })
            .catch(error => {
                if (typeof url === 'string' && url.includes('incidents')) {
                    logError('ERRO NA REQUISIÇÃO:', error);
                }
                throw error;
            });
    };
    
    logSuccess('Monitoramento de fetch configurado');
}

// ============================================================================
// MONITORAMENTO DO FORMULÁRIO
// ============================================================================

function monitorForm() {
    const analysis = analyzeIncidentModal();
    if (!analysis) return;
    
    const { form, saveButton } = analysis;
    
    logSection('CONFIGURANDO MONITORAMENTO DO FORMULÁRIO');
    
    // Monitorar submit
    form.addEventListener('submit', function(e) {
        logStep('🚀 SUBMIT DO FORMULÁRIO DISPARADO');
        logStep('preventDefault chamado:', e.defaultPrevented);
        
        // Capturar dados do FormData
        const formData = new FormData(form);
        const submitData = {};
        for (let [key, value] of formData.entries()) {
            submitData[key] = value;
        }
        
        logStep('📝 DADOS DO SUBMIT:', submitData);
        
        // Verificar validação
        const isValid = form.checkValidity();
        logStep('Formulário válido:', isValid);
        
        if (!isValid) {
            logWarning('Formulário inválido - submit pode ser bloqueado');
        }
    }, true);
    
    // Monitorar clique no botão salvar
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            logStep('🖱️ CLIQUE NO BOTÃO SALVAR');
            logStep('Botão estado:', {
                disabled: e.target.disabled,
                text: e.target.textContent.trim()
            });
        }, true);
    }
    
    // Monitorar mudanças nos campos
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', function(e) {
            logStep(`📝 Campo alterado: ${e.target.id || 'sem-id'}`, {
                valor: e.target.value,
                valido: e.target.checkValidity()
            });
        });
    });
    
    logSuccess('Monitoramento do formulário configurado');
}

// ============================================================================
// TESTE AUTOMÁTICO
// ============================================================================

function testIncidentEdit() {
    logSection('EXECUTANDO TESTE AUTOMÁTICO');
    
    const analysis = analyzeIncidentModal();
    if (!analysis) {
        logWarning('Não é possível testar - modal não encontrado');
        return;
    }
    
    const { fields, saveButton } = analysis;
    
    if (!fields.title) {
        logError('Campo título não encontrado para teste');
        return;
    }
    
    const originalTitle = fields.title.value;
    const testTitle = originalTitle + ' [TESTE DEBUG]';
    
    logStep('Alterando título para teste...');
    fields.title.value = testTitle;
    fields.title.dispatchEvent(new Event('input', { bubbles: true }));
    fields.title.dispatchEvent(new Event('change', { bubbles: true }));
    
    setTimeout(() => {
        logStep('Título após alteração:', fields.title.value);
        
        if (saveButton && !saveButton.disabled) {
            logStep('Simulando clique no botão salvar...');
            saveButton.click();
        } else {
            logWarning('Botão salvar não disponível ou desabilitado');
        }
        
        // Restaurar título original após 5 segundos
        setTimeout(() => {
            fields.title.value = originalTitle;
            fields.title.dispatchEvent(new Event('input', { bubbles: true }));
            logStep('Título restaurado para o original');
        }, 5000);
    }, 1000);
}

// ============================================================================
// VERIFICAÇÃO DE PROBLEMAS COMUNS
// ============================================================================

function checkCommonIssues() {
    logSection('VERIFICANDO PROBLEMAS COMUNS');
    
    // 1. Verificar erros de validação
    const errorElements = document.querySelectorAll('.text-red-500, .error, [data-error]');
    if (errorElements.length > 0) {
        logWarning('Erros de validação encontrados:', 
            Array.from(errorElements).map(el => el.textContent)
        );
    } else {
        logStep('Nenhum erro de validação visível');
    }
    
    // 2. Verificar campos obrigatórios
    const requiredInputs = document.querySelectorAll('input[required], [aria-required="true"]');
    const emptyRequired = Array.from(requiredInputs).filter(input => !input.value.trim());
    if (emptyRequired.length > 0) {
        logWarning('Campos obrigatórios vazios:', 
            emptyRequired.map(input => input.id || input.name)
        );
    } else {
        logStep('Todos os campos obrigatórios preenchidos');
    }
    
    // 3. Verificar autenticação
    const authToken = localStorage.getItem('supabase.auth.token');
    if (!authToken) {
        logWarning('Token de autenticação não encontrado no localStorage');
    } else {
        logStep('Token de autenticação presente');
    }
    
    // 4. Verificar se há operações em andamento
    const loadingElements = document.querySelectorAll('[data-loading], .loading, .spinner');
    if (loadingElements.length > 0) {
        logStep('Operações em andamento detectadas:', loadingElements.length);
    }
    
    // 5. Verificar conectividade básica
    fetch('/api/health')
        .then(response => {
            logSuccess('Conectividade básica OK:', response.status);
        })
        .catch(error => {
            logWarning('Problema de conectividade:', error.message);
        });
}

// ============================================================================
// OBSERVER PARA DETECTAR MODAL
// ============================================================================

function setupModalObserver() {
    logSection('CONFIGURANDO OBSERVER PARA MODAL');
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && 
                    (node.matches('[role="dialog"]') || 
                     node.querySelector('[role="dialog"]'))) {
                    
                    logSuccess('Modal detectado! Iniciando análise...');
                    setTimeout(() => {
                        analyzeIncidentModal();
                        monitorForm();
                    }, 500);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    logSuccess('Observer configurado - aguardando modal...');
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

function initDebug() {
    logSection('INICIALIZANDO DEBUG');
    
    // Configurar monitoramento
    setupEventMonitoring();
    
    // Verificar se modal já está aberto
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
        logSuccess('Modal já está aberto, iniciando análise...');
        analyzeIncidentModal();
        monitorForm();
    } else {
        logStep('Modal não encontrado, configurando observer...');
        setupModalObserver();
    }
    
    // Verificar problemas comuns
    checkCommonIssues();
    
    logSuccess('Debug inicializado com sucesso!');
}

// ============================================================================
// INTERFACE PÚBLICA
// ============================================================================

window.incidentDebug = {
    analyze: analyzeIncidentModal,
    test: testIncidentEdit,
    checkIssues: checkCommonIssues,
    monitor: monitorForm
};

// ============================================================================
// INICIALIZAR
// ============================================================================

// Aguardar um pouco para garantir que a página carregou
setTimeout(() => {
    initDebug();
}, 1000);

// Instruções para o usuário
console.log(`
🎯 DEBUG MODAL INCIDENTES ATIVO!

📋 COMANDOS DISPONÍVEIS:
• incidentDebug.analyze() - Analisar modal atual
• incidentDebug.test() - Testar edição automaticamente  
• incidentDebug.checkIssues() - Verificar problemas comuns
• incidentDebug.monitor() - Configurar monitoramento

🔍 COMO USAR:
1. Navegue para /incidents (já feito!)
2. Clique em "Editar" em qualquer incidente
3. Observe os logs automáticos no console
4. Faça alterações e tente salvar
5. Use os comandos acima para análise detalhada

⚠️ PONTOS DE ATENÇÃO:
• Verifique se há erros de validação
• Confirme se os dados estão sendo enviados
• Observe se há problemas de conectividade
• Verifique se o token de autenticação está presente

✅ Script carregado com sucesso!
`);