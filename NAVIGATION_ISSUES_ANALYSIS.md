# 🔍 ANÁLISE DOS PROBLEMAS DE NAVEGAÇÃO E LOGOUT

**Data**: 04/09/2025  
**Problemas Identificados**: Logout automático e navegação não responsiva  
**Status**: 🔍 **EM ANÁLISE**

---

## 🎯 PROBLEMAS RELATADOS

1. **Logout Automático**: Aplicação desloga sozinha algumas vezes
2. **Navegação Não Responsiva**: Menu do sidebar não navega, mas URL muda

---

## 🔍 PROBLEMAS IDENTIFICADOS NO CÓDIGO

### 1. **Import Incorreto no Sidebar (CRÍTICO)**
```typescript
// PROBLEMA: src/components/ui/sidebar.tsx linha 8
import { useIsMobile } from "@/hooks/use-mobile"

// CORRETO DEVERIA SER:
import { useIsMobile } from "@/hooks/useIsMobile"
```

### 2. **Timeouts Agressivos no AuthContext**
```typescript
// PROBLEMA: Timeouts muito curtos podem causar logout
const STARTUP_TIMEOUT = 3000; // 3 segundos - MUITO CURTO
setTimeout(() => reject(new Error('Timeout')), 4000) // 4 segundos - MUITO CURTO
```

### 3. **Múltiplos useEffect sem Controle no AppSidebarFixed**
```typescript
// PROBLEMA: useEffect sem cleanup adequado
useEffect(() => {
  loadDatabaseRoles(); // Pode executar múltiplas vezes
}, [userIsPlatformAdmin, rolesLoaded, loadDatabaseRoles]);
```

### 4. **Queries React Query com Configuração Agressiva**
```typescript
// PROBLEMA: Configuração muito restritiva
retry: 0, // Sem retry pode causar falhas
refetchOnWindowFocus: false, // Pode não atualizar dados
refetchOnReconnect: false, // Pode não reconectar
```

### 5. **Listener de Auth State sem Debounce**
```typescript
// PROBLEMA: handleAuthChange pode ser chamado múltiplas vezes
const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
```

---

## 🚨 CAUSAS PROVÁVEIS DOS PROBLEMAS

### **Logout Automático**
1. **Timeouts agressivos** fazem o sistema pensar que perdeu conexão
2. **Falhas de rede** não são tratadas adequadamente (retry: 0)
3. **Token refresh** pode falhar devido aos timeouts curtos
4. **Memory leaks** em useEffect podem causar comportamento inesperado

### **Navegação Não Responsiva**
1. **Import incorreto** do useIsMobile quebra o sidebar
2. **Re-renders excessivos** devido a useEffect mal configurados
3. **Estado inconsistente** entre URL e componente renderizado
4. **Suspense boundaries** podem estar travando componentes

---

## 🔧 SOLUÇÕES PROPOSTAS

### 1. **Corrigir Import do useIsMobile**
```typescript
// src/components/ui/sidebar.tsx
- import { useIsMobile } from "@/hooks/use-mobile"
+ import { useIsMobile } from "@/hooks/useIsMobile"
```

### 2. **Aumentar Timeouts no AuthContext**
```typescript
const STARTUP_TIMEOUT = 10000; // 10 segundos
const AUTH_TIMEOUT = 15000; // 15 segundos
const USER_DATA_TIMEOUT = 12000; // 12 segundos
```

### 3. **Adicionar Retry nas Queries**
```typescript
retry: 2, // Permitir 2 tentativas
retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
```

### 4. **Debounce no Auth State Change**
```typescript
const debouncedHandleAuthChange = debounce(handleAuthChange, 300);
```

### 5. **Melhorar Cleanup dos useEffect**
```typescript
useEffect(() => {
  let isMounted = true;
  let timeoutId: NodeJS.Timeout;
  
  // ... código ...
  
  return () => {
    isMounted = false;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, []);
```

### 6. **Adicionar Error Boundaries Específicos**
```typescript
// Para navegação
<ErrorBoundary fallback={<NavigationFallback />}>
  <Outlet />
</ErrorBoundary>
```

### 7. **Implementar Heartbeat para Sessão**
```typescript
// Verificar sessão periodicamente
useEffect(() => {
  const interval = setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && user) {
      // Sessão perdida, fazer logout limpo
      logout();
    }
  }, 60000); // A cada minuto
  
  return () => clearInterval(interval);
}, [user, logout]);
```

---

## 🎯 PRIORIDADES DE CORREÇÃO

### 🔴 **CRÍTICO (Imediato)**
1. Corrigir import do useIsMobile no sidebar
2. Aumentar timeouts no AuthContext
3. Adicionar retry nas queries

### 🟡 **ALTO (Próximas horas)**
4. Implementar debounce no auth state change
5. Melhorar cleanup dos useEffect
6. Adicionar heartbeat de sessão

### 🟢 **MÉDIO (Próximos dias)**
7. Adicionar error boundaries específicos
8. Implementar logging detalhado
9. Adicionar métricas de performance

---

## 🧪 TESTES RECOMENDADOS

### **Para Logout Automático**
1. Deixar aplicação aberta por 30+ minutos
2. Testar com conexão instável
3. Testar refresh de página
4. Testar mudança de aba/janela

### **Para Navegação**
1. Clicar rapidamente entre módulos
2. Testar navegação em mobile
3. Testar com sidebar colapsado/expandido
4. Testar navegação via URL direta

---

## 📊 MONITORAMENTO SUGERIDO

### **Métricas a Acompanhar**
- Taxa de logout não intencional
- Tempo de resposta da navegação
- Erros de timeout
- Re-renders excessivos
- Memory usage

### **Logs Importantes**
- Auth state changes
- Navigation events
- Timeout errors
- Component mount/unmount
- Network failures

---

*Análise realizada em: 04/09/2025*  
*Próximo passo: Aplicar correções críticas*