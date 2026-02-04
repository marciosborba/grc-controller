#!/usr/bin/env node

/**
 * Script para testar permissões de roles
 * Simula a lógica de verificação de permissões do AppSidebar
 */

// Roles de teste (copiadas do AppSidebar)
const TEST_ROLES = [
  {
    id: 'platform_admin',
    name: 'platform_admin',
    displayName: 'Platform Admin',
    permissions: ['platform_admin', 'all', '*', 'read', 'write', 'delete', 'admin', 'users.create', 'users.read', 'users.update', 'users.delete', 'tenants.manage'],
    description: 'Administrador da plataforma com acesso total e capacidade de gerenciar múltiplos tenants'
  },
  {
    id: '1',
    name: 'super_admin',
    displayName: 'Super Administrador',
    permissions: ['*', 'all'],
    description: 'Acesso total à plataforma com poderes de configuração global'
  },
  {
    id: '2',
    name: 'compliance_manager',
    displayName: 'Gerente de Compliance',
    permissions: ['compliance.read', 'compliance.write', 'audit.read', 'audit.write', 'report.read', 'report.export', 'assessment.read'],
    description: 'Gerencia políticas de compliance, auditoria e assessments'
  },
  {
    id: '3',
    name: 'security_analyst',
    displayName: 'Analista de Segurança',
    permissions: ['security.read', 'incident.read', 'incident.write', 'vulnerabilities.read', 'risk.read'],
    description: 'Monitora e analisa incidentes de segurança'
  },
  {
    id: '4',
    name: 'auditor',
    displayName: 'Auditor',
    permissions: ['audit.read', 'audit.write', 'logs.read', 'report.read', 'compliance.read', 'all'],
    description: 'Acesso a módulos de auditoria, relatórios, conformidade e módulos públicos (sem assessments)'
  },
  {
    id: '5',
    name: 'user',
    displayName: 'Usuário Básico',
    permissions: ['all'],
    description: 'Acesso limitado apenas a módulos públicos (Dashboard, Ética, Notificações, Ajuda)'
  }
];

// Módulos de navegação (copiados do AppSidebar)
const navigationItems = [
  {
    title: 'Assessment',
    permissions: ['assessment.read'],
    description: 'Gestão de Assessments (apenas para roles específicas)'
  },
  {
    title: 'Auditoria',
    permissions: ['audit.read'],
    description: 'Gestão de Auditoria'
  },
  {
    title: 'Ética',
    permissions: ['all'],
    description: 'Denúncias e questões éticas'
  },
  {
    title: 'Usuários',
    permissions: ['admin', 'users.read'],
    description: 'Gestão de usuários'
  },
  {
    title: 'Conformidade',
    permissions: ['compliance.read'],
    description: 'Gestão de Conformidade'
  },
  {
    title: 'Dashboard',
    permissions: ['all'],
    description: 'Visão geral e métricas principais'
  },
  {
    title: 'Notificações',
    permissions: ['all'],
    description: 'Central de notificações e alertas'
  },
  {
    title: 'Riscos',
    permissions: ['risk.read'],
    description: 'Gestão de Riscos'
  },
  {
    title: 'Incidentes',
    permissions: ['incident.read'],
    description: 'Gestão de incidentes de segurança'
  },
  {
    title: 'Políticas',
    permissions: ['compliance.read'],
    description: 'Gestão de Políticas e Normas'
  },
  {
    title: 'Privacidade',
    permissions: ['privacy.read'],
    description: 'Gestão de LGPD'
  },
  {
    title: 'TPRM',
    permissions: ['vendor.read'],
    description: 'Gestão de Riscos de Terceiros'
  },
  {
    title: 'Relatórios',
    permissions: ['report.read'],
    description: 'Relatórios e dashboards personalizados'
  },
  {
    title: 'Ajuda',
    permissions: ['all'],
    description: 'Centro de ajuda e documentação'
  }
];

// Função para verificar permissões (copiada do AppSidebar)
function hasPermission(rolePermissions, requiredPermissions) {
  return requiredPermissions.some(permission => {
    // Verificar permissão específica
    const hasSpecific = rolePermissions.includes(permission);
    
    // Verificar se role tem permissão '*' (acesso total - apenas para super admins)
    const hasSuperAccess = rolePermissions.includes('*');
    
    return hasSpecific || hasSuperAccess;
  });
}

// Função para testar uma role específica
function testRole(role) {
  console.log(`\n🧪 TESTANDO ROLE: ${role.displayName}`);
  console.log(`📋 Permissões: ${role.permissions.join(', ')}`);
  console.log('─'.repeat(60));
  
  const accessibleModules = [];
  const deniedModules = [];
  
  navigationItems.forEach(module => {
    const hasAccess = hasPermission(role.permissions, module.permissions);
    
    if (hasAccess) {
      accessibleModules.push(module.title);
    } else {
      deniedModules.push(module.title);
    }
    
    const status = hasAccess ? '✅' : '❌';
    const requiredPerms = module.permissions.join(', ');
    console.log(`${status} ${module.title.padEnd(15)} | Requer: ${requiredPerms}`);
  });
  
  console.log(`\n📊 RESUMO:`);
  console.log(`✅ Acesso a ${accessibleModules.length} módulos: ${accessibleModules.join(', ')}`);
  console.log(`❌ Negado a ${deniedModules.length} módulos: ${deniedModules.join(', ')}`);
  
  return { accessible: accessibleModules, denied: deniedModules };
}

// Executar testes
console.log('🔍 TESTE DE PERMISSÕES DE ROLES');
console.log('='.repeat(60));

const results = {};

TEST_ROLES.forEach(role => {
  results[role.name] = testRole(role);
});

// Verificações específicas
console.log('\n🎯 VERIFICAÇÕES ESPECÍFICAS:');
console.log('='.repeat(60));

// Verificar se Auditor NÃO tem acesso a Assessment
const auditorResult = results['auditor'];
const auditorHasAssessment = auditorResult.accessible.includes('Assessment');

console.log(`\n👁️ AUDITOR - Assessment:`);
if (auditorHasAssessment) {
  console.log('❌ ERRO: Auditor tem acesso a Assessment (não deveria ter)');
} else {
  console.log('✅ CORRETO: Auditor NÃO tem acesso a Assessment');
}

// Verificar se Auditor tem acesso aos módulos corretos
const expectedAuditorModules = ['Auditoria', 'Relatórios', 'Conformidade', 'Políticas', 'Dashboard', 'Ética', 'Notificações', 'Ajuda'];
const auditorMissingModules = expectedAuditorModules.filter(module => !auditorResult.accessible.includes(module));

console.log(`\n👁️ AUDITOR - Módulos esperados:`);
if (auditorMissingModules.length === 0) {
  console.log('✅ CORRETO: Auditor tem acesso a todos os módulos esperados');
} else {
  console.log(`❌ ERRO: Auditor não tem acesso a: ${auditorMissingModules.join(', ')}`);
}

// Verificar se Compliance Manager tem acesso a Assessment
const complianceResult = results['compliance_manager'];
const complianceHasAssessment = complianceResult.accessible.includes('Assessment');

console.log(`\n🛡️ COMPLIANCE MANAGER - Assessment:`);
if (complianceHasAssessment) {
  console.log('✅ CORRETO: Compliance Manager tem acesso a Assessment');
} else {
  console.log('❌ ERRO: Compliance Manager NÃO tem acesso a Assessment (deveria ter)');
}

// Verificar se Usuário Básico tem acesso limitado
const userResult = results['user'];
const userPublicModules = ['Dashboard', 'Ética', 'Notificações', 'Ajuda'];
const userHasOnlyPublic = userResult.accessible.every(module => userPublicModules.includes(module));

console.log(`\n👤 USUÁRIO BÁSICO - Acesso limitado:`);
if (userHasOnlyPublic && userResult.accessible.length === userPublicModules.length) {
  console.log('✅ CORRETO: Usuário Básico tem acesso apenas a módulos públicos');
} else {
  console.log(`❌ ERRO: Usuário Básico tem acesso incorreto`);
  console.log(`   Esperado: ${userPublicModules.join(', ')}`);
  console.log(`   Atual: ${userResult.accessible.join(', ')}`);
}

console.log('\n🎉 TESTE CONCLUÍDO!');
console.log('='.repeat(60));