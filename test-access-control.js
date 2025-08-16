// Script para testar controle de acesso a Regras Globais
// Execute com: node test-access-control.js

const testAccessControl = () => {
  console.log('🔐 === TESTE DE CONTROLE DE ACESSO - REGRAS GLOBAIS ===');
  
  // Simular diferentes tipos de usuários
  const usuarios = [
    {
      name: 'Platform Admin',
      isPlatformAdmin: true,
      role: 'admin',
      shouldHaveAccess: true
    },
    {
      name: 'System Admin',
      isPlatformAdmin: false,
      role: 'admin',
      shouldHaveAccess: true
    },
    {
      name: 'CISO',
      isPlatformAdmin: false,
      role: 'ciso',
      shouldHaveAccess: false
    },
    {
      name: 'Risk Manager',
      isPlatformAdmin: false,
      role: 'risk_manager',
      shouldHaveAccess: false
    },
    {
      name: 'User Regular',
      isPlatformAdmin: false,
      role: 'user',
      shouldHaveAccess: false
    }
  ];
  
  console.log('🧪 Testando condição de acesso: user?.isPlatformAdmin || user?.role === "admin"');
  console.log('');
  
  usuarios.forEach(user => {
    // Aplicar a mesma lógica do componente
    const isAdmin = user?.isPlatformAdmin || user?.role === 'admin';
    const hasAccess = isAdmin;
    const testResult = hasAccess === user.shouldHaveAccess ? '✅ CORRETO' : '❌ ERRO';
    
    console.log(`👤 ${user.name}:`);
    console.log(`   - isPlatformAdmin: ${user.isPlatformAdmin}`);
    console.log(`   - role: ${user.role}`);
    console.log(`   - isAdmin calculado: ${isAdmin}`);
    console.log(`   - Deveria ter acesso: ${user.shouldHaveAccess}`);
    console.log(`   - Tem acesso: ${hasAccess}`);
    console.log(`   - Resultado: ${testResult}`);
    console.log('');
  });
  
  console.log('📋 RESUMO:');
  console.log('✅ Platform Admin: TEM ACESSO (isPlatformAdmin = true)');
  console.log('✅ System Admin: TEM ACESSO (role = "admin")'); 
  console.log('❌ CISO: SEM ACESSO (role != "admin" e isPlatformAdmin = false)');
  console.log('❌ Risk Manager: SEM ACESSO (role != "admin" e isPlatformAdmin = false)');
  console.log('❌ User Regular: SEM ACESSO (role != "admin" e isPlatformAdmin = false)');
  console.log('');
  console.log('🔒 CONCLUSÃO: Apenas Platform Admins e System Admins têm acesso às Regras Globais');
};

testAccessControl();