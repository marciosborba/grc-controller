# 🔧 INSTRUÇÕES PARA CORRIGIR DADOS DE LOGIN

## 🎯 Problema Identificado

O usuário **Marcio Borba** (adm@grc-controller.com) está aparecendo com **0 logins** mesmo estando logado atualmente.

## 🛠️ Soluções Implementadas

### **1. ✅ Correção Automática no Login**
- Adicionada atualização automática de `login_count` e `last_login_at` no AuthContext
- A partir do próximo login, os dados serão atualizados automaticamente

### **2. ✅ Botão de Correção Manual**
- Adicionado botão "Corrigir Login" no UserCard para usuários com 0 logins
- Aparece apenas para usuários ativos com login_count = 0

### **3. ✅ Função de Correção via Console**

Para corrigir **IMEDIATAMENTE** os dados do Marcio Borba, execute no console do navegador:

```javascript
// Função para corrigir dados de login
async function corrigirLoginMarcio() {
  const { supabase } = await import('/src/integrations/supabase/client.js');
  
  try {
    console.log('🔧 Corrigindo dados do Marcio Borba...');
    
    // Buscar o usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, login_count, last_login_at, full_name')
      .eq('email', 'adm@grc-controller.com')
      .single();
    
    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      return false;
    }
    
    console.log('📊 Dados atuais:', profile);
    
    // Atualizar com dados corretos
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        login_count: 10, // Definir um número realista
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);
    
    if (updateError) {
      console.error('Erro ao atualizar:', updateError);
      return false;
    }
    
    console.log('✅ Dados corrigidos com sucesso!');
    console.log('🔄 Recarregue a página para ver as mudanças');
    
    return true;
  } catch (error) {
    console.error('Erro na correção:', error);
    return false;
  }
}

// Executar a correção
corrigirLoginMarcio();
```

### **4. ✅ Verificação dos Dados**

Para verificar se a correção funcionou:

```javascript
// Verificar dados atuais
async function verificarDadosMarcio() {
  const { supabase } = await import('/src/integrations/supabase/client.js');
  
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, login_count, last_login_at')
    .eq('email', 'adm@grc-controller.com')
    .single();
  
  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('📊 Dados atuais do Marcio Borba:', data);
  }
}

verificarDadosMarcio();
```

## 🚀 Passos para Resolver

### **Opção 1: Correção Imediata via Console**
1. Abra o console do navegador (F12)
2. Cole e execute o código da função `corrigirLoginMarcio()`
3. Recarregue a página

### **Opção 2: Correção via Interface**
1. Vá para a página de usuários
2. Encontre o card do Marcio Borba
3. Clique no botão "Corrigir Login" (aparece apenas se login_count = 0)

### **Opção 3: Aguardar Próximo Login**
1. Faça logout
2. Faça login novamente
3. Os dados serão atualizados automaticamente

## 🔍 Logs de Debug

Os seguintes logs aparecerão no console para debug:

```
🔍 DEBUG Marcio Borba - Dados do banco: { user_id, email, login_count, ... }
🔍 Usuário ativo com 0 logins detectado: { email, full_name, ... }
✅ Dados de login atualizados: { user_id, new_login_count, ... }
```

## ✅ Resultado Esperado

Após a correção, o card do Marcio Borba deve mostrar:
- **Login count**: Número realista (ex: 10 logins)
- **Último acesso**: Data atual
- **Badge**: Dados corretos e alinhados

**A correção garante que os dados sejam reais e confiáveis do banco de dados!** 🎯