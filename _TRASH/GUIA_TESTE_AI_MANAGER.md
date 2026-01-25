# 🔍 Guia de Teste: AI Manager 404

## 📋 Testes para Identificar o Problema

Siga estes testes em ordem para identificar exatamente onde está o problema:

### Teste 1: Verificar Autenticação
```
http://localhost:8080/auth-debug
```
**O que verificar:**
- ✅ Usuário está logado?
- ✅ Tem sessão ativa?
- ✅ É Platform Admin?
- ✅ Quais roles possui?

### Teste 2: Teste de Rota Simples
```
http://localhost:8080/admin/ai-test
```
**Resultado esperado:**
- Se **funcionar**: Página verde com "ROTA AI TESTE FUNCIONA!"
- Se **não funcionar**: Redirecionamento ou erro

### Teste 3: Teste de Debug Detalhado
```
http://localhost:8080/admin/ai-debug
```
**Resultado esperado:**
- Se **tem permissão**: Página azul com "ROTA AI DEBUG FUNCIONA!"
- Se **não tem permissão**: Página detalhada explicando o problema

### Teste 4: Rota Original
```
http://localhost:8080/admin/ai-management
```
**Resultado esperado:**
- Se **funcionar**: Página do AI Manager com 6 abas
- Se **não funcionar**: Redirecionamento para dashboard

## 🔧 Scripts de Debug

### No Console do Navegador (F12):
```javascript
// Copie e cole este código no console
console.log('🔍 Debug AI Manager:', {
  url: window.location.href,
  pathname: window.location.pathname,
  userAgent: navigator.userAgent,
  localStorage: Object.keys(localStorage),
  sessionStorage: Object.keys(sessionStorage)
});

// Verificar se há erros
console.log('❌ Erros no console:', console.error.length || 0);
```

### Verificar Dados de Auth:
```javascript
// No console do navegador
const authData = localStorage.getItem('supabase.auth.token');
if (authData) {
  try {
    const parsed = JSON.parse(authData);
    console.log('🔐 Auth Token:', {
      hasAccessToken: !!parsed.access_token,
      hasRefreshToken: !!parsed.refresh_token,
      expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000) : null
    });
  } catch (e) {
    console.log('❌ Erro ao parsear auth data');
  }
} else {
  console.log('❌ Nenhum token de auth encontrado');
}
```

## 📊 Resultados Possíveis

### Cenário A: Usuário não logado
- **Teste 1**: Mostra "Usuário Logado: Não"
- **Teste 2**: Redireciona para `/login`
- **Teste 3**: Redireciona para `/login`
- **Teste 4**: Redireciona para `/login`

**Solução**: Fazer login no sistema

### Cenário B: Usuário logado mas sem permissão
- **Teste 1**: Mostra "Platform Admin: Não"
- **Teste 2**: Redireciona para `/dashboard`
- **Teste 3**: Mostra página explicativa com dados do usuário
- **Teste 4**: Redireciona para `/dashboard`

**Solução**: Adicionar role de platform_admin

### Cenário C: Usuário com permissão
- **Teste 1**: Mostra "Platform Admin: Sim"
- **Teste 2**: Página verde funciona
- **Teste 3**: Página azul funciona
- **Teste 4**: Deveria funcionar (se não funcionar, há outro problema)

## 🛠️ Soluções por Cenário

### Para Cenário A (Não logado):
1. Acesse `http://localhost:8080/login`
2. Faça login com suas credenciais
3. Teste novamente

### Para Cenário B (Sem permissão):
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute:
   ```sql
   -- Substitua pelo seu email
   INSERT INTO user_roles (user_id, role)
   SELECT id, 'platform_admin'
   FROM auth.users
   WHERE email = 'seu-email@exemplo.com'
   ON CONFLICT (user_id, role) DO NOTHING;
   ```
4. Faça logout e login novamente
5. Teste novamente

### Para Cenário C (Com permissão mas não funciona):
Se os testes 1, 2 e 3 funcionam mas o 4 não, pode ser:
- Problema no componente AIManagementPage
- Erro de importação
- Problema no lazy loading
- Erro de JavaScript no console

## 📝 Como Reportar Resultados

Execute os testes e me informe:

1. **Teste 1 (auth-debug)**: O que aparece?
2. **Teste 2 (ai-test)**: Funciona ou redireciona?
3. **Teste 3 (ai-debug)**: Qual página aparece?
4. **Teste 4 (ai-management)**: Funciona ou redireciona?
5. **Console**: Há erros no console do navegador (F12)?

Com essas informações, posso identificar exatamente onde está o problema e fornecer a solução específica.

## 🚀 Teste Rápido

Se quiser um teste rápido, acesse apenas:
```
http://localhost:8080/admin/ai-debug
```

Esta página vai mostrar exatamente qual é o problema e como resolver.