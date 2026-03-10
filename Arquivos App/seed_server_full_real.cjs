const DatabaseManager = require('./database-manager.cjs');

// Data COPIED from marketSeederFull.ts (Full Content)
const FRAMEWORKS = [
    // --- ISO 27001 ---
    {
        data: {
            nome: 'ISO/IEC 27001:2022', codigo: 'ISO-27001', descricao: 'Padrão internacional para Gestão de Segurança da Informação (SGSI)', versao: '2022', tipo_framework: 'ISO27001', categoria: 'Segurança da Informação', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            {
                nome: 'A.5 Controles Organizacionais', codigo: 'A.5', ordem: 5, peso: 20,
                controls: [
                    { codigo: 'A.5.1', titulo: 'As políticas de segurança estão definidas e aprovadas?', tipo: 'preventivo', obj: 'Orientação da direção.', questions: [{ pergunta: 'As políticas de segurança estão definidas e aprovadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.2', titulo: 'As responsabilidades de segurança estão definidas?', tipo: 'preventivo', obj: 'Definir responsabilidades.', questions: [{ pergunta: 'As responsabilidades de segurança estão definidas e atribuídas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.3', titulo: 'Funções conflitantes estão segregadas?', tipo: 'preventivo', obj: 'Reduzir riscos de uso indevido.', questions: [{ pergunta: 'Funções conflitantes estão segregadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.4', titulo: 'A direção exige conformidade c/ segurança?', tipo: 'preventivo', obj: 'Apoio da direção.', questions: [{ pergunta: 'A direção exige que os funcionários apliquem a segurança?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.5', titulo: 'Existem contatos estabelecidos com autoridades?', tipo: 'corretivo', obj: 'Comunicação legal.', questions: [{ pergunta: 'Existem contatos estabelecidos com autoridades relevantes?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.6', titulo: 'Existem contatos com grupos de interesse?', tipo: 'preventivo', obj: 'Atualização de conhecimento.', questions: [{ pergunta: 'Existem contatos com grupos de interesse ou especialistas?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.7', titulo: 'A organização coleta informações de ameaças?', tipo: 'detectivo', obj: 'Coletar e analisar informações sobre ameaças.', questions: [{ pergunta: 'A organização coleta e analisa informações sobre ameaças?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.8', titulo: 'A segurança é considerada em projetos?', tipo: 'preventivo', obj: 'Segurança desde o início.', questions: [{ pergunta: 'A segurança da informação é considerada no gerenciamento de projetos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.9', titulo: 'Existe inventário de ativos atualizado?', tipo: 'preventivo', obj: 'Conhecer os ativos.', questions: [{ pergunta: 'Existe um inventário de ativos atualizado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.10', titulo: 'Há regras para uso aceitável dos ativos?', tipo: 'preventivo', obj: 'Regras de uso.', questions: [{ pergunta: 'Existem regras documentadas para o uso aceitável dos ativos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.11', titulo: 'Ativos são devolvidos no desligamento?', tipo: 'preventivo', obj: 'Proteger ativos no desligamento.', questions: [{ pergunta: 'Os ativos são devolvidos após o término do contrato?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.12', titulo: 'A informação é classificada?', tipo: 'preventivo', obj: 'Proteger conforme o valor.', questions: [{ pergunta: 'A informação é classificada conforme sua sensibilidade e criticidade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.13', titulo: 'A rotulagem adequada é aplicada?', tipo: 'preventivo', obj: 'Identificar classificação.', questions: [{ pergunta: 'A rotulagem adequada é aplicada conforme o esquema de classificação?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.14', titulo: 'Há regras para transferência de informações?', tipo: 'preventivo', obj: 'Proteger em trânsito.', questions: [{ pergunta: 'Existem regras para proteção na transferência de informações?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.15', titulo: 'As regras de controle de acesso são documentadas?', tipo: 'preventivo', obj: 'Limitar acesso.', questions: [{ pergunta: 'As regras de controle de acesso estão documentadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.16', titulo: 'O ciclo de vida das identidades é gerenciado?', tipo: 'preventivo', obj: 'Ciclo de vida de identidades.', questions: [{ pergunta: 'O ciclo de vida das identidades é gerenciado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.17', titulo: 'Autenticação secreta é controlada?', tipo: 'preventivo', obj: 'Gerir senhas e segredos.', questions: [{ pergunta: 'A alocação de informações de autenticação secreta é controlada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.18', titulo: 'Direitos de acesso são revisados?', tipo: 'preventivo', obj: 'Gerir permissões.', questions: [{ pergunta: 'Os direitos de acesso são provisionados e revisados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.19', titulo: 'Há segurança nos contratos com fornecedores?', tipo: 'preventivo', obj: 'Gerir riscos de terceiros.', questions: [{ pergunta: 'Existem requisitos de segurança nos contratos com fornecedores?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.20', titulo: 'Requisitos de segurança acordados com fornecedor?', tipo: 'preventivo', obj: 'Acordos de segurança.', questions: [{ pergunta: 'Os requisitos de segurança estão acordados com cada fornecedor?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.21', titulo: 'Riscos da cadeia TIC são gerenciados?', tipo: 'preventivo', obj: 'Riscos na cadeia TIC.', questions: [{ pergunta: 'Os riscos associados à cadeia de suprimentos de TIC são gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.22', titulo: 'Serviços de fornecedores são monitorados?', tipo: 'detectivo', obj: 'Verificar conformidade.', questions: [{ pergunta: 'Os serviços dos fornecedores são monitorados e avaliados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.23', titulo: 'Segurança em nuvem está definida?', tipo: 'preventivo', obj: 'Segurança na nuvem.', questions: [{ pergunta: 'Os requisitos de segurança para uso de serviços em nuvem foram definidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.24', titulo: 'Gestão de incidentes está documentada?', tipo: 'preventivo', obj: 'Preparação para resposta.', questions: [{ pergunta: 'O planejamento para gestão de incidentes está documentado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.25', titulo: 'Há processo para avaliar eventos de segurança?', tipo: 'detectivo', obj: 'Triagem de eventos.', questions: [{ pergunta: 'Existe um processo para avaliar se eventos são incidentes?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.26', titulo: 'Incidentes são respondidos formalmente?', tipo: 'corretivo', obj: 'Agir sobre incidentes.', questions: [{ pergunta: 'Os incidentes são respondidos de acordo com procedimentos documentados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.27', titulo: 'O conhecimento de incidentes é usado?', tipo: 'preventivo', obj: 'Melhoria contínua.', questions: [{ pergunta: 'O conhecimento obtido com incidentes é usado para fortalecer os controles?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.5.28', titulo: 'Existem procedimentos para coleta de evidências?', tipo: 'detectivo', obj: 'Forensics.', questions: [{ pergunta: 'Existem procedimentos para coleta e preservação de evidências?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.29', titulo: 'Continuidade de segurança planejada?', tipo: 'preventivo', obj: 'Continuidade de Negócio.', questions: [{ pergunta: 'A organização planeja a continuidade da segurança durante interrupções?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.30', titulo: 'Prontidão da TIC é planejada e testada?', tipo: 'preventivo', obj: 'DRP de TI.', questions: [{ pergunta: 'A prontidão da TIC é planejada e testada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.31', titulo: 'Requisitos legais são identificados?', tipo: 'preventivo', obj: 'Conformidade legal.', questions: [{ pergunta: 'Os requisitos legais e contratuais são identificados e mantidos atualizados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.32', titulo: 'Direitos de PI são respeitados?', tipo: 'preventivo', obj: 'Proteger IP.', questions: [{ pergunta: 'Os direitos de propriedade intelectual são respeitados e protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.33', titulo: 'Registros são protegidos contra perda?', tipo: 'preventivo', obj: 'Proteger arquivos.', questions: [{ pergunta: 'Os registros são protegidos contra perda, destruição e falsificação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.34', titulo: 'Dados pessoais são protegidos?', tipo: 'preventivo', obj: 'Dados pessoais.', questions: [{ pergunta: 'A privacidade e proteção de dados pessoais são asseguradas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.35', titulo: 'Segurança revisada independentemente?', tipo: 'detectivo', obj: 'Auditoria.', questions: [{ pergunta: 'A segurança da informação é revisada independentemente em intervalos planejados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.36', titulo: 'Conformidade com políticas é revisada?', tipo: 'detectivo', obj: 'Compliance interno.', questions: [{ pergunta: 'A conformidade com as políticas é revisada regularmente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.5.37', titulo: 'Procedimentos operacionais documentados?', tipo: 'preventivo', obj: 'Padronização.', questions: [{ pergunta: 'Os procedimentos operacionais estão documentados?', tipo: 'sim_nao', evidencia: true }] },
                ]
            },
            {
                nome: 'A.6 Controles de Pessoas', codigo: 'A.6', ordem: 6, peso: 15,
                controls: [
                    { codigo: 'A.6.1', titulo: 'Antecedentes são verificados?', tipo: 'preventivo', obj: 'Background check.', questions: [{ pergunta: 'Verificações de antecedentes são realizadas para todos os candidatos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.2', titulo: 'Contratos definem responsabilidades?', tipo: 'preventivo', obj: 'Contratos.', questions: [{ pergunta: 'Os contratos de trabalho declaram as responsabilidades de segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.3', titulo: 'Funcionários recebem conscientização?', tipo: 'preventivo', obj: 'Cultura de segurança.', questions: [{ pergunta: 'Os funcionários recebem treinamento de conscientização apropriado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.4', titulo: 'Existe processo disciplinar?', tipo: 'corretivo', obj: 'Sanções.', questions: [{ pergunta: 'Existe um processo disciplinar formal para violações de segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.5', titulo: 'Responsabilidades de saída definidas?', tipo: 'preventivo', obj: 'Offboarding.', questions: [{ pergunta: 'As responsabilidades após o encerramento do contrato estão definidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.6', titulo: 'Acordos de confidencialidade assinados?', tipo: 'preventivo', obj: 'Acordos de sigilo.', questions: [{ pergunta: 'Acordos de confidencialidade são assinados por funcionários e terceiros?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.7', titulo: 'Há segurança no trabalho remoto?', tipo: 'preventivo', obj: 'Segurança em Home Office.', questions: [{ pergunta: 'Existem políticas para proteger o trabalho remoto?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.6.8', titulo: 'Existe canal para denúncia?', tipo: 'detectivo', obj: 'Canal de denúncia.', questions: [{ pergunta: 'Existe um canal para reporte rápido de eventos de segurança?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'A.7 Controles Físicos', codigo: 'A.7', ordem: 7, peso: 15,
                controls: [
                    { codigo: 'A.7.1', titulo: 'Perímetros de segurança definidos?', tipo: 'preventivo', obj: 'Barreiras físicas.', questions: [{ pergunta: 'Os perímetros de segurança são definidos para proteger áreas sensíveis?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.2', titulo: 'Acesso físico é protegido?', tipo: 'preventivo', obj: 'Controle de acesso físico.', questions: [{ pergunta: 'O acesso físico é protegido por controles de entrada apropriados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.3', titulo: 'Instalações são seguras?', tipo: 'preventivo', obj: 'Segurança predial.', questions: [{ pergunta: 'Os escritórios e instalações são projetados com segurança?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.4', titulo: 'Instalações são monitoradas?', tipo: 'detectivo', obj: 'CFTV e Alarmes.', questions: [{ pergunta: 'As instalações são monitoradas continuamente contra acesso não autorizado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.5', titulo: 'Proteção contra desastres físicos?', tipo: 'preventivo', obj: 'Fogo, inundações.', questions: [{ pergunta: 'Existe proteção contra desastres naturais, fogo e outras ameaças físicas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.6', titulo: 'Existem áreas seguras?', tipo: 'preventivo', obj: 'Áreas restritas.', questions: [{ pergunta: 'Existem protocolos para trabalho em áreas seguras?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.7', titulo: 'Política de mesa limpa aplicada?', tipo: 'preventivo', obj: 'Proteção visual.', questions: [{ pergunta: 'A política de mesa limpa e tela limpa é aplicada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.8', titulo: 'Equipamentos protegidos fisicamente?', tipo: 'preventivo', obj: 'Proteção de hardware.', questions: [{ pergunta: 'Os equipamentos estão posicionados para reduzir riscos?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.7.9', titulo: 'Ativos externos são protegidos?', tipo: 'preventivo', obj: 'Equipamentos externos.', questions: [{ pergunta: 'Os ativos fora das instalações são protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.10', titulo: 'Mídias removíveis são protegidas?', tipo: 'preventivo', obj: 'Gestão de mídia.', questions: [{ pergunta: 'As mídias removíveis são gerenciadas e protegidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.11', titulo: 'Serviços de apoio são protegidos?', tipo: 'preventivo', obj: 'Energia, internet.', questions: [{ pergunta: 'Os serviços de apoio (energia, telecom) são protegidos contra falhas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.12', titulo: 'Cabeamento é protegido?', tipo: 'preventivo', obj: 'Proteção de cabos.', questions: [{ pergunta: 'O cabeamento de energia e dados é protegido contra interceptação e danos?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.7.13', titulo: 'Manutenção de equipamentos é feita?', tipo: 'preventivo', obj: 'Manutenção segura.', questions: [{ pergunta: 'Os equipamentos são mantidos para assegurar disponibilidade e integridade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.7.14', titulo: 'Descarte seguro de mídia?', tipo: 'preventivo', obj: 'Sanitização.', questions: [{ pergunta: 'Os itens contendo mídia de armazenamento são sanitizados antes do descarte?', tipo: 'sim_nao', evidencia: true }] }
                ]
            },
            {
                nome: 'A.8 Controles Tecnológicos', codigo: 'A.8', ordem: 8, peso: 30,
                controls: [
                    { codigo: 'A.8.1', titulo: 'Dispositivos de usuário protegidos?', tipo: 'preventivo', obj: 'Endpoint security.', questions: [{ pergunta: 'Os dispositivos dos usuários são protegidos e gerenciados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.2', titulo: 'Acesso privilegiado restrito?', tipo: 'preventivo', obj: 'PAM.', questions: [{ pergunta: 'O acesso privilegiado é restrito e monitorado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.3', titulo: 'Acesso à informação restrito?', tipo: 'preventivo', obj: 'ACLs.', questions: [{ pergunta: 'O acesso à informação é restrito conforme a política de controle de acesso?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.4', titulo: 'Acesso ao código-fonte controlado?', tipo: 'preventivo', obj: 'Proteção de código.', questions: [{ pergunta: 'O acesso ao código-fonte é estritamente controlado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.5', titulo: 'Autenticação forte implementada?', tipo: 'preventivo', obj: 'MFA.', questions: [{ pergunta: 'O uso de autenticação forte (como MFA) é implementado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.6', titulo: 'Gestão de capacidade realizada?', tipo: 'preventivo', obj: 'Capacity planning.', questions: [{ pergunta: 'A capacidade dos recursos é monitorada e projetada para atender à demanda?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.7', titulo: 'Proteção contra malware ativa?', tipo: 'preventivo', obj: 'Antivírus.', questions: [{ pergunta: 'Proteção contra malware está implementada e atualizada?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.8', titulo: 'Vulnerabilidades gerenciadas?', tipo: 'preventivo', obj: 'Vuln Management.', questions: [{ pergunta: 'Vulnerabilidades técnicas são identificadas e corrigidas prontamente?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.9', titulo: 'Hardening implementado?', tipo: 'preventivo', obj: 'Hardening.', questions: [{ pergunta: 'Configurações seguras são definidas e implementadas para hardware e software?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.10', titulo: 'Exclusão segura de informações?', tipo: 'preventivo', obj: 'Secure delete.', questions: [{ pergunta: 'A exclusão de informações é realizada de forma segura?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.11', titulo: 'Mascaramento de dados usado?', tipo: 'preventivo', obj: 'Obfuscation.', questions: [{ pergunta: 'O mascaramento de dados é usado conforme a política de controle de acesso?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.12', titulo: 'DLP implementado?', tipo: 'preventivo', obj: 'DLP.', questions: [{ pergunta: 'Medidas de DLP estão aplicadas a dados sensíveis?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.13', titulo: 'Backups realizados e testados?', tipo: 'preventivo', obj: 'Backup.', questions: [{ pergunta: 'Backups são realizados regularmente e testados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.14', titulo: 'Infraestrutura redundante?', tipo: 'preventivo', obj: 'HA.', questions: [{ pergunta: 'A infraestrutura possui redundância para atender aos requisitos de disponibilidade?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.15', titulo: 'Logs protegidos e gerados?', tipo: 'detectivo', obj: 'Logs.', questions: [{ pergunta: 'Logs de eventos são gerados, armazenados e protegidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.16', titulo: 'Monitoramento contínuo?', tipo: 'detectivo', obj: 'Monitoring.', questions: [{ pergunta: 'A rede e sistemas são monitorados para anomalias?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.17', titulo: 'Relógios sincronizados?', tipo: 'preventivo', obj: 'NTP.', questions: [{ pergunta: 'Os relógios de todos os sistemas estão sincronizados?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.8.18', titulo: 'Utilitários privilegiados controlados?', tipo: 'preventivo', obj: 'Admin tools.', questions: [{ pergunta: 'O uso de utilitários privilegiados é controlado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.19', titulo: 'Instalação de software controlada?', tipo: 'preventivo', obj: 'Software autorizado.', questions: [{ pergunta: 'A instalação de software é controlada e segue regras definidas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.20', titulo: 'Redes seguras e gerenciadas?', tipo: 'preventivo', obj: 'Network security.', questions: [{ pergunta: 'As redes são gerenciadas e controladas para proteger a informação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.21', titulo: 'Serviços de rede seguros?', tipo: 'preventivo', obj: 'SLA de segurança.', questions: [{ pergunta: 'Os requisitos de segurança para serviços de rede estão definidos?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.22', titulo: 'Redes segregadas?', tipo: 'preventivo', obj: 'Segmentação.', questions: [{ pergunta: 'Redes com diferentes níveis de confiança estão segregadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.23', titulo: 'Filtragem web ativa?', tipo: 'preventivo', obj: 'Web filter.', questions: [{ pergunta: 'O acesso a websites externos é filtrado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.24', titulo: 'Criptografia e chaves gerenciadas?', tipo: 'preventivo', obj: 'Gestão de chaves.', questions: [{ pergunta: 'Existem regras para o uso eficaz de criptografia e gestão de chaves?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.25', titulo: 'SDLC seguro implementado?', tipo: 'preventivo', obj: 'SDLC.', questions: [{ pergunta: 'Regras de desenvolvimento seguro são aplicadas em todo o ciclo de vida?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.26', titulo: 'Requisitos de segurança em apps?', tipo: 'preventivo', obj: 'Reqs.', questions: [{ pergunta: 'Os requisitos de segurança são identificados ao adquirir ou desenvolver aplicações?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.27', titulo: 'Arquitetura segura aplicada?', tipo: 'preventivo', obj: 'Security by design.', questions: [{ pergunta: 'Princípios de engenharia segura são aplicados?', tipo: 'sim_nao', evidencia: false }] },
                    { codigo: 'A.8.28', titulo: 'Codificação segura aplicada?', tipo: 'preventivo', obj: 'Secure coding.', questions: [{ pergunta: 'Práticas de codificação segura são aplicadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.29', titulo: 'Testes de segurança realizados?', tipo: 'detectivo', obj: 'Pentest/DAST.', questions: [{ pergunta: 'Testes de segurança são realizados durante o desenvolvimento e aceitação?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.30', titulo: 'Desenv. terceirizado monitorado?', tipo: 'preventivo', obj: 'Outsourcing.', questions: [{ pergunta: 'O desenvolvimento terceirizado é supervisionado e monitorado?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.31', titulo: 'Ambientes segregados?', tipo: 'preventivo', obj: 'Dev/Test/Prod.', questions: [{ pergunta: 'Ambientes de desenvolvimento, teste e produção estão separados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.32', titulo: 'Gestão de mudanças eficaz?', tipo: 'preventivo', obj: 'Change Mgmt.', questions: [{ pergunta: 'Mudanças são documentadas, testadas e aprovadas?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.33', titulo: 'Dados de teste protegidos?', tipo: 'preventivo', obj: 'Dados de teste.', questions: [{ pergunta: 'Os dados de teste são protegidos e anonimizados?', tipo: 'sim_nao', evidencia: true }] },
                    { codigo: 'A.8.34', titulo: 'Auditoria minimiza impacto?', tipo: 'preventivo', obj: 'Impacto de auditoria.', questions: [{ pergunta: 'As atividades de auditoria são planejadas para minimizar impacto nos negócios?', tipo: 'sim_nao', evidencia: false }] }
                ]
            }
        ]
    },
    // --- PCI DSS ---
    {
        data: {
            nome: 'PCI DSS 4.0', codigo: 'PCI-DSS-4.0', descricao: 'Padrão de Segurança de Dados para a Indústria de Cartões de Pagamento', versao: '4.0', tipo_framework: 'PCI_DSS', categoria: 'Pagamentos', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            { nome: 'Req 1: Segurança de Rede', codigo: 'REQ-1', ordem: 1, peso: 8, controls: [{ codigo: '1.1', titulo: 'Controles de rede (NSC) ativos?', tipo: 'preventivo', obj: 'Firewalls e controles.', questions: [{ pergunta: 'Controles de segurança de rede (NSC) estão instalados e mantidos?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 2: Configurações Seguras', codigo: 'REQ-2', ordem: 2, peso: 8, controls: [{ codigo: '2.1', titulo: 'Configurações seguras aplicadas?', tipo: 'preventivo', obj: 'Hardening.', questions: [{ pergunta: 'Configurações seguras são aplicadas a todos os componentes do sistema?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 3: Proteção de Dados de Conta', codigo: 'REQ-3', ordem: 3, peso: 10, controls: [{ codigo: '3.1', titulo: 'Dados armazenados protegidos?', tipo: 'preventivo', obj: 'Criptografia em repouso.', questions: [{ pergunta: 'Os dados da conta armazenados são protegidos (criptografados)?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 4: Transmissão Segura', codigo: 'REQ-4', ordem: 4, peso: 8, controls: [{ codigo: '4.1', titulo: 'Criptografia em redes públicas?', tipo: 'preventivo', obj: 'TLS.', questions: [{ pergunta: 'A criptografia forte é usada para transmissões em redes públicas?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 5: Proteção contra Malware', codigo: 'REQ-5', ordem: 5, peso: 8, controls: [{ codigo: '5.1', titulo: 'Proteção malware ativa?', tipo: 'detectivo', obj: 'Malware defense.', questions: [{ pergunta: 'Proteção contra malware está ativa e atualizada?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 6: Sistemas Seguros', codigo: 'REQ-6', ordem: 6, peso: 8, controls: [{ codigo: '6.1', titulo: 'Desenvolvimento seguro seguido?', tipo: 'preventivo', obj: 'Patches e SDLC.', questions: [{ pergunta: 'Sistemas e softwares são desenvolvidos de forma segura?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 7: Restrição de Acesso', codigo: 'REQ-7', ordem: 7, peso: 8, controls: [{ codigo: '7.1', titulo: 'Acesso restrito (Need to Know)?', tipo: 'preventivo', obj: 'Acesso restrito.', questions: [{ pergunta: 'O acesso aos dados é restrito pela necessidade de saber?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 8: Identificação e Autenticação', codigo: 'REQ-8', ordem: 8, peso: 8, controls: [{ codigo: '8.1', titulo: 'Identificação e MFA ativos?', tipo: 'preventivo', obj: 'ID único e MFA.', questions: [{ pergunta: 'O acesso é identificado e autenticado (MFA)?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 9: Acesso Físico', codigo: 'REQ-9', ordem: 9, peso: 8, controls: [{ codigo: '9.1', titulo: 'Acesso físico restrito?', tipo: 'preventivo', obj: 'Controle de acesso físico.', questions: [{ pergunta: 'O acesso físico aos dados do titular do cartão é restrito?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 10: Log e Monitoramento', codigo: 'REQ-10', ordem: 10, peso: 8, controls: [{ codigo: '10.1', titulo: 'Auditoria e logs ativos?', tipo: 'detectivo', obj: 'Logging.', questions: [{ pergunta: 'Todo acesso aos recursos de rede e dados é rastreado e monitorado?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 11: Testes de Segurança', codigo: 'REQ-11', ordem: 11, peso: 8, controls: [{ codigo: '11.1', titulo: 'Testes regulares realizados?', tipo: 'detectivo', obj: 'Pentests e Scans.', questions: [{ pergunta: 'A segurança de sistemas e redes é testada regularmente?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Req 12: Gestão de Políticas', codigo: 'REQ-12', ordem: 12, peso: 10, controls: [{ codigo: '12.1', titulo: 'Políticas mantidas?', tipo: 'preventivo', obj: 'Governança.', questions: [{ pergunta: 'As políticas de segurança são mantidas e disseminadas?', tipo: 'sim_nao', evidencia: true }] }] }
        ]
    },
    // --- NIST ---
    {
        data: {
            nome: 'NIST Cybersecurity Framework 2.0', codigo: 'NIST-CSF-2.0', descricao: 'Framework para redução de riscos de infraestrutura crítica', versao: '2.0', tipo_framework: 'NIST', categoria: 'Cibersegurança', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            { nome: 'Governança (Govern)', codigo: 'GV', ordem: 1, peso: 15, controls: [{ codigo: 'GV.OC', titulo: 'A missão e riscos são compreendidos?', tipo: 'preventivo', obj: 'Entender missão e expectativas.', questions: [{ pergunta: 'A missão, objetivos e apetite de risco da organização são compreendidos e comunicados?', tipo: 'escala_1_5', evidencia: true }] }, { codigo: 'GV.RM', titulo: 'Há estratégia de riscos de suprimentos?', tipo: 'preventivo', obj: 'Estabelecer estratégia de gestão de riscos.', questions: [{ pergunta: 'Existe uma estratégia de gestão de riscos de cadeia de suprimentos estabelecida?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'GV.PO', titulo: 'Políticas de cibersegurança estabelecidas?', tipo: 'diretivo', obj: 'Estabelecer e comunicar políticas de cibersegurança.', questions: [{ pergunta: 'As políticas de cibersegurança organizacionais são estabelecidas, comunicadas e aplicadas?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Identificação (Identify)', codigo: 'ID', ordem: 2, peso: 15, controls: [{ codigo: 'ID.AM', titulo: 'Ativos são inventariados?', tipo: 'preventivo', obj: 'Inventariar ativos físicos.', questions: [{ pergunta: 'Os ativos de hardware são inventariados e gerenciados?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'ID.RA', titulo: 'Vulnerabilidades são identificadas?', tipo: 'preventivo', obj: 'Identificar e analisar riscos cibernéticos.', questions: [{ pergunta: 'Vulnerabilidades de ativos são identificadas e documentadas?', tipo: 'escala_1_5', evidencia: true }] }] },
            { nome: 'Proteção (Protect)', codigo: 'PR', ordem: 3, peso: 20, controls: [{ codigo: 'PR.AA', titulo: 'Credenciais são gerenciadas?', tipo: 'preventivo', obj: 'Limitar acesso lógico e físico a ativos.', questions: [{ pergunta: 'As identidades e credenciais são gerenciadas (MFA, senhas fortes)?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'O acesso é concedido com base no princípio do menor privilégio?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'PR.DS', titulo: 'Dados em repouso protegidos?', tipo: 'preventivo', obj: 'Proteger confidencialidade.', questions: [{ pergunta: 'Dados em repouso são protegidos (ex: criptografia)?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'PR.IR', titulo: 'Backups são testados?', tipo: 'preventivo', obj: 'Gerenciar resiliência.', questions: [{ pergunta: 'Backups de dados são protegidos e testados regularmente?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Detecção (Detect)', codigo: 'DE', ordem: 4, peso: 15, controls: [{ codigo: 'DE.AE', titulo: 'Logs são centralizados (SIEM)?', tipo: 'detectivo', obj: 'Detectar atividades anômalas.', questions: [{ pergunta: 'Logs de eventos são coletados e analisados centralmente (SIEM)?', tipo: 'escala_1_5', evidencia: true }] }, { codigo: 'DE.CM', titulo: 'A rede é monitorada?', tipo: 'detectivo', obj: 'Monitorar a rede.', questions: [{ pergunta: 'A rede é monitorada para detectar pessoal, conexões, dispositivos e softwares não autorizados?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Resposta (Respond)', codigo: 'RS', ordem: 5, peso: 15, controls: [{ codigo: 'RS.MA', titulo: 'Há plano de resposta a incidentes?', tipo: 'corretivo', obj: 'Agir sobre incidentes.', questions: [{ pergunta: 'Existe um plano de resposta a incidentes documentado e testado anualmente?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'RS.AN', titulo: 'Incidentes são analisados?', tipo: 'corretivo', obj: 'Analisar incidentes.', questions: [{ pergunta: 'Incidentes são analisados para entender alvos e métodos de ataque?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Recuperação (Recover)', codigo: 'RC', ordem: 6, peso: 10, controls: [{ codigo: 'RC.RP', titulo: 'Planos DRP e BCP gerenciados?', tipo: 'corretivo', obj: 'Restaurar capacidades.', questions: [{ pergunta: 'Os planos de recuperação de desastres (DRP) e continuidade de negócios (BCP) são gerenciados?', tipo: 'escala_1_5', evidencia: true }] }] }
        ]
    },
    // --- COBIT ---
    {
        data: {
            nome: 'COBIT 2019 Enterprise Edition', codigo: 'COBIT-2019', descricao: 'Framework de governança e gestão de TI corporativo', versao: '2019', tipo_framework: 'COBIT', categoria: 'Governança de TI', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            { nome: 'Avaliar, Dirigir e Monitorar (EDM)', codigo: 'EDM', ordem: 1, peso: 20, controls: [{ codigo: 'EDM01', titulo: 'Princípios de governança definidos?', tipo: 'preventivo', obj: 'Garantir governança.', questions: [{ pergunta: 'Os princípios de governança de TI foram definidos e comunicados?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'EDM03', titulo: 'Apetite ao risco definido?', tipo: 'diretivo', obj: 'Garantir tolerância.', questions: [{ pergunta: 'O apetite ao risco da organização foi definido e comunicado?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Alinhar, Planejar e Organizar (APO)', codigo: 'APO', ordem: 2, peso: 20, controls: [{ codigo: 'APO01', titulo: 'Estrutura org. de TI documentada?', tipo: 'preventivo', obj: 'Estabelecer estrutura.', questions: [{ pergunta: 'A estrutura organizacional de TI está documentada e comunicada?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'APO12', titulo: 'Há processo formal de riscos?', tipo: 'preventivo', obj: 'Mitigar riscos.', questions: [{ pergunta: 'Existe um processo formal para identificação e avaliação de riscos de TI?', tipo: 'escala_1_5', evidencia: true }] }, { codigo: 'APO13', titulo: 'SGSI estabelecido?', tipo: 'preventivo', obj: 'Gestão de segurança.', questions: [{ pergunta: 'Existe um Sistema de Gestão de Segurança da Informação (SGSI) estabelecido?', tipo: 'escala_1_5', evidencia: true }] }] },
            { nome: 'Construir, Adquirir e Implementar (BAI)', codigo: 'BAI', ordem: 3, peso: 20, controls: [{ codigo: 'BAI06', titulo: 'Mudanças seguem fluxo formal?', tipo: 'preventivo', obj: 'Minimizar impacto.', questions: [{ pergunta: 'Todas as mudanças em produção seguem um fluxo de aprovação formal?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Entregar, Servir e Suportar (DSS)', codigo: 'DSS', ordem: 4, peso: 20, controls: [{ codigo: 'DSS01', titulo: 'Jobs monitorados diariamente?', tipo: 'preventivo', obj: 'Garantir entrega.', questions: [{ pergunta: 'Os procedimentos operacionais (backups, jobs) são monitorados diariamente?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'DSS05', titulo: 'Acesso lógico revisado?', tipo: 'preventivo', obj: 'Proteger informações.', questions: [{ pergunta: 'O controle de acesso lógico é revisado periodicamente?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Monitorar, Avaliar e Analisar (MEA)', codigo: 'MEA', ordem: 5, peso: 20, controls: [{ codigo: 'MEA01', titulo: 'Auditorias regulares realizadas?', tipo: 'detectivo', obj: 'Monitorar conformidade.', questions: [{ pergunta: 'São realizadas auditorias regulares de conformidade?', tipo: 'sim_nao', evidencia: true }] }] }
        ]
    },
    // --- ITIL ---
    {
        data: {
            nome: 'ITIL 4 Service Management', codigo: 'ITIL-4', descricao: 'Melhores práticas para gerenciamento de serviços de TI', versao: '4', tipo_framework: 'ITIL', categoria: 'Gestão de Serviços', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            { nome: 'Práticas Gerais de Gerenciamento', codigo: 'GEN', ordem: 1, peso: 30, controls: [{ codigo: 'IPM', titulo: 'Políticas alinhadas ao negócio?', tipo: 'preventivo', obj: 'Proteger a informação.', questions: [{ pergunta: 'As políticas de segurança estão alinhadas com as necessidades do negócio?', tipo: 'escala_1_5', evidencia: true }] }, { codigo: 'RM', titulo: 'Stakeholders registrados?', tipo: 'preventivo', obj: 'Manter boas relações.', questions: [{ pergunta: 'Existe um registro de stakeholders e suas necessidades?', tipo: 'sim_nao', evidencia: false }] }] },
            { nome: 'Práticas de Gerenciamento de Serviço', codigo: 'SERV', ordem: 2, peso: 40, controls: [{ codigo: 'IM', titulo: 'Processo formal para incidentes?', tipo: 'corretivo', obj: 'Restaurar a operação.', questions: [{ pergunta: 'Existe um processo formal para registro e classificação de incidentes?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'Os tempos de resposta e resolução (SLAs) são monitorados?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'CHM', titulo: 'CAB para mudanças críticas?', tipo: 'preventivo', obj: 'Maximizar sucesso.', questions: [{ pergunta: 'Existe um CAB (Change Advisory Board) para aprovar mudanças críticas?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'SD', titulo: 'Service Desk é SPOC?', tipo: 'detectivo', obj: 'Ponto único de contato.', questions: [{ pergunta: 'O Service Desk opera como ponto único de contato (SPOC) para usuários?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Práticas de Gerenciamento Técnico', codigo: 'TECH', ordem: 3, peso: 30, controls: [{ codigo: 'DM', titulo: 'Implantações testadas pré-prod?', tipo: 'preventivo', obj: 'Mover para produção.', questions: [{ pergunta: 'As implantações são planejadas e testadas antes de ir para produção?', tipo: 'sim_nao', evidencia: true }] }] }
        ]
    },
    // --- GDPR ---
    {
        data: {
            nome: 'GDPR - General Data Protection Regulation', codigo: 'GDPR-EU', descricao: 'Regulamento Geral sobre a Proteção de Dados (EU)', versao: '2018', tipo_framework: 'GDPR', categoria: 'Privacidade', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            { nome: 'Chapter 2 - Principles', codigo: 'CH2', ordem: 1, peso: 25, controls: [{ codigo: 'ART.5', titulo: 'Principles (Lawful, Fair, Transparent)?', tipo: 'preventivo', obj: 'Ensure lawfulness.', questions: [{ pergunta: 'Are personal data processed lawfully, fairly and in a transparent manner?', tipo: 'escala_1_5', evidencia: true }] }] },
            { nome: 'Chapter 3 - Rights of the Data Subject', codigo: 'CH3', ordem: 2, peso: 25, controls: [{ codigo: 'ART.15', titulo: 'Procedure to provide data copy?', tipo: 'corretivo', obj: 'Provide access.', questions: [{ pergunta: 'Is there a procedure to provide a copy of personal data undergoing processing?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'ART.17', titulo: 'Can erase data upon request?', tipo: 'corretivo', obj: 'Erase personal data.', questions: [{ pergunta: 'Can the organization identify and erase personal data upon request?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Chapter 4 - Controller and Processor', codigo: 'CH4', ordem: 3, peso: 25, controls: [{ codigo: 'ART.32', titulo: 'Encryption measures implemented?', tipo: 'preventivo', obj: 'Technical measures.', questions: [{ pergunta: 'Are measures such as encryption and pseudonymisation implemented?', tipo: 'sim_nao', evidencia: true }] }] }
        ]
    },
    // --- SOX ---
    {
        data: {
            nome: 'SOX IT General Controls', codigo: 'SOX-ITGC', descricao: 'Controles Gerais de TI para conformidade Sarbanes-Oxley', versao: '2024', tipo_framework: 'SOX', categoria: 'Financeiro', is_standard: true, publico: true, status: 'ativo'
        },
        domains: [
            { nome: 'Access Control (Logical Security)', codigo: 'AC', ordem: 1, peso: 30, controls: [{ codigo: 'AC.1', titulo: 'Access formal approval required?', tipo: 'preventivo', obj: 'Auth access.', questions: [{ pergunta: 'Are user access requests formally approved by management?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'Is access revoked immediately (e.g. within 24 hours) upon termination?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'AC.2', titulo: 'Admin access restricted?', tipo: 'preventivo', obj: 'Restrict powerful accounts.', questions: [{ pergunta: 'Is administrative access restricted to authorized personnel only?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'Are activities of privileged users logged and reviewed?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'AC.3', titulo: 'Access reviewed quarterly?', tipo: 'detectivo', obj: 'Validate access.', questions: [{ pergunta: 'Are user access rights reviewed periodically (e.g., quarterly) by business owners?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'Change Management', codigo: 'CM', ordem: 2, peso: 30, controls: [{ codigo: 'CM.1', titulo: 'Changes tested and approved?', tipo: 'preventivo', obj: 'Prevent unauthorized changes.', questions: [{ pergunta: 'Are all changes to financial applications tested and approved before production?', tipo: 'sim_nao', evidencia: true }, { pergunta: 'Is there a segregation of duties between developers and those who move code to production?', tipo: 'sim_nao', evidencia: true }] }] },
            { nome: 'IT Operations', codigo: 'OPS', ordem: 3, peso: 20, controls: [{ codigo: 'OPS.1', titulo: 'Jobs monitored for failure?', tipo: 'preventivo', obj: 'Ensure batch processing.', questions: [{ pergunta: 'Are batch jobs monitored for failures, and are errors resolved timely?', tipo: 'sim_nao', evidencia: true }] }, { codigo: 'OPS.2', titulo: 'Financial backups performed?', tipo: 'corretivo', obj: 'Ensure data availability.', questions: [{ pergunta: 'Are backups of financial data performed daily and verified?', tipo: 'sim_nao', evidencia: true }] }] }
        ]
    }
];

// --- EXECUTION ---
async function seedAll() {
    console.log("🚀 Starting MANUAL Server-Side Seeding (FULL REAL)...");
    const TENANT_ID = '46b1c048-85a1-423b-96fc-776007c8de1f';

    const db = new DatabaseManager();
    const connected = await db.connect();
    if (!connected) return;
    const client = db.client;

    try {
        for (const fw of FRAMEWORKS) {
            console.log(`\n🌱 Seeding ${fw.data.codigo}...`);

            // 1. Force Clean (Delete if exists)
            const getFw = await client.query("SELECT id FROM assessment_frameworks WHERE tenant_id = $1 AND codigo = $2 AND is_standard = true", [TENANT_ID, fw.data.codigo]);
            if (getFw.rows.length > 0) {
                const fid = getFw.rows[0].id;
                console.log(`  🗑️ Cleaning existing ${fw.data.codigo}...`);
                // Get Domains
                const doms = await client.query("SELECT id FROM assessment_domains WHERE framework_id = $1", [fid]);
                const domIds = doms.rows.map(d => d.id);
                if (domIds.length > 0) {
                    // Get Controls
                    const ctrls = await client.query("SELECT id FROM assessment_controls WHERE domain_id = ANY($1)", [domIds]);
                    const ctrlIds = ctrls.rows.map(c => c.id);
                    if (ctrlIds.length > 0) {
                        await client.query("DELETE FROM assessment_questions WHERE control_id = ANY($1)", [ctrlIds]);
                        await client.query("DELETE FROM assessment_controls WHERE domain_id = ANY($1)", [domIds]);
                    }
                    await client.query("DELETE FROM assessment_domains WHERE framework_id = $1", [fid]);
                }
                await client.query("DELETE FROM assessment_frameworks WHERE id = $1", [fid]);
                console.log("  🗑️ Cleaned.");
            }

            // 2. Insert Framework
            const fwRes = await client.query(
                `INSERT INTO assessment_frameworks (tenant_id, nome, codigo, descricao, versao, tipo_framework, categoria, is_standard, publico, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                [TENANT_ID, fw.data.nome, fw.data.codigo, fw.data.descricao, fw.data.versao, fw.data.tipo_framework, fw.data.categoria || '', true, true, 'ativo']
            );
            const fwId = fwRes.rows[0].id;
            console.log("  ✅ Framework Created:", fwId);

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

                    // Questions
                    for (const q of c.questions) {
                        await client.query(
                            `INSERT INTO assessment_questions (control_id, texto, tipo_pergunta, evidencias_requeridas, opcoes_resposta, peso, ordem, tenant_id, codigo, ativa)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                            [cId, q.pergunta, q.tipo, q.evidencia, q.opcoes ? JSON.stringify(q.opcoes) : null, 1, 1, TENANT_ID, c.codigo + '-Q', true]
                        );
                    }
                }
            }
            console.log(`  ✅ Done ${fw.data.codigo}`);
        }
        console.log("\n🎉 All seeded successfully!");

    } catch (e) {
        console.error("❌ Error:", e);
    } finally {
        await db.disconnect();
    }
}

seedAll();
