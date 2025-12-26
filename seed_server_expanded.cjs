const DatabaseManager = require('./database-manager.cjs');

// === EXPANDED FRAMEWORK DATA ===
// ISO 27001 is already good (93 controls), but included for completeness (using existing).
// Others are expanded to meet "market best practices".

const FRAMEWORKS = [
    // --- NIST CSF 2.0 (Expanded to ~40 Categories) ---
    {
        data: {
            nome: 'NIST Cybersecurity Framework 2.0', codigo: 'NIST-CSF-2.0', descricao: 'Framework para redução de riscos de infraestrutura crítica (Completo)', versao: '2.0', tipo_framework: 'NIST', categoria: 'Cibersegurança', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            {
                nome: 'Governança (GOVERN)', codigo: 'GV', ordem: 1, peso: 15,
                controls: [
                    { codigo: 'GV.OC-01', titulo: 'Missão e Objetivos', tipo: 'preventivo', obj: 'A missão organizacional é compreendida.', questions: [{ pergunta: 'A missão, objetivos e metas da organização são claramente compreendidos e comunicados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GV.OC-02', titulo: 'Apetite ao Risco', tipo: 'diretivo', obj: 'O apetite ao risco é definido.', questions: [{ pergunta: 'O apetite ao risco e a tolerância ao risco foram definidos e comunicados?', tipo: 'escala_1_5', evidencia: true }] },
                    { codigo: 'GV.OC-03', titulo: 'Requisitos Legais', tipo: 'preventivo', obj: 'Conformidade legal.', questions: [{ pergunta: 'Os requisitos legais, regulatórios e contratuais são identificados e gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GV.RM-01', titulo: 'Estratégia de Gestão de Risco', tipo: 'preventivo', obj: 'Estratégia de risco.', questions: [{ pergunta: 'Existe uma estratégia de gestão de riscos de cibersegurança estabelecida e monitorada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GV.RM-02', titulo: 'Risco da Cadeia de Suprimentos', tipo: 'preventivo', obj: 'Risco de terceiros.', questions: [{ pergunta: 'Os riscos da cadeia de suprimentos são identificados, avaliados e gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GV.RR-01', titulo: 'Papéis e Responsabilidades', tipo: 'preventivo', obj: 'Roles & Responsibilities.', questions: [{ pergunta: 'As funções e responsabilidades de cibersegurança estão definidas e atribuídas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GV.PO-01', titulo: 'Políticas Organizacionais', tipo: 'diretivo', obj: 'Políticas.', questions: [{ pergunta: 'As políticas de cibersegurança são estabelecidas, comunicadas e revisadas regularmente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GV.SC-01', titulo: 'Supervisão da Cibersegurança', tipo: 'detectivo', obj: 'Oversight.', questions: [{ pergunta: 'Existe supervisão da estratégia de cibersegurança pela alta direção?', tipo: 'sim_nao', evidencia: false }] }
                ]
            },
            {
                nome: 'Identificação (IDENTIFY)', codigo: 'ID', ordem: 2, peso: 15,
                controls: [
                    { codigo: 'ID.AM-01', titulo: 'Inventário de Ativos Físicos', tipo: 'preventivo', obj: 'Asset Mgmt.', questions: [{ pergunta: 'Os ativos físicos e dispositivos da organização são inventariados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ID.AM-02', titulo: 'Inventário de Software', tipo: 'preventivo', obj: 'Software Mgmt.', questions: [{ pergunta: 'As plataformas de software e aplicativos são inventariados e gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ID.AM-03', titulo: 'Classificação de Dados', tipo: 'preventivo', obj: 'Data Classification.', questions: [{ pergunta: 'Os dados são categorizados e classificados com base na sua sensibilidade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ID.RA-01', titulo: 'Avaliação de Vulnerabilidades', tipo: 'detectivo', obj: 'Vuln Assessment.', questions: [{ pergunta: 'As vulnerabilidades dos ativos são identificadas e documentadas?', tipo: 'escala_1_5', evidencia: true }] },
                    { codigo: 'ID.RA-02', titulo: 'Inteligência de Ameaças', tipo: 'detectivo', obj: 'Threat Intel.', questions: [{ pergunta: 'Informações sobre ameaças e vulnerabilidades são recebidas de fontes externas?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'ID.RA-03', titulo: 'Probabilidade e Impacto', tipo: 'preventivo', obj: 'Risk Analysis.', questions: [{ pergunta: 'A probabilidade e o impacto de eventos de risco são analisados?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Proteção (PROTECT)', codigo: 'PR', ordem: 3, peso: 20,
                controls: [
                    { codigo: 'PR.AA-01', titulo: 'Gestão de Identidade (IAM)', tipo: 'preventivo', obj: 'IAM.', questions: [{ pergunta: 'As identidades e credenciais são gerenciadas para usuários e dispositivos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'PR.AA-02', titulo: 'Controle de Acesso Físico', tipo: 'preventivo', obj: 'Physical Access.', questions: [{ pergunta: 'O acesso físico aos ativos é gerenciado e protegido?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'PR.AA-03', titulo: 'Acesso Remoto Seguro', tipo: 'preventivo', obj: 'Remote Access.', questions: [{ pergunta: 'O acesso remoto é gerenciado e protegido (ex: VPN, MFA)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'PR.AA-04', titulo: 'Princípio do Menor Privilégio', tipo: 'preventivo', obj: 'Least Privilege.', questions: [{ pergunta: 'Os direitos de acesso são concedidos com base no princípio do menor privilégio?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'PR.DS-01', titulo: 'Proteção de Dados em Repouso', tipo: 'preventivo', obj: 'Data at Rest.', questions: [{ pergunta: 'Os dados em repouso são protegidos (ex: criptografia)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'PR.DS-02', titulo: 'Proteção de Dados em Trânsito', tipo: 'preventivo', obj: 'Data in Transit.', questions: [{ pergunta: 'Os dados em trânsito são protegidos (ex: TLS)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'PR.PS-01', titulo: 'Configurações de Segurança (Hardening)', tipo: 'preventivo', obj: 'Hardening.', questions: [{ pergunta: 'Configurações de segurança são estabelecidas e mantidas (Hardening)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'PR.PS-02', titulo: 'Gestão de Software e Patches', tipo: 'preventivo', obj: 'Patch Mgmt.', questions: [{ pergunta: 'O software é mantido atualizado e livre de vulnerabilidades conhecidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'PR.IR-01', titulo: 'Backups de Dados', tipo: 'preventivo', obj: 'Resilience.', questions: [{ pergunta: 'Backups de informações são conduzidos, mantidos e testados?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Detecção (DETECT)', codigo: 'DE', ordem: 4, peso: 15,
                controls: [
                    { codigo: 'DE.AE-01', titulo: 'Monitoramento de Eventos (SIEM)', tipo: 'detectivo', obj: 'Monitoring.', questions: [{ pergunta: 'Eventos de anomalia são detectados e analisados?', tipo: 'escala_1_5', evidencia: true }] },
                    { codigo: 'DE.CM-01', titulo: 'Monitoramento de Rede', tipo: 'detectivo', obj: 'Network Monitoring.', questions: [{ pergunta: 'A rede é monitorada para detectar atividades maliciosas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'DE.CM-02', titulo: 'Antimalware e Endpoint', tipo: 'detectivo', obj: 'Endpoint Detect.', questions: [{ pergunta: 'Código malicioso é detectado em endpoints?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Resposta (RESPOND)', codigo: 'RS', ordem: 5, peso: 15,
                controls: [
                    { codigo: 'RS.MA-01', titulo: 'Plano de Resposta a Incidentes', tipo: 'preventivo', obj: 'IR Plan.', questions: [{ pergunta: 'O plano de resposta a incidentes é executado durante ou após um evento?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'RS.AN-01', titulo: 'Análise de Incidentes', tipo: 'corretivo', obj: 'Incident Analysis.', questions: [{ pergunta: 'Os incidentes são analisados para entender impacto e causa raiz?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'RS.CO-01', titulo: 'Comunicação de Incidentes', tipo: 'corretivo', obj: 'Communication.', questions: [{ pergunta: 'As partes interessadas são notificadas sobre o incidente conforme necessário?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'RS.MI-01', titulo: 'Mitigação de Incidentes', tipo: 'corretivo', obj: 'Mitigation.', questions: [{ pergunta: 'Atividades são realizadas para impedir a expansão do incidente?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Recuperação (RECOVER)', codigo: 'RC', ordem: 6, peso: 10,
                controls: [
                    { codigo: 'RC.RP-01', titulo: 'Plano de Recuperação', tipo: 'corretivo', obj: 'Recovery Plan.', questions: [{ pergunta: 'O plano de recuperação é executado após um incidente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'RC.IM-01', titulo: 'Melhoria da Recuperação', tipo: 'preventivo', obj: 'Improvement.', questions: [{ pergunta: 'Os planos de recuperação incorporam lições aprendidas?', tipo: 'sim_nao', evidencia: false }] }
                ]
            }
        ]
    },
    // --- PCI DSS 4.0 (Expanded to ~30 Key Controls) ---
    {
        data: {
            nome: 'PCI DSS 4.0', codigo: 'PCI-DSS-4.0', descricao: 'Padrão de Segurança de Dados para a Indústria de Cartões de Pagamento (Expanded)', versao: '4.0', tipo_framework: 'PCI_DSS', categoria: 'Pagamentos', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            {
                nome: 'Req 1: Segurança de Rede', codigo: 'REQ-1', ordem: 1, peso: 8, controls: [
                    { codigo: '1.1.2', titulo: 'Funções de segurança de rede', tipo: 'preventivo', obj: 'Roles.', questions: [{ pergunta: 'As funções e responsabilidades para gerenciar a segurança de rede estão definidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '1.2.1', titulo: 'Regras de Firewall (NSC)', tipo: 'preventivo', obj: 'Configuração.', questions: [{ pergunta: 'A configuração dos Controles de Segurança de Rede (NSC) restringe o tráfego apenas ao necessário?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '1.3.1', titulo: 'Acesso direto proibido', tipo: 'preventivo', obj: 'DMZ.', questions: [{ pergunta: 'O acesso público direto ao ambiente de dados de cartão (CDE) é proibido (uso de DMZ)?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 2: Configurações Seguras', codigo: 'REQ-2', ordem: 2, peso: 8, controls: [
                    { codigo: '2.2.1', titulo: 'Padrões de Configuração', tipo: 'preventivo', obj: 'Standards.', questions: [{ pergunta: 'Padrões de configuração segura são desenvolvidos e mantidos para todos os componentes?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '2.2.2', titulo: 'Senhas padrão removidas', tipo: 'preventivo', obj: 'Defaults.', questions: [{ pergunta: 'As senhas e contas padrão de fornecedores foram removidas ou alteradas antes da instalação?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 3: Proteção de Dados de Conta', codigo: 'REQ-3', ordem: 3, peso: 10, controls: [
                    { codigo: '3.2.1', titulo: 'Retenção de Dados', tipo: 'preventivo', obj: 'Retention.', questions: [{ pergunta: 'O armazenamento de dados de conta é mantido ao mínimo e purgado periodicamente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '3.3.1', titulo: 'SAD não armazenado', tipo: 'preventivo', obj: 'SAD.', questions: [{ pergunta: 'Dados sensíveis de autenticação (SAD) não são armazenados após a autorização?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '3.5.1', titulo: 'Criptografia PAN', tipo: 'preventivo', obj: 'Encryption.', questions: [{ pergunta: 'O PAN é tornado ilegível em qualquer local de armazenamento (criptografia/hash)?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 4: Transmissão Segura', codigo: 'REQ-4', ordem: 4, peso: 8, controls: [
                    { codigo: '4.2.1', titulo: 'Criptografia forte em redes públicas', tipo: 'preventivo', obj: 'TLS.', questions: [{ pergunta: 'Criptografia forte é usada para transmitir PAN sobre redes públicas abertas?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 5: Proteção contra Malware', codigo: 'REQ-5', ordem: 5, peso: 8, controls: [
                    { codigo: '5.2.1', titulo: 'Solução Antimalware', tipo: 'detectivo', obj: 'AV.', questions: [{ pergunta: 'Uma solução antimalware é implantada em todos os sistemas em risco?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '5.3.2', titulo: 'Verificações periódicas', tipo: 'detectivo', obj: 'Scans.', questions: [{ pergunta: 'O antimalware realiza verificações periódicas ou monitoramento contínuo?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 6: Sistemas Seguros', codigo: 'REQ-6', ordem: 6, peso: 8, controls: [
                    { codigo: '6.3.1', titulo: 'Vulnerabilidades de segurança', tipo: 'preventivo', obj: 'Vuln DB.', questions: [{ pergunta: 'Vulnerabilidades de segurança são identificadas e classificadas quanto ao risco?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '6.3.3', titulo: 'Correção de Patches', tipo: 'corretivo', obj: 'Patching.', questions: [{ pergunta: 'Patches críticos de segurança são instalados dentro de 1 ano do lançamento?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '6.4.2', titulo: 'WAF', tipo: 'preventivo', obj: 'Web App Firewall.', questions: [{ pergunta: 'Ataques web são detectados e prevenidos (ex: uso de WAF)?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 7: Restrição de Acesso', codigo: 'REQ-7', ordem: 7, peso: 8, controls: [
                    { codigo: '7.2.1', titulo: 'Modelo de Acesso', tipo: 'preventivo', obj: 'RBAC.', questions: [{ pergunta: 'Existe um modelo de controle de acesso baseado em funções (RBAC)?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 8: Identificação e Autenticação', codigo: 'REQ-8', ordem: 8, peso: 8, controls: [
                    { codigo: '8.2.1', titulo: 'IDs Únicos', tipo: 'preventivo', obj: 'Unique ID.', questions: [{ pergunta: 'Cada usuário com acesso possui um ID único?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '8.3.1', titulo: 'Autenticação Forte', tipo: 'preventivo', obj: 'Strong Auth.', questions: [{ pergunta: 'Todos os acessos são autenticados via senha, token ou biometria?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '8.4.1', titulo: 'MFA', tipo: 'preventivo', obj: 'Multi-Factor.', questions: [{ pergunta: 'MFA é exigido para todo acesso ao CDE?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 9: Acesso Físico', codigo: 'REQ-9', ordem: 9, peso: 8, controls: [
                    { codigo: '9.2.1', titulo: 'Controle de Instalações', tipo: 'preventivo', obj: 'Facilities.', questions: [{ pergunta: 'Controles de entrada monitoram e restringem acesso às instalações?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '9.4.1', titulo: 'Visitantes', tipo: 'preventivo', obj: 'Visitor Mgmt.', questions: [{ pergunta: 'Visitantes são identificados e acompanhados dentro de áreas sensíveis?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 10: Log e Monitoramento', codigo: 'REQ-10', ordem: 10, peso: 8, controls: [
                    { codigo: '10.2.1', titulo: 'Logs de Auditoria', tipo: 'detectivo', obj: 'Audit Trails.', questions: [{ pergunta: 'Logs de auditoria capturam todos os eventos de segurança e acessos ao CDE?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '10.4.1', titulo: 'Revisão de Logs', tipo: 'detectivo', obj: 'Review.', questions: [{ pergunta: 'Logs de sistemas críticos são revisados diariamente?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 11: Testes de Segurança', codigo: 'REQ-11', ordem: 11, peso: 8, controls: [
                    { codigo: '11.3.1', titulo: 'Varredura de Vulnerabilidade Interna', tipo: 'detectivo', obj: 'Internal Scan.', questions: [{ pergunta: 'Varreduras de vulnerabilidade internas são realizadas trimestralmente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '11.4.1', titulo: 'Testes de Penetração', tipo: 'detectivo', obj: 'Pentest.', questions: [{ pergunta: 'Testes de penetração (Pentest) são realizados anualmente?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Req 12: Gestão de Políticas', codigo: 'REQ-12', ordem: 12, peso: 10, controls: [
                    { codigo: '12.3.1', titulo: 'Análise de Risco', tipo: 'preventivo', obj: 'Risk Assessment.', questions: [{ pergunta: 'Uma análise de risco formal é realizada anualmente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: '12.6.1', titulo: 'Treinamento de Conscientização', tipo: 'preventivo', obj: 'Awareness.', questions: [{ pergunta: 'Um programa de conscientização de segurança é implementado para o pessoal?', tipo: 'sim_nao', evidencia: true }] }
                ]
            }
        ]
    },
    // --- LGPD (Expanded to ~25 Key Articles) ---
    {
        data: {
            nome: 'Lei Geral de Proteção de Dados (LGPD)', codigo: 'LGPD-BR', descricao: 'Conformidade de privacidade baseada na Lei 13.709/2018 (Expandido)', versao: '2024', tipo_framework: 'LGPD', categoria: 'Privacidade de Dados', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            {
                nome: 'Princípios (Art. 6)', codigo: 'PRIN', ordem: 1, peso: 15,
                controls: [
                    { codigo: 'ART.6-I', titulo: 'Finalidade', tipo: 'preventivo', obj: 'Propósitos legítimos.', questions: [{ pergunta: 'O tratamento de dados é realizado para propósitos legítimos, específicos e explícitos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.6-II', titulo: 'Adequação', tipo: 'preventivo', obj: 'Compatibilidade.', questions: [{ pergunta: 'O tratamento é compatível com as finalidades informadas ao titular?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.6-III', titulo: 'Necessidade', tipo: 'preventivo', obj: 'Minimização.', questions: [{ pergunta: 'O tratamento é limitado ao mínimo necessário para a realização de suas finalidades?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.6-V', titulo: 'Qualidade dos Dados', tipo: 'preventivo', obj: 'Exatidão.', questions: [{ pergunta: 'É garantida a exatidão, clareza e atualização dos dados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.6-VI', titulo: 'Transparência', tipo: 'preventivo', obj: 'Clareza.', questions: [{ pergunta: 'São garantidas informações claras e precisas aos titulares sobre o tratamento?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.6-VII', titulo: 'Segurança', tipo: 'preventivo', obj: 'Medidas técnicas.', questions: [{ pergunta: 'São utilizadas medidas técnicas e administrativas aptas a proteger os dados pessoais?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.6-X', titulo: 'Responsabilização', tipo: 'detectivo', obj: 'Prestação de contas.', questions: [{ pergunta: 'O agente demonstra a adoção de medidas eficazes e capazes de comprovar a observância da lei?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Requisitos de Tratamento (Art. 7-14)', codigo: 'REQ', ordem: 2, peso: 15,
                controls: [
                    { codigo: 'ART.7', titulo: 'Bases Legais', tipo: 'preventivo', obj: 'Legalidade.', questions: [{ pergunta: 'Todas as atividades de tratamento estão enquadradas em uma das bases legais do Art. 7?', tipo: 'escala_1_5', evidencia: true }] },
                    { codigo: 'ART.8', titulo: 'Consentimento', tipo: 'preventivo', obj: 'Consentimento válido.', questions: [{ pergunta: 'O consentimento é fornecido por escrito ou por outro meio que demonstre a manifestação de vontade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.11', titulo: 'Dados Sensíveis', tipo: 'preventivo', obj: 'Proteção extra.', questions: [{ pergunta: 'O tratamento de dados sensíveis ocorre apenas nas hipóteses previstas no Art. 11?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.14', titulo: 'Dados de Crianças', tipo: 'preventivo', obj: 'Melhor interesse.', questions: [{ pergunta: 'O tratamento de dados de crianças é realizado em seu melhor interesse e com consentimento dos pais?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Direitos do Titular (Art. 18)', codigo: 'DIR', ordem: 3, peso: 20,
                controls: [
                    { codigo: 'ART.18-I', titulo: 'Confirmação de existência', tipo: 'corretivo', obj: 'Direito de saber.', questions: [{ pergunta: 'A organização confirma a existência de tratamento quando solicitado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.18-II', titulo: 'Acesso aos dados', tipo: 'corretivo', obj: 'Acesso.', questions: [{ pergunta: 'A organização fornece acesso aos dados pessoais mediante requisição?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.18-III', titulo: 'Correção de dados', tipo: 'corretivo', obj: 'Retificação.', questions: [{ pergunta: 'Existe processo para correção de dados incompletos, inexatos ou desatualizados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.18-VI', titulo: 'Eliminação de dados', tipo: 'corretivo', obj: 'Exclusão.', questions: [{ pergunta: 'A eliminação dos dados tratados com consentimento é realizada quando solicitada (salvo exceções)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.19', titulo: 'Prazo de Resposta', tipo: 'corretivo', obj: 'SLA.', questions: [{ pergunta: 'As solicitações dos titulares são atendidas nos prazos legais (imediato ou 15 dias)?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Segurança e Boas Práticas (Art. 46-50)', codigo: 'SEC', ordem: 4, peso: 25,
                controls: [
                    { codigo: 'ART.46', titulo: 'Medidas de Segurança', tipo: 'preventivo', obj: 'Segurança.', questions: [{ pergunta: 'Medidas de segurança, técnicas e administrativas foram implementadas?', tipo: 'escala_1_5', evidencia: true }] },
                    { codigo: 'ART.48', titulo: 'Comunicação de Incidentes', tipo: 'corretivo', obj: 'Notificação.', questions: [{ pergunta: 'Incidentes que possam acarretar risco ou dano são comunicados à ANPD e aos titulares?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.41', titulo: 'Encarregado (DPO)', tipo: 'preventivo', obj: 'DPO.', questions: [{ pergunta: 'A organização indicou um Encarregado (DPO) e divulgou seus contatos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.38', titulo: 'Relatório de Impacto (RIPD)', tipo: 'preventivo', obj: 'DPIA.', questions: [{ pergunta: 'O Relatório de Impacto à Proteção de Dados Pessoais (RIPD) é elaborado para tratamentos de risco?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.50', titulo: 'Boas Práticas e Governança', tipo: 'preventivo', obj: 'Compliance program.', questions: [{ pergunta: 'A organização implementou um programa de governança em privacidade?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Transferência Internacional (Art. 33)', codigo: 'INT', ordem: 5, peso: 10,
                controls: [
                    { codigo: 'ART.33-I', titulo: 'Mecanismos de Transferência', tipo: 'preventivo', obj: 'Legalidade internacional.', questions: [{ pergunta: 'As transferências internacionais ocorrem apenas para países com grau de proteção adequado ou mediante garantias?', tipo: 'sim_nao', evidencia: true }] }
                ]
            }
        ]
    },
    // --- COBIT 2019 (Expanded Key Objectives) ---
    {
        data: {
            nome: 'COBIT 2019 Enterprise Edition', codigo: 'COBIT-2019', descricao: 'Framework de governança e gestão de TI corporativo (Expanded)', versao: '2019', tipo_framework: 'COBIT', categoria: 'Governança de TI', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            {
                nome: 'EDM - Avaliar, Dirigir e Monitorar', codigo: 'EDM', ordem: 1, peso: 20, controls: [
                    { codigo: 'EDM01', titulo: 'Garantir Definição de Governança', tipo: 'preventivo', obj: 'Governance Setting.', questions: [{ pergunta: 'Um sistema de governança foi projetado e implementado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'EDM02', titulo: 'Garantir Realização de Benefícios', tipo: 'diretivo', obj: 'Value Delivery.', questions: [{ pergunta: 'A entrega de valor dos investimentos em TI é monitorada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'EDM03', titulo: 'Garantir Otimização de Riscos', tipo: 'preventivo', obj: 'Risk Optimization.', questions: [{ pergunta: 'O apetite ao risco da organização é avaliado e gerenciado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'EDM04', titulo: 'Garantir Otimização de Recursos', tipo: 'preventivo', obj: 'Resource Optimization.', questions: [{ pergunta: 'Os recursos de TI são gerenciados para atender às necessidades atuais e futuras?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'EDM05', titulo: 'Garantir Engajamento das Partes Interessadas', tipo: 'preventivo', obj: 'Stakeholder.', questions: [{ pergunta: 'As partes interessadas são comunicadas e engajadas sobre o desempenho de TI?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'APO - Alinhar, Planejar e Organizar', codigo: 'APO', ordem: 2, peso: 20, controls: [
                    { codigo: 'APO01', titulo: 'Gerenciar Estrutura de Gestão de I&T', tipo: 'preventivo', obj: 'Org Structure.', questions: [{ pergunta: 'As estruturas organizacionais de TI estão estabelecidas e mantidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'APO03', titulo: 'Gerenciar Arquitetura Empresarial', tipo: 'preventivo', obj: 'Enterprise Arch.', questions: [{ pergunta: 'A arquitetura empresarial é gerenciada para alinhar TI e negócios?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'APO09', titulo: 'Gerenciar Serviços de Acordos', tipo: 'preventivo', obj: 'SLA.', questions: [{ pergunta: 'Os acordos de nível de serviço (SLA) são definidos e gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'APO12', titulo: 'Gerenciar Riscos', tipo: 'preventivo', obj: 'Risk Mgmt.', questions: [{ pergunta: 'Existe um processo para gerenciar riscos relacionados a I&T?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'APO13', titulo: 'Gerenciar Segurança', tipo: 'preventivo', obj: 'Security Mgmt.', questions: [{ pergunta: 'Um Sistema de Gestão de Segurança da Informação (SGSI) é mantido?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'APO14', titulo: 'Gerenciar Dados', tipo: 'preventivo', obj: 'Data Mgmt.', questions: [{ pergunta: 'Os dados são gerenciados como um ativo corporativo?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'BAI - Construir, Adquirir e Implementar', codigo: 'BAI', ordem: 3, peso: 20, controls: [
                    { codigo: 'BAI02', titulo: 'Gerenciar Definição de Requisitos', tipo: 'preventivo', obj: 'Requirements.', questions: [{ pergunta: 'Os requisitos de soluções são identificados e analisados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'BAI06', titulo: 'Gerenciar Mudanças de TI', tipo: 'preventivo', obj: 'Change Mgmt.', questions: [{ pergunta: 'As mudanças de TI são gerenciadas de forma controlada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'BAI10', titulo: 'Gerenciar Configuração', tipo: 'preventivo', obj: 'CMDB.', questions: [{ pergunta: 'Os itens de configuração (CIs) são identificados e controlados?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'DSS - Entregar, Servir e Suportar', codigo: 'DSS', ordem: 4, peso: 20, controls: [
                    { codigo: 'DSS01', titulo: 'Gerenciar Operações', tipo: 'preventivo', obj: 'Ops.', questions: [{ pergunta: 'Os procedimentos operacionais de TI são executados conforme planejado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'DSS02', titulo: 'Gerenciar Requisições e Incidentes', tipo: 'corretivo', obj: 'Service Desk.', questions: [{ pergunta: 'Incidentes de serviço são resolvidos em tempo hábil?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'DSS04', titulo: 'Gerenciar Continuidade', tipo: 'corretivo', obj: 'BCP.', questions: [{ pergunta: 'Planos de continuidade de negócios são testados regularmente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'DSS05', titulo: 'Gerenciar Serviços de Segurança', tipo: 'preventivo', obj: 'Security Ops.', questions: [{ pergunta: 'Os serviços de segurança são operados para proteger a empresa?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'MEA - Monitorar, Avaliar e Analisar', codigo: 'MEA', ordem: 5, peso: 20, controls: [
                    { codigo: 'MEA01', titulo: 'Monitorar Desempenho e Conformidade', tipo: 'detectivo', obj: 'Compliance.', questions: [{ pergunta: 'O desempenho e a conformidade de TI são monitorados e reportados?', tipo: 'sim_nao', evidencia: true }] }
                ]
            }
        ]
    },
    // --- ITIL 4 (Expanded Practices) ---
    {
        data: {
            nome: 'ITIL 4 Service Management', codigo: 'ITIL-4', descricao: 'Melhores práticas para gerenciamento de serviços de TI (Expanded)', versao: '4', tipo_framework: 'ITIL', categoria: 'Gestão de Serviços', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            {
                nome: 'Práticas Gerais', codigo: 'GEN', ordem: 1, peso: 30, controls: [
                    { codigo: 'GEN.1', titulo: 'Gestão de Estratégia', tipo: 'preventivo', obj: 'Strategy.', questions: [{ pergunta: 'A estratégia de serviços está alinhada com os objetivos de negócio?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GEN.2', titulo: 'Gestão de Portfólio', tipo: 'preventivo', obj: 'Portfolio.', questions: [{ pergunta: 'O portfólio de serviços é gerenciado e otimizado?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'GEN.3', titulo: 'Gestão de Relacionamento', tipo: 'preventivo', obj: 'BRM.', questions: [{ pergunta: 'Os relacionamentos com partes interessadas são gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GEN.4', titulo: 'Gestão da Segurança da Informação', tipo: 'preventivo', obj: 'ISM.', questions: [{ pergunta: 'Os riscos de segurança da informação são gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'GEN.5', titulo: 'Gestão de Fornecedores', tipo: 'preventivo', obj: 'Supplier.', questions: [{ pergunta: 'O desempenho dos fornecedores é gerenciado adequadamente?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Práticas de Serviço', codigo: 'SERV', ordem: 2, peso: 40, controls: [
                    { codigo: 'SERV.1', titulo: 'Service Desk', tipo: 'detectivo', obj: 'SPOC.', questions: [{ pergunta: 'Existe um Service Desk centralizado para usuários?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'SERV.2', titulo: 'Gestão de Incidentes', tipo: 'corretivo', obj: 'Incidents.', questions: [{ pergunta: 'Incidentes são registrados, classificados e resolvidos rapidamente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'SERV.3', titulo: 'Gestão de Problemas', tipo: 'preventivo', obj: 'Problems.', questions: [{ pergunta: 'Causas raízes de incidentes são investigadas (Gestão de Problemas)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'SERV.4', titulo: 'Gestão de Requisições', tipo: 'preventivo', obj: 'Requests.', questions: [{ pergunta: 'Existe um processo formal para tratar requisições de serviço?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'SERV.5', titulo: 'Gestão de Nível de Serviço', tipo: 'preventivo', obj: 'SLA.', questions: [{ pergunta: 'Os níveis de serviço são acordados e monitorados (SLA)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'SERV.6', titulo: 'Gestão de Configuração', tipo: 'preventivo', obj: 'CMS.', questions: [{ pergunta: 'A configuração dos serviços é registrada e mantida?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'SERV.7', titulo: 'Gestão de Liberação', tipo: 'preventivo', obj: 'Release.', questions: [{ pergunta: 'As liberações de serviços são planejadas e aprovadas?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Práticas Técnicas', codigo: 'TECH', ordem: 3, peso: 30, controls: [
                    { codigo: 'TECH.1', titulo: 'Gestão de Implantação', tipo: 'preventivo', obj: 'Deployment.', questions: [{ pergunta: 'A implantação de hardware e software é controlada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'TECH.2', titulo: 'Gestão de Infraestrutura', tipo: 'preventivo', obj: 'Infra.', questions: [{ pergunta: 'A infraestrutura de TI e plataformas são monitoradas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'TECH.3', titulo: 'Desenvolvimento de Software', tipo: 'preventivo', obj: 'Dev.', questions: [{ pergunta: 'O desenvolvimento de software segue padrões de qualidade?', tipo: 'sim_nao', evidencia: true }] }
                ]
            }
        ]
    },
    // --- SOX ITGC (Expanded) ---
    {
        data: {
            nome: 'SOX IT General Controls', codigo: 'SOX-ITGC', descricao: 'Controles Gerais de TI para conformidade Sarbanes-Oxley (Expanded)', versao: '2024', tipo_framework: 'SOX', categoria: 'Financeiro', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            {
                nome: 'Segurança Lógica (Access)', codigo: 'AC', ordem: 1, peso: 30, controls: [
                    { codigo: 'AC.1', titulo: 'Aprovação de Acesso', tipo: 'preventivo', obj: 'New Hire.', questions: [{ pergunta: 'O acesso de novos usuários é formalmente aprovado pela gestão?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'AC.2', titulo: 'Revogação de Acesso', tipo: 'preventivo', obj: 'Terminations.', questions: [{ pergunta: 'O acesso de funcionários desligados é revogado tempestivamente (ex: 24h)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'AC.3', titulo: 'Revisão Periódica', tipo: 'detectivo', obj: 'User Review.', questions: [{ pergunta: 'Os direitos de acesso são revisados periodicamente (ex: trimestralmente)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'AC.4', titulo: 'Acesso Privilegiado', tipo: 'preventivo', obj: 'Admin.', questions: [{ pergunta: 'O acesso administrativo é restrito ao pessoal autorizado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'AC.5', titulo: 'Complexidade de Senha', tipo: 'preventivo', obj: 'Password.', questions: [{ pergunta: 'Configurações de complexidade e expiração de senha são aplicadas?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Gestão de Mudanças (Change)', codigo: 'CM', ordem: 2, peso: 30, controls: [
                    { codigo: 'CM.1', titulo: 'Autorização de Mudança', tipo: 'preventivo', obj: 'Authorization.', questions: [{ pergunta: 'Todas as mudanças em produção são autorizadas antes da implementação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'CM.2', titulo: 'Teste de Mudança', tipo: 'preventivo', obj: 'Testing.', questions: [{ pergunta: 'As mudanças são testadas e validadas (UAT) antes da produção?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'CM.3', titulo: 'Segregação de Funções (SoD)', tipo: 'preventivo', obj: 'SoD.', questions: [{ pergunta: 'Desenvolvedores não têm acesso para promover código à produção (SoD)?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'CM.4', titulo: 'Mudanças Emergenciais', tipo: 'detectivo', obj: 'Emergency.', questions: [{ pergunta: 'Mudanças emergenciais são documentadas e aprovadas retroativamente?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Operações de TI (Ops)', codigo: 'OPS', ordem: 3, peso: 20, controls: [
                    { codigo: 'OPS.1', titulo: 'Monitoramento de Jobs', tipo: 'detectivo', obj: 'Batch.', questions: [{ pergunta: 'Falhas em processamentos batch financeiros são monitoradas e resolvidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'OPS.2', titulo: 'Gestão de Backup', tipo: 'preventivo', obj: 'Backup.', questions: [{ pergunta: 'Backups de dados financeiros são realizados e testados regularmente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'OPS.3', titulo: 'Gestão de Incidentes', tipo: 'corretivo', obj: 'Incidents.', questions: [{ pergunta: 'Incidentes que afetam dados financeiros são gerenciados?', tipo: 'sim_nao', evidencia: true }] }
                ]
            }
        ]
    },
    // --- GDPR (Re-using expanded LGPD structure logic adapted) ---
    {
        data: {
            nome: 'GDPR - General Data Protection Regulation', codigo: 'GDPR-EU', descricao: 'Regulamento Geral sobre a Proteção de Dados (EU Expanded)', versao: '2018', tipo_framework: 'GDPR', categoria: 'Privacidade', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            {
                nome: 'Principles', codigo: 'PRIN', ordem: 1, peso: 20, controls: [
                    { codigo: 'ART.5', titulo: 'Data Processing Principles', tipo: 'preventivo', obj: 'Principles.', questions: [{ pergunta: 'Are personal data processed lawfully, fairly and transparently?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Rights of Data Subject', codigo: 'RIGHTS', ordem: 2, peso: 20, controls: [
                    { codigo: 'ART.15', titulo: 'Right of Access', tipo: 'corretivo', obj: 'Access.', questions: [{ pergunta: 'Can the organization provide copies of personal data upon request?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.17', titulo: 'Right to Erasure', tipo: 'corretivo', obj: 'Erasure.', questions: [{ pergunta: 'Is the right to be forgotten implemented effectively?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Controller/Processor', codigo: 'RESP', ordem: 3, peso: 30, controls: [
                    { codigo: 'ART.32', titulo: 'Security of Processing', tipo: 'preventivo', obj: 'Security.', questions: [{ pergunta: 'Are appropriate technical and organisational measures implemented?', tipo: 'escala_1_5', evidencia: true }] },
                    { codigo: 'ART.33', titulo: 'Data Breach Notification', tipo: 'corretivo', obj: 'Breach.', questions: [{ pergunta: 'Are data breaches notified to the supervisory authority within 72 hours?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.35', titulo: 'DPIA', tipo: 'preventivo', obj: 'DPIA.', questions: [{ pergunta: 'Is a DPIA carried out for high-risk processing?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'ART.37', titulo: 'DPO Designation', tipo: 'preventivo', obj: 'DPO.', questions: [{ pergunta: 'Has a Data Protection Officer been designated where required?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'Transfers', codigo: 'TRANS', ordem: 4, peso: 10, controls: [
                    { codigo: 'ART.44', titulo: 'Cross-border Transfers', tipo: 'preventivo', obj: 'Transfers.', questions: [{ pergunta: 'Are international transfers compliant with Chapter V (e.g. SCCs)?', tipo: 'sim_nao', evidencia: true }] }
                ]
            }
        ]
    }
];

// --- EXECUTION ---
async function seedExpanded() {
    console.log("🚀 Starting EXPANDED Server-Side Seeding...");
    const TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';

    const db = new DatabaseManager();
    const connected = await db.connect();
    if (!connected) return;
    const client = db.client;

    try {
        for (const fw of FRAMEWORKS) {
            console.log(`\n🌱 Seeding ${fw.data.codigo} (${fw.domains.reduce((a, d) => a + d.controls.length, 0)} controls)...`);

            // 1. Force Clean
            const getFw = await client.query("SELECT id FROM assessment_frameworks WHERE tenant_id = $1 AND codigo = $2 AND is_standard = true", [TENANT_ID, fw.data.codigo]);
            if (getFw.rows.length > 0) {
                const fid = getFw.rows[0].id;
                // Get Domains
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

            // 2. Insert Framework
            const fwRes = await client.query(
                `INSERT INTO assessment_frameworks (tenant_id, nome, codigo, descricao, versao, tipo_framework, categoria, is_standard, publico, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                [TENANT_ID, fw.data.nome, fw.data.codigo, fw.data.descricao, fw.data.versao, fw.data.tipo_framework, fw.data.categoria || '', true, true, 'ativo']
            );
            const fwId = fwRes.rows[0].id;

            // 3. Domains & Controls
            for (const d of fw.domains) {
                const dRes = await client.query(
                    `INSERT INTO assessment_domains (framework_id, nome, codigo, descricao, ordem, peso, tenant_id, ativo)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [fwId, d.nome, d.codigo, 'Domínio: ' + d.nome, d.ordem, d.peso, TENANT_ID, true]
                );
                const dId = dRes.rows[0].id;

                let controlOrder = 1;
                for (const c of d.controls) {
                    const cRes = await client.query(
                        `INSERT INTO assessment_controls (domain_id, framework_id, codigo, titulo, descricao, objetivo, tipo_controle, criticidade, peso, ordem, tenant_id, ativo)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
                        [dId, fwId, c.codigo, c.titulo, 'Implementação de ' + c.titulo, c.obj, c.tipo, 'alta', 10, controlOrder++, TENANT_ID, true]
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
        }
        console.log("\n🎉 All EXPANDED frameworks seeded successfully!");

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await db.disconnect();
    }
}

seedExpanded();
