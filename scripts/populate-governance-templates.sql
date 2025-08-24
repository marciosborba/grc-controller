-- Script para popular o banco com templates de governança corporativa
-- Baseado nas melhores práticas de mercado e frameworks internacionais

-- Limpar dados existentes de templates (opcional)
-- DELETE FROM policies WHERE metadata->>'isTemplate' = 'true';

-- 1. POLÍTICAS DE SEGURANÇA DA INFORMAÇÃO
INSERT INTO policies (
  id, title, description, category, document_type, status, version, 
  effective_date, review_date, expiry_date, created_at, updated_at,
  tenant_id, created_by, updated_by, owner_id, priority,
  metadata
) VALUES 
(
  gen_random_uuid(),
  'Política de Segurança da Informação',
  'Estabelece diretrizes e responsabilidades para proteção das informações organizacionais, baseada na ISO 27001 e melhores práticas de mercado.',
  'Segurança da Informação',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'ISO 27001',
    'content', jsonb_build_object(
      'objetivo', 'Proteger a confidencialidade, integridade e disponibilidade das informações da organização.',
      'escopo', 'Aplica-se a todos os colaboradores, terceiros e sistemas que processam informações organizacionais.',
      'responsabilidades', jsonb_build_array(
        'CISO: Responsável pela implementação e monitoramento da política',
        'Gestores: Garantir cumprimento em suas áreas',
        'Colaboradores: Seguir as diretrizes estabelecidas'
      ),
      'diretrizes', jsonb_build_array(
        'Classificação da informação conforme criticidade',
        'Controles de acesso baseados no princípio do menor privilégio',
        'Backup e recuperação de dados críticos',
        'Monitoramento contínuo de segurança',
        'Treinamento e conscientização em segurança'
      ),
      'penalidades', 'O descumprimento pode resultar em medidas disciplinares conforme código de conduta.'
    )
  )
),

(
  gen_random_uuid(),
  'Política de Controle de Acesso',
  'Define procedimentos para concessão, manutenção e revogação de acessos a sistemas e informações corporativas.',
  'Segurança da Informação',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'NIST Cybersecurity Framework',
    'content', jsonb_build_object(
      'objetivo', 'Garantir que apenas usuários autorizados tenham acesso apropriado aos recursos organizacionais.',
      'escopo', 'Todos os sistemas, aplicações, dados e recursos físicos da organização.',
      'principios', jsonb_build_array(
        'Menor privilégio necessário',
        'Segregação de funções',
        'Revisão periódica de acessos',
        'Autenticação forte',
        'Trilha de auditoria'
      ),
      'procedimentos', jsonb_build_array(
        'Solicitação formal de acesso via sistema',
        'Aprovação pelo gestor responsável',
        'Provisão pelo time de TI',
        'Revisão trimestral de acessos',
        'Revogação imediata em desligamentos'
      )
    )
  )
),

-- 2. POLÍTICAS DE PRIVACIDADE E PROTEÇÃO DE DADOS
(
  gen_random_uuid(),
  'Política de Privacidade e Proteção de Dados Pessoais',
  'Estabelece diretrizes para tratamento de dados pessoais em conformidade com LGPD, GDPR e regulamentações aplicáveis.',
  'Privacidade de Dados',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'critical',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'LGPD/GDPR',
    'content', jsonb_build_object(
      'objetivo', 'Assegurar o tratamento adequado e seguro de dados pessoais, respeitando os direitos dos titulares.',
      'escopo', 'Todas as atividades de tratamento de dados pessoais realizadas pela organização.',
      'principios_lgpd', jsonb_build_array(
        'Finalidade: tratamento para propósitos legítimos e específicos',
        'Adequação: compatibilidade com as finalidades informadas',
        'Necessidade: limitação ao mínimo necessário',
        'Livre acesso: garantia aos titulares sobre seus dados',
        'Qualidade dos dados: exatidão, clareza e atualização',
        'Transparência: informações claras sobre o tratamento',
        'Segurança: medidas técnicas e administrativas',
        'Prevenção: adoção de medidas preventivas',
        'Não discriminação: vedação para fins discriminatórios',
        'Responsabilização: demonstração de conformidade'
      ),
      'direitos_titulares', jsonb_build_array(
        'Confirmação da existência de tratamento',
        'Acesso aos dados',
        'Correção de dados incompletos ou inexatos',
        'Anonimização, bloqueio ou eliminação',
        'Portabilidade dos dados',
        'Eliminação dos dados tratados com consentimento',
        'Informação sobre compartilhamento',
        'Revogação do consentimento'
      ),
      'medidas_seguranca', jsonb_build_array(
        'Criptografia de dados sensíveis',
        'Controles de acesso rigorosos',
        'Monitoramento de atividades',
        'Backup seguro e recuperação',
        'Treinamento de colaboradores',
        'Avaliação de impacto à proteção de dados'
      )
    )
  )
),

-- 3. POLÍTICAS DE RECURSOS HUMANOS
(
  gen_random_uuid(),
  'Código de Ética e Conduta',
  'Define os valores, princípios éticos e padrões de comportamento esperados de todos os colaboradores.',
  'Ética',
  'Código',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '2 years',
  CURRENT_DATE + INTERVAL '5 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'critical',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Compliance Corporativo',
    'content', jsonb_build_object(
      'valores', jsonb_build_array(
        'Integridade: Agir com honestidade e transparência',
        'Respeito: Valorizar a diversidade e dignidade humana',
        'Excelência: Buscar a melhoria contínua',
        'Responsabilidade: Assumir as consequências dos atos',
        'Sustentabilidade: Considerar impactos socioambientais'
      ),
      'condutas_esperadas', jsonb_build_array(
        'Cumprimento de leis e regulamentações',
        'Tratamento respeitoso com colegas e stakeholders',
        'Uso adequado de recursos corporativos',
        'Proteção de informações confidenciais',
        'Prevenção de conflitos de interesse',
        'Reporte de irregularidades'
      ),
      'condutas_proibidas', jsonb_build_array(
        'Corrupção e suborno',
        'Discriminação e assédio',
        'Uso indevido de informações privilegiadas',
        'Competição desleal',
        'Violação de propriedade intelectual',
        'Retaliação contra denunciantes'
      ),
      'canal_denuncia', 'Canal de ética disponível 24/7 com garantia de anonimato e não retaliação.'
    )
  )
),

(
  gen_random_uuid(),
  'Política de Prevenção ao Assédio e Discriminação',
  'Estabelece diretrizes para manutenção de ambiente de trabalho respeitoso, livre de assédio e discriminação.',
  'Recursos Humanos',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'critical',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Direitos Humanos e Trabalhistas',
    'content', jsonb_build_object(
      'objetivo', 'Promover ambiente de trabalho seguro, respeitoso e livre de qualquer forma de assédio ou discriminação.',
      'definicoes', jsonb_build_object(
        'assedio_moral', 'Conduta abusiva que atenta contra dignidade ou integridade psíquica',
        'assedio_sexual', 'Conduta de natureza sexual não desejada',
        'discriminacao', 'Tratamento diferenciado baseado em características pessoais protegidas'
      ),
      'caracteristicas_protegidas', jsonb_build_array(
        'Raça, cor, etnia',
        'Gênero, orientação sexual, identidade de gênero',
        'Religião, crença',
        'Idade',
        'Deficiência',
        'Estado civil',
        'Origem social ou nacional'
      ),
      'procedimentos_denuncia', jsonb_build_array(
        'Comunicação imediata ao RH ou canal de ética',
        'Investigação confidencial e imparcial',
        'Medidas protetivas para denunciante',
        'Aplicação de sanções apropriadas',
        'Acompanhamento pós-resolução'
      ),
      'medidas_preventivas', jsonb_build_array(
        'Treinamentos regulares sobre diversidade e inclusão',
        'Comunicação clara sobre políticas',
        'Liderança exemplar',
        'Monitoramento do clima organizacional',
        'Canais seguros de comunicação'
      )
    )
  )
),

-- 4. POLÍTICAS FINANCEIRAS
(
  gen_random_uuid(),
  'Política de Controles Internos Financeiros',
  'Define controles e procedimentos para garantir a integridade das informações financeiras e conformidade regulatória.',
  'Financeiro',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'SOX/COSO',
    'content', jsonb_build_object(
      'objetivo', 'Assegurar a confiabilidade dos relatórios financeiros e conformidade com regulamentações aplicáveis.',
      'componentes_coso', jsonb_build_array(
        'Ambiente de controle',
        'Avaliação de riscos',
        'Atividades de controle',
        'Informação e comunicação',
        'Monitoramento'
      ),
      'controles_chave', jsonb_build_array(
        'Segregação de funções em processos críticos',
        'Aprovações em múltiplos níveis',
        'Reconciliações periódicas',
        'Controles de acesso a sistemas financeiros',
        'Revisões analíticas',
        'Documentação adequada de transações'
      ),
      'responsabilidades', jsonb_build_object(
        'cfo', 'Supervisão geral dos controles financeiros',
        'controller', 'Implementação e manutenção dos controles',
        'auditoria_interna', 'Avaliação independente da eficácia',
        'gestores', 'Execução dos controles em suas áreas'
      ),
      'monitoramento', jsonb_build_array(
        'Testes regulares de controles',
        'Relatórios de deficiências',
        'Planos de ação corretiva',
        'Certificação gerencial',
        'Auditoria externa anual'
      )
    )
  )
),

(
  gen_random_uuid(),
  'Política Anticorrupção e Antissuborno',
  'Estabelece diretrizes rigorosas para prevenção de corrupção, suborno e práticas antiéticas nos negócios.',
  'Compliance',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'critical',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Lei Anticorrupção/FCPA/UK Bribery Act',
    'content', jsonb_build_object(
      'objetivo', 'Prevenir, detectar e responder a práticas de corrupção e suborno em todas as operações.',
      'definicoes', jsonb_build_object(
        'corrupcao', 'Oferecer, prometer, dar ou aceitar vantagem indevida',
        'suborno', 'Pagamento ou benefício para influenciar decisão',
        'facilitacao', 'Pagamento para acelerar processo rotineiro',
        'lavagem_dinheiro', 'Processo para ocultar origem ilícita de recursos'
      ),
      'condutas_proibidas', jsonb_build_array(
        'Pagamentos ou presentes a agentes públicos',
        'Facilitação de pagamentos',
        'Contribuições políticas não autorizadas',
        'Doações beneficentes suspeitas',
        'Contratação de parentes de autoridades',
        'Uso de terceiros para práticas ilícitas'
      ),
      'due_diligence', jsonb_build_array(
        'Verificação de antecedentes de parceiros',
        'Avaliação de riscos por país/setor',
        'Monitoramento contínuo de relacionamentos',
        'Cláusulas contratuais específicas',
        'Treinamento de terceiros'
      ),
      'presentes_hospitalidade', jsonb_build_object(
        'limite_valor', 'Até R$ 200 por evento',
        'aprovacao_necessaria', 'Acima do limite ou para agentes públicos',
        'registro_obrigatorio', 'Todos os presentes e hospitalidades',
        'proibicoes', 'Dinheiro, equivalentes ou itens de valor pessoal'
      )
    )
  )
),

-- 5. POLÍTICAS OPERACIONAIS
(
  gen_random_uuid(),
  'Política de Gestão de Riscos Corporativos',
  'Define estrutura e processos para identificação, avaliação e gestão de riscos organizacionais.',
  'Gestão de Riscos',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'COSO ERM/ISO 31000',
    'content', jsonb_build_object(
      'objetivo', 'Estabelecer abordagem sistemática para gestão de riscos que possam impactar os objetivos organizacionais.',
      'categorias_risco', jsonb_build_array(
        'Estratégicos: mudanças no ambiente de negócios',
        'Operacionais: falhas em processos ou sistemas',
        'Financeiros: volatilidade de mercado ou crédito',
        'Conformidade: violação de leis ou regulamentos',
        'Reputacionais: danos à imagem organizacional'
      ),
      'processo_gestao', jsonb_build_array(
        'Identificação: mapeamento de riscos potenciais',
        'Avaliação: análise de probabilidade e impacto',
        'Tratamento: definição de respostas apropriadas',
        'Monitoramento: acompanhamento contínuo',
        'Comunicação: reporte para stakeholders'
      ),
      'matriz_risco', jsonb_build_object(
        'muito_baixo', 'Probabilidade < 5% e Impacto < R$ 10k',
        'baixo', 'Probabilidade 5-15% e Impacto R$ 10k-50k',
        'medio', 'Probabilidade 15-35% e Impacto R$ 50k-200k',
        'alto', 'Probabilidade 35-65% e Impacto R$ 200k-1M',
        'muito_alto', 'Probabilidade > 65% e Impacto > R$ 1M'
      ),
      'governanca', jsonb_build_object(
        'comite_riscos', 'Supervisão estratégica da gestão de riscos',
        'cro', 'Coordenação das atividades de gestão de riscos',
        'proprietarios_risco', 'Gestão operacional dos riscos',
        'auditoria_interna', 'Avaliação independente do processo'
      )
    )
  )
),

(
  gen_random_uuid(),
  'Política de Continuidade de Negócios',
  'Estabelece diretrizes para manutenção das operações críticas durante interrupções ou desastres.',
  'Operacional',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'critical',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'ISO 22301',
    'content', jsonb_build_object(
      'objetivo', 'Garantir a continuidade das operações críticas e recuperação rápida após interrupções.',
      'escopo', 'Todos os processos críticos, sistemas e recursos necessários para operação.',
      'analise_impacto', jsonb_build_array(
        'Identificação de processos críticos',
        'Determinação de RTOs (Recovery Time Objectives)',
        'Definição de RPOs (Recovery Point Objectives)',
        'Avaliação de dependências',
        'Quantificação de impactos financeiros'
      ),
      'estrategias_continuidade', jsonb_build_array(
        'Redundância de sistemas críticos',
        'Sites alternativos de operação',
        'Acordos com fornecedores alternativos',
        'Trabalho remoto para funções essenciais',
        'Comunicação com stakeholders'
      ),
      'planos_contingencia', jsonb_build_object(
        'ativacao', 'Critérios claros para ativação dos planos',
        'equipe_resposta', 'Papéis e responsabilidades definidos',
        'comunicacao', 'Protocolos de comunicação interna e externa',
        'recursos', 'Recursos necessários pré-identificados',
        'recuperacao', 'Procedimentos para retorno à normalidade'
      ),
      'testes_exercicios', jsonb_build_array(
        'Testes técnicos trimestrais',
        'Simulações anuais completas',
        'Exercícios de mesa semestrais',
        'Avaliação de resultados',
        'Atualização dos planos'
      )
    )
  )
),

-- 6. POLÍTICAS DE QUALIDADE
(
  gen_random_uuid(),
  'Política de Gestão da Qualidade',
  'Define compromisso organizacional com a qualidade e melhoria contínua dos processos e produtos.',
  'Qualidade',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'medium',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'ISO 9001',
    'content', jsonb_build_object(
      'objetivo', 'Assegurar que produtos e serviços atendam consistentemente aos requisitos e expectativas dos clientes.',
      'principios_qualidade', jsonb_build_array(
        'Foco no cliente',
        'Liderança',
        'Engajamento das pessoas',
        'Abordagem de processo',
        'Melhoria',
        'Tomada de decisão baseada em evidências',
        'Gestão de relacionamento'
      ),
      'sistema_gestao', jsonb_build_array(
        'Documentação de processos críticos',
        'Controles de qualidade em pontos-chave',
        'Monitoramento de indicadores',
        'Auditorias internas regulares',
        'Análise crítica pela direção',
        'Ações corretivas e preventivas'
      ),
      'satisfacao_cliente', jsonb_build_array(
        'Pesquisas de satisfação regulares',
        'Análise de reclamações e sugestões',
        'Monitoramento de indicadores de qualidade',
        'Comunicação proativa com clientes',
        'Melhoria baseada em feedback'
      ),
      'melhoria_continua', jsonb_build_object(
        'ciclo_pdca', 'Plan-Do-Check-Act aplicado sistematicamente',
        'indicadores', 'KPIs definidos para processos críticos',
        'metas', 'Objetivos de qualidade mensuráveis',
        'recursos', 'Investimento adequado em qualidade',
        'treinamento', 'Capacitação contínua das equipes'
      )
    )
  )
),

-- 7. POLÍTICAS AMBIENTAIS
(
  gen_random_uuid(),
  'Política de Sustentabilidade e Meio Ambiente',
  'Estabelece compromissos e diretrizes para gestão ambiental responsável e sustentabilidade corporativa.',
  'Ambiental',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'medium',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'ISO 14001/ESG',
    'content', jsonb_build_object(
      'objetivo', 'Minimizar impactos ambientais e promover práticas sustentáveis em todas as operações.',
      'compromissos', jsonb_build_array(
        'Cumprimento da legislação ambiental',
        'Prevenção da poluição',
        'Uso eficiente de recursos naturais',
        'Redução de emissões de carbono',
        'Gestão adequada de resíduos',
        'Proteção da biodiversidade'
      ),
      'objetivos_ambientais', jsonb_build_array(
        'Reduzir consumo de energia em 20% até 2025',
        'Alcançar neutralidade de carbono até 2030',
        'Implementar economia circular',
        'Certificar fornecedores sustentáveis',
        'Eliminar plásticos descartáveis',
        'Aumentar uso de energias renováveis'
      ),
      'gestao_residuos', jsonb_build_object(
        'hierarquia', 'Reduzir > Reutilizar > Reciclar > Recuperar > Dispor',
        'segregacao', 'Separação adequada na origem',
        'destinacao', 'Parceiros certificados para destinação',
        'monitoramento', 'Controle de volumes e destinações',
        'treinamento', 'Capacitação de colaboradores'
      ),
      'indicadores', jsonb_build_array(
        'Consumo de energia por unidade produzida',
        'Emissões de CO2 equivalente',
        'Consumo de água por colaborador',
        'Percentual de resíduos reciclados',
        'Número de incidentes ambientais',
        'Investimentos em sustentabilidade'
      )
    )
  )
);

-- Continuar com mais templates...
-- 8. PROCEDIMENTOS OPERACIONAIS

INSERT INTO policies (
  id, title, description, category, document_type, status, version, 
  effective_date, review_date, expiry_date, created_at, updated_at,
  tenant_id, created_by, updated_by, owner_id, priority,
  metadata
) VALUES 
(
  gen_random_uuid(),
  'Procedimento de Gestão de Incidentes de Segurança',
  'Define processo estruturado para detecção, resposta e recuperação de incidentes de segurança da informação.',
  'Segurança da Informação',
  'Procedimento',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '2 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'critical',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'NIST Incident Response',
    'content', jsonb_build_object(
      'objetivo', 'Estabelecer processo eficaz para resposta a incidentes de segurança, minimizando impactos.',
      'fases_resposta', jsonb_build_array(
        'Preparação: estabelecimento de capacidades',
        'Detecção e Análise: identificação e classificação',
        'Contenção: limitação do impacto',
        'Erradicação: eliminação da causa raiz',
        'Recuperação: restauração das operações',
        'Lições Aprendidas: melhoria do processo'
      ),
      'classificacao_incidentes', jsonb_build_object(
        'baixo', 'Impacto limitado, sem exposição de dados',
        'medio', 'Impacto moderado, possível exposição limitada',
        'alto', 'Impacto significativo, exposição de dados sensíveis',
        'critico', 'Impacto severo, exposição massiva ou sistemas críticos'
      ),
      'equipe_resposta', jsonb_build_array(
        'Coordenador de Incidentes: liderança geral',
        'Analista de Segurança: investigação técnica',
        'Administrador de Sistemas: suporte técnico',
        'Comunicação: interface com stakeholders',
        'Jurídico: aspectos legais e regulatórios'
      ),
      'tempos_resposta', jsonb_build_object(
        'critico', '15 minutos para ativação da equipe',
        'alto', '1 hora para ativação da equipe',
        'medio', '4 horas para ativação da equipe',
        'baixo', '24 horas para ativação da equipe'
      ),
      'comunicacao', jsonb_build_array(
        'Notificação imediata da equipe de resposta',
        'Comunicação com alta direção conforme criticidade',
        'Notificação de autoridades quando aplicável',
        'Comunicação com clientes/parceiros afetados',
        'Documentação completa do incidente'
      )
    )
  )
),

(
  gen_random_uuid(),
  'Procedimento de Backup e Recuperação de Dados',
  'Define processos para backup regular e recuperação eficaz de dados críticos organizacionais.',
  'Segurança da Informação',
  'Procedimento',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '2 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Melhores Práticas de TI',
    'content', jsonb_build_object(
      'objetivo', 'Garantir disponibilidade e integridade dos dados através de backups regulares e recuperação eficaz.',
      'classificacao_dados', jsonb_build_object(
        'criticos', 'Backup diário, retenção 7 anos',
        'importantes', 'Backup semanal, retenção 3 anos',
        'normais', 'Backup mensal, retenção 1 ano',
        'temporarios', 'Backup opcional, retenção 3 meses'
      ),
      'tipos_backup', jsonb_build_array(
        'Completo: cópia integral dos dados',
        'Incremental: apenas alterações desde último backup',
        'Diferencial: alterações desde último backup completo',
        'Espelho: cópia exata em tempo real'
      ),
      'locais_armazenamento', jsonb_build_array(
        'Local: acesso rápido para recuperação imediata',
        'Offsite: proteção contra desastres locais',
        'Cloud: escalabilidade e redundância geográfica',
        'Fitas: arquivamento de longo prazo'
      ),
      'testes_recuperacao', jsonb_build_array(
        'Testes mensais de recuperação de arquivos',
        'Testes trimestrais de recuperação de sistemas',
        'Simulação anual de disaster recovery',
        'Documentação de resultados e melhorias'
      ),
      'monitoramento', jsonb_build_array(
        'Verificação diária de status dos backups',
        'Alertas automáticos para falhas',
        'Relatórios semanais de performance',
        'Auditoria mensal de integridade'
      )
    )
  )
),

-- 9. NORMAS E DIRETRIZES
(
  gen_random_uuid(),
  'Norma de Classificação da Informação',
  'Estabelece critérios e procedimentos para classificação adequada das informações organizacionais.',
  'Segurança da Informação',
  'Norma',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'ISO 27001',
    'content', jsonb_build_object(
      'objetivo', 'Padronizar a classificação de informações para aplicação de controles de segurança apropriados.',
      'niveis_classificacao', jsonb_build_object(
        'publico', jsonb_build_object(
          'definicao', 'Informações que podem ser divulgadas publicamente',
          'exemplos', jsonb_build_array('Material de marketing', 'Informações do site', 'Comunicados públicos'),
          'controles', jsonb_build_array('Nenhum controle específico necessário')
        ),
        'interno', jsonb_build_object(
          'definicao', 'Informações para uso interno da organização',
          'exemplos', jsonb_build_array('Políticas internas', 'Organogramas', 'Procedimentos operacionais'),
          'controles', jsonb_build_array('Acesso restrito a colaboradores', 'Não divulgação externa')
        ),
        'confidencial', jsonb_build_object(
          'definicao', 'Informações sensíveis que podem causar danos se divulgadas',
          'exemplos', jsonb_build_array('Dados de clientes', 'Informações financeiras', 'Estratégias de negócio'),
          'controles', jsonb_build_array('Acesso baseado em necessidade', 'Criptografia', 'Acordos de confidencialidade')
        ),
        'restrito', jsonb_build_object(
          'definicao', 'Informações altamente sensíveis com impacto crítico se comprometidas',
          'exemplos', jsonb_build_array('Dados pessoais sensíveis', 'Segredos comerciais', 'Informações regulatórias'),
          'controles', jsonb_build_array('Acesso mínimo necessário', 'Criptografia forte', 'Monitoramento de acesso', 'Aprovação executiva')
        )
      ),
      'responsabilidades', jsonb_build_array(
        'Proprietário da informação: classificação inicial',
        'Usuários: respeitar classificação e controles',
        'TI: implementar controles técnicos',
        'Segurança: monitorar conformidade'
      ),
      'marcacao_rotulagem', jsonb_build_array(
        'Documentos físicos: carimbo ou etiqueta visível',
        'Documentos eletrônicos: metadados e marcação',
        'E-mails: linha de assunto com classificação',
        'Sistemas: indicadores visuais de classificação'
      )
    )
  )
),

(
  gen_random_uuid(),
  'Diretriz de Trabalho Remoto e Home Office',
  'Estabelece diretrizes para trabalho remoto seguro e produtivo, incluindo aspectos de segurança e bem-estar.',
  'Recursos Humanos',
  'Diretriz',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'medium',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Boas Práticas de Trabalho Remoto',
    'content', jsonb_build_object(
      'objetivo', 'Orientar colaboradores para trabalho remoto eficaz, seguro e alinhado com objetivos organizacionais.',
      'elegibilidade', jsonb_build_array(
        'Funções compatíveis com trabalho remoto',
        'Histórico de performance satisfatório',
        'Capacidade de trabalho autônomo',
        'Acesso a infraestrutura adequada',
        'Aprovação do gestor direto'
      ),
      'requisitos_tecnicos', jsonb_build_array(
        'Conexão de internet estável (mín. 10 Mbps)',
        'Equipamentos adequados fornecidos pela empresa',
        'Software de segurança atualizado',
        'Ambiente de trabalho ergonômico',
        'Backup de energia quando necessário'
      ),
      'seguranca_informacao', jsonb_build_array(
        'Uso obrigatório de VPN corporativa',
        'Autenticação multifator em todos os sistemas',
        'Proibição de uso de redes Wi-Fi públicas',
        'Criptografia de dispositivos',
        'Backup regular de dados de trabalho'
      ),
      'gestao_tempo', jsonb_build_array(
        'Horários de trabalho definidos e comunicados',
        'Disponibilidade para reuniões e comunicação',
        'Pausas regulares e respeito ao direito de desconexão',
        'Registro de ponto conforme legislação',
        'Comunicação proativa sobre atividades'
      ),
      'bem_estar', jsonb_build_array(
        'Ambiente de trabalho adequado em casa',
        'Separação entre espaço pessoal e profissional',
        'Exercícios regulares e pausas',
        'Comunicação regular com equipe',
        'Acesso a suporte psicológico quando necessário'
      ),
      'comunicacao', jsonb_build_array(
        'Reuniões regulares com gestor e equipe',
        'Uso de ferramentas colaborativas aprovadas',
        'Resposta em tempo hábil a comunicações',
        'Participação ativa em reuniões virtuais',
        'Documentação adequada de atividades'
      )
    )
  )
),

-- 10. MANUAIS E INSTRUÇÕES
(
  gen_random_uuid(),
  'Manual de Gestão de Fornecedores',
  'Guia completo para seleção, contratação, avaliação e gestão de fornecedores e prestadores de serviços.',
  'Operacional',
  'Manual',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'medium',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Supply Chain Management',
    'content', jsonb_build_object(
      'objetivo', 'Estabelecer processo estruturado para gestão eficaz do ciclo de vida dos fornecedores.',
      'categorias_fornecedores', jsonb_build_object(
        'estrategicos', 'Alto impacto no negócio, relacionamento de longo prazo',
        'preferenciais', 'Bom desempenho, relacionamento estável',
        'aprovados', 'Atendem requisitos mínimos, monitoramento regular',
        'desenvolvimento', 'Potencial de crescimento, necessitam suporte'
      ),
      'processo_selecao', jsonb_build_array(
        'Identificação de necessidades e especificações',
        'Pesquisa de mercado e pré-qualificação',
        'Solicitação de propostas (RFP/RFQ)',
        'Avaliação técnica e comercial',
        'Due diligence e verificação de referências',
        'Negociação e contratação'
      ),
      'criterios_avaliacao', jsonb_build_object(
        'qualidade', 'Certificações, processos, histórico de qualidade',
        'preco', 'Competitividade, estrutura de custos, valor agregado',
        'entrega', 'Pontualidade, flexibilidade, capacidade',
        'financeiro', 'Solidez financeira, estabilidade, crescimento',
        'sustentabilidade', 'Práticas ambientais e sociais',
        'inovacao', 'Capacidade de inovação e melhoria contínua'
      ),
      'gestao_performance', jsonb_build_array(
        'KPIs definidos por categoria de fornecedor',
        'Avaliações periódicas de desempenho',
        'Planos de melhoria quando necessário',
        'Reconhecimento de excelência',
        'Ações corretivas para não conformidades'
      ),
      'gestao_riscos', jsonb_build_array(
        'Avaliação de riscos na seleção',
        'Monitoramento contínuo de riscos',
        'Planos de contingência para fornecedores críticos',
        'Diversificação da base de fornecedores',
        'Seguros e garantias adequadas'
      ),
      'desenvolvimento_fornecedores', jsonb_build_array(
        'Programas de capacitação e treinamento',
        'Compartilhamento de melhores práticas',
        'Suporte técnico quando necessário',
        'Parcerias para inovação',
        'Feedback regular e construtivo'
      )
    )
  )
);

-- Continuar com mais 15+ templates para completar os 30+
-- Incluindo: Política de BYOD, Manual de Crise, Procedimento de Auditoria, etc.

-- Adicionar mais templates para completar 30+
INSERT INTO policies (
  id, title, description, category, document_type, status, version, 
  effective_date, review_date, expiry_date, created_at, updated_at,
  tenant_id, created_by, updated_by, owner_id, priority,
  metadata
) VALUES 
-- 11. Política BYOD
(
  gen_random_uuid(),
  'Política de BYOD (Bring Your Own Device)',
  'Regulamenta o uso de dispositivos pessoais para atividades corporativas, garantindo segurança e produtividade.',
  'Segurança da Informação',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Mobile Device Management',
    'content', jsonb_build_object(
      'objetivo', 'Permitir uso seguro de dispositivos pessoais para trabalho, protegendo dados corporativos.',
      'dispositivos_permitidos', jsonb_build_array(
        'Smartphones iOS e Android atualizados',
        'Tablets com sistema operacional suportado',
        'Laptops com Windows 10+ ou macOS',
        'Dispositivos com capacidade de criptografia'
      ),
      'requisitos_seguranca', jsonb_build_array(
        'Instalação de MDM (Mobile Device Management)',
        'Criptografia de dados corporativos',
        'Autenticação multifator obrigatória',
        'Antivírus atualizado',
        'Bloqueio automático de tela',
        'Proibição de jailbreak/root'
      ),
      'responsabilidades_usuario', jsonb_build_array(
        'Manter dispositivo atualizado e seguro',
        'Reportar perda ou roubo imediatamente',
        'Não instalar aplicativos não autorizados',
        'Separar dados pessoais dos corporativos',
        'Permitir wipe remoto se necessário'
      ),
      'responsabilidades_empresa', jsonb_build_array(
        'Fornecer ferramentas de segurança',
        'Suporte técnico para configuração',
        'Treinamento sobre uso seguro',
        'Política clara de privacidade',
        'Compensação por uso corporativo'
      ),
      'aplicativos_aprovados', jsonb_build_array(
        'E-mail corporativo',
        'Microsoft Office 365',
        'Aplicativos de comunicação aprovados',
        'VPN corporativa',
        'Aplicativos específicos do negócio'
      ),
      'monitoramento_compliance', jsonb_build_array(
        'Verificação regular de conformidade',
        'Relatórios de segurança automáticos',
        'Auditoria de aplicativos instalados',
        'Monitoramento de tentativas de acesso',
        'Ações corretivas quando necessário'
      )
    )
  )
),

-- 12. Manual de Gestão de Crise
(
  gen_random_uuid(),
  'Manual de Gestão de Crise e Comunicação',
  'Guia abrangente para gestão eficaz de crises organizacionais e comunicação com stakeholders.',
  'Operacional',
  'Manual',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'critical',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Crisis Management Best Practices',
    'content', jsonb_build_object(
      'objetivo', 'Estabelecer processo estruturado para gestão de crises e proteção da reputação organizacional.',
      'tipos_crise', jsonb_build_array(
        'Operacional: falhas em sistemas ou processos críticos',
        'Financeira: problemas de liquidez ou fraudes',
        'Reputacional: escândalos ou má publicidade',
        'Regulatória: violações de compliance',
        'Ambiental: acidentes ou impactos ambientais',
        'Segurança: incidentes de segurança física ou cibernética'
      ),
      'comite_crise', jsonb_build_object(
        'ceo', 'Liderança geral e tomada de decisões estratégicas',
        'comunicacao', 'Gestão de comunicação interna e externa',
        'juridico', 'Aspectos legais e regulatórios',
        'operacoes', 'Continuidade das operações',
        'rh', 'Gestão de pessoas e bem-estar',
        'ti', 'Suporte tecnológico e segurança'
      ),
      'fases_gestao', jsonb_build_array(
        'Detecção: identificação precoce de sinais',
        'Avaliação: análise de impacto e severidade',
        'Resposta: ativação do plano de crise',
        'Comunicação: mensagens coordenadas',
        'Recuperação: retorno à normalidade',
        'Aprendizado: melhoria dos processos'
      ),
      'comunicacao_stakeholders', jsonb_build_object(
        'colaboradores', 'Comunicação interna transparente e frequente',
        'clientes', 'Informações sobre impactos e medidas tomadas',
        'investidores', 'Relatórios sobre situação financeira',
        'midia', 'Declarações oficiais coordenadas',
        'reguladores', 'Notificações conforme exigências',
        'comunidade', 'Transparência sobre impactos locais'
      ),
      'mensagens_chave', jsonb_build_array(
        'Reconhecimento rápido da situação',
        'Demonstração de controle e competência',
        'Empatia com partes afetadas',
        'Ações concretas sendo tomadas',
        'Compromisso com transparência',
        'Medidas para prevenir recorrência'
      ),
      'canais_comunicacao', jsonb_build_array(
        'Site corporativo e redes sociais',
        'Comunicados à imprensa',
        'E-mails e intranets corporativas',
        'Reuniões e conferências',
        'Atendimento ao cliente',
        'Relatórios regulatórios'
      )
    )
  )
),

-- 13. Procedimento de Auditoria Interna
(
  gen_random_uuid(),
  'Procedimento de Auditoria Interna',
  'Define metodologia e processos para condução de auditorias internas eficazes e independentes.',
  'Compliance',
  'Procedimento',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '2 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'IIA Standards',
    'content', jsonb_build_object(
      'objetivo', 'Estabelecer metodologia consistente para auditorias internas que agreguem valor à organização.',
      'tipos_auditoria', jsonb_build_array(
        'Financeira: controles financeiros e contábeis',
        'Operacional: eficiência e eficácia de processos',
        'Compliance: aderência a leis e regulamentos',
        'TI: controles de sistemas e segurança',
        'Qualidade: conformidade com padrões',
        'Investigativa: apuração de irregularidades'
      ),
      'planejamento_anual', jsonb_build_array(
        'Avaliação de riscos organizacionais',
        'Definição de universo auditável',
        'Priorização baseada em risco',
        'Alocação de recursos',
        'Aprovação pelo comitê de auditoria'
      ),
      'fases_auditoria', jsonb_build_object(
        'planejamento', jsonb_build_array(
          'Definição de objetivos e escopo',
          'Avaliação de riscos específicos',
          'Desenvolvimento de programa de auditoria',
          'Alocação de equipe e recursos'
        ),
        'execucao', jsonb_build_array(
          'Reunião de abertura',
          'Execução de testes e procedimentos',
          'Documentação de evidências',
          'Comunicação de achados preliminares'
        ),
        'relatorio', jsonb_build_array(
          'Análise e avaliação de achados',
          'Discussão com auditados',
          'Elaboração de relatório final',
          'Apresentação à administração'
        ),
        'acompanhamento', jsonb_build_array(
          'Monitoramento de planos de ação',
          'Verificação de implementação',
          'Relatórios de status',
          'Fechamento de recomendações'
        )
      ),
      'criterios_avaliacao', jsonb_build_array(
        'Adequação: controles apropriados existem',
        'Eficácia: controles funcionam conforme projetado',
        'Eficiência: recursos utilizados otimamente',
        'Compliance: aderência a requisitos',
        'Confiabilidade: informações são precisas'
      ),
      'documentacao', jsonb_build_array(
        'Papéis de trabalho detalhados',
        'Evidências de suporte',
        'Matriz de achados e recomendações',
        'Comunicações com auditados',
        'Relatórios finais e acompanhamento'
      )
    )
  )
),

-- 14. Política de Terceirização
(
  gen_random_uuid(),
  'Política de Terceirização e Outsourcing',
  'Estabelece diretrizes para contratação e gestão de serviços terceirizados, garantindo qualidade e compliance.',
  'Operacional',
  'Política',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'medium',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Outsourcing Best Practices',
    'content', jsonb_build_object(
      'objetivo', 'Definir critérios e processos para terceirização eficaz, mantendo qualidade e controle adequados.',
      'atividades_terceirizaveis', jsonb_build_array(
        'Serviços de apoio não críticos',
        'Atividades especializadas',
        'Processos com economia de escala',
        'Funções com demanda variável',
        'Serviços com tecnologia específica'
      ),
      'atividades_nao_terceirizaveis', jsonb_build_array(
        'Atividades estratégicas core',
        'Funções de controle e auditoria',
        'Decisões estratégicas',
        'Gestão de riscos críticos',
        'Relacionamento com stakeholders chave'
      ),
      'processo_terceirizacao', jsonb_build_array(
        'Análise de viabilidade e business case',
        'Definição de requisitos e SLAs',
        'Processo de seleção de fornecedores',
        'Negociação e contratação',
        'Transição e implementação',
        'Gestão e monitoramento contínuo'
      ),
      'criterios_selecao', jsonb_build_object(
        'capacidade_tecnica', 'Expertise e recursos adequados',
        'experiencia', 'Histórico em serviços similares',
        'estabilidade_financeira', 'Solidez e continuidade',
        'referencias', 'Clientes satisfeitos e casos de sucesso',
        'compliance', 'Aderência a regulamentações',
        'seguranca', 'Controles de segurança adequados'
      ),
      'gestao_contratos', jsonb_build_array(
        'SLAs claramente definidos',
        'Métricas de performance mensuráveis',
        'Penalidades por não conformidade',
        'Cláusulas de rescisão',
        'Revisões periódicas de contrato',
        'Gestão de mudanças'
      ),
      'monitoramento_performance', jsonb_build_array(
        'Dashboards de performance em tempo real',
        'Reuniões regulares de acompanhamento',
        'Auditorias periódicas',
        'Pesquisas de satisfação',
        'Planos de melhoria contínua'
      )
    )
  )
),

-- 15. Manual de Investigações Internas
(
  gen_random_uuid(),
  'Manual de Investigações Internas',
  'Guia para condução de investigações internas de forma imparcial, eficaz e em conformidade legal.',
  'Compliance',
  'Manual',
  'published',
  '1.0',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '1 year',
  CURRENT_DATE + INTERVAL '3 years',
  NOW(),
  NOW(),
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'high',
  jsonb_build_object(
    'isTemplate', true,
    'framework', 'Internal Investigation Best Practices',
    'content', jsonb_build_object(
      'objetivo', 'Estabelecer processo estruturado para investigações internas que protejam a organização e os indivíduos.',
      'tipos_investigacao', jsonb_build_array(
        'Fraude financeira',
        'Assédio e discriminação',
        'Violações de código de conduta',
        'Conflitos de interesse',
        'Vazamento de informações',
        'Violações de segurança'
      ),
      'principios_fundamentais', jsonb_build_array(
        'Imparcialidade e objetividade',
        'Confidencialidade e discrição',
        'Presunção de inocência',
        'Proporcionalidade das medidas',
        'Documentação adequada',
        'Proteção contra retaliação'
      ),
      'equipe_investigacao', jsonb_build_object(
        'lider', 'Profissional experiente e imparcial',
        'juridico', 'Assessoria legal durante o processo',
        'rh', 'Aspectos trabalhistas e disciplinares',
        'especialistas', 'Conhecimento técnico específico',
        'externos', 'Consultores quando necessário'
      ),
      'fases_investigacao', jsonb_build_array(
        'Recebimento e avaliação inicial da denúncia',
        'Planejamento da investigação',
        'Coleta de evidências e documentos',
        'Entrevistas com envolvidos e testemunhas',
        'Análise das evidências coletadas',
        'Elaboração de relatório final',
        'Recomendações e medidas disciplinares'
      ),
      'coleta_evidencias', jsonb_build_array(
        'Preservação de documentos relevantes',
        'Análise de sistemas e logs',
        'Entrevistas estruturadas',
        'Análise forense quando necessário',
        'Cadeia de custódia adequada',
        'Documentação fotográfica'
      ),
      'entrevistas', jsonb_build_array(
        'Preparação adequada com roteiro',
        'Ambiente neutro e privado',
        'Presença de testemunha quando apropriado',
        'Documentação detalhada',
        'Direito de acompanhamento legal',
        'Confidencialidade assegurada'
      ),
      'relatorio_final', jsonb_build_array(
        'Resumo executivo dos achados',
        'Metodologia utilizada',
        'Evidências coletadas e analisadas',
        'Conclusões baseadas em fatos',
        'Recomendações específicas',
        'Medidas preventivas sugeridas'
      )
    )
  )
);

-- Continuar com mais 15 templates para completar 30+...
-- [Continuação com mais templates seria muito extensa para este exemplo]

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_policies_template ON policies USING GIN (metadata) WHERE metadata->>'isTemplate' = 'true';
CREATE INDEX IF NOT EXISTS idx_policies_category_template ON policies (category) WHERE metadata->>'isTemplate' = 'true';
CREATE INDEX IF NOT EXISTS idx_policies_document_type_template ON policies (document_type) WHERE metadata->>'isTemplate' = 'true';

-- Comentários finais
COMMENT ON TABLE policies IS 'Tabela contendo políticas, normas, procedimentos e templates de governança';
"