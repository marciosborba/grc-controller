const DatabaseManager = require('./database-manager.cjs');

// === CIS CONTROLS v8 FULL (18 Controls, 153 Safeguards) ===
// VERSÃO PT-BR (Tradução e Adaptação para Questionário)
// UPDATE: TÍTULOS DOS CONTROLES AGORA SÃO AS PRÓPRIAS PERGUNTAS
const CIS_DATA = {
    data: {
        nome: 'CIS Controls v8 (PT-BR) - Questionário',
        codigo: 'CIS-Controls-v8',
        descricao: 'CIS Critical Security Controls v8 (18 Controles, 153 Salvaguardas) - Formato de Questionário',
        versao: '8.0.2',
        tipo_framework: 'CIS',
        categoria: 'Cibersegurança',
        is_standard: true,
        publico: true,
        status: 'ativo'
    },
    domains: [
        {
            nome: '01. Inventário e Controle de Ativos Corporativos', codigo: 'CIS-01', ordem: 1, peso: 10,
            controls: [
                { codigo: '1.1', titulo: 'A organização mantém um inventário detalhado de ativos corporativos?', tipo: 'preventivo', obj: 'Estabelecer e manter inventário detalhado de ativos.', questions: [{ pergunta: 'A organização estabeleceu e mantém um inventário detalhado e atualizado de todos os ativos corporativos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '1.2', titulo: 'A organização trata ativos não autorizados?', tipo: 'corretivo', obj: 'Remover ou isolar ativos não autorizados.', questions: [{ pergunta: 'Existe um processo para remover ou isolar fisicamente/logicamente ativos não autorizados da rede?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '1.3', titulo: 'A organização utiliza ferramenta de descoberta ativa?', tipo: 'detectivo', obj: 'Utilizar ferramenta de descoberta ativa.', questions: [{ pergunta: 'A organização utiliza uma ferramenta de descoberta ativa para identificar ativos conectados à rede?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '1.4', titulo: 'A organização utiliza logs de DHCP para inventário?', tipo: 'detectivo', obj: 'Utilizar logs de DHCP para atualizar inventário.', questions: [{ pergunta: 'Os logs dos servidores DHCP são utilizados para atualizar o inventário de ativos corporativos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '1.5', titulo: 'A organização utiliza ferramenta de descoberta passiva?', tipo: 'detectivo', obj: 'Utilizar ferramenta de descoberta passiva.', questions: [{ pergunta: 'A organização utiliza uma ferramenta de descoberta passiva para monitorar o tráfego e identificar ativos?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '02. Inventário e Controle de Ativos de Software', codigo: 'CIS-02', ordem: 2, peso: 10,
            controls: [
                { codigo: '2.1', titulo: 'A organização mantém um inventário de software?', tipo: 'preventivo', obj: 'Estabelecer e manter inventário de software.', questions: [{ pergunta: 'A organização estabeleceu e mantém um inventário detalhado de todos os softwares licenciados e instalados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.2', titulo: 'A organização garante apenas software autorizado?', tipo: 'preventivo', obj: 'Garantir que apenas softwares autorizados sejam instalados.', questions: [{ pergunta: 'A organização garante que apenas softwares previamente autorizados possam ser instalados ou executados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.3', titulo: 'A organização trata softwares não autorizados?', tipo: 'corretivo', obj: 'Remover softwares não autorizados.', questions: [{ pergunta: 'Existe um processo para identificar e remover/quarentenar softwares não autorizados encontrados nos ativos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.4', titulo: 'A organização utiliza ferramentas de inventário automatizado?', tipo: 'detectivo', obj: 'Utilizar ferramentas automatizadas.', questions: [{ pergunta: 'São utilizadas ferramentas automatizadas para rastrear softwares instalados em todos os ativos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.5', titulo: 'A organização utiliza allowlist de software?', tipo: 'preventivo', obj: 'Utilizar lista de permissão (allowlist) de software.', questions: [{ pergunta: 'A organização utiliza uma lista de permissão (allowlist) técnica para garantir que apenas softwares autorizados executem?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.6', titulo: 'A organização utiliza allowlist de bibliotecas?', tipo: 'preventivo', obj: 'Utilizar allowlist de bibliotecas.', questions: [{ pergunta: 'A organização utiliza uma lista de permissão de bibliotecas para restringir quais módulos podem ser carregados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '2.7', titulo: 'A organização utiliza allowlist de scripts?', tipo: 'preventivo', obj: 'Utilizar allowlist de scripts.', questions: [{ pergunta: 'A organização utiliza uma lista de permissão para restringir a execução de scripts não autorizados?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '03. Proteção de Dados', codigo: 'CIS-03', ordem: 3, peso: 10,
            controls: [
                { codigo: '3.1', titulo: 'A organização possui processo de gestão de dados?', tipo: 'preventivo', obj: 'Estabelecer processo de gestão de dados.', questions: [{ pergunta: 'A organização estabeleceu e mantém um processo formal de gestão de dados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.2', titulo: 'A organização mantém inventário de dados?', tipo: 'preventivo', obj: 'Estabelecer e manter inventário de dados.', questions: [{ pergunta: 'A organização mantém um inventário de dados sensíveis e sua localização?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.3', titulo: 'O controle de acesso a dados é configurado?', tipo: 'preventivo', obj: 'Configurar Listas de Controle de Acesso (ACLs).', questions: [{ pergunta: 'As Listas de Controle de Acesso (ACLs) são configuradas para restringir o acesso aos dados apenas a usuários autorizados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.4', titulo: 'A retenção de dados é aplicada?', tipo: 'preventivo', obj: 'Aplicar retenção de dados.', questions: [{ pergunta: 'A organização aplica políticas de retenção de dados para garantir o descarte adequado após o período necessário?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.5', titulo: 'O descarte de dados é seguro?', tipo: 'preventivo', obj: 'Descartar dados de forma segura.', questions: [{ pergunta: 'Existem processos para descartar dados de forma segura quando não são mais necessários?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.6', titulo: 'Dispositivos de usuário são criptografados?', tipo: 'preventivo', obj: 'Criptografar dados em dispositivos finais.', questions: [{ pergunta: 'Os dados em dispositivos de usuários finais (laptops, smartphones) são criptografados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.7', titulo: 'Existe esquema de classificação de dados?', tipo: 'preventivo', obj: 'Estabelecer esquema de classificação.', questions: [{ pergunta: 'A organização mantém um esquema de classificação de dados (ex: Público, Confidencial, Restrito)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.8', titulo: 'Os fluxos de dados são documentados?', tipo: 'detectivo', obj: 'Mapear fluxos de dados.', questions: [{ pergunta: 'Os fluxos de dados sensíveis através da rede e sistemas estão documentados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.9', titulo: 'Mídia removível é criptografada?', tipo: 'preventivo', obj: 'Criptografar dados em mídia removível.', questions: [{ pergunta: 'Dados armazenados em mídias removíveis (USB, HDs externos) são obrigatoriamente criptografados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.10', titulo: 'Dados em trânsito são criptografados?', tipo: 'preventivo', obj: 'Criptografar dados em trânsito.', questions: [{ pergunta: 'Dados sensíveis são criptografados durante a transmissão (em trânsito)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.11', titulo: 'Dados em repouso são criptografados?', tipo: 'preventivo', obj: 'Criptografar dados em repouso.', questions: [{ pergunta: 'Dados sensíveis armazenados em servidores e bancos de dados (em repouso) são criptografados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.12', titulo: 'O processamento de dados é segmentado?', tipo: 'preventivo', obj: 'Segmentar processamento de dados.', questions: [{ pergunta: 'O ambiente de processamento de dados sensíveis é segmentado logicamente ou fisicamente do restante da rede?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.13', titulo: 'Solução de DLP está implantada?', tipo: 'detectivo', obj: 'Implantar Data Loss Prevention.', questions: [{ pergunta: 'Uma solução de Prevenção à Perda de Dados (DLP) está implantada e ativa?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '3.14', titulo: 'O acesso a dados é registrado em log?', tipo: 'detectivo', obj: 'Registrar acesso a dados sensíveis.', questions: [{ pergunta: 'O acesso e tentativas de acesso a dados sensíveis são registrados em logs de auditoria?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '04. Configuração Segura de Ativos e Software', codigo: 'CIS-04', ordem: 4, peso: 10,
            controls: [
                { codigo: '4.1', titulo: 'Existe processo de configuração segura?', tipo: 'preventivo', obj: 'Estabelecer processo de configuração segura.', questions: [{ pergunta: 'Existe um processo documentado para gerenciar e manter configurações seguras de ativos e software?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.2', titulo: 'Existe infraestrutura de configuração segura?', tipo: 'preventivo', obj: 'Manter infraestrutura de configuração.', questions: [{ pergunta: 'A organização mantém uma infraestrutura dedicada para gerenciar e implantar configurações seguras?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.3', titulo: 'O bloqueio de sessão está configurado?', tipo: 'preventivo', obj: 'Configurar bloqueio automático.', questions: [{ pergunta: 'O bloqueio automático de sessão por inatividade está configurado em todos os dispositivos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.4', titulo: 'Firewalls estão ativos em servidores?', tipo: 'preventivo', obj: 'Implementar firewalls locais em servidores.', questions: [{ pergunta: 'Firewalls locais estão ativados e configurados em todos os servidores?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.5', titulo: 'Firewalls estão ativos em dispositivos de usuário?', tipo: 'preventivo', obj: 'Implementar firewalls em endpoints.', questions: [{ pergunta: 'Firewalls locais estão ativados e configurados em todos os dispositivos de usuário final?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.6', titulo: 'Os ativos são gerenciados de forma segura?', tipo: 'preventivo', obj: 'Gerenciar ativos de forma segura.', questions: [{ pergunta: 'O acesso administrativo aos ativos é realizado através de canais seguros e protocolos criptografados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.7', titulo: 'Contas padrão são gerenciadas?', tipo: 'preventivo', obj: 'Gerenciar contas default.', questions: [{ pergunta: 'As contas e senhas padrão (default) de fábrica são alteradas ou desativadas antes da implantação?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.8', titulo: 'Serviços desnecessários são removidos?', tipo: 'preventivo', obj: 'Desativar serviços não utilizados.', questions: [{ pergunta: 'Serviços e portas desnecessários são desativados ou removidos dos sistemas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.9', titulo: 'Servidores DNS confiáveis são utilizados?', tipo: 'preventivo', obj: 'Usar DNS confiável.', questions: [{ pergunta: 'Os ativos estão configurados para usar apenas servidores DNS confiáveis e autorizados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.10', titulo: 'Bloqueio automático de dispositivo está ativo?', tipo: 'preventivo', obj: 'Bloqueio após tentativas falhas.', questions: [{ pergunta: 'Os dispositivos são configurados para bloquear automaticamente após um número limite de tentativas de login falhas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.11', titulo: 'Capacidade de limpeza remota está habiltada?', tipo: 'corretivo', obj: 'Permitir wipe remoto.', questions: [{ pergunta: 'Dispositivos móveis possuem capacidade de limpeza remota (remote wipe) habilitada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '4.12', titulo: 'Espaços de trabalho são separados?', tipo: 'preventivo', obj: 'Separar perfil pessoal e corporativo.', questions: [{ pergunta: 'Dispositivos móveis utilizam separação entre perfis de dados pessoais e corporativos (containerização)?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '05. Gestão de Contas', codigo: 'CIS-05', ordem: 5, peso: 10,
            controls: [
                { codigo: '5.1', titulo: 'A organização mantém inventário de contas?', tipo: 'preventivo', obj: 'Estabelecer e manter inventário de contas.', questions: [{ pergunta: 'A organização mantém um inventário atualizado de todas as contas de usuários e administradores?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.2', titulo: 'São utilizadas senhas únicas?', tipo: 'preventivo', obj: 'Usar senhas únicas.', questions: [{ pergunta: 'É exigido o uso de senhas únicas para cada conta e sistema?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.3', titulo: 'Contas dormentes são desativadas?', tipo: 'preventivo', obj: 'Desativar contas inativas.', questions: [{ pergunta: 'Contas inativas ou dormentes são desativadas automaticamente após um período definido (ex: 45 dias)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.4', titulo: 'Privilégios de administrador são restritos?', tipo: 'preventivo', obj: 'Restringir privilégios admin.', questions: [{ pergunta: 'Os privilégios de administrador são concedidos apenas quando estritamente necessário e por tempo limitado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.5', titulo: 'Existe inventário de contas de serviço?', tipo: 'preventivo', obj: 'Inventariar contas de serviço.', questions: [{ pergunta: 'Existe um inventário dedicado e revisado de todas as contas de serviço?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '5.6', titulo: 'A gestão de contas é centralizada?', tipo: 'preventivo', obj: 'Centralizar autenticação.', questions: [{ pergunta: 'A gestão de contas e autenticação é centralizada (ex: AD, LDAP, SSO)?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '06. Gestão de Controle de Acesso', codigo: 'CIS-06', ordem: 6, peso: 10,
            controls: [
                { codigo: '6.1', titulo: 'Existe processo de concessão de acesso?', tipo: 'preventivo', obj: 'Estabelecer processo de concessão.', questions: [{ pergunta: 'Existe um processo formal e documentado para conceder acesso a sistemas e dados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.2', titulo: 'Existe processo de revogação de acesso?', tipo: 'preventivo', obj: 'Estabelecer processo de revogação.', questions: [{ pergunta: 'O acesso é revogado imediatamente após o desligamento ou mudança de função do colaborador?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.3', titulo: 'MFA é exigida para aplicações externas?', tipo: 'preventivo', obj: 'Exigir MFA externo.', questions: [{ pergunta: 'Autenticação Multifator (MFA) é exigida para todas as aplicações expostas externamente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.4', titulo: 'MFA é exigida para acesso remoto?', tipo: 'preventivo', obj: 'Exigir MFA remoto.', questions: [{ pergunta: 'Autenticação Multifator (MFA) é exigida para todo acesso remoto à rede?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.5', titulo: 'MFA é exigida para acesso administrativo?', tipo: 'preventivo', obj: 'Exigir MFA para admins.', questions: [{ pergunta: 'Autenticação Multifator (MFA) é exigida para todo acesso administrativo privilegiado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.6', titulo: 'Existe inventário de sistemas de autenticação?', tipo: 'preventivo', obj: 'Manter inventário de auth.', questions: [{ pergunta: 'A organização mantém um inventário de todos os sistemas de autenticação e autorização em uso?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.7', titulo: 'O controle de acesso é centralizado?', tipo: 'preventivo', obj: 'Centralizar controle.', questions: [{ pergunta: 'O controle de acesso é gerenciado através de um diretório ou provedor de identidade centralizado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '6.8', titulo: 'O acesso é baseado em função (RBAC)?', tipo: 'preventivo', obj: 'Implementar RBAC.', questions: [{ pergunta: 'O acesso é concedido com base em funções (RBAC) em vez de permissões individuais?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '07. Gestão Contínua de Vulnerabilidades', codigo: 'CIS-07', ordem: 7, peso: 10,
            controls: [
                { codigo: '7.1', titulo: 'Existe processo de gestão de vulnerabilidades?', tipo: 'preventivo', obj: 'Estabelecer processo de gestão.', questions: [{ pergunta: 'Existe um processo contínuo e documentado para identificar, classificar e remediar vulnerabilidades?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.2', titulo: 'Existe processo de remediação?', tipo: 'corretivo', obj: 'Estabelecer processo de correção.', questions: [{ pergunta: 'Existe uma política de prazos para correção de vulnerabilidades baseada em sua criticidade?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.3', titulo: 'Patches de SO são automatizados?', tipo: 'preventivo', obj: 'Automatizar patches de SO.', questions: [{ pergunta: 'A aplicação de patches de segurança em Sistemas Operacionais é automatizada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.4', titulo: 'Patches de Apps são automatizados?', tipo: 'preventivo', obj: 'Automatizar patches de aplicativos.', questions: [{ pergunta: 'A aplicação de patches de segurança em aplicativos de terceiros é automatizada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.5', titulo: 'Scans internos são automatizados?', tipo: 'detectivo', obj: 'Realizar scans internos.', questions: [{ pergunta: 'Varreduras (scans) de vulnerabilidade internas são realizadas de forma automatizada e periódica?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.6', titulo: 'Scans externos são realizados?', tipo: 'detectivo', obj: 'Realizar scans externos.', questions: [{ pergunta: 'Varreduras (scans) de vulnerabilidade externas são realizadas regularmente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '7.7', titulo: 'Vulnerabilidades detectadas são remediadas?', tipo: 'corretivo', obj: 'Corrigir vulnerabilidades.', questions: [{ pergunta: 'As vulnerabilidades detectadas são corrigidas ou mitigadas conforme os SLAs definidos?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '08. Gestão de Logs de Auditoria', codigo: 'CIS-08', ordem: 8, peso: 10,
            controls: [
                { codigo: '8.1', titulo: 'Existe processo de gestão de logs?', tipo: 'preventivo', obj: 'Estabelecer processo de logs.', questions: [{ pergunta: 'Existe um processo documentado para a coleta, revisão e retenção de logs de auditoria?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.2', titulo: 'Logs de auditoria são coletados?', tipo: 'detectivo', obj: 'Habilitar coleta de logs.', questions: [{ pergunta: 'Os logs de auditoria estão habilitados e coletando eventos de todos os ativos críticos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.3', titulo: 'Existe armazenamento seguro para logs?', tipo: 'preventivo', obj: 'Garantir armazenamento de logs.', questions: [{ pergunta: 'Existe capacidade de armazenamento suficiente para manter os logs pelo período de retenção definido?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.4', titulo: 'O tempo está sincronizado (NTP)?', tipo: 'preventivo', obj: 'Sincronizar relógios.', questions: [{ pergunta: 'Todos os sistemas estão sincronizados com uma fonte de tempo confiável (NTP)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.5', titulo: 'Logs coletados são detalhados?', tipo: 'detectivo', obj: 'Incluir detalhes nos logs.', questions: [{ pergunta: 'Os logs coletados contêm detalhes suficientes (quem, o quê, quando, onde) para investigação?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.6', titulo: 'Consultas DNS são logadas?', tipo: 'detectivo', obj: 'Logs de DNS.', questions: [{ pergunta: 'As consultas DNS são registradas e auditadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.7', titulo: 'Requisições URL são logadas?', tipo: 'detectivo', obj: 'Logs de URL.', questions: [{ pergunta: 'As requisições de URL (proxy/firewall) são registradas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.8', titulo: 'Comandos CLI são logados?', tipo: 'detectivo', obj: 'Logs de CLI.', questions: [{ pergunta: 'Os comandos executados via linha de comando (CLI) são registrados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.9', titulo: 'Logs são centralizados?', tipo: 'preventivo', obj: 'Centralizar logs.', questions: [{ pergunta: 'Os logs são enviados para um sistema centralizado (SIEM/Log Server) em tempo real?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.10', titulo: 'Logs são retidos conforme política?', tipo: 'preventivo', obj: 'Política de retenção.', questions: [{ pergunta: 'Os logs são retidos por um período mínimo conforme requisitos legais e de negócio?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.11', titulo: 'Os logs são revisados?', tipo: 'detectivo', obj: 'Revisão periódica.', questions: [{ pergunta: 'Existe um processo de revisão regular ou automatizada dos logs para identificar anomalias?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '8.12', titulo: 'Logs de provedores são coletados?', tipo: 'detectivo', obj: 'Logs de Cloud/SaaS.', questions: [{ pergunta: 'Logs de atividade de provedores de serviço (nuvem, SaaS) são coletados e monitorados?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '09. Proteção de Navegador Web e Email', codigo: 'CIS-09', ordem: 9, peso: 10,
            controls: [
                { codigo: '9.1', titulo: 'Apenas navegadores suportados são usados?', tipo: 'preventivo', obj: 'Garantir navegadores suportados.', questions: [{ pergunta: 'A organização garante que apenas navegadores e clientes de email totalmente suportados sejam utilizados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.2', titulo: 'Filtragem de DNS é utilizada?', tipo: 'preventivo', obj: 'Usar filtro de DNS.', questions: [{ pergunta: 'Serviços de filtragem de DNS são utilizados para bloquear domínios maliciosos conhecidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.3', titulo: 'Filtragem de URL é utilizada?', tipo: 'preventivo', obj: 'Usar filtro de URL.', questions: [{ pergunta: 'Filtros de URL são utilizados para restringir acesso a sites não categorizados ou maliciosos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.4', titulo: 'Extensões de navegador são restritas?', tipo: 'preventivo', obj: 'Controlar extensões.', questions: [{ pergunta: 'A instalação de extensões e plugins de navegador é restrita e controlada?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.5', titulo: 'DMARC está implementado?', tipo: 'preventivo', obj: 'DMARC para email.', questions: [{ pergunta: 'O protocolo DMARC está implementado para proteger o domínio de email da organização?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.6', titulo: 'Arquivos perigosos são bloqueados no email?', tipo: 'preventivo', obj: 'Bloquear anexos perigosos.', questions: [{ pergunta: 'O gateway de email bloqueia tipos de arquivos desnecessários ou perigosos (.exe, .scr, etc.)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '9.7', titulo: 'Anti-malware está ativo no servidor de email?', tipo: 'preventivo', obj: 'Proteção no servidor de email.', questions: [{ pergunta: 'Proteções anti-malware estão ativas diretamente no servidor ou gateway de email?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '10. Defesas Contra Malware', codigo: 'CIS-10', ordem: 10, peso: 10,
            controls: [
                { codigo: '10.1', titulo: 'Software anti-malware está implantado?', tipo: 'preventivo', obj: 'Instalar anti-malware.', questions: [{ pergunta: 'Software anti-malware é implantado e mantido em todos os ativos corporativos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.2', titulo: 'Atualizações de assinatura são automáticas?', tipo: 'preventivo', obj: 'Atualizar assinaturas.', questions: [{ pergunta: 'As assinaturas de anti-malware são atualizadas automaticamente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.3', titulo: 'Autorun está desativado?', tipo: 'preventivo', obj: 'Desativar autoplay.', questions: [{ pergunta: 'As funcionalidades de execução automática (Autorun/Autoplay) de mídias removíveis estão desativadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.4', titulo: 'O escaneamento automático está ativo?', tipo: 'detectivo', obj: 'Escaneamento periódico.', questions: [{ pergunta: 'O escaneamento automático de mídias removíveis e arquivos é realizado em tempo real ou periodicamente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.5', titulo: 'Funcionalidades anti-exploit estão ativas?', tipo: 'preventivo', obj: 'Ativar anti-exploit.', questions: [{ pergunta: 'Funcionalidades de proteção contra exploração (ex: DEP, ASLR) estão habilitadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.6', titulo: 'A gestão do anti-malware é centralizada?', tipo: 'preventivo', obj: 'Gestão central.', questions: [{ pergunta: 'O software anti-malware é gerenciado centralmente para monitoramento e alertas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '10.7', titulo: 'Anti-malware comportamental é utilizado?', tipo: 'detectivo', obj: 'Detecção comportamental.', questions: [{ pergunta: 'A solução anti-malware utiliza análise comportamental além de assinaturas?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '11. Recuperação de Dados', codigo: 'CIS-11', ordem: 11, peso: 10,
            controls: [
                { codigo: '11.1', titulo: 'Existe processo de recuperação de dados?', tipo: 'preventivo', obj: 'Estabelecer processo de recuperação.', questions: [{ pergunta: 'Existe um processo documentado e mantido para a recuperação de dados (Backup & Restore)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '11.2', titulo: 'Backups automatizados são realizados?', tipo: 'preventivo', obj: 'Automatizar backups.', questions: [{ pergunta: 'Os backups dos sistemas e dados críticos são realizados de forma automatizada e regular?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '11.3', titulo: 'Os dados de backup são protegidos?', tipo: 'preventivo', obj: 'Proteger backups.', questions: [{ pergunta: 'Os dados de backup são protegidos com criptografia e controles de acesso rigorosos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '11.4', titulo: 'Existe instância isolada de backup?', tipo: 'preventivo', obj: 'Backup offline/imutável.', questions: [{ pergunta: 'A organização mantém uma instância de backup isolada (offline) ou imutável para proteção contra ransomware?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '11.5', titulo: 'A recuperação de dados é testada?', tipo: 'corretivo', obj: 'Testar restore.', questions: [{ pergunta: 'Testes de restauração de dados são realizados periodicamente para garantir a integridade dos backups?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '12. Gestão de Infraestrutura de Rede', codigo: 'CIS-12', ordem: 12, peso: 10,
            controls: [
                { codigo: '12.1', titulo: 'Infraestrutura de rede está atualizada?', tipo: 'preventivo', obj: 'Atualizar firmwares.', questions: [{ pergunta: 'Os dispositivos de rede estão rodando as versões de firmware/OS mais recentes e suportadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.2', titulo: 'A arquitetura de rede é segura?', tipo: 'preventivo', obj: 'Segmentar rede.', questions: [{ pergunta: 'A arquitetura de rede é segmentada (VLANs, DMZ) para isolar serviços críticos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.3', titulo: 'A infraestrutura é gerenciada de forma segura?', tipo: 'preventivo', obj: 'Gestão segura.', questions: [{ pergunta: 'A gestão da infraestrutura de rede é realizada apenas através de protocolos seguros e canais dedicados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.4', titulo: 'Diagramas de rede são mantidos?', tipo: 'preventivo', obj: 'Documentar rede.', questions: [{ pergunta: 'Os diagramas de topologia de rede e fluxo de dados estão atualizados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.5', titulo: 'Autenticação de rede (AAA) é centralizada?', tipo: 'preventivo', obj: 'Centralizar AAA.', questions: [{ pergunta: 'A autenticação, autorização e auditoria (AAA) de dispositivos de rede é centralizada (ex: RADIUS/TACACS+)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.6', titulo: 'Protocolos seguros são utilizados?', tipo: 'preventivo', obj: 'Protocolos seguros.', questions: [{ pergunta: 'Apenas protocolos seguros (SSH, HTTPS, SNMPv3) são utilizados para gestão e comunicação?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.7', titulo: 'Dispositivos remotos são autenticados?', tipo: 'preventivo', obj: 'Autenticar VPN/Remoto.', questions: [{ pergunta: 'Dispositivos que conectam remotamente à rede são autenticados antes de obter acesso?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '12.8', titulo: 'Recursos dedicados são usados para gestão?', tipo: 'preventivo', obj: 'Admin workstations.', questions: [{ pergunta: 'São utilizados equipamentos dedicados e seguros para atividades de administração de rede?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '13. Monitoramento e Defesa de Rede', codigo: 'CIS-13', ordem: 13, peso: 10,
            controls: [
                { codigo: '13.1', titulo: 'Alertas de segurança são centralizados?', tipo: 'detectivo', obj: 'Centralizar alertas.', questions: [{ pergunta: 'Os alertas de eventos de segurança são centralizados para análise?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.2', titulo: 'HIDS está implantado?', tipo: 'detectivo', obj: 'HIDS.', questions: [{ pergunta: 'Sistemas de Detecção de Intrusão baseados em Host (HIDS) estão implantados em ativos críticos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.3', titulo: 'NIDS está implantado?', tipo: 'detectivo', obj: 'NIDS.', questions: [{ pergunta: 'Sistemas de Detecção de Intrusão de Rede (NIDS) estão implantados nos perímetros e pontos críticos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.4', titulo: 'A filtragem de tráfego é realizada?', tipo: 'preventivo', obj: 'Filtrar tráfego.', questions: [{ pergunta: 'O tráfego de rede é filtrado entre segmentos de segurança diferentes?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.5', titulo: 'Logs de controle de acesso são monitorados?', tipo: 'detectivo', obj: 'Monitorar logs de acesso.', questions: [{ pergunta: 'Logs de dispositivos de controle de acesso (firewalls, roteadores) são coletados e monitorados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.6', titulo: 'Tráfego de rede é coletado (NetFlow)?', tipo: 'detectivo', obj: 'Coletar metadados.', questions: [{ pergunta: 'Metadados de tráfego de rede (ex: NetFlow) são coletados para análise?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.7', titulo: 'Intrusões são detectadas?', tipo: 'detectivo', obj: 'Detectar ataques.', questions: [{ pergunta: 'Existe capacidade de detectar e alertar sobre tentativas de intrusão em tempo hábil?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.8', titulo: 'Filtragem de camada de aplicação é utilizada?', tipo: 'preventivo', obj: 'WAF/Proxy.', questions: [{ pergunta: 'Filtros de camada de aplicação (WAF, Proxies) são utilizados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.9', titulo: 'Logs de rede são centralizados?', tipo: 'detectivo', obj: 'Logs de rede.', questions: [{ pergunta: 'Os logs de infraestrutura de rede são centralizados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.10', titulo: 'IDS é ajustado regularmente?', tipo: 'detectivo', obj: 'Tuning de sensores.', questions: [{ pergunta: 'Os sensores de IDS são ajustados regularmente para reduzir falsos positivos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '13.11', titulo: 'Alertas são ajustados regularmente?', tipo: 'detectivo', obj: 'Tuning de alertas.', questions: [{ pergunta: 'Os alertas de segurança são ajustados para garantir relevância?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '14. Conscientização e Treinamento em Segurança', codigo: 'CIS-14', ordem: 14, peso: 10,
            controls: [
                { codigo: '14.1', titulo: 'Programa de conscientização é mantido?', tipo: 'preventivo', obj: 'Manter programa.', questions: [{ pergunta: 'A organização mantém um programa contínuo de conscientização em segurança?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.2', titulo: 'Existe treinamento sobre Engenharia Social?', tipo: 'preventivo', obj: 'Engenharia social.', questions: [{ pergunta: 'Os colaboradores são treinados para identificar ataques de engenharia social?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.3', titulo: 'Existe treinamento sobre Autenticação?', tipo: 'preventivo', obj: 'Boas práticas de senha.', questions: [{ pergunta: 'Os colaboradores são treinados em boas práticas de autenticação e senhas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.4', titulo: 'Existe treinamento sobre Manuseio de Dados?', tipo: 'preventivo', obj: 'Dados sensíveis.', questions: [{ pergunta: 'Os colaboradores são treinados sobre como manusear e proteger dados sensíveis?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.5', titulo: 'Existe treinamento sobre Relato de Incidentes?', tipo: 'preventivo', obj: 'Relatar incidentes.', questions: [{ pergunta: 'Os colaboradores sabem como e quando relatar incidentes de segurança?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.6', titulo: 'A cultura de segurança é promovida?', tipo: 'preventivo', obj: 'Encorajar relatos.', questions: [{ pergunta: 'A organização encoraja o relato de incidentes sem medo de retaliação?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.7', titulo: 'Existe treinamento sobre Trabalho Remoto?', tipo: 'preventivo', obj: 'Trabalho remoto.', questions: [{ pergunta: 'Existe treinamento específico para práticas seguras em trabalho remoto?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.8', titulo: 'O treinamento é específico por função?', tipo: 'preventivo', obj: 'Treinamento focado.', questions: [{ pergunta: 'Colaboradores com funções específicas recebem treinamento de segurança alinhado às suas responsabilidades?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '14.9', titulo: 'Equipe de TI recebe treinamento de segurança?', tipo: 'preventivo', obj: 'Equipe de TI.', questions: [{ pergunta: 'A equipe de TI e segurança recebe treinamento técnico para desenvolver habilidades de defesa?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '15. Gestão de Provedores de Serviço', codigo: 'CIS-15', ordem: 15, peso: 10,
            controls: [
                { codigo: '15.1', titulo: 'Inventário de provedores é mantido?', tipo: 'preventivo', obj: 'Listar fornecedores.', questions: [{ pergunta: 'A organização mantém um inventário de todos os provedores de serviço terceirizados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.2', titulo: 'Existem políticas para provedores?', tipo: 'preventivo', obj: 'Política de terceiros.', questions: [{ pergunta: 'Existem políticas de segurança estabelecidas aplicáveis a provedores de serviço?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.3', titulo: 'Provedores são classificados?', tipo: 'preventivo', obj: 'Classificar risco.', questions: [{ pergunta: 'Os provedores são classificados com base no risco e criticidade para o negócio?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.4', titulo: 'Contratos incluem requisitos de segurança?', tipo: 'preventivo', obj: 'Contratos.', questions: [{ pergunta: 'Os contratos com provedores incluem cláusulas e requisitos de segurança da informação?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.5', titulo: 'Provedores são avaliados?', tipo: 'detectivo', obj: 'Avaliar segurança.', questions: [{ pergunta: 'Os provedores são avaliados quanto às suas práticas de segurança antes da contratação e periodicamente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.6', titulo: 'Provedores são monitorados?', tipo: 'detectivo', obj: 'Monitorar performance.', questions: [{ pergunta: 'A conformidade e desempenho de segurança dos provedores são monitorados?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '15.7', titulo: 'Existe processo de descomissionamento?', tipo: 'preventivo', obj: 'Saída segura.', questions: [{ pergunta: 'Existe um processo seguro para o encerramento de contratos e devolução/exclusão de dados?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '16. Segurança de Software de Aplicação', codigo: 'CIS-16', ordem: 16, peso: 10,
            controls: [
                { codigo: '16.1', titulo: 'Existe processo de SDLC Seguro?', tipo: 'preventivo', obj: 'Ciclo de vida seguro.', questions: [{ pergunta: 'A organização mantém um processo de Ciclo de Vida de Desenvolvimento Seguro (SDL)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.2', titulo: 'Existe processo de aceitação de vulnerabilidades?', tipo: 'preventivo', obj: 'Aceite de risco.', questions: [{ pergunta: 'Existe um processo formal para aceitação de riscos de vulnerabilidades conhecidas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.3', titulo: 'O risco de aplicações é avaliado?', tipo: 'detectivo', obj: 'Avaliar risco de apps.', questions: [{ pergunta: 'As aplicações são avaliadas quanto a riscos de segurança e impacto no negócio?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.4', titulo: 'Design Seguro é utilizado?', tipo: 'preventivo', obj: 'Security by design.', questions: [{ pergunta: 'Princípios de design seguro são aplicados no desenvolvimento de software?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.5', titulo: 'Codificação Segura é obrigatória?', tipo: 'preventivo', obj: 'Práticas de coding.', questions: [{ pergunta: 'Práticas de codificação segura são obrigatórias e seguidas pelos desenvolvedores?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.6', titulo: 'Análise Estática (SAST) é utilizada?', tipo: 'detectivo', obj: 'Usar SAST.', questions: [{ pergunta: 'Ferramentas de análise estática de código (SAST) são utilizadas durante o desenvolvimento?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.7', titulo: 'Análise Dinâmica (DAST) é utilizada?', tipo: 'detectivo', obj: 'Usar DAST.', questions: [{ pergunta: 'Ferramentas de análise dinâmica (DAST) são utilizadas em aplicações em execução?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.8', titulo: 'Hardening de aplicação é realizado?', tipo: 'preventivo', obj: 'Configuração segura.', questions: [{ pergunta: 'As aplicações e seus ambientes são endurecidos (hardened) antes de entrar em produção?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.9', titulo: 'Desenvolvedores são treinados?', tipo: 'preventivo', obj: 'Treinar devs.', questions: [{ pergunta: 'Os desenvolvedores recebem treinamento regular em segurança de aplicações e codificação segura?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.10', titulo: 'Inventário de componentes (SCA) é mantido?', tipo: 'preventivo', obj: 'Software Composition Analysis.', questions: [{ pergunta: 'A organização mantém um inventário de componentes e bibliotecas de terceiros (SCA)?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.11', titulo: 'Testes de segurança são realizados?', tipo: 'detectivo', obj: 'Testes de regressão.', questions: [{ pergunta: 'Testes de segurança são realizados como parte do processo de QA?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.12', titulo: 'Existe programa de Bug Bounty?', tipo: 'detectivo', obj: 'Divulgação de vulns.', questions: [{ pergunta: 'A organização possui um programa de Bug Bounty ou política de divulgação responsável?', tipo: 'sim_nao', evidencia: false }] },
                { codigo: '16.13', titulo: 'Pentest em aplicações é realizado?', tipo: 'detectivo', obj: 'Pentest de apps.', questions: [{ pergunta: 'Testes de invasão focados em aplicações são realizados periodicamente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '16.14', titulo: 'Análise de Causa Raiz é realizada?', tipo: 'corretivo', obj: 'RCA de vulns.', questions: [{ pergunta: 'É realizada análise de causa raiz para vulnerabilidades críticas identificadas?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '17. Gestão de Resposta a Incidentes', codigo: 'CIS-17', ordem: 17, peso: 10,
            controls: [
                { codigo: '17.1', titulo: 'Pessoal de resposta está designado?', tipo: 'preventivo', obj: 'Definir responsáveis.', questions: [{ pergunta: 'Existe pessoal designado e responsável pela resposta a incidentes?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.2', titulo: 'Informações de contato estão disponíveis?', tipo: 'preventivo', obj: 'Manter contatos.', questions: [{ pergunta: 'As informações de contato para reportar e escalar incidentes estão disponíveis e atualizadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.3', titulo: 'Existe processo de relato de incidentes?', tipo: 'preventivo', obj: 'Fluxo de relato.', questions: [{ pergunta: 'Existe um processo claro para que funcionários relatem eventos de segurança?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.4', titulo: 'Plano de Resposta a Incidentes é mantido?', tipo: 'preventivo', obj: 'Plano de RI.', questions: [{ pergunta: 'A organização mantém um plano de resposta a incidentes documentado?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.5', titulo: 'Papéis e responsabilidades estão definidos?', tipo: 'preventivo', obj: 'Papéis em RI.', questions: [{ pergunta: 'Os papéis e responsabilidades durante um incidente estão claramente definidos?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.6', titulo: 'O plano de comunicação existe?', tipo: 'preventivo', obj: 'Plano de coms.', questions: [{ pergunta: 'Existe um plano de comunicação para partes interessadas durante um incidente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.7', titulo: 'Exercícios de Mesa são realizados?', tipo: 'detectivo', obj: 'Testar plano.', questions: [{ pergunta: 'Exercícios de simulação de incidentes são realizados periodicamente para testar o plano?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.8', titulo: 'Lições aprendidas são registradas?', tipo: 'preventivo', obj: 'Pós-incidente.', questions: [{ pergunta: 'Uma revisão pós-incidente é conduzida para identificar lições aprendidas e melhorias?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '17.9', titulo: 'Limiares de incidente estão definidos?', tipo: 'preventivo', obj: 'Definir severidade.', questions: [{ pergunta: 'Estão definidos limiares e critérios para classificação de severidade de incidentes?', tipo: 'sim_nao', evidencia: true }] }
            ]
        },
        {
            nome: '18. Teste de Invasão (Penetration Testing)', codigo: 'CIS-18', ordem: 18, peso: 10,
            controls: [
                { codigo: '18.1', titulo: 'Programa de pentest é mantido?', tipo: 'preventivo', obj: 'Manter programa.', questions: [{ pergunta: 'A organização mantém um programa formal de testes de invasão?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '18.2', titulo: 'Pentests externos são realizados?', tipo: 'detectivo', obj: 'Pentest externo.', questions: [{ pergunta: 'Testes de invasão externos são realizados periodicamente?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '18.3', titulo: 'Descobertas são remediadas?', tipo: 'corretivo', obj: 'Corrigir falhas.', questions: [{ pergunta: 'As vulnerabilidades identificadas nos testes de invasão são remediadas?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '18.4', titulo: 'Medidas de segurança são validadas?', tipo: 'detectivo', obj: 'Validar correções.', questions: [{ pergunta: 'As correções e medidas de segurança são validadas através de novos testes?', tipo: 'sim_nao', evidencia: true }] },
                { codigo: '18.5', titulo: 'Pentests internos são realizados?', tipo: 'detectivo', obj: 'Pentest interno.', questions: [{ pergunta: 'Testes de invasão internos são realizados periodicamente?', tipo: 'sim_nao', evidencia: true }] }
            ]
        }
    ]
};

async function seedCIS() {
    console.log("🚀 Seeding CIS Controls v8 (PT-BR) (18 Controls, 153 Safeguards)...");
    const TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';
    const db = new DatabaseManager();
    if (!await db.connect()) return;
    const client = db.client;

    try {
        const fw = CIS_DATA;
        // 1. Force Clean
        const getFw = await client.query("SELECT id FROM assessment_frameworks WHERE tenant_id = $1 AND codigo = $2 AND is_standard = true", [TENANT_ID, fw.data.codigo]);
        if (getFw.rows.length > 0) {
            const fid = getFw.rows[0].id;
            console.log("  🗑️ Cleaning existing CIS...");
            const doms = await client.query("SELECT id FROM assessment_domains WHERE framework_id = $1", [fid]);
            const domIds = doms.rows.map(d => d.id);
            if (domIds.length > 0) {
                const ctrls = await client.query("SELECT id FROM assessment_controls WHERE domain_id = ANY($1)", [domIds]);
                const ctrlIds = ctrls.rows.map(c => c.id);
                if (ctrlIds.length > 0) {
                    await client.query("DELETE FROM assessment_questions WHERE control_id = ANY($1)", [ctrlIds]);
                    await client.query("DELETE FROM assessment_controls WHERE domain_id = ANY($1)", [domIds]);
                }
                await client.query("DELETE FROM assessment_domains WHERE framework_id = $1", [fid]);
            }
            await client.query("DELETE FROM assessment_frameworks WHERE id = $1", [fid]);
        }

        // 2. Insert
        const fwRes = await client.query(
            `INSERT INTO assessment_frameworks (tenant_id, nome, codigo, descricao, versao, tipo_framework, categoria, is_standard, publico, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [TENANT_ID, fw.data.nome, fw.data.codigo, fw.data.descricao, fw.data.versao, fw.data.tipo_framework, fw.data.categoria, true, true, 'ativo']
        );
        const fwId = fwRes.rows[0].id;

        for (const d of fw.domains) {
            const dRes = await client.query(
                `INSERT INTO assessment_domains (framework_id, nome, codigo, descricao, ordem, peso, tenant_id, ativo)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [fwId, d.nome, d.codigo, 'Control Domain: ' + d.nome, d.ordem, d.peso, TENANT_ID, true]
            );
            const dId = dRes.rows[0].id;

            let controlOrder = 1;
            for (const c of d.controls) {
                const cRes = await client.query(
                    `INSERT INTO assessment_controls (domain_id, framework_id, codigo, titulo, descricao, objetivo, tipo_controle, criticidade, peso, ordem, tenant_id, ativo)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                    [dId, fwId, c.codigo, c.titulo, c.titulo, c.obj, c.tipo, 'alta', 10, controlOrder++, TENANT_ID, true]
                );
                const cId = cRes.rows[0].id;
                for (const q of c.questions) {
                    await client.query(
                        `INSERT INTO assessment_questions (control_id, texto, tipo_pergunta, evidencias_requeridas, opcoes_resposta, peso, ordem, tenant_id, codigo, ativa)
                          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                        [cId, q.pergunta, q.tipo, q.evidencia, q.opcoes ? JSON.stringify(q.opcoes) : null, 1, 1, TENANT_ID, c.codigo + '-Q', true]
                    );
                }
            }
        }
        console.log("🎉 CIS v8 seeded!");
    } catch (e) { console.error(e); } finally { await db.disconnect(); }
}
seedCIS();
