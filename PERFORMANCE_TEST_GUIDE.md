# 🔍 GUIA DE TESTE DE PERFORMANCE - IDENTIFICAÇÃO DE GARGALOS

## 🎯 **Objetivo**

Identificar exatamente onde está o gargalo que está causando os 8+ segundos de lentidão no módulo de riscos.

## 🧪 **Testes Criados**

Criei componentes de teste progressivos para isolar o problema:

### **1. 🟢 Teste Básico (Componente Mínimo)**
**URL:** `/risks-test`

**O que testa:** Roteamento básico e renderização mínima
- Se carregar rapidamente: problema não é no roteamento
- Se carregar lentamente: problema é mais fundamental

### **2. 🟡 Teste com Hook (useRiskManagement)**
**URL:** `/risks-hook-test`

**O que testa:** Hook useRiskManagement e queries do banco
- Se carregar rapidamente: problema não é no hook
- Se carregar lentamente: problema está nas queries do banco

### **3. 🔴 Teste Completo (Módulo Original)**
**URL:** `/risks`

**O que testa:** Módulo completo com todos os componentes

## 📋 **Como Executar os Testes**

### **Passo 1: Preparação**
```bash
# 1. Limpe COMPLETAMENTE o cache
Ctrl + Shift + Delete (selecionar TUDO)

# 2. Reinicie o servidor
npm run dev

# 3. Abra DevTools > Network
F12 > Network tab
```

### **Passo 2: Teste Progressivo**

#### **🟢 Teste 1: Componente Mínimo**
1. Acesse: `http://localhost:8080/risks-test`
2. **Cronometrar:** Quanto tempo leva para carregar?
3. **Verificar:** Console para logs de tempo
4. **Resultado esperado:** <1 segundo

#### **🟡 Teste 2: Hook de Riscos**
1. Acesse: `http://localhost:8080/risks-hook-test`
2. **Cronometrar:** Quanto tempo leva para carregar?
3. **Verificar:** Console para logs do hook
4. **Verificar:** Network tab para queries
5. **Resultado esperado:** 1-3 segundos

#### **🔴 Teste 3: Módulo Completo**
1. Acesse: `http://localhost:8080/risks`
2. **Cronometrar:** Quanto tempo leva para carregar?
3. **Verificar:** Console para erros
4. **Verificar:** Network tab para requisições
5. **Resultado esperado:** <2 segundos (após otimizações)

## 📊 **Interpretação dos Resultados**

### **Cenário A: Teste 1 lento (>3s)**
**Problema:** Fundamental (roteamento, AuthContext, servidor)
**Ação:** Investigar AuthContext e configuração básica

### **Cenário B: Teste 1 rápido, Teste 2 lento (>5s)**
**Problema:** Hook useRiskManagement ou queries do banco
**Ação:** Investigar queries SQL e configuração do Supabase

### **Cenário C: Teste 1 e 2 rápidos, Teste 3 lento (>5s)**
**Problema:** Componentes específicos do módulo
**Ação:** Investigar componentes lazy-loaded

### **Cenário D: Todos os testes rápidos**
**Problema:** Resolvido! 🎉

## 🔍 **Informações para Coletar**

Para cada teste, anote:

### **⏱️ Tempos:**
- Tempo de carregamento inicial
- Tempo até interface aparecer
- Tempo até dados carregarem

### **🌐 Network:**
- Quantas requisições são feitas
- Quais requisições demoram mais
- Se há requisições repetitivas

### **💻 Console:**
- Logs de tempo dos componentes
- Erros ou warnings
- Logs do hook (no Teste 2)

### **🖥️ Performance:**
- CPU usage durante carregamento
- Memory usage
- Se há travamentos

## 📝 **Relatório de Teste**

Após executar os testes, me informe:

```
🟢 Teste 1 (Mínimo): _____ segundos
🟡 Teste 2 (Hook): _____ segundos  
🔴 Teste 3 (Completo): _____ segundos

Network requests no Teste 2:
- Quantidade: _____
- Mais lenta: _____ (tempo)
- Repetitivas: Sim/Não

Console errors: Sim/Não
Detalhes: _____
```

## 🎯 **Próximos Passos**

Com base nos resultados, vou:

1. **Se Teste 1 lento:** Investigar AuthContext e configuração básica
2. **Se Teste 2 lento:** Otimizar queries e hook useRiskManagement  
3. **Se Teste 3 lento:** Otimizar componentes específicos
4. **Se todos rápidos:** Problema resolvido!

## 🚨 **IMPORTANTE**

- Execute os testes em **ordem** (1 → 2 → 3)
- **Limpe o cache** antes de cada teste
- **Anote os tempos** exatos
- **Verifique o console** para logs importantes

**Este teste vai nos mostrar exatamente onde está o gargalo!**