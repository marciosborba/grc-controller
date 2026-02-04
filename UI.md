# UI.md - Sistema de Cores Estático para GRC Controller

## 🎯 COMO ALTERAR A COR PRIMÁRIA DA APLICAÇÃO

### 📋 PROCESSO PASSO A PASSO

#### **PASSO 1: Alterar static-colors.css**
```css
/* Editar: src/styles/static-colors.css */

/* Light Mode */
:root {
  --primary: 24 95% 53%;     /* Nova cor (ex: laranja) */
  --primary-hover: 24 95% 48%; /* Versão mais escura */
  --primary-glow: 24 95% 73%;  /* Versão mais clara */
}

/* Dark Mode */
.dark {
  --primary: 24 95% 53%;     /* Mesma cor em ambos os modos */
  --primary-hover: 24 95% 48%;
  --primary-glow: 24 95% 73%;
}
```

#### **PASSO 2: Atualizar fallbacks no index.css**
```css
/* Editar: src/index.css */

/* Light Mode Fallbacks */
:root {
  --primary: 24 95% 53%;     /* DEVE SER IGUAL ao static-colors.css */
  --primary-hover: 24 95% 48%;
  --primary-glow: 24 95% 73%;
}

/* Dark Mode Fallbacks */
.dark {
  --primary: 24 95% 53%;     /* DEVE SER IGUAL ao static-colors.css */
  --primary-hover: 24 95% 48%;
  --primary-glow: 24 95% 73%;
}
```

#### **PASSO 3: Limpar interferências (se necessário)**
```javascript
// Execute no console do navegador:
fetch('/clear-localStorage-colors.js').then(r => r.text()).then(eval);
```

#### **PASSO 4: Recarregar aplicação**
```bash
# Hard refresh para garantir que CSS seja recarregado
Ctrl+Shift+R (ou Cmd+Shift+R no Mac)
```

### ⚠️ **REGRA FUNDAMENTAL**

**AMBOS OS ARQUIVOS DEVEM TER AS MESMAS CORES!**

- `src/styles/static-colors.css` - Cores principais
- `src/index.css` - Cores de fallback

Se as cores forem diferentes, os fallbacks podem sobrescrever as cores desejadas.

### 🎨 EXEMPLOS DE CORES POPULARES

#### **Azul**
```css
--primary: 220 100% 50%;     /* #0066ff */
--primary-hover: 220 100% 45%; /* #0052cc */
--primary-glow: 220 100% 75%;  /* #80b3ff */
```

#### **Verde**
```css
--primary: 142 76% 36%;      /* #16a34a */
--primary-hover: 142 76% 32%; /* #15803d */
--primary-glow: 142 76% 56%;  /* #4ade80 */
```

#### **Roxo**
```css
--primary: 258 90% 66%;      /* #8b5cf6 */
--primary-hover: 258 90% 62%; /* #7c3aed */
--primary-glow: 258 95% 85%;  /* #c4b5fd */
```

#### **Vermelho**
```css
--primary: 0 84% 60%;        /* #ef4444 */
--primary-hover: 0 84% 55%;   /* #dc2626 */
--primary-glow: 0 84% 80%;    /* #fca5a5 */
```

#### **Laranja**
```css
--primary: 24 95% 53%;       /* #f97316 */
--primary-hover: 24 95% 48%;  /* #ea580c */
--primary-glow: 24 95% 73%;   /* #fdba74 */
```

### 🔧 ARQUIVOS QUE DEVEM SER EDITADOS

#### **Obrigatórios:**
- ✅ `src/styles/static-colors.css` - Cores principais
- ✅ `src/index.css` - Cores de fallback

#### **Opcionais (para limpeza):**
- 🧹 `clear-localStorage-colors.js` - Script de limpeza

### 🚨 PROBLEMAS COMUNS E SOLUÇÕES

#### **Problema: Cor não muda após editar arquivos**
**Causa:** Cores diferentes entre `static-colors.css` e `index.css`
**Solução:** Verificar se ambos os arquivos têm as mesmas cores

#### **Problema: Cor volta ao padrão após reload**
**Causa:** localStorage ou estilos dinâmicos interferindo
**Solução:** Executar script de limpeza no console

#### **Problema: Cores diferentes em light/dark mode**
**Causa:** Cores diferentes definidas para `:root` e `.dark`
**Solução:** Usar as mesmas cores em ambos os modos

### 📊 ESTRUTURA DO SISTEMA

```
src/
├── styles/
│   └── static-colors.css    ← Cores principais (EDITAR)
├── index.css               ← Fallbacks (EDITAR)
└── main.tsx               ← Sem imports dinâmicos
```

### ✅ VALIDAÇÃO

Após seguir os passos, você deve ver:

1. **Cor primária alterada** em botões, links, elementos ativos
2. **Consistência** entre light e dark mode
3. **Persistência** após reload da página
4. **Sem conflitos** visuais

### 🎯 RESULTADO FINAL

- ✅ Cor primária alterada com sucesso
- ✅ Aplicação funcional em ambos os modos
- ✅ Sistema estático mantido
- ✅ Performance otimizada

---

## 📝 NOTAS TÉCNICAS

### Sistema de Cores Estático
- Baseado em CSS puro, sem JavaScript dinâmico
- Fallbacks garantem funcionamento mesmo se arquivo principal falhar
- Ordem de carregamento: fallbacks → static-colors.css → derivadas

### Formato de Cores
- **HSL:** `hue saturation% lightness%` (ex: `220 100% 50%`)
- **Hover:** Geralmente 5% menos lightness
- **Glow:** Geralmente 20% mais lightness

### Compatibilidade
- ✅ Todos os navegadores modernos
- ✅ Light e dark mode
- ✅ Responsive design
- ✅ Acessibilidade mantida