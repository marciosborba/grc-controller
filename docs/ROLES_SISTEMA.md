# Sistema de Roles e Permissões

Este documento explica como funcionam os diferentes tipos de roles no sistema e como utilizá-los corretamente.

## Tipos de Roles

### 1. Roles de Sistema (Gerais)
Estas roles definem o acesso geral do usuário ao sistema e suas funcionalidades principais:

- **admin**: Acesso total ao sistema, pode gerenciar todos os usuários e configurações
- **ciso**: Responsável pela segurança da informação, pode gerenciar usuários da mesma organização
- **risk_manager**: Pode gerenciar riscos, avaliações de fornecedores e assessments
- **compliance_officer**: Pode gerenciar políticas, controles e assessments de compliance
- **user**: Usuário padrão com acesso básico ao sistema

**Como atribuir**: Use a interface de "Editar Usuário" na área administrativa.

### 2. Roles de Assessment (Específicas)
Estas roles são específicas para cada assessment individual:

- **respondent**: Pode responder questões e avaliar a maturidade inicial dos controles
- **auditor**: Pode revisar respostas, fazer análises e dar avaliação final de maturidade

**Como atribuir**: Use o botão "Gerenciar Usuários" dentro do assessment específico.

## Permissões Especiais para Administradores

### Acesso Total em Assessments
Usuários com roles de sistema **admin** ou **ciso** automaticamente recebem:
- Acesso total como auditor em todos os assessments
- Capacidade de gerenciar usuários em assessments
- Permissão para editar e avaliar qualquer controle

### Interface de Gerenciamento
Administradores verão um botão adicional "Gerenciar Usuários" nas páginas de detalhes dos assessments para:
- Atribuir usuários como respondentes ou auditores
- Remover usuários de assessments
- Visualizar todos os usuários atribuídos

## Fluxo Recomendado

### Para Administradores:
1. Crie o assessment
2. Use o botão "Gerenciar Usuários" no assessment para atribuir:
   - **Respondentes**: Quem vai responder as questões iniciais
   - **Auditores**: Quem vai revisar e fazer a avaliação final
3. Os administradores sempre têm acesso total automaticamente

### Para Usuários Finais:
1. Aguarde ser atribuído a um assessment pelo administrador
2. Acesse o assessment através da lista de assessments
3. Execute suas funções conforme seu papel atribuído

## Resolução de Problemas

### "Usuário não tem papel definido"
- **Causa**: O usuário não foi atribuído a nenhum papel específico no assessment
- **Solução**: Administrador deve usar "Gerenciar Usuários" no assessment para atribuir o papel

### "Could not find roles colluns"
- **Causa**: Tentativa de atribuir roles de assessment através da interface geral de usuário
- **Solução**: Use a interface específica de cada assessment para gerenciar papéis

### Administrador sem acesso
- **Verificação**: Confirme se o usuário tem role 'admin' ou 'ciso' no sistema
- **Solução**: Verifique as roles de sistema na edição do usuário

## Nota Importante

**NÃO** tente atribuir roles de assessment (respondent/auditor) através da interface geral de edição de usuários. Estas são roles específicas de cada assessment e devem ser gerenciadas individualmente em cada projeto de avaliação.