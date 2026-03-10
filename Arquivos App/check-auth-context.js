// Script para verificar como a autenticação está funcionando na aplicação
console.log('🔍 VERIFICANDO CONTEXTO DE AUTENTICAÇÃO...');

// Verificar se há dados de autenticação no localStorage/sessionStorage
console.log('\n📱 VERIFICANDO STORAGE LOCAL...');

if (typeof window !== 'undefined') {
  // Verificar localStorage
  console.log('🔍 LocalStorage:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
      const value = localStorage.getItem(key);
      console.log(`   ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
    }
  }
  
  // Verificar sessionStorage
  console.log('🔍 SessionStorage:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
      const value = sessionStorage.getItem(key);
      console.log(`   ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
    }
  }
} else {
  console.log('❌ Não está rodando no browser - não pode verificar storage');
}

// Verificar se há cookies de autenticação
console.log('\n🍪 VERIFICANDO COOKIES...');
if (typeof document !== 'undefined') {
  const cookies = document.cookie.split(';');
  const authCookies = cookies.filter(cookie => 
    cookie.includes('supabase') || 
    cookie.includes('auth') || 
    cookie.includes('token')
  );
  
  if (authCookies.length > 0) {
    console.log('✅ Cookies de autenticação encontrados:');
    authCookies.forEach(cookie => {
      console.log(`   ${cookie.trim().substring(0, 50)}...`);
    });
  } else {
    console.log('❌ Nenhum cookie de autenticação encontrado');
  }
} else {
  console.log('❌ Não está rodando no browser - não pode verificar cookies');
}

console.log('\n📋 INSTRUÇÕES PARA VERIFICAR NA APLICAÇÃO:');
console.log('1. Abra o DevTools do browser (F12)');
console.log('2. Vá para a aba Console');
console.log('3. Digite: localStorage.getItem("supabase.auth.token")');
console.log('4. Digite: window.supabase?.auth?.getUser()');
console.log('5. Verifique se há dados de autenticação');

console.log('\n🔧 PARA TESTAR O MODAL:');
console.log('1. Certifique-se de estar logado na aplicação');
console.log('2. Vá para http://localhost:8080/incidents');
console.log('3. Abra o DevTools e monitore as requisições na aba Network');
console.log('4. Tente criar um novo incidente');
console.log('5. Verifique se a requisição POST para /incidents está sendo feita');