module.exports = [
  // 1. Governança e Políticas
  {
    id: 'gov_1',
    category: 'Governança e Políticas',
    question: 'A organização possui uma Política de Segurança da Informação (PSI) formalmente documentada e aprovada?',
    type: 'yes_no',
    required: true,
    weight: 10,
    description: 'A política deve ser revisada anualmente e comunicada a todos os colaboradores.',
    order: 1
  },
  {
    id: 'gov_2',
    category: 'Governança e Políticas',
    question: 'Existe um responsável designado pela Segurança da Informação (CISO ou equivalente)?',
    type: 'yes_no',
    required: true,
    weight: 8,
    order: 2
  },
  {
    id: 'gov_3',
    category: 'Governança e Políticas',
    question: 'Os colaboradores passam por treinamentos periódicos de conscientização em segurança?',
    type: 'multiple_choice',
    options: ['Sim, anualmente', 'Sim, na admissão apenas', 'Não há treinamento formal', 'Sim, trimestralmente'],
    required: true,
    weight: 8,
    order: 3
  },

  // 2. Controle de Acesso
  {
    id: 'access_1',
    category: 'Controle de Acesso',
    question: 'A organização utiliza Múltiplo Fator de Autenticação (MFA) para acesso a sistemas críticos?',
    type: 'yes_no',
    required: true,
    weight: 10,
    order: 4
  },
  {
    id: 'access_2',
    category: 'Controle de Acesso',
    question: 'Como é realizado o processo de revogação de acessos de colaboradores desligados?',
    type: 'multiple_choice',
    options: ['Imediato (automático)', 'Em até 24 horas', 'Em até 1 semana', 'Manual/Sob demanda'],
    required: true,
    weight: 9,
    order: 5
  },
  {
    id: 'access_3',
    category: 'Controle de Acesso',
    question: 'Existe revisão periódica de direitos de acesso?',
    type: 'yes_no',
    required: true,
    weight: 7,
    order: 6
  },

  // 3. Proteção de Dados e Privacidade (LGPD/GDPR)
  {
    id: 'privacy_1',
    category: 'Privacidade e Dados',
    question: 'A organização mapeou os dados pessoais que processa (Data Mapping)?',
    type: 'yes_no',
    required: true,
    weight: 9,
    order: 7
  },
  {
    id: 'privacy_2',
    category: 'Privacidade e Dados',
    question: 'Qual o nível de conformidade com a LGPD?',
    type: 'scale',
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Não Iniciado', 'Inicial', 'Em Andamento', 'Avançado', 'Totalmente Conforme'],
    required: true,
    weight: 10,
    order: 8
  },
  {
    id: 'privacy_3',
    category: 'Privacidade e Dados',
    question: 'Existe um processo definido para resposta a incidentes de violação de dados?',
    type: 'yes_no',
    required: true,
    weight: 10,
    order: 9
  },

  // 4. Segurança Física e do Ambiente
  {
    id: 'phys_1',
    category: 'Segurança Física',
    question: 'O acesso físico aos servidores/datacenter é restrito e monitorado?',
    type: 'yes_no',
    required: true,
    weight: 6,
    order: 10
  },
  {
    id: 'phys_2',
    category: 'Segurança Física',
    question: 'Existem controles ambientais (energia, refrigeração, combate a incêndio) adequados?',
    type: 'yes_no',
    required: false,
    weight: 5,
    order: 11
  },

  // 5. Gestão de Incidentes e Continuidade
  {
    id: 'inc_1',
    category: 'Continuidade de Negócios',
    question: 'A organização possui um Plano de Continuidade de Negócios (PCN) testado?',
    type: 'yes_no',
    required: true,
    weight: 8,
    order: 12
  },
  {
    id: 'inc_2',
    category: 'Continuidade de Negócios',
    question: 'Com que frequência são realizados testes de restore de backup?',
    type: 'multiple_choice',
    options: ['Mensalmente', 'Trimestralmente', 'Anualmente', 'Nunca testado', 'Somente quando necessário'],
    required: true,
    weight: 9,
    order: 13
  },

  // 6. Gestão de Terceiros
  {
    id: 'tp_1',
    category: 'Gestão de Terceiros',
    question: 'Os fornecedores críticos são avaliados quanto a riscos de segurança?',
    type: 'yes_no',
    required: true,
    weight: 7,
    order: 14
  },

  // 7. Certificações
  {
    id: 'evid_1',
    category: 'Certificações',
    question: 'Anexe o certificado ISO 27001 ou SOC 2 (se houver):',
    type: 'file_upload',
    required: false,
    weight: 0,
    order: 15
  },
  {
    id: 'obs_1',
    category: 'Observações Finais',
    question: 'Descreva quaisquer outras medidas de segurança relevantes ou compensatórias:',
    type: 'text',
    required: false,
    weight: 0,
    order: 16
  }
];